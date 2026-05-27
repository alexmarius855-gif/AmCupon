#!/usr/bin/env python3
"""
Postare automata top 5 oferte ale zilei pe canalul Telegram AmCupon.

Setup (o singura data):
  1. Mergi la @BotFather pe Telegram -> /newbot -> copiaza token-ul
  2. Creeaza canalul (ex: @AmCuponRo) si adauga bot-ul ca Administrator cu permisiune "Post Messages"
  3. Pune secretele in GitHub Secrets:
       TELEGRAM_BOT_TOKEN = "1234567890:ABC..."
       TELEGRAM_CHANNEL_ID = "@AmCuponRo"   (sau ID numeric: -100123456789)

Env vars: TELEGRAM_BOT_TOKEN, TELEGRAM_CHANNEL_ID
"""

import os
import json
import sys
import requests
from pathlib import Path
from datetime import datetime

BOT_TOKEN  = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
CHANNEL_ID = os.environ.get("TELEGRAM_CHANNEL_ID", "").strip()

if not BOT_TOKEN or not CHANNEL_ID:
    print("⚠️  TELEGRAM_BOT_TOKEN sau TELEGRAM_CHANNEL_ID nu sunt setate — skip Telegram")
    sys.exit(0)

# ── Citeste output.json ───────────────────────────────────────────────────────
DATA_PATH = Path(__file__).parent.parent / "frontend" / "public" / "output.json"
if not DATA_PATH.exists():
    DATA_PATH = Path(__file__).parent.parent / "data" / "output.json"

with open(DATA_PATH, encoding="utf-8") as f:
    magazine = json.load(f)

RETELE = {"profitshare.ro", "2performant.com"}

# Magazine valide: au promotie, fara spatii in slug, fara retele
valide = [
    m for m in magazine
    if m.get("are_promotie")
    and m.get("promotii")
    and " " not in m.get("magazin", "")
    and m.get("magazin") not in RETELE
]

# Sortare: coduri cupon > rata succes > zile ramase
valide.sort(key=lambda m: (
    -(1 if m.get("cod_cupon") else 0),
    -m.get("procent_succes", 0),
    m.get("zile_ramase", 99),
))

top5 = valide[:5]

# ── Formatare mesaj ───────────────────────────────────────────────────────────
EMOJII = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"]

def format_oferta(m: dict, pos: int) -> str:
    slug   = m["magazin"]
    nume   = slug.split(".")[0].replace("-", " ").title()
    promo  = m["promotii"][0]
    titlu  = promo.get("nume", "Promotie activa")
    cod    = promo.get("cod_cupon", "")
    zile   = m.get("zile_ramase", 0)
    succes = m.get("procent_succes", 0)
    url    = f"https://amcupon.ro/cod-reducere/{slug}"

    linii = [f"{EMOJII[pos]} *{nume}*"]
    linii.append(f"📦 _{titlu}_")
    if cod:
        linii.append(f"🎟 Cod: `{cod}`")
    if succes > 0:
        linii.append(f"✅ {succes}% succes")
    if 0 < zile <= 7:
        linii.append(f"⏰ Expira in {zile} {'zi' if zile == 1 else 'zile'}!")
    linii.append(f"👉 [Vezi oferta]({url})")
    return "\n".join(linii)

# Data in romana
LUNI = ["ianuarie","februarie","martie","aprilie","mai","iunie",
        "iulie","august","septembrie","octombrie","noiembrie","decembrie"]
azi = datetime.now()
data_ro = f"{azi.day} {LUNI[azi.month - 1]} {azi.year}"

sectiuni = [format_oferta(m, i) for i, m in enumerate(top5)]

mesaj = (
    f"🔥 *Top Reduceri — {data_ro}*\n"
    f"_Selectia AmCupon.ro — verificate si sortate dupa rata de succes_\n\n"
    + "\n\n".join(sectiuni)
    + "\n\n"
    "━━━━━━━━━━━━━━━━━━━━\n"
    "🌐 [Toate ofertele](https://amcupon.ro) · "
    "[Top Reduceri](https://amcupon.ro/top-reduceri) · "
    "[Calculator](https://amcupon.ro/calculator)"
)

# ── Trimite pe Telegram ───────────────────────────────────────────────────────
resp = requests.post(
    f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
    json={
        "chat_id": CHANNEL_ID,
        "text": mesaj,
        "parse_mode": "Markdown",
        "disable_web_page_preview": True,
    },
    timeout=15,
)

if resp.ok:
    print(f"✅ Telegram: mesaj trimis ({len(top5)} oferte) pe {CHANNEL_ID}")
else:
    print(f"❌ Telegram error {resp.status_code}: {resp.text}")
    sys.exit(1)
