"""
send_welcome_series.py — Continua seria de bun-venit (ziua 3 si ziua 7).

Ziua 0 (imediat la abonare) e deja trimisa de sendWelcomeEmail() din
frontend/app/api/newsletter/route.ts, care seteaza atributul Brevo
WELCOME_STEP="1" DOAR pe contactele care chiar au primit acel email (nu si pe
abonarile facute exclusiv printr-o alerta de pret, care sar peste ziua 0).

Acest script continua seria pentru contactele cu WELCOME_STEP potrivit:
  - WELCOME_STEP=1 + SIGNUP_DATE >= 3 zile in urma -> trimite ziua 3, seteaza WELCOME_STEP=2
  - WELCOME_STEP=2 + SIGNUP_DATE >= 7 zile in urma -> trimite ziua 7, seteaza WELCOME_STEP=3

Idempotent: verifica WELCOME_STEP inainte de fiecare trimitere, deci poate rula
oricat de des pe cron-ul de 4h fara sa trimita acelasi email de doua ori.

Utilizare:
  python send_welcome_series.py             # trimite real
  python send_welcome_series.py --dry-run   # arata ce ar trimite, nu trimite/modifica nimic

Env vars necesare (aceleasi ca send_newsletter.py / check_price_alerts.py):
  BREVO_API_KEY       -- xkeysib-... (Contacts + Transactional API)
  BREVO_LIST_ID       -- ID lista Brevo (default: 2)
  BREVO_SENDER_EMAIL  -- default: newsletter@amcupon.ro

IMPORTANT — atribut nou de creat manual O SINGURA DATA in Brevo (acelasi gotcha
documentat pt ALERT_STORES in CLAUDE.md — Brevo ignora tacit atribute necunoscute):
  Contacts -> Settings -> Contact attributes -> Text -> WELCOME_STEP
"""

import json
import os
import sys
import argparse
import urllib.request
import urllib.error
from datetime import datetime, timezone, timedelta

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Reutilizeaza motorul real de selectie oferte (onest, fara date fabricate) —
# nu-l reimplementam, la fel cum fetch_impact_deals.py reutilizeaza fetch_impact_api.py.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from send_newsletter import pick_top_n, get_best_promo, extrage_reducere  # noqa: E402

BREVO_API_KEY  = os.environ.get("BREVO_API_KEY", "")
LIST_ID        = int(os.environ.get("BREVO_LIST_ID", "2"))
SENDER_EMAIL   = os.environ.get("BREVO_SENDER_EMAIL", "newsletter@amcupon.ro")
SENDER_NAME    = os.environ.get("BREVO_SENDER_NAME",  "AmCupon.ro")
BREVO_BASE     = "https://api.brevo.com/v3"

SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
OUTPUT_JSON  = os.path.join(SCRIPT_DIR, "..", "frontend", "public", "output.json")
SITE_URL     = "https://amcupon.ro"

ZIUA3_PRAG = 3   # zile de la SIGNUP_DATE
ZIUA7_PRAG = 7


def brevo_get(endpoint: str) -> dict:
    req = urllib.request.Request(f"{BREVO_BASE}{endpoint}")
    req.add_header("api-key", BREVO_API_KEY)
    req.add_header("Accept", "application/json")
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read())


def brevo_post(endpoint: str, data: dict) -> dict:
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(
        f"{BREVO_BASE}{endpoint}", data=body,
        headers={"api-key": BREVO_API_KEY, "Content-Type": "application/json", "Accept": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read()) if resp.length else {}


def brevo_put(endpoint: str, data: dict) -> None:
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(
        f"{BREVO_BASE}{endpoint}", data=body,
        headers={"api-key": BREVO_API_KEY, "Content-Type": "application/json"},
        method="PUT",
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        resp.read()


def esc(s: str) -> str:
    return (s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def get_eligible_contacts() -> tuple[list, list]:
    """Returneaza (pt_ziua3, pt_ziua7) — liste de (email, welcome_step)."""
    ziua3, ziua7 = [], []
    if not BREVO_API_KEY:
        return ziua3, ziua7

    azi = datetime.now(timezone.utc).date()
    offset, limit = 0, 500
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
            attrs = c.get("attributes", {}) or {}
            step = str(attrs.get("WELCOME_STEP") or "").strip()
            signup_raw = attrs.get("SIGNUP_DATE") or ""
            if not email or not signup_raw:
                continue
            try:
                signup = datetime.strptime(signup_raw, "%Y-%m-%d").date()
            except ValueError:
                continue
            zile_trecute = (azi - signup).days
            if step == "1" and zile_trecute >= ZIUA3_PRAG:
                ziua3.append(email)
            elif step == "2" and zile_trecute >= ZIUA7_PRAG:
                ziua7.append(email)
        if len(contacts) < limit:
            break
        offset += limit

    return ziua3, ziua7


def _incarca_oferte(n: int) -> list:
    with open(OUTPUT_JSON, encoding="utf-8") as f:
        magazine = json.load(f)
    top = pick_top_n(magazine, n)
    rezultat = []
    for m in top:
        promo = get_best_promo(m)
        rezultat.append({
            "nume": (m.get("magazin") or "").split(".")[0].replace("-", " ").title(),
            "slug": m.get("magazin", ""),
            "cod": promo.get("cod_cupon", ""),
            "procent": extrage_reducere(m),
        })
    return rezultat


# ── Template email — acelasi limbaj vizual (teal, card alb) ca sendWelcomeEmail()
# din route.ts, ca seria sa arate ca UN SINGUR flux, nu 3 emailuri disparate. ──

def _card_oferta(o: dict) -> str:
    tag = esc(o["procent"] or ("COD" if o["cod"] else "OFERTA"))
    detaliu = f' — cod <strong>{esc(o["cod"])}</strong>' if o["cod"] else ""
    return (
        f'<a href="{SITE_URL}/cod-reducere/{o["slug"]}" style="display:flex;align-items:center;gap:10px;'
        f'padding:12px 14px;margin-bottom:8px;background:#f0fdfa;border:1px solid #99f6e4;border-radius:10px;'
        f'text-decoration:none;color:#0f766e;font-size:13px;font-weight:600;">'
        f'<span style="background:#0d9488;color:#fff;font-weight:900;font-size:11px;padding:3px 8px;'
        f'border-radius:6px;white-space:nowrap;">{tag}</span><span>{esc(o["nume"])}{detaliu}</span></a>'
    )


def _shell(titlu: str, subtitlu: str, corp_html: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="ro">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(titlu)}</title></head>
<body style="margin:0;padding:0;background:#F7F9FC;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;margin-top:24px;margin-bottom:24px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#0d9488 0%,#14b8a6 100%);padding:32px;text-align:center;">
      <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:12px;">
        <span style="background:rgba(255,255,255,0.2);color:#fff;font-weight:900;font-size:16px;padding:4px 10px;border-radius:8px;">Am</span>
        <span style="color:#fff;font-weight:900;font-size:24px;">Cupon.ro</span>
      </div>
      <h1 style="color:#fff;font-size:24px;font-weight:900;margin:0 0 6px;">{esc(titlu)}</h1>
      <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0;">{esc(subtitlu)}</p>
    </div>
    <div style="padding:32px;">
      {corp_html}
    </div>
    <div style="background:#F7F9FC;border-top:1px solid #e5e7eb;padding:20px 32px;text-align:center;">
      <p style="color:#9ca3af;font-size:12px;margin:0 0 8px;">AmCupon.ro — Coduri de reducere verificate zilnic</p>
      <p style="color:#d1d5db;font-size:11px;margin:0;">
        Primești acest email deoarece te-ai abonat pe amcupon.ro.<br>
        Conținut afiliat — primim comision din bugetul de marketing al magazinelor.
      </p>
    </div>
  </div>
</body>
</html>"""


def html_ziua3(oferte: list) -> str:
    corp = """
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">
        Salut din nou! Ca sa profiti la maximum de AmCupon.ro, iată 3 obiceiuri rapide:
      </p>
      <div style="margin-bottom:24px;">
        <div style="display:flex;gap:12px;margin-bottom:14px;">
          <span style="font-size:20px;">🔖</span>
          <p style="margin:0;color:#374151;font-size:14px;line-height:1.5;"><strong>Salvează pagina magazinului preferat.</strong> Fiecare magazin are propria pagină cu toate codurile lui, actualizate zilnic.</p>
        </div>
        <div style="display:flex;gap:12px;margin-bottom:14px;">
          <span style="font-size:20px;">🔔</span>
          <p style="margin:0;color:#374151;font-size:14px;line-height:1.5;"><strong>Activează o alertă de preț.</strong> Pe pagina oricărui magazin poți cere să fii anunțat exact când apare un cod nou pentru el.</p>
        </div>
        <div style="display:flex;gap:12px;">
          <span style="font-size:20px;">🎯</span>
          <p style="margin:0;color:#374151;font-size:14px;line-height:1.5;"><strong>Urmărește Deal Score-ul.</strong> Scorul de pe fiecare ofertă combină reducerea, prospețimea și exclusivitatea — cu cât e mai mare, cu atât merită mai mult.</p>
        </div>
      </div>
      <p style="color:#6b7280;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Oferte active chiar acum</p>
      <div style="margin-bottom:8px;">""" + "".join(_card_oferta(o) for o in oferte) + """</div>
      <div style="text-align:center;margin:28px 0 0;">
        <a href="{site}/toate-magazinele" style="background:#0d9488;color:#fff;font-weight:900;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;display:inline-block;">
          Explorează toate magazinele →
        </a>
      </div>""".format(site=SITE_URL)
    return _shell("3 moduri să nu ratezi nicio reducere", "Ziua 3 — câteva obiceiuri utile", corp)


def html_ziua7(oferte: list) -> str:
    corp = """
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">
        O săptămână de când ești alături de noi! De acum înainte primești newsletter-ul
        nostru obișnuit — o dată pe săptămână, doar ofertele care chiar merită, fără
        aglomerare în inbox.
      </p>
      <p style="color:#6b7280;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Ce e activ chiar acum</p>
      <div style="margin-bottom:24px;">""" + "".join(_card_oferta(o) for o in oferte) + """</div>
      <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:20px;margin-bottom:8px;">
        <p style="margin:0 0 8px;color:#0c4a6e;font-weight:700;font-size:14px;">🧩 Extensia Chrome — reduceri automate</p>
        <p style="margin:0 0 12px;color:#0369a1;font-size:13px;">Instalează extensia AmCupon și primești automat cele mai bune coduri când ești pe orice site partener.</p>
        <a href="https://chromewebstore.google.com/detail/mahfankpalkgognhnllkgdkjncmmkllb" style="background:#0d9488;color:#fff;font-weight:700;font-size:13px;padding:8px 20px;border-radius:8px;text-decoration:none;display:inline-block;">Instalează gratuit</a>
      </div>"""
    return _shell("Mulțumim că ești aici de o săptămână!", "Ziua 7 — de acum, newsletter săptămânal normal", corp)


def trimite(email: str, subiect: str, html: str, tag: str, dry_run: bool) -> bool:
    if dry_run:
        print(f"  [DRY-RUN] ar trimite '{tag}' catre {email}")
        return True
    try:
        brevo_post("/smtp/email", {
            "sender": {"name": SENDER_NAME, "email": SENDER_EMAIL},
            "to": [{"email": email}],
            "subject": subiect,
            "htmlContent": html,
            "tags": [tag],
        })
        return True
    except urllib.error.HTTPError as e:
        print(f"  [EROARE] {tag} catre {email}: HTTP {e.code} {e.read().decode(errors='replace')[:200]}")
        return False
    except Exception as e:
        print(f"  [EROARE] {tag} catre {email}: {e}")
        return False


def seteaza_step(email: str, step: str, dry_run: bool) -> None:
    if dry_run:
        return
    try:
        brevo_put(f"/contacts/{email}", {"attributes": {"WELCOME_STEP": step}})
    except Exception as e:
        print(f"  [WARN] Nu am putut actualiza WELCOME_STEP pt {email}: {e}")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    if not BREVO_API_KEY:
        print("EROARE: BREVO_API_KEY nu e setat. Nimic de trimis.")
        return
    if not os.path.exists(OUTPUT_JSON):
        print(f"EROARE: {OUTPUT_JSON} nu exista.")
        return

    print("Cautare contacte eligibile pt seria de bun-venit...")
    ziua3, ziua7 = get_eligible_contacts()
    print(f"  Ziua 3: {len(ziua3)} contacte | Ziua 7: {len(ziua7)} contacte")

    if not ziua3 and not ziua7:
        print("Nimic de trimis acum.")
        return

    oferte = _incarca_oferte(6)
    if not oferte:
        print("ATENTIE: 0 oferte reale disponibile — sar peste trimitere (nu trimit email fara continut real).")
        return

    trimise3 = trimise7 = 0
    for email in ziua3:
        if trimite(email, "3 moduri să nu ratezi nicio reducere 🔔", html_ziua3(oferte), "welcome-day3", args.dry_run):
            seteaza_step(email, "2", args.dry_run)
            trimise3 += 1

    for email in ziua7:
        if trimite(email, "Mulțumim că ești aici de o săptămână! 🎉", html_ziua7(oferte), "welcome-day7", args.dry_run):
            seteaza_step(email, "3", args.dry_run)
            trimise7 += 1

    prefix = "[DRY-RUN] " if args.dry_run else ""
    print(f"\n{prefix}Gata — ziua 3: {trimise3}/{len(ziua3)}, ziua 7: {trimise7}/{len(ziua7)}.")


if __name__ == "__main__":
    main()
