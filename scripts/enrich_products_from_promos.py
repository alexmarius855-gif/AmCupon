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

from continut_restrictionat import e_restrictionat
from nume_magazin import nume_afisat
from promotii import titlu_afisabil

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


def promo_to_product(mag: dict, promo: dict, idx: int) -> dict | None:
    # 07.10.2026: titlul afisabil (la Impact `nume` e des doar codul, oferta e in `descriere`).
    # Un titlu fara spatiu e codul insusi („SAVE10") sau un cuvant gol — nu spune ce e oferta.
    title = re.sub(r"\s+", " ", titlu_afisabil(promo)).strip()
    if not title or " " not in title:
        return None

    landing = (promo.get("landing_page") or "").strip()
    url_afiliat = (mag.get("url_afiliat") or "").strip()
    url = landing or url_afiliat
    if not url:
        return None

    discount_pct = extract_discount(title) or extract_discount(promo.get("descriere", ""))
    # 07.10.2026: o promotie NU are pret de produs — `price` 0 si `old_price` None, mereu.
    # Pana azi pretul era primul numar cu „lei" din text, adica aproape mereu ALTCEVA: pragul
    # comenzii („de minimum 149 lei" la Noriel, „peste 500 lei" la Autobob), valoarea unui
    # voucher („50 lei Voucher Cadou"), suma maxima de discount („pana la 7500 RON" la f64.ro)
    # sau pretul VECHI („de la peste 2.300 lei la doar 165 lei" -> 2.300). Iar `old_price`
    # era calculat din procent (149 / 0,8 = 186,25 lei) — pret pe care magazinul nu l-a scris
    # nicaieri. Pe card iesea „149 lei, ~~186,25 lei~~, -20%" pe /produse si pe pagina Noriel.
    # Fara pret, cardurile arata „Oferta activa"; procentul ramane — e scris chiar in oferta.
    price = 0.0
    old_price = None

    cat_slug_raw = mag.get("categorie_slug", "")
    cat_slug = CATEGORIE_SLUG_MAP.get(cat_slug_raw, cat_slug_raw or "altele")
    categorie = mag.get("categorie", "")

    merchant_slug = mag.get("magazin", "")
    merchant_name = nume_afisat(merchant_slug)  # sursa unica: lib/numeMagazin.ts

    # 07.10.2026: codul NU intra in titlu. „… — Cod: VR70" il arata intreg pe orice card, fara clic
    # pe linkul platit (deci fara comision); pe restul site-ului codul e mascat (lib/maskCod.ts).
    cod = (promo.get("cod_cupon") or "").strip()
    display_title = title
    if cod and len(cod) >= 3:
        # La Impact, descrierea incepe des cu codul („IMPACTVPN75 — 75% off ...").
        display_title = re.sub(re.escape(cod), "", display_title, flags=re.I)
        display_title = re.sub(r"^[\s—–:\-|]+|[\s—–:\-|]+$", "", re.sub(r"\s{2,}", " ", display_title))
        if " " not in display_title:
            return None

    prod = {
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
    # Magazinele si titlurile restrictionate (EXCLUSE_ACASA, continut explicit) nu ajung in feed-ul
    # general — aceeasi regula ca la produsele din feed (fetch_product_feeds.py).
    return None if e_restrictionat(prod) else prod


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
