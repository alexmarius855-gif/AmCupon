"""
fetch_product_feeds.py — Produse din 2Performant via feed-uri directe XML/CSV
=============================================================================
STRATEGIE: Descarcam direct URL-ul XML/CSV al feed-ului (camp 'url' in API),
NU endpoint-ul API care nu are imagini.

Feed-uri cu imagini confirmate:
  libris.ro      247k produse  (XML Google Shopping)
  ozone.ro       144k produse  (XML Google Shopping)
  vidaxl.ro      278k produse  (XML)
  automobilus.ro 1M+  produse  (XML)
  navstore.ro     11k produse  (XML)
  bobaro.ro      199k produse

Autentificare: DeviseTokenAuth
Output: frontend/public/products.json
"""

import csv
import gzip
import hashlib
import io
import json
import os
import re
import time
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from urllib.parse import quote, unquote

import requests as req_lib
from requests.adapters import HTTPAdapter

# ─── Config ──────────────────────────────────────────────────────────────────

BASE_URL        = "https://api.2performant.com"
AFF_CODE        = os.environ.get("TWOPEFORMANT_USER", "541547473")
AFFILIATE_EMAIL = os.environ.get("TWOPEFORMANT_EMAIL", "")
AFFILIATE_PASS  = os.environ.get("TWOPEFORMANT_PASS", "")

MAX_FEEDS             = 60     # max feed-uri de procesat
MAX_PRODUCTS_PER_FEED = 3000   # max produse per feed
MAX_PER_MERCHANT      = 3000   # max produse per merchant in output final
MAX_TOTAL             = 40000  # max produse total
DOWNLOAD_TIMEOUT      = 120    # secunde pentru download feed
CHUNK_SIZE            = 1024 * 512  # 512KB per chunk

# ─── Normalizare categorie → slug standard ────────────────────────────────────
# Mapat din textul brut al feed-ului catre slug-uri URL-friendly
CATEGORY_SLUG_MAP: dict = {
    # Fashion
    "fashion": "fashion", "imbracaminte": "fashion", "clothing": "fashion",
    "haine": "fashion", "bluze": "fashion", "tricouri": "fashion",
    "pantaloni": "fashion", "rochii": "fashion", "fuste": "fashion",
    "jachete": "fashion", "paltoane": "fashion", "geci": "fashion",
    "incaltaminte": "fashion", "pantofi": "fashion", "ghete": "fashion",
    "sneakers": "fashion", "shoes": "fashion", "boots": "fashion",
    "genti": "fashion", "genta": "fashion", "bags": "fashion",
    "accesorii": "fashion", "ceasuri": "fashion", "watches": "fashion",
    "bijuterii moda": "fashion", "lenjerie": "fashion", "swimwear": "fashion",
    "mode": "fashion", "vêtements": "fashion",
    # Electronics
    "electronice": "electronice", "electronics": "electronice",
    "telefoane": "electronice", "smartphone": "electronice", "phones": "electronice",
    "laptop": "electronice", "laptopuri": "electronice", "laptops": "electronice",
    "tablete": "electronice", "tablets": "electronice",
    "calculatoare": "electronice", "computers": "electronice",
    "tv": "electronice", "televizoare": "electronice", "television": "electronice",
    "audio": "electronice", "casti": "electronice", "headphones": "electronice",
    "camere foto": "electronice", "aparate foto": "electronice", "cameras": "electronice",
    "it": "electronice", "tech": "electronice", "gadget": "electronice",
    "electrocasnice": "electronice", "small appliances": "electronice",
    "imprimante": "electronice", "printers": "electronice",
    "monitoare": "electronice", "monitors": "electronice",
    "console": "electronice", "gaming peripherals": "electronice",
    # Beauty
    "beauty": "beauty", "frumusete": "beauty", "cosmetice": "beauty",
    "parfumuri": "beauty", "parfum": "beauty", "perfume": "beauty", "fragrance": "beauty",
    "skincare": "beauty", "ingrijire ten": "beauty", "ingrijire piele": "beauty",
    "makeup": "beauty", "machiaj": "beauty", "fard": "beauty",
    "ingrijire par": "beauty", "hair care": "beauty", "haircare": "beauty",
    "ingrijire corp": "beauty", "body care": "beauty",
    "produse cosmetice": "beauty", "cosmetics": "beauty",
    "sanatate si frumusete": "beauty", "health & beauty": "beauty",
    # Sport
    "sport": "sport", "sports": "sport", "fitness": "sport",
    "outdoor": "sport", "camping": "sport", "hiking": "sport",
    "ciclism": "sport", "biciclete": "sport", "cycling": "sport",
    "fotbal": "sport", "tenis": "sport", "inot": "sport",
    "echipament sportiv": "sport", "sportswear": "sport",
    "sala de sport": "sport", "gym": "sport", "antrenament": "sport",
    "rulare": "sport", "running": "sport",
    # Casa si Gradina
    "casa": "casa", "home": "casa", "gradina": "casa", "garden": "casa",
    "mobila": "casa", "furniture": "casa", "mobilier": "casa",
    "decoratiuni": "casa", "decor": "casa", "home decor": "casa",
    "bucatarie": "casa", "kitchen": "casa", "ustensile bucatarie": "casa",
    "baie": "casa", "bathroom": "casa", "bedding": "casa",
    "unelte": "casa", "tools": "casa", "bricolaj": "casa",
    "iluminat": "casa", "lighting": "casa", "perdele": "casa",
    "electrocasnice mari": "casa", "appliances": "casa",
    # Copii
    "copii": "copii", "jucarii": "copii", "toys": "copii",
    "bebelusi": "copii", "baby": "copii", "babies": "copii",
    "kids": "copii", "children": "copii",
    "educatie": "copii", "educational": "copii",
    "imbracaminte copii": "copii", "kids fashion": "copii",
    "carucioare": "copii", "puericultura": "copii",
    # Farmacie / Sanatate
    "farmacie": "farmacie", "pharmacy": "farmacie",
    "sanatate": "farmacie", "health": "farmacie", "healthcare": "farmacie",
    "medicamente": "farmacie", "vitamins": "farmacie", "vitamine": "farmacie",
    "suplimente": "farmacie", "supplements": "farmacie",
    "medical": "farmacie", "medicina": "farmacie",
    "dieta": "farmacie", "nutritie": "farmacie", "nutrition": "farmacie",
    "produse naturale": "farmacie", "natural products": "farmacie",
    # Carti
    "carte": "carti", "carti": "carti", "book": "carti", "books": "carti",
    "literatura": "carti", "fiction": "carti", "nonfiction": "carti",
    "manuale": "carti", "educational books": "carti",
    "e-books": "carti", "audiobooks": "carti",
    "muzica": "carti", "cd": "carti", "dvd": "carti",
    # Auto / Moto
    "auto": "auto", "moto": "auto", "automotive": "auto",
    "piese auto": "auto", "car parts": "auto", "accesorii auto": "auto",
    "car accessories": "auto", "anvelope": "auto", "tires": "auto",
    "uleiuri": "auto", "lubricants": "auto",
    "motociclete": "auto", "motorcycles": "auto",
    # Animale
    "animale": "animale", "pets": "animale", "pet": "animale",
    "animale de companie": "animale", "caini": "animale", "pisici": "animale",
    "dog": "animale", "cat": "animale", "aquarium": "animale",
    "hrana animale": "animale", "pet food": "animale",
    # Alimente / Supermarket
    "alimente": "alimente", "food": "alimente", "grocery": "alimente",
    "supermarket": "alimente", "bauturi": "alimente", "drinks": "alimente",
    "cafea": "alimente", "coffee": "alimente", "ceai": "alimente",
    "vinuri": "alimente", "wine": "alimente", "alcool": "alimente",
    "bio": "alimente", "organic": "alimente",
    # Bijuterii
    "bijuterii": "bijuterii", "jewelry": "bijuterii", "jewellery": "bijuterii",
    "inele": "bijuterii", "coliere": "bijuterii", "bratari": "bijuterii",
    "cercei": "bijuterii", "aur": "bijuterii", "argint": "bijuterii",
    # Jocuri
    "jocuri": "jocuri", "games": "jocuri", "gaming": "jocuri",
    "video games": "jocuri", "jocuri video": "jocuri",
    "board games": "jocuri", "jocuri de societate": "jocuri",
}


MERCHANT_SLUG_FALLBACK: dict = {
    "navstore":     "auto",
    "automobilus":  "auto",
    "outfitblack":  "fashion",
    "sevensins":    "fashion",
    "depox":        "fashion",
    "epantofi":     "fashion",
    "answear":      "fashion",
    "fashiondays":  "fashion",
    "fashion-days": "fashion",
    "zara":         "fashion",
    "hm.com":       "fashion",
    "libris":       "carti",
    "elefant":      "carti",
    "noriel":       "copii",
    "farmacia-tei": "farmacie",
    "secom":        "farmacie",
    "drhobe":       "farmacie",
    "altex":        "electronice",
    "pcgarage":     "electronice",
    "evomag":       "electronice",
    "quickmobile":  "electronice",
    "emag":         "electronice",
    "flanco":       "electronice",
    "vidaxl":       "casa",
    "leroy":        "casa",
    "bricodepot":   "casa",
    "sportisimo":   "sport",
    "decathlon":    "sport",
    "hervis":       "sport",
}


def normalize_cat_slug(raw_cat: str, merchant: str = "") -> str:
    """Normalizeaza categoria bruta din feed catre un slug standard."""
    if raw_cat:
        c = raw_cat.lower().strip()
        # Match direct
        if c in CATEGORY_SLUG_MAP:
            return CATEGORY_SLUG_MAP[c]
        # Match partial (cauta keyword in categoria bruta)
        for key, slug in CATEGORY_SLUG_MAP.items():
            if key in c:
                return slug
        # Match invers (categoria bruta in keyword)
        for key, slug in CATEGORY_SLUG_MAP.items():
            if len(key) > 4 and c in key:
                return slug
    # Fallback pe baza merchant-ului
    if merchant:
        m = merchant.lower()
        for key, slug in MERCHANT_SLUG_FALLBACK.items():
            if key in m:
                return slug
    return "altele"

# Namespace Google Shopping XML
NS = {"g": "http://base.google.com/ns/1.0"}

# ─── Sesiune HTTP ─────────────────────────────────────────────────────────────

_session = req_lib.Session()
_session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0",
    "Accept":     "application/json",
    "Content-Type": "application/json",
})
_session.mount("https://", HTTPAdapter(max_retries=2))
_session.mount("http://",  HTTPAdapter(max_retries=2))

_auth = {"access-token": "", "client": "", "uid": ""}

# ─── Autentificare ─────────────────────────────────────────────────────────────

def sign_in() -> bool:
    global _auth
    if not AFFILIATE_EMAIL or not AFFILIATE_PASS:
        print("  TWOPEFORMANT_EMAIL / TWOPEFORMANT_PASS nu sunt setate.")
        return False

    url     = f"{BASE_URL}/users/sign_in.json"
    payload = {"user": {"email": AFFILIATE_EMAIL, "password": AFFILIATE_PASS}}
    print(f"  -> POST {url} (email={AFFILIATE_EMAIL[:4]}***)")

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

        print(f"    OK Login reusit — uid={_auth['uid']}")
        return True
    except Exception as e:
        print(f"  EROARE login: {e}")
        return False


def _auth_headers() -> dict:
    return {
        "access-token": _auth["access-token"],
        "client":       _auth["client"],
        "uid":          _auth["uid"],
        "token-type":   "Bearer",
    }


def _update_tokens(resp):
    new = resp.headers.get("access-token", "")
    if new:
        _auth["access-token"] = new
        _auth["client"]       = resp.headers.get("client", _auth["client"])
        _auth["uid"]          = resp.headers.get("uid", _auth["uid"])


def api_get(endpoint: str, params: dict = None):
    params = params or {}
    qs = "&".join(f"{k}={v}" for k, v in sorted(params.items()))
    url = f"{BASE_URL}/{endpoint}.json"
    if qs:
        url += f"?{qs}"
    try:
        resp = _session.get(url, headers=_auth_headers(), timeout=20)
        _update_tokens(resp)
        if resp.status_code == 401:
            print(f"    401 Unauthorized")
            return None
        if resp.status_code != 200:
            print(f"    HTTP {resp.status_code}: {resp.text[:200]}")
            return None
        return resp.json()
    except Exception as e:
        print(f"  EROARE {endpoint}: {e}")
        return None


# ─── Utilitare ────────────────────────────────────────────────────────────────

# Token quicklink REAL al afiliatului — universal, merge pe orice magazin.
# NU md5 (da notoolerror). Bug reparat 01.06.2026.
QUICKLINK_UNIQUE = "bb3071a7d"


def make_afiliat_url(url: str) -> str:
    if not url:
        return url
    url_curat = unquote(url.strip())
    encoded   = quote(url_curat, safe="")
    return (f"https://event.2performant.com/events/click"
            f"?ad_type=quicklink&aff_code={AFF_CODE}"
            f"&unique={QUICKLINK_UNIQUE}&redirect_to={encoded}")


def _parse_price(val) -> float:
    if not val:
        return 0.0
    if isinstance(val, (int, float)):
        return float(val)
    # Sterge tot ce nu e cifra, punct sau virgula
    clean = re.sub(r"[^\d.,]", "", str(val))
    # Normalizeaza: 1.234,56 -> 1234.56 sau 1,234.56 -> 1234.56
    if "," in clean and "." in clean:
        if clean.rindex(",") > clean.rindex("."):
            clean = clean.replace(".", "").replace(",", ".")
        else:
            clean = clean.replace(",", "")
    elif "," in clean:
        clean = clean.replace(",", ".")
    try:
        v = float(clean) if clean else 0.0
        return v if v < 1_000_000 else 0.0  # sanity check
    except ValueError:
        return 0.0


def build_slug_map() -> dict:
    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root  = os.path.dirname(script_dir)
    path = os.path.join(repo_root, "frontend", "public", "output.json")
    slug_map: dict = {}
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


# ─── Feed list ────────────────────────────────────────────────────────────────

def get_product_feeds() -> list:
    feeds = []
    page  = 1
    while len(feeds) < MAX_FEEDS * 3:
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
    return feeds


def _get_feed_url(feed: dict) -> str:
    """Extrage URL-ul direct de download al feed-ului."""
    # Incearca campuri comune
    for camp in ["url", "feed_url", "file_url", "download_url", "source_url"]:
        val = feed.get(camp, "")
        if val and val.startswith("http"):
            return val
    # Cauta si in sub-obiecte
    for key in ["program", "advertiser"]:
        obj = feed.get(key, {}) or {}
        for camp in ["feed_url", "url"]:
            val = obj.get(camp, "")
            if val and val.startswith("http"):
                return val
    return ""


# ─── Parsare XML Google Shopping (streaming) ──────────────────────────────────

def _xml_text(el, tag: str, ns_prefix: str = "") -> str:
    """Extrage text din element XML, cu sau fara namespace."""
    if ns_prefix:
        child = el.find(f"{ns_prefix}:{tag}", NS)
    else:
        child = el.find(tag)
    if child is None:
        child = el.find(f"g:{tag}", NS)
    if child is None:
        child = el.find(tag)
    return (child.text or "").strip() if child is not None else ""


def parse_xml_feed(content: bytes, merchant: str, feed_id) -> list:
    """Parseaza un XML Google Shopping si extrage produse cu imagini."""
    products = []
    try:
        # Streaming iterparse — eficient pentru fisiere mari
        root = None
        items_found = 0

        for event, elem in ET.iterparse(io.BytesIO(content), events=("end",)):
            if elem.tag == "item":
                items_found += 1
                # Extrage campuri — suporta g: namespace si plain
                title = (
                    elem.findtext("title", "")
                    or _xml_text(elem, "title", "g") or ""
                ).strip()

                link = (
                    elem.findtext("link", "")
                    or _xml_text(elem, "link", "g") or ""
                ).strip()

                image = (
                    _xml_text(elem, "image_link", "g")
                    or _xml_text(elem, "image_link")
                    or _xml_text(elem, "image_url", "g")
                    or _xml_text(elem, "image_url")
                    or ""
                ).strip()

                # Pret
                price_raw = (
                    _xml_text(elem, "price", "g")
                    or _xml_text(elem, "price")
                    or _xml_text(elem, "sale_price", "g")
                    or ""
                )
                price = _parse_price(price_raw)

                # Pret vechi
                old_price_raw = (
                    _xml_text(elem, "original_price", "g")
                    or _xml_text(elem, "regular_price", "g")
                    or ""
                )
                old_price = _parse_price(old_price_raw)

                # Discount
                discount_pct = 0
                if old_price > price > 0:
                    discount_pct = round((old_price - price) / old_price * 100)

                category = (
                    _xml_text(elem, "product_type", "g")
                    or _xml_text(elem, "google_product_category", "g")
                    or _xml_text(elem, "category", "g")
                    or _xml_text(elem, "category")
                    or ""
                ).strip()
                # Ia doar ultimul nivel din "Cat > Sub > Sub-sub"
                if ">" in category:
                    category = category.split(">")[-1].strip()
                category = category[:60]

                brand = (
                    _xml_text(elem, "brand", "g")
                    or _xml_text(elem, "brand")
                    or ""
                ).strip()[:50]

                prod_id = (
                    _xml_text(elem, "id", "g")
                    or _xml_text(elem, "id")
                    or str(items_found)
                )

                # Elibereaza memoria
                elem.clear()

                if not title or not link:
                    continue

                products.append({
                    "id":           prod_id,
                    "title":        title[:120],
                    "url":          make_afiliat_url(link),
                    "url_original": link,
                    "image":        image,
                    "price":        price,
                    "old_price":    old_price if old_price > price else None,
                    "discount_pct": discount_pct,
                    "category":     category,
                    "cat_slug":     normalize_cat_slug(category, merchant),
                    "brand":        brand,
                    "merchant":     merchant,
                    "feed_id":      feed_id,
                })

                if len(products) >= MAX_PRODUCTS_PER_FEED:
                    break

    except ET.ParseError as e:
        print(f"    XML ParseError: {e} — {len(products)} produse pana acum")
    except Exception as e:
        print(f"    Eroare parsare XML: {e}")

    return products


# ─── Parsare CSV ──────────────────────────────────────────────────────────────

# Mapare header CSV -> camp intern
CSV_FIELD_MAP = {
    # Titlu
    "title": "title", "name": "title", "product_name": "title",
    # Link — inclusiv formatul 2Performant direct (aff_code = URL tracking deja complet)
    "link": "link", "url": "link", "product_url": "link", "page_url": "link",
    "aff_code": "link",
    # Imagine — inclusiv image_urls (plural, format outfitblack)
    "image_link": "image", "image_url": "image", "image": "image",
    "g:image_link": "image", "main_image": "image", "picture": "image",
    "image_urls": "image",
    # Pret
    "price": "price", "g:price": "price", "sale_price": "price",
    "final_price": "price", "current_price": "price",
    # Pret vechi
    "original_price": "old_price", "regular_price": "old_price",
    "old_price": "old_price", "list_price": "old_price",
    # Categorie
    "product_type": "category", "g:product_type": "category",
    "category": "category", "g:google_product_category": "category",
    # Brand
    "brand": "brand", "g:brand": "brand", "manufacturer": "brand",
    # ID
    "id": "id", "g:id": "id", "sku": "id",
}


def parse_csv_feed(content: bytes, merchant: str, feed_id, encoding="utf-8") -> list:
    """Parseaza un feed CSV si extrage produse."""
    products = []
    try:
        # Incearca mai multe encodings
        text = None
        for enc in [encoding, "utf-8", "utf-8-sig", "latin-1", "cp1252"]:
            try:
                text = content.decode(enc)
                break
            except UnicodeDecodeError:
                continue
        if text is None:
            print("    Nu pot decoda CSV")
            return []

        # Detecteaza delimitatorul
        first_line = text.split("\n")[0]
        delimiter = ";"
        if first_line.count(",") > first_line.count(";"):
            delimiter = ","
        elif first_line.count("\t") > first_line.count(";"):
            delimiter = "\t"

        reader = csv.DictReader(io.StringIO(text), delimiter=delimiter)
        # Normalizeaza headerele
        headers = [h.strip().lower().replace(" ", "_") for h in (reader.fieldnames or [])]
        print(f"    CSV headers: {headers[:10]}...")

        for i, row in enumerate(reader):
            if len(products) >= MAX_PRODUCTS_PER_FEED:
                break

            # Map campuri
            mapped = {}
            for raw_h, val in row.items():
                norm = (raw_h or "").strip().lower().replace(" ", "_")
                field = CSV_FIELD_MAP.get(norm, None)
                if field and val:
                    mapped[field] = val.strip()

            title = mapped.get("title", "")
            link  = mapped.get("link", "")
            image = mapped.get("image", "")

            if not title or not link:
                continue

            price     = _parse_price(mapped.get("price", ""))
            old_price = _parse_price(mapped.get("old_price", ""))
            discount_pct = 0
            if old_price > price > 0:
                discount_pct = round((old_price - price) / old_price * 100)

            category = mapped.get("category", "")
            if ">" in category:
                category = category.split(">")[-1].strip()
            category = category[:60]

            # Nu dublu-wrap URL-urile 2Performant deja cu tracking (ex: outfitblack feed)
            is_2p_url = link.startswith("https://event.2performant.com")
            cat_raw = category[:60]
            products.append({
                "id":           mapped.get("id", str(i)),
                "title":        title[:120],
                "url":          link if is_2p_url else make_afiliat_url(link),
                "url_original": link,
                "image":        image,
                "price":        price,
                "old_price":    old_price if old_price > price else None,
                "discount_pct": discount_pct,
                "category":     cat_raw,
                "cat_slug":     normalize_cat_slug(cat_raw, merchant),
                "brand":        mapped.get("brand", "")[:50],
                "merchant":     merchant,
                "feed_id":      feed_id,
            })

    except Exception as e:
        print(f"    Eroare parsare CSV: {e}")

    return products


# ─── Feed combinat 2Performant ("My Feeds", multi-magazin) ───────────────────
# Format nativ 2Performant (DIFERIT de Google Shopping XML): un singur fisier
# <items><item> cu <title>/<aff_code>/<price>/<campaign_name>/<image_urls>,
# campaign_name variaza per produs (multi-magazin in acelasi feed).
# aff_code e deja link de tracking COMPLET — nu se mai dubleaza cu make_afiliat_url.
# Creat manual din 2Performant -> Affiliate -> My Feeds (24 surse, 414k+ produse,
# descoperit 20.06.2026 dupa ce s-a constatat ca toate URL-urile ghicite din
# KNOWN_FEEDS sunt moarte — vezi CLAUDE.md "products-home.json").
MY_FEED_URL = "https://api.2performant.com/feed/4a3fc5d5f.xml"


def parse_my_feed_combined(url: str, slug_map: dict, max_per_merchant: int = 2000) -> tuple[list, dict]:
    """Streaming-parseaza feed-ul combinat 2Performant (multi-magazin).
    Nu bufereaza tot fisierul in memorie — proceseaza element cu element direct
    din raspunsul HTTP, deoarece fisierul poate avea sute de MB (414k+ produse
    cu descrieri lungi). Cap per-magazin pentru diversitate, fara cap total
    artificial — scaneaza tot fisierul ca sa prinda toate cele ~24 surse,
    nu doar primul magazin (care poate domina alfabetic/in ordinea feed-ului).
    """
    products: list = []
    per_merchant: dict = {}
    items_seen = 0
    skipped_no_data = 0

    try:
        resp = _session.get(url, headers=_BROWSER_HEADERS, timeout=600, stream=True)
        resp.raise_for_status()
        resp.raw.decode_content = True

        for event, elem in ET.iterparse(resp.raw, events=("end",)):
            if elem.tag != "item":
                continue
            items_seen += 1

            title       = (elem.findtext("title") or "").strip()
            link        = (elem.findtext("aff_code") or "").strip()
            price       = _parse_price(elem.findtext("price"))
            merchant_raw = (elem.findtext("campaign_name") or "").strip()
            # image_urls e uneori o lista separata prin virgula (ex: carturesti.ro
            # trimite mai multe poze per produs) — luam doar prima, altfel src-ul
            # din <img> devine un string invalid cu mai multe URL-uri concatenate
            image_raw   = (elem.findtext("image_urls") or "").strip()
            image       = image_raw.split(",")[0].strip()
            elem.clear()

            if not title or not link or not image or price <= 0 or not merchant_raw:
                skipped_no_data += 1
                continue

            # AmCupon e pentru cumparatori din Romania — excludem magazine pe alt
            # domeniu de tara (ex: zapatos.hu, esteto.bg, vidaxl.bg) gasite in feed-ul
            # combinat 2Performant (descoperit 20.06.2026, vezi CLAUDE.md)
            merchant_domain = merchant_raw.lower().rstrip("/")
            if not merchant_domain.endswith(".ro"):
                skipped_no_data += 1
                continue

            mn  = merchant_raw.lower()
            cnt = per_merchant.get(mn, 0)
            per_merchant[mn] = cnt + 1
            if cnt >= max_per_merchant:
                continue  # cota magazinului plina, dar continuam scanarea pt. restul

            slug = slug_map.get(mn, slug_map.get(mn.split(".")[0], merchant_raw))

            products.append({
                "id":           f"2pfeed_{items_seen}",
                "title":        title[:120],
                "url":          link,           # aff_code e deja link complet de tracking
                "url_original": link,
                "image":        image,
                "price":        price,
                "old_price":    None,
                "discount_pct": 0,
                "category":     "",
                "cat_slug":     normalize_cat_slug("", merchant_raw),
                "brand":        "",
                "merchant":     merchant_raw,
                "merchant_slug": slug,
                "feed_id":      "my_feed_combined",
            })

            if items_seen % 50000 == 0:
                print(f"      ...{items_seen} produse scanate, {len(products)} retinute, {len(per_merchant)} magazine vazute")

    except ET.ParseError as e:
        print(f"    XML ParseError (feed combinat): {e} — {len(products)} produse pana acum din {items_seen} scanate")
    except Exception as e:
        print(f"    EROARE feed combinat: {e}")

    print(f"    Feed combinat: {items_seen} produse scanate, {len(products)} retinute, "
          f"{len(per_merchant)} magazine distincte, {skipped_no_data} sarite (date lipsa)")
    return products, per_merchant


# ─── Download + parsare feed ──────────────────────────────────────────────────

_BROWSER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/125.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "ro-RO,ro;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
}


def download_feed(url: str) -> bytes | None:
    """Descarca un feed XML/CSV cu suport pentru gzip si fisiere mari."""
    print(f"    Descarcare: {url[:80]}...")
    # Adauga Referer bazat pe domeniu pentru a evita 403 pe feed-uri directe
    from urllib.parse import urlparse as _urlparse
    parsed = _urlparse(url)
    referer_hdr = {"Referer": f"{parsed.scheme}://{parsed.netloc}/"}
    try:
        # Incercam: fara auth + browser headers, apoi cu auth 2P, apoi cu Referer
        attempts = [
            {**_BROWSER_HEADERS},
            {**_BROWSER_HEADERS, **referer_hdr},
            {**_BROWSER_HEADERS, **_auth_headers()},
        ]
        resp = None
        for headers in attempts:
            resp = _session.get(
                url,
                headers=headers,
                timeout=DOWNLOAD_TIMEOUT,
                stream=True,
                allow_redirects=True,
            )
            if resp.status_code == 200:
                break
            print(f"    HTTP {resp.status_code}")

        if resp is None or resp.status_code != 200:
            print(f"    EROARE: HTTP {resp.status_code if resp else 'no response'}")
            return None

        # Citeste in chunks
        chunks = []
        total  = 0
        for chunk in resp.iter_content(chunk_size=CHUNK_SIZE):
            if chunk:
                chunks.append(chunk)
                total += len(chunk)
                if total > 200 * 1024 * 1024:  # 200MB limit
                    print(f"    PREA MARE (>{total/1024/1024:.0f}MB), opresc...")
                    break

        content = b"".join(chunks)
        print(f"    Descarcat: {len(content)/1024/1024:.1f} MB")

        # Decomprima gzip daca e cazul
        if content[:2] == b"\x1f\x8b":
            content = gzip.decompress(content)
            print(f"    Decompresat: {len(content)/1024/1024:.1f} MB")

        return content

    except Exception as e:
        print(f"    EROARE download: {e}")
        return None


def detect_format(url: str, content: bytes) -> str:
    """Detecteaza formatul feed-ului: 'xml' sau 'csv'."""
    url_lower = url.lower()
    if ".xml" in url_lower or "xml" in url_lower:
        return "xml"
    if ".csv" in url_lower or "csv" in url_lower:
        return "csv"
    if ".tsv" in url_lower:
        return "csv"
    # Inspecteaza continutul
    head = content[:500]
    if b"<?xml" in head or b"<rss" in head or b"<feed" in head or b"<item>" in head:
        return "xml"
    return "csv"


def get_products_from_feed_url(url: str, merchant: str, feed_id) -> list:
    """Descarca si parseaza un feed XML/CSV direct."""
    content = download_feed(url)
    if not content or len(content) < 100:
        return []

    fmt = detect_format(url, content)
    print(f"    Format detectat: {fmt.upper()}")

    if fmt == "xml":
        products = parse_xml_feed(content, merchant, feed_id)
    else:
        products = parse_csv_feed(content, merchant, feed_id)

    cu_imagine = sum(1 for p in products if p.get("image"))
    print(f"    {len(products)} produse ({cu_imagine} cu imagine)")
    return products


# ─── Fallback: API endpoint (fara imagini) ────────────────────────────────────

def get_products_from_api(feed_id, merchant: str) -> list:
    """Fallback: foloseste endpoint-ul API (nu are imagini de obicei)."""
    products = []
    page = 1
    while len(products) < 200:
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
            title = prod.get("title", "") or ""
            url   = prod.get("url", "") or prod.get("product_url", "") or ""
            image = (
                prod.get("image_url", "")
                or prod.get("image", "")
                or next(
                    (v for v in (prod.get("structured_image_urls") or {}).values() if v),
                    ""
                )
            )
            if not title or not url:
                continue
            cat_raw = (prod.get("category") or "")[:60]
            products.append({
                "title":        title[:120],
                "url":          make_afiliat_url(url),
                "url_original": url,
                "image":        image,
                "price":        _parse_price(prod.get("price")),
                "old_price":    None,
                "discount_pct": 0,
                "category":     cat_raw,
                "cat_slug":     normalize_cat_slug(cat_raw, merchant),
                "brand":        (prod.get("brand") or "")[:50],
                "merchant":     merchant,
                "feed_id":      feed_id,
            })
        if len(items) < 50:
            break
        page += 1
        time.sleep(0.2)
    return products


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("fetch_product_feeds.py — Feed-uri directe XML/CSV")
    print("=" * 60)

    script_dir  = os.path.dirname(os.path.abspath(__file__))
    repo_root   = os.path.dirname(script_dir)
    output_path = os.path.join(repo_root, "frontend", "public", "products.json")

    skip_api = not AFFILIATE_EMAIL or not AFFILIATE_PASS

    if skip_api:
        print("  Credentiale lipsa — mod offline, folosesc doar KNOWN_FEEDS.")
    else:
        # ── 1. Login ──────────────────────────────────────────────────────────
        print("\n[1/4] Login 2Performant...")
        if not sign_in():
            print("  Login esuat — continuam cu KNOWN_FEEDS.")
            skip_api = True

    slug_map = build_slug_map()
    print(f"  Slug map: {len(slug_map)} intrari")

    # ── 0. Feed combinat 2Performant ("My Feeds", 24+ magazine reale) ─────────
    print("\n[0/4] Descarc feed-ul combinat 2Performant (My Feeds)...")
    combined_products, combined_stats = parse_my_feed_combined(MY_FEED_URL, slug_map)
    print(f"  Feed combinat: {len(combined_products)} produse din {len(combined_stats)} magazine")

    # ── 2. Feed list ──────────────────────────────────────────────────────────
    feeds_cu_url   = []
    feeds_fara_url = []

    if not skip_api:
        print("\n[2/4] Obtin lista feed-uri...")
        feeds_raw = get_product_feeds()
        print(f"  {len(feeds_raw)} feed-uri disponibile")

        if feeds_raw:
            print(f"  Campuri feed[0]: {list(feeds_raw[0].keys())}")
            sample = feeds_raw[0]
            for k in ["url", "feed_url", "file_url", "download_url", "source_url"]:
                if sample.get(k):
                    print(f"    {k} = {sample[k][:80]}")

        for feed in feeds_raw:
            furl = _get_feed_url(feed)
            if furl:
                feeds_cu_url.append((feed, furl))
            else:
                feeds_fara_url.append(feed)

        print(f"  Feed-uri cu URL direct: {len(feeds_cu_url)}")
        print(f"  Feed-uri fara URL (vor folosi API fallback): {len(feeds_fara_url)}")
    else:
        print("\n[2/4] Sarit (mod offline) — feed list din API indisponibil.")

    # ── 3. Selecteaza feed-uri cu URL direct ─────────────────────────────────
    print("\n[3/4] Sortez si selectez feed-uri prioritare...")

    # Feed-uri cunoscute cu URL direct (diverse categorii)
    # Formatul: name = merchant slug, url = URL direct XML/CSV
    # NOTA 20.06.2026: lista era 19 intrari, 18 confirmate MOARTE (404/403/DNS fail)
    # prin testare live (inclusiv din GitHub Actions cu auth reala). Curatata la
    # singura intrare confirmata functionala. Sursa principala de produse e acum
    # MY_FEED_URL (feed combinat 2Performant, vezi mai sus) — 20+ magazine reale.
    # Daca vrei sa adaugi un magazin nou, mai simplu sa-l adaugi in 2Performant
    # -> Affiliate -> My Feeds, nu sa ghicesti URL-ul direct al magazinului.
    KNOWN_FEEDS = [
        {"name": "navstore.ro",      "url": "https://www.navstore.ro/feed/googleShoppingAds.xml"},
    ]
    slug_map_rev = {v: k for k, v in slug_map.items()}
    existing_names = {(f.get("name") or "").lower() for f, _ in feeds_cu_url}

    for kf in KNOWN_FEEDS:
        nm = kf["name"].lower()
        if not any(nm in en for en in existing_names):
            print(f"  + Feed hardcodat adaugat: {kf['name']}")
            feeds_cu_url.append(({
                "id": kf["name"], "name": kf["name"],
                "program": {"name": kf["name"], "slug": kf["name"].split(".")[0]},
            }, kf["url"]))

    # Prioritizeaza diversitate de categorii
    PRIORITATE = ["libris", "elefant", "vidaxl", "noriel", "ozone", "bobaro", "automobilus", "navstore"]

    def _priority(item):
        feed, furl = item
        name = (feed.get("name", "") or "").lower()
        for i, kw in enumerate(PRIORITATE):
            if kw in name or kw in furl.lower():
                return i
        return len(PRIORITATE)

    feeds_cu_url.sort(key=_priority)
    feeds_to_process = feeds_cu_url[:MAX_FEEDS]

    # ── 4. Descarca si parseaza ───────────────────────────────────────────────
    print(f"\n[4/4] Procesez {len(feeds_to_process)} feed-uri...")
    all_products = list(combined_products)
    stats = {"feeds_ok": 1 if combined_products else 0, "feeds_fail": 0, "cu_imagine": 0, "fara_imagine": 0}

    for idx, (feed, furl) in enumerate(feeds_to_process):
        if len(all_products) >= MAX_TOTAL:
            print(f"  Limita {MAX_TOTAL} produse atinsa.")
            break

        feed_id   = feed.get("id", "")
        feed_name = feed.get("name", "") or ""
        prog      = feed.get("program", {}) or {}
        merchant  = prog.get("name", "") or prog.get("slug", "") or feed_name
        mn        = merchant.strip().lower()

        print(f"\n  [{idx+1}/{len(feeds_to_process)}] '{feed_name}' ({merchant})")
        print(f"    URL: {furl[:80]}...")

        products = get_products_from_feed_url(furl, merchant, feed_id)

        if not products:
            # Fallback la API daca download-ul a esuat
            print(f"    Fallback la API endpoint...")
            products = get_products_from_api(feed_id, merchant)
            stats["feeds_fail"] += 1
        else:
            stats["feeds_ok"] += 1

        # Adauga merchant_slug
        for p in products:
            slug = slug_map.get(mn, slug_map.get(mn.split(".")[0], mn))
            p["merchant_slug"] = slug

        # Statistici imagini
        for p in products:
            if p.get("image"):
                stats["cu_imagine"] += 1
            else:
                stats["fara_imagine"] += 1

        all_products.extend(products)
        print(f"    Total acumulat: {len(all_products)} produse")
        time.sleep(1.0)  # Respecta rate limiting

    # Daca nu am reusit nimic cu URL direct, incearca fallback pe primele feed-uri
    if not all_products and feeds_fara_url:
        print("\n  Niciun produs din feed-uri directe — fallback API complet...")
        for feed in feeds_fara_url[:5]:
            feed_id  = feed.get("id", "")
            prog     = feed.get("program", {}) or {}
            merchant = prog.get("name", "") or feed.get("name", "")
            mn       = merchant.strip().lower()
            products = get_products_from_api(feed_id, merchant)
            for p in products:
                slug = slug_map.get(mn, slug_map.get(mn.split(".")[0], mn))
                p["merchant_slug"] = slug
            all_products.extend(products)
            time.sleep(0.5)

    # ── Diversitate: max MAX_PER_MERCHANT per merchant ────────────────────────
    import random
    from collections import defaultdict
    by_merchant: dict = defaultdict(list)
    for p in all_products:
        m = (p.get("merchant_slug") or p.get("merchant") or "alt").lower()
        by_merchant[m].append(p)

    # Cap per merchant + shuffle intern pentru varietate
    capped = []
    for m, prods in by_merchant.items():
        # Prioritizeaza produsele cu imagini si discount
        prods.sort(key=lambda x: (-int(bool(x.get("image"))), -(x.get("discount_pct") or 0)))
        capped.extend(prods[:MAX_PER_MERCHANT])

    # Shuffle final pentru distributie uniforma intre merchants
    random.shuffle(capped)

    # Sorteaza: produse cu discount real deasupra, restul random
    cu_discount  = [p for p in capped if (p.get("discount_pct") or 0) > 0 and p.get("image")]
    fara_discount = [p for p in capped if (p.get("discount_pct") or 0) == 0 and p.get("image")]
    fara_imagine  = [p for p in capped if not p.get("image")]

    all_products = cu_discount + fara_discount + fara_imagine
    all_products = all_products[:MAX_TOTAL]

    merchants_finali = len(set((p.get("merchant_slug") or p.get("merchant","")).lower() for p in all_products))
    print(f"  Diversitate finala: {merchants_finali} merchants distincti in {len(all_products)} produse")

    # ── Salveaza ──────────────────────────────────────────────────────────────
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({
            "updated":  datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "count":    len(all_products),
            "products": all_products,
        }, f, ensure_ascii=False, indent=2)

    # ── Raport final ──────────────────────────────────────────────────────────
    cu_img = sum(1 for p in all_products if p.get("image"))
    cu_disc = sum(1 for p in all_products if p.get("discount_pct", 0) > 0)
    merchants = set(p["merchant"] for p in all_products)

    print("\n" + "=" * 60)
    print(f"GATA! {len(all_products)} produse in products.json")
    print(f"  Cu imagine:  {cu_img} ({cu_img/max(len(all_products),1)*100:.1f}%)")
    print(f"  Cu discount: {cu_disc}")
    print(f"  Marchanti:   {len(merchants)} ({', '.join(sorted(merchants)[:5])}...)")
    print(f"  Feed-uri OK: {stats['feeds_ok']} | Esuate: {stats['feeds_fail']}")
    print(f"  Fisier:      {output_path}")
    print("=" * 60)


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
