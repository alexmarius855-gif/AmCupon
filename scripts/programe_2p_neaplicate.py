#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PROGRAME 2PERFORMANT LA CARE NU SUNTEM INCA — ordonate dupa cererea REALA.
==========================================================================

De ce exista scriptul (audit concurenta, 19.08.2026): concurentii au 2.839 de
branduri distincte, din care **2.193 ne lipsesc**, iar 679 apar la cel putin doi
dintre ei. Diferenta nu vine din cod, ci din **cate programe sunt aprobate**.

`fetch_2p_api.py` cere DOAR programele deja acceptate
(`filter[affrequest_status]=accepted`). Scriptul asta cere TOT catalogul si scade
ce avem — deci rezultatul e literalmente **lista de aplicat**, nu o estimare.

Ordonarea nu e alfabetica si nici dupa comision: e dupa **la cati competitori
apare brandul**. Un program pe care il au 4 din 4 e cerere dovedita de piata; unul
pe care nu-l are nimeni e o presupunere.

Ruleaza in GitHub Actions (`.github/workflows/programe-2p-neaplicate.yml`),
fiindca datele de autentificare 2P exista doar in Secrets — acelasi tipar ca
`test-product-feeds.yml`. NU scrie si NU comite nimic: doar afiseaza raportul.
"""

from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

ROOT = Path(__file__).resolve().parent.parent
CERERE = ROOT / "data" / "cerere-concurenta.json"   # brand -> la cati competitori apare


def main() -> int:
    try:
        from fetch_2p_api import sign_in, fetch_all_pages
    except ImportError as e:
        print(f"Nu pot importa din fetch_2p_api: {e}")
        return 1

    if not sign_in():
        print("Autentificare 2Performant esuata — verifica secretele.")
        return 1

    # Catalogul COMPLET (fara filtrul de 'accepted') vs. ce avem deja.
    toate = fetch_all_pages("affiliate/programs", per_page=100)
    acceptate = fetch_all_pages("affiliate/programs", per_page=100,
                                extra_params={"filter[affrequest_status]": "accepted"})
    print(f"\n  Catalog 2Performant : {len(toate)} programe")
    print(f"  Deja acceptate      : {len(acceptate)}")

    def cheie(p: dict) -> str:
        return str(p.get("unique_id") or p.get("id") or p.get("name") or "")

    avem = {cheie(p) for p in acceptate}
    neaplicate = [p for p in toate if cheie(p) not in avem]
    print(f"  NEAPLICATE          : {len(neaplicate)}\n")

    cerere: dict[str, int] = {}
    if CERERE.exists():
        try:
            cerere = json.loads(CERERE.read_text(encoding="utf-8"))
        except Exception:
            cerere = {}

    # Cerere DOVEDITA din Search Console (export 22.08.2026): magazine pentru care
    # Google ne arata deja in rezultate, dar pe care nu le avem. Doua semnale
    # independente pe acelasi brand (Google + competitori) bat un singur semnal.
    CERERE_GSC = {
        "dedeman": 40, "luxurybeauty": 40, "colorcosmetics": 40,
        "dalisticq": 40, "ginsari": 40, "orisee": 40, "olfactiv": 40,
    }

    def _norm(x: str) -> str:
        return re.sub(r"[^a-z0-9]", "", str(x or "").lower())

    def _etichete(p: dict) -> set[str]:
        """Identificatorii unui program: baza domeniului + numele, normalizate."""
        et = set()
        nume = _norm(p.get("name"))
        if nume:
            et.add(nume)
        for camp in ("url", "site_url"):
            v = str(p.get(camp) or "").lower()
            m = re.search(r"https?://(?:www\.)?([^/]+)", v) or re.search(r"^([^/]+)", v)
            if m:
                gazda = m.group(1)
                et.add(_norm(gazda))                    # exemplu.ro   -> exempluro
                et.add(_norm(gazda.split(".")[0]))      # exemplu.ro   -> exemplu
        return {e for e in et if len(e) >= 3}

    def scor_cerere(p: dict) -> int:
        """
        Cati competitori au brandul (+ bonus daca Google ne arata deja pentru el).

        POTRIVIRE EXACTA pe etichete normalizate, NU pe subsir.
        Versiunea initiala folosea `marca in v` — al 6-lea caz al tiparului documentat
        in docs/LECTII-TEHNICE.md, scris chiar in scriptul care trebuia sa gaseasca
        oportunitati. Cu subsir, marca "ana" ar fi prins "banana.ro" si ar fi urcat
        in top un program complet nepotrivit, exact la capatul unde citim raportul.
        """
        et = _etichete(p)
        if not et:
            return 0
        gsc = max((n for marca, n in CERERE_GSC.items() if marca in et), default=0)
        comp = max((n for marca, n in cerere.items() if _norm(marca) in et), default=0)
        return gsc + comp

    neaplicate.sort(key=lambda p: (-scor_cerere(p), str(p.get("name") or "")))

    print(f"  {'PROGRAM':34}{'COMPETITORI':>12}  {'COMISION':>10}  STATUS")
    print("  " + "─" * 76)
    for p in neaplicate[:80]:
        nume = str(p.get("name") or "?")[:33]
        com = str(p.get("commission") or p.get("cpc") or "—")[:9]
        st = str(p.get("affrequest_status") or "neaplicat")[:16]
        n = scor_cerere(p)
        marcaj = "  <<< CERERE DOVEDITA IN GOOGLE" if n >= 40 else ("  <<<" if n >= 3 else "")
        print(f"  {nume:34}{n:>12}  {com:>10}  {st}{marcaj}")

    cu_cerere = sum(1 for p in neaplicate if scor_cerere(p) >= 2)
    print(f"\n  Din cele {len(neaplicate)} neaplicate, {cu_cerere} sunt branduri pe care "
          f"le au CEL PUTIN DOI competitori.")
    print("  Aplica la alea intai — acolo cererea e deja dovedita.\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
