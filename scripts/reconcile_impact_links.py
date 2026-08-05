"""
reconcile_impact_links.py — upgradeaza/curata link-urile Impact din extra_merchants.json.

Problema gasita 06.08.2026: import_generic_affiliate.py sare orice domeniu deja existent
(load_existing_slugs), deci merchant-i adaugati candva cu un link placeholder (ex.
"add_impact_merchants.py" vechi, cu ?ref=amcupon/REFERRALCODE=AMCUPON ghicite, niciodata
verificate) NU se mai actualizeaza automat cand un export CSV proaspat are link-ul real
Impact pentru acelasi domeniu -> site-ul arata magazine ca "afiliate" fara sa fie, de fapt,
trackuite (comision 0 garantat la orice click).

Ce face:
  1. Citeste data/impact_campaigns.csv (exportul curent) -> domeniu -> (link real, payout)
  2. Pentru fiecare magazin din extra_merchants.json cu url_afiliat suspect (fara semnatura
     reala Impact: pxf.io/sjv.io/impactradius/7401119/irclickid), cauta domeniul in export:
       - GASIT  -> inlocuieste url_afiliat cu link-ul real + platforma=impact + comision real
       - NEGASIT -> curata parametrul fals (?ref=amcupon etc), lasa link-ul CURAT catre magazin
                    (recomandare onesta, fara comision, la fel ca politica deja stabilita
                    pt branduri fara program afiliat). NU sterge magazinul.

Ruleaza dupa orice import nou de CSV, INAINTE de merge_platforms.py.
"""

import csv
import json
import os
import re
from urllib.parse import urlparse

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
EXTRA_PATH = os.path.join(DATA_DIR, "extra_merchants.json")
CSV_PATH = os.path.join(DATA_DIR, "impact_campaigns.csv")

REAL_TRACKING_RE = re.compile(r"pxf\.io|sjv\.io|impactradius|impact\.com|7401119|irclickid|prf\.hn|anrdoezrs\.net", re.I)
FAKE_PARAM_RE = re.compile(r"[?&](ref|REFERRALCODE|utm_source)=amcupon", re.I)
FAKE_PATH_RE = re.compile(r"/(invite|promo)/amcupon", re.I)


def domain_from_url(url):
    if not url:
        return ""
    u = url if url.startswith("http") else "https://" + url
    try:
        return re.sub(r"^www\.", "", urlparse(u).netloc.lower())
    except Exception:
        return ""


def looks_fake_or_untracked(url_afiliat):
    if not url_afiliat:
        return True
    if REAL_TRACKING_RE.search(url_afiliat):
        return False
    return True  # fara semnatura reala Impact = suspect (fals sau pur si simplu netrackuit)


def clean_fake_params(url):
    url = FAKE_PARAM_RE.sub("", url)
    url = FAKE_PATH_RE.sub("", url)
    url = re.sub(r"\?&", "?", url)
    url = re.sub(r"[?&]$", "", url)
    return url


def load_csv_map():
    mapping = {}
    if not os.path.exists(CSV_PATH):
        print(f"[WARN] {CSV_PATH} nu exista, nimic de reconciliat")
        return mapping
    with open(CSV_PATH, encoding="utf-8-sig", newline="") as f:
        for row in csv.DictReader(f):
            url = (row.get("Advertiser URL") or "").strip()
            link = (row.get("Tracking Link") or "").strip()
            status = (row.get("Contract Status") or "").strip()
            payout = (row.get("Payout") or "").strip()
            if status != "Active" or not link or not url:
                continue
            d = domain_from_url(url)
            if d:
                mapping[d] = {"link": link, "payout": payout}
    return mapping


def main():
    csv_map = load_csv_map()
    print(f"Export CSV: {len(csv_map)} programe active cu link real")

    if not os.path.exists(EXTRA_PATH):
        print("[EROARE] extra_merchants.json nu exista")
        return

    with open(EXTRA_PATH, encoding="utf-8") as f:
        merchants = json.load(f)

    upgraded, cleaned, untouched = 0, 0, 0
    for m in merchants:
        url_afiliat = m.get("url_afiliat", "")
        if not looks_fake_or_untracked(url_afiliat):
            untouched += 1
            continue

        domain = m.get("magazin") or domain_from_url(m.get("url", ""))
        hit = csv_map.get(domain)
        if hit:
            m["url_afiliat"] = hit["link"]
            m["platforma"] = "impact"
            upgraded += 1
        else:
            cleaned_url = clean_fake_params(url_afiliat) if url_afiliat else m.get("url", "")
            if cleaned_url != url_afiliat:
                m["url_afiliat"] = cleaned_url or m.get("url", "")
                cleaned += 1
            else:
                untouched += 1

    with open(EXTRA_PATH, "w", encoding="utf-8") as f:
        json.dump(merchants, f, ensure_ascii=False, indent=2)

    print(f"Upgradate cu link real Impact: {upgraded}")
    print(f"Curatate (parametru fals scos, ramane link simplu catre magazin): {cleaned}")
    print(f"Neschimbate (deja OK sau fara nimic de facut): {untouched}")
    print("Urmator pas: python merge_platforms.py")


if __name__ == "__main__":
    main()
