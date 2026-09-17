"""
Garda din CI: pica (exit 1) daca site-ul publica o promotie expirata sau un contor de zile fals.

Ruleaza ca ULTIM pas din update-data.yml, cu `if: always()`: nu opreste actualizarea datelor,
dar workflow-ul iese ROSU in loc de verde. Pe 13-16.09.2026 site-ul a afisat 58 de promotii
expirate si un workflow verde — nimic nu verifica ce ajunge efectiv in output.json.

Ce verifica, pe frontend/public/output.json (fisierul pe care il citeste site-ul):
  1. nicio promotie cu `expira` in trecut;
  2. `zile_ramase` = zilele reale pana la `expira` (toleranta o zi: rularea poate trece de miezul noptii);
  3. fara `expira`, niciun contor: `zile_ramase` = FARA_DATA;
  4. flag-urile de magazin (`are_promotie`, `cod_cupon`, `zile_ramase`) spun ce e in promotii;
  5. articolele de magazin din blog nu listeaza promotii care nu mai exista.

Regula si motivul: scripts/promotii.py. Testul care dovedeste ca garda poate pica: rulata pe
output.json de la 16.09.2026 10:41 UTC raporteaza 58 de expirate si pica.

Rulare:  python verifica_promotii.py [--fisier cale] [--azi AAAA-LL-ZZ]
"""

import argparse
import json
import os
import re
import sys

from promotii import FARA_DATA, azi_utc, zile_pana_la

PUBLIC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend", "public")
IMPLICIT = os.path.join(PUBLIC, "output.json")
BLOG = os.path.join(PUBLIC, "blog-posts.json")
# „**1. Numele promotiei**" — asa scrie generate_blog.py blocul de oferte in articolul de magazin.
PROMO_IN_ARTICOL = re.compile(r"\*\*\d+\.\s*(.+?)\*\*")


def verifica_articole(magazine: list, cale_blog: str) -> list:
    """Articolele de magazin nu au voie sa listeze promotii care nu mai exista.
    17.09.2026: articolul Nadula, generat pe 08.09, arata pe pagina magazinului codurile Klaiyi,
    expirate; 21 din 442 de articole erau in situatia asta. Se genereaza o data, nu se reimprospatau."""
    if not os.path.exists(cale_blog):
        return []
    with open(cale_blog, encoding="utf-8") as f:
        posts = json.load(f)
    active = {m.get("magazin"): {(p.get("nume") or "").strip().lower()
                                for p in (m.get("promotii") or []) if isinstance(p, dict)}
              for m in magazine if isinstance(m, dict)}
    gresit = []
    for p in posts:
        if p.get("tip") != "magazin" or p.get("magazin") not in active:
            continue
        for nume in PROMO_IN_ARTICOL.findall(p.get("content") or ""):
            if nume.strip().lower() not in active[p["magazin"]]:
                gresit.append(f"{p.get('slug')}: „{nume[:60]}\" nu mai e o promotie a magazinului")
    return gresit


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
    ap.add_argument("--blog", default=BLOG)
    ap.add_argument("--azi", default=azi_utc())
    args = ap.parse_args()

    with open(args.fisier, encoding="utf-8") as f:
        magazine = json.load(f)
    gresit = verifica(magazine, args.azi)
    gresit["articole_vechi"] = verifica_articole(magazine, args.blog)
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
        if gresit["articole_vechi"]:
            print("Articolele se aduc la zi cu `python generate_blog.py --doar-improspatare` "
                  "(ruleaza la fiecare rulare, dupa import_csv_promotii).")
        return 1
    print("\nOK — nicio promotie expirata, niciun contor fals.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
