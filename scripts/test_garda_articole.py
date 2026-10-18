"""
Test: generatorul articolelor de magazin si garda lor spun acelasi lucru (18.10.2026).

Ruleaza:  python scripts/test_garda_articole.py      (iese cu 1 la prima asteptare incalcata)

De ce exista: 14-17.10.2026, 9 din 10 rulari ale pipeline-ului au iesit ROSII pe
`verifica_promotii.py` cu „articole_vechi 43". Articolele erau CORECTE (regenerate la fiecare rulare,
identice cu ce ar scrie generatorul din datele zilei); garda compara titlul din articol cu `nume`
brut, iar din 07.10 generatorul scoate codul din titlu. A doua oara cand garda e rosie pe date bune
(prima: 22.09, PRAG_DATA_ABSURDA) — de fiecare data pentru ca regula s-a schimbat intr-un loc, nu
si in celalalt. Testul leaga cele doua:
  1. invariant, pe output.json-ul real: un articol proaspat generat din datele magazinului trece garda;
  2. cazurile care au rupt-o (cod in titlu, titlul = codul, separatori ramasi dupa scoaterea codului);
  3. garda tot pica: promotie expirata cu articolul neimprospatat, titlu inventat in articol,
     promotie pentru alta piata ajunsa in articol (18.10.2026, vidaxl.bg in bulgara).
Pica pe garda din 17.10 dimineata (d02a1021): invariantul gaseste zeci de articole „vechi".
Invariantul ruleaza pe output.json trecut prin curata_promotii, ca in pipeline (merge -> curatare ->
generate_blog): fisierul din repo e al rularii de ieri, cu promotii pe care curatarea de azi le scoate.
"""
import copy
import json
import os
import sys
import tempfile

AICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AICI)
from generate_blog import genereaza_articol_magazin  # noqa: E402
from promotii import curata_promotii  # noqa: E402
from verifica_promotii import verifica_articole  # noqa: E402

OUTPUT = os.path.join(AICI, "..", "frontend", "public", "output.json")
LUNA, AN = "Octombrie", 2026

esecuri = 0


def verifica(nume, primit, asteptat):
    global esecuri
    if primit == asteptat:
        print(f"  ok    {nume}")
    else:
        esecuri += 1
        print(f"  PICA  {nume}\n        primit:   {primit!r}\n        asteptat: {asteptat!r}")


def garda(magazine: list, articole: list) -> list:
    with tempfile.TemporaryDirectory() as d:
        cale = os.path.join(d, "blog-posts.json")
        with open(cale, "w", encoding="utf-8") as f:
            json.dump(articole, f, ensure_ascii=False)
        return verifica_articole(magazine, cale)


def articol(store: dict) -> dict:
    return genereaza_articol_magazin(store, LUNA, AN)


with open(OUTPUT, encoding="utf-8") as f:
    brute = [m for m in json.load(f) if isinstance(m, dict)]
magazine = copy.deepcopy(brute)
curata_promotii(magazine)
cu_promotii = [m for m in magazine if m.get("promotii")]

print(f"1. Invariant pe output.json: {len(cu_promotii)} magazine cu promotii")
vechi = garda(magazine, [articol(m) for m in cu_promotii])
verifica("articolele proaspat generate trec garda", vechi[:3], [])

print("2. Formele de titlu care au rupt garda")
baza = copy.deepcopy(cu_promotii[0])
cazuri = {
    "codul in titlu (atelier49)": {"nume": "Reduceri de pana la 50% la ceramica + 10% EXTRA cu cod TESTAT49",
                                   "cod_cupon": "TESTAT49"},
    "titlul e chiar codul (easeus)": {"nume": "HALLO26", "cod_cupon": "HALLO26",
                                      "descriere": "Halloween sale: 55% off la software, pana pe 31.10.2026."},
    "separatori dupa cod (noriel)": {"nume": "20% Reducere la jucarii| NORIEL20 | 19-25.10.2026",
                                     "cod_cupon": "NORIEL20"},
    "spatii duble (brainmarket)": {"nume": "BrainMax  Zinc  1+1 GRATUIT", "cod_cupon": ""},
}
for nume_caz, camp in cazuri.items():
    st = copy.deepcopy(baza)
    st["promotii"] = [{**copy.deepcopy(baza["promotii"][0]), "descriere": "", **camp}]
    verifica(nume_caz, garda([st], [articol(st)]), [])

print("3. Garda inca pica")
st = copy.deepcopy(baza)
st["promotii"] = [{**copy.deepcopy(baza["promotii"][0]), "nume": "Reducere 15% cu cod EXPIRAT15",
                   "cod_cupon": "EXPIRAT15", "descriere": ""}]
art = articol(st)
fara = copy.deepcopy(st)
fara["promotii"] = [{**copy.deepcopy(baza["promotii"][0]), "nume": "Alta oferta de azi", "cod_cupon": ""}]
verifica("promotie disparuta, articol neimprospatat", len(garda([fara], [art])), 1)
inventat = {**art, "content": "**1. Reducere inventata 99% la tot**\n" + art["content"]}
verifica("titlu inventat in articol", len(garda([st], [inventat])), 1)
# Cazul real din 18.10.2026: oferta vidaxl.bg in bulgara, cu leva, listata in articolul romanesc.
bg = copy.deepcopy(st)
bg["promotii"] = [{**copy.deepcopy(baza["promotii"][0]), "cod_cupon": "", "descriere": "",
                   "nume": "Абонирайте се за нашия бюлетин днес & получавате отстъпка от 10 лв. при регистрация!"}]
verifica("promotie in bulgara ajunsa in articol", len(garda([bg], [articol(bg)])), 1)
mx = copy.deepcopy(st)
mx["promotii"] = [{**copy.deepcopy(baza["promotii"][0]), "cod_cupon": "", "descriere": "",
                   "nume": "Ahorra $1,999 MXN en iKier K1 Pro Max 70W con código AFFK11999"}]
verifica("promotie in pesos ajunsa in articol", len(garda([mx], [articol(mx)])), 1)
# Pe datele brute (fara curata_promotii) articolele cu oferte pentru alta piata trebuie prinse.
straine = [m for m in brute if m.get("magazin") in {"vidaxl.bg", "ikier.com", "italki.com"} and m.get("promotii")]
if straine:
    verifica(f"articolele din datele brute ({len(straine)} magazine cu oferte straine) sunt prinse",
             len(garda(brute, [articol(m) for m in straine])) >= len(straine), True)

print(f"\n{'PICAT' if esecuri else 'OK'}: {esecuri} asteptari incalcate")
sys.exit(1 if esecuri else 0)
