"""
Sonda pe API-urile retelelor: ce mai trebuie facut de mana si ce poate veni singur.

2Performant: exportul manual de promotii (data/promotii_2p.csv) a adus in rularea din 18.11 doar 7 oferte
peste API (70 in CSV, 63 veneau deja din API) si o oferta programata. Intrebarea: da API-ul si ofertele
programate (start in viitor), cu vreun filtru? `facets` din raspuns spune ce filtre exista.

Impact: exportul manual de campanii are 437 de programe active, API-ul 517+. Intrebarea: cataloagele de
produse (/Catalogs) — cate, cu ce moneda, cate produse — ca sa le aducem pe site fara export.

Logul GitHub Actions e PUBLIC: scriem doar numere, nume de campuri si nume de filtre. Fara texte de oferta,
fara coduri, fara comisioane, fara tokenuri.

    python scripts/v2/sonde/sonda_retele.py --2p --impact
"""
from __future__ import annotations

import argparse
import csv
import os
import re
import sys
import time
import unicodedata
from datetime import datetime, timezone

RADACINA = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
sys.path.insert(0, os.path.join(RADACINA, "scripts"))


def _norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", s or "")
    s = "".join(c for c in s if not unicodedata.combining(c)).lower()
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


def _data(s: str):
    s = (s or "").strip().replace(" UTC", "").replace("Z", "")
    for f in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
        try:
            return datetime.strptime(s[:19] if "T" in f or " %H" in f else s[:10], f).replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    return None


def sonda_2p() -> int:
    import fetch_2p_api as p2
    if not (p2.AFFILIATE_EMAIL and p2.AFFILIATE_PASS):
        print("2P: lipsesc TWOPEFORMANT_EMAIL / TWOPEFORMANT_PASS")
        return 1
    if not p2.sign_in():
        print("2P: autentificarea a picat")
        return 1
    acum = datetime.now(timezone.utc)

    def rezumat(items: list[dict]) -> str:
        viitor = sum(1 for x in items if (_data(str(x.get("promotion_start") or "")) or acum) > acum)
        trecut = sum(1 for x in items if (_data(str(x.get("promotion_end") or "")) or acum) < acum)
        return f"{len(items)} promotii, {viitor} cu start in viitor, {trecut} terminate"

    prima = p2.api_get("affiliate/advertiser_promotions", {"page": 1, "perpage": 40}) or {}
    print("2P: chei raspuns:", sorted(prima.keys()) if isinstance(prima, dict) else type(prima).__name__)
    if isinstance(prima, dict):
        print("2P: paginare:", prima.get("pagination"))
        fac = prima.get("facets")
        if isinstance(fac, dict):
            for k, v in fac.items():
                if isinstance(v, list):
                    nume = [str((x.get("value") if isinstance(x, dict) else x))[:30] for x in v[:12]]
                    print(f"2P: filtru disponibil `{k}` ({len(v)} valori): {nume}")
                elif isinstance(v, dict):
                    print(f"2P: filtru disponibil `{k}`: chei {sorted(v.keys())[:12]}")
                else:
                    print(f"2P: filtru `{k}`: {type(v).__name__}")
        elif fac is not None:
            print("2P: facets:", type(fac).__name__, str(fac)[:200])
        ev = prima.get("shopping_events")
        if isinstance(ev, list):
            print(f"2P: shopping_events: {len(ev)}; campuri: {sorted(ev[0].keys()) if ev and isinstance(ev[0], dict) else '-'}")
        items = prima.get("advertiser_promotions") or []
        if items:
            print("2P: campurile unei promotii:", sorted(items[0].keys()))

    implicit = p2.fetch_all_pages("affiliate/advertiser_promotions", per_page=40)
    print("2P implicit (ce ia pipeline-ul):", rezumat(implicit))

    variante = [
        {"filter[status]": "upcoming"}, {"filter[status]": "scheduled"}, {"filter[status]": "future"},
        {"filter[status]": "pending"}, {"filter[status]": "all"}, {"filter[status]": "inactive"},
        {"filter[active]": "false"}, {"filter[active]": "all"}, {"filter[upcoming]": "true"},
        {"filter[period]": "upcoming"}, {"filter[time]": "future"}, {"filter[show_upcoming]": "true"},
        {"filter[promotion_status]": "upcoming"}, {"filter[state]": "upcoming"}, {"status": "upcoming"},
        {"filter[start_date_from]": acum.strftime("%Y-%m-%d")},
        {"filter[promotion_start][gte]": acum.strftime("%Y-%m-%d")},
    ]
    gasite_extra = []
    for v in variante:
        time.sleep(1)
        rasp = p2.api_get("affiliate/advertiser_promotions", {"page": 1, "perpage": 40, **v}) or {}
        items = (rasp.get("advertiser_promotions") or []) if isinstance(rasp, dict) else []
        pag = rasp.get("pagination") if isinstance(rasp, dict) else None
        print(f"2P varianta {v}: pagina 1 -> {rezumat(items)}; paginare {pag}")
        ids_impl = {x.get("id") for x in implicit}
        noi = [x for x in items if x.get("id") not in ids_impl]
        if noi:
            gasite_extra.append((v, len(noi)))
    print("2P: variante care aduc promotii pe care implicitul nu le are:", gasite_extra or "niciuna")

    # Comparatie cu exportul manual: ce oferte valabile din CSV lipsesc din API?
    cale = os.path.join(RADACINA, "data", "promotii_2p.csv")
    if os.path.exists(cale):
        with open(cale, encoding="utf-8-sig", newline="") as f:
            randuri = list(csv.DictReader(f))
        valabile = [r for r in randuri if (_data(r.get("End Date") or "") or acum) >= acum]
        viitoare = [r for r in valabile if (_data(r.get("Start Date") or "") or acum) > acum]
        chei_api = {_norm(x.get("name") or "") for x in implicit}
        lipsa = [r for r in valabile if _norm(r.get("Promotion name") or "") not in chei_api]
        print(f"2P CSV manual: {len(randuri)} randuri, {len(valabile)} valabile, {len(viitoare)} programate, "
              f"{len(lipsa)} valabile care lipsesc din API (dupa nume)")
        lipsa_viit = sum(1 for r in lipsa if r in viitoare)
        print(f"2P CSV: dintre cele lipsa, {lipsa_viit} sunt programate, {len(lipsa) - lipsa_viit} sunt deja in curs")
    return 0


def sonda_impact() -> int:
    import requests
    from requests.auth import HTTPBasicAuth
    sid, tok = os.environ.get("IMPACT_ACCOUNT_SID", ""), os.environ.get("IMPACT_AUTH_TOKEN", "")
    if not (sid and tok):
        print("Impact: lipsesc IMPACT_ACCOUNT_SID / IMPACT_AUTH_TOKEN")
        return 1
    auth = HTTPBasicAuth(sid, tok)
    hdr = {"Accept": "application/json"}

    def get(path: str, params: dict | None = None):
        r = requests.get(f"https://api.impact.com/Mediapartners/{sid}{path}", auth=auth, headers=hdr,
                         params=params or {}, timeout=30)
        return r.status_code, (r.json() if r.headers.get("content-type", "").startswith("application/json") else {})

    cod, date = get("/Catalogs", {"PageSize": 100, "Page": 1})
    print(f"Impact /Catalogs: HTTP {cod}, total {date.get('@total')}, pagini {date.get('@numpages')}")
    catalogs = list(date.get("Catalogs") or [])
    pagini = int(date.get("@numpages") or 1)
    for pg in range(2, min(pagini, 10) + 1):
        time.sleep(0.5)
        _, d = get("/Catalogs", {"PageSize": 100, "Page": pg})
        catalogs += d.get("Catalogs") or []
    if not catalogs:
        return 0
    print("Impact: campurile unui catalog:", sorted(catalogs[0].keys()))
    monede: dict[str, int] = {}
    tari: dict[str, int] = {}
    total_items = 0
    for c in catalogs:
        mon = str(c.get("Currency") or c.get("CurrencyCode") or "?")
        monede[mon] = monede.get(mon, 0) + 1
        for t in (c.get("Countries") or c.get("ShippingCountries") or c.get("Locations") or []):
            t = str(t.get("Country") if isinstance(t, dict) else t)[:20]
            tari[t] = tari.get(t, 0) + 1
        try:
            total_items += int(c.get("NumberOfItems") or c.get("ItemCount") or 0)
        except ValueError:
            pass
    print(f"Impact: {len(catalogs)} cataloage, {total_items} produse in total")
    print("Impact: cataloage pe moneda:", dict(sorted(monede.items(), key=lambda kv: -kv[1])))
    if tari:
        print("Impact: cataloage pe tara:", dict(sorted(tari.items(), key=lambda kv: -kv[1])[:15]))
    mari = sorted(catalogs, key=lambda c: -int(c.get("NumberOfItems") or c.get("ItemCount") or 0))[:15]
    for c in mari:
        print(f"  - {str(c.get('CampaignName') or c.get('AdvertiserName') or c.get('Name'))[:40]}: "
              f"{c.get('NumberOfItems') or c.get('ItemCount')} produse, {c.get('Currency') or '?'}, "
              f"actualizat {str(c.get('DateLastUpdated') or '')[:10]}")
    ron = [c for c in catalogs if str(c.get("Currency") or "").upper() == "RON"]
    print(f"Impact: cataloage in RON: {len(ron)}")
    proba = (ron or catalogs)[0]
    cid = proba.get("Id") or proba.get("CatalogId")
    if cid:
        time.sleep(0.5)
        cod, it = get(f"/Catalogs/{cid}/Items", {"PageSize": 5, "Page": 1})
        items = it.get("Items") or []
        print(f"Impact: produsele unui catalog: HTTP {cod}, campuri {sorted(items[0].keys()) if items else '-'}")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--2p", dest="p2", action="store_true")
    ap.add_argument("--impact", action="store_true")
    a = ap.parse_args()
    rc = 0
    if a.p2:
        try:
            rc |= sonda_2p()
        except Exception as e:  # sonda nu trebuie sa ascunda cealalta parte
            print(f"2P: sonda a picat: {type(e).__name__}")
            rc = 1
    if a.impact:
        try:
            rc |= sonda_impact()
        except Exception as e:
            print(f"Impact: sonda a picat: {type(e).__name__}")
            rc = 1
    return rc


if __name__ == "__main__":
    sys.exit(main())
