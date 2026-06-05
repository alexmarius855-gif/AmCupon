"""
Integrare Profitshare.ro — AmCupon.ro
======================================
Descarca programele si promotiile de pe Profitshare API
si le converteste in acelasi format ca 2Performant.

SETUP (o singura data):
  1. Inregistreaza-te pe https://profitshare.ro ca Publisher
  2. Dupa aprobare, mergi la Cont > API si copiaza:
       - affiliate_username  (ex: "alexmarius855")
       - affiliate_key       (sirul lung de hex)
  3. Seteaza variabilele de mai jos SAU adauga secretele GitHub:
       PROFITSHARE_USER = "username-ul tau"
       PROFITSHARE_KEY  = "cheia ta API"

RULARE LOCALA:
  python process_profitshare.py

REZULTAT:
  ../data/profitshare_output.json  (pentru merge cu 2Performant)
"""

import os
import json
import re
import random
import hashlib
import requests
from datetime import datetime, timezone
from urllib.parse import quote

# ─── CREDENTIALE ──────────────────────────────────────────────────────────────
# Prioritate: variabile de mediu > hardcodat (nu pune cheia pe GitHub!)
AFFILIATE_USERNAME = os.environ.get("PROFITSHARE_USER", "")
AFFILIATE_KEY      = os.environ.get("PROFITSHARE_KEY", "")

OUTPUT_FILE = "../data/profitshare_output.json"

BASE_URL = "https://api.profitshare.ro"

# ─── API ENDPOINTS (noua documentatie: doc.profitshare.com/advertisers/docs/) ─
# Endpoint-uri afiliat (testate ambele variante: cu si fara prefix "affiliate-")
ENDPOINT_ADVERTISERS  = "affiliate-advertisers"   # sau "advertisers"
ENDPOINT_CAMPAIGNS    = "affiliate-campaigns"      # sau "campaigns" / "vouchers"
ENDPOINT_PROMOTIONS   = "affiliate-promotions"     # backup

# ─── MAPARE CATEGORII (Profitshare -> formatul nostru) ────────────────────────
CATEGORY_MAP = {
    "Fashion": "Fashion",
    "Imbracaminte": "Fashion",
    "Incaltaminte": "Fashion",
    "Electrocasnice": "Electronics IT&C",
    "Electronice": "Electronics IT&C",
    "IT": "Electronics IT&C",
    "IT&C": "Electronics IT&C",
    "Casa": "Home & Garden",
    "Casa si Gradina": "Home & Garden",
    "Gradina": "Home & Garden",
    "Mobila": "Home & Garden",
    "Cosmetice": "Beauty",
    "Frumusete": "Beauty",
    "Sanatate": "Health & Personal care",
    "Farmacie": "Pharma",
    "Carti": "Books",
    "Educatie": "Books",
    "Sport": "Sports & outdoors",
    "Outdoor": "Sports & outdoors",
    "Auto": "Automotive",
    "Copii": "Babies Kids & Toys",
    "Jucarii": "Babies Kids & Toys",
    "Animale": "Pet supplies",
    "Mall": "Online Mall",
    "Generalist": "Online Mall",
}


def normalize_category(cat: str) -> str:
    if not cat:
        return "Online Mall"
    for key, value in CATEGORY_MAP.items():
        if key.lower() in cat.lower():
            return value
    return "Online Mall"


def categorie_slug(cat: str) -> str:
    s = cat.lower()
    s = re.sub(r"[&/]", "", s)
    s = re.sub(r"[^a-z0-9\s-]", "", s)
    s = re.sub(r"\s+", "-", s.strip())
    s = re.sub(r"-+", "-", s)
    return s


def make_tracking_url(username: str, program_id, store_slug: str) -> str:
    """Genereaza link de tracking Profitshare."""
    return f"https://l.profitshare.ro/l/{username}/{program_id}?sub_id={store_slug}"


def normalize_slug(name: str) -> str:
    """Transforma 'Dedeman' -> 'dedeman.ro' (format magazin intern)."""
    s = name.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"\s+", "-", s)
    # Daca nu are punct (nu e deja un domeniu), adauga .ro
    if "." not in s:
        s = f"{s}.ro"
    return s


def calculeaza_succes(slug: str, rank_approx: int) -> int:
    rng = random.Random(abs(hash(slug + "_ps")) % 99991)
    if rank_approx <= 10:
        return rng.randint(88, 97)
    elif rank_approx <= 30:
        return rng.randint(80, 91)
    elif rank_approx <= 100:
        return rng.randint(70, 85)
    return rng.randint(60, 78)


def calculeaza_folosit(slug: str, are_promotie: bool) -> int:
    if not are_promotie:
        return 0
    rng = random.Random(abs(hash(slug + "_pf")) % 99991)
    return rng.randint(20, 400)


def ps_get(api_name: str, params: dict = None) -> dict | list | None:
    """
    Apel API Profitshare cu autentificare HMAC-SHA1.
    Ref: https://github.com/ConversionMarketing/profitshare-api

    String to sign: GET{api_name}/?{query_string}/{user}{date_gmt}
    Headers: X-PS-Client, X-PS-Auth, X-PS-Accept, Date
    """
    if not AFFILIATE_USERNAME or not AFFILIATE_KEY:
        print("  EROARE: Lipsesc credentialele Profitshare!")
        print("  Seteaza PROFITSHARE_USER si PROFITSHARE_KEY ca variabile de mediu.")
        return None

    import hmac as hmac_mod
    import hashlib
    from urllib.parse import urlencode, unquote
    from datetime import datetime, timezone

    date_str = datetime.now(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S GMT")
    # Parametrii in ordinea originala (PHP http_build_query nu sorteaza)
    query_string = unquote(urlencode(params or {})) if params else ""

    # Din documentatia oficiala Profitshare:
    # signature_string = "$request_type$route" . $query_string . '/' . PS_API_USER . $date
    # Unde $route = "{api_name}/?" (FARA slash prefix!)
    # Ex: "GETaffiliate-advertisers/?results_per_page=10&page=1/USER DATE"
    route = f"{api_name}/?"
    string_to_sign = f"GET{route}{query_string}/{AFFILIATE_USERNAME}{date_str}"

    signature = hmac_mod.new(
        AFFILIATE_KEY.encode("utf-8"),
        string_to_sign.encode("utf-8"),
        hashlib.sha1,
    ).hexdigest()

    headers = {
        "Date": date_str,
        "X-PS-Client": AFFILIATE_USERNAME,
        "X-PS-Auth": signature,
        "X-PS-Accept": "json",
    }

    qs_part = f"?{query_string}" if query_string else ""
    url = f"{BASE_URL}/{api_name}/{qs_part}"

    try:
        r = requests.get(url, headers=headers, timeout=30)
        if r.status_code == 500:
            # Cont nou / fara programe aprobate inca
            return []
        r.raise_for_status()
        return r.json()
    except requests.exceptions.RequestException as e:
        print(f"  Eroare retea {api_name}: {e}")
        return None
    except ValueError as e:
        print(f"  Eroare JSON {api_name}: {e}")
        return None


def _extract_list(data, *keys) -> list:
    """Extrage lista din raspuns API Profitshare (structura variabila)."""
    if data is None:
        return []
    if isinstance(data, list):
        return data
    # Cauta recursiv in dict
    for key in keys:
        val = data.get(key) if isinstance(data, dict) else None
        if val is not None:
            if isinstance(val, list):
                return val
            if isinstance(val, dict):
                # Daca e dict de dicts (ex: {"35": {...}, "56983": {...}}), returneaza values
                if all(isinstance(v, dict) for v in val.values()):
                    return list(val.values())
    # Fallback: daca data e dict de dicts direct
    if isinstance(data, dict) and all(isinstance(v, dict) for v in data.values()):
        return list(data.values())
    return []


def load_programs() -> list[dict]:
    """Descarca toate programele (magazinele) active."""
    print("  Descarc programe Profitshare...")
    all_programs = []

    # API nou: affiliate-advertisers → {"result": {"35": {...}, ...}}
    working_endpoint = None
    for ep in [ENDPOINT_ADVERTISERS, "advertisers", "affiliate-programs"]:
        test = ps_get(ep, {"results_per_page": 5, "page": 1})
        if test is not None:
            working_endpoint = ep
            print(f"    Endpoint: {ep}")
            break

    if working_endpoint is None:
        print("    Niciun endpoint functional")
        return []

    page = 1
    while True:
        data = ps_get(working_endpoint, {"results_per_page": 100, "page": page})
        if not data:
            break
        # Structura: {"result": {"35": {advertisers...}, "56983": {...}}}
        result = data.get("result", data) if isinstance(data, dict) else data
        programs = _extract_list(result, "advertisers", "programs", "data")
        if not programs:
            # Daca result e direct dict de advertisers (keyed by id)
            if isinstance(result, dict) and not any(k in result for k in ("paginator", "campaigns")):
                programs = [v for v in result.values() if isinstance(v, dict)]
        if not programs:
            break
        all_programs.extend(programs)
        print(f"    Pagina {page}: {len(programs)} programe")
        if len(programs) < 100:
            break
        page += 1

    return all_programs


def load_promotions() -> list[dict]:
    """Descarca toate campaniile active Profitshare.
    Structura API noua: {"result": {"paginator": {...}, "campaigns": [...]}}
    Fiecare campanie: {id, advertiser_id, name, startDate, endDate, url, banners}
    """
    print("  Descarc promotii/campanii Profitshare...")
    all_promos = []

    # Detecteaza endpoint functional
    ep_promos = None
    for ep_try in [ENDPOINT_CAMPAIGNS, "campaigns", "vouchers", ENDPOINT_PROMOTIONS]:
        test = ps_get(ep_try, {"results_per_page": 5, "page": 1})
        if test is not None:
            ep_promos = ep_try
            print(f"    Endpoint campanii: {ep_try}")
            break

    if ep_promos is None:
        print("    Niciun endpoint campanii functional")
        return []

    now = datetime.now(timezone.utc)
    page = 1
    while True:
        data = ps_get(ep_promos, {"results_per_page": 100, "page": page})
        if not data:
            break

        # Structura: {"result": {"paginator": {...}, "campaigns": [...]}}
        result = data.get("result", data) if isinstance(data, dict) else data
        if isinstance(result, dict):
            campaigns = result.get("campaigns") or result.get("vouchers") or []
            total_pages = result.get("paginator", {}).get("totalPages", 1) if isinstance(result.get("paginator"), dict) else 1
        else:
            campaigns = result if isinstance(result, list) else []
            total_pages = 1

        if not campaigns:
            break

        for camp in campaigns:
            if not isinstance(camp, dict):
                continue
            # Filtrare dupa data expirarii
            end_raw = camp.get("endDate") or camp.get("end_date") or ""
            zile_ramase = 30
            if end_raw:
                try:
                    end_dt = datetime.fromisoformat(str(end_raw).replace(" ", "T"))
                    if end_dt.tzinfo is None:
                        end_dt = end_dt.replace(tzinfo=timezone.utc)
                    if end_dt < now:
                        continue  # Expirata
                    zile_ramase = max(0, (end_dt - now).days)
                except (ValueError, AttributeError):
                    pass

            camp["_zile_ramase"] = zile_ramase
            all_promos.append(camp)

        items_per_page = result.get("paginator", {}).get("itemsPerPage", 20) if isinstance(result, dict) else 20
        print(f"    Pagina {page}/{total_pages}: {len(campaigns)} campanii")
        if page >= total_pages or len(campaigns) < items_per_page:
            break
        page += 1

    return all_promos


def _get_best_banner(banners: dict) -> str:
    """Extrage cea mai buna imagine din dict-ul de bannere."""
    if not isinstance(banners, dict):
        return ""
    # Preferam dimensiuni medii
    for size in ["600x314", "600x400", "468x60", "300x250", "1200x628", "1080x1080"]:
        b = banners.get(size, {})
        src = b.get("src", "") if isinstance(b, dict) else ""
        if src:
            return ("https:" + src) if src.startswith("//") else src
    # Fallback: primul banner
    for b in banners.values():
        src = b.get("src", "") if isinstance(b, dict) else ""
        if src:
            return ("https:" + src) if src.startswith("//") else src
    return ""


def build_promo_map(promotions: list[dict]) -> dict[str, list]:
    """Indexeaza campaniile dupa advertiser_id (noul API Profitshare)."""
    promo_map: dict[str, list] = {}
    for camp in promotions:
        if not isinstance(camp, dict):
            continue
        # Noul API: advertiser_id leaga campania de magazin
        pid = str(
            camp.get("advertiser_id") or
            camp.get("program_id") or
            camp.get("affiliate_program_id") or ""
        )
        if not pid:
            continue

        if pid not in promo_map:
            promo_map[pid] = []

        cod     = camp.get("coupon_code") or camp.get("voucher_code") or camp.get("code") or ""
        landing = camp.get("url") or camp.get("landing_url") or camp.get("landing_page") or ""
        name    = camp.get("name") or camp.get("title") or "Promotie activa"
        banner  = _get_best_banner(camp.get("banners", {}))

        promo_map[pid].append({
            "nume":         name[:200],
            "descriere":    name[:200],
            "cod_cupon":    cod,
            "landing_page": landing,
            "zile_ramase":  camp.get("_zile_ramase", 30),
            "banner":       banner,
        })

    return promo_map


def process_program(prog: dict, promo_map: dict, rank_counter: int) -> dict | None:
    """Converteste un advertiser Profitshare in formatul nostru.
    Structura noua: {id, name, logo, category, url, advertiser_identifier,
                     affiliate_identifier, commissions:[{type,value}]}
    """
    pid = str(prog.get("id") or prog.get("program_id") or "")
    if not pid:
        return None

    name_raw = prog.get("name") or prog.get("program_name") or ""
    url_raw  = prog.get("url") or prog.get("website") or prog.get("main_url") or ""

    if not name_raw and not url_raw:
        return None

    # Extrage slug din domeniu
    if url_raw:
        domain_m = re.search(r"(?:https?://)?(?:www\.)?([^/\s]+\.[a-z]{2,})", url_raw)
        slug = domain_m.group(1) if domain_m else normalize_slug(name_raw)
    else:
        slug = normalize_slug(name_raw)

    # Logo — poate incepe cu // (protocol-relative)
    logo_raw = prog.get("logo") or prog.get("logo_url") or prog.get("image") or ""
    logo_url = ("https:" + logo_raw) if logo_raw.startswith("//") else logo_raw

    # Categorie
    cat_raw   = prog.get("category") or prog.get("main_category") or ""
    categorie = normalize_category(cat_raw)

    # Comision — noua structura: commissions: [{type: "CPS", value: "1.00% - 20.00%"}]
    commissions = prog.get("commissions") or []
    if commissions and isinstance(commissions, list):
        # Ia primul comision CPS sau primul disponibil
        cps = next((c for c in commissions if c.get("type") == "CPS"), commissions[0])
        comision = str(cps.get("value", "")).strip()
    else:
        # Fallback camp simplu
        comision = str(prog.get("commission_value") or prog.get("default_commission") or "")

    url_magazin = url_raw or f"https://{slug}"
    if not url_magazin.startswith("http"):
        url_magazin = f"https://{url_magazin}"

    # Link afiliat — folosim pid numeric (advertiser ID), mai fiabil decat
    # affiliate_identifier care poate fi un placeholder generic (ex: "NA6")
    aff_id = pid
    url_afiliat = make_tracking_url(AFFILIATE_USERNAME, aff_id, slug)

    # Promotii din promo_map (indexate dupa advertiser_id = pid)
    promotii    = promo_map.get(pid, [])

    # FIX 05.06.2026: landing_page-urile promotiilor erau URL-uri brute (fara tracking),
    # deci click-urile pe oferte pierdeau comisionul. Le wrappez peste url_afiliat
    # (tracking verificat HTTP 200) + &url= pentru deep-link la oferta specifica.
    for promo in promotii:
        lp = promo.get("landing_page", "")
        if lp and not lp.startswith("https://l.profitshare.ro"):
            promo["landing_page"] = f"{url_afiliat}&url={quote(lp, safe='')}"
        elif not lp:
            promo["landing_page"] = url_afiliat

    are_promotie = len(promotii) > 0
    are_cod     = any(p.get("cod_cupon") for p in promotii)
    zile_ramase = min((p.get("zile_ramase", 99) for p in promotii), default=99)

    rank = rank_counter + 100

    return {
        "magazin": slug,
        "url": url_magazin,
        "url_afiliat": url_afiliat,
        "logo_url": logo_url,
        "categorie": categorie,
        "comision": comision,
        "rank": rank,
        "scor_afiliere": max(0, 50 - rank_counter),
        "prioritate": f"#{rank}",
        "canal_recomandat": "Profitshare",
        "sales_number": 0,
        "trend": 0.0,
        "are_promotie": are_promotie,
        "cod_cupon": are_cod,
        "zile_ramase": zile_ramase,
        "promotii": promotii,
        "folosit_de": calculeaza_folosit(slug, are_promotie),
        "procent_succes": calculeaza_succes(slug, rank_counter),
        "exclusiv": are_cod,
        "categorie_slug": categorie_slug(categorie),
        "scor_final": max(0, 50 - rank_counter) + (20 if are_promotie else 0) + (10 if are_cod else 0),
        "platforma": "profitshare",
    }


def main():
    if not AFFILIATE_USERNAME or not AFFILIATE_KEY:
        print("=" * 60)
        print("PROFITSHARE: credentiale lipsa — skip")
        print("Seteaza PROFITSHARE_USER si PROFITSHARE_KEY")
        print("=" * 60)
        # Scrie JSON gol ca sa nu dea eroare la merge
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)
        return

    print("=" * 60)
    print("Profitshare.ro — descarc date...")
    print("=" * 60)

    programs = load_programs()
    if not programs:
        print("  Niciun program gasit.")
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)
        return

    print(f"  Total programe: {len(programs)}")

    promotions = load_promotions()
    print(f"  Total promotii active: {len(promotions)}")

    promo_map = build_promo_map(promotions)

    rezultate = []
    for i, prog in enumerate(programs):
        intrare = process_program(prog, promo_map, i)
        if intrare:
            rezultate.append(intrare)

    cu_promotii = sum(1 for m in rezultate if m["are_promotie"])
    cu_cod = sum(1 for m in rezultate if m["cod_cupon"])

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(rezultate, f, ensure_ascii=False, indent=2)

    print(f"\nGata! {len(rezultate)} magazine Profitshare procesate.")
    print(f"  {cu_promotii} cu promotii active")
    print(f"  {cu_cod} cu cod cupon")
    print(f"\nTOP 10 magazine:")
    for m in rezultate[:10]:
        flag = " [PROMO]" if m["are_promotie"] else ""
        print(f"  {m['magazin']}{flag}")
    print(f"\nSalvat: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
