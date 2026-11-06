"""Garda de ORTOGRAFIE: cuvintele romanesti scrise fara diacritice in textul NOSTRU de pe paginile construite.

06.11.2026, cerinta lui Alex: „fiecare litera a site-ului verificata". Prima masurare: ~27.300 de cuvinte fara
diacritice in textul nostru („Intrebari frecvente", „Inapoi", „Lasa o recenzie", „Viziteaza"), pe ~930 de pagini.
Reparat la sursa in 139 de fisiere TSX + generatoare; aici garda care tine rezultatul.

Ce e „al nostru": tot textul paginii MINUS textul care vine de la magazine (titluri de produse, promotii,
descrieri din retele). Un cuvant gresit intr-o fereastra de text care apare identic in datele unui magazin e al
magazinului (nu il rescriem: „Masina metalica" e titlul lor). Restul e al nostru.

Ce e o greseala sigura (ortografie.diacritice_lipsa): cuvantul NU exista in dictionar, dar exista cu diacritice
(„dupa" -> „după", „Selectia" -> „Selecția"). Cuvintele care exista si fara diacritice („sa", „ca", „oferta")
nu se semnaleaza: acolo doar fraza spune forma, iar o garda care ghiceste nu mai e citita de nimeni.

    python verifica_ortografie.py            # raport (iese 0)
    python verifica_ortografie.py --strict   # iese 1 daca o pagina in afara de /blog/ are o greseala a noastra
    python verifica_ortografie.py --test
Articolele de blog vechi (/blog/...) sunt numarate separat: textul lor e generat in luni trecute si se curata
odata cu rescrierea lor pe surse; --strict le ignora pana atunci.
"""
from __future__ import annotations

import collections
import io
import json
import os
import re
import sys

AICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AICI)
import ortografie as O  # noqa: E402
from verifica_text import APP, vizibil  # noqa: E402

PUB = os.path.join(AICI, "..", "frontend", "public")
# Fisiere doar cu text de magazin (titluri, promotii): tot textul lor e al magazinelor.
DATE_MAGAZINE = ("istoric-promotii.json", "black-friday-parteneri.json", "banners.json", "products-home.json",
                 "scaderi-pret.json", "nav-index.json", "products-restrictionate.json")
# Fisiere MIXTE (textul nostru + nume de produse/oferte): de la magazin sunt doar campurile de nume.
# top-produse.json are verdictele si pro/contra scrise de noi: acelea se verifica, nu se scad.
DATE_MIXTE = ("top-produse.json", "criterii.json", "digest-today.json", "comparisons.json", "recomandate.json")
CHEI_NUME = {"nume", "title", "name", "brand", "model", "nume_afisat", "titlu_produs", "magazin", "nume_magazin"}
# domenii, adrese si emailuri nu sunt cuvinte: „carti.amcupon.ro", „data/postari-zilnice.json"
MASCA = re.compile(r"https?://\S+|www\.\S+|\S+@\S+\.\S+|\b[\w.-]+\.(?:ro|com|net|eu|org|bg|hu|de|io|app|co|json|html|txt)\b|\b[\w-]+/[\w./-]+")


def _siruri(x, out, chei=None, sub_cheie=False):
    """Toate sirurile; cu `chei`, doar cele aflate (oricat de adanc) sub una dintre chei."""
    if isinstance(x, str):
        if chei is None or sub_cheie:
            out.append(x)
    elif isinstance(x, dict):
        for k, v in x.items():
            _siruri(v, out, chei, sub_cheie or (chei is not None and k in chei))
    elif isinstance(x, list):
        for v in x:
            _siruri(v, out, chei, sub_cheie)


def siruri_magazine(pub: str = PUB) -> list:
    """Textele care vin de la magazine/retele (titluri, promotii, descrieri)."""
    rez = []
    def json_(n):
        try:
            return json.load(io.open(os.path.join(pub, n), encoding="utf-8"))
        except (OSError, ValueError):
            return None
    p = json_("products.json")
    for x in (p.get("products", p) if isinstance(p, dict) else p or []):
        for k in ("title", "brand", "category"):
            if isinstance(x.get(k), str):
                rez.append(x[k])
    for m in json_("output.json") or []:
        for k in ("program_name", "descriere", "nume"):
            if isinstance(m.get(k), str):
                rez.append(m[k])
        for pr in m.get("promotii") or []:
            for k in ("nume", "descriere"):
                if isinstance(pr.get(k), str):
                    rez.append(pr[k])
    for n in DATE_MAGAZINE:
        _siruri(json_(n), rez)
    for n in DATE_MIXTE:
        _siruri(json_(n), rez, CHEI_NUME)
    for c in (json_("criterii.json") or {}).get("criterii", []):
        rez += [p.get("titlu", "") for p in c.get("produse") or [] if isinstance(p, dict)]
    return rez


def nume_magazine(pub: str = PUB) -> set:
    """Eticheta de domeniu a fiecarui magazin, fara cratime: „miculmeserias", „faradaunatori", „trada".
    Numele afisat al magazinului vine din domeniu (lib/numeMagazin.ts), deci „Fara Daunatori" e un nume, nu text."""
    try:
        magazine = json.load(io.open(os.path.join(pub, "output.json"), encoding="utf-8"))
    except (OSError, ValueError):
        return set()
    rez = set()
    for m in magazine:
        dom = (m.get("magazin") or "").lower().split("/")[0]
        parti = [x for x in dom.split(".") if x not in ("www", "ro", "com", "eu", "net", "org", "shop", "store", "co", "uk", "de", "bg", "hu", "it", "fr", "es", "pl", "us")]
        if parti:
            rez.add(parti[-1].replace("-", ""))
    return rez


class Index:
    def __init__(self, siruri: list):
        self.idx = collections.defaultdict(list)
        for s in set(siruri):
            for m in O.CUVANT.finditer(s):
                for parte in m.group(0).split("-"):
                    if O.diacritice_lipsa_rapid(parte):
                        self.idx[parte].append(s)

    def al_magazinului(self, linie: str, a: int, b: int, w: str) -> bool:
        """Cuvantul e al magazinului daca o fereastra de text din jurul lui (la stanga, la dreapta sau centrata)
        apare identic intr-un text de magazin: textul lui poate fi lipit de al nostru pe aceeasi linie."""
        ferestre = {linie[a: b + 25].strip(), linie[max(0, a - 25): b].strip(), linie[max(0, a - 12): b + 12].strip()}
        ferestre = {f for f in ferestre if len(f) >= min(12, len(linie.strip()))}
        scurt = linie.rstrip("….").strip()
        return any(any(f in s for f in ferestre) or (len(linie) < 40 and scurt in s) for s in self.idx.get(w, ()))


def _e_nume_magazin(linie: str, a: int, b: int, magazine: set) -> bool:
    """Sirul de cuvinte cu majuscula din jurul cuvantului, lipit si fara diacritice, e eticheta unui magazin."""
    st = linie[:a].split()
    dr = linie[b:].split()
    run = [linie[a:b]]
    for w in reversed(st):
        if w[:1].isupper() and w.isalpha():
            run.insert(0, w)
        else:
            break
    for w in dr:
        w2 = w.strip(".,;:!?→")
        if w2[:1].isupper() and w2.isalpha():
            run.append(w2)
        else:
            break
    for i in range(len(run)):
        for j in range(i + 1, len(run) + 1):
            if O.pliaza("".join(run[i:j])) in magazine:
                return True
    return False


def greseli_linie(linie: str, index: Index | None, magazine: set | None = None) -> list:
    rez = []
    curat = MASCA.sub(lambda m: " " * len(m.group(0)), linie)
    for m in O.CUVANT.finditer(curat):
        t, poz = m.group(0), m.start()
        if not O.de_verificat(t):
            continue
        for parte in t.split("-"):
            a = curat.find(parte, poz)
            b = a + len(parte)
            poz = b
            if len(parte) < 2 or not O.de_verificat(parte):
                continue
            if parte.lower() == "in" and "-" in t:
                continue  # „all-in-one", „check-in": engleza
            v = O.diacritice_lipsa_rapid(parte)
            if not v:
                continue
            if magazine and parte[:1].isupper() and _e_nume_magazin(curat, a, b, magazine):
                continue
            if index is not None and index.al_magazinului(linie, a, b, parte):
                continue
            rez.append((parte, v[0]))
    return rez


def verifica(app: str = APP, strict: bool = False) -> int:
    if not os.path.isdir(app):
        print(f"Lipseste build-ul: {app}")
        return 1
    index = Index(siruri_magazine())
    magazine = nume_magazine()
    pe_cuvant = collections.Counter()
    exemple: dict = {}
    pagini_cu = collections.Counter()
    blog = altele = 0
    for d, _, fs in os.walk(app):
        for f in fs:
            if not f.endswith(".html"):
                continue
            rel = os.path.relpath(os.path.join(d, f), app).replace("\\", "/")[:-5]
            if rel.startswith(("_not-found", "_global-error", "admin")):
                continue
            url = "/" + ("" if rel == "index" else rel)
            for linie in vizibil(io.open(os.path.join(d, f), encoding="utf-8", errors="replace").read()).splitlines():
                for w, corect in greseli_linie(linie, index, magazine):
                    if url.startswith("/blog/"):
                        blog += 1
                        continue
                    altele += 1
                    pe_cuvant[(w, corect)] += 1
                    pagini_cu[url] += 1
                    exemple.setdefault((w, corect), (url, linie[:150]))
    print(f"Ortografie: {altele} cuvinte fara diacritice in textul nostru pe {len(pagini_cu)} pagini; "
          f"{blog} in articolele de blog vechi (se curata la rescriere).")
    for (w, corect), n in pe_cuvant.most_common(25):
        u, l = exemple[(w, corect)]
        print(f"  {n:5d}  {w} -> {corect}   {u}  |  {l}")
    if strict and altele:
        print("\n  NU publica: repara la sursa (textul paginii sau generatorul).")
        return 1
    return 0


def test() -> int:
    esec = 0
    def e(cond, msg):
        nonlocal esec
        if not cond:
            esec += 1
            print("ESEC:", msg)
    idx = Index(["Masina metalica pentru copii, Matchbox", "Promotia se aplica si la produsele reduse"])
    e(greseli_linie("Intrebari frecvente despre Libris", idx) == [("Intrebari", "Întrebări")], "textul nostru e prins")
    e(greseli_linie("Masina metalica pentru copii, Matchbox — 24 lei", idx) == [], "titlul magazinului ramane al lui")
    e(greseli_linie("Extra 15%. Promotia se aplica si la produsele reduse", idx) == [], "promotia magazinului ramane")
    e(greseli_linie("Întrebări frecvente: după ce plătești, primești codul", idx) == [], "textul corect trece")
    e(greseli_linie("Lansează carti.amcupon.ro și data/postari-zilnice.json", idx) == [], "domenii si cai nu sunt cuvinte")
    e([w for w, _ in greseli_linie("Selectia de azi e facuta automat, dupa reducere", None)] == ["Selectia", "facuta", "dupa"],
      "fraza fara diacritice")
    mag = {"faradaunatori", "miculmeserias", "trada"}
    e(greseli_linie("Black Friday Micul Meserias", None, mag) == [], "numele magazinului nu e greseala")
    e(greseli_linie("Cod reducere Fara Daunatori", None, mag) == [], "numele magazinului din doua cuvinte")
    e(greseli_linie("Fara cod. Alegerea Redactiei", None, mag) == [("Fara", "Fără"), ("Redactiei", "Redacției")],
      "Fara singur nu e magazin; textul nostru ramane prins")
    e(greseli_linie("CRM all-in-one: email", None) == [], "all-in-one e engleza")
    print("verifica_ortografie.py --test:", "OK" if not esec else f"{esec} esecuri")
    return 1 if esec else 0


if __name__ == "__main__":
    if "--test" in sys.argv:
        sys.exit(test())
    sys.exit(verifica(strict="--strict" in sys.argv))
