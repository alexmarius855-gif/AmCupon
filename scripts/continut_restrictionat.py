"""
Produse care nu intra in listarile GENERALE (prima pagina, /produse, categorii, nise, sectiunile
/top): magazinele din EXCLUSE_ACASA (frontend/lib/oferteAcasa.ts — arme, magazine pentru adulti) si
produsele explicite vandute de alte magazine (vibratoare la un marketplace sau la o farmacie).

De ce (06.10.2026): products.json avea 83 de produse explicite de la intimplay.ro („Dildo realist",
„Gel anal"), plus diblongromania.ro, erosvita.ro si vibratoare de la olmarkt.ro si liki24.ro — iar
catalogul general le afisa oricui. fetch_product_feeds.py le scrie acum separat, in
products-restrictionate.json, pe care il citeste DOAR pagina magazinului respectiv.

Lista de magazine NU se copiaza aici: o citim din oferteAcasa.ts (o singura sursa, ca la
nume_magazin.py). Regula de titlu e ingusta intentionat: prezervativele si lubrifiantul de la
farmacii sunt produse obisnuite de farmacie; „Analog", „bici" (dresaj), „lubrifiant" (auto) au
fost fals-pozitive la prima masuratoare si nu sunt in regula.
"""
from __future__ import annotations

import io
import os
import re

_TS = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                   "frontend", "lib", "oferteAcasa.ts")


def _citeste_excluse() -> frozenset:
    sursa = io.open(_TS, encoding="utf-8").read()
    m = re.search(r"export const EXCLUSE_ACASA[^=]*=\s*new Set\(\[(.*?)\]\)", sursa, re.S)
    if not m:
        raise RuntimeError(f"nu gasesc EXCLUSE_ACASA in {_TS} — s-a schimbat forma fisierului?")
    return frozenset(re.findall(r'"([^"]+)"', m.group(1)))


MAGAZINE_EXCLUSE = _citeste_excluse()

RE_TITLU_EXPLICIT = re.compile(
    r"\b(?:dildo\w*|vibrator\w*|masturbator\w*|plug anal|dop anal|gel anal|lubrifiant anal"
    r"|stimulator (?:clitoridian|intim|de prostata)|jucari[ei] (?:sexual\w*|erotic\w*)"
    r"|papus[aă] gonflabil\w*|bdsm|penis\w*)\b",
    re.I)


def _cheie(p: dict) -> str:
    return (p.get("merchant_slug") or p.get("merchant") or "").strip().lower().rstrip("/")


def e_restrictionat(p: dict) -> bool:
    if _cheie(p) in MAGAZINE_EXCLUSE or (p.get("merchant") or "").strip().lower() in MAGAZINE_EXCLUSE:
        return True
    return bool(RE_TITLU_EXPLICIT.search(p.get("title") or ""))
