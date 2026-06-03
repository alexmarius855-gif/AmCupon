"""
send_newsletter.py — Trimite newsletter saptamanal cu oferte AmCupon.ro via Brevo.

Utilizare:
  python send_newsletter.py                      # trimite la toti abonatiis din lista Brevo
  python send_newsletter.py --test me@mail.ro    # test la un singur email (SMTP)
  python send_newsletter.py --n 8                # top 8 oferte in loc de 5

Env vars necesare:
  BREVO_API_KEY     -- xkeysib-... din Brevo > Settings > API Keys (pentru campanii + abonati)
  BREVO_SMTP_USER   -- ac67f7001@smtp-brevo.com (pentru --test via SMTP)
  BREVO_SMTP_PASS   -- xsmtpsib-... (pentru --test via SMTP)
  BREVO_LIST_ID     -- ID lista contacte Brevo (default: 2)

NOTE: BREVO_API_KEY (xkeysib-...) != BREVO_SMTP_PASS (xsmtpsib-...) -- sunt chei diferite!
Obtine API key de la: https://app.brevo.com/settings/keys/api
"""

import json
import os
import sys
import smtplib
import urllib.request
import urllib.error
import argparse
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime, timezone

# Fix encoding pe Windows (terminalul poate fi cp1250)
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# ── Config ──────────────────────────────────────────────────────────────────
SMTP_USER      = os.environ.get("BREVO_SMTP_USER", "")
SMTP_PASS      = os.environ.get("BREVO_SMTP_PASS", "")
SMTP_SERVER    = "smtp-relay.brevo.com"
SMTP_PORT      = 587
SENDER_EMAIL   = os.environ.get("BREVO_SENDER_EMAIL", "newsletter@amcupon.ro")
SENDER_NAME    = os.environ.get("BREVO_SENDER_NAME",  "AmCupon.ro")

# IMPORTANT: API key (xkeysib-...) e diferit de SMTP pass (xsmtpsib-...)
BREVO_API_KEY  = os.environ.get("BREVO_API_KEY", "")
LIST_ID        = int(os.environ.get("BREVO_LIST_ID", "2"))
BREVO_BASE     = "https://api.brevo.com/v3"

OUTPUT_JSON    = os.path.join(os.path.dirname(__file__), "../frontend/public/output.json")
SITE_URL       = "https://amcupon.ro"

LUNI_RO = ["ianuarie","februarie","martie","aprilie","mai","iunie",
           "iulie","august","septembrie","octombrie","noiembrie","decembrie"]

# ── Helpers ─────────────────────────────────────────────────────────────────

def brevo_get(endpoint: str) -> dict:
    """GET request la Brevo API."""
    req = urllib.request.Request(f"{BREVO_BASE}{endpoint}")
    req.add_header("api-key", BREVO_API_KEY)
    req.add_header("Accept",  "application/json")
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read())


def brevo_post(endpoint: str, data: dict) -> dict:
    """POST request la Brevo API."""
    body = json.dumps(data).encode("utf-8")
    req  = urllib.request.Request(
        f"{BREVO_BASE}{endpoint}",
        data=body,
        headers={
            "api-key":      BREVO_API_KEY,
            "Content-Type": "application/json",
            "Accept":       "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read()) if resp.length else {}
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        print(f"  [Brevo POST {endpoint}] HTTP {e.code}: {err}")
        raise


def get_contacts() -> list:
    """Returneaza lista emailurilor din lista Brevo."""
    if not BREVO_API_KEY:
        return []
    try:
        data     = brevo_get(f"/contacts?listId={LIST_ID}&limit=500&offset=0")
        contacts = data.get("contacts", [])
        emails   = [c["email"] for c in contacts if c.get("email")]
        print(f"  {len(emails)} abonati in lista #{LIST_ID}")
        return emails
    except Exception as e:
        print(f"  Nu pot lua contactele: {e}")
        return []


def pick_top_n(magazine: list, n: int = 5) -> list:
    """
    Selecteaza top N magazine cu promotii active.
    Structura reala output.json:
      m["promotii"]       = lista de dict cu {cod_cupon: str, zile_ramase: int, ...}
      m["cod_cupon"]      = bool (are macar un cod activ)
      m["scor_final"]     = int
      m["url_afiliat"]    = str (quicklink afiliere)
    """
    def promotie_activa(m):
        return any(
            p.get("zile_ramase", -1) >= 0
            for p in m.get("promotii", [])
        )

    def cod_activ(m):
        return any(
            p.get("cod_cupon") and p.get("zile_ramase", -1) >= 0
            for p in m.get("promotii", [])
        )

    cu_cod   = [m for m in magazine if cod_activ(m)]
    fara_cod = [m for m in magazine if promotie_activa(m) and not cod_activ(m)]

    cu_cod.sort(  key=lambda x: -x.get("scor_final", 0))
    fara_cod.sort(key=lambda x: -x.get("scor_final", 0))

    combined = cu_cod[:n]
    if len(combined) < n:
        combined += fara_cod[:n - len(combined)]
    return combined[:n]


def get_best_promo(m: dict) -> dict:
    """Returneaza cea mai buna promotie activa (cu cod preferential)."""
    promotii = [p for p in m.get("promotii", []) if p.get("zile_ramase", -1) >= 0]
    if not promotii:
        return {}
    # Prefera cea cu cod cupon
    cu_cod = [p for p in promotii if p.get("cod_cupon")]
    return cu_cod[0] if cu_cod else promotii[0]


def format_comision(m: dict) -> str:
    import re
    c = m.get("comision", "")
    nums = [float(x) for x in re.findall(r"[\d.]+", c)]
    if nums:
        return f"Comision {max(nums):.0f}%"
    return "Oferta activa"


def make_html(top_n: list, data_str: str, is_test: bool = False) -> str:
    def card(m: dict) -> str:
        logo    = m.get("logo_url", "")
        name    = m["magazin"].split(".")[0].capitalize()
        url     = m.get("url_afiliat") or m.get("url", SITE_URL)
        promo   = get_best_promo(m)
        cod     = promo.get("cod_cupon", "")
        titlu   = promo.get("nume", f"Oferta {name}")
        zile    = promo.get("zile_ramase", 0)
        link    = promo.get("landing_page") or url
        disc    = format_comision(m)

        logo_html = (
            f'<img src="{logo}" alt="{name}" height="36" '
            f'style="max-height:36px;max-width:110px;object-fit:contain;margin-bottom:6px;">'
            if logo else
            f'<div style="font-weight:900;font-size:17px;color:#f97316;">{name}</div>'
        )

        cod_html = (
            f'<div style="margin:10px 0;padding:8px 16px;background:#fff7ed;'
            f'border:2px dashed #f97316;border-radius:6px;text-align:center;'
            f'font-family:monospace;font-size:16px;font-weight:bold;color:#c2410c;'
            f'letter-spacing:2px;">{cod}</div>'
            if cod else ""
        )

        zile_badge = (
            f' <span style="background:#fef2f2;color:#dc2626;font-size:10px;font-weight:700;'
            f'padding:2px 7px;border-radius:20px;">⏰ {zile}z</span>'
            if zile <= 7 else ""
        )

        titlu_scurt = titlu[:90] + "..." if len(titlu) > 90 else titlu

        return f"""
        <div style="border:1px solid #e5e7eb;border-radius:12px;padding:18px 20px;
                    margin-bottom:14px;background:#ffffff;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="110" style="vertical-align:top;padding-right:14px;text-align:center;">
                {logo_html}
                <div style="font-size:10px;color:#9ca3af;margin-top:3px;">{disc}</div>
              </td>
              <td style="vertical-align:top;">
                <div style="font-size:14px;font-weight:700;color:#111827;line-height:1.4;">
                  {titlu_scurt}{zile_badge}
                </div>
                {cod_html}
                <a href="{link}" style="display:inline-block;margin-top:10px;background:#f97316;
                   color:#fff;text-decoration:none;padding:8px 18px;border-radius:7px;
                   font-size:13px;font-weight:700;">Cumpara acum &rarr;</a>
              </td>
            </tr>
          </table>
        </div>"""

    cards_html = "\n".join(card(m) for m in top_n)
    year = datetime.now().year

    test_banner = ""
    if is_test:
        test_banner = """
    <div style="background:#fef3c7;border:2px solid #f59e0b;border-radius:10px;padding:12px 20px;
      margin-bottom:20px;text-align:center;font-size:13px;font-weight:700;color:#92400e;">
      EMAIL DE TEST — Nu a fost trimis abonatilor reali
    </div>"""

    return f"""<!DOCTYPE html>
<html lang="ro"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Top oferte &mdash; AmCupon.ro</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,'Helvetica Neue',sans-serif;">
<div style="max-width:620px;margin:24px auto;padding:0 12px;">
  <div style="background:linear-gradient(135deg,#ea580c,#f97316,#dc2626);
              border-radius:16px 16px 0 0;padding:32px;text-align:center;">
    <a href="{SITE_URL}" style="text-decoration:none;display:inline-block;margin-bottom:14px;">
      <span style="background:rgba(255,255,255,0.2);color:#fff;font-weight:900;font-size:14px;
        padding:3px 9px;border-radius:6px;margin-right:3px;">Am</span>
      <span style="color:#fff;font-weight:900;font-size:20px;vertical-align:middle;">Cupon.ro</span>
    </a>
    <h1 style="color:#fff;font-size:22px;font-weight:900;margin:0 0 6px;">
      Top oferte ale saptamanii
    </h1>
    <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:0;">{data_str} &bull; Selectate automat</p>
  </div>

  <div style="background:#f8fafc;padding:24px 20px;">
    {test_banner}
    <p style="margin:0 0 20px;color:#374151;font-size:14px;line-height:1.6;">
      Salut! Am selectat <strong>cele mai bune {len(top_n)} oferte</strong> active acum,
      cu coduri de reducere verificate si valabile inca cateva zile.
    </p>
    {cards_html}
    <div style="text-align:center;margin-top:20px;padding-top:16px;border-top:1px solid #e5e7eb;">
      <a href="{SITE_URL}" style="display:inline-block;background:#f97316;color:#fff;
         text-decoration:none;padding:14px 36px;border-radius:12px;font-size:15px;font-weight:900;
         box-shadow:0 4px 16px rgba(249,115,22,0.25);">
        Vezi toate ofertele &rarr;
      </a>
      <p style="color:#9ca3af;font-size:12px;margin-top:10px;">
        288 magazine &bull; Actualizat zilnic &bull; 100% gratuit
      </p>
    </div>
  </div>

  <div style="background:#1e293b;border-radius:0 0 16px 16px;padding:20px 28px;text-align:center;">
    <p style="color:#94a3b8;font-size:12px;margin:0 0 6px;">
      <a href="{SITE_URL}" style="color:#f97316;text-decoration:none;font-weight:700;">AmCupon.ro</a>
      &bull; Coduri reducere verificate zilnic din Romania
    </p>
    <p style="color:#475569;font-size:11px;margin:0 0 10px;line-height:1.5;">
      Primesti acest email deoarece te-ai abonat pe AmCupon.ro.<br>
      Continut afiliat &mdash; primim comision din bugetul de marketing al magazinelor.
    </p>
    <a href="{SITE_URL}/newsletter" style="color:#64748b;font-size:11px;text-decoration:underline;">
      Dezaboneaza-te
    </a>
    &nbsp;&bull;&nbsp;
    <a href="{SITE_URL}/confidentialitate" style="color:#64748b;font-size:11px;text-decoration:underline;">
      GDPR
    </a>
  </div>
  <p style="color:#cbd5e1;font-size:10px;text-align:center;margin-top:10px;">
    &copy; {year} AmCupon.ro
  </p>
</div>
</body></html>"""


def make_text(top_n: list, data_str: str) -> str:
    lines = [f"AmCupon.ro -- Top oferte {data_str}", "=" * 40, ""]
    for i, m in enumerate(top_n, 1):
        name  = m["magazin"].split(".")[0].capitalize()
        promo = get_best_promo(m)
        cod   = promo.get("cod_cupon", "")
        titlu = promo.get("nume", "Oferta activa")
        link  = promo.get("landing_page") or m.get("url_afiliat") or SITE_URL
        lines.append(f"{i}. {name}")
        lines.append(f"   {titlu[:80]}")
        if cod:
            lines.append(f"   Cod: {cod}")
        lines.append(f"   Link: {link}")
        lines.append("")
    lines.append(f"Toate ofertele: {SITE_URL}")
    lines.append(f"\nDezabonare: {SITE_URL}/newsletter")
    return "\n".join(lines)


def send_via_smtp(to_email: str, subject: str, html: str, text: str):
    """Trimite un email de test via Brevo SMTP."""
    if not SMTP_USER or not SMTP_PASS:
        print("  BREVO_SMTP_USER / BREVO_SMTP_PASS nu sunt setate in env vars")
        print("  Seteaza: set BREVO_SMTP_USER=ac67f7001@smtp-brevo.com")
        print("           set BREVO_SMTP_PASS=xsmtpsib-...")
        return False

    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=30) as server:
        server.ehlo()
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        print(f"  Conectat la {SMTP_SERVER}:{SMTP_PORT} OK")

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"]    = f"{SENDER_NAME} <{SENDER_EMAIL}>"
        msg["To"]      = to_email
        msg.attach(MIMEText(text, "plain", "utf-8"))
        msg.attach(MIMEText(html, "html",  "utf-8"))
        server.sendmail(SENDER_EMAIL, to_email, msg.as_string())
    return True


def send_campaign_brevo(html: str, subject: str):
    """Creeaza si trimite o campanie Brevo la lista de abonati (necesita BREVO_API_KEY)."""
    if not BREVO_API_KEY:
        print("  BREVO_API_KEY nu este setat — nu pot trimite campanie")
        print("  Obtine cheia de la: https://app.brevo.com/settings/keys/api")
        return False

    try:
        print(f"  Creez campanie Brevo: {subject}")
        campaign = brevo_post("/emailCampaigns", {
            "name":        f"Newsletter {datetime.now().strftime('%d.%m.%Y')}",
            "subject":     subject,
            "sender":      {"name": SENDER_NAME, "email": SENDER_EMAIL},
            "type":        "classic",
            "htmlContent": html,
            "recipients":  {"listIds": [LIST_ID]},
        })
        cid = campaign.get("id")
        print(f"  Campanie creata (ID: {cid}). Trimit acum...")
        brevo_post(f"/emailCampaigns/{cid}/sendNow", {})
        print(f"  OK! Verifica: https://app.brevo.com/email-campaigns")
        return True
    except urllib.error.HTTPError as e:
        # Cauza frecventa: expeditorul nu e verificat in Brevo (Settings -> Senders),
        # sau lista nu are destinatari validi. NU oprim pipeline-ul pentru asta.
        print(f"  [WARN] Brevo a respins campania (HTTP {e.code}).")
        print(f"  Verifica ca expeditorul '{SENDER_EMAIL}' e verificat in Brevo → Settings → Senders.")
        print(f"  Newsletter-ul NU a fost trimis, dar restul pipeline-ului continua normal.")
        return False


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Trimite newsletter AmCupon.ro")
    parser.add_argument("--test", metavar="EMAIL",
                        help="Trimite email de test la adresa specificata (nu la abonati)")
    parser.add_argument("--n", type=int, default=5,
                        help="Numarul de oferte in newsletter (default: 5)")
    args = parser.parse_args()

    # 1. Incarca date
    if not os.path.exists(OUTPUT_JSON):
        print(f"[EROARE] Fisier lipsa: {OUTPUT_JSON}")
        sys.exit(1)

    with open(OUTPUT_JSON, encoding="utf-8") as f:
        magazine = json.load(f)

    top_n = pick_top_n(magazine, args.n)
    if not top_n:
        print("[WARN] Nicio promotie activa in output.json")
        sys.exit(0)

    now      = datetime.now(timezone.utc)
    data_str = f"{now.day} {LUNI_RO[now.month - 1]} {now.year}"
    subject  = f"Top {len(top_n)} oferte ale saptamanii ({data_str}) — AmCupon.ro"

    print(f"[INFO] Top {len(top_n)} magazine selectate:")
    for m in top_n:
        promo = get_best_promo(m)
        print(f"  {m['magazin']:<28} cod={promo.get('cod_cupon','-'):<20} scor={m.get('scor_final',0)}")

    html_content = make_html(top_n, data_str, is_test=bool(args.test))
    text_content = make_text(top_n, data_str)

    if args.test:
        # Mod test: trimite la o singura adresa via SMTP
        print(f"\n[TEST] Trimit la {args.test} via SMTP...")
        ok = send_via_smtp(args.test, f"[TEST] {subject}", html_content, text_content)
        if ok:
            print(f"[OK] Email de test trimis la {args.test}!")
        else:
            print("[FAIL] Trimiterea a esuat.")
            sys.exit(1)
    else:
        # Mod productie: campanie Brevo la toti abonatiis
        contacts = get_contacts()
        if not contacts:
            print("\n[WARN] Niciun abonat in lista Brevo.")
            print("  Soluție: aboneaza-te pe https://amcupon.ro/newsletter")
            print("  Test rapid: python send_newsletter.py --test alexmarius855@gmail.com")
            sys.exit(0)

        print(f"\n[INFO] Trimit campanie la {len(contacts)} abonati...")
        ok = send_campaign_brevo(html_content, subject)
        if ok:
            print(f"[OK] Newsletter trimis la {len(contacts)} abonati!")
        else:
            # Newsletter e non-critic — nu oprim pipeline-ul de date (exit 0)
            print("[SKIP] Newsletter neexpediat (vezi WARN de mai sus). Continui fara eroare.")
            sys.exit(0)


if __name__ == "__main__":
    main()
