#!/usr/bin/env python3
"""
Sonda: CE endpoint 2Performant returneaza catalogul COMPLET de programe?

De ce exista fisierul asta: `programe_2p_neaplicate.py` cerea
`affiliate/programs` fara filtru, presupunand ca asa vine tot catalogul.
Rularea din 22.08.2026 a aratat ca nu e asa — 513 programe fara filtru,
513 cu `filter[affrequest_status]=accepted`. Identice. Adica endpointul
returneaza DOAR relatiile contului, indiferent de filtru.

Fara catalogul complet nu exista lista de aplicat, deci intrebarea merita
un raspuns masurat, nu inca o presupunere. Sonda incearca mai multe
combinatii intr-o SINGURA rulare si raporteaza ce a intors fiecare.

Nu scrie nimic si nu modifica nimic. Doar citeste si tipareste.
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))


def sonda(fetch, eticheta: str, endpoint: str, params: dict | None = None) -> None:
    try:
        rez = fetch(endpoint, per_page=100, extra_params=params) or []
    except Exception as e:                      # noqa: BLE001 - vrem sa vedem orice
        print(f"  {eticheta:44} EROARE: {type(e).__name__}: {e}")
        return

    n = len(rez)
    exemplu = ""
    if n:
        p = rez[0]
        nume = p.get("name") or p.get("title") or "?"
        stare = p.get("affrequest_status") or p.get("status") or "-"
        exemplu = f"  | primul: {str(nume)[:26]} ({stare})"
    print(f"  {eticheta:44} {n:>5} rezultate{exemplu}")


def main() -> int:
    try:
        from fetch_2p_api import sign_in, fetch_all_pages
    except ImportError as e:
        print(f"Nu pot importa din fetch_2p_api: {e}")
        return 1

    if not sign_in():
        print("Autentificare 2Performant esuata.")
        return 1

    print("\n  Sonda catalog 2Performant — ce returneaza fiecare varianta\n")
    print("  " + "─" * 78)

    # 1. acelasi endpoint, statusuri diferite
    for st in (None, "accepted", "pending", "rejected", "not_requested", "available"):
        eticheta = "affiliate/programs (fara filtru)" if st is None else f"affiliate/programs status={st}"
        params = None if st is None else {"filter[affrequest_status]": st}
        sonda(fetch_all_pages, eticheta, "affiliate/programs", params)

    # 2. endpointuri alternative plauzibile pentru catalogul public
    for ep in ("affiliate/advertisers", "affiliate/campaigns",
               "affiliate/programs/available", "advertisers", "campaigns"):
        sonda(fetch_all_pages, f"endpoint: {ep}", ep)

    print("  " + "─" * 78)
    print("\n  Ce cautam: o varianta care intoarce SEMNIFICATIV mai mult de 513.")
    print("  Daca niciuna nu o face, catalogul complet nu e expus prin API si")
    print("  lista de aplicat trebuie luata din interfata web 2Performant.\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
