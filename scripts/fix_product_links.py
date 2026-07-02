#!/usr/bin/env python3
"""
Repara linkurile de produse care duc la homepage-ul magazinului FARA tracking
de afiliere (0 comision la click) — gasite prin audit 02.07.2026: produse din
feed cu price=0 SI url = domeniul gol (ex: "https://www.medimfarm.ro") in loc
de un link real catre produs/campanie.

Inlocuieste cu url_afiliat REAL al magazinului din output.json (macar clickul
castiga comision, chiar daca nu duce la produsul exact).

Ruleaza dupa fetch_product_feeds.py (are nevoie de products.json proaspat) si
merge_platforms.py (are nevoie de output.json cu url_afiliat).
"""
import json
import sys
from pathlib import Path
from urllib.parse import urlparse

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).parent.parent
PRODUCTS_JSON = ROOT / "frontend" / "public" / "products.json"
OUTPUT_JSON = ROOT / "frontend" / "public" / "output.json"

TRACKING_MARKERS = ("2performant.com/events/click", "utm_source", "aff_code",
                     "affid", "tag=", "ref=", "profitshare.ro", "sjv.io",
                     "impact.com", "/c/7401119/")


def is_untracked_homepage(url: str) -> bool:
    if not url:
        return True
    if any(m in url for m in TRACKING_MARKERS):
        return False
    path = urlparse(url).path.strip("/")
    return path in ("", "index.html")


def main():
    data = json.loads(PRODUCTS_JSON.read_text(encoding="utf-8"))
    products = data.get("products", data) if isinstance(data, dict) else data

    magazine = json.loads(OUTPUT_JSON.read_text(encoding="utf-8"))
    url_afiliat_by_slug = {m["magazin"]: m.get("url_afiliat") for m in magazine if m.get("url_afiliat")}

    fixed = 0
    still_broken = []
    for p in products:
        url = p.get("url", "")
        if not (not p.get("price") and is_untracked_homepage(url)):
            continue
        slug = p.get("merchant_slug") or p.get("merchant") or ""
        real = url_afiliat_by_slug.get(slug)
        if real and real != url:
            p["url"] = real
            fixed += 1
        else:
            still_broken.append(slug)

    if isinstance(data, dict):
        data["products"] = products
        PRODUCTS_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    else:
        PRODUCTS_JSON.write_text(json.dumps(products, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Reparate: {fixed} produse (link homepage fara tracking -> url_afiliat real)")
    if still_broken:
        print(f"Fara link afiliat in output.json (nu am ce pune -- verifica manual): {sorted(set(still_broken))}")


if __name__ == "__main__":
    main()
