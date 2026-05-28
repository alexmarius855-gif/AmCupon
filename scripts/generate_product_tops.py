"""
generate_product_tops.py
Actualizeaza preturile si link-urile afiliate in top-produse.json
pe baza datelor din output.json (magazine partenere).

Rulare: python generate_product_tops.py
Output: ../frontend/public/top-produse.json (preturile sunt actualizate)
"""

import json
import os
from datetime import date

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_JSON = os.path.join(SCRIPT_DIR, "..", "frontend", "public", "output.json")
TOP_JSON    = os.path.join(SCRIPT_DIR, "..", "frontend", "public", "top-produse.json")


def load_output() -> dict:
    """Incarca output.json si returneaza un dict {magazin: date}."""
    if not os.path.exists(OUTPUT_JSON):
        print("[WARN] output.json nu exista — link-urile afiliate nu pot fi actualizate")
        return {}
    with open(OUTPUT_JSON, encoding="utf-8") as f:
        data = json.load(f)
    return {m["magazin"]: m for m in data}


def load_top() -> dict:
    with open(TOP_JSON, encoding="utf-8") as f:
        return json.load(f)


def save_top(data: dict):
    data["updated"] = date.today().isoformat()
    with open(TOP_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"[OK] top-produse.json actualizat — {date.today().isoformat()}")


def enrich_magazine_links(top_data: dict, output: dict):
    """
    Adauga url_afiliat si logo_url din output.json la fiecare magazin din produse.
    Nu modifica preturile (acestea sunt curate manual in JSON).
    """
    updated = 0
    for cat in top_data.get("categorii", []):
        for produs in cat.get("produse", []):
            for mag in produs.get("magazine", []):
                slug = mag.get("magazin_slug", "")
                if slug in output:
                    o = output[slug]
                    mag["url_afiliat"] = o.get("url_afiliat", "")
                    mag["logo_url"] = o.get("logo_url", "")
                    updated += 1
    print(f"[INFO] {updated} link-uri afiliate actualizate din output.json")


def print_stats(top_data: dict):
    total_cat = len(top_data.get("categorii", []))
    total_prod = sum(len(c.get("produse", [])) for c in top_data.get("categorii", []))
    print(f"[INFO] {total_cat} categorii, {total_prod} produse in top-produse.json")
    for cat in top_data.get("categorii", []):
        print(f"  - /{cat['slug']} ({cat['titlu_scurt']}): {len(cat['produse'])} produse")


def main():
    print("=== generate_product_tops.py ===")
    output = load_output()
    top_data = load_top()

    enrich_magazine_links(top_data, output)
    print_stats(top_data)
    save_top(top_data)
    print("=== Done ===")


if __name__ == "__main__":
    main()
