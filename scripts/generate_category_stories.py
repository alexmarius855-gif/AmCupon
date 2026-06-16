"""
Genereaza 10 Story-uri categorii pentru AmCupon.ro
Format: 1080x1920px (9:16 Instagram/Facebook Story)
Output: data/stories/story_01_*.png ... story_10_*.png
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
except ImportError:
    print("pip install Pillow")
    sys.exit(1)

SCRIPT_DIR = Path(__file__).parent
ROOT_DIR   = SCRIPT_DIR.parent
OUT_DIR    = ROOT_DIR / "data" / "stories"
OUT_DIR.mkdir(parents=True, exist_ok=True)

W, H = 1080, 1920

# ── Font paths Windows ────────────────────────────────────────────────────────
FONT_DIR = Path("C:/Windows/Fonts")
def font(name, size):
    candidates = [
        FONT_DIR / name,
        FONT_DIR / "arialbd.ttf",
        FONT_DIR / "arial.ttf",
    ]
    for p in candidates:
        if p.exists():
            try:
                return ImageFont.truetype(str(p), size)
            except Exception:
                continue
    return ImageFont.load_default()

F_LOGO   = font("segoeuib.ttf",  52)
F_TITLE  = font("segoeuib.ttf", 110)
F_SUB    = font("segoeui.ttf",   52)
F_BRANDS = font("segoeui.ttf",   40)
F_CTA    = font("segoeuib.ttf",  54)
F_URL    = font("segoeui.ttf",   38)
F_LABEL  = font("segoeuib.ttf",  34)
F_EMOJI  = font("seguiemj.ttf",  160)  # emoji font; falls back to segoeuib

# ── 10 categorii ─────────────────────────────────────────────────────────────
STORIES = [
    {
        "n": 1, "slug": "top_produse",
        "title": "Top Produse",
        "emoji_char": "\U0001f3c6",   # 🏆
        "emoji_fallback": "TOP",
        "sub1": "Laptop-uri, telefoane",
        "sub2": "aparate foto si electronice",
        "brands": "Samsung  ·  Apple  ·  Asus  ·  Lenovo",
        "c1": (6, 10, 35),    "c2": (90, 55, 5),
        "accent": (255, 195, 40),
        "badge": "BEST DEAL",
    },
    {
        "n": 2, "slug": "gadgets_tech",
        "title": "Gadgets & Tech",
        "emoji_char": "\U0001f4f1",   # 📱
        "emoji_fallback": "TECH",
        "sub1": "Smartwatch-uri, casti",
        "sub2": "drone, accesorii smart",
        "brands": "DJI  ·  JBL  ·  Fitbit  ·  Anker",
        "c1": (4, 6, 40),     "c2": (10, 20, 110),
        "accent": (90, 145, 255),
        "badge": "TECH DEALS",
    },
    {
        "n": 3, "slug": "fashion_haine",
        "title": "Fashion & Haine",
        "emoji_char": "\U0001f457",   # 👗
        "emoji_fallback": "MODE",
        "sub1": "Haine, incaltaminte",
        "sub2": "genti si accesorii",
        "brands": "FashionDays  ·  H&M  ·  Answear",
        "c1": (30, 5, 40),    "c2": (100, 10, 80),
        "accent": (220, 80, 200),
        "badge": "FASHION",
    },
    {
        "n": 4, "slug": "casa_gradina",
        "title": "Casa & Gradina",
        "emoji_char": "\U0001f3e0",   # 🏠
        "emoji_fallback": "CASA",
        "sub1": "Mobila, decoratiuni",
        "sub2": "gradina si bricolaj",
        "brands": "IKEA  ·  Dedeman  ·  Leroy Merlin",
        "c1": (4, 25, 15),    "c2": (10, 80, 40),
        "accent": (50, 210, 100),
        "badge": "HOME",
    },
    {
        "n": 5, "slug": "auto_moto",
        "title": "Auto & Moto",
        "emoji_char": "\U0001f697",   # 🚗
        "emoji_fallback": "AUTO",
        "sub1": "Piese auto, accesorii",
        "sub2": "anvelope si uleiuri",
        "brands": "AutoDoc  ·  eMAG Auto  ·  Vulco",
        "c1": (30, 5, 5),     "c2": (100, 20, 5),
        "accent": (255, 80, 50),
        "badge": "AUTO",
    },
    {
        "n": 6, "slug": "idei_cadouri",
        "title": "Idei Cadouri",
        "emoji_char": "\U0001f381",   # 🎁
        "emoji_fallback": "GIFT",
        "sub1": "Cadouri pentru orice ocazie",
        "sub2": "la cele mai bune preturi",
        "brands": "eMAG  ·  Floria  ·  Vivre  ·  Tiff",
        "c1": (25, 5, 35),    "c2": (110, 15, 60),
        "accent": (240, 100, 180),
        "badge": "CADOURI",
    },
    {
        "n": 7, "slug": "sport_outdoor",
        "title": "Sport & Outdoor",
        "emoji_char": "\U0001f3cb",   # 🏋
        "emoji_fallback": "SPORT",
        "sub1": "Echipamente sport",
        "sub2": "haine si accesorii outdoor",
        "brands": "Decathlon  ·  Hervis  ·  Intersport",
        "c1": (30, 12, 4),    "c2": (120, 55, 5),
        "accent": (255, 140, 30),
        "badge": "SPORT",
    },
    {
        "n": 8, "slug": "beauty",
        "title": "Beauty",
        "emoji_char": "\U0001f484",   # 💄
        "emoji_fallback": "BEAUTY",
        "sub1": "Parfumuri, cosmetice",
        "sub2": "ingrijire si make-up",
        "brands": "Notino  ·  Douglas  ·  Sephora",
        "c1": (35, 5, 25),    "c2": (120, 20, 70),
        "accent": (255, 100, 150),
        "badge": "BEAUTY",
    },
    {
        "n": 9, "slug": "gaming",
        "title": "Jocuri & Gaming",
        "emoji_char": "\U0001f3ae",   # 🎮
        "emoji_fallback": "GAME",
        "sub1": "Console, jocuri PC",
        "sub2": "accesorii gaming",
        "brands": "evoMAG  ·  PC Garage  ·  Altex",
        "c1": (8, 4, 40),     "c2": (50, 10, 110),
        "accent": (140, 80, 255),
        "badge": "GAMING",
    },
    {
        "n": 10, "slug": "travel",
        "title": "Vacante & Travel",
        "emoji_char": "\U0001f6eb",   # 🛫
        "emoji_fallback": "TRAVEL",
        "sub1": "Hoteluri, bilete avion",
        "sub2": "pachete vacanta",
        "brands": "Booking  ·  Airbnb  ·  Trip.com",
        "c1": (4, 20, 45),    "c2": (5, 70, 120),
        "accent": (30, 200, 240),
        "badge": "TRAVEL",
    },
]

# ── Helpers ───────────────────────────────────────────────────────────────────

def v_gradient(w, h, c1, c2):
    img = Image.new("RGB", (w, h))
    draw = ImageDraw.Draw(img)
    for y in range(h):
        t = y / (h - 1)
        r = int(c1[0] + (c2[0] - c1[0]) * t)
        g = int(c1[1] + (c2[1] - c1[1]) * t)
        b = int(c1[2] + (c2[2] - c1[2]) * t)
        draw.line([(0, y), (w, y)], fill=(r, g, b))
    return img

def centered_text(draw, text, y, fnt, color, w=W):
    bbox = draw.textbbox((0, 0), text, font=fnt)
    tw = bbox[2] - bbox[0]
    x = (w - tw) // 2
    draw.text((x, y), text, font=fnt, fill=color)
    return bbox[3] - bbox[1]  # height

def draw_circle_bg(img, cx, cy, r, color, alpha=40):
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(*color, alpha))
    img_rgba = img.convert("RGBA")
    img_rgba = Image.alpha_composite(img_rgba, overlay)
    return img_rgba.convert("RGB")

def draw_pill(draw, x, y, text, fnt, bg, fg):
    bbox = draw.textbbox((0, 0), text, font=fnt)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    pad_x, pad_y = 28, 14
    rw = tw + pad_x * 2
    rh = th + pad_y * 2
    draw.rounded_rectangle([x, y, x + rw, y + rh], radius=rh//2, fill=bg, outline=None)
    draw.text((x + pad_x, y + pad_y), text, font=fnt, fill=fg)
    return rw

def try_emoji(draw, text, x, y, size=160):
    """Tenta emoji font; returneaza True daca a reusit."""
    try:
        efont = ImageFont.truetype(str(FONT_DIR / "seguiemj.ttf"), size)
        draw.text((x, y), text, font=efont, fill=(255, 255, 255, 255), embedded_color=True)
        return True
    except Exception:
        return False

# ── Generator principal ───────────────────────────────────────────────────────

def make_story(s):
    n       = s["n"]
    accent  = s["accent"]
    c1, c2  = s["c1"], s["c2"]

    # 1. Background gradient
    img = v_gradient(W, H, c1, c2)

    # 2. Decorative blur circles
    img = draw_circle_bg(img, W + 100, 300,  700, accent, alpha=35)
    img = draw_circle_bg(img, -150,    1400, 500, accent, alpha=22)
    img = draw_circle_bg(img, W // 2,  900,  350, accent, alpha=18)

    # 3. Top bar: AmCupon.ro
    draw = ImageDraw.Draw(img)

    # Logo pill la top
    LOGO_TEXT = "AmCupon.ro"
    logo_bbox = draw.textbbox((0, 0), LOGO_TEXT, font=F_LOGO)
    lw = logo_bbox[2] - logo_bbox[0]
    lx = (W - lw - 32) // 2
    draw.rounded_rectangle([lx - 20, 70, lx + lw + 20, 70 + 64], radius=32,
                            fill=(*accent, 220), outline=None)
    draw.text((lx, 78), LOGO_TEXT, font=F_LOGO, fill=(0, 0, 0))

    # Tagline sub logo
    TAG = "Reduceri Online Romania"
    centered_text(draw, TAG, 155, F_LABEL, (200, 200, 200))

    # 4. Badge categorie (top-right)
    BADGE = s["badge"]
    badge_bbox = draw.textbbox((0, 0), BADGE, font=F_LABEL)
    bw = badge_bbox[2] - badge_bbox[0]
    bx = W - bw - 60
    draw.rounded_rectangle([bx - 16, 80, bx + bw + 16, 80 + 44], radius=22,
                            fill=(255, 255, 255, 30), outline=(255, 255, 255, 80))
    draw.text((bx, 86), BADGE, font=F_LABEL, fill=(255, 255, 255))

    # 5. Emoji mare in centru
    EMOJI_Y = 340
    EMOJI_SIZE = 180
    # Incearca emoji font, altfel text fallback
    efont_ok = False
    try:
        efont = ImageFont.truetype(str(FONT_DIR / "seguiemj.ttf"), EMOJI_SIZE)
        bbox_e = draw.textbbox((0, 0), s["emoji_char"], font=efont)
        ew = bbox_e[2] - bbox_e[0]
        ex = (W - ew) // 2
        draw.text((ex, EMOJI_Y), s["emoji_char"], font=efont,
                  fill=(255, 255, 255), embedded_color=True)
        efont_ok = True
    except Exception:
        pass

    if not efont_ok:
        # Fallback: cerc colorat cu text
        draw.ellipse([(W//2 - 110, EMOJI_Y - 20),
                      (W//2 + 110, EMOJI_Y + 200)],
                     fill=(*accent, 200))
        fb_bbox = draw.textbbox((0, 0), s["emoji_fallback"], font=F_CTA)
        fw = fb_bbox[2] - fb_bbox[0]
        fh = fb_bbox[3] - fb_bbox[1]
        draw.text(((W - fw) // 2, EMOJI_Y + 80 - fh // 2),
                  s["emoji_fallback"], font=F_CTA, fill=(0, 0, 0))

    # 6. Titlu categorie
    TITLE_Y = EMOJI_Y + EMOJI_SIZE + 60
    title_h = centered_text(draw, s["title"], TITLE_Y, F_TITLE, (255, 255, 255))

    # 7. Linie accent sub titlu
    LINE_Y = TITLE_Y + title_h + 20
    line_w = 120
    draw.rectangle([(W//2 - line_w, LINE_Y), (W//2 + line_w, LINE_Y + 5)],
                   fill=accent)

    # 8. Subtitlu (2 randuri)
    SUB_Y = LINE_Y + 30
    sub1_h = centered_text(draw, s["sub1"], SUB_Y, F_SUB, (210, 210, 210))
    centered_text(draw, s["sub2"], SUB_Y + sub1_h + 8, F_SUB, (170, 170, 170))

    # 9. Brand pills
    BRANDS_Y = SUB_Y + sub1_h + 8 + 56 + 50
    brand_parts = [b.strip() for b in s["brands"].split("·") if b.strip()]
    total_bw = 0
    pill_sizes = []
    for b in brand_parts:
        bb = draw.textbbox((0, 0), b, font=F_BRANDS)
        pw = bb[2] - bb[0] + 56
        pill_sizes.append(pw)
        total_bw += pw
    gap = 20
    total_bw += gap * (len(brand_parts) - 1)
    bx_start = (W - total_bw) // 2
    cx = bx_start
    for i, b in enumerate(brand_parts):
        draw_pill(draw, cx, BRANDS_Y, b, F_BRANDS,
                  bg=(*accent, 35),
                  fg=(255, 255, 255))
        cx += pill_sizes[i] + gap

    # 10. Separator
    SEP_Y = BRANDS_Y + 80 + 50
    draw.rectangle([(80, SEP_Y), (W - 80, SEP_Y + 1)],
                   fill=(255, 255, 255, 40))

    # 11. CTA
    CTA_Y = SEP_Y + 40
    CTA_TEXT = "Descopera ofertele  →"
    cta_bbox = draw.textbbox((0, 0), CTA_TEXT, font=F_CTA)
    cw = cta_bbox[2] - cta_bbox[0]
    ch = cta_bbox[3] - cta_bbox[1]
    cx_btn = (W - cw - 80) // 2
    draw.rounded_rectangle(
        [cx_btn - 10, CTA_Y - 16, cx_btn + cw + 90, CTA_Y + ch + 16],
        radius=50,
        fill=accent,
        outline=None,
    )
    draw.text((cx_btn + 30, CTA_Y), CTA_TEXT, font=F_CTA, fill=(0, 0, 0))

    # 12. URL la baza
    URL_Y = H - 120
    draw.rectangle([(0, URL_Y - 30), (W, H)], fill=(0, 0, 0, 100))
    centered_text(draw, "amcupon.ro", URL_Y, F_URL, (180, 180, 180))

    # Numar story (stanga jos)
    draw.text((60, URL_Y + 2), f"{n:02d}/10", font=F_LABEL, fill=(120, 120, 120))

    # 13. Salveaza
    out_path = OUT_DIR / f"story_{n:02d}_{s['slug']}.png"
    img.save(str(out_path), "PNG")
    print(f"  [OK] {out_path.name}")

# ── Main ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print(f"Generez {len(STORIES)} story-uri in {OUT_DIR}...\n")
    for s in STORIES:
        make_story(s)
    print(f"\nGata! {len(STORIES)} imagini generate.")
    print(f"Gasesti fisierele in: {OUT_DIR}")
