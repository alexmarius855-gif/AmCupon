"""
reconcile_impact_links.py — upgradeaza/curata link-urile Impact din extra_merchants.json
SI din data/output.json.

Problema gasita 06.08.2026: import_generic_affiliate.py sare orice domeniu deja existent
(load_existing_slugs), deci merchant-i adaugati candva cu un link placeholder (ex.
"add_impact_merchants.py" vechi, cu ?ref=amcupon/REFERRALCODE=AMCUPON ghicite, niciodata
verificate) NU se mai actualizeaza automat cand un export CSV proaspat are link-ul real
Impact pentru acelasi domeniu -> site-ul arata magazine ca "afiliate" fara sa fie, de fapt,
trackuite (comision 0 garantat la orice click).

Problema #2 gasita 06.08.2026 (panoul Affiliate Audit din /admin): scriptul verifica DOAR
extra_merchants.json, dar 45+ magazine cu program Impact activ chiar acum (kkday.com,
artlist.io, travala.com, jackery, roborock etc.) traiesc in data/output.json (fisierul
etichetat "# 2Performant" in merge_platforms.py, dar folosit istoric si pt Impact) — niciun
script nu le verifica vreodata contra CSV-ului. Adaugat: a 2-a trecere peste OUTPUT_PATH,
plus matching eTLD+1 (nu doar egalitate exacta) ca sa prinda si variante de subdomeniu
(nl.jackery.com -> jackery.com, ro.roborock.com -> pl.roborock.com etc.) — lista MULTI_TLD
e mica si explicita, niciodata "ghicita".

Ce face (pe ambele fisiere):
  1. Citeste data/impact_campaigns.csv (exportul curent) -> domeniu -> (link real, payout)
  2. Pentru fiecare magazin cu url_afiliat suspect (fara semnatura reala Impact:
     pxf.io/sjv.io/impactradius/7401119/irclickid), cauta domeniul in export (exact, apoi
     eTLD+1):
       - GASIT  -> inlocuieste url_afiliat cu link-ul real + platforma=impact
       - NEGASIT -> curata parametrul fals (?ref=amcupon etc), lasa link-ul CURAT catre magazin
                    (recomandare onesta, fara comision, la fel ca politica deja stabilita
                    pt branduri fara program afiliat). NU sterge magazinul.

Ruleaza dupa orice import nou de CSV, INAINTE de merge_platforms.py (wired in
.github/workflows/update-data.yml — permanent, nu manual/one-off).
"""

import csv
import json
import os
import re
from urllib.parse import urlparse

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
EXTRA_PATH = os.path.join(DATA_DIR, "extra_merchants.json")
OUTPUT_PATH = os.path.join(DATA_DIR, "output.json")
CSV_PATH = os.path.join(DATA_DIR, "impact_campaigns.csv")

REAL_TRACKING_RE = re.compile(r"pxf\.io|sjv\.io|impactradius|impact\.com|7401119|irclickid|prf\.hn|anrdoezrs\.net", re.I)
FAKE_PARAM_RE = re.compile(r"[?&](ref|REFERRALCODE|utm_source)=amcupon", re.I)
FAKE_PATH_RE = re.compile(r"/(invite|promo)/amcupon", re.I)

# Domenii cu TLD in 2 segmente unde eTLD+1 real e ultimele 3 label-uri, nu 2
# (ex. "lrmgoods.co.uk" -> root real e "lrmgoods.co.uk", nu "co.uk"). Lista mica,
# explicita — extinde-o daca apare un fals-pozitiv nou, nu ghici reguli generale.
MULTI_TLD = {
    "co.uk", "com.au", "com.sg", "co.nz", "com.br", "co.za",
    "com.tr", "co.il", "com.mx", "co.in", "com.ar", "co.kr", "com.tw", "com.co",
}


def domain_from_url(url):
    if not url:
        return ""
    u = url if url.startswith("http") else "https://" + url
    try:
        return re.sub(r"^www\.", "", urlparse(u).netloc.lower())
    except Exception:
        return ""


def etld1(domain):
    """eTLD+1 aproximativ — suficient pt matching intre domeniul unui magazin si
    Advertiser URL-ul din CSV (nu are nevoie de precizia unei liste publice de
    suffixe, doar sa NU confunde "co"/"com" dintr-un TLD compus cu un root real)."""
    if not domain:
        return ""
    parts = domain.split(".")
    if len(parts) <= 2:
        return domain
    last_two = ".".join(parts[-2:])
    if last_two in MULTI_TLD and len(parts) >= 3:
        return ".".join(parts[-3:])
    return last_two


# Campanie/ad "1" sau "0" intr-un link Impact = placeholder, nu o campanie reala.
# `add_impact_merchants.py` a generat candva linkuri de forma
# https://<brand>.pxf.io/c/7761435/1/0 construite din sablon, fara sa fi existat
# vreodata o campanie. Arata exact ca un link bun (are pxf.io, are /c/), deci
# treceau de REAL_TRACKING_RE si reconcile le lasa in pace la fiecare rulare.
# Verificat live 22.08.2026: raspund 404. Un link rupt care pare valid e mai rau
# decat unul lipsa — nu se repara singur si nu se vede in niciun raport.
PLACEHOLDER_IMPACT_RE = re.compile(r"/c/\d+/[01]/[01]\b")


def looks_fake_or_untracked(url_afiliat):
    if not url_afiliat:
        return True
    if PLACEHOLDER_IMPACT_RE.search(url_afiliat):
        return True                      # sablon negoncretizat, nu link real
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
    by_domain = {}
    by_etld1 = {}
    if not os.path.exists(CSV_PATH):
        print(f"[WARN] {CSV_PATH} nu exista, nimic de reconciliat")
        return by_domain, by_etld1
    with open(CSV_PATH, encoding="utf-8-sig", newline="") as f:
        for row in csv.DictReader(f):
            url = (row.get("Advertiser URL") or "").strip()
            link = (row.get("Tracking Link") or "").strip()
            status = (row.get("Contract Status") or "").strip()
            payout = (row.get("Payout") or "").strip()
            if status != "Active" or not link or not url:
                continue
            d = domain_from_url(url)
            if not d:
                continue
            entry = {"link": link, "payout": payout}
            by_domain[d] = entry
            # eTLD+1 e fallback — nu suprascrie o potrivire exacta deja gasita
            # pt acelasi root (primul program activ gasit pt un brand ramane).
            by_etld1.setdefault(etld1(d), entry)
    return by_domain, by_etld1


def domenii_candidate(m):
    """
    Toate domeniile prin care un magazin poate fi identificat in CSV.

    BUG REPARAT 22.08.2026 — versiunea anterioara facea:
        domain = m.get("magazin") or domain_from_url(m.get("url", ""))
    In `data/output.json` slug-ul E domeniul ("kkday.com"), deci mergea. Dar in
    `extra_merchants.json` slug-ul e numele afisat ("KKday", "Air Serbia") —
    o valoare ADEVARATA care nu e domeniu, deci `or` nu ajungea niciodata la
    fallback. Rezultat: 0 upgrade-uri pe extra_merchants.json, la fiecare rulare,
    tacut. Reconcile raporta "neschimbate: 712" si parea ca lucreaza.

    Efect masurat: 43 de magazine cu contract Impact ACTIV si link real in CSV
    livrau linkul curat, fara tracking. Fiecare click pe ele = comision 0.

    Un `or` intre "valoare care poate fi gresita" si "fallback" e o capcana:
    ascunde cazul in care prima valoare exista dar e de alt tip. Aici incercam
    toti candidatii, in ordinea increderii.
    """
    cand = []

    mg = str(m.get("magazin") or "").strip().lower()
    if "." in mg and " " not in mg:          # slug care chiar e domeniu
        d = domain_from_url(mg)
        if d:
            cand.append(d)

    d = domain_from_url(m.get("url", ""))    # site-ul real al magazinului
    if d:
        cand.append(d)

    # url_afiliat doar ca ultima solutie, si doar daca NU e link de retea
    # (ajungem aici doar cand linkul e netrackuit, dar nu ne bazam pe asta).
    ua = m.get("url_afiliat", "")
    if ua and not REAL_TRACKING_RE.search(ua):
        d = domain_from_url(ua)
        if d:
            cand.append(d)

    vazute = set()
    return [x for x in cand if not (x in vazute or vazute.add(x))]


def cauta_in_csv(m, csv_by_domain, csv_by_etld1):
    """Potrivire exacta pe domeniu intai, eTLD+1 doar ca fallback."""
    cand = domenii_candidate(m)
    for d in cand:
        if d in csv_by_domain:
            return csv_by_domain[d]
    for d in cand:
        e = etld1(d)
        if e in csv_by_etld1:
            return csv_by_etld1[e]
    return None


def reconcile_file(path, csv_by_domain, csv_by_etld1, label):
    if not os.path.exists(path):
        print(f"[SKIP] {path} nu exista")
        return

    with open(path, encoding="utf-8") as f:
        merchants = json.load(f)

    upgraded, cleaned, untouched = 0, 0, 0
    for m in merchants:
        url_afiliat = m.get("url_afiliat", "")
        if not looks_fake_or_untracked(url_afiliat):
            untouched += 1
            continue

        hit = cauta_in_csv(m, csv_by_domain, csv_by_etld1)
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

    with open(path, "w", encoding="utf-8") as f:
        json.dump(merchants, f, ensure_ascii=False, indent=2)

    print(f"[{label}] upgradate: {upgraded} | curatate: {cleaned} | neschimbate: {untouched}")


def main():
    csv_by_domain, csv_by_etld1 = load_csv_map()
    print(f"Export CSV: {len(csv_by_domain)} programe active cu link real")

    reconcile_file(EXTRA_PATH, csv_by_domain, csv_by_etld1, "extra_merchants.json")
    reconcile_file(OUTPUT_PATH, csv_by_domain, csv_by_etld1, "data/output.json")

    print("Urmator pas: python merge_platforms.py")


if __name__ == "__main__":
    main()
