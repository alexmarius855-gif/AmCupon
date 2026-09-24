#!/usr/bin/env python3
"""
verifica_site.py — garda de continut: raspunde la „ce e stricat pe site ACUM?"

DE CE EXISTA (20.09.2026)
Fiecare problema gasita in ultimele doua saptamani statea pe site de saptamani sau
luni, si a fost gasita doar fiindca s-a uitat cineva:
  - „3571 zile ramase" la un cod de reducere        (gasit 07.09, live de luni)
  - „Cashback pana la 60%" = COMISIONUL NOSTRU      (gasit 07.09, a 3-a reaparitie)
  - acelasi cashback ratat in /comparator           (gasit 20.09, a 4-a reaparitie)
  - „Cel mai ieftin: 0 lei"                         (gasit 20.09)
  - „| AmCupon.ro" in <h1> pe 405 articole          (gasit 20.09, in browser)
  - „---" ca text brut, de 13 ori pe articol        (gasit 20.09, in browser)
  - /comparator fara <h1>, invizibil pentru Google  (gasit 20.09)

Niciuna nu ar fi fost prinsa de `health_check.py`, care verifica doar daca pipeline-ul
a rulat — nu si CE a publicat. Un site care nu se uita la el insusi afla ce e stricat
de la vizitatori, adica niciodata.

CE FACE
  mod DATE (implicit)  — verifica output.json / products.json / blog-posts.json.
                         Ruleaza oriunde, fara build. Potrivit in GitHub Actions.
  mod HTML (--html)    — verifica paginile generate in frontend/.next/server/app.
                         Prinde ce nu se vede in date: randare stricata, markdown brut,
                         h1 lipsa. Necesita `npm run build` inainte.

Fiecare regula are o EXCEPTIE documentata acolo unde un filtru naiv ar da fals pozitiv
— pentru ca o garda care striga degeaba e oprita dupa a treia oara si nu mai apara nimic.

Iesire: 0 = curat, 1 = probleme (blocheaza publicarea), 2 = eroare de rulare.

Rulare:
  python verifica_site.py                 # verifica datele
  python verifica_site.py --html          # verifica si paginile generate
  python verifica_site.py --raport        # doar starea, fara verdict
"""

from __future__ import annotations

import argparse
import glob
import io
import json
import os
import re
import sys
from collections import Counter

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(SCRIPT_DIR)
PUB = os.path.join(ROOT, "frontend", "public")
BUILD = os.path.join(ROOT, "frontend", ".next", "server", "app")

# Linkurile care chiar platesc. Semnatura e CALEA, nu domeniul: Impact foloseste zeci
# de domenii (sjv.io, pxf.io, f9tmep.net), toate cu forma /c/<partner>/<ad>/<campanie>.
RE_TRACKING = re.compile(
    r"/c/\d{6,}/\d+|event\.2performant\.com|awin1\.com|ojrq\.net", re.I
)

probleme: list[tuple[str, str, list[str]]] = []


def semnaleaza(regula: str, mesaj: str, exemple: list[str]) -> None:
    probleme.append((regula, mesaj, exemple[:4]))


def incarca(nume: str):
    p = os.path.join(PUB, nume)
    if not os.path.exists(p):
        return None
    with io.open(p, encoding="utf-8") as f:
        return json.load(f)


# ─── Reguli pe DATE ───────────────────────────────────────────────────────────

def verifica_date() -> dict:
    stare: dict = {}

    magazine = incarca("output.json") or []
    stare["magazine"] = len(magazine)
    stare["cu_promotie"] = sum(1 for m in magazine if m.get("are_promotie"))
    stare["cu_cod"] = sum(
        1 for m in magazine
        if any(str(p.get("cod_cupon") or "").strip() for p in (m.get("promotii") or []))
    )

    # 1. Magazine al caror clic nu produce comision.
    #
    # NU orice magazin fara link e o problema care opreste publicarea: politica
    # proiectului, din 06.08.2026, e ca un brand fara program activ RAMANE pe site ca
    # recomandare onesta, fara comision (CLAUDE.md). Daca garda ar pica pe asta, ar fi
    # rosie la fiecare rulare — iar o garda mereu rosie nu mai e citita de nimeni.
    #
    # Ce e insa o pierdere reala: un magazin care AFISEAZA o oferta si al carui buton
    # „vezi oferta" pleaca fara tracking. Acolo clicul e intentionat, omul chiar cumpara,
    # si comisionul se pierde. Cele doua se numara separat: pierderea blocheaza,
    # recomandarea fara comision se urmareste prin delta din `stare`.
    fara_link = [m["magazin"] for m in magazine
                 if not RE_TRACKING.search(m.get("url_afiliat") or "")]
    stare["fara_link_platit"] = len(fara_link)

    pierd_bani = [m["magazin"] for m in magazine
                  if m.get("are_promotie") and (m.get("promotii") or [])
                  and not RE_TRACKING.search(m.get("url_afiliat") or "")]
    if pierd_bani:
        semnaleaza("oferta neplatita",
                   f"{len(pierd_bani)} magazine afiseaza o oferta, dar clicul pe ea nu "
                   "produce comision",
                   pierd_bani)

    # 2. Countdown absurd. Peste 99 de zile UI-ul afiseaza „Ofertă activă" fara cifra
    #    (lib/expirarePromo.ts), deci valoarea mare in date nu se mai vede — dar ramane
    #    semnul ca sursa livreaza date gresite, si urmatorul consumator poate sa n-o
    #    plafoneze. Semnalam de la 3 ani in sus, unde nu mai e ambiguitate.
    absurde = [f"{m['magazin']}: {p.get('zile_ramase')} zile"
               for m in magazine for p in (m.get("promotii") or [])
               if isinstance(p.get("zile_ramase"), int) and p["zile_ramase"] > 1095]
    if absurde:
        semnaleaza("countdown absurd",
                   f"{len(absurde)} promotii cu peste 3 ani pana la expirare",
                   absurde)

    # 3. Semnale fabricate, scoase din generator pe 07.09. Daca reapar, ceva le-a readus.
    fabricate = [m["magazin"] for m in magazine
                 if "procent_succes" in m or "folosit_de" in m]
    if fabricate:
        semnaleaza("semnale fabricate",
                   f"{len(fabricate)} magazine au din nou procent_succes/folosit_de "
                   "(random.Random in fetch_2p_api.py, scoase 07.09)",
                   fabricate)

    # 3b. Text scris pentru AFILIATI, afisat cumparatorului (24.09.2026): „Promovează produsele
    #     Interlink și câștigă comisioane", „affiliates earn an increased commission". Il scoate
    #     curata_promotii() la merge si la importul CSV; daca apare aici, l-a adus o cale care
    #     ocoleste curatarea. Aceeasi functie ca la curatare, deci regula sta intr-un singur loc.
    from promotii import RE_MARKDOWN, RE_MOJIBAKE_SIGUR, text_pentru_afiliati
    toate_promo = [(m, p) for m in magazine for p in (m.get("promotii") or []) if isinstance(p, dict)]
    pentru_afiliati = [f"{m['magazin']}: {(p.get('nume') or '')[:50]}"
                       for m, p in toate_promo if text_pentru_afiliati(p, m)]
    if pentru_afiliati:
        semnaleaza("text pentru afiliati",
                   f"{len(pentru_afiliati)} promotii vorbesc cumparatorului despre comisioane "
                   "si promovare — textul programului de afiliere, nu al ofertei",
                   pentru_afiliati)
    cu_markdown = [f"{m['magazin']}: {(p.get('nume') or '')[:50]}" for m, p in toate_promo
                   if any(isinstance(p.get(k), str) and RE_MARKDOWN.search(p[k]) for k in ("nume", "descriere"))]
    if cu_markdown:
        semnaleaza("markdown in promotii",
                   f"{len(cu_markdown)} promotii au **asteriscuri** care se vad brute pe site",
                   cu_markdown)
    stricate = [f"{m['magazin']}: {(p.get('nume') or '')[:50]}" for m, p in toate_promo
                if any(isinstance(p.get(k), str) and RE_MOJIBAKE_SIGUR.search(p[k]) for k in ("nume", "descriere"))]
    if stricate:
        semnaleaza("caractere stricate",
                   f"{len(stricate)} promotii au text UTF-8 citit gresit („rÃ©duction\") pe care "
                   "repara_mojibake() nu l-a putut reface",
                   stricate)

    produse = (incarca("products.json") or {}).get("products", [])
    stare["produse"] = len(produse)

    # 4. Produse fara link care plateste — apar pe site ca reclama gratuita.
    p_fara = [p.get("title", "?")[:40] for p in produse
              if (p.get("price") or 0) > 0 and not RE_TRACKING.search(p.get("url") or "")]
    stare["produse_fara_link"] = len(p_fara)
    if p_fara:
        semnaleaza("produs fara link",
                   f"{len(p_fara)} produse cu pret dar fara link afiliat", p_fara)

    # 5. Preturi sub 1 leu: in retailul online romanesc, unde transportul singur trece
    #    de 15 lei, sunt preturi unitare din bax, nu oferte. Afisate, dau „0 lei".
    #    Regula e in reguli_produse.py, aceeasi pe care o aplica fetch_product_feeds.py.
    from reguli_produse import pret_corupt
    sub1 = [f"{p.get('title','?')[:34]} ({p['price']} lei)" for p in produse
            if pret_corupt(p)]
    stare["produse_sub_1_leu"] = len(sub1)
    if len(sub1) > 40:
        semnaleaza("preturi corupte",
                   f"{len(sub1)} produse sub 1 leu — verifica feed-ul sursa", sub1)

    articole = incarca("blog-posts.json") or []
    stare["articole"] = len(articole)

    # 6. Articol nefinalizat publicat din greseala.
    nefinalizate = [a["slug"] for a in articole if "[EDITORIAL" in (a.get("content") or "")]
    if nefinalizate:
        semnaleaza("articol nefinalizat",
                   f"{len(nefinalizate)} articole au inca marcaje [EDITORIAL]",
                   nefinalizate)

    # 7. Articol fara continut real.
    goale = [a["slug"] for a in articole if len(a.get("content") or "") < 400]
    if goale:
        semnaleaza("articol gol", f"{len(goale)} articole sub 400 de caractere", goale)

    # 8. Istoricul promotiilor (24.09.2026). Pasul lui ruleaza cu continue-on-error, deci daca se
    #    strica nu se inroseste nimic: „plasa de siguranta pe care n-o verifica nimeni"
    #    (docs/LECTII-TEHNICE.md #4). Se prinde aici: fisier care nu se mai actualizeaza, sau o
    #    intrare care incalca regulile de titlu, adica a ajuns acolo ocolind scriptul. Regulile
    #    sunt importate din istoric_promotii.py, deci stau intr-un singur loc.
    istoric = incarca("istoric-promotii.json")
    if istoric is None:
        semnaleaza("istoric promotii lipsa", "frontend/public/istoric-promotii.json nu exista", [])
    else:
        from datetime import date, datetime, timezone
        from istoric_promotii import slug_valid, titlu_publicabil
        mag_ist = istoric.get("magazine") or {}
        stare["istoric_magazine"] = len(mag_ist)
        stare["istoric_promotii"] = sum(len(v) for v in mag_ist.values())
        try:
            vechime = (datetime.now(timezone.utc).date() - date.fromisoformat(istoric.get("actualizat") or "")).days
        except ValueError:
            vechime = None
        if vechime is None or vechime > 2:
            semnaleaza("istoric promotii invechit",
                       f"istoric-promotii.json e actualizat ultima data pe {istoric.get('actualizat')!r}: "
                       "pasul „Istoricul promotiilor pe magazin” nu mai merge", [])
        dupa_slug = {(m.get("magazin") or "").lower(): m for m in magazine}
        murdare = [f"{s}: {(e.get('titlu') or '')[:50]}" for s, v in mag_ist.items() for e in v
                   if not slug_valid(s) or not titlu_publicabil(e.get("titlu") or "", dupa_slug.get(s) or {"magazin": s})]
        if murdare:
            semnaleaza("istoric promotii murdar",
                       f"{len(murdare)} intrari din istoric incalca regulile de titlu (cod drept titlu, "
                       "text pentru afiliati, magazin de test)", murdare)

    return stare


# ─── Reguli pe HTML generat ───────────────────────────────────────────────────

# (nume, regex, explicatie, exceptie documentata)
REGULI_HTML = [
    ("undefined afisat", re.compile(r">\s*undefined\s*<"),
     "o valoare lipsa a ajuns in text", ""),
    ("NaN afisat", re.compile(r">\s*NaN\b"),
     "un calcul a esuat si rezultatul e pe pagina", ""),
    ("[object Object]", re.compile(r"\[object Object\]"),
     "un obiect a fost afisat ca text", ""),
    ("markdown brut", re.compile(r"\]\(https?://"),
     "linkuri markdown neparsate — textul arata ca sursa, nu ca pagina", ""),
    ("marcaj EDITORIAL", re.compile(r"\[EDITORIAL"),
     "schelet de articol publicat nefinalizat", ""),
    # Fara ghilimele romanesti in stringuri de cod: „...” pare o pereche, dar daca
    # inchizi cu " ASCII, Python inchide stringul acolo. M-a prins de trei ori azi.
    ("separator ca text", re.compile(r">\s*-{3,}\s*<"),
     "trei liniute afisate ca text, in loc de linie orizontala", ""),
    ("sufix in h1", re.compile(r"<h1[^>]*>[^<]*\|\s*AmCupon"),
     "numele site-ului in h1 dilueaza cuvintele-cheie", ""),
    ("cashback publicat", re.compile(r">\s*Cashback\s*<"),
     "comisionul nostru afisat ca beneficiu al cumparatorului "
     "(a reaparut de 4 ori — vezi LECTII-TEHNICE #10)", ""),
    ("rata de succes", re.compile(r"rat[ăa] de succes", re.I),
     "semnal fabricat, scos din UI pe 03.07", ""),
    ("countdown mare", re.compile(r">\s*\d{3,}\s*zile r[ăa]mase\s*<"),
     "countdown de sute de zile — plafonul din expirarePromo.ts nu s-a aplicat", ""),
]


def verifica_html() -> dict:
    stare: dict = {}
    if not os.path.isdir(BUILD):
        print("  (fara build — ruleaza `npm run build` in frontend/ pentru verificarea HTML)")
        return stare

    gasite: dict[str, list[str]] = {n: [] for n, *_ in REGULI_HTML}
    fara_h1, fara_title, n = [], [], 0

    for f in glob.glob(os.path.join(BUILD, "**", "*.html"), recursive=True):
        rel = os.path.relpath(f, BUILD).replace("\\", "/")
        # /reduceri/* sunt redirectionate (308) — se genereaza, dar nimeni nu le vede.
        if rel.startswith("reduceri/"):
            continue
        n += 1
        try:
            t = io.open(f, encoding="utf-8", errors="ignore").read()
        except OSError:
            continue
        # Fara <script>: payload-ul RSC contine datele brute, unde „undefined" sau un
        # camp cu „---" sunt normale. Ne intereseaza doar ce se vede.
        body = re.sub(r"<script.*?</script>", "", t, flags=re.S)
        for nume, rx, *_ in REGULI_HTML:
            if rx.search(body):
                gasite[nume].append(rel)
        if "<h1" not in body:
            fara_h1.append(rel)
        if "<title" not in t:
            fara_title.append(rel)

    stare["pagini_html"] = n
    for nume, rx, expl, _ in REGULI_HTML:
        if gasite[nume]:
            semnaleaza(nume, f"{len(gasite[nume])} pagini — {expl}", gasite[nume])
    if fara_h1:
        semnaleaza("fara h1", f"{len(fara_h1)} pagini fara <h1> — Google nu le stie subiectul",
                   fara_h1)
    if fara_title:
        semnaleaza("fara title", f"{len(fara_title)} pagini fara <title>", fara_title)
    return stare


# ─── Raport ───────────────────────────────────────────────────────────────────

def scrie_raport(stare: dict) -> None:
    """Starea, salvata ca sa se poata compara cu rularea anterioara.

    Fara istoric, „65 de magazine cu promotii" nu spune nimic: e bine sau e o
    prabusire de la 99? Diferenta e informatia, nu valoarea.
    """
    p = os.path.join(ROOT, "data", "stare-site.json")
    anterior = {}
    if os.path.exists(p):
        try:
            anterior = json.load(io.open(p, encoding="utf-8")).get("stare", {})
        except (OSError, ValueError):
            anterior = {}

    print("\n── STAREA SITE-ULUI ────────────────────────────────────────")
    for k, v in stare.items():
        vechi = anterior.get(k)
        delta = ""
        if isinstance(vechi, int) and isinstance(v, int) and vechi != v:
            delta = f"   ({v - vechi:+d} fata de ultima verificare)"
        print(f"  {k:24} {v}{delta}")

    from datetime import datetime, timezone
    io.open(p, "w", encoding="utf-8", newline="").write(json.dumps(
        {"data": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M"), "stare": stare},
        ensure_ascii=False, indent=2))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--html", action="store_true", help="verifica si paginile generate")
    ap.add_argument("--raport", action="store_true", help="doar starea, fara verdict")
    a = ap.parse_args()

    stare = verifica_date()
    if a.html:
        stare.update(verifica_html())
    scrie_raport(stare)

    if a.raport:
        return 0

    print("\n── VERIFICARI ──────────────────────────────────────────────")
    if not probleme:
        print("  Nicio problema. Site-ul poate fi publicat.")
        return 0

    for regula, mesaj, exemple in probleme:
        print(f"\n  [{regula}] {mesaj}")
        for e in exemple:
            print(f"      {e}")
        if len(exemple) == 4:
            print("      ...")
    print(f"\n  {len(probleme)} tipuri de probleme. NU publica pana nu sunt rezolvate.")
    return 1


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as e:  # noqa: BLE001
        print(f"EROARE la verificare: {type(e).__name__}: {e}")
        sys.exit(2)
