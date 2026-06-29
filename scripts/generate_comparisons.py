"""
Genereaza pagini de comparatie magazine pentru SEO.
Output: frontend/public/comparisons.json

Fiecare comparatie = o pagina /comparatii/[slug] cu:
- Titlu + meta SEO
- Tabel side-by-side (promotii, cashback, categorii)
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
PERECHI = [
    {
        "slug": "fashiondays-vs-answear",
        "m1": "fashiondays.ro", "m2": "answear.ro",
        "titlu_scurt": "FashionDays vs Answear",
        "intro": "FashionDays si Answear sunt doua dintre cele mai mari magazine de fashion online din Romania. Ambele ofera haine, incaltaminte si accesorii de brand, dar difera prin selectie, reduceri si experienta de cumparare. Iata cum se compara in {luna} {an}.",
        "puncte": [
            {"aspect": "Specialitate", "v1": "Fashion premium, branduri internationale", "v2": "Sportswear, casual si branuri globale"},
            {"aspect": "Livrare", "v1": "2-4 zile lucratoare", "v2": "2-5 zile lucratoare"},
            {"aspect": "Retur", "v1": "30 de zile", "v2": "30 de zile"},
            {"aspect": "Plata rate", "v1": "Da, prin parteneri", "v2": "Da, prin parteneri"},
            {"aspect": "Reduceri sezoniere", "v1": "Sales masive 50-80%", "v2": "Reduceri frecvente 20-50%"},
        ],
        "verdict_m1": "Alege FashionDays daca vrei branduri premium si sales masive cu reduceri de pana la 80%. Ideal pentru ocazii speciale sau garderoba de sezon.",
        "verdict_m2": "Alege Answear pentru o selectie mai larga de branduri sportive si casual, cu preturi mai constante si disponibilitate buna.",
        "categorie": "Fashion online Romania",
    },
    {
        "slug": "temu-vs-shein",
        "m1": "temu.com", "m2": "shein.com",
        "titlu_scurt": "Temu vs Shein",
        "intro": "Temu si Shein sunt doua platforme internationale de shopping cu preturi foarte mici, populare in Romania. Ambele ofera mii de produse la preturi sub piata, dar difera prin categorii, livrare si calitate. Iata comparatia completa in {luna} {an}.",
        "puncte": [
            {"aspect": "Specialitate", "v1": "Produse diverse: fashion, casa, electronice, jucarii", "v2": "Fashion feminin, accesorii si cosmetice"},
            {"aspect": "Livrare Romania", "v1": "7-20 zile", "v2": "7-25 zile"},
            {"aspect": "Retururi", "v1": "Retur gratuit prima comanda", "v2": "Credit magazin sau retur partial"},
            {"aspect": "Preturi", "v1": "Extrem de mici, promotii zilnice", "v2": "Foarte mici, reduceri constante"},
            {"aspect": "Varietate", "v1": "Milioane de produse, toate categoriile", "v2": "Focus pe moda femei si accesorii"},
        ],
        "verdict_m1": "Alege Temu daca vrei varietate maxima de categorii (nu doar fashion) si esti dispus sa astepti livrarea. Ideal pentru achizitii mici si experimentale.",
        "verdict_m2": "Alege Shein daca esti orientat spre moda feminina, accesorii si cosmetice. Selectia de fashion este mai curata si mai usor de navigat.",
        "categorie": "Shopping online international",
    },
    {
        "slug": "libris-vs-carturesti",
        "m1": "libris.ro", "m2": "carturesti.ro",
        "titlu_scurt": "Libris vs Carturesti",
        "intro": "Libris si Carturesti sunt cele mai mari librarii online din Romania. Ambele ofera sute de mii de titluri, dar difera prin preturi, transport si beneficii pentru cititori. Iata cum se compara in {luna} {an}.",
        "puncte": [
            {"aspect": "Stoc", "v1": "700.000+ titluri", "v2": "600.000+ titluri"},
            {"aspect": "Transport gratuit", "v1": "De la 50 lei", "v2": "De la 79 lei"},
            {"aspect": "Punct de ridicare", "v1": "Easybox + curier", "v2": "Librarii fizice + curier"},
            {"aspect": "Reduceri", "v1": "Reduceri zilnice 10-50%", "v2": "Reduceri periodice + club fideli"},
            {"aspect": "Audiobook / ebook", "v1": "Da, sectiune dedicata", "v2": "Da, prin aplicatie proprie"},
        ],
        "verdict_m1": "Alege Libris pentru transport gratuit la comenzi mai mici si reduceri zilnice mai frecvente. Ideal daca comanzi regulat si vrei cel mai mic pret per carte.",
        "verdict_m2": "Alege Carturesti pentru experienta completa cititor-librarie, acces la librarii fizice pentru ridicare si colectii editoriale curate.",
        "categorie": "Carti online Romania",
    },
    {
        "slug": "emag-vs-elefant",
        "m1": "emag.ro", "m2": "elefant.ro",
        "titlu_scurt": "eMAG vs Elefant",
        "intro": "eMAG si Elefant sunt doua dintre cele mai cunoscute magazine online din Romania. Desi eMAG e mult mai mare, Elefant exceleaza la carti, jocuri si electronice pentru uz casnic. Iata comparatia directa in {luna} {an}.",
        "puncte": [
            {"aspect": "Specialitate", "v1": "Electronice, electrocasnice, fashion, tot", "v2": "Carti, jocuri, electronice, birotice"},
            {"aspect": "Livrare rapida", "v1": "Livrare in aceeasi zi (Bucuresti)", "v2": "2-4 zile lucratoare"},
            {"aspect": "Marketplace", "v1": "Mii de vanzatori terti", "v2": "Vanzator unic (mai sigur)"},
            {"aspect": "Reduceri", "v1": "Campanii masive (Black Friday lider)", "v2": "Reduceri la carti si electronice"},
            {"aspect": "Retur", "v1": "30 de zile", "v2": "30 de zile"},
        ],
        "verdict_m1": "Alege eMAG pentru varietate maxima, livrare rapida si cel mai mare Black Friday din Romania. Ideal pentru electronice, electrocasnice si tot ce ai nevoie intr-un singur loc.",
        "verdict_m2": "Alege Elefant pentru carti, jocuri si produse educationale — selectia este mai curata si preturile la carti sunt adesea mai bune.",
        "categorie": "Shopping online Romania",
    },
    {
        "slug": "emag-vs-temu",
        "m1": "emag.ro", "m2": "temu.com",
        "titlu_scurt": "eMAG vs Temu",
        "intro": "eMAG este liderul comerțului online din Romania, in timp ce Temu a cucerit piata cu preturi extrem de mici. Dar care este mai bun pentru tine? Iata o comparatie obiectiva in {luna} {an}.",
        "puncte": [
            {"aspect": "Viteza livrare", "v1": "1-3 zile (uneori aceeasi zi)", "v2": "7-20 zile (din China)"},
            {"aspect": "Garantii produse", "v1": "Garantie legala, service autorizat", "v2": "Retur 90 zile, fara garantie service"},
            {"aspect": "Preturi", "v1": "Competitive, cu variatii mari", "v2": "Extrem de mici, mai ales la accesorii"},
            {"aspect": "Calitate", "v1": "Variabila, dar cu filtrare review-uri", "v2": "Variabila, bazata pe recenzii"},
            {"aspect": "Plata in lei", "v1": "Da, toate metodele RO", "v2": "Da, card international"},
        ],
        "verdict_m1": "Alege eMAG cand ai nevoie urgent sau vrei garantii clare si produse verificate. Ideal pentru electronice, electrocasnice si produse de marca.",
        "verdict_m2": "Alege Temu pentru accesorii, produse de uz casnic si articole la preturi foarte mici unde calitatea exacta conteaza mai putin. Planifica dinainte — livrarea dureaza.",
        "categorie": "Shopping online Romania",
    },
    {
        "slug": "surfshark-vs-hostinger",
        "m1": "surfshark.com", "m2": "hostinger.ro",
        "titlu_scurt": "Surfshark vs Hostinger",
        "intro": "Surfshark si Hostinger sunt doua servicii digitale de top cu preturi competitive in Romania. Surfshark protejeaza conexiunea ta, Hostinger iti gazduieste site-ul. Daca vrei ambele, iata ce trebuie sa stii in {luna} {an}.",
        "puncte": [
            {"aspect": "Serviciu principal", "v1": "VPN — protectie online si geo-deblocare", "v2": "Hosting web — site-uri, WordPress"},
            {"aspect": "Pret de intrare", "v1": "de la ~2 USD/luna (plan anual)", "v2": "de la ~1.5 USD/luna (plan anual)"},
            {"aspect": "Garantie", "v1": "30 zile money-back", "v2": "30 zile money-back"},
            {"aspect": "Numar dispozitive", "v1": "Dispozitive nelimitate simultan", "v2": "1 site (plan basic)"},
            {"aspect": "Suport", "v1": "Live chat 24/7", "v2": "Live chat 24/7"},
        ],
        "verdict_m1": "Alege Surfshark daca vrei protectie online, acces Netflix/alte servicii geo-blocate si privacy. Dispozitive nelimitate la un pret mic.",
        "verdict_m2": "Alege Hostinger daca vrei sa lansezi un site, blog sau magazin online. Cel mai bun raport performanta/pret din hosting-ul romanesc.",
        "categorie": "Servicii digitale",
    },
    {
        "slug": "drmax-vs-farmec",
        "m1": "drmax.ro", "m2": "farmec.ro",
        "titlu_scurt": "Dr. Max vs Farmec",
        "intro": "Dr. Max este o farmacie online cu produse OTC si cosmetice, in timp ce Farmec este cel mai cunoscut producator roman de cosmetice. Iata cum se compara in {luna} {an} si cand sa alegi fiecare.",
        "puncte": [
            {"aspect": "Specialitate", "v1": "Farmacie OTC, suplimente, cosmetice diverse", "v2": "Cosmetice romanesti proprii + parfumuri"},
            {"aspect": "Transport", "v1": "Gratuit de la 150 lei", "v2": "Gratuit de la 100 lei"},
            {"aspect": "Retea fizica", "v1": "800+ farmacii in Romania", "v2": "Produse in supermarketuri + site propriu"},
            {"aspect": "Reduceri", "v1": "Oferte saptamanale la medicamente si cosmetice", "v2": "Promotii sezoniere la colectii proprii"},
            {"aspect": "Produse proprii", "v1": "Branduri internationale + private label", "v2": "Gerovital, Aslavital, Doina (branduri iconice RO)"},
        ],
        "verdict_m1": "Alege Dr. Max pentru o gama larga de medicamente OTC, suplimente si cosmetice internationale la preturi competitive cu livrare rapida.",
        "verdict_m2": "Alege Farmec daca vrei produse cosmetice romanesti de calitate (Gerovital, Aslavital) cu ingrediente naturale si preturi accesibile.",
        "categorie": "Farmacie si cosmetice Romania",
    },
    {
        "slug": "noriel-vs-decathlon",
        "m1": "noriel.ro", "m2": "decathlon.ro",
        "titlu_scurt": "Noriel vs Decathlon",
        "intro": "Noriel este liderul jucăriilor și produselor pentru copii în Romania, iar Decathlon conduce la echipamente sportive. Se suprapun la jocuri active și sport pentru copii. Iata comparatia in {luna} {an}.",
        "puncte": [
            {"aspect": "Specialitate", "v1": "Jucarii, jocuri de societate, rechizite", "v2": "Sport si outdoor, fitness, biciclete"},
            {"aspect": "Produse pentru copii", "v1": "Selectie uriasa de jucarii 0-16 ani", "v2": "Echipament sportiv copii, biciclete"},
            {"aspect": "Transport gratuit", "v1": "De la 99 lei", "v2": "De la 150 lei"},
            {"aspect": "Branduri proprii", "v1": "Noriel Toys (exclusive)", "v2": "Quechua, Domyos, B'Twin (calitate buna)"},
            {"aspect": "Retur", "v1": "30 zile", "v2": "30 zile"},
        ],
        "verdict_m1": "Alege Noriel pentru cadouri copii, jucarii educative si jocuri de societate. Selectia este neinegalata in Romania.",
        "verdict_m2": "Alege Decathlon pentru echipament sportiv copii si adulti la preturi imbatabile. Ideal pentru biciclete, camping, fotbal, inot.",
        "categorie": "Jucarii si sport Romania",
    },
    {
        "slug": "fashiondays-vs-shein",
        "m1": "fashiondays.ro", "m2": "shein.com",
        "titlu_scurt": "FashionDays vs Shein",
        "intro": "FashionDays ofera branduri premium din Europa, in timp ce Shein vine cu moda ultra-accesibila din Asia. Doua filozofii diferite la acelasi produs: haine. Iata comparatia in {luna} {an}.",
        "puncte": [
            {"aspect": "Preturi", "v1": "Medii-ridicate, reduceri mari la sales", "v2": "Extrem de mici, promotii permanente"},
            {"aspect": "Livrare", "v1": "2-4 zile, din depozite europene", "v2": "7-25 zile, din China"},
            {"aspect": "Calitate materiale", "v1": "Branduri verificate, calitate consistenta", "v2": "Variabila, consultati review-urile"},
            {"aspect": "Retur", "v1": "30 zile, simplu", "v2": "Credit magazin sau retur partial"},
            {"aspect": "Branduri", "v1": "Versace Jeans, Tommy, Calvin Klein etc.", "v2": "Branduri proprii Shein"},
        ],
        "verdict_m1": "Alege FashionDays pentru branduri europene de calitate cu livrare rapida si retururi simple. Sales-urile de sezon pot fi chiar mai ieftine decat Shein.",
        "verdict_m2": "Alege Shein daca vrei sa testezi tendinte rapid la preturi minime si esti dispus sa astepti livrarea. Perfecta pentru reinnoire frecventa garderoba.",
        "categorie": "Moda online Romania",
    },
    {
        "slug": "libris-vs-elefant",
        "m1": "libris.ro", "m2": "elefant.ro",
        "titlu_scurt": "Libris vs Elefant",
        "intro": "Libris si Elefant sunt doua librarii online mari din Romania, dar Elefant ofera si electronice si jocuri. Iata care este mai bun pentru carti si nu numai, in {luna} {an}.",
        "puncte": [
            {"aspect": "Carti disponibile", "v1": "700.000+ titluri", "v2": "500.000+ titluri"},
            {"aspect": "Electronice", "v1": "Nu", "v2": "Da — laptopuri, tablete, gaming"},
            {"aspect": "Transport gratuit", "v1": "De la 50 lei", "v2": "De la 100 lei"},
            {"aspect": "Promotii carti", "v1": "Reduceri zilnice, top bestsellers ieftine", "v2": "Reduceri regulate, colectii editoriale"},
            {"aspect": "Aplicatie mobila", "v1": "Da", "v2": "Da + ebook-uri proprii"},
        ],
        "verdict_m1": "Alege Libris pentru cel mai mare stoc de carti si transport gratuit la comenzi mai mici. Preturile la bestsellers sunt adesea mai bune.",
        "verdict_m2": "Alege Elefant daca vrei si alte produse (electronice, jocuri) intr-o singura comanda alaturi de carti.",
        "categorie": "Carti si electronice online Romania",
    },
]


def _num_afisat(slug: str) -> str:
    return " ".join(w.capitalize() for w in slug.split(".")[0].replace("-", " ").split())


def _max_cashback(m: dict) -> str:
    nums = []
    comision = m.get("comision", "") or ""
    import re
    found = re.findall(r"[\d.]+", comision)
    if found:
        val = max(float(x) for x in found)
        if val > 0:
            return f"pana la {val:.0f}%"
    return "vezi site"


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
        "cashback": _max_cashback(m1),
        "logo": m1.get("logo_url"),
        "url_afiliat": m1.get("url_afiliat") or m1.get("url") or f"https://{m1_slug}",
    }
    stats2 = {
        "promotii_active": len(m2.get("promotii") or []),
        "cashback": _max_cashback(m2),
        "logo": m2.get("logo_url"),
        "url_afiliat": m2.get("url_afiliat") or m2.get("url") or f"https://{m2_slug}",
    }

    faq = [
        {
            "q": f"Care este mai bun, {n1} sau {n2}?",
            "a": f"{pereche['verdict_m1']} {pereche['verdict_m2']}",
        },
        {
            "q": f"Are {n1} coduri de reducere active?",
            "a": f"{'Da' if stats1['promotii_active'] > 0 else 'Momentan nu'}, {n1} are {stats1['promotii_active']} {'oferta activa' if stats1['promotii_active'] == 1 else 'oferte active'} pe AmCupon.ro in {luna} {an}. Verificam zilnic." ,
        },
        {
            "q": f"Are {n2} coduri de reducere active?",
            "a": f"{'Da' if stats2['promotii_active'] > 0 else 'Momentan nu'}, {n2} are {stats2['promotii_active']} {'oferta activa' if stats2['promotii_active'] == 1 else 'oferte active'} pe AmCupon.ro in {luna} {an}. Verificam zilnic.",
        },
        {
            "q": f"Unde gasesc cupoane pentru {n1} si {n2}?",
            "a": f"Pe AmCupon.ro gasesti coduri de reducere verificate pentru ambele magazine, actualizate zilnic. Copiezi codul, il aplici in cos si reducerea se scade automat.",
        },
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
