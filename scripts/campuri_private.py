"""
campuri_private.py — comisionul nostru nu iese din rularea automata (04.11.2026, decizia lui Alex).

Repo-ul e PUBLIC, iar `frontend/public/` se serveste asa cum e: `amcupon.ro/output.json` arata comisionul
la 957 din 958 de magazine, desi paginile nu il mai afisau de mult. Regula „comisionul nu se publica" se
aplica aici, la gatuitura: pasul ruleaza chiar inaintea commit-ului, deci orice importator, vechi sau nou,
poate folosi campul in timpul rularii, dar el nu ajunge nici pe site, nici in repo.

In timpul rularii, comisionul vine din API-ul retelelor. Pentru rapoartele locale (`generate_merchant_priority`,
`scor_comercianti`) ramane o copie in `data/comisioane.local.json`, ignorata de git.

Rulare: `python campuri_private.py` (curata), `--test`, `--verifica` (iese 1 daca a scapat ceva).
"""
from __future__ import annotations

import csv
import io
import json
import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
CAMPURI_PRIVATE = ("comision",)
# Fisierele cu magazine care ajung in repo sau pe site.
FISIERE_JSON = ("frontend/public/output.json", "frontend/public/recomandate.json", "data/output.json", "data/extra_merchants.json")
# Exporturile retelelor raman in repo doar cu coloanele citite de rulare.
COLOANE_PRIVATE = {
    "data/impact_campaigns.csv": ("Payout",),
    "data/promotii_2p.csv": ("Description (for affiliate)", "Benefits & Tools"),
}
HARTA_LOCALA = os.path.join(ROOT, "data", "comisioane.local.json")


def _citeste(cale: str):
    with io.open(cale, encoding="utf-8") as h:
        return json.load(h)


def _magazine(d) -> list:
    return d if isinstance(d, list) else (d.get("magazine") or d.get("merchants") or [])


def scoate(magazine: list) -> dict:
    """Scoate campurile private din fiecare magazin. Intoarce {magazin: comision} pentru copia locala."""
    harta = {}
    for m in magazine:
        if not isinstance(m, dict):
            continue
        for camp in CAMPURI_PRIVATE:
            if camp in m:
                valoare = m.pop(camp)
                if valoare not in ("", None) and m.get("magazin"):
                    harta[m["magazin"]] = valoare
    return harta


def curata_csv(cale: str, coloane: tuple) -> int:
    """Scoate coloanele private dintr-un export. Intoarce cate a scos."""
    with io.open(cale, encoding="utf-8-sig", newline="") as h:
        randuri = list(csv.reader(h))
    if not randuri:
        return 0
    pastrate = [i for i, c in enumerate(randuri[0]) if c.strip() not in coloane]
    scoase = len(randuri[0]) - len(pastrate)
    if scoase:
        with io.open(cale, "w", encoding="utf-8", newline="") as h:
            csv.writer(h, lineterminator="\n").writerows([[r[i] for i in pastrate if i < len(r)] for r in randuri])
    return scoase


# O fraza care spune cat castiga afiliatul. „Fara comision la retragere" (despre client, fara cifra) ramane.
RE_FRAZA_COMISION = re.compile(r"(?i)(?:comision\w*|commission\w*)[^.!?\n]{0,60}?\d|\d[^.!?\n]{0,25}(?:comision|commission)|comision afiliere")


def fara_fraze_comision(text: str) -> str:
    """Textul fara frazele cu cifra de comision. Neatins daca n-are niciuna (pastreaza si randurile noi)."""
    if not isinstance(text, str) or not RE_FRAZA_COMISION.search(text):
        return text
    return " ".join(f for f in re.split(r"(?<=[.!?])\s+|\n+", text) if f.strip() and not RE_FRAZA_COMISION.search(f)).strip()


def curata_texte_csv() -> int:
    """Exportul 2Performant: titlul si textul pentru client fara comisioane. Oferta scrisa doar pentru afiliati iese de tot."""
    from promotii import fara_segmente_afiliati

    cale = os.path.join(ROOT, "data", "promotii_2p.csv")
    if not os.path.exists(cale):
        return 0
    with io.open(cale, encoding="utf-8-sig", newline="") as h:
        randuri = list(csv.reader(h))
    cap = randuri[0]
    i_nume, i_desc, i_mag = cap.index("Promotion name"), cap.index("Description (for customer)"), cap.index("Affiliate program")
    noi, schimbate = [cap], 0
    for r in randuri[1:]:
        if len(r) != len(cap):
            noi.append(r)
            continue
        nume = fara_segmente_afiliati(r[i_nume], {"magazin": r[i_mag]})
        desc = fara_fraze_comision(r[i_desc])
        if nume is None:
            schimbate += 1
            continue
        if nume != r[i_nume] or desc != r[i_desc]:
            schimbate += 1
            r = list(r)
            r[i_nume], r[i_desc] = nume, desc
        noi.append(r)
    if schimbate:
        with io.open(cale, "w", encoding="utf-8", newline="") as h:
            csv.writer(h, lineterminator="\n").writerows(noi)
    return schimbate


def curata_impact_csv() -> int:
    """„X-Sense | Starting from 9% Commission": numele programului fara cifra de comision."""
    cale = os.path.join(ROOT, "data", "impact_campaigns.csv")
    if not os.path.exists(cale):
        return 0
    with io.open(cale, encoding="utf-8-sig", newline="") as h:
        randuri = list(csv.reader(h))
    if "Program Name" not in randuri[0]:
        return 0
    i = randuri[0].index("Program Name")
    n = 0
    for r in randuri[1:]:
        if len(r) > i and RE_FRAZA_COMISION.search(r[i]):
            r[i] = re.sub(r"\s*\|[^|]*$", "", r[i]) if "|" in r[i] else r[i]
            n += 1
    if n:
        with io.open(cale, "w", encoding="utf-8", newline="") as h:
            csv.writer(h, lineterminator="\n").writerows(randuri)
    return n


def curata_promotii_magazine(lista: list) -> int:
    """Magazinele adaugate manual pastreaza in repo si oferte vechi, cu texte pentru afiliati."""
    from promotii import fara_segmente_afiliati

    n = 0
    for m in lista:
        if not isinstance(m, dict) or not isinstance(m.get("promotii"), list):
            continue
        pastrate = []
        for p in m["promotii"]:
            nume = fara_segmente_afiliati(p.get("nume"), m)
            if nume is None:
                n += 1
                continue
            desc = fara_fraze_comision(p.get("descriere"))
            if nume != p.get("nume") or desc != p.get("descriere"):
                n += 1
                p["nume"], p["descriere"] = nume, desc
            pastrate.append(p)
        m["promotii"] = pastrate
    return n


def citeste_harta() -> dict:
    """Comisioanele stiute local. In GitHub Actions fisierul nu exista: rapoartele folosesc ce a adus API-ul in rularea curenta."""
    if not os.path.exists(HARTA_LOCALA):
        return {}
    try:
        return _citeste(HARTA_LOCALA)
    except ValueError:
        return {}


def curata() -> int:
    harta = citeste_harta()
    total = 0
    for rel in FISIERE_JSON:
        cale = os.path.join(ROOT, rel)
        if not os.path.exists(cale):
            continue
        d = _citeste(cale)
        lista = _magazine(d)
        inainte = sum(1 for m in lista if isinstance(m, dict) and any(c in m for c in CAMPURI_PRIVATE))
        texte = curata_promotii_magazine(lista)
        if texte:
            print(f"  {rel}: {texte} oferte cu text pentru afiliati curatate")
        if not inainte and not texte:
            continue
        harta.update(scoate(lista))
        with io.open(cale, "w", encoding="utf-8", newline="") as h:
            json.dump(d, h, ensure_ascii=False, indent=2)
        total += inainte
        print(f"  {rel}: scos de la {inainte} magazine")
    for rel, coloane in COLOANE_PRIVATE.items():
        cale = os.path.join(ROOT, rel)
        if os.path.exists(cale):
            n = curata_csv(cale, coloane)
            if n:
                print(f"  {rel}: {n} coloane private scoase")
    n = curata_texte_csv()
    if n:
        print(f"  data/promotii_2p.csv: {n} oferte cu text pentru afiliati curatate")
    n = curata_impact_csv()
    if n:
        print(f"  data/impact_campaigns.csv: {n} nume de program curatate")
    with io.open(HARTA_LOCALA, "w", encoding="utf-8", newline="") as h:
        json.dump(harta, h, ensure_ascii=False, indent=0)
    print(f"Campuri private scoase: {total} magazine.")
    return 0


def probleme() -> list:
    """Ce a scapat: un camp privat intr-un fisier public sau intr-un export din repo."""
    rele = []
    for rel in FISIERE_JSON:
        cale = os.path.join(ROOT, rel)
        if os.path.exists(cale):
            n = sum(1 for m in _magazine(_citeste(cale)) if isinstance(m, dict) and any(c in m for c in CAMPURI_PRIVATE))
            if n:
                rele.append(f"{rel}: comision la {n} magazine")
    public = os.path.join(ROOT, "frontend", "public")
    for nume in sorted(os.listdir(public)):
        if nume.endswith(".json") and f"frontend/public/{nume}" not in FISIERE_JSON:
            with io.open(os.path.join(public, nume), encoding="utf-8", errors="ignore") as h:
                if any(f'"{c}"' in h.read() for c in CAMPURI_PRIVATE):
                    rele.append(f"frontend/public/{nume}: are campul de comision")
    for rel, coloane in COLOANE_PRIVATE.items():
        cale = os.path.join(ROOT, rel)
        if os.path.exists(cale):
            with io.open(cale, encoding="utf-8-sig", newline="") as h:
                cap = next(csv.reader(h), [])
            ramase = [c for c in cap if c.strip() in coloane]
            if ramase:
                rele.append(f"{rel}: coloane private {ramase}")
    return rele


def test() -> int:
    import tempfile

    a = [{"magazin": "a.ro", "comision": "12%", "url": "u"}, {"magazin": "b.ro", "comision": ""}, {"magazin": "c.ro"}]
    h = scoate(a)
    ok = [
        ("comisionul iese din magazin", all("comision" not in m for m in a), True),
        ("restul campurilor raman", a[0]["url"], "u"),
        ("comisionul gol nu intra in copia locala", h, {"a.ro": "12%"}),
    ]
    with tempfile.TemporaryDirectory() as d:
        p = os.path.join(d, "x.csv")
        with io.open(p, "w", encoding="utf-8", newline="") as f:
            f.write('A,Payout,C\n1,"10%",3\n')
        ok.append(("coloana privata iese", curata_csv(p, ("Payout",)), 1))
        with io.open(p, encoding="utf-8") as f:
            ok.append(("restul coloanelor raman", f.read(), "A,C\n1,3\n"))
        ok.append(("a doua trecere nu mai schimba nimic", curata_csv(p, ("Payout",)), 0))
    ok += [
        ("fraza cu cifra de comision iese", fara_fraze_comision("Reducere 20% la tot. Comision afiliere: 7%. Livrare gratuita."), "Reducere 20% la tot. Livrare gratuita."),
        ("comisionul pentru client, fara cifra, ramane", fara_fraze_comision("Fara comision la retragere."), "Fara comision la retragere."),
        ("textul fara comision ramane neatins", fara_fraze_comision("Reducere 20%.\nLivrare."), "Reducere 20%.\nLivrare."),
    ]
    mag = [{"magazin": "a.ro", "promotii": [{"nume": "Voucher toamna + comision HAVIT 10%", "descriere": "Bun. Earn 10% commission."}, {"nume": "Comision afiliere 12%", "descriere": ""}]}]
    ok.append(("oferta se curata, anuntul pentru afiliati iese", (curata_promotii_magazine(mag), mag[0]["promotii"]), (2, [{"nume": "Voucher toamna", "descriere": "Bun."}])))
    rele = [(n, x, e) for n, x, e in ok if x != e]
    for n, x, e in rele:
        print(f"  PICA  {n}: {x!r} (asteptat {e!r})")
    print("TOATE TREC" if not rele else f"{len(rele)} asteptari incalcate")
    return 1 if rele else 0


if __name__ == "__main__":
    if "--test" in sys.argv:
        sys.exit(test())
    if "--verifica" in sys.argv:
        rele = probleme()
        for r in rele:
            print(f"  PICA  {r}")
        print("Campuri private: " + ("curat" if not rele else f"{len(rele)} probleme"))
        sys.exit(1 if rele else 0)
    sys.exit(curata())
