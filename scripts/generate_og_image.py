"""
Genereaza og-image.png (1200x630) pentru AmCupon.ro - "Quiet Authority" design philosophy.
Fundal aproape negru, un singur bloom radial indigo->cyan, tipografie mare alba centrata.
"""
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1200, 630
BG = (2, 6, 23)          # slate-950
INDIGO = (99, 102, 241)  # indigo-500
CYAN = (34, 211, 238)    # cyan-400
WHITE = (255, 255, 255)
SLATE_300 = (203, 213, 225)
SLATE_500 = (100, 116, 139)

FONT_DIR = r"C:\Users\alexm\AppData\Roaming\Claude\local-agent-mode-sessions\skills-plugin\38d06ee5-ab22-43f0-91f5-1fa55304c8ba\465f9716-bb93-418b-a55a-b2d8fb4b6a0a\skills\canvas-design\canvas-fonts"
FONT_BOLD = FONT_DIR + r"\Outfit-Bold.ttf"
FONT_REGULAR = FONT_DIR + r"\Outfit-Regular.ttf"

img = Image.new("RGB", (W, H), BG)

# ── Bloom radial unic, indigo->cyan, centrat optic (putin deasupra centrului geometric) ──
bloom = Image.new("RGB", (W, H), BG)
bpix = bloom.load()
cx, cy = W * 0.5, H * 0.42
max_r = 520
for y in range(0, H, 2):
    for x in range(0, W, 2):
        d = math.hypot(x - cx, y - cy) / max_r
        if d < 1.4:
            t = max(0.0, 1.0 - d)
            t = t ** 1.6
            mix_t = (math.sin(math.atan2(y - cy, x - cx)) + 1) / 2
            r = INDIGO[0] + (CYAN[0] - INDIGO[0]) * mix_t
            g = INDIGO[1] + (CYAN[1] - INDIGO[1]) * mix_t
            b = INDIGO[2] + (CYAN[2] - INDIGO[2]) * mix_t
            nr = int(BG[0] + (r - BG[0]) * t * 0.55)
            ng = int(BG[1] + (g - BG[1]) * t * 0.55)
            nb = int(BG[2] + (b - BG[2]) * t * 0.55)
            for yy in range(y, min(y + 2, H)):
                for xx in range(x, min(x + 2, W)):
                    bpix[xx, yy] = (nr, ng, nb)

bloom = bloom.filter(ImageFilter.GaussianBlur(radius=60))
img = Image.blend(img, bloom, 1.0)

draw = ImageDraw.Draw(img)

def text_w(font, s):
    bbox = draw.textbbox((0, 0), s, font=font)
    return bbox[2] - bbox[0], bbox[3] - bbox[1], bbox[1]

# ── Titlu principal "AmCupon.ro" ──
title_font = ImageFont.truetype(FONT_BOLD, 118)
title = "AmCupon.ro"
tw, th, ty_off = text_w(title_font, title)
tx = (W - tw) / 2
ty = H * 0.40 - th / 2 - ty_off
draw.text((tx, ty), title, font=title_font, fill=WHITE)

# ── Tagline ──
tag_font = ImageFont.truetype(FONT_REGULAR, 34)
tagline = "Coduri de reducere verificate zilnic"
tw2, th2, ty_off2 = text_w(tag_font, tagline)
tx2 = (W - tw2) / 2
ty2 = ty + th + 38
draw.text((tx2, ty2), tagline, font=tag_font, fill=SLATE_300)

# ── Linie discreta jos ──
small_font = ImageFont.truetype(FONT_REGULAR, 22)
small = "370+ magazine partenere"
tw3, th3, ty_off3 = text_w(small_font, small)
tx3 = (W - tw3) / 2
ty3 = H - 70
draw.text((tx3, ty3), small, font=small_font, fill=SLATE_500)

out_path = r"C:\Users\alexm\Projects\afiliere-site\frontend\public\og-image.png"
img.save(out_path, "PNG")
print("Salvat:", out_path, "|", img.size)
