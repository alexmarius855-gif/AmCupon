"""
Genereaza fisiere lightweight pentru homepage (reduce payload ~1MB → ~10KB).

Homepage-ul descarca blog-posts.json (741KB) + products.json (304KB) doar
pentru a afisa 3 articole si 12 produse. Acest script creeaza versiuni mici:

  blog-latest.json    — ultimele 8 articole, FARA campul content (~3KB)
  products-home.json  — pana la 24 produse cu varietate per merchant (~8KB)

Ruleaza DUPA generate_blog.py si fetch_product_feeds.py in pipeline.
"""

import json
import os
import sys

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

PUB = os.path.join(os.path.dirname(__file__), "../frontend/public")

BLOG_SRC  = os.path.join(PUB, "blog-posts.json")
BLOG_OUT  = os.path.join(PUB, "blog-latest.json")
PROD_SRC  = os.path.join(PUB, "products.json")
PROD_OUT  = os.path.join(PUB, "products-home.json")
NAV_SRC   = os.path.join(PUB, "output.json")
NAV_OUT   = os.path.join(PUB, "nav-index.json")

# Cate articole / produse pastram pentru homepage
N_BLOG          = 8
N_PROD_TOTAL    = 96
N_PROD_PER_SHOP = 12  # max produse per merchant (fallback flat list)
N_PER_CAT       = 16  # max produse per categorie in by_category

# Override explicit pentru merchantii cu categorie gresita in 2P/PS
MERCHANT_CAT_OVERRIDE: dict[str, str] = {
    "navstore.ro": "automotive",
    # outfitblack.ro -> "books" ELIMINAT (bug gasit 20.06.2026): outfitblack.ro e magazin
    # de incaltaminte (zappatos.ro, poze cu pantofi), nu carti — categoria "Carti" pe homepage
    # afisa de fapt pantofi sub eticheta gresita, plus magazinul oricum se inchide
    # (vezi Probleme active din CLAUDE.md). Imaginile erau si pe HTTP simplu, blocate
    # ca mixed-content pe amcupon.ro (https) — card goale in productie.
}

# Detectie categorie din titlu produs (fallback cand merchant nu e mapat)
TITLE_CAT_KEYWORDS: list[tuple[str, list[str]]] = [
    ("automotive",          ["navigatie", "navigatii", "carplay", "android auto", "bmw", "mercedes",
                             "volkswagen", "skoda", "ford", "opel", "toyota", "audi", "renault",
                             "peugeot", "seat", "kia", "hyundai", "dacia", "volvo", "fiat", "honda",
                             "mazda", "porsche", "jeep", "mitsubishi", "suzuki", "nissan", "lexus",
                             "dvd auto", "multimedia auto", "adaptoare 2din", "rama adaptoare",
                             "unitate centrala"]),
    ("books",               ["carte", "carti", "roman", "literatura", "antologie", "beletristica",
                             "nuvela", "poezie", "memorii", "biografie", "atlas", "dictionar"]),
    ("electronics-itc",     ["laptop", "telefon", "tableta", "smartphone", "monitor", "televizor",
                             "casti wireless", "smartwatch", "ssd", "hdd", "placa video", "procesor",
                             "router", "camera foto", "imprimanta"]),
    ("fashion",             ["tricou", "rochie", "pantalon", "bluza", "jacheta", "palton", "geaca",
                             "incaltaminte", "pantofi", "adidasi", "ghete", "tenisi", "geanta"]),
    ("home-garden",         ["canapea", "fotoliu", "saltea", "dulap", "covor", "perdea", "lampa",
                             "gradina", "planta", "cuvertura", "patura", "husa canapea"]),
    ("beauty",              ["crema", "serum", "parfum", "fond de ten", "ruj", "oja", "mascara",
                             "sampon", "balsam", "gel de dus", "lotiune", "ulei"]),
    ("sports-outdoors",     ["bicicleta", "trotineta", "role", "schi", "snowboard", "cort",
                             "rucsac sport", "haltera", "banda alergat", "eliptica"]),
    ("pharma",              ["medicament", "vitamina", "supliment nutritiv", "pastila", "sirop",
                             "unguent", "bandaj", "termometru", "tensiometru"]),
    ("babies-kids-toys",    ["jucarie", "jucarii", "lego", "puzzle", "papusa", "scutec",
                             "biberon", "carucior", "patut copil"]),
    ("pet-supplies",        ["hrana pisica", "hrana caine", "hrana animale", "zgarda",
                             "lesa", "pat caine", "pat pisica", "nisip pisica"]),
]


def _detect_cat_from_title(title: str) -> str:
    t = title.lower()
    for cat_slug, keywords in TITLE_CAT_KEYWORDS:
        if any(kw in t for kw in keywords):
            return cat_slug
    return "other"


CAT_META = {
    "fashion":               ("👗", "Fashion"),
    "electronics-itc":       ("💻", "Electronice"),
    "beauty":                ("💄", "Frumusete"),
    "home-garden":           ("🏡", "Casa & Gradina"),
    "sports-outdoors":       ("🏃", "Sport & Outdoor"),
    "pharma":                ("💊", "Farmacie"),
    "babies-kids-toys":      ("🧸", "Copii & Jucarii"),
    "automotive":            ("🚗", "Auto-Moto"),
    "books":                 ("📚", "Carti"),
    "pet-supplies":          ("🐾", "Animale"),
    "health-personal-care":  ("🧴", "Sanatate"),
    "online-mall":           ("🛍️", "Mall Online"),
    "gifts-flowers":         ("🎁", "Cadouri & Flori"),
    "hypermarket-groceries": ("🛒", "Supermarket"),
    "telecom":               ("📱", "Telecom"),
    "jewelry":               ("💎", "Bijuterii"),
    "games":                 ("🎮", "Gaming"),
}


def kb(path: str) -> int:
    try:
        return os.path.getsize(path) // 1024
    except OSError:
        return 0


def gen_blog():
    if not os.path.exists(BLOG_SRC):
        print(f"  Lipsa: {BLOG_SRC} — skip blog")
        return
    with open(BLOG_SRC, encoding="utf-8") as f:
        posts = json.load(f)

    # Sorteaza dupa data descrescator (cele mai noi primele)
    posts_sorted = sorted(posts, key=lambda p: p.get("date", ""), reverse=True)

    # Pastreaza doar campurile necesare pe homepage (FARA content — economie majora)
    light = [
        {
            "slug":     p.get("slug", ""),
            "title":    p.get("title", ""),
            "excerpt":  p.get("excerpt", ""),
            "category": p.get("category", ""),
            "date":     p.get("date", ""),
            "cover":    p.get("cover", ""),
        }
        for p in posts_sorted[:N_BLOG]
    ]

    with open(BLOG_OUT, "w", encoding="utf-8") as f:
        json.dump(light, f, ensure_ascii=False, separators=(",", ":"))

    print(f"  blog-latest.json: {len(light)} articole ({kb(BLOG_SRC)}KB → {kb(BLOG_OUT)}KB)")


def _prod_light(p: dict) -> dict:
    return {
        "title":         p.get("title", ""),
        "url":           p.get("url", ""),
        "image":         p.get("image", ""),
        "price":         p.get("price", 0),
        "old_price":     p.get("old_price"),
        "discount_pct":  p.get("discount_pct", 0),
        "brand":         p.get("brand", ""),
        "merchant":      p.get("merchant", ""),
        "merchant_slug": p.get("merchant_slug", ""),
    }


def gen_products():
    if not os.path.exists(PROD_SRC):
        print(f"  Lipsa: {PROD_SRC} — skip produse")
        return
    with open(PROD_SRC, encoding="utf-8") as f:
        data = json.load(f)
    products = data.get("products", data) if isinstance(data, dict) else data

    # Construieste mapping merchant_slug → categorie_slug din output.json
    merchant_to_cat: dict[str, str] = {}
    if os.path.exists(NAV_SRC):
        with open(NAV_SRC, encoding="utf-8") as f:
            magazine = json.load(f)
        for m in magazine:
            magazin = m.get("magazin", "")
            cat = m.get("categorie_slug", "")
            if not (magazin and cat):
                continue
            slug_norm = magazin.replace(".", "-").lower()
            slug_short = magazin.split(".")[0].lower()
            merchant_to_cat[slug_norm] = cat
            merchant_to_cat[slug_short] = cat
            merchant_to_cat[magazin] = cat

    # Magazine cu feed de imagini stricat/mort — excluse din grid-ul de produse
    # outfitblack.ro: imaginile (zappatos.ro) dau 404, plus magazinul se inchide
    # (vezi Probleme active din CLAUDE.md) — verificat 20.06.2026
    MERCHANT_IMG_BLOCKLIST = {"outfitblack.ro"}

    # is_promo=True = banner generic de campanie (logo magazin reutilizat ca "imagine produs"),
    # NU un produs real cu poza proprie — excluse explicit, altfel arata stricat in grid
    # (bug observat 20.06.2026: categoria "Carti" avea 3 "produse" identice = logo Libhumanitas)
    valide = [
        p for p in products
        if p.get("image") and (p.get("price") or 0) > 0 and not p.get("is_promo")
        and (p.get("merchant_slug") or p.get("merchant") or "").lower() not in MERCHANT_IMG_BLOCKLIST
    ]

    # Adauga category_slug fiecarui produs
    for p in valide:
        m_slug = (p.get("merchant_slug") or "").lower()
        m_raw  = (p.get("merchant") or "").lower()
        m_norm = m_raw.replace(".", "-")
        m_short = m_raw.split(".")[0]
        p["_cat"] = (
            MERCHANT_CAT_OVERRIDE.get(m_raw)
            or MERCHANT_CAT_OVERRIDE.get(m_slug)
            or merchant_to_cat.get(m_slug)
            or merchant_to_cat.get(m_norm)
            or merchant_to_cat.get(m_short)
            or merchant_to_cat.get(m_raw)
            or _detect_cat_from_title(p.get("title", ""))
        )

    # Grupare pe categorie
    by_cat: dict[str, list] = {}
    for p in valide:
        by_cat.setdefault(p["_cat"], []).append(p)

    # Construieste by_category (top N_PER_CAT per categorie, minim 2 produse)
    result_categories = []
    for slug, prods in by_cat.items():
        if slug not in CAT_META:
            continue
        prods.sort(key=lambda x: (-(x.get("discount_pct") or 0), -(x.get("price") or 0)))
        top = prods[:N_PER_CAT]
        if len(top) < 2:
            continue
        emoji, label = CAT_META[slug]
        result_categories.append({
            "slug":     slug,
            "label":    label,
            "emoji":    emoji,
            "products": [_prod_light(p) for p in top],
        })

    # Sorteaza categoriile: mai multe produse = mai sus
    result_categories.sort(key=lambda c: -len(c["products"]))
    # Pastreaza top 8 categorii
    result_categories = result_categories[:8]

    # Flat list pentru backward-compat (si fallback)
    flat_pool: list = []
    for m, prods in by_cat.items():
        prods.sort(key=lambda x: (-(x.get("discount_pct") or 0), -(x.get("price") or 0)))
        flat_pool.extend(prods[:N_PROD_PER_SHOP])
    flat_pool.sort(key=lambda x: -(x.get("discount_pct") or 0))
    flat_light = [_prod_light(p) for p in flat_pool[:N_PROD_TOTAL]]

    output = {
        "by_category": result_categories,
        "products":    flat_light,
    }

    with open(PROD_OUT, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, separators=(",", ":"))

    n_cats = len(result_categories)
    n_prods = sum(len(c["products"]) for c in result_categories)
    print(f"  products-home.json: {n_cats} categorii / {n_prods} produse grupate + {len(flat_light)} flat ({kb(PROD_SRC)}KB → {kb(PROD_OUT)}KB)")


def gen_nav_index():
    """Index lightweight pentru Navbar (autocomplete) + AnuntAnimat (ticker promotii).
    Folosit pe FIECARE pagina prin layout — economie majora fata de output.json (268KB)."""
    if not os.path.exists(NAV_SRC):
        print(f"  Lipsa: {NAV_SRC} — skip nav-index")
        return
    with open(NAV_SRC, encoding="utf-8") as f:
        magazine = json.load(f)

    index = []
    for m in magazine:
        item = {
            "magazin":      m.get("magazin", ""),
            "logo_url":     m.get("logo_url", ""),
            "are_promotie": bool(m.get("are_promotie")),
            "cod_cupon":    bool(m.get("cod_cupon")),
            "promotii":     [],
        }
        # Doar magazinele cu cod cupon au nevoie de detalii promo (pentru ticker)
        if m.get("cod_cupon") and m.get("promotii"):
            promo = next((p for p in m["promotii"] if p.get("cod_cupon")), m["promotii"][0])
            item["url_afiliat"] = m.get("url_afiliat", "")
            item["promotii"] = [{
                "cod_cupon":    promo.get("cod_cupon", ""),
                "nume":         promo.get("nume", ""),
                "landing_page": promo.get("landing_page", ""),
            }]
        index.append(item)

    with open(NAV_OUT, "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, separators=(",", ":"))

    print(f"  nav-index.json: {len(index)} magazine ({kb(NAV_SRC)}KB → {kb(NAV_OUT)}KB)")


def main():
    print("Generez date lightweight pentru homepage...")
    gen_blog()
    gen_products()
    gen_nav_index()
    print("Gata.")


if __name__ == "__main__":
    main()
