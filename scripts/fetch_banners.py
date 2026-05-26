"""
fetch_banners.py — Bannere campanii din 2Performant API
=======================================================
Endpoint: GET /affiliate/banners.json
Salveaza in frontend/public/banners.json

Bannere sunt imagini de la programele afiliate aprobate.
Pot fi afisate pe homepage, pagini de categorie etc.
"""

import json
import os
import re
import time
import hashlib
from datetime import datetime, timezone
from urllib.parse import quote, unquote

import requests as req_lib
from requests.adapters import HTTPAdapter

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

MAX_BANNERS = 200

_auth = {"access-token": "", "client": "", "uid": ""}


def sign_in() -> bool:
    global _auth
    if not AFFILIATE_EMAIL or not AFFILIATE_PASS:
        print("  ⚠️  TWOPEFORMANT_EMAIL / TWOPEFORMANT_PASS nu sunt setate.")
        return False
    url     = f"{BASE_URL}/users/sign_in.json"
    payload = {"user": {"email": AFFILIATE_EMAIL, "password": AFFILIATE_PASS}}
    try:
        resp = _session.post(url, json=payload, timeout=15)
        if resp.status_code != 200:
            print(f"    HTTP {resp.status_code}: {resp.text[:200]}")
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
        print(f"    ✅ Login reusit — {_auth['uid']}")
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


def _update_tokens(resp):
    new = resp.headers.get("access-token", "")
    if new:
        _auth["access-token"] = new
        _auth["client"]       = resp.headers.get("client", _auth["client"])
        _auth["uid"]          = resp.headers.get("uid", _auth["uid"])


def make_afiliat_url(url: str) -> str:
    if not url:
        return ""
    url_curat = unquote(url.strip())
    unique    = hashlib.md5(url_curat.encode()).hexdigest()[:9]
    encoded   = quote(url_curat, safe="")
    return (f"https://event.2performant.com/events/click"
            f"?ad_type=quicklink&aff_code={AFF_CODE}"
            f"&unique={unique}&redirect_to={encoded}")


def fetch_banners() -> list:
    banners = []
    page = 1
    while len(banners) < MAX_BANNERS:
        url = f"{BASE_URL}/affiliate/banners.json?page={page}&per_page=50"
        try:
            resp = _session.get(url, headers=_headers(), timeout=20)
            _update_tokens(resp)
            if resp.status_code == 401:
                print("  ⚠️  401 — token expirat")
                break
            if resp.status_code != 200:
                print(f"  HTTP {resp.status_code}: {resp.text[:200]}")
                break

            data = resp.json()

            # API returneaza {"banners": [...], "metadata": {...}}
            items = data.get("banners", []) if isinstance(data, dict) else (
                data if isinstance(data, list) else []
            )
            if not items:
                print(f"  Niciun banner pe pagina {page}")
                break

            print(f"  Pagina {page}: {len(items)} bannere")
            for b in items:
                # Campuri corecte ale API-ului 2Performant:
                # img_path    → URL imagine banner (CDN img.2performant.com)
                # link        → URL tracking afiliat (event.2performant.com, contine aff_code)
                # url         → URL-encoded landing page (URL destinatie)
                # markup      → HTML complet <a href="link"><img src="img_path"/></a>
                prog    = b.get("program", {}) or {}
                img_url = b.get("img_path", "") or ""

                # Fallback: extrage src din markup HTML daca img_path lipseste
                if not img_url:
                    markup = b.get("markup", "") or ""
                    m = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', markup, re.IGNORECASE)
                    if m:
                        img_url = m.group(1)

                # Link afiliat: campul "link" contine deja aff_code si tracking
                landing = b.get("link", "") or ""
                if not landing:
                    # Fallback: decode url + quicklink
                    raw_url = unquote(b.get("url", "") or prog.get("main_url", "") or "")
                    landing = make_afiliat_url(raw_url) if raw_url else ""

                width  = b.get("width") or b.get("banner_width") or 0
                height = b.get("height") or b.get("banner_height") or 0

                if not img_url:
                    continue

                merchant_name = (prog.get("name") or prog.get("slug") or
                                 b.get("program_name") or "")

                banners.append({
                    "id":            b.get("id", ""),
                    "image_url":     img_url,
                    "landing_url":   landing,  # contine deja tracking aff_code
                    "landing_raw":   unquote(b.get("url", "") or ""),
                    "width":         int(width) if width else 0,
                    "height":        int(height) if height else 0,
                    "merchant":      merchant_name,
                    "merchant_slug": (prog.get("slug") or merchant_name.lower().replace(" ", "-")),
                    "name":          b.get("name", "") or b.get("title", "") or b.get("category", ""),
                    "category":      b.get("category", ""),
                    "b_type":        b.get("b_type", "image"),
                })

            if len(items) < 50:
                break
            page += 1
            time.sleep(0.3)

        except Exception as e:
            print(f"  ❌ Eroare fetch bannere: {e}")
            break

    return banners[:MAX_BANNERS]


def main():
    print("=" * 50)
    print("fetch_banners.py — Bannere 2Performant")
    print("=" * 50)

    if not AFFILIATE_EMAIL:
        print("⚠️  TWOPEFORMANT_EMAIL nu e setat — skip.")
        return

    script_dir  = os.path.dirname(os.path.abspath(__file__))
    repo_root   = os.path.dirname(script_dir)
    output_path = os.path.join(repo_root, "frontend", "public", "banners.json")

    print("\n[1/2] Login...")
    if not sign_in():
        print("❌ Login esuat.")
        return

    print("\n[2/2] Descarc bannere...")
    banners = fetch_banners()
    print(f"  {len(banners)} bannere descarcate")

    # Grupeaza pe dimensiuni
    dim_map: dict[str, list] = {}
    for b in banners:
        key = f"{b['width']}x{b['height']}" if b['width'] and b['height'] else "unknown"
        if key not in dim_map:
            dim_map[key] = []
        dim_map[key].append(b)

    print(f"  Dimensiuni: {dict((k, len(v)) for k,v in dim_map.items())}")

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({
            "updated":  datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "count":    len(banners),
            "banners":  banners,
        }, f, ensure_ascii=False, indent=2)

    print(f"\n✅ {len(banners)} bannere salvate in banners.json")


if __name__ == "__main__":
    import sys
    print(f"Python {sys.version}")
    try:
        main()
    except Exception as e:
        import traceback
        print(f"\nFATAL: {e}")
        traceback.print_exc()
        print("\nScript esuat — continuam fara bannere.")
        sys.exit(0)
