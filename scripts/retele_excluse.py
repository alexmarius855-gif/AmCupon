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


# ── Ce inseamna un link care CHIAR plateste ──────────────────────────────────
# Semnatura e CALEA, nu domeniul: Impact foloseste zeci de domenii de tracking
# (sjv.io, pxf.io, f9tmep.net, ojrq.net...), dar toate au forma /c/<partner>/<ad>/<campanie>.
# O lista de domenii ar fi ratat tacit jumatate din ele — masurat 20.09, cand un
# filtru pe domenii a raportat 109 linkuri „moarte", dintre care 19 erau valide.
RE_TRACKING_REAL = re.compile(
    r"/c/\d{6,}/\d+"                  # Impact, orice domeniu
    r"|event\.2performant\.com"       # 2Performant
    r"|awin1\.com"                    # Awin
    r"|ojrq\.net",                    # Impact (redirect intermediar)
    re.I,
)


def are_link_care_plateste(m: dict) -> bool:
    """True daca un clic pe magazinul asta poate produce comision."""
    return bool(RE_TRACKING_REAL.search(m.get("url_afiliat") or ""))


def este_magazin_exclus(m: dict) -> bool:
    """True daca magazinul apartine unei retele excluse (dupa platforma SAU dupa link).

    20.09.2026 — s-a adaugat a treia conditie: **linkul nu e de tracking deloc.**
    Masurat pe date: 90 de magazine (9% din site) aveau `url_afiliat` catre pagina
    magazinului, fara niciun parametru de afiliere — Hostinger, Logitech, Razer,
    Upwork, Coursera, Banggood, Norton, ExpressVPN. Verificat pe API-ul Impact:
    NICIUNUL nu are campanie pe contul lui Alex. Erau adaugate speculativ.

    Un clic pe ele nu doar ca nu aduce comision, ci e mai rau decat sa nu existe:
    vizitatorul care chiar voia Hostinger pleaca de pe site, iar noi ramanem si
    fara el, si fara bani. Exact acelasi rationament ca la Profitshare mai sus.

    Regula e pe FORMA linkului, nu pe o lista de magazine: asa prinde si cazurile
    viitoare, fara sa trebuiasca sa le descopere cineva manual a patra oara.
    """
    if (m.get("platforma") or "").strip().lower() in PLATFORME_EXCLUSE:
        return True
    if RE_LINK_EXCLUS.search(m.get("url_afiliat") or ""):
        return True
    return not are_link_care_plateste(m)


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
