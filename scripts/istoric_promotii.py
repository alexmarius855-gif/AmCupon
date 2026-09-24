"""
Istoricul promotiilor: ce oferte a avut fiecare magazin, din datele noastre.

DE CE — masurat 24.09.2026 pe istoricul git al lui output.json (102 zile cu date, din 24.05):
  · 175 de magazine au avut macar o promotie; 85 dintre ele n-au niciuna azi. Pagina lor spunea
    doar „Acum nu e niciun cod activ": adevarat, dar fara nimic din ce stim. drmax.ro (2.400 de
    cautari pe luna, pagina indexata) a avut 13 promotii in patru luni, niciuna cu cod.
  · Adancimea paginii de magazin e prima parghie de trafic din PLAN.md (mediana noastra: 952 de
    cuvinte, Cuponeria: 2.831). Umplutura n-ajuta. Datele proprii, publicate, da: nu le are
    nimeni altcineva.

CE SE PUBLICA — doar ce stim sigur:
  · `prima`: ziua in care am vazut promotia prima data. Nu „a inceput atunci": cand reteaua n-a
    raspuns cateva zile, o vedem mai tarziu decat a aparut.
  · `expira`: data oficiala de expirare, cand reteaua o da. Nu „cat a tinut" dedus de noi: o
    promotie fara data poate ramane in feed dupa ce s-a terminat.
  · `ultima` se pastreaza doar ca sa stim cand sa uitam o intrare (dupa un an).

Fisierul e si intrare, si iesire (docs/LECTII-TEHNICE.md #5). De-asta:
  1. promotiile intra doar prin `promotii.curata_promotii()`, aceeasi curatare ca pe site;
  2. regulile pe titlu (texte pentru afiliati, titlu = doar numele magazinului) se aplica la
     FIECARE rulare pe TOT istoricul: daca o regula se strange maine, intrarile vechi ies si ele.

Rulare (din scripts/):
  python istoric_promotii.py            # pipeline: adauga promotiile de azi din output.json
  python istoric_promotii.py --din-git  # o singura data: reconstruieste din istoricul git
  python istoric_promotii.py --test     # verificarile care trebuie sa poata pica
"""

import argparse
import copy
import json
import re
import subprocess
import sys
from datetime import date, timedelta
from pathlib import Path

from promotii import (PRAG_DATA_ABSURDA, _cheie, _doar_numele_magazinului, azi_utc, curata_promotii,
                      text_pentru_afiliati, titlu_afisabil, zile_pana_la)

RADACINA = Path(__file__).resolve().parent.parent
OUTPUT = RADACINA / "frontend" / "public" / "output.json"
ISTORIC = RADACINA / "frontend" / "public" / "istoric-promotii.json"
OUTPUT_IN_GIT = "frontend/public/output.json"

PASTRARE_ZILE = 365   # o oferta de acum un an nu mai spune nimic despre magazinul de azi
MAX_PE_MAGAZIN = 40
MAX_TITLU = 140
RE_DATA = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def _cod(p: dict) -> str:
    """Instantaneele vechi au uneori `cod_cupon: true` fara niciun cod. Doar textul e un cod."""
    c = p.get("cod_cupon")
    return c.strip() if isinstance(c, str) else ""


def cheie(p: dict) -> str:
    """Aceeasi promotie de la o zi la alta: numele fara punctuatie si diacritice, plus codul.
    „Cupon activ! -20% la orice află codul" si „...* află codul »" sunt aceeasi promotie."""
    baza = _cheie(p.get("nume") if isinstance(p.get("nume"), str) else "") or _cheie(titlu_afisabil(p))
    return f"{baza}|{_cod(p).lower()}" if baza else ""


def scurteaza(text: str, n: int = MAX_TITLU) -> str:
    text = " ".join((text or "").split())
    if len(text) <= n:
        return text
    return text[:n].rsplit(" ", 1)[0].rstrip(",.;:-–") + "…"


def promotii_curate(magazine: list, zi: str) -> list:
    """Magazinele cu promotii, trecute prin curatarea de pe site, pe o COPIE: istoricul nu atinge datele."""
    copie = copy.deepcopy([m for m in magazine if isinstance(m, dict) and m.get("promotii")])
    for m in copie:
        if not isinstance(m.get("promotii"), list):
            m["promotii"] = []
        for p in m["promotii"]:
            if isinstance(p, dict) and not isinstance(p.get("cod_cupon"), str):
                p["cod_cupon"] = ""
    curata_promotii(copie, azi=zi)
    return copie


def slug_valid(slug: str) -> bool:
    """24.09.2026: in datele din 29.06 era „advertisertest.eu/production/test944", magazinul de
    test al unei retele, cu promotia „asd". Un slug cu „/" sau spatiu nu e un magazin."""
    return bool(slug) and not re.search(r"[/\s]", slug)


def titlu_publicabil(titlu: str, m: dict) -> bool:
    """Regulile pe titlu — ACELEASI la intrare si la recuratarea intregului istoric."""
    # Fara niciun spatiu = codul insusi („SAVE20", „26BTS03") sau un cuvant gol („General",
    # „NEW"). Nu spune nimic despre oferta, iar pe o lista de oferte trecute ar publica un cod
    # expirat drept titlu.
    if " " not in titlu:
        return False
    verdict = text_pentru_afiliati({"nume": titlu, "descriere": "", "cod_cupon": ""}, m)
    if verdict and verdict[0] == "scoate":
        return False
    return not _doar_numele_magazinului(titlu, m)


def adauga_zi(istoric: dict, magazine: list, zi: str) -> dict:
    """Pune in istoric promotiile afisate in ziua `zi`. Intoarce cheile vazute, pe magazin."""
    vazute = {}
    for m in promotii_curate(magazine, zi):
        slug = (m.get("magazin") or "").strip().lower()
        if not slug_valid(slug):
            continue
        for p in m["promotii"]:
            k = cheie(p)
            titlu = scurteaza(titlu_afisabil(p))
            if not k or not titlu_publicabil(titlu, m):
                continue
            exp = p.get("expira")[:10] if isinstance(p.get("expira"), str) else ""
            zile = zile_pana_la(exp, zi) if exp else None
            if zile is None or zile > PRAG_DATA_ABSURDA:
                exp = ""
            intrari = istoric.setdefault(slug, {})
            e = intrari.get(k)
            if e is None:
                intrari[k] = {"k": k, "titlu": titlu, "cod": bool(_cod(p)), "prima": zi, "ultima": zi, "expira": exp}
            else:
                e["prima"], e["ultima"] = min(e["prima"], zi), max(e["ultima"], zi)
                e["titlu"] = titlu
                e["cod"] = e["cod"] or bool(_cod(p))
                if exp:
                    e["expira"] = exp
            vazute.setdefault(slug, set()).add(k)
    return vazute


def recurata(istoric: dict, azi: str, dupa_slug: dict) -> int:
    """Regulile pe titlu, aplicate pe TOT istoricul, plus uitarea dupa un an si plafonul pe magazin."""
    scoase = 0
    limita = (date.fromisoformat(azi) - timedelta(days=PASTRARE_ZILE)).isoformat()
    for slug in list(istoric):
        if not slug_valid(slug):
            scoase += len(istoric.pop(slug))
            continue
        m = dupa_slug.get(slug) or {"magazin": slug}
        intrari = istoric[slug]
        for k in list(intrari):
            e = intrari[k]
            if not titlu_publicabil(e["titlu"], m) or e["ultima"] < limita:
                del intrari[k]
                scoase += 1
        if len(intrari) > MAX_PE_MAGAZIN:
            pastrate = sorted(intrari.values(), key=lambda e: (e["prima"], e["ultima"]), reverse=True)[:MAX_PE_MAGAZIN]
            scoase += len(intrari) - len(pastrate)
            istoric[slug] = intrari = {e["k"]: e for e in pastrate}
        if not intrari:
            del istoric[slug]
    return scoase


def acoperire(vazute: dict) -> dict:
    """Ce s-a vazut intr-o zi: cate promotii publicabile si la cate magazine. Din asta se afla,
    la raportul lunar, zilele in care o sursa n-a raspuns (24.09.2026: pe 06.08 si 19.08 numarul
    a cazut la jumatate peste noapte, iar a doua zi a revenit)."""
    return {"promotii": sum(len(v) for v in vazute.values()), "magazine": len(vazute)}


def citeste_zile(brut: dict) -> dict:
    zile = {}
    for zi, v in (brut.get("zile") or {}).items():
        if (isinstance(zi, str) and RE_DATA.match(zi) and isinstance(v, dict)
                and all(isinstance(v.get(c), int) and v[c] >= 0 for c in ("promotii", "magazine"))):
            zile[zi] = {"promotii": v["promotii"], "magazine": v["magazine"]}
    return zile


def citeste(cale: Path):
    """Fisierul existent, validat la granita: o intrare stricata se arunca, nu se propaga."""
    if not cale.exists():
        return None, {}, 0
    brut = json.loads(cale.read_text(encoding="utf-8"))
    de_la = brut.get("de_la") if isinstance(brut.get("de_la"), str) and RE_DATA.match(brut["de_la"]) else None
    istoric, stricate = {}, 0
    for slug, lista in (brut.get("magazine") or {}).items():
        if not isinstance(lista, list):
            stricate += 1
            continue
        for e in lista:
            ok = (isinstance(e, dict) and isinstance(e.get("k"), str) and e["k"]
                  and isinstance(e.get("titlu"), str) and e["titlu"].strip()
                  and isinstance(e.get("cod"), bool)
                  and all(isinstance(e.get(c), str) and RE_DATA.match(e[c]) for c in ("prima", "ultima"))
                  and e["prima"] <= e["ultima"]
                  and isinstance(e.get("expira", ""), str) and (not e.get("expira") or RE_DATA.match(e["expira"])))
            if not ok:
                stricate += 1
                continue
            istoric.setdefault(slug.lower(), {})[e["k"]] = {c: e.get(c, "") for c in ("k", "titlu", "cod", "prima", "ultima", "expira")}
    return de_la, istoric, stricate


def scrie(cale: Path, istoric: dict, de_la: str, azi: str, active: dict, zile: dict = None) -> dict:
    magazine = {}
    for slug in sorted(istoric):
        lista = sorted(istoric[slug].values(), key=lambda e: (e["prima"], e["ultima"], e["k"]), reverse=True)
        magazine[slug] = [{**e, "activa": e["k"] in active.get(slug, set())} for e in lista]
    limita = (date.fromisoformat(azi) - timedelta(days=PASTRARE_ZILE)).isoformat()
    doc = {
        "de_la": de_la,
        "actualizat": azi,
        "nota": ("Promotiile vazute pe AmCupon.ro, din datele retelelor de afiliere. `prima` = ziua in care am "
                 "vazut-o prima data; `expira` = data oficiala, cand reteaua o da; `zile` = cate promotii si "
                 "magazine s-au vazut in fiecare zi. Generat de scripts/istoric_promotii.py."),
        "zile": {z: v for z, v in sorted((zile or {}).items()) if z >= limita},
        "magazine": magazine,
    }
    cale.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    return doc


def din_git() -> tuple:
    """Ultimul instantaneu al fiecarei zile din git, in ordine cronologica."""
    log = subprocess.run(["git", "-C", str(RADACINA), "log", "--format=%H %cI", "--", OUTPUT_IN_GIT],
                         capture_output=True, text=True, check=True).stdout.splitlines()
    pe_zi = {}
    for linie in log:
        if linie.strip():
            sha, cand = linie.split(" ", 1)
            pe_zi.setdefault(cand[:10], sha)   # log-ul e descrescator: primul = ultimul commit al zilei
    istoric, zile = {}, {}
    for zi in sorted(pe_zi):
        brut = subprocess.run(["git", "-C", str(RADACINA), "show", f"{pe_zi[zi]}:{OUTPUT_IN_GIT}"],
                              capture_output=True, check=True).stdout
        try:
            date_zi = json.loads(brut.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            print(f"  {zi}: instantaneu ilizibil, sarit")
            continue
        if isinstance(date_zi, list):
            zile[zi] = acoperire(adauga_zi(istoric, date_zi, zi))
    return (min(pe_zi) if pe_zi else None), istoric, zile, len(pe_zi)


def ruleaza(din_istoric_git: bool = False) -> None:
    azi = azi_utc()
    magazine = json.loads(OUTPUT.read_text(encoding="utf-8"))
    dupa_slug = {(m.get("magazin") or "").lower(): m for m in magazine if isinstance(m, dict)}

    if din_istoric_git:
        de_la, istoric, zile, n = din_git()
        print(f"reconstruit din git: {n} zile cu date, de la {de_la}")
        stricate = 0
    else:
        de_la, istoric, stricate = citeste(ISTORIC)
        zile = citeste_zile(json.loads(ISTORIC.read_text(encoding="utf-8"))) if ISTORIC.exists() else {}

    inainte = sum(len(v) for v in istoric.values())
    active = adauga_zi(istoric, magazine, azi)
    zile[azi] = acoperire(active)   # ultima rulare a zilei ramane
    noi = sum(len(v) for v in istoric.values()) - inainte
    scoase = recurata(istoric, azi, dupa_slug)
    doc = scrie(ISTORIC, istoric, de_la or azi, azi, active, zile)

    total = sum(len(v) for v in doc["magazine"].values())
    fara_azi = sum(1 for s, v in doc["magazine"].items() if not any(e["activa"] for e in v))
    print(f"istoric promotii: {len(doc['magazine'])} magazine, {total} promotii (de la {doc['de_la']}); "
          f"noi azi: {noi}; scoase la recuratare: {scoase}; intrari stricate aruncate: {stricate}; "
          f"magazine cu istoric si fara promotie azi: {fara_azi}")


# ─── Verificari care trebuie sa poata pica ───────────────────────────────────

def test() -> None:
    m = {"magazin": "exemplu.ro", "url": "https://exemplu.ro", "promotii": [
        {"nume": "Reducere 20% la tot", "descriere": "", "cod_cupon": "VARA20", "expira": "2026-07-10"},
        {"nume": "Câștigă comision de 19% pentru afiliați", "descriere": "", "cod_cupon": ""},
        {"nume": "Ofertă expirată", "descriere": "", "cod_cupon": "", "expira": "2026-07-01"},
        {"nume": "Fără cod", "descriere": "", "cod_cupon": True},
        {"nume": "Dată absurdă", "descriere": "", "cod_cupon": "", "expira": "2036-01-01"},
        {"nume": "SAVE20", "descriere": "", "cod_cupon": "SAVE20"},
    ]}
    test_retea = {"magazin": "advertisertest.eu/production/test944", "promotii": [
        {"nume": "asd de test", "descriere": "", "cod_cupon": "asd"}]}
    ist = {}
    adauga_zi(ist, [m, test_retea], "2026-07-05")
    assert list(ist) == ["exemplu.ro"], f"un slug care nu e magazin a intrat in istoric: {list(ist)}"
    titluri = {e["titlu"]: e for e in ist["exemplu.ro"].values()}
    assert "SAVE20" not in titluri, "un cod a intrat in istoric drept titlu"
    assert "Reducere 20% la tot" in titluri, titluri
    assert not any("comision" in t for t in titluri), "textul pentru afiliati a intrat in istoric"
    assert "Ofertă expirată" not in titluri, "o promotie expirata in ziua respectiva a intrat in istoric"
    assert titluri["Fără cod"]["cod"] is False, "`cod_cupon: true` a fost numarat drept cod"
    assert titluri["Reducere 20% la tot"]["cod"] is True
    assert titluri["Dată absurdă"]["expira"] == "", "o data de peste 3 ani a fost publicata"

    # a doua zi: prima ramane, ultima avanseaza; aceeasi promotie cu alta punctuatie nu se dubleaza
    m["promotii"][0]["nume"] = "Reducere 20% la tot!"
    adauga_zi(ist, [m], "2026-07-06")
    e = next(e for e in ist["exemplu.ro"].values() if e["cod"])
    assert (e["prima"], e["ultima"]) == ("2026-07-05", "2026-07-06"), e
    assert sum(1 for e in ist["exemplu.ro"].values() if e["cod"]) == 1, "aceeasi promotie numarata de doua ori"

    # regula stransa ulterior: o intrare veche care o incalca iese la recuratare
    ist["exemplu.ro"]["x|"] = {"k": "x|", "titlu": "Affiliates earn an increased commission", "cod": False,
                                "prima": "2026-07-01", "ultima": "2026-07-01", "expira": ""}
    ist["exemplu.ro"]["y|"] = {"k": "y|", "titlu": "Exemplu", "cod": False,
                                "prima": "2026-07-01", "ultima": "2026-07-01", "expira": ""}
    ist["exemplu.ro"]["z|save30"] = {"k": "z|save30", "titlu": "SAVE30", "cod": True,
                                     "prima": "2026-07-01", "ultima": "2026-07-01", "expira": ""}
    ist["test.eu/x"] = {"a|": {"k": "a|", "titlu": "asd de test", "cod": False,
                               "prima": "2026-07-01", "ultima": "2026-07-01", "expira": ""}}
    scoase = recurata(ist, "2026-07-06", {"exemplu.ro": m})
    assert scoase == 4 and not {"x|", "y|", "z|save30"} & set(ist["exemplu.ro"]) and "test.eu/x" not in ist, scoase
    # uitarea dupa un an
    assert recurata(ist, "2027-08-01", {"exemplu.ro": m}) >= 1 and "exemplu.ro" not in ist

    # validarea la granita: o intrare stricata nu trece
    import tempfile
    with tempfile.TemporaryDirectory() as d:
        cale = Path(d) / "i.json"
        cale.write_text(json.dumps({"de_la": "2026-05-24", "magazine": {"a.ro": [
            {"k": "a|", "titlu": "Bun", "cod": False, "prima": "2026-06-01", "ultima": "2026-06-02", "expira": ""},
            {"k": "b|", "titlu": "Invers", "cod": False, "prima": "2026-06-03", "ultima": "2026-06-02", "expira": ""},
            {"k": "c|", "titlu": "Cod text", "cod": "true", "prima": "2026-06-01", "ultima": "2026-06-01", "expira": ""},
        ]}}), encoding="utf-8")
        de_la, ist2, stricate = citeste(cale)
        assert de_la == "2026-05-24" and list(ist2["a.ro"]) == ["a|"] and stricate == 2, (ist2, stricate)

    # acoperirea unei zile, si validarea ei la citire (negativ, text, data stricata = aruncate)
    v = adauga_zi({}, [m], "2026-07-06")
    assert acoperire(v) == {"promotii": len(v["exemplu.ro"]), "magazine": 1}, acoperire(v)
    z = citeste_zile({"zile": {"2026-07-01": {"promotii": 5, "magazine": 2},
                               "2026-07-02": {"promotii": -1, "magazine": 1},
                               "2026-07-03": {"promotii": "5", "magazine": 1},
                               "iulie": {"promotii": 1, "magazine": 1}}})
    assert list(z) == ["2026-07-01"], z
    print("test: toate verificarile au trecut")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--din-git", action="store_true", help="reconstruieste tot istoricul din git (o singura data)")
    ap.add_argument("--test", action="store_true", help="ruleaza verificarile")
    a = ap.parse_args()
    if a.test:
        test()
        sys.exit(0)
    ruleaza(din_istoric_git=a.din_git)
