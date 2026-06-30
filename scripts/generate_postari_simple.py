#!/usr/bin/env python3
"""
Generator de POSTARI SIMPLE per magazin — pentru postat rapid de pe telefon.

Spre deosebire de generate_social_content.py (care e pe nise, 5 platforme,
verbos), acesta scoate UN bloc curat per magazin cu reducere activa, in 3
formate gata de copiat:
  - STORY  : ultra-scurt, pt Instagram/Facebook story (oamenii dau swipe rapid)
  - PERETE : postare normala Facebook (hook + oferta + urgenta + 1 CTA)
  - HASHTAG: linie de hashtag-uri pt descoperire

Structura de copywriting (imprumutata de la conturile de deal-uri care convertesc):
  1. HOOK   — numarul reducerii in fata, curiozitate
  2. OFERTA — ce primesti + codul
  3. URGENTA/DOVADA — expira in X / verificat azi / rata de succes
  4. CTA    — o singura actiune clara + link

Link-ul duce pe pagina de pe site (amcupon.ro/cod-reducere/{slug}) — NU direct
pe linkul de afiliat: asa creste traficul site-ului, prinzi vizitatorul pt
newsletter/retargeting, iar linkul de afiliat e oricum pe pagina.

Output:
  data/postari-zilnice.txt   (toate, gata de copiat, sortate dupa scor)
  data/postari-zilnice.json  (structurat, pt automatizari viitoare)
"""

import json
import re
import sys
from pathlib import Path
from datetime import datetime

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

DATA_PATH = Path(__file__).parent.parent / "frontend" / "public" / "output.json"
OUT_DIR   = Path(__file__).parent.parent / "data"
OUT_TXT   = OUT_DIR / "postari-zilnice.txt"
OUT_JSON  = OUT_DIR / "postari-zilnice.json"
OUT_DIR.mkdir(exist_ok=True)

SITE_URL = "https://amcupon.ro"
LUNI = ["ianuarie","februarie","martie","aprilie","mai","iunie",
        "iulie","august","septembrie","octombrie","noiembrie","decembrie"]
azi  = datetime.now()
LUNA = LUNI[azi.month - 1]
AN   = azi.year
DATA = azi.strftime("%d.%m.%Y")

# Hashtag-uri pe categorie (fallback generic)
HASHTAG_CATEG = {
    "fashion": "#reduceri #moda #fashion #haine #romania",
    "beauty": "#reduceri #cosmetice #beauty #skincare #romania",
    "pharma": "#reduceri #farmacie #sanatate #suplimente #romania",
    "health-personal-care": "#reduceri #sanatate #ingrijire #romania",
    "electronics-itc": "#reduceri #electronice #gadgeturi #tech #romania",
    "sports-outdoors": "#reduceri #sport #fitness #outdoor #romania",
    "babies-kids-toys": "#reduceri #copii #jucarii #bebelusi #romania",
    "home-garden": "#reduceri #casa #gradina #mobilier #romania",
    "automotive": "#reduceri #auto #piese #masina #romania",
    "travel": "#reduceri #calatorii #vacanta #travel #romania",
    "hosting": "#reduceri #hosting #website #wordpress #romania",
    "software-business": "#reduceri #software #ai #tools #romania",
}
HASHTAG_DEFAULT = "#reduceri #coduri #cupoane #oferte #romania"


def nume(slug: str) -> str:
    return slug.split(".")[0].replace("-", " ").title()


def extrage_procent(*texte) -> str:
    """Scoate primul '-X%' dintr-un text de oferta, daca exista."""
    for t in texte:
        if not t:
            continue
        m = re.search(r"(\d{1,2})\s*%", str(t))
        if m:
            return f"-{m.group(1)}%"
    return ""


def construieste_blocuri(m: dict):
    slug   = m.get("magazin", "")
    n      = m.get("magazin_display") or nume(slug)
    succes = m.get("procent_succes", 0)
    categ  = m.get("categorie_slug", "")
    ht     = HASHTAG_CATEG.get(categ, HASHTAG_DEFAULT) + f" #{n.lower().replace(' ', '')}"
    link   = f"{SITE_URL}/cod-reducere/{slug}"

    # Prima promotie valida (cu cod preferential)
    promos = m.get("promotii", []) or []
    promo  = next((p for p in promos if p.get("cod_cupon")), None) or (promos[0] if promos else {})
    cod    = (promo.get("cod_cupon") or "").strip()
    titlu  = (promo.get("nume") or promo.get("descriere") or "Reducere activa").strip()
    zile   = promo.get("zile_ramase", m.get("zile_ramase", 0)) or 0
    proc   = extrage_procent(titlu, promo.get("descriere"))

    # ── HOOK ──
    if proc:
        hook_story = f"🔥 {proc} la {n}!"
        hook_wall  = f"🔥 {proc} la {n} — activ acum"
    else:
        hook_story = f"🔥 Reducere {n} azi!"
        hook_wall  = f"🔥 Reducere activa la {n}"

    # ── STORY (ultra-scurt) ──
    story = [hook_story]
    if cod:
        story.append(f"Cod: {cod} 👇")
    else:
        story.append("Fara cod necesar 👇")
    story.append(link.replace("https://", ""))
    story_txt = "\n".join(story)

    # ── PERETE (Facebook normal) ──
    wall = [hook_wall, ""]
    # linia de oferta (taie daca e prea lunga)
    of = titlu if len(titlu) <= 90 else titlu[:87] + "..."
    wall.append(f"✅ {of}")
    if cod:
        wall.append(f"🎟️ Cod verificat: {cod}")
    if 0 < zile <= 7:
        wall.append(f"⏳ Expiră în {zile} {'zi' if zile == 1 else 'zile'} — prinde-l până nu zboară")
    if succes >= 50:
        wall.append(f"📊 Funcționează (rată {succes}% azi)")
    wall += [
        "",
        ("👉 Iei codul + mergi la magazin aici:" if cod else "👉 Vezi oferta + mergi la magazin aici:"),
        link,
    ]
    wall_txt = "\n".join(wall)

    return {
        "magazin": slug,
        "nume": n,
        "categorie": m.get("categorie", ""),
        "cod": cod,
        "procent": proc,
        "zile_ramase": zile,
        "link": link,
        "story": story_txt,
        "perete": wall_txt,
        "hashtags": ht,
    }


# ── Main ────────────────────────────────────────────────────────────────────
toate = json.load(open(DATA_PATH, encoding="utf-8"))
cu_oferta = [m for m in toate if m.get("are_promotie") and m.get("promotii")]
cu_oferta.sort(key=lambda x: -x.get("scor_final", 0))

blocuri = [construieste_blocuri(m) for m in cu_oferta]

linii = [
    f"POSTĂRI GATA DE COPIAT — AmCupon.ro — {DATA}",
    f"{len(blocuri)} magazine cu reducere activă · sortate (cele mai bune sus)",
    "=" * 58,
    "",
    "CUM FOLOSEȘTI: alegi un magazin, copiezi blocul STORY (pt insta/fb story)",
    "sau PERETE (pt postare normală). Linkul duce pe pagina de pe site.",
    "",
]

for b in blocuri:
    linii += [
        "═" * 50,
        f"🏪 {b['nume'].upper()}" + (f"   [{b['procent']}]" if b['procent'] else ""),
        "═" * 50,
        "",
        "📱 STORY (insta/fb — swipe rapid):",
        b["story"],
        "",
        "📝 PERETE (postare Facebook):",
        b["perete"],
        "",
        f"🏷️ {b['hashtags']}",
        "",
        "",
    ]

OUT_TXT.write_text("\n".join(linii), encoding="utf-8")
OUT_JSON.write_text(json.dumps(blocuri, ensure_ascii=False, indent=2), encoding="utf-8")

print(f"✅ Generat {len(blocuri)} postări per magazin")
print(f"   TXT:  {OUT_TXT}")
print(f"   JSON: {OUT_JSON}")
if blocuri:
    print("\n── PRIMUL EXEMPLU ──")
    print(blocuri[0]["perete"])
