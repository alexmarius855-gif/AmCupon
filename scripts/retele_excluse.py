#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RETELE DE AFILIERE EXCLUSE — sursa unica de adevar.
===================================================

**Profitshare, exclus complet din 19.08.2026**: contul lui Alex a fost RESPINS,
deci linkurile lor nu mai platesc niciun comision. A le lasa pe site inseamna sa
trimitem trafic gratis catre 60 de magazine (inclusiv eMAG, care era EXCLUSIV pe
Profitshare) fara sa castigam nimic — exact tiparul de "money leak" pe care
proiectul l-a reparat de trei ori pana acum.

DE CE E UN MODUL SEPARAT, si nu o conditie scrisa in fiecare script:
`merge_platforms.py` e **auto-referential** (`data/output.json` e simultan intrare
SI iesire). O curatare facuta o singura data e stearsa de urmatoarea rulare a
cron-ului de 4h, iar magazinele reapar tacit. De-aia excluderea sta AICI si e
importata de toti consumatorii — o singura lista, aplicata la fiecare rulare.

Daca se reia vreodata colaborarea cu Profitshare: scoate "profitshare" din
`PLATFORME_EXCLUSE`, scoate tiparul din `RE_LINK_EXCLUS`, repune pasul
`process_profitshare.py` in `.github/workflows/update-data.yml` si scoate
redirectarile 301 din `frontend/next.config.ts`. Nimic altceva nu trebuie atins.
"""

from __future__ import annotations

import re

# Valori de `platforma` care nu mai au voie in date.
PLATFORME_EXCLUSE = {"profitshare"}

# Linkuri de tracking ale retelelor excluse — prinde si intrarile vechi la care
# `platforma` s-a pierdut sau a fost rescrisa de vreun import.
RE_LINK_EXCLUS = re.compile(r"profitshare\.ro", re.I)


def este_magazin_exclus(m: dict) -> bool:
    """True daca magazinul apartine unei retele excluse (dupa platforma SAU dupa link)."""
    if (m.get("platforma") or "").strip().lower() in PLATFORME_EXCLUSE:
        return True
    return bool(RE_LINK_EXCLUS.search(m.get("url_afiliat") or ""))


def este_produs_exclus(p: dict, sluguri_excluse: set[str] | None = None) -> bool:
    """
    True daca produsul duce catre o retea exclusa.

    Se verifica SI linkul, SI magazinul: in `products.json` linkul de tracking
    poate lipsi la unele intrari, iar apartenenta se vede doar din `merchant_slug`.
    """
    for cheie in ("url", "aff_code", "link", "url_afiliat"):
        if RE_LINK_EXCLUS.search(str(p.get(cheie) or "")):
            return True
    if sluguri_excluse and (p.get("merchant_slug") or "") in sluguri_excluse:
        return True
    return False
