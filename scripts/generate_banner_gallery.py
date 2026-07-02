#!/usr/bin/env python3
"""
Galeria "gata de postat" — filtreaza din banners.json (creative reale de la
comercianti, prin 2Performant) doar formatele bune pentru social (patrate/
aproape patrate, nu bannere web IAB tip skyscraper/leaderboard care arata
rupte pe Instagram/Facebook), le imperecheaza cu un caption + link cu tracking
real, gata de copiat.

Ideea: exact ce a vazut Alex la widget-ul Profitshare (creative profesionale
gata de embed) — noi il avem deja prin fetch_banners.py (2Performant), doar
nu era filtrat/prezentat pt postare directa. Ruleaza dupa fetch_banners.py.

Output:
  data/bannere-gata-de-postat.json
  data/bannere-gata-de-postat.txt
"""
import json
import sys
from pathlib import Path
from datetime import datetime

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).parent.parent
BANNERS_JSON = ROOT / "frontend" / "public" / "banners.json"
OUT_DIR = ROOT / "data"
OUT_JSON = OUT_DIR / "bannere-gata-de-postat.json"
OUT_TXT = OUT_DIR / "bannere-gata-de-postat.txt"

# Formate bune pt social (patrat sau aproape) — restul (728x90, 300x600,
# 160x600, 120x60 etc.) sunt bannere web IAB, arata rupte pe FB/Insta.
MIN_SIZE = 600
MAX_RATIO_DIFF = 0.15  # cat de departe de 1:1 acceptam


def e_bun_pt_social(w, h):
    if not w or not h or w < MIN_SIZE or h < MIN_SIZE:
        return False
    ratio = w / h
    return abs(ratio - 1) <= MAX_RATIO_DIFF


def nume_afisat(slug):
    base = slug.split(".")[0].split("-")[0]
    return base.capitalize()


def main():
    data = json.loads(BANNERS_JSON.read_text(encoding="utf-8"))
    banners = data.get("banners", data) if isinstance(data, dict) else data

    bune = [b for b in banners if e_bun_pt_social(b.get("width"), b.get("height"))]

    # Dedup pe (merchant, name) — pastram cea mai mare rezolutie per campanie
    per_campanie = {}
    for b in bune:
        key = (b.get("merchant_slug"), b.get("name"))
        cur = per_campanie.get(key)
        if not cur or (b.get("width", 0) * b.get("height", 0)) > (cur.get("width", 0) * cur.get("height", 0)):
            per_campanie[key] = b

    rezultat = list(per_campanie.values())

    linii = [
        f"BANNERE GATA DE POSTAT — creative reale de la comercianti (2Performant) — {datetime.now().strftime('%d.%m.%Y')}",
        f"{len(rezultat)} campanii cu imagine patrata, bune pt Instagram/Facebook feed",
        "=" * 60,
        "",
        "CUM FOLOSESTI: deschizi imaginea (link), o salvezi, postezi cu caption-ul de mai jos.",
        "Linkul e cu tracking real — clickul din postare castiga comision.",
        "",
    ]
    for b in rezultat:
        merchant = nume_afisat(b.get("merchant_slug", ""))
        caption = f"🔥 {b.get('name', 'Oferta')} — {merchant}\n\nVezi oferta: {b.get('landing_url')}\n\n#reduceri #{merchant.lower()} #oferte #romania"
        linii += [
            "─" * 50,
            f"MAGAZIN: {merchant}  |  {b.get('width')}x{b.get('height')}px",
            "─" * 50,
            f"IMAGINE: {b.get('image_url')}",
            "",
            "CAPTION:",
            caption,
            "",
            "",
        ]

    OUT_DIR.mkdir(exist_ok=True)
    OUT_TXT.write_text("\n".join(linii), encoding="utf-8")
    OUT_JSON.write_text(json.dumps(rezultat, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Gasite {len(banners)} bannere totale, {len(bune)} in format bun pt social, {len(rezultat)} campanii unice")
    print(f"  TXT:  {OUT_TXT}")
    print(f"  JSON: {OUT_JSON}")
    if not rezultat:
        print("  (0 campanii patrate acum — normal, depinde ce creative au activ comerciantii; se actualizeaza zilnic)")


if __name__ == "__main__":
    main()
