"""
generate_product_tops.py
Actualizeaza preturile si link-urile afiliate in top-produse.json
pe baza datelor din output.json (magazine partenere).

Rulare: python generate_product_tops.py
Output: ../frontend/public/top-produse.json (preturile sunt actualizate)
"""

import json
import re
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


def link_platit(o: dict) -> str:
    """
    Linkul afiliat REAL al magazinului, sau "" — aceeasi regula ca `linkAfiliat()` din
    frontend/lib/linkMagazin.ts: lipsa, identic cu site-ul simplu sau link Impact stricat
    (`/NA6?`) inseamna ca nu exista.
    """
    afiliat = (o.get("url_afiliat") or "").strip()
    if not afiliat or afiliat == (o.get("url") or "").strip() or re.search(r"/NA6[?&]", afiliat):
        return ""
    return afiliat


def enrich_magazine_links(top_data: dict, output: dict):
    """
    Pune url_afiliat si logo_url din output.json la fiecare magazin din produse — si le
    STERGE cand magazinul nu mai are link platit. Nu modifica preturile (de referinta,
    notate manual in mai–iunie 2026).

    05.10.2026: functia doar adauga. Cand un magazin iesea din output.json, linkul vechi
    ramanea in fisier la nesfarsit — asa au ramas 132 de linkuri Profitshare spre eMAG pe
    paginile /top, la sapte saptamani dupa ce contul a fost respins si reteaua exclusa
    (19.08). Fisierul e intrare SI iesire (LECTII-TEHNICE #5): ce nu se curata aici, nu
    se curata nicaieri.
    """
    updated, sterse = 0, 0
    for cat in top_data.get("categorii", []):
        for produs in cat.get("produse", []):
            for mag in produs.get("magazine", []):
                slug = mag.get("magazin_slug", "")
                link = link_platit(output[slug]) if slug in output else ""
                if link:
                    mag["url_afiliat"] = link
                    mag["logo_url"] = output[slug].get("logo_url", "")
                    updated += 1
                else:
                    if mag.pop("url_afiliat", None) is not None:
                        sterse += 1
                    mag.pop("logo_url", None)
    print(f"[INFO] {updated} link-uri afiliate actualizate din output.json, {sterse} sterse (magazin fara link platit)")


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
