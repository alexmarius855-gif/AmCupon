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

16.09.2026 — rescris dupa 3 zile fara nicio postare (14-16.09):
  · Mod HTML in loc de Markdown. In Markdown-ul vechi al Telegram, „\\_" NU e escape in
    interiorul unei entitati: titlul „Geeta Hair_Mother's Day Sale" pus intre _..._ lasa un „_"
    fara pereche. Eroarea API „can't find end of the entity starting at byte offset 895" arata
    exact acel caracter (verificat pe mesajul reconstruit din datele rularii). In HTML se
    escapeaza doar < > &, oriunde, fara exceptii.
  · Fara „% succes" si fara „sortate dupa rata de succes": `procent_succes` e un numar aleator
    (docs/LECTII-TEHNICE.md #10). Ordinea e acum: are cod, apoi expira mai curand.
  · Titlul vine din `promotii.titlu_afisabil` — la Impact, `nume` e des doar codul.
"""

import html
import json
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

import requests

sys.path.insert(0, str(Path(__file__).parent))
from promotii import FARA_DATA, nume_afisabil, titlu_afisabil  # noqa: E402

DATA_PATH = Path(__file__).parent.parent / "frontend" / "public" / "output.json"

RETELE = {"profitshare.ro", "2performant.com"}
EMOJII = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"]
LUNI = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
        "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"]


def _promo_de_afisat(m: dict) -> dict:
    """Promotia cu cod care expira cel mai curand; altfel prima."""
    promotii = [p for p in (m.get("promotii") or []) if isinstance(p, dict)]
    cu_cod = [p for p in promotii if (p.get("cod_cupon") or "").strip()]
    candidati = cu_cod or promotii
    return min(candidati, key=lambda p: p.get("zile_ramase", FARA_DATA)) if candidati else {}


def alege_top5(magazine: list) -> list:
    """(magazin, promotie) pentru primele 5 oferte. Un brand o singura data: vevor.com,
    vevor.com.au si eur.vevor.com au acelasi cod — pe canal ar fi trei randuri identice."""
    valide = [m for m in magazine
              if isinstance(m, dict) and m.get("promotii")
              and " " not in (m.get("magazin") or "") and m.get("magazin") not in RETELE]
    perechi = [(m, _promo_de_afisat(m)) for m in valide]
    perechi.sort(key=lambda mp: (
        0 if (mp[1].get("cod_cupon") or "").strip() else 1,
        mp[1].get("zile_ramase", FARA_DATA),
        mp[0].get("magazin", ""),
    ))
    top, branduri, coduri = [], set(), set()
    for m, p in perechi:
        brand = nume_afisabil(m).lower()
        cod = (p.get("cod_cupon") or "").strip().upper()
        if brand in branduri or (cod and cod in coduri):
            continue
        branduri.add(brand)
        if cod:
            coduri.add(cod)
        top.append((m, p))
        if len(top) == 5:
            break
    return top


def _expirare(zile) -> str:
    if not isinstance(zile, int) or zile >= FARA_DATA or zile > 7:
        return ""
    if zile == 0:
        return "⏰ Expiră azi!"
    if zile == 1:
        return "⏰ Expiră mâine"
    return f"⏰ Expiră în {zile} zile"


def format_oferta(m: dict, p: dict, pos: int) -> str:
    e = html.escape
    titlu = titlu_afisabil(p)
    if len(titlu) > 120:
        titlu = titlu[:117].rstrip() + "..."
    url = f"https://amcupon.ro/cod-reducere/{m['magazin']}"
    linii = [f"{EMOJII[pos]} <b>{e(nume_afisabil(m))}</b>"]
    if titlu:
        linii.append(f"📦 <i>{e(titlu)}</i>")
    cod = (p.get("cod_cupon") or "").strip()
    if cod:
        linii.append(f"🎟 Cod: <code>{e(cod)}</code>")
    exp = _expirare(p.get("zile_ramase"))
    if exp:
        linii.append(exp)
    linii.append(f'👉 <a href="{e(url, quote=True)}">Vezi oferta</a>')
    return "\n".join(linii)


def construieste_mesaj(magazine: list, acum: datetime) -> str:
    top5 = alege_top5(magazine)
    if not top5:
        return ""
    data_ro = f"{acum.day} {LUNI[acum.month - 1]} {acum.year}"
    return (
        f"🔥 <b>Top reduceri — {data_ro}</b>\n"
        f"<i>Selecția AmCupon.ro: codurile active azi, cele care expiră curând primele</i>\n\n"
        + "\n\n".join(format_oferta(m, p, i) for i, (m, p) in enumerate(top5))
        + "\n\n━━━━━━━━━━━━━━━━━━━━\n"
        '🌐 <a href="https://amcupon.ro">Toate ofertele</a> · '
        '<a href="https://amcupon.ro/top-reduceri">Top reduceri</a> · '
        '<a href="https://amcupon.ro/calculator">Calculator</a>'
    )


def main() -> int:
    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
    channel_id = os.environ.get("TELEGRAM_CHANNEL_ID", "").strip()
    if not bot_token or not channel_id:
        print("⚠️  TELEGRAM_BOT_TOKEN sau TELEGRAM_CHANNEL_ID nu sunt setate — skip Telegram")
        return 0

    with open(DATA_PATH, encoding="utf-8") as f:
        magazine = json.load(f)
    mesaj = construieste_mesaj(magazine, datetime.now(timezone.utc) + timedelta(hours=3))
    if not mesaj:
        print("Telegram: nicio promotie activa azi — nu trimit nimic.")
        return 0

    resp = requests.post(
        f"https://api.telegram.org/bot{bot_token}/sendMessage",
        json={
            "chat_id": channel_id,
            "text": mesaj,
            "parse_mode": "HTML",
            "disable_web_page_preview": True,
        },
        timeout=15,
    )
    if resp.ok:
        print(f"✅ Telegram: top 5 trimis ({len(mesaj.encode('utf-8'))} bytes)")
        return 0
    print(f"❌ Telegram error {resp.status_code}: {resp.text}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
