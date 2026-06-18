"""
Merge date din toate platformele de afiliere.
Ruleaza dupa process_data.py si process_profitshare.py.

Output: ../data/output.json + ../frontend/public/output.json
"""

import json
import os

FILES = [
    "../data/output.json",              # 2Performant
    "../data/profitshare_output.json",  # Profitshare
    "../data/tradetracker_output.json", # TradeTracker
    "../data/extra_merchants.json",     # Magazine adaugate manual (studioszel, sevensins, depox etc.)
]

OUTPUT_FILE    = "../data/output.json"
OUTPUT_FRONTEND = "../frontend/public/output.json"


def main():
    merged: list[dict] = []
    seen_slugs: set[str] = set()

    for fpath in FILES:
        if not os.path.exists(fpath):
            print(f"  Fisier lipsa (skip): {fpath}")
            continue

        with open(fpath, encoding="utf-8") as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError as e:
                print(f"  JSON invalid in {fpath}: {e}")
                continue

        if not isinstance(data, list):
            print(f"  Format neasteptat in {fpath} — skip")
            continue

        adaugate = 0
        duplicate = 0
        for magazin in data:
            slug = magazin.get("magazin", "").strip().lower()
            if not slug:
                continue
            if "/" in slug:
                # Slug cu "/" rupe ruta dinamica /cod-reducere/[magazin] (Next.js
                # trateaza segmentul ca path multiplu -> 404). Ex: "esyhair.com/en".
                duplicate += 1
                continue
            url_val = (magazin.get("url") or "").strip()
            if url_val and any(c.isspace() for c in url_val):
                # URL cu spatii in interior = date corupte de la sursa (ex: scraping
                # gresit a prins text de status in loc de domeniu). Numele afisat poate
                # legitim avea spatii ("Revolut Business") - doar URL-ul nu trebuie sa aiba.
                duplicate += 1
                continue
            if slug in seen_slugs:
                # Pastreaza cel cu mai multe promotii / scor mai mare
                duplicate += 1
                continue
            seen_slugs.add(slug)
            merged.append(magazin)
            adaugate += 1

        platforma = data[0].get("platforma", "2performant") if data else "unknown"
        print(f"  {os.path.basename(fpath)}: +{adaugate} magazine ({duplicate} duplicate sarite)")

    # Sorteaza: promotii active primul, apoi scor final
    merged.sort(key=lambda x: (
        -int(x.get("are_promotie", False)),
        -x.get("scor_final", 0),
    ))

    cu_promotii = sum(1 for m in merged if m.get("are_promotie"))
    cu_cod = sum(1 for m in merged if m.get("cod_cupon"))

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)

    with open(OUTPUT_FRONTEND, "w", encoding="utf-8") as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)

    print(f"\nTotal dupa merge: {len(merged)} magazine")
    print(f"  {cu_promotii} cu promotii active")
    print(f"  {cu_cod} cu cod cupon")

    # Breakdown per platforma
    by_platform: dict[str, int] = {}
    for m in merged:
        p = m.get("platforma", "2performant")
        by_platform[p] = by_platform.get(p, 0) + 1
    for plat, cnt in sorted(by_platform.items()):
        print(f"  {plat}: {cnt} magazine")


if __name__ == "__main__":
    main()
