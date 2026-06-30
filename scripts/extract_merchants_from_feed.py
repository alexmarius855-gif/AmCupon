"""
Extrage magazinele ACCEPTATE din feed-ul de produse 2Performant si adauga-le pe cele
lipsa in extra_merchants.json cu link afiliat real (quicklink universal).

De ce: produsele vin DOAR pentru programele la care esti acceptat. Deci campaign_name-urile
unice din feed = lista reala de magazine acceptate — inclusiv cele pe care API-ul
/affiliate/programs.json NU le aduce (limitare cunoscuta 2P). Asa recuperam zeci de magazine.

Utilizare:
    python scripts/extract_merchants_from_feed.py data/2p_feed_full.csv
Apoi: cd scripts && python merge_platforms.py
"""

import csv
import json
import os
import sys
import re
import xml.etree.ElementTree as ET
from urllib.parse import quote, urlparse

sys.stdout.reconfigure(encoding="utf-8")
csv.field_size_limit(10 * 1024 * 1024)  # feed-ul are descrieri lungi

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
EXTRA_PATH = os.path.join(DATA_DIR, "extra_merchants.json")
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "output.json")

AFF_CODE = "541547473"
QUICKLINK_UNIQUE = "bb3071a7d"  # token REAL universal (vezi CLAUDE.md — NU folosi md5)


def build_quicklink(target_url: str) -> str:
    encoded = quote(target_url, safe="")
    return (
        "https://event.2performant.com/events/click?ad_type=quicklink"
        f"&aff_code={AFF_CODE}&unique={QUICKLINK_UNIQUE}&redirect_to={encoded}"
    )


# Ghicire categorie din numele domeniului (heuristica simpla, fallback diverse)
CAT_KEYWORDS = {
    "fashion": ["fashion", "moda", "haine", "dress", "shoes", "incaltaminte", "textil", "imbracaminte"],
    "frumusete": ["beauty", "cosmetic", "parfum", "makeup", "ingrijire", "cosmetice"],
    "electronice": ["electro", "tech", "pc", "it", "computer", "gadget", "telefon", "evomag", "mobil"],
    "casa": ["casa", "home", "mobila", "decor", "gradina", "garden", "bricolaj", "menaj"],
    "sport": ["sport", "fitness", "outdoor", "bike", "fishing", "pescuit"],
    "copii": ["copii", "baby", "jucarii", "kids", "toys", "bebe"],
    "animale": ["pet", "animal", "zoo", "caine", "pisica"],
    "sanatate": ["sanatate", "health", "suplimente", "vitamine", "pharma", "farmac"],
    "carti": ["carte", "book", "libr", "edituri"],
    "auto-moto": ["auto", "moto", "anvelope", "piese"],
    "supermarket": ["food", "aliment", "supermarket", "vin", "wine", "cafea"],
    "bijuterii": ["bijuteri", "jewel", "ceas", "watch"],
}


def guess_category(domain: str):
    d = domain.lower()
    for slug, kws in CAT_KEYWORDS.items():
        if any(k in d for k in kws):
            labels = {
                "fashion": "Fashion", "frumusete": "Frumusete", "electronice": "Electronice & IT",
                "casa": "Casa & Gradina", "sport": "Sport", "copii": "Copii & Jucarii",
                "animale": "Animale de Companie", "sanatate": "Sanatate", "carti": "Carti",
                "auto-moto": "Auto-Moto", "supermarket": "Supermarket", "bijuterii": "Bijuterii",
            }
            return labels.get(slug, "Diverse"), slug
    return "Diverse", "diverse"


def domain_norm(name: str) -> str:
    d = name.strip().lower().rstrip("/")
    d = re.sub(r"^https?://", "", d)
    d = re.sub(r"^www\.", "", d)
    return d.split("/")[0].strip()


def load_existing():
    existing = set()
    for path in (EXTRA_PATH, OUTPUT_PATH):
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                for m in json.load(f):
                    url = m.get("url", "")
                    if url:
                        existing.add(domain_norm(urlparse(url if url.startswith("http") else "https://" + url).netloc or url))
                    if m.get("magazin"):
                        existing.add(domain_norm(m["magazin"]))
    return existing


def main():
    csv_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(DATA_DIR, "2p_feed_full.csv")
    if not os.path.exists(csv_path):
        print(f"CSV lipsa: {csv_path}")
        return

    print(f"=== Extragere magazine din {os.path.basename(csv_path)} ===")
    existing = load_existing()
    print(f"Magazine existente: {len(existing)}")

    # Numara produse per campaign_name (magazin) — doar .ro
    merchant_counts = {}
    rows = 0

    if csv_path.lower().endswith(".xml"):
        # Feed XML 2P (streaming, fisier de ordinul GB) — <items><item><campaign_name>
        # Wrap in try: feed-ul poate fi trunchiat la final (lipsa </items>) → ParseError,
        # dar pana acolo am procesat deja sute de mii de itemi.
        try:
            for event, elem in ET.iterparse(csv_path, events=("end",)):
                if elem.tag != "item":
                    continue
                rows += 1
                camp = domain_norm(elem.findtext("campaign_name") or "")
                if camp.endswith(".ro"):
                    merchant_counts[camp] = merchant_counts.get(camp, 0) + 1
                elem.clear()
                if rows % 200000 == 0:
                    print(f"   ...{rows} produse scanate, {len(merchant_counts)} magazine .ro vazute")
        except ET.ParseError as e:
            print(f"   (feed trunchiat la final — normal, procesat {rows} itemi: {e})")
    else:
        with open(csv_path, "r", encoding="utf-8", newline="") as f:
            reader = csv.DictReader(f)
            for row in reader:
                rows += 1
                camp = domain_norm(row.get("campaign_name", ""))
                if camp.endswith(".ro"):
                    merchant_counts[camp] = merchant_counts.get(camp, 0) + 1

    print(f"Produse scanate: {rows}")
    print(f"Magazine .ro unice in feed: {len(merchant_counts)}")

    # Magazine din feed care NU sunt in lista noastra
    noi = {d: c for d, c in merchant_counts.items() if d not in existing}
    print(f"Magazine ACCEPTATE dar LIPSA din site: {len(noi)}")

    if not noi:
        print("Toate magazinele din feed sunt deja in site.")
        return

    # Construieste entries cu quicklink real
    new_merchants = []
    for domain, prod_count in sorted(noi.items(), key=lambda x: -x[1]):
        cat_name, cat_slug = guess_category(domain)
        target = f"https://www.{domain}" if not domain.startswith("www.") else f"https://{domain}"
        # scor in functie de cati produse are (mai multe = magazin mai serios)
        scor = min(70, 45 + prod_count // 50)
        new_merchants.append({
            "magazin": domain,
            "url": f"https://{domain}",
            "url_afiliat": build_quicklink(target),
            "logo_url": f"https://logo.clearbit.com/{domain}",
            "categorie": cat_name,
            "categorie_slug": cat_slug,
            "comision": "Variabil",
            "rank": None,
            "scor_afiliere": scor,
            "scor_final": scor,
            "prioritate": "standard",
            "canal_recomandat": "Content, Coupon",
            "sales_number": 0,
            "trend": 0,
            "are_promotie": False,
            "cod_cupon": False,
            "zile_ramase": 0,
            "promotii": [],
            "folosit_de": 0,
            "procent_succes": 80,
            "exclusiv": False,
            "platforma": "2performant",
            "produse_in_feed": prod_count,
        })

    # Salveaza
    extras = []
    if os.path.exists(EXTRA_PATH):
        with open(EXTRA_PATH, "r", encoding="utf-8") as f:
            extras = json.load(f)
    old = len(extras)
    extras.extend(new_merchants)
    with open(EXTRA_PATH, "w", encoding="utf-8") as f:
        json.dump(extras, f, ensure_ascii=False, indent=2)

    print(f"\nextra_merchants: {old} -> {len(extras)} (+{len(new_merchants)})")
    print("\nTop 20 magazine noi (dupa nr. produse in feed):")
    for m in new_merchants[:20]:
        print(f"  {m['magazin']:28s} | {m['categorie_slug']:14s} | {m['produse_in_feed']} produse")
    print("\nUrmator pas: cd scripts && python merge_platforms.py")


if __name__ == "__main__":
    main()
