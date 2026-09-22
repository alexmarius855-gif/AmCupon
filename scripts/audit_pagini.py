"""
audit_pagini.py — trece prin TOATE paginile generate si raporteaza ce arata stricat.

DE CE (22.09.2026): pana acum verificam DATELE (verifica_site.py) si cateva pagini
alese de mana. Alex a gasit singur, uitandu-se, o pagina pe care niciun script n-o
privea: tabul „Campanii cu Imagini" de pe /produse avea 20 de carduri care erau de
fapt 4 campanii in 5 formate, cu gol negru sub fiecare. Un site nu e „verificat"
cand stii ca datele sunt bune — e verificat cand te-ai uitat la fiecare pagina.

Ce cauta (toate pe HTML-ul RANDAT, nu pe cod):
  · pagini subtiri — sub un prag de text vizibil
  · sectiuni cu titlu dar fara continut („Magazine similare" urmat de nimic)
  · valori scapate in afisare: undefined / NaN / null / „0 lei" / [object Object]
  · titluri de pagina lipsa, duplicate intre pagini, sau peste 60 de caractere
  · imagini fara src, si linkuri „#" care nu duc nicaieri
  · acelasi text repetat de N ori pe pagina (semn de continut duplicat in grila)

Rulare:
    python audit_pagini.py            # raport pe toate paginile
    python audit_pagini.py --tip      # doar cate un exemplar din fiecare template
"""
import argparse
import collections
import glob
import html as htmlmod
import io
import os
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

ROOT = os.path.join(os.path.dirname(__file__), "..")
BUILD = os.path.join(ROOT, "frontend", ".next", "server", "app")

PRAG_TEXT_SUBTIRE = 900      # caractere de text vizibil
PRAG_REPETARE = 5            # acelasi titlu de N ori intr-o pagina


def text_vizibil(h: str) -> str:
    h = re.sub(r"<head>.*?</head>", " ", h, flags=re.S | re.I)
    h = re.sub(r"<script.*?</script>", " ", h, flags=re.S | re.I)
    h = re.sub(r"<style.*?</style>", " ", h, flags=re.S | re.I)
    h = re.sub(r"<[^>]+>", " ", h)
    return re.sub(r"\s+", " ", htmlmod.unescape(h)).strip()


def titlu(h: str) -> str:
    m = re.search(r"<title[^>]*>(.*?)</title>", h, re.S | re.I)
    return htmlmod.unescape(m.group(1)).strip() if m else ""


def ruta(cale: str) -> str:
    r = cale.replace(BUILD, "").replace("\\", "/")
    r = re.sub(r"\.html$", "", r)
    return r or "/"


def audit(cale: str) -> list:
    try:
        h = io.open(cale, encoding="utf-8", errors="ignore").read()
    except Exception as e:
        return [f"nu se poate citi ({e})"]

    p, t = [], text_vizibil(h)

    if len(t) < PRAG_TEXT_SUBTIRE:
        p.append(f"pagina subtire — {len(t)} caractere de text vizibil")

    for semn, eticheta in [(r"\bundefined\b", "undefined"), (r"\bNaN\b", "NaN"),
                           (r"\[object Object\]", "[object Object]"),
                           (r">\s*null\s*<", "null afisat")]:
        n = len(re.findall(semn, t if eticheta != "null afisat" else h))
        if n:
            p.append(f"{eticheta} afisat de {n} ori")

    n0 = len(re.findall(r">\s*0 lei\s*<", h))
    if n0:
        p.append(f"„0 lei\" afisat de {n0} ori — pret pe care nimeni nu-l poate plati")

    ttl = titlu(h)
    if not ttl:
        p.append("fara <title>")
    elif len(ttl) > 60:
        p.append(f"title de {len(ttl)} caractere (Google taie peste 60)")

    if not re.search(r'<meta[^>]+name="description"', h, re.I):
        p.append("fara meta description")

    # titluri de sectiune care nu sunt urmate de nimic
    for m in re.finditer(r"<h2[^>]*>(.*?)</h2>(.{0,400}?)(?=<h2|\Z)", h, re.S | re.I):
        cap = text_vizibil(m.group(1))[:44]
        dupa = text_vizibil(m.group(2))
        if cap and len(dupa) < 25:
            p.append(f"sectiune goala: „{cap}\"")

    # acelasi titlu de card repetat — semn de grila cu duplicate
    cards = [text_vizibil(x)[:60] for x in re.findall(r"<h3[^>]*>(.*?)</h3>", h, re.S | re.I)]
    for txt, n in collections.Counter(c for c in cards if len(c) > 12).most_common(1):
        if n >= PRAG_REPETARE:
            p.append(f"acelasi card de {n} ori: „{txt[:40]}\"")

    if re.search(r'<img[^>]+src=["\']\s*["\']', h):
        p.append("imagine cu src gol")

    return p


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--tip", action="store_true", help="un exemplar per template")
    args = ap.parse_args()

    if not os.path.isdir(BUILD):
        print("Nu exista build. Ruleaza intai `npm run build` in frontend/.")
        return 1

    fisiere = sorted(glob.glob(os.path.join(BUILD, "**", "*.html"), recursive=True))
    # Rutele care fac `permanentRedirect()` produc totusi un .html la build, cu titlul
    # implicit si fara continut. Google primeste 308 si nu vede niciodata fisierul, deci
    # raportarea lor ar ingropa problemele reale: 961 din 962 de „pagini subtiri" erau
    # /reduceri/*, redirectionate catre /cod-reducere/* din 16.06.2026.
    REDIRECTIONATE = ("/reduceri/",)
    fisiere = [f for f in fisiere
               if not any(r in f.replace("\\", "/").replace(BUILD.replace("\\", "/"), "")
                          for r in REDIRECTIONATE)]
    if args.tip:
        vazute, filtrate = set(), []
        for f in fisiere:
            cheie = os.path.dirname(f)
            if cheie not in vazute:
                vazute.add(cheie)
                filtrate.append(f)
        fisiere = filtrate

    print(f"\n  Audit pe {len(fisiere)} pagini generate\n" + "  " + "─" * 62)

    titluri = collections.Counter()
    probleme, n_ok = collections.OrderedDict(), 0
    for f in fisiere:
        try:
            titluri[titlu(io.open(f, encoding="utf-8", errors="ignore").read())] += 1
        except Exception:
            pass
        pr = audit(f)
        if pr:
            probleme[ruta(f)] = pr
        else:
            n_ok += 1

    # titluri duplicate intre pagini (continut duplicat pentru Google)
    dupl = [(t, n) for t, n in titluri.most_common(6) if n > 1 and t]

    tipuri = collections.Counter()
    for pr in probleme.values():
        for x in pr:
            tipuri[re.sub(r"\d+", "N", x.split(" —")[0].split(":")[0])[:46]] += 1

    print(f"  pagini curate: {n_ok} / {len(fisiere)}\n")
    if tipuri:
        print("  PROBLEME, dupa frecventa:")
        for k, n in tipuri.most_common(14):
            print(f"    {n:>5}x  {k}")
    if dupl:
        print("\n  TITLURI DUPLICATE intre pagini:")
        for t, n in dupl:
            print(f"    {n:>5}x  {t[:62]}")

    print("\n  PRIMELE 22 DE PAGINI CU PROBLEME:")
    for r, pr in list(probleme.items())[:22]:
        print(f"    {r}")
        for x in pr[:3]:
            print(f"        · {x}")
    print(f"\n  Total pagini cu probleme: {len(probleme)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
