#!/usr/bin/env python3
"""
Generator de continut social media pe NISE pentru AmCupon.ro.

Genereaza postari gata-de-copiat pentru:
  - TikTok / Instagram Reels (script video)
  - Instagram Feed (caption)
  - Pinterest (titlu + descriere pin)
  - Facebook Groups / Reddit (post text)
  - Twitter/X (thread)

NISE acoperite:
  fashion, beauty, farmacie, electronice, sport, copii, casa, moto, calatorie, carti

Output:
  data/social-content.json           (toate nise, format JSON)
  data/social-content-today.txt      (text formatat, gata de copiat)
  data/social-nisa-{slug}.txt        (fisier per nisa, pentru postare rapida)
"""

import json
import random
from pathlib import Path
from datetime import datetime

# ── Date ──────────────────────────────────────────────────────────────────────
DATA_PATH = Path(__file__).parent.parent / "frontend" / "public" / "output.json"
OUT_DIR   = Path(__file__).parent.parent / "data"
OUT_JSON  = OUT_DIR / "social-content.json"
OUT_TXT   = OUT_DIR / "social-content-today.txt"
OUT_DIR.mkdir(exist_ok=True)

with open(DATA_PATH, encoding="utf-8") as f:
    toate_magazine = json.load(f)

LUNI = ["ianuarie","februarie","martie","aprilie","mai","iunie",
        "iulie","august","septembrie","octombrie","noiembrie","decembrie"]
azi  = datetime.now()
LUNA = LUNI[azi.month - 1]
AN   = azi.year
DATA = azi.strftime("%d.%m.%Y")

SITE_URL = "https://amcupon.ro"

# ── Configurare nise ──────────────────────────────────────────────────────────
NISE = {
    "fashion": {
        "label": "Fashion & Îmbrăcăminte",
        "emoji": "👗",
        "hashtags": "#fashion #moda #imbracaminte #style #romania #outfitoftheday #shopping",
        "categorii": ["fashion"],
        "cta": "Haine la reducere, coduri verificate",
    },
    "beauty": {
        "label": "Frumusețe & Cosmetice",
        "emoji": "💄",
        "hashtags": "#beauty #cosmetice #machiaj #skincare #parfumuri #romania #frumusete",
        "categorii": ["beauty"],
        "cta": "Produse de frumusete la pret mai mic",
    },
    "pharma": {
        "label": "Farmacie & Sănătate",
        "emoji": "💊",
        "hashtags": "#farmacie #sanatate #suplimente #vitamine #romania #farmacii",
        "categorii": ["pharma", "health-personal-care"],
        "cta": "Medicamente si suplimente la reducere",
    },
    "electronics-itc": {
        "label": "Electronice & IT",
        "emoji": "📱",
        "hashtags": "#tech #electronice #telefoane #laptop #gaming #romania #itc",
        "categorii": ["electronics-itc"],
        "cta": "Gadgeturi si electronice la cel mai bun pret",
    },
    "sports-outdoors": {
        "label": "Sport & Fitness",
        "emoji": "🏋️",
        "hashtags": "#sport #fitness #antrenament #outdoor #hiking #romania #sporturi",
        "categorii": ["sports-outdoors"],
        "cta": "Echipament sportiv la reducere",
    },
    "babies-kids-toys": {
        "label": "Copii & Jucării",
        "emoji": "🧸",
        "hashtags": "#copii #jucarii #bebelusi #parenting #romania #mama #tata",
        "categorii": ["babies-kids-toys"],
        "cta": "Jucarii si produse pentru copii mai ieftine",
    },
    "home-garden": {
        "label": "Casă & Grădină",
        "emoji": "🏠",
        "hashtags": "#casa #gradina #mobilier #decor #homedesign #romania #locuinta",
        "categorii": ["home-garden"],
        "cta": "Mobilier si decoratiuni la reducere",
    },
    "automotive": {
        "label": "Auto & Moto",
        "emoji": "🚗",
        "hashtags": "#auto #moto #masina #motocicleta #piese #romania #autovehicule",
        "categorii": ["automotive"],
        "cta": "Piese auto si accesorii la pret redus",
    },
    "calatorie": {
        "label": "Călătorii & Vacanțe",
        "emoji": "✈️",
        "hashtags": "#calatorii #vacanta #travel #hotel #zbor #romania #turism",
        "categorii": ["travel"],
        "cta": "Vacante mai ieftine cu coduri AmCupon",
    },
}


def get_magazine_nisa(nisa_key: str, nisa_cfg: dict) -> list[dict]:
    categorii = nisa_cfg["categorii"]
    magazine  = [
        m for m in toate_magazine
        if m.get("are_promotie")
        and m.get("promotii")
        and m.get("categorie_slug") in categorii
        and " " not in m.get("magazin", "")
        and m.get("procent_succes", 0) >= 40
        and m.get("magazin") not in {"profitshare.ro", "2performant.com"}
    ]
    magazine.sort(key=lambda x: (-x.get("scor_final", 0), -(1 if x.get("cod_cupon") else 0)))
    return magazine[:8]


def nume(slug: str) -> str:
    return slug.split(".")[0].replace("-", " ").title()


def format_discount(m: dict) -> str:
    if m.get("promotie"):
        txt = m["promotie"]
        return txt[:80] + "..." if len(txt) > 80 else txt
    if m.get("comision"):
        import re
        nums = [float(x) for x in re.findall(r"[\d.]+", m["comision"])]
        if nums:
            return f"Cashback pana la {max(nums):.0f}%"
    return "Oferta speciala"


# ── Generatoare per platforma ──────────────────────────────────────────────────

def gen_tiktok(m: dict, nisa_cfg: dict) -> str:
    n     = m.get("magazin_display") or nume(m["magazin"])
    promo = m["promotii"][0]
    cod   = promo.get("cod_cupon", "")
    titlu = promo.get("nume", "promotie activa")
    succes = m.get("procent_succes", 0)
    emoji  = nisa_cfg["emoji"]
    ht     = nisa_cfg["hashtags"]

    if cod:
        return f"""🎬 SCRIPT TIKTOK — {n} ({nisa_cfg['label']})

HOOK (0-3 sec):
"{emoji} Stii ca poti economisi la {n}? Iata codul SECRET!"

BODY (3-25 sec):
"Mergi pe AmCupon.ro, cauti {n}, copiezi codul {cod} si il aplici la checkout.
{titlu}. Rata de succes {succes}% — a fost verificat chiar ieri!"

CTA (25-30 sec):
"Link in bio → amcupon.ro. Salveaza videoul sa nu uiti codul!"

HASHTAG-URI:
{ht} #codreducere #amcupon #voucher #economii"""
    else:
        return f"""🎬 SCRIPT TIKTOK — {n} ({nisa_cfg['label']})

HOOK (0-3 sec):
"{emoji} Reducere ACTIVA la {n} — nu ai nevoie de niciun cod!"

BODY (3-25 sec):
"Mergi pe AmCupon.ro, gasesti {n} si dai click pe oferta.
{titlu}. Reducerea se aplica automat — zero bataie de cap!"

CTA (25-30 sec):
"Link in bio → amcupon.ro. Dai follow pentru oferte zilnice!"

HASHTAG-URI:
{ht} #reduceri #amcupon #oferte #promotii"""


def gen_instagram(m: dict, nisa_cfg: dict) -> str:
    n      = m.get("magazin_display") or nume(m["magazin"])
    promo  = m["promotii"][0]
    cod    = promo.get("cod_cupon", "")
    disc   = format_discount(m)
    succes = m.get("procent_succes", 0)
    zile   = m.get("zile_ramase", 0)
    slug   = m.get("magazin", "")
    emoji  = nisa_cfg["emoji"]
    ht     = nisa_cfg["hashtags"]

    lines  = [f"{emoji} Cod reducere {n} activ în {LUNA} {AN}!", ""]
    lines.append(f"✅ {disc}")
    if cod:
        lines.append(f"🎟️ Cod: **{cod}**")
    if succes > 0:
        lines.append(f"📊 {succes}% rată de succes — verificat!")
    if 0 < zile <= 7:
        lines.append(f"⚠️ Expiră în {zile} {'zi' if zile == 1 else 'zile'}!")
    lines += [
        "",
        f"👉 {SITE_URL}/cod-reducere/{slug}",
        "",
        f"💡 {nisa_cfg['cta']}",
        "",
        ht,
        "#codreducere #amcupon #economii",
    ]
    return "📸 INSTAGRAM CAPTION — " + n + "\n\n" + "\n".join(lines)


def gen_pinterest(m: dict, nisa_cfg: dict) -> str:
    n     = m.get("magazin_display") or nume(m["magazin"])
    promo = m["promotii"][0]
    cod   = promo.get("cod_cupon", "")
    titlu = promo.get("nume", "promotie activa")
    slug  = m.get("magazin", "")

    titlu_pin = f"Cod Reducere {n} {LUNA} {AN} — Voucher Verificat"
    if cod:
        titlu_pin = f"Cod Reducere {n}: {cod} | {LUNA} {AN}"

    desc = (
        f"{titlu_pin}. {titlu}. "
        f"Codul de reducere {n} verificat si actualizat pe AmCupon.ro. "
        f"{nisa_cfg['cta']}. Economiseste acum!"
    )

    return f"""📌 PINTEREST PIN — {n}

TITLU (max 100 caractere):
{titlu_pin[:100]}

DESCRIERE:
{desc[:500]}

URL: {SITE_URL}/cod-reducere/{slug}
BOARD: {nisa_cfg['label']} — Coduri Reducere Romania"""


def gen_reddit(m: dict, nisa_cfg: dict) -> str:
    n      = m.get("magazin_display") or nume(m["magazin"])
    promo  = m["promotii"][0]
    cod    = promo.get("cod_cupon", "")
    titlu  = promo.get("nume", "promotie activa")
    succes = m.get("procent_succes", 0)
    zile   = m.get("zile_ramase", 0)
    slug   = m.get("magazin", "")

    if cod:
        t_post = f"[Cod reducere {nisa_cfg['label']}] {n} — {titlu} (cod: {cod}, {succes}% succes)"
        body   = f"Cod activ pentru {n}:\n\n**Oferta:** {titlu}\n**Cod:** `{cod}`\n**Rata succes:** {succes}%"
    else:
        t_post = f"[Reducere {nisa_cfg['label']}] {n} — {titlu}"
        body   = f"Reducere activa la {n}:\n\n**Oferta:** {titlu}\n**Rata succes:** {succes}%"

    if 0 < zile <= 7:
        body += f"\n**Expira in:** {zile} {'zi' if zile == 1 else 'zile'}"

    body += f"\n\n**Link:** {SITE_URL}/cod-reducere/{slug}\n\n*Sursa: AmCupon.ro — verificat zilnic*"

    return f"""💬 REDDIT / FACEBOOK GRUP — {n}

TITLU: {t_post}

{body}

SUBREDDITS: r/Romania, r/cluj, r/Bucuresti, r/deals"""


def gen_twitter(m: dict, nisa_cfg: dict) -> str:
    n     = m.get("magazin_display") or nume(m["magazin"])
    promo = m["promotii"][0]
    cod   = promo.get("cod_cupon", "")
    titlu = promo.get("nume", "promotie activa")
    slug  = m.get("magazin", "")
    emoji = nisa_cfg["emoji"]

    if cod:
        t = [
            f"{emoji} Cod reducere {n} activ acum:\n\nOferta: {titlu}\nCod: {cod}\n\n👇 Cum il aplici:",
            f"1. Mergi pe {n}\n2. Adauga in cos\n3. La checkout → 'Cod promotional'\n4. Introdu: {cod}\n5. Reducere aplicata ✅\n\n{SITE_URL}/cod-reducere/{slug}",
            f"Mai multe coduri verificate pentru {nisa_cfg['label'].lower()} pe:\namcupon.ro\n\n#codreducere #romania {nisa_cfg['emoji']}",
        ]
    else:
        t = [
            f"{emoji} Reducere automata la {n}:\n\n{titlu}\n\nNu ai nevoie de cod!\n{SITE_URL}/cod-reducere/{slug}\n\n#reduceri #romania",
        ]

    numbered = "\n\n---\n\n".join(f"Tweet {i+1}:\n{tw}" for i, tw in enumerate(t))
    return f"🐦 TWITTER/X THREAD — {n}\n\n{numbered}"


# ── Main loop ──────────────────────────────────────────────────────────────────
toate_rezultate = {}
linii_txt       = [
    f"CONTINUT SOCIAL MEDIA PE NISE — AmCupon.ro — {DATA}",
    "=" * 70,
    "",
]

nise_active = 0

for nisa_key, nisa_cfg in NISE.items():
    magazine_nisa = get_magazine_nisa(nisa_key, nisa_cfg)
    if not magazine_nisa:
        continue

    nise_active += 1
    top3 = magazine_nisa[:3]
    rezultate_nisa = []

    linii_txt += [
        "",
        f"{'#' * 70}",
        f"  NISA: {nisa_cfg['emoji']} {nisa_cfg['label'].upper()}",
        f"  {len(magazine_nisa)} magazine active in aceasta nisa",
        f"{'#' * 70}",
        "",
    ]

    for m in top3:
        n_afis = m.get("magazin_display") or nume(m["magazin"])
        entry  = {
            "magazin":           m["magazin"],
            "nume":              n_afis,
            "nisa":              nisa_key,
            "nisa_label":        nisa_cfg["label"],
            "tiktok_script":     gen_tiktok(m, nisa_cfg),
            "instagram_caption": gen_instagram(m, nisa_cfg),
            "pinterest_pin":     gen_pinterest(m, nisa_cfg),
            "reddit_post":       gen_reddit(m, nisa_cfg),
            "twitter_thread":    gen_twitter(m, nisa_cfg),
        }
        rezultate_nisa.append(entry)

        linii_txt += [
            f"{'─' * 50}",
            f"MAGAZIN: {n_afis}",
            f"{'─' * 50}",
            "",
            entry["tiktok_script"],
            "",
            entry["instagram_caption"],
            "",
            entry["pinterest_pin"],
            "",
            entry["reddit_post"],
            "",
            entry["twitter_thread"],
            "",
            "",
        ]

    toate_rezultate[nisa_key] = rezultate_nisa

    # Fisier individual per nisa (usor de copiat pe mobil)
    nisa_lines = [
        f"{nisa_cfg['emoji']} {nisa_cfg['label'].upper()} — {DATA}",
        "=" * 50,
        "",
    ]
    for entry in rezultate_nisa:
        nisa_lines += [
            f">>> {entry['nume']} <<<",
            "",
            "[ TIKTOK ]",
            entry["tiktok_script"],
            "",
            "[ INSTAGRAM ]",
            entry["instagram_caption"],
            "",
            "[ PINTEREST ]",
            entry["pinterest_pin"],
            "",
            "[ REDDIT/FB ]",
            entry["reddit_post"],
            "",
            "-" * 40,
            "",
        ]
    with open(OUT_DIR / f"social-nisa-{nisa_key}.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(nisa_lines))


# ── Salveaza fisierele principale ─────────────────────────────────────────────
with open(OUT_JSON, "w", encoding="utf-8") as f:
    json.dump(toate_rezultate, f, ensure_ascii=False, indent=2)

with open(OUT_TXT, "w", encoding="utf-8") as f:
    f.write("\n".join(linii_txt))

total_posturi = sum(len(v) for v in toate_rezultate.values()) * 5

print(f"✅ Generat continut social media:")
print(f"   {nise_active} nise active")
print(f"   ~{total_posturi} postari gata de copiat")
print(f"   JSON: {OUT_JSON}")
print(f"   TXT:  {OUT_TXT}")
print(f"\n📂 Fisiere per nisa (in data/):")
for nisa_key in toate_rezultate:
    cfg = NISE[nisa_key]
    print(f"   social-nisa-{nisa_key}.txt — {cfg['emoji']} {cfg['label']}")
