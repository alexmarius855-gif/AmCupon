"""
Genereaza pagini de comparatie magazine pentru SEO.
Output: frontend/public/comparisons.json

Fiecare comparatie = o pagina /comparatii/[slug] cu:
- Titlu + meta SEO
- Tabel side-by-side (promotii, coduri active, categorii)
- Promotii active din fiecare magazin
- Verdict editorial
- FAQ schema
"""

import json
import os
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
OUTPUT_JSON  = os.path.join(HERE, "..", "frontend", "public", "output.json")
DEST_JSON    = os.path.join(HERE, "..", "frontend", "public", "comparisons.json")

LUNI = ["ianuarie","februarie","martie","aprilie","mai","iunie",
        "iulie","august","septembrie","octombrie","noiembrie","decembrie"]

# ─── Perechi de comparatie + context editorial ───────────────────────────────
# 06.10.2026 — curatate pentru corectitudine:
#   · scoase perechile in care NICIUNUL dintre magazine nu e partener (temu-vs-shein, emag-vs-elefant,
#     emag-vs-temu, fashiondays-vs-shein): fara date de la noi si fara link platit, iar randurile lor
#     („livrare 1-3 zile", „retur 90 zile") nu erau verificate. Adresele au 308 in lib/redirecturi.ts;
#   · ramas doar ce e sigur: specialitatea, returul de 30 de zile (FashionDays si Answear, verificat
#     05.10), garantia de 30 de zile si chat-ul non-stop (Surfshark, Hostinger), brandurile proprii
#     notorii. Scoase cifrele neverificate („700.000+ titluri", „800+ farmacii", praguri de transport,
#     „reduceri 10-50%") si superlativele („neinegalata", „preturi imbatabile", „cel mai bun raport");
#   · daca un magazin e partener nu se mai scrie aici: se calculeaza din output.json (build_comparison).
PERECHI = [
    {
        "slug": "fashiondays-vs-answear",
        "m1": "fashiondays.ro", "m2": "answear.ro",
        "titlu_scurt": "FashionDays vs Answear",
        "intro": "FashionDays si Answear vand online haine, incaltaminte si accesorii de brand. Difera prin selectie si prin campaniile de reduceri. Iata cum se compara in {luna} {an}.",
        "puncte": [
            {"aspect": "Specialitate", "v1": "Fashion, branduri internationale", "v2": "Fashion si sportswear, branduri internationale"},
            {"aspect": "Retur", "v1": "30 de zile", "v2": "30 de zile"},
        ],
        "verdict_m1": "Alege FashionDays daca vrei selectia lor de branduri internationale si campaniile lor sezoniere.",
        "verdict_m2": "Alege Answear pentru branduri de fashion si sportswear.",
        "categorie": "Fashion online Romania",
    },
    {
        "slug": "libris-vs-carturesti",
        "m1": "libris.ro", "m2": "carturesti.ro",
        "titlu_scurt": "Libris vs Carturesti",
        "intro": "Libris si Carturesti vand carti online in Romania. Iata cum se compara in {luna} {an}, cu ofertele lor active pe AmCupon.ro.",
        "puncte": [
            {"aspect": "Specialitate", "v1": "Librarie online", "v2": "Librarie online si lant de librarii fizice"},
        ],
        "verdict_m1": "Alege Libris daca vrei o librarie online cu un catalog larg.",
        "verdict_m2": "Alege Carturesti daca vrei sa vezi cartile si in librariile lor fizice.",
        "categorie": "Librarii online Romania",
    },
    {
        "slug": "surfshark-vs-hostinger",
        "m1": "surfshark.com", "m2": "hostinger.ro",
        "titlu_scurt": "Surfshark vs Hostinger",
        "intro": "Surfshark si Hostinger sunt servicii diferite: un VPN si un serviciu de hosting web. Le comparam pentru cine cauta reduceri la abonamente online, in {luna} {an}.",
        "puncte": [
            {"aspect": "Serviciu principal", "v1": "VPN — protectie online si continut blocat geografic", "v2": "Hosting web — site-uri, WordPress"},
            {"aspect": "Garantie", "v1": "30 de zile, bani inapoi", "v2": "30 de zile, bani inapoi"},
            {"aspect": "Suport", "v1": "Chat non-stop", "v2": "Chat non-stop"},
        ],
        "verdict_m1": "Alege Surfshark daca vrei protectie online si acces la servicii blocate geografic.",
        "verdict_m2": "Alege Hostinger daca vrei sa lansezi un site, un blog sau un magazin online.",
        "categorie": "Servicii online",
    },
    {
        "slug": "drmax-vs-farmec",
        "m1": "drmax.ro", "m2": "farmec.ro",
        "titlu_scurt": "Dr. Max vs Farmec",
        "intro": "Dr. Max este o farmacie online si fizica, iar Farmec un producator roman de cosmetice care vinde si online. Iata cum se compara in {luna} {an}.",
        "puncte": [
            {"aspect": "Specialitate", "v1": "Farmacie: medicamente fara reteta, suplimente, dermatocosmetice", "v2": "Cosmetice romanesti proprii"},
            {"aspect": "Branduri", "v1": "Branduri internationale si romanesti", "v2": "Gerovital, Aslavital (branduri Farmec)"},
        ],
        "verdict_m1": "Alege Dr. Max pentru medicamente fara reteta, suplimente si dermatocosmetice.",
        "verdict_m2": "Alege Farmec daca vrei cosmetice romanesti Gerovital sau Aslavital, direct de la producator.",
        "categorie": "Sanatate si frumusete",
    },
    {
        "slug": "noriel-vs-decathlon",
        "m1": "noriel.ro", "m2": "decathlon.ro",
        "titlu_scurt": "Noriel vs Decathlon",
        "intro": "Noriel vinde jucarii si jocuri, Decathlon echipament sportiv. Ambele au produse pentru copii. Iata cum se compara in {luna} {an}.",
        "puncte": [
            {"aspect": "Specialitate", "v1": "Jucarii si jocuri de societate", "v2": "Sport si outdoor"},
            {"aspect": "Pentru copii", "v1": "Jucarii si jocuri", "v2": "Echipament sportiv si biciclete pentru copii"},
            {"aspect": "Branduri proprii", "v1": "—", "v2": "Quechua, Domyos si altele"},
        ],
        "verdict_m1": "Alege Noriel pentru jucarii, jocuri de societate si cadouri pentru copii.",
        "verdict_m2": "Alege Decathlon pentru echipament sportiv pentru copii si adulti.",
        "categorie": "Copii si sport",
    },
    {
        "slug": "libris-vs-elefant",
        "m1": "libris.ro", "m2": "elefant.ro",
        "titlu_scurt": "Libris vs Elefant",
        "intro": "Libris si Elefant vand carti online in Romania; Elefant are si alte categorii de produse. Iata cum se compara in {luna} {an}.",
        "puncte": [
            {"aspect": "Specialitate", "v1": "Librarie online", "v2": "Carti si alte categorii de produse"},
        ],
        "verdict_m1": "Alege Libris daca vrei o librarie online cu un catalog larg.",
        "verdict_m2": "Alege Elefant daca vrei sa comanzi si alte produse impreuna cu cartile.",
        "categorie": "Librarii online Romania",
    },
]


def _partener(m: dict) -> bool:
    """Are link de afiliere REAL — aceeasi regula ca linkAfiliat() din frontend/lib/linkMagazin.ts."""
    a = (m.get("url_afiliat") or "").strip()
    return bool(a) and a != (m.get("url") or "").strip()


def _num_afisat(slug: str) -> str:
    return " ".join(w.capitalize() for w in slug.split(".")[0].replace("-", " ").split())


def _coduri_active(m: dict) -> str:
    """Cate coduri REALE are magazinul acum. Numarat din date, nu estimat.

    07.09.2026 — inlocuieste `_max_cashback()`, care lua `comision` (CE CASTIGAM NOI)
    si il publica drept "Cashback: pana la X%". Pe `surfshark-vs-hostinger` scria
    LIVE "pana la 40%" si "pana la 60%" — cifre reale, dar ale comisionului nostru.
    Cititorul intelege ca primeste el 60% inapoi. Nu primeste nimic.

    E a treia reaparitie a aceleiasi greseli (03.07 pe site, 08.08 in newsletter,
    acum in comparatii + post_facebook). Regula, scrisa deja in
    docs/LECTII-TEHNICE.md sectiunea 10: comisionul nostru NU se publica —
    nu e o masura a ofertei pentru cumparator.

    Inlocuitorul e un numar pe care il putem sustine: cate coduri are magazinul.
    """
    coduri = [p for p in (m.get("promotii") or [])
              if str(p.get("cod_cupon") or "").strip() and p.get("zile_ramase", -1) >= 0]
    if not coduri:
        return "—"
    return f"{len(coduri)} cod" + ("uri" if len(coduri) > 1 else "")


def build_comparison(pereche: dict, magazin_map: dict, luna: str, an: int) -> dict:
    slug = pereche["slug"]
    m1_slug = pereche["m1"]
    m2_slug = pereche["m2"]

    m1 = magazin_map.get(m1_slug, {})
    m2 = magazin_map.get(m2_slug, {})

    n1 = _num_afisat(m1_slug)
    n2 = _num_afisat(m2_slug)

    titlu = f"{pereche['titlu_scurt']} {an} — Comparatie Completa | AmCupon.ro"
    titlu_h1 = f"{pereche['titlu_scurt']} — unde gasesti cele mai bune oferte?"
    intro = pereche["intro"].format(luna=luna, an=an)

    promo1 = (m1.get("promotii") or [])[:3]
    promo2 = (m2.get("promotii") or [])[:3]

    stats1 = {
        "promotii_active": len(m1.get("promotii") or []),
        "coduri": _coduri_active(m1),
        "logo": m1.get("logo_url"),
        "url_afiliat": m1.get("url_afiliat") or m1.get("url") or f"https://{m1_slug}",
        "partener": _partener(m1),
    }
    stats2 = {
        "promotii_active": len(m2.get("promotii") or []),
        "coduri": _coduri_active(m2),
        "logo": m2.get("logo_url"),
        "url_afiliat": m2.get("url_afiliat") or m2.get("url") or f"https://{m2_slug}",
        "partener": _partener(m2),
    }

    def are_oferte(n: str, s: dict) -> str:
        if not s["partener"]:
            return f"{n} nu are program de afiliere pe AmCupon.ro, deci nu publicam oferte {n}."
        k = s["promotii_active"]
        return (f"{'Da' if k > 0 else 'Momentan nu'}, {n} are {k} {'oferta activa' if k == 1 else 'oferte active'} "
                f"pe AmCupon.ro in {luna} {an}. Ofertele se actualizeaza automat de trei ori pe zi.")

    parteneri = [n for n, s in ((n1, stats1), (n2, stats2)) if s["partener"]]
    faq = [
        {"q": f"Care este mai bun, {n1} sau {n2}?", "a": f"{pereche['verdict_m1']} {pereche['verdict_m2']}"},
        {"q": f"Are {n1} coduri de reducere active?", "a": are_oferte(n1, stats1)},
        {"q": f"Are {n2} coduri de reducere active?", "a": are_oferte(n2, stats2)},
        {"q": f"Unde gasesc cupoane pentru {n1} si {n2}?",
         "a": (f"Pe AmCupon.ro gasesti ofertele active ale magazinelor partenere ({' si '.join(parteneri)}), actualizate automat. "
               "Copiezi codul, il aplici in cos si reducerea se scade automat.") if parteneri
              else "Niciunul dintre cele doua magazine nu are program de afiliere pe AmCupon.ro."},
    ]

    return {
        "slug": slug,
        "m1_slug": m1_slug,
        "m2_slug": m2_slug,
        "n1": n1,
        "n2": n2,
        "titlu": titlu,
        "titlu_h1": titlu_h1,
        "intro": intro,
        "categorie": pereche["categorie"],
        "puncte": pereche["puncte"],
        "verdict_m1": pereche["verdict_m1"],
        "verdict_m2": pereche["verdict_m2"],
        "stats1": stats1,
        "stats2": stats2,
        "promo1": [{"nume": p["nume"], "cod_cupon": p.get("cod_cupon","")} for p in promo1],
        "promo2": [{"nume": p["nume"], "cod_cupon": p.get("cod_cupon","")} for p in promo2],
        "faq": faq,
        "luna": luna,
        "an": an,
    }


def main():
    azi = date.today()
    luna = LUNI[azi.month - 1]
    an = azi.year

    with open(OUTPUT_JSON, encoding="utf-8") as f:
        magazine = json.load(f)

    magazin_map = {m["magazin"]: m for m in magazine}

    rezultat = {}
    for pereche in PERECHI:
        comp = build_comparison(pereche, magazin_map, luna, an)
        rezultat[pereche["slug"]] = comp

    with open(DEST_JSON, "w", encoding="utf-8") as f:
        json.dump(rezultat, f, ensure_ascii=False, indent=2)

    print(f"Generat {len(rezultat)} comparatii → {DEST_JSON}")
    for slug in rezultat:
        print(f"  /comparatii/{slug}")


if __name__ == "__main__":
    main()
