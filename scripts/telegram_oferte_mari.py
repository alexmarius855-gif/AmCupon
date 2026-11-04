"""
telegram_oferte_mari.py — trimite pe canalul de Telegram produsele cu reducere mare (04.11.2026).

Cum alege: reducere de cel putin PRAG_REDUCERE% fata de pretul vechi anuntat de magazin, din public/criterii.json.
Cum nu spameaza: cel mult MAX_PE_RULARE mesaje; acelasi produs nu revine in 14 zile, decat daca pretul scade cu inca 5%.
Codul: se arata mascat. Un cod intreg pe canal se copiaza si se cumpara fara linkul nostru, deci fara comision.
Linkul: scurt, prin amcupon.ro/go/p/<id>?de=telegram, ca sa stim ca vanzarea a venit de pe canal.

PAUZA: fara `--trimite` doar afiseaza mesajele. In pipeline ruleaza doar cand TELEGRAM_PAUZA nu e „true" (pauza ceruta
de Alex pe 16.09.2026).

    python telegram_oferte_mari.py              # arata ce ar trimite
    python telegram_oferte_mari.py --trimite    # trimite (cere TELEGRAM_BOT_TOKEN, TELEGRAM_CHANNEL_ID)
    python telegram_oferte_mari.py --test
"""
from __future__ import annotations

import html
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CRITERII = os.path.join(ROOT, "frontend", "public", "criterii.json")
OUTPUT = os.path.join(ROOT, "frontend", "public", "output.json")
TRIMISE = os.path.join(ROOT, "data", "telegram-oferte-trimise.json")
SITE = "https://amcupon.ro"
PRAG_REDUCERE = 35
MAX_PE_RULARE = 3
ZILE_PAUZA = 14


def lei(n: float) -> str:
    return f"{n:,.0f}".replace(",", ".") + " lei"


def procent(p: dict) -> int:
    v = p.get("pret_vechi")
    return round((v - p["pret"]) / v * 100) if v and v > p["pret"] else 0


def cod_mascat(cod: str) -> str:
    """Ca pe site: doar ultimele doua caractere; un cod scurt nu se arata deloc."""
    return f"***{cod[-2:]}" if cod and len(cod) >= 5 else ""


def candidati(criterii: list, trimise: dict, azi: datetime) -> list:
    """Produsele peste prag, cele mai mari reduceri primele, fara ce s-a trimis deja."""
    limita = (azi - timedelta(days=ZILE_PAUZA)).strftime("%Y-%m-%d")
    alese: dict = {}
    for c in criterii:
        for p in c.get("produse") or []:
            if not p.get("id") or procent(p) < PRAG_REDUCERE:
                continue
            vechi = trimise.get(p["id"])
            if vechi and vechi.get("data", "") >= limita and p["pret"] > vechi.get("pret", 0) * 0.95:
                continue
            alese[p["id"]] = dict(p, _actualizat=c.get("actualizat", ""))
    return sorted(alese.values(), key=lambda p: (-procent(p), p["pret"]))


def mesaj(p: dict, nume_magazin: str, cod: str = "") -> str:
    """Text HTML pentru Telegram; legenda unei fotografii are cel mult 1024 de caractere."""
    linii = [
        f"🔥 <b>-{procent(p)}%</b> {html.escape(p['titlu'][:110])}",
        "",
        f"<s>{lei(p['pret_vechi'])}</s> → <b>{lei(p['pret'])}</b> (economisești {lei(p['pret_vechi'] - p['pret'])})",
        f"🏪 {html.escape(nume_magazin)}",
    ]
    masca = cod_mascat(cod)
    if masca:
        linii.append(f"🎟 Are și cod de reducere ({masca}): {SITE}/cod-reducere/{urllib.parse.quote(p['magazin'])}")
    linii += [
        "",
        f"👉 {SITE}/go/p/{urllib.parse.quote(p['id'])}?de=telegram",
        "",
        f"<i>Preț din feed la {p.get('_actualizat', '')}; prețul tăiat e cel anunțat de magazin. Link afiliat.</i>",
    ]
    return "\n".join(linii)


def trimite(p: dict, text: str) -> bool:
    token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
    canal = os.environ.get("TELEGRAM_CHANNEL_ID", "")
    if not token or not canal:
        print("TELEGRAM_BOT_TOKEN / TELEGRAM_CHANNEL_ID lipsesc: nu trimit nimic.")
        return False
    date = urllib.parse.urlencode({"chat_id": canal, "photo": p.get("imagine", ""), "caption": text, "parse_mode": "HTML"}).encode()
    try:
        with urllib.request.urlopen(urllib.request.Request(f"https://api.telegram.org/bot{token}/sendPhoto", data=date), timeout=30) as r:
            return r.status == 200
    except urllib.error.URLError as e:
        # Fara adresa cererii in log: contine tokenul.
        print(f"Telegram a refuzat mesajul: {getattr(e, 'code', '')} {getattr(e, 'reason', '')}")
        return False


def citeste(cale: str, rezerva):
    try:
        with open(cale, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return rezerva


def main() -> int:
    azi = datetime.now(timezone.utc)
    criterii = citeste(CRITERII, {}).get("criterii") or []
    trimise = citeste(TRIMISE, {})
    magazine = {m["magazin"]: m for m in citeste(OUTPUT, [])}
    alese = candidati(criterii, trimise, azi)
    print(f"Produse cu cel putin -{PRAG_REDUCERE}%, netrimise recent: {len(alese)}")
    trimite_acum = "--trimite" in sys.argv
    n = 0
    for p in alese[:MAX_PE_RULARE]:
        m = magazine.get(p["magazin"], {})
        cod = next((x.get("cod_cupon") for x in m.get("promotii") or [] if x.get("cod_cupon")), "") or ""
        text = mesaj(p, p["magazin"].split(".")[0].title(), cod)
        if not trimite_acum:
            print("\n--- ar trimite ---\n" + text)
            continue
        if trimite(p, text):
            trimise[p["id"]] = {"pret": p["pret"], "data": azi.strftime("%Y-%m-%d")}
            n += 1
    if trimite_acum:
        limita = (azi - timedelta(days=60)).strftime("%Y-%m-%d")
        with open(TRIMISE, "w", encoding="utf-8") as f:
            json.dump({k: v for k, v in trimise.items() if v.get("data", "") >= limita}, f, ensure_ascii=False, indent=0)
        print(f"Trimise: {n}")
    return 0


def test() -> int:
    azi = datetime(2026, 11, 4, tzinfo=timezone.utc)
    p = {"id": "a1", "titlu": 'Televizor <55"> & OLED', "pret": 600.0, "pret_vechi": 1000.0, "magazin": "evomag.ro", "imagine": "https://x/y.jpg", "_actualizat": "2026-11-04"}
    mic = dict(p, id="a2", pret_vechi=700.0)
    fara = {"id": "a3", "titlu": "X", "pret": 10.0, "pret_vechi": None, "magazin": "a.ro"}
    c = [{"actualizat": "2026-11-04", "produse": [mic, p, fara]}]
    t = mesaj(p, "Evomag", "BLACK40")
    asteptari = [
        ("reducerea corecta", procent(p), 40),
        ("sub prag nu intra", [x["id"] for x in candidati(c, {}, azi)], ["a1"]),
        ("trimis recent nu revine", candidati(c, {"a1": {"pret": 600.0, "data": "2026-11-01"}}, azi), []),
        ("revine daca pretul scade cu peste 5%", [x["id"] for x in candidati(c, {"a1": {"pret": 700.0, "data": "2026-11-01"}}, azi)], ["a1"]),
        ("revine dupa 14 zile", [x["id"] for x in candidati(c, {"a1": {"pret": 600.0, "data": "2026-10-01"}}, azi)], ["a1"]),
        ("codul intreg nu apare", "BLACK40" in t, False),
        ("codul mascat apare", "***40" in t, True),
        ("cod scurt nu apare deloc", cod_mascat("AB12"), ""),
        ("titlul e scapat pentru HTML", "&lt;55&quot;&gt; &amp; OLED" in t, True),
        ("linkul e scurt si etichetat", f"{SITE}/go/p/a1?de=telegram" in t, True),
        ("spune ca e link afiliat", "Link afiliat" in t, True),
        ("incape in legenda", len(t) <= 1024, True),
    ]
    rau = [(n, a, e) for n, a, e in asteptari if a != e]
    for n, a, e in rau:
        print(f"  PICA  {n}: {a!r} (asteptat {e!r})")
    print("TOATE TREC" if not rau else f"{len(rau)} asteptari incalcate")
    return 1 if rau else 0


if __name__ == "__main__":
    sys.exit(test() if "--test" in sys.argv else main())
