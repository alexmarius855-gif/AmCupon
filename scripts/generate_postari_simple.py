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
  3. URGENTA/DOVADA — expira in X / verificat azi
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

# Hashtag-uri pe categorie (fallback generic) — sluguri REALE din output.json (categorie_slug),
# verificate direct pe date (nu coincid cu sluguri-le din CLAUDE.md, care sunt pt /categorii/[slug])
HASHTAG_CATEG = {
    "fashion": "#reduceri #moda #fashion #haine #romania",
    "beauty": "#reduceri #cosmetice #beauty #skincare #romania",
    "sanatate": "#reduceri #sanatate #farmacie #suplimente #romania",
    "electronice": "#reduceri #electronice #gadgeturi #tech #romania",
    "sport": "#reduceri #sport #fitness #outdoor #romania",
    "copii": "#reduceri #copii #jucarii #bebelusi #romania",
    "casa-gradina": "#reduceri #casa #gradina #mobilier #romania",
    "auto-moto": "#reduceri #auto #moto #piese #masina #romania",
    "calatorii": "#reduceri #calatorii #vacanta #travel #romania",
    "software": "#reduceri #software #ai #tools #romania",
    "financiar": "#reduceri #asigurari #financiar #romania",
    "marketplace": "#reduceri #marketplace #oferte #romania",
    "carti-educatie": "#reduceri #carti #educatie #romania",
    "bijuterii": "#reduceri #bijuterii #accesorii #romania",
    "animale": "#reduceri #animale #petshop #romania",
    "mancare-bauturi": "#reduceri #mancare #bauturi #romania",
    "servicii": "#reduceri #servicii #romania",
    "cadouri-flori": "#reduceri #cadouri #flori #romania",
}
HASHTAG_DEFAULT = "#reduceri #coduri #cupoane #oferte #romania"

# Nume RO afisabil per categorie (pentru sectiuni/index)
CATEG_LABEL = {
    "fashion": "Fashion", "beauty": "Beauty", "sanatate": "Sanatate",
    "electronice": "Electronice", "sport": "Sport", "copii": "Copii",
    "casa-gradina": "Casa & Gradina", "auto-moto": "Auto-Moto",
    "calatorii": "Calatorii", "software": "Software",
    "financiar": "Financiar & Asigurari", "marketplace": "Marketplace",
    "carti-educatie": "Carti", "bijuterii": "Bijuterii", "animale": "Animale",
    "mancare-bauturi": "Mancare & Bauturi", "servicii": "Servicii",
    "cadouri-flori": "Cadouri & Flori",
}

# Calendarul saptamanal (vezi CLAUDE.md / 00-INDEX) — tema zilei apare prima in fisier
CALENDAR_SAPTAMANAL = {
    0: ("Fashion & Beauty",     ["fashion", "beauty"]),                # Luni
    1: ("Tech & Software",      ["electronice", "software"]),          # Marti
    2: ("Turism",               ["calatorii"]),                        # Miercuri
    3: ("Software & Financiar", ["software", "financiar"]),            # Joi
    4: ("Reduceri Mari",        []),                                   # Vineri — toate, sortate
    5: ("Casa, Pet & Copii",    ["casa-gradina", "animale", "copii"]),  # Sambata
    6: ("Recap Saptamana",      []),                                   # Duminica — toate, sortate
}

# Variatie de hook per categorie — evita ca toate postarile sa sune identic
HOOK_EMOJI_CATEG = {
    "fashion": "👗", "beauty": "💄", "sanatate": "💊", "electronice": "💻",
    "sport": "🏃", "copii": "🧸", "casa-gradina": "🏡", "auto-moto": "🚗",
    "calatorii": "✈️", "software": "⚙️", "financiar": "🛡️", "bijuterii": "💎",
    "animale": "🐾", "mancare-bauturi": "🍽️", "servicii": "🔧", "cadouri-flori": "🎁",
    "marketplace": "🛍️", "carti-educatie": "📚",
}


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

    # ── HOOK (emoji variat pe categorie, nu tot 🔥 la fel) ──
    emoji = HOOK_EMOJI_CATEG.get(categ, "🔥")
    if proc:
        hook_story = f"{emoji} {proc} la {n}!"
        hook_wall  = f"{emoji} {proc} la {n} — activ acum"
    else:
        hook_story = f"{emoji} Reducere {n} azi!"
        hook_wall  = f"{emoji} Reducere activa la {n}"

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
    # a 2-a linie de continut real, doar daca descrierea aduce ceva nou fata de titlu
    descriere = (promo.get("descriere") or "").strip()
    are_descriere_utila = descriere and descriere.lower() != titlu.lower() and len(descriere) > 10
    if are_descriere_utila:
        d = descriere if len(descriere) <= 100 else descriere[:97] + "..."
        wall.append(f"ℹ️ {d}")
    if cod:
        wall.append(f"🎟️ Cod verificat: {cod}")
    if 0 < zile <= 7:
        wall.append(f"⏳ Expiră în {zile} {'zi' if zile == 1 else 'zile'} — prinde-l până nu zboară")
    elif not are_descriere_utila:
        wall.append("✅ Verificat azi de echipa AmCupon")
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
        "categorie_slug": categ,
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

pe_categorie = {}
for b in blocuri:
    pe_categorie.setdefault(b["categorie_slug"], []).append(b)

zi_idx = azi.weekday()  # 0=Luni ... 6=Duminica
tema_zi, categ_zi = CALENDAR_SAPTAMANAL.get(zi_idx, ("", []))
azi_blocuri = [b for b in blocuri if b["categorie_slug"] in categ_zi] if categ_zi else []


def randuri_bloc(b: dict) -> list:
    return [
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


linii = [
    f"POSTĂRI GATA DE COPIAT — AmCupon.ro — {DATA}",
    f"{len(blocuri)} magazine cu reducere activă · {len(pe_categorie)} categorii",
] + ([f"📅 TEMA ZILEI: {tema_zi}"] if tema_zi else []) + [
    "=" * 58,
    "",
    "CUM FOLOSEȘTI: alegi un magazin, copiezi blocul STORY (pt insta/fb story)",
    "sau PERETE (pt postare normală). Linkul duce pe pagina de pe site.",
    "",
    "📚 INDEX RAPID (Ctrl+F eticheta ca sa sari direct la o categorie):",
]
for categ, lista in sorted(pe_categorie.items(), key=lambda kv: -len(kv[1])):
    label = CATEG_LABEL.get(categ, categ or "Diverse")
    linii.append(f"   • {label} ({len(lista)})")
linii += ["", "=" * 58, ""]

if azi_blocuri:
    linii += [
        f"🎯🎯🎯 ASTAZI — {tema_zi.upper()} ({len(azi_blocuri)} magazine) 🎯🎯🎯",
        "Recomandare: posteaza din sectiunea asta azi, restul e pentru alte zile.",
        "",
    ]
    for b in azi_blocuri:
        linii += randuri_bloc(b)
    linii += ["", "▔" * 58, "REST — TOATE MAGAZINELE, GRUPATE PE CATEGORIE", "▔" * 58, ""]

for categ, lista in sorted(pe_categorie.items(), key=lambda kv: -len(kv[1])):
    label = CATEG_LABEL.get(categ, categ or "Diverse")
    linii += [
        "",
        "┌" + "─" * 56 + "┐",
        f"  📂 {label.upper()} ({len(lista)} magazine)",
        "└" + "─" * 56 + "┘",
        "",
    ]
    for b in lista:
        linii += randuri_bloc(b)

OUT_TXT.write_text("\n".join(linii), encoding="utf-8")
OUT_JSON.write_text(json.dumps(blocuri, ensure_ascii=False, indent=2), encoding="utf-8")

print(f"✅ Generat {len(blocuri)} postări per magazin")
print(f"   TXT:  {OUT_TXT}")
print(f"   JSON: {OUT_JSON}")
if blocuri:
    print("\n── PRIMUL EXEMPLU ──")
    print(blocuri[0]["perete"])
