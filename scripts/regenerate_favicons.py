#!/usr/bin/env python3
"""
Regenereaza icon-192.png, icon-512.png, icon-maskable-512.png din logo-ac.png
(dupa recolorare indigo/cyan). Ruleaza o singura data, manual.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).parent.parent
PUBLIC = ROOT / "frontend" / "public"
SRC = PUBLIC / "logo-ac.png"
BG = (1, 0, 14)

img = Image.open(SRC).convert("RGB")

# icon-192 / icon-512: resize direct (sursa deja are padding potrivit)
img.resize((192, 192), Image.LANCZOS).save(PUBLIC / "icon-192.png", "PNG")
img.resize((512, 512), Image.LANCZOS).save(PUBLIC / "icon-512.png", "PNG")

# icon-maskable-512: safe zone — logo la ~65% din canvas, centrat pe fundal
canvas_size = 512
logo_size = int(canvas_size * 0.65)
logo_resized = img.resize((logo_size, logo_size), Image.LANCZOS)
canvas = Image.new("RGB", (canvas_size, canvas_size), BG)
offset = ((canvas_size - logo_size) // 2, (canvas_size - logo_size) // 2)
canvas.paste(logo_resized, offset)
canvas.save(PUBLIC / "icon-maskable-512.png", "PNG")

print("Regenerat: icon-192.png, icon-512.png, icon-maskable-512.png")
