#!/usr/bin/env python3
"""
Covere EDITORIALE per-articol pentru Revista AmCupon — 1200x630, pe brand
(mesh indigo/cyan pe slate, tipografie curata cu titlul REAL al articolului +
accent de culoare pe categorie). Inlocuieste logo-urile 2Performant blurate.

- Citeste frontend/public/blog-posts.json
- Genereaza frontend/public/blog-covers/{slug}.png pentru fiecare articol
- Actualizeaza campul "cover" din blog-posts.json sa arate spre coperta generata

Ruleaza dupa generate_blog.py (care pune deja cover=/blog-covers/{slug}.png).
Idempotent: poate rula de cate ori vrei.
"""
import sys, json, os, re
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).parent.parent
POSTS = ROOT / "frontend" / "public" / "blog-posts.json"
OUT_DIR = ROOT / "frontend" / "public" / "blog-covers"
OUT_DIR.mkdir(parents=True, exist_ok=True)

W, H = 1200, 630
BG = (2, 6, 23)            # slate-950
WHITE = (248, 250, 252)
GRAY = (148, 163, 184)
INDIGO = (99, 102, 241)
INDIGO_LT = (129, 140, 248)
CYAN = (34, 211, 238)

# Paleta accent — DOAR tonuri reci (indigo/cyan/violet/albastru/teal). Fara orange/rosu.
ACCENTS = {
    "Ghiduri":          ((129, 140, 248), (99, 102, 241)),
    "Electronice":      ((56, 189, 248),  (14, 165, 233)),   # sky
    "Fashion":          ((167, 139, 250), (139, 92, 246)),   # violet
    "Casa & Gradina":   ((45, 212, 191),  (20, 184, 166)),   # teal
    "Frumusete":        ((129, 140, 248), (129, 140, 248)),  # indigo-lt (fara roz)
    "Sport":            ((34, 211, 238),  (6, 182, 212)),    # cyan
    "Sanatate":         ((94, 234, 212),  (45, 212, 191)),   # aqua
    "Copii & Jucarii":  ((125, 211, 252), (56, 189, 248)),   # light blue
    "Carti":            ((165, 180, 252), (129, 140, 248)),  # indigo pastel
    "Calatorie":        ((34, 211, 238),  (34, 211, 238)),   # cyan
    "Auto-Moto":        ((148, 163, 184), (100, 116, 139)),  # slate
    "Animale":          ((94, 234, 212),  (45, 212, 191)),
    "Tehnologie":       ((129, 140, 248), (99, 102, 241)),
}
DEFAULT_ACCENT = ((129, 140, 248), (99, 102, 241))

# Mapare categorie brut -> macro (aliniat cu blog/page.tsx)
CATEG_MAP = {
    "Ghiduri":"Ghiduri","Ghid":"Ghiduri",
    "Electronice":"Electronice","Electronics IT&C":"Electronice","Electronice IT&C":"Electronice",
    "Electronice & Gadgeturi":"Electronice","Periferice Gaming":"Electronice","Gaming":"Electronice",
    "Laptopuri & PC":"Electronice","Online Mall":"Electronice","Gadgets":"Electronice",
    "Fashion":"Fashion","Fashion & General":"Fashion","Fashion Feminin":"Fashion","Incaltaminte":"Fashion",
    "Home & Garden":"Casa & Gradina","Casa & Gradina":"Casa & Gradina","Casa":"Casa & Gradina","Electrocasnice":"Casa & Gradina",
    "Beauty":"Frumusete","Frumusete":"Frumusete","Jewelry":"Frumusete",
    "Sport":"Sport","Sports & outdoors":"Sport","Sport & Outdoor":"Sport","Fitness & Sport":"Sport",
    "Sanatate":"Sanatate","Farmacie":"Sanatate","Pharma":"Sanatate","Health & Personal care":"Sanatate",
    "Copii":"Copii & Jucarii","Babies Kids & Toys":"Copii & Jucarii","Copii si Jucarii":"Copii & Jucarii",
    "Carti":"Carti","Books":"Carti",
    "Calatorie":"Calatorie","Transport & Calatorii":"Calatorie","Turism & Activitati":"Calatorie","eSIM Calatorii":"Calatorie",
    "Automotive":"Auto-Moto","Auto-Moto":"Auto-Moto","Auto":"Auto-Moto",
    "Animale":"Animale","Pet supplies":"Animale",
    "Hosting":"Tehnologie","Software & VPN":"Tehnologie","VPN":"Tehnologie","Video & AI Tools":"Tehnologie",
    "Smart Home":"Tehnologie","Domenii Web":"Tehnologie",
}


def macro(cat: str) -> str:
    return CATEG_MAP.get(cat, "Ghiduri")


def load_font(size, bold=False):
    fonts = (["C:/Windows/Fonts/segoeuib.ttf", "C:/Windows/Fonts/arialbd.ttf",
              "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
              "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"] if bold else
             ["C:/Windows/Fonts/segoeui.ttf", "C:/Windows/Fonts/arial.ttf",
              "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
              "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"])
    for p in fonts:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                continue
    return ImageFont.load_default()


def soft_glow(base, cx, cy, radius, color, peak=120):
    """Glow radial catifelat: ellipse concentrice + blur. peak = alpha in centru."""
    ov = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    steps = 26
    for i in range(steps, 0, -1):
        r = int(radius * i / steps)
        a = int(peak * ((steps - i + 1) / steps) ** 2)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(*color, a))
    ov = ov.filter(ImageFilter.GaussianBlur(24))
    base.alpha_composite(ov)


def clean_title(title: str) -> str:
    t = re.split(r"\s*[|｜]\s*", title)[0].strip()      # scoate " | AmCupon.ro"
    t = re.sub(r"\s+", " ", t)
    return t


def wrap(draw, text, font, max_w):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        test = (cur + " " + w).strip()
        if draw.textlength(test, font=font) <= max_w:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def make_cover(slug: str, title: str, cat_macro: str):
    accent, accent2 = ACCENTS.get(cat_macro, DEFAULT_ACCENT)
    img = Image.new("RGBA", (W, H), (*BG, 255))

    # mesh de lumina — indigo sus-stanga, accent categorie jos-dreapta, catifelat
    soft_glow(img, 210, 90, 560, INDIGO, peak=115)
    soft_glow(img, W - 90, H + 20, 520, accent2, peak=95)
    soft_glow(img, W - 160, 120, 340, accent, peak=60)

    draw = ImageDraw.Draw(img)
    # grid foarte subtil
    for x in range(0, W, 60):
        draw.line([(x, 0), (x, H)], fill=(255, 255, 255, 5))
    for y in range(0, H, 60):
        draw.line([(0, y), (W, y)], fill=(255, 255, 255, 5))

    # accent geometric curat: inel mare, discret, sus-dreapta (partial off-canvas)
    ring = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    rd = ImageDraw.Draw(ring)
    rd.ellipse([W - 250, -190, W + 190, 250], outline=(*accent, 55), width=2)
    rd.ellipse([W - 170, -120, W + 130, 180], outline=(*accent, 32), width=2)
    img.alpha_composite(ring)

    draw = ImageDraw.Draw(img)
    PAD = 72

    # kicker sus + underline accent
    f_kick = load_font(26, bold=True)
    kicker = "GHID AMCUPON" if cat_macro == "Ghiduri" else cat_macro.upper()
    draw.text((PAD, 78), kicker, font=f_kick, fill=accent)
    kb = draw.textbbox((0, 0), kicker, font=f_kick)
    draw.rounded_rectangle([PAD, 78 + (kb[3]-kb[1]) + 16, PAD + 64, 78 + (kb[3]-kb[1]) + 21],
                           radius=3, fill=CYAN)

    # titlu — marime adaptiva ca sa incapa in max 3 randuri
    title = clean_title(title)
    max_w = W - 2 * PAD
    size = 66
    while size >= 40:
        f_title = load_font(size, bold=True)
        lines = wrap(draw, title, f_title, max_w)
        if len(lines) <= 3:
            break
        size -= 5
    lines = lines[:3]
    line_h = int(size * 1.18)
    total_h = line_h * len(lines)
    y = 170 + (300 - total_h) // 2 if len(lines) < 3 else 178
    for ln in lines:
        draw.text((PAD, y), ln, font=f_title, fill=WHITE)
        y += line_h

    # brand lockup jos: pilula Am + Cupon.ro
    by = H - 92
    f_brand = load_font(30, bold=True)
    draw.rounded_rectangle([PAD, by, PAD + 74, by + 44], radius=12, fill=INDIGO)
    ab = draw.textbbox((0, 0), "Am", font=f_brand)
    draw.text((PAD + (74 - (ab[2]-ab[0]))/2 - ab[0], by + (44 - (ab[3]-ab[1]))/2 - ab[1]),
              "Am", font=f_brand, fill=WHITE)
    tx = PAD + 86
    draw.text((tx, by + 6), "Cupon", font=f_brand, fill=WHITE)
    cb = draw.textbbox((0, 0), "Cupon", font=f_brand)
    draw.text((tx + (cb[2]-cb[0]) + 2, by + 6), ".ro", font=f_brand, fill=INDIGO_LT)
    # subtext
    draw.text((PAD, by + 52), "coduri & oferte verificate  ·  actualizat zilnic",
              font=load_font(18), fill=GRAY)

    out = OUT_DIR / f"{slug}.png"
    img.convert("RGB").save(out, "PNG", optimize=True)
    return out


def main():
    if not POSTS.exists():
        print("blog-posts.json lipsa — nimic de facut")
        return
    posts = json.loads(POSTS.read_text(encoding="utf-8"))
    n = 0
    for post in posts:
        slug = post.get("slug")
        if not slug:
            continue
        make_cover(slug, post.get("title", ""), macro(post.get("category", "")))
        post["cover"] = f"/blog-covers/{slug}.png"
        n += 1
    POSTS.write_text(json.dumps(posts, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Generat {n} covere editoriale in {OUT_DIR} + actualizat blog-posts.json")


if __name__ == "__main__":
    main()
