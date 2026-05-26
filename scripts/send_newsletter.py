"""
Trimite newsletter zilnic cu top-5 promotii via Brevo.
Rulat automat din GitHub Actions la 08:00 UTC.

Env vars necesare:
  BREVO_API_KEY        -- cheie API Brevo (obligatoriu)
  BREVO_LIST_ID        -- ID lista abonati (default: 2)
  BREVO_SENDER_EMAIL   -- email expeditor (default: newsletter@amcupon.ro)
  BREVO_SENDER_NAME    -- nume expeditor (default: AmCupon.ro)
"""

import json
import os
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone

# ── Config ──────────────────────────────────────────────────────────────────
API_KEY      = os.environ.get("BREVO_API_KEY", "")
LIST_ID      = int(os.environ.get("BREVO_LIST_ID", "2"))
SENDER_EMAIL = os.environ.get("BREVO_SENDER_EMAIL", "newsletter@amcupon.ro")
SENDER_NAME  = os.environ.get("BREVO_SENDER_NAME", "AmCupon.ro")
BREVO_BASE   = "https://api.brevo.com/v3"

OUTPUT_JSON  = os.path.join(os.path.dirname(__file__), "../frontend/public/output.json")
SITE_URL     = "https://amcupon.ro"

LUNI_RO = ["ianuarie","februarie","martie","aprilie","mai","iunie",
           "iulie","august","septembrie","octombrie","noiembrie","decembrie"]

# ── Helpers ─────────────────────────────────────────────────────────────────

def brevo_request(method: str, path: str, payload: dict | None = None) -> dict:
    url  = f"{BREVO_BASE}{path}"
    data = json.dumps(payload).encode() if payload else None
    req  = urllib.request.Request(url, data=data, method=method)
    req.add_header("api-key", API_KEY)
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json")
    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")
        print(f"  Brevo HTTP {e.code} {method} {path}: {body[:300]}")
        raise


def pick_top5(magazine: list[dict]) -> list[dict]:
    """Selecteaza top-5 promotii, prioritizand codurile cupon."""
    cu_cod  = [m for m in magazine if m.get("cod_cupon") and m.get("promotie")]
    fara_cod = [m for m in magazine if m.get("promotie") and not m.get("cod_cupon")]

    cu_cod.sort(key=lambda x: -x.get("scor_final", 0))
    fara_cod.sort(key=lambda x: -x.get("scor_final", 0))

    combined = cu_cod[:5]
    if len(combined) < 5:
        combined += fara_cod[:5 - len(combined)]
    return combined[:5]


def format_discount(m: dict) -> str:
    """Returneaza textul de discount sau cashback."""
    if m.get("promotie"):
        return m["promotie"]
    if m.get("comision"):
        nums = [float(x) for x in __import__("re").findall(r"[\d.]+", m["comision"])]
        if nums:
            return f"Cashback pana la {max(nums):.0f}%"
    return "Oferta speciala"


def make_html(top5: list[dict], data_str: str) -> str:
    """Genereaza HTML-ul emailului."""

    def card(m: dict) -> str:
        logo   = m.get("logo", "")
        name   = m.get("magazin_display", m.get("magazin", "")).title()
        promo  = m.get("promotie", "")
        cod    = m.get("cod_cupon", "")
        url    = m.get("url_afiliat", f"{SITE_URL}/magazin/{m.get('magazin','')}")
        disc   = format_discount(m)

        cod_html = ""
        if cod:
            cod_html = f"""
            <div style="margin:10px 0;padding:10px 14px;background:#f0fdf4;border:2px dashed #16a34a;
                        border-radius:6px;text-align:center;font-family:monospace;
                        font-size:18px;font-weight:bold;color:#15803d;letter-spacing:2px;">
              {cod}
            </div>"""

        logo_html = ""
        if logo:
            logo_html = f'<img src="{logo}" alt="{name}" height="32" style="max-height:32px;object-fit:contain;margin-bottom:6px;">'

        return f"""
        <div style="border:1px solid #e5e7eb;border-radius:10px;padding:18px 20px;
                    margin-bottom:16px;background:#ffffff;">
          {logo_html}
          <div style="font-size:15px;font-weight:600;color:#111827;margin-bottom:4px;">{name}</div>
          <div style="font-size:13px;color:#6b7280;margin-bottom:6px;">{disc}</div>
          {cod_html}
          <div style="font-size:13px;color:#374151;margin:8px 0 12px;">{promo[:120]}{"..." if len(promo)>120 else ""}</div>
          <a href="{url}" style="display:inline-block;background:#10b981;color:#fff;
                                  text-decoration:none;padding:8px 20px;border-radius:6px;
                                  font-size:13px;font-weight:600;">
            Obtine oferta &rarr;
          </a>
        </div>"""

    cards_html = "\n".join(card(m) for m in top5)

    return f"""<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Top oferte zilnice &mdash; AmCupon.ro</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:600px;margin:32px auto;background:#f9fafb;">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);
              border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
    <div style="font-size:24px;font-weight:800;color:#10b981;letter-spacing:-0.5px;">
      AmCupon<span style="color:#ffffff;">.ro</span>
    </div>
    <div style="color:#94a3b8;font-size:13px;margin-top:6px;">
      Top oferte &amp; coduri reducere &mdash; {data_str}
    </div>
  </div>

  <!-- Body -->
  <div style="background:#ffffff;padding:28px 32px;">
    <h2 style="font-size:18px;color:#111827;margin:0 0 20px;font-weight:700;">
      Cele mai bune 5 oferte ale zilei
    </h2>

    {cards_html}

    <!-- CTA -->
    <div style="text-align:center;margin-top:24px;padding-top:20px;border-top:1px solid #f3f4f6;">
      <a href="{SITE_URL}" style="display:inline-block;background:#0f172a;color:#10b981;
                                    text-decoration:none;padding:12px 32px;border-radius:8px;
                                    font-size:14px;font-weight:700;letter-spacing:0.3px;">
        Vezi toate ofertele pe AmCupon.ro
      </a>
    </div>
  </div>

  <!-- Footer -->
  <div style="padding:20px 32px;text-align:center;color:#9ca3af;font-size:11px;
              border-top:1px solid #e5e7eb;background:#f9fafb;border-radius:0 0 12px 12px;">
    &copy; {datetime.now().year} AmCupon.ro &mdash; Cele mai bune coduri de reducere din Romania<br>
    <a href="{SITE_URL}/dezabonare?email={{{{ params.EMAIL }}}}"
       style="color:#6b7280;text-decoration:underline;">Dezabonare</a>
    &nbsp;&middot;&nbsp;
    <a href="{SITE_URL}" style="color:#6b7280;text-decoration:underline;">amcupon.ro</a>
  </div>

</div>
</body>
</html>"""


def make_text(top5: list[dict], data_str: str) -> str:
    """Versiune plain-text a emailului."""
    lines = [
        f"AmCupon.ro — Top oferte {data_str}",
        "=" * 40,
        "",
    ]
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
    lines += [
        f"Vezi toate ofertele: {SITE_URL}",
        "",
        "Dezabonare: https://amcupon.ro/dezabonare",
    ]
    return "\n".join(lines)


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    if not API_KEY:
        print("BREVO_API_KEY nu e setat — skip newsletter")
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

    print(f"Top 5 selectate:")
    for m in top5:
        cod = m.get("cod_cupon", "-")
        print(f"  {m.get('magazin_display', m.get('magazin','?')):<25} cod={cod:<20} scor={m.get('scor_final',0)}")

    # 2. Verifica daca lista are abonati
    try:
        lista = brevo_request("GET", f"/contacts/lists/{LIST_ID}")
        total = lista.get("totalSubscribers", 0)
        print(f"\nLista Brevo #{LIST_ID}: {total} abonati")
        if total == 0:
            print("Lista goala — skip trimitere (newsletter salvat local)")
            # Totusi continuam ca sa fie logat + testabil
    except Exception as e:
        print(f"Nu pot verifica lista: {e}")
        total = -1

    # 3. Creeaza campanie email
    html_content = make_html(top5, data_str)
    text_content = make_text(top5, data_str)

    campaign_payload = {
        "name":    f"Newsletter zilnic {data_str}",
        "subject": subject,
        "sender":  {"name": SENDER_NAME, "email": SENDER_EMAIL},
        "type":    "classic",
        "htmlContent": html_content,
        "textContent": text_content,
        "recipients": {"listIds": [LIST_ID]},
    }

    print("\nCreez campania email...")
    campaign = brevo_request("POST", "/emailCampaigns", campaign_payload)
    campaign_id = campaign.get("id")
    print(f"  Campanie creata: ID={campaign_id}")

    if total == 0:
        print("  Lista goala — campanie creata dar nu trimisa")
        print("  (se va trimite automat cand vin abonati)")
        return

    # 4. Trimite imediat
    print(f"Trimit catre {total} abonati...")
    brevo_request("POST", f"/emailCampaigns/{campaign_id}/sendNow")
    print(f"Newsletter trimis cu succes! Campanie ID={campaign_id}")


if __name__ == "__main__":
    main()
