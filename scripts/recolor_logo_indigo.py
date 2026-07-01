#!/usr/bin/env python3
"""
Recoloreaza logo-ac.png din gradient violet->portocaliu in indigo->cyan,
pastrand forma exacta (shape/textura/stele), doar remapand nuanta (hue) prin HSV.
Background aproape negru (very low value) ramane neschimbat.

Ruleaza o singura data, apoi regenereaza favicon-urile + og-image din noul fisier.
"""
import colorsys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).parent.parent
SRC = ROOT / "frontend" / "public" / "logo-ac.png"


def remap_hue(h_deg: float) -> float:
    h = h_deg % 360
    if 200 <= h <= 345:
        # violet/purple/magenta (partea "A") -> banda indigo
        t = (h - 200) / (345 - 200)
        return 230 + t * 18  # 230..248
    else:
        # portocaliu/rosu/galben (partea "C") -> banda cyan
        hh = (h - 345) % 360  # 0..85 acoperind 345->360->0->70
        t = min(hh / 85, 1.0)
        return 178 + t * 20  # 178..198


def recolor(path: Path):
    img = Image.open(path).convert("RGB")
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            if r + g + b < 30:  # fundal aproape negru — neschimbat
                continue
            hh, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            new_h = remap_hue(hh * 360) / 360
            nr, ng, nb = colorsys.hsv_to_rgb(new_h, s, v)
            px[x, y] = (round(nr * 255), round(ng * 255), round(nb * 255))
    return img


if __name__ == "__main__":
    out = recolor(SRC)
    out.save(SRC, "PNG")
    print(f"Recolorat: {SRC}")
