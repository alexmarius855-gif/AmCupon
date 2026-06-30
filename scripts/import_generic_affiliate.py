"""
IMPORTER GENERIC MULTI-RETEA — un singur script pentru ORICE retea afiliata.
Configureaza maparea coloanelor per retea in NETWORKS si ruleaza. Nu mai scrie cod nou.

Utilizare:
    python scripts/import_generic_affiliate.py --network impact
    python scripts/import_generic_affiliate.py --network awin --file data/awin_export.csv
    python scripts/import_generic_affiliate.py --network cj
    python scripts/import_generic_affiliate.py --list   # arata retelele configurate

Dupa import → ruleaza merge_platforms.py ca sa intre in output.json.
"""

import csv
import json
import re
import os
import sys
import argparse
sys.stdout.reconfigure(encoding='utf-8')
from urllib.parse import urlparse

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
EXTRA_PATH = os.path.join(DATA_DIR, "extra_merchants.json")
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "output.json")

# ─── Mapare categorii universale → categorii AmCupon (slug-uri reale) ───────────
CATEGORY_MAP = {
    # tech / software
    "apps": ("Software & Aplicatii", "software-business"),
    "software": ("Software & Aplicatii", "software-business"),
    "website hosting": ("Hosting & Domenii", "hosting"),
    "hosting": ("Hosting & Domenii", "hosting"),
    "internet service provider": ("Servicii", "servicii"),
    "computers": ("Electronice & IT", "electronice"),
    "consumer electronics": ("Electronice & IT", "electronice"),
    "electronics": ("Electronice & IT", "electronice"),
    "accessories & peripherals": ("Electronice & IT", "electronice"),
    "images": ("AI Tools", "ai-tools"),
    "creative digital assets": ("AI Tools", "ai-tools"),
    "themes, code, graphics, video & more": ("Software & Aplicatii", "software-business"),
    # invatare
    "learning": ("Cursuri Online", "cursuri-online"),
    "education": ("Cursuri Online", "cursuri-online"),
    # fashion
    "women's apparel": ("Fashion", "fashion"),
    "men's apparel": ("Fashion", "fashion"),
    "clothing & accessories": ("Fashion", "fashion"),
    "shoes": ("Fashion", "fashion"),
    "bags & accessories": ("Fashion", "fashion"),
    "fashion": ("Fashion", "fashion"),
    "handmade goods": ("Diverse", "diverse"),
    # sport
    "sports apparel & accessories": ("Sport", "sport"),
    "sports & exercise equipment": ("Sport", "sport"),
    "outdoors & recreation": ("Sport", "sport"),
    "sports & outdoor": ("Sport", "sport"),
    "winter": ("Sport", "sport"),
    "recreational vehicles": ("Sport", "sport"),
    # travel
    "accommodations": ("Calatorie", "calatorie"),
    "transportation": ("Calatorie", "calatorie"),
    "tickets & shows": ("Calatorie", "calatorie"),
    "travel": ("Calatorie", "calatorie"),
    "mobile services & telecommunications": ("Calatorie", "calatorie"),
    "accessories & services": ("Calatorie", "calatorie"),
    # beauty
    "cosmetics & skin care": ("Frumusete", "frumusete"),
    "spa & personal grooming": ("Frumusete", "frumusete"),
    "fragrance": ("Frumusete", "frumusete"),
    "beauty": ("Frumusete", "frumusete"),
    "jewelry & watches": ("Bijuterii", "bijuterii"),
    # casa
    "home & garden": ("Casa & Gradina", "casa"),
    "furniture & home decor": ("Casa & Gradina", "casa"),
    "bed & bath": ("Casa & Gradina", "casa"),
    "home improvement": ("Casa & Gradina", "casa"),
    "kitchen & dining": ("Casa & Gradina", "casa"),
    "patio & garden": ("Casa & Gradina", "casa"),
    "household essentials & services": ("Casa & Gradina", "casa"),
    "home, pet & garden": ("Casa & Gradina", "casa"),
    "supplies & furniture": ("Casa & Gradina", "casa"),
    # animale
    "pet supplies": ("Animale de Companie", "animale"),
    "pet services": ("Animale de Companie", "animale"),
    # copii
    "games/toys": ("Copii & Jucarii", "copii"),
    "baby essentials": ("Copii & Jucarii", "copii"),
    "collectibles & hobbies": ("Copii & Jucarii", "copii"),
    # sanatate
    "diet & nutrition": ("Sanatate", "sanatate"),
    "first aid & pharmacy": ("Farmacie", "farmacie"),
    "health": ("Sanatate", "sanatate"),
    # financiar
    "loans & financial services": ("Carduri & Financiar", "carduri-bancare"),
    "credit cards, reporting & repair": ("Carduri & Financiar", "carduri-bancare"),
    "auctions": ("Online Mall", "online-mall"),
    # food
    "food & drink": ("Supermarket", "supermarket"),
    # business / b2b
    "b2b": ("Servicii Business", "servicii"),
    "legal": ("Servicii Business", "servicii"),
    # divertisment
    "movie & tv": ("Gaming & Divertisment", "jocuri"),
    "art & photography": ("AI Tools", "ai-tools"),
    "gifts & stationery": ("Cadouri", "idei-cadouri"),
    "shopping": ("Online Mall", "online-mall"),
    "parts & accessories": ("Auto-Moto", "piese-auto"),
}
DEFAULT_CATEGORY = ("Diverse", "diverse")

# ─── Configurare per retea ──────────────────────────────────────────────────────
# Fiecare retea: ce coloane CSV mapeaza la ce camp. Adauga retele noi aici.
NETWORKS = {
    "impact": {
        "file": "impact_campaigns.csv",
        "encoding": "utf-8-sig",
        "col_url": "Advertiser URL",
        "col_name": "Program Name",
        "col_category": "Advertiser Category",
        "col_link": "Tracking Link",
        "col_payout": "Payout",
        "col_status": "Contract Status",
        "status_active": "Active",
        "platforma": "impact",
    },
    "awin": {
        # Awin export: "My Account > Toolbox > Create-a-Feed" sau "Joined Programmes" CSV
        "file": "awin_export.csv",
        "encoding": "utf-8-sig",
        "col_url": "Advertiser Display URL",
        "col_name": "Advertiser Name",
        "col_category": "Primary Sector",
        "col_link": "Click Through Link",
        "col_payout": "Commission",
        "col_status": "Status",
        "status_active": "Active",
        "platforma": "awin",
    },
    "cj": {
        # CJ Affiliate: "Advertisers > Export joined" CSV
        "file": "cj_export.csv",
        "encoding": "utf-8-sig",
        "col_url": "Advertiser URL",
        "col_name": "Advertiser Name",
        "col_category": "Category",
        "col_link": "Link",
        "col_payout": "Actions",
        "col_status": "Relationship Status",
        "status_active": "Joined",
        "platforma": "cj",
    },
    "admitad": {
        "file": "admitad_export.csv",
        "encoding": "utf-8-sig",
        "col_url": "Site",
        "col_name": "Name",
        "col_category": "Categories",
        "col_link": "GoToLink",
        "col_payout": "Rate",
        "col_status": "Status",
        "status_active": "active",
        "platforma": "admitad",
    },
}


def parse_payout(payout_str):
    if not payout_str:
        return "Variabil"
    percents = re.findall(r'(\d+(?:\.\d+)?)\s*%', payout_str)
    if percents:
        nums = [float(p) for p in percents if float(p) > 0]
        if nums:
            return f"{int(max(nums))}% comision"
    fixed = re.findall(r'(?:USD|EUR|GBP|\$|€|£)\s*(\d+(?:\.\d+)?)', payout_str)
    if fixed:
        return f"${fixed[0]} per conversie"
    return "Variabil"


def score_from_payout(payout_str):
    if not payout_str:
        return 50
    percents = re.findall(r'(\d+(?:\.\d+)?)\s*%', payout_str)
    if percents:
        nums = [float(p) for p in percents if float(p) > 0]
        if nums:
            m = max(nums)
            if m >= 50: return 82
            if m >= 30: return 78
            if m >= 20: return 72
            if m >= 10: return 65
            if m >= 5:  return 58
            return 52
    fixed = re.findall(r'(\d+(?:\.\d+)?)', payout_str)
    if fixed:
        v = float(fixed[0])
        if v >= 50: return 75
        if v >= 10: return 65
    return 50


def domain_from_url(url):
    if not url:
        return ""
    url = url.strip()
    if not url.startswith("http"):
        url = "https://" + url
    try:
        domain = urlparse(url).netloc.lower()
        return re.sub(r'^www\.', '', domain)
    except Exception:
        return ""


def load_existing_slugs():
    existing = set()
    for path in (EXTRA_PATH, OUTPUT_PATH):
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                items = json.load(f)
            for m in items:
                d = domain_from_url(m.get('url', ''))
                if d:
                    existing.add(d)
                if m.get('magazin'):
                    existing.add(m['magazin'].lower())
    return existing


def build_merchant(row, cfg, existing):
    url = (row.get(cfg["col_url"]) or "").strip()
    name = (row.get(cfg["col_name"]) or "").strip()
    category = (row.get(cfg["col_category"]) or "").strip()
    link = (row.get(cfg["col_link"]) or "").strip()
    payout = (row.get(cfg["col_payout"]) or "").strip()

    if not link or not url:
        return None

    domain = domain_from_url(url)
    if not domain or domain in existing:
        return None

    cat_name, cat_slug = CATEGORY_MAP.get(category.lower(), DEFAULT_CATEGORY)
    scor = score_from_payout(payout)
    existing.add(domain)

    return {
        "magazin": domain,
        "url": url if url.startswith("http") else f"https://{url}",
        "url_afiliat": link,
        "logo_url": f"https://logo.clearbit.com/{domain}",
        "categorie": cat_name,
        "categorie_slug": cat_slug,
        "comision": parse_payout(payout),
        "rank": None,
        "scor_afiliere": scor,
        "scor_final": scor,
        "prioritate": "standard",
        "canal_recomandat": "Content, Social",
        "sales_number": 0,
        "trend": 0,
        "are_promotie": False,
        "cod_cupon": False,
        "zile_ramase": 0,
        "promotii": [],
        "folosit_de": 0,
        "procent_succes": 80,
        "exclusiv": False,
        "platforma": cfg["platforma"],
        "program_name": name,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--network", help="Numele retelei configurate (impact, awin, cj, admitad)")
    parser.add_argument("--file", help="Cale CSV (suprascrie default-ul retelei)")
    parser.add_argument("--list", action="store_true", help="Arata retelele configurate")
    args = parser.parse_args()

    if args.list or not args.network:
        print("Retele configurate:")
        for k, v in NETWORKS.items():
            default_file = os.path.join(DATA_DIR, v["file"])
            exists = "✓" if os.path.exists(default_file) else "✗ (lipsa CSV)"
            print(f"  {k:10s} → {v['file']:28s} {exists}")
        print("\nUtilizare: python scripts/import_generic_affiliate.py --network <nume> [--file cale.csv]")
        return

    network = args.network.lower()
    if network not in NETWORKS:
        print(f"Retea necunoscuta: {network}. Disponibile: {', '.join(NETWORKS)}")
        return

    cfg = NETWORKS[network]
    csv_path = args.file or os.path.join(DATA_DIR, cfg["file"])
    if not os.path.exists(csv_path):
        print(f"CSV lipsa: {csv_path}")
        print(f"Exporta din dashboard-ul {network} si pune-l acolo (sau foloseste --file).")
        return

    print(f"=== Import {network} din {os.path.basename(csv_path)} ===")
    existing = load_existing_slugs()
    print(f"Domenii existente: {len(existing)}")

    with open(csv_path, 'r', encoding=cfg["encoding"]) as f:
        rows = list(csv.DictReader(f))

    # Filtreaza pe status activ daca exista coloana
    status_col = cfg.get("col_status")
    if status_col and rows and status_col in rows[0]:
        active = [r for r in rows if (r.get(status_col) or "").strip().lower() == cfg["status_active"].lower()]
    else:
        active = rows
    print(f"Randuri: {len(rows)} total, {len(active)} active")

    new_merchants = [m for m in (build_merchant(r, cfg, existing) for r in active) if m]
    print(f"Magazine noi: {len(new_merchants)}")

    # Salveaza in extra_merchants
    extras = []
    if os.path.exists(EXTRA_PATH):
        with open(EXTRA_PATH, 'r', encoding='utf-8') as f:
            extras = json.load(f)
    old = len(extras)
    extras.extend(new_merchants)
    with open(EXTRA_PATH, 'w', encoding='utf-8') as f:
        json.dump(extras, f, ensure_ascii=False, indent=2)

    print(f"extra_merchants: {old} -> {len(extras)} (+{len(new_merchants)})")
    cats = {}
    for m in new_merchants:
        cats[m['categorie_slug']] = cats.get(m['categorie_slug'], 0) + 1
    if cats:
        print("Distributie categorii:")
        for k, v in sorted(cats.items(), key=lambda x: -x[1]):
            print(f"  {k}: {v}")
    print("\nUrmator pas: cd scripts && python merge_platforms.py")


if __name__ == "__main__":
    main()
