"""Regulile programelor 2Performant despre sursele de trafic (06.11.2026).

Fiecare program spune in API ce surse accepta (`most_used_traffic_sources`): site-uri de cupoane, reclame Google
pe cautare, cashback. 33 de programe au „Coupons/Vouchers: no" (Kit Unghii: „nu acceptam site-urile de tip coduri
reducere care se folosesc de numele site-ului nostru"; Vonmag: respinge site-urile care „promoveaza coduri de
reducere"), iar AmCupon le avea pe toate cu pagina „Cod reducere X". O vanzare venita de acolo poate fi respinsa.

`fetch_2p_api.py` scrie regulile in data/2p-reguli.json la fiecare rulare; `merge_platforms.py` scoate din site
magazinele care interzic cupoanele, iar `verifica_site.py` opreste publicarea daca vreunul revine. Cand un program
isi schimba regula, magazinul revine singur la rularea urmatoare.

    python reguli_2p.py --test
"""
from __future__ import annotations

import io
import json
import os
import sys
from datetime import datetime, timezone
from urllib.parse import urlsplit

CALE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "2p-reguli.json")
SURSE = {"cupoane": "Coupons/Vouchers", "google_ads": "Google Ads - search", "cashback": "Cashbacks"}


def cheie(url_sau_domeniu: str) -> str:
    """Domeniul fara www si fara slash: aceeasi forma ca `magazin` din output.json."""
    s = (url_sau_domeniu or "").strip().lower()
    if "://" in s:
        s = urlsplit(s).netloc
    return s.split("/")[0].removeprefix("www.")


def din_programe(programe: list) -> dict:
    """{magazin: {"cupoane": "yes|no|maybe", "google_ads": ..., "cashback": ...}} din raspunsul affiliate/programs."""
    rez = {}
    for p in programe:
        k = cheie(p.get("base_url") or p.get("main_url") or "")
        if not k:
            continue
        surse = p.get("most_used_traffic_sources") or {}
        rez[k] = {nume: str(surse.get(sursa) or "").lower() or None for nume, sursa in SURSE.items()}
    return rez


def scrie(reguli: dict, cale: str = CALE) -> None:
    os.makedirs(os.path.dirname(cale), exist_ok=True)
    with io.open(cale, "w", encoding="utf-8", newline="") as f:
        json.dump({"actualizat": datetime.now(timezone.utc).strftime("%Y-%m-%d"), "magazine": dict(sorted(reguli.items()))},
                  f, ensure_ascii=False, indent=0)


def incarca(cale: str = CALE) -> dict:
    try:
        with io.open(cale, encoding="utf-8") as f:
            return json.load(f).get("magazine") or {}
    except (OSError, ValueError):
        return {}


def interzice_cupoane(magazin: dict, reguli: dict) -> bool:
    """True doar cand programul 2Performant spune explicit NU site-urilor de cupoane. „maybe" se citeste in regulament."""
    if (magazin.get("platforma") or "").lower() != "2performant":
        return False
    for k in (cheie(magazin.get("magazin") or ""), cheie(magazin.get("url") or "")):
        if k and (reguli.get(k) or {}).get("cupoane") == "no":
            return True
    return False


def test() -> int:
    programe = [
        {"base_url": "www.kitunghii.ro", "most_used_traffic_sources": {"Coupons/Vouchers": "no", "Google Ads - search": "maybe"}},
        {"base_url": "otter.ro", "most_used_traffic_sources": {"Coupons/Vouchers": "yes", "Google Ads - search": "yes"}},
        {"main_url": "https://www.brainmarket.ro/", "most_used_traffic_sources": {"Coupons/Vouchers": "maybe"}},
        {"base_url": "fararegula.ro"},
    ]
    r = din_programe(programe)
    asteptari = [
        ("cheia fara www", sorted(r), ["brainmarket.ro", "fararegula.ro", "kitunghii.ro", "otter.ro"]),
        ("NU la cupoane scoate magazinul", interzice_cupoane({"magazin": "kitunghii.ro", "platforma": "2performant"}, r), True),
        ("gasit si dupa adresa", interzice_cupoane({"magazin": "Kit Unghii", "url": "https://www.kitunghii.ro/", "platforma": "2performant"}, r), True),
        ("DA la cupoane ramane", interzice_cupoane({"magazin": "otter.ro", "platforma": "2performant"}, r), False),
        ("POATE nu se scoate automat", interzice_cupoane({"magazin": "brainmarket.ro", "platforma": "2performant"}, r), False),
        ("fara regula declarata ramane", interzice_cupoane({"magazin": "fararegula.ro", "platforma": "2performant"}, r), False),
        ("alta retea nu e judecata dupa 2Performant", interzice_cupoane({"magazin": "kitunghii.ro", "platforma": "impact"}, r), False),
        ("reclamele Google se citesc", r["kitunghii.ro"]["google_ads"], "maybe"),
    ]
    rele = [(n, a, e) for n, a, e in asteptari if a != e]
    for n, a, e in rele:
        print(f"  PICA  {n}: {a!r} (asteptat {e!r})")
    print("TOATE TREC" if not rele else f"{len(rele)} asteptari incalcate")
    return 1 if rele else 0


if __name__ == "__main__":
    if "--test" in sys.argv:
        sys.exit(test())
    reg = incarca()
    nu = sorted(k for k, v in reg.items() if v.get("cupoane") == "no")
    print(f"{len(reg)} programe; interzic site-urile de cupoane: {len(nu)}")
    print(", ".join(nu))
