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

    # 5b. Pret pe o PROMOTIE (07.10.2026). Promo-produsele (`is_promo`) n-au pret de produs:
    #     numarul cu „lei" din textul ofertei e pragul comenzii, valoarea voucherului sau suma
    #     maxima de discount, iar un „pret vechi" calculat din procent e inventat. Vezi
    #     enrich_products_from_promos.py — Noriel ajunsese „149 lei, ~~186,25 lei~~".
    promo_pret = [f"{p.get('merchant_slug','?')}: {p.get('title','?')[:40]} ({p.get('price')} lei)"
                  for p in produse if p.get("is_promo") and ((p.get("price") or 0) > 0 or p.get("old_price"))]
    stare["promotii_cu_pret"] = len(promo_pret)
    if promo_pret:
        semnaleaza("pret inventat pe promotie",
                   f"{len(promo_pret)} promotii afisate cu pret de produs", promo_pret)

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

    # 7b. Promisiuni false despre coduri si notite interne in textul articolelor (06.10.2026). Aceeasi
    #     regula ca la verificarea HTML, dar aici ruleaza in CI, la fiecare rulare — fraza din sablonul
    #     vechi a stat pe 147 de pagini fara sa se inroseasca nimic, pentru ca --html ruleaza doar local.
    #     Un <!-- comentariu --> in continut ajunge TEXT in pagina (renderer-ul nu stie HTML).
    false = [a["slug"] for a in articole
             if RE_PROMISIUNE_COD.search(a.get("content") or "") or "<!--" in (a.get("content") or "")]
    if false:
        semnaleaza("promisiune falsa in articol",
                   f"{len(false)} articole promit ce nu facem (validitate, verificare, exclusivitate) "
                   f"sau au o notita interna vizibila — ruleaza scripts/curata_articole.py", false)

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

    # 9. Linkuri Profitshare (05.10.2026). Contul a fost respins si reteaua exclusa pe 19.08,
    #    deci un clic pe un astfel de link nu mai produce comision. Pe 05.10 inca erau 132 in
    #    top-produse.json — pe paginile /top, singurele cu vizitatori din cautari — fiindca
    #    generate_product_tops.py doar adauga linkuri, nu le si sterge. Se cauta ca TEXT in
    #    toate fisierele publice: un link mort nu trebuie sa conteze in ce camp sta.
    cu_ps = []
    for f in sorted(glob.glob(os.path.join(PUB, "*.json"))):
        try:
            n = io.open(f, encoding="utf-8", errors="ignore").read().count("profitshare.ro/l/")
        except OSError:
            continue
        if n:
            cu_ps.append(f"{os.path.basename(f)}: {n}")
    if cu_ps:
        semnaleaza("link Profitshare",
                   "linkuri Profitshare in fisierele publice — reteaua e exclusa din 19.08, "
                   "clicul nu plateste", cu_ps)

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
    ("rata de succes", re.compile(r"rat[ăa] (?:de )?succes", re.I),  # 06.10: „Rată succes afișată" scapase
     "semnal fabricat, scos din UI pe 03.07", ""),
    ("countdown mare", re.compile(r">\s*\d{3,}\s*zile r[ăa]mase\s*<"),
     "countdown de sute de zile — plafonul din expirarePromo.ts nu s-a aplicat", ""),
]


# Reguli pe TEXTUL PAGINII, fara <head>. Title si description raman decizia lui Alex (SEO),
# deci acolo nu blocam publicarea — dar tot ce scrie in pagina, da.
#
# Pretentia de testare (05.10.2026) e a SASEA aparitie a aceluiasi tipar de fabricatie
# (LECTII-TEHNICE #10): pe /top/[slug], „Fiecare produs este testat timp de minim 2 saptamani
# in conditii reale de utilizare" si „modele testate si verificate de echipa AmCupon.ro", pe
# paginile cu cel mai mult trafic din cautari; plus „Testate personal" (/carduri-bancare),
# „servicii testate si recomandate de echipa" (/recomandari). Negatiile raman permise:
# „Nu le-am testat fizic", „Nu le testam in cos", „dermatologic testate" (descrie produsul).
RE_TESTARE = re.compile(
    r"testare riguroas|\bcum test[ăa]m\b"
    r"|\btestat\w*\s+(?:timp de|personal|de noi|de echipa|de sportivi|[șs]i (?:recomandat|verificat|comparat))"
    r"|\b(?:produse|modele|servicii)\s+testate\b"
    r"|(?<!nu )(?<!nu le-)(?<!n-)\bam testat",
    re.I)
# „Verificat" despre coduri/oferte: nu le testam in cos, doar le actualizam automat. Sweep-ul din
# 22.09 a scos 61 din text, dar pe 05.10 mai erau peste 100 (radar: „ales si verificat de noi",
# contact: „verificam fiecare promotie", insigna „VERIFICAT" pe /produse, „verificat si functional"
# in toate cele 147 de articole de magazin). Indicatiile pentru cititor („verifica pe site") raman.
RE_VERIFICAT = re.compile(
    # formele articulate („Toate codurile verificate" pe /produse) au scapat pana pe 06.10.2026
    r"\b(?:coduri(?:le)?(?: de reducere)?|oferte(?:le)?|reduceri(?:le)?|promo[țt]ii(?:le)?|magazine(?:le)?"
    r"|parteneri(?:i)?|ghiduri(?:le)?)\s+verificat[ei]\b"
    r"|\bverificate (?:zilnic|automat|[șs]i actualizate)\b|\bverificat [șs]i func[țt]ional\b"
    r"|\bverificat azi\b|>\s*VERIFICAT\s*<|\bverific[ăa]m (?:fiecare|codurile|ofertele|zilnic)\b",
    re.I)
# Promisiuni despre coduri pe care nu le putem tine (06.10.2026, sablonul celor 147 de articole de
# magazin): „verifica **zilnic** validitatea fiecarui cod", „Nu afisam niciodata coduri expirate",
# „il vom verifica si actualiza in maxim 24h" (butonul „Raporteaza cod" nu exista), „Codul ... este
# valid in momentul in care il accesati", „Oferta exclusiva AmCupon.ro — nu o gasesti in alta parte"
# (codurile din retea le primesc toti afiliatii), eticheta „Reducere automata" (nu exista) — plus o
# notita interna <!-- --> afisata ca TEXT. RE_VERIFICAT nu le prindea: cere „verificam"/„verificat",
# iar bold-ul (<strong>, **) dintre cuvinte rupea orice regex scris pe text simplu.
_SEP = r"(?:\s|\*\*|<[^>]+>)+"
RE_PROMISIUNE_COD = re.compile(
    rf"\bverific[ăa]{_SEP}(?:zilnic{_SEP})?validitatea\b"
    rf"|\bnu{_SEP}afi[șs][ăa]m{_SEP}niciodat[ăa]{_SEP}coduri"
    rf"|\bvom{_SEP}verifica{_SEP}[șs]i{_SEP}actualiza\b"
    rf"|\beste{_SEP}valid{_SEP}[îi]n{_SEP}momentul{_SEP}[îi]n{_SEP}care\b"
    rf"|\boferta{_SEP}exclusiv[ăa]{_SEP}amcupon"
    rf"|\bnu{_SEP}o{_SEP}g[ăa]se[șs]ti{_SEP}[îi]n{_SEP}alt[ăa]{_SEP}parte\b"
    rf"|\beticheta{_SEP}(?:&quot;|[\"„”])?reducere{_SEP}automat[ăa]"
    r"|&lt;!--",
    re.I)
# Numar de magazine scris de mana (05.10.2026: „1000+ magazine" in 11 fisiere, pe site erau 957).
# Cifrele vin acum din lib/cifreSite.ts, rotunjite in jos la suta.
RE_NUMAR_MAGAZINE = re.compile(r"\b1\.?000\+?\s*(?:de\s+)?magazine", re.I)
RE_COMISION_PUBLICAT = re.compile(
    r"\b[1-9]\d*(?:[.,]\d+)?(?:\s?-\s?\d+(?:[.,]\d+)?)?\s?%\s+comision\b"
    r"|\d+\s?\$\s+per\b|\$\s?\d+(?:\s?-\s?\d+)?\s+per\b|\bper\s+v[aâ]nzare\b|\bCPA\b"
    r"|\bProgram\s+afiliere\b|\bProgram\s+recomandare\b"
    r"|\bcel\s+mai\s+mare\s+comision\b|\bcomision\s+verificat\b|\bcomision\s+recurent\b",
    re.I)
REGULI_CORP = [
    ("pretentie de testare", RE_TESTARE,
     "pagina afirma o testare care n-a avut loc (a 6-a aparitie — LECTII-TEHNICE #10)"),
    ("afirmatie verificat", RE_VERIFICAT,
     "pagina spune ca am verificat coduri/oferte — nu le testam, doar le actualizam automat"),
    ("promisiune falsa despre coduri", RE_PROMISIUNE_COD,
     "validitate garantata, verificare in 24h, exclusivitate sau o notita interna vizibila — nimic adevarat"),
    # 07.10.2026: „9.8/10" scris de mana pe 8 pagini de recomandari (VPN, hosting, antivirus, trading,
    # carduri, eSIM...), fara nicio metodologie, plus „Recomandat #1" / „Editorul nostru recomanda" —
    # n-avem testare editoriala. Scorul calculat din date („Deal Score 85/100") nu e prins.
    ("nota inventata", re.compile(r"\b\d{1,2}[.,]\d\s?/\s?10\b|Recomandat #1|EDITORUL NOSTRU", re.I),
     "nota sau clasament fara metodologie — n-am testat produsele"),
    ("numar de magazine scris de mana", RE_NUMAR_MAGAZINE,
     "cifra nu vine din date (lib/cifreSite.ts) si ramane falsa cand se schimba numarul de magazine"),
    ("link Profitshare in pagina", re.compile(r"profitshare\.ro/l/"),
     "retea exclusa pe 19.08 — clicul nu plateste"),
    # 07.10.2026: comisionul NOSTRU era afisat cumparatorului pe /cursuri-online (de 44 de ori:
    # „Appsumo 100% comision"), /servicii („200$ per vanzare", „150$ CPA"), /servicii-internationale
    # („Cel mai mare comision", „Toate cu comision verificat") si „Program afiliere: …" sub butoane.
    # „0% comision" (taxa unui broker) si „primim un comision" (nota de afiliere) nu sunt prinse.
    ("comision publicat", RE_COMISION_PUBLICAT,
     "comisionul nostru sau text pentru afiliati, afisat cumparatorului — nu se publica niciodata"),
    # 07.10.2026: sablonul Impact `…/c/7761435/1/0` (campania „1", reclama „0") — 404 — era inca
    # butonul Coursera si Shopify, dupa ce fusese scos din date pe 22.08.
    ("link sablon de afiliere", re.compile(r"/c/\d{5,8}/1/0(?=[\"'?/#\s])"),
     "link de afiliere neconcretizat (campania 1, reclama 0) — duce la 404"),
    # 07.10.2026: „Pe AmCupon.ro monitorizam TOATE promotiile X" pe 15 pagini de brand — publicam ce
    # primim prin retelele de afiliere, nu urmarim magazinele.
    ("monitorizare inventata", re.compile(r"\bmonitoriz[aă]m\s+(?:toate|permanent|zilnic)\b", re.I),
     "nu urmarim magazinele — publicam promotiile primite prin retelele de afiliere"),
]

# Linkuri interne catre pagini care trebuie sa existe ca HTML generat. Pe 05.10.2026, 12
# butoane de pe /top duceau la /cod-reducere/<magazin> pentru magazine care nu sunt in
# output.json (404), iar „Cauta pret" ducea la /cod-reducere/emag.ro -> redirect spre
# /categorii/marketplace. Tiparul s-a mai vazut: footer-ul cu bookzone.ro (16.09),
# /categorii/telecom (16.08), altex/flanco/elefant (08.08).
RE_LINK_INTERN = re.compile(
    r'href="(/(?:cod-reducere|top|categorii|comparatii|cadouri|esim|nisa|produse|blog)/[^"#?]+)')


def surse_redirect() -> set[str]:
    """Sursele din lib/redirecturi.ts — acolo stau toate redirecturile permanente."""
    p = os.path.join(ROOT, "frontend", "lib", "redirecturi.ts")
    try:
        return set(re.findall(r'source:\s*"([^"]+)"', io.open(p, encoding="utf-8").read()))
    except OSError:
        return set()


def verifica_html() -> dict:
    stare: dict = {}
    if not os.path.isdir(BUILD):
        print("  (fara build — ruleaza `npm run build` in frontend/ pentru verificarea HTML)")
        return stare

    gasite: dict[str, list[str]] = {n: [] for n, *_ in REGULI_HTML}
    gasite_corp: dict[str, list[str]] = {n: [] for n, *_ in REGULI_CORP}
    existente: set[str] = set()
    linkuri: list[tuple[str, str]] = []
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
        corp = re.sub(r"<head.*?</head>", "", body, flags=re.S)
        for nume, rx, _ in REGULI_CORP:
            m = rx.search(corp)
            if m:
                gasite_corp[nume].append(f"{rel}: …{corp[max(0, m.start() - 30):m.end() + 30]}…")
        existente.add("/" + rel[:-5] if rel != "index.html" else "/")
        linkuri.extend((rel, h) for h in set(RE_LINK_INTERN.findall(corp)))
        if "<h1" not in body:
            fara_h1.append(rel)
        if "<title" not in t:
            fara_title.append(rel)

    stare["pagini_html"] = n
    for nume, rx, expl, _ in REGULI_HTML:
        if gasite[nume]:
            semnaleaza(nume, f"{len(gasite[nume])} pagini — {expl}", gasite[nume])
    for nume, rx, expl in REGULI_CORP:
        if gasite_corp[nume]:
            semnaleaza(nume, f"{len(gasite_corp[nume])} pagini — {expl}", gasite_corp[nume])

    # Linkuri interne: 404 blocheaza; prin redirect doar se numara (unele sunt intentionate).
    redirecturi = surse_redirect()
    lipsa = sorted({f"{h}  (pe {r})" for r, h in linkuri
                    if h.rstrip("/") not in existente and h.rstrip("/") not in redirecturi})
    prin_redirect = sorted({h for r, h in linkuri if h.rstrip("/") in redirecturi})
    stare["linkuri_interne_prin_redirect"] = len(prin_redirect)
    if lipsa:
        semnaleaza("link intern spre pagina inexistenta",
                   f"{len(lipsa)} linkuri interne duc la pagini care nu se genereaza (404)", lipsa)
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
