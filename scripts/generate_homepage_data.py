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
import re
import sys
import unicodedata

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

# Override de categorie pentru magazine VERIFICATE manual cu catalog coerent
# (folosit DOAR ca fallback cand titlul produsului nu se clasifica singur).
# Verificat 21.06.2026 din titlurile reale ale feed-ului.
MERCHANT_CAT_OVERRIDE: dict[str, str] = {
    "navstore.ro":           "automotive",   # navigatii auto
    "evomag.ro":             "electronics-itc",
    "gameology.ro":          "games",         # jocuri de societate
    "bookzone.ro":           "books",
    "libris.ro":             "books",
    "reincarcareprepay.ro":  "telecom",       # reincarcari prepay
    "farmec.ro":             "beauty",        # cosmetice Gerovital/Farmec
    "dyfashion.ro":          "fashion",
    "inpuff.ro":             "fashion",
    "nurio.ro":              "babies-kids-toys",  # jucarii + accesorii bebe
    "foglia.ro":             "home-garden",   # chiuvete/baie/bucatarie (NU beauty!)
    "sofiline.ro":           "fashion",
    "sevensins.ro":          "fashion",
    # carturesti.ro feed = figurine/colectii (Funko etc.), NU carti -> games
    "carturesti.ro":         "games",
    # depox.ro: vinde arme/autoaparare (spray paralizant, electrosoc, cutite, baston)
    # + gadgeturi disparate -> EXCLUS complet din homepage (vezi MERCHANT_GRID_BLOCKLIST)
}

# Magazine excluse complet din grid-ul de produse de pe homepage:
# - depox.ro: catalog cu arme/autoaparare, nepotrivit de afisat (mai ales langa "Copii")
# - outfitblack.ro: imagini moarte (zappatos.ro 404) + magazinul se inchide
MERCHANT_GRID_BLOCKLIST = {"depox.ro", "outfitblack.ro"}

# Detectie categorie din TITLUL produsului (sursa PRIMARA — nu magazinul, fiindca
# magazinele multi-categorie bagau tot intr-o singura categorie gresita).
# Ordinea conteaza: prima potrivire castiga. Termenii structurali (baie/bucatarie)
# sunt inainte de beauty ca "Suport gel de dus" sa mearga la Casa, nu la Frumusete.
TITLE_CAT_KEYWORDS: list[tuple[str, list[str]]] = [
    ("automotive",          ["navigatie", "navigatii", "carplay", "android auto", "bmw", "mercedes",
                             "volkswagen", "skoda", "ford", "opel", "toyota", "audi", "renault",
                             "peugeot", "seat", "kia", "hyundai", "dacia", "volvo", "fiat", "honda",
                             "mazda", "porsche", "jeep", "mitsubishi", "suzuki", "nissan", "lexus",
                             "dvd auto", "multimedia auto", "adaptoare 2din", "rama adaptoare",
                             "unitate centrala"]),
    # Casa & baie & bucatarie INAINTE de beauty (capteaza "suport gel de dus", "chiuveta")
    ("home-garden",         ["chiuveta", "lavoar", "vas wc", "capac wc", "baterie lavoar",
                             "baterie bucatarie", "baterie cada", "robinet", "paravan dus",
                             "cabina dus", "palarie dus", "rigola", "ventil", "suport gel",
                             "raft baie", "canapea", "fotoliu", "saltea", "dulap", "covor",
                             "perdea", "lampa", "gradina", "planta", "cuvertura", "patura",
                             "espressor", "cafetiera", "aspirator", "masina de spalat",
                             "masina de cafea", "tigaie", "oala", "set cutite", "mobilier"]),
    ("games",               ["figurina", "funko", "board game", "joc de societate",
                             "carti de joc", "monopoly", "lorcana", "catan", "zaruri",
                             "card sleeves", "set magnetic", "joc de carti", "puzzle 1000"]),
    ("books",               ["carte", "carti", "roman", "literatura", "antologie", "beletristica",
                             "nuvela", "poezie", "memorii", "biografie", "atlas", "dictionar",
                             "editura", "abecedar", "revista"]),
    ("babies-kids-toys",    ["jucarie", "jucarii", "lego", "papusa", "scutec", "biberon", "suzeta",
                             "carucior", "patut", "masinuta", "tablita magnetica", "montessori",
                             "puzzle din lemn", "jucarie motrica"]),
    ("electronics-itc",     ["laptop", "telefon", "tableta", "smartphone", "monitor", "televizor",
                             "casti wireless", "smartwatch", "ssd", "hdd", "placa video", "procesor",
                             "router", "camera foto", "imprimanta", "incarcator", "boxa", "binoclu"]),
    ("fashion",             ["tricou", "rochie", "pantalon", "bluza", "jacheta", "palton", "geaca",
                             "incaltaminte", "pantofi", "adidasi", "ghete", "tenisi", "geanta",
                             "camasa", "fusta", "sacou"]),
    # beauty DUPA home & fashion — termeni neambigui (fara "gel de dus"/"ulei" generic)
    ("beauty",              ["crema", "serum", "parfum", "fond de ten", "ruj", "oja", "mascara",
                             "sampon", "balsam de par", "lotiune", "ulei de fata", "ulei de masaj",
                             "apa micelara", "demachiant", "masca de fata", "fard"]),
    ("sports-outdoors",     ["bicicleta", "trotineta", "role", "schi", "snowboard", "cort",
                             "rucsac sport", "haltera", "banda alergat", "eliptica", "gantere"]),
    # FARA "vitamina" — prindea creme cosmetice (farmec) si le baga gresit la Farmacie
    ("pharma",              ["medicament", "supliment nutritiv", "pastila", "sirop",
                             "bandaj", "termometru", "tensiometru"]),
    ("telecom",             ["reincarcare", "cartela", "abonament telefon"]),
    ("pet-supplies",        ["hrana pisica", "hrana caine", "hrana animale", "zgarda",
                             "lesa", "pat caine", "pat pisica", "nisip pisica"]),
]


def _strip_diacritics(s: str) -> str:
    # ă→a, î/â→i/a, ș→s, ț→t — titlurile romanesti folosesc diacritice,
    # cuvintele-cheie nu; fara normalizare "Cremă" nu se potriveste cu "crema"
    nfkd = unicodedata.normalize("NFKD", s)
    return "".join(c for c in nfkd if not unicodedata.combining(c))

# Pattern pe CUVANT INTREG (\b) per categorie — evita false-positive de substring
# ("romantic"→roman, "matlasat"→atlas, "carter"→carte). Compilat o singura data.
_CAT_PATTERNS = [
    (cat, re.compile(r"\b(?:" + "|".join(re.escape(k) for k in kws) + r")\b"))
    for cat, kws in TITLE_CAT_KEYWORDS
]


def _detect_cat_from_title(title: str) -> str:
    t = _strip_diacritics(title.lower())
    for cat_slug, pat in _CAT_PATTERNS:
        if pat.search(t):
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

    def _mkey(p: dict) -> str:
        return (p.get("merchant") or p.get("merchant_slug") or "").lower().rstrip("/")

    # is_promo=True = banner generic de campanie (logo magazin reutilizat ca "imagine produs"),
    # NU un produs real cu poza proprie — excluse explicit, altfel arata stricat in grid.
    # MERCHANT_GRID_BLOCKLIST: magazine excluse complet (arme/imagini moarte).
    def _titlu_ok(p: dict) -> bool:
        t = (p.get("title") or "").strip().lower()
        if len(t) < 6:            # "Open", titluri trunchiate/goale
            return False
        if "voucher" in t or "card cadou" in t or "resigilat" in t:
            return False          # nu-s produse reale de afisat in grid
        return True

    valide = [
        p for p in products
        if p.get("image") and (p.get("price") or 0) > 0 and not p.get("is_promo")
        and _mkey(p) not in MERCHANT_GRID_BLOCKLIST and _titlu_ok(p)
    ]

    # Clasificare PER-TITLU (primara) — magazinul doar ca fallback verificat manual.
    # Asa magazinele multi-categorie (foglia=baie, carturesti=figurine) nu mai baga
    # tot intr-o categorie gresita. Produsele neclasificabile raman "other" -> excluse.
    for p in valide:
        by_title = _detect_cat_from_title(p.get("title", ""))
        if by_title != "other":
            p["_cat"] = by_title
        else:
            p["_cat"] = (
                MERCHANT_CAT_OVERRIDE.get(_mkey(p))
                or MERCHANT_CAT_OVERRIDE.get((p.get("merchant_slug") or "").lower())
                or "other"
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
