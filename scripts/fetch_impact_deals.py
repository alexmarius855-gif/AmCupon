"""
fetch_impact_deals.py — Aduce OFERTE REALE de la Impact.com (nu doar link-uri de tracking).

Diferenta fata de `fetch_impact_api.py` (care ramane neatins): acela aduce campanii + link-uri
de tracking (`/Campaigns`, `/Ads`) si repara `url_afiliat`. Asta aduce CONTINUTUL promotional —
deal-uri active + coduri promo reale — si il ataseaza ca `promotii` pe magazinele deja marcate
`platforma == "impact"`.

Endpoint-uri folosite (Partner API, fost Mediapartners):
  GET /Mediapartners/{AccountSid}/Deals       — deal-uri (BOGO, GENERAL_SALE, FREE_SHIPPING,
                                                GIFT_WITH_PURCHASE, REBATE), filtrabil dupa
                                                CampaignId / Scope / State / Type
  GET /Mediapartners/{AccountSid}/PromoCodes  — coduri promo, paginat

Credentiale: DOAR cele existente (aceleasi ca `fetch_impact_api.py`, deja in GitHub Secrets):
  IMPACT_ACCOUNT_SID
  IMPACT_AUTH_TOKEN

IMPORTANT — schema JSON e INCERTA (nu s-a putut verifica live fara credentialele lui Alex).
Ca la `fetch_awin_api.py`: scriptul AFISEAZA json-ul brut al primului Deal SI al primului
PromoCode primite de la API, INAINTE de orice parsare, si incearca mai multe denumiri plauzibile
de campuri (`_first`). Daca nu extrage nicio promotie valida, se OPRESTE cu instructiuni clare si
NU scrie nimic — mai bine 0 promotii decat date fabricate in output.json.

REGULA DE ONESTITATE (vezi CLAUDE.md — audit 03.07.2026, fix linkuri false 06.08.2026):
  - `zile_ramase` se calculeaza EXCLUSIV dintr-un camp real de expirare din raspunsul API.
    Fara camp de data reala -> promotia se OMITE. Nu se aproximeaza, nu se pune 99, nu se ghiceste.
  - `cod_cupon` e string GOL ("") daca nu exista cod real. Niciodata un placeholder.
  - `landing_page` e un URL real: al deal-ului daca API-ul il da, altfel `url_afiliat`-ul deja
    verificat al magazinului. Nu se construieste un URL inventat.

Script MANUAL — NU e in `.github/workflows/update-data.yml`, exact ca `fetch_awin_api.py`.
Se integreaza in pipeline doar dupa ce Alex confirma la prima rulare ca schema se potriveste.

Rulare:
  set IMPACT_ACCOUNT_SID=... && set IMPACT_AUTH_TOKEN=...
  python fetch_impact_deals.py --dry-run     # prima data: doar raport, nu scrie nimic
  python fetch_impact_deals.py               # scrie in data/extra_merchants.json + data/output.json
  python merge_platforms.py                  # pas urmator, propaga in frontend/public/output.json
"""

import argparse
import json
import os
import re
import sys
import time
from datetime import datetime, timezone

import requests
from requests.auth import HTTPBasicAuth

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

ACCOUNT_SID = os.environ.get("IMPACT_ACCOUNT_SID", "")
AUTH_TOKEN  = os.environ.get("IMPACT_AUTH_TOKEN", "")
BASE        = "https://api.impact.com"
HEADERS     = {"Accept": "application/json"}

DATA_DIR    = os.path.join(SCRIPT_DIR, "..", "data")
EXTRA_PATH  = os.path.join(DATA_DIR, "extra_merchants.json")
OUTPUT_PATH = os.path.join(DATA_DIR, "output.json")

AUTH = None
NOW  = datetime.now(timezone.utc)

# Denumiri plauzibile de campuri — nimic nu e presupus sigur, se incearca pe rand (vezi _first).
DEAL_ID_KEYS    = ("Id", "DealId", "Deal_Id", "id")
DEAL_NAME_KEYS  = ("Name", "DealName", "Title", "PromotionName", "name")
DEAL_DESC_KEYS  = ("Description", "DealDescription", "ShortDescription", "Summary", "Details")
DEAL_URL_KEYS   = ("LandingPageUrl", "LandingPage", "TrackingLink", "DealUrl", "Url", "Link")
CAMPAIGN_KEYS   = ("CampaignId", "Campaign", "AdvertiserId", "ProgramId", "CampaignID")
START_KEYS      = ("StartDate", "StartDateTime", "BeginDate", "DateStart", "EffectiveDate")
END_KEYS        = ("EndDate", "EndDateTime", "ExpirationDate", "ExpiryDate", "DateEnd",
                   "StopDate", "ExpiresOn")
CODE_KEYS       = ("Code", "PromoCode", "CouponCode", "PromoCodeText", "Coupon", "DiscountCode")
PROMO_DEAL_KEYS = ("DealId", "Deal", "DealID")

# Cheile plauzibile sub care API-ul returneaza lista propriu-zisa in payload.
DEALS_LIST_KEYS  = ("Deals", "deals", "Records", "Items", "Results")
CODES_LIST_KEYS  = ("PromoCodes", "promoCodes", "promocodes", "Records", "Items", "Results")


# ─── Helpers defensivi ────────────────────────────────────────────────────────

def _first(d: dict, *keys):
    """Prima valoare nevida dintre cheile date (acelasi pattern ca in fetch_awin_api.py)."""
    if not isinstance(d, dict):
        return None
    for k in keys:
        v = d.get(k)
        if v not in (None, "", [], {}):
            return v
    return None


def _extract_list(payload, *keys) -> list:
    """Scoate lista de elemente dintr-un payload de forma necunoscuta."""
    if isinstance(payload, list):
        return payload
    if not isinstance(payload, dict):
        return []
    for k in keys:
        v = payload.get(k)
        if isinstance(v, list):
            return v
    # Fallback: prima valoare care arata ca o lista de obiecte (sarim metadatele @page/@total)
    for k, v in payload.items():
        if isinstance(k, str) and k.startswith("@"):
            continue
        if isinstance(v, list) and (not v or isinstance(v[0], dict)):
            return v
    return []


def _norm_id(v) -> str:
    """Normalizeaza un identificator care poate veni ca int, string, URI sau obiect."""
    if v is None:
        return ""
    if isinstance(v, dict):
        return _norm_id(_first(v, "Id", "CampaignId", "id", "value"))
    s = str(v).strip()
    if not s:
        return ""
    if "/" in s:  # ex: "/Mediapartners/IRxxxx/Campaigns/12345"
        last = s.rstrip("/").split("/")[-1]
        if last:
            s = last
    return s


def _parse_data(v):
    """Parseaza o data reala din API. Returneaza datetime tz-aware sau None.
    NU inventeaza nimic — daca nu se poate parsa, returneaza None si promotia se omite."""
    if not v:
        return None
    s = str(v).strip()
    if not s:
        return None
    s = s.replace("Z", "+00:00").replace(" UTC", "+00:00")
    candidati = [s]
    if " " in s and "T" not in s:
        candidati.append(s.replace(" ", "T", 1))
    for c in candidati:
        try:
            dt = datetime.fromisoformat(c)
            return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
        except ValueError:
            pass
    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%d.%m.%Y", "%Y-%m-%dT%H:%M:%S"):
        try:
            return datetime.strptime(s[:len(fmt) + 8].strip(), fmt).replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    return None


def api_get(path, params=None):
    r = requests.get(f"{BASE}{path}", auth=AUTH, headers=HEADERS,
                     params=params or {}, timeout=30)
    r.raise_for_status()
    return r.json()


def fetch_paginat(path, list_keys, eticheta, max_pagini=40):
    """Fetch paginat (Impact: Page/PageSize, metadate @numpages/@total).
    Returneaza (elemente, primul_payload_brut) — payload-ul brut e util la debug."""
    elemente = []
    primul_payload = None
    page = 1
    while page <= max_pagini:
        payload = api_get(path, {"PageSize": 100, "Page": page})
        if primul_payload is None:
            primul_payload = payload
        batch = _extract_list(payload, *list_keys)
        if not batch:
            break
        elemente.extend(batch)

        numpages = total = 0
        if isinstance(payload, dict):
            try:
                numpages = int(payload.get("@numpages") or 0)
            except (TypeError, ValueError):
                numpages = 0
            try:
                total = int(payload.get("@total") or 0)
            except (TypeError, ValueError):
                total = 0
        if numpages and page >= numpages:
            break
        if total and len(elemente) >= total:
            break
        if len(batch) < 100:
            # Oprire pe FALLBACK, nu pe metadate. Exact tiparul bug-ului 2Performant
            # (per_page ignorat de API -> paginarea se oprea la pagina 1). Fara
            # @numpages/@total nu putem sti daca chiar era ultima pagina.
            if not numpages and not total:
                print(f"  ATENTIE: nu exista @numpages/@total in payload — ma opresc pe baza ca "
                      f"ultima pagina a avut sub 100 elemente ({len(batch)}); verifica manual "
                      f"daca exista mai multe pagini de {eticheta}.")
            break
        page += 1
        time.sleep(0.3)
    print(f"  {len(elemente)} {eticheta} primite de la API")
    return elemente, primul_payload


def _print_raw(eticheta: str, elemente: list, payload):
    """Afiseaza raw JSON INAINTE de orice parsare (pattern din fetch_awin_api.py)."""
    print(f"\n  Raw primul {eticheta} (verifica denumirile campurilor daca indexul e gol):")
    if elemente:
        print("   ", json.dumps(elemente[0], ensure_ascii=False)[:900])
    else:
        print("    (lista goala — payload brut de la API, primele 900 caractere:)")
        print("   ", json.dumps(payload, ensure_ascii=False)[:900] if payload is not None
              else "(fara raspuns)")


# ─── Parsare deal-uri + coduri promo ──────────────────────────────────────────

def index_coduri(promocodes: list) -> tuple[dict, dict]:
    """Indexeaza codurile promo reale pe DealId si pe CampaignId.
    Codurile fara text de cod real sunt ignorate (nu punem placeholder)."""
    pe_deal, pe_campanie = {}, {}
    for pc in promocodes:
        if not isinstance(pc, dict):
            continue
        cod = _first(pc, *CODE_KEYS)
        cod = str(cod).strip() if cod else ""
        if not cod:
            continue
        end_dt = _parse_data(_first(pc, *END_KEYS))
        if end_dt and end_dt < NOW:
            continue  # cod expirat — nu-l propunem
        deal_id = _norm_id(_first(pc, *PROMO_DEAL_KEYS))
        camp_id = _norm_id(_first(pc, *CAMPAIGN_KEYS))
        rec = {"cod": cod, "expira": end_dt}
        if deal_id:
            pe_deal.setdefault(deal_id, rec)
        if camp_id:
            pe_campanie.setdefault(camp_id, rec)
    return pe_deal, pe_campanie


def construieste_promotii(deals: list, pe_deal: dict, pe_campanie: dict) -> tuple[dict, dict]:
    """CampaignId -> lista de promotii in forma asteptata de merge_platforms.py.
    Returneaza si un dict de statistici despre ce s-a sarit si de ce."""
    per_campanie: dict[str, list] = {}
    stats = {"fara_nume": 0, "fara_campanie": 0, "fara_data_reala": 0, "expirate": 0, "neincepute": 0}

    for d in deals:
        if not isinstance(d, dict):
            continue

        nume = _first(d, *DEAL_NAME_KEYS)
        nume = str(nume).strip() if nume else ""
        if not nume:
            stats["fara_nume"] += 1
            continue

        camp_id = _norm_id(_first(d, *CAMPAIGN_KEYS))
        if not camp_id:
            # Fara campanie nu stim carui magazin apartine — a ghici ar insemna sa punem
            # oferta unui brand pe pagina altuia. Preferam sa o sarim.
            stats["fara_campanie"] += 1
            continue

        deal_id = _norm_id(_first(d, *DEAL_ID_KEYS))
        cod_rec = pe_deal.get(deal_id) or pe_campanie.get(camp_id) or {}

        # ── zile_ramase DOAR din camp real de expirare (deal, altfel codul promo atasat) ──
        end_dt = _parse_data(_first(d, *END_KEYS)) or cod_rec.get("expira")
        if not end_dt:
            stats["fara_data_reala"] += 1
            continue
        zile_ramase = (end_dt - NOW).days
        if zile_ramase < 0:
            stats["expirate"] += 1
            continue

        start_dt = _parse_data(_first(d, *START_KEYS))
        if start_dt and start_dt > NOW:
            stats["neincepute"] += 1
            continue

        descriere = _first(d, *DEAL_DESC_KEYS)
        descriere = re.sub(r"\s{2,}", " ", str(descriere)).strip()[:500] if descriere else nume

        url_deal = _first(d, *DEAL_URL_KEYS)
        url_deal = str(url_deal).strip() if url_deal else ""
        if not url_deal.startswith("http"):
            url_deal = ""

        per_campanie.setdefault(camp_id, []).append({
            "nume":         nume[:200],
            "descriere":    descriere,
            "cod_cupon":    cod_rec.get("cod", ""),   # "" daca nu exista cod REAL
            "landing_page": url_deal,                 # completat cu url_afiliat la atasare
            "zile_ramase":  max(0, zile_ramase),
            "expira":       end_dt.strftime("%Y-%m-%d"),
            "sursa":        "impact_deals_api",
        })

    return per_campanie, stats


# ─── Atasare pe magazine ──────────────────────────────────────────────────────

def e_duplicat(existente: list, promotie: dict) -> bool:
    """Acelasi cod real sau acelasi nume => promotie deja prezenta."""
    cod_nou  = (promotie.get("cod_cupon") or "").upper()
    nume_nou = (promotie.get("nume") or "").lower()
    for p in existente or []:
        cod_ex = ((p.get("cod_cupon") or "") if isinstance(p, dict) else "").upper()
        if cod_nou and cod_ex and cod_nou == cod_ex:
            return True
        nume_ex = ((p.get("nume") or "") if isinstance(p, dict) else "").lower()
        if nume_nou and nume_ex and nume_nou == nume_ex:
            return True
    return False


def recalculeaza_flags(mag: dict) -> None:
    """Sincronizeaza flag-urile de nivel magazin cu lista de promotii.
    Intentionat NU atinge folosit_de/procent_succes — sunt numere pseudo-random folosite
    doar la sortare interna, nu le fabricam suplimentar (vezi auditul de onestitate 03.07)."""
    promotii = [p for p in (mag.get("promotii") or []) if isinstance(p, dict)]
    mag["are_promotie"] = len(promotii) > 0
    mag["cod_cupon"]    = any(p.get("cod_cupon") for p in promotii)
    mag["zile_ramase"]  = min((p.get("zile_ramase", 99) for p in promotii), default=99)
    scor = 0.0
    if mag["are_promotie"]:
        scor += 30
    if mag["cod_cupon"]:
        scor += 20
    if 0 < mag["zile_ramase"] <= 3:
        scor += 10
    mag["scor_final"] = max(float(mag.get("scor_final") or 0), scor)


def ataseaza(merchants: list, campaign_index: dict, per_campanie: dict,
             find_campaign, label: str) -> tuple[int, int]:
    """Ataseaza promotiile pe magazinele impact din lista. Returneaza (magazine, promotii)."""
    mag_atinse = 0
    promo_adaugate = 0
    for m in merchants:
        # Izolare per magazin: o inregistrare stricata (ex. "magazin": null -> .lower()
        # in find_campaign) nu are voie sa opreasca tot batch-ul. Aceeasi disciplina
        # defensiva ca in construieste_promotii()/index_coduri().
        try:
            c = find_campaign(campaign_index, m.get("magazin", ""), m.get("url", ""))
            if not c:
                continue
            promotii_camp = per_campanie.get(str(c.get("id", "")))
            if not promotii_camp:
                continue

            if not isinstance(m.get("promotii"), list):
                m["promotii"] = []

            adaugate_aici = 0
            for promo in promotii_camp:
                if e_duplicat(m["promotii"], promo):
                    continue
                p = dict(promo)
                if not p["landing_page"]:
                    # URL real deja verificat al magazinului, nu unul construit de noi
                    p["landing_page"] = m.get("url_afiliat") or m.get("url") or ""
                m["promotii"].append(p)
                adaugate_aici += 1

            if adaugate_aici:
                recalculeaza_flags(m)
                mag_atinse += 1
                promo_adaugate += adaugate_aici
                print(f"  OK [{label}] [{c.get('id')}] {m.get('magazin', ''):25s} "
                      f"+{adaugate_aici} promotii")
        except Exception as e:
            print(f"  SKIP [{label}] magazin invalid: {e}")
            continue
    return mag_atinse, promo_adaugate


def incarca(path: str) -> list | None:
    if not os.path.exists(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError as e:
            print(f"  JSON invalid in {os.path.basename(path)}: {e} — skip")
            return None
    return data if isinstance(data, list) else None


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    global AUTH

    ap = argparse.ArgumentParser(description="Oferte reale Impact.com (Deals + PromoCodes)")
    ap.add_argument("--dry-run", action="store_true",
                    help="doar raport, NU scrie in extra_merchants.json / output.json")
    args = ap.parse_args()

    if not ACCOUNT_SID or not AUTH_TOKEN:
        print("EROARE: IMPACT_ACCOUNT_SID / IMPACT_AUTH_TOKEN lipsesc.")
        print("  set IMPACT_ACCOUNT_SID=... && set IMPACT_AUTH_TOKEN=...")
        print("  (aceleasi credentiale ca fetch_impact_api.py — nu e nevoie de nimic nou)")
        print("  Nu s-a atins niciun fisier de date.")
        return

    # Reutilizam matching-ul pe domeniu/campanie deja existent — NU il rescriem.
    try:
        import fetch_impact_api as impact_api
    except ImportError as e:
        print(f"EROARE: nu pot importa fetch_impact_api.py ({e}).")
        print("  Ruleaza scriptul din repo (scripts/ trebuie sa fie langa el).")
        return

    AUTH = HTTPBasicAuth(ACCOUNT_SID, AUTH_TOKEN)
    impact_api.AUTH = AUTH  # doar la runtime, fisierul original ramane neatins

    print("Fetch campanii Impact.com (pentru matching magazin -> campanie)...")
    try:
        campaigns = impact_api.get_all_campaigns()
    # RequestException acopera si HTTPError, si Timeout/ConnectionError.
    # ValueError acopera json.JSONDecodeError (body 200 dar non-JSON: HTML de login/interstitial).
    except (requests.RequestException, ValueError) as e:
        resp = getattr(e, "response", None)
        if resp is not None:
            print(f"EROARE HTTP la /Campaigns: {e}")
            print(f"  Raspuns: {resp.text[:300]}")
        else:
            print(f"EROARE retea / raspuns neparsabil la /Campaigns: {e}")
            print("  (timeout, conexiune intrerupta sau body care nu e JSON valid)")
        print("  Nu s-a atins niciun fisier de date.")
        return
    print(f"  {len(campaigns)} campanii active gasite")
    campaign_index = impact_api.build_campaign_index(campaigns)

    print("\nFetch oferte (Deals) + coduri promo (PromoCodes)...")
    # Cele 2 endpoint-uri sunt independente — un 403/404 pe unul (ex. Deals nu e
    # inclus in tier-ul contului) nu are voie sa opreasca testarea celuilalt.
    deals, deals_payload = [], None
    try:
        deals, deals_payload = fetch_paginat(
            f"/Mediapartners/{ACCOUNT_SID}/Deals", DEALS_LIST_KEYS, "deal-uri")
    except (requests.RequestException, ValueError) as e:
        resp = getattr(e, "response", None)
        if resp is not None:
            print(f"EROARE HTTP la /Deals: {e}")
            print(f"  Raspuns: {resp.text[:300]}")
        else:
            print(f"EROARE retea / raspuns neparsabil la /Deals: {e}")

    promocodes, codes_payload = [], None
    try:
        promocodes, codes_payload = fetch_paginat(
            f"/Mediapartners/{ACCOUNT_SID}/PromoCodes", CODES_LIST_KEYS, "coduri promo")
    except (requests.RequestException, ValueError) as e:
        resp = getattr(e, "response", None)
        if resp is not None:
            print(f"EROARE HTTP la /PromoCodes: {e}")
            print(f"  Raspuns: {resp.text[:300]}")
        else:
            print(f"EROARE retea / raspuns neparsabil la /PromoCodes: {e}")

    # RAW INAINTE DE PARSARE — daca structura difera, se vede aici, nu dupa ce s-a scris gresit.
    _print_raw("Deal", deals, deals_payload)
    _print_raw("PromoCode", promocodes, codes_payload)

    if not deals:
        print("\n  0 deal-uri primite. Nu s-a scris nimic.")
        print("  Verifica payload-ul brut de mai sus: fie contul nu are deal-uri active, fie")
        print("  lista vine sub alta cheie decat", DEALS_LIST_KEYS, "sau endpoint-ul cere")
        print("  un parametru suplimentar (ex. Scope / State). Trimite-mi printul si ajustez.")
        return

    pe_deal, pe_campanie = index_coduri(promocodes)
    per_campanie, stats = construieste_promotii(deals, pe_deal, pe_campanie)

    total_promo = sum(len(v) for v in per_campanie.values())
    print(f"\n  {total_promo} promotii valide, pe {len(per_campanie)} campanii")
    print(f"  Sarite: fara nume {stats['fara_nume']}, fara CampaignId {stats['fara_campanie']}, "
          f"FARA DATA REALA de expirare {stats['fara_data_reala']}, "
          f"expirate {stats['expirate']}, neincepute {stats['neincepute']}")
    print(f"  Coduri promo reale indexate: {len(pe_deal)} pe deal, {len(pe_campanie)} pe campanie")

    if not per_campanie:
        print("\n  Nicio promotie utilizabila — NU s-a scris nimic (corect, nu fabricam date).")
        if stats["fara_data_reala"]:
            print("  Cauza dominanta: lipseste un camp real de expirare. Regula proiectului:")
            print("  nu aproximam `zile_ramase`. Spune-mi cum se cheama campul de data in raw")
            print(f"  JSON-ul de mai sus si il adaug in END_KEYS (acum: {END_KEYS}).")
        elif stats["fara_campanie"]:
            print("  Cauza dominanta: deal-urile n-au CampaignId sub numele presupuse")
            print(f"  ({CAMPAIGN_KEYS}) — fara el nu putem sti carui magazin apartine oferta.")
        else:
            print("  Verifica raw JSON de mai sus: denumirile campurilor nu se potrivesc.")
        return

    total_mag = total_promo_add = 0

    for path, label in ((EXTRA_PATH, "extra"), (OUTPUT_PATH, "output")):
        # Izolare per fisier: o eroare fatala pe extra_merchants.json nu are voie sa
        # impiedice procesarea lui output.json (si invers).
        try:
            merchants = incarca(path)
            if merchants is None:
                print(f"  Fisier lipsa/invalid (skip): {os.path.basename(path)}")
                continue
            targets = [m for m in merchants
                       if isinstance(m, dict) and m.get("platforma") == "impact"]
            if not targets:
                continue
            mag, promo = ataseaza(targets, campaign_index, per_campanie,
                                  impact_api.find_campaign, label)
            total_mag += mag
            total_promo_add += promo
            if promo and not args.dry_run:
                with open(path, "w", encoding="utf-8") as f:
                    json.dump(merchants, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"  EROARE [{label}] la procesarea {os.path.basename(path)}: {e} — "
                  f"continui cu urmatorul fisier")
            continue

    if args.dry_run:
        print(f"\nDRY RUN — nu s-a salvat nimic. Ar fi actualizat {total_mag} magazine "
              f"cu {total_promo_add} promotii.")
        return

    print(f"\nGata! {total_promo_add} promotii reale Impact atasate pe {total_mag} magazine.")
    if total_promo_add:
        print("Urmator pas: python merge_platforms.py")


if __name__ == "__main__":
    main()
