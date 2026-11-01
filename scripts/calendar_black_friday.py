"""Calendarul Black Friday al partenerilor, din promotiile anuntate de magazine in 2Performant.

Citeste data/promotii_2p.csv (exportul de promotii 2P, inclusiv cele programate in viitor) si
frontend/public/output.json; scrie frontend/public/black-friday-parteneri.json, citit de
/black-friday langa campaniile confirmate de mana din black-friday.json.

Intra o campanie doar daca:
  - numele sau descrierea pentru client spune Black Friday / Black Week / Cyber Monday ...;
  - incepe intre 15.10 si 15.12 ale anului si se termina pana la 15.01 (datele absurde din feed ies);
  - magazinul e in output.json CU link platit (cardul trimite pe /cod-reducere/<magazin>);
  - nu e o promotie pentru alta piata (promotii.promotie_pentru_alta_piata).
Un magazin apare o singura data: campania care incepe prima. Titlul trece prin
promotii.titlu_in_text (fara cod in clar), ca peste tot pe site.

    python calendar_black_friday.py          # scrie fisierul
    python calendar_black_friday.py --test   # verificari pe date construite
"""
from __future__ import annotations

import csv
import io
import json
import os
import re
import sys
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(__file__))
from import_csv_promotii import data_csv, find_magazin, norm_slug  # noqa: E402
from nume_magazin import nume_afisat  # noqa: E402
from promotii import promotie_pentru_alta_piata, titlu_in_text  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CSV = os.path.join(ROOT, "data", "promotii_2p.csv")
OUTPUT = os.path.join(ROOT, "frontend", "public", "output.json")
IESIRE = os.path.join(ROOT, "frontend", "public", "black-friday-parteneri.json")

RE_BF = re.compile(r"\b(black\s*(friday|week|month|days?|weekend)|cyber\s*(monday|week))\b", re.I)
# Anuntul DESPRE campanie nu e campania („Teasing: Acces exclusiv la Black Friday pe 5 noiembrie!").
RE_ANUNT = re.compile(r"\b(teasing|teaser|pre-?black|in curand|în curând|pregate\w*|pregăte\w*)\b", re.I)
RE_EMOJI = re.compile("[\U0001F000-\U0001FAFF☀-➿️]")


def ora_ro(d: datetime) -> datetime:
    """UTC -> ora Romaniei (EET/EEST, regula UE: ora de vara intre ultima duminica din martie si ultima
    duminica din octombrie, la 01:00 UTC). Fara tzdata, care lipseste pe Windows. 28.10 20:00 UTC = 29.10
    22:00 in Romania — data luata din UTC ar fi pus evoMAG cu o zi mai devreme decat anuntul lui."""
    def ultima_duminica(luna: int) -> datetime:
        z = datetime(d.year, luna, 31, 1, tzinfo=timezone.utc)
        return z.replace(day=31 - (z.weekday() + 1) % 7)
    vara = ultima_duminica(3) <= d.astimezone(timezone.utc) < ultima_duminica(10)
    return d.astimezone(timezone(timedelta(hours=3 if vara else 2)))


def link_platit(m: dict) -> bool:
    return bool(m.get("url_afiliat")) and m.get("url_afiliat") != m.get("url")


def campanii(randuri: list[dict], magazine: list[dict], an: int) -> list[dict]:
    fereastra = (f"{an}-10-15", f"{an}-12-15", f"{an + 1}-01-15")
    alese: dict[str, dict] = {}
    for r in randuri:
        nume_p = (r.get("Promotion name") or "").strip()
        desc = (r.get("Description (for customer)") or "").strip()
        if not nume_p or not RE_BF.search(f"{nume_p} {desc}") or RE_ANUNT.search(nume_p):
            continue
        start, final = data_csv(r.get("Start Date") or ""), data_csv(r.get("End Date") or "")
        if not start or not final:
            continue
        # 2P scrie sfarsitul ca 00:00 in Romania (evoMAG: 2026-11-14 22:00 UTC = 15.11 00:00) — ultima zi
        # a campaniei e atunci ziua dinainte, nu ziua in care nu mai e nimic.
        f_ro = ora_ro(final)
        if (f_ro.hour, f_ro.minute) == (0, 0):
            f_ro -= timedelta(minutes=1)
        s, f = ora_ro(start).strftime("%Y-%m-%d"), f_ro.strftime("%Y-%m-%d")
        if not (fereastra[0] <= s <= fereastra[1] and s <= f <= fereastra[2]):
            continue
        idx = find_magazin(magazine, norm_slug(r.get("Affiliate program") or ""))
        if idx is None or not link_platit(magazine[idx]):
            continue
        promo = {"nume": nume_p, "descriere": desc, "cod_cupon": (r.get("Coupon code") or "").strip()}
        if promotie_pentru_alta_piata(promo):
            continue
        slug = magazine[idx]["magazin"]
        nume = nume_afisat(slug)
        nota = re.sub(r"\s{2,}", " ", RE_EMOJI.sub("", titlu_in_text(promo, nume))).strip(" -|:")
        c = {"magazin": slug, "nume": nume, "start": s, "final": f, "nota": nota}
        if slug not in alese or s < alese[slug]["start"]:
            alese[slug] = c
    return sorted(alese.values(), key=lambda c: (c["start"], c["nume"].lower()))


def citeste_csv(p: str) -> list[dict]:
    with io.open(p, encoding="utf-8-sig", errors="replace", newline="") as f:
        return [{(k or "").strip(): (v or "").strip() for k, v in r.items()} for r in csv.DictReader(f)]


def scrie() -> int:
    if not os.path.exists(CSV):
        print("data/promotii_2p.csv lipsa — calendarul ramane cum e")
        return 0
    magazine = json.load(io.open(OUTPUT, encoding="utf-8"))
    acum = datetime.now(timezone.utc)
    lista = campanii(citeste_csv(CSV), magazine, acum.year)
    io.open(IESIRE, "w", encoding="utf-8", newline="").write(json.dumps({
        "_nota": "Generat de scripts/calendar_black_friday.py din promotiile anuntate de magazine in 2Performant "
                 "(data/promotii_2p.csv). Doar parteneri cu link platit. Nu edita de mana.",
        "generat": acum.strftime("%Y-%m-%d"),
        "parteneri": lista,
    }, ensure_ascii=False, indent=1))
    print(f"Calendar Black Friday: {len(lista)} campanii ale partenerilor")
    for c in lista[:8]:
        print(f"  {c['start']} – {c['final']}  {c['nume']}: {c['nota'][:70]}")
    return 0


def test() -> int:
    mag = [
        {"magazin": "doctorshield.ro", "url": "https://doctorshield.ro", "url_afiliat": "https://event.2performant.com/x"},
        {"magazin": "faraprogram.ro", "url": "https://faraprogram.ro", "url_afiliat": "https://faraprogram.ro"},
        {"magazin": "vidaxl.bg", "url": "https://vidaxl.bg", "url_afiliat": "https://event.2performant.com/y"},
    ]
    def r(prog, nume, start, final, cod=""):
        return {"Affiliate program": prog, "Promotion name": nume, "Start Date": start, "End Date": final,
                "Description (for customer)": "", "Coupon code": cod}
    randuri = [
        r("doctorshield.ro/", "Black Friday DoctorShield: reduceri de pana la 50%", "2026-11-20 06:00:00 UTC", "2026-11-30 08:00:00 UTC"),
        r("doctorshield.ro/", "Black Week DoctorShield", "2026-11-23 06:00:00 UTC", "2026-11-30 08:00:00 UTC"),
        r("doctorshield.ro/", "Reduceri de toamna", "2026-11-01 06:00:00 UTC", "2026-11-30 08:00:00 UTC"),
        r("faraprogram.ro", "Black Friday Fara Program", "2026-11-20 06:00:00 UTC", "2026-11-30 08:00:00 UTC"),
        r("vidaxl.bg", "Black Friday: -10% отстъпка", "2026-11-20 06:00:00 UTC", "2026-11-30 08:00:00 UTC"),
        r("doctorshield.ro", "Black Friday 2036", "2036-11-20 06:00:00 UTC", "2040-03-01 00:00:00 UTC"),
        r("necunoscut.ro", "Black Friday Necunoscut", "2026-11-20 06:00:00 UTC", "2026-11-30 08:00:00 UTC"),
    ]
    rez = campanii(randuri, mag, 2026)
    asteptari = [
        ("un singur magazin trece (fara program, alta piata, necunoscut ies)", [c["magazin"] for c in rez], ["doctorshield.ro"]),
        ("campania care incepe prima castiga", rez[0]["start"] if rez else None, "2026-11-20"),
        ("datele absurde (2036/2040) nu inlocuiesc campania reala", rez[0]["final"] if rez else None, "2026-11-30"),
        ("22:00 UTC pe 28.10 e 29.10 in Romania (ora de iarna, din 25.10)",
         ora_ro(datetime(2026, 10, 28, 22, tzinfo=timezone.utc)).strftime("%Y-%m-%d"), "2026-10-29"),
        ("20:30 UTC pe 24.10 e 24.10 23:30 in Romania (inca ora de vara)",
         ora_ro(datetime(2026, 10, 24, 20, 30, tzinfo=timezone.utc)).strftime("%Y-%m-%d %H:%M"), "2026-10-24 23:30"),
        ("sfarsit la 00:00 in Romania = ultima zi e cea dinainte", [c["final"] for c in campanii(
            [r("doctorshield.ro", "Black Friday DoctorShield", "2026-10-28 22:00:00 UTC", "2026-11-14 22:00:00 UTC")],
            mag, 2026)], ["2026-11-14"]),
        ("21:30 UTC pe 30.07 e 31.07 in Romania (ora de vara)",
         ora_ro(datetime(2026, 7, 30, 21, 30, tzinfo=timezone.utc)).strftime("%Y-%m-%d"), "2026-07-31"),
        ("22:30 UTC pe 30.11 e 01.12 in Romania (iarna, +2)",
         ora_ro(datetime(2026, 11, 30, 22, 30, tzinfo=timezone.utc)).strftime("%Y-%m-%d"), "2026-12-01"),
        ("anuntul teasing nu e campanie", [c["nota"] for c in campanii(
            [r("doctorshield.ro", "Teasing: Acces exclusiv la Black Friday pe 5 noiembrie!",
               "2026-10-29 06:00:00 UTC", "2026-11-04 08:00:00 UTC")], mag, 2026)], []),
        ("emoji scos din titlu", [c["nota"] for c in campanii(
            [r("doctorshield.ro", "\U0001F525 Black Friday pe DoctorShield",
               "2026-11-20 06:00:00 UTC", "2026-11-30 08:00:00 UTC")], mag, 2026)], ["Black Friday pe DoctorShield"]),
    ]
    from import_csv_promotii import inceput_in_viitor
    acum = datetime(2026, 11, 1, 12, tzinfo=timezone.utc)
    asteptari += [
        ("importul tine promotia programata", inceput_in_viitor("2026-11-20 06:00:00 UTC", acum), True),
        ("importul publica promotia inceputa", inceput_in_viitor("2026-10-29 20:00:00 UTC", acum), False),
        ("fara data de start = activa", inceput_in_viitor("", acum), False),
    ]
    rau = [(n, a, e) for n, a, e in asteptari if a != e]
    for n, a, e in rau:
        print(f"  PICA  {n}: {a!r} (asteptat {e!r})")
    print("TOATE TREC" if not rau else f"{len(rau)} asteptari incalcate")
    return 1 if rau else 0


if __name__ == "__main__":
    sys.exit(test() if "--test" in sys.argv else scrie())
