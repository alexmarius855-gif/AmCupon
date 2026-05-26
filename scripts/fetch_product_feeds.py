"""
fetch_product_feeds.py — Produse din 2Performant via API
=========================================================
Endpoint-uri corecte:
  GET /affiliate/product_feeds.json          → lista feed-uri disponibile
  GET /affiliate/product_feeds/{id}/products.json → produse dintr-un feed

Autentificare: DeviseTokenAuth (se reutilizeaza sesiunea din fetch_2p_api.py)
Salveaza in frontend/public/products.json
"""

import json
import os
import time
import hashlib
import re
from datetime import datetime, timezone
from urllib.parse import quote, unquote

import requests as req_lib
from requests.adapters import HTTPAdapter

# ─── Sesiune HTTP ─────────────────────────────────────────────────────────────

_session = req_lib.Session()
_session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "Content-Type": "application/json",
})
_session.mount("https://", HTTPAdapter(max_retries=2))

BASE_URL        = "https://api.2performant.com"
AFF_CODE        = os.environ.get("TWOPEFORMANT_USER", "541547473")
AFFILIATE_EMAIL = os.environ.get("TWOPEFORMANT_EMAIL", "")
AFFILIATE_PASS  = os.environ.get("TWOPEFORMANT_PASS", "")

MAX_FEEDS          = 30    # feeds de procesat
MAX_PRODUCTS_FEED  = 100   # produse per feed
MAX_TOTAL          = 2000  # total produse

_auth = {"access-token": "", "client": "", "uid": ""}


# ─── Autentificare ─────────────────────────────────────────────────────────────

def sign_in() -> bool:
    global _auth
    if not AFFILIATE_EMAIL or not AFFILIATE_PASS:
        print("  ⚠️  TWOPEFORMANT_EMAIL / TWOPEFORMANT_PASS nu sunt setate.")
        return False

    url     = f"{BASE_URL}/users/sign_in.json"
    payload = {"user": {"email": AFFILIATE_EMAIL, "password": AFFILIATE_PASS}}
    print(f"  → POST {url} (email={AFFILIATE_EMAIL[:4]}***)")

    try:
        resp = _session.post(url, json=payload, timeout=15)
        print(f"    HTTP {resp.status_code}")
        if resp.status_code != 200:
            print(f"    Body: {resp.text[:300]}")
            return False

        _auth["access-token"] = resp.headers.get("access-token", "")
        _auth["client"]       = resp.headers.get("client", "")
        _auth["uid"]          = resp.headers.get("uid", "")

        if not _auth["access-token"]:
            data = resp.json()
            user = data.get("data", data.get("user", {}))
            _auth["access-token"] = user.get("access-token", "")
            _auth["client"]       = user.get("client", "")
            _auth["uid"]          = user.get("uid", AFFILIATE_EMAIL)

        print(f"    ✅ Login reusit — uid={_auth['uid']}")
        return True
    except Exception as e:
        print(f"  ❌ Eroare login: {e}")
        return False


def _headers() -> dict:
    return {
        "access-token": _auth["access-token"],
        "client":       _auth["client"],
        "uid":          _auth["uid"],
        "token-type":   "Bearer",
    }


def _update_tokens(resp: req_lib.Response):
    new = resp.headers.get("access-token", "")
    if new:
        _auth["access-token"] = new
        _auth["client"]       = resp.headers.get("client", _auth["client"])
        _auth["uid"]          = resp.headers.get("uid", _auth["uid"])


def api_get(endpoint: str, params: dict = None) -> dict | list | None:
    params = params or {}
    qs = "&".join(f"{k}={v}" for k, v in sorted(params.items()))
    url = f"{BASE_URL}/{endpoint}.json"
    if qs:
        url += f"?{qs}"
    try:
        resp = _session.get(url, headers=_headers(), timeout=20)
        _update_tokens(resp)
        if resp.status_code == 401:
            print(f"    ⚠️  401 Unauthorized")
            return None
        if resp.status_code != 200:
            print(f"    HTTP {resp.status_code}: {resp.text[:200]}")
            return None
        return resp.json()
    except Exception as e:
        print(f"  ❌ Eroare {endpoint}: {e}")
        return None


# ─── Utilitare ────────────────────────────────────────────────────────────────

def make_afiliat_url(url: str) -> str:
    if not url:
        return url
    url_curat = unquote(url.strip())
    unique    = hashlib.md5(url_curat.encode()).hexdigest()[:9]
    encoded   = quote(url_curat, safe="")
    return (f"https://event.2performant.com/events/click"
            f"?ad_type=quicklink&aff_code={AFF_CODE}"
            f"&unique={unique}&redirect_to={encoded}")


def build_slug_map() -> dict:
    """Construieste harta slug -> canonical din output.json."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root  = os.path.dirname(script_dir)
    path = os.path.join(repo_root, "frontend", "public", "output.json")
    slug_map: dict[str, str] = {}
    if not os.path.exists(path):
        return slug_map
    try:
        with open(path, encoding="utf-8") as f:
            magazine = json.load(f)
        for m in magazine:
            slug = m.get("magazin", "")
            if slug:
                slug_map[slug.lower()] = slug
                slug_map[slug.split(".")[0].lower()] = slug
    except Exception:
        pass
    return slug_map


def _parse_price(val) -> float:
    """Extrage float din string sau numar."""
    if not val:
        return 0.0
    if isinstance(val, (int, float)):
        return float(val)
    clean = re.sub(r"[^\d.,]", "", str(val).replace(",", "."))
    parts = clean.split(".")
    if len(parts) > 2:
        clean = "".join(parts[:-1]) + "." + parts[-1]
    try:
        return float(clean) if clean else 0.0
    except ValueError:
        return 0.0


def get_image(product: dict) -> str:
    """Extrage URL imagine din campul structured_image_urls sau image."""
    imgs = product.get("structured_image_urls", {})
    if isinstance(imgs, dict):
        # Preferam 300x300 > original > orice
        for size in ["300x300", "500x500", "200x200", "original"]:
            if size in imgs:
                return imgs[size] or ""
        vals = [v for v in imgs.values() if v]
        if vals:
            return vals[0]
    return product.get("image_url", "") or product.get("image", "") or ""


# ─── Fetch feed-uri si produse ────────────────────────────────────────────────

def get_product_feeds() -> list:
    """Obtine lista feed-urilor disponibile."""
    feeds = []
    page = 1
    while len(feeds) < MAX_FEEDS:
        data = api_get("affiliate/product_feeds", {"page": page, "per_page": 50})
        if data is None:
            break

        items = data if isinstance(data, list) else next(
            (v for v in data.values() if isinstance(v, list)), []
        )
        if not items:
            break

        feeds.extend(items)
        print(f"  Pagina {page}: {len(items)} feed-uri ({len(feeds)} total)")
        if len(items) < 50:
            break
        page += 1
        time.sleep(0.3)

    return feeds[:MAX_FEEDS]


def get_products_from_feed(feed_id, merchant_name: str) -> list:
    """Descarca produsele dintr-un feed via API."""
    products = []
    page = 1
    while len(products) < MAX_PRODUCTS_FEED:
        data = api_get(
            f"affiliate/product_feeds/{feed_id}/products",
            {"page": page, "per_page": 50}
        )
        if data is None:
            break

        items = data if isinstance(data, list) else next(
            (v for v in data.values() if isinstance(v, list)), []
        )
        if not items:
            break

        for prod in items:
            title  = prod.get("title", "") or ""
            url    = prod.get("url", "") or ""
            brand  = prod.get("brand", "") or ""
            cat    = prod.get("category", "") or prod.get("subcategory", "") or ""
            price  = _parse_price(prod.get("price"))
            image  = get_image(prod)

            if not title or not url:
                continue
            if not image and price == 0:
                continue

            products.append({
                "title":        title[:120],
                "url":          make_afiliat_url(url),
                "url_original": url,
                "image":        image,
                "price":        price,
                "old_price":    None,
                "discount_pct": 0,
                "category":     cat[:50],
                "brand":        brand[:50],
                "merchant":     merchant_name,
                "feed_id":      feed_id,
            })

        if len(items) < 50 or len(products) >= MAX_PRODUCTS_FEED:
            break
        page += 1
        time.sleep(0.2)

    return products[:MAX_PRODUCTS_FEED]


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    print("Fetch product feeds 2Performant (API)...")
    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root  = os.path.dirname(script_dir)
    output_path = os.path.join(repo_root, "frontend", "public", "products.json")

    if not AFFILIATE_EMAIL:
        print("  ⚠️  TWOPEFORMANT_EMAIL nu e setat — skip product feeds.")
        return

    print("\n[1/3] Login...")
    if not sign_in():
        print("  ❌ Login esuat.")
        return

    slug_map = build_slug_map()
    print(f"  Slug map: {len(slug_map)} intrari")

    print("\n[2/3] Obtin lista feed-uri...")
    feeds = get_product_feeds()
    print(f"  {len(feeds)} feed-uri disponibile")

    print(f"\n[3/3] Descarc produse din {len(feeds)} feed-uri...")
    all_products = []
    for feed in feeds:
        if len(all_products) >= MAX_TOTAL:
            break

        feed_id   = feed.get("id", "")
        feed_name = feed.get("name", "") or ""
        prog      = feed.get("program", {}) or {}
        merchant  = prog.get("name", "") or prog.get("slug", "") or feed_name

        print(f"  Feed '{feed_name}' ({merchant}, id={feed_id})...")
        products = get_products_from_feed(feed_id, merchant)

        # Adauga merchant_slug
        mn = merchant.strip().lower()
        for p in products:
            slug = slug_map.get(mn, slug_map.get(mn.split(".")[0], mn))
            p["merchant_slug"] = slug

        all_products.extend(products)
        print(f"    → {len(products)} produse (total: {len(all_products)})")
        time.sleep(0.5)

    # Sorteaza dupa pret crescator (fara discount disponibil din API)
    all_products.sort(key=lambda x: x.get("price", 0) or 0)
    all_products = all_products[:MAX_TOTAL]

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({
            "updated":  datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "count":    len(all_products),
            "products": all_products,
        }, f, ensure_ascii=False, indent=2)

    cu_imagine = sum(1 for p in all_products if p.get("image"))
    print(f"\n✅ Gata! {len(all_products)} produse salvate in products.json")
    print(f"   {cu_imagine} cu imagine")


if __name__ == "__main__":
    import sys
    print(f"Python {sys.version}")
    try:
        main()
    except Exception as e:
        import traceback
        print(f"\nFATAL: {e}")
        traceback.print_exc()
        print("\nScript esuat — continuam fara produse noi.")
        sys.exit(0)
