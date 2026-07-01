#!/usr/bin/env python3
"""
Genereaza coperta de Facebook pentru AmCupon.ro — 1640x624 (retina 2x din 820x312).
Foloseste Pillow, aceeasi paleta indigo/cyan ca restul site-ului (ZERO portocaliu).

Output:
  data/facebook-cover.png
  frontend/public/facebook-cover.png

Ruleaza manual cand vrei sa actualizezi coperta (nu e parte din pipeline-ul automat —
o coperta se schimba rar, spre deosebire de bannerele zilnice).
"""
import json
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

SCRIPT_DIR  = Path(__file__).parent
ROOT_DIR    = SCRIPT_DIR.parent
OUTPUT_JSON = ROOT_DIR / "frontend" / "public" / "output.json"
DATA_DIR    = ROOT_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)
PUBLIC_DIR  = ROOT_DIR / "frontend" / "public"

OUT_DATA   = DATA_DIR / "facebook-cover.png"
OUT_PUBLIC = PUBLIC_DIR / "facebook-cover.png"

# Paleta identica cu generate_banner_auto.py / site
BG_DARK   = (2, 6, 23)       # slate-950
BG_MID    = (15, 23, 42)     # slate-900
INDIGO    = (99, 102, 241)   # indigo-500
INDIGO_LT = (129, 140, 248)  # indigo-400
CYAN      = (34, 211, 238)   # cyan-400
WHITE     = (248, 250, 252)
GRAY      = (148, 163, 184)  # slate-400
CARD_BORDER = (51, 65, 85)   # slate-700


def load_font(size: int, bold: bool = False):
    candidates_bold = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/calibrib.ttf",
    ]
    candidates_reg = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibri.ttf",
    ]
    import os
    for p in (candidates_bold if bold else candidates_reg):
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                continue
    return ImageFont.load_default()


def draw_gradient_bg(img, w, h):
    draw = ImageDraw.Draw(img)
    for x in range(w):
        t = x / w
        r = int(BG_DARK[0] + (BG_MID[0] - BG_DARK[0]) * t)
        g = int(BG_DARK[1] + (BG_MID[1] - BG_DARK[1]) * t)
        b = int(BG_DARK[2] + (BG_MID[2] - BG_DARK[2]) * t)
        draw.line([(x, 0), (x, h)], fill=(r, g, b))


def draw_grid(draw, w, h, step=60):
    color = (30, 41, 59)
    for x in range(0, w, step):
        draw.line([(x, 0), (x, h)], fill=color)
    for y in range(0, h, step):
        draw.line([(0, y), (w, y)], fill=color)


def draw_glow(img, cx, cy, radius, color, alpha=35):
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    steps = 10
    for i in range(steps, 0, -1):
        r = int(radius * i / steps)
        a = int(alpha * (steps - i + 1) / steps)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(*color, a))
    img.paste(overlay, mask=overlay.split()[3])


def pill(img, x, y, w, h, text, font, fill_rgba, outline_rgba, text_color):
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    d.rounded_rectangle([x, y, x + w, y + h], radius=h // 2, fill=fill_rgba, outline=outline_rgba, width=2)
    img.paste(overlay, mask=overlay.split()[3])
    draw = ImageDraw.Draw(img)
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text((x + (w - tw) / 2, y + (h - th) / 2 - bbox[1]), text, font=font, fill=text_color)


def get_top_badges(n=4):
    try:
        data = json.loads(OUTPUT_JSON.read_text(encoding="utf-8"))
    except Exception:
        return ["-50%", "Cod gratuit", "-30%", "Oferta zilnica"]
    import re
    pool = [m for m in data if m.get("are_promotie") and m.get("promotii")]
    pool.sort(key=lambda x: -x.get("scor_final", 0))
    badges = []
    for m in pool:
        promo = next((p for p in m["promotii"] if p.get("zile_ramase", -1) >= 0), None)
        if not promo:
            continue
        nums = re.findall(r"(\d{1,2})\s*%", promo.get("nume", "") + " " + promo.get("descriere", ""))
        if nums:
            badges.append(f"-{nums[0]}%")
        elif promo.get("cod_cupon"):
            badges.append("Cod activ")
        if len(badges) >= n:
            break
    while len(badges) < n:
        badges.append("Oferta zilnica")
    return badges[:n]


def main():
    W, H = 1640, 624  # 2x din 820x312 (dimensiune oficiala coperta Facebook)
    img = Image.new("RGB", (W, H), BG_DARK)
    draw_gradient_bg(img, W, H)
    draw = ImageDraw.Draw(img)
    draw_grid(draw, W, H, 60)

    draw_glow(img, W - 200, 80, 380, INDIGO, alpha=40)
    draw_glow(img, 120, H - 60, 260, CYAN, alpha=20)

    # ── Logo lockup (stanga) ──
    font_logo = load_font(72, bold=True)
    logo_x, logo_y = 90, 190

    # "Am" pill indigo
    am_w, am_h = 118, 92
    draw.rounded_rectangle([logo_x, logo_y, logo_x + am_w, logo_y + am_h], radius=22, fill=INDIGO)
    bbox = draw.textbbox((0, 0), "Am", font=font_logo)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text((logo_x + (am_w - tw) / 2, logo_y + (am_h - th) / 2 - bbox[1]), "Am", font=font_logo, fill=WHITE)

    # "Cupon" white + ".ro" indigo
    cupon_x = logo_x + am_w + 22
    draw.text((cupon_x, logo_y + 4), "Cupon", font=font_logo, fill=WHITE)
    bbox2 = draw.textbbox((0, 0), "Cupon", font=font_logo)
    ro_x = cupon_x + (bbox2[2] - bbox2[0]) + 6
    draw.text((ro_x, logo_y + 4), ".ro", font=font_logo, fill=INDIGO_LT)

    # Tagline
    font_tag = load_font(30, bold=False)
    draw.text((logo_x + 4, logo_y + 118), "Cele mai bune coduri de reducere din Romania",
               font=font_tag, fill=GRAY)

    # Stats row
    font_stat = load_font(24, bold=True)
    draw.text((logo_x + 4, logo_y + 168), "1000+ magazine", font=font_stat, fill=INDIGO_LT)
    bbox3 = draw.textbbox((0, 0), "1000+ magazine", font=font_stat)
    sep_x = logo_x + 4 + (bbox3[2] - bbox3[0]) + 20
    draw.text((sep_x, logo_y + 168), "•", font=font_stat, fill=CARD_BORDER)
    draw.text((sep_x + 20, logo_y + 168), "Actualizat zilnic", font=font_stat, fill=CYAN)

    # ── Badge-uri plutitoare (dreapta) — date reale din output.json ──
    b1, b2, b3, b4 = get_top_badges(4)
    font_badge_lg = load_font(30, bold=True)
    font_badge_md = load_font(24, bold=True)

    pill(img, 1080, 90, 210, 62, b1, font_badge_lg,
         (99, 102, 241, 235), (129, 140, 248, 255), WHITE)
    pill(img, 1340, 190, 190, 58, b2, font_badge_md,
         (34, 211, 238, 40), (34, 211, 238, 180), CYAN)
    pill(img, 1120, 290, 230, 58, b3, font_badge_md,
         (255, 255, 255, 25), (255, 255, 255, 90), WHITE)
    pill(img, 1360, 380, 200, 58, b4, font_badge_md,
         (99, 102, 241, 40), (99, 102, 241, 160), INDIGO_LT)

    OUT_DATA.parent.mkdir(exist_ok=True)
    img.save(OUT_DATA, "PNG")
    img.save(OUT_PUBLIC, "PNG")
    print(f"Salvat: {OUT_DATA}")
    print(f"Copiat: {OUT_PUBLIC}")


if __name__ == "__main__":
    main()
