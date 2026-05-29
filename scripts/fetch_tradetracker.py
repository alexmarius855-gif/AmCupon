"""
Fetch magazine si promotii de pe TradeTracker Romania.

TradeTracker REST API v3 — documentatie: https://affiliate.tradetracker.com/developers/api

SETUP:
  1. Creeaza cont la https://affiliate.tradetracker.com
  2. Dashboard → API → genereaza Site UUID + API Key
  3. Seteaza variabilele de mediu:
       TRADETRACKER_SITE_ID   = site UUID (ex: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
       TRADETRACKER_API_KEY   = cheia API

OUTPUT: ../data/tradetracker_output.json
"""

import json
import os
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime

# ─── Configuratie ─────────────────────────────────────────────────────────────

SITE_ID  = os.environ.get("TRADETRACKER_SITE_ID", "")
API_KEY  = os.environ.get("TRADETRACKER_API_KEY", "")

BASE_URL = "https://api.tradetracker.com/rest/affiliate"
COUNTRY  = "RO"   # Romania

OUTPUT   = "../data/tradetracker_output.json"

# Mapping categorie TradeTracker → categorie_slug AmCupon
CAT_MAP = {
    "Fashion":                  "fashion",
    "Clothing":                 "fashion",
    "Sports & Outdoors":        "sports-outdoors",
    "Beauty & Health":          "health-personal-care",
    "Personal Care":            "health-personal-care",
    "Electronics & Computers":  "electronics-itc",
    "Home & Garden":            "home-garden",
    "Books & Media":            "books",
    "Automotive":               "automotive",
    "Babies & Kids":            "babies-kids-toys",
    "Toys & Hobbies":           "babies-kids-toys",
    "Gifts & Flowers":          "gifts-flowers",
    "Jewelry":                  "jewelry",
    "Games & Entertainment":    "games",
    "Pharmacy":                 "pharma",
    "Health":                   "pharma",
    "Pets":                     "pet-supplies",
    "Supermarket":              "hypermarket-groceries",
    "Food & Beverages":         "hypermarket-groceries",
    "Telecom":                  "telecom",
    "Travel":                   "travel",
}

def cat_slug(raw: str) -> str:
    for key, slug in CAT_MAP.items():
        if key.lower() in raw.lower():
            return slug
    return raw.lower().replace(" ", "-").replace("&", "").replace("  ", "-")


def api_get(endpoint: str, params: dict = {}) -> dict:
    """GET request la TradeTracker API cu Basic Auth."""
    import base64
    qs = urllib.parse.urlencode(params)
    url = f"{BASE_URL}{endpoint}?{qs}" if qs else f"{BASE_URL}{endpoint}"

    cred = base64.b64encode(f"{SITE_ID}:{API_KEY}".encode()).decode()
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Basic {cred}",
            "Accept": "application/json",
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print(f"  ERR {endpoint}: {e}")
        return {}


def fetch_programs() -> list[dict]:
    """Preia toate programele (magazinele) aprobate."""
    result = []
    page = 1
    per_page = 100

    while True:
        data = api_get("/campaigns/", {
            "countryCode": COUNTRY,
            "status": "active",
            "affiliateStatus": "accepted",
            "limit": per_page,
            "page": page,
        })

        items = data.get("data", []) or data.get("items", []) or (data if isinstance(data, list) else [])
        if not items:
            break

        result.extend(items)
        print(f"  Pagina {page}: +{len(items)} programe")

        if len(items) < per_page:
            break
        page += 1
        time.sleep(0.3)

    return result


def fetch_promotions(campaign_id: str) -> list[dict]:
    """Preia promotiile active pentru un program."""
    data = api_get(f"/campaigns/{campaign_id}/campaignNewsItems/", {
        "limit": 50,
    })
    items = data.get("data", []) or data.get("items", []) or (data if isinstance(data, list) else [])
    return items


def domain_from_url(url: str) -> str:
    """Extrage domeniul din URL: 'https://www.example.ro/...' → 'example.ro'"""
    try:
        netloc = urllib.parse.urlparse(url).netloc
        return netloc.replace("www.", "").lower()
    except Exception:
        return url


def build_aff_link(url: str, campaign_id: str) -> str:
    """Construieste link afiliat TradeTracker."""
    encoded = urllib.parse.quote(url, safe="")
    return f"https://tc.tradetracker.net/?c={campaign_id}&m=1&a={SITE_ID}&r=&u={encoded}"


def main():
    if not SITE_ID or not API_KEY:
        print("⚠️  TRADETRACKER_SITE_ID / TRADETRACKER_API_KEY nu sunt setate.")
        print("   Inregistreaza-te la https://affiliate.tradetracker.com si seteaza env vars.")
        sys.exit(0)

    print(f"📡 Conectare TradeTracker ({COUNTRY})...")

    programs = fetch_programs()
    print(f"\nTotal programe aprobate: {len(programs)}")

    if not programs:
        print("❌ Niciun program gasit. Verificare credentiale sau aprobare cont.")
        sys.exit(1)

    output: list[dict] = []
    for prog in programs:
        # TradeTracker campanie poate folosi diferite chei — normalizare
        camp_id   = str(prog.get("campaignId", prog.get("id", "")))
        name      = prog.get("name", prog.get("campaignName", ""))
        website   = prog.get("websiteURL", prog.get("url", prog.get("website", "")))
        cat_raw   = prog.get("category", prog.get("type", ""))
        logo      = prog.get("logoURL", prog.get("logo", ""))
        comm      = prog.get("commission", prog.get("commissionFixed", ""))

        if not website:
            continue

        slug = domain_from_url(website)
        if not slug or "." not in slug:
            continue

        # Promotii
        promos_raw = fetch_promotions(camp_id)
        promotii: list[dict] = []
        are_promotie = False
        are_cod = False

        for p in promos_raw:
            title  = p.get("title", p.get("name", ""))
            code   = p.get("voucherCode", p.get("code", ""))
            url    = p.get("landingPageURL", p.get("url", website))
            end_dt = p.get("stopDate", p.get("endDate", ""))

            zile = 30
            if end_dt:
                try:
                    end = datetime.fromisoformat(end_dt.replace("Z", "+00:00"))
                    now = datetime.now(end.tzinfo)
                    zile = max(0, (end - now).days)
                except Exception:
                    pass

            if zile == 0:
                continue

            promotii.append({
                "nume": title,
                "cod_cupon": code or "",
                "landing_page": url,
                "zile_ramase": zile,
            })
            are_promotie = True
            if code:
                are_cod = True

        time.sleep(0.1)

        output.append({
            "magazin":       slug,
            "url":           website,
            "url_afiliat":   build_aff_link(website, camp_id),
            "logo_url":      logo or None,
            "categorie":     cat_raw or "General",
            "categorie_slug": cat_slug(cat_raw),
            "scor_final":    50 + (20 if are_promotie else 0),
            "are_promotie":  are_promotie,
            "cod_cupon":     are_cod,
            "promotii":      promotii,
            "trend":         0,
            "platforma":     "tradetracker",
        })

    cu_promo = sum(1 for m in output if m["are_promotie"])
    cu_cod   = sum(1 for m in output if m["cod_cupon"])

    os.makedirs("../data", exist_ok=True)
    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n✅ TradeTracker salvat: {len(output)} magazine")
    print(f"   {cu_promo} cu promotii active, {cu_cod} cu cod cupon")
    print(f"   → {OUTPUT}")


if __name__ == "__main__":
    main()
