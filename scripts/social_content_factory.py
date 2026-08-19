#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
UZINA DE CONTINUT SOCIAL — AmCupon.ro
=====================================

Un SINGUR modul care produce tot pachetul zilnic de social media, in locul celor
7 scripturi fragmentate de dinainte (`generate_banner_auto`, `generate_niche_banners`,
`generate_social_content`, `generate_postari_simple`, `postari_zi`, ...). Fiecare
producea alt format, cu alte reguli, si se desincronizau intre ele — acelasi tipar de
"liste duplicate" documentat in docs/LECTII-TEHNICE.md.

CE PRODUCE, intr-o rulare:
  1. 10 POSTARI INDIVIDUALE — fiecare cu banner 1080x1920 (story/reels) + 1080x1080
     (feed), plus text cu hook, CTA, hashtag-uri si link scurt `amcupon.ro/go/<slug>`.
  2. DIGEST SINGLE — o infografica 1080x1350 cu Top 10 reduceri ale zilei.
  3. DIGEST CARUSEL — 10 slide-uri 1080x1080 (cover -> 8 oferte -> CTA final).

LIVRARE:
  * `frontend/public/daily-content/<YYYY-MM-DD>/` + `index.json` (manifest)
  * `/admin/social-content` citeste manifestul si da download 1-click
  * Telegram (optional): pachetul complet, daca TELEGRAM_BOT_TOKEN e setat

REGULI DE ONESTITATE — nu sunt optionale, sunt motivul pentru care scriptul arata asa:
  * **Doar magazine cu link de TRACKING REAL.** 158 din 1.161 nu au. A face reclama
    unuia fara link inseamna sa trimiti oameni gratis si sa nu castigi nimic.
  * **Procentul se PARSEAZA din textul promotiei**, nu se estimeaza si nu se rotunjeste.
    Fara cifra reala, banner-ul nu scrie nicio cifra.
  * **"Expira curand" doar cand `zile_ramase > 0`.** `zile_ramase: 0` e valoarea
    HARDCODATA la importurile Awin/generice si inseamna *necunoscut*, nu *expira azi*.
  * **Comisionul nu apare NICAIERI** in text sau imagine — e ce castigam noi, nu o
    reducere pentru cititor (greseala eliminata din site pe 03.07 si din newsletter pe 08.08).
  * **Zero emoji DESENATE in imagini.** Fonturile de sistem folosite de PIL nu au glife
    de emoji si randeaza patratel gol ("tofu"). Emoji doar in TEXTUL postarii.

Rulare:
    python scripts/social_content_factory.py                 # tot pachetul
    python scripts/social_content_factory.py --dry-run       # nu scrie fisiere
    python scripts/social_content_factory.py --no-telegram   # fara livrare
    python scripts/social_content_factory.py --n 6           # alt numar de postari
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from datetime import date, datetime
from pathlib import Path
from urllib.parse import urlparse

try:
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
except ImportError:
    print("EROARE: Pillow lipseste. Ruleaza: pip install Pillow")
    sys.exit(1)

# ── Cai ───────────────────────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent
OUTPUT_JSON = ROOT / "frontend" / "public" / "output.json"
DEST_ROOT = ROOT / "frontend" / "public" / "daily-content"
BASE_URL = "https://amcupon.ro"

# ── Brand: DARK / LIME (vezi CLAUDE.md, sectiunea Tema vizuala) ───────────────
BG        = (6, 8, 11)        # #06080b
CARD      = (20, 24, 28)      # #14181c
CARD_ALT  = (31, 35, 41)      # #1f2329
BORDER    = (42, 47, 54)      # #2a2f36
LIME      = (221, 249, 60)    # #ddf93c  — ACCENT
LIME_DIM  = (195, 221, 44)    # #c3dd2c
PE_LIME   = (12, 16, 0)       # #0c1000  — text PE accent (inchis!). Alb = ilizibil.
ALB       = (255, 255, 255)
GRI       = (201, 206, 213)   # #c9ced5
MUT       = (147, 153, 160)   # #9399a0
SLAB      = (107, 113, 120)   # #6b7178
ROSU      = (230, 67, 67)     # #e64343  — urgenta

LUNI_RO = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
           "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"]
ZILE_RO = ["Luni", "Marti", "Miercuri", "Joi", "Vineri", "Sambata", "Duminica"]

# Regex de tracking — ACELASI ca in merge_platforms.py si /admin Affiliate Audit.
RE_TRACKING = re.compile(
    r"2performant|profitshare|pxf\.io|sjv\.io|impactradius|impact\.com|awin1|anrdoezrs|prf\.hn",
    re.I,
)
RE_PROCENT = re.compile(r"(\d{1,2})\s*%")
RE_TRANSPORT = re.compile(r"transport gratuit|livrare gratuit|free shipping", re.I)
# "Pana la 90%" NU e acelasi lucru cu "-90%". Prima spune ca UN produs are atat; a doua
# promite ca tot magazinul e la pretul ala. Pe un banner diferenta pare mica, si exact
# asa se arde increderea — deci o pastram in date si o scriem pe fiecare format.
RE_PANA_LA = re.compile(r"p[aâă]n[aă]\s+la|up\s+to|maxim", re.I)

HASHTAG_CATEGORIE = {
    "fashion":        ["#fashion", "#reduceri", "#stil"],
    "beauty":         ["#beauty", "#skincare", "#reduceri"],
    "electronice":    ["#tech", "#gadgets", "#reduceri"],
    "casa-gradina":   ["#casa", "#amenajari", "#reduceri"],
    "sanatate":       ["#sanatate", "#farmacie"],
    "sport":          ["#sport", "#fitness"],
    "copii":          ["#copii", "#parenting"],
    "carti-educatie": ["#carti", "#lectura"],
    "animale":        ["#animale", "#petshop"],
    "calatorii":      ["#calatorii", "#travel"],
    "auto-moto":      ["#auto", "#piese"],
    "marketplace":    ["#shopping", "#oferte"],
}
HASHTAG_BAZA = ["#amcupon", "#reducerironline", "#oferteromania"]


# ═══════════════════════════════════════════════════════════════════════════════
# FONTURI
# ═══════════════════════════════════════════════════════════════════════════════

_CACHE_FONT: dict = {}


def font(marime: int, bold: bool = False):
    """Font de sistem, cu acoperire Windows SI Linux (scriptul ruleaza si local, si in CI)."""
    cheie = (marime, bold)
    if cheie in _CACHE_FONT:
        return _CACHE_FONT[cheie]

    candidati_bold = [
        "C:/Windows/Fonts/arialbd.ttf", "C:/Windows/Fonts/segoeuib.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ]
    candidati_normal = [
        "C:/Windows/Fonts/arial.ttf", "C:/Windows/Fonts/segoeui.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for cale in (candidati_bold if bold else candidati_normal):
        if os.path.exists(cale):
            try:
                f = ImageFont.truetype(cale, marime)
                _CACHE_FONT[cheie] = f
                return f
            except Exception:
                continue
    f = ImageFont.load_default()
    _CACHE_FONT[cheie] = f
    return f


def latime(d: ImageDraw.ImageDraw, text: str, f) -> int:
    return int(d.textlength(text, font=f))


def taie_la_latime(d: ImageDraw.ImageDraw, text: str, f, maxim: int) -> str:
    """Taie textul ca sa incapa, cu … la final. Nu lasa niciodata text sa iasa din cadru."""
    if latime(d, text, f) <= maxim:
        return text
    while text and latime(d, text + "…", f) > maxim:
        text = text[:-1]
    return (text.rstrip() + "…") if text else ""


def imparte_randuri(d: ImageDraw.ImageDraw, text: str, f, maxim: int, max_randuri: int) -> list[str]:
    """Imparte pe cuvinte in cel mult `max_randuri`; ultimul rand se taie cu …"""
    cuvinte, randuri, curent = text.split(), [], ""
    ramase = False
    for i, c in enumerate(cuvinte):
        test = (curent + " " + c).strip()
        if latime(d, test, f) <= maxim:
            curent = test
        else:
            if curent:
                randuri.append(curent)
            curent = c
            if len(randuri) == max_randuri:
                ramase = True
                break
    if curent and len(randuri) < max_randuri:
        randuri.append(curent)
    elif curent:
        ramase = True
    if randuri:
        # Daca a ramas text netaiat, ultimul rand primeste "…". Fara asta titlul
        # se opreste in mijlocul propozitiei si arata ca un bug, nu ca o scurtare.
        randuri[-1] = taie_la_latime(
            d, randuri[-1] + ("…" if ramase else ""), f, maxim)
    return randuri


# ═══════════════════════════════════════════════════════════════════════════════
# DESEN — primitive
# ═══════════════════════════════════════════════════════════════════════════════

def fundal(w: int, h: int) -> Image.Image:
    """
    Fundal dark cu doua halouri lime DISCRETE.

    Regula de brand (CLAUDE.md): lime e ACCENT, nu suprafata. Prima versiune a acestei
    functii aprindea o treime din imagine in lime si concura cu cifra reducerii — exact
    ce nu trebuie. Intensitatile de mai jos sunt reglate dupa verificare vizuala, nu ghicite.
    """
    img = Image.new("RGB", (w, h), BG)

    halou = Image.new("RGB", (w, h), BG)
    hd = ImageDraw.Draw(halou)
    for cx, cy, r, intens in ((int(w * 0.12), int(h * 0.06), int(w * 0.62), 7.0),
                              (int(w * 0.94), int(h * 0.94), int(w * 0.52), 5.0)):
        pasi = 30
        for i in range(pasi, 0, -1):
            rr = int(r * i / pasi)
            a = intens * (1 - i / pasi) ** 1.8 / pasi
            c = tuple(int(BG[k] + (LIME[k] - BG[k]) * a) for k in range(3))
            hd.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=c)
    halou = halou.filter(ImageFilter.GaussianBlur(radius=max(w, h) // 14))
    img = Image.blend(img, halou, 0.9)

    # grila = textura fina de «dashboard». Foarte slaba: la 0.5 din BORDER se vedea ca
    # o plasa peste halou si strica impresia de suprafata curata.
    d = ImageDraw.Draw(img)
    pas = max(48, w // 18)
    linie = tuple(int(BG[k] + (BORDER[k] - BG[k]) * 0.22) for k in range(3))
    for x in range(0, w, pas):
        d.line([(x, 0), (x, h)], fill=linie, width=1)
    for y in range(0, h, pas):
        d.line([(0, y), (w, y)], fill=linie, width=1)
    return img


def card(d: ImageDraw.ImageDraw, xy, radius: int = 24,
         fill=CARD, contur=BORDER, grosime: int = 2):
    d.rounded_rectangle(xy, radius=radius, fill=fill, outline=contur, width=grosime)


def pilula(d: ImageDraw.ImageDraw, x: int, y: int, text: str, f,
           fundal_c=LIME, text_c=PE_LIME, pad_x: int = 22, pad_y: int = 12) -> tuple[int, int]:
    """Badge rotunjit. Intoarce (latime, inaltime) ca sa poti aseza ce urmeaza."""
    w = latime(d, text, f) + pad_x * 2
    h = int(f.size * 1.45) + pad_y
    d.rounded_rectangle([x, y, x + w, y + h], radius=h // 2, fill=fundal_c)
    d.text((x + pad_x, y + pad_y // 2), text, font=f, fill=text_c)
    return w, h


def wordmark(d: ImageDraw.ImageDraw, x: int, y: int, marime: int = 30):
    """«Am» pe pastila lime + «Cupon.ro» alb — identic cu navbarul site-ului."""
    f = font(marime, bold=True)
    w_am = latime(d, "Am", f)
    h = int(marime * 1.5)
    d.rounded_rectangle([x, y, x + w_am + 24, y + h], radius=10, fill=LIME)
    d.text((x + 12, y + h // 2 - marime * 0.72), "Am", font=f, fill=PE_LIME)
    d.text((x + w_am + 34, y + h // 2 - marime * 0.72), "Cupon.ro", font=f, fill=ALB)


def bifa(d: ImageDraw.ImageDraw, cx: int, cy: int, r: int, culoare=LIME):
    """Bifa VECTORIALA — nu caracterul ✓, care se randeaza ca patratel gol cu fonturile PIL."""
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=culoare)
    d.line([(cx - r * 0.42, cy), (cx - r * 0.08, cy + r * 0.36), (cx + r * 0.46, cy - r * 0.34)],
           fill=PE_LIME, width=max(2, r // 4), joint="curve")


# ═══════════════════════════════════════════════════════════════════════════════
# IMAGINI EXTERNE (logo magazin, poza produs) — cu cache pe disc
# ═══════════════════════════════════════════════════════════════════════════════

CACHE_IMG = ROOT / "data" / ".cache-imagini"


def descarca_imagine(url: str, timeout: int = 12) -> "Image.Image | None":
    """
    Aduce o imagine externa, o pastreaza in cache si o intoarce ca RGBA.
    Orice esec = None, iar apelantul deseneaza fara ea. Un banner fara logo arata
    corect; un banner cu un dreptunghi gol arata stricat.
    """
    if not url or not url.startswith("http"):
        return None
    CACHE_IMG.mkdir(parents=True, exist_ok=True)
    import hashlib
    cheie = hashlib.sha1(url.encode()).hexdigest()[:20]
    local = CACHE_IMG / f"{cheie}.img"
    try:
        if not local.exists():
            import requests
            r = requests.get(url, timeout=timeout, headers={"User-Agent": "Mozilla/5.0 AmCupon/1.0"})
            if r.status_code != 200 or len(r.content) < 200:
                return None
            local.write_bytes(r.content)
        return Image.open(local).convert("RGBA")
    except Exception:
        try:
            local.unlink(missing_ok=True)   # cache stricat: nu-l pastra
        except Exception:
            pass
        return None


def incadreaza(img: "Image.Image", w: int, h: int) -> "Image.Image":
    """Umple exact WxH pastrand proportiile (crop pe centru) — fara deformare."""
    r_t, r_s = w / h, img.width / max(img.height, 1)
    if r_s > r_t:
        nou_w = int(img.height * r_t)
        img = img.crop(((img.width - nou_w) // 2, 0, (img.width + nou_w) // 2, img.height))
    else:
        nou_h = int(img.width / r_t)
        img = img.crop((0, (img.height - nou_h) // 2, img.width, (img.height + nou_h) // 2))
    return img.resize((w, h), Image.LANCZOS)


def caseta_logo(img_fundal: Image.Image, logo: "Image.Image | None",
                x: int, y: int, latura: int, initiala: str) -> None:
    """
    Logo-ul pe cutie ALBA — regula de brand din CLAUDE.md: logo-urile magazinelor
    sunt PNG-uri cu forme inchise la culoare, proiectate pentru fundal alb; pe card
    dark devin ilizibile. Cand logo-ul lipseste, desenam initiala pe lime (NU text
    alb pe lime — ar fi invizibil, tiparul de contrast documentat de 5 ori).
    """
    cutie = Image.new("RGBA", (latura, latura), (255, 255, 255, 255))
    masca = Image.new("L", (latura, latura), 0)
    ImageDraw.Draw(masca).rounded_rectangle([0, 0, latura - 1, latura - 1],
                                            radius=int(latura * 0.22), fill=255)
    if logo is not None:
        pad = int(latura * 0.14)
        mic = logo.copy()
        mic.thumbnail((latura - 2 * pad, latura - 2 * pad), Image.LANCZOS)
        fundal_alb = Image.new("RGBA", mic.size, (255, 255, 255, 255))
        fundal_alb.alpha_composite(mic)
        cutie.paste(fundal_alb, ((latura - mic.width) // 2, (latura - mic.height) // 2))
    else:
        cd = ImageDraw.Draw(cutie)
        cd.rounded_rectangle([0, 0, latura - 1, latura - 1],
                             radius=int(latura * 0.22), fill=LIME)
        f = font(int(latura * 0.5), bold=True)
        w_i = int(cd.textlength(initiala, font=f))
        cd.text(((latura - w_i) // 2, latura * 0.22), initiala, font=f, fill=PE_LIME)

    img_fundal.paste(cutie, (x, y), masca)


# ═══════════════════════════════════════════════════════════════════════════════
# DATE — selectie ONESTA
# ═══════════════════════════════════════════════════════════════════════════════

def are_tracking(m: dict) -> bool:
    return bool(RE_TRACKING.search(m.get("url_afiliat") or ""))


def text_promo(m: dict) -> str:
    return " ".join(f"{p.get('nume') or ''} {p.get('descriere') or ''}"
                    for p in (m.get("promotii") or []))


def procent_real(m: dict) -> int:
    """Cel mai mare procent scris EXPLICIT in text. Zero inseamna «nu stim», nu «0%»."""
    v = [int(x) for x in RE_PROCENT.findall(text_promo(m))]
    v = [x for x in v if 3 <= x <= 95]
    return max(v) if v else 0


def este_pana_la(m: dict) -> bool:
    """True cand procentul e un MAXIM anuntat, nu o reducere uniforma pe tot magazinul."""
    return bool(RE_PANA_LA.search(text_promo(m)))


def cod_real(m: dict) -> str:
    for p in (m.get("promotii") or []):
        c = (p.get("cod_cupon") or "").strip()
        if c:
            return c
    return ""


def expira_curand(m: dict) -> int:
    """Zile ramase, DOAR daca sunt pozitive. 0 = necunoscut la importurile Awin/generice."""
    zile = [p.get("zile_ramase") or 0 for p in (m.get("promotii") or [])]
    zile = [z for z in zile if isinstance(z, int) and 0 < z <= 7]
    return min(zile) if zile else 0


def nume_afisat(m: dict) -> str:
    n = (m.get("nume") or m.get("magazin") or "").strip()
    n = re.sub(r"\.(ro|com|net|eu|org)\b.*$", "", n, flags=re.I).strip()
    return n[:1].upper() + n[1:] if n else "Magazin"


def eticheta_oferta(m: dict) -> str:
    """Ce scriem MARE pe banner. Doar din date reale, in ordinea increderii."""
    p = procent_real(m)
    if p:
        return f"-{p}%"
    if cod_real(m):
        return "COD"
    if RE_TRANSPORT.search(text_promo(m)):
        return "TRANSPORT\nGRATUIT"
    return "OFERTA"


def titlu_promo(m: dict) -> str:
    for p in (m.get("promotii") or []):
        t = (p.get("nume") or "").strip()
        if t:
            return t
    return "Oferte active acum"


def produs_reprezentativ(slug: str) -> dict | None:
    """
    O poza REALA de produs, cand exista.

    Capcana din date: `enrich_products_from_promos.py` injecteaza PROMOTIILE in
    products.json ca si cum ar fi produse — pret 0 si imaginea = logo-ul magazinului
    (`.../advertiser-logos/...`). Alea nu sunt produse; daca le-am pune pe banner am
    afisa logo-ul de doua ori si un pret inexistent. Deci filtram pe pret > 0 SI pe
    imagine care nu e din folderul de logo-uri.
    """
    try:
        toate = json.loads((ROOT / "frontend" / "public" / "products.json")
                           .read_text(encoding="utf-8")).get("products", [])
    except Exception:
        return None
    for p in toate:
        if p.get("merchant_slug") != slug:
            continue
        if (p.get("price") or 0) <= 0:
            continue
        img = p.get("image") or ""
        if not img.startswith("http") or "advertiser-logos" in img:
            continue
        return {"titlu": p.get("title") or "", "pret": float(p["price"]), "imagine": img}
    return None


def candidati_eligibili() -> list[dict]:
    """
    Toate magazinele care POT primi banner, imbogatite cu logo si produs.

    DOUA reguli, ambele invatate din greseli:
     1. **tracking real obligatoriu** — 158 din 1.161 n-au link de comision; a le
        promova inseamna trafic dat gratis.
     2. **NU mai cerem un procent.** Prima versiune cerea procent/cod/transport, iar
        eMAG, Libris si FashionDays au promotii reale FARA procent in text
        ("Crazy Days", "Best of EPIC") — deci cele mai puternice branduri erau
        excluse tocmai de filtru, si ramaneau magazinele obscure cu "pana la 90%".
        E de-ajuns sa existe o promotie cu titlu real.
    """
    date_brute = json.loads(OUTPUT_JSON.read_text(encoding="utf-8"))
    candidati = []
    for m in date_brute:
        if not are_tracking(m) or not (m.get("promotii") or []):
            continue
        titlu = titlu_promo(m)
        if len(titlu.strip()) < 4:
            continue                                     # promotie fara titlu = nimic de aratat
        candidati.append({
            "slug": m.get("magazin", ""),
            "nume": nume_afisat(m),
            "categorie": m.get("categorie", "Diverse"),
            "categorie_slug": m.get("categorie_slug", ""),
            "procent": procent_real(m),
            "cod": cod_real(m),
            "pana_la": este_pana_la(m),
            "eticheta": eticheta_oferta(m),
            "titlu": titlu,
            "zile": expira_curand(m),
            "transport": bool(RE_TRANSPORT.search(text_promo(m))),
            "scor": float(m.get("scor_final") or 0),
            "logo_url": (m.get("logo_url") or "").strip(),
        })
    return candidati


def incarca_oferte(n: int, sortare: str = "brand", alese: list[str] | None = None) -> list[dict]:
    """
    Selectia magazinelor pentru pachetul zilei.

    `sortare="brand"` (implicit) ordoneaza dupa `scor_final` — proxy pentru cat de
    cunoscut e magazinul (emag 70, libris 65, fashiondays 50). Sortarea pe PROCENT
    scotea in fata magazine obscure cu "pana la 90%", exact ce nu vrem pe social.
    `alese` scurtcircuiteaza tot: primesti fix magazinele cerute, in ordinea data.
    """
    candidati = candidati_eligibili()

    if alese:
        pe_slug = {c["slug"].lower(): c for c in candidati}
        rezultat, lipsa = [], []
        for s in alese:
            c = pe_slug.get(s.strip().lower())
            (rezultat.append(c) if c else lipsa.append(s))
        if lipsa:
            print(f"  ATENTIE: fara promotie activa sau fara link de comision -> sarite: {', '.join(lipsa)}")
        return rezultat

    if sortare == "procent":
        candidati.sort(key=lambda c: (-c["procent"], 0 if c["cod"] else 1, -c["scor"]))
    else:
        candidati.sort(key=lambda c: (-c["scor"], -c["procent"], 0 if c["cod"] else 1))

    ales, per_cat = [], {}
    for c in candidati:                                  # diversitate: max 2 pe categorie
        k = c["categorie_slug"] or c["categorie"]
        if per_cat.get(k, 0) >= 2:
            continue
        per_cat[k] = per_cat.get(k, 0) + 1
        ales.append(c)
        if len(ales) >= n:
            break
    for c in candidati:
        if len(ales) >= n:
            break
        if c not in ales:
            ales.append(c)
    return ales[:n]


def imbogateste(oferte: list[dict]) -> None:
    """Aduce logo-ul si (cand exista) un produs real. Lent — o singura data per rulare."""
    for o in oferte:
        o["logo"] = descarca_imagine(o.get("logo_url", ""))
        o["produs"] = produs_reprezentativ(o["slug"])
        if o["produs"]:
            o["produs"]["img"] = descarca_imagine(o["produs"]["imagine"])


# ═══════════════════════════════════════════════════════════════════════════════
# TEXT — postari per platforma
# ═══════════════════════════════════════════════════════════════════════════════

def link_scurt(slug: str, sursa: str) -> str:
    return f"{BASE_URL}/go/{slug}?de={sursa}"


def hashtags(o: dict) -> str:
    h = HASHTAG_CATEGORIE.get(o["categorie_slug"], ["#oferte"]) + HASHTAG_BAZA
    return " ".join(dict.fromkeys(h))


def hook(o: dict) -> str:
    """Carligul de 3 secunde. Construit din cifra REALA, nu din adjective."""
    prefix = "pana la " if o.get("pana_la") else ""
    if o["procent"] >= 50:
        return f"Reduceri {prefix}{o['procent']}% la {o['nume']}. Am verificat, sunt active."
    if o["procent"]:
        return f"{o['nume']} are reduceri {prefix}{o['procent']}% acum."
    if o["cod"]:
        return f"Cod activ la {o['nume']}, verificat azi."
    if o["transport"]:
        return f"{o['nume']}: transport gratuit acum."
    return f"Oferta activa la {o['nume']}."


def text_postare(o: dict, platforma: str) -> str:
    """
    Instagram taie la 125 de caractere, TikTok la ~100 — deci cifra si numele
    magazinului stau MEREU in prima propozitie, nu dupa context.
    """
    lnk = link_scurt(o["slug"], f"{platforma}_single")
    urgenta = f"\nExpira in {o['zile']} {'zi' if o['zile'] == 1 else 'zile'}." if o["zile"] else ""
    cod = f"\nCod: {o['cod']}" if o["cod"] else ""

    if platforma == "tiktok":
        t = hook(o)
        return f"{t}{cod}\nLink in bio. {hashtags(o)}"[:280]

    if platforma == "instagram":
        return (f"{hook(o)}{cod}{urgenta}\n\n"
                f"{o['titlu'][:110]}\n\n"
                f"Link in bio (nu se poate da link clicabil in caption).\n"
                f"Continut cu link afiliat.\n\n{hashtags(o)}")

    return (f"{hook(o)}{cod}{urgenta}\n\n"
            f"{o['titlu'][:140]}\n\n"
            f"Vezi oferta: {lnk}\n"
            f"Continut cu link afiliat.\n\n{hashtags(o)}")


# ═══════════════════════════════════════════════════════════════════════════════
# IMAGINI — postari individuale
# ═══════════════════════════════════════════════════════════════════════════════

def banner_postare(o: dict, w: int, h: int, data_txt: str) -> Image.Image:
    """
    Un layout, doua formate. 1080x1920 = story/reels · 1080x1080 = feed.

    Trei lucruri invatate din prima varianta, toate vizibile pe imaginea generata:
     1. **logo-ul se aseaza IN antet, nu peste wordmark** — inainte cutia alba
        acoperea "Am" din marca proprie;
     2. **poza produsului e o miniatura in card, nu o banda taiata sus** — o coperta
        de carte decupata pe orizontala isi pierde exact subiectul;
     3. **inaltimea continutului se MASOARA inainte de desen** — pe patrat textul
        depasea cardul, iar pastila "EXPIRA" ajungea peste "Verificat".
    """
    img = fundal(w, h)
    vertical = h > w
    m = int(w * 0.075)
    interior_max = w - 2 * m - int(w * 0.10)

    # ── ANTET: logo + nume magazin (stanga), marca noastra (dreapta) ──────────
    # Pe patrat compozitia se lasa mai jos ca sa nu ramana o treime de imagine
    # goala sub subsol; pe story raportul 9:16 are oricum aer suficient.
    y_antet = int(h * (0.062 if vertical else 0.105))
    latura = int(w * 0.145)
    caseta_logo(img, o.get("logo"), m, y_antet, latura, o["nume"][:1].upper())

    d = ImageDraw.Draw(img)                     # paste invalideaza contextul anterior
    f_cat = font(int(w * 0.021), bold=True)
    f_nume = font(int(w * 0.040), bold=True)
    x_txt = m + latura + int(w * 0.03)
    lat_nume = w - x_txt - m - int(w * 0.22)    # loc rezervat wordmark-ului
    d.text((x_txt, y_antet + latura // 2 - int(f_cat.size * 1.6)),
           o["categorie"].upper()[:22], font=f_cat, fill=SLAB)
    d.text((x_txt, y_antet + latura // 2 - int(f_nume.size * 0.15)),
           taie_la_latime(d, o["nume"], f_nume, lat_nume), font=f_nume, fill=ALB)

    f_wm = font(int(w * 0.024), bold=True)
    wm_w = latime(d, "AmCupon.ro", f_wm)
    d.text((w - m - wm_w, y_antet + int(w * 0.012)), "Am", font=f_wm, fill=LIME)
    d.text((w - m - wm_w + latime(d, "Am", f_wm), y_antet + int(w * 0.012)),
           "Cupon.ro", font=f_wm, fill=MUT)

    # ── MASURARE inainte de desen: cat loc cere textul ────────────────────────
    produs = o.get("produs") or {}
    poza = produs.get("img")
    # miniatura ocupa dreapta cardului doar daca exista poza
    lat_thumb = int(w * 0.30) if poza is not None else 0
    interior = interior_max - (lat_thumb + int(w * 0.04) if lat_thumb else 0)

    linii_et = o["eticheta"].split(chr(10))
    scurta = len(linii_et) == 1 and len(linii_et[0]) <= 5
    marime = int(w * (0.165 if scurta else 0.072))
    f_big = font(marime, bold=True)
    while latime(d, max(linii_et, key=len), f_big) > interior and marime > 26:
        marime -= 4
        f_big = font(marime, bold=True)

    f_t = font(int(w * 0.028))
    randuri_titlu = imparte_randuri(d, o["titlu"], f_t, interior, 3 if vertical else 2)

    inalt = 0
    if o.get("pana_la") and o["procent"]:
        inalt += int(w * 0.026 * 1.5)
    inalt += len(linii_et) * int(marime * 1.06) + int(h * 0.012)
    inalt += len(randuri_titlu) * int(f_t.size * 1.42)
    if o["cod"]:
        inalt += int(h * 0.014) + int(w * 0.038 * 1.9)
    if o["zile"]:
        inalt += int(h * 0.018) + int(w * 0.024 * 1.45) + 12
    if produs.get("pret"):
        inalt += int(h * 0.012) + int(w * 0.024 * 1.5)

    pad = int(h * (0.045 if vertical else 0.050))
    card_sus = y_antet + latura + int(h * (0.045 if vertical else 0.038))
    card_jos = min(card_sus + inalt + 2 * pad, int(h * (0.84 if vertical else 0.855)))
    card(d, [m, card_sus, w - m, card_jos], radius=int(w * 0.035))

    # ── miniatura produsului, in dreapta cardului ─────────────────────────────
    if poza is not None:
        latura_t = min(lat_thumb, card_jos - card_sus - 2 * int(w * 0.035))
        x_t = w - m - int(w * 0.045) - latura_t
        y_t = card_sus + (card_jos - card_sus - latura_t) // 2
        fundal_t = Image.new("RGBA", (latura_t, latura_t), (255, 255, 255, 255))
        mic = poza.convert("RGBA")
        mic.thumbnail((latura_t - 12, latura_t - 12), Image.LANCZOS)   # CONTAIN, nu crop
        fundal_t.alpha_composite(mic, ((latura_t - mic.width) // 2, (latura_t - mic.height) // 2))
        masca = Image.new("L", (latura_t, latura_t), 0)
        ImageDraw.Draw(masca).rounded_rectangle([0, 0, latura_t - 1, latura_t - 1],
                                                radius=int(latura_t * 0.10), fill=255)
        img.paste(fundal_t, (x_t, y_t), masca)
        d = ImageDraw.Draw(img)

    # ── CONTINUT ──────────────────────────────────────────────────────────────
    x = m + int(w * 0.05)
    y = card_sus + pad

    if o.get("pana_la") and o["procent"]:
        f_pl = font(int(w * 0.026), bold=True)
        d.text((x, y), "PÂNĂ LA", font=f_pl, fill=LIME_DIM)
        y += int(f_pl.size * 1.5)

    for ln in linii_et:
        d.text((x, y), ln, font=f_big, fill=LIME)
        y += int(marime * 1.06)
    y += int(h * 0.012)

    for ln in randuri_titlu:
        d.text((x, y), ln, font=f_t, fill=GRI)
        y += int(f_t.size * 1.42)

    if produs.get("pret"):
        y += int(h * 0.012)
        f_p = font(int(w * 0.024))
        d.text((x, y), taie_la_latime(d, f"in poza: {produs['titlu']} · {produs['pret']:.0f} lei",
                                      f_p, interior), font=f_p, fill=SLAB)
        y += int(f_p.size * 1.5)

    if o["cod"]:
        y += int(h * 0.014)
        f_cod = font(int(w * 0.038), bold=True)
        w_cod = latime(d, o["cod"], f_cod) + int(w * 0.085)
        h_cod = int(f_cod.size * 1.9)
        caseta = [x, y, x + w_cod, y + h_cod]
        d.rounded_rectangle(caseta, radius=14, fill=CARD_ALT)
        pas, on = 12, 7                          # contur punctat: PIL n-are dash nativ
        for px in range(caseta[0], caseta[2], pas):
            d.line([(px, caseta[1]), (min(px + on, caseta[2]), caseta[1])], fill=LIME, width=2)
            d.line([(px, caseta[3]), (min(px + on, caseta[2]), caseta[3])], fill=LIME, width=2)
        for py in range(caseta[1], caseta[3], pas):
            d.line([(caseta[0], py), (caseta[0], min(py + on, caseta[3]))], fill=LIME, width=2)
            d.line([(caseta[2], py), (caseta[2], min(py + on, caseta[3]))], fill=LIME, width=2)
        d.text((x + int(w * 0.042), y + int(h_cod * 0.24)), o["cod"], font=f_cod, fill=LIME)
        y += h_cod

    if o["zile"]:
        y += int(h * 0.018)
        pilula(d, x, y, f"EXPIRA IN {o['zile']} {'ZI' if o['zile'] == 1 else 'ZILE'}",
               font(int(w * 0.024), bold=True), fundal_c=ROSU, text_c=ALB)

    # ── SUBSOL, mereu sub card (nu se mai suprapune peste pastila de urgenta) ─
    y_sub = card_jos + int(h * 0.032)
    bifa(d, m + int(w * 0.020), y_sub + int(w * 0.020), int(w * 0.020))
    d.text((m + int(w * 0.052), y_sub + int(w * 0.004)),
           f"Verificat {data_txt}", font=font(int(w * 0.024), bold=True), fill=LIME)
    f_link = font(int(w * 0.028), bold=True)
    d.text((m, y_sub + int(w * 0.055)),
           taie_la_latime(d, f"amcupon.ro/go/{o['slug']}", f_link, w - 2 * m),
           font=f_link, fill=MUT)
    return img


# ═══════════════════════════════════════════════════════════════════════════════
# IMAGINI — digest SINGLE (infografica Top 10)
# ═══════════════════════════════════════════════════════════════════════════════

def digest_single(oferte: list[dict], data_txt: str, zi: str) -> Image.Image:
    """1080x1350 — formatul portret de feed, cel mai mare spatiu vizibil pe mobil."""
    w, h = 1080, 1350
    img = fundal(w, h)
    d = ImageDraw.Draw(img)
    m = 64

    wordmark(d, m, 56, marime=32)

    f_h1 = font(64, bold=True)
    d.text((m, 148), "TOP 10 REDUCERI", font=f_h1, fill=ALB)
    d.text((m, 148 + 74), "ALE ZILEI", font=f_h1, fill=LIME)

    f_sub = font(26, bold=True)
    d.text((m, 148 + 158), f"{zi}, {data_txt}  ·  verificate manual", font=f_sub, fill=MUT)

    sus = 380
    disponibil = h - sus - 130
    n = min(len(oferte), 10)
    inalt = disponibil // max(n, 1)

    for i, o in enumerate(oferte[:n]):
        y = sus + i * inalt
        card(d, [m, y, w - m, y + inalt - 10], radius=16, fill=CARD, grosime=1)

        f_nr = font(28, bold=True)
        d.rounded_rectangle([m + 14, y + 12, m + 62, y + inalt - 22], radius=12, fill=CARD_ALT)
        nr = str(i + 1)
        d.text((m + 38 - latime(d, nr, f_nr) // 2, y + (inalt - 34) // 2 - 4), nr, font=f_nr, fill=LIME)

        f_n = font(30, bold=True)
        f_t = font(21)
        d.text((m + 82, y + 16), taie_la_latime(d, o["nume"], f_n, 560), font=f_n, fill=ALB)
        d.text((m + 82, y + 54), taie_la_latime(d, o["titlu"], f_t, 620), font=f_t, fill=MUT)

        et = o["eticheta"].replace("\n", " ")
        f_e = font(40 if len(et) <= 5 else 24, bold=True)
        x_et = w - m - 24 - latime(d, et, f_e)
        if o.get("pana_la") and o["procent"]:
            d.text((x_et, y + (inalt - f_e.size) // 2 - 26),
                   "până la", font=font(15, bold=True), fill=LIME_DIM)
        d.text((x_et, y + (inalt - f_e.size) // 2 - 8), et, font=f_e, fill=LIME)

    f_f = font(28, bold=True)
    d.text((m, h - 96), "Toate ofertele pe amcupon.ro", font=f_f, fill=ALB)
    f_leg = font(20)
    d.text((m, h - 56), "Continut cu link afiliat. Preturile pot varia.", font=f_leg, fill=SLAB)
    return img


# ═══════════════════════════════════════════════════════════════════════════════
# IMAGINI — CARUSEL (10 slide-uri 1080x1080)
# ═══════════════════════════════════════════════════════════════════════════════

def carusel(oferte: list[dict], data_txt: str, zi: str) -> list[Image.Image]:
    """Slide 1 = cover · slide 2-9 = cate o oferta · slide 10 = CTA."""
    W = H = 1080
    slides: list[Image.Image] = []

    # ── COVER ─────────────────────────────────────────────────────────────────
    img = fundal(W, H)
    d = ImageDraw.Draw(img)
    wordmark(d, 72, 76, marime=34)
    f1 = font(96, bold=True)
    d.text((72, 300), "OFERTELE", font=f1, fill=ALB)
    d.text((72, 300 + 108), "ZILEI", font=f1, fill=LIME)
    f2 = font(32, bold=True)
    d.text((72, 300 + 236), f"{zi}, {data_txt}", font=f2, fill=GRI)
    f3 = font(26)
    d.text((72, 300 + 288), f"{min(len(oferte), 8)} oferte verificate manual", font=f3, fill=MUT)
    f4 = font(28, bold=True)
    d.text((72, H - 128), "Gliseaza —>", font=f4, fill=LIME)
    slides.append(img)

    # ── OFERTE ────────────────────────────────────────────────────────────────
    n_oferte = min(len(oferte), 8)
    for i, o in enumerate(oferte[:8]):
        img = fundal(W, H)
        d = ImageDraw.Draw(img)

        # antet: marca + pozitia in carusel (lipsea marca — un slide salvat de cineva
        # nu spunea de unde vine)
        wordmark(d, 72, 62, marime=26)
        f_pas = font(24, bold=True)
        pas_txt = f"{i + 1} / {n_oferte}"
        d.text((W - 72 - latime(d, pas_txt, f_pas), 72), pas_txt, font=f_pas, fill=SLAB)

        card(d, [72, 160, W - 72, H - 150], radius=28)
        x = 116

        # ── blocul de continut se compune INTAI, apoi se centreaza pe verticala.
        # Prima versiune il ancora sus si lasa ~330px de card gol dedesubt.
        f_cat, f_n, f_t = font(22, bold=True), font(52, bold=True), font(26)
        et = o["eticheta"].replace("\n", " ")
        f_e = font(132 if len(et) <= 5 else 62, bold=True)
        while latime(d, et, f_e) > W - 232 and f_e.size > 40:
            f_e = font(f_e.size - 8, bold=True)
        randuri_titlu = imparte_randuri(d, o["titlu"], f_t, W - 232, 3)

        inalt = 54 + int(f_e.size * 1.12) + 12 + 78 + len(randuri_titlu) * 38
        if o.get("pana_la") and o["procent"]:
            inalt += 44
        if o["cod"]:
            inalt += 16 + int(38 * 1.45) + 12
        if o["zile"]:
            inalt += 16 + int(22 * 1.45) + 12

        y = 160 + ((H - 150 - 160) - inalt) // 2

        d.text((x, y), o["categorie"].upper()[:28], font=f_cat, fill=SLAB)
        y += 54

        if o.get("pana_la") and o["procent"]:
            d.text((x, y), "PÂNĂ LA", font=font(28, bold=True), fill=LIME_DIM)
            y += 44

        d.text((x, y), et, font=f_e, fill=LIME)
        y += int(f_e.size * 1.12) + 12

        d.text((x, y), taie_la_latime(d, o["nume"], f_n, W - 232), font=f_n, fill=ALB)
        y += 78

        for ln in randuri_titlu:
            d.text((x, y), ln, font=f_t, fill=GRI)
            y += 38

        if o["cod"]:
            y += 16
            _, h_p = pilula(d, x, y, o["cod"], font(38, bold=True))
            y += h_p + 12
        if o["zile"]:
            y += 16
            pilula(d, x, y, f"EXPIRA IN {o['zile']} {'ZI' if o['zile'] == 1 else 'ZILE'}",
                   font(22, bold=True), fundal_c=ROSU, text_c=ALB)

        d.text((72, H - 106), f"amcupon.ro/go/{o['slug']}"[:52],
               font=font(24, bold=True), fill=MUT)
        slides.append(img)

    # ── CTA FINAL ─────────────────────────────────────────────────────────────
    img = fundal(W, H)
    d = ImageDraw.Draw(img)
    wordmark(d, 72, 76, marime=34)
    f1 = font(74, bold=True)
    d.text((72, 320), "Toate ofertele,", font=f1, fill=ALB)
    d.text((72, 320 + 88), "intr-un singur loc", font=f1, fill=LIME)
    f2 = font(30)
    for j, ln in enumerate(["Peste 1.000 de magazine.",
                            "Verificam zilnic ce e activ si ce nu.",
                            "Fara cont, fara costuri."]):
        bifa(d, 88, 320 + 210 + j * 56, 14)
        d.text((122, 320 + 210 + j * 56 - 18), ln, font=f2, fill=GRI)
    f3 = font(40, bold=True)
    pilula(d, 72, H - 250, "amcupon.ro", f3, pad_x=34, pad_y=20)
    f4 = font(20)
    d.text((72, H - 108), "Continut cu link afiliat. Preturile pot varia.", font=f4, fill=SLAB)
    slides.append(img)
    return slides


# ═══════════════════════════════════════════════════════════════════════════════
# SALVARE + RETENTIE
# ═══════════════════════════════════════════════════════════════════════════════

# Paleta de 128 de culori in loc de RGB pe 24 de biti. Designul e plat (fundal
# aproape negru, un accent, text alb) — verificat vizual ca NU apare banding nici
# pe haloul difuz, iar fisierul scade la ~jumatate.
# Conteaza: 31 de imagine/zi in `public/` inseamna ~2,4 MB/zi in ISTORICUL git,
# permanent, intr-un repo care trebuie sa ramana PUBLIC (Actions gratuite).
CULORI_PALETA = 128
ZILE_PASTRATE = 3


def salveaza(img: Image.Image, cale: Path) -> None:
    img.convert("P", palette=Image.ADAPTIVE, colors=CULORI_PALETA).save(cale, optimize=True)


def curata_vechi(pastreaza: int = ZILE_PASTRATE) -> int:
    """
    Sterge pachetele mai vechi de `pastreaza` zile. Materialele sunt de uz zilnic —
    nimeni nu posteaza ofertele de acum doua saptamani, iar fara curatare repo-ul
    ar creste cu ~1,2 MB in fiecare zi, la nesfarsit.
    """
    if not DEST_ROOT.exists():
        return 0
    zile = sorted([d for d in DEST_ROOT.iterdir() if d.is_dir()], key=lambda d: d.name)
    sterse = 0
    for d in zile[:-pastreaza] if len(zile) > pastreaza else []:
        for f in sorted(d.rglob("*"), reverse=True):
            f.unlink() if f.is_file() else f.rmdir()
        d.rmdir()
        sterse += 1
    return sterse


# ═══════════════════════════════════════════════════════════════════════════════
# LIVRARE
# ═══════════════════════════════════════════════════════════════════════════════

def trimite_telegram(dest: Path, manifest: dict) -> bool:
    """
    Pachetul zilei pe Telegram. Daca tokenul lipseste, face skip ELEGANT — nu crapa
    pipeline-ul (acelasi tipar defensiv ca la restul integrarilor din repo).
    """
    token = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
    chat = os.environ.get("TELEGRAM_CHANNEL_ID", "").strip()
    if not token or not chat:
        print("  [telegram] TELEGRAM_BOT_TOKEN/CHANNEL_ID nesetate — skip (nu e eroare)")
        return False

    import requests

    api = f"https://api.telegram.org/bot{token}"
    rezumat = (
        f"*Pachet social AmCupon — {manifest['data_afisata']}*\n"
        f"{manifest['nr_postari']} postari individuale · digest single · carusel {manifest['nr_slide']} slide-uri\n"
        f"Toate ofertele au link de comision real si cifre verificate.\n"
        f"Descarcare: {BASE_URL}/admin/social-content"
    )
    try:
        requests.post(f"{api}/sendMessage",
                      json={"chat_id": chat, "text": rezumat, "parse_mode": "Markdown",
                            "disable_web_page_preview": True}, timeout=30)
    except Exception as e:
        print(f"  [telegram] mesajul de rezumat a picat: {e}")
        return False

    # Telegram accepta maximum 10 media intr-un grup — trimitem pe transe.
    def grup(cai: list[Path], eticheta: str):
        for start in range(0, len(cai), 10):
            transa = cai[start:start + 10]
            files, media = {}, []
            for idx, cale in enumerate(transa):
                cheie = f"f{idx}"
                files[cheie] = cale.open("rb")
                el = {"type": "photo", "media": f"attach://{cheie}"}
                if idx == 0:
                    el["caption"] = eticheta
                media.append(el)
            try:
                r = requests.post(f"{api}/sendMediaGroup",
                                  data={"chat_id": chat, "media": json.dumps(media)},
                                  files=files, timeout=120)
                if r.status_code != 200:
                    print(f"  [telegram] {eticheta}: HTTP {r.status_code} — {r.text[:160]}")
            except Exception as e:
                print(f"  [telegram] {eticheta} a picat: {e}")
            finally:
                for f in files.values():
                    f.close()

    grup(sorted(dest.glob("carusel/*.png")), "Carusel — 10 slide-uri")
    grup(sorted(dest.glob("postari/*_square.png")), "Postari individuale (feed 1080x1080)")
    grup([dest / "digest-single.png"], "Digest — Top 10 al zilei")
    print("  [telegram] pachet trimis")
    return True


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

def main() -> int:
    ap = argparse.ArgumentParser(description="Uzina de continut social AmCupon")
    ap.add_argument("--n", type=int, default=10, help="cate postari individuale (implicit 10)")
    ap.add_argument("--dry-run", action="store_true", help="nu scrie fisiere")
    ap.add_argument("--no-telegram", action="store_true", help="nu trimite pe Telegram")
    ap.add_argument("--data", help="YYYY-MM-DD (implicit azi)")
    ap.add_argument("--magazine", help="slug-uri separate prin virgula — banner DOAR pentru ele, in ordinea data")
    ap.add_argument("--sort", choices=["brand", "procent"], default="brand",
                    help="brand = dupa cat de cunoscut e magazinul (implicit) · procent = dupa reducere")
    ap.add_argument("--lista", action="store_true",
                    help="afiseaza magazinele eligibile si iese — de aici alegi pentru --magazine")
    args = ap.parse_args()

    if not OUTPUT_JSON.exists():
        print(f"EROARE: {OUTPUT_JSON} lipseste. Ruleaza intai merge_platforms.py")
        return 1

    # ── `--lista`: catalogul din care alegi, ordonat dupa notorietate ─────────
    if args.lista:
        toti = sorted(candidati_eligibili(), key=lambda c: (-c["scor"], -c["procent"]))
        print(f"\n  {len(toti)} magazine eligibile (promotie activa + link de comision real)\n")
        print(f"  {'SLUG':<26}{'SCOR':>6}  {'OFERTA':<14}{'COD':<12}CATEGORIE")
        print("  " + "─" * 76)
        for c in toti:
            print(f"  {c['slug']:<26}{c['scor']:>6.0f}  "
                  f"{c['eticheta'].replace(chr(10), ' '):<14}{(c['cod'] or '—'):<12}{c['categorie']}")
        print(f"\n  Foloseste: python scripts/social_content_factory.py "
              f"--magazine {','.join(c['slug'] for c in toti[:3])}\n")
        return 0

    azi = datetime.strptime(args.data, "%Y-%m-%d").date() if args.data else date.today()
    data_iso = azi.isoformat()
    data_txt = f"{azi.day} {LUNI_RO[azi.month - 1]} {azi.year}"
    zi = ZILE_RO[azi.weekday()]

    print(f"\n{'=' * 66}\n  UZINA DE CONTINUT SOCIAL — {data_txt}\n{'=' * 66}")

    alese = [x for x in (args.magazine or "").split(",") if x.strip()] or None
    oferte = incarca_oferte(args.n, sortare=args.sort, alese=alese)
    if not oferte:
        print("EROARE: niciun magazin nu trece filtrul (promotie activa + link de comision).")
        print("        Nu generez continut gol. Vezi optiunile cu --lista.")
        return 1

    print(f"\n  {len(oferte)} magazine selectate  ·  ordonare: "
          f"{'alegerea ta' if alese else args.sort}  ·  toate cu link de comision")

    if args.dry_run:
        for i, o in enumerate(oferte, 1):
            print(f"    {i:2}. {o['nume']:<24} {o['eticheta'].replace(chr(10), ' '):<16} {o['categorie']}")
        print("\n  [DRY-RUN] nu scriu nimic pe disc.")
        return 0

    # Descarcarea logo-urilor si a pozelor de produs se face O SINGURA data,
    # dupa selectie — nu la fiecare desen, si nu pentru magazine nefolosite.
    print("  Aduc logo-urile si pozele de produs...")
    imbogateste(oferte)
    for i, o in enumerate(oferte, 1):
        semne = ("logo" if o.get("logo") is not None else "FARA logo")
        if (o.get("produs") or {}).get("img") is not None:
            semne += " + poza produs"
        print(f"    {i:2}. {o['nume']:<24} {o['eticheta'].replace(chr(10), ' '):<14} {semne}")

    dest = DEST_ROOT / data_iso
    (dest / "postari").mkdir(parents=True, exist_ok=True)
    (dest / "carusel").mkdir(parents=True, exist_ok=True)

    manifest_postari = []
    print("\n  Generez postarile individuale...")
    for i, o in enumerate(oferte, 1):
        baza = f"{i:02d}-{o['slug'].replace('.', '-')}"
        salveaza(banner_postare(o, 1080, 1920, data_txt), dest / "postari" / f"{baza}_story.png")
        salveaza(banner_postare(o, 1080, 1080, data_txt), dest / "postari" / f"{baza}_square.png")
        manifest_postari.append({
            "pozitie": i,
            "magazin": o["nume"],
            "slug": o["slug"],
            "categorie": o["categorie"],
            "eticheta": o["eticheta"].replace("\n", " "),
            "cod": o["cod"],
            "link": link_scurt(o["slug"], "social_single"),
            "story": f"/daily-content/{data_iso}/postari/{baza}_story.png",
            "square": f"/daily-content/{data_iso}/postari/{baza}_square.png",
            "text": {p: text_postare(o, p) for p in ("facebook", "instagram", "tiktok")},
        })
    print(f"    {len(oferte)} postari × 2 formate = {len(oferte) * 2} imagini")

    print("  Generez digest-ul single...")
    salveaza(digest_single(oferte, data_txt, zi), dest / "digest-single.png")

    print("  Generez caruselul...")
    slides = carusel(oferte, data_txt, zi)
    for i, s in enumerate(slides, 1):
        salveaza(s, dest / "carusel" / f"slide-{i:02d}.png")
    print(f"    {len(slides)} slide-uri")

    text_digest = (
        f"Ofertele zilei — {zi}, {data_txt}\n\n"
        + "\n".join(
            f"{i}. {o['nume']} "
            f"{'pana la ' if o.get('pana_la') and o['procent'] else ''}"
            f"{o['eticheta'].replace(chr(10), ' ')}"
            + (f" · cod {o['cod']}" if o["cod"] else "")
            for i, o in enumerate(oferte[:10], 1)
        )
        + f"\n\nToate pe {BASE_URL}\nContinut cu link afiliat.\n\n"
        + " ".join(HASHTAG_BAZA)
    )
    (dest / "text-digest.txt").write_text(text_digest, encoding="utf-8")

    manifest = {
        "data": data_iso,
        "data_afisata": data_txt,
        "zi": zi,
        "generat_la": datetime.now().isoformat(timespec="seconds"),
        "nr_postari": len(oferte),
        "nr_slide": len(slides),
        "digest_single": f"/daily-content/{data_iso}/digest-single.png",
        "carusel": [f"/daily-content/{data_iso}/carusel/slide-{i:02d}.png"
                    for i in range(1, len(slides) + 1)],
        "text_digest": text_digest,
        "postari": manifest_postari,
    }
    (dest / "index.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    (DEST_ROOT / "latest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

    sterse = curata_vechi()
    if sterse:
        print(f"  Sters {sterse} pachet(e) mai vechi de {ZILE_PASTRATE} zile")

    total = len(list(dest.rglob("*.png")))
    print(f"\n  Salvat in {dest.relative_to(ROOT)}  ({total} imagini + manifest)")

    if not args.no_telegram:
        print("\n  Livrare Telegram...")
        trimite_telegram(dest, manifest)

    print(f"\n  Gata. Vezi si {BASE_URL}/admin/social-content\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
