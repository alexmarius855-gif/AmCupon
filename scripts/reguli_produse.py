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


# ─── Moneda pretului (27.10.2026) ───────────────────────────────────────────────────────────────
# Feed-urile 2Performant nu spun moneda: API-ul da `price` fara valuta, iar _parse_price scoate orice
# simbol. Pe 27.10 site-ul afisa in LEI preturi in alta moneda: „Shark FlexStyle 6 in 1 ... 319,99 lei"
# pe /cod-reducere/cloud10beauty.com (linkurile au `currency=eur`: ~1.590 lei in realitate), un pulover
# iclothing.com (Irlanda) la „49,99 lei", „Przecinarka do metalu ... 3799" (sklep.evolutionpowertools.com,
# Polonia, in zloti), plus produsele „[DEMO]" ale magazinului de test 2Performant si bigiottos.com (numere in
# loc de titluri, preturi de 1-8). 9 magazine, 348 de produse.
# Regula: un pret se afiseaza in lei doar cand MAGAZINUL are o dovada ca vinde in lei, in ordinea asta:
#   1. `currency=XXX` in linkurile lui (Shopify) — decide singur: RON da, orice alta valuta nu;
#   2. MONEDA_VERIFICATA — verificat de mana, cu sursa;
#   3. domeniu .ro;
#   4. marcaj de Romania in link (ro.store.asus.com, benvenuti.com/ro/, karcher.com/ro/ro/);
#   5. titluri in romana (diacritice sau cuvinte romanesti) la cel putin PRAG_TITLURI_RO din produse.
# Altfel moneda e necunoscuta si produsul cu pret nu se publica. Promo-produsele (pret 0) raman.
import re as _re
from urllib.parse import unquote as _unquote

MONEDA_VERIFICATA = {
    # titluri scurte in engleza (CORTADO, FLAT WHITE); pagina produsului: "priceCurrency":"RON" (27.10.2026)
    "112coffee.com": "RON",
    # IT/birotica, titluri de catalog (MONITOR 34 LG..., CAMERA IP TURRET): doar 6 din 49 trec de PRAG_TITLURI_RO.
    # Pagina produsului: lang="ro-RO", "priceCurrency":"RON", iar pretul de acolo (6,55) e cel din feed (30.10.2026)
    "dacris.net": "RON",
}
PRAG_TITLURI_RO = 0.15
_RE_VALUTA = _re.compile(r"[?&]currency=([a-z]{3})\b", _re.I)
_RE_URL_RO = _re.compile(r"//ro\.|/ro/|/ro-ro/|/ro_ro/|[?&](?:lang|language|locale)=ro\b", _re.I)
_RE_DIACRITICE = _re.compile(r"[ăâîșțşţ]", _re.I)
_RE_CUVINTE_RO = _re.compile(
    r"\b(pentru|si|cu|din|marime|culoare|barbati|femei|dama|copii|bucati|negru|negre|alb|alba|rosu|"
    r"verde|albastru|saltea|perna|husa|cana|rochie|camasa|pantofi|cizme|geanta|carte|caiet|jucarie|"
    r"crema|sampon|ulei|apa de|set de)\b", _re.I)


def _linkuri(p: dict) -> str:
    return " ".join(_unquote(_unquote(p.get(k) or "")) for k in ("url", "url_original"))


def titlu_romanesc(titlu: str) -> bool:
    return bool(_RE_DIACRITICE.search(titlu or "") or _RE_CUVINTE_RO.search(titlu or ""))


def moneda_magazin(slug: str, produse: list):
    """„RON", alta valuta („EUR"), sau None (necunoscuta) — pentru produsele CU PRET ale magazinului."""
    slug = (slug or "").lower().rstrip("/")
    cu_pret = [p for p in produse if (p.get("price") or 0) > 0]
    valute = {v.upper() for p in cu_pret for v in _RE_VALUTA.findall(_linkuri(p))}
    if valute:
        return "RON" if valute == {"RON"} else sorted(valute - {"RON"})[0]
    if slug in MONEDA_VERIFICATA:
        return MONEDA_VERIFICATA[slug]
    if slug.endswith(".ro"):
        return "RON"
    if not cu_pret:
        return "RON"  # nimic de afisat in lei
    if any(_RE_URL_RO.search(_linkuri(p)) for p in cu_pret):
        return "RON"
    if sum(titlu_romanesc(p.get("title")) for p in cu_pret) / len(cu_pret) >= PRAG_TITLURI_RO:
        return "RON"
    return None


def preturi_in_alta_moneda(produse: list) -> dict:
    """{magazin: (moneda sau None, cate produse cu pret)} pentru magazinele ale caror preturi NU sunt in lei."""
    pe_magazin: dict = {}
    for p in produse:
        pe_magazin.setdefault((p.get("merchant_slug") or p.get("merchant") or "").lower().rstrip("/"), []).append(p)
    rez = {}
    for slug, lista in pe_magazin.items():
        moneda = moneda_magazin(slug, lista)
        if moneda != "RON":
            rez[slug] = (moneda, sum(1 for p in lista if (p.get("price") or 0) > 0))
    return rez
