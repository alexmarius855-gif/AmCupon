"""
Genereaza og-image.png (1200x630) pentru AmCupon.ro.
Fundal negru (identic cu fundalul logo-ului, compositing fara cusatura vizibila),
logo "AC" (logo-ac.png, generat 20.06.2026) centrat sus, tipografie mare alba dedesubt.
"""
import os
from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BG = (1, 1, 14)           # identic cu fundalul logo-ac.png — compositing fara cusatura
WHITE = (255, 255, 255)
SLATE_300 = (203, 213, 225)
SLATE_500 = (100, 116, 139)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LOGO_PATH = os.path.join(SCRIPT_DIR, "..", "frontend", "public", "logo-ac.png")

FONT_DIR = r"C:\Users\alexm\AppData\Roaming\Claude\local-agent-mode-sessions\skills-plugin\38d06ee5-ab22-43f0-91f5-1fa55304c8ba\465f9716-bb93-418b-a55a-b2d8fb4b6a0a\skills\canvas-design\canvas-fonts"
FONT_BOLD = FONT_DIR + r"\Outfit-Bold.ttf"
FONT_REGULAR = FONT_DIR + r"\Outfit-Regular.ttf"

img = Image.new("RGB", (W, H), BG)

# ── Logo "AC" centrat sus ──
logo = Image.open(LOGO_PATH).convert("RGB")
logo_h = 280
logo_w = int(logo.width * (logo_h / logo.height))
logo = logo.resize((logo_w, logo_h), Image.LANCZOS)
logo_x = (W - logo_w) // 2
logo_y = 56
img.paste(logo, (logo_x, logo_y))

draw = ImageDraw.Draw(img)

def text_w(font, s):
    bbox = draw.textbbox((0, 0), s, font=font)
    return bbox[2] - bbox[0], bbox[3] - bbox[1], bbox[1]

# ── Titlu principal "AmCupon.ro" ──
title_font = ImageFont.truetype(FONT_BOLD, 76)
title = "AmCupon.ro"
tw, th, ty_off = text_w(title_font, title)
tx = (W - tw) / 2
ty = logo_y + logo_h + 30
draw.text((tx, ty), title, font=title_font, fill=WHITE)

# ── Tagline ──
tag_font = ImageFont.truetype(FONT_REGULAR, 30)
tagline = "Coduri de reducere verificate zilnic"
tw2, th2, ty_off2 = text_w(tag_font, tagline)
tx2 = (W - tw2) / 2
ty2 = ty + th + 28
draw.text((tx2, ty2), tagline, font=tag_font, fill=SLATE_300)

# ── Linie discreta jos ──
small_font = ImageFont.truetype(FONT_REGULAR, 20)
small = "1000+ magazine partenere"
tw3, th3, ty_off3 = text_w(small_font, small)
tx3 = (W - tw3) / 2
ty3 = H - 56
draw.text((tx3, ty3), small, font=small_font, fill=SLATE_500)

out_path = os.path.join(SCRIPT_DIR, "..", "frontend", "public", "og-image.png")
img.save(out_path, "PNG")
print("Salvat:", out_path, "|", img.size)
