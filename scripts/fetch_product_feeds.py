"""
Fetch product feeds din 2Performant.
Extrage produse cu discount si le salveaza in frontend/public/products.json.
Ruleaza dupa process_data.py in GitHub Actions.
"""

import json
import os
import sys
import hashlib
import hmac
import time
import re
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from urllib.parse import urlencode, quote, unquote

import requests as req_lib
from requests.adapters import HTTPAdapter

_BROWSER = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept-Language": "ro-RO,ro;q=0.9,en-US;q=0.8",
}
_session = req_lib.Session()
_session.headers.update(_BROWSER)
_session.mount("https://", HTTPAdapter(max_retries=2))

AFF_CODE = "541547473"
BASE_URL = "https://api.2performant.com"
AFFILIATE_USERNAME = os.environ.get("TWOPEFORMANT_USER", "")
AFFILIATE_TOKEN = os.environ.get("TWOPEFORMANT_TOKEN", "")

MAX_PRODUCTS_PER_FEED = 80
MAX_TOTAL_PRODUCTS = 2000
OUTPUT_FILE = "../frontend/public/products.json"


def make_afiliat_url(url):
    if not url or not isinstance(url, str):
        return url
    url_curat = unquote(url.strip())
    unique = hashlib.md5(url_curat.encode()).hexdigest()[:9]
    encoded_url = quote(url_curat, safe="")
    return (f"https://event.2performant.com/events/click"
            f"?ad_type=quicklink&aff_code={AFF_CODE}"
            f"&unique={unique}&redirect_to={encoded_url}")


def twopeformant_auth_headers(method, api_name, params=None):
    """Genereaza headerele de autentificare 2Performant."""
    if not AFFILIATE_USERNAME or not AFFILIATE_TOKEN:
        return {}
    date_str = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    qs = unquote(urlencode(sorted((params or {}).items()))) if params else ""
    qs_part = f"?{qs}" if qs else "/"
    string_to_sign = f"{method}{api_name}/{qs_part}{AFFILIATE_USERNAME}{date_str}"
    signature = hmac.new(
        AFFILIATE_TOKEN.encode(), string_to_sign.encode(), "sha1"
    ).hexdigest()
    return {
        "X-2PF-Client": AFFILIATE_USERNAME,
        "X-2PF-Auth": signature,
        "X-2PF-Date": date_str,
        "Accept": "application/json",
    }


def build_slug_map():
    """Construieste o harta din numele programului -> slug magazin (din output.json)."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.dirname(script_dir)
    output_path = os.path.join(repo_root, "frontend", "public", "output.json")
    slug_map = {}
    if os.path.exists(output_path):
        try:
            with open(output_path, encoding="utf-8") as f:
                magazine = json.load(f)
            for m in magazine:
                slug = m.get("magazin", "")
                if not slug:
                    continue
                slug_map[slug.lower()] = slug
                base = slug.split(".")[0].lower()
                slug_map[base] = slug
        except Exception:
            pass
    return slug_map


def match_merchant_slug(merchant_name, slug_map):
    """Gaseste slug-ul corect pentru un merchant name."""
    if not merchant_name:
        return merchant_name.lower() if merchant_name else ""
    nl = merchant_name.strip().lower()
    if nl in slug_map:
        return slug_map[nl]
    clean = re.sub(r"[^a-z0-9.]", "", nl)
    if clean in slug_map:
        return slug_map[clean]
    first = nl.split()[0] if " " in nl else nl
    if first in slug_map:
        return slug_map[first]
    for tld in [".ro", ".com", ".eu"]:
        cand = nl.replace(" ", "") + tld
        if cand in slug_map:
            return slug_map[cand]
    return nl


def get_program_feeds():
    """Obtine lista de feed-uri disponibile de la programele afiliate."""
    try:
        params = {"page": 1, "per_page": 100}
        headers = twopeformant_auth_headers("GET", "affiliate-programs", params)
        if not headers:
            print("  Nu sunt credentiale 2Performant configurate.")
            return []
        qs = urlencode(sorted(params.items()))
        url = f"{BASE_URL}/affiliate-programs/?{qs}"
        resp = _session.get(url, headers=headers, timeout=15)
        if resp.status_code != 200:
            print(f"  HTTP {resp.status_code}: {resp.text[:200]}")
            return []
        data = resp.json()
        programs = data.get("results", data if isinstance(data, list) else [])
        feeds = []
        for prog in programs:
            feed_url = prog.get("product_feed_url") or prog.get("feed_url")
            if feed_url:
                feeds.append({
                    "merchant": prog.get("name", ""),
                    "feed_url": feed_url,
                    "program_id": prog.get("id"),
                })
        print(f"  {len(feeds)} feed-uri gasite din {len(programs)} programe")
        return feeds
    except Exception as e:
        print(f"  Eroare la obtinerea feed-urilor: {e}")
        return []


def parse_xml_feed(xml_content, merchant_name, program_id):
    """Parseaza un feed XML/RSS si extrage produsele cu discount."""
    products = []
    try:
        root = ET.fromstring(xml_content)
        ns = {"g": "http://base.google.com/ns/1.0"}

        # Suport pentru Google Product Feed format si format simplu
        items = root.findall(".//item") or root.findall(".//product")
        if not items:
            # Incearca namespace Google
            items = root.findall(".//{http://base.google.com/ns/1.0}item")

        for item in items[:MAX_PRODUCTS_PER_FEED]:
            def get_field(*names):
                for name in names:
                    el = item.find(name) or item.find(f"g:{name}", ns)
                    if el is not None and el.text:
                        return el.text.strip()
                return ""

            title = get_field("title", "name", "g:title")
            url = get_field("link", "url", "product_url", "g:link")
            image = get_field("image_link", "image", "img", "g:image_link")
            price_str = get_field("price", "sale_price", "g:price", "g:sale_price")
            old_price_str = get_field("original_price", "regular_price", "g:original_price")
            category = get_field("category", "product_category", "g:product_category")
            brand = get_field("brand", "g:brand")

            if not title or not url:
                continue

            # Extrage valori numerice din pret
            price = _parse_price(price_str)
            old_price = _parse_price(old_price_str)

            # Calculeaza discount
            discount_pct = 0
            if price and old_price and old_price > price:
                discount_pct = round((1 - price / old_price) * 100)

            # Filtreaza produsele relevante (cu discount sau imagine)
            if not image and discount_pct == 0:
                continue

            products.append({
                "title": title[:120],
                "url": make_afiliat_url(url),
                "url_original": url,
                "image": image,
                "price": price,
                "old_price": old_price if old_price > price else None,
                "discount_pct": discount_pct,
                "category": category[:50] if category else "",
                "brand": brand[:50] if brand else "",
                "merchant": merchant_name,
                "program_id": program_id,
            })

    except ET.ParseError as e:
        print(f"  Eroare XML parse: {e}")
    return products


def _parse_price(price_str):
    """Extrage valoarea numerica dintr-un string de pret."""
    if not price_str:
        return 0
    # Elimina simboluri valuta si text
    clean = re.sub(r"[^\d.,]", "", price_str.replace(",", "."))
    # Ia ultima valoare dupa punct/virgula
    parts = clean.split(".")
    if len(parts) > 2:
        clean = "".join(parts[:-1]) + "." + parts[-1]
    try:
        return float(clean) if clean else 0
    except ValueError:
        return 0


def fetch_and_parse_feed(feed_info):
    """Descarca si parseaza un feed."""
    merchant = feed_info["merchant"]
    feed_url = feed_info["feed_url"]
    program_id = feed_info["program_id"]

    try:
        feed_resp = _session.get(feed_url, timeout=15)
        feed_resp.raise_for_status()
        content = feed_resp.content
        products = parse_xml_feed(content, merchant, program_id)
        print(f"  {merchant}: {len(products)} produse extrase")
        return products
    except Exception as e:
        print(f"  {merchant}: Eroare la fetch - {e}")
        return []


def load_existing_products():
    """Incarca produsele existente."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.dirname(script_dir)
    output_path = os.path.join(repo_root, OUTPUT_FILE.lstrip("../"))
    if os.path.exists(output_path):
        with open(output_path, encoding="utf-8") as f:
            return json.load(f), output_path
    return [], output_path


def main():
    print("Fetching 2Performant product feeds...")
    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.dirname(script_dir)
    output_path = os.path.join(repo_root, "frontend", "public", "products.json")

    slug_map = build_slug_map()
    print(f"  Slug map: {len(slug_map)} intrari din output.json")

    feeds = get_program_feeds()

    all_products = []
    for feed in feeds:
        if len(all_products) >= MAX_TOTAL_PRODUCTS:
            break
        products = fetch_and_parse_feed(feed)
        # Adauga merchant_slug la fiecare produs
        for p in products:
            p["merchant_slug"] = match_merchant_slug(p.get("merchant", ""), slug_map)
        all_products.extend(products)
        time.sleep(0.5)  # Rate limiting

    # Sorteaza dupa discount descrescator
    all_products.sort(key=lambda x: x.get("discount_pct", 0), reverse=True)
    all_products = all_products[:MAX_TOTAL_PRODUCTS]

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({
            "updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "count": len(all_products),
            "products": all_products,
        }, f, ensure_ascii=False, indent=2)

    print(f"\nGata! {len(all_products)} produse salvate in products.json")

    # Statistici
    cu_discount = [p for p in all_products if p.get("discount_pct", 0) > 0]
    cu_imagine = [p for p in all_products if p.get("image")]
    print(f"  {len(cu_discount)} cu discount")
    print(f"  {len(cu_imagine)} cu imagine")


if __name__ == "__main__":
    main()
