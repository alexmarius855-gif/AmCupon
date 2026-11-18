"""
Semintele cercetarii: inceputurile de cautare pe care le dam motoarelor, ca sa vedem cum le completeaza.

Grupuri:
  alfabet     „cod reducere a", „voucher b", „black friday c"... -> ce magazine cauta oamenii (si pe care nu le avem)
  magazin     „cod reducere <magazinul nostru>" -> exista cerere pentru paginile noastre de magazin?
  magazin_sp  „<magazin> " -> ce adauga oamenii langa nume (cod, pareri, retur, black friday)
  concurenta  „cod reducere <magazin acoperit de concurenta, pe care nu-l avem>"
  produs      „<produs>", „<produs> black friday", „<produs> reducere" -> ce se cauta in jurul produselor
  sezon       Black Friday, Craciun, cadouri
  intrebare   „cum aleg", „merita" -> intrebari reale, adica hook-uri pentru articole si video

Ordinea conteaza: daca un motor ne opreste la jumatate, raman facute cele mai importante.

    python scripts/v2/research/seminte.py --iesire research-out/seminte.json [--max-magazine 400]
"""
from __future__ import annotations

import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comun import (DATA, PUBLIC, Magazine, are_link_platit, citeste_json, compact,  # noqa: E402
                   nume_afisat, norm)

LITERE = "abcdefghijklmnopqrstuvwxyz"
PREFIXE_ALFABET = ["cod reducere", "voucher", "cod promotional", "black friday"]

# Tipuri de produs: ce scriu oamenii (singular, fara diacritice) -> pagina noastra care raspunde.
# Primele 30 sunt paginile /top; restul sunt ce vand partenerii de fapt (carti, incaltaminte, farmacie,
# jucarii, moda: acolo sunt vanzarile din retea) si sezonul.
PRODUSE = [
    ("laptop", "/top/laptopuri"), ("telefon", "/top/telefoane"), ("casti wireless", "/top/casti-wireless"),
    ("televizor", "/top/televizoare"), ("aspirator robot", "/top/aspiratoare-robot"),
    ("friteuza cu aer", "/top/friteuze"), ("smartwatch", "/top/smartwatch-uri"), ("monitor", "/top/monitoare"),
    ("espressor", "/top/cafetiere"), ("masina de spalat", "/top/masini-de-spalat"),
    ("robot de bucatarie", "/top/roboti-de-bucatarie"), ("purificator aer", "/top/purificatoare-aer"),
    ("scaun gaming", "/top/scaune-gaming"), ("bicicleta electrica", "/top/biciclete-electrice"),
    ("parfum dama", "/top/parfumuri-femei"), ("parfum barbati", "/top/parfumuri-barbati"),
    ("pantofi sport", "/top/pantofi-sport"), ("geanta dama", "/top/genti-dama"),
    ("bijuterii argint", "/top/bijuterii-argint"), ("jucarii copii", "/top/jucarii-copii"),
    ("proteine", "/top/suplimente-fitness"), ("scaun birou", "/top/scaune-birou"), ("tableta", "/top/tablete"),
    ("casti gaming", "/top/casti-gaming"), ("imprimanta", "/top/imprimante"), ("camera actiune", "/top/camere-actiune"),
    ("aer conditionat", "/top/aer-conditionat"), ("aspirator vertical", "/top/aspiratoare-fara-fir"),
    ("boxa bluetooth", "/top/boxe-bluetooth"), ("trotineta electrica", "/top/trotinete-electrice"),
    ("carti", None), ("ghete dama", None), ("cizme dama", None), ("adidasi", None), ("geaca iarna", None),
    ("rochii", None), ("vitamina d", None), ("magneziu", None), ("colagen", None), ("lego", None),
    ("jocuri de societate", None), ("puzzle", None), ("brad artificial", None), ("instalatie craciun", None),
    ("hrana pisici", None), ("hrana caini", None), ("anvelope iarna", None), ("saltea", None),
    ("lenjerie de pat", None), ("carucior copii", None), ("scaun auto copii", None), ("ceas barbati", None),
]
MODIFICATORI_PRODUS = ["{}", "{} black friday", "{} reducere"]

SEZON = ["black friday", "black friday 2026", "black friday romania", "cyber monday", "cod reducere black friday",
         "reduceri black friday", "cadouri craciun", "cadou craciun pentru", "idei cadouri", "cadou pentru ea",
         "cadou pentru el", "reduceri craciun", "cod reducere craciun", "oferte zilei", "reduceri azi"]
INTREBARI = ["cum aleg", "ce sa cumpar", "merita sa cumpar", "unde gasesc ieftin", "care este cel mai bun",
             "cum economisesti la cumparaturi", "cum folosesc un cod de reducere", "de ce nu merge codul de reducere",
             "ce este cashback", "cum aflu daca o reducere e reala"]

M_ALFABET = ["google", "bing", "ddg"]
M_TOATE = ["google", "bing", "ddg"]
M_VIDEO = ["google", "bing", "ddg", "youtube"]


def construieste(max_magazine: int = 300, max_spatiu: int = 80, max_concurenta: int = 200) -> list[dict]:
    mg = Magazine()
    seminte: list[dict] = []
    vazute: set[str] = set()

    def adauga(text: str, grup: str, motoare: list[str], **extra):
        # „regata " (cu spatiu) cere motorului ce vine DUPA nume: cod, pareri, retur, black friday.
        t = norm(text) + (" " if text.endswith(" ") else "")
        if not t.strip() or t in vazute:
            return
        vazute.add(t)
        seminte.append({"text": t, "grup": grup, "motoare": motoare, **extra})

    # 1. Alfabet: intai prefixele simple, apoi literele.
    for p in PREFIXE_ALFABET:
        adauga(p, "alfabet", M_ALFABET, prefix=p)
    for p in PREFIXE_ALFABET:
        for lit in LITERE:
            adauga(f"{p} {lit}", "alfabet", M_ALFABET, prefix=p)

    # 2. Sezonul si intrebarile (putine, valoroase acum).
    for s in SEZON:
        adauga(s, "sezon", M_VIDEO)
    for s in INTREBARI:
        adauga(s, "intrebare", ["google", "bing", "youtube"])

    # 3. Magazinele noastre cu link platit: .ro intai, apoi cele cu oferta, apoi scorul.
    platite = [m for m in mg.site.values() if are_link_platit(m)]
    platite.sort(key=lambda m: (not (m.get("magazin") or "").endswith(".ro"), not m.get("are_promotie"),
                                -(m.get("scor_final") or 0)))
    for m in platite[:max_magazine]:
        dom = m["magazin"]
        nume = norm(nume_afisat(dom))
        if len(compact(nume)) < 3:
            continue
        adauga(f"cod reducere {nume}", "magazin", M_TOATE, magazin=dom)
    for m in platite[:max_spatiu]:
        dom = m["magazin"]
        nume = norm(nume_afisat(dom))
        if len(compact(nume)) >= 4:
            adauga(f"{nume} ", "magazin_sp", ["google", "bing"], magazin=dom)

    # 4. Concurenta: magazinele acoperite de cel putin 3 concurenti, pe care nu le avem pe site.
    conc = citeste_json(os.path.join(DATA, "cerere-concurenta.json"), {}) or {}
    n_conc = 0
    for slug, acoperire in sorted(conc.items(), key=lambda kv: (-int(kv[1] or 0), kv[0])):
        nume = norm(slug.replace("-", " "))
        if mg.gaseste(nume) or len(compact(nume)) < 3 or int(acoperire or 0) < 3:
            continue
        if n_conc >= max_concurenta:
            break
        n_conc += 1
        adauga(f"cod reducere {nume}", "concurenta", M_TOATE, acoperire=int(acoperire))

    # 5. Produsele: forma simpla merge si pe YouTube (unghiuri pentru video).
    for prod, pagina in PRODUSE:
        for i, mod in enumerate(MODIFICATORI_PRODUS):
            adauga(mod.format(prod), "produs", M_VIDEO if i == 0 else M_TOATE, produs=prod, pagina=pagina)
    return seminte


def test() -> int:
    s = construieste(max_magazine=50, max_spatiu=10)
    erori = []
    grupuri = {x["grup"] for x in s}
    for g in ("alfabet", "sezon", "intrebare", "magazin", "produs"):
        if g not in grupuri:
            erori.append(f"lipseste grupul {g}")
    texte = [x["text"] for x in s]
    if len(texte) != len(set(texte)):
        erori.append("seminte dublate")
    if any(t != t.lower() or "  " in t for t in texte):
        erori.append("seminte nenormalizate")
    sp = [x["text"] for x in s if x["grup"] == "magazin_sp"]
    if not sp or not all(t.endswith(" ") and not t.endswith("  ") for t in sp):
        erori.append("semintele magazin_sp trebuie sa se termine cu un singur spatiu")
    if s[0]["grup"] != "alfabet":
        erori.append("alfabetul trebuie sa fie primul")
    for e in erori:
        print("PICA:", e)
    print(f"seminte.py: {'OK' if not erori else 'PICA'} ({len(s)} seminte in proba)")
    return 1 if erori else 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--iesire", default="research-out/seminte.json")
    ap.add_argument("--max-magazine", type=int, default=300)
    ap.add_argument("--max-spatiu", type=int, default=80)
    ap.add_argument("--max-concurenta", type=int, default=200)
    ap.add_argument("--test", action="store_true")
    a = ap.parse_args()
    if a.test:
        return test()
    s = construieste(a.max_magazine, a.max_spatiu, a.max_concurenta)
    os.makedirs(os.path.dirname(os.path.abspath(a.iesire)), exist_ok=True)
    with open(a.iesire, "w", encoding="utf-8") as f:
        json.dump(s, f, ensure_ascii=False, indent=1)
    pe_grup: dict[str, int] = {}
    cereri = 0
    for x in s:
        pe_grup[x["grup"]] = pe_grup.get(x["grup"], 0) + 1
        cereri += len(x["motoare"])
    print(f"{len(s)} seminte, {cereri} cereri: " + ", ".join(f"{g} {n}" for g, n in pe_grup.items()))
    return 0


if __name__ == "__main__":
    sys.exit(main())
