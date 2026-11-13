"""Carantina datelor de la retele: un produs sau o oferta cu text stricat iese singura, restul site-ului se publica.

DE CE (13.11.2026): intre 07 si 13.11 publicarea s-a oprit de sase ori din cauza unui singur rand venit din feed-ul
altui magazin: „Training Day - Ra�l The Third" (caracter pierdut la sursa), „CPA TOYS". Garda finala
(verifica_text.py) avea dreptate sa nu-l publice, dar un rand strain bloca tot site-ul, iar studiul Black Friday
a pierdut zile. Asa lucreaza oricine primeste date de la altii: le curata la intrare, nu la iesire.

CE FACE: citeste fisierele publice cu date de la retele si scoate elementele (produse, oferte, campanii) al caror text
afisat are caractere stricate sau valori tehnice, cu ACELEASI reguli ca garda finala (verifica_text.REGULI).
La magazinele de pe primul nivel (output.json, nav-index.json, recomandate.json) nu scoate magazinul (i-ar disparea
pagina), ci goleste campul stricat. Textul nostru (articole, pagini) NU trece pe aici: acolo garda opreste publicarea.

SIGURANTA: daca dintr-un fisier ar iesi mai mult de 2% din elemente (minim 20), nu e un rand rau, e o sursa stricata:
iese cu cod 1 si publicarea se opreste, ca inainte.

    python carantina_date.py          # in pipeline, inainte de generatoare si inainte de build
    python carantina_date.py --test   # verificari care trebuie sa poata pica
"""
from __future__ import annotations

import io
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from verifica_text import REGULI  # noqa: E402

PUBLIC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend", "public")
FISIERE = ["products.json", "output.json", "criterii.json", "nav-index.json", "products-home.json", "scaderi-pret.json",
           "istoric-promotii.json", "black-friday-parteneri.json", "recomandate.json", "top-produse.json"]
# Primul nivel = magazine: nu le scoatem (pagina lor ar da 404), doar golim campul stricat.
MAGAZINE_PE_PRIMUL_NIVEL = {"output.json", "nav-index.json", "recomandate.json"}
AFISATE = {"title", "titlu", "nume", "name", "descriere", "description", "descriere_publica", "oferta", "text", "brand",
           "titlu_promotie", "subtitlu", "eticheta"}
REGULI_DATE = [(n, r) for n, r in REGULI if n in ("caractere stricate", "valoare tehnica")]
PRAG_PROCENT, PRAG_MINIM = 0.02, 20


def motiv(text) -> str:
    if not isinstance(text, str):
        return ""
    for nume, regula in REGULI_DATE:
        if regula.search(text):
            return nume
    return ""


def rau_in(element: dict) -> str:
    """Motivul, daca un camp afisat al elementului (doar al lui, nu al copiilor) e stricat."""
    for k, v in element.items():
        if k in AFISATE:
            m = motiv(v)
            if m:
                return f"{m} in campul {k}: {v[:70]!r}"
    return ""


def curata(nod, fisier: str, jurnal: list, nivel: int = 0):
    """Intoarce nodul curatat. Scoate elementele stricate din liste; magazinele de pe primul nivel raman, cu campul golit."""
    if isinstance(nod, list):
        pastrate = []
        for x in nod:
            if isinstance(x, dict):
                r = rau_in(x)
                if r and nivel == 0 and fisier in MAGAZINE_PE_PRIMUL_NIVEL:
                    for k, v in list(x.items()):
                        if k in AFISATE and motiv(v):
                            x[k] = ""
                    jurnal.append(("golit", fisier, r))
                elif r:
                    jurnal.append(("scos", fisier, r))
                    continue
            pastrate.append(curata(x, fisier, jurnal, nivel + 1))
        return pastrate
    if isinstance(nod, dict):
        return {k: curata(v, fisier, jurnal, nivel + 1) for k, v in nod.items()}
    return nod


def numara(nod) -> int:
    if isinstance(nod, list):
        return sum(1 + numara(x) if isinstance(x, dict) else numara(x) for x in nod)
    if isinstance(nod, dict):
        return sum(numara(v) for v in nod.values())
    return 0


def carantina(director: str = PUBLIC) -> int:
    total, oprit = 0, False
    for f in FISIERE:
        cale = os.path.join(director, f)
        if not os.path.exists(cale):
            continue
        date = json.load(io.open(cale, encoding="utf-8"))
        jurnal: list = []
        curate = curata(date, f, jurnal)
        scoase = sum(1 for j in jurnal if j[0] == "scos")
        if not jurnal:
            continue
        for actiune, _, r in jurnal[:15]:
            print(f"  {f}: {actiune} — {r}")
        if len(jurnal) > 15:
            print(f"  {f}: ... inca {len(jurnal) - 15}")
        elemente = numara(date)
        if scoase > max(PRAG_MINIM, PRAG_PROCENT * elemente):
            print(f"::error::{f}: {scoase} din {elemente} elemente ar iesi in carantina. Nu e un rand rau, e o sursa stricata: "
                  "fisierul ramane neatins si publicarea se opreste.")
            oprit = True
            continue
        io.open(cale, "w", encoding="utf-8", newline="").write(json.dumps(curate, ensure_ascii=False, separators=(",", ":")))
        total += len(jurnal)
    if oprit:
        print("Carantina: sursa stricata, publicarea se opreste (vezi eroarea de mai sus).")
    else:
        print(f"Carantina: {total} elemente scoase sau golite." if total else "Carantina: nimic stricat in datele de la retele.")
    return 1 if oprit else 0


def test() -> int:
    import tempfile

    rele = []

    def v(nume, actual, asteptat):
        if actual != asteptat:
            rele.append(f"  PICA  {nume}: {actual!r} (asteptat {asteptat!r})")

    with tempfile.TemporaryDirectory() as d:
        prod = [{"title": f"Carte {i}", "price": 10} for i in range(60)] + [{"title": "Training Day - Ra�l The Third", "price": 50}]
        json.dump({"updated": "x", "products": prod}, io.open(os.path.join(d, "products.json"), "w", encoding="utf-8"))
        mag = [{"magazin": "a.ro", "descriere": "Jusqu'Ã  45 % de rÃ©duction", "promotii": [{"nume": "Bun"}, {"nume": "undefined"}]},
               {"magazin": "b.ro", "descriere": "Corect"}]
        json.dump(mag, io.open(os.path.join(d, "output.json"), "w", encoding="utf-8"))
        json.dump({"criterii": [{"slug": "x", "produse": [{"titlu": "Inel argint"}, {"titlu": "Inel cu piatrÃ© naturala"}]}]},
                  io.open(os.path.join(d, "criterii.json"), "w", encoding="utf-8"))
        cod = carantina(d)
        p = json.load(io.open(os.path.join(d, "products.json"), encoding="utf-8"))["products"]
        o = json.load(io.open(os.path.join(d, "output.json"), encoding="utf-8"))
        c = json.load(io.open(os.path.join(d, "criterii.json"), encoding="utf-8"))["criterii"][0]["produse"]
        v("produsul cu caracter pierdut iese", any("�" in x["title"] for x in p), False)
        v("produsele bune raman", len(p), 60)
        v("magazinul ramane", [m["magazin"] for m in o], ["a.ro", "b.ro"])
        v("descrierea stricata a magazinului e golita", o[0]["descriere"], "")
        v("oferta undefined iese, cea buna ramane", [x["nume"] for x in o[0]["promotii"]], ["Bun"])
        v("produsul de pe /alege cu mojibake iese", [x["titlu"] for x in c], ["Inel argint"])
        v("cod 0 cand sunt doar cateva randuri rele", cod, 0)
        # Sursa stricata: peste prag nu se scoate nimic, iar publicarea se opreste.
        multe = [{"title": f"Produs {i} �"} for i in range(40)] + [{"title": f"Bun {i}"} for i in range(40)]
        json.dump({"products": multe}, io.open(os.path.join(d, "products.json"), "w", encoding="utf-8"))
        v("sursa stricata opreste publicarea", carantina(d), 1)
        v("sursa stricata ramane neatinsa", len(json.load(io.open(os.path.join(d, "products.json"), encoding="utf-8"))["products"]), 80)
    for r in rele:
        print(r)
    print("TOATE TREC" if not rele else f"{len(rele)} asteptari incalcate")
    return 1 if rele else 0


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(test() if "--test" in sys.argv else carantina())
