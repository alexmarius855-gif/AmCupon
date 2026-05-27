"""
Postare automata pe Facebook Page via Meta Graph API.

Env vars necesare (GitHub Secrets):
  FACEBOOK_PAGE_ID     -- ID-ul paginii tale de Facebook (ex: 123456789)
  FACEBOOK_PAGE_TOKEN  -- Page Access Token cu permisiunea pages_manage_posts

Cum obtii token-ul (o singura data):
  1. Mergi la developers.facebook.com → My Apps → Create App → Business
  2. Adauga produsul "Facebook Login"
  3. In Graph API Explorer: selecteaza app + pagina ta
  4. Genereaza token cu: pages_manage_posts, pages_read_engagement
  5. Extinde token-ul la "Long-lived" (60 zile) cu /oauth/access_token
  6. Sau foloseste token permanent de pagina din Business Suite

Output: posteaza top 5 oferte zilnice cu link catre amcupon.ro
"""

import json
import os
import sys
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime, timezone

# ── Config ──────────────────────────────────────────────────────────────────
PAGE_ID    = os.environ.get("FACEBOOK_PAGE_ID", "")
PAGE_TOKEN = os.environ.get("FACEBOOK_PAGE_TOKEN", "")
GRAPH_URL  = "https://graph.facebook.com/v19.0"
SITE_URL   = "https://amcupon.ro"

OUTPUT_JSON = os.path.join(os.path.dirname(__file__), "../frontend/public/output.json")

LUNI_RO = ["ianuarie","februarie","martie","aprilie","mai","iunie",
           "iulie","august","septembrie","octombrie","noiembrie","decembrie"]

NISE_LABEL = {
    "fashion":             "👗 Fashion & Îmbrăcăminte",
    "beauty":              "💄 Frumusețe & Cosmetice",
    "pharma":              "💊 Farmacie & Sănătate",
    "electronics-itc":     "📱 Electronice & IT",
    "sports-outdoors":     "🏋️ Sport & Fitness",
    "home-garden":         "🏠 Casă & Grădină",
    "babies-kids-toys":    "🧸 Copii & Jucării",
    "automotive":          "🚗 Auto & Moto",
    "books":               "📚 Cărți & Educație",
    "hypermarket-groceries":"🛒 Supermarket & Grocery",
    "travel":              "✈️ Călătorii",
    "gifts-flowers":       "🎁 Cadouri & Flori",
}


def pick_top5(magazine: list[dict]) -> list[dict]:
    cu_cod   = [m for m in magazine if m.get("cod_cupon") and m.get("promotie")]
    fara_cod = [m for m in magazine if m.get("promotie") and not m.get("cod_cupon")]
    cu_cod.sort(key=lambda x: -x.get("scor_final", 0))
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


def build_post_text(top5: list[dict], data_str: str) -> str:
    lines = [
        f"🏷️ TOP 5 OFERTE AZI — {data_str}",
        f"Coduri verificate pe AmCupon.ro\n",
    ]
    for i, m in enumerate(top5, 1):
        name  = m.get("magazin_display", m.get("magazin", "")).title()
        disc  = format_discount(m)
        cod   = m.get("cod_cupon", "")
        url   = m.get("url_afiliat", f"{SITE_URL}/cod-reducere/{m.get('magazin','')}")
        line  = f"{i}. {name} — {disc}"
        if cod:
            line += f" | Cod: {cod}"
        lines.append(line)

    lines += [
        f"\n👉 Toate codurile: {SITE_URL}",
        "\n#codreducere #reduceri #shopping #romania #voucher #economii #amcupon",
    ]
    return "\n".join(lines)


def build_nisa_post(nisa: str, magazine_nisa: list[dict], data_str: str) -> str:
    label = NISE_LABEL.get(nisa, nisa.title())
    top3  = magazine_nisa[:3]
    lines = [
        f"{label} — Oferte active {data_str}",
        "",
    ]
    for m in top3:
        name = m.get("magazin_display", m.get("magazin", "")).title()
        disc = format_discount(m)
        cod  = m.get("cod_cupon", "")
        slug = m.get("magazin", "")
        line = f"• {name}: {disc}"
        if cod:
            line += f" (cod: {cod})"
        lines.append(line)
        lines.append(f"  → {SITE_URL}/cod-reducere/{slug}")
        lines.append("")

    lines += [
        f"Cauta toate ofertele pe {SITE_URL}",
        "",
        "#reduceri #codreducere #romania #shopping #economii #amcupon",
    ]
    return "\n".join(lines)


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

    data     = urllib.parse.urlencode(payload).encode("utf-8")
    req      = urllib.request.Request(endpoint, data=data, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")

    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            result = json.loads(resp.read())
        print(f"  Postat ✓ — post id: {result.get('id', '?')}")
        return result
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"  Eroare HTTP {e.code}: {body}")
        return {}
    except Exception as e:
        print(f"  Eroare: {e}")
        return {}


def main():
    if not PAGE_ID or not PAGE_TOKEN:
        print("FACEBOOK_PAGE_ID / FACEBOOK_PAGE_TOKEN nu sunt setate — skip Facebook")
        sys.exit(0)

    if not os.path.exists(OUTPUT_JSON):
        print(f"Fisier lipsa: {OUTPUT_JSON}")
        sys.exit(1)

    with open(OUTPUT_JSON, encoding="utf-8") as f:
        magazine = json.load(f)

    now      = datetime.now(timezone.utc)
    data_str = f"{now.day} {LUNI_RO[now.month - 1]} {now.year}"

    valide = [
        m for m in magazine
        if m.get("are_promotie") and m.get("promotii")
        and m.get("procent_succes", 0) >= 50
        and " " not in m.get("magazin", "")
    ]

    # ── 1. Post general top 5 ─────────────────────────────────────────────────
    top5    = pick_top5(valide)
    message = build_post_text(top5, data_str)
    print("Post general top 5:")
    print(message[:200], "...\n")
    post_to_facebook(message, SITE_URL)

    # ── 2. Post per nisa (primele 3 nise active) ──────────────────────────────
    nise_active = {}
    for m in valide:
        nisa = m.get("categorie_slug", "")
        if nisa and nisa in NISE_LABEL:
            nise_active.setdefault(nisa, []).append(m)

    # sorteaza nisa dupa nr magazine, ia top 3 nise
    top_nise = sorted(nise_active.items(), key=lambda x: -len(x[1]))[:3]

    for nisa, mag_list in top_nise:
        mag_list.sort(key=lambda x: -x.get("scor_final", 0))
        msg = build_nisa_post(nisa, mag_list, data_str)
        print(f"Post nisa {nisa}:")
        print(msg[:150], "...\n")
        post_to_facebook(msg, f"{SITE_URL}/categorii/{nisa}")

    print(f"\nFacebook: 1 post general + {len(top_nise)} posturi nisa publicate ✓")


if __name__ == "__main__":
    main()
