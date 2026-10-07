"""
istoric_preturi.py — istoricul prețurilor produselor din feed-urile partenerilor (date proprii).

DE CE (07.10.2026): afiliatul cu cele mai multe vânzări din 2Performant e un site de istoric de prețuri
(pricealert.ro), ca Keepa / camelcamelcamel. Avem deja ~20.000 de produse din feed-uri, actualizate de
câteva ori pe zi, dar nu le păstram prețul de ieri. Cu istoric, putem arăta REDUCERI REALE: preț sub
minimul ultimelor 30 de zile — reperul cerut și de directiva Omnibus (UE 2019/2161) — nu „prețul tăiat"
din feed, pe care magazinul îl poate umfla. Black Friday 2026 la eMAG e pe 6 noiembrie: colectarea
pornește acum ca să existe 30 de zile de date înainte.

CE PĂSTRĂM: pentru fiecare produs (cheie = hash al adresei produsului la magazin, fără parametri),
doar SCHIMBĂRILE de preț: [[zi, preț], ...], plus ziua în care l-am văzut ultima dată. Un produs nevăzut
90 de zile iese. Feed-urile se rotesc (60 de magazine pe rulare), deci absența de o zi nu înseamnă nimic.

IEȘIRE: frontend/public/scaderi-pret.json — produsele văzute azi al căror preț e cu cel puțin 10% sub
minimul din cele 30 de zile dinainte, DOAR dacă istoricul lor acoperă cel puțin 14 zile (altfel
„minimul pe 30 de zile" ar fi o vorbă goală). La început lista e goală — e corect, nu o eroare.

Rulare:  python istoric_preturi.py          # actualizează istoricul și lista
         python istoric_preturi.py --test   # verificări care trebuie să poată pica
"""
from __future__ import annotations

import hashlib
import io
import json
import os
import sys
from datetime import date, datetime, timedelta, timezone
from urllib.parse import urlsplit

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRODUSE = os.path.join(ROOT, "frontend", "public", "products.json")
ISTORIC = os.path.join(ROOT, "data", "istoric-preturi.json")
SCADERI = os.path.join(ROOT, "frontend", "public", "scaderi-pret.json")

PASTRARE_ZILE = 90
FEREASTRA = 30
ACOPERIRE_MIN = 14
SCADERE_MIN = 0.10
PRET_MIN = 20.0


def cheie(p: dict) -> str:
    """Adresa produsului la magazin, fără parametri și fragment — stabilă între rulări."""
    u = (p.get("url_original") or "").strip()
    if not u:
        return ""
    s = urlsplit(u)
    baza = f"{s.netloc.lower()}{s.path.rstrip('/')}"
    return hashlib.sha1(baza.encode("utf-8")).hexdigest()[:16]


def pret(p: dict) -> float | None:
    try:
        v = float(p.get("price"))
    except (TypeError, ValueError):
        return None
    return round(v, 2) if v >= PRET_MIN else None


def actualizeaza(istoric: dict, produse: list, azi: str) -> int:
    """Adaugă observațiile de azi. Întoarce câte schimbări de preț noi au intrat."""
    noi = 0
    for p in produse:
        if p.get("is_promo") in (True, "True"):
            continue
        k, v = cheie(p), pret(p)
        if not k or v is None:
            continue
        e = istoric.setdefault(k, {"p": [], "v": azi})
        e["v"] = azi
        if e["p"] and e["p"][-1][0] == azi:
            e["p"][-1][1] = min(e["p"][-1][1], v)   # mai multe rulări pe zi: cel mai mic preț al zilei
        elif not e["p"] or e["p"][-1][1] != v:
            e["p"].append([azi, v])
            noi += 1
    return noi


def curata(istoric: dict, azi: str) -> int:
    limita = (date.fromisoformat(azi) - timedelta(days=PASTRARE_ZILE)).isoformat()
    vechi = [k for k, e in istoric.items() if e.get("v", "") < limita]
    for k in vechi:
        del istoric[k]
    return len(vechi)


def minim_inainte(e: dict, azi: str) -> tuple[float | None, int]:
    """(prețul minim în cele 30 de zile dinaintea zilei de azi, câte zile acoperă istoricul)."""
    zi_azi = date.fromisoformat(azi)
    start = (zi_azi - timedelta(days=FEREASTRA)).isoformat()
    puncte = e["p"]
    if not puncte:
        return None, 0
    acoperire = (zi_azi - date.fromisoformat(puncte[0][0])).days
    # prețul valabil la începutul ferestrei + toate schimbările din fereastră, fără ziua de azi
    in_fereastra = [pr for zi, pr in puncte if start <= zi < azi]
    inainte = [pr for zi, pr in puncte if zi < start]
    candidati = in_fereastra + (inainte[-1:] if inainte else [])
    return (min(candidati) if candidati else None), acoperire


def scaderi(istoric: dict, produse: list, azi: str) -> list[dict]:
    out = []
    vazute = set()
    for p in produse:
        k, v = cheie(p), pret(p)
        if not k or v is None or k in vazute or k not in istoric:
            continue
        vazute.add(k)
        mn, acoperire = minim_inainte(istoric[k], azi)
        if mn is None or acoperire < ACOPERIRE_MIN or v > mn * (1 - SCADERE_MIN):
            continue
        out.append({
            "title": p.get("title"), "url": p.get("url"), "image": p.get("image"),
            "merchant_slug": p.get("merchant_slug"), "cat_slug": p.get("cat_slug"),
            "pret": v, "minim_30_zile": mn, "scadere_pct": round((1 - v / mn) * 100),
        })
    out.sort(key=lambda x: -x["scadere_pct"])
    return out


def main() -> int:
    azi = datetime.now(timezone.utc).date().isoformat()
    raw = json.load(io.open(PRODUSE, encoding="utf-8"))
    produse = raw.get("products", raw) if isinstance(raw, dict) else raw
    istoric = {}
    if os.path.exists(ISTORIC):
        istoric = json.load(io.open(ISTORIC, encoding="utf-8")).get("produse", {})
    noi = actualizeaza(istoric, produse, azi)
    scoase = curata(istoric, azi)
    lista = scaderi(istoric, produse, azi)
    io.open(ISTORIC, "w", encoding="utf-8", newline="\n").write(
        json.dumps({"actualizat": azi, "produse": istoric}, ensure_ascii=False, separators=(",", ":")))
    io.open(SCADERI, "w", encoding="utf-8", newline="\n").write(
        json.dumps({"actualizat": azi, "fereastra_zile": FEREASTRA, "produse": lista[:300]},
                   ensure_ascii=False, separators=(",", ":")))
    print(f"istoric preturi: {len(istoric)} produse urmarite; schimbari noi: {noi}; scoase: {scoase}; "
          f"scaderi reale sub minimul pe {FEREASTRA} de zile: {len(lista)}")
    return 0


def test() -> int:
    esec = 0

    def v(nume, primit, asteptat):
        nonlocal esec
        ok = primit == asteptat
        esec += 0 if ok else 1
        print(f"  {'ok  ' if ok else 'PICA'}  {nume}" + ("" if ok else f"\n        primit {primit!r}, asteptat {asteptat!r}"))

    P = lambda pr, u="https://magazin.ro/produs-x?utm=1": {"url_original": u, "price": pr, "title": "X", "url": "u"}
    v("cheia ignora parametrii", cheie(P(1)), cheie(P(1, "https://magazin.ro/produs-x/")))
    ist = {}
    actualizeaza(ist, [P(100)], "2026-09-01")
    actualizeaza(ist, [P(100)], "2026-09-05")
    v("acelasi pret nu adauga punct", len(ist[cheie(P(1))]["p"]), 1)
    actualizeaza(ist, [P(120)], "2026-09-20")
    actualizeaza(ist, [P(80)], "2026-10-01")
    actualizeaza(ist, [P(90)], "2026-10-01")
    v("doua rulari in aceeasi zi: minimul zilei", ist[cheie(P(1))]["p"][-1], ["2026-10-01", 80])
    # pe 10.10: minimul din 10.09-09.10 = 80 (01.10) -> 70 e cu 12,5% sub, scadere reala
    actualizeaza(ist, [P(70)], "2026-10-10")
    v("scadere reala sub minimul pe 30 de zile", [x["scadere_pct"] for x in scaderi(ist, [P(70)], "2026-10-10")], [12])
    v("75 nu e cu 10% sub 80", scaderi(ist, [P(75)], "2026-10-10"), [])
    ist2 = {}
    actualizeaza(ist2, [P(100)], "2026-10-01")
    actualizeaza(ist2, [P(50)], "2026-10-05")
    v("istoric de 4 zile: nicio scadere declarata", scaderi(ist2, [P(50)], "2026-10-05"), [])
    v("produs nevazut 90 de zile iese", curata({"a": {"p": [["2026-01-01", 1]], "v": "2026-01-01"}}, "2026-10-07"), 1)
    print(f"\n{esec} ESECURI" if esec else "TOATE TREC")
    return 1 if esec else 0


if __name__ == "__main__":
    sys.exit(test() if "--test" in sys.argv else main())
