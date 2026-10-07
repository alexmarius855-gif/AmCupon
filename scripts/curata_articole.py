#!/usr/bin/env python3
"""
curata_articole.py — scoate din articolele de blog afirmatiile false si linkurile moarte.

DE CE (05.10.2026)
Articolele „Cel mai bun X" sunt, dupa paginile /top, singurele pagini cu vizitatori din
cautari (Vercel Analytics, 31 de zile). Masurat in blog-posts.json, pe 216 articole:
  - 147 de linkuri catre /cod-reducere/<magazin> pentru magazine care NU sunt pe site
    (emag 42, altex 32, flanco 29, fashiondays 9, dedeman, ikea, douglas, sephora...),
    in 53 de articole: 404 sau redirect spre o categorie oarecare;
  - „Folosește codurile de reducere de la partenerii noștri: eMAG, Altex, Flanco" — niciunul
    nu e partener;
  - in TOATE articolele de magazin: „tot ce gasesti pe aceasta pagina este verificat si
    functional"; intr-un articol evergreen: „Toate codurile afisate sunt testate si verificate".
    Nimeni nu testeaza codurile in cos;
  - 35 de descrieri promit „coduri reducere eMAG si Altex", „Elefant", „Sephora", „Douglas";
  - „poti economisi 5-15% din pretul final" — cifra fara nicio sursa.

Generatoarele (generate_blog.py, generate_best_of.py, generate_evergreen.py) au fost reparate
pentru textul NOU, dar generate_best_of.py doar ADAUGA articole si nu le atinge niciodata pe
cele existente, iar blog-posts.json e intrare SI iesire (LECTII-TEHNICE #5). Scriptul asta e
poarta prin care trece tot ce ajunge pe blog, la fiecare rulare a pipeline-ului.

REGULI (idempotente — a doua rulare nu mai schimba nimic):
  1. Link /cod-reducere/<x> catre un magazin fara link platit: propozitia care vorbeste despre
     coduri/oferte/parteneri si contine DOAR astfel de linkuri dispare; intr-o lista mixta
     („[Fashion Days](…) si [Answear](…)") ramane doar partenerul; in rest, linkul devine text.
  2. Link /categorii/<x> catre o categorie care nu exista: destinatia din lib/redirecturi.ts
     daca exista, altfel textul fara link.
  3. Formulele false ale generatoarelor, inlocuite cu ce se intampla de fapt.
  4. „Poti economisi X-Y% din pretul final" — scos.
  5. In descriere: „coduri reducere <magazine>" pastreaza doar partenerii reali.

Rulare:
  python curata_articole.py            # aplica
  python curata_articole.py --dry-run  # doar raport
  python curata_articole.py --test     # cazurile reale de mai jos, trebuie sa treaca
"""
from __future__ import annotations

import argparse
import io
import json
import os
import re
import sys

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BLOG = os.path.join(ROOT, "frontend", "public", "blog-posts.json")
OUTPUT = os.path.join(ROOT, "frontend", "public", "output.json")
REDIRECTURI = os.path.join(ROOT, "frontend", "lib", "redirecturi.ts")

RE_LINK = re.compile(r"\[([^\]]+)\]\((/(cod-reducere|categorii)/([^)\s#?]+))\)")
RE_DESPRE_OFERTE = re.compile(r"cod|reducer|ofert|partener|promo|voucher|cupon", re.I)
# Promisiunea de economii fara sursa: ca propozitie intreaga, sau ca bucata dupa liniuta.
RE_ECONOMISI_PROP = re.compile(
    r"(?:(?<=[.!?]\s)|^)Po[țt]i economisi (?:p[aâ]n[aă] la )?\d+\s*[-–]\s*\d+\s*% din pre[țt]ul final\.\s*", re.M)
RE_ECONOMISI_CLAUZA = re.compile(
    r"\s*[—–-]\s*po[țt]i economisi (?:p[aâ]n[aă] la )?\d+\s*[-–]\s*\d+\s*% din pre[țt]ul final", re.I)

# Formulele false scrise de generatoare, cu inlocuirea adevarata. Regex, ca sa prinda orice magazin.
FORMULE = [
    (re.compile(r"AmCupon\.ro monitorizeaza zilnic toate promotiile active de la (.+?) si actualizeaza automat "
                r"codurile de reducere — asa ca tot ce gasesti pe aceasta pagina este \*\*verificat si functional\*\*\."),
     r"AmCupon.ro preia automat, de mai multe ori pe zi, promotiile active de la \1 din reteaua de afiliere si le "
     r"scoate pe cele expirate. Codurile nu le testam in cos: daca unul nu merge, incearca alta oferta activa."),
    (re.compile(r"\(link afiliat verificat\)"), "(link afiliat)"),
    (re.compile(r"AmCupon\.ro verifica zilnic codurile de reducere de la peste \d+ magazine online\. "
                r"Toate codurile afisate sunt testate si verificate\."),
     "AmCupon.ro preia automat, de mai multe ori pe zi, codurile si ofertele active de la magazinele partenere. "
     "Codurile nu le testam in cos."),
    (re.compile(r"\[\*\*Coduri verificate pentru toate magazinele →\*\*\]"), "[**Coduri active pentru toate magazinele →**]"),
    (re.compile(r"\[Toate magazinele verificate →\]"), "[Toate magazinele →]"),
    (re.compile(r"\[Toate codurile de reducere verificate →\]"), "[Toate codurile de reducere active →]"),
    (re.compile(r"(\*\*eMAG\*\*: sute de mii de produse), reduceri verificate"), r"\1"),
    (re.compile(r"(Coduri reducere .{1,40}?) verificate in "), r"\1 active in "),
    (re.compile(r"cu reduceri reale si coduri verificate\."), "cu reduceri si coduri active."),
    (re.compile(r"Recenzii detaliate [șs]i (\w)"), lambda m: m.group(1).upper()),
    (re.compile(r"AmCupon\.ro verifica zilnic codurile de la \d+\+? magazine"),
     "AmCupon.ro actualizeaza automat codurile de la magazinele partenere"),
    (re.compile(r"AmCupon\.ro verifica zilnic (ofertele|codurile)( de reducere)? active"), r"AmCupon.ro actualizeaza automat \1\2 active"),

    # ── Sablonul articolelor de magazin pana pe 06.10.2026 (generate_blog.py) ──────────────────
    # Improspatarea rescrie articolele lunii curente ale magazinelor din output.json; astea prind
    # restul (magazin iesit din date, luni trecute). Aceleasi cuvinte ca sablonul nou.
    # O notita interna, scrisa ca <!-- comentariu --> in continut, aparea ca TEXT in pagina, pe
    # toate cele 147 de articole („FRECVENTA REALA: update-data.yml are ...").
    (re.compile(r"\n?<!--.*?-->", re.S), ""),
    (re.compile(r"Spre deosebire de alte site-uri de cupoane, AmCupon\.ro verifica \*\*zilnic\*\* validitatea fiecarui cod\. "
                r"Nu afisam niciodata coduri expirate sau inactive\."),
     "Ofertele vin direct din rețeaua de afiliere a magazinului, iar cele cu data de expirare trecută dispar automat "
     "de pe AmCupon.ro."),
    (re.compile(r"\*\*Oferta exclusiva AmCupon\.ro\*\* — nu o gasesti in alta parte!\n*"), ""),
    (re.compile(r"Magazin stabil, cu comenzi consistente\.\n*"), ""),
    (re.compile(r"Popularitate in crestere cu \*\*\d+%\*\* fata de luna trecuta\.\n*"), ""),
    (re.compile(r"Procesul dureaza mai putin de 2 minute si functioneaza la orice comanda:\n*"), ""),
    (re.compile(r"\*\*Pasul 1\*\* — Mergi pe AmCupon\.ro, cauta \[([^\]]+)\]\([^)]*\) si apasa \"Copiaza codul\"\. "
                r"Codul se salveaza automat in clipboard\."),
     r"**Pasul 1** — Pe pagina \1 de pe AmCupon.ro, apasă pe codul care te interesează: se copiază automat."),
    (re.compile(r"\*\*Pasul 2\*\* — Click pe \"Acceseaza magazinul\" — vei fi redirectionat catre site-ul oficial (.+?) "
                r"\(link afiliat\)\."),
     r"**Pasul 2** — Mergi pe site-ul oficial \1 prin linkul de pe AmCupon.ro (link afiliat)."),
    (re.compile(r"Lipieste codul \(Ctrl\+V sau tine apasat pe mobil\) si apasa \*\*\"Aplica\"\*\*\. Reducerea se aplica instantaneu\."),
     "Lipește codul și apasă **\"Aplică\"**. Dacă e valid pentru coșul tău, reducerea apare în total înainte de plată."),
    (re.compile(r"\*\*Cat dureaza un cod de reducere (.+?)\?\*\*\nCodurile \1 au valabilitate variabila — de la 24 de ore "
                r"pentru flash deals pana la cateva saptamani pentru promotiile sezoniere\. AmCupon\.ro afiseaza zilele "
                r"ramase pentru fiecare cod\."),
     r"**Cât timp e valabil un cod de reducere \1?**\nFiecare promoție are perioada ei, stabilită de \1. Când rețeaua "
     r"de afiliere ne dă data de expirare, AmCupon.ro o afișează lângă ofertă."),
    (re.compile(r"In general, (.+?) accepta un singur cod per comanda\. Exceptie fac situatiile in care combinati un cod "
                r"de reducere cu cashback-ul disponibil\."),
     r"Depinde de regulile \1. Multe magazine online acceptă un singur cod pe comandă; condițiile exacte sunt în "
     r"termenii promoției, pe site-ul magazinului."),
    (re.compile(r"\*\*Functioneaza codurile pe aplicatia mobila (.+?)\?\*\*\nDa, codurile de reducere \1 functioneaza atat "
                r"pe site cat si pe aplicatia mobila\. Campul de voucher se gaseste la aceeasi locatie in checkout\.\n*"), ""),
    (re.compile(r"Apasati \"Raporteaza cod\" pe AmCupon\.ro si il vom verifica si actualiza in maxim 24h\. Alternativ, "
                r"incercati urmatoarea promotie din lista — avem de obicei mai multe optiuni active simultan\."),
     "Verifică condițiile promoției (valoarea minimă a coșului, produsele excluse, doar prima comandă) și încearcă "
     "altă ofertă activă. O promoție se poate epuiza și înainte de data de expirare."),
    (re.compile(r"Da! Unele promotii (.+?) se aplica automat prin link-ul afiliat — fara sa fie nevoie sa introduceti "
                r"un cod\. Le puteti recunoaste dupa eticheta \"Reducere automata\" de pe AmCupon\.ro\."),
     r"Unele promoții nu au cod: reducerea e aplicată direct pe site-ul magazinului. Pe AmCupon.ro le găsești la "
     r"ofertele fără cod, cu link direct spre \1."),
    (re.compile(r"Sistemul nostru verifica promotiile de la (.+?) de \*\*trei ori pe zi\*\*\. Codul pe care il gasiti pe "
                r"aceasta pagina este valid in momentul in care il accesati\."),
     "De mai multe ori pe zi, automat, din rețeaua de afiliere. Valabilitatea finală a unui cod o confirmă coșul "
     "magazinului."),
    (re.compile(r"Cel mai simplu mod sa nu ratezi nicio promotie (.+?) este sa \*\*te abonezi la newsletter-ul AmCupon\.ro\*\* "
                r"— trimitem zilnic Top 5 oferte din toate magazinele\."),
     r"Ca să nu ratezi promoțiile \1, **abonează-te la newsletter-ul AmCupon.ro**: primești ofertele active pe email, "
     r"o dată pe zi."),
    (re.compile(r"> Ultima verificare automata: \*\*"), "> Actualizat automat: **"),
    (re.compile(r"\| Magazin din categoria: \*\*"), "| Categoria: **"),
    # roundup-ul si articolele de categorie
    (re.compile(r"agrega zilnic ofertele de la peste \d+ de magazine romanesti\."),
     "aduna automat, de mai multe ori pe zi, ofertele active de la magazinele partenere."),
    (re.compile(r"(\*\*\d+ coduri de reducere\*\*) valabile\."), r"\1 active."),
    (re.compile(r"afisam zilele ramase pentru fiecare cod"), "afisam zilele ramase cand reteaua de afiliere ne da data de expirare"),
    (re.compile(r"la favorite — o actualizam zilnic"), "la favorite — se actualizeaza automat de mai multe ori pe zi"),
]

# Sfatul lunii din sablonul vechi: un H2 care punea pe seama fiecarui magazin lucruri neverificate
# („Reducerile pot ajunge la 70-80%", „{nume} are promotii speciale pentru rechizite"). Inlocuit cu
# sfatul generic din generate_blog.SFATURI_LUNA — o singura lista, nu doua care se desincronizeaza.
_SFATURI_VECHI = (
    r"cautati reducerile post-sarbatori la .+? — aceasta este perioada cand magazinele lichideaza stocurile din sezonul de iarna\.",
    r"valentines Day aduce promotii speciale la .+?\. Cadourile se vand cu reduceri de 10-30%\.",
    r".+? lanseaza colectii de primavara\. Incepeti sa urmariti ofertele din prima saptamana a lunii\.",
    r"reducerile de primavara la .+? sunt in toi\. Produsele de sezon au cele mai bune preturi\.",
    r"urmariti promotiile de 1 Mai si Paste la .+?\. Editii speciale si discounturi de 20-40%\.",
    r"incep reducerile de vara la .+?\. Cel mai bun moment sa cumparati produse pentru vacanta\.",
    r"reducerile de vara sunt la maxim la .+?\. Saptamana de reduceri de mijloc de vara aduce discounturi consistente\.",
    r"pregatiti-va pentru scoala — .+? are promotii speciale pentru rechizite si electronice\.",
    r"sezonul scoala\+back-to-work aduce promotii la .+?\. Gama de electronice si fashion este reimprospatata\.",
    r"incep pregatirile pentru iarna la .+?\. Acesta e momentul ideal sa cumparati produse de sezon inainte de varf\.",
    r"BLACK FRIDAY este evenimentul anului la .+?! Reducerile pot ajunge la 70-80%\. Adaugati produsele in wishlist din timp\.",
    r"cumparaturile de Craciun la .+? beneficiaza de promotii speciale\. Comenzile facute pana pe 20 Decembrie ajung la timp\.",
    r".+? are oferte atractive\. Verificati zilnic paginile de promotii\.",
)
RE_SFAT_VECHI = re.compile(r"(?m)^## In (\w+) \d{4} (?:" + "|".join(_SFATURI_VECHI) + r")$")


def _sfat_nou(m: re.Match) -> str:
    from generate_blog import SFATURI_LUNA
    luna = m.group(1)
    sfat = SFATURI_LUNA.get(luna, "Ofertele se schimba de mai multe ori pe zi: verifica pagina magazinului de pe "
                                  "AmCupon.ro inainte de fiecare comanda.")
    return f"## Sfatul lunii {luna}\n\n{sfat}"


FORMULE.append((RE_SFAT_VECHI, _sfat_nou))
# 07.10.2026: „garantat" pus pe lucruri pe care nimeni nu le garanteaza (articolele „Cel mai bun X" din iunie,
# scrise o data si neatinse de generator — generate_best_of.py doar ADAUGA).
FORMULE += [
    (re.compile(r"### Paco Rabanne 1 Million — Seducție garantată"), "### Paco Rabanne 1 Million — dulce și condimentat"),
    (re.compile(r"gimbal 3 axe = video stabil garantat"), "gimbal pe 3 axe = video stabil"),
    (re.compile(r", TSA lock, garantat 5 ani\."), ", încuietoare TSA."),
    (re.compile(r", alegere liberă componente, satisfacție garantată\."), ", alegi singur fiecare componentă."),
]
# Orice propozitie care promite un procent de economii fara sursa („poti economisi 20-50% la carti").
RE_ECONOMISI_ORICE = re.compile(r"economisi\w*\s+(?:u[șs]or\s+)?(?:p[aâ]n[aă] la\s+)?\d+\s*[-–]\s*\d+\s*%", re.I)


def link_platit(m: dict) -> str:
    """Aceeasi regula ca linkAfiliat() din frontend/lib/linkMagazin.ts."""
    a = (m.get("url_afiliat") or "").strip()
    if not a or a == (m.get("url") or "").strip() or re.search(r"/NA6[?&]", a):
        return ""
    return a


def incarca_context() -> tuple[set[str], set[str], dict[str, str]]:
    magazine = json.load(io.open(OUTPUT, encoding="utf-8"))
    platite = {m["magazin"].lower() for m in magazine if link_platit(m)}
    categorii = {(m.get("categorie_slug") or "").lower() for m in magazine} - {""}
    try:
        t = io.open(REDIRECTURI, encoding="utf-8").read()
        red = dict(re.findall(r'source:\s*"([^"]+)",\s*destination:\s*"([^"]+)"', t))
    except OSError:
        red = {}
    return platite, categorii, red


def _propozitii(linie: str) -> list[str]:
    return re.split(r"(?<=[.!?])\s+(?=[A-ZĂÂÎȘȚ\[*])", linie)


def _scoate_din_lista(prop: str, slab: str) -> str:
    """Scoate un link dintr-o enumerare, cu conectorii lui („, X", „X si ", „ si X")."""
    for model in (rf",\s*{re.escape(slab)}", rf"{re.escape(slab)}\s*,\s*", rf"\s+(?:si|și)\s+{re.escape(slab)}",
                  rf"{re.escape(slab)}\s+(?:si|și)\s+"):
        nou, n = re.subn(model, "", prop, count=1)
        if n:
            return nou
    return prop.replace(slab, "")


def curata_text(text: str, platite: set[str], categorii: set[str], red: dict[str, str]) -> str:
    for rx, nou in FORMULE:
        text = rx.sub(nou, text)
    text = RE_ECONOMISI_PROP.sub("", text)
    text = RE_ECONOMISI_CLAUZA.sub("", text)

    iesire = []
    scoase = 0
    for linie in text.split("\n"):
        if RE_ECONOMISI_ORICE.search(linie):
            linie = " ".join(p for p in _propozitii(linie) if not RE_ECONOMISI_ORICE.search(p))
            if not linie.strip():
                scoase += 1
                continue
        if "](/" not in linie:
            iesire.append(linie)
            continue
        # categorii moarte: catre destinatia redirectului sau text simplu
        def cat(m: re.Match) -> str:
            eticheta, cale, tip, slug = m.groups()
            if tip != "categorii" or slug.lower() in categorii:
                return m.group(0)
            dest = red.get(cale.rstrip("/"))
            return f"[{eticheta}]({dest})" if dest else eticheta
        linie = RE_LINK.sub(cat, linie)

        morti = [m for m in RE_LINK.finditer(linie) if m.group(3) == "cod-reducere" and m.group(4).lower() not in platite]
        if not morti:
            iesire.append(linie)
            continue
        este_lista = bool(re.match(r"\s*([-*+]|\d+[.)])\s", linie))
        rest = RE_LINK.sub("", linie)
        vii = [m for m in RE_LINK.finditer(linie) if m not in morti and not (m.group(3) == "cod-reducere" and m.group(4).lower() not in platite)]
        if not vii and (este_lista or len(re.sub(r"[\W_]+", "", rest)) < 25):
            scoase += 1
            continue  # linie care era doar linkul (sau element de lista) catre un magazin absent
        props = []
        for prop in _propozitii(linie):
            p_morti = [m.group(0) for m in RE_LINK.finditer(prop)
                       if m.group(3) == "cod-reducere" and m.group(4).lower() not in platite]
            if not p_morti:
                props.append(prop)
                continue
            p_vii = [m for m in RE_LINK.finditer(prop) if m.group(0) not in p_morti]
            if RE_DESPRE_OFERTE.search(RE_LINK.sub(r"\1", prop)):
                if not p_vii:
                    continue  # propozitie despre coduri doar la magazine absente
                for slab in p_morti:
                    prop = _scoate_din_lista(prop, slab)
                props.append(prop)
            else:
                for slab in p_morti:
                    eticheta = RE_LINK.match(slab).group(1)
                    prop = prop.replace(slab, eticheta)
                props.append(prop)
        linie_noua = " ".join(p for p in props if p.strip())
        if linie_noua.strip() and not re.fullmatch(r"\s*([-*+]|\d+[.)])\s*", linie_noua):
            iesire.append(linie_noua)
        else:
            scoase += 1
    text = re.sub(r"\n{3,}", "\n\n", "\n".join(iesire))
    text, goale = fara_titluri_goale(text)
    if scoase or goale:  # fara randuri goale ramase in urma liniei scoase
        text = text.rstrip() + ("\n" if text.endswith("\n") else "")
    return text.lstrip("\n")  # un articol nu incepe niciodata cu rand gol


def fara_titluri_goale(text: str) -> tuple[str, int]:
    """
    Scoate subtitlurile fara continut: urmate direct de un subtitlu de acelasi nivel sau mai mare,
    ori de sfarsitul textului. Doua surse (06.10.2026, audit_pagini.py): „## Unde cumperi?" ramas
    gol dupa ce propozitia „partenerii nostri: eMAG, Altex" a disparut, si primul „## Cel mai bun X
    in 2026" care dubla titlul articolului lipit de urmatorul „## " (semnalat din 23.09).
    Un „## " urmat de „### " NU e gol — e parintele subsectiunilor lui.
    """
    linii = text.split("\n")
    pastrate, scoase = [], 0
    for i, linie in enumerate(linii):
        m = re.match(r"(#{2,6})\s", linie)
        if m:
            nivel = len(m.group(1))
            urm = next((l for l in linii[i + 1:] if l.strip()), None)
            mu = re.match(r"(#{1,6})\s", urm) if urm is not None else None
            if urm is None or (mu and len(mu.group(1)) <= nivel):
                scoase += 1
                continue
        pastrate.append(linie)
    rezultat = re.sub(r"\n{3,}", "\n\n", "\n".join(pastrate))
    if scoase and not text.startswith("\n"):
        rezultat = rezultat.lstrip("\n")  # fara rand gol in locul primului subtitlu scos
    return rezultat, scoase


def curata_descriere(desc: str, platite: set[str]) -> str:
    """„... coduri reducere eMAG si Altex." -> fara magazinele care nu sunt parteneri."""
    for rx, nou in FORMULE:
        desc = rx.sub(nou, desc)
    etichete = {s.split(".")[0] for s in platite}

    def repara(m: re.Match) -> str:
        nume = [n.strip() for n in re.split(r",\s*|\s+(?:si|și)\s+", m.group(2)) if n.strip()]
        bune = [n for n in nume if re.sub(r"[^a-z0-9]", "", n.lower()) in etichete]
        if not bune:
            return ""
        lista = bune[0] if len(bune) == 1 else ", ".join(bune[:-1]) + " si " + bune[-1]
        return f"{m.group(1)}{lista}"

    rx = re.compile(r"((?:[,.]\s*|^)(?:Ghid complet cu |Comparatie completa, |cat costa, |Gasesti si )?[Cc]oduri (?:de )?reducere )"
                    r"((?:[A-Z]|e[A-Z])[\w.&]*(?:\s[A-Z][\w.&]*)?(?:(?:,\s*|\s+(?:si|și)\s+)(?:[A-Z]|e[A-Z])[\w.&]*(?:\s[A-Z][\w.&]*)?)*)")
    nou = rx.sub(repara, desc)
    nou = re.sub(r"\s+\.", ".", nou)
    nou = re.sub(r",\s*\.", ".", nou)
    nou = re.sub(r"\s{2,}", " ", nou).strip()
    if nou and not nou.endswith((".", "!", "?")):
        nou += "."
    return nou


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--test", action="store_true")
    a = ap.parse_args()
    if a.test:
        return test()

    platite, categorii, red = incarca_context()
    posts = json.load(io.open(BLOG, encoding="utf-8"))
    lista = posts if isinstance(posts, list) else posts.get("posts", [])
    schimbate = 0
    for p in lista:
        vechi = (p.get("content"), p.get("excerpt"), p.get("title"))
        p["content"] = curata_text(p.get("content") or "", platite, categorii, red)
        p["excerpt"] = curata_descriere(p.get("excerpt") or "", platite)
        for rx, nou in FORMULE:
            p["title"] = rx.sub(nou, p.get("title") or "")
        if (p.get("content"), p.get("excerpt"), p.get("title")) != vechi:
            schimbate += 1
            if a.dry_run and schimbate <= 5:
                print(f"  ~ {p.get('slug')}")
    print(f"curata_articole: {schimbate} din {len(lista)} articole schimbate")
    if schimbate and not a.dry_run:
        io.open(BLOG, "w", encoding="utf-8", newline="").write(json.dumps(posts, ensure_ascii=False, indent=2))
    return 0


def test() -> int:
    """Cazuri REALE din blog-posts.json (05.10.2026). Iese cu 1 la primul esec."""
    platite = {"notino.ro", "answear.ro", "libris.ro", "decathlon.ro", "drmax.ro", "booking.com"}
    categorii = {"electronice", "casa-gradina"}
    red = {"/categorii/home-garden": "/categorii/casa-gradina"}
    esecuri = 0

    def v(nume, primit, asteptat):
        nonlocal esecuri
        if primit != asteptat:
            esecuri += 1
            print(f"  PICA  {nume}\n        primit:   {primit!r}\n        asteptat: {asteptat!r}")
        else:
            print(f"  ok    {nume}")

    c = lambda t: curata_text(t, platite, categorii, red)
    v("propozitie despre parteneri, doar magazine absente -> dispare",
      c("Folosește codurile de reducere de la partenerii noștri: [eMAG](/cod-reducere/emag.ro), [Altex](/cod-reducere/altex.ro), [Flanco](/cod-reducere/flanco.ro)."), "")
    v("linie care e doar un link spre magazin absent -> dispare",
      c("Text.\n\n[Vezi toate ofertele eMAG pentru telefoane Samsung →](/cod-reducere/emag.ro)\n"), "Text.\n")
    v("lista mixta -> ramane doar partenerul",
      c("Verificati codurile active pe AmCupon.ro: [Fashion Days](/cod-reducere/fashiondays.ro) si [Answear](/cod-reducere/answear.ro)."),
      "Verificati codurile active pe AmCupon.ro: [Answear](/cod-reducere/answear.ro).")
    v("element de lista spre magazin absent -> dispare",
      c("- [AmCupon.ro — coduri eMAG verificate](/cod-reducere/emag.ro)\n- [Notino](/cod-reducere/notino.ro)"),
      "- [Notino](/cod-reducere/notino.ro)")
    v("pomenire fara legatura cu ofertele -> ramane textul, fara link",
      c("Modelul e popular la [IKEA](/cod-reducere/ikea.ro) de ani buni."), "Modelul e popular la IKEA de ani buni.")
    v("categorie moarta cu redirect -> destinatia",
      c("[Electrocasnice mici →](/categorii/home-garden)"), "[Electrocasnice mici →](/categorii/casa-gradina)")
    v("categorie moarta fara redirect -> text",
      c("[Electrocasnice →](/categorii/appliances)"), "Electrocasnice →")
    v("economii fara sursa -> scoase",
      c("Verifică întotdeauna dacă există un cod de reducere activ înainte de cumpărare — poți economisi 5-15% din prețul final."),
      "Verifică întotdeauna dacă există un cod de reducere activ înainte de cumpărare.")
    v("formula falsa a articolelor de magazin -> ce se intampla de fapt",
      c("AmCupon.ro monitorizeaza zilnic toate promotiile active de la Booking si actualizeaza automat codurile de reducere — asa ca tot ce gasesti pe aceasta pagina este **verificat si functional**."),
      "AmCupon.ro preia automat, de mai multe ori pe zi, promotiile active de la Booking din reteaua de afiliere si le scoate pe cele expirate. Codurile nu le testam in cos: daca unul nu merge, incearca alta oferta activa.")
    # 06.10.2026 — sablonul vechi al articolelor de magazin (cazuri copiate din blog-posts.json)
    v("notita interna <!-- --> afisata ca text -> scoasa",
      c("**Cat de des actualizeaza AmCupon.ro codurile Nemira?**\n<!-- FRECVENTA REALA: update-data.yml are \"0 5,17 * * *\".\n     Corectat 22.08.2026. -->\nText."),
      "**Cat de des actualizeaza AmCupon.ro codurile Nemira?**\nText.")
    v("„verifica zilnic validitatea fiecarui cod” -> ce se intampla de fapt",
      c("Spre deosebire de alte site-uri de cupoane, AmCupon.ro verifica **zilnic** validitatea fiecarui cod. Nu afisam niciodata coduri expirate sau inactive."),
      "Ofertele vin direct din rețeaua de afiliere a magazinului, iar cele cu data de expirare trecută dispar automat de pe AmCupon.ro.")
    v("„oferta exclusiva” si „magazin stabil” -> scoase",
      c("**Oferta exclusiva AmCupon.ro** — nu o gasesti in alta parte!\n\n## Promotii active\n\nMagazin stabil, cu comenzi consistente.\n\nText."),
      "## Promotii active\n\nText.")
    v("pasul 1 cu link spre magazin absent -> ramane intreg, fara link (nu mai rupe ghidul)",
      c("**Pasul 1** — Mergi pe AmCupon.ro, cauta [Librex](/cod-reducere/librex.ro) si apasa \"Copiaza codul\". Codul se salveaza automat in clipboard."),
      "**Pasul 1** — Pe pagina Librex de pe AmCupon.ro, apasă pe codul care te interesează: se copiază automat.")
    v("„Raporteaza cod ... in maxim 24h” (butonul nu exista) -> sfat real",
      c("Apasati \"Raporteaza cod\" pe AmCupon.ro si il vom verifica si actualiza in maxim 24h. Alternativ, incercati urmatoarea promotie din lista — avem de obicei mai multe optiuni active simultan."),
      "Verifică condițiile promoției (valoarea minimă a coșului, produsele excluse, doar prima comandă) și încearcă altă ofertă activă. O promoție se poate epuiza și înainte de data de expirare.")
    v("intrebarea despre aplicatia mobila (raspuns inventat) -> scoasa",
      c("**Functioneaza codurile pe aplicatia mobila Nemira?**\nDa, codurile de reducere Nemira functioneaza atat pe site cat si pe aplicatia mobila. Campul de voucher se gaseste la aceeasi locatie in checkout.\n\n**Ce fac daca un cod nu functioneaza?**"),
      "**Ce fac daca un cod nu functioneaza?**")
    v("sfatul lunii vechi (afirmatie despre magazin) -> sfatul generic",
      c("## In Octombrie 2026 incep pregatirile pentru iarna la Librex. Acesta e momentul ideal sa cumparati produse de sezon inainte de varf.\n\nText."),
      "## Sfatul lunii Octombrie\n\nÎn octombrie multe magazine aduc produsele de toamnă-iarnă. Dacă vrei un produs anume, notează-i prețul de acum: la Black Friday, în noiembrie, vei ști dacă reducerea e reală.\n\nText.")
    v("„este valid in momentul in care il accesati” -> scos",
      c("Sistemul nostru verifica promotiile de la Nemira de **trei ori pe zi**. Codul pe care il gasiti pe aceasta pagina este valid in momentul in care il accesati."),
      "De mai multe ori pe zi, automat, din rețeaua de afiliere. Valabilitatea finală a unui cod o confirmă coșul magazinului.")
    v("link spre partener ramane neatins",
      c("Coduri active la [Notino](/cod-reducere/notino.ro)."), "Coduri active la [Notino](/cod-reducere/notino.ro).")
    v("idempotent", c(c("Folosește codurile de la partenerii noștri: [eMAG](/cod-reducere/emag.ro) si [Answear](/cod-reducere/answear.ro).")),
      c("Folosește codurile de la partenerii noștri: [eMAG](/cod-reducere/emag.ro) si [Answear](/cod-reducere/answear.ro)."))

    d = lambda t: curata_descriere(t, platite)
    v("descriere: doar magazine absente -> clauza dispare",
      d("Top friteuze cu aer cald 2026: Philips, Tefal. Ce capacitate alegi, cat consuma, coduri reducere eMAG si Altex."),
      "Top friteuze cu aer cald 2026: Philips, Tefal. Ce capacitate alegi, cat consuma.")
    v("descriere: mixt -> doar partenerul",
      d("Top fonduri de ten 2026: pentru ten gras, uscat. Recenzii detaliate și coduri reducere Notino, Sephora."),
      "Top fonduri de ten 2026: pentru ten gras, uscat. Coduri reducere Notino.")
    v("descriere: eMAG cu litera mica e recunoscut",
      d("Top drone 2026: DJI Mini 4 Pro. Camera 4K, autonomie. Coduri reducere eMAG Altex."),
      "Top drone 2026: DJI Mini 4 Pro. Camera 4K, autonomie.")
    v("economii fara sursa, in mijlocul paragrafului -> doar propozitia dispare",
      c("Vestea buna: cu putina atentie, poti economisi 30-40% la aceleasi produse de calitate. Iata ghidul complet."),
      "Iata ghidul complet.")
    v("verifica zilnic de la 600+ magazine -> ce se intampla de fapt",
      c("AmCupon.ro verifica zilnic codurile de la 600+ magazine, gratuit."),
      "AmCupon.ro actualizeaza automat codurile de la magazinele partenere, gratuit.")
    v("indicatie pentru cititor ramane",
      c("Verificati pagina magazinului pentru ofertele curente."), "Verificati pagina magazinului pentru ofertele curente.")
    v("subtitlu ramas gol -> scos",
      c("## Unde cumperi?\n\nFolosește codurile de reducere de la partenerii noștri: [eMAG](/cod-reducere/emag.ro).\n\n## Concluzie\n\nText."),
      "## Concluzie\n\nText.")
    v("primul subtitlu lipit de urmatorul -> scos",
      c("## Cel mai bun carucior de bebelus in 2026\n\n## Tipuri de carucioare\n\nText."), "## Tipuri de carucioare\n\nText.")
    v("subtitlu parinte urmat de subsectiune ramane",
      c("## Top 5\n\n### 1. Model\n\nText."), "## Top 5\n\n### 1. Model\n\nText.")
    v("propozitie de economii fara sursa -> scoasa",
      c("Folosește codurile înainte de comandă. Poți economisi 5-30% din prețul final. Verifică stocul."),
      "Folosește codurile înainte de comandă. Verifică stocul.")
    v("descriere de magazin: verificate -> active",
      d("Coduri reducere Booking verificate in Octombrie 2026. 1 promotii active."),
      "Coduri reducere Booking active in Octombrie 2026. 1 promotii active.")
    print(f"\n{'TOATE TREC' if not esecuri else f'{esecuri} ESECURI'}")
    return 1 if esecuri else 0


if __name__ == "__main__":
    sys.exit(main())
