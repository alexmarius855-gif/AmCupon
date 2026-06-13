"""
Postare automata pe Facebook Page via Meta Graph API.

Env vars necesare (GitHub Secrets):
  FACEBOOK_PAGE_ID     -- ID-ul paginii tale de Facebook (ex: 1080299791844588)
  FACEBOOK_PAGE_TOKEN  -- Page Access Token cu permisiunea pages_manage_posts

Cum obtii token-ul (o singura data):
  1. Mergi la business.facebook.com → Settings → Pages → Selecteaza pagina
  2. Click "Page Access Tokens" → Copy token
  3. Sau: developers.facebook.com → Graph API Explorer → selecteaza pagina
     → genereaza cu: pages_manage_posts, pages_read_engagement
  4. Adauga in GitHub Secrets: FACEBOOK_PAGE_TOKEN

Ruleaza zilnic la 08:00 Romania (06:00 UTC) via GitHub Actions.
Posteaza: 1 post tematic zilnic (ocazie / zi saptamana / promotii top).
"""

import json
import os
import sys
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime, timezone, timedelta
import random

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# ── Config ──────────────────────────────────────────────────────────────────
PAGE_ID    = os.environ.get("FACEBOOK_PAGE_ID", "")
PAGE_TOKEN = os.environ.get("FACEBOOK_PAGE_TOKEN", "")
GRAPH_URL  = "https://graph.facebook.com/v19.0"
SITE_URL   = "https://amcupon.ro"

OUTPUT_JSON = os.path.join(os.path.dirname(__file__), "../frontend/public/output.json")

LUNI_RO = ["ianuarie","februarie","martie","aprilie","mai","iunie",
           "iulie","august","septembrie","octombrie","noiembrie","decembrie"]

ZILE_RO = ["luni","marti","miercuri","joi","vineri","sambata","duminica"]

NISE_LABEL = {
    "fashion":              "👗 Fashion & Imbracaminte",
    "beauty":               "💄 Frumusete & Cosmetice",
    "pharma":               "💊 Farmacie & Sanatate",
    "electronics-itc":      "📱 Electronice & IT",
    "sports-outdoors":      "🏋 Sport & Fitness",
    "home-garden":          "🏠 Casa & Gradina",
    "babies-kids-toys":     "🧸 Copii & Jucarii",
    "automotive":           "🚗 Auto & Moto",
    "books":                "📚 Carti & Educatie",
    "hypermarket-groceries":"🛒 Supermarket",
    "travel":               "✈ Calatorii",
    "gifts-flowers":        "🎁 Cadouri & Flori",
    "pet-supplies":         "🐾 Animale de companie",
}

# Ocazii speciale luna → (zi, titlu, emoji, categorie_hint)
OCAZII = {
    (6, 1):  ("Ziua Copilului", "🎈", "babies-kids-toys"),
    (6, 5):  ("Ziua Mediului", "🌿", None),
    (2, 14): ("Valentine's Day", "💝", "gifts-flowers"),
    (3, 8):  ("8 Martie", "🌸", "beauty"),
    (12, 6): ("Ziua Nationala", "🇷🇴", None),
    (11, 11):("Singles Day", "🛒", None),
}


def get_best_promo(m: dict) -> dict:
    promotii = [p for p in m.get("promotii", []) if p.get("zile_ramase", -1) >= 0]
    if not promotii:
        return {}
    cu_cod = [p for p in promotii if p.get("cod_cupon")]
    return cu_cod[0] if cu_cod else promotii[0]


def format_discount(m: dict, max_len: int = 70) -> str:
    import re
    promo = get_best_promo(m)
    if promo.get("nume"):
        return promo["nume"][:max_len]
    c = m.get("comision", "")
    nums = [float(x) for x in re.findall(r"[\d.]+", c)]
    if nums:
        return f"Cashback pana la {max(nums):.0f}%"
    return "Oferta speciala"


def pick_top(magazine: list[dict], n: int = 5, categorie: str = None) -> list[dict]:
    """Selecteaza top N magazine cu promotii active, optional filtrate pe categorie."""
    def are_promo(m):
        return any(p.get("zile_ramase", -1) >= 0 for p in m.get("promotii", []))
    def are_cod(m):
        return any(p.get("cod_cupon") and p.get("zile_ramase", -1) >= 0
                   for p in m.get("promotii", []))

    pool = [m for m in magazine if are_promo(m)]
    if categorie:
        pool_cat = [m for m in pool if m.get("categorie_slug") == categorie]
        if len(pool_cat) >= 3:
            pool = pool_cat

    cu_cod   = sorted([m for m in pool if are_cod(m)],   key=lambda x: -x.get("scor_final", 0))
    fara_cod = sorted([m for m in pool if not are_cod(m)],key=lambda x: -x.get("scor_final", 0))
    combined = cu_cod[:n]
    if len(combined) < n:
        combined += fara_cod[:n - len(combined)]
    return combined[:n]


# ── Generatoare de posturi tematice ─────────────────────────────────────────

def post_ocazie(top: list[dict], titlu: str, emoji: str, data_str: str) -> str:
    """Post special pentru o ocazie (1 Iunie, 8 Martie etc.)"""
    lines = [
        f"{emoji} {titlu.upper()} — reduceri speciale!",
        "",
        f"De {titlu}, magazinele online te asteapta cu oferte:",
        "",
    ]
    for m in top[:4]:
        name  = m["magazin"].split(".")[0].capitalize()
        promo = get_best_promo(m)
        cod   = promo.get("cod_cupon", "")
        disc  = format_discount(m, 65)
        line  = f"{emoji} {name} — {disc}"
        if cod:
            line += f"\n   Cod: {cod}"
        lines.append(line)
        lines.append("")

    lines += [
        f"Toate ofertele verificate: {SITE_URL}",
        "",
        f"#reduceri #codreducere #{titlu.replace(' ', '')} #romania #amcupon",
    ]
    return "\n".join(lines)


def post_weekend(top: list[dict], data_str: str) -> str:
    """Post special pentru weekend (sambata/duminica)."""
    intro_options = [
        "Weekend-ul e mai frumos cu o cumparatura inteligenta!",
        "Ce faci in weekend? Noi am gasit cele mai bune oferte active!",
        "Weekend de shopping? Iata ce merita atentie azi:",
    ]
    lines = [
        f"🛍 OFERTE DE WEEKEND — {data_str}",
        "",
        random.choice(intro_options),
        "",
    ]
    for i, m in enumerate(top[:5], 1):
        name  = m["magazin"].split(".")[0].capitalize()
        promo = get_best_promo(m)
        cod   = promo.get("cod_cupon", "")
        disc  = format_discount(m, 65)
        slug  = m.get("magazin", "")
        line  = f"{i}. {name} — {disc}"
        if cod:
            line += f" (cod: {cod})"
        lines.append(line)

    lines += [
        "",
        f"Cauta orice magazin sau cod pe: {SITE_URL}",
        "",
        "#weekend #reduceri #shoppingonline #codreducere #romania #amcupon",
    ]
    return "\n".join(lines)


def post_zi_saptamana(top: list[dict], zi: str, data_str: str) -> str:
    """Post standard pentru zilele de luni-vineri."""
    zi_cap = zi.capitalize()
    opening = {
        "luni":     f"Incepe saptamana cu economii! Ofertele zilei de {zi_cap}:",
        "marti":    f"Marti productiv = cumparaturi inteligente. Top oferte azi:",
        "miercuri": f"Mijlocul saptamanii — moment bun pentru o oferta buna:",
        "joi":      f"Joi vine cu reduceri! Iata ce am gasit pentru tine:",
        "vineri":   f"TGIF! Vinerea asta economisesti cu aceste oferte:",
    }
    lines = [
        f"🏷 TOP OFERTE {zi_cap.upper()} — {data_str}",
        "",
        opening.get(zi, f"Ofertele zilei de {zi_cap}:"),
        "",
    ]
    for i, m in enumerate(top[:5], 1):
        name  = m["magazin"].split(".")[0].capitalize()
        promo = get_best_promo(m)
        cod   = promo.get("cod_cupon", "")
        disc  = format_discount(m, 65)
        line  = f"{i}. {name} — {disc}"
        if cod:
            line += f"\n   Cod: {cod}"
        lines.append(line)

    lines += [
        "",
        f"Toate codurile verificate pe: {SITE_URL}/oferte-azi",
        "",
        "#reduceri #codreducere #shoppingonline #economii #romania #amcupon",
    ]
    return "\n".join(lines)


def post_nisa(nisa: str, top: list[dict], data_str: str) -> str:
    """Post dedicat unei nise (fashion, sport, farmacie etc.)"""
    label = NISE_LABEL.get(nisa, nisa.title())
    lines = [
        f"{label} — Oferte active {data_str}",
        "",
    ]
    for m in top[:4]:
        name  = m["magazin"].split(".")[0].capitalize()
        promo = get_best_promo(m)
        cod   = promo.get("cod_cupon", "")
        slug  = m.get("magazin", "")
        disc  = format_discount(m, 60)
        line  = f"• {name}: {disc}"
        if cod:
            line += f" — cod: {cod}"
        lines.append(line)
        lines.append(f"  {SITE_URL}/cod-reducere/{slug}")
        lines.append("")

    cat_slug = nisa
    lines += [
        f"Mai multe oferte: {SITE_URL}/categorii/{cat_slug}",
        "",
        f"#reduceri #codreducere #romania #{nisa.replace('-', '')} #amcupon",
    ]
    return "\n".join(lines)


# ── Post to Facebook ─────────────────────────────────────────────────────────

def post_to_facebook(message: str, link: str = "") -> dict:
    if not PAGE_ID or not PAGE_TOKEN:
        print("FACEBOOK_PAGE_ID / FACEBOOK_PAGE_TOKEN nu sunt setate — skip")
        return {}

    endpoint = f"{GRAPH_URL}/{PAGE_ID}/feed"
    payload  = {
        "message":      message,
        "access_token": PAGE_TOKEN,
    }
    if link:
        payload["link"] = link

    data = urllib.parse.urlencode(payload).encode("utf-8")
    req  = urllib.request.Request(endpoint, data=data, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")

    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            result = json.loads(resp.read())
        print(f"  Postat cu succes — post id: {result.get('id', '?')}")
        return result
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"  Eroare HTTP {e.code}: {body}")
        return None
    except Exception as e:
        print(f"  Eroare: {e}")
        return None


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    if not PAGE_ID or not PAGE_TOKEN:
        print("FACEBOOK_PAGE_ID / FACEBOOK_PAGE_TOKEN nu sunt setate — skip Facebook")
        sys.exit(0)

    if not os.path.exists(OUTPUT_JSON):
        print(f"Fisier lipsa: {OUTPUT_JSON}")
        sys.exit(1)

    with open(OUTPUT_JSON, encoding="utf-8") as f:
        magazine = json.load(f)

    # ora Romaniei (+3 in vara)
    now_ro   = datetime.now(timezone.utc) + timedelta(hours=3)
    zi_idx   = now_ro.weekday()          # 0=luni … 6=duminica
    zi_name  = ZILE_RO[zi_idx]
    data_str = f"{now_ro.day} {LUNI_RO[now_ro.month - 1]} {now_ro.year}"
    luna_zi  = (now_ro.month, now_ro.day)

    # Filtrare larga — nu mai cerem procent_succes (dateaz date nesigure)
    valide = [
        m for m in magazine
        if m.get("are_promotie") and m.get("promotii")
        and " " not in m.get("magazin", "")
    ]
    # Fallback daca nu avem destule: include si magazine fara promotie activa dar cu scor bun
    if len(valide) < 3:
        valide = [m for m in magazine if " " not in m.get("magazin", "")]

    posted = 0

    # ── 1. Ocazie speciala ────────────────────────────────────────────────────
    if luna_zi in OCAZII:
        titlu, emoji, cat_hint = OCAZII[luna_zi]
        top = pick_top(valide, n=4, categorie=cat_hint)
        msg = post_ocazie(top, titlu, emoji, data_str)
        link = f"{SITE_URL}/categorii/{cat_hint}" if cat_hint else SITE_URL
        print(f"Post ocazie: {titlu}")
        print(msg[:300], "...\n")
        if post_to_facebook(msg, link):
            posted += 1

    # ── 2. Post "Reduceri mari azi" (daca avem oferte cu % mare) ──────────────
    import re as _re
    oferte_pct = []
    for m in magazine:
        for p in m.get("promotii", []):
            titlu_p = p.get("nume", "") or ""
            match = _re.search(r"(\d+)\s*%", titlu_p)
            if match:
                disc = int(match.group(1))
                if 20 <= disc <= 80 and p.get("zile_ramase", -1) >= 0:
                    oferte_pct.append({
                        "magazin": m["magazin"],
                        "disc": disc,
                        "titlu": titlu_p[:70],
                        "cod": p.get("cod_cupon", ""),
                        "url": p.get("landing_page") or m.get("url_afiliat", ""),
                        "slug": m.get("magazin", ""),
                    })
    oferte_pct.sort(key=lambda x: x["disc"], reverse=True)

    if len(oferte_pct) >= 3:
        linii = [
            f"🔥 REDUCERI MARI AZI — {data_str}",
            "",
            "Cele mai mari reduceri active chiar acum:",
            "",
        ]
        for o in oferte_pct[:5]:
            name = o["magazin"].split(".")[0].capitalize()
            linie = f"🏷 -{o['disc']}% la {name}"
            if o["cod"]:
                linie += f" (cod: {o['cod']})"
            linii.append(linie)
            linii.append(f"   {o['titlu'][:60]}")
            linii.append("")
        linii += [
            f"Toate ofertele verificate: {SITE_URL}/oferte-azi",
            "",
            "#reduceri #codreducere #shoppingonline #romania #amcupon",
        ]
        msg_pct = "\n".join(linii)
        print("Post reduceri mari:")
        print(msg_pct[:300], "...\n")
        if post_to_facebook(msg_pct, f"{SITE_URL}/oferte-azi"):
            posted += 1

    # ── 3. Post principal zilnic ──────────────────────────────────────────────
    top5 = pick_top(valide, n=5)
    if zi_idx in (5, 6):  # sambata, duminica
        msg  = post_weekend(top5, data_str)
        link = f"{SITE_URL}/oferte-azi"
    else:
        msg  = post_zi_saptamana(top5, zi_name, data_str)
        link = f"{SITE_URL}/oferte-azi"

    print(f"Post principal ({zi_name}):")
    print(msg[:300], "...\n")
    if post_to_facebook(msg, link):
        posted += 1

    # ── 4. Post nisa (rotatie zilnica: luni=fashion, marti=beauty etc.) ───────
    nise_rotatie = [
        "fashion", "beauty", "sports-outdoors", "pharma",
        "electronics-itc", "home-garden", "babies-kids-toys",
    ]
    nisa_azi = nise_rotatie[zi_idx % len(nise_rotatie)]

    top_nisa = pick_top(valide, n=4, categorie=nisa_azi)
    top_nisa_filtrat = [m for m in top_nisa if m.get("categorie_slug") == nisa_azi]

    if len(top_nisa_filtrat) >= 2:
        msg_nisa  = post_nisa(nisa_azi, top_nisa_filtrat, data_str)
        link_nisa = f"{SITE_URL}/categorii/{nisa_azi}"
        print(f"Post nisa ({nisa_azi}):")
        print(msg_nisa[:200], "...\n")
        if post_to_facebook(msg_nisa, link_nisa):
            posted += 1

    # ── 5. Post brand spotlight (joi = brand saptamanei) ─────────────────────
    if zi_idx == 3:  # joi
        BRANDURI_SPOTLIGHT = [
            ("emag", "eMAG", "🛒", "/emag"),
            ("altex", "Altex", "📺", "/altex"),
            ("fashiondays", "Fashion Days", "👗", "/fashiondays"),
            ("noriel", "Noriel", "🧸", "/noriel"),
            ("decathlon", "Decathlon", "🏃", "/decathlon"),
            ("carturesti", "Carturesti", "📚", "/carturesti"),
            ("drmax", "Dr. Max", "💊", "/drmax"),
        ]
        # Alege brand-ul bazat pe saptamana anului
        saptamana_nr = now_ro.isocalendar()[1]
        brand_idx = saptamana_nr % len(BRANDURI_SPOTLIGHT)
        slug_b, name_b, emoji_b, path_b = BRANDURI_SPOTLIGHT[brand_idx]

        brand_mag = next((m for m in magazine if slug_b in m.get("magazin", "").lower()), None)
        if brand_mag:
            promotii_b = [p for p in brand_mag.get("promotii", []) if p.get("zile_ramase", -1) >= 0]
            linii_b = [
                f"{emoji_b} BRAND SAPTAMANEI: {name_b.upper()}",
                "",
                f"Iata cele mai bune oferte {name_b} active acum:",
                "",
            ]
            for p in promotii_b[:3]:
                cod = p.get("cod_cupon", "")
                linie = f"• {p.get('nume', '')[:65]}"
                if cod:
                    linie += f"\n  Cod: {cod}"
                linii_b.append(linie)
                linii_b.append("")
            if not promotii_b:
                linii_b.append(f"Descopera toate ofertele {name_b} pe AmCupon.ro!")
                linii_b.append("")
            linii_b += [
                f"Ghid complet + coduri: {SITE_URL}{path_b}",
                "",
                f"#reduceri #{name_b.replace(' ', '').lower()} #codreducere #romania #amcupon",
            ]
            msg_brand = "\n".join(linii_b)
            print(f"Post brand spotlight ({name_b}):")
            print(msg_brand[:300], "...\n")
            if post_to_facebook(msg_brand, f"{SITE_URL}{path_b}"):
                posted += 1

    print(f"\nFacebook: {posted} posturi publicate pe {data_str} ✓")


if __name__ == "__main__":
    main()
