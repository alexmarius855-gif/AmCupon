"""
Postare automata pe Instagram Business Account via Meta Graph API.

Flow Instagram Graph API (doua pasi):
  1. POST /{ig-user-id}/media       → creeaza container cu imagine + caption
  2. POST /{ig-user-id}/media_publish → publica containerul

Env vars necesare (GitHub Secrets):
  INSTAGRAM_ACCOUNT_ID    -- ID-ul contului Instagram Business (ex: 17841451234567890)
  INSTAGRAM_ACCESS_TOKEN  -- Token cu permisiunile:
                             instagram_basic, instagram_content_publish,
                             pages_read_engagement, pages_show_list

Cum obtii token-ul:
  1. developers.facebook.com → Graph API Explorer
  2. Selecteaza App → Selecteaza User Token
  3. Adauga permisiunile de mai sus
  4. Click "Generate Access Token"
  5. Fa token Long-lived (60 zile): GET /oauth/access_token cu exchange
  6. Adauga in GitHub Secrets: INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_ACCOUNT_ID

Nota: Imaginea TREBUIE sa fie accesibila public (URL https).
      Folosi GitHub raw URL sau Vercel hosted URL.
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

# ── Config ────────────────────────────────────────────────────────────────────
IG_ACCOUNT_ID  = os.environ.get("INSTAGRAM_ACCOUNT_ID", "")
ACCESS_TOKEN   = os.environ.get("INSTAGRAM_ACCESS_TOKEN", "")
GRAPH_URL      = "https://graph.facebook.com/v19.0"
SITE_URL       = "https://amcupon.ro"

# URL public al bannerului (hostat pe Vercel la deploy)
# Dupa git push → Vercel rebuilds → aceasta URL devine disponibila
BANNER_URL     = "https://amcupon.ro/banner-categorii.png"
# Fallback — banner static din repo (raw GitHub)
BANNER_URL_RAW = os.environ.get("BANNER_PUBLIC_URL", BANNER_URL)

OUTPUT_JSON = os.path.join(os.path.dirname(__file__), "../frontend/public/output.json")

LUNI_RO = ["ianuarie","februarie","martie","aprilie","mai","iunie",
           "iulie","august","septembrie","octombrie","noiembrie","decembrie"]
ZILE_RO = ["luni","marti","miercuri","joi","vineri","sambata","duminica"]

NISE_ROTATIE = [
    "fashion", "beauty", "sports-outdoors", "pharma",
    "electronics-itc", "home-garden", "babies-kids-toys",
]

NISE_LABEL = {
    "fashion":               "👗 Fashion & Imbracaminte",
    "beauty":                "💄 Frumusete & Cosmetice",
    "pharma":                "💊 Farmacie & Sanatate",
    "electronics-itc":       "📱 Electronice & IT",
    "sports-outdoors":       "🏋 Sport & Fitness",
    "home-garden":           "🏠 Casa & Gradina",
    "babies-kids-toys":      "🧸 Copii & Jucarii",
    "automotive":            "🚗 Auto & Moto",
    "travel":                "✈ Calatorii",
    "gifts-flowers":         "🎁 Cadouri & Flori",
}

HASHTAGS_BASE = (
    "#reduceri #codreducere #shoppingonline #economii #romania"
    " #amcupon #oferte #discount #cumparaturi #promotii"
)

HASHTAGS_NISA = {
    "fashion":          "#fashion #moda #style #imbracaminte #fashionromania",
    "beauty":           "#beauty #frumusete #cosmetice #makeup #skincare",
    "pharma":           "#farmacie #sanatate #suplimente #sanatateromania",
    "electronics-itc":  "#tech #electronice #gadgets #smartphone #it",
    "sports-outdoors":  "#sport #fitness #gym #sportromania #antrenament",
    "home-garden":      "#casa #gradina #decoratiuni #amenajari #home",
    "babies-kids-toys": "#copii #mamici #bebelusi #jucarii #maternitate",
}


def get_best_promo(m: dict) -> dict:
    promotii = [p for p in m.get("promotii", []) if p.get("zile_ramase", -1) >= 0]
    cu_cod = [p for p in promotii if p.get("cod_cupon")]
    return cu_cod[0] if cu_cod else (promotii[0] if promotii else {})


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


def pick_top(magazine: list, n: int = 5, categorie: str = None) -> list:
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


# ── Caption generators ────────────────────────────────────────────────────────

def caption_dimineata(top5: list, data_str: str, zi_name: str) -> str:
    """Caption pentru postul de dimineata (08:00)."""
    zi_cap = zi_name.capitalize()
    lines = [
        f"Buna dimineata! ☀️ Top oferte {zi_cap}, {data_str}:",
        "",
    ]
    for i, m in enumerate(top5[:5], 1):
        name  = m["magazin"].split(".")[0].capitalize()
        promo = get_best_promo(m)
        cod   = promo.get("cod_cupon", "")
        disc  = format_discount(m, 55)
        line  = f"{i}. {name} — {disc}"
        if cod:
            line += f" | Cod: {cod}"
        lines.append(line)

    lines += [
        "",
        f"Toate codurile verificate: {SITE_URL}",
        "",
        HASHTAGS_BASE,
    ]
    return "\n".join(lines)


def caption_seara_nisa(nisa: str, top4: list, data_str: str) -> str:
    """Caption pentru postul de seara (19:00) — focusat pe o nisa."""
    label = NISE_LABEL.get(nisa, nisa.title())
    nisa_tags = HASHTAGS_NISA.get(nisa, "")

    lines = [
        f"{label}",
        f"Cele mai bune oferte active azi, {data_str}:",
        "",
    ]
    for m in top4[:4]:
        name  = m["magazin"].split(".")[0].capitalize()
        promo = get_best_promo(m)
        cod   = promo.get("cod_cupon", "")
        disc  = format_discount(m, 55)
        line  = f"• {name} — {disc}"
        if cod:
            line += f"\n  Cod: {cod}"
        lines.append(line)
        lines.append("")

    cat_slug = nisa
    lines += [
        f"Toate ofertele: {SITE_URL}/categorii/{cat_slug}",
        "",
        f"{HASHTAGS_BASE} {nisa_tags}",
    ]
    return "\n".join(lines)


# ── Instagram API ─────────────────────────────────────────────────────────────

def api_post(endpoint: str, payload: dict) -> dict:
    """POST la Graph API, returneaza dict JSON."""
    data = urllib.parse.urlencode(payload).encode("utf-8")
    req  = urllib.request.Request(
        f"{GRAPH_URL}/{endpoint}",
        data=data, method="POST"
    )
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"  Eroare HTTP {e.code}: {body}")
        return {}
    except Exception as e:
        print(f"  Eroare: {e}")
        return {}


def post_instagram_image(caption: str, image_url: str) -> dict:
    """
    Publica o imagine pe Instagram Business Account.
    Pasul 1: creeaza media container
    Pasul 2: publica containerul
    """
    if not IG_ACCOUNT_ID or not ACCESS_TOKEN:
        print("INSTAGRAM_ACCOUNT_ID / INSTAGRAM_ACCESS_TOKEN nu sunt setate — skip")
        return {}

    print(f"  Step 1: Creeaza container imagine...")
    container = api_post(f"{IG_ACCOUNT_ID}/media", {
        "image_url":    image_url,
        "caption":      caption,
        "access_token": ACCESS_TOKEN,
    })

    container_id = container.get("id")
    if not container_id:
        print(f"  Eroare creare container: {container}")
        return {}

    print(f"  Container creat: {container_id}")
    print(f"  Step 2: Publica containerul...")

    result = api_post(f"{IG_ACCOUNT_ID}/media_publish", {
        "creation_id":  container_id,
        "access_token": ACCESS_TOKEN,
    })

    if result.get("id"):
        print(f"  Postat pe Instagram — post id: {result['id']}")
    else:
        print(f"  Eroare publicare: {result}")

    return result


def post_instagram_text_only(caption: str) -> dict:
    """
    Alternativa: post cu imagine placeholder daca banner-ul nu e disponibil.
    Instagram API NECESITA imagine — nu poate posta text-only.
    Folosim banner-ul static din repo.
    """
    return post_instagram_image(caption, BANNER_URL_RAW)


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    if not IG_ACCOUNT_ID or not ACCESS_TOKEN:
        print("INSTAGRAM_ACCOUNT_ID / INSTAGRAM_ACCESS_TOKEN nu sunt setate — skip Instagram")
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

    valide = [
        m for m in magazine
        if m.get("are_promotie") and m.get("promotii")
        and m.get("procent_succes", 0) >= 50
        and " " not in m.get("magazin", "")
    ]

    posted = 0

    # ── Post dimineata (06:00–12:00 Romania) — oferte generale ────────────────
    if 5 <= ora_ro <= 12:
        top5 = pick_top(valide, n=5)
        caption = caption_dimineata(top5, data_str, zi_name)
        print(f"Instagram dimineata ({zi_name}):")
        print(caption[:200], "...\n")
        result = post_instagram_image(caption, BANNER_URL_RAW)
        if result.get("id"):
            posted += 1

    # ── Post seara (16:00–22:00 Romania) — nisa zilnica ──────────────────────
    elif 15 <= ora_ro <= 22:
        nisa = NISE_ROTATIE[zi_idx % len(NISE_ROTATIE)]
        top4 = pick_top(valide, n=4, categorie=nisa)
        top4_nisa = [m for m in top4 if m.get("categorie_slug") == nisa]

        if len(top4_nisa) >= 2:
            caption = caption_seara_nisa(nisa, top4_nisa, data_str)
        else:
            # fallback — post general
            caption = caption_dimineata(pick_top(valide, n=5), data_str, zi_name)
            nisa = "general"

        print(f"Instagram seara — nisa: {nisa}")
        print(caption[:200], "...\n")
        result = post_instagram_image(caption, BANNER_URL_RAW)
        if result.get("id"):
            posted += 1

    else:
        print(f"Ora {ora_ro}:00 Romania — nu e in fereastra de postare (dimineata 6-12 / seara 15-22)")
        sys.exit(0)

    print(f"\nInstagram: {posted} posturi publicate pe {data_str} ✓")


if __name__ == "__main__":
    main()
