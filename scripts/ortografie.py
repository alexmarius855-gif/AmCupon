"""Ortografia romaneasca, offline: dictionarul ro_RO (Rospell 3.3.10, din LibreOffice) + o cautare hunspell minimala.

06.11.2026, cerinta lui Alex: „fiecare litera a site-ului verificata". `verifica_text.py` prinde greselile de forma
(punctuatie, acord, afirmatii false); aici e ortografia: un cuvant romanesc scris fara diacritice („dupa", „facuta",
„Selectia") nu exista in dictionar, dar forma lui cu diacritice exista. Asta e o greseala sigura, cu reparatia stiuta.

Dictionarul (scripts/dictionar/, licenta GPL 2.0 / LGPL 2.1 / MPL 1.1, vezi README_EN.txt) are 181.357 de radacini si
reguli de sufixe/prefixe cu un singur caracter de marcaj, fara compunere, fara clase de continuare. De aceea ajunge o
cautare scrisa aici (fara pachete instalate, la fel local si in CI): cuvantul e corect daca e o radacina sau daca,
scotand un sufix (si/sau un prefix) al unei reguli, ramane o radacina care are marcajul regulii si respecta conditia.

    python ortografie.py --test          # cuvinte stiute, in ambele sensuri
    python ortografie.py cuvant ...      # spune ce crede despre fiecare
"""
from __future__ import annotations

import io
import os
import re
import sys

DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dictionar")

# Pliere: aceeasi litera fara semn. Sedila (ş ţ) e varianta veche a virgulei (ș ț); textul trece prin
# text_curat.diacritice inainte, dar plierea le trateaza la fel oricum.
_PLIERE = str.maketrans("ăâîșşțţ", "aaisstt")
LITERE_RO = set("abcdefghijklmnopqrstuvwxyzăâîșț")


def pliaza(w: str) -> str:
    return w.lower().translate(_PLIERE)


class _Regula:
    __slots__ = ("flag", "strip", "add", "cond", "cross")

    def __init__(self, flag, strip, add, cond, cross, sufix):
        self.flag = flag
        self.strip = "" if strip == "0" else strip
        self.add = "" if add == "0" else add.split("/")[0]
        self.cross = cross
        if cond in (".", ""):
            self.cond = None
        else:
            self.cond = re.compile(("(?:%s)$" if sufix else "^(?:%s)") % cond)


class Dictionar:
    def __init__(self, director: str = DIR, nume: str = "ro_RO"):
        self.radacini: dict[str, str] = {}
        self.pliate: dict[str, list] = {}
        self.sfx: dict[str, list] = {}
        self.sfx_pliat: dict[str, list] = {}
        self.pfx: list = []
        cross: dict = {}
        for linie in io.open(os.path.join(director, nume + ".aff"), encoding="utf-8"):
            p = linie.split()
            if len(p) < 4 or p[0] not in ("SFX", "PFX"):
                continue
            if len(p) == 4 and p[2] in ("Y", "N"):
                cross[(p[0], p[1])] = p[2] == "Y"
                continue
            r = _Regula(p[1], p[2], p[3], p[4] if len(p) > 4 else ".", cross.get((p[0], p[1]), False), p[0] == "SFX")
            if p[0] == "SFX":
                self.sfx.setdefault(r.add, []).append(r)
                self.sfx_pliat.setdefault(pliaza(r.add), []).append(r)
            else:
                self.pfx.append(r)
        self.max_sfx = max(len(a) for a in self.sfx)
        with io.open(os.path.join(director, nume + ".dic"), encoding="utf-8") as f:
            next(f)  # prima linie = numarul de intrari
            for linie in f:
                linie = linie.strip()
                if not linie:
                    continue
                cuv, _, marcaje = linie.partition("/")
                cuv = cuv.split("\t")[0].strip()
                marcaje = marcaje.split()[0] if marcaje else ""
                if not cuv:
                    continue
                if cuv in self.radacini:
                    self.radacini[cuv] += marcaje
                else:
                    self.radacini[cuv] = marcaje
                    self.pliate.setdefault(pliaza(cuv), []).append(cuv)
        self._cache: dict = {}

    # --- cautarea exacta (cu diacriticele si majusculele asa cum sunt) --------------------------------------------

    def _cu_sufix(self, w: str, cere: str | None = None) -> bool:
        n = len(w)
        for k in range(0, min(n - 1, self.max_sfx) + 1):
            for r in self.sfx.get(w[n - k:] if k else "", ()):
                radacina = w[:n - k] + r.strip
                if r.cond and not r.cond.search(radacina):
                    continue
                m = self.radacini.get(radacina)
                if m is not None and r.flag in m and (cere is None or (r.cross and cere in m)):
                    return True
        return False

    def _exact(self, w: str) -> bool:
        if w in self.radacini or self._cu_sufix(w):
            return True
        for r in self.pfx:
            if len(w) > len(r.add) and w.startswith(r.add):
                rest = r.strip + w[len(r.add):]
                if r.cond and not r.cond.search(rest):
                    continue
                m = self.radacini.get(rest)
                if m is not None and r.flag in m:
                    return True
                if r.cross and self._cu_sufix(rest, cere=r.flag):
                    return True
        return False

    def corect(self, w: str) -> bool:
        """Majusculele ca la hunspell: „după" accepta si „După" si „DUPĂ"; „București" nu accepta „bucurești"."""
        if w in self._cache:
            return self._cache[w]
        ok = self._exact(w)
        if not ok and w[:1].isupper():
            if w.isupper():
                ok = self._exact(w.lower()) or self._exact(w[0] + w[1:].lower())
            elif w[1:] == w[1:].lower():
                ok = self._exact(w.lower())
        self._cache[w] = ok
        return ok

    # --- cautarea pliata: formele corecte care difera doar prin diacritice ----------------------------------------

    def _pliat_sufix(self, fw: str, cere: str | None = None) -> set:
        rez = set()
        n = len(fw)
        for k in range(0, min(n - 1, self.max_sfx) + 1):
            for r in self.sfx_pliat.get(fw[n - k:] if k else "", ()):
                for radacina in self.pliate.get(fw[:n - k] + pliaza(r.strip), ()):
                    m = self.radacini[radacina]
                    if r.flag not in m or (cere is not None and not (r.cross and cere in m)):
                        continue
                    if r.cond and not r.cond.search(radacina):
                        continue
                    if r.strip and not radacina.endswith(r.strip):
                        continue
                    rez.add(radacina[:len(radacina) - len(r.strip)] + r.add)
        return rez

    def variante(self, w: str) -> set:
        """Toate formele corecte din dictionar care, fara diacritice si fara majuscule, sunt `w`."""
        fw = pliaza(w)
        rez = set(self.pliate.get(fw, ())) | self._pliat_sufix(fw)
        for r in self.pfx:
            fa = pliaza(r.add)
            if len(fw) > len(fa) and fw.startswith(fa):
                rest = pliaza(r.strip) + fw[len(fa):]
                for radacina in self.pliate.get(rest, ()):
                    if r.flag in self.radacini[radacina] and (not r.cond or r.cond.search(radacina)):
                        rez.add(r.add + radacina[len(r.strip):])
                if r.cross:
                    rez |= {r.add + x[len(r.strip):] for x in self._pliat_sufix(rest, cere=r.flag)}
        return {x for x in rez if pliaza(x) == fw}

    def diacritice_lipsa(self, w: str) -> list:
        """Cuvantul nu exista, dar exista cu alte diacritice: intoarce formele corecte (in forma de scriere a lui `w`).
        Lista goala = cuvantul e corect sau nu e cuvant romanesc stiut (marca, nume, cuvant strain)."""
        if self.corect(w):
            return []
        sus = w[:1].isupper()
        tot_sus = w.isupper() and len(w) > 1
        rez = []
        for v in sorted(self.variante(w)):
            if v == w or not any(c in "ăâîșțĂÂÎȘȚ" for c in v):
                continue
            if v[:1].isupper() and not sus:
                continue  # „bucuresti" nu sugereaza „București": acolo lipseste si majuscula, e alta problema
            if tot_sus:
                v = v.upper()
            elif sus:
                v = v[0].upper() + v[1:]
            if v != w and v not in rez:
                rez.append(v)
        return rez


_D: Dictionar | None = None


def dictionar() -> Dictionar:
    global _D
    if _D is None:
        _D = Dictionar()
    return _D


_LIPSA: dict = {}


def diacritice_lipsa_rapid(w: str) -> tuple:
    """diacritice_lipsa cu memorie: acelasi cuvant apare de mii de ori pe site."""
    if w not in _LIPSA:
        _LIPSA[w] = tuple(dictionar().diacritice_lipsa(w)) if de_verificat(w) else ()
    return _LIPSA[w]


CUVANT = re.compile(r"[^\W\d_]+(?:[-’'][^\W\d_]+)*")


def de_verificat(t: str) -> bool:
    """Doar cuvintele scrise cu alfabetul romanesc, fara majuscule in interior (iPhone, AmCupon) si fara sigle."""
    if len(t) < 2 or not set(t.lower()) <= LITERE_RO | {"-", "’", "'"}:
        return False
    if t.isupper():
        return len(t) > 5
    return t[1:] == t[1:].lower() or "-" in t


def cuvinte_fara_diacritice(text: str) -> list:
    """(cuvant, [forme corecte]) pentru fiecare cuvant romanesc scris fara diacritice sau cu diacritice gresite."""
    d = dictionar()
    rez = []
    for m in CUVANT.finditer(text):
        t = m.group(0)
        if not de_verificat(t):
            continue
        for parte in t.split("-"):
            if len(parte) >= 2 and de_verificat(parte):
                v = d.diacritice_lipsa(parte)
                if v:
                    rez.append((parte, v))
    return rez


def test() -> int:
    d = dictionar()
    esec = 0

    def e(cond, msg):
        nonlocal esec
        if not cond:
            esec += 1
            print("ESEC:", msg)

    for w in ["după", "făcută", "selecția", "Selecția", "ofertele", "reduceri", "rămase", "magazine", "zile",
              "mâine", "În", "DUPĂ", "București", "refăcută", "nefolosit", "codurile", "produse", "activă", "Și"]:
        e(d.corect(w), f"{w} ar trebui sa fie corect")
    for w in ["dupa", "facuta", "Selectia", "xqzt", "bucurești", "magazinee", "codurilee"]:
        e(not d.corect(w), f"{w} ar trebui sa NU fie corect")
    asteptat = {"dupa": ["după"], "Selectia": ["Selecția"], "DUPA": ["DUPĂ"], "maine": ["mâine"],
                "cumparaturi": ["cumpărături"], "si": ["și"], "in": ["în"], "pret": ["preț"]}
    for w, v in asteptat.items():
        e(d.diacritice_lipsa(w) == v, f"{w} -> {d.diacritice_lipsa(w)}, asteptat {v}")
    e("făcută" in d.diacritice_lipsa("facuta"), "facuta -> făcută")  # si „făcuta" (articulat) e corect
    # „ramase" exista si fara diacritice („el ramase", de la „a rama"): ambiguu, deci nu se semnaleaza.
    for w in ["după", "Samsung", "xqzt", "magazin", "bucuresti", "ramase"]:
        e(d.diacritice_lipsa(w) == [], f"{w} nu trebuie semnalat: {d.diacritice_lipsa(w)}")
    gasite = [w for w, _ in cuvinte_fara_diacritice("Selectia de azi e facuta automat din ofertele active, dupa reducere.")]
    e(gasite == ["Selectia", "facuta", "dupa"], f"fraza fara diacritice: {gasite}")
    e(cuvinte_fara_diacritice("Selecția de azi e făcută automat, după reducere, iPhone 15 și AmCupon.") == [],
      "fraza corecta nu trebuie semnalata")
    print("ortografie.py --test:", "OK" if not esec else f"{esec} esecuri")
    return 1 if esec else 0


if __name__ == "__main__":
    if sys.argv[1:2] == ["--test"]:
        sys.exit(test())
    d = dictionar()
    for w in sys.argv[1:]:
        print(w, "corect" if d.corect(w) else "GRESIT", d.diacritice_lipsa(w))
