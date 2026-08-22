#!/usr/bin/env python3
"""
Imagine de articol pentru directoare (linkpro.ro si similare).

De ce exista: formularele de submisie cer o imagine (linkpro.ro: max 3MB) si fara
ea nu poti trimite articolul. O poza de stock ar fi fost cea mai usoara varianta si
cea mai proasta — articolul se sprijina pe date proprii, deci imaginea trebuie sa
arate exact cifra din articol, nu un teanc de cupoane generice.

Cifrele NU sunt scrise de mana aici: se citesc din `frontend/public/studiu-cupoane.json`,
acelasi fisier care alimenteaza pagina publica de studiu. Daca datele se schimba,
rulezi din nou si imaginea spune adevarul actual. O imagine cu o cifra invechita e
exact genul de detaliu care demonteaza un articol construit pe credibilitate.

    python scripts/generate_imagine_articol.py

Iese in `data/imagini-articol/studiu-coduri-reducere.png` (gitignorat — e un livrabil
pentru submisie manuala, nu un asset al site-ului).
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
STUDIU = ROOT / "frontend" / "public" / "studiu-cupoane.json"
IESIRE = ROOT / "data" / "imagini-articol" / "studiu-coduri-reducere.png"

# Paleta site-ului (CLAUDE.md — tema dark/lime din 11.08.2026).
FUNDAL = (6, 8, 11)
CARD = (20, 24, 28)
BORDER = (31, 35, 41)
ALB = (255, 255, 255)
GRI = (147, 153, 160)
GRI_DESCHIS = (201, 206, 213)
LIME = (221, 249, 60)
PE_LIME = (12, 16, 0)

L, H = 1200, 630

CAI_BOLD = [
    "C:/Windows/Fonts/arialbd.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
]
CAI_REG = [
    "C:/Windows/Fonts/arial.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
]


def font(cai: list[str], marime: int) -> ImageFont.FreeTypeFont:
    for c in cai:
        try:
            return ImageFont.truetype(c, marime)
        except OSError:
            continue
    return ImageFont.load_default()


def latime(d: ImageDraw.ImageDraw, text: str, f) -> int:
    return int(d.textbbox((0, 0), text, font=f)[2])


def main() -> int:
    if not STUDIU.exists():
        print(f"Lipseste {STUDIU} — ruleaza intai generate_studiu_cupoane.py")
        return 1
    s = json.loads(STUDIU.read_text(encoding="utf-8"))

    total = s["total_magazine"]
    cu_cod = s["cu_cod_real"]
    proc_cod = s["procent_cu_cod"]
    cu_promo = s["cu_promotie"]
    proc_promo = s["procent_cu_promotie"]

    img = Image.new("RGB", (L, H), FUNDAL)
    d = ImageDraw.Draw(img)

    # Halou discret lime in coltul din dreapta-sus, ca pe site.
    for r in range(420, 0, -14):
        a = int(16 * (1 - r / 420))
        d.ellipse([L - 240 - r, -180 - r, L - 240 + r, -180 + r],
                  fill=(FUNDAL[0] + a, FUNDAL[1] + a + 2, FUNDAL[2]))

    f_eticheta = font(CAI_BOLD, 22)
    f_titlu = font(CAI_BOLD, 46)
    f_cifra = font(CAI_BOLD, 150)
    f_sub = font(CAI_REG, 27)
    f_mic = font(CAI_REG, 21)
    f_marca = font(CAI_BOLD, 26)

    # Eticheta de sus
    d.text((70, 62), "STUDIU AMCUPON.RO", font=f_eticheta, fill=LIME)

    # Titlu pe doua randuri (scris explicit, nu wrap automat — controlam ruperea)
    d.text((70, 108), "Cate magazine online din Romania", font=f_titlu, fill=ALB)
    d.text((70, 162), "au un cod de reducere real?", font=f_titlu, fill=ALB)

    # Cifra centrala
    cifra = f"{proc_cod}%".replace(".", ",")
    d.text((70, 232), cifra, font=f_cifra, fill=LIME)

    w_cifra = latime(d, cifra, f_cifra)
    x_text = 70 + w_cifra + 42

    d.text((x_text, 286), f"{cu_cod} din {total} magazine", font=f_sub, fill=GRI_DESCHIS)
    d.text((x_text, 324), "monitorizate zilnic", font=f_sub, fill=GRI)

    # Linia de context de jos, in card
    y = 452
    d.rounded_rectangle([70, y, L - 70, y + 92], radius=12, fill=CARD, outline=BORDER, width=1)
    # Separatorul zecimal romanesc e VIRGULA. Cifra mare de sus era deja formatata
    # asa; asta nu era, deci pe aceeasi imagine aparea si "1,6%" si "8.1%".
    proc_promo_ro = str(proc_promo).replace(".", ",")
    d.text((100, y + 22),
           f"Alte {cu_promo} magazine ({proc_promo_ro}%) au reducere directa in cos, fara cod.",
           font=f_mic, fill=GRI_DESCHIS)
    d.text((100, y + 52),
           "Restul nu au nicio promotie activa. Date actualizate de trei ori pe zi.",
           font=f_mic, fill=GRI)

    # Marca, jos-dreapta
    marca = "amcupon.ro"
    w = latime(d, marca, f_marca)
    d.text((L - 70 - w, H - 58), marca, font=f_marca, fill=LIME)

    IESIRE.parent.mkdir(parents=True, exist_ok=True)
    # Paleta adaptiva — acelasi motiv ca la social_content_factory: fisier mic,
    # fara banding vizibil pe halou. Limita formularului e 3MB; iesim mult sub.
    img.convert("P", palette=Image.ADAPTIVE, colors=128).save(IESIRE, optimize=True)

    kb = IESIRE.stat().st_size / 1024
    print(f"  {IESIRE}")
    print(f"  {L}x{H} · {kb:.0f} KB (limita formularului: 3072 KB)")
    print(f"  cifra afisata: {cifra} ({cu_cod}/{total}) — citita din studiu, nu scrisa de mana")
    return 0


if __name__ == "__main__":
    sys.exit(main())
