#!/usr/bin/env python3
"""
Banner PE NISA — sablon reutilizabil pentru orice nisa/categorie AmCupon.
Un banner patrat (1080x1080, gata pt Instagram/Facebook feed) per nisa, cu
2-4 oferte REALE (magazin + discount/pret + cod daca exista), design brand
indigo/cyan (aceeasi paleta ca restul generatoarelor).

Adaugi o nisa noua = un rand in NISE (jos). Rulezi o data, ai imagine + caption
pt fiecare, gata de postat.

Output:
  data/bannere-nise/{slug}.png
  data/bannere-nise/captions.txt   (toate caption-urile, gata de copiat)
"""
import json
import re
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).parent.parent
OUTPUT_JSON = ROOT / "frontend" / "public" / "output.json"
OUT_DIR = ROOT / "data" / "bannere-nise"
OUT_DIR.mkdir(parents=True, exist_ok=True)

W = H = 1080
BG = (2, 6, 23)
INDIGO = (99, 102, 241)
INDIGO_LT = (129, 140, 248)
CYAN = (34, 211, 238)
WHITE = (248, 250, 252)
GRAY = (148, 163, 184)
SLATE_CARD = (15, 23, 42)
SLATE_BORDER = (51, 65, 85)

SITE_URL = "amcupon.ro"


def load_font(size, bold=False):
    import os
    cands = (["C:/Windows/Fonts/arialbd.ttf", "C:/Windows/Fonts/calibrib.ttf",
              "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"] if bold else
             ["C:/Windows/Fonts/arial.ttf", "C:/Windows/Fonts/calibri.ttf",
              "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"])
    for p in cands:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                continue
    return ImageFont.load_default()


def glow(img, cx, cy, radius, color, alpha=45):
    ov = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    for i in range(10, 0, -1):
        r = int(radius * i / 10)
        a = int(alpha * (11 - i) / 10)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(*color, a))
    img.paste(ov, mask=ov.split()[3])


def nume(slug):
    return slug.split(".")[0].replace("-", " ").title()


def extrage_procent(*texte):
    for t in texte:
        if not t:
            continue
        m = re.search(r"(\d{1,2})\s*%", str(t))
        if m:
            return f"-{m.group(1)}%"
    return None


# ── Nise: fie "categorie" (filtrat live din output.json), fie "custom" (curatat manual) ──
NISE = [
    {"slug": "esim", "titlu": "eSIM Calatorii", "emoji": "\U0001F4E1", "link": "/esim", "tip": "custom", "oferte": [
        {"nume": "Airalo", "linie": "de la $4.50 · 190+ tari · 15% comision"},
        {"nume": "Saily", "linie": "de la $3.99 · 150+ tari · 10% comision"},
        {"nume": "AmigoSIM", "linie": "eSIM Europa de la $2.99 · comision bun"},
    ]},
    {"slug": "hosting", "titlu": "Hosting & Domenii", "emoji": "\U0001F310", "link": "/hosting", "categorie_slug": "hosting", "tip": "categorie"},
    {"slug": "suplimente", "titlu": "Suplimente & Sanatate", "emoji": "\U0001F48A", "link": "/sanatate", "categorie_slug": "health-personal-care", "tip": "categorie"},
    {"slug": "ai-tools", "titlu": "Unelte AI & Software", "emoji": "\U0001F916", "link": "/ai-tools", "categorie_slug": "software-business", "tip": "categorie"},
    {"slug": "cadouri", "titlu": "Cadouri & Flori", "emoji": "\U0001F381", "link": "/idei-cadouri", "categorie_slug": "flowers-gifts", "tip": "categorie"},
    {"slug": "animale", "titlu": "Animale de Companie", "emoji": "\U0001F43E", "link": "/animale", "categorie_slug": "pet-supplies", "tip": "categorie"},
    {"slug": "fashion", "titlu": "Fashion", "emoji": "\U0001F457", "link": "/fashion", "categorie_slug": "fashion", "tip": "categorie"},
    {"slug": "casa-gradina", "titlu": "Casa & Gradina", "emoji": "\U0001F3E1", "link": "/casa", "categorie_slug": "home-garden", "tip": "categorie"},
    {"slug": "frumusete", "titlu": "Frumusete", "emoji": "\U0001F484", "link": "/frumusete", "categorie_slug": "beauty", "tip": "categorie"},
]


def get_oferte_categorie(magazine, categorie_slug, n=3):
    are_tracking = lambda m: m.get("url_afiliat") and m.get("url_afiliat") != m.get("url")
    cu_promo = [m for m in magazine if m.get("categorie_slug") == categorie_slug
                and m.get("are_promotie") and m.get("promotii") and are_tracking(m)]
    cu_promo.sort(key=lambda x: -(x.get("scor_final") or 0))

    rezultat = []
    for m in cu_promo[:n]:
        promo = next((p for p in m["promotii"] if p.get("zile_ramase", -1) >= 0), m["promotii"][0])
        disc = extrage_procent(promo.get("nume"), promo.get("descriere"))
        cod = promo.get("cod_cupon")
        if disc and cod:
            linie = f"{disc} cu cod {cod}"
        elif disc:
            linie = f"{disc} reducere"
        elif cod:
            linie = f"cod {cod}"
        else:
            linie = "oferta activa"
        rezultat.append({"nume": nume(m["magazin"]), "linie": linie})

    # Completam cu recomandari oneste (fara promo, dar cu link real) — regula
    # site-ului: comision pe orice link afiliat, NU inventam reduceri false.
    if len(rezultat) < n:
        existente = {r["nume"] for r in rezultat}
        fara_promo = [m for m in magazine if m.get("categorie_slug") == categorie_slug
                      and are_tracking(m) and nume(m["magazin"]) not in existente]
        fara_promo.sort(key=lambda x: -(x.get("scor_final") or 0))
        for m in fara_promo[:n - len(rezultat)]:
            rezultat.append({"nume": nume(m["magazin"]), "linie": "Recomandat de AmCupon"})

    return rezultat


def make_banner(nisa, oferte):
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    for x in range(0, W, 54):
        draw.line([(x, 0), (x, H)], fill=(10, 16, 32))
    for y in range(0, H, 54):
        draw.line([(0, y), (W, y)], fill=(10, 16, 32))

    glow(img, W - 150, 60, 380, INDIGO, 50)
    glow(img, 100, H - 100, 280, CYAN, 25)
    draw = ImageDraw.Draw(img)

    f_pill = load_font(20, bold=True)
    pill_w = 220
    draw.rounded_rectangle([48, 44, 48 + pill_w, 44 + 46], radius=23, fill=INDIGO)
    draw.text((48 + 24, 44 + 12), "AmCupon.ro", font=f_pill, fill=WHITE)
    draw.ellipse([48 + 14, 44 + 20, 48 + 22, 44 + 28], fill=CYAN)

    # Titlu nisa — accent vectorial in loc de emoji (fonturile PIL/sistem nu au emoji)
    draw.rounded_rectangle([48, 130, 48 + 64, 130 + 64], radius=16, fill=INDIGO)
    draw.ellipse([48 + 20, 130 + 20, 48 + 44, 130 + 44], fill=CYAN)
    f_title = load_font(56, bold=True)
    draw.text((48, 216), nisa["titlu"], font=f_title, fill=WHITE)
    f_sub = load_font(24)
    draw.text((48, 286), "Oferte verificate azi", font=f_sub, fill=GRAY)

    # Carduri oferte
    card_y = 350
    card_h = 190
    gap = 22
    f_nume = load_font(34, bold=True)
    f_linie = load_font(24)
    f_num = load_font(30, bold=True)

    for i, o in enumerate(oferte[:3]):
        cy = card_y + i * (card_h + gap)
        draw.rounded_rectangle([48, cy, W - 48, cy + card_h], radius=20, fill=SLATE_CARD, outline=SLATE_BORDER, width=2)
        # numar
        draw.ellipse([80, cy + 30, 80 + 64, cy + 30 + 64], fill=INDIGO)
        bbox = draw.textbbox((0, 0), str(i + 1), font=f_num)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        draw.text((80 + (64 - tw) / 2, cy + 30 + (64 - th) / 2 - bbox[1]), str(i + 1), font=f_num, fill=WHITE)
        # text
        draw.text((172, cy + 38), o["nume"], font=f_nume, fill=WHITE)
        draw.text((172, cy + 90), o["linie"], font=f_linie, fill=CYAN)

    # CTA footer
    cta_y = card_y + 3 * (card_h + gap) + 10
    f_cta = load_font(28, bold=True)
    draw.rounded_rectangle([48, cta_y, W - 48, cta_y + 74], radius=22, fill=INDIGO)
    cta_text = f"Vezi toate ofertele -> {SITE_URL}{nisa['link']}"
    bbox = draw.textbbox((0, 0), cta_text, font=f_cta)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) / 2, cta_y + 22), cta_text, font=f_cta, fill=WHITE)

    return img


def main():
    magazine = json.loads(OUTPUT_JSON.read_text(encoding="utf-8"))
    captions = []
    generate = 0

    for nisa in NISE:
        if nisa["tip"] == "custom":
            oferte = nisa["oferte"]
        else:
            oferte = get_oferte_categorie(magazine, nisa["categorie_slug"], n=3)

        if len(oferte) < 2:
            print(f"  SKIP {nisa['slug']}: doar {len(oferte)} oferte cu promotie activa (prea putin pt banner)")
            continue

        img = make_banner(nisa, oferte)
        out_path = OUT_DIR / f"{nisa['slug']}.png"
        img.save(out_path, "PNG", optimize=True)
        generate += 1

        lista = ", ".join(o["nume"] for o in oferte[:3])
        caption = (
            f"{nisa['emoji']} {nisa['titlu']} — cele mai bune oferte de azi\n\n"
            f"Am verificat pentru tine: {lista}.\n\n"
            f"Toate codurile + ofertele complete: {SITE_URL}{nisa['link']}\n\n"
            f"#reduceri #{nisa['slug'].replace('-', '')} #oferte #romania"
        )
        captions.append(f"{'=' * 50}\n{nisa['emoji']} {nisa['titlu']}  ({out_path.name})\n{'=' * 50}\n{caption}\n")
        print(f"  OK {nisa['slug']}.png  ({len(oferte)} oferte: {lista})")

    (OUT_DIR / "captions.txt").write_text("\n\n".join(captions), encoding="utf-8")
    print(f"\nGenerate {generate}/{len(NISE)} bannere in {OUT_DIR}")
    print(f"Caption-uri: {OUT_DIR / 'captions.txt'}")


if __name__ == "__main__":
    main()
