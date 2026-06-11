"""
Genereaza previzualizare posturi Facebook (fara postare).
Salveaza in: posturi_facebook_preview.txt
"""

import json
import os
import sys
import re
import random
from datetime import datetime, timezone, timedelta

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

SITE_URL    = "https://amcupon.ro"
OUTPUT_JSON = os.path.join(os.path.dirname(__file__), "../frontend/public/output.json")
OUT_FILE    = os.path.join(os.path.dirname(__file__), "posturi_facebook_preview.txt")

LUNI_RO = ["ianuarie","februarie","martie","aprilie","mai","iunie",
           "iulie","august","septembrie","octombrie","noiembrie","decembrie"]
ZILE_RO = ["luni","marti","miercuri","joi","vineri","sambata","duminica"]

NISE_LABEL = {
    "fashion":              "Moda & Imbracaminte",
    "beauty":               "Frumusete & Cosmetice",
    "pharma":               "Farmacie & Sanatate",
    "electronics-itc":      "Electronice & IT",
    "sports-outdoors":      "Sport & Fitness",
    "home-garden":          "Casa & Gradina",
    "babies-kids-toys":     "Copii & Jucarii",
    "automotive":           "Auto & Moto",
    "books":                "Carti & Educatie",
    "pet-supplies":         "Animale de companie",
}

NISE_EMOJI = {
    "fashion":              "👗",
    "beauty":               "💄",
    "pharma":               "💊",
    "electronics-itc":      "📱",
    "sports-outdoors":      "🏋",
    "home-garden":          "🏠",
    "babies-kids-toys":     "🧸",
    "automotive":           "🚗",
    "books":                "📚",
    "pet-supplies":         "🐾",
}

def get_best_promo(m):
    promotii = [p for p in m.get("promotii", []) if p.get("zile_ramase", -1) >= 0]
    if not promotii:
        return {}
    cu_cod = [p for p in promotii if p.get("cod_cupon")]
    return cu_cod[0] if cu_cod else promotii[0]

def format_discount(m, max_len=70):
    promo = get_best_promo(m)
    if promo.get("nume"):
        return promo["nume"][:max_len]
    c = m.get("comision", "")
    nums = [float(x) for x in re.findall(r"[\d.]+", c)]
    if nums:
        return f"Cashback pana la {max(nums):.0f}%"
    return "Oferta speciala"

def pick_top(magazine, n=5, categorie=None):
    def has_promo(m):
        return any(p.get("zile_ramase", -1) >= 0 for p in m.get("promotii", []))
    def has_cod(m):
        return any(p.get("cod_cupon") and p.get("zile_ramase", -1) >= 0 for p in m.get("promotii", []))
    pool = [m for m in magazine if has_promo(m)]
    if categorie:
        pool_cat = [m for m in pool if m.get("categorie_slug") == categorie]
        if len(pool_cat) >= 3:
            pool = pool_cat
    cu_cod   = sorted([m for m in pool if has_cod(m)],   key=lambda x: -x.get("scor_final", 0))
    fara_cod = sorted([m for m in pool if not has_cod(m)],key=lambda x: -x.get("scor_final", 0))
    combined = cu_cod[:n]
    if len(combined) < n:
        combined += fara_cod[:n - len(combined)]
    return combined[:n]


def build_posts(magazine, data_str, zi_name, zi_idx):
    posts = []

    # 1. Post reduceri mari
    oferte_pct = []
    for m in magazine:
        for p in m.get("promotii", []):
            titlu_p = p.get("nume", "") or ""
            match = re.search(r"(\d+)\s*%", titlu_p)
            if match:
                disc = int(match.group(1))
                if 15 <= disc <= 90 and p.get("zile_ramase", -1) >= 0:
                    oferte_pct.append({
                        "magazin": m["magazin"],
                        "disc": disc,
                        "titlu": titlu_p[:70],
                        "cod": p.get("cod_cupon", ""),
                        "url": p.get("landing_page") or m.get("url_afiliat", ""),
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
        posts.append(("POST 1 — Reduceri mari azi", "\n".join(linii)))

    # 2. Post zilnic principal
    valide = [m for m in magazine if m.get("are_promotie") and m.get("promotii") and " " not in m.get("magazin", "")]
    if len(valide) < 3:
        valide = [m for m in magazine if " " not in m.get("magazin", "")]
    top5 = pick_top(valide, n=5)

    zi_cap = zi_name.capitalize()
    opening = {
        "luni":     f"Incepe saptamana cu economii! Ofertele zilei de {zi_cap}:",
        "marti":    f"Marti productiv = cumparaturi inteligente. Top oferte azi:",
        "miercuri": f"Mijlocul saptamanii — moment bun pentru o oferta buna:",
        "joi":      f"Joi vine cu reduceri! Iata ce am gasit pentru tine:",
        "vineri":   f"TGIF! Vinerea asta economisesti cu aceste oferte:",
        "sambata":  f"Weekend-ul e mai frumos cu o cumparatura inteligenta!",
        "duminica": f"Ce faci duminica? Noi am gasit cele mai bune oferte active!",
    }
    linii = [
        f"🏷 TOP OFERTE {zi_cap.upper()} — {data_str}",
        "",
        opening.get(zi_name, f"Ofertele zilei de {zi_cap}:"),
        "",
    ]
    for i, m in enumerate(top5, 1):
        name  = m["magazin"].split(".")[0].capitalize()
        promo = get_best_promo(m)
        cod   = promo.get("cod_cupon", "")
        disc  = format_discount(m, 65)
        linie = f"{i}. {name} — {disc}"
        if cod:
            linie += f"\n   Cod: {cod}"
        linii.append(linie)
    linii += [
        "",
        f"Toate codurile verificate pe: {SITE_URL}/oferte-azi",
        "",
        "#reduceri #codreducere #shoppingonline #economii #romania #amcupon",
    ]
    posts.append((f"POST 2 — Zilnic {zi_cap}", "\n".join(linii)))

    # 3. Post nisa fashion (rotatie)
    nise_rotatie = ["fashion", "beauty", "sports-outdoors", "pharma", "electronics-itc", "home-garden", "babies-kids-toys"]
    for idx, nisa in enumerate(nise_rotatie):
        top_nisa = [m for m in pick_top(valide, n=6, categorie=nisa) if m.get("categorie_slug") == nisa]
        if len(top_nisa) >= 2:
            emoji_n = NISE_EMOJI.get(nisa, "🛍")
            label_n = NISE_LABEL.get(nisa, nisa.title())
            linii = [
                f"{emoji_n} {label_n.upper()} — Oferte active {data_str}",
                "",
            ]
            for m in top_nisa[:4]:
                name  = m["magazin"].split(".")[0].capitalize()
                promo = get_best_promo(m)
                cod   = promo.get("cod_cupon", "")
                slug  = m.get("magazin", "")
                disc  = format_discount(m, 60)
                linie = f"• {name}: {disc}"
                if cod:
                    linie += f" — cod: {cod}"
                linii.append(linie)
                linii.append(f"  {SITE_URL}/cod-reducere/{slug}")
                linii.append("")
            linii += [
                f"Mai multe oferte: {SITE_URL}/categorii/{nisa}",
                "",
                f"#reduceri #codreducere #romania #{nisa.replace('-', '')} #amcupon",
            ]
            posts.append((f"POST {len(posts)+1} — Nisa {label_n}", "\n".join(linii)))
            if len(posts) >= 4:
                break

    # 4. Post brand spotlight
    BRANDURI_SPOTLIGHT = [
        ("emag", "eMAG", "🛒", "/emag"),
        ("altex", "Altex", "📺", "/altex"),
        ("fashiondays", "Fashion Days", "👗", "/fashiondays"),
        ("noriel", "Noriel", "🧸", "/noriel"),
        ("decathlon", "Decathlon", "🏃", "/decathlon"),
    ]
    for slug_b, name_b, emoji_b, path_b in BRANDURI_SPOTLIGHT:
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
            posts.append((f"POST {len(posts)+1} — Brand Spotlight: {name_b}", "\n".join(linii_b)))
            break

    return posts


def main():
    with open(OUTPUT_JSON, encoding="utf-8") as f:
        magazine = json.load(f)

    now_ro   = datetime.now(timezone.utc) + timedelta(hours=3)
    zi_idx   = now_ro.weekday()
    zi_name  = ZILE_RO[zi_idx]
    data_str = f"{now_ro.day} {LUNI_RO[now_ro.month - 1]} {now_ro.year}"

    posts = build_posts(magazine, data_str, zi_name, zi_idx)

    separator = "\n" + "="*60 + "\n"
    output_lines = [
        f"POSTURI FACEBOOK AMCUPON.RO — {data_str} ({zi_name.upper()})",
        f"Generate: {len(posts)} posturi",
        separator,
    ]
    for titlu, continut in posts:
        output_lines.append(f"[ {titlu} ]")
        output_lines.append("")
        output_lines.append(continut)
        output_lines.append(separator)

    result = "\n".join(output_lines)

    with open(OUT_FILE, "w", encoding="utf-8") as f:
        f.write(result)

    print(result)
    print(f"\nSalvat in: {OUT_FILE}")


if __name__ == "__main__":
    main()
