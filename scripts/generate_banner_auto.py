"""
Generator automat bannere sociale pentru AmCupon.ro.
Foloseste Pillow (fara browser) — compatibil GitHub Actions Ubuntu.

Output:
  data/banner_daily.png     — 1080x1080 Instagram/Facebook square
  data/banner_story.png     — 1080x1920 Instagram Story (optional)

Ruleaza inainte de post_facebook.py / post_instagram.py.
"""

import json
import os
import sys
import random
from datetime import datetime, timezone, timedelta
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Pillow nu e instalat — pip install Pillow")
    sys.exit(1)

# ── Paths ────────────────────────────────────────────────────────────────────
SCRIPT_DIR  = Path(__file__).parent
ROOT_DIR    = SCRIPT_DIR.parent
OUTPUT_JSON = ROOT_DIR / "frontend" / "public" / "output.json"
DATA_DIR    = ROOT_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

OUT_SQUARE  = DATA_DIR / "banner_daily.png"
OUT_STORY   = DATA_DIR / "banner_story.png"

# Copie in frontend/public/ — servita de Vercel la amcupon.ro/banner-daily.png
PUBLIC_DIR   = ROOT_DIR / "frontend" / "public"
OUT_SQ_PUB  = PUBLIC_DIR / "banner-daily.png"
OUT_ST_PUB  = PUBLIC_DIR / "banner-story.png"

# ── Culori brand ─────────────────────────────────────────────────────────────
BG_DARK     = (15, 23, 42)      # #0f172a
BG_MID      = (26, 39, 68)      # #1a2744
ORANGE      = (249, 115, 22)    # #f97316
ORANGE_DARK = (234, 88, 12)     # #ea580c
ORANGE_DIM  = (251, 146, 60)    # #fb923c
WHITE       = (248, 250, 252)   # #f8fafc
GRAY        = (148, 163, 184)   # #94a3b8
GRAY_DARK   = (71, 85, 105)     # #475569
CARD_BG     = (30, 41, 59)      # #1e293b
CARD_BORDER = (45, 63, 87)      # #2d3f57
GREEN       = (74, 222, 128)    # #4ade80
GREEN_DIM   = (22, 163, 74)     # #16a34a

LUNI_RO = ["ianuarie","februarie","martie","aprilie","mai","iunie",
           "iulie","august","septembrie","octombrie","noiembrie","decembrie"]

CATEGORII_EMOJI = {
    "fashion":               "👗",
    "beauty":                "💄",
    "pharma":                "💊",
    "electronics-itc":       "💻",
    "sports-outdoors":       "⚽",
    "home-garden":           "🏠",
    "babies-kids-toys":      "🧸",
    "automotive":            "🚗",
    "travel":                "✈️",
    "gifts-flowers":         "🎁",
    "hypermarket-groceries": "🛒",
    "pet-supplies":          "🐾",
}

CATEGORII_LABEL = {
    "fashion":               "Fashion",
    "beauty":                "Frumusete",
    "pharma":                "Farmacie",
    "electronics-itc":       "Electronice",
    "sports-outdoors":       "Sport",
    "home-garden":           "Casa & Gradina",
    "babies-kids-toys":      "Copii",
    "automotive":            "Auto",
    "travel":                "Calatorii",
    "gifts-flowers":         "Cadouri",
    "hypermarket-groceries": "Supermarket",
    "pet-supplies":          "Animale",
}


# ── Font helpers ─────────────────────────────────────────────────────────────
def load_font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    """Incearca sa incarce un font sistem; fallback la default PIL."""
    candidates_bold = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/calibrib.ttf",
    ]
    candidates_reg = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibri.ttf",
    ]
    candidates = candidates_bold if bold else candidates_reg
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


# ── Draw helpers ─────────────────────────────────────────────────────────────
def draw_rounded_rect(draw: ImageDraw.Draw, xy, radius: int,
                      fill=None, outline=None, width: int = 1):
    x1, y1, x2, y2 = xy
    if fill:
        draw.rounded_rectangle([x1, y1, x2, y2], radius=radius, fill=fill,
                                outline=outline, width=width)
    elif outline:
        draw.rounded_rectangle([x1, y1, x2, y2], radius=radius, fill=None,
                                outline=outline, width=width)


def draw_gradient_bg(img: Image.Image, w: int, h: int):
    """Fundal gradient dark navy."""
    draw = ImageDraw.Draw(img)
    for y in range(h):
        t = y / h
        r = int(BG_DARK[0] + (BG_MID[0] - BG_DARK[0]) * min(t * 2, 1))
        g = int(BG_DARK[1] + (BG_MID[1] - BG_DARK[1]) * min(t * 2, 1))
        b = int(BG_DARK[2] + (BG_MID[2] - BG_DARK[2]) * min(t * 2, 1))
        draw.line([(0, y), (w, y)], fill=(r, g, b))


def draw_grid(draw: ImageDraw.Draw, w: int, h: int, step: int = 50):
    """Grid subtil portocaliu."""
    color = (249, 115, 22, 9)  # foarte transparent
    for x in range(0, w, step):
        draw.line([(x, 0), (x, h)], fill=(249//10, 115//10, 22//10))
    for y in range(0, h, step):
        draw.line([(0, y), (w, y)], fill=(249//10, 115//10, 22//10))


def draw_glow(img: Image.Image, cx: int, cy: int, radius: int, alpha: int = 30):
    """Cerc glow portocaliu radial."""
    from PIL import Image as PILImage
    overlay = PILImage.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    steps = 8
    for i in range(steps, 0, -1):
        r = int(radius * i / steps)
        a = int(alpha * (steps - i + 1) / steps)
        d.ellipse([cx - r, cy - r, cx + r, cy + r],
                  fill=(ORANGE[0], ORANGE[1], ORANGE[2], a))
    img.paste(overlay, mask=overlay.split()[3])


def get_best_promo(m: dict) -> dict:
    promotii = [p for p in m.get("promotii", []) if p.get("zile_ramase", -1) >= 0]
    cu_cod = [p for p in promotii if p.get("cod_cupon")]
    return cu_cod[0] if cu_cod else (promotii[0] if promotii else {})


def format_discount_short(m: dict) -> str:
    import re
    promo = get_best_promo(m)
    if promo.get("cod_cupon"):
        cod = promo["cod_cupon"]
        nums = re.findall(r"\d+", promo.get("nume", ""))
        if nums:
            return f"-{nums[0]}%"
        return f"COD"
    c = m.get("comision", "")
    nums = [float(x) for x in re.findall(r"[\d.]+", c)]
    if nums:
        return f"-{max(nums):.0f}%"
    return "OFERTA"


def pick_top(magazine, n=6):
    def has_promo(m):
        return any(p.get("zile_ramase", -1) >= 0 for p in m.get("promotii", []))
    def has_cod(m):
        return any(p.get("cod_cupon") and p.get("zile_ramase", -1) >= 0
                   for p in m.get("promotii", []))
    pool = [m for m in magazine if has_promo(m)]
    cu_cod   = sorted([m for m in pool if has_cod(m)],   key=lambda x: -x.get("scor_final", 0))
    fara_cod = sorted([m for m in pool if not has_cod(m)], key=lambda x: -x.get("scor_final", 0))
    combined = cu_cod[:n]
    if len(combined) < n:
        combined += fara_cod[:n - len(combined)]
    return combined[:n]


# ── Banner 1080x1080 ──────────────────────────────────────────────────────────
def create_square_banner(magazine: list, data_str: str, zi_name: str) -> Image.Image:
    W, H = 1080, 1080
    img = Image.new("RGBA", (W, H), BG_DARK)
    draw_gradient_bg(img, W, H)

    draw = ImageDraw.Draw(img)

    # Grid background subtil
    draw_grid(draw, W, H, 54)

    # Glow decorativ top-right
    draw_glow(img, W + 50, -80, 400, 25)
    # Glow decorativ bottom-left
    draw_glow(img, -60, H + 60, 300, 15)

    # ── Header brand pill ─────────────────────────────────────────────────────
    pill_x, pill_y = 52, 44
    pill_w, pill_h = 200, 38
    draw_rounded_rect(draw, [pill_x, pill_y, pill_x + pill_w, pill_y + pill_h],
                      radius=19,
                      fill=(249, 115, 22, 0),  # transparent fill
                      outline=None)
    # manual semi-transparent fill
    pill_img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    pd = ImageDraw.Draw(pill_img)
    pd.rounded_rectangle([pill_x, pill_y, pill_x + pill_w, pill_y + pill_h],
                          radius=19, fill=(249, 115, 22, 30),
                          outline=(249, 115, 22, 100), width=2)
    img.paste(pill_img, mask=pill_img.split()[3])
    draw = ImageDraw.Draw(img)

    font_pill = load_font(15, bold=True)
    draw.text((pill_x + 26, pill_y + 10), "AmCupon.ro", font=font_pill, fill=ORANGE_DIM)
    draw.ellipse([pill_x + 10, pill_y + 14, pill_x + 18, pill_y + 22], fill=ORANGE)

    # Tag "Verificat zilnic" — dreapta
    tag_text = "Verificat zilnic"
    font_tag = load_font(12, bold=True)
    tag_w = 150
    tag_img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    td = ImageDraw.Draw(tag_img)
    td.rounded_rectangle([W - 52 - tag_w, pill_y, W - 52, pill_y + pill_h],
                          radius=19, fill=(34, 197, 94, 30),
                          outline=(34, 197, 94, 76), width=1)
    img.paste(tag_img, mask=tag_img.split()[3])
    draw = ImageDraw.Draw(img)
    draw.text((W - 52 - tag_w + 18, pill_y + 10), f"✓ {tag_text}",
              font=font_tag, fill=GREEN)

    # ── Hero text ─────────────────────────────────────────────────────────────
    font_h1_big  = load_font(48, bold=True)
    font_h1_norm = load_font(48, bold=False)
    font_sub     = load_font(17)

    hero_y = 110
    draw.text((W // 2, hero_y), "Coduri de reducere", font=font_h1_big,
              fill=WHITE, anchor="mt")
    draw.text((W // 2, hero_y + 56), "verificate zilnic", font=font_h1_big,
              fill=ORANGE, anchor="mt")
    draw.text((W // 2, hero_y + 56 + 60), f"Oferte active la {len(magazine)}+ magazine",
              font=font_sub, fill=GRAY, anchor="mt")

    # ── Cards grid 3x2 ───────────────────────────────────────────────────────
    top6 = pick_top(magazine, n=6)
    card_y_start = 290
    card_w = 300
    card_h = 128
    cols = 3
    gap_x = (W - 52 * 2 - cols * card_w) // (cols - 1)
    gap_y = 14

    for i, m in enumerate(top6):
        col = i % cols
        row = i // cols
        cx = 52 + col * (card_w + gap_x)
        cy = card_y_start + row * (card_h + gap_y)

        promo = get_best_promo(m)
        has_cod = bool(promo.get("cod_cupon"))
        disc_str = format_discount_short(m)

        # Card background
        card_img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        cd = ImageDraw.Draw(card_img)
        border_color = (249, 115, 22, 100) if has_cod else (45, 63, 87, 200)
        bg_fill = (249, 115, 22, 15) if has_cod else (30, 41, 59, 216)
        cd.rounded_rectangle([cx, cy, cx + card_w, cy + card_h],
                               radius=14, fill=bg_fill, outline=border_color, width=1)
        img.paste(card_img, mask=card_img.split()[3])
        draw = ImageDraw.Draw(img)

        # Emoji categorie
        cat_slug = m.get("categorie_slug", "")
        emoji_str = CATEGORII_EMOJI.get(cat_slug, "🛍️")
        font_emoji = load_font(28)
        draw.text((cx + 14, cy + 14), emoji_str, font=font_emoji, fill=WHITE)

        # Nume magazin
        name = m.get("magazin", "").split(".")[0].capitalize()[:18]
        font_name = load_font(14, bold=True)
        draw.text((cx + 54, cy + 14), name, font=font_name, fill=WHITE)

        # Categorie label
        cat_lbl = CATEGORII_LABEL.get(cat_slug, cat_slug.title())[:16]
        font_cat = load_font(11)
        draw.text((cx + 54, cy + 34), cat_lbl, font=font_cat, fill=GRAY_DARK)

        # Discount badge
        badge_x = cx + card_w - 70
        badge_y = cy + 14
        badge_img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        bd = ImageDraw.Draw(badge_img)
        bd.rounded_rectangle([badge_x, badge_y, badge_x + 56, badge_y + 26],
                               radius=13, fill=(249, 115, 22, 255))
        img.paste(badge_img, mask=badge_img.split()[3])
        draw = ImageDraw.Draw(img)
        font_badge = load_font(12, bold=True)
        draw.text((badge_x + 28, badge_y + 5), disc_str,
                  font=font_badge, fill=WHITE, anchor="mt")

        # Cod cupon (daca exista)
        if has_cod:
            cod = promo["cod_cupon"][:14]
            code_img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            kd = ImageDraw.Draw(code_img)
            kd.rounded_rectangle([cx + 14, cy + card_h - 40,
                                   cx + 14 + len(cod) * 9 + 20, cy + card_h - 16],
                                   radius=5, fill=(249, 115, 22, 26),
                                   outline=(249, 115, 22, 76), width=1)
            img.paste(code_img, mask=code_img.split()[3])
            draw = ImageDraw.Draw(img)
            font_cod = load_font(11, bold=True)
            draw.text((cx + 24, cy + card_h - 36), cod,
                      font=font_cod, fill=ORANGE)

    # ── Stats bar ─────────────────────────────────────────────────────────────
    stats_y = card_y_start + 2 * (card_h + gap_y) + 22
    stats_img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(stats_img)
    sd.rounded_rectangle([52, stats_y, W - 52, stats_y + 90],
                          radius=18, fill=(249, 115, 22, 15),
                          outline=(249, 115, 22, 50), width=1)
    img.paste(stats_img, mask=stats_img.split()[3])
    draw = ImageDraw.Draw(img)

    font_val = load_font(24, bold=True)
    font_lbl = load_font(11)
    stats = [
        ("300+", "Magazine"),
        ("100%", "Gratuit"),
        ("Zilnic", "Actualizat"),
    ]
    col_w = (W - 104) // 3
    for i, (val, lbl) in enumerate(stats):
        sx = 52 + i * col_w + col_w // 2
        draw.text((sx, stats_y + 14), val, font=font_val, fill=ORANGE, anchor="mt")
        draw.text((sx, stats_y + 54), lbl, font=font_lbl, fill=GRAY_DARK, anchor="mt")
        if i < 2:  # separator
            draw.line([(52 + (i + 1) * col_w, stats_y + 20),
                       (52 + (i + 1) * col_w, stats_y + 70)],
                      fill=CARD_BORDER, width=1)

    # ── Footer CTA ───────────────────────────────────────────────────────────
    footer_y = stats_y + 110
    cta_img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ctad = ImageDraw.Draw(cta_img)
    cta_w = 320
    cta_h = 52
    cta_x = (W - cta_w) // 2
    ctad.rounded_rectangle([cta_x, footer_y, cta_x + cta_w, footer_y + cta_h],
                             radius=26, fill=(249, 115, 22, 255))
    img.paste(cta_img, mask=cta_img.split()[3])
    draw = ImageDraw.Draw(img)
    font_cta = load_font(17, bold=True)
    draw.text((W // 2, footer_y + 14), "Cauta codul tau pe amcupon.ro",
              font=font_cta, fill=WHITE, anchor="mt")

    # Watermark
    font_wm = load_font(12)
    draw.text((W // 2, H - 22), "amcupon.ro",
              font=font_wm, fill=CARD_BORDER, anchor="mt")

    return img.convert("RGB")


# ── Banner 1080x1920 Story ────────────────────────────────────────────────────
def create_story_banner(magazine: list, data_str: str) -> Image.Image:
    W, H = 1080, 1920
    img = Image.new("RGBA", (W, H), BG_DARK)
    draw_gradient_bg(img, W, H)
    draw = ImageDraw.Draw(img)
    draw_grid(draw, W, H, 60)
    draw_glow(img, W, 0, 500, 20)
    draw_glow(img, 0, H, 400, 15)

    # Brand
    pill_img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    pd = ImageDraw.Draw(pill_img)
    pd.rounded_rectangle([W//2 - 120, 80, W//2 + 120, 126],
                          radius=23, fill=(249, 115, 22, 30),
                          outline=(249, 115, 22, 100), width=2)
    img.paste(pill_img, mask=pill_img.split()[3])
    draw = ImageDraw.Draw(img)
    font_brand = load_font(18, bold=True)
    draw.ellipse([W//2 - 104, 96, W//2 - 88, 112], fill=ORANGE)
    draw.text((W//2 - 70, 88), "AmCupon.ro", font=font_brand, fill=ORANGE_DIM)

    # Hero
    font_big = load_font(64, bold=True)
    font_mid = load_font(22)
    draw.text((W//2, 190), "Coduri de", font=font_big, fill=WHITE, anchor="mt")
    draw.text((W//2, 270), "reducere", font=font_big, fill=ORANGE, anchor="mt")
    draw.text((W//2, 360), "verificate zilnic", font=font_mid, fill=GRAY, anchor="mt")

    # Cards x5
    top5 = pick_top(magazine, n=5)
    card_y = 420
    card_h = 150
    gap = 14

    for m in top5:
        promo = get_best_promo(m)
        has_cod = bool(promo.get("cod_cupon"))
        disc_str = format_discount_short(m)
        cat_slug = m.get("categorie_slug", "")
        emoji_str = CATEGORII_EMOJI.get(cat_slug, "🛍️")
        name = m.get("magazin", "").split(".")[0].capitalize()[:20]

        ci = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        cd = ImageDraw.Draw(ci)
        border_col = (249, 115, 22, 100) if has_cod else (45, 63, 87, 200)
        bg_c = (249, 115, 22, 15) if has_cod else (30, 41, 59, 216)
        cd.rounded_rectangle([52, card_y, W - 52, card_y + card_h],
                               radius=16, fill=bg_c, outline=border_col, width=1)
        img.paste(ci, mask=ci.split()[3])
        draw = ImageDraw.Draw(img)

        font_emo = load_font(36)
        font_nm  = load_font(18, bold=True)
        font_cat2 = load_font(13)
        font_bll = load_font(14, bold=True)

        draw.text((80, card_y + 28), emoji_str, font=font_emo, fill=WHITE)
        draw.text((140, card_y + 24), name, font=font_nm, fill=WHITE)
        cat_lbl = CATEGORII_LABEL.get(cat_slug, cat_slug.title())[:20]
        draw.text((140, card_y + 52), cat_lbl, font=font_cat2, fill=GRAY_DARK)

        # badge
        bx = W - 52 - 80
        bi = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        bd = ImageDraw.Draw(bi)
        bd.rounded_rectangle([bx, card_y + 20, bx + 68, card_y + 48],
                               radius=14, fill=(249, 115, 22, 255))
        img.paste(bi, mask=bi.split()[3])
        draw = ImageDraw.Draw(img)
        draw.text((bx + 34, card_y + 22), disc_str, font=font_bll, fill=WHITE, anchor="mt")

        if has_cod:
            cod = promo["cod_cupon"][:16]
            ki = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            kd = ImageDraw.Draw(ki)
            kd.rounded_rectangle([140, card_y + 80, 140 + len(cod) * 10 + 24, card_y + 110],
                                   radius=6, fill=(249, 115, 22, 26),
                                   outline=(249, 115, 22, 76), width=1)
            img.paste(ki, mask=ki.split()[3])
            draw = ImageDraw.Draw(img)
            draw.text((152, card_y + 84), cod, font=load_font(13, bold=True), fill=ORANGE)

        card_y += card_h + gap

    # CTA
    cta_y = card_y + 30
    cta_i = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ctad = ImageDraw.Draw(cta_i)
    ctad.rounded_rectangle([W//2 - 220, cta_y, W//2 + 220, cta_y + 70],
                             radius=35, fill=(249, 115, 22, 255))
    img.paste(cta_i, mask=cta_i.split()[3])
    draw = ImageDraw.Draw(img)
    draw.text((W//2, cta_y + 18), "Cauta codul tau →",
              font=load_font(20, bold=True), fill=WHITE, anchor="mt")
    draw.text((W//2, cta_y + 50), "amcupon.ro",
              font=load_font(14), fill=GRAY, anchor="mt")

    return img.convert("RGB")


# ── Main ─────────────────────────────────────────────────────────────────────
def main():
    if not OUTPUT_JSON.exists():
        print(f"Fisier lipsa: {OUTPUT_JSON}")
        sys.exit(1)

    with open(OUTPUT_JSON, encoding="utf-8") as f:
        magazine = json.load(f)

    now_ro   = datetime.now(timezone.utc) + timedelta(hours=3)
    data_str = f"{now_ro.day} {LUNI_RO[now_ro.month - 1]} {now_ro.year}"
    zi_name  = ["luni","marti","miercuri","joi","vineri","sambata","duminica"][now_ro.weekday()]

    valide = [
        m for m in magazine
        if m.get("are_promotie") and m.get("promotii")
        and m.get("procent_succes", 0) >= 50
    ]

    print(f"Genereaza banner 1080x1080 ({len(valide)} magazine valide)...")
    sq = create_square_banner(valide, data_str, zi_name)
    sq.save(str(OUT_SQUARE), "PNG", optimize=True)
    print(f"  Salvat: {OUT_SQUARE} ({OUT_SQUARE.stat().st_size // 1024} KB)")

    # Copie in frontend/public/ pentru Vercel
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    sq.save(str(OUT_SQ_PUB), "PNG", optimize=True)
    print(f"  Copiat: {OUT_SQ_PUB}")

    print("Genereaza banner story 1080x1920...")
    st = create_story_banner(valide, data_str)
    st.save(str(OUT_STORY), "PNG", optimize=True)
    print(f"  Salvat: {OUT_STORY} ({OUT_STORY.stat().st_size // 1024} KB)")

    st.save(str(OUT_ST_PUB), "PNG", optimize=True)
    print(f"  Copiat: {OUT_ST_PUB}")

    print("Bannere generate cu succes!")


if __name__ == "__main__":
    main()
