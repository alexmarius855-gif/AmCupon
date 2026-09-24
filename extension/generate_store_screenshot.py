#!/usr/bin/env python3
"""
Screenshot 1280x800 pentru listing-ul Chrome Web Store — cerinta obligatorie
la trimiterea spre review. Reda fidel popup-ul extensiei (header dark, site
detectat, card cupon cu cod + buton copiere), pe brandul indigo actual,
asezat pe un fundal de marketing curat.

Output: extension/store-assets/screenshot-1280x800.png
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

OUT_DIR = Path(__file__).parent / "store-assets"
OUT_DIR.mkdir(exist_ok=True)

W, H = 1280, 800
BG = (2, 6, 23)
INDIGO = (99, 102, 241)
INDIGO_DK = (79, 70, 229)
CYAN = (34, 211, 238)
WHITE = (248, 250, 252)
GRAY = (148, 163, 184)
SLATE9 = (15, 23, 42)
SLATE8 = (30, 41, 59)
BORDER = (51, 65, 85)


def font(size, bold=False):
    import os
    for p in (["C:/Windows/Fonts/segoeuib.ttf", "C:/Windows/Fonts/arialbd.ttf"] if bold
              else ["C:/Windows/Fonts/segoeui.ttf", "C:/Windows/Fonts/arial.ttf"]):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def glow(img, cx, cy, r, color, alpha=40):
    ov = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    for i in range(10, 0, -1):
        rr = int(r * i / 10)
        a = int(alpha * (11 - i) / 10)
        d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=(*color, a))
    img.paste(ov, mask=ov.split()[3])


img = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(img)
for x in range(0, W, 56):
    draw.line([(x, 0), (x, H)], fill=(10, 16, 32))
for y in range(0, H, 56):
    draw.line([(0, y), (W, y)], fill=(10, 16, 32))
glow(img, W - 180, 100, 420, INDIGO, 45)
glow(img, 120, H - 80, 300, CYAN, 22)
draw = ImageDraw.Draw(img)

# ── Stanga: mesaj marketing ──
draw.rounded_rectangle([70, 90, 70 + 66, 90 + 46], radius=12, fill=INDIGO)
draw.text((70 + 14, 90 + 8), "Am", font=font(24, True), fill=WHITE)
draw.text((150, 96), "Cupon.ro", font=font(26, True), fill=WHITE)

# 24.09.2026: textele din 03.07 promiteau „automat, la checkout" (extensia nu aplica niciun cod),
# „Verificat zilnic" (nu testam codurile in cos) si „1000+ magazine partenere", pe un exemplu cu
# coduri inventate pe emag.ro, care n-are program de afiliere la noi. Acum: exemplu REAL din
# extensie.json, din ziua capturii, si doar promisiuni pe care extensia le tine.
draw.text((70, 200), "Ofertele active,", font=font(52, True), fill=WHITE)
draw.text((70, 265), "pe magazinul deschis", font=font(52, True), fill=(129, 140, 248))
draw.text((70, 360), "Apeși pe iconiță și vezi ofertele și codurile active", font=font(24), fill=GRAY)
draw.text((70, 395), "din rețelele de afiliere. Codul se copiază cu un clic.", font=font(24), fill=GRAY)

for i, t in enumerate(["Actualizate de trei ori pe zi", "Fără ofertă? Îți spune, nu te trimite nicăieri",
                       "Gratuit. Nu urmărim navigarea"]):
    yy = 470 + i * 46
    draw.ellipse([70, yy + 4, 70 + 18, yy + 22], fill=CYAN)
    draw.text((102, yy), t, font=font(22), fill=WHITE)

# ── Dreapta: popup-ul (mockup fidel structurii din popup.html) ──
px, py, pw = 760, 120, 420
ph = 560
draw.rounded_rectangle([px - 6, py - 6, px + pw + 6, py + ph + 6], radius=22, fill=(0, 0, 0))
draw.rounded_rectangle([px, py, px + pw, py + ph], radius=18, fill=(249, 250, 251))

# header dark
draw.rounded_rectangle([px, py, px + pw, py + 64], radius=18, fill=SLATE9)
draw.rectangle([px, py + 32, px + pw, py + 64], fill=SLATE9)
draw.text((px + 20, py + 18), "Am", font=font(22, True), fill=(129, 140, 248))
b = draw.textbbox((0, 0), "Am", font=font(22, True))
draw.text((px + 20 + b[2] - b[0] + 2, py + 18), "Cupon", font=font(22, True), fill=WHITE)

# site bar
draw.rectangle([px, py + 64, px + pw, py + 96], fill=SLATE8)
draw.text((px + 20, py + 71), "Site:  jollymag.ro", font=font(15), fill=(226, 232, 240))

# magazinul si oferta — exemplu real din extensie.json, 24.09.2026
draw.text((px + 20, py + 112), "Jollymag", font=font(20, True), fill=(17, 24, 39))
draw.text((px + 20, py + 142), "O OFERTĂ ACTIVĂ", font=font(13, True), fill=(107, 114, 128))
cy1 = py + 168
draw.rounded_rectangle([px + 16, cy1, px + pw - 16, cy1 + 212], radius=12, fill=WHITE, outline=(229, 231, 235), width=2)
draw.text((px + 32, cy1 + 14), "Reducere 10% la tot coșul", font=font(19, True), fill=(17, 24, 39))
draw.text((px + 32, cy1 + 44), "Expiră pe 30.12.2026", font=font(15), fill=(107, 114, 128))
draw.rounded_rectangle([px + 32, cy1 + 76, px + 250, cy1 + 116], radius=8, outline=(22, 163, 74), width=2)
draw.text((px + 52, cy1 + 84), "JOLLY10", font=font(19, True), fill=(21, 128, 61))
draw.rounded_rectangle([px + 262, cy1 + 76, px + pw - 32, cy1 + 116], radius=8, fill=(22, 163, 74))
draw.text((px + 282, cy1 + 84), "Copiază", font=font(17, True), fill=WHITE)
draw.rounded_rectangle([px + 32, cy1 + 132, px + pw - 32, cy1 + 176], radius=8, fill=INDIGO)
draw.text((px + 92, cy1 + 142), "Mergi la magazin cu codul", font=font(17, True), fill=WHITE)

# nota de afiliere, ca in popup-ul real
for i, rand in enumerate(["Butoanele sunt linkuri de afiliere: dacă cumperi,",
                          "AmCupon.ro primește un comision de la magazin,",
                          "fără niciun cost în plus pentru tine."]):
    draw.text((px + 20, py + 400 + i * 20), rand, font=font(13), fill=(107, 114, 128))

# footer popup
draw.text((px + 20, py + ph - 42), "Toate ofertele Jollymag pe AmCupon.ro", font=font(14), fill=(79, 70, 229))

out = OUT_DIR / "screenshot-1280x800.png"
img.save(out, "PNG", optimize=True)
print(f"Salvat: {out} ({img.size[0]}x{img.size[1]})")
