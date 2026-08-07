"""
send_newsletter.py — Trimite newsletter saptamanal cu oferte AmCupon.ro via Brevo.

Utilizare:
  python send_newsletter.py                      # trimite la toti abonatiis din lista Brevo
  python send_newsletter.py --test me@mail.ro    # test la un singur email (SMTP)
  python send_newsletter.py --n 8                # top 8 oferte in loc de 20 (default)

Env vars necesare:
  BREVO_API_KEY     -- xkeysib-... din Brevo > Settings > API Keys (pentru campanii + abonati)
  BREVO_SMTP_USER   -- SMTP login Brevo (pentru --test via SMTP)
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


def pick_top_n(magazine: list, n: int = 20) -> list:
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


def _azi() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def extrage_reducere(m: dict) -> str:
    """Procentul de reducere REAL, parsat din textul promotiei. '' daca nu exista.

    NU inventam si NU rotunjim optimist — daca magazinul nu declara un procent in
    titlul/descrierea promotiei, nu afisam niciun procent.
    """
    import re
    promo = get_best_promo(m)
    for txt in (promo.get("nume", ""), promo.get("descriere", "")):
        if not isinstance(txt, str):
            continue
        found = [int(x) for x in re.findall(r"(\d{1,2})\s*%", txt)]
        found = [x for x in found if 0 < x <= 99]
        if found:
            return f"-{max(found)}%"
    return ""


def badge_onest(m: dict) -> tuple:
    """(text, culoare_fundal, culoare_text) — un singur badge, DOAR din date reale.

    Inlocuieste vechiul `format_comision()`, care afisa "Comision X%" sub logo:
    comisionul e ce castigam NOI, nu un beneficiu pentru cititor, si era pus exact
    in locul unde omul se astepta sa vada reducerea. Aceeasi greseala ("cashback
    fals") a fost eliminata din site pe 03.07.2026, dar supravietuise in newsletter.

    Ordinea: reducere reala > cod real > verificat chiar azi > neutru.
    """
    disc = extrage_reducere(m)
    if disc:
        return (disc, "#0d9488", "#ffffff")

    promo = get_best_promo(m)
    if promo.get("cod_cupon"):
        return ("COD", "#0f766e", "#ffffff")

    # "Verificat azi" doar daca data chiar e de azi — altfel e un semnal fals
    if m.get("ultima_verificare") == _azi():
        return ("Verificat azi", "#ecfdf5", "#047857")

    return ("Oferta activa", "#f1f5f9", "#475569")


# Gruparea pe sectiuni tematice. Fiecare slug real din output.json intra intr-o
# singura sectiune; ce nu se potriveste nicaieri cade in ultima ("Super-oferte"),
# deci nu se pierde nicio oferta.
SECTIUNI = [
    ("&#128241; IT &amp; Electronice", {"electronice", "telecom", "software"}),
    ("&#128087; Fashion &amp; Beauty", {"fashion", "beauty", "bijuterii", "sanatate"}),
    ("&#127968; Cas&#259; &amp; Gr&#259;din&#259;", {"casa-gradina", "animale"}),
    ("&#128722; Super-oferte", set()),  # restul (set gol = captureaza tot ce ramane)
]


def grupeaza_pe_sectiuni(magazine: list, per_sectiune: int = 3) -> list:
    """[(titlu_sectiune, [magazine]), ...] — max `per_sectiune` oferte per sectiune.

    Sectiunile goale sunt omise, ca sa nu trimitem un header fara continut sub el.
    """
    ramase = list(magazine)
    rezultat = []
    for titlu, sluguri in SECTIUNI:
        if sluguri:
            alese = [m for m in ramase if (m.get("categorie_slug") or "") in sluguri]
        else:
            alese = list(ramase)  # ultima sectiune ia tot ce a ramas
        alese.sort(key=lambda x: -x.get("scor_final", 0))
        alese = alese[:per_sectiune]
        if alese:
            rezultat.append((titlu, alese))
            luate = {id(x) for x in alese}
            ramase = [m for m in ramase if id(m) not in luate]
    return rezultat


def make_html(top_n: list, data_str: str, is_test: bool = False, total_magazine: int = 0) -> str:
    """Newsletter HTML, structurat pe sectiuni tematice.

    Compatibilitate email (rescris 07.08.2026): TOT layout-ul e pe <table>, cu CSS
    inline. Versiunea veche folosea `display:flex` si `display:grid` — niciunul nu e
    suportat de Outlook (motor Word), unde cardurile se prabuseau intr-o coloana
    ilizibila. Nu exista <style> in <head>: Gmail il ignora pe cel din emailurile
    forwardate, deci orice regula scrisa acolo devine impredictibila.
    """
    sectiuni = grupeaza_pe_sectiuni(top_n, per_sectiune=3)
    total_oferte = sum(len(lst) for _, lst in sectiuni)

    # ── Preheader: textul care apare in inbox dupa subiect ───────────────────
    nume_top = [m["magazin"].split(".")[0].capitalize() for _, lst in sectiuni for m in lst][:3]
    preheader = (
        f"Coduri verificate azi de la {', '.join(nume_top)}"
        if nume_top else "Coduri de reducere verificate zilnic"
    )

    def card(m: dict) -> str:
        logo   = m.get("logo_url", "")
        name   = m["magazin"].split(".")[0].capitalize()
        promo  = get_best_promo(m)
        cod    = promo.get("cod_cupon", "")
        titlu  = promo.get("nume", f"Oferta {name}")
        zile   = promo.get("zile_ramase", 99)
        link   = promo.get("landing_page") or m.get("url_afiliat") or m.get("url", SITE_URL)
        b_txt, b_bg, b_fg = badge_onest(m)

        titlu_scurt = (titlu[:88] + "...") if len(titlu) > 88 else titlu

        logo_html = (
            f'<img src="{logo}" alt="{name}" width="64" '
            f'style="display:block;max-width:64px;max-height:40px;width:auto;height:auto;'
            f'margin:0 auto 6px;border:0;outline:none;text-decoration:none;">'
            if logo else
            f'<div style="font-family:Arial,sans-serif;font-weight:bold;font-size:15px;'
            f'color:#0f766e;margin-bottom:6px;">{name}</div>'
        )

        # Cod de reducere — box cu contur punctat, usor de citit si de selectat
        cod_html = (
            f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" '
            f'style="margin:12px 0;"><tr><td align="center" '
            f'style="padding:10px 14px;background:#f0fdfa;border:2px dashed #14b8a6;'
            f'border-radius:8px;font-family:Consolas,Menlo,monospace;font-size:17px;'
            f'font-weight:bold;color:#0f766e;letter-spacing:2px;">{cod}</td></tr></table>'
            if cod else ""
        )

        # Urgenta doar cand e REALA (<=3 zile), nu la fiecare oferta
        zile_html = (
            f'<span style="font-family:Arial,sans-serif;font-size:11px;font-weight:bold;'
            f'color:#dc2626;">&#9200; Expir&#259; '
            f'{"azi" if zile == 0 else ("m&#226;ine" if zile == 1 else f"&#238;n {zile} zile")}</span>'
            if zile <= 3 else ""
        )

        cta_text = "Copiaz&#259; codul &amp; deschide" if cod else "Vezi oferta"

        return f"""
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;margin-bottom:12px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="86" valign="top" align="center" style="padding-right:14px;">
                          {logo_html}
                          <span style="display:inline-block;background:{b_bg};color:{b_fg};
                                font-family:Arial,sans-serif;font-size:11px;font-weight:bold;
                                padding:3px 9px;border-radius:20px;white-space:nowrap;">{b_txt}</span>
                        </td>
                        <td valign="top">
                          <div style="font-family:Arial,sans-serif;font-size:15px;font-weight:bold;
                                      color:#0f172a;line-height:1.4;">{titlu_scurt}</div>
                          <div style="font-family:Arial,sans-serif;font-size:12px;color:#64748b;
                                      margin-top:3px;">{name}{' &bull; ' + zile_html if zile_html else ''}</div>
                          {cod_html}
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;">
                            <tr>
                              <td align="center" bgcolor="#0d9488" style="border-radius:10px;">
                                <a href="{link}" target="_blank"
                                   style="display:inline-block;padding:11px 22px;font-family:Arial,sans-serif;
                                          font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none;
                                          border-radius:10px;">{cta_text} &rarr;</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>"""

    def sectiune(titlu: str, magazine: list) -> str:
        cards = "".join(card(m) for m in magazine)
        return f"""
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="margin:26px 0 12px;">
                <tr>
                  <td style="padding:11px 16px;background:#0f172a;border-radius:10px;">
                    <span style="font-family:Arial,sans-serif;font-size:14px;font-weight:bold;
                                 color:#5eead4;letter-spacing:0.4px;">{titlu}</span>
                  </td>
                </tr>
              </table>
              {cards}"""

    sectiuni_html = "".join(sectiune(t, lst) for t, lst in sectiuni)
    year = datetime.now().year

    test_banner = ""
    if is_test:
        test_banner = """
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="margin-bottom:18px;">
                <tr><td align="center" style="padding:12px;background:#fef3c7;border-radius:10px;
                    font-family:Arial,sans-serif;font-size:13px;font-weight:bold;color:#92400e;">
                  EMAIL DE TEST &mdash; nu a fost trimis abona&#539;ilor
                </td></tr>
              </table>"""

    return f"""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="ro">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="format-detection" content="telephone=no" />
<title>Top oferte &mdash; AmCupon.ro</title>
</head>
<body style="margin:0;padding:0;background:#eef2f6;-webkit-text-size-adjust:100%;">

<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#eef2f6;">
  &#128293; {preheader}
</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef2f6;">
  <tr>
    <td align="center" style="padding:20px 10px;">

      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
             style="width:100%;max-width:600px;">

        <tr>
          <td bgcolor="#0f766e" style="background:#0f766e;border-radius:16px 16px 0 0;padding:30px 24px;text-align:center;">
            <a href="{SITE_URL}" target="_blank" style="text-decoration:none;">
              <span style="background:rgba(255,255,255,0.22);color:#ffffff;font-family:Arial,sans-serif;
                    font-weight:bold;font-size:14px;padding:3px 9px;border-radius:6px;">Am</span><span
                    style="color:#ffffff;font-family:Arial,sans-serif;font-weight:bold;font-size:20px;">&nbsp;Cupon.ro</span>
            </a>
            <div style="font-family:Arial,sans-serif;font-size:22px;font-weight:bold;color:#ffffff;margin-top:14px;">
              Top oferte ale s&#259;pt&#259;m&#226;nii
            </div>
            <div style="font-family:Arial,sans-serif;font-size:13px;color:#a7f3d0;margin-top:5px;">
              {data_str} &bull; {total_oferte} oferte verificate
            </div>
          </td>
        </tr>

        <tr>
          <td bgcolor="#f8fafc" style="background:#f8fafc;padding:22px 18px;">
            {test_banner}
            <div style="font-family:Arial,sans-serif;font-size:14px;color:#334155;line-height:1.6;">
              Salut! Am grupat ofertele active pe categorii, ca s&#259; ajungi direct
              la ce te intereseaz&#259;. Codurile sunt verificate automat, zilnic.
            </div>
            {sectiuni_html}

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="margin-top:26px;border-top:1px solid #e2e8f0;">
              <tr>
                <td align="center" style="padding-top:20px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" bgcolor="#0f766e" style="border-radius:12px;">
                        <a href="{SITE_URL}" target="_blank"
                           style="display:inline-block;padding:15px 38px;font-family:Arial,sans-serif;
                                  font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;
                                  border-radius:12px;">Vezi toate ofertele &rarr;</a>
                      </td>
                    </tr>
                  </table>
                  <div style="font-family:Arial,sans-serif;font-size:12px;color:#94a3b8;margin-top:12px;">
                    {total_magazine if total_magazine else '1000+'} magazine &bull; actualizat zilnic &bull; 100% gratuit
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td bgcolor="#0f172a" style="background:#0f172a;border-radius:0 0 16px 16px;padding:22px 26px;text-align:center;">
            <div style="font-family:Arial,sans-serif;font-size:12px;color:#94a3b8;">
              <a href="{SITE_URL}" target="_blank" style="color:#5eead4;text-decoration:none;font-weight:bold;">AmCupon.ro</a>
              &bull; coduri de reducere verificate zilnic
            </div>
            <div style="font-family:Arial,sans-serif;font-size:11px;color:#64748b;margin-top:9px;line-height:1.6;">
              Prime&#537;ti acest email pentru c&#259; te-ai abonat pe AmCupon.ro.<br />
              Con&#539;inut afiliat &mdash; primim un comision din bugetul de marketing al
              magazinelor, f&#259;r&#259; niciun cost suplimentar pentru tine.
            </div>
            <div style="margin-top:12px;">
              <a href="{SITE_URL}/newsletter" style="color:#64748b;font-family:Arial,sans-serif;font-size:11px;">Dezaboneaz&#259;-te</a>
              <span style="color:#334155;">&nbsp;&bull;&nbsp;</span>
              <a href="{SITE_URL}/confidentialitate" style="color:#64748b;font-family:Arial,sans-serif;font-size:11px;">GDPR</a>
            </div>
          </td>
        </tr>

        <tr>
          <td align="center" style="padding:10px;font-family:Arial,sans-serif;font-size:10px;color:#94a3b8;">
            &copy; {year} AmCupon.ro
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>"""


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
    parser.add_argument("--n", type=int, default=20,
                        help="Numarul de oferte candidate pt grupare (default: 20)")
    parser.add_argument("--dry-run", metavar="FISIER", nargs="?", const="newsletter-preview.html",
                        help="Genereaza HTML-ul local si NU trimite nimic (default: newsletter-preview.html)")
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

    print(f"[INFO] Grupare pe sectiuni (top 3 / sectiune):")
    for titlu, lst in grupeaza_pe_sectiuni(top_n, per_sectiune=3):
        import re as _re
        print(f"  {_re.sub(r'&[#a-zA-Z0-9]+;', '', titlu).strip()}")
        for m in lst:
            b, _, _ = badge_onest(m)
            promo = get_best_promo(m)
            print(f"    {m['magazin']:<26} badge={b:<14} cod={promo.get('cod_cupon','-')}")

    html_content = make_html(top_n, data_str, is_test=bool(args.test), total_magazine=len(magazine))
    text_content = make_text(top_n, data_str)

    if args.dry_run:
        with open(args.dry_run, "w", encoding="utf-8") as f:
            f.write(html_content)
        gasit = "comision" in html_content.lower()
        print(f"\n[DRY-RUN] HTML scris in {args.dry_run} ({len(html_content)} caractere). Nimic trimis.")
        print(f"[DRY-RUN] Aparitii 'comision' in HTML: {html_content.lower().count('comision')}")
        if gasit:
            # Singura aparitie permisa e disclosure-ul obligatoriu din footer.
            for linie in html_content.splitlines():
                if "comision" in linie.lower():
                    print(f"           -> {linie.strip()[:120]}")
        sys.exit(0)

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
