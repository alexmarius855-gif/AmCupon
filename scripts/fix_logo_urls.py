#!/usr/bin/env python3
"""
Repara logo-urile de magazin care nu se mai incarca.

De ce exista (14.08.2026): am testat live toate cele 1167 de `logo_url` din
output.json — 58 raspundeau non-200. Doua clase:

  1. 43 erau DEJA favicon Google (`google.com/s2/favicons?domain=...`) care da 404
     pentru domeniile pe care nu le rezolva. `merge_platforms.py` trimite acolo
     orice logo cu sursa moarta, deci fallback-ul insusi era mort — si nimeni nu
     verifica vreodata rezultatul.
  2. 15 erau URL-uri de brand hardcodate care intre timp au murit
     (revolut.com/favicon.ico, lenovo-logo.png, razer-logo-og.png etc).

Ordinea de reparare: pastreaza ce merge > favicon Google > favicon DuckDuckGo >
gol. Ultimul pas e intentionat: cu `logo_url` gol, cardul afiseaza initialele
magazinului (fallback deja existent in MagazinCard/MagazinClient), ceea ce arata
curat. Un URL rupt lasat in date arata iconita de imagine stricata — mai rau.

Masurat la prima rulare: din cele 58 rupte, DuckDuckGo a recuperat 33; celelalte
25 nu au iconita nicaieri si trec pe initiale.

Ruleaza in pipeline dupa merge_platforms.py, deci se auto-repara continuu.

    python scripts/fix_logo_urls.py [--dry-run]
"""
import json
import re
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

FISIERE = [
    Path(__file__).parent.parent / "frontend" / "public" / "output.json",
]
UA = {"User-Agent": "Mozilla/5.0 (compatible; AmCuponBot/1.0)"}
TIMEOUT = 12

# Prag de siguranta: daca pica retelistica (CI fara iesire, rate limit, DNS),
# aproape toate probele ies non-200 si am goli 1000+ de logo-uri bune. Sub pragul
# asta nu se scrie nimic — acelasi principiu ca guard-ul din fetch_product_feeds.py.
PRAG_ABANDON = 0.30


def domeniu_din(slug: str):
    m = re.search(r"[a-z0-9-]+\.[a-z]{2,}(?:\.[a-z]{2,})?", (slug or ""), re.I)
    return m.group(0) if m else None


def merge(url: str) -> bool:
    """True daca URL-ul chiar intoarce o imagine utilizabila."""
    if not url:
        return False
    try:
        r = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=TIMEOUT)
        if r.status != 200:
            return False
        # sub ~100B nu e o iconita reala, ci un raspuns gol/eroare deghizata
        return len(r.read(100_000)) > 100
    except Exception:
        return False


def repara(m: dict):
    """Returneaza (magazin, url_vechi, url_nou, motiv)."""
    vechi = m.get("logo_url") or ""
    if merge(vechi):
        return (m["magazin"], vechi, vechi, "ok")

    dom = domeniu_din(m.get("magazin", "")) or domeniu_din(m.get("url", ""))
    if dom:
        for candidat, eticheta in (
            (f"https://www.google.com/s2/favicons?domain={dom}&sz=128", "google"),
            (f"https://icons.duckduckgo.com/ip3/{dom}.ico", "duckduckgo"),
        ):
            if candidat != vechi and merge(candidat):
                return (m["magazin"], vechi, candidat, eticheta)

    # nicio sursa — mai bine gol (initiale) decat imagine stricata
    return (m["magazin"], vechi, "", "initiale")


def main():
    dry = "--dry-run" in sys.argv
    for cale in FISIERE:
        if not cale.exists():
            print(f"  (lipseste {cale.name}, sar)")
            continue
        date = json.loads(cale.read_text(encoding="utf-8"))
        mags = date if isinstance(date, list) else list(date.values())[0]

        with ThreadPoolExecutor(max_workers=24) as ex:
            rez = list(ex.map(repara, mags))

        rupte = [r for r in rez if r[3] != "ok"]
        if len(rupte) / max(len(rez), 1) > PRAG_ABANDON:
            print(f"  ABANDON: {len(rupte)}/{len(rez)} logo-uri par rupte — probabil "
                  f"e o problema de retea, nu de date. Nu s-a scris nimic.")
            return 1

        pe_motiv = {}
        for _, _, _, motiv in rez:
            pe_motiv[motiv] = pe_motiv.get(motiv, 0) + 1

        if not dry:
            harta = {r[0]: r[2] for r in rez}
            for m in mags:
                m["logo_url"] = harta.get(m["magazin"], m.get("logo_url", ""))
            cale.write_text(json.dumps(date if isinstance(date, dict) else mags,
                                       ensure_ascii=False, indent=2), encoding="utf-8")

        print(f"{cale.name}: {len(rez)} magazine")
        for motiv, n in sorted(pe_motiv.items(), key=lambda x: -x[1]):
            print(f"  {n:5d}  {motiv}")
        for magazin, v, n, motiv in rupte[:40]:
            print(f"    {magazin:28s} {motiv:10s} {(n or '(gol -> initiale)')[:70]}")
        if dry:
            print("  (--dry-run: nu s-a scris nimic)")
    return 0


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
