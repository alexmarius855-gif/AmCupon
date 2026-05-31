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
N_PROD_TOTAL    = 24
N_PROD_PER_SHOP = 12  # max produse per merchant (homepage afiseaza pana la 12)


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


def gen_products():
    if not os.path.exists(PROD_SRC):
        print(f"  Lipsa: {PROD_SRC} — skip produse")
        return
    with open(PROD_SRC, encoding="utf-8") as f:
        data = json.load(f)
    products = data.get("products", data) if isinstance(data, dict) else data

    valide = [p for p in products if p.get("image") and (p.get("price") or 0) > 0]

    # Grupare per merchant pentru varietate
    by_merchant: dict[str, list] = {}
    for p in valide:
        m = p.get("merchant_slug") or p.get("merchant") or "alt"
        by_merchant.setdefault(m, []).append(p)

    # Din fiecare merchant ia cele cu discount mare / pret mare
    pool = []
    for m, prods in by_merchant.items():
        prods.sort(key=lambda x: (-(x.get("discount_pct") or 0), -(x.get("price") or 0)))
        pool.extend(prods[:N_PROD_PER_SHOP])

    # Sorteaza global dupa discount si taie la N_PROD_TOTAL
    pool.sort(key=lambda x: -(x.get("discount_pct") or 0))
    pool = pool[:N_PROD_TOTAL]

    # Pastreaza doar campurile folosite pe homepage
    light = [
        {
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
        for p in pool
    ]

    with open(PROD_OUT, "w", encoding="utf-8") as f:
        json.dump(light, f, ensure_ascii=False, separators=(",", ":"))

    print(f"  products-home.json: {len(light)} produse ({kb(PROD_SRC)}KB → {kb(PROD_OUT)}KB)")


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
