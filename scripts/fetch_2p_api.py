"""
fetch_2p_api.py — Inlocuieste complet SHOPS.xlsx + promotions.csv
=================================================================
Descarca DIRECT din API-ul 2Performant:
  - Programele afiliate aprobate (merchants + detalii)
  - Promotiile si cupoanele active

Nu mai e nevoie sa exporti manual nimic din dashboard.
Salveaza in acelasi format ca process_data.py → output.json

RULARE:
  python fetch_2p_api.py
  (necesita TWOPEFORMANT_USER si TWOPEFORMANT_TOKEN setate)
"""

import os
import json
import re
import hmac
import hashlib
import random
import time
from datetime import datetime, timezone
from urllib.parse import urlencode, quote, unquote
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError

AFF_CODE           = "541547473"
BASE_URL           = "http://api.2performant.com"
AFFILIATE_USERNAME = os.environ.get("TWOPEFORMANT_USER", "")
AFFILIATE_TOKEN    = os.environ.get("TWOPEFORMANT_TOKEN", "")

OUTPUT_FILE     = "../data/output.json"
OUTPUT_FRONTEND = "../frontend/public/output.json"

CATEGORY_MAP = {
    "fashion": "Fashion",
    "clothing": "Fashion",
    "shoes": "Fashion",
    "imbracaminte": "Fashion",
    "incaltaminte": "Fashion",
    "beauty": "Beauty",
    "cosmetice": "Beauty",
    "parfumuri": "Beauty",
    "frumusete": "Beauty",
    "electronics": "Electronics IT&C",
    "electronice": "Electronics IT&C",
    "it": "Electronics IT&C",
    "itc": "Electronics IT&C",
    "gadget": "Electronics IT&C",
    "home": "Home & Garden",
    "casa": "Home & Garden",
    "gradina": "Home & Garden",
    "mobila": "Home & Garden",
    "electrocasnice": "Appliances",
    "appliances": "Appliances",
    "books": "Books",
    "carti": "Books",
    "sport": "Sports & outdoors",
    "outdoor": "Sports & outdoors",
    "fitness": "Sports & outdoors",
    "auto": "Automotive",
    "moto": "Automotive",
    "automotive": "Automotive",
    "pharma": "Pharma",
    "farmacie": "Pharma",
    "sanatate": "Health & Personal care",
    "health": "Health & Personal care",
    "kids": "Babies Kids & Toys",
    "copii": "Babies Kids & Toys",
    "jucarii": "Babies Kids & Toys",
    "babies": "Babies Kids & Toys",
    "travel": "Travel",
    "calatorii": "Travel",
    "food": "Food & Beverages",
    "mancare": "Food & Beverages",
    "pet": "Pet supplies",
    "animale": "Pet supplies",
    "flowers": "Flowers & Gifts",
    "flori": "Flowers & Gifts",
    "jewelry": "Jewelry & Accessories",
    "bijuterii": "Jewelry & Accessories",
    "services": "Services",
    "servicii": "Services",
}


# ─── Autentificare 2Performant (HMAC-SHA1) ────────────────────────────────────

def auth_headers(method: str, api_name: str, params: dict = None) -> dict:
    if not AFFILIATE_USERNAME or not AFFILIATE_TOKEN:
        return {}
    date_str = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    qs = unquote(urlencode(sorted((params or {}).items()))) if params else ""
    qs_part = f"?{qs}" if qs else "/"
    string_to_sign = f"{method}{api_name}/{qs_part}{AFFILIATE_USERNAME}{date_str}"
    sig = hmac.new(
        AFFILIATE_TOKEN.encode(),
        string_to_sign.encode(),
        "sha1"
    ).hexdigest()
    return {
        "X-2PF-Client":  AFFILIATE_USERNAME,
        "X-2PF-Auth":    sig,
        "X-2PF-Accept":  "application/json",
        "Date":          date_str,
        "Accept":        "application/json",
    }


def api_get(endpoint: str, params: dict = None) -> dict | list | None:
    """Face un GET la API si returneaza JSON-ul parsat."""
    params = params or {}
    qs = urlencode(sorted(params.items()))
    url = f"{BASE_URL}/{endpoint}/?{qs}" if qs else f"{BASE_URL}/{endpoint}/"
    hdrs = auth_headers("GET", endpoint, params)
    if not hdrs:
        print(f"  ⚠️  Credentiale lipsa — skip {endpoint}")
        return None
    try:
        req = Request(url, headers=hdrs)
        with urlopen(req, timeout=20) as resp:
            return json.loads(resp.read())
    except HTTPError as e:
        print(f"  ❌ HTTP {e.code} la {endpoint}: {e.read().decode()[:200]}")
        return None
    except URLError as e:
        print(f"  ❌ URL eroare la {endpoint}: {e}")
        return None
    except Exception as e:
        print(f"  ❌ Eroare {endpoint}: {e}")
        return None


# ─── Fetch cu paginare ────────────────────────────────────────────────────────

def fetch_all_pages(endpoint: str, per_page: int = 100) -> list:
    """Descarca toate paginile pentru un endpoint."""
    results = []
    page = 1
    while True:
        data = api_get(endpoint, {"page": page, "per_page": per_page})
        if data is None:
            break
        # Suport pentru { "results": [...] } si liste directe
        items = data.get("results", data) if isinstance(data, dict) else data
        if not items:
            break
        results.extend(items)
        print(f"    Pagina {page}: {len(items)} elemente ({len(results)} total)")
        if len(items) < per_page:
            break
        page += 1
        time.sleep(0.3)
    return results


# ─── Procesare date ───────────────────────────────────────────────────────────

def normalize_category(raw: str) -> str:
    if not raw:
        return "Online Mall"
    raw_l = raw.lower()
    for key, val in CATEGORY_MAP.items():
        if key in raw_l:
            return val
    return "Online Mall"


def categorie_slug(cat: str) -> str:
    s = cat.lower()
    s = re.sub(r"[&/]", "", s)
    s = re.sub(r"[^a-z0-9\s-]", "", s)
    s = re.sub(r"\s+", "-", s.strip())
    return re.sub(r"-+", "-", s)


def make_afiliat_url(url: str) -> str:
    if not url or not isinstance(url, str):
        return ""
    url_curat = unquote(url.strip())
    unique = hashlib.md5(url_curat.encode()).hexdigest()[:9]
    encoded = quote(url_curat, safe="")
    return (f"https://event.2performant.com/events/click"
            f"?ad_type=quicklink&aff_code={AFF_CODE}"
            f"&unique={unique}&redirect_to={encoded}")


def calculeaza_folosit(magazin: str, are_promotie: bool) -> int:
    if not are_promotie:
        return 0
    rng = random.Random(abs(hash(magazin)) % 99991)
    return rng.randint(15, 800)


def calculeaza_succes(magazin: str) -> int:
    rng = random.Random(abs(hash(magazin + "_s")) % 99991)
    return rng.randint(72, 96)


def calculeaza_scor(are_promotie: bool, cod_cupon: bool, zile_ramase: int) -> float:
    scor = 0
    if are_promotie:
        scor += 30
    if cod_cupon:
        scor += 20
    if 0 < zile_ramase <= 3:
        scor += 10
    return float(scor)


def program_to_magazin(prog: dict, promo_map: dict) -> dict:
    """Converteste un program API 2Performant in formatul output.json."""
    # Extrage URL-ul magazinului
    name = prog.get("name", "") or prog.get("merchant_name", "") or ""
    url_raw = prog.get("main_url", "") or prog.get("url", "") or ""
    if not url_raw and name:
        # Construieste din name daca e un domain
        url_raw = f"https://{name}" if "." in name else ""

    # Slug pentru matching cu promo_map
    cheie = name.strip().lower().rstrip("/")

    promotii_raw = promo_map.get(cheie, [])

    # Normalizare camp logo
    logo = (prog.get("logo_url", "") or prog.get("logo", "") or
            prog.get("merchant_logo", "") or "")

    # Categorie
    categorie = normalize_category(
        prog.get("category", "") or prog.get("merchant_category", "")
    )

    are_promotie = len(promotii_raw) > 0
    are_cod = any(p.get("cod_cupon") for p in promotii_raw)
    zile_ramase = min(
        (p.get("zile_ramase", 99) for p in promotii_raw), default=99
    )

    return {
        "magazin": cheie,
        "url": url_raw or f"https://{cheie}",
        "url_afiliat": make_afiliat_url(url_raw or f"https://{cheie}"),
        "logo_url": logo,
        "categorie": categorie,
        "categorie_slug": categorie_slug(categorie),
        "comision": prog.get("commission", "") or prog.get("commission_value", ""),
        "rank": 999,
        "scor_afiliere": 0,
        "prioritate": "#999",
        "canal_recomandat": "",
        "sales_number": 0,
        "trend": 0,
        "are_promotie": are_promotie,
        "cod_cupon": are_cod,
        "zile_ramase": zile_ramase,
        "promotii": promotii_raw,
        "folosit_de": calculeaza_folosit(cheie, are_promotie),
        "procent_succes": calculeaza_succes(cheie),
        "exclusiv": are_cod,
        "platforma": "2performant",
        "ultima_verificare": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "scor_final": calculeaza_scor(are_promotie, are_cod, zile_ramase),
    }


def parse_promotii(promotii_raw: list) -> dict:
    """Construieste o harta {cheie_magazin: [promotii]} din lista de promotii."""
    promo_map = {}
    now = datetime.now(timezone.utc)

    for p in promotii_raw:
        # Extrage cheie magazin
        prog_info = p.get("affiliate_program", {}) or {}
        cheie = (
            prog_info.get("name", "") or
            p.get("program_name", "") or
            p.get("merchant_name", "") or ""
        ).strip().lower().rstrip("/")

        if not cheie:
            continue

        # Zile ramase
        end_raw = p.get("end_date", "") or p.get("expires_at", "")
        zile_ramase = 99
        if end_raw:
            try:
                from datetime import datetime as dt
                end_dt = dt.fromisoformat(str(end_raw).replace("Z", "+00:00"))
                if end_dt.tzinfo is None:
                    end_dt = end_dt.replace(tzinfo=timezone.utc)
                delta = (end_dt - now).days
                if delta < 0:
                    continue  # promotie expirata, sarim
                zile_ramase = max(0, delta)
            except Exception:
                pass

        promotie = {
            "nume": p.get("name", "") or p.get("title", ""),
            "descriere": p.get("description", "") or p.get("short_description", ""),
            "cod_cupon": p.get("code", "") or p.get("coupon_code", ""),
            "landing_page": p.get("landing_page_url", "") or p.get("landing_page", ""),
            "zile_ramase": zile_ramase,
        }

        if not promotie["nume"]:
            continue

        if cheie not in promo_map:
            promo_map[cheie] = []
        promo_map[cheie].append(promotie)

    return promo_map


# ─── Fallback: incarca din fisierele existente ────────────────────────────────

def load_fallback() -> list:
    """Incarca output.json existent ca fallback daca API-ul nu functioneaza."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.dirname(script_dir)
    path = os.path.join(repo_root, "frontend", "public", "output.json")
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        print(f"  Fallback: {len(data)} magazine din output.json existent")
        return data
    return []


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("fetch_2p_api.py — Descarcare date 2Performant via API")
    print("=" * 60)

    if not AFFILIATE_USERNAME or not AFFILIATE_TOKEN:
        print("\n⚠️  TWOPEFORMANT_USER / TWOPEFORMANT_TOKEN nu sunt setate.")
        print("   Folosesc datele existente din output.json (no update).")
        return

    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.dirname(script_dir)
    out_data = os.path.join(repo_root, "data", "output.json")
    out_front = os.path.join(repo_root, "frontend", "public", "output.json")

    # ── 1. Descarca programe afiliate ──────────────────────────────────────
    print("\n[1/2] Descarc programele afiliate aprobate...")
    programe = fetch_all_pages("affiliate-programs", per_page=100)
    if not programe:
        print("  ❌ Niciun program returnat — pastrez datele existente.")
        return
    print(f"  ✅ {len(programe)} programe descarcate")

    # ── 2. Descarca promotii active ────────────────────────────────────────
    print("\n[2/2] Descarc promotiile active...")
    promotii_raw = fetch_all_pages("promotions", per_page=100)
    if not promotii_raw:
        # Incearca endpoint alternativ
        promotii_raw = fetch_all_pages("affiliate-promotions", per_page=100)
    print(f"  ✅ {len(promotii_raw)} promotii descarcate")

    # ── 3. Construieste harta promotii ─────────────────────────────────────
    promo_map = parse_promotii(promotii_raw)
    print(f"\n  {len(promo_map)} magazine cu promotii active")

    # ── 4. Construieste lista magazine ─────────────────────────────────────
    magazine = []
    vazute = set()
    for prog in programe:
        m = program_to_magazin(prog, promo_map)
        cheie = m["magazin"]
        if not cheie or cheie in vazute:
            continue
        vazute.add(cheie)
        magazine.append(m)

    # Sorteaza: cu promotii primul, apoi scor
    magazine.sort(key=lambda x: (
        -int(x.get("are_promotie", False)),
        -x.get("scor_final", 0),
    ))

    # ── 5. Salveaza ───────────────────────────────────────────────────────
    os.makedirs(os.path.dirname(out_data), exist_ok=True)
    for path in [out_data, out_front]:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(magazine, f, ensure_ascii=False, indent=2)

    cu_promotii = sum(1 for m in magazine if m["are_promotie"])
    cu_cod = sum(1 for m in magazine if m["cod_cupon"])
    cu_logo = sum(1 for m in magazine if m["logo_url"])

    print(f"\n✅ Gata! {len(magazine)} magazine salvate.")
    print(f"   {cu_promotii} cu promotii active")
    print(f"   {cu_cod} cu cod cupon")
    print(f"   {cu_logo} cu logo")


if __name__ == "__main__":
    main()
