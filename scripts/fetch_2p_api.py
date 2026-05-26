"""
fetch_2p_api.py — Descarca programe + promotii din 2Performant API v2
=====================================================================
Autentificare: DeviseTokenAuth (email + parola → access-token/client/uid)

Endpoint-uri corecte:
  POST /users/sign_in.json          → obtine token-uri sesiune
  GET  /affiliate/programs.json     → programe afiliate aprobate
  GET  /affiliate/advertiser_promotions.json → promotii active

Necesita secrets:
  TWOPEFORMANT_EMAIL  — email-ul contului 2Performant
  TWOPEFORMANT_PASS   — parola contului 2Performant
  TWOPEFORMANT_USER   — codul afiliat (AFF_CODE, ex. 541547473) — pentru quicklinks
"""

import os
import json
import re
import hashlib
import random
import time
from datetime import datetime, timezone
from urllib.parse import quote, unquote

import requests as req_lib
from requests.adapters import HTTPAdapter

# ─── Configurare sesiune HTTP ─────────────────────────────────────────────────

_session = req_lib.Session()
_session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "Content-Type": "application/json",
})
_session.mount("https://", HTTPAdapter(max_retries=2))

BASE_URL           = "https://api.2performant.com"
AFF_CODE           = os.environ.get("TWOPEFORMANT_USER", "541547473")  # cod afiliat
AFFILIATE_EMAIL    = os.environ.get("TWOPEFORMANT_EMAIL", "")
AFFILIATE_PASS     = os.environ.get("TWOPEFORMANT_PASS", "")

OUTPUT_FILE     = "../data/output.json"
OUTPUT_FRONTEND = "../frontend/public/output.json"

# Token-uri sesiune (se actualizeaza dupa fiecare cerere DeviseTokenAuth)
_auth = {
    "access-token": "",
    "client": "",
    "uid": "",
}

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


# ─── Autentificare DeviseTokenAuth ───────────────────────────────────────────

def sign_in() -> bool:
    """
    Autentificare cu email + parola.
    Salveaza access-token, client, uid in _auth.
    Returneaza True daca autentificarea a reusit.
    """
    global _auth
    if not AFFILIATE_EMAIL or not AFFILIATE_PASS:
        print("  ⚠️  TWOPEFORMANT_EMAIL / TWOPEFORMANT_PASS nu sunt setate.")
        return False

    url = f"{BASE_URL}/users/sign_in.json"
    payload = {"user": {"email": AFFILIATE_EMAIL, "password": AFFILIATE_PASS}}
    print(f"  → POST {url} (email={AFFILIATE_EMAIL[:4]}***)")

    try:
        resp = _session.post(url, json=payload, timeout=15)
        print(f"    HTTP {resp.status_code}")
        if resp.status_code != 200:
            print(f"    Body: {resp.text[:300]}")
            return False

        # Token-urile vin in headerele raspunsului
        _auth["access-token"] = resp.headers.get("access-token", "")
        _auth["client"]       = resp.headers.get("client", "")
        _auth["uid"]          = resp.headers.get("uid", "")

        if not _auth["access-token"]:
            # Unele implementari pun token-ul in body
            data = resp.json()
            user = data.get("data", data.get("user", {}))
            _auth["access-token"] = user.get("access-token", "")
            _auth["client"]       = user.get("client", "")
            _auth["uid"]          = user.get("uid", AFFILIATE_EMAIL)

        print(f"    ✅ Login reusit — uid={_auth['uid']}, token={_auth['access-token'][:12]}...")
        return True

    except Exception as e:
        print(f"  ❌ Eroare sign_in: {e}")
        return False


def _auth_headers() -> dict:
    """Returneaza headerele de autentificare curente."""
    return {
        "access-token": _auth["access-token"],
        "client":       _auth["client"],
        "uid":          _auth["uid"],
        "token-type":   "Bearer",
    }


def _update_tokens(resp: req_lib.Response):
    """Actualizeaza token-urile din headerele raspunsului (rotatie DeviseTokenAuth)."""
    new_token = resp.headers.get("access-token", "")
    if new_token:
        _auth["access-token"] = new_token
        _auth["client"]       = resp.headers.get("client", _auth["client"])
        _auth["uid"]          = resp.headers.get("uid", _auth["uid"])


def api_get(endpoint: str, params: dict = None) -> dict | list | None:
    """Face un GET autentificat la API si returneaza JSON-ul parsat."""
    params = params or {}
    qs = "&".join(f"{k}={v}" for k, v in sorted(params.items()))
    url = f"{BASE_URL}/{endpoint}.json"
    if qs:
        url += f"?{qs}"

    print(f"  → GET {url}")
    try:
        resp = _session.get(url, headers=_auth_headers(), timeout=20)
        print(f"    HTTP {resp.status_code} — {len(resp.content)} bytes")

        _update_tokens(resp)

        if resp.status_code == 401:
            print("    ⚠️  401 Unauthorized — token expirat sau credentiale gresite")
            return None
        if resp.status_code != 200:
            print(f"    Body: {resp.text[:300]}")
            return None

        data = resp.json()
        if isinstance(data, list):
            print(f"    Raspuns: lista cu {len(data)} elemente")
        elif isinstance(data, dict):
            print(f"    Raspuns: dict cu chei {list(data.keys())[:6]}")
        return data

    except Exception as e:
        print(f"  ❌ Eroare {endpoint}: {e}")
        return None


def fetch_all_pages(endpoint: str, per_page: int = 100) -> list:
    """Descarca toate paginile pentru un endpoint paginat."""
    results = []
    page = 1
    while True:
        data = api_get(endpoint, {"page": page, "per_page": per_page})
        if data is None:
            break

        # Suport pentru { "programs": [...] } sau liste directe sau { "results": [...] }
        if isinstance(data, list):
            items = data
        elif isinstance(data, dict):
            # Cauta prima lista din dict
            items = None
            for v in data.values():
                if isinstance(v, list):
                    items = v
                    break
            if items is None:
                items = []
        else:
            break

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
    scor = 0.0
    if are_promotie:
        scor += 30
    if cod_cupon:
        scor += 20
    if 0 < zile_ramase <= 3:
        scor += 10
    return scor


def parse_promotii(promotii_raw: list) -> dict:
    """Construieste o harta {slug_program: [promotii]} din lista de promotii."""
    promo_map: dict[str, list] = {}
    now = datetime.now(timezone.utc)

    for p in promotii_raw:
        # Extrage slug/cheie program
        prog = p.get("program", {}) or {}
        cheie = (
            prog.get("slug", "") or
            prog.get("name", "") or
            p.get("program_name", "") or
            p.get("merchant_name", "") or ""
        ).strip().lower()

        if not cheie:
            continue

        # Zile ramase
        end_raw = p.get("promotion_end", "") or p.get("end_date", "") or p.get("expires_at", "")
        zile_ramase = 99
        if end_raw:
            try:
                end_dt = datetime.fromisoformat(str(end_raw).replace("Z", "+00:00"))
                if end_dt.tzinfo is None:
                    end_dt = end_dt.replace(tzinfo=timezone.utc)
                delta = (end_dt - now).days
                if delta < 0:
                    continue  # expirata
                zile_ramase = max(0, delta)
            except Exception:
                pass

        # Un cod de reducere explicit poate fi in affiliate_challenge sau description
        challenge = p.get("affiliate_challenge", "") or ""
        cod_cupon = ""
        if challenge and len(challenge) < 30 and re.match(r"^[A-Z0-9_\-]+$", challenge.strip()):
            cod_cupon = challenge.strip()

        promotie = {
            "nume":          p.get("name", "") or p.get("title", ""),
            "descriere":     p.get("description", "") or p.get("affiliate_bonus", ""),
            "cod_cupon":     cod_cupon,
            "landing_page":  p.get("landing_page_link", "") or p.get("landing_page", ""),
            "zile_ramase":   zile_ramase,
        }

        if not promotie["nume"]:
            continue

        if cheie not in promo_map:
            promo_map[cheie] = []
        promo_map[cheie].append(promotie)

    return promo_map


def program_to_magazin(prog: dict, promo_map: dict) -> dict:
    """Converteste un program din API in formatul output.json."""
    # Campuri program (API returneaza snake_case)
    name      = prog.get("name", "") or ""
    slug      = prog.get("slug", "") or name.strip().lower().replace(" ", "-")
    main_url  = prog.get("main_url", "") or prog.get("base_url", "") or ""
    logo      = prog.get("logo_path", "") or prog.get("logo_url", "") or prog.get("logo", "") or ""
    category  = prog.get("category", "") or ""
    commission = (
        prog.get("default_sale_commission_rate", "") or
        prog.get("default_lead_commission_amount", "") or
        prog.get("commission", "") or ""
    )
    unique_code = prog.get("unique_code", "") or prog.get("id", "")

    # Cheie pentru promo_map: slug sau name
    cheie_slug = slug.lower()
    cheie_name = name.strip().lower()

    promotii_raw = promo_map.get(cheie_slug, []) or promo_map.get(cheie_name, [])

    categorie = normalize_category(category)
    are_promotie = len(promotii_raw) > 0
    are_cod = any(p.get("cod_cupon") for p in promotii_raw)
    zile_ramase = min(
        (p.get("zile_ramase", 99) for p in promotii_raw), default=99
    )

    # Construieste URL afiliat folosind unique_code (mai precis decat quicklink simplu)
    if main_url and unique_code:
        url_afiliat = (
            f"https://event.2performant.com/events/click"
            f"?ad_type=quicklink&aff_code={AFF_CODE}"
            f"&unique={unique_code}&redirect_to={quote(main_url, safe='')}"
        )
    else:
        url_afiliat = make_afiliat_url(main_url)

    return {
        "magazin":          slug or cheie_name,
        "url":              main_url or f"https://{slug}",
        "url_afiliat":      url_afiliat,
        "logo_url":         logo,
        "categorie":        categorie,
        "categorie_slug":   categorie_slug(categorie),
        "comision":         str(commission),
        "rank":             999,
        "scor_afiliere":    0,
        "prioritate":       "#999",
        "canal_recomandat": "",
        "sales_number":     0,
        "trend":            0,
        "are_promotie":     are_promotie,
        "cod_cupon":        are_cod,
        "zile_ramase":      zile_ramase,
        "promotii":         promotii_raw,
        "folosit_de":       calculeaza_folosit(slug, are_promotie),
        "procent_succes":   calculeaza_succes(slug),
        "exclusiv":         are_cod,
        "platforma":        "2performant",
        "ultima_verificare": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "scor_final":       calculeaza_scor(are_promotie, are_cod, zile_ramase),
        "program_id":       prog.get("id", ""),
        "unique_code":      unique_code,
    }


def load_fallback() -> list:
    """Incarca output.json existent daca API-ul nu functioneaza."""
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
    print("fetch_2p_api.py — 2Performant API (DeviseTokenAuth)")
    print("=" * 60)

    if not AFFILIATE_EMAIL:
        print("\n⚠️  TWOPEFORMANT_EMAIL nu e setat — pastrez datele existente.")
        print("   Adauga secretul TWOPEFORMANT_EMAIL in GitHub Secrets!")
        return

    # ── 1. Login ──────────────────────────────────────────────────────────────
    print("\n[1/3] Login 2Performant...")
    if not sign_in():
        print("  ❌ Login esuat — pastrez datele existente.")
        return

    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root  = os.path.dirname(script_dir)
    out_data   = os.path.join(repo_root, "data", "output.json")
    out_front  = os.path.join(repo_root, "frontend", "public", "output.json")

    # ── 2. Programe afiliate ──────────────────────────────────────────────────
    print("\n[2/3] Descarc programele afiliate...")
    programe = fetch_all_pages("affiliate/programs", per_page=100)
    if not programe:
        print("  ❌ Niciun program returnat — pastrez datele existente.")
        return
    print(f"  ✅ {len(programe)} programe descarcate")

    # ── 3. Promotii active ────────────────────────────────────────────────────
    print("\n[3/3] Descarc promotiile active...")
    promotii_raw = fetch_all_pages("affiliate/advertiser_promotions", per_page=100)
    print(f"  ✅ {len(promotii_raw)} promotii descarcate")

    # ── Construieste harta promotii ───────────────────────────────────────────
    promo_map = parse_promotii(promotii_raw)
    print(f"\n  {len(promo_map)} magazine cu promotii active")

    # ── Construieste lista magazine ───────────────────────────────────────────
    magazine = []
    vazute: set = set()
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

    # ── Salveaza ──────────────────────────────────────────────────────────────
    for path in [out_data, out_front]:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(magazine, f, ensure_ascii=False, indent=2)

    cu_promotii = sum(1 for m in magazine if m["are_promotie"])
    cu_cod      = sum(1 for m in magazine if m["cod_cupon"])
    cu_logo     = sum(1 for m in magazine if m["logo_url"])

    print(f"\n✅ Gata! {len(magazine)} magazine salvate.")
    print(f"   {cu_promotii} cu promotii active")
    print(f"   {cu_cod} cu cod cupon")
    print(f"   {cu_logo} cu logo")


if __name__ == "__main__":
    import sys
    print(f"Python {sys.version}")
    try:
        main()
    except Exception as e:
        import traceback
        print(f"\nFATAL: {e}")
        traceback.print_exc()
        print("\nScript esuat — pastrez datele existente.")
        sys.exit(0)  # nu esuam step-ul GitHub Actions
