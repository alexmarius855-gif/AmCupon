"""
post_manual_session.py — Sesiune manuala de postare FB + Instagram
===================================================================
Posteaza manual mai multe tipuri de posturi (din categorii diferite)
catre Make.com webhook. Ruleaza local cu:

  set MAKE_WEBHOOK_URL=https://hook.eu1.make.com/...
  python post_manual_session.py

Sau cu URL direct:
  python post_manual_session.py --webhook https://hook.eu1.make.com/...
"""

import json
import os
import sys
import time
import argparse
from datetime import datetime, timezone, timedelta

# Refoloseste logica din post_via_webhook.py
sys.path.insert(0, os.path.dirname(__file__))
from post_via_webhook import (
    pick_top, build_caption_general, build_caption_nisa,
    send_webhook, get_best_promo, format_discount,
    NISE_LABEL, HASHTAGS_BASE, HASHTAGS_NISA,
    LUNI_RO, ZILE_RO, SITE_URL,
)

OUTPUT_JSON = os.path.join(os.path.dirname(__file__), "../frontend/public/output.json")
BANNER_URL  = os.environ.get("BANNER_PUBLIC_URL", "https://amcupon.ro/banner-daily.png")
STORY_URL   = os.environ.get("BANNER_STORY_URL",  "https://amcupon.ro/banner-story.png")

# Sesiune: postam aceste categorii in ordine
# General + 4 nise cu cei mai multi magazine cu promotii
SESIUNE_POSTURI = [
    {"type": "general",         "nisa": None},
    {"type": "noon",            "nisa": "home-garden"},
    {"type": "evening",         "nisa": "electronics-itc"},
    {"type": "noon",            "nisa": "sports-outdoors"},
    {"type": "evening",         "nisa": "babies-kids-toys"},
    {"type": "noon",            "nisa": "books"},
]

DELAY_INTRE_POSTURI = 8   # secunde intre posturi (evita spam FB)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--webhook", default="", help="Make.com webhook URL")
    parser.add_argument("--dry-run", action="store_true", help="Afiseaza captionele fara a trimite")
    parser.add_argument("--delay", type=int, default=DELAY_INTRE_POSTURI)
    parser.add_argument("--categorii", nargs="*", help="Categorii specifice (ex: fashion home-garden)")
    args = parser.parse_args()

    webhook_url = args.webhook or os.environ.get("MAKE_WEBHOOK_URL", "")

    if not webhook_url and not args.dry_run:
        print("EROARE: Seteaza MAKE_WEBHOOK_URL sau foloseste --webhook URL sau --dry-run")
        sys.exit(1)

    # Suprascrie WEBHOOK_URL global pentru send_webhook
    import post_via_webhook as mod
    mod.WEBHOOK_URL = webhook_url

    if not os.path.exists(OUTPUT_JSON):
        print(f"Fisier lipsa: {OUTPUT_JSON}")
        sys.exit(1)

    with open(OUTPUT_JSON, encoding="utf-8") as f:
        magazine = json.load(f)

    now_ro   = datetime.now(timezone.utc) + timedelta(hours=3)
    zi_idx   = now_ro.weekday()
    zi_name  = ZILE_RO[zi_idx]
    data_str = f"{now_ro.day} {LUNI_RO[now_ro.month - 1]} {now_ro.year}"

    valide = [
        m for m in magazine
        if m.get("are_promotie") and m.get("promotii")
        and m.get("procent_succes", 0) >= 50
        and " " not in m.get("magazin", "")
    ]
    print(f"Magazine valide cu promotii: {len(valide)}")

    # Selecteaza posturi
    posturi = SESIUNE_POSTURI
    if args.categorii:
        posturi = [{"type": "noon", "nisa": c} for c in args.categorii]
        posturi.insert(0, {"type": "general", "nisa": None})

    print(f"\n=== SESIUNE MANUALA — {data_str} ({zi_name}) ===")
    print(f"Posturi planificate: {len(posturi)}")
    print(f"Delay intre posturi: {args.delay}s")
    print(f"Mod: {'DRY RUN (nu trimite)' if args.dry_run else 'LIVE → Make.com'}")
    print("=" * 50)

    trimise = 0
    for i, post in enumerate(posturi, 1):
        post_type = post["type"]
        nisa      = post["nisa"]

        if nisa is None:
            # Post general
            top5    = pick_top(valide, n=5)
            caption = build_caption_general(top5, zi_name, data_str)
            link    = f"{SITE_URL}/oferte-azi"
            label   = "General — Top 5 oferte"
        else:
            # Post nisa
            label   = NISE_LABEL.get(nisa, nisa)
            top4    = pick_top(valide, n=4, categorie=nisa)
            top4n   = [m for m in top4 if m.get("categorie_slug") == nisa]

            if len(top4n) >= 2:
                caption = build_caption_nisa(nisa, top4n, data_str)
                link    = f"{SITE_URL}/categorii/{nisa}"
            elif len(top4) >= 2:
                # Fallback la top general daca nu sunt destule in nisa
                caption = build_caption_nisa(nisa, top4, data_str)
                link    = f"{SITE_URL}/categorii/{nisa}"
            else:
                caption = build_caption_general(pick_top(valide, n=5), zi_name, data_str)
                link    = f"{SITE_URL}/oferte-azi"
                label   = f"{label} (fallback general)"

        print(f"\n[{i}/{len(posturi)}] {label}")
        print("-" * 40)
        print(caption)
        print(f"\n  Link: {link}")

        if not args.dry_run:
            payload = {
                "type":      post_type,
                "caption":   caption,
                "link":      link,
                "image_url": BANNER_URL,
                "story_url": STORY_URL,
                "data":      data_str,
                "zi":        zi_name,
                "nisa":      nisa or "general",
            }
            ok = send_webhook(payload)
            if ok:
                trimise += 1
            else:
                print(f"  EROARE la trimitere — continui cu urmatorul")

            if i < len(posturi):
                print(f"  Astept {args.delay}s...")
                time.sleep(args.delay)

    print(f"\n{'=' * 50}")
    if args.dry_run:
        print(f"DRY RUN complet — {len(posturi)} captionuri generate.")
    else:
        print(f"Sesiune completa: {trimise}/{len(posturi)} posturi trimise pe Facebook + Instagram.")


if __name__ == "__main__":
    main()
