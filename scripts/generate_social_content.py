#!/usr/bin/env python3
"""
Generator de continut social media pentru AmCupon.ro.

Genereaza postari gata-de-copiat pentru:
  - TikTok / Instagram Reels (script video)
  - Instagram Feed (caption)
  - Pinterest (titlu + descriere pin)
  - Facebook Groups / Reddit (post text)
  - Twitter/X (thread)

Output: data/social-content.json (pentru referinta)
        data/social-content-today.txt (text formatat, gata de copiat)

Rulare: python generate_social_content.py
"""

import json
import random
from pathlib import Path
from datetime import datetime

# ── Date ───────────────────────────────────────────────────────────────────────
DATA_PATH = Path(__file__).parent.parent / "frontend" / "public" / "output.json"
OUT_JSON  = Path(__file__).parent.parent / "data" / "social-content.json"
OUT_TXT   = Path(__file__).parent.parent / "data" / "social-content-today.txt"
OUT_JSON.parent.mkdir(exist_ok=True)

with open(DATA_PATH, encoding="utf-8") as f:
    magazine = json.load(f)

LUNI = ["ianuarie","februarie","martie","aprilie","mai","iunie",
        "iulie","august","septembrie","octombrie","noiembrie","decembrie"]
azi  = datetime.now()
LUNA = LUNI[azi.month - 1]
AN   = azi.year

RETELE = {"profitshare.ro", "2performant.com"}

valide = [
    m for m in magazine
    if m.get("are_promotie") and m.get("promotii")
    and " " not in m.get("magazin", "")
    and m.get("magazin") not in RETELE
    and m.get("procent_succes", 0) >= 50
]
valide.sort(key=lambda m: (-m.get("procent_succes", 0), -(1 if m.get("cod_cupon") else 0)))

top_magazine = valide[:15]

def nume(slug: str) -> str:
    return slug.split(".")[0].replace("-", " ").title()

def gen_tiktok_script(m: dict) -> str:
    n    = nume(m["magazin"])
    promo = m["promotii"][0]
    cod  = promo.get("cod_cupon", "")
    titlu = promo.get("nume", "promotie activa")
    succes = m.get("procent_succes", 0)

    if cod:
        return f"""🎬 SCRIPT TIKTOK — {n}

HOOK (0-3 sec):
"Stii ca poti economisi bani la {n}? Iata codul SECRET!"

BODY (3-25 sec):
"Mergi pe AmCupon.ro, cauti {n}, copiezi codul {cod} si il folosesti la checkout.
{titlu}. Rata de succes {succes}% — deci chiar merge!"

CTA (25-30 sec):
"Link in bio → amcupon.ro. Salveaza videoul asta sa nu uiti!"

HASHTAG-URI:
#codreducere #{n.replace(" ", "").lower()} #reduceri #shopping #romania
#amcupon #voucher #economii #cumparaturi #oferte"""
    else:
        return f"""🎬 SCRIPT TIKTOK — {n}

HOOK (0-3 sec):
"Reducere ACTIVA la {n} chiar acum — iata cum o folosesti!"

BODY (3-25 sec):
"Intra pe AmCupon.ro, gasesti {n} si accesezi direct oferta.
{titlu}. Nu ai nevoie de niciun cod — reducerea se aplica automat!"

CTA (25-30 sec):
"Link in bio → amcupon.ro. Dai follow sa nu ratezi ofertele!"

HASHTAG-URI:
#reduceri #{n.replace(" ", "").lower()} #oferte #shopping #romania
#amcupon #economii #promotii"""

def gen_instagram_caption(m: dict) -> str:
    n    = nume(m["magazin"])
    promo = m["promotii"][0]
    cod  = promo.get("cod_cupon", "")
    titlu = promo.get("nume", "promotie activa")
    succes = m.get("procent_succes", 0)
    zile = m.get("zile_ramase", 0)
    url  = f"amcupon.ro/cod-reducere/{m['magazin']}"

    lines = [f"🛍️ Cod reducere {n} activ in {LUNA} {AN}!", ""]
    lines.append(f"✅ {titlu}")
    if cod:
        lines.append(f"🎟️ Cod: {cod}")
    if succes > 0:
        lines.append(f"📊 {succes}% rata de succes — verificat!")
    if 0 < zile <= 7:
        lines.append(f"⚠️ Expira in {zile} {'zi' if zile == 1 else 'zile'}!")
    lines += [
        "",
        f"👉 Gasesti codul pe {url}",
        "",
        "💡 AmCupon.ro — coduri verificate zilnic, 100% gratuit!",
        "",
        "#codreducere #reduceri #shopping #romania #voucher #economii",
        f"#{n.replace(' ', '').lower()} #oferte #cumparaturi #amcupon",
    ]
    return "\n".join(lines)

def gen_pinterest_pin(m: dict) -> str:
    n     = nume(m["magazin"])
    promo = m["promotii"][0]
    cod   = promo.get("cod_cupon", "")
    titlu = promo.get("nume", "promotie activa")
    url   = f"https://amcupon.ro/cod-reducere/{m['magazin']}"

    titlu_pin = f"Cod Reducere {n} {LUNA} {AN} — Voucher Verificat"
    if cod:
        titlu_pin = f"Cod Reducere {n}: {cod} | {LUNA} {AN}"

    desc = (
        f"{titlu_pin}. "
        f"{titlu}. "
        f"Codul de reducere {n} verificat si actualizat pe AmCupon.ro — "
        f"cel mai mare site de coduri din Romania. "
        f"Economiseste la cumparaturi online!"
    )

    return f"""📌 PINTEREST PIN — {n}

TITLU (max 100 caractere):
{titlu_pin}

DESCRIERE (max 500 caractere):
{desc}

URL:
{url}

BOARD RECOMANDAT: Coduri Reducere Romania / Economii Shopping"""

def gen_reddit_post(m: dict) -> str:
    n    = nume(m["magazin"])
    promo = m["promotii"][0]
    cod  = promo.get("cod_cupon", "")
    titlu = promo.get("nume", "promotie activa")
    succes = m.get("procent_succes", 0)
    zile = m.get("zile_ramase", 0)
    url  = f"https://amcupon.ro/cod-reducere/{m['magazin']}"

    if cod:
        titlu_post = f"[Cod reducere] {n} — {titlu} (cod: {cod}, {succes}% succes)"
        body = f"""Am gasit un cod de reducere activ pentru {n}:

**Oferta:** {titlu}
**Cod:** `{cod}`
**Rata de succes:** {succes}%"""
    else:
        titlu_post = f"[Reducere] {n} — {titlu}"
        body = f"""Reducere activa la {n}:

**Oferta:** {titlu}
**Rata de succes:** {succes}%"""

    if 0 < zile <= 7:
        body += f"\n**Expira in:** {zile} {'zi' if zile == 1 else 'zile'}"

    body += f"""

Link: {url}

Sursa: AmCupon.ro (verific si actualizez zilnic)"""

    return f"""💬 REDDIT / FACEBOOK GRUP — {n}

TITLU THREAD:
{titlu_post}

CONTINUT:
{body}

SUBREDDIT-URI POTRIVITE: r/Romania, r/cluj, r/Bucuresti, r/deals"""

def gen_twitter_thread(m: dict) -> str:
    n    = nume(m["magazin"])
    promo = m["promotii"][0]
    cod  = promo.get("cod_cupon", "")
    titlu = promo.get("nume", "promotie activa")
    url  = f"amcupon.ro/cod-reducere/{m['magazin']}"

    tweets = []
    if cod:
        tweets.append(f"🧵 Cod reducere {n} activ acum:\n\nOferta: {titlu}\nCod: {cod}\n\n👇 Cum il folosesti:")
        tweets.append(f"1/ Mergi pe site-ul {m['magazin']}\n2/ Adauga produse in cos\n3/ La checkout, cauta campul 'Cod promotional'\n4/ Introdu: {cod}\n5/ Reducerea se aplica instant ✅")
        tweets.append(f"Gasesti mai multe coduri verificate pe:\n{url}\n\n#codreducere #romania #{n.replace(' ', '').lower()}")
    else:
        tweets.append(f"Reducere automata activa la {n}:\n\n{titlu}\n\nNu ai nevoie de cod — se aplica direct!\n\n{url}\n\n#reduceri #romania")

    numbered = "\n\n---\n\n".join(f"Tweet {i+1}:\n{t}" for i, t in enumerate(tweets))
    return f"🐦 TWITTER/X THREAD — {n}\n\n{numbered}"

# ── Genereaza continut ────────────────────────────────────────────────────────
rezultate = []
for m in top_magazine[:10]:  # top 10 magazine
    n = nume(m["magazin"])
    entry = {
        "magazin": m["magazin"],
        "nume": n,
        "tiktok_script": gen_tiktok_script(m),
        "instagram_caption": gen_instagram_caption(m),
        "pinterest_pin": gen_pinterest_pin(m),
        "reddit_post": gen_reddit_post(m),
        "twitter_thread": gen_twitter_thread(m),
    }
    rezultate.append(entry)

# ── Salveaza JSON ─────────────────────────────────────────────────────────────
with open(OUT_JSON, "w", encoding="utf-8") as f:
    json.dump(rezultate, f, ensure_ascii=False, indent=2)

# ── Salveaza TXT (gata de copiat) ─────────────────────────────────────────────
linii = [
    f"CONTINUT SOCIAL MEDIA — AmCupon.ro — {azi.strftime('%d.%m.%Y')}",
    "=" * 60,
    "",
]

for entry in rezultate:
    linii += [
        f"{'=' * 60}",
        f"MAGAZIN: {entry['nume']} ({entry['magazin']})",
        f"{'=' * 60}",
        "",
        entry["tiktok_script"],
        "",
        "─" * 40,
        "",
        entry["instagram_caption"],
        "",
        "─" * 40,
        "",
        entry["pinterest_pin"],
        "",
        "─" * 40,
        "",
        entry["reddit_post"],
        "",
        "─" * 40,
        "",
        entry["twitter_thread"],
        "",
        "",
    ]

with open(OUT_TXT, "w", encoding="utf-8") as f:
    f.write("\n".join(linii))

print(f"✅ Generat continut social media pentru {len(rezultate)} magazine")
print(f"   JSON: {OUT_JSON}")
print(f"   TXT:  {OUT_TXT}")
print(f"\n📋 Magazine incluse:")
for e in rezultate:
    print(f"   - {e['nume']}")
