"""
enrich_products_from_promos.py
==============================
Genereaza "promo-produse" din promotiile active in output.json si le
injecteaza la inceputul products.json (cu discount_pct real extras din text).

Rezultat: produsele cu discount real apar primele in pagina /produse.
Ruleaza dupa merge_platforms.py.
"""

import json
import os
import re
from datetime import datetime, timezone

SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT    = os.path.dirname(SCRIPT_DIR)
OUTPUT_JSON  = os.path.join(REPO_ROOT, "frontend", "public", "output.json")
PRODUCTS_JSON = os.path.join(REPO_ROOT, "frontend", "public", "products.json")

CATEGORIE_SLUG_MAP = {
    "fashion":               "fashion",
    "beauty":                "beauty",
    "pharma":                "farmacie",
    "health-personal-care":  "farmacie",
    "electronics-itc":       "electronice",
    "sports-outdoors":       "sport",
    "home-garden":           "casa",
    "babies-kids-toys":      "copii",
    "automotive":            "auto",
    "books":                 "carti",
    "hypermarket-groceries": "alimente",
    "gifts-flowers":         "bijuterii",
    "pet-supplies":          "animale",
    "jewelry":               "bijuterii",
    "games":                 "jocuri",
    "online-mall":           "electronice",
}


def extract_discount(text: str) -> int:
    if not text:
        return 0
    m = re.search(r"(\d+)\s*%", text)
    if m:
        v = int(m.group(1))
        if 5 <= v <= 90:
            return v
    return 0


def extract_price(text: str) -> float:
    if not text:
        return 0.0
    m = re.search(r"(\d[\d\s\.]*(?:,\d+)?)\s*(?:lei|ron|RON)", text, re.IGNORECASE)
    if m:
        raw = m.group(1).replace(" ", "").replace(".", "").replace(",", ".")
        try:
            v = float(raw)
            return v if 0 < v < 100_000 else 0.0
        except ValueError:
            pass
    return 0.0


def promo_to_product(mag: dict, promo: dict, idx: int) -> dict | None:
    title = (promo.get("nume") or "").strip()
    if not title:
        return None

    landing = (promo.get("landing_page") or "").strip()
    url_afiliat = (mag.get("url_afiliat") or "").strip()
    url = landing or url_afiliat
    if not url:
        return None

    discount_pct = extract_discount(title) or extract_discount(promo.get("descriere", ""))
    price = extract_price(title) or extract_price(promo.get("descriere", ""))
    old_price = None
    if discount_pct > 0 and price > 0:
        old_price = round(price / (1 - discount_pct / 100), 2)

    cat_slug_raw = mag.get("categorie_slug", "")
    cat_slug = CATEGORIE_SLUG_MAP.get(cat_slug_raw, cat_slug_raw or "altele")
    categorie = mag.get("categorie", "")

    merchant_slug = mag.get("magazin", "")
    merchant_name = merchant_slug.split(".")[0].capitalize()

    # Titlu curat — elimina diacriticile problematice
    cod = (promo.get("cod_cupon") or "").strip()
    if cod:
        display_title = f"{title} — Cod: {cod}"
    else:
        display_title = title

    return {
        "id":           f"promo_{merchant_slug}_{idx}",
        "title":        display_title[:120],
        "url":          url,
        "url_original": url,
        "image":        mag.get("logo_url") or "",
        "price":        price,
        "old_price":    old_price,
        "discount_pct": discount_pct,
        "category":     categorie[:60],
        "cat_slug":     cat_slug,
        "brand":        merchant_name[:50],
        "merchant":     merchant_name,
        "merchant_slug": merchant_slug,
        "feed_id":      "promo",
        "is_promo":     True,
        "cod_cupon":    cod,
        "zile_ramase":  promo.get("zile_ramase", 0),
    }


def main():
    print("=" * 55)
    print("enrich_products_from_promos.py")
    print("=" * 55)

    with open(OUTPUT_JSON, encoding="utf-8") as f:
        magazine = json.load(f)

    # Citeste products.json existent
    existing_products = []
    if os.path.exists(PRODUCTS_JSON):
        with open(PRODUCTS_JSON, encoding="utf-8") as f:
            data = json.load(f)
        # Pastreaza doar produsele non-promo existente
        existing_products = [p for p in data.get("products", []) if not p.get("is_promo")]
        print(f"  Produse existente (non-promo): {len(existing_products)}")

    # Genereaza promo-produse
    promo_products = []
    for mag in magazine:
        promotii = [p for p in mag.get("promotii", []) if (p.get("zile_ramase", -1) >= 0)]
        for i, promo in enumerate(promotii):
            prod = promo_to_product(mag, promo, i)
            if prod:
                promo_products.append(prod)

    print(f"  Promo-produse generate: {len(promo_products)}")

    # Sorteaza promo-produsele: cu discount si cu cod mai sus
    promo_products.sort(key=lambda x: (
        -(x.get("discount_pct") or 0),
        -int(bool(x.get("cod_cupon"))),
        -(x.get("zile_ramase") or 0),
    ))

    # Combine: promo-produse PRIMUL, apoi restul
    all_products = promo_products + existing_products

    # Salveaza
    result = {
        "updated":  datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "count":    len(all_products),
        "products": all_products,
    }

    with open(PRODUCTS_JSON, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    cu_disc = sum(1 for p in promo_products if p.get("discount_pct", 0) > 0)
    cu_cod  = sum(1 for p in promo_products if p.get("cod_cupon"))
    print(f"  Cu discount real: {cu_disc}")
    print(f"  Cu cod cupon:     {cu_cod}")
    print(f"  Total products.json: {len(all_products)}")
    print(f"  Salvat: {PRODUCTS_JSON}")
    print("=" * 55)


if __name__ == "__main__":
    main()
