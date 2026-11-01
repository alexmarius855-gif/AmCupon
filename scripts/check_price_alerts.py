"""
check_price_alerts.py — Trimite alerte targetate cand un magazin urmarit primeste o oferta noua.

Flux:
  1. Citeste data/price_alert_snapshot.json (ofertele active vazute la rularea anterioara)
  2. Compara cu frontend/public/output.json (starea curenta)
  3. Pentru fiecare magazin cu oferta noua aparuta, gaseste abonatii Brevo care au
     magazinul respectiv in atributul custom ALERT_STORES (CSV, setat de
     frontend/app/api/newsletter/route.ts cand userul foloseste PriceAlert.tsx)
  4. Trimite email tranzactional Brevo catre fiecare abonat potrivit
  5. Suprascrie snapshot-ul cu starea curenta

01.11.2026: alerta pe magazin promite „te notificam cand apare o oferta noua" (PriceAlert.tsx), dar
scriptul trimitea doar la COD nou — o campanie fara cod (Black Friday la DoctorShield) nu ajungea la
nimeni. Acum orice oferta noua conteaza, iar emailul NU mai arata codul in clar (il vezi pe pagina
ofertei, dupa linkul platit; altfel cine copiaza codul din email cumpara fara comision).

Utilizare:
  python check_price_alerts.py             # ruleaza normal, trimite alerte reale
  python check_price_alerts.py --dry-run    # arata ce ar trimite, nu trimite nimic
  python check_price_alerts.py --test       # verificari pe date construite

Env vars necesare:
  BREVO_API_KEY      -- xkeysib-... (Contacts + Transactional API)
  BREVO_LIST_ID       -- ID lista Brevo (default: 2, acelasi cu newsletter-ul general)
  BREVO_SENDER_EMAIL  -- default: newsletter@amcupon.ro

NOTA: necesita ca expeditorul sa fie verificat in Brevo (Settings -> Senders),
altfel trimiterea esueaza cu HTTP 400 -- vezi problema activa din CLAUDE.md.

Atributul custom ALERT_STORES trebuie creat o singura data in Brevo:
  Contacts -> Settings -> Contact attributes -> Text -> ALERT_STORES
"""

import argparse
import html
import json
import os
import re
import sys
import urllib.error
import urllib.request

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

BREVO_API_KEY  = os.environ.get("BREVO_API_KEY", "")
LIST_ID        = int(os.environ.get("BREVO_LIST_ID", "2"))
SENDER_EMAIL   = os.environ.get("BREVO_SENDER_EMAIL", "newsletter@amcupon.ro")
SENDER_NAME    = os.environ.get("BREVO_SENDER_NAME",  "AmCupon.ro")
BREVO_BASE     = "https://api.brevo.com/v3"

SCRIPT_DIR     = os.path.dirname(__file__)
OUTPUT_JSON    = os.path.join(SCRIPT_DIR, "../frontend/public/output.json")
SNAPSHOT_JSON  = os.path.join(SCRIPT_DIR, "../data/price_alert_snapshot.json")
SITE_URL       = "https://amcupon.ro"
from link_oferta import link_iesire  # noqa: E402  fara clic gratis pe canale externe
from nume_magazin import nume_afisat  # noqa: E402
from promotii import titlu_in_text  # noqa: E402


def brevo_get(endpoint: str) -> dict:
    req = urllib.request.Request(f"{BREVO_BASE}{endpoint}")
    req.add_header("api-key", BREVO_API_KEY)
    req.add_header("Accept", "application/json")
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read())


def brevo_post(endpoint: str, data: dict) -> dict:
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(
        f"{BREVO_BASE}{endpoint}",
        data=body,
        headers={
            "api-key": BREVO_API_KEY,
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read()) if resp.length else {}


def get_subscribers_with_alerts() -> dict:
    """Returneaza { magazin: [email1, email2, ...] } pe baza ALERT_STORES."""
    mapping: dict[str, list[str]] = {}
    if not BREVO_API_KEY:
        return mapping

    offset = 0
    limit = 500
    while True:
        try:
            data = brevo_get(f"/contacts?listId={LIST_ID}&limit={limit}&offset={offset}")
        except Exception as e:
            print(f"  [WARN] Nu pot lua contactii Brevo: {e}")
            break
        contacts = data.get("contacts", [])
        if not contacts:
            break
        for c in contacts:
            email = c.get("email")
            raw = (c.get("attributes", {}) or {}).get("ALERT_STORES", "") or ""
            magazine = [m.strip() for m in raw.split(",") if m.strip()]
            for m in magazine:
                mapping.setdefault(m, []).append(email)
        if len(contacts) < limit:
            break
        offset += limit

    return mapping


def oferte_active(m: dict) -> dict:
    """{cheie: promotie} pentru ofertele active ale unui magazin. Cheia = titlul fara cod, normalizat."""
    nume = nume_afisat(m.get("magazin", ""))
    out: dict = {}
    for p in m.get("promotii", []) or []:
        if (p.get("zile_ramase") or 0) < 0:
            continue
        k = re.sub(r"\W+", "", titlu_in_text(p, nume).lower())[:120]
        if k:
            out.setdefault(k, p)
    return out


def oferte_noi(curent: dict, anterior: dict) -> dict:
    """{magazin: [chei noi]} — ofertele care nu erau in snapshot-ul anterior."""
    noi = {}
    for mg, chei in curent.items():
        vechi = set(anterior.get(mg, []))
        lista = [k for k in chei if k not in vechi]
        if lista:
            noi[mg] = lista
    return noi


def make_alert_html(nume: str, titlu: str, are_cod: bool, link: str) -> str:
    cod = ('<p style="font-size:13px;color:#c4cad0;margin:0 0 14px;">Oferta are cod de reducere: '
           'îl vezi pe pagina ofertei.</p>') if are_cod else ""
    n, t = html.escape(nume), html.escape(titlu)
    return f"""<!DOCTYPE html>
<html lang="ro"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ofertă nouă {n} — AmCupon.ro</title></head>
<body style="margin:0;padding:0;background:#0c1014;font-family:Arial,'Helvetica Neue',sans-serif;">
<div style="max-width:520px;margin:24px auto;padding:0 12px;">
  <div style="background:#14181c;border-radius:16px;padding:28px 24px;text-align:center;border:1px solid #2a3036;">
    <p style="margin:0 0 14px;"><span style="background:#ddf93c;color:#0c1000;font-weight:900;padding:3px 8px;
       border-radius:6px;">Am</span><span style="color:#fff;font-weight:900;font-size:18px;">Cupon.ro</span></p>
    <h1 style="color:#fff;font-size:20px;font-weight:900;margin:0 0 10px;">Ofertă nouă la {n}</h1>
    <p style="font-size:15px;color:#e8ecef;margin:0 0 14px;">{t}</p>
    {cod}
    <a href="{html.escape(link)}" style="display:inline-block;background:#ddf93c;color:#0c1000;text-decoration:none;
       padding:12px 32px;border-radius:10px;font-size:14px;font-weight:900;">Vezi oferta →</a>
    <p style="color:#7d868e;font-size:11px;margin:22px 0 6px;">
      Primești emailul pentru că ai cerut alerte de oferte {n} pe AmCupon.ro.
      Când cumperi prin AmCupon, magazinul ne poate plăti un comision; prețul pentru tine e același.
    </p>
    <a href="{SITE_URL}/newsletter" style="color:#7d868e;font-size:11px;text-decoration:underline;">Dezabonează-te</a>
  </div>
</div>
</body></html>"""


def send_alert(to_email: str, magazin: str, nume: str, titlu: str, are_cod: bool, link: str, dry_run: bool) -> bool:
    subject = f"Ofertă nouă la {nume}: {titlu[:70]}"
    if dry_run:
        print(f"    [DRY-RUN] -> {to_email}: {subject}")
        return True
    try:
        brevo_post("/smtp/email", {
            "sender": {"name": SENDER_NAME, "email": SENDER_EMAIL},
            "to": [{"email": to_email}],
            "subject": subject,
            "htmlContent": make_alert_html(nume, titlu, are_cod, link),
            "tags": ["price_alert", magazin],
        })
        return True
    except urllib.error.HTTPError as e:
        print(f"    [FAIL] {to_email}: HTTP {e.code} {e.read().decode()[:200]}")
        return False


def scrie_snapshot(stare: dict) -> None:
    with open(SNAPSHOT_JSON, "w", encoding="utf-8") as f:
        json.dump({"versiune": 2, "magazine": stare}, f, ensure_ascii=False, indent=1)


def main():
    parser = argparse.ArgumentParser(description="Trimite alerte cand apare o oferta noua la un magazin urmarit")
    parser.add_argument("--dry-run", action="store_true", help="Nu trimite emailuri, doar afiseaza")
    parser.add_argument("--test", action="store_true", help="verificari pe date construite")
    args = parser.parse_args()
    if args.test:
        sys.exit(test())

    if not os.path.exists(OUTPUT_JSON):
        print(f"[EROARE] Fisier lipsa: {OUTPUT_JSON}")
        sys.exit(1)

    with open(OUTPUT_JSON, encoding="utf-8") as f:
        magazine = json.load(f)
    by_magazin = {m["magazin"]: m for m in magazine}
    oferte = {m["magazin"]: oferte_active(m) for m in magazine}
    curent = {mg: sorted(o) for mg, o in oferte.items() if o}

    os.makedirs(os.path.dirname(SNAPSHOT_JSON), exist_ok=True)
    anterior = None
    if os.path.exists(SNAPSHOT_JSON):
        with open(SNAPSHOT_JSON, encoding="utf-8") as f:
            vechi = json.load(f)
        if isinstance(vechi, dict) and vechi.get("versiune") == 2:
            anterior = vechi.get("magazine", {})

    # Prima rulare SAU snapshot in formatul vechi (doar coduri): baza noua, fara trimiteri —
    # altfel fiecare oferta activa de azi ar pleca drept „noua" la toti abonatii.
    if anterior is None:
        print("[INFO] Snapshot nou (v2: oferte, nu doar coduri) — salvez baza, nu trimit alerte.")
        scrie_snapshot(curent)
        return

    schimbate = oferte_noi(curent, anterior)
    if not schimbate:
        print("[INFO] Nicio oferta noua de la ultima rulare.")
        scrie_snapshot(curent)
        return
    print(f"[INFO] {len(schimbate)} magazine cu oferte noi: {', '.join(list(schimbate)[:15])}")

    abonati = get_subscribers_with_alerts()
    if not abonati:
        print("[INFO] Niciun abonat cu ALERT_STORES setat (sau BREVO_API_KEY lipseste).")
        scrie_snapshot(curent)
        return

    sent, failed = 0, 0
    for magazin, chei in schimbate.items():
        destinatari = abonati.get(magazin, [])
        if not destinatari:
            continue
        m = by_magazin.get(magazin, {})
        nume = nume_afisat(magazin)
        promo = oferte[magazin][chei[0]]
        titlu = titlu_in_text(promo, nume)
        link = link_iesire(m, promo, SITE_URL)
        are_cod = bool((promo.get("cod_cupon") or "").strip())
        print(f"  {magazin}: {titlu[:60]} -> {len(destinatari)} abonati")
        for email in destinatari:
            if send_alert(email, magazin, nume, titlu, are_cod, link, args.dry_run):
                sent += 1
            else:
                failed += 1

    print(f"[OK] {sent} alerte trimise, {failed} esuate.")
    scrie_snapshot(curent)


def test() -> int:
    m = {"magazin": "doctorshield.ro", "promotii": [
        {"nume": "Black Friday DoctorShield: reduceri de pana la 50%", "cod_cupon": "", "zile_ramase": 9},
        {"nume": "Reducere 10% la tot cosul", "cod_cupon": "DS10", "zile_ramase": 3},
    ]}
    o = oferte_active(m)
    rau = []
    if len(o) != 2:
        rau.append(f"doua oferte active, gasit {len(o)}")
    chei = sorted(o)
    noi = oferte_noi({"doctorshield.ro": chei}, {"doctorshield.ro": chei[:1]})
    if list(noi) != ["doctorshield.ro"] or len(noi["doctorshield.ro"]) != 1:
        rau.append(f"o oferta noua (si fara cod) declanseaza alerta: {noi}")
    if oferte_noi({"x.ro": ["a"]}, {"x.ro": ["a"]}):
        rau.append("aceeasi oferta nu e noua")
    if "DS10" in make_alert_html("DoctorShield", titlu_in_text(m["promotii"][1], "DoctorShield"), True, "https://amcupon.ro/go/x"):
        rau.append("codul apare in clar in email")
    for r in rau:
        print("  PICA ", r)
    print("TOATE TREC" if not rau else f"{len(rau)} asteptari incalcate")
    return 1 if rau else 0


if __name__ == "__main__":
    main()
