"""
studiu_black_friday.py — „Câte reduceri de Black Friday sunt reale", din istoricul NOSTRU de prețuri.

DE CE (01.11.2026): o reducere e reală când prețul nou e sub cel mai mic preț din ultimele 30 de zile —
e și prețul anterior pe care magazinul trebuie să-l afișeze (HG 686/2022). Feed-urile nu ne mai dau
„prețul tăiat" (0 produse azi), dar avem istoricul propriu din 07.10 (data/istoric-preturi.json,
scripts/istoric_preturi.py), deci putem măsura ce face prețul, nu ce scrie lângă el.

CUM: referința e ziua de start (REF = Black Friday la eMAG, 6 noiembrie). Pentru fiecare produs urmărit
cu istoric de cel puțin 30 de zile înainte de REF și văzut în ultimele 3 zile:
  - pretul de dinainte = prețul valabil în ziua dinaintea lui REF;
  - minimul din 30 de zile = cel mai mic preț din cele 30 de zile dinaintea lui REF;
  - pretul de azi = ultima observație.
Dintre produsele mai ieftine azi decât înainte de REF:
  - REALĂ: prețul de azi e sub minimul din 30 de zile;
  - NU E SUB MINIM: mai ieftin decât ieri, dar nu sub cel mai mic preț din luna dinainte (de obicei
    prețul crescuse înainte și acum revine).
Plus: câte produse s-au SCUMPIT în luna dinainte de Black Friday.

Doar CIFRE AGREGATE, fără nume de magazine: pagina descrie piața, nu acuză pe nimeni. Variațiile de
peste x3 se exclud (altă variantă de produs pe aceeași adresă, nu un preț).

VARIANTE (28.11.2026, aceleași reguli ca istoric_preturi.py): nu intră în cifre adresele care vând mai multe
produse (`x`: două prețuri în aceeași rulare), produsele la care cantitatea s-a schimbat după începutul
ferestrei (`s`: istoricul a repornit) și saltul de peste 45% la un produs cu semne de variantă (`m`). Se
numără separat, în `excluse_varianta`.

LIMITA, scrisă și pe pagină: feed-urile se descarcă prin rotație (la câteva zile pentru fiecare
magazin), deci „minimul" e minimul VĂZUT de noi, iar o reducere de o zi poate să nu apară.

Ieșiri:
  data/black-friday-2026.json            — câte un instantaneu pe zi (comis de pipeline)
  frontend/public/black-friday-reale.json — ce citește pagina /black-friday

Rulare:  python studiu_black_friday.py          # după istoric_preturi.py
         python studiu_black_friday.py --test   # verificări care trebuie să poată pica
"""
from __future__ import annotations

import io
import json
import os
import sys
from datetime import date, datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from istoric_preturi import PRAG_VARIANTA  # noqa: E402  (pragul de varianta sta intr-un singur loc)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ISTORIC = os.path.join(ROOT, "data", "istoric-preturi.json")
ZILNIC = os.path.join(ROOT, "data", "black-friday-2026.json")
PUBLIC = os.path.join(ROOT, "frontend", "public", "black-friday-reale.json")

REF = "2026-11-06"        # Black Friday la eMAG (frontend/public/black-friday.json)
SFARSIT = "2026-12-02"    # dupa valul international (27-30.11) + Cyber Monday
FEREASTRA = 30
VAZUT_RECENT = 3
PRAG = 0.01               # sub 1% e zgomot de rotunjire, nu reducere
RAPORT_ABSURD = 3.0


def pret_la(p: list, zi: str) -> float | None:
    """Prețul valabil în ziua `zi`: ultima schimbare de până atunci (inclusiv)."""
    valabil = [pr for z, pr in p if z <= zi]
    return valabil[-1] if valabil else None


def instantaneu(istoric: dict, azi: str, ref: str = REF) -> dict:
    d_ref = date.fromisoformat(ref)
    ieri_ref = (d_ref - timedelta(days=1)).isoformat()
    start = (d_ref - timedelta(days=FEREASTRA)).isoformat()
    recent = (date.fromisoformat(azi) - timedelta(days=VAZUT_RECENT)).isoformat()
    reale, nu_sub_minim, scumpite, neschimbate, excluse, varianta = [], [], 0, 0, 0, 0
    scumpite_inainte, urmarite = 0, 0
    for e in istoric.values():
        p = e.get("p") or []
        if not p or e.get("v", "") < recent:
            continue
        if p[0][0] > start:
            if e.get("s", "") > start:
                varianta += 1       # alta cantitate pe aceeasi adresa dupa inceputul ferestrei: istoricul a repornit
            continue
        if e.get("x"):
            varianta += 1           # adresa vinde mai multe produse (doua preturi in aceeasi rulare)
            continue
        inainte = pret_la(p, ieri_ref)
        la_start = pret_la(p, start)
        acum = pret_la(p, azi)
        fereastra = [pr for z, pr in p if start < z < ref] + ([la_start] if la_start else [])
        if not inainte or not acum or not fereastra:
            continue
        minim = min(fereastra)
        if not (1 / RAPORT_ABSURD <= acum / inainte <= RAPORT_ABSURD) or max(fereastra) / minim > RAPORT_ABSURD:
            excluse += 1
            continue
        if e.get("m") and (acum / inainte <= PRAG_VARIANTA or acum / inainte >= 1 / PRAG_VARIANTA
                           or acum / minim <= PRAG_VARIANTA):
            varianta += 1           # salt de peste 45% la un produs cu semne de varianta
            continue
        urmarite += 1
        if la_start and inainte > la_start * (1 + PRAG):
            scumpite_inainte += 1
        if acum < inainte * (1 - PRAG):
            if acum < minim * (1 - PRAG):
                reale.append((1 - acum / minim) * 100)
            else:
                nu_sub_minim.append((1 - acum / inainte) * 100)
        elif acum > inainte * (1 + PRAG):
            scumpite += 1
        else:
            neschimbate += 1

    def mediana(xs: list) -> float | None:
        if not xs:
            return None
        s = sorted(xs)
        m = len(s) // 2
        return round(s[m] if len(s) % 2 else (s[m - 1] + s[m]) / 2, 1)

    ieftinite = len(reale) + len(nu_sub_minim)
    return {
        "zi": azi, "produse_urmarite": urmarite, "excluse": excluse, "excluse_varianta": varianta,
        "ieftinite": ieftinite, "reale": len(reale), "nu_sub_minim": len(nu_sub_minim),
        "pct_reale_din_ieftinite": round(100 * len(reale) / ieftinite, 1) if ieftinite else None,
        "mediana_reducere_reala_pct": mediana(reale),
        "mediana_reducere_aparenta_pct": mediana(nu_sub_minim),
        "scumpite": scumpite, "neschimbate": neschimbate,
        "scumpite_in_luna_dinainte": scumpite_inainte,
        "pct_scumpite_in_luna_dinainte": round(100 * scumpite_inainte / urmarite, 1) if urmarite else None,
    }


def main() -> int:
    azi = datetime.now(timezone.utc).date().isoformat()
    zilnic = {"referinta": REF, "sfarsit": SFARSIT, "zile": {}}
    if os.path.exists(ZILNIC):
        zilnic = json.load(io.open(ZILNIC, encoding="utf-8"))
    if REF <= azi <= SFARSIT:
        istoric = json.load(io.open(ISTORIC, encoding="utf-8")).get("produse", {})
        zilnic["zile"][azi] = instantaneu(istoric, azi)          # o rulare noua in aceeasi zi o inlocuieste
        io.open(ZILNIC, "w", encoding="utf-8", newline="\n").write(json.dumps(zilnic, ensure_ascii=False, indent=1))
    zile = [zilnic["zile"][z] for z in sorted(zilnic["zile"])]
    io.open(PUBLIC, "w", encoding="utf-8", newline="\n").write(json.dumps({
        "actualizat": azi, "referinta": REF, "sfarsit": SFARSIT, "fereastra_zile": FEREASTRA,
        "ultima": zile[-1] if zile else None, "zile": zile,
    }, ensure_ascii=False, separators=(",", ":")))
    u = zile[-1] if zile else None
    print(f"studiu Black Friday: {'incepe pe ' + REF if not u else ''}"
          + (f"{u['zi']}: {u['produse_urmarite']} produse, {u['ieftinite']} mai ieftine, din care reale "
             f"{u['reale']} ({u['pct_reale_din_ieftinite']}%); scumpite in luna dinainte: "
             f"{u['pct_scumpite_in_luna_dinainte']}%" if u else ""))
    return 0


def test() -> int:
    rau = []

    def v(nume, primit, asteptat):
        if primit != asteptat:
            rau.append(f"{nume}: {primit!r} (asteptat {asteptat!r})")

    ist = {
        # pret stabil 100, apoi 80 in BF -> reala (sub minimul 100)
        "real": {"p": [["2026-09-20", 100], ["2026-11-06", 80]], "v": "2026-11-07"},
        # 100 -> scumpit la 130 pe 25.10 -> 100 in BF: mai ieftin decat inainte, dar nu sub minim
        "revenire": {"p": [["2026-09-20", 100], ["2026-10-25", 130], ["2026-11-06", 100]], "v": "2026-11-07"},
        # scumpit in BF
        "scumpit": {"p": [["2026-09-20", 100], ["2026-11-06", 120]], "v": "2026-11-07"},
        # istoric prea scurt (incepe dupa 07.10) -> nu intra
        "scurt": {"p": [["2026-10-20", 100], ["2026-11-06", 50]], "v": "2026-11-07"},
        # nevazut recent -> nu intra
        "vechi": {"p": [["2026-09-20", 100], ["2026-10-01", 70]], "v": "2026-10-01"},
        # x3: alta varianta de produs -> exclus
        "absurd": {"p": [["2026-09-20", 100], ["2026-11-06", 20]], "v": "2026-11-07"},
        # 28.11.2026 — alta varianta pe aceeasi adresa (istoric_preturi.py): nu intra, se numara separat
        "ambiguu": {"p": [["2026-09-20", 395], ["2026-11-06", 339]], "v": "2026-11-07", "x": "2026-10-07"},
        "jumatate": {"p": [["2026-09-20", 569.5], ["2026-11-06", 284.75]], "v": "2026-11-07", "m": 1},  # Husse
        "repornit": {"p": [["2026-11-06", 95]], "v": "2026-11-07", "s": "2026-11-06", "a": "ml:15"},     # Kiehl's
        # semne de varianta, dar scadere mica: ramane o reducere reala
        "semne_mic": {"p": [["2026-09-20", 100], ["2026-11-06", 85]], "v": "2026-11-07", "m": 1},
    }
    s = instantaneu(ist, "2026-11-07")
    v("urmarite (scurt, vechi, absurd si variantele nu intra)", s["produse_urmarite"], 4)
    v("variantele se numara separat", s["excluse_varianta"], 3)
    ist_fara = {k: {c: x for c, x in e.items() if c != "m"} for k, e in ist.items()
                if k in ("real", "revenire", "scumpit", "jumatate", "semne_mic")}
    v("  fara marcaj, jumatatea Husse ar parea reducere reala", instantaneu(ist_fara, "2026-11-07")["reale"], 3)
    v("doua reduceri reale (cea cu semne, dar mica, ramane)", s["reale"], 2)
    v("revenirea dupa scumpire nu e reala", s["nu_sub_minim"], 1)
    v("procentul de reale din cele ieftinite", s["pct_reale_din_ieftinite"], 66.7)
    v("reducerea reala fata de minim", s["mediana_reducere_reala_pct"], 17.5)
    v("scumpit in BF", s["scumpite"], 1)
    v("scumpite in luna dinainte (revenire)", s["scumpite_in_luna_dinainte"], 1)
    v("absurdul exclus", s["excluse"], 1)
    for r in rau:
        print("  PICA ", r)
    print("TOATE TREC" if not rau else f"{len(rau)} asteptari incalcate")
    return 1 if rau else 0


if __name__ == "__main__":
    sys.exit(test() if "--test" in sys.argv else main())
