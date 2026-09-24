# -*- coding: utf-8 -*-
"""Reguli despre produsele din feed, intr-un singur loc.

Le folosesc si cine SCRIE products.json (fetch_product_feeds.py), si paznicul care il
VERIFICA (verifica_site.py). O regula scrisa de doua ori ajunge sa difere: paznicul cere
altceva decat face producatorul si iese rosu la fiecare rulare — s-a intamplat cu
promotiile intre 22 si 24.09.2026. Schimbi aici, se schimba in ambele.
"""

PRET_MINIM_LEI = 1.0


def pret_corupt(produs: dict) -> bool:
    """Pret intre 0 si 1 leu. In retailul online romanesc, unde transportul singur trece de
    15 lei, astea sunt preturi unitare din bax, nu oferte; afisate, dau "0 lei".

    Pretul 0 nu intra aici: e marcajul promo-produselor injectate de
    enrich_products_from_promos.py, care se numara separat."""
    pret = produs.get("price") or 0
    return 0 < pret < PRET_MINIM_LEI
