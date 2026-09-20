#!/usr/bin/env python3
"""
genereaza_schelet_articol.py — scoate din feed PARTEA VERIFICABILA a unui articol
de tip „Top N [categorie]", si lasa explicit goala partea care cere judecata umana.

DE CE EXISTA (20.09.2026)
Articolul de anvelope scris manual pe 08.09 a aratat ca modelul functioneaza: nu
concureaza cu site-urile de cupoane pe „cod reducere X" (unde n-avem autoritate),
ci pe „cele mai bune X" — cautare cu intentie comerciala, unde avem 19.946 de
produse reale cu pret si link afiliat. Dar a durat ~40 de minute, iar 20 de
categorii inseamna 13 ore care nu scaleaza cand feed-ul creste.

CE FACE / CE NU FACE — si de ce granita e exact aici
  FACE:    selectia produselor, tabelul comparativ, preturile, linkurile afiliate,
           specificatiile citite din titlu. Tot ce se poate VERIFICA in date.
  NU FACE: pro/contra, „pentru cine e ideal", descrierile de beneficii, FAQ-ul.
           Alea cer sa stii ceva despre produs. Un generator care le-ar inventa ar
           produce exact fabricatia scoasa din proiect de patru ori (procent_succes
           random, „Cashback 60%" care era comisionul nostru, countdown de 3571 zile).
           Google penalizeaza si continutul fabricat in masa. Deci marcajele
           [EDITORIAL] raman vizibile pana le scrie un om.

REGULI DE ONESTITATE aplicate automat:
  - doar produse cu pret > 0 SI link afiliat real (fara link, produsul nu intra);
  - preturile sunt marcate „pe bucata" acolo unde feed-ul da pret unitar;
  - reducerea se mentioneaza DOAR daca `discount_pct` > 0 in date;
  - nu se scrie niciodata „am testat" — nu testam nimic.

Rulare:
  python genereaza_schelet_articol.py --lista
  python genereaza_schelet_articol.py --categorie "Suplimente" --n 10
  python genereaza_schelet_articol.py --cauta "magneziu" --n 8 --titlu "Top suplimente cu magneziu"
"""

import argparse
import io
import json
import os
import re
import sys
from collections import Counter
from datetime import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
FEED = os.path.join(SCRIPT_DIR, "..", "frontend", "public", "products.json")

# Retelele ale caror linkuri chiar platesc comision. Un produs al carui url nu e pe
# niciuna dintre ele ajunge pe site ca reclama gratuita — deci nu intra in articol.
RETELE_PLATITE = ("event.2performant.com", ".sjv.io", ".pxf.io", "ojrq.net",
                  "awin1.com", "profitshare.ro")

LUNI = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie",
        "august", "septembrie", "octombrie", "noiembrie", "decembrie"]


def incarca():
    d = json.load(io.open(FEED, encoding="utf-8"))
    return d.get("products", d if isinstance(d, list) else [])


def are_link_platit(p):
    return any(t in (p.get("url") or "") for t in RETELE_PLATITE)


# Cuvinte care apar DOAR in ceha/slovaca, nu in romana. Lista e scurta si specifica
# intentionat: un filtru lax taie produse bune. Masurat pe feed la 20.09, „épil"
# (Braun Silk-épil) si „rejansă" sunt nume de produs / cuvinte romanesti — un regex
# pe diacritice le-ar fi prins gresit pe amandoua.
CUVINTE_STRAINE = re.compile(r"rostlinn|kapsl|příchuť|balení|порц", re.I)


def titlu_romanesc(p):
    """Feed-ul contine titluri netraduse din ceha (ex. „250 rostlinných kapslí").

    Masurat 20.09: ~0,3% din produse, concentrate la cateva magazine. Publicate ca
    atare ar aparea pe site intr-o limba pe care cititorul roman n-o intelege — si,
    spre deosebire de un pret gresit, nimeni nu le raporteaza vreodata.
    """
    return not CUVINTE_STRAINE.search(p.get("title") or "")


def filtreaza_preturi_absurde(pool):
    """Scoate preturile evident corupte, raportat la restul categoriei.

    Masurat 20.09: „Aeroterma ENGROS auto dezghetare parbriz — 0,3 lei", „Set 100
    saculeti organza — 0,2 lei". Nu sunt produse ieftine, sunt preturi gresite in
    feed (pret unitar dintr-un bax, sau camp gresit). Un „Top 10" care se deschide
    cu o aeroterma de 30 de bani nu mai e crezut la niciun rand de dupa.

    Pragul e RELATIV la mediana categoriei, nu absolut: 5 lei e o bagatela la
    anvelope si un pret normal la condimente.
    """
    if len(pool) < 8:
        return pool
    preturi = sorted(x["price"] for x in pool)
    mediana = preturi[len(preturi) // 2]
    prag = mediana * 0.12
    pastrate = [x for x in pool if x["price"] >= prag]
    taiate = len(pool) - len(pastrate)
    if taiate:
        print(f"  sarite {taiate} produse sub {prag:.1f} lei "
              f"(12% din mediana {mediana:.0f} lei) — preturi probabil corupte in feed")
    # Daca filtrul ar goli categoria, inseamna ca presupunerea mea despre ea e gresita,
    # nu ca produsele sunt gresite. In cazul ala nu taiem nimic.
    return pastrate if len(pastrate) >= 3 else pool


def utilizabil(p):
    """Un produs intra in articol doar daca putem sustine ce scriem despre el."""
    return ((p.get("price") or 0) > 0 and are_link_platit(p)
            and (p.get("title") or "").strip() and titlu_romanesc(p))


def cheie_dedup(titlu, cuvinte=6):
    """Acelasi produs in 5 dimensiuni nu inseamna 5 recomandari.

    Taiem cifrele si unitatile din titlu: „Anvelopa Iarna Kumho WP52 205/45R17 88V"
    si „...WP52 215/60R17 100V" devin aceeasi cheie, deci intra o singura data.
    Fara asta, un „Top 10" ar fi acelasi produs de zece ori — cea mai rapida cale
    de a pierde cititorul.
    """
    t = re.sub(r"\d+([.,]\d+)?", "", (titlu or "").lower())
    t = re.sub(r"[^a-zA-Zăâîșț ]", " ", t)
    return " ".join(t.split()[:cuvinte])


def selecteaza(produse, n, cuvinte_dedup=6):
    """N produse care acopera intervalul de pret, nu N produse aproape identice.

    Cititorul care cauta „cele mai bune X" are un buget in cap. Un top in care toate
    variantele costa la fel nu-l ajuta sa decida. Impartim lista sortata pe pret in
    n felii egale si luam cate unul din fiecare — asa articolul acopera de la varianta
    de intrare pana la premium, iar fiecare pozitie are un motiv sa existe.
    """
    vazute, unice = set(), []
    for p in sorted(produse, key=lambda x: x["price"]):
        k = cheie_dedup(p["title"], cuvinte_dedup)
        if k in vazute:
            continue
        vazute.add(k)
        unice.append(p)
    if len(unice) <= n:
        return unice
    pas = len(unice) / n
    alese, folosite = [], set()
    for i in range(n):
        idx = min(int(i * pas), len(unice) - 1)
        while idx in folosite and idx < len(unice) - 1:
            idx += 1
        folosite.add(idx)
        alese.append(unice[idx])
    return alese


def pret_txt(p):
    v = p["price"]
    return f"{v:,.0f} lei".replace(",", ".")


def specificatii(titlu):
    """Ce se poate citi CU CERTITUDINE din titlu — nimic dedus, nimic presupus."""
    spec = []
    if m := re.search(r"\b(\d{3}/\d{2}R\d{2}[A-Z]?)\s*(\d{2,3}[A-Z])?", titlu):
        spec.append(f"dimensiune {m.group(1)}" + (f", indice {m.group(2)}" if m.group(2) else ""))
    if m := re.search(r"\b(\d+(?:[.,]\d+)?)\s*(ml|l|g|kg|mg|buc|cm|mm|m)\b", titlu, re.I):
        spec.append(f"{m.group(1)} {m.group(2).lower()}")
    if m := re.search(r"\b(\d+)\s*(W|V|Ah|GB|TB|MP|inch|\")\b", titlu, re.I):
        spec.append(f"{m.group(1)} {m.group(2)}")
    return " · ".join(spec)


def construieste(produse, titlu, categorie):
    azi = datetime.now()
    luna, an = LUNI[azi.month - 1], azi.year
    titlu = titlu or f"Top {len(produse)} {categorie} în {an}: comparativ și prețuri actuale"
    magazine = sorted({p.get("merchant_slug") for p in produse})

    L = [f"# {titlu}", ""]
    L += [f"> **[EDITORIAL — INTRODUCERE]** 1-2 paragrafe despre problema concretă pe care o "
           f"rezolvă produsele astea. Fără „în ziua de azi...”. Direct la ce îl doare pe cumpărător.", ""]
    L += [f"Prețurile de mai jos sunt cele listate în {luna} {an} și se pot schimba. "
          f"**[EDITORIAL: dacă prețul e pe bucată și nu pe set, scrie asta aici — altfel "
          f"cititorul crede că ia tot pachetul.]**", "", "---", ""]

    # ── Tabel comparativ, imediat dupa intro: decizia se ia pe mobil in primele secunde
    L += ["## Tabel comparativ rapid", "",
          "| Produs | Pentru ce e | Punct forte | Preț |", "|---|---|---|---|"]
    for p in produse:
        t = p["title"][:58] + ("…" if len(p["title"]) > 58 else "")
        L.append(f"| {t} | **[EDITORIAL]** | **[EDITORIAL]** | **[{pret_txt(p)} →]({p['url']})** |")
    L += ["", "---", "", "## Recomandări", ""]

    for i, p in enumerate(produse, 1):
        spec = specificatii(p["title"])
        L += [f"### {i}. {p['title']} — **[EDITORIAL: tagline, ex. „alegerea pentru buget redus”]**", ""]
        detalii = [f"**Preț:** {pret_txt(p)}"]
        if p.get("brand"):
            detalii.append(f"**Marcă:** {p['brand']}")
        if spec:
            detalii.append(f"**Din specificații:** {spec}")
        if (p.get("discount_pct") or 0) > 0:
            detalii.append(f"**Redus cu {p['discount_pct']}%**"
                           + (f" (de la {p['old_price']:.0f} lei)" if p.get("old_price") else ""))
        L += [" · ".join(detalii), ""]
        L += ["> **[EDITORIAL — DESCRIERE]** 3-4 fraze pe beneficii, nu pe caracteristici. "
              "Ce rezolvă concret. Fără „am testat” — nu testăm nimic.", ""]
        L += ["**Pro:**", "- **[EDITORIAL]**", "- **[EDITORIAL]**", "- **[EDITORIAL]**", ""]
        L += ["**Contra:**", "- **[EDITORIAL — un dezavantaj real, nu unul cosmetic]**",
              "- **[EDITORIAL]**", ""]
        L += ["**Ideal pentru:** **[EDITORIAL — o frază]**", ""]
        L += [f"**👉 [Verifică prețul actualizat]({p['url']})**", "", "---", ""]

    L += ["## Ghid rapid de cumpărare", "",
          "> **[EDITORIAL]** 3-4 sfaturi practice: ce se verifică înainte de comandă, ce "
          "greșeală face toată lumea, cum se compară corect două variante.", "",
          "---", "", "## Întrebări frecvente", ""]
    for _ in range(3):
        L += ["**[EDITORIAL — întrebare reală de pe Google/forumuri]**",
              "**[EDITORIAL — răspuns scurt, la obiect]**", ""]

    L += ["---", "",
          f"*Prețurile sunt cele listate la data publicării și se pot schimba. "
          f"AmCupon.ro primește un comision din bugetul de marketing al magazinelor "
          f"({', '.join(magazine)}) pentru comenzile plasate prin linkurile de mai sus — "
          f"prețul plătit de tine este același.*", ""]
    return "\n".join(L)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--categorie", help="filtreaza dupa campul `category` (potrivire partiala)")
    ap.add_argument("--cauta", help="filtreaza dupa text in titlul produsului")
    ap.add_argument("--n", type=int, default=10)
    ap.add_argument("--titlu")
    ap.add_argument("--out")
    ap.add_argument("--dedup", type=int, default=6, metavar="N",
                    help=("cate cuvinte din titlu definesc un produs DISTINCT (default 6). "
                          "Scade-l la 2-3 in categorii unde acelasi produs apare in zeci de "
                          "variante. Masurat pe categoria Cadouri personalizate: 348 de produse "
                          "erau de fapt ~12 tipuri (aceeasi agenda pentru 40 de profesii, "
                          "aceeasi caricatura pentru 60 de meserii). Cu 6 cuvinte, un Top 10 "
                          "ar fi iesit cu zece agende identice."))
    ap.add_argument("--lista", action="store_true", help="arata categoriile disponibile si iese")
    a = ap.parse_args()

    toate = [p for p in incarca() if utilizabil(p)]
    print(f"produse utilizabile in feed (pret real + link care plateste): {len(toate)}")

    if a.lista or not (a.categorie or a.cauta):
        c = Counter((p.get("category") or "?").split(">")[0].split("/")[0].strip() for p in toate)
        print("\ncategorii cu cel putin 40 de produse:\n")
        for k, v in c.most_common(40):
            if v >= 40:
                print(f"   {v:5}  {k[:60]}")
        print("\nfoloseste: --categorie \"<nume>\"  sau  --cauta \"<cuvant din titlu>\"")
        return 0

    if a.categorie:
        pool = [p for p in toate if a.categorie.lower() in (p.get("category") or "").lower()]
        eticheta = a.categorie
    else:
        pool = [p for p in toate if a.cauta.lower() in (p.get("title") or "").lower()]
        eticheta = a.cauta

    pool = filtreaza_preturi_absurde(pool)

    if len(pool) < 3:
        print(f"\nDoar {len(pool)} produse pentru '{eticheta}' — prea putine pentru un articol.")
        print("Incearca un filtru mai larg (--lista arata ce exista).")
        return 1

    alese = selecteaza(pool, a.n, a.dedup)
    preturi = [p["price"] for p in alese]
    print(f"\n'{eticheta}': {len(pool)} produse in pool -> {len(alese)} alese")
    print(f"acoperire pret: {min(preturi):.0f} - {max(preturi):.0f} lei")
    print(f"magazine: {', '.join(sorted({p.get('merchant_slug') for p in alese}))}")

    md = construieste(alese, a.titlu, eticheta)
    out = a.out or os.path.join(SCRIPT_DIR, "..", "data",
                                f"schelet-{re.sub(r'[^a-z0-9]+','-',eticheta.lower()).strip('-')}.md")
    io.open(out, "w", encoding="utf-8", newline="").write(md)
    n_ed = md.count("[EDITORIAL")
    print(f"\nScris: {out}")
    print(f"Linkuri afiliate: {md.count('http')} | Marcaje [EDITORIAL] de completat: {n_ed}")
    print("\nNU PUBLICA pana nu dispare fiecare marcaj [EDITORIAL].")
    return 0


if __name__ == "__main__":
    sys.exit(main())
