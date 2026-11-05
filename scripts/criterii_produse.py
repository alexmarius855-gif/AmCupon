"""
criterii_produse.py — pagini /alege/<criteriu>: produse reale pe o singura caracteristica (04.11.2026).

DE CE: Altex, eMAG si price.ro apar in cautari cu pagini pe caracteristici („masina de spalat 6 kg",
„televizor 139 cm"). Ghidurile si topurile noastre spuneau „1-2 persoane: 3-4 litri", fara link. Aici fiecare
caracteristica primeste produse reale de la partenerii 2Performant, cu pretul din feed si link direct cu comision.

SURSA: `affiliate/product_feeds/products?filter[query]=...` cauta in TOATE feed-urile (584), dar nu da adresa
produsului; `affiliate/product_feeds/<id>/products?filter[query]=...` o da. Deci: cautarea globala afla ce magazine
au produsul, iar cautarea in feed aduce produsele. Evomag are 101.235 de produse in feed, fata de ~50 cate intra in
products.json, de aceea sectiunile din feed nu ajungeau pe aceste pagini.

REGULA: titlul produsului TREBUIE sa contina caracteristica (`baza` + `attr`). Cautarea API e lata: „masina de spalat
rufe 6 kg" da mai ales 8, 9, 10 kg. O pagina apare doar cu cel putin MIN_PRODUSE produse (lib/criterii.ts).

MEMORIE: limita API (primul 429 dupa ~140 de cereri in pipeline) nu permite toate criteriile la o rulare. Se
improspateaza intai cele mai vechi, cat permite BUGET_CERERI. Pretul afisat are data lui.

    python criterii_produse.py          # scrie frontend/public/criterii.json
    python criterii_produse.py --test   # verifica regulile, fara retea
"""
from __future__ import annotations

import io
import json
import os
import re
import sys
import time
import unicodedata
from datetime import datetime, timedelta, timezone
from urllib.parse import quote_plus, unquote, urlsplit

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace", line_buffering=True)

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
IESIRE = os.path.join(ROOT, "frontend", "public", "criterii.json")
OUTPUT = os.path.join(ROOT, "frontend", "public", "output.json")
VERIFICARI = os.path.join(ROOT, "data", "criterii-verificari.json")
# Toti candidatii, confirmati sau nu; intre rulari de aici se reia. In `criterii.json` (public) ajung doar paginile aprobate.
STARE = os.path.join(ROOT, "data", "criterii-stare.json")
# Paginile citite produs cu produs. O pagina noua NU apare singura (cererea lui Alex, 04.11.2026).
APROBATE = os.path.join(ROOT, "data", "criterii-aprobate.json")

MIN_PRODUSE = 4
MAX_PRODUSE = 24
MAX_PE_MAGAZIN = 8
MAX_FEEDURI = 4
PAGINI_GLOBAL = 4
PAGINI_FEED = 2
BUGET_CERERI = int(os.environ.get("CRITERII_BUGET", "90"))
VARSTA_MAXIMA_ZILE = 10
# Masurat 04.11.2026: feed-urile raman in urma. AFI Sport 3.990 lei in feed fata de 4.790 pe site, ASUS si pcmadd cu pagini 404.
BUGET_VERIFICARI = int(os.environ.get("CRITERII_VERIFICARI", "200"))
ZILE_VERIFICARE = 3
# Un pret confirmat pe site-ul magazinului ramane valabil atat; daca magazinul incepe sa blocheze, produsul iese singur.
ZILE_VALABIL = 10
UA_MAGAZIN = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36", "Accept-Language": "ro"}

# Piese si accesorii care apar la orice cautare: un furtun nu e o masina de spalat.
ACCESORII = (r"\b(husa|huse|folie|suport|stand|furtun\w*|detergent|capsule de|tablete de|picioare|garnitur\w*|filtr\w*|"
             r"rulment\w*|pomp[aei]|amortizor\w*|curea|curele|motor|cablu\w*|telecomand\w*|antena|comod\w*|dulap\w*|mobilier|"
             r"accesori\w*|piese?|schimb|jucari\w*|decalcifi\w*|solutie|spray|set de curatare|alimentator|incarcator\w*|adaptor\w*|"
             r"baterie|acumulator|geanta|rucsac|memorie|cooler|tastatura|mouse|sticker|display|ecran de|balama|organizator|"
             r"recipient|farfurie|platou|bol|capac|instalare|montaj|unitate|stick|card|kit|pentru robot|pentru cuptor)\b")
# Produsele folosite nu se amesteca cu cele noi: ar lua primele locuri, fiind cele mai ieftine.
FOLOSITE = r"\b(second hand|sh|refurbished|recondition\w*|resigilat\w*|folosit\w*)\b"
# Magazine care vand produse reconditionate fara s-o spuna in titlu (bsgmag.ro scrie pe site: „4 stari estetice: Ca nou, Excelent...").
# Lange produse noi, pretul lor ar insela. Verificat pe pagina magazinului, 04.11.2026.
MAGAZINE_RECONDITIONATE = {"bsgmag.ro"}


def norm(t: str) -> str:
    """Litere mici, fara diacritice, cu inch scris la fel („55''", „55\"" -> „55 inch")."""
    t = unicodedata.normalize("NFKD", t or "")
    t = "".join(c for c in t if not unicodedata.combining(c)).lower()
    t = t.replace("''", " inch ").replace('"', " inch ").replace("”", " inch ").replace("″", " inch ")
    return re.sub(r"\s+", " ", t).strip()


def C(tema, slug, titlu, q, baza, attr=None, fara=None, pret_min=0, pret_max=0, in_text=None, nota=None, accesorii=True):
    return {"tema": tema, "slug": slug, "titlu": titlu, "q": q, "baza": baza, "attr": attr, "fara": fara,
            "pret_min": pret_min, "pret_max": pret_max, "in_text": in_text, "nota": nota, "accesorii": accesorii}


SPALAT = r"\bmasina de spalat( rufe)?\b"
FRITEUZA = r"\bfriteuz[ae]\b"
TV = r"\b(televizor|smart tv|tv (led|oled|qled))\b"
LAPTOP = r"\b(laptop|notebook|ultrabook)\b"
TELEFON = r"^(.{0,25})\b(telefon|smartphone)\b"
MONITOR = r"\bmonitor\b"
TABLETA = r"\btableta\b"
AC = r"\b(aer conditionat|aparat de aer conditionat)\b"
SALTEA = r"^(.{0,12})saltea\b"
FRIGIDER = r"\b(frigider|combina frigorifica)\b"
VASE = r"\bmasina de spalat vase\b"
NU_MONITOR = r"\b(bebe\w*|ritm|cardiac|tensiune|glicemie|puls|presiune|brat|video pentru|interfon)\b"
NU_TABLETA = r"\b(grafica|desen|scris|lcd|educativa|magnetica|interactiva|de copii|pentru copii)\b"
NU_FRIGIDER = r"\b(auto|camping|portabil\w*|magnet\w*|mini bar|jucari\w*)\b"
NU_AC = r"\b(auto|masina|\d\s*x\s*\d|multi\w*|dublu|triplu|duo|trio)\b"
NU_SALTEA = r"\b(protectie|topper|suplimentar\w*|superioar\w*|bebe|bebelus\w*|copii|cearsaf|perna|gonflabil\w*|camping|fitness|gimnastica|yoga|supraveghere|aer)\b"

def dim(d: str) -> str:
    """„160x200" scris si „160 x 200"."""
    return r"(?<!\d)" + d.replace("x", r"\s*x\s*") + r"\b"


GB = r"(?<![\d.,])%s\s*gb\b"
INCH = r"(?<![\d.,/-])%s(?:[.,]\d)?\s*inch\b"
KG = r"(?<![\d.,/])%s(?:[.,]0)?\s*kg\b"
LITRI = r"(?<![\d.,])(?:%s)\s*(?:l|litri)\b"
BTU = r"(?<!\d)%s\s*btu\b"

CRITERII = [
    # ── Masini de spalat ──
    C("masini-de-spalat", "masina-de-spalat-6-kg", "Mașini de spălat de 6 kg", "masina de spalat 6 kg", SPALAT, KG % "6", r"\b(uscator|vase|portabil\w*)\b", 700, in_text=r"\b6\s*kg\b",
      nota="Capacitatea se referă la greutatea rufelor uscate pe care le poți pune o dată în cuvă."),
    C("masini-de-spalat", "masina-de-spalat-7-kg", "Mașini de spălat de 7 kg", "masina de spalat 7 kg", SPALAT, KG % "7", r"\b(uscator|vase|portabil\w*)\b", 700, in_text=r"\b7\s*kg\b",
      nota="Capacitatea se referă la greutatea rufelor uscate pe care le poți pune o dată în cuvă."),
    C("masini-de-spalat", "masina-de-spalat-8-kg", "Mașini de spălat de 8 kg", "masina de spalat 8 kg", SPALAT, KG % "8", r"\b(uscator|vase|portabil\w*)\b", 700, in_text=r"\b8\s*kg\b",
      nota="Capacitatea se referă la greutatea rufelor uscate pe care le poți pune o dată în cuvă."),
    C("masini-de-spalat", "masina-de-spalat-9-kg", "Mașini de spălat de 9 kg", "masina de spalat 9 kg", SPALAT, KG % "9", r"\b(uscator|vase|portabil\w*)\b", 700, in_text=r"\b9\s*kg\b",
      nota="Capacitatea se referă la greutatea rufelor uscate pe care le poți pune o dată în cuvă."),
    C("masini-de-spalat", "masina-de-spalat-10-kg", "Mașini de spălat de 10 kg", "masina de spalat 10 kg", SPALAT, KG % "10", r"\b(uscator|vase|portabil\w*)\b", 700, in_text=r"\b10\s*kg\b",
      nota="Capacitatea se referă la greutatea rufelor uscate pe care le poți pune o dată în cuvă."),
    C("masini-de-spalat", "masina-de-spalat-cu-uscator", "Mașini de spălat cu uscător", "masina de spalat rufe cu uscator", SPALAT, r"\buscator\b", r"\bvase\b", 1000, in_text=r"\buscător\b"),
    C("masini-de-spalat", "masina-de-spalat-slim", "Mașini de spălat slim", "masina de spalat slim", SPALAT, r"\bslim\b", r"\bvase\b", 700, in_text=r"\bslim\b"),
    C("masini-de-spalat", "masina-de-spalat-sub-1500-lei", "Mașini de spălat sub 1.500 lei", "masina de spalat rufe", SPALAT, None, r"\b(uscator|vase|portabil\w*|mini)\b", 700, 1500),
    # ── Masini de spalat vase ──
    C("masini-de-spalat-vase", "masina-de-spalat-vase-45-cm", "Mașini de spălat vase de 45 cm", "masina de spalat vase 45 cm", VASE, r"(?<!\d)(45|44[.,]\d)\s*cm\b", None, 800),
    C("masini-de-spalat-vase", "masina-de-spalat-vase-60-cm", "Mașini de spălat vase de 60 cm", "masina de spalat vase 60 cm", VASE, r"(?<!\d)(60|59[.,]\d)\s*cm\b", None, 800),
    C("masini-de-spalat-vase", "masina-de-spalat-vase-incorporabila", "Mașini de spălat vase încorporabile", "masina de spalat vase incorporabila", VASE, r"\bincorporabil\w*\b", None, 800),
    # ── Friteuze ──
    C("friteuze", "friteuza-aer-cald-3-4-litri", "Friteuze cu aer cald de 3-4 litri", "friteuza cu aer cald 4 litri", FRITEUZA, LITRI % r"3|3[.,]5|4", None, 120, in_text=r"\b3-4 litri\b",
      nota="Pentru 1-2 persoane sunt de obicei suficienți 3-4 litri."),
    C("friteuze", "friteuza-aer-cald-5-6-litri", "Friteuze cu aer cald de 5-6 litri", "friteuza cu aer cald 5 litri", FRITEUZA, LITRI % r"5|5[.,]\d+|6", None, 120, in_text=r"\b4-6 litri\b",
      nota="Pentru 3-4 persoane, alege în jur de 4-6 litri."),
    C("friteuze", "friteuza-aer-cald-8-litri", "Friteuze cu aer cald de 8 litri sau mai mari", "friteuza cu aer cald 8 litri", FRITEUZA, LITRI % r"8|8[.,]\d+|9|9[.,]\d+|10|10[.,]\d+|11|12", None, 200, in_text=r"\b8-10 litri\b",
      nota="Pentru 5 persoane sau două feluri deodată, caută 8-10 litri, de obicei în două coșuri."),
    C("friteuze", "friteuza-cu-doua-cosuri", "Friteuze cu două coșuri", "friteuza cu doua cosuri", FRITEUZA, r"\b(doua (cosuri|compartimente|zone)|2 cosuri|dual\w*|twin\w*|double)\b", None, 200, in_text=r"\b(un coș sau două|două coșuri)\b",
      nota="Cu două coșuri gătești două feluri la temperaturi diferite."),
    C("friteuze", "friteuza-sub-300-lei", "Friteuze cu aer cald sub 300 lei", "friteuza cu aer cald", FRITEUZA, r"\baer cald\b", None, 100, 300),
    # ── Televizoare ──
    *[C("televizoare", f"televizor-{i}-inch", f"Televizoare de {i} inch", f"televizor {i} inch", TV, INCH % str(i), None, 400, in_text=rf"\b{i}\s*(inch|\")") for i in (32, 43, 50, 55, 65, 75)],
    C("televizoare", "televizor-oled", "Televizoare OLED", "televizor oled", TV, r"\boled\b", None, 1500, in_text=r"\bOLED\b"),
    C("televizoare", "televizor-qled", "Televizoare QLED", "televizor qled", TV, r"\bqled\b", None, 1000, in_text=r"\bQLED\b"),
    C("televizoare", "televizor-sub-2000-lei", "Televizoare sub 2.000 lei", "televizor smart", TV, None, None, 400, 2000),
    # ── Cafea ──
    C("cafetiere", "espressor-automat", "Espressoare automate", "espressor automat", r"\b(espressor|expresor|aparat de cafea)\b", r"\bautomat\b", r"\b(semi|manual)\b", 500, in_text=r"\bautomat\w*\b"),
    C("cafetiere", "espressor-cu-capsule", "Espressoare cu capsule", "espressor cu capsule", r"\b(espressor|expresor|aparat de cafea)\b", r"\bcapsule\b", None, 150, in_text=r"\bcapsule\b", accesorii=False),
    # ── Laptopuri ──
    C("laptopuri", "laptop-16-gb-ram", "Laptopuri cu 16 GB RAM", "laptop 16 gb ram", LAPTOP, GB % "16", None, 1200, in_text=r"\b16 GB\b"),
    C("laptopuri", "laptop-32-gb-ram", "Laptopuri cu 32 GB RAM", "laptop 32 gb ram", LAPTOP, GB % "32", None, 1500, in_text=r"\b32 GB\b"),
    C("laptopuri", "laptop-gaming", "Laptopuri de gaming", "laptop gaming", LAPTOP, r"\bgaming\b", None, 2000, in_text=r"\bgaming\b"),
    C("laptopuri", "laptop-intel-core-i7", "Laptopuri cu Intel Core i7", "laptop intel core i7", LAPTOP, r"\b(i7|core 7|core ultra 7)\b", None, 1500),
    C("laptopuri", "laptop-intel-core-i5", "Laptopuri cu Intel Core i5", "laptop intel core i5", LAPTOP, r"\b(i5|core 5|core ultra 5)\b", None, 1200),
    C("laptopuri", "laptop-ryzen-7", "Laptopuri cu AMD Ryzen 7", "laptop ryzen 7", LAPTOP, r"\bryzen 7\b", None, 1500),
    C("laptopuri", "laptop-sub-3000-lei", "Laptopuri sub 3.000 lei", "laptop", LAPTOP, None, None, 1000, 3000),
    # ── Telefoane ──
    C("telefoane", "telefon-256-gb", "Telefoane cu 256 GB", "telefon 256 gb", TELEFON, GB % "256", r"\b(dect|fix)\b", 400),
    C("telefoane", "telefon-128-gb", "Telefoane cu 128 GB", "telefon 128 gb", TELEFON, GB % "128", r"\b(dect|fix)\b", 300),
    C("telefoane", "telefon-5g", "Telefoane 5G", "telefon 5g", TELEFON, r"\b5g\b", r"\b(dect|fix)\b", 400),
    C("telefoane", "telefon-samsung", "Telefoane Samsung", "telefon samsung galaxy", TELEFON, r"\bsamsung\b", r"\b(dect|fix)\b", 300),
    C("telefoane", "telefon-xiaomi", "Telefoane Xiaomi", "telefon xiaomi", TELEFON, r"\b(xiaomi|redmi|poco)\b", r"\b(dect|fix)\b", 300),
    C("telefoane", "iphone", "Telefoane iPhone", "telefon apple iphone", r"\biphone\b", r"\b(telefon|smartphone|apple)\b", None, 800),
    C("telefoane", "telefon-sub-1000-lei", "Telefoane sub 1.000 lei", "telefon mobil smartphone", TELEFON, None, r"\b(dect|fix|batrani|seniori)\b", 300, 1000),
    # ── Monitoare ──
    *[C("monitoare", f"monitor-{i}-inch", f"Monitoare de {i} inch", f"monitor {i} inch", MONITOR, INCH % str(i), NU_MONITOR, 300) for i in (24, 27, 32)],
    C("monitoare", "monitor-144-hz", "Monitoare de 144 Hz sau mai rapide", "monitor gaming 144hz", MONITOR, r"(?<!\d)(144|165|180|200|240)\s*hz\b", NU_MONITOR, 400),
    C("monitoare", "monitor-gaming", "Monitoare de gaming", "monitor gaming", MONITOR, r"\bgaming\b", NU_MONITOR, 400),
    C("monitoare", "monitor-4k", "Monitoare 4K", "monitor 4k", MONITOR, r"\b(4k|uhd)\b", NU_MONITOR, 700),
    # ── Tablete ──
    C("tablete", "tableta-samsung", "Tablete Samsung", "tableta samsung galaxy tab", TABLETA, r"\bsamsung\b", NU_TABLETA, 400),
    C("tablete", "tableta-ipad", "Tablete iPad", "tableta apple ipad", TABLETA, r"\bipad\b", NU_TABLETA, 1000),
    C("tablete", "tableta-sub-1000-lei", "Tablete sub 1.000 lei", "tableta", TABLETA, None, NU_TABLETA, 250, 1000),
    # ── Aspiratoare ──
    C("aspiratoare-robot", "aspirator-robot-cu-mop", "Aspiratoare robot cu mop", "aspirator robot cu mop", r"\b(aspirator robot|robot de aspirare|robot aspirator)\b", r"\bmop\w*\b", None, 300, in_text=r"\bmop\w*\b"),
    C("aspiratoare-robot", "aspirator-robot-sub-1000-lei", "Aspiratoare robot sub 1.000 lei", "aspirator robot", r"\b(aspirator robot|robot de aspirare|robot aspirator)\b", None, None, 300, 1000),
    C("aspiratoare-fara-fir", "aspirator-vertical-fara-fir", "Aspiratoare verticale fără fir", "aspirator vertical fara fir", r"\baspirator\b", r"\b(fara fir|cordless|wireless)\b", r"\b(auto|masina|robot|mana)\b", 250, in_text=r"\bfără fir\b"),
    C("aspiratoare-fara-fir", "aspirator-de-mana", "Aspiratoare de mână", "aspirator de mana", r"\baspirator\b", r"\bde mana\b", r"\b(auto|masina)\b", 80),
    # ── Aer conditionat ──
    *[C("aer-conditionat", f"aer-conditionat-{i}-btu", f"Aparate de aer condiționat de {i} BTU", f"aer conditionat {i} btu", AC, BTU % str(i), NU_AC, 800, in_text=rf"\b{i}\s*BTU\b") for i in (9000, 12000, 18000, 24000)],
    # ── Saltele ──
    *[C("saltele", f"saltea-{d}", f"Saltele {d}", f"saltea {d}", SALTEA, dim(d), NU_SALTEA, 200) for d in ("90x200", "140x200", "160x200", "180x200")],
    C("saltele", "saltea-ortopedica", "Saltele ortopedice", "saltea ortopedica", SALTEA, r"\bortopedic\w*\b", NU_SALTEA, 200),
    # ── Frigidere ──
    C("frigidere", "frigider-no-frost", "Frigidere No Frost", "frigider no frost", FRIGIDER, r"\bno ?frost\b", NU_FRIGIDER, 800, in_text=r"\bNo Frost\b"),
    C("frigidere", "frigider-side-by-side", "Frigidere Side by Side", "frigider side by side", FRIGIDER, r"\bside by side\b", NU_FRIGIDER, 1500, in_text=r"\bSide by Side\b"),
    C("frigidere", "combina-frigorifica", "Combine frigorifice", "combina frigorifica", r"\bcombina frigorifica\b", None, NU_FRIGIDER, 800),
    # ── Bucatarie ──
    C("roboti-de-bucatarie", "robot-de-bucatarie", "Roboți de bucătărie", "robot de bucatarie", r"^(.{0,20})\brobot de bucatarie\b", None, None, 150),
    C("roboti-de-bucatarie", "mixer-planetar", "Mixere planetare", "mixer planetar", r"\bmixer planetar\b", None, r"\bpentru mixer\b|\bpresa\b", 150),
    C("cuptoare", "cuptor-cu-microunde", "Cuptoare cu microunde", "cuptor cu microunde", r"^(.{0,20})\bcuptor cu microunde\b", None, None, 150),
    C("cuptoare", "cuptor-incorporabil", "Cuptoare încorporabile", "cuptor incorporabil", r"\bcuptor\b", r"\bincorporabil\b", r"\bmicrounde\b|\bpachet\b", 500),
    C("cuptoare", "plita-inductie", "Plite cu inducție", "plita inductie", r"\bplita\b", r"\binductie\b", None, 150),
    # ── Scaune ──
    C("scaune-gaming", "scaun-gaming", "Scaune de gaming", "scaun gaming", r"^(.{0,25})scaun\b", r"\bgaming\b", r"\b(copii|roti|piston)\b", 250),
    C("scaune-birou", "scaun-birou-ergonomic", "Scaune de birou ergonomice", "scaun birou ergonomic", r"^(.{0,25})scaun\b", r"\bergonomic\b", r"\b(copii|gaming|roti|piston)\b", 200),
    # ── Audio si ceasuri ──
    C("casti-wireless", "casti-true-wireless", "Căști True Wireless", "casti true wireless", r"\bcasti\b", r"\b(true wireless|tws)\b", None, 50),
    C("casti-wireless", "casti-anulare-zgomot", "Căști cu anulare a zgomotului", "casti anulare zgomot", r"\bcasti\b", r"\b(anc|noise cancel\w*|anulare\w*( activa)?( a)? zgomot\w*)\b", r"\b(antifonic\w*|bebe\w*|microfo\w* cu anulare\w*)\b", 80),
    C("casti-gaming", "casti-gaming", "Căști de gaming", "casti gaming", r"\bcasti\b", r"\bgaming\b", None, 60),
    C("boxe-bluetooth", "boxa-bluetooth", "Boxe Bluetooth", "boxa bluetooth", r"^(.{0,15})\b(boxa|boxe)\b", r"\b(bluetooth|wireless)\b", r"\b(auto|masina|lampa)\b", 50),
    C("boxe-bluetooth", "boxa-portabila", "Boxe portabile", "boxa portabila", r"^(.{0,15})\b(boxa|boxe)\b", r"\bportabil[ae]\b", r"\b(auto|masina)\b", 50),
    C("smartwatch-uri", "smartwatch-copii", "Smartwatch-uri pentru copii", "smartwatch copii", r"\b(smartwatch|ceas (smart|inteligent))\b", r"\bcopii\b", None, 60),
    C("smartwatch-uri", "smartwatch-gps", "Smartwatch-uri cu GPS", "smartwatch gps", r"\b(smartwatch|ceas (smart|inteligent))\b", r"\bgps\b", r"\bcopii\b", 100),
    # ── Birou ──
    C("imprimante", "imprimanta-laser", "Imprimante laser", "imprimanta laser", r"\b(imprimanta|multifunctionala)\b", r"\blaser\b", r"\b(toner|cartus|cilindru|3d|gravare)\b", 200),
    C("imprimante", "imprimanta-multifunctionala", "Imprimante multifuncționale", "imprimanta multifunctionala", r"\b(imprimanta|multifunctionala)\b", r"\bmultifunctional\w*\b", r"\b(toner|cartus|cilindru|3d)\b", 200),
    # ── Mobilitate ──
    C("trotinete-electrice", "trotineta-electrica-adulti", "Trotinete electrice pentru adulți", "trotineta electrica adulti", r"\btrotineta electrica\b", None, r"\b(copii|anvelopa|camera|frana|aripa)\b", 700),
    C("biciclete-electrice", "bicicleta-electrica", "Biciclete electrice", "bicicleta electrica", r"^(.{0,10})bicicleta\b", r"\belectric\w*\b", r"\b(copii|baterie|anvelopa|camera)\b", 1500),
    # ── Anvelope ──
    *[C("anvelope", f"anvelope-iarna-{d.replace('/', '-').replace(' ', '-').lower()}", f"Anvelope de iarnă {d}", f"anvelope iarna {d}", r"\b(anvelop[ae]\w*|cauciuc\w*)\b", rf"(?<!\d){d.split('/')[0]}\s*/\s*{d.split('/')[1].split()[0]}\s*r\s*{d.split()[-1][1:]}\b.*\b(iarna|winter)\b|\b(iarna|winter)\b.*(?<!\d){d.split('/')[0]}\s*/\s*{d.split('/')[1].split()[0]}\s*r\s*{d.split()[-1][1:]}\b", None, 100) for d in ("205/55 R16", "195/65 R15", "225/45 R17")],
    # ── Parfumuri (modelele din topuri) ──
    C("parfumuri-barbati", "parfum-dior-sauvage", "Parfum Dior Sauvage", "dior sauvage", r"\bsauvage\b", r"\b(parfum|eau de|edp|edt|ml)\b", r"\b(eau sauvage|after shave|deodorant|deo\w*|gel de dus|sapun|balsam|crema|esenta)\b", 150, accesorii=False),
    C("parfumuri-barbati", "parfum-paco-rabanne-invictus", "Parfum Paco Rabanne Invictus", "invictus paco rabanne", r"\binvictus\b", r"\b(parfum|eau de|edp|edt|ml)\b", r"\b(after shave|deodorant|deo\w*|gel de dus|sapun|esenta)\b", 100, accesorii=False),
    C("parfumuri-femei", "parfum-la-vie-est-belle", "Parfum Lancôme La Vie Est Belle", "la vie est belle lancome", r"\bla vie est belle\b", r"\b(parfum|eau de|edp|ml)\b", r"\b(lotiune|deodorant|gel de dus|crema|esenta)\b", 150, accesorii=False),
    C("parfumuri-femei", "parfum-ysl-libre", "Parfum Yves Saint Laurent Libre", "yves saint laurent libre", r"\blibre\b", r"\b(yves saint laurent|ysl)\b.*\b(parfum|eau de|edp|apa de)\b|\b(parfum|eau de|edp|apa de)\b.*\b(yves saint laurent|ysl)\b", r"\b(lotiune|deodorant|gel de dus|crema|esenta|ruj|fond de ten|mascara)\b", 150, accesorii=False),
    # ── Suplimente (fara promisiuni de sanatate: doar forma si doza din titlul produsului) ──
    C("suplimente", "vitamina-d3-2000-ui", "Vitamina D3 2000 UI", "vitamina d3 2000 ui", r"\bvitamina d3?\b", r"(?<!\d)2[ .]?000\s*(ui|iu)\b", None, 15, accesorii=False),
    C("suplimente", "vitamina-c-1000-mg", "Vitamina C 1000 mg", "vitamina c 1000 mg", r"\bvitamina c\b", r"(?<!\d)1[ .]?000\s*mg\b", None, 15, accesorii=False),
    C("suplimente", "magneziu-capsule", "Magneziu în capsule", "magneziu capsule", r"\bmagneziu\b", r"\b(capsule|cps|tablete|comprimate)\b", r"\b(ulei|spray|gel)\b", 15, accesorii=False),
    C("suplimente", "omega-3-capsule", "Omega 3 în capsule", "omega 3 capsule", r"\bomega[ -]?3\b", r"\b(capsule|cps)\b", None, 20, accesorii=False),
    C("suplimente", "colagen-pulbere", "Colagen pulbere", "colagen pulbere", r"\bcolagen\b", r"\b(pulbere|pudra)\b", None, 40, accesorii=False),
    # ── Cosmetice ──
    C("cosmetice", "crema-protectie-spf-50", "Creme de protecție SPF 50", "crema protectie solara spf 50", r"\b(crema|fluid|lotiune|lapte)\b", r"\bspf ?50\b", None, 25, accesorii=False),
    C("cosmetice", "ser-retinol", "Seruri cu retinol", "ser retinol", r"^(.{0,20})\bser\b", r"\bretinol\b", r"\b(de|pentru) par\b", 25, accesorii=False),
    C("cosmetice", "ser-vitamina-c", "Seruri cu vitamina C", "ser vitamina c", r"^(.{0,20})\bser\b", r"\bvitamina c\b", r"\b(de|pentru) par\b|\bretinol\b", 25, accesorii=False),
    C("cosmetice", "sampon-fara-sulfati", "Șampoane fără sulfați", "sampon fara sulfati", r"\bsampon\b", r"\bfara sulfati\b", None, 20, accesorii=False),
    # ── Scule ──
    C("scule", "bormasina-cu-acumulator", "Bormașini cu acumulator", "bormasina cu acumulator", r"^(.{0,12})\b(bormasina|masina de gaurit|surubelnita electrica)\b", r"\b(acumulator|18 ?v|12 ?v|20 ?v)\b", r"\b(fara acumulator\w*|acumulator\w* ne\w*|solo)\b", 150, accesorii=False),
    C("scule", "polizor-unghiular-125-mm", "Polizoare unghiulare de 125 mm", "polizor unghiular 125 mm", r"^(.{0,12})\b(polizor|flex)\b", r"(?<!\d)125\s*mm\b", r"\b(disc|perie|set de discuri)\b", 100, accesorii=False),
    C("scule", "generator-curent", "Generatoare de curent", "generator curent", r"^(.{0,12})\bgenerator\b", r"\b(curent|electric\w*|benzina|inverter)\b", r"\b(fum|abur|ozon|semnal|ceata)\b", 400, accesorii=False),
    C("scule", "masina-tuns-gazon", "Mașini de tuns gazon", "masina de tuns gazon", r"\bmasina de tuns (gazon|iarba)\b", None, None, 300),
    # ── Incaltaminte si imbracaminte ──
    C("incaltaminte", "adidasi-barbati", "Adidași pentru bărbați", "adidasi barbati", r"\b(adidasi|pantofi sport|sneakers)\b", r"\bbarbati\b", r"\b(sireturi|branturi|ciorapi|sosete|copii)\b", 80, accesorii=False),
    C("incaltaminte", "adidasi-dama", "Adidași pentru damă", "adidasi dama", r"\b(adidasi|pantofi sport|sneakers)\b", r"\b(dama|femei)\b", r"\b(sireturi|branturi|ciorapi|sosete|copii)\b", 80, accesorii=False),
    C("incaltaminte", "ghete-dama", "Ghete și botine de damă", "ghete dama", r"^(.{0,25})\b(ghete|botine|cizme)\b", r"\b(dama|femei)\b", r"\b(copii|sireturi|branturi)\b", 80, accesorii=False),
    C("imbracaminte", "geaca-iarna-barbati", "Geci de iarnă pentru bărbați", "geaca iarna barbati", r"^(.{0,25})\b(geaca|jacheta)\b", r"\bbarbati\b.*\b(iarna|puf|matlasat\w*)\b|\b(iarna|puf|matlasat\w*)\b.*\bbarbati\b", r"\bcopii\b", 100, accesorii=False),
    C("imbracaminte", "geaca-iarna-dama", "Geci de iarnă pentru damă", "geaca iarna dama", r"^(.{0,25})\b(geaca|jacheta)\b", r"\b(dama|femei)\b.*\b(iarna|puf|matlasat\w*)\b|\b(iarna|puf|matlasat\w*)\b.*\b(dama|femei)\b", r"\bcopii\b", 100, accesorii=False),
    # ── Copii ──
    C("copii", "carucior-3-in-1", "Cărucioare 3 în 1", "carucior 3 in 1", r"^(.{0,12})carucior\b", r"\b3 in 1\b", r"\b(papusi|papusa|jucari\w*|husa)\b", 500, accesorii=False),
    C("copii", "scaun-auto-copii", "Scaune auto pentru copii", "scaun auto copii", r"^(.{0,12})scaun auto\b", None, None, 200),
    # ── Jucarii (05.11.2026: primele clicuri din Bing vin pe jucarii, iar pana la Craciun cererea creste) ──
    C("jucarii-copii", "seturi-lego", "Seturi LEGO", "lego set", r"\blego\b", None, r"\b(compatibil\w*|tip lego|depozitare|cutie de|recreate|carte|carti)\b", 30, accesorii=False),
    C("jucarii-copii", "puzzle-1000-piese", "Puzzle de 1000 de piese", "puzzle 1000 piese", r"^(.{0,25})\bpuzzle\b", r"(?<!\d)1\.?000\s*(de\s*)?(piese|pcs|pc)\b", r"\b(rama|lipici|covor|mapa|organizator)\b", 20, accesorii=False),
    C("jucarii-copii", "puzzle-500-piese", "Puzzle de 500 de piese", "puzzle 500 piese", r"^(.{0,25})\bpuzzle\b", r"(?<!\d)500\s*(de\s*)?(piese|pcs|pc)\b", r"\b(rama|lipici|covor|mapa|organizator)\b", 15, accesorii=False),
    C("jucarii-copii", "puzzle-3d", "Puzzle 3D", "puzzle 3d", r"^(.{0,25})\bpuzzle\b", r"\b3d\b", r"\bjoc logic\b", 15, accesorii=False),
    C("jucarii-copii", "masina-cu-telecomanda", "Mașini cu telecomandă", "masina cu telecomanda", r"^(.{0,20})\b(masina|masinuta)\b", r"\b(telecomanda|teleghidat\w*|rc)\b", r"\b(de spalat|de cusut|de tuns|de gaurit|de cafea|cheie|husa|masina electrica|masinuta electrica|\d+\s*v)\b", 40, accesorii=False),
    C("jucarii-copii", "masinuta-electrica-copii", "Mașinuțe electrice pentru copii", "masinuta electrica copii", r"^(.{0,20})\b(masina|masinuta)\b", r"\bmasinuta electrica\b|\bmasina electrica\b.*\bcopii\b|\bcopii\b.*\bmasina electrica\b", r"\b(de schimb|husa|acumulator pentru)\b", 300, accesorii=False),
    C("jucarii-copii", "jucarii-montessori", "Jucării Montessori", "jucarie montessori", r"^(.{0,30})\b(jucari\w*|set|cub|turn|tabla|labirint|puzzle|sortator)\b", r"\bmontessori\b", r"\b(carte|carti|caiet|mobilier|patut|raft|masuta|scaun)\b", 20, accesorii=False),
    C("jucarii-copii", "papusa-barbie", "Păpuși Barbie", "papusa barbie", r"^(.{0,15})\bpapus[ai]\b", r"\bbarbie\b", r"\b(haine|accesorii|tip|similar\w*)\b", 30, accesorii=False),
    C("jucarii-copii", "joc-de-societate", "Jocuri de societate", "joc de societate", r"^(.{0,12})\bjoc(ul)?\b", r"\bde societate\b", r"\bextensie\b", 30, accesorii=False),
    C("jucarii-copii", "trenulet-electric", "Trenulețe electrice", "trenulet electric", r"^(.{0,12})\b(tren|trenulet)\b", r"\belectric\b", None, 50, accesorii=False),
    C("jucarii-copii", "bucatarie-copii", "Bucătării de jucărie", "bucatarie copii jucarie", r"^(.{0,15})\bbucatari[ae]\b", r"\b(copii|jucarie|fetite)\b", None, 80, accesorii=False),
    C("jucarii-copii", "tricicleta-copii", "Triciclete pentru copii", "tricicleta copii", r"^(.{0,12})\btricicleta\b", None, r"\b(husa|cos|sonerie|electric\w*|adulti)\b", 100, accesorii=False),
    C("jucarii-copii", "bicicleta-copii-16-inch", "Biciclete pentru copii de 16 inch", "bicicleta copii 16 inch", r"^(.{0,12})\bbicicleta\b", r"(?<![\d.,])16\s*inch\b", r"\b(electric\w*|adulti|casca)\b", 250, accesorii=False),
    C("jucarii-copii", "sanie-copii", "Sănii pentru copii", "sanie copii", r"^(.{0,12})\bsanie\b", None, None, 40, accesorii=False),
    # ── Craciun ──
    C("craciun", "brad-artificial-150-cm", "Brazi artificiali de 150 cm", "brad artificial 150 cm", r"^(.{0,20})\bbrad\b", r"(?<!\d)150\s*cm\b", r"\b(globuri|ornament\w*|decoratiun\w*|suport|mini)\b", 50, accesorii=False),
    C("craciun", "brad-artificial-180-cm", "Brazi artificiali de 180 cm", "brad artificial 180 cm", r"^(.{0,20})\bbrad\b", r"(?<!\d)180\s*cm\b", r"\b(globuri|ornament\w*|decoratiun\w*|suport|mini)\b", 60, accesorii=False),
    C("craciun", "brad-artificial-210-cm", "Brazi artificiali de 210 cm", "brad artificial 210 cm", r"^(.{0,20})\bbrad\b", r"(?<!\d)210\s*cm\b", r"\b(globuri|ornament\w*|decoratiun\w*|suport|mini)\b", 80, accesorii=False),
    # ── Incalzire ──
    C("incalzire", "radiator-electric-ulei", "Radiatoare electrice cu ulei", "radiator electric ulei", r"^(.{0,20})\bradiator\b", r"\belectric\b.*\bulei\b|\bulei\b.*\belectric\b|\bulei\b.*\belement\w*\b", r"\b(potrivit|auto|masina|capac)\b", 100, accesorii=False),
    C("incalzire", "aeroterma", "Aeroterme", "aeroterma", r"^(.{0,12})\baeroterma\b", None, r"\b(auto|masina|12\s*v)\b", 50, accesorii=False),
    C("incalzire", "convector-electric", "Convectoare electrice", "convector electric", r"^(.{0,12})\bconvector\b", r"\belectric\b", None, 100, accesorii=False),
    C("incalzire", "panou-radiant", "Panouri radiante", "panou radiant", r"^(.{0,12})\bpanou\b", r"\b(radiant|infrarosu)\b", None, 100, accesorii=False),
    # ── Animale ──
    C("animale", "hrana-uscata-caini", "Hrană uscată pentru câini", "hrana uscata caini", r"\bhrana\b", r"\buscata\b.*\bcaini\b|\bcaini\b.*\buscata\b", None, 40, accesorii=False),
    C("animale", "hrana-uscata-pisici", "Hrană uscată pentru pisici", "hrana uscata pisici", r"\bhrana\b", r"\buscata\b.*\bpisici\b|\bpisici\b.*\buscata\b", None, 40, accesorii=False),
    # ── Bijuterii ──
    C("bijuterii", "inel-argint", "Inele din argint", "inel argint 925", r"^(.{0,12})\binel\b", r"\bargint\b", r"\b(placat|culoare argintie)\b", 40, accesorii=False),
    C("bijuterii", "cercei-argint", "Cercei din argint", "cercei argint 925", r"^(.{0,12})\bcercei\b", r"\bargint\b", r"\b(placat|culoare argintie)\b", 40, accesorii=False),
    C("bijuterii", "colier-argint", "Coliere din argint", "colier argint 925", r"^(.{0,12})\b(colier|lantisor)\b", r"\bargint\b", r"\b(placat|culoare argintie)\b", 40, accesorii=False),
    # ── Sport ──
    C("sport", "banda-de-alergare", "Benzi de alergare", "banda de alergare", r"\bbanda de alergare\b", None, r"\b(covor|ulei|lubrifiant|curea)\b", 500),
    C("sport", "bicicleta-fitness", "Biciclete de fitness", "bicicleta fitness", r"^(.{0,12})bicicleta\b", r"\b(fitness|stationara|spinning)\b", None, 300),
    C("sport", "gantere-reglabile", "Gantere reglabile", "gantere reglabile", r"\bgantere?\b", r"\breglabil\w*\b", None, 100, accesorii=False),
    # ── Carti ──
    C("carti", "carti-de-colorat", "Cărți de colorat", "carte de colorat", r"\bcarti? de colorat\b", None, r"\b(creioane|set de|markere)\b", 10, accesorii=False),
    C("carti", "dictionar-englez-roman", "Dicționare englez-român", "dictionar englez roman", r"\bdictionar\b", r"\bengle\w*\b", None, 15, accesorii=False),
    # ── Tech diverse ──
    C("power-bank", "power-bank-10000-mah", "Baterii externe de 10.000 mAh", "baterie externa 10000 mah", r"\b(power ?bank|baterie externa|acumulator extern)\b", r"(?<!\d)10[ .]?000\s*mah\b", None, 40, accesorii=False),
    C("power-bank", "power-bank-20000-mah", "Baterii externe de 20.000 mAh", "baterie externa 20000 mah", r"\b(power ?bank|baterie externa|acumulator extern)\b", r"(?<!\d)20[ .]?000\s*mah\b", None, 60, accesorii=False),
    C("componente", "ssd-1-tb", "SSD de 1 TB", "ssd 1tb", r"^(.{0,12})\bssd\b", r"(?<!\d)1\s*tb\b", r"\b(sistem|laptop|desktop|pc)\b", 150),
    C("componente", "placa-video-rtx", "Plăci video NVIDIA RTX", "placa video rtx", r"\bplaca video\b", r"\brtx\b", None, 800),
    C("drone", "drona-cu-camera", "Drone cu cameră", "drona cu camera", r"^(.{0,12})drona\b", r"\bcamera\b", r"\b(jucari\w*|copii)\b", 100),
    C("supraveghere", "camera-supraveghere-wifi", "Camere de supraveghere Wi-Fi", "camera supraveghere wifi", r"\bcamera\b.*\bsupraveghere\b", r"\b(wifi|wi-fi|wireless)\b", None, 60),
]
DUPA_SLUG = {c["slug"]: c for c in CRITERII}
NUME_TEME = {
    "masini-de-spalat": "Mașini de spălat", "masini-de-spalat-vase": "Mașini de spălat vase", "friteuze": "Friteuze cu aer cald",
    "televizoare": "Televizoare", "cafetiere": "Espressoare", "laptopuri": "Laptopuri", "telefoane": "Telefoane", "monitoare": "Monitoare",
    "tablete": "Tablete", "aspiratoare-robot": "Aspiratoare robot", "aspiratoare-fara-fir": "Aspiratoare", "aer-conditionat": "Aer condiționat",
    "saltele": "Saltele", "frigidere": "Frigidere", "roboti-de-bucatarie": "Roboți de bucătărie", "cuptoare": "Cuptoare și plite",
    "scaune-gaming": "Scaune de gaming", "scaune-birou": "Scaune de birou", "casti-wireless": "Căști wireless", "casti-gaming": "Căști de gaming",
    "boxe-bluetooth": "Boxe", "smartwatch-uri": "Smartwatch-uri", "imprimante": "Imprimante", "trotinete-electrice": "Trotinete electrice",
    "biciclete-electrice": "Biciclete electrice", "anvelope": "Anvelope", "parfumuri-barbati": "Parfumuri bărbați", "parfumuri-femei": "Parfumuri femei",
    "suplimente": "Suplimente", "cosmetice": "Cosmetice", "scule": "Scule și grădină",
    "incaltaminte": "Încălțăminte", "imbracaminte": "Îmbrăcăminte", "copii": "Copii", "jucarii-copii": "Jucării", "craciun": "Crăciun", "incalzire": "Încălzire", "animale": "Animale de companie", "bijuterii": "Bijuterii", "sport": "Sport", "carti": "Cărți",
    "power-bank": "Baterii externe", "componente": "Componente PC", "drone": "Drone", "supraveghere": "Supraveghere",
}


def se_potriveste(titlu: str, c: dict, pret: float) -> bool:
    """Titlul produsului contine caracteristica si pretul e al unui produs, nu al unei piese."""
    t = norm(titlu)
    if not re.search(c["baza"], t):
        return False
    # Pagina de „7 kg": prima capacitate din titlu e cea de spalare. „12 kg spalare, 7 kg stoarcere" nu e de 7 kg.
    kg = re.fullmatch(r"masina-de-spalat-(\d+)-kg", c["slug"])
    if kg:
        primul = re.search(r"(?<![\d.,/])(\d+)(?:[.,]\d+)?\s*kg\b", t)
        if primul and primul.group(1) != kg.group(1):
            return False
    # La parfum pretul depinde de volum: fara volum in titlu, cifra nu spune nimic.
    if c["tema"].startswith("parfum") and not re.search(r"\b\d+\s*ml\b", t):
        return False
    if c["attr"] and not re.search(c["attr"], t):
        return False
    if c["fara"] and re.search(c["fara"], t):
        return False
    if c.get("accesorii", True) and re.search(ACCESORII, t):
        return False
    if re.search(FOLOSITE, t):
        return False
    if pret < (c["pret_min"] or 0):
        return False
    if c["pret_max"] and pret > c["pret_max"]:
        return False
    return True


def aduna(produse: list, maxim: int = MAX_PRODUSE, pe_magazin: int = MAX_PE_MAGAZIN) -> list:
    """Fara dubluri si fara un singur magazin care ia toata pagina; cele mai ieftine primele."""
    vazute = set()
    pe_mag: dict = {}
    rez = []
    for p in sorted(produse, key=lambda x: x["pret"]):
        cheie = (p["magazin"], norm(p["titlu"])[:70])
        if cheie in vazute:
            continue
        vazute.add(cheie)
        if pe_mag.get(p["magazin"], 0) >= pe_magazin:
            continue
        pe_mag[p["magazin"]] = pe_mag.get(p["magazin"], 0) + 1
        rez.append(p)
        if len(rez) >= maxim:
            break
    return rez


def _pret_text(v) -> float:
    try:
        return float(str(v).replace(" ", "").replace(",", "."))
    except (TypeError, ValueError):
        return 0.0


def pret_din_pagina(html: str) -> tuple:
    """(pret, in_stoc) din datele structurate ale paginii de produs. (0, None) cand pagina nu le spune:
    atunci nu presupunem nimic. Nu cautam „lei" in text: langa pret stau rate, transport si produse similare."""
    def caut(n, adanc=0):
        if adanc > 8:
            return None
        if isinstance(n, list):
            for x in n:
                r = caut(x, adanc + 1)
                if r:
                    return r
        elif isinstance(n, dict):
            tip = n.get("@type")
            tip = " ".join(tip) if isinstance(tip, list) else str(tip or "")
            if "Product" in tip and n.get("offers"):
                o = n["offers"]
                o = o[0] if isinstance(o, list) and o else o
                if isinstance(o, dict):
                    pret = _pret_text(o.get("price") or o.get("lowPrice"))
                    if pret > 0:
                        disp = str(o.get("availability") or "").lower()
                        return pret, (False if "outofstock" in disp or "soldout" in disp or "discontinued" in disp else (True if disp else None))
            for k in ("@graph", "mainEntity", "mainEntityOfPage"):
                r = caut(n.get(k), adanc + 1)
                if r:
                    return r
        return None

    for bloc in re.findall(r'<script[^>]+application/ld\+json[^>]*>([\s\S]*?)</script>', html, re.I):
        try:
            r = caut(json.loads(bloc.strip(), strict=False))
        except ValueError:
            # JSON stricat de magazin: citim doar din blocul produsului, nu din toata pagina.
            r = None
            if re.search(r'"@type"\s*:\s*"Product"', bloc):
                g = re.search(r'"(?:price|lowPrice)"\s*:\s*"?([\d.,]+)', bloc)
                if g and _pret_text(g.group(1)) > 0:
                    disp = re.search(r'"availability"\s*:\s*"([^"]+)"', bloc)
                    d = disp.group(1).lower() if disp else ""
                    r = _pret_text(g.group(1)), (False if "outofstock" in d or "soldout" in d or "discontinued" in d else (True if d else None))
        if r:
            return r
    for tipar in (r'<meta[^>]+(?:property|name)="(?:product|og):price:amount"[^>]+content="([\d.,]+)"',
                  r'<meta[^>]+content="([\d.,]+)"[^>]+(?:property|name)="(?:product|og):price:amount"',
                  r'itemprop="price"[^>]+content="([\d.,]+)"'):
        g = re.search(tipar, html, re.I)
        if g and _pret_text(g.group(1)) > 0:
            return _pret_text(g.group(1)), None
    return 0.0, None


def _gazda(u: str) -> str:
    return re.sub(r"^www\.", "", urlsplit(u).netloc.lower())


def _coada(u: str) -> str:
    parti = [s for s in unquote(urlsplit(u).path).lower().split("/") if s]
    return re.sub(r"\.(html?|php|aspx)$", "", parti[-1]) if parti else ""


def _jetoane(t: str) -> set:
    return {x for x in re.findall(r"[a-z0-9]+", norm(t)) if len(x) > 2}


def alt_produs(ceruta: str, final: str, titlu: str, html: str) -> bool:
    """Adresa a dus la alta pagina. Un produs redenumit isi pastreaza numele (afisport: Devron 52562 -> Prophete 52562); categoria sau alt
    produs nu. Fara asta, cel mai mic pret din categorie trecea drept pretul produsului (babyneeds: bicicleta de ~600 lei, 61,99 lei)."""
    if not ceruta or not titlu or _coada(ceruta) == _coada(final):
        return False
    pe_pagina = set()
    for g in re.findall(r'"name"\s*:\s*"([^"]{3,250})"', html) + re.findall(r'property="og:title"[^>]+content="([^"]+)"', html, re.I) + re.findall(r"<title[^>]*>([^<]+)</title>", html, re.I):
        pe_pagina |= _jetoane(g)
    dorit = _jetoane(titlu)
    return len(dorit & pe_pagina) / max(1, len(dorit)) < 0.5


def stare_magazin(status: int, final: str, html: str, ceruta: str = "", titlu: str = "") -> dict:
    """Ce am aflat de pe pagina produsului. `sters`: pagina nu mai exista. Blocat sau eroare de server: nu stim, deci nu atingem."""
    # Alt domeniu = pagina de CAPTCHA sau de protectie (evomag -> captcha.distinct.ro/). Spune ca am citit prea mult, nu ca produsul a disparut.
    if ceruta and _gazda(final) != _gazda(ceruta):
        return {}
    if status in (404, 410) or (status == 200 and urlsplit(final).path.strip("/") == ""):
        return {"sters": True}
    if status != 200:
        return {}
    if alt_produs(ceruta, final, titlu, html):
        return {"sters": True}
    pret, stoc = pret_din_pagina(html)
    if stoc is False:
        return {"sters": True}
    return {"pret": pret} if pret > 0 else {"citit": True}


def aplica_verificare(p: dict, v: dict, azi: str):
    """Produsul dupa verificare, sau None daca trebuie scos. Pretul din pagina e cel adevarat, nu cel din feed."""
    if v.get("sters"):
        return None
    # De trei ori mai mult sau mai putin decat stiam: nu e o reducere, e alt produs sau o eroare. Nu confirmam, verificam din nou.
    if v.get("pret") and p.get("pret") and not (p["pret"] / 3 <= v["pret"] <= p["pret"] * 3):
        return {k: w for k, w in p.items() if k != "verificat"}
    if v.get("pret"):
        nou = dict(p, pret=round(v["pret"], 2), verificat=v.get("data", azi))
        if nou.get("pret_vechi") and not (nou["pret"] < nou["pret_vechi"] <= nou["pret"] * 3):
            nou["pret_vechi"] = None
        return nou
    # Pagina s-a citit, dar nu spune pretul (de obicei produsul nu mai e acolo): nu mai trece drept confirmat.
    nou = dict(p)
    nou.pop("verificat", None)
    return nou


def titlu_curat(t: str) -> str:
    """Fara caractere invizibile si fara textul alternativ lipit de titlu („Imagine produs Friteuza...")."""
    return re.sub(r"^imagine produs\s+", "", re.sub(r"[\u200b-\u200d\ufeff]", "", t or ""), flags=re.I).strip()


def adresa_magazin(p: dict) -> str:
    """Adresa directa a produsului; la produsele vechi se ia din linkul de afiliere (`redirect_to`)."""
    if p.get("url_magazin"):
        return p["url_magazin"]
    g = re.search(r"[?&]redirect_to=([^&]+)", p.get("url") or "")
    return unquote(g.group(1)) if g else ""


def confirmat(p: dict, azi: str) -> bool:
    """Pretul a fost citit de pe pagina magazinului in ultimele ZILE_VALABIL zile."""
    limita = (datetime.strptime(azi, "%Y-%m-%d") - timedelta(days=ZILE_VALABIL)).strftime("%Y-%m-%d")
    return bool(p.get("verificat")) and p["verificat"] >= limita


def aprobate() -> dict:
    if not os.path.exists(APROBATE):
        return {}
    try:
        return json.load(io.open(APROBATE, encoding="utf-8")).get("aprobate", {})
    except ValueError:
        return {}


def imparte(lista: list, azi: str, aprobat: dict) -> tuple:
    """(public, in_asteptare). Public = pagini aprobate, cu cel putin MIN_PRODUSE produse confirmate; doar produsele confirmate."""
    public, asteapta = [], []
    for x in lista:
        bune = sorted((p for p in x["produse"] if confirmat(p, azi)), key=lambda q: q["pret"])
        rand = {"slug": x["slug"], "confirmate": len(bune), "candidati": len(x["produse"])}
        if x["slug"] in aprobat and len(bune) >= MIN_PRODUSE:
            public.append(dict(x, produse=bune, publicat=True, magazine=sorted({p["magazin"] for p in bune})))
        else:
            rand["motiv"] = "neaprobata" if x["slug"] not in aprobat else f"sub {MIN_PRODUSE} produse confirmate"
            asteapta.append(rand)
    return public, asteapta


def verifica_la_magazine(lista: list, azi: str) -> None:
    """Citeste cate BUGET_VERIFICARI pagini de produs, cele mai vechi intai, cu pauza pe fiecare magazin. Modifica `lista`."""
    import requests
    from collections import defaultdict
    from concurrent.futures import ThreadPoolExecutor

    cache = {}
    if os.path.exists(VERIFICARI):
        try:
            cache = json.load(io.open(VERIFICARI, encoding="utf-8"))
        except ValueError:
            cache = {}
    limita = (datetime.now(timezone.utc) - timedelta(days=ZILE_VERIFICARE)).strftime("%Y-%m-%d")
    toate = {p["url_magazin"]: p for x in lista for p in x["produse"] if p.get("url_magazin")}
    de_citit = [u for u in toate if (cache.get(u) or {}).get("data", "") < limita]
    de_citit.sort(key=lambda u: (cache.get(u) or {}).get("data", ""))
    de_citit = de_citit[:BUGET_VERIFICARI]
    pe_gazda = defaultdict(list)
    for u in de_citit:
        pe_gazda[re.sub(r"^https?://", "", u).split("/")[0]].append(u)

    def gazda(adrese):
        for u in adrese:
            r = None
            try:
                r = requests.get(u, headers=UA_MAGAZIN, timeout=15, allow_redirects=True)
                v = stare_magazin(r.status_code, r.url, r.text[:3_000_000], u, toate[u].get("titlu") or "")
            except requests.RequestException:
                v = {}
            if r is not None and (r.status_code == 429 or _gazda(r.url) != _gazda(u)):
                break  # magazinul cere pauza sau CAPTCHA: restul la rularea urmatoare
            if v:
                cache[u] = dict(v, data=azi)
            time.sleep(1.0)

    with ThreadPoolExecutor(8) as ex:
        list(ex.map(gazda, pe_gazda.values()))

    # Mai multe produse pe aceeasi pagina = variante (fragranza: 30 ml, 50 ml, 100 ml). Pretul din pagina e al uneia, nu stim care.
    baze: dict = {}
    for u in toate:
        baze.setdefault(u.split("#")[0], set()).add(u)
    scoase = corectate = 0
    for x in lista:
        noi = []
        for p in x["produse"]:
            v = cache.get(p.get("url_magazin") or "")
            if v and v.get("pret") and len(baze.get((p.get("url_magazin") or "").split("#")[0], ())) > 1:
                v = {"citit": True}
            q = aplica_verificare(p, v, azi) if v else {k: w for k, w in p.items() if k != "verificat"}  # fara dovada in memorie, nu e confirmat
            if q is None:
                scoase += 1
                continue
            corectate += int(abs(q["pret"] - p["pret"]) >= 0.01)
            noi.append(q)
        x["produse"] = sorted(noi, key=lambda q: q["pret"])
    io.open(VERIFICARI, "w", encoding="utf-8", newline="").write(json.dumps({u: v for u, v in cache.items() if u in toate}, ensure_ascii=False, indent=0))
    print(f"Pagini de magazin citite: {len(de_citit)}; preturi corectate: {corectate}; produse scoase: {scoase}.")


class BugetEpuizat(Exception):
    pass


def ruleaza() -> int:
    import fetch_product_feeds as fpf

    fpf.ASTEPTARE_MAXIMA_429 = 90  # nu tinem pipeline-ul pe loc: criteriile raman pentru rularea urmatoare
    # Fara API (limita 429 sau fara credentiale) nu se cauta produse noi, dar regulile si verificarea la magazine merg oricum.
    conectat = "--fara-api" not in sys.argv and bool(fpf.AFFILIATE_EMAIL and fpf.AFFILIATE_PASS) and fpf.sign_in()
    if not conectat:
        print("Fara API 2Performant: raman produsele stiute, doar le verific.")

    magazine = json.load(io.open(OUTPUT, encoding="utf-8"))
    plati = {m["magazin"]: m for m in magazine if m.get("url_afiliat") and m.get("url_afiliat") != m.get("url") and m.get("platforma") == "2performant"}
    harta = {}
    for s in plati:
        harta[s.lower()] = s
        harta[s.split(".")[0].lower()] = s

    vechi = {}
    for sursa in (STARE, IESIRE):
        if not vechi and os.path.exists(sursa):
            try:
                vechi = {c["slug"]: c for c in json.load(io.open(sursa, encoding="utf-8")).get("criterii", [])}
            except ValueError:
                vechi = {}
    for c in vechi.values():
        for p in c.get("produse", []):
            if not p.get("url_magazin"):
                p["url_magazin"] = adresa_magazin(p)
    azi = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    cereri = {"n": 0}

    def cere(endpoint, q, pagina):
        if cereri["n"] >= BUGET_CERERI:
            raise BugetEpuizat()
        cereri["n"] += 1
        d = fpf.api_get(endpoint, {"page": pagina, "filter[query]": quote_plus(q)})
        time.sleep(0.2)
        return (d or {}).get("products") or [] if isinstance(d, dict) else []

    def slug_magazin(camp) -> str:
        nume = (camp or {}).get("name") or ""
        cheie = fpf._cheie_magazin(nume)
        if not cheie or fpf._magazin_strain(cheie) or ((camp or {}).get("currency") or "RON") != "RON":
            return ""
        return harta.get(cheie) or harta.get(cheie.split(".")[0]) or ""

    def improspateaza(c: dict, feeduri_stiute: list) -> tuple:
        feeduri = list(feeduri_stiute)
        magazin_feed = {}
        if not feeduri:
            numar: dict = {}
            for pag in range(1, PAGINI_GLOBAL + 1):
                lista = cere("affiliate/product_feeds/products", c["q"], pag)
                if not lista:
                    break
                for x in lista:
                    if (x.get("affrequest") or {}).get("status") != "accepted":
                        continue
                    s = slug_magazin(x.get("campaign"))
                    if s and se_potriveste(x.get("title") or "", c, fpf._parse_price(x.get("price"))):
                        fid = x.get("product_store_id")
                        numar[fid] = numar.get(fid, 0) + 1
                        magazin_feed[fid] = s
                if sum(numar.values()) >= 40:
                    break
            feeduri = [{"id": k, "magazin": magazin_feed[k]} for k in sorted(numar, key=lambda f: -numar[f])[:MAX_FEEDURI]]
        produse = []
        for f in feeduri:
            for pag in range(1, PAGINI_FEED + 1):
                lista = cere(f"affiliate/product_feeds/{f['id']}/products", c["q"], pag)
                if not lista:
                    break
                for x in lista:
                    pret = fpf._parse_price(x.get("price"))
                    titlu = fpf.curata_titlu(x.get("title") or "")
                    url = x.get("url") or ""
                    if not url or not url.startswith("http") or x.get("active") is False or fpf.adresa_moarta(url) or not se_potriveste(titlu, c, pret):
                        continue
                    img = x.get("structured_image_urls")
                    img = list(img.values()) if isinstance(img, dict) else (img or [])
                    img = next((i for i in img if fpf.imagine_valida(i)), "")
                    if not img:
                        continue
                    vechi_p = fpf._parse_price(x.get("old_price"))
                    produse.append({"titlu": titlu[:120], "pret": round(pret, 2), "imagine": img, "url": fpf.make_afiliat_url(url), "magazin": f["magazin"],
                                    "id": str(x.get("unique_code") or x.get("id") or ""), "brand": (x.get("brand") or "")[:60], "url_magazin": url,
                                    # Pretul vechi al magazinului, doar daca e plauzibil: peste de 3 ori pretul nou e o eroare din feed.
                                    "pret_vechi": round(vechi_p, 2) if pret < vechi_p <= pret * 3 else None})
        return aduna(produse), feeduri

    ordine = sorted(CRITERII, key=lambda c: (vechi.get(c["slug"], {}).get("actualizat") or "")) if conectat else []
    rezultate = dict(vechi)
    improspatate = 0
    try:
        for c in ordine:
            stiute = vechi.get(c["slug"], {}).get("feeduri") or []
            produse, feeduri = improspateaza(c, stiute)
            intrare = {"slug": c["slug"], "tema": c["tema"], "tema_nume": NUME_TEME.get(c["tema"], c["tema"]), "titlu": c["titlu"], "nota": c["nota"],
                       "in_text": c["in_text"], "actualizat": azi, "feeduri": feeduri, "produse": produse}
            if produse or not vechi.get(c["slug"]):
                rezultate[c["slug"]] = intrare
            else:
                # Nimic azi la un criteriu care avea produse: pastram pana la VARSTA_MAXIMA_ZILE, dar reluam descoperirea.
                rezultate[c["slug"]] = dict(vechi[c["slug"]], feeduri=[])
            improspatate += 1
            print(f"  {c['slug'][:38]:38} {len(produse):3} produse  {len({p['magazin'] for p in produse})} magazine")
    except BugetEpuizat:
        print(f"  Buget de {BUGET_CERERI} cereri consumat; restul la rularea urmatoare.")

    limita = (datetime.now(timezone.utc) - timedelta(days=VARSTA_MAXIMA_ZILE)).strftime("%Y-%m-%d")
    lista = [rezultate[c["slug"]] for c in CRITERII if c["slug"] in rezultate and (rezultate[c["slug"]].get("actualizat") or "") >= limita]
    # Regulile se aplica si pe ce a ramas din rularile trecute, nu doar pe ce s-a improspatat acum.
    for x in lista:
        c = DUPA_SLUG[x["slug"]]
        for p in x["produse"]:
            p["titlu"] = titlu_curat(p["titlu"])
        x["produse"] = [p for p in x["produse"] if se_potriveste(p["titlu"], c, p["pret"]) and not fpf.adresa_moarta(p.get("url_magazin") or "")
                        and p["magazin"] not in MAGAZINE_RECONDITIONATE and p["magazin"] in plati]  # magazin iesit din program = fara comision
    verifica_la_magazine(lista, azi)
    for x in lista:
        x["magazine"] = sorted({p["magazin"] for p in x["produse"]})
    io.open(STARE, "w", encoding="utf-8", newline="").write(json.dumps({"actualizat": azi, "criterii": lista}, ensure_ascii=False, indent=0))
    public, asteapta = imparte(lista, azi, aprobate())
    io.open(IESIRE, "w", encoding="utf-8", newline="").write(json.dumps(
        {"_nota": "Generat de scripts/criterii_produse.py. Doar pagini aprobate, doar produse cu pretul confirmat pe site-ul magazinului.",
         "actualizat": azi, "criterii": public}, ensure_ascii=False, indent=0))
    print(f"Criterii: {improspatate} improspatate cu {cereri['n']} cereri; publicate {len(public)} din {len(lista)}; in asteptare {len(asteapta)}.")
    for r in asteapta:
        print(f"  in asteptare: {r['slug'][:38]:38} {r['confirmate']:3} confirmate din {r['candidati']:3} ({r['motiv']})")
    return 0


def de_aprobat() -> int:
    """Listeaza titlurile paginilor care nu sunt inca aprobate, ca sa fie citite inainte de publicare."""
    azi = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    aprobat = aprobate()
    for x in json.load(io.open(STARE, encoding="utf-8")).get("criterii", []):
        if x["slug"] in aprobat:
            continue
        bune = [p for p in x["produse"] if confirmat(p, azi)]
        if len(bune) < MIN_PRODUSE:
            continue
        print(f"\n## {x['slug']} ({len(bune)})")
        mediana = sorted(p["pret"] for p in bune)[len(bune) // 2]
        for p in sorted(bune, key=lambda q: q["pret"]):
            semn = "  <<< pret dubios, deschide pagina" if p["pret"] < mediana / 3 else ""
            print(f"  {p['pret']:>9.2f} {p['magazin'][:14]:14} {p['titlu'][:88]}{semn}")
    return 0


def aproba(sluguri: list, nota: str) -> int:
    """Trece paginile citite in lista de publicare. Nicio rulare automata nu poate publica fara acest pas."""
    azi = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    lista = aprobate()
    for s in sluguri:
        if s not in DUPA_SLUG:
            print(f"Nu exista criteriul {s}")
            return 1
        lista[s] = {"data": azi, "nota": nota}
    io.open(APROBATE, "w", encoding="utf-8", newline="").write(json.dumps(
        {"_nota": "Pagini /alege citite produs cu produs inainte de publicare. Se adauga cu: criterii_produse.py --aproba slug1,slug2",
         "aprobate": dict(sorted(lista.items()))}, ensure_ascii=False, indent=0))
    print(f"Aprobate: {len(lista)}")
    return 0


def test() -> int:
    m = DUPA_SLUG["masina-de-spalat-6-kg"]
    tv = DUPA_SLUG["televizor-55-inch"]
    fr = DUPA_SLUG["friteuza-aer-cald-5-6-litri"]
    lp = DUPA_SLUG["laptop-16-gb-ram"]
    ac = DUPA_SLUG["aer-conditionat-12000-btu"]
    sl = DUPA_SLUG["saltea-160x200"]
    an = DUPA_SLUG["anvelope-iarna-205-55-r16"]
    asteptari = [
        ("6 kg intra", se_potriveste("Masina de spalat rufe frontala slim BEKO B1WFK2604WBEE, 6 kg, 1000rpm, Clasa D", m, 1149), True),
        ("6kg lipit intra", se_potriveste("Masina de spalat rufe Candy 6kg, 1000 rpm", m, 1200), True),
        ("cu uscator 10/6 nu e 6 kg", se_potriveste("Samus Masina de spalat rufe cu uscator Samus WSDD10612IDM, 10kg / 6kg, 1200", m, 1872), False),
        ("8 kg nu e 6 kg", se_potriveste("Samus Masina de spalat rufe Samus WSED8128IDM, 8 kg, 1200 rpm", m, 1421), False),
        ("16 kg nu e 6 kg", se_potriveste("Masina de spalat rufe industriala 16 kg", m, 9000), False),
        ("piesa ieftina nu intra", se_potriveste("Furtun masina de spalat rufe 6 kg", m, 40), False),
        ("masina de spalat vase nu intra", se_potriveste("Masina de spalat vase 6 kg", m, 1500), False),
        ("televizor 55'' intra", se_potriveste("Televizor smart LG - OLED55G63LS, 55'', OLED evo, 4K, negru", tv, 9019), True),
        ("televizor 55 Inch intra", se_potriveste("Xiaomi Televizor Xiaomi TV S Pro Mini LED 55 2026, 55 Inch, 138 CM", tv, 3818), True),
        ("suport TV 14-55 nu intra", se_potriveste("Suport Engros pentru televizor, 14-55 inch", tv, 49), False),
        ("friteuza 5 litri intra", se_potriveste("Friteuza cu Aer Cald Tefal Easy Fry Max, 5 litri", fr, 539), True),
        ("friteuza de 6,2 litri nu e pe pagina de 5-6 litri", se_potriveste("Friteuză cu Aer Cald Cosori Premium II Plus, 6,2 litri", fr, 769), False),
        ("friteuza 10 litri nu intra la 5-6", se_potriveste("Friteuză cu Aer Cald Cosori Dual Blaze TwinFry, 10 litri", fr, 1219), False),
        ("memorie RAM nu e laptop", se_potriveste("Memorie RAM 16 GB ddr4, 3200 Mhz, Nelbo, pentru laptop", lp, 728), False),
        ("laptop 16 GB intra", se_potriveste("Laptop de gaming ASUS TUF Gaming A16, 16 inch, Ryzen 7, 16 GB RAM", lp, 5469), True),
        ("aer conditionat 12000 intra", se_potriveste("Aer Conditionat Midea Xtreme Fresh 12000 BTU MSAGBU-12HRFN8", ac, 1575), True),
        ("multisplit 2x9000+12000 nu intra", se_potriveste("Aparat Aer conditionat triplu split Ariston Prios 80 XD0 2 x 9000 + 12000 BTU", ac, 6100), False),
        ("saltea 160x200 intra", se_potriveste("Saltea de pat cu Arcuri Pocket, 160x200 - Ergomed Memory Line", sl, 1429), True),
        ("saltea 160 x 200 intra", se_potriveste("Saltea Ortopedica 160 x 200 cm", sl, 1429), True),
        ("topper nu intra", se_potriveste("Saltea topper 160x200", sl, 500), False),
        ("anvelopa iarna 205/55 R16 intra", se_potriveste("Anvelopa iarna Kumho 205/55 R16 91H", an, 300), True),
        ("anvelopa vara nu intra", se_potriveste("Anvelopa vara Kumho 205/55 R16 91H", an, 300), False),
        ("stick USB nu e telefon", se_potriveste("Stick USB 256 GB, USB 3.0 + Type-C, pentru telefon", DUPA_SLUG["telefon-256-gb"], 489), False),
        ("telefonul intra", se_potriveste("VIVO Telefon mobil vivo V70 Lite 5G Dual Sim, 256 GB", DUPA_SLUG["telefon-256-gb"], 1843), True),
        ("instalarea nu e aparat", se_potriveste("Instalare Aer conditionat, 3-5 zile lucratoare, 24000 BTU", DUPA_SLUG["aer-conditionat-24000-btu"], 1050), False),
        ("unitatea interna nu e aparat", se_potriveste("BOSCH Unitate interna aparat de aer conditionat multisplit, 18000 BTU", DUPA_SLUG["aer-conditionat-18000-btu"], 1097), False),
        ("multisplit nu e aparat", se_potriveste("Aparat Aer conditionat multisplit Ariston, 9000 BTU", DUPA_SLUG["aer-conditionat-9000-btu"], 10041), False),
        ("farfuria nu e cuptor", se_potriveste("Farfurie 31.5cm cuptor cu microunde Gorenje", DUPA_SLUG["cuptor-cu-microunde"], 162), False),
        ("recipientul nu e robot", se_potriveste("Recipient pentru robot de bucatarie Ninja", DUPA_SLUG["robot-de-bucatarie"], 177), False),
        ("rujul nu e parfum", se_potriveste("Yves Saint Laurent Rouge Pur Couture The Slim ruj mat, Libre", DUPA_SLUG["parfum-ysl-libre"], 270), False),
        ("parfumul Libre intra", se_potriveste("Yves Saint Laurent Libre Eau de Parfum pentru femei, 50 ml", DUPA_SLUG["parfum-ysl-libre"], 500), True),
        ("calculatorul nu e SSD", se_potriveste("Sistem Brand Apple Mac Mini 2026 Apple M6, SSD 1 TB", DUPA_SLUG["ssd-1-tb"], 10619), False),
        ("SSD-ul intra", se_potriveste("SSD extern Corsair EX300U, 1 TB, USB 3.2", DUPA_SLUG["ssd-1-tb"], 910), True),
        ("laptopul second hand nu intra", se_potriveste("Laptop Second Hand Toshiba Dynabook, Intel Core i7", DUPA_SLUG["laptop-intel-core-i7"], 1529), False),
        ("laptopul refurbished nu intra", se_potriveste("Laptop refurbished DELL Vostro 5410, Intel Core i7", DUPA_SLUG["laptop-intel-core-i7"], 2800), False),
        ("resigilatul nu intra", se_potriveste("RESIGILAT - Scaun ergonomic de lucru din mesh", DUPA_SLUG["scaun-birou-ergonomic"], 266), False),
        ("deodorantul nu e parfum", se_potriveste("Dior Sauvage deospray barbati, 150 ml", DUPA_SLUG["parfum-dior-sauvage"], 187), False),
        ("salteaua superioara nu e saltea", se_potriveste("SALTEA superioara 140x200 cm din Memory Foam, 5 cm", DUPA_SLUG["saltea-140x200"], 825), False),
        ("pret din JSON-LD", pret_din_pagina('<script type="application/ld+json">{"@type":"Product","offers":{"@type":"Offer","price":"4790.00","availability":"https://schema.org/InStock"}}</script>'), (4790.0, True)),
        ("pret din @graph si oferte in lista", pret_din_pagina('<script type="application/ld+json">{"@graph":[{"@type":"WebPage"},{"@type":["Product"],"offers":[{"price":1999}]}]}</script>'), (1999.0, None)),
        ("stoc epuizat", pret_din_pagina('<script type="application/ld+json">{"@type":"Product","offers":{"price":"10","availability":"http://schema.org/OutOfStock"}}</script>'), (10.0, False)),
        ("pret din meta", pret_din_pagina('<meta property="product:price:amount" content="1234.50">'), (1234.5, None)),
        ("pagina fara date: nu presupunem", pret_din_pagina("<p>1.200 lei, rate 100 lei</p>"), (0.0, None)),
        ("JSON stricat nu rupe", pret_din_pagina('<script type="application/ld+json">{stricat</script>'), (0.0, None)),
        ("404 scoate produsul", stare_magazin(404, "https://a.ro/p", ""), {"sters": True}),
        ("trimis pe prima pagina = disparut", stare_magazin(200, "https://a.ro/", "<html>"), {"sters": True}),
        ("blocat de magazin: nu stim", stare_magazin(403, "https://a.ro/p", ""), {}),
        ("eroare de server: nu stim", stare_magazin(522, "https://a.ro/p", ""), {}),
        ("stoc epuizat scoate produsul", stare_magazin(200, "https://a.ro/p", '<script type="application/ld+json">{"@type":"Product","offers":{"price":"10","availability":"OutOfStock"}}</script>'), {"sters": True}),
        ("pretul de pe site inlocuieste feed-ul", aplica_verificare({"pret": 3990, "pret_vechi": None}, {"pret": 4790.0, "data": "2026-11-04"}, "2026-11-04"), {"pret": 4790.0, "pret_vechi": None, "verificat": "2026-11-04"}),
        ("pretul vechi mai mic decat cel nou iese", aplica_verificare({"pret": 3990, "pret_vechi": 4500}, {"pret": 4790.0}, "2026-11-04")["pret_vechi"], None),
        ("verificarea care scoate", aplica_verificare({"pret": 1}, {"sters": True}, "2026-11-04"), None),
        ("JSON cu caracter de control in text: pretul se citeste", pret_din_pagina('<script type="application/ld+json">{"@type":"Product","description":"a\nb","offers":{"price":"1316.99","priceCurrency":"RON"}}</script>'), (1316.99, None)),
        ("JSON stricat: pretul se ia din blocul produsului", pret_din_pagina('<script type="application/ld+json">{"@type":"Product","name":"a"b","offers":{"price":"32.50"}}</script>'), (32.5, None)),
        ("JSON stricat, stoc epuizat", pret_din_pagina('<script type="application/ld+json">{"@type":"Product","name":"a"b","offers":{"price":"32.50","availability":"https://schema.org/OutOfStock"}}</script>'), (32.5, False)),
        ("pagina citita fara pret nu mai e confirmata", "verificat" in aplica_verificare({"pret": 1, "verificat": "2026-11-01"}, {"citit": True}, "2026-11-04"), False),
        ("adresa directa din linkul de afiliere", adresa_magazin({"url": "https://event.2performant.com/events/click?a=1&redirect_to=https%3A%2F%2Fa.ro%2Fp%3Fx%3D1"}), "https://a.ro/p?x=1"),
        ("adresa existenta ramane", adresa_magazin({"url_magazin": "https://b.ro/p", "url": "x?redirect_to=y"}), "https://b.ro/p"),
        ("pret confirmat recent", confirmat({"verificat": "2026-11-01"}, "2026-11-04"), True),
        ("pret confirmat prea demult", confirmat({"verificat": "2026-10-01"}, "2026-11-04"), False),
        ("fara dovada nu e confirmat", confirmat({"pret": 1}, "2026-11-04"), False),
        ("pagina neaprobata nu apare, oricate produse ar avea", imparte([{"slug": "x", "produse": [{"pret": i, "magazin": "a", "verificat": "2026-11-04"} for i in range(9)]}], "2026-11-04", {})[0], []),
        ("pagina aprobata sub prag nu apare", imparte([{"slug": "x", "produse": [{"pret": i, "magazin": "a", "verificat": "2026-11-04"} for i in range(3)] + [{"pret": 9, "magazin": "a"}]}], "2026-11-04", {"x": {}})[0], []),
        ("pe pagina aprobata intra doar produsele confirmate", len(imparte([{"slug": "x", "produse": [{"pret": i, "magazin": "a", "verificat": "2026-11-04"} for i in range(4)] + [{"pret": 9, "magazin": "a"}]}], "2026-11-04", {"x": {}})[0][0]["produse"]), 4),
        ("12 kg spalare nu e pe pagina de 7 kg", se_potriveste("Masina de spalat rufe semi-automata Nobeltek NSWM 12.7S, 12 kg spalare, 7 kg stoarcere", DUPA_SLUG["masina-de-spalat-7-kg"], 1251), False),
        ("7 kg spalare ramane pe pagina de 7 kg", se_potriveste("Masina de spalat rufe semi-automata Nobeltek NSWM 7.3B, 7 kg spalare, 3 kg stoarcere", DUPA_SLUG["masina-de-spalat-7-kg"], 885), True),
        ("4,7 litri nu e 3-4 litri", se_potriveste("Friteuza cu aer cald HAEGER MAGIC WINDOW, 1200W, Capacitate 4.7L", DUPA_SLUG["friteuza-aer-cald-3-4-litri"], 299), False),
        ("3,5 litri e 3-4 litri", se_potriveste("Friteuza cu aer cald, Salente AirFit, 1500 W, 3,5 l", DUPA_SLUG["friteuza-aer-cald-3-4-litri"], 310), True),
        ("7 litri nu e 8 litri sau mai mare", se_potriveste("Friteuza cu aer cald AIWA AFR-7000, 7 L, 1800W", DUPA_SLUG["friteuza-aer-cald-8-litri"], 412), False),
        ("presa pentru mixer nu e mixer", se_potriveste("Presa pentru role Smeg - SMPR01, pentru mixer planetar", DUPA_SLUG["mixer-planetar"], 544), False),
        ("castile antifonice de bebe nu sunt ANC", se_potriveste("Casti Antifonice 2 in 1 Pentru Bebe si Copii 3-48 luni, anulare zgomot", DUPA_SLUG["casti-anulare-zgomot"], 102), False),
        ("microfonul cu anulare nu e ANC", se_potriveste("Casti Stereo Logitech H390, USB-C, Microfon cu anulare zgomot", DUPA_SLUG["casti-anulare-zgomot"], 200), False),
        ("ANC ramane", se_potriveste("Casti Stereo Wireless Acefast H9, Bluetooth, A2DP, ANC, Gri", DUPA_SLUG["casti-anulare-zgomot"], 118), True),
        ("serul de par nu e ser cu retinol pentru ten", se_potriveste("Ser de par cu argan, Retinol Complex, Cristale Lichide, 50ml", DUPA_SLUG["ser-retinol"], 72), False),
        ("bormasina fara acumulator iese", se_potriveste("Masina de gaurit Bormasina 20V 1/4 pentru Rigips - fara acumulator", DUPA_SLUG["bormasina-cu-acumulator"], 341), False),
        ("Eau Sauvage e alt parfum", se_potriveste("Christian Dior Eau Sauvage eau de Toilette pentru barbati 100 ml", DUPA_SLUG["parfum-dior-sauvage"], 544), False),
        ("parfum fara volum in titlu iese", se_potriveste("DIOR Sauvage Eau de Toilette pentru barbati", DUPA_SLUG["parfum-dior-sauvage"], 919), False),
        ("parfum cu volum ramane", se_potriveste("Christian Dior Sauvage Apa de toaleta, 100 ml", DUPA_SLUG["parfum-dior-sauvage"], 507), True),
        ("10000 de piese nu e 1000", se_potriveste("Puzzle Clementoni 10000 piese", DUPA_SLUG["puzzle-1000-piese"], 200), False),
        ("puzzle 1000 intra", se_potriveste("PUZZLE ORIGAMI, 1000 PIESE", DUPA_SLUG["puzzle-1000-piese"], 92), True),
        ("cartea LEGO nu e set", se_potriveste("LEGO Recreate - Spatiu", DUPA_SLUG["seturi-lego"], 54), False),
        ("masina de spalat cu telecomanda nu e jucarie", se_potriveste("Masina de spalat vase cu telecomanda", DUPA_SLUG["masina-cu-telecomanda"], 900), False),
        ("masina cu telecomanda intra", se_potriveste("Masina cu telecomanda RC Timebox, 30km/h, 1:20, Drift car", DUPA_SLUG["masina-cu-telecomanda"], 140), True),
        ("masina de tocat electrica nu e masinuta", se_potriveste("Masina de tocat electrica pentru bucatarie copii", DUPA_SLUG["masinuta-electrica-copii"], 400), False),
        ("masinuta electrica intra", se_potriveste("Masinuta electrica pentru copii tip Jeep Wrangler, 4x4", DUPA_SLUG["masinuta-electrica-copii"], 1700), True),
        ("papusa tip Barbie nu e Barbie", se_potriveste("Papusa tip Barbie cu accesorii de plaja", DUPA_SLUG["papusa-barbie"], 40), False),
        ("radiatorul de masina nu e calorifer", se_potriveste("Radiator ulei potrivit HYUNDAI IONIQ 1.6H Electric 2016-2022", DUPA_SLUG["radiator-electric-ulei"], 457), False),
        ("radiatorul electric intra", se_potriveste("Radiator Electric, Well, Portabil, cu Ulei, 13 Elementi, 2500 W", DUPA_SLUG["radiator-electric-ulei"], 346), True),
        ("brad de 1800 cm nu e de 180", se_potriveste("Brad artificial 1180 cm", DUPA_SLUG["brad-artificial-180-cm"], 500), False),
        ("globurile nu sunt brad", se_potriveste("Brad decoratiuni si globuri, 180 cm", DUPA_SLUG["brad-artificial-180-cm"], 100), False),
        ("bradul de 180 cm intra", se_potriveste("Brad artificial de Craciun Alpin, verde, 3D, 180 cm", DUPA_SLUG["brad-artificial-180-cm"], 680), True),
        ("bicicleta de 20 inch nu e de 16", se_potriveste("Bicicleta copii 20 inch", DUPA_SLUG["bicicleta-copii-16-inch"], 600), False),
        ("tricicleta electrica pentru adulti nu intra", se_potriveste("Tricicleta electrica adulti 500W", DUPA_SLUG["tricicleta-copii"], 3000), False),
        ("CAPTCHA pe alt domeniu: nu stim, nu stergem", stare_magazin(200, "http://captcha.distinct.ro/?original_url=x", "<title>Distinct Captcha</title>", "https://www.evomag.ro/casti-x", "Casti Monster N-Tune"), {}),
        ("www in plus nu e alt domeniu", stare_magazin(200, "https://a.ro/p", '<meta property="product:price:amount" content="10">', "https://www.a.ro/p", "Produs"), {"pret": 10.0}),
        ("categoria nu confirma produsul", stare_magazin(200, "https://www.babyneeds.ro/plimbare-relaxare/", '<title>Plimbare si relaxare</title><script type="application/ld+json">{"@type":"Product","name":"Plimbare","offers":{"lowPrice":"61.99","highPrice":"1789"}}</script>', "https://www.babyneeds.ro/bicicleta-dino-little-heart.html", "Bicicleta copii, Dino Bikes, Little Heart, Roti ajutatoare"), {"sters": True}),
        ("produsul redenumit ramane", stare_magazin(200, "https://afisport.ro/bicicleta-electrica-prophete-52562-28-inch-m-gri.html", '<title>Bicicleta electrica Prophete 52562 28 inch M gri</title><meta property="product:price:amount" content="2990">', "https://afisport.ro/bicicleta-electrica-devron-52562-28-inch-m-gri.html", "Bicicleta electrica Devron 52562, 28 inch, M, gri"), {"pret": 2990.0}),
        ("adresa curatata ramane", stare_magazin(200, "https://a.ro/p/", '<meta property="product:price:amount" content="10">', "https://a.ro/p.html?utm=1", "Produs fara alt nume"), {"pret": 10.0}),
        ("pret de zece ori mai mic: neconfirmat", "verificat" in aplica_verificare({"pret": 600, "verificat": "2026-11-01"}, {"pret": 61.99}, "2026-11-04"), False),
        ("pret de zece ori mai mic: ramane cel stiut", aplica_verificare({"pret": 600}, {"pret": 61.99}, "2026-11-04")["pret"], 600),
        ("reducere mare, dar reala: confirmata", aplica_verificare({"pret": 600}, {"pret": 250.0}, "2026-11-04")["pret"], 250.0),
        ("jocul logic nu e puzzle 3D", se_potriveste("Joc logic IQ 3D Puzzle Cub natur-rosu, Fridolin", DUPA_SLUG["puzzle-3d"], 33), False),
        ("masinuta pe care se urca nu e RC", se_potriveste("Masina Electrica Cu Telecomanda Tip Jeep, 2 Motoare, 12V, Rosu", DUPA_SLUG["masina-cu-telecomanda"], 801), False),
        ("RC adevarat ramane", se_potriveste("Masina Cu Telecomanda Bmw Z4 Rosu Scara 1 La 24", DUPA_SLUG["masina-cu-telecomanda"], 117), True),
        ("extensia nu e joc complet", se_potriveste("Extensie de joc de societate Munchkin 10: Time Warp", DUPA_SLUG["joc-de-societate"], 76), False),
        ("textul lipit de titlu iese", titlu_curat("\u200bImagine produs Friteuza dubla"), "Friteuza dubla"),
        ("slug-uri unice", len(DUPA_SLUG) == len(CRITERII), True),
        ("fiecare tema are nume", [c["tema"] for c in CRITERII if c["tema"] not in NUME_TEME], []),
        ("pagina sub prag: un magazin nu ia tot", len(aduna([{"titlu": f"Produs {i}", "pret": i, "magazin": "a"} for i in range(1, 30)], 24, 8)), 8),
        ("dublurile ies", len(aduna([{"titlu": "Produs X", "pret": 2, "magazin": "a"}, {"titlu": "Produs X", "pret": 1, "magazin": "a"}])), 1),
        ("cel mai ieftin primul", aduna([{"titlu": "A", "pret": 9, "magazin": "a"}, {"titlu": "B", "pret": 3, "magazin": "b"}])[0]["titlu"], "B"),
    ]
    rau = [(n, a, e) for n, a, e in asteptari if a != e]
    for n, a, e in rau:
        print(f"  PICA  {n}: {a!r} (asteptat {e!r})")
    print("TOATE TREC" if not rau else f"{len(rau)} asteptari incalcate")
    return 1 if rau else 0


def verifica_date() -> int:
    """Datele scrise chiar respecta regulile: fiecare produs, cu titlul si pretul lui, cu link platit spre magazinul lui."""
    d = json.load(io.open(IESIRE, encoding="utf-8"))
    magazine = {m["magazin"]: m for m in json.load(io.open(OUTPUT, encoding="utf-8"))}
    rele = []
    azi = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    aprobat = aprobate()
    for x in d.get("criterii", []):
        c = DUPA_SLUG.get(x["slug"])
        if not c:
            rele.append(f"{x['slug']}: criteriu necunoscut")
            continue
        if x["slug"] not in aprobat:
            rele.append(f"{x['slug']}: pagina publica fara sa fi fost citita")
        if len(x["produse"]) < MIN_PRODUSE:
            rele.append(f"{x['slug']}: sub {MIN_PRODUSE} produse")
        for p in x["produse"]:
            nume = f"{x['slug']} / {p['titlu'][:50]}"
            if not confirmat(p, azi):
                rele.append(f"{nume}: pret neconfirmat pe site-ul magazinului")
            if not se_potriveste(p["titlu"], c, p["pret"]):
                rele.append(f"{nume}: nu respecta regula")
            if "event.2performant.com" not in p["url"] or "redirect_to=" not in p["url"]:
                rele.append(f"{nume}: link fara tracking")
            if not p["imagine"].startswith("http"):
                rele.append(f"{nume}: fara imagine")
            m = magazine.get(p["magazin"])
            if not m or not m.get("url_afiliat") or m.get("url_afiliat") == m.get("url"):
                rele.append(f"{nume}: magazin fara program ({p['magazin']})")
            v = p.get("pret_vechi")
            if v is not None and not (p["pret"] < v <= p["pret"] * 3):
                rele.append(f"{nume}: pret vechi neplauzibil ({v})")
    for r in rele[:40]:
        print(f"  PICA  {r}")
    bune = sum(1 for x in d.get("criterii", []) if len(x["produse"]) >= MIN_PRODUSE)
    print(f"Date: {bune} pagini, {sum(len(x['produse']) for x in d.get('criterii', []))} produse, {len(rele)} probleme.")
    return 1 if rele else 0


if __name__ == "__main__":
    if "--test" in sys.argv:
        sys.exit(test())
    if "--verifica" in sys.argv:
        sys.exit(verifica_date())
    if "--de-aprobat" in sys.argv:
        sys.exit(de_aprobat())
    if "--aproba" in sys.argv:
        sys.exit(aproba(sys.argv[sys.argv.index("--aproba") + 1].split(","), "titluri citite produs cu produs"))
    try:
        sys.exit(ruleaza())
    except Exception as e:  # noqa: BLE001 — pipeline-ul merge mai departe, criteriile raman cum sunt
        import traceback

        print(f"EROARE criterii: {e}")
        traceback.print_exc()
        sys.exit(0)
