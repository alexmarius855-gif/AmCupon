"""Calendarul Black Friday al partenerilor, din promotiile anuntate de magazine in 2Performant.

Citeste data/promotii_2p.csv (exportul manual de promotii 2P, inclusiv cele programate in viitor) si
frontend/public/output.json; scrie frontend/public/black-friday-parteneri.json, citit de
/black-friday langa campaniile confirmate de mana din black-friday.json.

04.11.2026: citeste si ofertele 2P active din output.json. Pana acum, calendarul vedea doar exportul
din 01.11, deci campaniile aparute dupa (Answear „Magic Black Friday", GeekMall, Mobidea) n-aveau
pagina /black-friday/<magazin>, chiar daca oferta era pe site cu link platit. Oferta programata
ramane vizibila doar din CSV: `curata_promotii` o tine nepublicata pana in ziua de start.

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
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(__file__))
from import_csv_promotii import find_magazin, norm_slug  # noqa: E402
from text_curat import acord_numeral  # noqa: E402
from nume_magazin import nume_afisat  # noqa: E402
from promotii import (RE_EMOJI, data_csv, descriere_publica, fara_segmente_afiliati,  # noqa: E402
                      inceput_in_viitor, ora_ro, promotie_pentru_alta_piata, sfarsit_real, titlu_in_text)

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CSV = os.path.join(ROOT, "data", "promotii_2p.csv")
OUTPUT = os.path.join(ROOT, "frontend", "public", "output.json")
IESIRE = os.path.join(ROOT, "frontend", "public", "black-friday-parteneri.json")

RE_BF = re.compile(r"\b(black\s*(friday|week|month|days?|weekend)|cyber\s*(monday|week))\b", re.I)
# Anuntul DESPRE campanie nu e campania („Teasing: Acces exclusiv la Black Friday pe 5 noiembrie!").
RE_ANUNT = re.compile(r"\b(teasing|teaser|pre-?black|in curand|în curând|pregate\w*|pregăte\w*)\b", re.I)


# Paginile /black-friday/categorie/<slug>: doar cu cel putin MIN_CATEGORIE campanii, ca lista sa merite o
# pagina. „marketplace" nu e o categorie pe care o cauta cineva. Sursa unica: sitemap-ul, pagina si
# IndexNow citesc lista din fisierul generat.
CATEGORII_BF = {
    "casa-gradina": "casă și grădină",
    "fashion": "haine și încălțăminte",
    "beauty": "cosmetice",
    "electronice": "electronice și IT",
    "carti-educatie": "cărți",
    "copii": "jucării și copii",
    "sanatate": "sănătate",
    "sport": "sport",
    "auto-moto": "auto-moto",
    "animale": "animale de companie",
    "bijuterii": "bijuterii",
}
MIN_CATEGORIE = 3


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
        s = ora_ro(start).strftime("%Y-%m-%d")
        f = sfarsit_real(r.get("End Date") or "").strftime("%Y-%m-%d")
        if not (fereastra[0] <= s <= fereastra[1] and s <= f <= fereastra[2]):
            continue
        idx = find_magazin(magazine, norm_slug(r.get("Affiliate program") or ""))
        if idx is None or not link_platit(magazine[idx]):
            continue
        # „Voucher Black Friday 6-15 Noiembrie + comision HAVIT 10%": bucata pentru afiliati nu se publica.
        nume_curat = fara_segmente_afiliati(nume_p, magazine[idx])
        if not nume_curat:
            continue
        promo = {"nume": nume_curat, "descriere": desc, "cod_cupon": (r.get("Coupon code") or "").strip()}
        if promotie_pentru_alta_piata(promo):
            continue
        slug = magazine[idx]["magazin"]
        nume = nume_afisat(slug)
        nota = acord_numeral(re.sub(r"\s{2,}", " ", RE_EMOJI.sub("", titlu_in_text(promo, nume))).strip(" -|:"))
        c = {"magazin": slug, "nume": nume, "start": s, "final": f, "nota": nota,
             "descriere": descriere_publica(desc, promo), "are_cod": bool(promo["cod_cupon"])}
        if slug not in alese or s < alese[slug]["start"]:
            alese[slug] = c
    return sorted(alese.values(), key=lambda c: (c["start"], c["nume"].lower()))


def randuri_din_oferte(magazine: list[dict]) -> list[dict]:
    """Ofertele 2P active din output.json, in forma randurilor din CSV, ca sa treaca prin aceleasi reguli.
    Doar 2Performant: Impact aduce magazine straine, iar clicurile spre ele n-au dat vanzari (08.10.2026)."""
    randuri = []
    for m in magazine:
        if m.get("platforma") != "2performant":
            continue
        for p in m.get("promotii") or []:
            randuri.append({
                "Affiliate program": m.get("magazin") or "",
                "Promotion name": p.get("nume") or "",
                "Start Date": str(p.get("incepe") or ""),
                "End Date": str(p.get("expira") or ""),
                "Description (for customer)": p.get("descriere") or "",
                "Coupon code": p.get("cod_cupon") or "",
            })
    return randuri


def pastreaza_vechi(noi: list[dict], vechi: list[dict], magazine: list[dict], an: int) -> list[dict]:
    """Noile campanii + cele de anul acesta care nu mai sunt in export, cat timp magazinul e partener platit."""
    slug_noi = {c["magazin"] for c in noi}
    platite = {m["magazin"] for m in magazine if link_platit(m)}
    pastrate = [c for c in vechi if c.get("magazin") not in slug_noi and c.get("magazin") in platite
                and str(c.get("start", "")).startswith(str(an))]
    return sorted(noi + pastrate, key=lambda c: (c["start"], c["nume"].lower()))


def cu_categorii(lista: list[dict], magazine: list[dict]) -> list[dict]:
    """Pune `categorie` pe fiecare campanie si intoarce categoriile care merita o pagina."""
    dupa_slug = {m["magazin"]: m.get("categorie_slug") or "" for m in magazine}
    cate: dict[str, int] = {}
    for c in lista:
        c["categorie"] = dupa_slug.get(c["magazin"], "")
        cate[c["categorie"]] = cate.get(c["categorie"], 0) + 1
    return [{"slug": k, "nume": n, "campanii": cate[k]} for k, n in CATEGORII_BF.items()
            if cate.get(k, 0) >= MIN_CATEGORIE]


def citeste_csv(p: str) -> list[dict]:
    with io.open(p, encoding="utf-8-sig", errors="replace", newline="") as f:
        return [{(k or "").strip(): (v or "").strip() for k, v in r.items()} for r in csv.DictReader(f)]


def scrie() -> int:
    magazine = json.load(io.open(OUTPUT, encoding="utf-8"))
    acum = datetime.now(timezone.utc)
    randuri = citeste_csv(CSV) if os.path.exists(CSV) else []
    lista = campanii(randuri + randuri_din_oferte(magazine), magazine, acum.year)
    # Campaniile deja scrise raman pana la sfarsitul anului: exportul 2P arata doar promotiile active, iar
    # fiecare campanie are o pagina /black-friday/<magazin>. Fara memorie, pagina ar da 404 la urmatorul export.
    if os.path.exists(IESIRE):
        try:
            vechi = json.load(io.open(IESIRE, encoding="utf-8")).get("parteneri") or []
        except ValueError:
            vechi = []
        lista = pastreaza_vechi(lista, vechi, magazine, acum.year)
    categorii = cu_categorii(lista, magazine)
    io.open(IESIRE, "w", encoding="utf-8", newline="").write(json.dumps({
        "_nota": "Generat de scripts/calendar_black_friday.py din promotiile anuntate de magazine in 2Performant "
                 "(data/promotii_2p.csv si ofertele 2P active din output.json). Doar parteneri cu link platit. Nu edita de mana.",
        "generat": acum.strftime("%Y-%m-%d"),
        "categorii": categorii,
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
        ("sfarsit la 00:00 in Romania = toata ziua aceea (Otter: pana pe 8 noiembrie, 23:59)", [c["final"] for c in campanii(
            [r("doctorshield.ro", "Black Friday DoctorShield", "2026-11-03 06:00:00 UTC", "2026-11-07 22:00:00 UTC")],
            mag, 2026)], ["2026-11-08"]),
        ("oferta cu sfarsit 00:00 nu dispare in ultima zi", sfarsit_real("2026-11-07 22:00:00 UTC").strftime("%Y-%m-%d %H:%M"),
         "2026-11-08 23:59"),
        ("sfarsit cu ora reala ramane", sfarsit_real("2026-11-15 21:30:00 UTC").strftime("%Y-%m-%d %H:%M"), "2026-11-15 23:30"),
        ("21:30 UTC pe 30.07 e 31.07 in Romania (ora de vara)",
         ora_ro(datetime(2026, 7, 30, 21, 30, tzinfo=timezone.utc)).strftime("%Y-%m-%d"), "2026-07-31"),
        ("22:30 UTC pe 30.11 e 01.12 in Romania (iarna, +2)",
         ora_ro(datetime(2026, 11, 30, 22, 30, tzinfo=timezone.utc)).strftime("%Y-%m-%d"), "2026-12-01"),
        ("anuntul teasing nu e campanie", [c["nota"] for c in campanii(
            [r("doctorshield.ro", "Teasing: Acces exclusiv la Black Friday pe 5 noiembrie!",
               "2026-10-29 06:00:00 UTC", "2026-11-04 08:00:00 UTC")], mag, 2026)], []),
        ("codul iese din descriere, fara cuvantul cod ramas in aer", descriere_publica(
            "Prima comandă vine cu 10% reducere folosind codul: BF2026", {"nume": "x", "cod_cupon": "BF2026"}),
         "Prima comandă vine cu 10% reducere"),
        ("cuvintele fara cod raman in text", descriere_publica(
            "Reduceri aplicate direct în preț, fără cod. Găsești mii de produse.", {"nume": "x", "cod_cupon": ""}),
         "Reduceri aplicate direct în preț, fără cod. Găsești mii de produse."),
        ("codul din mijlocul textului lasa fraza intreaga", descriere_publica(
            "Ai 10% reducere folosind codul: BF2026 Ai o listă de produse.", {"nume": "x", "cod_cupon": "BF2026"}),
         "Ai 10% reducere. Ai o listă de produse."),
        ("textul spre afiliati din mijloc iese", descriere_publica(
            "Reducerea de 30% se aplică în coș. Pentru voi înseamnă un mesaj simplu.", {"nume": "x", "cod_cupon": ""}),
         "Reducerea de 30% se aplică în coș."),
        ("linkul brut iese din text", descriere_publica(
            "Oferte de pana la 70%! >> https://noriel.ro/oferte-black-friday", {"nume": "x", "cod_cupon": ""}),
         "Oferte de pana la 70%!"),
        ("salutul iese", descriere_publica("Bună, La Videt a început campania.", {"nume": "x", "cod_cupon": ""}),
         "La Videt a început campania."),
        ("fraza pentru afiliati si promisiunea ies", descriere_publica(
            "Reduceri de până la 50% la jucării. Am mărit comisionul la 7%! Cel mai mic preț din an, garantat!",
            {"nume": "x", "cod_cupon": ""}), "Reduceri de până la 50% la jucării."),
        ("descriere doar pentru afiliati = goala", descriere_publica(
            "Bună ziua, clienții pe care îi aduceți au un motiv să comande.", {"nume": "x", "cod_cupon": ""}), ""),
        ("campania disparuta din export ramane cu pagina", [c["magazin"] for c in pastreaza_vechi(
            [], [{"magazin": "doctorshield.ro", "nume": "D", "start": "2026-11-20"}], mag, 2026)], ["doctorshield.ro"]),
        ("anul trecut nu ramane", pastreaza_vechi(
            [], [{"magazin": "doctorshield.ro", "nume": "D", "start": "2025-11-20"}], mag, 2026), []),
        ("magazinul fara program nu ramane", pastreaza_vechi(
            [], [{"magazin": "faraprogram.ro", "nume": "F", "start": "2026-11-20"}], mag, 2026), []),
        ("categoria cu 3 campanii are pagina, cea cu 2 nu; marketplace niciodata", [c["slug"] for c in cu_categorii(
            [{"magazin": "a"}, {"magazin": "b"}, {"magazin": "c"}, {"magazin": "d"}, {"magazin": "e"},
             {"magazin": "f"}, {"magazin": "g"}, {"magazin": "h"}],
            [{"magazin": "a", "categorie_slug": "fashion"}, {"magazin": "b", "categorie_slug": "fashion"},
             {"magazin": "c", "categorie_slug": "fashion"}, {"magazin": "d", "categorie_slug": "beauty"},
             {"magazin": "e", "categorie_slug": "beauty"}, {"magazin": "f", "categorie_slug": "marketplace"},
             {"magazin": "g", "categorie_slug": "marketplace"}, {"magazin": "h", "categorie_slug": "marketplace"}])],
         ["fashion"]),
        ("emoji scos din titlu", [c["nota"] for c in campanii(
            [r("doctorshield.ro", "\U0001F525 Black Friday pe DoctorShield",
               "2026-11-20 06:00:00 UTC", "2026-11-30 08:00:00 UTC")], mag, 2026)], ["Black Friday pe DoctorShield"]),
    ]
    def oferte(platforma, nume, incepe, expira):
        return [{"magazin": "doctorshield.ro", "url": "https://doctorshield.ro", "url_afiliat": "https://event.2performant.com/x",
                 "platforma": platforma, "promotii": [{"nume": nume, "descriere": "", "cod_cupon": "", "incepe": incepe, "expira": expira}]}]

    doua_store = [{"magazin": "store.a.com"}, {"magazin": "store.b.ro"}, {"magazin": "bitdefender.ro"}, {"magazin": "bitdefender.com"}]
    asteptari += [
        ("store.b.ro nu ajunge la store.a.com", find_magazin(doua_store, "store.b.ro"), 1),
        ("store.necunoscut.ro nu se leaga de alt magazin", find_magazin(doua_store, "store.necunoscut.ro"), None),
        ("adresa exacta castiga: bitdefender.com", find_magazin(doua_store, "bitdefender.com"), 3),
        ("fara TLD inca se potriveste", find_magazin([{"magazin": "libris.ro"}], "libris"), 0),
    ]

    def din_api(mag_o):
        return [(c["magazin"], c["start"], c["final"]) for c in campanii(randuri_din_oferte(mag_o), mag_o, 2026)]

    asteptari += [
        ("oferta din API primeste pagina (Answear: start ISO, sfarsit doar zi)",
         din_api(oferte("2performant", "Magic Black Friday", "2026-11-04T09:00:00Z", "2026-11-25")),
         [("doctorshield.ro", "2026-11-04", "2026-11-25")]),
        ("oferta Impact nu intra (magazine straine)",
         din_api(oferte("impact", "ROBUD Black Friday", "2026-11-04T09:00:00Z", "2026-11-25")), []),
        ("oferta care nu e de Black Friday nu intra",
         din_api(oferte("2performant", "Reduceri de toamna", "2026-11-04T09:00:00Z", "2026-11-25")), []),
        ("oferta fara data de start nu intra",
         din_api(oferte("2performant", "Black Friday", "", "2026-11-25")), []),
        ("oferta inceputa din 1 octombrie nu intra (data din afara ferestrei)",
         din_api(oferte("2performant", "Black Friday", "2026-10-01T21:00:00Z", "2026-11-08")), []),
    ]
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
