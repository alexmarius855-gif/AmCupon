"""
Numele afisabil al unui magazin, pentru scripturile Python — ACELASI rezultat ca `numeAfisat()`
din frontend/lib/numeMagazin.ts.

De ce (06.10.2026): generate_blog.py, generate_daily_digest.py, generate_evergreen.py si
generate_banner_gallery.py aveau fiecare copia lor naiva, `magazin.split(".")[0]`. Pe site iesea
„Cod Reducere Us Octombrie 2026" (us.lemorele.com) si „Wr", „Sg" — exact bug-ul reparat in TS pe
22.09, ramas in Python pentru ca listele erau duplicate (docs/LECTII-TEHNICE.md, tiparul #3).

Sursa unica raman constantele din numeMagazin.ts (NUME_OVERRIDE, PREFIXE_NEUTRE, REGIUNI): le
citim de acolo, nu le copiem. Testul `python scripts/test_nume_magazin.py` compara numele din
Python cu cele din TS (prin node) pe toate magazinele din output.json.
"""
from __future__ import annotations

import io
import os
import re

_TS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                   "frontend", "lib", "numeMagazin.ts")


def _citeste_constante() -> tuple[dict, set, set]:
    sursa = io.open(_TS, encoding="utf-8").read()

    def set_ts(nume: str) -> set:
        m = re.search(rf"const {nume}\s*=\s*new Set\(\[(.*?)\]\)", sursa, re.S)
        if not m:
            raise RuntimeError(f"nu gasesc {nume} in {_TS} — s-a schimbat forma fisierului?")
        return set(re.findall(r'"([^"]+)"', m.group(1)))

    m = re.search(r"const NUME_OVERRIDE[^=]*=\s*\{(.*?)\};", sursa, re.S)
    if not m:
        raise RuntimeError(f"nu gasesc NUME_OVERRIDE in {_TS}")
    override = dict(re.findall(r'"([^"]+)"\s*:\s*"([^"]+)"', m.group(1)))
    return override, set_ts("PREFIXE_NEUTRE"), set_ts("REGIUNI")


NUME_OVERRIDE, PREFIXE_NEUTRE, REGIUNI = _citeste_constante()


def _capitalizeaza(s: str) -> str:
    return " ".join(w[:1].upper() + w[1:] for w in s.replace("-", " ").split(" ") if w)


def eticheta_regiune(magazin: str) -> str | None:
    parti = [p for p in (magazin or "").lower().split(".") if p]
    if len(parti) < 2:
        return None
    if parti[0] in REGIUNI:
        return parti[0].upper()
    if parti[-1] in REGIUNI:
        return parti[-1].upper()
    return None


def nume_afisat(magazin: str) -> str:
    if not magazin:
        return ""
    if magazin in NUME_OVERRIDE:
        return NUME_OVERRIDE[magazin]
    parti = [p for p in magazin.lower().split(".") if p]
    if not parti:
        return ""
    i = 0
    while i < len(parti) - 2 and parti[i] in PREFIXE_NEUTRE:
        i += 1
    baza = _capitalizeaza(parti[i] or parti[0])
    reg = eticheta_regiune(magazin)
    return f"{baza} {reg}" if reg else baza
