#!/usr/bin/env python3
"""
Verifica LIVE ca niciun link intern de pe site nu duce in 404.

De ce exista: repo-ul are un istoric lung de linkuri interne moarte, gasite de
fiecare data din intamplare, nu sistematic — `/pescuit` -> `/gradina` (09.08),
`MAGAZINE_POPULARE` din Footer catre magazine absente din output.json (08.08),
si cele 18 linkuri de categorie moarte din migrarea de taxonomie (09.08). Toate
au acelasi profil: o lista scrisa de mana care nu mai corespunde datelor reale.

Ce face: descopera rutele statice din `frontend/app/**/page.tsx`, cere fiecare
pagina de pe site-ul live, extrage TOATE `href="/..."` si verifica fiecare tinta
distincta. Raporteaza linkul rupt IMPREUNA cu paginile de pe care se ajunge la el
(fara asta, un 404 e greu de localizat in 100+ pagini).

Prima rulare (16.08.2026): 98 pagini, 806 linkuri interne distincte, 3 rupte.

    python scripts/check_internal_links.py [--base https://amcupon.ro]

Iese cu cod 1 daca gaseste linkuri rupte, ca sa poata fi folosit si intr-un
workflow, nu doar manual.
"""
import concurrent.futures as cf
import json
import os
import re
import sys
import urllib.error
import urllib.request
from collections import defaultdict
from pathlib import Path

RADACINA = Path(__file__).parent.parent
APP = RADACINA / "frontend" / "app"
UA = {"User-Agent": "Mozilla/5.0 (compatible; AmCuponLinkCheck/1.0)"}


def cere(url: str, doar_antet: bool = False):
    cerere = urllib.request.Request(url, headers=UA, method="HEAD" if doar_antet else "GET")
    try:
        with urllib.request.urlopen(cerere, timeout=25) as r:
            corp = b"" if doar_antet else r.read(500_000)
            return r.status, corp.decode("utf-8", "ignore")
    except urllib.error.HTTPError as e:
        return e.code, ""
    except Exception as e:
        return type(e).__name__, ""


def rute_statice():
    """Rutele pe care le putem cere direct (fara segmente dinamice sau private)."""
    gasite = set()
    for radacina, _, fisiere in os.walk(APP):
        if "page.tsx" not in fisiere:
            continue
        rel = os.path.relpath(radacina, APP).replace("\\", "/")
        if "[" in rel or rel.startswith(("api", "admin")):
            continue
        gasite.add("/" if rel == "." else "/" + rel)
    return sorted(gasite)


def main():
    base = "https://amcupon.ro"
    if "--base" in sys.argv:
        base = sys.argv[sys.argv.index("--base") + 1].rstrip("/")

    pagini = rute_statice()
    print(f"Verific {len(pagini)} pagini pe {base}")

    surse = defaultdict(set)
    pagini_rele = []

    def scaneaza(p):
        st, html = cere(base + p)
        if st != 200:
            return p, st, set()
        return p, st, set(re.findall(r'href="(/[^"#?]*)"', html))

    with cf.ThreadPoolExecutor(max_workers=12) as ex:
        for p, st, tinte in ex.map(scaneaza, pagini):
            if st != 200:
                pagini_rele.append((p, st))
                continue
            for t in tinte:
                surse[t].add(p)

    if pagini_rele:
        print(f"\nPAGINI care nu raspund 200: {len(pagini_rele)}")
        for p, st in pagini_rele:
            print(f"  {st}  {p}")

    tinte = sorted(surse)
    print(f"Linkuri interne distincte: {len(tinte)}")

    def verifica(t):
        st, _ = cere(base + t, doar_antet=True)
        if st in (403, 405):          # unele gazde refuza HEAD — reincercam cu GET
            st, _ = cere(base + t)
        return t, st

    rupte = []
    with cf.ThreadPoolExecutor(max_workers=16) as ex:
        for t, st in ex.map(verifica, tinte):
            if st != 200:
                rupte.append((t, st))

    print(f"\nLINKURI RUPTE: {len(rupte)}")
    for t, st in sorted(rupte):
        de_pe = sorted(surse[t])
        print(f"  {str(st):8s} {t}")
        print(f"           <- {', '.join(de_pe[:5])}{' ...' if len(de_pe) > 5 else ''}")

    raport = RADACINA / "data" / "link_intern_report.json"
    raport.parent.mkdir(parents=True, exist_ok=True)
    raport.write_text(json.dumps(
        {"base": base, "pagini": len(pagini), "linkuri": len(tinte),
         "rupte": {t: {"status": str(st), "surse": sorted(surse[t])} for t, st in rupte}},
        ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"\nRaport: {raport}")
    return 1 if (rupte or pagini_rele) else 0


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
