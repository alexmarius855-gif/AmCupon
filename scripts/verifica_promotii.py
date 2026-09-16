"""
Garda din CI: pica (exit 1) daca site-ul publica o promotie expirata sau un contor de zile fals.

Ruleaza ca ULTIM pas din update-data.yml, cu `if: always()`: nu opreste actualizarea datelor,
dar workflow-ul iese ROSU in loc de verde. Pe 13-16.09.2026 site-ul a afisat 58 de promotii
expirate si un workflow verde — nimic nu verifica ce ajunge efectiv in output.json.

Ce verifica, pe frontend/public/output.json (fisierul pe care il citeste site-ul):
  1. nicio promotie cu `expira` in trecut;
  2. `zile_ramase` = zilele reale pana la `expira` (toleranta o zi: rularea poate trece de miezul noptii);
  3. fara `expira`, niciun contor: `zile_ramase` = FARA_DATA;
  4. flag-urile de magazin (`are_promotie`, `cod_cupon`, `zile_ramase`) spun ce e in promotii.

Regula si motivul: scripts/promotii.py. Testul care dovedeste ca garda poate pica: rulata pe
output.json de la 16.09.2026 10:41 UTC raporteaza 58 de expirate si pica.

Rulare:  python verifica_promotii.py [--fisier cale] [--azi AAAA-LL-ZZ]
"""

import argparse
import json
import os
import sys

from promotii import FARA_DATA, azi_utc, zile_pana_la

IMPLICIT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend", "public", "output.json")


def verifica(magazine: list, azi: str) -> dict:
    gresit = {"expirate": [], "contor_gresit": [], "contor_fara_data": [], "flaguri": []}
    for m in magazine:
        if not isinstance(m, dict):
            continue
        slug = m.get("magazin", "?")
        promotii = [p for p in (m.get("promotii") or []) if isinstance(p, dict)]
        for p in promotii:
            zile = zile_pana_la(p.get("expira"), azi)
            eticheta = f"{slug}: {(p.get('nume') or '')[:50]}"
            if zile is None:
                if p.get("zile_ramase") != FARA_DATA:
                    gresit["contor_fara_data"].append(f"{eticheta} (zile_ramase={p.get('zile_ramase')})")
            elif zile < 0:
                gresit["expirate"].append(f"{eticheta} (expira {p.get('expira')})")
            elif not isinstance(p.get("zile_ramase"), int) or abs(p["zile_ramase"] - zile) > 1:
                gresit["contor_gresit"].append(f"{eticheta} (zile_ramase={p.get('zile_ramase')}, real {zile})")
        asteptat = (
            bool(promotii),
            any((p.get("cod_cupon") or "").strip() for p in promotii),
        )
        if (bool(m.get("are_promotie")), bool(m.get("cod_cupon"))) != asteptat:
            gresit["flaguri"].append(f"{slug} (are_promotie={m.get('are_promotie')}, cod_cupon={m.get('cod_cupon')}, "
                                     f"promotii={len(promotii)})")
    return gresit


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[1])
    ap.add_argument("--fisier", default=IMPLICIT)
    ap.add_argument("--azi", default=azi_utc())
    args = ap.parse_args()

    with open(args.fisier, encoding="utf-8") as f:
        magazine = json.load(f)
    gresit = verifica(magazine, args.azi)
    total = sum(len(v) for v in gresit.values())
    promotii = sum(len(m.get("promotii") or []) for m in magazine if isinstance(m, dict))
    print(f"Verificare promotii pe {len(magazine)} magazine, {promotii} promotii, azi = {args.azi}")
    for cheie, lista in gresit.items():
        print(f"  {cheie:18} {len(lista)}")
        for x in lista[:10]:
            print(f"      {x}")
    if total:
        print(f"\nPICAT: {total} probleme. Site-ul arata promotii expirate sau contoare false.")
        print("Promotiile trec prin scripts/promotii.py::curata_promotii la merge — cauta cine scrie "
              "output.json DUPA el, sau cine a ocolit-o.")
        return 1
    print("\nOK — nicio promotie expirata, niciun contor fals.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
