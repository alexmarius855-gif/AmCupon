"""
Postare automata pe Facebook + Instagram via Make.com webhook.
NU necesita developer account Meta sau token-uri API.

Setup ONE-TIME pe make.com (10 minute, gratuit):
  Instructiuni complete in: scripts/SETUP-MAKE-COM.md

Env vars necesare (GitHub Secrets):
  MAKE_WEBHOOK_URL  -- URL webhook din Make.com Scenario
  BANNER_PUBLIC_URL -- URL public al bannerului (setat automat in workflow)

Functionare:
  GitHub Actions → POST JSON catre Make.com webhook
  Make.com → posteaza imagine + caption pe Facebook Page + Instagram
"""

import json
import os
import sys
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime, timezone, timedelta
import random
import re

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# ── Config ────────────────────────────────────────────────────────────────────
WEBHOOK_URL   = os.environ.get("MAKE_WEBHOOK_URL", "")
BANNER_URL    = os.environ.get("BANNER_PUBLIC_URL", "https://amcupon.ro/banner-daily.png")
STORY_URL     = os.environ.get("BANNER_STORY_URL",  "https://amcupon.ro/banner-story.png")
SITE_URL      = "https://amcupon.ro"
OUTPUT_JSON   = os.path.join(os.path.dirname(__file__), "../frontend/public/output.json")

LUNI_RO  = ["ianuarie","februarie","martie","aprilie","mai","iunie",
            "iulie","august","septembrie","octombrie","noiembrie","decembrie"]
ZILE_RO  = ["luni","marti","miercuri","joi","vineri","sambata","duminica"]

# Nise pentru pranz (12:00) — rotatie pe zi saptamana
NISE_PRANZ = [
    "fashion",          # Luni
    "beauty",           # Marti
    "pharma",           # Miercuri
    "babies-kids-toys", # Joi
    "electronics-itc",  # Vineri
    "sports-outdoors",  # Sambata
    "home-garden",      # Duminica
]

# Nise pentru seara (19:00) — diferite fata de pranz in aceeasi zi
NISE_SEARA = [
    "electronics-itc",  # Luni
    "sports-outdoors",  # Marti
    "home-garden",      # Miercuri
    "fashion",          # Joi
    "beauty",           # Vineri
    "pharma",           # Sambata
    "babies-kids-toys", # Duminica
]

# Compatibilitate backward (folosit in ocazii)
NISE_ROTATIE = NISE_PRANZ

NISE_LABEL = {
    "fashion":              "👗 Fashion & Imbracaminte",
    "beauty":               "💄 Frumusete & Cosmetice",
    "pharma":               "💊 Farmacie & Sanatate",
    "electronics-itc":      "📱 Electronice & IT",
    "sports-outdoors":      "🏋 Sport & Fitness",
    "home-garden":          "🏠 Casa & Gradina",
    "babies-kids-toys":     "🧸 Copii & Jucarii",
    "books":                "📚 Carti & Educatie",
    "automotive":           "🚗 Auto & Moto",
    "health-personal-care": "💪 Sanatate & Ingrijire",
    "pet-supplies":         "🐾 Animale de Companie",
    "online-mall":          "🛒 Mall Online",
    "gifts-flowers":        "🎁 Cadouri & Flori",
    "hypermarket-groceries":"🛍 Supermarket & Alimente",
}

HASHTAGS_BASE = (
    "#reduceri #codreducere #shoppingonline #economii #romania"
    " #amcupon #oferte #discount #cumparaturi #promotii"
)

HASHTAGS_NISA = {
    "fashion":              "#fashion #moda #style #imbracaminte #fashionromania",
    "beauty":               "#beauty #frumusete #cosmetice #makeup #skincare",
    "pharma":               "#farmacie #sanatate #suplimente",
    "electronics-itc":      "#tech #electronice #gadgets #smartphone",
    "sports-outdoors":      "#sport #fitness #gym #sportromania",
    "home-garden":          "#casa #gradina #decoratiuni #home",
    "babies-kids-toys":     "#copii #mamici #bebelusi #jucarii",
    "books":                "#carti #lectura #carte #librarie #citeste",
    "automotive":           "#auto #masina #piese #moto #automotive",
    "health-personal-care": "#sanatate #wellness #ingrijire #fitness",
    "pet-supplies":         "#animale #caini #pisici #petshop",
    "online-mall":          "#shopping #mall #shoppingonline",
    "gifts-flowers":        "#cadouri #flori #surprize #gift",
    "hypermarket-groceries":"#alimente #supermarket #mancare #grocery",
}

OCAZII = {
    (2, 14): ("Valentine's Day",   "💝", "gifts-flowers"),
    (3, 8):  ("8 Martie",          "🌸", "beauty"),
    (4, 23): ("Ziua Cartii",       "📖", "books"),
    (5, 1):  ("1 Mai",             "🌞", "sports-outdoors"),
    (6, 1):  ("Ziua Copilului",    "🎈", "babies-kids-toys"),
    (6, 5):  ("Ziua Mediului",     "🌿", "home-garden"),
    (6, 21): ("Solstitiu Verii",   "☀️", "sports-outdoors"),
    (7, 15): ("Summer Sale",       "🏖", None),
    (8, 15): ("Oferte de Vara",    "🌊", "fashion"),
    (9, 1):  ("Back to School",    "🎒", "books"),
    (10, 31):("Halloween Sale",    "🎃", None),
    (11, 11):("Singles Day",       "🛒", None),
    (11, 29):("Black Friday",      "🔥", None),
    (12, 6): ("Ziua Nationala",    "🇷🇴", None),
    (12, 26):("Reduceri Craciun",  "🎁", "gifts-flowers"),
    (12, 31):("Revelion Sale",     "🎆", None),
}


# ── Helpers ───────────────────────────────────────────────────────────────────

def get_best_promo(m):
    promotii = [p for p in m.get("promotii", []) if p.get("zile_ramase", -1) >= 0]
    cu_cod = [p for p in promotii if p.get("cod_cupon")]
    return cu_cod[0] if cu_cod else (promotii[0] if promotii else {})


def format_discount(m, max_len=70):
    promo = get_best_promo(m)
    if promo.get("nume"):
        text = promo["nume"].strip()
        # Curata text urat: pipe, bare, doua spatii
        text = re.sub(r"\s*\|\s*\d+\s*\|?\s*$", "", text).strip()
        text = re.sub(r"\s{2,}", " ", text)
        if len(text) <= max_len:
            return text
        # Taie la ultimul spatiu inainte de limita
        cut = text[:max_len]
        last_space = cut.rfind(" ")
        if last_space > int(max_len * 0.65):
            return cut[:last_space] + "..."
        return cut + "..."
    # Extrage procent din textul promotiei
    if promo.get("procent_reducere"):
        return f"Reducere {promo['procent_reducere']}%"
    c = m.get("comision", "")
    nums = [float(x) for x in re.findall(r"[\d.]+", c)]
    if nums:
        return f"Cashback pana la {max(nums):.0f}%"
    return "Oferta speciala"


def pick_top(magazine, n=5, categorie=None):
    def has_promo(m):
        return any(p.get("zile_ramase", -1) >= 0 for p in m.get("promotii", []))
    def has_cod(m):
        return any(p.get("cod_cupon") and p.get("zile_ramase", -1) >= 0
                   for p in m.get("promotii", []))

    pool = [m for m in magazine if has_promo(m)]
    if categorie:
        pool_cat = [m for m in pool if m.get("categorie_slug") == categorie]
        if len(pool_cat) >= 3:
            pool = pool_cat

    cu_cod   = sorted([m for m in pool if has_cod(m)],    key=lambda x: -x.get("scor_final", 0))
    fara_cod = sorted([m for m in pool if not has_cod(m)], key=lambda x: -x.get("scor_final", 0))
    combined = cu_cod[:n]
    if len(combined) < n:
        combined += fara_cod[:n - len(combined)]
    return combined[:n]


# ── Generatoare caption ───────────────────────────────────────────────────────

def build_caption_general(top5, zi_name, data_str, for_instagram=False):
    """Caption zilnic general — dimineata sau general."""
    zi_cap = zi_name.capitalize()
    lines = [
        f"🎟 Top oferte {zi_cap}, {data_str}:",
        "",
    ]
    for i, m in enumerate(top5[:5], 1):
        name  = m["magazin"].split(".")[0].capitalize()
        promo = get_best_promo(m)
        cod   = promo.get("cod_cupon", "")
        disc  = format_discount(m, 60)
        line  = f"{i}. {name} — {disc}"
        if cod:
            line += f" | Cod: {cod}"
        lines.append(line)

    lines += [
        "",
        "✅ 100% gratuit, fara cont necesar",
        f"👉 {SITE_URL}",
        "",
        HASHTAGS_BASE,
    ]
    return "\n".join(lines)


def build_caption_nisa(nisa, top4, data_str, for_instagram=False):
    """Caption dedicat unei nise — seara."""
    label     = NISE_LABEL.get(nisa, nisa.title())
    nisa_tags = HASHTAGS_NISA.get(nisa, "")

    lines = [
        f"{label}",
        f"Oferte active azi, {data_str}:",
        "",
    ]
    for m in top4[:4]:
        name  = m["magazin"].split(".")[0].capitalize()
        promo = get_best_promo(m)
        cod   = promo.get("cod_cupon", "")
        disc  = format_discount(m, 60)
        line  = f"• {name} — {disc}"
        if cod:
            line += f" | Cod: {cod}"
        lines.append(line)
    lines.append("")

    cat_slug = nisa
    lines += [
        f"Toate ofertele: {SITE_URL}/categorii/{cat_slug}",
        "",
        f"{HASHTAGS_BASE} {nisa_tags}",
    ]
    return "\n".join(lines)


def build_caption_ocazie(titlu, emoji, top4, data_str):
    """Caption pentru ocazie speciala."""
    lines = [
        f"{emoji} {titlu.upper()} — reduceri speciale!",
        "",
        f"De {titlu}, magazinele online te asteapta cu oferte:",
        "",
    ]
    for m in top4[:4]:
        name  = m["magazin"].split(".")[0].capitalize()
        promo = get_best_promo(m)
        cod   = promo.get("cod_cupon", "")
        disc  = format_discount(m, 60)
        line  = f"{emoji} {name} — {disc}"
        if cod:
            line += f" | Cod: {cod}"
        lines.append(line)
        lines.append("")

    lines += [
        f"Toate ofertele verificate: {SITE_URL}",
        "",
        f"#reduceri #codreducere #{titlu.replace(' ', '')} #romania #amcupon",
    ]
    return "\n".join(lines)


# ── Trimite la Make.com ───────────────────────────────────────────────────────

def send_webhook(payload: dict) -> bool:
    """Trimite JSON payload la Make.com webhook. Returneaza True la succes."""
    if not WEBHOOK_URL:
        print("MAKE_WEBHOOK_URL nu e setat — skip webhook")
        return False

    data = json.dumps(payload).encode("utf-8")
    req  = urllib.request.Request(WEBHOOK_URL, data=data, method="POST")
    req.add_header("Content-Type", "application/json")

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8", errors="replace")
            code = resp.getcode()
            if code in (200, 204):
                print(f"  Webhook trimis cu succes (HTTP {code})")
                if body:
                    print(f"  Raspuns Make.com: {body[:200]}")
                return True
            else:
                print(f"  Webhook HTTP {code}: {body[:200]}")
                return False
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"  Eroare HTTP {e.code}: {body[:300]}")
        return False
    except Exception as e:
        print(f"  Eroare trimitere webhook: {e}")
        return False


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    if not WEBHOOK_URL:
        print("MAKE_WEBHOOK_URL nu e setat — skip (configureaza Make.com)")
        print("Instructiuni: scripts/SETUP-MAKE-COM.md")
        sys.exit(0)

    if not os.path.exists(OUTPUT_JSON):
        print(f"Fisier lipsa: {OUTPUT_JSON}")
        sys.exit(1)

    with open(OUTPUT_JSON, encoding="utf-8") as f:
        magazine = json.load(f)

    now_ro   = datetime.now(timezone.utc) + timedelta(hours=3)
    zi_idx   = now_ro.weekday()
    zi_name  = ZILE_RO[zi_idx]
    data_str = f"{now_ro.day} {LUNI_RO[now_ro.month - 1]} {now_ro.year}"
    ora_ro   = now_ro.hour
    luna_zi  = (now_ro.month, now_ro.day)

    valide = [
        m for m in magazine
        if m.get("are_promotie") and m.get("promotii")
        and m.get("procent_succes", 0) >= 50
        and " " not in m.get("magazin", "")
    ]

    posted = 0

    # ── 1. Ocazie speciala (daca e cazul) ─────────────────────────────────────
    if luna_zi in OCAZII:
        titlu, emoji, cat_hint = OCAZII[luna_zi]
        top4 = pick_top(valide, n=4, categorie=cat_hint)
        caption = build_caption_ocazie(titlu, emoji, top4, data_str)
        link    = f"{SITE_URL}/categorii/{cat_hint}" if cat_hint else SITE_URL

        payload = {
            "type":       "ocazie",
            "titlu":      titlu,
            "caption":    caption,
            "link":       link,
            "image_url":  BANNER_URL,
            "story_url":  STORY_URL,
            "data":       data_str,
            "zi":         zi_name,
        }
        print(f"Trimit webhook ocazie: {titlu}")
        if send_webhook(payload):
            posted += 1

    # ── 2. Post zilnic principal (3 posturi/zi pe categorii diferite) ───────────
    if 5 <= ora_ro <= 10:       # dimineata — 08:00 Romania
        top5      = pick_top(valide, n=5)
        caption   = build_caption_general(top5, zi_name, data_str)
        link      = f"{SITE_URL}/oferte-azi"
        post_type = "morning"
        nisa_sent = "general"

    elif 10 < ora_ro <= 14:     # pranz — 12:00 Romania
        nisa  = NISE_PRANZ[zi_idx % len(NISE_PRANZ)]
        top4  = pick_top(valide, n=4, categorie=nisa)
        top4n = [m for m in top4 if m.get("categorie_slug") == nisa]

        if len(top4n) >= 2:
            caption = build_caption_nisa(nisa, top4n, data_str)
            link    = f"{SITE_URL}/categorii/{nisa}"
            nisa_sent = nisa
        else:
            caption = build_caption_general(pick_top(valide, n=5), zi_name, data_str)
            link    = f"{SITE_URL}/oferte-azi"
            nisa_sent = "general"
        post_type = "noon"

    elif 15 <= ora_ro <= 23:    # seara — 19:00 Romania
        nisa  = NISE_SEARA[zi_idx % len(NISE_SEARA)]
        top4  = pick_top(valide, n=4, categorie=nisa)
        top4n = [m for m in top4 if m.get("categorie_slug") == nisa]

        if len(top4n) >= 2:
            caption = build_caption_nisa(nisa, top4n, data_str)
            link    = f"{SITE_URL}/categorii/{nisa}"
            nisa_sent = nisa
        else:
            caption = build_caption_general(pick_top(valide, n=5), zi_name, data_str)
            link    = f"{SITE_URL}/oferte-azi"
            nisa_sent = "general"
        post_type = "evening"

    else:
        print(f"Ora {ora_ro}:00 Romania — afara din fereastra (5-10 / 11-14 / 15-23)")
        sys.exit(0)

    payload = {
        "type":       post_type,
        "caption":    caption,
        "link":       link,
        "image_url":  BANNER_URL,
        "story_url":  STORY_URL,
        "data":       data_str,
        "zi":         zi_name,
        "nisa":       nisa_sent,
    }

    print(f"Trimit webhook {post_type} ({nisa_sent})...")
    print(f"  Banner URL: {BANNER_URL}")
    print(f"  Caption (primele 150 char): {caption[:150]}...")

    if send_webhook(payload):
        posted += 1

    print(f"\nWebhook: {posted} posturi trimise catre Make.com pentru {data_str}")
    if posted == 0:
        print("Nimic trimis — verifica MAKE_WEBHOOK_URL in GitHub Secrets")


if __name__ == "__main__":
    main()
