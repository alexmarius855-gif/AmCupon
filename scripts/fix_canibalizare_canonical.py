"""
fix_canibalizare_canonical.py — consolideaza semnalul SEO pentru brandurile care au
DOUA pagini ce tintesc aceeasi cautare.

── Problema (masurata 10.08.2026) ─────────────────────────────────────────────
29 de branduri au si o pagina editoriala (`/drmax`, `/answear`, `/noriel`...), si o
pagina de magazin generata din date (`/cod-reducere/drmax.ro` etc). Amandoua tintesc
aceeasi fraza — "cod reducere <brand>" — si fiecare isi declara PROPRIUL canonical.
Pentru Google inseamna doua pagini concurente pe acelasi cuvant: semnalul se imparte
in loc sa se cumuleze. Pe un domeniu cu Authority Score 2, unde fiecare farama de
semnal conteaza, asta e o pierdere neta.

Afecteaza exact brandurile valoroase: drmax (2.400 cautari/luna), answear (1.600),
noriel, trendyol (5.400), temu, fashiondays (3.600), decathlon, notino.

── Solutia aplicata ───────────────────────────────────────────────────────────
Pagina de brand isi declara canonical catre pagina de magazin. NU se sterge nimic,
NU se rupe niciun link:
  - pagina de brand ramane live si accesibila (continutul editorial e util)
  - vizitatorii si linkurile interne functioneaza identic
  - Google atribuie semnalul unei singure adrese, in loc sa-l imparta

De ce castiga pagina de MAGAZIN si nu cea de brand:
  1. se potriveste semantic cu interogarea ("/cod-reducere/X" pentru "cod reducere X")
  2. se actualizeaza singura cu promotiile reale (pipeline 4h); cea de brand e statica
  3. are tab-uri, produse, recenzii, comparatii, magazine similare
  4. e deja tinta linkurilor interne (Footer/HomeClient leaga /cod-reducere/X implicit)

Brandurile FARA pagina de magazin (altex, flanco, elefant, asos, iherb, asigurari,
albire-dinti) NU se ating — acolo pagina de brand e singura, deci nu exista conflict.

Rulare:
  python fix_canibalizare_canonical.py --dry-run   # doar raport
  python fix_canibalizare_canonical.py             # aplica
"""

import argparse
import json
import os
import re
import sys

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

HERE = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.join(HERE, "..", "frontend", "app")
OUTPUT_JSON = os.path.join(HERE, "..", "frontend", "public", "output.json")

CANONICAL_RE = re.compile(
    r'(alternates:\s*\{\s*canonical:\s*")https://amcupon\.ro/([a-z0-9-]+)(")'
)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    with open(OUTPUT_JSON, encoding="utf-8") as f:
        magazine = json.load(f)
    # baza domeniului -> slug complet, ex. "drmax" -> "drmax.ro".
    # Unele branduri au mai multe domenii de tara in output.json (liki24.co.uk /
    # liki24.pl, vidaxl.ro / vidaxl.bg). Pentru un site ROMANESC canonical-ul trebuie
    # sa mearga la varianta .ro, nu la prima intalnita — de-aia sortam pe preferinta,
    # nu folosim setdefault (care ar alege dupa ordinea din fisier, adica arbitrar).
    def preferinta(slug: str) -> tuple:
        if slug.endswith(".ro"):  return (0, len(slug))
        if slug.endswith(".com"): return (1, len(slug))
        return (2, len(slug))

    grupe: dict[str, list[str]] = {}
    for m in magazine:
        slug = (m.get("magazin") or "").lower()
        if not slug or " " in slug:
            continue
        grupe.setdefault(slug.split(".")[0], []).append(slug)
    base_to_slug = {b: sorted(v, key=preferinta)[0] for b, v in grupe.items()}

    modificate, sarite = [], []

    for nume in sorted(os.listdir(APP_DIR)):
        cale = os.path.join(APP_DIR, nume, "page.tsx")
        if not os.path.isfile(cale):
            continue
        with open(cale, encoding="utf-8") as f:
            src = f.read()
        if "BrandPageTemplate" not in src:
            continue

        magazin_slug = base_to_slug.get(nume)
        if not magazin_slug:
            sarite.append(nume)  # nu exista pagina de magazin -> zero conflict
            continue

        tinta = f"https://amcupon.ro/cod-reducere/{magazin_slug}"

        def repl(mm: re.Match) -> str:
            # Inlocuim doar daca canonical-ul pointeaza catre propria pagina de brand
            if mm.group(2) != nume:
                return mm.group(0)
            return f"{mm.group(1)}{tinta}{mm.group(3)}"

        nou, n = CANONICAL_RE.subn(repl, src)
        if n == 0 or nou == src:
            continue

        modificate.append((nume, magazin_slug))
        if not args.dry_run:
            with open(cale, "w", encoding="utf-8") as f:
                f.write(nou)

    prefix = "[DRY-RUN] " if args.dry_run else ""
    print(f"{prefix}Pagini de brand cu canonical mutat catre pagina de magazin: {len(modificate)}")
    for b, s in modificate:
        print(f"   /{b:16s} -> /cod-reducere/{s}")
    print(f"\n{prefix}Sarite (nu au pagina de magazin, deci niciun conflict): {len(sarite)}")
    print("   " + ", ".join(sarite))


if __name__ == "__main__":
    main()
