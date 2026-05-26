"""
Genereaza icoanele PNG pentru extensia Chrome AmCupon.
Ruleaza o singura data: python generate_icons.py

Necesita: pip install Pillow
"""

import os
import math

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Instaleaza Pillow: pip install Pillow")
    raise

ICONS_DIR = os.path.join(os.path.dirname(__file__), "icons")
os.makedirs(ICONS_DIR, exist_ok=True)

# Culori brand AmCupon
BG_DARK   = (15, 23, 42)    # slate-950  #0f172a
EMERALD   = (16, 185, 129)  # emerald-500 #10b981
WHITE     = (255, 255, 255)


def make_icon(size: int) -> Image.Image:
    img  = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Fundal rotunjit
    radius = size // 4
    draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=BG_DARK)

    # Litera "A" in emerald, centrata
    font_size = int(size * 0.58)
    try:
        font = ImageFont.truetype("arial.ttf", font_size)
    except IOError:
        try:
            font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", font_size)
        except IOError:
            font = ImageFont.load_default()

    text = "A"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw   = bbox[2] - bbox[0]
    th   = bbox[3] - bbox[1]
    tx   = (size - tw) // 2 - bbox[0]
    ty   = (size - th) // 2 - bbox[1] - size // 16  # mic offset vizual

    draw.text((tx, ty), text, fill=EMERALD, font=font)

    # Punct mic verde jos-dreapta (indicator "live")
    if size >= 48:
        dot_r = max(3, size // 10)
        dot_x = size - dot_r - size // 12
        dot_y = size - dot_r - size // 12
        draw.ellipse(
            [dot_x - dot_r, dot_y - dot_r, dot_x + dot_r, dot_y + dot_r],
            fill=(34, 197, 94),  # green-500
        )

    return img


for sz in [16, 48, 128]:
    icon = make_icon(sz)
    out  = os.path.join(ICONS_DIR, f"icon{sz}.png")
    icon.save(out, "PNG")
    print(f"  Generat: icons/icon{sz}.png ({sz}x{sz}px)")

print("\nIconi gata! Poti incarca extensia in Chrome.")
