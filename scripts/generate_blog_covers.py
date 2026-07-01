#!/usr/bin/env python3
"""
Genereaza covere de blog PE BRAND (aurora indigo/cyan, 800x400) — inlocuieste
picsum.photos (poze 100% aleatorii, off-brand) din articolele generate.

Output: frontend/public/blog-covers/{slug}.png pentru fiecare categorie
        + default.png + roundup.png
Ruleaza o singura data (sau cand apar categorii noi).
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).parent.parent
OUT_DIR = ROOT / "frontend" / "public" / "blog-covers"
OUT_DIR.mkdir(parents=True, exist_ok=True)

W, H = 800, 400
BG = (2, 6, 23)          # slate-950
INDIGO = (99, 102, 241)
INDIGO_LT = (129, 140, 248)
CYAN = (34, 211, 238)
WHITE = (248, 250, 252)
GRAY = (148, 163, 184)

CATEGORII = {
    "fashion": "Fashion",
    "electronics-itc": "Electronice & IT",
    "beauty": "Frumusete",
    "home-garden": "Casa & Gradina",
    "sports-outdoors": "Sport & Outdoor",
    "pharma": "Farmacie",
    "babies-kids-toys": "Copii & Jucarii",
    "automotive": "Auto-Moto",
    "books": "Carti",
    "hypermarket-groceries": "Hypermarket",
    "gifts-flowers": "Cadouri & Flori",
    "telecom": "Telecom",
    "pet-supplies": "Animale",
    "health-personal-care": "Sanatate",
    "jewelry": "Bijuterii",
    "games": "Gaming",
    "online-mall": "Online Mall",
    "default": "Reduceri & Cupoane",
    "roundup": "Cele mai bune coduri",
}


def load_font(size, bold=False):
    import os
    for p in (["C:/Windows/Fonts/arialbd.ttf", "C:/Windows/Fonts/calibrib.ttf",
               "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
               "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"] if bold else
              ["C:/Windows/Fonts/arial.ttf", "C:/Windows/Fonts/calibri.ttf",
               "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
               "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"]):
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                continue
    return ImageFont.load_default()


def glow(img, cx, cy, radius, color, alpha=45):
    ov = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    steps = 10
    for i in range(steps, 0, -1):
        r = int(radius * i / steps)
        a = int(alpha * (steps - i + 1) / steps)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(*color, a))
    img.paste(ov, mask=ov.split()[3])


def make_cover(slug: str, label: str):
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    # grid subtil
    for x in range(0, W, 50):
        draw.line([(x, 0), (x, H)], fill=(15, 23, 42))
    for y in range(0, H, 50):
        draw.line([(0, y), (W, y)], fill=(15, 23, 42))
    # aurora — pozitie derivata din slug (variatie stabila, nu random)
    seed = sum(ord(c) for c in slug)
    glow(img, 120 + (seed % 200), -60, 260, INDIGO, 55)
    glow(img, W - 100 - (seed % 150), H + 40, 220, CYAN, 30)

    draw = ImageDraw.Draw(img)
    # eticheta mica sus
    f_small = load_font(17, bold=True)
    draw.text((48, 118), "REDUCERI VERIFICATE", font=f_small, fill=CYAN)
    # titlul categoriei
    f_big = load_font(52, bold=True)
    draw.text((46, 150), label, font=f_big, fill=WHITE)
    # brand jos: pilula Am + Cupon.ro
    f_brand = load_font(22, bold=True)
    draw.rounded_rectangle([48, 260, 108, 296], radius=10, fill=INDIGO)
    bbox = draw.textbbox((0, 0), "Am", font=f_brand)
    draw.text((48 + (60 - (bbox[2]-bbox[0]))/2, 260 + (36-(bbox[3]-bbox[1]))/2 - bbox[1]), "Am", font=f_brand, fill=WHITE)
    draw.text((118, 264), "Cupon", font=f_brand, fill=WHITE)
    b2 = draw.textbbox((0, 0), "Cupon", font=f_brand)
    draw.text((118 + b2[2]-b2[0] + 2, 264), ".ro", font=f_brand, fill=INDIGO_LT)
    # linie subtila
    draw.text((48, 330), "amcupon.ro  ·  actualizat zilnic", font=load_font(15), fill=GRAY)

    out = OUT_DIR / f"{slug}.png"
    img.save(out, "PNG", optimize=True)
    return out


if __name__ == "__main__":
    for slug, label in CATEGORII.items():
        p = make_cover(slug, label)
        print(f"  {p.name}")
    print(f"Generat {len(CATEGORII)} covere in {OUT_DIR}")
