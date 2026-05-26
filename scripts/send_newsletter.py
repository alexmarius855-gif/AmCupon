"""
Trimite newsletter zilnic cu top-5 promotii via Brevo SMTP.
Rulat automat din GitHub Actions la 08:00 UTC.

Env vars necesare:
  BREVO_SMTP_USER   -- login SMTP Brevo (ex: ac67f7001@smtp-brevo.com)
  BREVO_SMTP_PASS   -- parola SMTP Brevo (xsmtpsib-...)
  BREVO_SENDER_EMAIL -- email expeditor (default: newsletter@amcupon.ro)
  BREVO_SENDER_NAME  -- nume expeditor (default: AmCupon.ro)
"""

import json
import os
import sys
import smtplib
import urllib.request
import urllib.error
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime, timezone

# ── Config ──────────────────────────────────────────────────────────────────
SMTP_USER      = os.environ.get("BREVO_SMTP_USER", "")
SMTP_PASS      = os.environ.get("BREVO_SMTP_PASS", "")
SMTP_SERVER    = "smtp-relay.brevo.com"
SMTP_PORT      = 587
SENDER_EMAIL   = os.environ.get("BREVO_SENDER_EMAIL", "newsletter@amcupon.ro")
SENDER_NAME    = os.environ.get("BREVO_SENDER_NAME",  "AmCupon.ro")

# Brevo REST API — pentru a obtine lista de abonati
BREVO_API_KEY  = os.environ.get("BREVO_API_KEY", SMTP_PASS)  # xsmtpsib- merge si ca API key
LIST_ID        = int(os.environ.get("BREVO_LIST_ID", "2"))
BREVO_BASE     = "https://api.brevo.com/v3"

OUTPUT_JSON    = os.path.join(os.path.dirname(__file__), "../frontend/public/output.json")
SITE_URL       = "https://amcupon.ro"

LUNI_RO = ["ianuarie","februarie","martie","aprilie","mai","iunie",
           "iulie","august","septembrie","octombrie","noiembrie","decembrie"]

# ── Helpers ─────────────────────────────────────────────────────────────────

def get_contacts() -> list[str]:
    """Returneaza lista emailurilor din lista Brevo."""
    if not BREVO_API_KEY:
        return []
    try:
        url = f"{BREVO_BASE}/contacts?listId={LIST_ID}&limit=500&offset=0"
        req = urllib.request.Request(url)
        req.add_header("api-key", BREVO_API_KEY)
        req.add_header("Accept",  "application/json")
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())
        contacts = data.get("contacts", [])
        emails   = [c["email"] for c in contacts if c.get("email")]
        print(f"  {len(emails)} abonati in lista #{LIST_ID}")
        return emails
    except Exception as e:
        print(f"  Nu pot lua contactele: {e}")
        return []


def pick_top5(magazine: list[dict]) -> list[dict]:
    cu_cod   = [m for m in magazine if m.get("cod_cupon") and m.get("promotie")]
    fara_cod = [m for m in magazine if m.get("promotie") and not m.get("cod_cupon")]
    cu_cod.sort(key=lambda x:   -x.get("scor_final", 0))
    fara_cod.sort(key=lambda x: -x.get("scor_final", 0))
    combined = cu_cod[:5]
    if len(combined) < 5:
        combined += fara_cod[:5 - len(combined)]
    return combined[:5]


def format_discount(m: dict) -> str:
    if m.get("promotie"):
        return m["promotie"]
    if m.get("comision"):
        import re
        nums = [float(x) for x in re.findall(r"[\d.]+", m["comision"])]
        if nums:
            return f"Cashback pana la {max(nums):.0f}%"
    return "Oferta speciala"


def make_html(top5: list[dict], data_str: str) -> str:
    def card(m: dict) -> str:
        logo  = m.get("logo", "")
        name  = m.get("magazin_display", m.get("magazin", "")).title()
        promo = m.get("promotie", "")
        cod   = m.get("cod_cupon", "")
        url   = m.get("url_afiliat", f"{SITE_URL}/magazin/{m.get('magazin','')}")
        disc  = format_discount(m)

        logo_html = (f'<img src="{logo}" alt="{name}" height="32" '
                     f'style="max-height:32px;object-fit:contain;margin-bottom:6px;">'
                     if logo else "")
        cod_html  = (f'<div style="margin:10px 0;padding:10px 14px;background:#f0fdf4;'
                     f'border:2px dashed #16a34a;border-radius:6px;text-align:center;'
                     f'font-family:monospace;font-size:18px;font-weight:bold;color:#15803d;'
                     f'letter-spacing:2px;">{cod}</div>'
                     if cod else "")

        return f"""
        <div style="border:1px solid #e5e7eb;border-radius:10px;padding:18px 20px;
                    margin-bottom:16px;background:#ffffff;">
          {logo_html}
          <div style="font-size:15px;font-weight:600;color:#111827;margin-bottom:4px;">{name}</div>
          <div style="font-size:13px;color:#6b7280;margin-bottom:6px;">{disc}</div>
          {cod_html}
          <div style="font-size:13px;color:#374151;margin:8px 0 12px;">
            {promo[:120]}{"..." if len(promo) > 120 else ""}
          </div>
          <a href="{url}" style="display:inline-block;background:#10b981;color:#fff;
             text-decoration:none;padding:8px 20px;border-radius:6px;
             font-size:13px;font-weight:600;">Obtine oferta &rarr;</a>
        </div>"""

    cards_html = "\n".join(card(m) for m in top5)
    year = datetime.now().year

    return f"""<!DOCTYPE html>
<html lang="ro"><head><meta charset="UTF-8">
<title>Top oferte &mdash; AmCupon.ro</title></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:600px;margin:32px auto;">
  <div style="background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:12px 12px 0 0;
              padding:28px 32px;text-align:center;">
    <div style="font-size:24px;font-weight:800;color:#10b981;">AmCupon<span style="color:#fff;">.ro</span></div>
    <div style="color:#94a3b8;font-size:13px;margin-top:6px;">Top oferte &mdash; {data_str}</div>
  </div>
  <div style="background:#fff;padding:28px 32px;">
    <h2 style="font-size:18px;color:#111827;margin:0 0 20px;font-weight:700;">Cele mai bune 5 oferte ale zilei</h2>
    {cards_html}
    <div style="text-align:center;margin-top:24px;padding-top:20px;border-top:1px solid #f3f4f6;">
      <a href="{SITE_URL}" style="display:inline-block;background:#0f172a;color:#10b981;
         text-decoration:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:700;">
        Vezi toate ofertele pe AmCupon.ro
      </a>
    </div>
  </div>
  <div style="padding:16px 32px;text-align:center;color:#9ca3af;font-size:11px;">
    &copy; {year} AmCupon.ro &nbsp;&middot;&nbsp;
    <a href="{SITE_URL}" style="color:#6b7280;">amcupon.ro</a>
  </div>
</div></body></html>"""


def make_text(top5: list[dict], data_str: str) -> str:
    lines = [f"AmCupon.ro — Top oferte {data_str}", "=" * 40, ""]
    for i, m in enumerate(top5, 1):
        name = m.get("magazin_display", m.get("magazin", "")).title()
        disc = format_discount(m)
        cod  = m.get("cod_cupon", "")
        url  = m.get("url_afiliat", f"{SITE_URL}/magazin/{m.get('magazin','')}")
        lines.append(f"{i}. {name} — {disc}")
        if cod:
            lines.append(f"   Cod: {cod}")
        lines.append(f"   Link: {url}")
        lines.append("")
    lines.append(f"Toate ofertele: {SITE_URL}")
    return "\n".join(lines)


def send_via_smtp(to_emails: list[str], subject: str, html: str, text: str):
    """Trimite emailul via Brevo SMTP catre lista de destinatari."""
    if not SMTP_USER or not SMTP_PASS:
        print("  BREVO_SMTP_USER / BREVO_SMTP_PASS nu sunt setate — skip")
        return 0

    sent = 0
    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=30) as server:
        server.ehlo()
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        print(f"  Conectat la {SMTP_SERVER}:{SMTP_PORT} ✓")

        for email in to_emails:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"]    = f"{SENDER_NAME} <{SENDER_EMAIL}>"
            msg["To"]      = email
            msg.attach(MIMEText(text, "plain", "utf-8"))
            msg.attach(MIMEText(html, "html",  "utf-8"))
            try:
                server.sendmail(SENDER_EMAIL, email, msg.as_string())
                sent += 1
            except Exception as e:
                print(f"  Eroare la {email}: {e}")

    return sent


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    if not SMTP_USER or not SMTP_PASS:
        print("BREVO_SMTP_USER sau BREVO_SMTP_PASS nu sunt setate — skip newsletter")
        sys.exit(0)

    # 1. Incarca date
    if not os.path.exists(OUTPUT_JSON):
        print(f"Fisier lipsa: {OUTPUT_JSON}")
        sys.exit(1)

    with open(OUTPUT_JSON, encoding="utf-8") as f:
        magazine = json.load(f)

    top5 = pick_top5(magazine)
    if not top5:
        print("Nicio promotie activa — skip newsletter")
        sys.exit(0)

    now      = datetime.now(timezone.utc)
    data_str = f"{now.day} {LUNI_RO[now.month - 1]} {now.year}"
    subject  = f"Top 5 oferte azi ({data_str}) — AmCupon.ro"

    print("Top 5 selectate:")
    for m in top5:
        print(f"  {m.get('magazin_display', m.get('magazin','?')):<25} cod={m.get('cod_cupon','-'):<20}")

    # 2. Ia abonati
    contacts = get_contacts()
    if not contacts:
        print("Lista goala sau nu pot accesa Brevo API — skip trimitere")
        print("(Credentialele SMTP sunt OK; newsletterul va fi trimis cand vin abonati)")
        sys.exit(0)

    # 3. Genereaza continut
    html_content = make_html(top5, data_str)
    text_content = make_text(top5, data_str)

    # 4. Trimite
    print(f"\nTrimet catre {len(contacts)} abonati...")
    sent = send_via_smtp(contacts, subject, html_content, text_content)
    print(f"Newsletter trimis: {sent}/{len(contacts)} emailuri livrate ✓")


if __name__ == "__main__":
    main()
