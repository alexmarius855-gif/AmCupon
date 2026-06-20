"""
check_price_alerts.py — Trimite alerte targetate cand un magazin urmarit primeste cod nou.

Flux:
  1. Citeste data/price_alert_snapshot.json (coduri active vazute la rularea anterioara)
  2. Compara cu frontend/public/output.json (starea curenta)
  3. Pentru fiecare magazin cu cod nou aparut, gaseste abonatii Brevo care au
     magazinul respectiv in atributul custom ALERT_STORES (CSV, setat de
     frontend/app/api/newsletter/route.ts cand userul foloseste PriceAlert.tsx)
  4. Trimite email tranzactional Brevo catre fiecare abonat potrivit
  5. Suprascrie snapshot-ul cu starea curenta

Utilizare:
  python check_price_alerts.py             # ruleaza normal, trimite alerte reale
  python check_price_alerts.py --dry-run    # arata ce ar trimite, nu trimite nimic

Env vars necesare:
  BREVO_API_KEY      -- xkeysib-... (Contacts + Transactional API)
  BREVO_LIST_ID       -- ID lista Brevo (default: 2, acelasi cu newsletter-ul general)
  BREVO_SENDER_EMAIL  -- default: newsletter@amcupon.ro

NOTA: necesita ca expeditorul sa fie verificat in Brevo (Settings -> Senders),
altfel trimiterea esueaza cu HTTP 400 -- vezi problema activa din CLAUDE.md.

Atributul custom ALERT_STORES trebuie creat o singura data in Brevo:
  Contacts -> Settings -> Contact attributes -> Text -> ALERT_STORES
"""

import json
import os
import sys
import argparse
import urllib.request
import urllib.error

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


def codes_active(m: dict) -> set:
    """Codurile de cupon active (zile_ramase >= 0) pentru un magazin."""
    return {
        p.get("cod_cupon")
        for p in m.get("promotii", [])
        if p.get("cod_cupon") and p.get("zile_ramase", -1) >= 0
    }


def make_alert_html(magazin: str, nume: str, cod: str, titlu: str, link: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="ro"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cod nou {nume} — AmCupon.ro</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,'Helvetica Neue',sans-serif;">
<div style="max-width:520px;margin:24px auto;padding:0 12px;">
  <div style="background:linear-gradient(135deg,#4338ca,#4f46e5,#0891b2);
              border-radius:16px 16px 0 0;padding:28px;text-align:center;">
    <h1 style="color:#fff;font-size:20px;font-weight:900;margin:0 0 4px;">
      🔔 Cod nou la {nume}!
    </h1>
    <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:0;">Exact ce ai cerut sa fii anuntat</p>
  </div>
  <div style="background:#f8fafc;padding:24px 20px;">
    <div style="border:1px solid #e5e7eb;border-radius:12px;padding:20px;background:#fff;text-align:center;">
      <p style="font-size:14px;font-weight:700;color:#111827;margin:0 0 12px;">{titlu}</p>
      <div style="margin:0 auto 14px;padding:10px 20px;background:#eef2ff;border:2px dashed #6366f1;
                  border-radius:8px;display:inline-block;font-family:monospace;font-size:18px;
                  font-weight:bold;color:#4338ca;letter-spacing:2px;">{cod}</div>
      <div>
        <a href="{link}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;
           padding:12px 32px;border-radius:10px;font-size:14px;font-weight:900;">
          Foloseste codul →
        </a>
      </div>
    </div>
  </div>
  <div style="background:#1e293b;border-radius:0 0 16px 16px;padding:18px 28px;text-align:center;">
    <p style="color:#94a3b8;font-size:11px;margin:0 0 6px;">
      Primesti acest email pentru ca te-ai abonat la alerte {nume} pe AmCupon.ro
    </p>
    <a href="{SITE_URL}/newsletter" style="color:#64748b;font-size:11px;text-decoration:underline;">
      Dezaboneaza-te
    </a>
  </div>
</div>
</body></html>"""


def send_alert(to_email: str, magazin: str, nume: str, cod: str, titlu: str, link: str, dry_run: bool) -> bool:
    subject = f"🔔 Cod nou {nume}: {cod}"
    if dry_run:
        print(f"    [DRY-RUN] -> {to_email}: {subject}")
        return True
    try:
        brevo_post("/smtp/email", {
            "sender": {"name": SENDER_NAME, "email": SENDER_EMAIL},
            "to": [{"email": to_email}],
            "subject": subject,
            "htmlContent": make_alert_html(magazin, nume, cod, titlu, link),
            "tags": ["price_alert", magazin],
        })
        return True
    except urllib.error.HTTPError as e:
        print(f"    [FAIL] {to_email}: HTTP {e.code} {e.read().decode()[:200]}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Trimite alerte de pret/cod nou pe magazin")
    parser.add_argument("--dry-run", action="store_true", help="Nu trimite emailuri, doar afiseaza")
    args = parser.parse_args()

    if not os.path.exists(OUTPUT_JSON):
        print(f"[EROARE] Fisier lipsa: {OUTPUT_JSON}")
        sys.exit(1)

    with open(OUTPUT_JSON, encoding="utf-8") as f:
        magazine = json.load(f)

    current_state = {m["magazin"]: sorted(codes_active(m)) for m in magazine if codes_active(m)}

    os.makedirs(os.path.dirname(SNAPSHOT_JSON), exist_ok=True)
    first_run = not os.path.exists(SNAPSHOT_JSON)
    previous_state = {}
    if not first_run:
        with open(SNAPSHOT_JSON, encoding="utf-8") as f:
            previous_state = json.load(f)

    if first_run:
        print("[INFO] Prima rulare — salvez snapshot baseline, nu trimit alerte.")
        with open(SNAPSHOT_JSON, "w", encoding="utf-8") as f:
            json.dump(current_state, f, ensure_ascii=False, indent=2)
        return

    # Magazine cu cel putin un cod nou fata de snapshot-ul anterior
    changed = {}
    for magazin, codes in current_state.items():
        prev_codes = set(previous_state.get(magazin, []))
        new_codes = [c for c in codes if c not in prev_codes]
        if new_codes:
            changed[magazin] = new_codes

    if not changed:
        print("[INFO] Niciun cod nou de la ultima rulare.")
        with open(SNAPSHOT_JSON, "w", encoding="utf-8") as f:
            json.dump(current_state, f, ensure_ascii=False, indent=2)
        return

    print(f"[INFO] {len(changed)} magazine cu coduri noi: {', '.join(changed.keys())}")

    subscribers = get_subscribers_with_alerts()
    if not subscribers:
        print("[INFO] Niciun abonat cu ALERT_STORES setat (sau BREVO_API_KEY lipseste).")
        with open(SNAPSHOT_JSON, "w", encoding="utf-8") as f:
            json.dump(current_state, f, ensure_ascii=False, indent=2)
        return

    by_magazin = {m["magazin"]: m for m in magazine}
    sent, failed = 0, 0

    for magazin, new_codes in changed.items():
        recipients = subscribers.get(magazin, [])
        if not recipients:
            continue
        m = by_magazin.get(magazin, {})
        nume = magazin.split(".")[0].capitalize()
        promo = next(
            (p for p in m.get("promotii", []) if p.get("cod_cupon") in new_codes),
            {},
        )
        cod   = promo.get("cod_cupon", new_codes[0])
        titlu = promo.get("nume", f"Oferta noua {nume}")
        link  = promo.get("landing_page") or m.get("url_afiliat") or f"{SITE_URL}/cod-reducere/{magazin}"

        print(f"  {magazin}: cod {cod} -> {len(recipients)} abonati")
        for email in recipients:
            ok = send_alert(email, magazin, nume, cod, titlu, link, args.dry_run)
            if ok:
                sent += 1
            else:
                failed += 1

    print(f"[OK] {sent} alerte trimise, {failed} esuate.")

    with open(SNAPSHOT_JSON, "w", encoding="utf-8") as f:
        json.dump(current_state, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
