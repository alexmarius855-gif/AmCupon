"""
Health check: verifica daca pipeline-ul AmCupon.ro a rulat in fereastra asteptata.
Trimite alerta Telegram daca output.json nu s-a actualizat in ultimele MAX_AGE_HOURS ore.

Rulat din GitHub Actions dupa pasul de commit/push.
"""

import os
import sys
import json
import time
import datetime
import urllib.request
import urllib.error

MAX_AGE_HOURS = 6  # cron la fiecare 4h → 6h buffer
OUTPUT_JSON = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "frontend", "public", "output.json"
)

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHANNEL_ID = os.environ.get("TELEGRAM_CHANNEL_ID", "")


def send_telegram(message: str) -> bool:
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHANNEL_ID:
        print("TELEGRAM_BOT_TOKEN sau TELEGRAM_CHANNEL_ID lipsesc — skip alerta")
        return False
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = json.dumps({
        "chat_id": TELEGRAM_CHANNEL_ID,
        "text": message,
        "parse_mode": "HTML",
    }).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status == 200
    except urllib.error.URLError as e:
        print(f"Eroare trimitere Telegram: {e}")
        return False


def main():
    if not os.path.exists(OUTPUT_JSON):
        msg = (
            "⚠️ <b>ALERTĂ AmCupon.ro</b>\n\n"
            "❌ <code>frontend/public/output.json</code> nu există!\n"
            "Pipeline-ul poate fi stricat complet."
        )
        print(f"ALERTĂ: {OUTPUT_JSON} lipsește!")
        send_telegram(msg)
        sys.exit(1)

    mtime = os.path.getmtime(OUTPUT_JSON)
    age_seconds = time.time() - mtime
    age_hours = age_seconds / 3600
    last_update = datetime.datetime.fromtimestamp(mtime, tz=datetime.timezone.utc)
    last_update_str = last_update.strftime("%Y-%m-%d %H:%M UTC")

    print(f"output.json ultima modificare: {last_update_str} ({age_hours:.1f}h in urma)")

    if age_hours > MAX_AGE_HOURS:
        msg = (
            f"⚠️ <b>ALERTĂ AmCupon.ro — Pipeline oprit!</b>\n\n"
            f"<code>output.json</code> nu s-a actualizat de <b>{age_hours:.0f} ore</b>.\n"
            f"Ultima actualizare: {last_update_str}\n\n"
            f"Verificati: https://github.com → Actions → Actualizare Automata"
        )
        print(f"ALERTĂ: output.json are {age_hours:.1f}h vechime (max permis: {MAX_AGE_HOURS}h)")
        send_telegram(msg)
        sys.exit(1)
    else:
        print(f"OK: output.json actualizat recent ({age_hours:.1f}h < {MAX_AGE_HOURS}h)")


if __name__ == "__main__":
    main()
