#!/usr/bin/env python3
"""
Scor comercianti + impartire pe 4 niveluri de promovare.
Formula (spec Alex): brand trust + comision + conversie + feed produse +
coduri active + SEO + sezonalitate + valoare comanda.

Mapare pe datele pe care le AVEM (nu inventam ce nu masuram inca):
  brand trust   -> logo real + platforma serioasa + sales_number mare
  comision      -> procentul parsat din campul `comision`
  conversie     -> sales_number (proxy pana avem GA4 click data)
  feed produse  -> prezenta in products.json
  coduri active -> are_promotie / cod_cupon / zile_ramase
  SEO           -> pagina brand dedicata exista (lista statica) + slug curat
  valoare       -> scor_final din pipeline (inglobeaza rank/trend 2P)

Niveluri:
  AGRESIV — promovare peste tot (homepage, social zilnic, newsletter)
  NORMAL  — pagini proprii + aparitii contextuale
  LOW     — doar listat (link afiliat pasiv)
  ASCUNS  — candidat noindex/excludere (fara logo, fara promo, scor minim)

Output: data/scor-comercianti.csv (sortat desc) + sumar in consola.
Ruleaza manual sau in pipeline dupa merge_platforms.py.
"""
import csv
import json
import re
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).parent.parent
OUTPUT_JSON = ROOT / "frontend" / "public" / "output.json"
PRODUCTS_JSON = ROOT / "frontend" / "public" / "products.json"
OUT_CSV = ROOT / "data" / "scor-comercianti.csv"

# Pagini brand dedicate (bonus SEO — au deja continut editorial + FAQ)
BRAND_PAGES = {
    "emag.ro","altex.ro","fashiondays.ro","carturesti.ro","drmax.ro","noriel.ro",
    "elefant.ro","decathlon.ro","libris.ro","answear.ro","notino.ro","flanco.ro",
    "bookzone.ro","vegis.ro","petmax.ro","sportdepot.ro","automobilus.ro","litera.ro",
    "pcmadd.com","otter.ro","temu.com","shein.com","trendyol.com","banggood.com",
    "scule365.ro","kitunghii.ro","pfarma.ro","brico.ro","liki24.ro","vidaxl.ro",
    "petmart.ro","asos.com","iherb.com","amazon.com",
}


def parse_comision(c: str) -> float:
    if not c:
        return 0.0
    nums = [float(x) for x in re.findall(r"[\d.]+", str(c))]
    return max(nums) if nums else 0.0


def main():
    data = json.load(open(OUTPUT_JSON, encoding="utf-8"))
    try:
        prod = json.load(open(PRODUCTS_JSON, encoding="utf-8"))
        feed_slugs = {p.get("merchant_slug") for p in prod.get("products", [])}
    except Exception:
        feed_slugs = set()

    max_sales = max((m.get("sales_number") or 0) for m in data) or 1
    max_scor = max((m.get("scor_final") or 0) for m in data) or 1

    rows = []
    for m in data:
        slug = m.get("magazin", "")
        if not slug or slug in ("profitshare.ro", "2performant.com"):
            continue
        com = parse_comision(m.get("comision", ""))
        link_real = bool(m.get("url_afiliat")) and m.get("url_afiliat") != m.get("url")

        s_trust = (2 if m.get("logo_url") else 0) + min((m.get("sales_number") or 0) / max_sales * 3, 3)   # 0-5
        s_comision = min(com / 6, 5)                                                                        # 0-5 (30%+ = max)
        s_conversie = min((m.get("folosit_de") or 0) / 500, 5)                                              # 0-5
        s_feed = 5 if slug in feed_slugs else 0                                                             # 0/5
        s_coduri = (3 if m.get("are_promotie") else 0) + (2 if m.get("cod_cupon") else 0)                   # 0-5
        s_seo = (3 if slug in BRAND_PAGES else 0) + (2 if "." in slug and " " not in slug else 0)           # 0-5
        s_valoare = (m.get("scor_final") or 0) / max_scor * 5                                               # 0-5

        total = round(s_trust + s_comision + s_conversie + s_feed + s_coduri + s_seo + s_valoare, 1)  # max 35

        # Regula Alex ("promoveaza tot"): orice magazin cu link afiliat real ramane
        # minim LOW (comision pe orice click). ASCUNS = doar fara link (zero bani)
        # — si chiar si alea raman listate pe site, doar nu le promovam ACTIV.
        if not link_real:
            nivel = "ASCUNS"
        elif total >= 18:
            nivel = "AGRESIV"
        elif total >= 10:
            nivel = "NORMAL"
        else:
            nivel = "LOW"

        rows.append({
            "magazin": slug, "nivel": nivel, "scor": total,
            "platforma": m.get("platforma", ""), "comision_max_pct": com,
            "are_promotie": int(bool(m.get("are_promotie"))), "cod_cupon": int(bool(m.get("cod_cupon"))),
            "in_feed_produse": int(slug in feed_slugs), "pagina_brand": int(slug in BRAND_PAGES),
            "link_afiliat_real": int(link_real), "sales_number": m.get("sales_number") or 0,
        })

    rows.sort(key=lambda r: -r["scor"])
    OUT_CSV.parent.mkdir(exist_ok=True)
    with open(OUT_CSV, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)

    from collections import Counter
    c = Counter(r["nivel"] for r in rows)
    print(f"Scor calculat pentru {len(rows)} comercianti -> {OUT_CSV}")
    for nivel in ["AGRESIV", "NORMAL", "LOW", "ASCUNS"]:
        print(f"  {nivel}: {c.get(nivel, 0)}")
    print("\nTOP 15 AGRESIV (promovare peste tot):")
    for r in [x for x in rows if x["nivel"] == "AGRESIV"][:15]:
        print(f"  {r['scor']:5.1f}  {r['magazin']:25s} {r['platforma']:12s} com:{r['comision_max_pct']}%")


if __name__ == "__main__":
    main()
