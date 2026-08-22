#!/usr/bin/env python3
"""
Audit programe 2Performant — ce e aprobat dar nu aduce bani.

═══════════════════════════════════════════════════════════════════════════════
 CE NU POATE FACE SCRIPTUL ASTA, SI DE CE (masurat 22.08.2026)
═══════════════════════════════════════════════════════════════════════════════
Versiunea initiala (19.08.2026) trebuia sa produca lista de programe la care NU
am aplicat: catalogul complet 2Performant minus cele acceptate. Premisa era ca
`affiliate/programs` fara filtru intoarce tot marketplace-ul.

Premisa e FALSA. `sonda_2p_catalog.py` a incercat, intr-o singura rulare, sase
valori de `filter[affrequest_status]` si cinci endpointuri. Rezultatul:

    affiliate/programs (fara filtru)        513
    affiliate/programs status=accepted      513
    affiliate/programs status=pending       513
    affiliate/programs status=rejected      513
    affiliate/programs status=not_requested 513
    affiliate/programs status=available     513
    affiliate/campaigns                     513
    affiliate/advertisers                     0
    advertisers / campaigns                   0

Identice. Parametrul de status e ignorat complet — API-ul intoarce DOAR relatiile
contului, niciodata catalogul public. Lista de programe la care poti aplica se ia
din interfata web 2Performant (Programe -> Toate programele), nu de aici.

Nu sterg constatarea asta: fara ea, cineva (eu inclusiv) rescrie acelasi script
peste doua luni pe aceeasi presupunere.

═══════════════════════════════════════════════════════════════════════════════
 CE FACE, IN SCHIMB
═══════════════════════════════════════════════════════════════════════════════
Verifica invers: din programele APROBATE, care nu produc bani pe site?
  - programe aprobate care n-au deloc pagina de magazin
  - pagini care exista dar au link fara tracking real (comision 0 la orice click)

Tehnica asta a mai gasit bani o data (audit 08.2026: verticala /asigurari, program
aprobat si nefolosit, plus 5 linkuri care nu trackuiau).

Nu scrie nimic. Doar citeste si tipareste.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "frontend" / "public" / "output.json"

# Semnaturile de tracking REAL, aceleasi ca in reconcile_impact_links.py.
RE_TRACKING = re.compile(
    r"2performant|pxf\.io|sjv\.io|impactradius|impact\.com|awin1|anrdoezrs|prf\.hn|tradedoubler",
    re.I,
)
RE_IMPACT_PATH = re.compile(r"/c/\d+/\d+/\d+")
RE_PLACEHOLDER = re.compile(r"/c/\d+/[01]/[01]\b")


def are_tracking(url: str) -> bool:
    if not url or RE_PLACEHOLDER.search(url):
        return False
    return bool(RE_TRACKING.search(url) or RE_IMPACT_PATH.search(url))


def domeniu(text: str) -> str:
    """
    Domeniu curat dintr-un URL sau dintr-un slug. Fara ghicit.

    Ramura fara schema trebuie sa taie calea si slash-ul final la fel ca cea cu
    schema. Prima versiune returna "drmax.ro/" pentru intrarea "drmax.ro/" si
    "benvenuti.com/ro" pentru "benvenuti.com/ro" — care nu se potriveau cu
    slug-urile de pe site, deci 84 de programe pareau lipsa cand de fapt existau.
    """
    t = str(text or "").strip().lower()
    m = re.search(r"https?://(?:www\.)?([^/?#]+)", t)
    if m:
        return m.group(1)
    t = t.split("?")[0].split("#")[0].split("/")[0]
    if t.startswith("www."):
        t = t[4:]
    return t if ("." in t and " " not in t) else ""


def main() -> int:
    try:
        from fetch_2p_api import sign_in, fetch_all_pages
    except ImportError as e:
        print(f"Nu pot importa din fetch_2p_api: {e}")
        return 1

    if not sign_in():
        print("Autentificare 2Performant esuata — verifica secretele.")
        return 1

    programe = fetch_all_pages("affiliate/programs", per_page=100)
    print(f"\n  Programe 2Performant in cont : {len(programe)}")

    if not SITE.exists():
        print(f"  {SITE} nu exista — nu pot compara.")
        return 1
    magazine = json.loads(SITE.read_text(encoding="utf-8"))
    pe_site = {domeniu(m.get("magazin")): m for m in magazine if domeniu(m.get("magazin"))}
    print(f"  Magazine pe site             : {len(magazine)}\n")

    lipsa, fara_tracking = [], []
    for p in programe:
        d = domeniu(p.get("url") or p.get("site_url") or p.get("name") or "")
        if not d:
            continue
        m = pe_site.get(d)
        if m is None:
            lipsa.append((d, str(p.get("name") or "?")))
        elif not are_tracking(m.get("url_afiliat") or ""):
            fara_tracking.append((d, (m.get("url_afiliat") or "(gol)")[:56]))

    print("  " + "─" * 74)
    if lipsa:
        print(f"\n  APROBATE DAR FARA PAGINA PE SITE — {len(lipsa)}")
        print("  (program acceptat, deci poti castiga comision, dar n-ai unde trimite lumea)")
        for d, nume in sorted(lipsa)[:40]:
            print(f"     {d:34} {nume[:32]}")
    else:
        print("\n  Fiecare program aprobat are pagina pe site.")

    if fara_tracking:
        print(f"\n  PE SITE DAR FARA TRACKING REAL — {len(fara_tracking)}")
        print("  (pagina exista, dar linkul nu trackuieste: comision 0 la orice click)")
        for d, u in sorted(fara_tracking)[:40]:
            print(f"     {d:34} {u}")
    else:
        print("\n  Fiecare magazin 2Performant de pe site are link cu tracking real.")

    print("\n  " + "─" * 74)
    print("  Lista de programe NOI la care sa aplici NU se poate scoate din API")
    print("  (vezi antetul fisierului). Se ia din 2Performant -> Programe -> Toate.\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
