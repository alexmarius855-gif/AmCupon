"""
post_telegram.py — Postare automata pe Canal/Grup Telegram via Bot API
=======================================================================
Env vars necesare (GitHub Secrets):
  TELEGRAM_BOT_TOKEN   -- Token-ul botului (de la @BotFather)
  TELEGRAM_CHANNEL_ID  -- ID-ul canalului/grupului (ex: @amcuponro sau -100123456789)

Cum creezi botul si canalul (o singura data):
  1. Deschide Telegram → cauta @BotFather → /newbot
  2. Da un nume si username botului (ex: AmCuponBot)
  3. Copiaza token-ul primit → GitHub Secrets → TELEGRAM_BOT_TOKEN
  4. Creeaza canal Telegram (@AmCuponRO) → adauga botul ca Administrator
  5. Copiaza ID-ul canalului → GitHub Secrets → TELEGRAM_CHANNEL_ID
  6. Sau foloseste @userinfobot in Telegram pentru a obtine ID-ul exact

Ruleaza zilnic via GitHub Actions — acelasi workflow ca post_facebook.py.
Posteaza: 1-3 mesaje cu ofertele zilei, reduceri mari si brand spotlight.
"""

import json
import os
import re
import sys
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime, timezone, timedelta

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# ── Config ───────────────────────────────────────────────────────────────────
BOT_TOKEN  = os.environ.get("TELEGRAM_BOT_TOKEN", "")
CHANNEL_ID = os.environ.get("TELEGRAM_CHANNEL_ID", "")
SITE_URL   = "https://amcupon.ro"
API_URL    = f"https://api.telegram.org/bot{BOT_TOKEN}"

OUTPUT_JSON = os.path.join(os.path.dirname(__file__), "../frontend/public/output.json")

LUNI_RO = ["ianuarie","februarie","martie","aprilie","mai","iunie",
           "iulie","august","septembrie","octombrie","noiembrie","decembrie"]
ZILE_RO = ["Luni","Marti","Miercuri","Joi","Vineri","Sambata","Duminica"]

# ── Helpers ──────────────────────────────────────────────────────────────────

def send_message(text: str, parse_mode: str = "HTML", disable_preview: bool = True) -> bool:
    if not BOT_TOKEN or not CHANNEL_ID:
        print("TELEGRAM_BOT_TOKEN / TELEGRAM_CHANNEL_ID nu sunt setate — skip")
        return False

    payload = {
        "chat_id": CHANNEL_ID,
        "text": text,
        "parse_mode": parse_mode,
        "disable_web_page_preview": "true" if disable_preview else "false",
    }
    data = urllib.parse.urlencode(payload).encode("utf-8")
    req  = urllib.request.Request(f"{API_URL}/sendMessage", data=data, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read())
        if result.get("ok"):
            msg_id = result.get("result", {}).get("message_id", "?")
            print(f"  Telegram OK — message_id: {msg_id}")
            return True
        else:
            print(f"  Telegram error: {result.get('description', 'unknown')}")
            return False
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"  HTTP {e.code}: {body[:200]}")
        return False
    except Exception as e:
        print(f"  Eroare: {e}")
        return False


def get_best_promo(m: dict) -> dict:
    promotii = [p for p in m.get("promotii", []) if p.get("zile_ramase", -1) >= 0]
    cu_cod = [p for p in promotii if p.get("cod_cupon")]
    return cu_cod[0] if cu_cod else (promotii[0] if promotii else {})


def escape_html(text: str) -> str:
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


# ── Tipuri de mesaje ─────────────────────────────────────────────────────────

def msg_oferte_zilei(magazine: list, data_str: str, zi: str) -> str:
    cu_promotie = [m for m in magazine if m.get("are_promotie") and m.get("promotii")
                   and " " not in m.get("magazin", "")]
    top = sorted(cu_promotie, key=lambda x: -x.get("scor_final", 0))[:6]

    linii = [
        f"<b>🔥 {zi.upper()} — Ofertele Zilei</b>",
        f"<i>{data_str} | amcupon.ro</i>",
        "",
    ]
    for m in top:
        name = m["magazin"].split(".")[0].capitalize()
        promo = get_best_promo(m)
        cod   = promo.get("cod_cupon", "")
        desc  = escape_html((promo.get("nume") or promo.get("descriere") or "Oferta speciala")[:60])
        linie = f"• <b>{name}</b> — {desc}"
        if cod:
            linie += f"\n  <code>{cod}</code>"
        linii.append(linie)

    linii += [
        "",
        f'<a href="{SITE_URL}/oferte-azi">Toate ofertele verificate →</a>',
        "",
        "#reduceri #codreducere #shoppingonline #amcupon",
    ]
    return "\n".join(linii)


def msg_reduceri_mari(magazine: list, data_str: str) -> str:
    oferte_pct = []
    for m in magazine:
        for p in m.get("promotii", []):
            titlu = p.get("nume", "") or ""
            match = re.search(r"(\d+)\s*%", titlu)
            if match:
                disc = int(match.group(1))
                if 20 <= disc <= 80 and p.get("zile_ramase", -1) >= 0:
                    oferte_pct.append({
                        "magazin": m["magazin"],
                        "disc": disc,
                        "titlu": escape_html(titlu[:60]),
                        "cod":   p.get("cod_cupon", ""),
                        "link":  p.get("landing_page") or m.get("url_afiliat", ""),
                    })
    oferte_pct.sort(key=lambda x: x["disc"], reverse=True)

    if not oferte_pct:
        return ""

    linii = [
        f"<b>💰 REDUCERI MARI — {data_str}</b>",
        "",
        "Cele mai mari procente active chiar acum:",
        "",
    ]
    for o in oferte_pct[:5]:
        name = o["magazin"].split(".")[0].capitalize()
        linie = f"<b>-{o['disc']}%</b> la {name}"
        if o["cod"]:
            linie += f" → cod: <code>{o['cod']}</code>"
        linii.append(f"🏷 {linie}")
        linii.append(f"   <i>{o['titlu']}</i>")
        linii.append("")

    linii += [
        f'<a href="{SITE_URL}/top-reduceri">Top reduceri ale lunii →</a>',
        "",
        "#reduceriMari #codreducere #shoppingRomania #amcupon",
    ]
    return "\n".join(linii)


def msg_brand_spotlight(magazine: list, data_str: str, saptamana: int) -> str:
    BRANDURI = [
        ("emag", "eMAG", "/emag"),
        ("altex", "Altex", "/altex"),
        ("fashiondays", "Fashion Days", "/fashiondays"),
        ("noriel", "Noriel", "/noriel"),
        ("decathlon", "Decathlon", "/decathlon"),
        ("carturesti", "Carturesti", "/carturesti"),
        ("drmax", "Dr. Max", "/drmax"),
        ("answear", "Answear", "/answear"),
        ("notino", "Notino", "/notino"),
        ("flanco", "Flanco", "/flanco"),
    ]
    slug_b, name_b, path_b = BRANDURI[saptamana % len(BRANDURI)]
    brand_mag = next((m for m in magazine if slug_b in m.get("magazin", "").lower()), None)

    linii = [
        f"<b>⭐ BRAND SAPTAMANEI: {name_b.upper()}</b>",
        "",
        f"Ghid complet cu toate ofertele active {name_b}:",
        "",
    ]

    if brand_mag:
        promotii_b = [p for p in brand_mag.get("promotii", []) if p.get("zile_ramase", -1) >= 0]
        for p in promotii_b[:3]:
            cod  = p.get("cod_cupon", "")
            desc = escape_html((p.get("nume") or p.get("descriere") or "")[:65])
            if desc:
                linii.append(f"✔ {desc}")
                if cod:
                    linii.append(f"   Cod: <code>{cod}</code>")
                linii.append("")
        if not promotii_b:
            linii.append(f"Descopera cele mai bune oferte {name_b} pe AmCupon.ro!")
            linii.append("")
    else:
        linii.append(f"Descopera istoricul reducerilor si sfaturi de cumparaturi {name_b}!")
        linii.append("")

    linii += [
        f'<a href="{SITE_URL}{path_b}">Ghid complet {name_b} →</a>',
        "",
        f"#{name_b.replace(' ', '').lower()} #reduceri #codreducere #amcupon",
    ]
    return "\n".join(linii)


def msg_cod_cupon(magazine: list, data_str: str) -> str:
    cu_cod = [m for m in magazine
              if m.get("cod_cupon") and m.get("promotii")
              and any(p.get("cod_cupon") and p.get("zile_ramase", -1) >= 0
                      for p in m.get("promotii", []))]

    if not cu_cod:
        return ""

    linii = [
        f"<b>🎟 CODURI DE REDUCERE ACTIVE — {data_str}</b>",
        "",
        "Copiaza si aplica la checkout:",
        "",
    ]
    for m in cu_cod[:5]:
        name = m["magazin"].split(".")[0].capitalize()
        promo = get_best_promo(m)
        cod  = promo.get("cod_cupon", "")
        desc = escape_html((promo.get("nume") or "Reducere activa")[:55])
        zile = promo.get("zile_ramase", 99)
        expira = f" ⚠ Expira in {zile}z" if zile <= 3 else ""
        linii.append(f"<b>{name}</b> — <code>{cod}</code>{expira}")
        linii.append(f"   <i>{desc}</i>")
        linii.append("")

    linii += [
        f'<a href="{SITE_URL}/oferte-azi">Toate codurile active →</a>',
        "",
        "#codreducere #voucher #economii #romania #amcupon",
    ]
    return "\n".join(linii)


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    if not BOT_TOKEN or not CHANNEL_ID:
        print("TELEGRAM_BOT_TOKEN / TELEGRAM_CHANNEL_ID nu sunt setate — skip Telegram")
        sys.exit(0)

    if not os.path.exists(OUTPUT_JSON):
        print(f"Fisier lipsa: {OUTPUT_JSON}")
        sys.exit(1)

    with open(OUTPUT_JSON, encoding="utf-8") as f:
        magazine = json.load(f)

    now_ro   = datetime.now(timezone.utc) + timedelta(hours=3)
    zi_idx   = now_ro.weekday()
    zi_name  = ZILE_RO[zi_idx]
    data_str = f"{now_ro.day} {LUNI_RO[now_ro.month - 1]}"
    sapt_nr  = now_ro.isocalendar()[1]

    posted = 0

    # 1. Coduri active — zilnic (cel mai util pentru abonati)
    msg1 = msg_cod_cupon(magazine, data_str)
    if msg1:
        print("Post coduri cupon:")
        print(msg1[:200], "...\n")
        if send_message(msg1):
            posted += 1

    # 2. Ofertele zilei — zilnic
    msg2 = msg_oferte_zilei(magazine, data_str, zi_name)
    print("Post oferte zilei:")
    print(msg2[:200], "...\n")
    if send_message(msg2):
        posted += 1

    # 3. Reduceri mari — cand avem % in titlu
    msg3 = msg_reduceri_mari(magazine, data_str)
    if msg3:
        print("Post reduceri mari:")
        print(msg3[:200], "...\n")
        if send_message(msg3):
            posted += 1

    # 4. Brand spotlight — joia
    if zi_idx == 3:
        msg4 = msg_brand_spotlight(magazine, data_str, sapt_nr)
        print("Post brand spotlight:")
        print(msg4[:200], "...\n")
        if send_message(msg4):
            posted += 1

    print(f"\nTelegram: {posted} mesaje trimise pe {data_str} ✓")
    print(f"Adauga in GitHub Secrets: TELEGRAM_BOT_TOKEN + TELEGRAM_CHANNEL_ID")


if __name__ == "__main__":
    main()
