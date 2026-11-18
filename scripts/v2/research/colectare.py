"""
Colecteaza sugestiile de cautare (autocomplete) pentru fiecare saminta, de la Google, Bing, DuckDuckGo si
YouTube. Ruleaza in GitHub Actions: din containerul sesiunilor Claude, motoarele sunt blocate de proxy.

Reguli de buna purtare:
  - un fir de lucru pe gazda (Google si YouTube sunt aceeasi gazda: acelasi fir), cu pauza intre cereri;
  - la 429/503 asteapta, apoi incearca o data; dupa 6 esecuri la rand motorul se opreste pentru rularea asta;
  - fiecare motor are un buget de timp: ce nu apuca, ramane nefacut si se vede in raport.
Nu trimitem nimic care sa ne identifice (agent de utilizator generic).

    python scripts/v2/research/colectare.py --seminte research-out/seminte.json --iesire research-out/sugestii.json
    python scripts/v2/research/colectare.py --test        # citirea raspunsurilor, fara retea
"""
from __future__ import annotations

import argparse
import json
import os
import random
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

AGENT = "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0"

MOTOARE = {
    "google": ("https://suggestqueries.google.com/complete/search?client=firefox&hl=ro&gl=ro&ie=utf-8&oe=utf-8&q={q}", "google"),
    "youtube": ("https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=ro&gl=ro&ie=utf-8&oe=utf-8&q={q}", "google"),
    "bing": ("https://api.bing.com/osjson.aspx?query={q}&mkt=ro-RO&setlang=ro-RO&cc=RO", "bing"),
    "ddg": ("https://duckduckgo.com/ac/?q={q}&kl=ro-ro&type=list", "ddg"),
}
# Pauza intre cereri pe acelasi fir (secunde) si bugetul firului.
PAUZA = {"google": 1.2, "bing": 0.8, "ddg": 1.4}
BUGET_SECUNDE = 26 * 60
MAX_ESECURI_LA_RAND = 6


def citeste_raspuns(motor: str, corp: bytes) -> list[str]:
    """Lista de sugestii din raspunsul motorului. Formate: [q, [s...]] sau [{"phrase": s}, ...]."""
    text = corp.decode("utf-8", errors="replace").strip()
    if not text:
        return []
    date = json.loads(text)
    if isinstance(date, list) and len(date) >= 2 and isinstance(date[1], list):
        brute = date[1]
    elif isinstance(date, list) and all(isinstance(x, dict) for x in date):
        brute = [x.get("phrase", "") for x in date]
    else:
        raise ValueError(f"format necunoscut de la {motor}: {text[:80]!r}")
    vazute, rez = set(), []
    for s in brute:
        s = (s if isinstance(s, str) else "").strip()
        if s and s.lower() not in vazute:
            vazute.add(s.lower())
            rez.append(s)
    return rez[:10]


class Fir:
    """Un fir pe gazda: cereri una dupa alta, cu pauza, buget si oprire dupa esecuri repetate."""

    def __init__(self, gazda: str):
        self.gazda = gazda
        self.pauza = PAUZA[gazda]
        self.esecuri_la_rand = 0
        self.oprit = ""
        self.start = time.monotonic()
        self.stat = {"cereri": 0, "ok": 0, "goale": 0, "erori": 0, "nefacute": 0}

    def cere(self, motor: str, text: str) -> dict:
        if self.oprit:
            self.stat["nefacute"] += 1
            return {"stare": "nefacut"}
        if time.monotonic() - self.start > BUGET_SECUNDE:
            self.oprit = "buget de timp depasit"
            self.stat["nefacute"] += 1
            return {"stare": "nefacut"}
        url = MOTOARE[motor][0].format(q=urllib.parse.quote(text))
        for incercare in range(2):
            time.sleep(self.pauza + random.uniform(0, self.pauza / 2))
            self.stat["cereri"] += 1
            try:
                req = urllib.request.Request(url, headers={"User-Agent": AGENT, "Accept": "application/json,*/*"})
                with urllib.request.urlopen(req, timeout=15) as r:
                    sug = citeste_raspuns(motor, r.read())
                self.esecuri_la_rand = 0
                self.stat["ok"] += 1
                if not sug:
                    self.stat["goale"] += 1
                return {"stare": "ok", "sugestii": sug}
            except urllib.error.HTTPError as e:
                cod = f"http {e.code}"
                if e.code in (429, 503) and incercare == 0:
                    time.sleep(30)
                    continue
            except Exception as e:  # retea, JSON stricat
                cod = type(e).__name__
            self.stat["erori"] += 1
            self.esecuri_la_rand += 1
            if self.esecuri_la_rand >= MAX_ESECURI_LA_RAND:
                self.oprit = f"{MAX_ESECURI_LA_RAND} esecuri la rand (ultimul: {cod})"
            return {"stare": f"eroare: {cod}"}
        return {"stare": "eroare: reincercare epuizata"}


def colecteaza(seminte: list[dict]) -> dict:
    fire = {g: Fir(g) for g in PAUZA}
    sarcini: dict[str, list[tuple[int, str]]] = {g: [] for g in fire}
    for i, s in enumerate(seminte):
        for motor in s["motoare"]:
            sarcini[MOTOARE[motor][1]].append((i, motor))
    rezultate: list[dict] = []
    lacat = threading.Lock()

    def lucreaza(gazda: str):
        fir = fire[gazda]
        for i, motor in sarcini[gazda]:
            s = seminte[i]
            r = fir.cere(motor, s["text"])
            with lacat:
                rezultate.append({"seed": s["text"], "grup": s["grup"], "motor": motor, **r,
                                  **{k: v for k, v in s.items() if k not in ("text", "grup", "motoare")}})

    with ThreadPoolExecutor(max_workers=len(fire)) as ex:
        list(ex.map(lucreaza, fire))
    return {
        "colectat_la": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "motoare": {g: {**f.stat, "oprit": f.oprit} for g, f in fire.items()},
        "rezultate": rezultate,
    }


def test() -> int:
    erori = []
    cazuri = [
        ("google", b'["cod reducere a",["cod reducere answear","cod reducere about you","Cod reducere Answear"]]',
         ["cod reducere answear", "cod reducere about you"]),
        ("bing", b'["laptop",["laptop gaming","laptop lenovo"]]', ["laptop gaming", "laptop lenovo"]),
        ("ddg", b'[{"phrase":"voucher emag"},{"phrase":"voucher edenred"}]', ["voucher emag", "voucher edenred"]),
        ("ddg", b'["voucher e",["voucher emag"]]', ["voucher emag"]),
        ("google", "[\"friteuză\",[\"friteuză cu aer\"]]".encode("utf-8"), ["friteuză cu aer"]),
        ("google", b'["zzzz",[]]', []),
        ("google", b"", []),
    ]
    for motor, corp, asteptat in cazuri:
        try:
            primit = citeste_raspuns(motor, corp)
        except Exception as e:  # noqa: BLE001
            primit = f"exceptie {e}"
        if primit != asteptat:
            erori.append(f"{motor}: {corp[:40]!r} -> {primit!r}, asteptat {asteptat!r}")
    try:
        citeste_raspuns("bing", b'{"eroare": 1}')
        erori.append("un format necunoscut trebuie sa ridice eroare, nu sa dea lista goala")
    except ValueError:
        pass
    # Firul se opreste dupa esecuri la rand si nu mai face cereri.
    f = Fir("bing")
    f.esecuri_la_rand = MAX_ESECURI_LA_RAND - 1
    f.oprit = ""
    f.pauza = 0
    MOTOARE["_test"] = ("http://127.0.0.1:9/{q}", "bing")
    r1 = f.cere("_test", "x")
    r2 = f.cere("_test", "y")
    del MOTOARE["_test"]
    if not f.oprit or r2.get("stare") != "nefacut" or not r1["stare"].startswith("eroare"):
        erori.append(f"oprirea dupa esecuri nu merge: {r1}, {r2}, oprit={f.oprit!r}")
    for e in erori:
        print("PICA:", e)
    print("colectare.py:", "OK" if not erori else f"{len(erori)} erori")
    return 1 if erori else 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--seminte", default="research-out/seminte.json")
    ap.add_argument("--iesire", default="research-out/sugestii.json")
    ap.add_argument("--test", action="store_true")
    a = ap.parse_args()
    if a.test:
        return test()
    with open(a.seminte, encoding="utf-8") as f:
        seminte = json.load(f)
    rez = colecteaza(seminte)
    with open(a.iesire, "w", encoding="utf-8") as f:
        json.dump(rez, f, ensure_ascii=False, indent=1)
    for g, st in rez["motoare"].items():
        print(f"{g}: {st['ok']} raspunsuri ({st['goale']} goale), {st['erori']} erori, "
              f"{st['nefacute']} nefacute{' — oprit: ' + st['oprit'] if st['oprit'] else ''}")
    ok = sum(st["ok"] for st in rez["motoare"].values())
    if ok == 0:
        print("Niciun motor n-a raspuns: nimic de analizat.")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
