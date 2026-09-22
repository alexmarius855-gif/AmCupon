"""
campuri_interzise.py — scoate din date campurile FABRICATE, la fiecare merge.

DE CE EXISTA (22.09.2026, a cincea reaparitie a aceleiasi fabricatii):
  `procent_succes` si `folosit_de` erau `random.Random(hash(magazin)).randint(...)` —
  numere inventate care au fost afisate ca „rata de succes" si „folosit de N ori".
  Scoase din AFISARE pe 03.07, din generatorul 2P pe 07.09 — si tot au revenit,
  fiindca `data/extra_merchants.json` (604 din 615 magazine) le pastra din 2026,
  iar sase alte importatoare le scriau mai departe, inclusiv unul cu `random` viu
  in pipeline (`import_csv_promotii.py`, la FIECARE rulare).

  Curatarea partiala a fost mai rea decat nimic: patru canale de promovare filtrau
  `procent_succes >= 50`, deci magazinele CURATE cadeau pe `.get(..., 0)` si erau
  excluse. Masurat pe datele din 22.09: 16 din 65 de magazine cu oferta reala,
  toate romanesti (otter.ro, regata.ro, labelshop.ro, craftup.ro). Filtrul nu
  selecta nimic — penaliza onestitatea.

DE CE AICI, si nu in fiecare importator:
  `data/output.json` si `data/extra_merchants.json` sunt SI intrare SI iesire
  (LECTII-TEHNICE #5). O curatare facuta o singura data se pierde la urmatoarea
  rulare. Merge-ul e insa pasul final prin care trece ORICE importator — vechi,
  nou, sau scris de mana. Acelasi tipar ca `promotii.curata_promotii()` si
  `link_oferta.link_potrivit()`: garda sta in gatuitura, nu in fiecare afluent.

CE NU E AICI: `scor_final` si `scor_afiliere` RAMAN — sunt reale (promotie + cod +
urgenta, fara random). Se scoate ce e inventat, nu ce e calculat.
"""

# Campuri care nu au voie sa existe in date. Cheia = numele campului, valoarea =
# de ce. Cand gasesti altul fabricat, adauga-l AICI si moare la urmatorul merge.
CAMPURI_FABRICATE = {
    "procent_succes": "random.Random(hash(magazin)).randint(72, 96) — afisat ca „rata de succes”",
    "folosit_de":     "random.Random(hash(magazin)).randint(15, 800) — afisat ca „folosit de N ori”",
}


def curata_campuri_fabricate(magazine: list) -> dict:
    """Scoate campurile inventate din fiecare magazin. Intoarce {camp: cate_scoase}."""
    scoase = {c: 0 for c in CAMPURI_FABRICATE}
    for m in magazine:
        for camp in CAMPURI_FABRICATE:
            if camp in m:
                del m[camp]
                scoase[camp] += 1
    return scoase


def raport(scoase: dict) -> str:
    total = sum(scoase.values())
    if not total:
        return "campuri fabricate: 0 (curat)"
    detaliu = ", ".join(f"{c} x{n}" for c, n in scoase.items() if n)
    return f"campuri fabricate scoase: {total} ({detaliu})"
