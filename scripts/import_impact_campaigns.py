"""
Import toate programele active din Impact.com in extra_merchants.json.
Citeste data/impact_campaigns.csv (exportat din Impact dashboard → Campaigns → Export).
Ruleaza: python scripts/import_impact_campaigns.py
"""

import csv
import json
import re
import os
import sys
sys.stdout.reconfigure(encoding='utf-8')
from urllib.parse import urlparse

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
CSV_PATH = os.path.join(DATA_DIR, "impact_campaigns.csv")
EXTRA_PATH = os.path.join(DATA_DIR, "extra_merchants.json")
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "output.json")

# Mapare categorii Impact → categorii AmCupon
CATEGORY_MAP = {
    "Apps": ("Software & Aplicatii", "software-business"),
    "Website Hosting": ("Hosting & Domenii", "hosting"),
    "Software": ("Software & Aplicatii", "software-business"),
    "Learning": ("Cursuri Online", "cursuri-online"),
    "B2B": ("Servicii Business", "servicii"),
    "Women's Apparel": ("Fashion", "fashion"),
    "Men's Apparel": ("Fashion", "fashion"),
    "Clothing & Accessories": ("Fashion", "fashion"),
    "Sports Apparel & Accessories": ("Sport", "sport"),
    "Sports & Exercise Equipment": ("Sport", "sport"),
    "Outdoors & Recreation": ("Sport", "sport"),
    "Sports & Outdoor": ("Sport", "sport"),
    "Winter": ("Sport", "sport"),
    "Shoes": ("Fashion", "fashion"),
    "Bags & Accessories": ("Fashion", "fashion"),
    "Accommodations": ("Calatorie", "calatorie"),
    "Transportation": ("Calatorie", "calatorie"),
    "Tickets & Shows": ("Calatorie", "calatorie"),
    "Consumer Electronics": ("Electronice & IT", "electronice"),
    "Computers": ("Electronice & IT", "electronice"),
    "Accessories & Peripherals": ("Electronice & IT", "electronice"),
    "Parts & Accessories": ("Electronice & IT", "electronice"),
    "Collectibles & Hobbies": ("Electronice & IT", "electronice"),
    "Cosmetics & Skin Care": ("Frumusete", "frumusete"),
    "Spa & Personal Grooming": ("Frumusete", "frumusete"),
    "Fragrance": ("Frumusete", "frumusete"),
    "Jewelry & Watches": ("Bijuterii", "bijuterii"),
    "Home & Garden": ("Casa & Gradina", "casa"),
    "Furniture & Home Decor": ("Casa & Gradina", "casa"),
    "Bed & Bath": ("Casa & Gradina", "casa"),
    "Home Improvement": ("Casa & Gradina", "casa"),
    "Kitchen & Dining": ("Casa & Gradina", "casa"),
    "Patio & Garden": ("Casa & Gradina", "casa"),
    "Household Essentials & Services": ("Casa & Gradina", "casa"),
    "Home, Pet & Garden": ("Casa & Gradina", "casa"),
    "Pet Supplies": ("Animale de Companie", "animale"),
    "Pet Services": ("Animale de Companie", "animale"),
    "Games/Toys": ("Copii & Jucarii", "copii"),
    "Baby Essentials": ("Copii & Jucarii", "copii"),
    "Diet & Nutrition": ("Sanatate", "sanatate"),
    "First Aid & pharmacy": ("Farmacie", "farmacie"),
    "Loans & Financial Services": ("Carduri & Financiar", "carduri-bancare"),
    "Credit Cards, Reporting & Repair": ("Carduri & Financiar", "carduri-bancare"),
    "Food & Drink": ("Supermarket", "supermarket"),
    "Mobile Services & Telecommunications": ("Servicii", "servicii"),
    "Internet Service Provider": ("Servicii", "servicii"),
    "Accessories & Services": ("Servicii", "servicii"),
    "Images": ("AI Tools", "ai-tools"),
    "Themes, Code, Graphics, Video & more": ("Software & Aplicatii", "software-business"),
    "Art & Photography": ("AI Tools", "ai-tools"),
    "Creative Digital Assets": ("AI Tools", "ai-tools"),
    "Legal": ("Servicii Business", "servicii"),
    "Shopping": ("Online Mall", "online-mall"),
    "Auctions": ("Online Mall", "online-mall"),
    "Movie & TV": ("Gaming & Divertisment", "jocuri"),
    "Recreational Vehicles": ("Sport", "sport"),
    "Handmade Goods": ("Diverse", "diverse"),
    "Gifts & Stationery": ("Cadouri", "idei-cadouri"),
}

DEFAULT_CATEGORY = ("Diverse", "diverse")


def parse_payout(payout_str):
    """Extrage comisionul principal din string-ul Payout."""
    if not payout_str:
        return "Variabil"

    # Cauta procentaje
    percents = re.findall(r'(\d+(?:\.\d+)?)\s*%', payout_str)
    if percents:
        nums = [float(p) for p in percents if float(p) > 0]
        if nums:
            max_p = max(nums)
            if max_p >= 50:
                return f"{int(max_p)}% comision"
            elif max_p >= 20:
                return f"{int(max_p)}% comision"
            elif max_p >= 10:
                return f"{int(max_p)}% comision"
            else:
                return f"{int(max_p)}% comision"

    # Cauta sume fixe USD/EUR
    fixed = re.findall(r'(?:USD|EUR|\$|€)\s*(\d+(?:\.\d+)?)', payout_str)
    if fixed:
        return f"${fixed[0]} per conversie"

    return "Variabil"


def score_from_payout(payout_str):
    """Calculeaza scorul din comision."""
    if not payout_str:
        return 50
    percents = re.findall(r'(\d+(?:\.\d+)?)\s*%', payout_str)
    if percents:
        nums = [float(p) for p in percents if float(p) > 0]
        if nums:
            m = max(nums)
            if m >= 50:
                return 82
            elif m >= 30:
                return 78
            elif m >= 20:
                return 72
            elif m >= 10:
                return 65
            elif m >= 5:
                return 58
            return 52
    # Suma fixa
    fixed = re.findall(r'(\d+(?:\.\d+)?)', payout_str)
    if fixed:
        v = float(fixed[0])
        if v >= 50:
            return 75
        elif v >= 10:
            return 65
    return 50


def domain_from_url(url):
    """Extrage domeniul fara www."""
    if not url:
        return ""
    url = url.strip()
    if not url.startswith("http"):
        url = "https://" + url
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        domain = re.sub(r'^www\.', '', domain)
        return domain
    except Exception:
        return url


def load_existing_slugs():
    """Incarca sluguri/domenii deja existente ca sa evitam duplicate."""
    existing = set()

    # Din extra_merchants.json
    if os.path.exists(EXTRA_PATH):
        with open(EXTRA_PATH, 'r', encoding='utf-8') as f:
            extras = json.load(f)
        for m in extras:
            d = domain_from_url(m.get('url', ''))
            if d:
                existing.add(d)
            existing.add(m.get('magazin', '').lower())

    # Din output.json
    if os.path.exists(OUTPUT_PATH):
        with open(OUTPUT_PATH, 'r', encoding='utf-8') as f:
            output = json.load(f)
        for m in output:
            d = domain_from_url(m.get('url', ''))
            if d:
                existing.add(d)

    return existing


def build_merchant(row, existing_slugs):
    """Construieste un entry de magazin din un rand CSV Impact."""
    adv_url = row.get('Advertiser URL', '').strip()
    prog_name = row.get('Program Name', '').strip()
    category_raw = row.get('Advertiser Category', '').strip()
    tracking_link = row.get('Tracking Link', '').strip()
    payout = row.get('Payout', '').strip()
    allows_deep = row.get('Allows Deep Linking', 'false').strip().lower() == 'true'

    if not tracking_link or not adv_url:
        return None

    domain = domain_from_url(adv_url)
    if not domain:
        return None

    # Skip deja existente
    if domain in existing_slugs:
        return None

    # Slug = domeniul
    slug = domain

    # Categorie
    cat_name, cat_slug = CATEGORY_MAP.get(category_raw, DEFAULT_CATEGORY)

    # Comision si scor
    comision_str = parse_payout(payout)
    scor = score_from_payout(payout)

    # Adaugam slugul ca sa nu adaugam duplicat in acelasi run
    existing_slugs.add(domain)

    return {
        "magazin": domain,
        "url": adv_url if adv_url.startswith("http") else f"https://{adv_url}",
        "url_afiliat": tracking_link,
        "logo_url": f"https://logo.clearbit.com/{domain}",
        "categorie": cat_name,
        "categorie_slug": cat_slug,
        "comision": comision_str,
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
        "platforma": "impact",
        "program_name": prog_name,
        "allows_deep_linking": allows_deep,
    }


def main():
    print("=== Import Impact Campaigns ===")

    # Incarca existente
    existing_slugs = load_existing_slugs()
    print(f"Sluguri/domenii existente: {len(existing_slugs)}")

    # Citeste CSV
    with open(CSV_PATH, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    active_rows = [r for r in rows if r.get('Contract Status', '').strip() == 'Active']
    print(f"Randuri CSV: {len(rows)} total, {len(active_rows)} active")

    # Construieste entries noi
    new_merchants = []
    skipped_dup = 0
    skipped_no_url = 0

    for row in active_rows:
        m = build_merchant(row, existing_slugs)
        if m is None:
            adv_url = row.get('Advertiser URL', '').strip()
            if not adv_url:
                skipped_no_url += 1
            else:
                skipped_dup += 1
        else:
            new_merchants.append(m)

    print(f"Sarite duplicate: {skipped_dup}")
    print(f"Sarite fara URL: {skipped_no_url}")
    print(f"Magazine noi de adaugat: {len(new_merchants)}")

    # Incarca extra_merchants existente
    if os.path.exists(EXTRA_PATH):
        with open(EXTRA_PATH, 'r', encoding='utf-8') as f:
            extras = json.load(f)
    else:
        extras = []

    old_count = len(extras)
    extras.extend(new_merchants)

    # Salveaza
    with open(EXTRA_PATH, 'w', encoding='utf-8') as f:
        json.dump(extras, f, ensure_ascii=False, indent=2)

    print(f"\nExtra_merchants: {old_count} → {len(extras)} (+{len(new_merchants)})")

    # Afiseaza sample
    print("\nSample magazine adaugate:")
    for m in new_merchants[:10]:
        print(f"  {m['magazin']} | {m['categorie_slug']} | {m['comision']}")

    # Statistici pe categorie
    cat_counts = {}
    for m in new_merchants:
        c = m['categorie_slug']
        cat_counts[c] = cat_counts.get(c, 0) + 1
    print("\nDistributie categorii (magazine noi):")
    for k, v in sorted(cat_counts.items(), key=lambda x: -x[1]):
        print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
