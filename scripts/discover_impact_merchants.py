"""
Descopera TOATE campaniile active/aprobate pe Impact.com pentru contul nostru
si adauga automat in extra_merchants.json cele care nu exista deja.

Diferenta fata de fetch_impact_api.py: acela doar ACTUALIZEAZA tracking link-uri
pentru magazine deja prezente (platforma="impact"). Acest script DESCOPERA
campanii noi pe care le-am putea rata din lista statica IMPACT_BRANDS si le
adauga cu date reale (nume, url, categorie ghicita, tracking link real din Ads).

Filtre de relevanta (consistente cu IRRELEVANT_FOREIGN din merge_platforms.py):
nu adaugam branduri B2B/irelevante pentru un consumator RO (hoteluri straine,
plugin-uri WordPress, CBD, prop money etc.) — doar pentru ca exista o campanie
activa nu inseamna ca merita pe un site de cupoane romanesc.

Necesita IMPACT_ACCOUNT_SID / IMPACT_AUTH_TOKEN (GitHub Secrets in CI).
"""

import json
import os
import re
import time
import requests
from requests.auth import HTTPBasicAuth
from urllib.parse import urlparse

ACCOUNT_SID = os.environ.get("IMPACT_ACCOUNT_SID", "")
AUTH_TOKEN = os.environ.get("IMPACT_AUTH_TOKEN", "")
BASE = "https://api.impact.com"
HEADERS = {"Accept": "application/json"}

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "extra_merchants.json")

AUTH = None

# Brand-uri/categorii clar irelevante pt un consumator RO pe site de cupoane —
# noise tipic din reteaua Impact (B2B global, travel exotic, plugin-uri dev,
# servicii financiare obscure). Daca numele/categoria campaniei matcheaza,
# o sarim. Lista e intentionat conservatoare (keyword, nu domeniu exact) ca
# sa prinda si campanii noi cu profil similar.
IRRELEVANT_KEYWORDS = [
    "hotel", "resort", "casino", "crypto exchange", "prop money", "cbd",
    "wordpress plugin", "wp plugin", "elementor", "divi", "themeforest",
    "esim", "sportsbook", "betting", "forex broker", "binary option",
]

# Domenii deja triate manual ca irelevante (sincronizat cu merge_platforms.py)
IRRELEVANT_DOMAINS = {
    "anantara.com", "arkuda.digital", "bdthemes.com", "britishcouncil.org",
    "cariloha.com", "clean.email", "cuyana.com", "debutify.com", "getmailbird.com",
    "hubspot.com", "justfit.app", "livelarq.com", "magoosh.com", "martinic.com",
    "maxbone.com", "metabox.io", "neliosoftware.com", "nuleafnaturals.com",
    "propmoney.com", "sorare.com", "sportsline.com", "tempo.fit",
    "terminalserviceplus.com", "termly.io", "ticketliquidator.com", "treezy.de",
    "tribesigns.com", "uperfectmonitor.com", "uphold.com", "vistasocial.com",
    "vivaia.com", "wildbird.com", "wyndhamhotels.com", "rumpl.com", "alamy.com",
    "oreilly.com", "esimx.com", "domain.com", "bluehost.com", "youngelectricbikes.com",
}

_CAT_KEYWORDS = [
    ("fashion", ["fashion", "cloth", "shoe", "apparel", "wear", "style", "moda"]),
    ("beauty", ["beauty", "cosmetic", "skincare", "makeup", "hair", "parfum"]),
    ("health-personal-care", ["health", "vitamin", "supplement", "wellness", "fitness", "optic"]),
    ("home-garden", ["home", "furniture", "decor", "garden", "kitchen", "mattress"]),
    ("electronics-itc", ["tech", "electronic", "gadget", "software", "saas", "vpn",
                          "antivirus", "hosting", "domain", "app", "ai ", "cloud"]),
    ("babies-kids-toys", ["kid", "baby", "toy", "child"]),
    ("sports-outdoors", ["sport", "outdoor", "bike", "fitness gear"]),
    ("books", ["book", "ebook", "audiobook", "course", "learning", "education"]),
    ("gifts-flowers", ["flower", "gift"]),
    ("telecom", ["telecom", "mobile carrier", "sim"]),
    ("pet-supplies", ["pet ", "dog", "cat food"]),
    ("automotive", ["car", "auto", "vehicle"]),
]
_CAT_LABELS = {
    "fashion": "Fashion", "beauty": "Beauty",
    "health-personal-care": "Sanatate & Ingrijire",
    "home-garden": "Casa & Gradina", "electronics-itc": "Electronice IT&C",
    "babies-kids-toys": "Copii & Jucarii", "sports-outdoors": "Sport",
    "books": "Carti", "gifts-flowers": "Cadouri & Flori",
    "telecom": "Telecom", "pet-supplies": "Animale", "automotive": "Auto",
}


def guess_category(name, url):
    text = f"{name} {url}".lower()
    for cat_slug, kws in _CAT_KEYWORDS:
        if any(k in text for k in kws):
            return _CAT_LABELS[cat_slug], cat_slug
    return "Diverse", "online-mall"


def is_irrelevant(name, url):
    text = f"{name} {url}".lower()
    if any(kw in text for kw in IRRELEVANT_KEYWORDS):
        return True
    domain = urlparse(url if "//" in url else "//" + url).netloc.lower().split(":")[0]
    if domain.startswith("www."):
        domain = domain[4:]
    return domain in IRRELEVANT_DOMAINS


def api_get(path, params=None):
    r = requests.get(f"{BASE}{path}", auth=AUTH, headers=HEADERS, params=params or {})
    r.raise_for_status()
    return r.json()


def get_all_campaigns():
    campaigns = []
    page = 1
    while True:
        data = api_get(f"/Mediapartners/{ACCOUNT_SID}/Campaigns", {"PageSize": 100, "Page": page})
        batch = data.get("Campaigns", [])
        if not batch:
            break
        campaigns.extend(batch)
        total = int(data.get("@total", 0))
        if len(campaigns) >= total:
            break
        page += 1
        time.sleep(0.3)
    return campaigns


def is_approved(campaign):
    """Campania trebuie sa fie activa/aprobata pt acest mediapartner, nu doar
    listata (poate fi PENDING/DECLINED/EXPIRED). Cautam orice camp de status
    cunoscut; daca nu gasim niciunul, includem (endpoint-ul /Mediapartners/.../
    Campaigns oricum scopeaza doar campaniile asociate contului nostru)."""
    for key in ("ContractStatus", "Status", "CampaignStatus", "MediaPartnerStatus"):
        val = campaign.get(key)
        if val:
            return str(val).lower() in ("active", "approved", "1", "true")
    return True


def get_ads_for_campaign(campaign_id):
    try:
        data = api_get(f"/Mediapartners/{ACCOUNT_SID}/Ads", {
            "CampaignId": campaign_id, "PageSize": 10, "Type": "TEXT_LINK",
        })
        return data.get("Ads", [])
    except Exception:
        return []


def find_best_tracking_link(ads):
    for ad in ads:
        tl = ad.get("TrackingLink", "")
        if tl and tl.startswith("http"):
            return tl
    return ""


def make_entry(name, url, url_afiliat, categorie, categorie_slug):
    return {
        "magazin": name,
        "url": url,
        "url_afiliat": url_afiliat,
        "logo_url": "",
        "categorie": categorie,
        "categorie_slug": categorie_slug,
        "comision": "Variabil",
        "rank": None,
        "scor_afiliere": 50,
        "scor_final": 50,
        "prioritate": "standard",
        "canal_recomandat": "Content, SEO, Social",
        "sales_number": 0,
        "trend": 0,
        "are_promotie": False,
        "cod_cupon": False,
        "zile_ramase": 0,
        "promotii": [],
        "folosit_de": 0,
        "procent_succes": 85,
        "exclusiv": False,
        "platforma": "impact",
        "descriere": "",
    }


def main():
    global AUTH
    if not ACCOUNT_SID or not AUTH_TOKEN:
        print("EROARE: IMPACT_ACCOUNT_SID / IMPACT_AUTH_TOKEN lipsesc — skip discovery.")
        return
    AUTH = HTTPBasicAuth(ACCOUNT_SID, AUTH_TOKEN)

    with open(DATA_PATH, "r", encoding="utf-8") as f:
        merchants = json.load(f)

    existing_domains = set()
    for m in merchants:
        url = m.get("url", "")
        domain = urlparse(url if "//" in url else "//" + url).netloc.lower().split(":")[0]
        if domain.startswith("www."):
            domain = domain[4:]
        if domain:
            existing_domains.add(domain)

    print("Fetch campanii Impact.com (discovery)...")
    campaigns = get_all_campaigns()
    print(f"  {len(campaigns)} campanii gasite in total")

    added = 0
    skipped_irrelevant = 0
    skipped_existing = 0
    skipped_unapproved = 0

    for c in campaigns:
        if not is_approved(c):
            skipped_unapproved += 1
            continue

        name = (c.get("AdvertiserName") or c.get("CampaignName") or "").strip()
        url = (c.get("CampaignUrl") or c.get("AdvertiserUrl") or "").strip()
        if not name or not url:
            continue

        domain = urlparse(url if "//" in url else "//" + url).netloc.lower().split(":")[0]
        if domain.startswith("www."):
            domain = domain[4:]

        if domain in existing_domains:
            skipped_existing += 1
            continue

        if is_irrelevant(name, url):
            skipped_irrelevant += 1
            continue

        ads = get_ads_for_campaign(str(c.get("CampaignId", "")))
        link = find_best_tracking_link(ads) or url
        categorie, categorie_slug = guess_category(name, url)

        merchants.append(make_entry(name, url, link, categorie, categorie_slug))
        existing_domains.add(domain)
        added += 1
        print(f"  + {name:30s} -> {link[:60]}")
        time.sleep(0.1)

    if added:
        with open(DATA_PATH, "w", encoding="utf-8") as f:
            json.dump(merchants, f, ensure_ascii=False, indent=2)

    print(f"\nGata! {added} magazine noi adaugate din Impact.com.")
    print(f"  Sarite — deja existau: {skipped_existing}")
    print(f"  Sarite — irelevante pt RO: {skipped_irrelevant}")
    print(f"  Sarite — neaprobate: {skipped_unapproved}")


if __name__ == "__main__":
    main()
