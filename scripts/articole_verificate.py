"""
articole_verificate.py — articolele „Cel mai bun X" rescrise pe date verificate, publicate prin
data/articole_manuale.json (generate_blog.py le reinjecteaza la fiecare rulare si inlocuiesc articolul
generat cu acelasi slug; generate_best_of.py nu-l mai adauga, fiindca slug-ul exista).

DE CE (07.10.2026): articolele „Cel mai bun X" — singurele pagini cu vizitatori din cautari, dupa /top —
au fost generate in iunie, cu modele si cifre din memoria unui model de limbaj: „cel mai bun telefon pentru
poze 2026" = iPhone 16 Pro / Pixel 9 / Galaxy S25 (S25 Ultra „zoom 10x optic" — are 5x), „Microlife BP A3
Basic" (nu se vinde in Romania), „Omron M6 Comfort ... Bluetooth" (nu are). Reparatiile prin reguli
(curata_articole.py) scot ce e fals, dar nu pot spune ce e adevarat — asta cere surse.

REGULI pentru fiecare articol de aici:
  1. Fiecare model, specificatie si data vine dintr-o sursa notata in SURSE (fisa producatorului de
     preferinta). Ce nu s-a putut verifica nu se scrie.
  2. Fara preturi (se schimba; oferta de azi e la magazin), fara note, fara „testat" — nu am avut aparatele.
  3. Doar modele care se vand oficial in Romania, sau spus explicit ca nu.
  4. Fara promisiuni de coduri; link doar spre pagini care exista.

Rulare:  python articole_verificate.py          # scrie/actualizeaza intrarile in data/articole_manuale.json
         python articole_verificate.py --test   # verificari pe text (trebuie sa poata pica)
"""
from __future__ import annotations

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
MANUALE = os.path.join(ROOT, "data", "articole_manuale.json")
DATA = "2026-10-07"

CUM_AM_ALES = (
    "> **Cum am ales.** Nu am avut aparatele în mână. Am pornit de la fișele tehnice oficiale și de la "
    "criteriile de mai jos și am păstrat doar modele care se vând oficial în România. Prețurile se schimbă "
    "des, așa că nu le scriem aici: le vezi la magazin."
)

# Modelul -> oferta din feed. `titlu` = inceputul titlului H3 din articol; `cauta` = toate in titlul produsului
# (minuscule, fara diacritice); `tip` = cuvantul cu care incepe titlul produsului; `fara` = excluderi.
def M(titlu, cauta, tip, fara=None):
    return {"titlu": titlu, "cauta": cauta, "tip": tip, **({"fara": fara} if fara else {})}


TEL = "telefon|smartphone"
LAP = "laptop|ultrabook|notebook"
MODELE = {
    "cel-mai-bun-telefon-pentru-poze-2026": [
        M("iPhone 18 Pro", ["iphone 18 pro"], TEL, ["max"]),
        M("Samsung Galaxy S26 Ultra", ["galaxy s26 ultra"], TEL),
        M("Google Pixel 11 Pro", ["pixel 11 pro"], TEL, ["xl"]),
        M("Xiaomi 17 Ultra", ["xiaomi 17 ultra"], TEL),
        M("Huawei Pura 80 Ultra", ["pura 80 ultra"], TEL),
    ],
    "cel-mai-bun-telefon-samsung-2026": [
        M("Galaxy S26 Ultra", ["galaxy s26 ultra"], TEL),
        M("Galaxy S26 —", ["galaxy s26"], TEL, ["ultra", " fe", "s26+", "plus", "edge"]),
        M("Galaxy S26 FE", ["galaxy s26 fe"], TEL),
        M("Galaxy A57", ["galaxy a57"], TEL),
        M("Galaxy A37", ["galaxy a37"], TEL),
    ],
    "cele-mai-bune-casti-wireless-2026": [
        M("Sony WH-1000XM6", ["1000xm6"], "casti", ["wf"]),
        M("Bose QuietComfort Ultra", ["quietcomfort ultra"], "casti", ["earbuds"]),
        M("Apple AirPods Max", ["airpods max"], "casti"),
        M("AirPods Pro 3", ["airpods pro 3"], "casti"),
        M("Sony WF-1000XM6", ["wf-1000xm6"], "casti"),
        M("Samsung Galaxy Buds4 Pro", ["buds4 pro"], "casti"),
    ],
    "cel-mai-bun-smartwatch-2026": [
        M("Apple Watch Series 12", ["apple watch series 12"], "smartwatch|ceas"),
        M("Apple Watch Ultra 4", ["apple watch ultra 4"], "smartwatch|ceas"),
        M("Samsung Galaxy Watch9", ["galaxy watch9"], "smartwatch|ceas", ["classic"]),
        M("Samsung Galaxy Watch Ultra2", ["galaxy watch ultra2"], "smartwatch|ceas"),
        M("Garmin Forerunner 570", ["forerunner 570"], "smartwatch|ceas"),
        M("Garmin Instinct 3 Solar", ["instinct 3", "solar"], "smartwatch|ceas"),
    ],
    "cea-mai-buna-friteuza-aer-2026": [
        M("Philips Airfryer 3000 Series L", ["hd9252"], "friteuza|airfryer"),
        M("Philips Airfryer 5000 Series XXL", ["hd9285"], "friteuza|airfryer"),
        M("Ninja Foodi MAX Dual Zone", ["af400"], "friteuza|airfryer"),
        M("Ninja Double Stack XL", ["sl400"], "friteuza|airfryer"),
        M("Tefal Dual Easy Fry", ["ey905"], "friteuza|airfryer"),
    ],
    "cea-mai-buna-masina-de-cafea-2026": [
        M("De'Longhi Dinamica Plus", ["dinamica plus"], "espressor|expresor|aparat"),
        M("Philips 5400 LatteGo", ["5400", "lattego"], "espressor|expresor|aparat"),
        M("De'Longhi Magnifica Start", ["magnifica start"], "espressor|expresor|aparat"),
        M("De'Longhi La Specialista Arte", ["specialista arte"], "espressor|expresor|aparat"),
        M("Nespresso Vertuo Pop", ["vertuo pop"], "espressor|expresor|aparat|cafetiera"),
    ],
    "cel-mai-bun-aspirator-robot-2026": [
        M("Roborock Saros 10R", ["saros 10r"], "aspirator|robot"),
        M("Dreame X50 Ultra", ["x50 ultra"], "aspirator|robot"),
        M("Ecovacs Deebot X11", ["x11 omnicyclone"], "aspirator|robot"),
        M("Roborock Qrevo 2 Pro", ["qrevo 2 pro"], "aspirator|robot"),
    ],
    "cel-mai-bun-aspirator-2026": [
        M("Dyson V16 Piston Animal", ["v16 piston"], "aspirator"),
        M("Dyson V15 Detect", ["v15 detect"], "aspirator"),
        M("Samsung Bespoke Jet AI", ["bespoke jet ai"], "aspirator"),
        M("Dreame Z30", ["dreame z30"], "aspirator"),
        M("Rowenta X-Force Flex 15.60", ["x-force flex 15.60"], "aspirator"),
    ],
    "cel-mai-bun-scaun-auto-copil-2026": [
        M("De la naștere: Cybex Cloud T", ["cybex", "cloud t"], "scaun|scoica"),
        M("Până la aproximativ 4 ani: Cybex Sirona T", ["cybex", "sirona t"], "scaun"),
        M("Copii mari: Britax Römer KIDFIX", ["kidfix i-size"], "scaun|inaltator"),
    ],
    "cel-mai-bun-carucior-bebelus-2026": [
        M("Bugaboo Fox 5", ["bugaboo fox 5"], "carucior"),
        M("Cybex Gazelle S", ["gazelle s"], "carucior"),
        M("Joie Finiti Flex", ["joie", "finiti flex"], "carucior"),
        M("Kinderkraft Moov 2", ["kinderkraft", "moov 2"], "carucior"),
    ],
    "cel-mai-bun-router-wifi-2026": [
        M("TP-Link Archer BE550", ["archer be550"], "router"),
        M("TP-Link Deco BE65", ["deco be65"], "sistem|router|mesh"),
        M("ASUS RT-BE88U", ["rt-be88u"], "router"),
    ],
    "cel-mai-bun-monitor-gaming-2026": [
        M("Samsung Odyssey OLED G6", ["g60sf"], "monitor"),
        M("ASUS ROG Swift OLED PG27AQDP", ["pg27aqdp"], "monitor"),
        M("MSI MPG 272URX", ["272urx"], "monitor"),
        M("ASUS ROG Strix XG27ACS", ["xg27acs"], "monitor"),
    ],
    "cel-mai-bun-dashcam-2026": [
        M("Viofo A329", ["viofo", "a329"], "camera|dashcam"),
        M("Garmin Dash Cam X310", ["garmin", "x310"], "camera|dashcam"),
        M("70mai A810", ["70mai", "a810"], "camera|dashcam"),
    ],
    "cel-mai-bun-laptop-business-2026": [
        M("Lenovo ThinkPad X1 Carbon Gen 14", ["x1 carbon gen 14"], LAP),
        M("Dell XPS 14", ["xps 14"], LAP),
        M("HP EliteBook X G2", ["elitebook x", "g2"], LAP, ["flip"]),
        M("MacBook Air M5", ["macbook air", "m5"], LAP),
        M("ASUS Zenbook A14", ["zenbook a14"], LAP),
    ],
    "cele-mai-bune-adidasi-2026": [
        M("Nike Air Force 1", ["air force 1"], "pantofi sport|sneakers|adidasi", ["(gs)", "jes", "copii"]),
        M("New Balance 9060", ["new balance 9060"], "pantofi sport|sneakers|adidasi"),
    ],
}

ARTICOLE: list[dict] = []
SURSE: dict[str, list[str]] = {}


def articol(slug: str, title: str, excerpt: str, category: str, content: str, surse: list[str]) -> None:
    """`MODELE[slug]` (mai jos) devine `oferte_modele`: sub titlul fiecarui model, pagina arata oferta
    de azi de la un partener cu link platit, daca exista (frontend/lib/oferteTema.ts::ofertaModel)."""
    ARTICOLE.append({
        "slug": slug,
        "title": title,
        "date": DATA,
        "excerpt": excerpt,
        "category": category,
        "tip": "best-of",
        "magazin": None,
        "cover": f"/blog-covers/{slug}.png",
        "content": content.strip() + "\n",
        # citit de app/blog/[slug]/page.tsx: nota de sub titlu spune data reala, nu „mai–iunie 2026"
        "surse_din": DATA,
        "oferte_modele": MODELE.get(slug, []),
    })
    SURSE[slug] = surse


# ─── Telefon pentru poze ──────────────────────────────────────────────────────────────────────────
articol(
    "cel-mai-bun-telefon-pentru-poze-2026",
    "Cel mai bun telefon pentru poze 2026: 5 modele comparate",
    "iPhone 18 Pro, Galaxy S26 Ultra, Pixel 11 Pro, Xiaomi 17 Ultra și Huawei Pura 80 Ultra: ce cameră "
    "are fiecare, după fișa producătorului, și pentru cine e potrivit.",
    "Electronice",
    f"""
## Cel mai bun telefon pentru poze în 2026

În 2026, toate telefoanele de vârf fac poze bune la lumina zilei. Diferențele apar la zoom, în lumină slabă și
la video. Mai jos sunt cinci modele care se vând oficial în România, cu camerele lor așa cum le descrie
producătorul.

{CUM_AM_ALES}

## Ce contează la camera unui telefon

- **Mărimea senzorului principal** — un senzor mai mare adună mai multă lumină. Contează mai mult decât
  numărul de megapixeli.
- **Teleobiectivul** — zoomul optic (3x, 4x, 5x) păstrează detaliile; peste el, zoomul e digital.
- **Lumina slabă** — aici se văd cele mai mari diferențe, mai ales la portretele de seară.
- **Video** — stabilizare, 4K la 60 sau 120 de cadre pe secundă, profil Log dacă vrei să corectezi culorile.
- **Stilul de procesare** — fiecare producător are altul: unele poze ies mai contrastante, altele mai naturale.

## 5 telefoane bune pentru fotografie în 2026

### iPhone 18 Pro — pentru video
Primul iPhone cu diafragmă variabilă la camera principală (48 MP, ƒ/1.48–ƒ/4.0). Are și ultra-wide de 48 MP și
teleobiectiv de 48 MP cu zoom optic 4x (100 mm), plus zoom de „calitate optică" 8x. Filmează în ProRes RAW și
Apple Log 2, util dacă îți editezi singur clipurile. Camera frontală are 18 MP.

### Samsung Galaxy S26 Ultra — cel mai versatil la zoom
Cameră principală de 200 MP, două teleobiective (zoom optic 3x și 5x) și ultra-wide de 50 MP. Filmează și în
8K. Lansat în martie 2026.

### Google Pixel 11 Pro — pentru cine vrea poze bune fără setări
Cameră principală de 50 MP și teleobiectiv cu zoom optic 5x; Google pune accent pe procesarea foto. Lansat în
august 2026. Google vinde Pixelurile oficial în România din august 2024, prin parteneri (eMAG, Vodafone).

### Xiaomi 17 Ultra — senzor de 1 inch și zoom optic continuu
Cameră principală de 50 MP cu senzor de clasă 1 inch și tehnologie LOFIC (păstrează detalii și în zonele foarte
luminoase, și în umbre), optică Leica, teleobiectiv de 200 MP cu zoom optic continuu și ultra-wide de 50 MP.
Lansat global în februarie 2026 și vândut oficial în România.

### Huawei Pura 80 Ultra — recordul DXOMARK din 2025
Cameră principală cu senzor de 1 inch și un teleobiectiv care comută între zoom optic 3,7x și 9,4x. În 2025 a
avut cel mai mare scor general din istoria clasamentului DXOMARK (175). Se vinde oficial în România din august
2025. **Atenție:** telefoanele Huawei nu au serviciile Google (Magazin Play, aplicațiile Google), din cauza
sancțiunilor americane.

## Sfaturi pentru poze mai bune

- Fotografiază în **RAW** (ProRAW, Expert RAW) dacă vrei să editezi după.
- **Ora de aur** — prima oră după răsărit și ultima dinainte de apus — dă cea mai blândă lumină.
- Noaptea, sprijină telefonul sau folosește un **trepied mic**.
- Șterge obiectivul înainte: o amprentă pe lentilă strică mai multe poze decât orice setare.

[Vezi magazinele de electronice cu oferte active →](/categorii/electronice)
""",
    [
        "https://support.apple.com/en-gb/148590 (fisa tehnica iPhone 18 Pro)",
        "https://www.91mobiles.com/google-pixel-11-pro-price-in-india?ty=specs (Pixel 11 Pro, lansat 12.08.2026)",
        "https://gadget.ro/google-store-a-fost-lansat-oficial-in-romania/ (Pixel oficial in RO, 08.2024)",
        "https://www.tomsguide.com/phones/samsung-phones/how-ultra-are-the-galaxy-z-fold-8-ultras-cameras-i-put-them-to-the-test-against-the-galaxy-s26-ultra (S26 Ultra)",
        "https://www.phonearena.com/news/photography-powerhouse-xiaomi-17-ultra-is-confirmed-for-a-global-release-sooner-than-expected_id176946",
        "https://www.mobilissimo.ro/articole-telefoane/pret-si-disponibilitate-xiaomi-17-ultra-in-romania",
        "https://www.mobilissimo.ro/articole-telefoane/pret-si-disponibilitate-huawei-pura-80-ultra-in-romania",
        "https://gadget.ro/huawei-pura-80-ultra-a-obtinut-cel-mai-mare-scor-general-din-istoria-dxomark-in-curand-si-in-romania/",
    ],
)


# ─── Telefon Samsung ──────────────────────────────────────────────────────────────────────────────
articol(
    "cel-mai-bun-telefon-samsung-2026",
    "Cel mai bun telefon Samsung 2026: de la A37 la S26 Ultra",
    "Galaxy S26 Ultra, S26, S26 FE, A57 și A37: ce aduce fiecare după fișa Samsung, câte actualizări "
    "primește și pentru cine e potrivit.",
    "Electronice",
    f"""
## Cel mai bun telefon Samsung în 2026

În 2026, Samsung are două familii pentru cei mai mulți cumpărători: seria **Galaxy S** (vârf de gamă, în
magazine din 11 martie 2026, plus S26 FE din septembrie) și seria **Galaxy A** (gama medie, A57 și A37,
anunțate în martie 2026). Diferențele mari sunt la cameră, la ecran și la cât timp primește telefonul
actualizări.

{CUM_AM_ALES}

## Ce să cauți

- **Actualizările.** Samsung promite 7 generații de Android pentru S26 FE și 6 pentru A57 și A37. Un telefon
  ținut 4-5 ani are nevoie de ele.
- **Camera.** Doar S26 Ultra are cameră principală de 200 MP și teleobiectiv cu zoom optic 5x. A57 și A37 au
  cameră principală de 50 MP, ultra-wide și macro, fără teleobiectiv.
- **Mărimea.** S26 e cel mai mic (6,3 inchi); S26+, S26 FE, A57 și A37 au 6,7 inchi; S26 Ultra are 6,9.
- **Rezistența la apă.** A57 și A37 sunt IP68 (în testele Samsung: până la 1,5 m de apă dulce, 30 de minute).

## 5 telefoane Samsung recomandate în 2026

### Galaxy S26 Ultra — cel mai complet
Ecran de 6,9 inchi cu Privacy Display (ce e pe ecran nu se mai vede din unghiuri laterale, fără folie
separată), stylus S Pen integrat, cameră principală de 200 MP (ƒ/1.4), teleobiective cu zoom optic 3x și 5x,
baterie de 5.000 mAh.

### Galaxy S26 — vârf de gamă compact
Ecran de 6,3 inchi, cameră principală de 50 MP, teleobiectiv de 10 MP, baterie de 4.300 mAh. Varianta
**S26+** are ecran de 6,7 inchi cu rezoluție QHD+ și baterie de 4.900 mAh.

### Galaxy S26 FE — vârf de gamă mai accesibil, 7 ani de actualizări
Lansat în septembrie 2026: ecran AMOLED de 6,7 inchi la 120 Hz, procesor Exynos 2500, cameră principală de
50 MP, ultra-wide de 12 MP și teleobiectiv de 8 MP cu zoom optic 3x, baterie de 4.900 mAh cu încărcare la
45 W. 7 generații de Android și 7 ani de actualizări de securitate.

### Galaxy A57 — gama medie, procesorul mai rapid dintre cele două A
Procesor Exynos 1680, ecran Super AMOLED Plus de 6,7 inchi la 120 Hz, cameră principală de 50 MP cu
ultra-wide de 12 MP, baterie de 5.000 mAh, IP68, 6 generații de Android.

### Galaxy A37 — aceeași baterie, mai ieftin
Procesor Exynos 1480, ecran Super AMOLED de 6,7 inchi la 120 Hz, cameră principală de 50 MP cu ultra-wide
de 8 MP, baterie de 5.000 mAh, IP68, 6 generații de Android.

## Pe scurt

Pentru cele mai multe persoane, **Galaxy A57** acoperă tot ce contează zi de zi. Dacă vrei teleobiectiv și
actualizări cât mai multe la un preț sub vârful de gamă, **Galaxy S26 FE**. Dacă vrei tot — S Pen, zoom 5x,
ecran cu protecție de privire laterală — **Galaxy S26 Ultra**.

[Vezi magazinele de electronice cu oferte active →](/categorii/electronice)
""",
    [
        "https://www.samsung.com/uk/mobile-phone-buying-guide/introducing-samsung-galaxy-s26/ (S26/S26+/S26 Ultra, 11.03.2026)",
        "https://www.gsmarena.com/samsung_galaxy_s26_ultra-review-2939.php (camere S26 Ultra: 200 MP, 3x 10 MP, 5x 50 MP)",
        "https://news.samsung.com/global/samsung-galaxy-s26-fe-delivering-the-latest-flagship-experience-focused-on-what-matters-most",
        "https://www.samsung.com/ie/support/mobile-devices/what-are-the-differences-between-the-galaxy-a57-5g-and-a37-5g/",
        "https://news.samsung.com/global/samsung-unveils-galaxy-a57-5g-and-galaxy-a37-5g-packing-pro-level-features-at-awesome-price (IP68, 6 generatii)",
    ],
)


# ─── Casti wireless ───────────────────────────────────────────────────────────────────────────────
articol(
    "cele-mai-bune-casti-wireless-2026",
    "Cele mai bune căști wireless 2026: over-ear și in-ear",
    "Sony WH-1000XM6, Bose QuietComfort Ultra (gen. 2), AirPods Max, AirPods Pro 3, Sony WF-1000XM6 și "
    "Galaxy Buds4 Pro: ce oferă fiecare, după fișa producătorului.",
    "Gadgets",
    f"""
## Cele mai bune căști wireless în 2026

Căștile cu anulare activă a zgomotului (ANC) au devenit normale chiar și la modelele ieftine. La vârf,
diferențele sunt la cât de bine izolează, la autonomie și la ce funcții primești în plus cu telefonul tău.

{CUM_AM_ALES}

## Ce contează

- **Anularea zgomotului.** Căștile over-ear izolează cel mai bine — pentru avion, metrou, birou deschis.
- **Autonomia cu ANC pornit.** Producătorii dau și cifra fără ANC; contează cea cu ANC.
- **Telefonul tău.** AirPods au funcții în plus cu iPhone, Galaxy Buds cu telefoanele Galaxy, iar codecul
  LDAC (Sony) merge doar pe Android.
- **Rezistența la apă**, dacă le folosești la sport: IPX4 rezistă la stropi și transpirație, IP57 și la praf.
- **Multipoint** — conectare simultană la telefon și laptop.

## Over-ear

### Sony WH-1000XM6
Anulare a zgomotului cu procesorul QN3 și 12 microfoane, până la 30 de ore cu ANC, LDAC, conectare multipoint.
Spre deosebire de generația anterioară, se pliază. Lansate în 2025.

### Bose QuietComfort Ultra (a doua generație)
Până la 30 de ore (23 cu Immersive Audio pornit), audio fără pierderi prin cablu USB-C, Bluetooth 5.4 și un mod
Cinema pentru filme și podcasturi. Lansate în octombrie 2025.

### Apple AirPods Max
USB-C, cipul H1 în fiecare cupă, până la 20 de ore cu ANC. Merg cu orice telefon prin Bluetooth, dar audio
spațial și comutarea automată între dispozitive le ai doar cu produse Apple. Modelul e din 2020; în 2024 a
primit doar portul USB-C.

## In-ear (true wireless)

### AirPods Pro 3
Anulare a zgomotului, senzor de puls pentru antrenamente, rezistență IP57 (prima la AirPods), până la 8 ore
cu ANC pe o încărcare. Lansate în septembrie 2025.

### Sony WF-1000XM6
Lansate în februarie 2026, cu o carcasă nouă, mai subțire. Sony anunță anulare a zgomotului cu 25% mai
eficientă decât la WF-1000XM5. 8 ore pe o încărcare, 24 cu cutia, încărcare wireless, IPX4.

### Samsung Galaxy Buds4 Pro
Lansate în februarie 2026: ANC adaptiv, difuzor în două căi, 6 ore cu ANC (26 cu cutia), IP57, Bluetooth
6.1. Audio la 24 de biți / 96 kHz doar cu telefoane Galaxy compatibile.

## Dacă ai buget mic

Modelele ieftine se schimbă de la un sezon la altul, așa că nu le numim. Caută anulare hibridă a zgomotului,
multipoint, minimum 30 de ore la over-ear sau 6 ore la in-ear și o aplicație cu egalizator.

[Vezi pagina de gadgeturi →](/gadgets)
""",
    [
        "https://www.digitec.ch/en/s1/product/sony-wh-1000xm6-anc-30-h-cable-wireless-headphones-72467457 (XM6: 30 h ANC, QN3, 12 microfoane)",
        "https://support.bose.com/s/article/product-specifications-bose-quietcomfort-ultra-headphones-2nd-gen",
        "https://betanews.com/2025/10/03/bose-releases-second-gen-quietcomfort-ultra-headphones-with-lossless-audio-and-longer-battery-life/",
        "https://support.apple.com/en-gb/121205 (AirPods Max USB-C, H1, 20 h)",
        "https://www.apple.com/ae/airpods-pro (AirPods Pro 3: 8 h ANC, puls, IP57)",
        "https://www.gsmarena.com/sony_wf1000xm6_arrive_with_updated_sound_tuning_stronger_anc_-news-71532.php",
        "https://www.notebookcheck.net/Samsung-Galaxy-Buds-4-Pro-go-official-with-bigger-drivers-refined-ANC-and-long-battery-life.1234726.0.html",
        "https://www.droid-life.com/2026/02/25/galaxy-buds-4-announcement/",
    ],
)


# ─── Smartwatch ───────────────────────────────────────────────────────────────────────────────────
articol(
    "cel-mai-bun-smartwatch-2026",
    "Cel mai bun smartwatch 2026: Apple, Samsung și Garmin",
    "Apple Watch Series 12 și Ultra 4, Galaxy Watch9 și Watch Ultra2, Garmin Forerunner 570 și Instinct 3 "
    "Solar: autonomie, compatibilitate cu telefonul și pentru cine e fiecare.",
    "Gadgets",
    f"""
## Cel mai bun smartwatch în 2026

Primul criteriu nu e ceasul, ci telefonul. **Apple Watch merge doar cu iPhone.** **Galaxy Watch merge doar cu
Android**, iar ECG-ul și măsurarea tensiunii le ai doar cu telefoane Samsung Galaxy. **Garmin merge și cu
iPhone, și cu Android.**

{CUM_AM_ALES}

## Ce contează

- **Compatibilitatea cu telefonul** — vezi mai sus; un ceas care nu merge cu telefonul tău nu e o opțiune.
- **Autonomia** — un Apple Watch ține de regulă o zi; un Garmin, zile sau săptămâni.
- **Sportul** — pentru alergare, GPS-ul multi-bandă e mai precis printre clădiri și copaci.
- **Sănătatea** — ECG-ul, oxigenul din sânge și alertele de puls semnalează; diagnosticul îl pune medicul.

## Smartwatch-uri recomandate în 2026

### Apple Watch Series 12 — pentru iPhone
Anunțat pe 10 septembrie 2026. Apple dă până la 24 de ore de autonomie, încărcare rapidă (12 ore de
utilizare în 15 minute) și până la 10 ore de antrenament în aer liber. Are senzori noi de puls, optici și
electrici.

### Apple Watch Ultra 4 — iPhone, sport și autonomie
Până la 50 de ore de utilizare normală și 84 în modul de economisire, după Apple. Tot doar pentru iPhone.

### Samsung Galaxy Watch9 — pentru telefoane Android
Lansat pe 22 iulie 2026, primul Galaxy Watch cu procesor Snapdragon Wear Elite. Bateria e mai mare decât la
Watch8 (390 mAh la varianta de 40 mm, față de 325 mAh).

### Samsung Galaxy Watch Ultra2 — Android, mai multă autonomie
Baterie de 800 mAh, cu 35% mai mare decât la prima generație, după Samsung. Lansat tot în iulie 2026.

### Garmin Forerunner 570 — pentru alergare
Până la 11 zile ca ceas inteligent (varianta de 47 mm) și până la 14 ore de GPS multi-bandă. Merge cu iPhone
și cu Android. Lansat în 2025.

### Garmin Instinct 3 Solar — rezistent, cu încărcare solară
Până la 28 de zile ca ceas inteligent (varianta de 45 mm). Cu trei ore pe zi de lumină puternică (50.000 de
lucși), Garmin dă autonomie nelimitată în acest mod. Merge cu iPhone și cu Android.

## Înainte să cumperi

- Verifică încă o dată compatibilitatea cu telefonul tău.
- Probează mărimea carcasei: același model vine de obicei în două dimensiuni.
- Dacă vrei să plătești cu ceasul, întreabă-ți banca dacă acceptă portofelul ceasului (Apple Pay, Samsung
  Wallet, Garmin Pay).

[Vezi pagina de gadgeturi →](/gadgets)
""",
    [
        "https://www.expertreviews.co.uk/beauty-wellness/wearables/the-apple-watch-series-12-and-watch-ultra-4-come-with-better-heartrate-sensing-and-ai-powered-listening-features",
        "https://www.androidheadlines.com/2026/09/apple-announces-the-watch-ultra-4-and-watch-series-12.html",
        "https://propakistani.pk/2026/09/10/apple-watch-series-12-and-ultra-4-get-new-health-features-and-battery-boost/amp/",
        "https://news.samsung.com/my/galaxy-unpacked-july-2026-a-first-look-at-galaxy-watch-ultra2-and-galaxy-watch9",
        "https://www.samsung.com/sg/mobile/mobile-phone-buying-guide/galaxy-watch9-watch-ultra2-specs-features/",
        "https://www8.garmin.com/manuals/webhelp/GUID-25E3235D-44D2-4384-A591-DD1D71BEBCB1/EN-US/GUID-6E1935AD-17DC-48E6-8C54-B2FC79917B0B.html (Forerunner 570)",
        "https://the5krunner.com/specs/garmin/instinct-3-solar/ (Instinct 3 Solar 45 mm)",
    ],
)


# ─── Laptop gaming ────────────────────────────────────────────────────────────────────────────────
articol(
    "cel-mai-bun-laptop-gaming-2026",
    "Cel mai bun laptop gaming 2026: ce placă video să alegi",
    "Laptopurile de gaming din 2026 au plăci RTX 50: câtă memorie video are fiecare treaptă, de ce contează "
    "puterea plăcii și ce serii de laptopuri găsești pe fiecare treaptă.",
    "Electronice",
    """
## Cel mai bun laptop gaming în 2026

Laptopurile de gaming noi din 2026 au plăci NVIDIA GeForce RTX 50, lansate în 2025. Același nume de placă
poate merge foarte diferit de la un laptop la altul, în funcție de puterea pe care i-o dă producătorul și de
răcire. De aceea alegerea începe cu placa și cu fișa tehnică, nu cu marca.

> **Cum am ales.** Nu am avut laptopurile în mână. Configurațiile diferă de la o țară la alta, așa că mai jos
> sunt treptele de placă video și seriile de laptopuri care le folosesc, după fișele producătorilor. Prețurile
> se schimbă des, așa că nu le scriem aici: le vezi la magazin.

## Ce contează

- **Placa video.** Pe laptop, RTX 5050, 5060 și 5070 au 8 GB de memorie video GDDR7; RTX 5070 Ti are 12 GB,
  RTX 5080 are 16 GB, iar RTX 5090 are 24 GB.
- **Puterea plăcii (TGP).** Același RTX 5070 poate fi mult mai lent într-un laptop subțire, cu putere mică.
  Caută valoarea în wați în fișa tehnică și compar-o între modele.
- **Ecranul.** Rata de reîmprospătare (165-240 Hz) contează la jocurile rapide; OLED-ul dă contrast mai bun.
- **Memoria RAM.** 16 GB e minimul; verifică dacă poate fi mărită — la unele laptopuri e lipită pe placă.
- **DLSS 4 cu Multi Frame Generation**, doar pe plăcile RTX 50: în jocurile compatibile, generează până la
  trei cadre în plus pentru fiecare cadru randat.

## Pe trepte

### Intrare — RTX 5050 și 5060
Pentru jocuri în 1080p. Seriile **Lenovo LOQ** și **ASUS TUF Gaming** au configurații cu aceste plăci.

### Mijloc — RTX 5070 și 5070 Ti
**Lenovo Legion Pro 5** (generația 10) are configurații cu RTX 5070 și ecran OLED de 165 Hz. **ASUS ROG Strix
G16** (2026) vine cu RTX 5070 sau 5070 Ti și ecran 2,5K de 240 Hz. Cu 12 GB, RTX 5070 Ti are mai multă
rezervă de memorie video pentru 1440p decât plăcile de 8 GB.

### Vârf — RTX 5080 și 5090
**Lenovo Legion Pro 7i** (generația 10) are configurații cu RTX 5080. **Razer Blade 16** (2026): procesor
Intel Core Ultra 9 386H, până la RTX 5090 cu 24 GB, ecran OLED QHD+ de 240 Hz și 14,9 mm grosime — cel mai
subțire Blade cu placă video dedicată, după Razer.

## Autonomia

Un laptop de gaming ține puțin pe baterie când joci, iar departe de priză placa video merge cu putere
redusă. Dacă îl cari zilnic, uită-te și la greutate și la încărcător.

[Vezi pagina de laptopuri →](/laptop)
""",
    [
        "https://box.co.uk/blog/nvidia-50-series-laptop-gpu-vram-guide (VRAM pe trepte)",
        "https://www.notebookcheck.net/Massive-Asus-ROG-leak-reveals-VRAM-capacity-of-Nvidia-GeForce-RTX-5090-RTX-5080-RTX-5070-Ti-RTX-5070-RTX-5060-and-RTX-5050.934967.0.html",
        "https://www.club386.com/nvidia-rtx-50-series-laptops-can-generate-four-times-more-frames/ (Multi Frame Generation)",
        "https://finalboss.io/gaming-laptops/guides/best-gaming-laptops-2026 (Legion Pro 5 Gen 10, LOQ, Legion Pro 7i)",
        "https://www.digit.in/features/laptops/5-best-nvidia-rtx-5070-laptops-in-2026asus-tuf-f16-lenovo-legion-7-and-more.html",
        "https://www.tech-critter.com/razer-blade-16-2026-launch/ (Blade 16 2026)",
    ],
)


# ─── Friteuza cu aer cald ─────────────────────────────────────────────────────────────────────────
articol(
    "cea-mai-buna-friteuza-aer-2026",
    "Cea mai bună friteuză cu aer cald 2026: 5 modele comparate",
    "Philips 3000 și 5000 XXL, Ninja Dual Zone, Ninja Double Stack și Tefal Dual Easy Fry & Grill: capacitate, "
    "putere și pentru câte persoane e potrivită fiecare.",
    "Electrocasnice",
    f"""
## Cea mai bună friteuză cu aer cald în 2026

O friteuză cu aer cald e un cuptor mic cu ventilator puternic: aerul fierbinte circulă în jurul mâncării,
așa că ai nevoie de puțin ulei sau deloc. Alegerea ține de trei lucruri: pentru câte persoane gătești, dacă
vrei două coșuri și cât loc ai pe blat.

{CUM_AM_ALES}

## Ce capacitate să alegi

- **1-2 persoane:** 3-4 litri.
- **3-4 persoane:** 4-6 litri.
- **5 persoane sau mai mult, ori două feluri deodată:** 8-10 litri, de obicei în două coșuri.

## Ce contează

- **Un coș sau două.** Cu două coșuri gătești două feluri la temperaturi diferite și le poți scoate în același
  timp.
- **Puterea.** Mai mulți wați înseamnă încălzire mai rapidă; o friteuză mare consumă mai mult pe oră.
- **Curățarea.** Verifică dacă coșul și grătarul intră în mașina de spălat vase.
- **Locul pe blat.** Modelele cu coșuri alăturate sunt late; cele cu coșuri suprapuse ocupă mai puțin pe lățime.

## 5 friteuze cu aer cald în 2026

### Philips Airfryer 3000 Series L (HD9252) — compactă
4,1 litri, 1.400 W, 13 programe. Philips o recomandă pentru patru porții.

### Philips Airfryer 5000 Series XXL Connected (HD9285) — un coș mare
7,2 litri (1,4 kg de mâncare), 2.000 W, 16 moduri de gătire și legătură cu aplicația NutriU. Piesele
detașabile merg în mașina de spălat vase.

### Ninja Foodi MAX Dual Zone (AF400EU) — două coșuri alăturate
9,5 litri în două coșuri independente, 2.470 W. Gătești două feluri la temperaturi diferite și le poți
sincroniza să fie gata în același timp.

### Ninja Double Stack XL (SL400EU) — două coșuri suprapuse
9,5 litri (2 × 4,75 litri), 2.470 W. Coșurile stau unul peste altul, așa că friteuza e mai îngustă decât
modelele cu coșuri alăturate.

### Tefal Dual Easy Fry & Grill (EY905) — două coșuri inegale și grătar
8,3 litri în două coșuri de mărimi diferite (5,2 și 3,1 litri), 2.700 W, 8 programe pentru fiecare coș și
plăci de grătar.

## Ce gătești

- Cartofi, aripioare, legume, pește
- Prăjituri mici și brioșe, în forme care încap în coș
- Mâncare reîncălzită, care rămâne crocantă
- Fructe și legume deshidratate, la modelele cu această funcție

## Sfaturi

- **Nu umple coșul.** Aerul trebuie să circule; altfel mâncarea iese moale.
- **Scutură sau întoarce** la jumătatea timpului.
- **Un strat subțire de ulei** ajută cartofii să iasă mai crocanți.

[Vezi magazinele pentru casă și grădină →](/categorii/casa-gradina)
""",
    [
        "https://www.home-appliances.philips/gb/en/p/HD9252_91 (3000 Series L: 4,1 l, 1.400 W)",
        "https://www.home-appliances.philips/gb/en/p/HD9285_96 (5000 Series XXL Connected: 7,2 l, 2.000 W)",
        "https://galaxus.de/en/s2/product/ninja-af400eu-foodi-max-dual-zone-eu-plug-fryers-21343454 (AF400EU 9,5 l, 2.470 W)",
        "https://multitronic.fi/en/products/4432885/ninja-double-stack-xl-sl400euwh--9-5-l--2-kg--2470-w--airfryer--vit (SL400EU)",
        "https://www.boulanger.com/ref/1245422 (SL400EU 2 x 4,75 l)",
        "https://multitronic.fi/en/products/4532986/tefal-dual-easy-fry---grill-ey905b--8-3-l--2700-w--airfryer--gra (EY905)",
    ],
)


# ─── Aspirator robot ──────────────────────────────────────────────────────────────────────────────
articol(
    "cel-mai-bun-aspirator-robot-2026",
    "Cel mai bun aspirator robot 2026: 4 modele și ce contează",
    "Roborock Saros 10R și Qrevo 2 Pro, Dreame X50 Ultra, Ecovacs Deebot X11 OmniCyclone: navigare, mop, "
    "stație și praguri, după fișa producătorului.",
    "Casa",
    f"""
## Cel mai bun aspirator robot în 2026

Aproape toate aspiratoarele robot bune din 2026 au navigare LiDAR, mop și o stație care le golește singură.
Diferențele sunt la mop (discuri rotative sau rolă), la cât de ușor trec peste praguri și la cât de jos intră
sub mobilă.

{CUM_AM_ALES}

## Ce contează

- **Navigarea.** LiDAR-ul (un senzor cu laser) face o hartă precisă și merge și pe întuneric; camera ajută
  robotul să ocolească obiecte mici, ca firele și șosetele.
- **Puterea de aspirare.** Cifrele în Pa sunt ale producătorilor, fiecare le măsoară altfel. Contează la fel de
  mult peria și felul în care curăță covoarele.
- **Mopul.** Discuri rotative sau rolă; la modelele bune, mopul se ridică sau se retrage când robotul intră pe
  covor.
- **Pragurile și înălțimea.** Dacă ai praguri înalte sau pat și canapea joase, măsoară-le înainte.
- **Stația.** Golește praful, spală și usucă mopul; unele stații nu mai folosesc saci.
- **Părul de animale.** Caută perii făcute să nu se încâlcească.

## 4 aspiratoare robot în 2026

### Roborock Saros 10R — pentru mobilă joasă
7,98 cm înălțime, navigare StarSight 2.0 cu LiDAR solid-state și cameră RGB, baterie de 6.400 mAh și stație
care spală mopul.

### Dreame X50 Ultra — pentru praguri înalte
20.000 Pa, după Dreame. Își ridică corpul pe „picioare" retractabile (ProLeap) ca să treacă praguri duble de
până la 6 cm, iar senzorul de navigare coboară ca robotul să intre sub mobilă de 8,9 cm. Peria e făcută să nu
încâlcească părul lung.

### Ecovacs Deebot X11 OmniCyclone — mop cu rolă, stație fără saci
19.500 Pa, după Ecovacs. Mopul e o rolă (OZMO Roller 2.0) spălată cu apă caldă, stația golește praful fără
saci, iar încărcarea rapidă PowerBoost scurtează pauzele. Prezentat în 2025.

### Roborock Qrevo 2 Pro — gama medie, din 2026
Lansat în august 2026: 25.000 Pa după Roborock, navigare LiDAR, mopuri care se retrag înainte de covor și
stație care spală mopurile cu apă de 75 °C.

## Dacă te gândești la un Roomba

În decembrie 2025, iRobot a intrat în procedura americană de faliment (Chapter 11) și a fost preluat de
furnizorul său, Picea. Firma a anunțat că produsele, aplicația și asistența continuă.

[Vezi magazinele pentru casă și grădină →](/categorii/casa-gradina)
""",
    [
        "https://nz.roborock.com/pages/roborock-saros-10r (Saros 10R)",
        "https://www.techradar.com/home/robot-vacuums/roborock-saros-10r-robot-vacuum-review",
        "https://ch.dreametech.com/en/products/dreame-x50-ultra-complete-saugroboter (X50 Ultra: 20.000 Pa, ProLeap 6 cm, 8,9 cm)",
        "https://www.ecovacs.com/ca/deebot-robotic-vacuum-cleaner/deebot-x11-omnicyclone (19.500 Pa, OZMO Roller, statie fara saci)",
        "https://basic-tutorials.com/news/roborock-qrevo-2-pro-mid-range-robot-vacuum-with-25000-pa-suction-power-and-hot-water-mopping-for-689-99-euros/",
        "https://www.tomsguide.com/home/smart-home/roomba-maker-irobot-files-for-bankruptcy-after-35-years-what-it-means-for-you",
        "https://www.financierworldwide.com/irobot-files-for-chapter-11-bankruptcy",
    ],
)


# ─── Scaun auto copil ─────────────────────────────────────────────────────────────────────────────
# 07.10.2026: varianta generata scria „Nu montezi cu fata inainte in fata cu airbag activ" — regula reala e
# despre scaunul montat CU SPATELE la directia de mers — si „Cybex Solution B i-Fix — 9-36 kg" (e un
# inaltator pentru copii mari). Eroare de siguranta, nu de stil.
articol(
    "cel-mai-bun-scaun-auto-copil-2026",
    "Cel mai bun scaun auto copil 2026: ghid i-Size pe etape",
    "Ce înseamnă i-Size (R129), până când copilul stă cu spatele la drum, regula airbagului și trei scaune pe "
    "etape: Cybex Cloud T, Cybex Sirona T și Britax Römer KIDFIX i-Size.",
    "Copii",
    f"""
## Cel mai bun scaun auto pentru copil în 2026

Scaunul auto e singurul lucru cumpărat pentru copil care trebuie să meargă perfect într-o fracțiune de
secundă. Înainte de model contează standardul, înălțimea copilului și felul în care e montat.

{CUM_AM_ALES}

## Standardul: i-Size (R129)

- Scaunele noi sunt omologate după **R129 (i-Size)**, care le împarte după **înălțimea copilului, în
  centimetri**, nu după greutate.
- **Din 1 septembrie 2024, scaunele omologate doar după vechiul standard R44 nu se mai vând în Uniunea
  Europeană.** Unul pe care îl ai deja îl poți folosi în continuare.
- R129 cere ca bebelușul să stea **cu spatele la direcția de mers cel puțin până la 15 luni** (și 76 cm).
  Multe scaune permit asta până la 105 cm, adică în jur de 4 ani.

## Regula airbagului

**Un scaun montat cu spatele la direcția de mers nu se pune niciodată pe locul din față cu airbagul
pasagerului activ** — airbagul care se deschide poate răni grav copilul. Dacă îl montezi în față, dezactivează
airbagul (manualul mașinii arată cum); altfel, montează scaunul pe bancheta din spate.

## Pe etape

### De la naștere: Cybex Cloud T i-Size (45-87 cm)
Scoică pentru copii de la naștere până la aproximativ 2 ani (45-87 cm, maximum 13 kg). Pe baza Base T se
rotește la 180°, ca să așezi copilul mai ușor.

### Până la aproximativ 4 ani: Cybex Sirona T i-Size (45-105 cm)
Se folosește de la naștere până la aproximativ 4 ani, cu spatele la direcția de mers obligatoriu până la 15
luni (76 cm). Pe aceeași bază Base T se rotește la 360° — dacă ai avut Cloud T, nu mai cumperi altă bază.

### Copii mari: Britax Römer KIDFIX i-Size (100-150 cm)
Înălțător cu spătar pentru copii între aproximativ 3,5 și 12 ani. Se prinde cu centura mașinii sau și cu
ISOFIX și are SecureGuard, care ține centura pe bazin, nu pe abdomen, plus protecție laterală (SICT).

## Ce să nu faci

- **Nu cumpăra un scaun second-hand al cărui istoric nu-l știi** — un scaun care a fost într-un accident
  trebuie înlocuit, chiar dacă arată întreg.
- **Nu întoarce copilul cu fața înainte** mai devreme decât permite scaunul (la i-Size, cel puțin 15 luni).
- **Nu-l lega peste o geacă groasă** — hamul pare strâns, dar în accident geaca se comprimă.

[Vezi magazinele pentru copii cu oferte active →](/categorii/copii)
""",
    [
        "https://www.maxi-cosi.co.uk/c/node/1519 (R129 vs R44, vanzarea R44 interzisa din 01.09.2024)",
        "https://www.rsa.ie/road-safety/road-users/passengers/children/faqs (scaun cu spatele + airbag activ)",
        "https://volvocars.com/uk/support/car/s90/17w46/article/24e4bee1aee9c8b9c0a801512566e9e9 (airbag pasager)",
        "https://joiebaby.com/eu/ask-for-i-size (cu spatele pana la minimum 15 luni)",
        "https://www.nordbaby.com/lt/en/product/cybex-cloud-t-i-size-45-87cm-car-seat-rockstar_130494 (Cloud T 45-87 cm)",
        "https://www.bambinou.com/pack-sieges-auto-cloud-t-i-size-sirona-t-i-size-base-t-cybex (Sirona T 45-105 cm, Base T 180/360)",
        "https://www.oeamtc.at/shop/kindersitze/britax-roemer-kidfix-i-size-60355456 (KIDFIX i-Size 100-150 cm)",
        "https://www.baby-walz.de/p/britax-roemer-select-kindersitz-kidfix-i-size-storm-grey-7345526/",
    ],
)


# ─── Carucior bebelus ─────────────────────────────────────────────────────────────────────────────
articol(
    "cel-mai-bun-carucior-bebelus-2026",
    "Cel mai bun cărucior bebeluș 2026: 4 modele comparate",
    "Bugaboo Fox 5, Cybex Gazelle S, Joie Finiti Flex și Kinderkraft Moov 2: pentru ce drumuri e fiecare, "
    "până la ce vârstă îl folosești și cum se pliază.",
    "Copii",
    f"""
## Cel mai bun cărucior pentru bebeluș în 2026

Căruciorul îl folosești zilnic trei-patru ani, așa că alegerea ține mai puțin de marcă și mai mult de unde
locuiești: lift sau scări, trotuare bune sau denivelate, portbagaj mic sau mare.

{CUM_AM_ALES}

## Tipuri

- **2 în 1 / 3 în 1** — același șasiu cu landou pentru nou-născut și scaun sport pentru mai târziu; la 3 în 1
  se adaugă scoica auto.
- **Cărucior sport (buggy)** — mai ușor; unele se folosesc de la naștere, dacă spătarul coboară complet
  orizontal, altele doar de la circa 6 luni.

## Ce contează

- **Greutatea și plierea** — dacă urci scări sau ai lift mic, contează fiecare kilogram.
- **Roțile și suspensia** — pentru trotuare denivelate și pietriș.
- **Scoica auto** — verifică ce scoici se potrivesc pe adaptoarele căruciorului.
- **Limita scaunului** — de obicei 22 kg, adică în jur de 4 ani.

## 4 cărucioare în 2026

### Bugaboo Fox 5 — pentru drumuri grele
Cărucior gândit pentru orice teren. Se pliază și se reglează cu o singură mână, iar pliat dintr-o bucată stă
singur în picioare.

### Cybex Gazelle S — dacă vine al doilea copil
Merge ca simplu sau ca dublu, în peste 20 de configurații: poate duce două landouri, două scaune sau două
scoici (cu adaptoare), deci e potrivit pentru gemeni sau frați apropiați ca vârstă. Fiecare scaun duce până
la 22 kg.

### Joie Finiti Flex — ușor de pliat
De la naștere până la 4 ani (22 kg), cu spătarul complet orizontal și pliere cu o singură mână. Are 11,2 kg.

### Kinderkraft Moov 2 — set complet
Sistem 3 în 1, cu scoică auto i-Size în set, de la naștere până la 4 ani (22 kg). Vine cu husă de ploaie,
apărătoare pentru picioare, plasă de țânțari și geantă.

## Înainte să cumperi

- Măsoară portbagajul și ușa liftului și compară cu dimensiunile pliat din fișa căruciorului.
- Încearcă plierea în magazin, cu o mână.
- Pentru scoica auto, citește și ghidul nostru despre scaunele auto i-Size.

[Vezi magazinele pentru copii cu oferte active →](/categorii/copii)
""",
    [
        "https://www.mumsnet.com/reviews/bugaboo-fox-5-review (Fox 5, toate terenurile)",
        "https://strollberry.com/strollers/bugaboo-fox-5 (pliere cu o mana, pliere dintr-o bucata)",
        "https://www.cybex-online.com/en/us/p/10104439.html (Gazelle S: peste 20 de configuratii, dublu)",
        "https://www.kiddies-kingdom.com/strollers/61697-joie-signature-finiti-flex-stroller-maple.html (Finiti Flex)",
        "https://tonykealys.com/products/joie-finiti-flex-2in1-signature-pram-oyster",
        "https://www.galaxus.de/en/s10/product/kinderkraft-moov-2-eva-3in1-0-months-4-years-pushchairs-52335894 (Moov 2)",
    ],
)


# ─── Router WiFi ──────────────────────────────────────────────────────────────────────────────────
articol(
    "cel-mai-bun-router-wifi-2026",
    "Cel mai bun router WiFi 2026: Wi-Fi 7, mesh și ce contează",
    "Wi-Fi 6 sau Wi-Fi 7, router sau mesh: ce contează pentru apartament și casă, plus TP-Link Archer BE550, "
    "Deco BE65 și ASUS RT-BE88U, după fișa producătorului.",
    "Electronice",
    f"""
## Cel mai bun router WiFi în 2026

Routerul nu face internetul mai rapid decât abonamentul. Ce poate face e să acopere toată casa și să nu
încetinească atunci când sunt conectate multe dispozitive.

{CUM_AM_ALES}

## Wi-Fi 6, 6E sau 7

- **Wi-Fi 6 (802.11ax):** maximum teoretic 9,6 Gbps, pe 2,4 și 5 GHz. **Wi-Fi 6E** adaugă banda de 6 GHz.
- **Wi-Fi 7 (802.11be):** maximum teoretic 46 Gbps. Aduce Multi-Link Operation (folosește mai multe benzi în
  același timp) și modulația 4K-QAM. Standardul a fost publicat oficial în iulie 2025.
- Vitezele maxime sunt teoretice: în casă vezi mult mai puțin. Iar Wi-Fi 7 ajută doar dacă și telefonul sau
  laptopul tău au Wi-Fi 7.

## Router sau mesh

- **Apartament mic sau mediu:** de regulă ajunge un router bun, pus cât mai central.
- **Casă pe etaje, pereți groși sau zone fără semnal:** un sistem mesh — mai multe unități care formează o
  singură rețea.

## Ce contează

- **Abonamentul.** La un abonament de peste 1 Gbps, un port de 1 Gbps devine limita; caută porturi de 2,5 Gbps.
- **Locul routerului.** Central, la înălțime, nu în dulap sau după televizor.
- **Actualizările.** Un router primește actualizări de securitate câțiva ani; verifică în aplicație că le
  instalează.

## 3 recomandări

### TP-Link Archer BE550 — Wi-Fi 7 pentru apartament
Tri-band (2,4 + 5 + 6 GHz), un port WAN și patru porturi LAN de 2,5 Gbps, antene interne. TP-Link dă o
acoperire de până la 250 m².

### TP-Link Deco BE65 — mesh Wi-Fi 7 pentru casă
Tri-band, patru porturi de 2,5 Gbps și un USB 3.0 pe fiecare unitate. Setul de două acoperă până la
aproximativ 480 m², după TP-Link.

### ASUS RT-BE88U — pentru internet de peste 2,5 Gbps
Wi-Fi 7 pe două benzi, cu două porturi de 10 Gbps (unul SFP+ și unul Ethernet), patru de 2,5 Gbps și patru
de 1 Gbps. Are Multi-Link Operation și 4K-QAM.

[Vezi magazinele de electronice cu oferte active →](/categorii/electronice)
""",
    [
        "https://scan.co.uk/products/tp-link-archer-be550-be9300-tri-band-wi-fi-7-router-6x-antennas-tri-band-574plus2880plus5760mbps-25g",
        "https://www.jbhifi.co.nz/products/tp-link-archer-be550-tri-band-be9300-wifi-7-router (250 m2)",
        "https://www.bestbuy.ca/en-ca/product/tp-link-deco-be65-tri-band-wifi-7-mesh-system-be11000-whole-home-wifi-3-pack/19508084",
        "https://www.scan.co.uk/products/tp-link-deco-be65-be93000-wifi-7-single-4x-antenna-tri-band-574plus2880plus5760mbps-4x-25gbe-mu-mimo",
        "https://www.asus.com/gr/networking-iot-servers/wifi-routers/asus-gaming-routers/rt-be88u/",
        "https://www.everythingrf.com/community/what-is-wi-fi-7 (46 Gbps, MLO, 4K-QAM)",
        "https://www.electronics-notes.com/articles/connectivity/wifi-ieee-802-11/802-11be-wifi7.php",
    ],
)


# ─── Masina de cafea ──────────────────────────────────────────────────────────────────────────────
articol(
    "cea-mai-buna-masina-de-cafea-2026",
    "Cea mai bună mașină de cafea 2026: 5 modele pe tipuri",
    "Automat cu lapte, automat simplu, espressor manual cu râșniță sau capsule: De'Longhi Dinamica Plus și "
    "Magnifica Start, Philips 5400 LatteGo, De'Longhi La Specialista Arte și Nespresso Vertuo Pop.",
    "Electrocasnice",
    f"""
## Cea mai bună mașină de cafea în 2026

Prima alegere nu e marca, ci tipul: vrei să apeși un buton și să ai cappuccino, vrei să faci tu espresso, sau
vrei cel mai simplu aparat cu putință? Fiecare tip are alt cost pe ceașcă și altă întreținere.

{CUM_AM_ALES}

## Tipuri de mașini de cafea

- **Automat (espressor cu râșniță, „bean to cup").** Macină boabele, face espresso și, la unele modele,
  spumează laptele singur. Costul pe ceașcă e mic, dar aparatul e mai scump și trebuie decalcifiat.
- **Espressor manual cu râșniță.** Tu dozezi, tasezi și spumezi laptele; rezultatul depinde de tine.
- **Capsule.** Cel mai simplu: pui capsula și apeși. Aparatul e ieftin, capsula e mai scumpă decât boabele.
- **Cafea la filtru.** Cel mai ieftin pe ceașcă, fără presiune, fără espresso.

## 5 mașini de cafea în 2026

### De'Longhi Dinamica Plus (ECAM370.95.T) — automat, cu lapte automat
12 rețete, ecran tactil de 3,5 inchi și sistemul LatteCrema, care spumează laptele singur pentru cappuccino și
latte.

### Philips 5400 LatteGo (EP5447) — automat, ușor de curățat
12 băuturi, inclusiv cappuccino și latte macchiato. Sistemul de lapte LatteGo nu are tuburi, deci se spală
repede.

### De'Longhi Magnifica Start (ECAM220) — automat simplu
Trei băuturi la o atingere (espresso, cafea, americano), 13 trepte de măcinare și o duză de abur clasică,
pentru spumă făcută de tine.

### De'Longhi La Specialista Arte (EC9155) — espressor manual cu râșniță
Râșniță integrată cu 8 trepte și duza My LatteArt pentru microspumă, inclusiv din lapte vegetal. În cutie e
și o cană pentru lapte.

### Nespresso Vertuo Pop — capsule, cinci mărimi
Cinci mărimi de cafea, de la 40 la 355 ml, gata de folosit în circa 30 de secunde, rezervor de 600 ml. Merge
doar cu capsulele Vertuo, care au cod de bare citit de aparat.

## Înainte să cumperi

- **Calculează pe un an:** prețul aparatului plus câte cafele bei pe zi, cu prețul capsulei sau al boabelor.
- **Decalcifierea** e obligatorie la automate și espressoare; apa dură o face mai des necesară.
- **Laptele:** sistemele automate economisesc timp, dar trebuie spălate după fiecare folosire.

[Vezi magazinele pentru casă și grădină →](/categorii/casa-gradina)
""",
    [
        "https://www.delonghi.com/nl-nl/p/dinamica-plus-ecam370.95.t-dinamica-plus-automatisch-kofffiezetapparaat/ECAM370.95.T+EX%3A4.html (12 retete, 3,5\", LatteCrema)",
        "https://www.delonghi.com/en-ca/magnifica-start-espresso-machine-with-manual-milk-frother/p/ECAM22022B (3 retete, 13 trepte)",
        "https://www.philips.co.uk/c-p/EP5447_90 (5400 LatteGo, 12 bauturi)",
        "https://www.currys.co.uk/products/delonghi-la-specialista-arte-ec9155.mb-bean-to-cup-coffee-machine-stainless-steel-and-black-10229653.html",
        "https://digitec.ch/en/s1/product/delonghi-la-specialista-arte-espresso-machines-24038471 (8 trepte)",
        "https://www.nespresso.com/it/en/order/machines/vertuo/pop-black-macchina-caffe (Vertuo Pop: 5 marimi, 30 s, 600 ml)",
    ],
)


# ─── Monitor gaming ───────────────────────────────────────────────────────────────────────────────
articol(
    "cel-mai-bun-monitor-gaming-2026",
    "Cel mai bun monitor de gaming 2026: OLED sau IPS",
    "OLED la 480-500 Hz, 4K la 240 Hz sau IPS la 180 Hz: Samsung Odyssey OLED G6, ASUS ROG Swift OLED PG27AQDP, "
    "MSI MPG 272URX și ASUS ROG Strix XG27ACS, după fișa producătorului.",
    "Electronice",
    f"""
## Cel mai bun monitor de gaming în 2026

În 2026, monitoarele OLED de 27 de inchi au ajuns la 480-500 Hz, iar cele IPS de 1440p la 180 Hz au devenit
accesibile. Alegerea ține de placa video, de jocurile pe care le joci și de cât timp stă o imagine statică pe
ecran.

{CUM_AM_ALES}

## OLED, IPS sau VA

- **OLED** — contrast practic infinit și timp de răspuns de 0,03 ms. Riscul e burn-in-ul la imaginile care
  stau fixe ore întregi (bara de activități, interfața unui joc); unii producători îl acoperă în garanție.
- **IPS** — fără burn-in și mai luminos într-o cameră însorită, dar negrul pare gri în întuneric.
- **VA** — contrast mai bun decât IPS, dar mai lent în tranzițiile spre negru.

## Rezoluție și frecvență

- **1440p la 165-180 Hz** — alegerea obișnuită pentru 27 de inchi.
- **1440p la 360-500 Hz** — pentru jocuri competitive, dacă placa video scoate atâtea cadre pe secundă.
- **4K la 240 Hz** — imagine mai clară, dar cere o placă video puternică.

## 4 monitoare în 2026

### Samsung Odyssey OLED G6 (G60SF) — 500 Hz
27 de inchi, QHD, QD-OLED la 500 Hz, timp de răspuns de 0,03 ms, certificare DisplayHDR True Black 500 și
picior reglabil pe înălțime, cu rotire în portret. În anunțul Samsung: trei ani de garanție, inclusiv pentru
burn-in — verifică certificatul de garanție la magazin.

### ASUS ROG Swift OLED PG27AQDP — 480 Hz
27 de inchi, QHD, panou WOLED (LG Display) la 480 Hz, 0,03 ms și până la 1.300 de niți în HDR. A fost primul
monitor OLED de 480 Hz.

### MSI MPG 272URX — 4K la 240 Hz
27 de inchi, 4K, QD-OLED la 240 Hz, 0,03 ms. Are DisplayPort 2.1a și un port USB-C care încarcă un laptop cu
până la 98 W.

### ASUS ROG Strix XG27ACS — IPS pentru buget
27 de inchi, 1440p, Fast IPS la 180 Hz, timp de răspuns de 1 ms, compatibil G-Sync și FreeSync, cu USB-C.

[Vezi pagina de jocuri și accesorii →](/jocuri)
""",
    [
        "https://www.samsung.com/uk/business/monitors/gaming/odyssey-oled-g6-g60sf-27-inch-500hz-oled-qhd-ls27fg602suxxu/",
        "https://tftcentral.co.uk/news/samsung-launch-one-of-the-first-500hz-qd-oled-gaming-monitors-with-the-g60sf (garantie burn-in)",
        "https://rog.asus.com/uk/monitors/27-to-31-5-inches/rog-swift-oled-pg27aqdp/spec",
        "https://www.tftcentral.co.uk/news/asus-rog-swift-pg27aqdp-with-27-1440p-480hz-oled-panel-unveiled",
        "https://tftcentral.co.uk/news/msi-announce-mpg-272urx-qd-oled-with-a-27-4k-240hz-panel-and-displayport-2-1",
        "https://www.rtings.com/monitor/reviews/msi/mpg-272urx-qd-oled",
        "https://bottleneckpc.com/blog/best-1440p-gaming-monitor-2026 (XG27ACS)",
    ],
)


# ─── Camera auto (dashcam) ────────────────────────────────────────────────────────────────────────
# 07.10.2026: varianta generata avea „BlackVue DR900X-2CH — 4K fata + 4K spate" (spatele e Full HD), „Xiaomi
# 70mai A800S — cel mai vandut dashcam din Romania" (fara sursa) si Garmin Dash Cam 57 (inlocuit de seria X).
articol(
    "cel-mai-bun-dashcam-2026",
    "Cel mai bun dashcam 2026: ce contează și 3 camere auto",
    "Viofo A329, Garmin Dash Cam X310 / X210 și 70mai A810: rezoluție, senzor, unghi, mod de parcare și GPS, după "
    "fișa producătorului.",
    "Auto",
    f"""
## Cel mai bun dashcam în 2026

O cameră de bord înregistrează drumul și, cu modul de parcare, ce se întâmplă cu mașina oprită. Diferențele
dintre modele sunt la cât de clar citesc numerele de înmatriculare, mai ales noaptea, și la cât de simplu le
folosești.

{CUM_AM_ALES}

## Ce contează

- **Rezoluția și senzorul.** 4K și un senzor bun la lumină slabă (de exemplu Sony STARVIS 2) cresc șansa ca
  numărul altei mașini să se citească noaptea.
- **Unghiul de filmare.** 140-150° prind și benzile alăturate; mai mult deformează marginile.
- **Camera din spate**, dacă vrei și ce se întâmplă în spatele mașinii.
- **Modul de parcare.** De obicei cere un kit de alimentare legat la instalația mașinii.
- **GPS-ul** pune pe înregistrare locul și viteza.

## 3 camere auto în 2026

### Viofo A329 — 4K la 60 de cadre pe secundă
Prima cameră de bord cu 4K la 60 de cadre, după Viofo, cu senzor Sony STARVIS 2 (IMX678) în față. Are Wi-Fi 6,
GPS, mod de parcare hibrid și poate înregistra pe SSD extern de până la 4 TB. Varianta cu două camere are și
cameră 2K în spate.

### Garmin Dash Cam X310 / X210 — cele mai simple de folosit
X310 filmează 4K, X210 filmează 1440p; ambele au unghi de 140°, filtru polarizant Clarity care reduce
reflexiile din parbriz, control vocal, ecran tactil de 2,4 inchi, GPS și Wi-Fi.

### 70mai A810 — 4K cu ecran mare
4K în față cu senzor Sony STARVIS 2 (IMX678), unghi de 150°, ecran de 3 inchi și GPS integrat. În kitul cu două
camere, cea din spate filmează 1080p.

## Înregistrările

- O înregistrare te poate ajuta să arăți ce s-a întâmplat; cât contează ca probă decid poliția, asigurătorul
  sau instanța.
- Dacă publici un clip online, blurează fețele și numerele altor mașini: sunt date personale.
- Folosește un card de memorie făcut pentru înregistrare continuă („high endurance") și formatează-l din
  când în când din meniul camerei, cum recomandă producătorii.

[Vezi pagina auto-moto →](/moto)
""",
    [
        "https://dashcamtalk.com/viofo-a329/ (4K 60 fps, IMX678, Wi-Fi 6, SSD)",
        "https://bsta.sa/en/electronics/vehicle-electronics/dashcam/car-dash-cam/viofo-a329 (2CH: spate 2K)",
        "https://www.garmin.com/en-US/newsroom/press-release/automotive/capture-detailed-eyewitness-video-with-the-new-garmin-dash-cam-x-series/",
        "https://www.digitec.ch/en/s1/product/garmin-x310-built-in-display-built-in-microphone-wi-fi-uhd-4k-dashcams-49150218",
        "https://www.70mai.com/a810/ (A810: IMX678, 150 grade, 3\", GPS, spate 1080p)",
    ],
)


# ─── Laptop business ──────────────────────────────────────────────────────────────────────────────
articol(
    "cel-mai-bun-laptop-business-2026",
    "Cel mai bun laptop business 2026: 5 modele ușoare",
    "ThinkPad X1 Carbon Gen 14, Dell XPS 14, HP EliteBook X G2, MacBook Air M5 și ASUS Zenbook A14: greutate, "
    "autonomie anunțată și porturi, după fișa producătorului.",
    "Electronice",
    f"""
## Cel mai bun laptop business în 2026

Un laptop de lucru trebuie să fie ușor de cărat, să țină o zi întreagă pe baterie și să aibă porturile de
care ai nevoie fără adaptoare. Modelele de mai jos au fost lansate sau înnoite în 2026, cu excepția Zenbook A14.

{CUM_AM_ALES}

## Ce contează

- **Greutatea** — sub 1,4 kg se cară ușor zilnic.
- **Autonomia** — cifrele producătorilor vin din teste ușoare (video, navigare); la lucru real e mai puțin.
- **Porturile** — Thunderbolt / USB-C pentru monitor și încărcare, plus HDMI dacă prezinți des.
- **Procesorul** — Windows pe ARM (Snapdragon) ține mult pe baterie, dar unele programe sau drivere mai vechi
  pot să nu meargă; verifică-le înainte.

## 5 laptopuri business în 2026

### Lenovo ThinkPad X1 Carbon Gen 14 — sub 1 kg
996 g, procesoare Intel Core Ultra Series 3, până la 64 GB de memorie, ecran de 14 inchi IPS sau OLED 2,8K.
Are trei porturi Thunderbolt 4, USB-A și HDMI 2.1. Lenovo a mutat componente pe ambele fețe ale plăcii, pentru
răcire și reparații mai ușoare. Prezentat la CES 2026.

### Dell XPS 14 (2026) — XPS se întoarce
Dell a renunțat în 2025 la numele XPS și l-a readus în 2026. Modelul de 14 inchi are 14,6 mm grosime și 1,36 kg,
procesoare Intel Core Ultra Series 3 și ecran OLED de 2,8K la 120 Hz. Dell anunță până la 40 de ore de
autonomie în configurația cea mai economă.

### HP EliteBook X G2 — trei procesoare la alegere
Vine cu Intel (G2i), AMD (G2a) sau Qualcomm (G2q), sub 1 kg, cu ecran OLED 3K opțional. HP anunță până la 29 de
ore de autonomie. Prezentat la CES 2026.

### MacBook Air M5 — pentru macOS
Lansat în martie 2026: 1,23 kg la 13 inchi și 1,51 kg la 15 inchi, fără ventilator, până la 18 ore de autonomie
după Apple.

### ASUS Zenbook A14 — Snapdragon, cel mai ușor la buget mai mic
0,98 kg, ecran OLED de 14 inchi, procesor Snapdragon X. ASUS anunță până la 32 de ore. Fiind Windows pe ARM,
verifică întâi programele de care ai nevoie.

[Vezi pagina de laptopuri →](/laptop)
""",
    [
        "https://www.techradar.com/pro/lenovo-just-launched-the-most-powerful-sub-1kg-laptop-ever-thinkpad-x1-carbon-gen-14-sports-a-core-ultra-x7-series-3-cpu-and-weighs-996g",
        "https://www.ultrabookreview.com/74228-2026-lenovo-thinkpad-x1-x9-aura/",
        "https://www.pcworld.com/article/3020008/dell-heard-the-complaints-the-xps-is-back.html",
        "https://servethehome.com/dell-xps-14-2026-review-thin-and-light-done-right-intel/ (1,36 kg, OLED 2,8K)",
        "https://www.channelnews.com.au/ces-2026-dell-revives-xps-with-slimmer-design-longer-battery-life-and-oled-displays/ (40 h)",
        "https://justbuy.com.ua/en/news/elitebook-x-g2a-g2i-g2q (EliteBook X G2: sub 1 kg, 29 h, OLED 3K)",
        "https://gigazine.net/gsc_news/en/20260304-apple-m5-macbook-air (MacBook Air M5)",
        "https://www.notebookcheck.net/Asus-Zenbook-A14-laptop-review.955023.0.html (Zenbook A14)",
    ],
)

# ─── Cum alegi un laptop ──────────────────────────────────────────────────────────────────────────
articol(
    "cum-alegi-un-laptop-2026",
    "Cum alegi un laptop în 2026: ghid pe tipuri de folosire",
    "Procesor, memorie, stocare și ecran: ce îți trebuie pentru birou, școală, editare foto-video sau jocuri, și "
    "ce să eviți la un laptop în 2026.",
    "Electronice",
    """
## Cum alegi un laptop în 2026

Întrebarea de la care pornești nu e „ce procesor", ci „ce faci cu el". Un laptop de birou și unul de jocuri
diferă în aproape tot: greutate, autonomie, placă video, preț.

> **Cum am făcut ghidul.** Regulile de mai jos vin din fișele producătorilor și din cerințele publicate (de
> exemplu, ale Microsoft pentru PC-urile Copilot+). Nu recomandăm o marcă în locul alteia.

## Pe tipuri de folosire

### Navigare, email, filme, școală
- Memorie RAM: 16 GB, ca laptopul să nu încetinească în câțiva ani; 8 GB doar dacă folosești strictul necesar.
- Stocare: SSD de 256-512 GB.
- Ecran: cel puțin 1920 × 1080 (sau 1920 × 1200).

### Birou, Excel, întâlniri video, multe programe deschise
- Memorie RAM: 16 GB sau mai mult.
- Stocare: SSD de 512 GB.
- Autonomie și greutate: aici contează cel mai mult — vezi și ghidul nostru despre laptopurile de business.

### Editare foto și video
- Memorie RAM: 32 GB.
- Ecran cu acoperire mare a spațiului de culoare (sRGB sau DCI-P3 aproape de 100%).
- Placă video dedicată sau un procesor cu grafică puternică.

### Jocuri
- Placă video dedicată — în 2026, laptopurile noi au plăci RTX 50; detalii în ghidul nostru despre laptopurile
  de gaming.
- Ecran de 144 Hz sau mai mult.

## PC-urile „Copilot+"

Microsoft cere pentru eticheta Copilot+ cel puțin 16 GB de RAM, 256 GB de SSD și un procesor cu unitate pentru
inteligență artificială (NPU) de minimum 40 TOPS. Eticheta contează doar dacă vrei funcțiile AI din Windows care
rulează local.

## Ce să eviți

- **Stocare eMMC** în loc de SSD — e mult mai lentă și de obicei mică.
- **8 GB de RAM lipiți pe placă** la un laptop cu Windows pe care vrei să-l ții mulți ani — nu se mai pot mări.
- **Ecran de 1366 × 768** — rezoluție depășită.

[Vezi pagina de laptopuri →](/laptop)
""",
    [
        "https://support.microsoft.com/en-au/topic/copilot-pc-hardware-requirements-35782169-6eab-4d63-a5c5-c498c3037364 (Copilot+: 16 GB, 256 GB, NPU 40+ TOPS)",
        "https://box.co.uk/blog/nvidia-50-series-laptop-gpu-vram-guide (RTX 50 pe laptop)",
    ],
)


# ─── Aspirator vertical fara fir ──────────────────────────────────────────────────────────────────
articol(
    "cel-mai-bun-aspirator-2026",
    "Cel mai bun aspirator vertical fără fir 2026: 5 modele",
    "Dyson V16 Piston Animal și V15 Detect, Samsung Bespoke Jet AI, Dreame Z30 și Rowenta X-Force Flex 15.60: "
    "putere, autonomie anunțată și pentru ce casă e fiecare.",
    "Casa",
    f"""
## Cel mai bun aspirator vertical fără fir în 2026

În multe apartamente, aspiratorul vertical fără fir a înlocuit aspiratorul cu fir: îl scoți din colț, aspiri
și îl pui înapoi la încărcat. Dacă vrei unul care merge singur, vezi
[ghidul nostru despre aspiratoarele robot](/blog/cel-mai-bun-aspirator-robot-2026).

{CUM_AM_ALES}

## Ce contează

- **Puterea.** Producătorii o dau în AW sau în wați, măsurate fiecare altfel — compară doar între modele ale
  aceleiași mărci.
- **Autonomia.** Cifra anunțată e în modul cel mai slab; în modul maxim scade mult.
- **Bateria detașabilă.** La unele modele poți cumpăra a doua baterie, ca să aspiri o casă mare dintr-o dată.
- **Greutatea**, dacă aspiri des scările sau plafonul.
- **Peria** care nu încâlcește părul, dacă ai animale sau păr lung în casă.

## 5 aspiratoare verticale fără fir în 2026

### Dyson V16 Piston Animal — cel mai puternic Dyson
Lansat în octombrie 2025: motor Hyperdymium de 900 W, 315 AW, până la 70 de minute, recipient de 1,3 litri și
filtrare de 99,99% a particulelor de 0,1 microni.

### Dyson V15 Detect — vede praful
Un laser luminează praful fin de pe podea, iar un senzor numără particulele și ajustează puterea. Până la 60 de
minute de autonomie.

### Samsung Bespoke Jet AI — autonomia cea mai mare
Până la 280 W putere de aspirare și până la 100 de minute pe o baterie — cea mai lungă autonomie pe o singură
baterie la un aspirator vertical, după Samsung. Își ajustează puterea după tipul de podea.

### Dreame Z30 — putere mare, autonomie lungă
310 AW, până la 90 de minute de autonomie și filtrare de 99,99% a particulelor de 0,1 microni.

### Rowenta X-Force Flex 15.60 Aqua — aspiră și spală
230 AW, până la 80 de minute, 3,2 kg. Tubul se îndoaie (Flex) ca să intri sub mobilă fără să te apleci, iar
capul Aqua aspiră și spală pardoseala în aceeași trecere.

[Vezi magazinele pentru casă și grădină →](/categorii/casa-gradina)
""",
    [
        "https://www.dyson.com/vacuum-cleaners/cordless/v16-piston/black-copper (V16 Piston Animal)",
        "https://techradar.com/home/vacuums/dyson-v16-piston-animal-cordless-vacuum-review",
        "https://www.dyson.com/vacuum-cleaners/sticks/dyson-v15-stick/v15-detect-yellow-iron (V15 Detect)",
        "https://news.samsung.com/global/samsung-announces-global-launch-of-bespoke-jet-ai-the-worlds-first-ul-verified-ai-powered-cordless-stick-vacuum",
        "https://dreametech.com/products/z30-cordless-stick-vacuum (Z30: 310 AW, 90 min)",
        "https://dateks.lv/en/cenas/puteklu-suceji/1004474-rowenta-x-force-flex-15-60-32-4v-black-bronze (X-Force Flex 15.60)",
    ],
)


# ─── Moda si calatorie (08.10) ───────────────────────────────────────────────────────────────────
# Articolele vechi aveau fapte gresite, nu doar modele vechi: bagajul gratuit Wizz „40x20x25" (e 40x30x20 din
# 01.11.2025), „TSA lock obligatoriu pentru SUA" (nu e obligatoriu), Air Force 1 „50+ ani de istorie" (e din 1982),
# „UV400 = standard minim" (in UE cerinta e standardul EN ISO 12312-1 si marcajul CE). Ofertele de sub articole vin
# din feed (temele pantofi-sport, ochelari-soare, trolere).
CUM_AM_ALES_MODA = (
    "> **Cum am scris ghidul.** Nu am purtat produsele. Am pornit de la regulile oficiale (companii aeriene, standarde "
    "europene) și de la informațiile producătorilor. Prețurile se schimbă des, așa că nu le scriem aici: le vezi la magazin."
)

articol(
    "cel-mai-bun-troller-2026",
    "Cel mai bun troler 2026: dimensiuni pentru Ryanair și Wizz",
    "Ce intră gratuit la Ryanair și Wizz Air în 2026, ce troler de cabină cere Priority, carcasă rigidă sau "
    "textilă și ce contează la roți și greutate.",
    "Calatorie",
    f"""
## Cel mai bun troler în 2026: începe cu dimensiunile

Cel mai scump troler e cel pe care îl plătești a doua oară la poartă, ca bagaj de cală. Înainte de material și
de marcă, contează dacă încape în regulile companiei cu care zbori.

{CUM_AM_ALES_MODA}

## Ce intră în avion în 2026

- **Bagajul gratuit, sub scaun:** 40×30×20 cm, atât la Ryanair, cât și la Wizz Air. La Wizz Air dimensiunea e
  valabilă din 1 noiembrie 2025, iar greutatea maximă e de 10 kg. Dimensiunea veche de 40×20×25 cm încă apare în
  reclamele unor genți „pentru Ryanair".
- **Trolerul de cabină:** la Ryanair, 55×40×20 cm și maximum 10 kg, doar cu Priority; la Wizz Air, 55×40×23 cm și
  maximum 10 kg, doar cu WIZZ Priority. Un troler de 23 cm adâncime, bun pentru Wizz, nu intră în limita de 20 cm
  de la Ryanair.
- **Regulile se schimbă.** Verifică pe site-ul companiei înainte de fiecare zbor; dimensiunile se măsoară la poartă,
  de obicei cu roțile și mânerele incluse.

## Ce contează la troler

- **Greutatea goală.** Cele 10 kg includ trolerul. Un troler de cabină de 3 kg îți lasă 7 kg pentru haine.
- **Carcasă rigidă sau textilă.** Policarbonatul rezistă la lovituri și ploaie; carcasa textilă are buzunare
  exterioare și se mai lasă la presare în cutia de măsurat — dar nu mai mult decât limita.
- **Roțile.** Patru roți duble (opt în total) merg ușor pe aeroport; două roți mari trec mai bine peste borduri și
  pietre cubice.
- **Lacătul TSA.** Nu e obligatoriu. E util dacă zbori în SUA: agenții de securitate americani îl pot deschide cu
  o cheie universală, deci de obicei nu trebuie tăiat.
- **Expandabil.** Fermoarul de extensie adaugă volum, dar și adâncime — un troler extins poate ieși din limita de
  cabină.

## Cabină sau cală?

- **Cabina** (55 cm) ajunge pentru un weekend sau o săptămână, dacă împachetezi atent.
- **Cala, mărime medie** (în jur de 65–70 cm) pentru una-două săptămâni.
- **Cala, mărime mare** (în jur de 75–80 cm) pentru familii și călătorii lungi — atenție la limita de greutate a
  bagajului de cală, care diferă de la o companie la alta.

[Vezi magazinele pentru călătorii →](/categorii/calatorii)
""",
    [
        "https://ssr-weu2.wizzair.com/en-gb/help-centre/booking-information-and-services/baggage/baggage-allowance/cabin-baggage",
        "https://www.which.co.uk/news/article/ryanair-hand-luggage-size-set-to-increase-a1CGn5z4rcvN (Ryanair 40x30x20)",
        "https://www.titan-bags.com/en/help-contact/cabin-size-guide/ryanair (Ryanair 55x40x20, 10 kg, Priority)",
        "https://loudavymkrokem.cz/en/wizz-air-luggage/ (Wizz: 40x30x20 din 01.11.2025; 55x40x23 cu Priority)",
        "https://tsa.gov/blog/2014/02/18/tsa-travel-tips-tuesday-tsa-recognized-locks (lacatele TSA)",
    ],
)

articol(
    "cele-mai-bune-adidasi-2026",
    "Cei mai buni adidași 2026: alergare și casual",
    "Ce contează la adidașii de alergare (amortizare, drop, teren) și trei modele casual cu istorie: Nike Air "
    "Force 1, Adidas Samba și New Balance 9060.",
    "Fashion",
    f"""
## Cei mai buni adidași în 2026

Adidașii de alergare și cei de stradă se aleg diferit: primii după pas, teren și distanță, ceilalți după stil și
confort la purtare toată ziua.

{CUM_AM_ALES_MODA}

## Pentru alergare: ce contează

- **Terenul.** Pe asfalt merg adidașii de șosea; pe potecă ai nevoie de modele de trail, cu talpă cu crampoane
  și protecție la vârf.
- **Amortizarea.** Mai multă spumă înseamnă impact mai blând pe distanțe lungi, dar și o pereche mai înaltă și,
  de obicei, mai grea.
- **Drop-ul** — diferența de înălțime dintre călcâi și vârf, în milimetri, trecută de producător în fișă. Dacă ești
  obișnuit cu un drop mare, trece treptat la unul mic.
- **Mărimea.** La alergare piciorul se umflă; mulți producători recomandă un spațiu de aproximativ un deget în
  fața degetului mare. Cel mai sigur e să îi probezi.

## Trei modele casual cu istorie

### Nike Air Force 1 — din 1982
Proiectat de Bruce Kilgore și lansat în 1982, a fost primul pantof de baschet Nike cu tehnologia Air. Varianta
albă, joasă, e de zeci de ani una dintre cele mai purtate perechi de adidași de stradă.

### Adidas Samba — din fotbalul anilor '50
Lansat de adidas în anii '50 ca pantof de fotbal, cu talpă din cauciuc pentru aderență pe teren înghețat; azi e
purtat aproape numai ca pantof de stradă, cu profil jos.

### New Balance 9060 — din 2022
Lansat în iulie 2022, pornind de la seria 99X a New Balance: talpă înaltă, cu linii inspirate din modelele de
alergare de la începutul anilor 2000.

## Cum alegi perechea de stradă

- **Pielea** se curăță ușor și ține mai mult; **textilul și plasa** sunt mai ușoare și mai răcoroase.
- **Talpa înaltă** (ca la 9060) adaugă câțiva centimetri și confort; **talpa joasă** (Samba) e mai ușoară.
- La comenzile online ai, prin lege, 14 zile ca să returnezi perechea; termenul exact și cine plătește transportul
  sunt în condițiile magazinului.

[Vezi magazinele de modă →](/categorii/fashion)
""",
    [
        "https://www.nike.com/air-force-1 (1982, Bruce Kilgore, primul pantof de baschet Nike cu Air)",
        "https://garage.com.ph/2022/07/21/new-balance-puts-its-best-foot-forward-with-new-silhouette-the-9060/ (9060, iulie 2022)",
        "https://www.guap.co/p/new-balance-release-their-latest-silhouette-the-9060 (inspirat din seria 99X)",
        "https://www.adidas.co.uk/go/campaign/originals/archive/samba (Samba, anii '50, talpa pentru teren inghetat)",
        "https://eur-lex.europa.eu/eli/dir/2011/83/oj (Directiva 2011/83/UE, retur in 14 zile)",
    ],
)

articol(
    "cele-mai-bune-ochelari-soare-2026",
    "Cei mai buni ochelari de soare 2026: categorii și UV",
    "Ce înseamnă categoriile 0–4 de pe ochelarii de soare, de ce categoria 4 nu e voie la volan, ce aduc lentilele "
    "polarizate și ce să cauți pe etichetă.",
    "Fashion",
    f"""
## Cei mai buni ochelari de soare în 2026

O lentilă închisă la culoare nu înseamnă automat protecție. Ce contează e scris pe etichetă: categoria filtrului,
marcajul CE și filtrarea UV.

{CUM_AM_ALES_MODA}

## Categoriile de filtru (standardul EN ISO 12312-1)

În UE, ochelarii de soare de uz general sunt încadrați după cât din lumina vizibilă lasă să treacă:

- **Categoria 0** — peste 80%: lentile aproape transparente, pentru confort, nu pentru soare.
- **Categoria 1** — între 43% și 80%: soare slab.
- **Categoria 2** — între 18% și 43%: soare mediu, potrivită pentru oraș.
- **Categoria 3** — între 8% și 18%: soare puternic, plajă, munte vara.
- **Categoria 4** — între 3% și 8%: zăpadă, ghețar, mare. **Nu e voie la volan**: standardul permite pentru
  condus doar categoriile 0–3.

Categoria trebuie trecută pe produs sau pe etichetă, alături de marcajul CE.

## UV400 și polarizare

- **UV400** e o mențiune comercială: lentila filtrează radiația ultravioletă până la 400 nm. Nu înlocuiește
  categoria și marcajul CE — caută-le pe toate.
- **Lentilele polarizate** reduc reflexiile de pe apă, asfalt ud sau zăpadă. Pot face mai greu de citit unele
  ecrane (telefon, bord), care folosesc și ele lumină polarizată.

## Cum alegi

- **Pentru condus:** categoria 2 sau 3, niciodată 4.
- **Pentru munte și zăpadă:** categoria 3 sau 4, cu ramă care acoperă bine lateralele.
- **Pentru copii:** modele făcute pentru fața lor, cu aceleași mențiuni pe etichetă.
- **Dacă porți ochelari de vedere:** lentile de soare cu dioptrii, la optician.

[Vezi magazinele de modă →](/categorii/fashion)
""",
    [
        "https://www.college-optometrists.org/clinical-guidance/guidance/knowledge,-skills-and-performance/examining-patients-who-drive/tints-and-driving (categoriile si condusul)",
        "https://webstore.ansi.org/preview-pages/ISO/preview_ISO+12312-1-2022.pdf (ISO 12312-1)",
        "https://www.sgs.com/en-fr/services/ppe-protective-eyewear (ochelarii de soare = echipament de protectie, marcaj CE)",
    ],
)


# ─── Copii si frumusete (08.10) ──────────────────────────────────────────────────────────────────
# Gresit in vechile articole: LEGO Mindstorms recomandat (retras la sfarsitul lui 2022), „cercetarile arata" fara
# sursa, „cel mai studiat ser din lume", concentratiile EDP/EDT date ca fapt (sunt conventie, nu lege), „cel mai
# popular in Romania" fara date. Aici: regulile UE (jucarii, cosmetice) + criterii; produsele vin din feed sub articol.
CUM_AM_ALES_GHID = (
    "> **Cum am scris ghidul.** Nu am folosit produsele. Am pornit de la regulile europene și de la informațiile "
    "producătorilor, iar prețurile nu le scriem: se schimbă des și le vezi la magazin."
)

articol(
    "cele-mai-bune-jucarii-educative-2026",
    "Cele mai bune jucării educative 2026: pe vârste",
    "Ce jucării se potrivesc fiecărei vârste, ce înseamnă avertismentul „nu este potrivit pentru copii sub 36 de "
    "luni” și ce a înlocuit LEGO Mindstorms.",
    "Copii",
    f"""
## Cele mai bune jucării educative în 2026

O jucărie e „educativă” când se potrivește vârstei: prea simplă plictisește, prea grea descurajează. Vârsta de pe
cutie e primul filtru — și, pentru cei mici, una de siguranță.

{CUM_AM_ALES_GHID}

## Înainte de orice: vârsta de pe cutie

- **„Nu este potrivit pentru copii sub 36 de luni”** (sau simbolul cu un copil tăiat) înseamnă de obicei piese
  mici, care se pot înghiți. E un avertisment de siguranță cerut de legea UE, nu o recomandare de dificultate.
- **Marcajul CE** e obligatoriu pe jucăriile vândute în UE.
- Din august 2030 se aplică noul regulament european al jucăriilor (UE 2025/2509), cu reguli mai stricte pentru
  substanțe chimice și pentru jucăriile conectate la internet. Până atunci rămân valabile regulile actuale.

## Pe vârste

### Până la 2 ani — simțuri și mișcare
Jucării de apucat, cu texturi și sunete, cărți din material moale sau carton gros, cuburi mari. Fără piese mici și
fără baterii cu acces ușor.

### 2–5 ani — construcții și potriviri
Cuburi mari de construcție (LEGO DUPLO, de exemplu, sunt făcute pentru copiii mici), puzzle-uri cu piese mari,
sortatoare de forme, instrumente muzicale simple.

### 5–8 ani — reguli și răbdare
Seturi de construcție după instrucțiuni, jocuri de societate cu reguli scurte (Blokus, Ubongo), primele seturi de
experimente, puzzle-uri de 100–300 de piese.

### 8–12 ani — logică, robotică, programare
Seturi de robotică programabile și jocuri de strategie (Catan, Ticket to Ride). LEGO Mindstorms nu se mai fabrică:
LEGO a retras seria la sfârșitul lui 2022, iar robotica a rămas în gama LEGO Education. Pentru programare fără
cumpărături, Scratch e gratuit, în browser.

## Cum alegi

- **După copil, nu după vârsta exactă.** Intervalul de pe cutie e orientativ pentru dificultate, dar obligatoriu
  când e vorba de piesele mici.
- **Jocurile de societate** se joacă împreună; cele cu partide scurte țin atenția celor mici.
- **Bateriile tip pastilă** trebuie să stea într-un compartiment închis cu șurub — sunt periculoase la înghițire.

[Vezi magazinele pentru copii →](/categorii/copii)
""",
    [
        "https://www.legislation.gov.uk/eudr/2009/48/chapter/III (Directiva 2009/48/CE, avertismentul pentru sub 36 de luni)",
        "https://www.cps.bureauveritas.com/newsroom/eu-toy-safety-regulation-20252509-published (Reg. UE 2025/2509, aplicabil din 01.08.2030)",
        "https://brickset.com/article/84219/lego-mindstorms-to-be-discontinued (Mindstorms retras la sfarsitul lui 2022)",
        "https://scratch.mit.edu (Scratch, gratuit)",
    ],
)

articol(
    "cel-mai-bun-ser-fata-2026",
    "Cel mai bun ser de față 2026: ce ingredient pentru ce",
    "Vitamina C, retinol, niacinamidă, acid hialuronic: ce promit, cum le folosești și ce s-a schimbat în UE la "
    "vitamina A din cosmetice.",
    "Beauty",
    f"""
## Cel mai bun ser de față în 2026

Un ser se alege după ingredientul principal, nu după marcă. Mai jos, ce urmăresc de obicei producătorii cu fiecare
ingredient și ce trebuie să știi înainte să-l pui pe față.

{CUM_AM_ALES_GHID}

## Ingredientele, pe scurt

### Vitamina C
Folosită pentru luminozitate și pentru un ten mai uniform; e un antioxidant. Se aplică de obicei dimineața, sub
cremă și protecție solară. Forma pură (acid ascorbic) se oxidează la aer și lumină — de aceea vine des în sticle
închise la culoare.

### Retinol (vitamina A)
Folosit pentru riduri fine și textura pielii. Se aplică seara, începând cu puțin și rar, pentru că poate irita.
**Din 1 noiembrie 2025**, produsele noi din UE pot avea cel mult 0,3% vitamina A (echivalent retinol) — 0,05% în
loțiunile de corp — și poartă mențiunea „Conține vitamina A”. Dacă ești însărcinată, întreabă medicul înainte de
produse cu retinoizi.

### Niacinamidă
Folosită pentru pori, sebum și roșeață; e de obicei bine tolerată și se poate combina cu majoritatea ingredientelor.

### Acid hialuronic
Atrage apa în stratul superficial al pielii. Se aplică pe pielea ușor umedă și se „închide” cu o cremă.

## Reguli simple

- **Un ingredient nou pe rând**, ca să știi ce te irită, dacă ceva te irită.
- **Testează întâi pe o zonă mică.** Academia Americană de Dermatologie recomandă interiorul brațului sau
  plica cotului, de două ori pe zi, 7–10 zile; dacă apar roșeață sau mâncărime, renunță la produs.
- **Protecție solară ziua**, mai ales cu retinol sau acizi exfolianți.
- Retinolul și acizii exfolianți (AHA/BHA) în aceeași seară pot irita; mulți dermatologi îi recomandă în seri
  diferite.

[Vezi magazinele de frumusețe →](/categorii/beauty)
""",
    [
        "https://cosmeticobs.com/en/articles/news-59/regulation-2024996-restrictions-on-vitamin-a-arbutin-and-6-endocrine-disruptors-8029 (Reg. UE 2024/996, vitamina A)",
        "https://news.ceway.eu/understanding-eu-regulation-2024-996-essential-updates-for-cosmetic-ingredients/ (0,3% / 0,05%, de la 01.11.2025)",
        "https://www.aad.org/public/everyday-care/skin-care-secrets/prevent-skin-problems/test-skin-care-products (testul pe zona mica, 7-10 zile)",
        "https://www.aad.org/public/everyday-care/skin-care-basics/care/apply-skin-care-certain-order (ordinea aplicarii)",
    ],
)

TEXT_PARFUM_ALERGENI = (
    "- **Alergenii de parfum** sunt trecuți pe ambalaj, după lista de ingrediente, când depășesc 0,001% (produse "
    "care rămân pe piele). Din 31 iulie 2026, lista din UE crește la aproximativ 80 de substanțe pentru produsele "
    "noi. Dacă ai o alergie cunoscută, caută-o acolo."
)

articol(
    "cel-mai-bun-parfum-femei-2026",
    "Cele mai bune parfumuri pentru femei 2026: cum alegi",
    "Eau de Parfum sau Eau de Toilette, familiile olfactive, cum testezi un parfum pe piele și ce scrie pe "
    "ambalaj despre alergeni.",
    "Beauty",
    f"""
## Cum alegi un parfum pentru femei în 2026

Un parfum se alege pe piele, nu din listă: aceleași note miros diferit pe persoane diferite. Ce poți afla dinainte
e cât de intens e și din ce familie face parte.

{CUM_AM_ALES_GHID}

## Eau de Parfum, Eau de Toilette, Extrait

Denumirile nu sunt definite de lege; sunt o convenție a industriei. De regulă, **Extrait / Parfum** are cea mai
mare concentrație de esențe, urmat de **Eau de Parfum** și apoi de **Eau de Toilette**. Concentrația mai mare
înseamnă de obicei un parfum care ține mai mult, dar durata depinde și de note și de piele.

## Familiile olfactive

- **Florale** — trandafir, iasomie, bujor: cea mai mare familie la parfumurile pentru femei.
- **Gurmande** — vanilie, caramel, cafea, praline: dulci, potrivite seara și iarna.
- **Lemnoase și chypre** — paciuli, mușchi de stejar, santal: mai sobre, de birou sau de toamnă.
- **Fresh și citrice** — bergamotă, lămâie, note marine: ușoare, pentru vară și zi.

## Cum testezi

- Pe încheietură, nu doar pe bandeletă, și lasă-l măcar o jumătate de oră: notele de bază apar după cele de vârf.
- Cel mult două-trei parfumuri o dată; nasul obosește.
- Cumpără mostre sau flacoane mici înainte de unul mare.
{TEXT_PARFUM_ALERGENI}
- Cumpără de la magazine care vând produsul oficial; la retur, legea îți dă 14 zile pentru comenzile online, dar
  un flacon desigilat poate fi exclus din motive de igienă — citește condițiile magazinului.

[Vezi magazinele de parfumuri și frumusețe →](/categorii/beauty)
""",
    [
        "https://coslaw.eu/more-allergens-to-be-individually-labelled-cosmetics/ (Reg. UE 2023/1545, alergenii de parfum)",
        "https://news.ceway.eu/eu-fragrance-allergen-labelling-what-beauty-brands-need-to-do-before-july-31-2026/ (31.07.2026 / 31.07.2028, 0,001% / 0,01%)",
        "https://eur-lex.europa.eu/eli/dir/2011/83/oj (Directiva 2011/83/UE: 14 zile, exceptia pentru produse desigilate din motive de igiena)",
    ],
)

articol(
    "cel-mai-bun-parfum-barbati-2026",
    "Cele mai bune parfumuri pentru bărbați 2026: cum alegi",
    "Eau de Toilette sau Eau de Parfum, familiile lemnoase, aromatice și fresh, cum testezi un parfum pe piele și "
    "ce înseamnă alergenii de pe ambalaj.",
    "Beauty",
    f"""
## Cum alegi un parfum pentru bărbați în 2026

Același parfum miroase diferit pe pielea fiecăruia, așa că lista de note e doar punctul de plecare. Ce poți
compara dinainte: intensitatea și familia.

{CUM_AM_ALES_GHID}

## EDT, EDP, Parfum

Nu sunt termeni definiți de lege, ci convenția industriei: **Eau de Toilette** e de obicei mai ușoară, **Eau de
Parfum** mai concentrată, iar **Parfum / Extrait** cea mai concentrată. La parfumurile pentru bărbați, multe
modele cunoscute există în mai multe concentrații, cu același nume — verifică pe flacon ce cumperi.

## Familiile cele mai întâlnite

- **Aromatice și fougère** — lavandă, ierburi, mușchi: clasice, de zi și de birou.
- **Lemnoase** — cedru, vetiver, santal: calde, potrivite toamna și seara.
- **Fresh, citrice și acvatice** — bergamotă, grapefruit, note marine: ușoare, pentru vară.
- **Ambrate și condimentate** — piper, cardamom, tutun, vanilie: intense, pentru seară și iarnă.

## Cum testezi și cum cumperi

- Pe piele, nu doar pe bandeletă; așteaptă cel puțin jumătate de oră până la notele de bază.
- Două-trei parfumuri pe zi, maximum; după aceea nu mai simți diferențele.
- Un flacon mic sau o mostră înainte de un flacon mare.
{TEXT_PARFUM_ALERGENI}

[Vezi magazinele de parfumuri și frumusețe →](/categorii/beauty)
""",
    [
        "https://coslaw.eu/more-allergens-to-be-individually-labelled-cosmetics/ (Reg. UE 2023/1545, alergenii de parfum)",
        "https://news.ceway.eu/eu-fragrance-allergen-labelling-what-beauty-brands-need-to-do-before-july-31-2026/ (31.07.2026, 0,001%)",
    ],
)


# ─── Electrocasnice mari si genti (08.10) ────────────────────────────────────────────────────────
# Frigiderul si masina de spalat recomandau „minim A+, ideal A++" si „A-10%" — clase care nu mai exista din
# 1 martie 2021 (eticheta UE rescalata la A-G); genti: „pielea dureaza 10+ ani, eco 2-3 ani", „40-70% reducere"
# fara sursa. Partenerii aproape nu au frigidere/masini de spalat in feed, deci aici ghidul e eticheta, nu modelul.
SURSE_ETICHETA = [
    "https://commission.europa.eu/system/files/2021-04/rescaled_eu_energy_labels_and_transition_period.pdf (rescalarea A-G din 01.03.2021)",
    "https://commission.europa.eu/news/focus-improved-eu-energy-label-paving-way-more-innovative-and-energy-efficient-products-2021-02-16_bg (EPREL, cod QR)",
    "https://eprel.ec.europa.eu (baza de date EPREL)",
]

articol(
    "cel-mai-bun-frigider-2026",
    "Cel mai bun frigider 2026: cum citești eticheta energetică",
    "Clasele A+ și A++ nu mai există din 2021: cum citești eticheta energetică nouă, ce înseamnă No Frost, "
    "volumul util și clasa de zgomot.",
    "Electrocasnice",
    f"""
## Cel mai bun frigider în 2026: întâi eticheta

Un frigider merge zi și noapte ani la rând, așa că eticheta energetică spune mai mult decât reclama. Dacă un
articol sau un vânzător îți vorbește încă de „A++”, informația e veche.

{CUM_AM_ALES_GHID}

## Eticheta nouă, din 1 martie 2021

- **Scala e din nou A–G.** Clasele A+, A++ și A+++ au dispărut. La rescalare, clasa A a fost lăsată aproape goală,
  pentru produsele viitoare; frigiderele foarte eficiente de azi sunt de obicei în clasele B, C sau D.
- **Consumul anual, în kWh**, e cifra care contează pentru factură — compară-l între modele de aceeași mărime.
- **Volumul** e dat separat pentru frigider și congelator, în litri.
- **Zgomotul** e dat în decibeli și cu o clasă de zgomot; contează dacă bucătăria e deschisă spre living.
- **Codul QR** de pe etichetă duce în baza de date europeană EPREL, la fișa oficială a modelului.

## Ce mai contează

- **No Frost** — aerul circulă și gheața nu se mai depune, deci nu mai dezgheți manual.
- **Dimensiunile reale și spațiul din jur.** Producătorii cer de obicei câțiva centimetri liberi în spate și
  deasupra pentru aerisire; îi găsești în manualul de instalare.
- **Incorporabil sau liber.** Un frigider incorporabil intră în mobilă și are alte dimensiuni decât unul liber.
- **Garanția** e cea legală plus ce oferă producătorul; unii producători dau garanție separată, mai lungă, pentru
  compresor — e trecută în certificatul de garanție.

[Vezi magazinele de electrocasnice →](/categorii/electronice)
""",
    SURSE_ETICHETA,
)

articol(
    "cea-mai-buna-masina-de-spalat-2026",
    "Cea mai bună mașină de spălat 2026: eticheta, pe înțeles",
    "Ce înseamnă eticheta energetică nouă la mașinile de spălat: kWh la 100 de cicluri, apă pe ciclu, programul "
    "Eco 40-60, clasa de zgomot la centrifugare și capacitatea potrivită.",
    "Electrocasnice",
    f"""
## Cea mai bună mașină de spălat în 2026

Pe eticheta energetică a unei mașini de spălat sunt toate cifrele pe care le compari între modele. Din martie 2021
arată altfel decât înainte — clasele de tip „A+++ -10%” nu mai există.

{CUM_AM_ALES_GHID}

## Ce scrie pe eticheta nouă

- **Clasa energetică, de la A la G.** Scala a fost rescalată în 2021, iar clasa A a fost lăsată aproape goală, pentru
  produsele viitoare.
- **Energia la 100 de cicluri**, în kWh, măsurată pe programul **Eco 40-60** (înainte se dădea pe an, la 220 de
  cicluri). Valoarea e o medie între încărcare un sfert, pe jumătate și plină.
- **Apa pe ciclu**, în litri, tot pe Eco 40-60.
- **Durata programului Eco 40-60** la capacitate maximă — de obicei lungă; așa economisește energie.
- **Capacitatea**, în kg, și **clasa de eficiență a centrifugării**.
- **Zgomotul la centrifugare**, în decibeli, cu o clasă de zgomot.
- **Codul QR** duce în baza de date europeană EPREL, la fișa oficială a modelului.

## Ce capacitate îți trebuie

Capacitatea de pe etichetă e pentru încărcare plină, la bumbac. O mașină prea mare, folosită pe jumătate, nu
economisește; una prea mică te pune să speli de două ori. Gândește-te la câte rufe aduni între două spălări,
nu doar la câte persoane sunteți.

## Ce mai contează

- **Turația de centrifugare** — o turație mai mare lasă rufele mai uscate, dar e mai dură cu țesăturile delicate.
- **Dimensiunile** — cele înguste (adâncime mică) intră în băi mici, dar au de obicei capacitate mai mică.
- **Uscarea** — o mașină de spălat cu uscător ocupă un singur loc, dar are capacități diferite la spălare și la
  uscare; ambele sunt pe etichetă.

[Vezi magazinele de electrocasnice →](/categorii/electronice)
""",
    SURSE_ETICHETA + [
        "https://www.bosch-home.com/mt/bosch-innovations/energy-label/current (eticheta masinii de spalat: 100 de cicluri, Eco 40-60, zgomot)",
    ],
)

articol(
    "cele-mai-bune-genti-dama-2026",
    "Cele mai bune genți de damă 2026: tipuri și materiale",
    "Tote, crossbody, rucsac sau plic: ce geantă pentru ce folosință, piele naturală sau sintetică și ce verifici "
    "la cusături, fermoare și dimensiuni.",
    "Fashion",
    f"""
## Cum alegi o geantă de damă în 2026

O geantă bună e cea pe care o folosești zilnic fără să te gândești la ea: încape ce cari, se închide sigur și nu
te doare umărul. Marca vine abia după.

{CUM_AM_ALES_GHID}

## Tipuri, după folosință

- **Tote** — mare, deschisă sau cu fermoar, pentru birou: laptop, dosare, sticlă de apă. Verifică dimensiunea
  interioară dacă vrei să intre laptopul.
- **Crossbody** — mică, purtată pe diagonală: mâinile libere, iar în aglomerație o poți ține în fața ta.
- **Rucsac** — când cari greu: împarte greutatea pe ambii umeri.
- **Plic (clutch)** — pentru seară: telefon, chei, card.

## Materiale

- **Piele naturală** — rezistentă, se poate îngriji și repara; se zgârie și se pătează mai ușor la culorile
  deschise.
- **„Piele ecologică”** — de obicei material sintetic (poliuretan sau PVC), nu piele. E mai ușoară și mai ieftină;
  durata depinde mult de calitatea materialului.
- **Textil** (canvas, nailon) — ușor, potrivit pentru zilnic și călătorii.

## Ce verifici la produs

- **Cusăturile** — drepte, dese, fără fire ieșite, mai ales la prinderea mânerelor.
- **Fermoarele și închizătorile** — se deschid ușor, fără să agațe.
- **Dimensiunile și greutatea goală** — sunt în fișa produsului; o geantă grea goală e grea toată ziua.
- **Returul** — la comenzile online ai, prin lege, 14 zile ca să te răzgândești; condițiile exacte sunt pe
  site-ul magazinului.

[Vezi magazinele de modă →](/categorii/fashion)
""",
    [
        "https://eur-lex.europa.eu/eli/dir/2011/83/oj (Directiva 2011/83/UE, retur in 14 zile)",
        "https://en.wikipedia.org/wiki/Artificial_leather (pielea ecologica = material sintetic, PU sau PVC)",
    ],
)


# ─── Reguli oficiale: avion, drone, biciclete, masina (08.10) ───────────────────────────────────
# Articole unde informatia utila e chiar regula (si unde o regula gresita costa: power bank confiscat, amenda,
# drona neinregistrata). Fiecare regula are sursa; unde sursele se contrazic (vesta, numarul de power bank-uri),
# textul spune sa verifici la sursa oficiala.

articol(
    "cel-mai-bun-power-bank-2026",
    "Cel mai bun power bank 2026: capacitate și reguli de avion",
    "Cum transformi mAh în Wh, ce capacitate e voie în avion (100 Wh, 160 Wh), de ce power bank-ul nu merge în "
    "bagajul de cală și ce companii interzic folosirea lui la bord.",
    "Gadgets",
    f"""
## Cel mai bun power bank în 2026

Pe cutie scrie capacitatea în mAh, dar companiile aeriene vorbesc în Wh. Și puterea de încărcare, în wați,
contează la fel de mult ca mărimea bateriei.

{CUM_AM_ALES_GHID}

## mAh, Wh și cât încarcă de fapt

- **Wh = mAh × tensiune ÷ 1.000.** Celulele au de obicei 3,6–3,7 V, deci un power bank de 20.000 mAh are
  aproximativ 74 Wh, iar unul de 26.800 mAh, aproape 100 Wh. Valoarea în Wh e de obicei tipărită pe carcasă.
- **Nu primești toată capacitatea în telefon** — o parte se pierde la conversia de tensiune și ca căldură.
- **Puterea de ieșire (W)** decide cât de repede încarcă: pentru laptop ai nevoie de un port USB-C cu Power
  Delivery și de puterea cerută de laptop (o găsești pe încărcătorul lui).

## În avion

- **Doar în bagajul de mână**, niciodată în bagajul de cală.
- **Până la 100 Wh** — permis fără aprobare; **între 100 și 160 Wh** — doar cu aprobarea companiei aeriene;
  **peste 160 Wh** — interzis în avioanele de pasageri.
- **Folosirea la bord e tot mai des interzisă.** Grupul Lufthansa (inclusiv Austrian, SWISS, Eurowings) nu mai
  permite folosirea sau încărcarea power bank-urilor la bord din 15 ianuarie 2026; Emirates și Qantas au reguli
  asemănătoare. Unele companii limitează și numărul de bucăți — verifică pe site-ul companiei înainte de zbor.

## Ce mai contează

- **Porturile** — cel puțin un USB-C, pentru telefoanele și laptopurile noi.
- **Greutatea** — e în fișa producătorului; contează dacă îl cari zilnic.
- **Marcajul CE și un producător cunoscut**: bateriile ieftine, fără protecții, se pot supraîncălzi.

[Vezi magazinele de electronice →](/categorii/electronice)
""",
    [
        "https://business.lufthansagroup.com/fr/en/program/experts/news/power-banks-on-board--updated-regulations-from-january-2026 (Lufthansa Group, 15.01.2026)",
        "https://www.tripit.com/web/blog/travel-tips/power-banks-rules-airlines (100 Wh / 160 Wh, doar in bagajul de mana)",
        "https://www.onboardhospitality.com/more-airlines-introduce-power-bank-bans/ (Emirates, Qantas si alte companii)",
    ],
)

articol(
    "cea-mai-buna-drona-2026",
    "Cea mai bună dronă 2026: reguli AACR înainte să cumperi",
    "Ce înseamnă clasele C0–C4, când trebuie să te înregistrezi ca operator la AACR, ce examen online îți trebuie "
    "și de ce greutatea de 250 g contează cel mai mult.",
    "Gadgets",
    f"""
## Cea mai bună dronă în 2026: începe cu regulile

În România, ca în tot UE, drona se alege întâi după reguli: greutatea și clasa ei decid dacă te înregistrezi,
dacă dai examen și unde ai voie să zbori. Abia apoi contează camera.

{CUM_AM_ALES_GHID}

## Greutatea și clasa

- **Sub 250 g (clasa C0)** — cele mai puține obligații. Nu dai examen, dar citești cu atenție manualul.
- **Clasele C1–C4** sunt trecute pe dronă și pe cutie; fiecare clasă vine cu alte cerințe de pregătire și de zonă
  de zbor.
- **Drone fără clasă, între 250 g și 25 kg** (cumpărate înainte de 2024 sau construite acasă) — doar în
  subcategoria A3, departe de oameni și de zone locuite.

## Înregistrarea la AACR

- Te înregistrezi **ca operator**, online, pe platforma Autorității Aeronautice Civile Române (AACR), și primești
  un cod unic pe care îl lipești pe dronă.
- **E obligatorie și pentru o dronă sub 250 g, dacă are cameră** și nu e jucărie.

## Examenul online

- **A1/A3**: test online de 40 de întrebări; treci cu cel puțin 75% răspunsuri corecte.
- **A2**: certificat de competență, cu test suplimentar.
- În categoria deschisă zbori, ca regulă generală, până la 120 m față de sol și cu drona în câmpul vizual.

## Înainte de fiecare zbor

- Verifică zonele unde zborul e restricționat sau are nevoie de aprobare — aeroporturi, zone militare, orașe.
- Respectă viața privată: filmarea oamenilor fără acordul lor poate încălca legea, chiar dacă zborul e legal.
- Regulile se actualizează; pe caa.ro găsești condițiile în vigoare.

[Vezi magazinele de electronice →](/categorii/electronice)
""",
    [
        "https://www.caa.ro/uploads/pages/Conditiile%20legale%20de%20zbor%20cu%20aeronave%20fara%20pilot%20la%20bord%20ulterior%20datei%20de%2001%20ianuarie%202024_NB.pdf (AACR: inregistrare, C0, A3 pentru 250 g - 25 kg)",
        "https://www.caa.ro/uploads/pages/Ghid%20utilizare%20aplicatie%20online%20AACR%2016.04.2021.pdf (platforma AACR, test A1/A3 de 40 de intrebari, 75%)",
        "https://eur-lex.europa.eu/eli/reg_impl/2019/947/oj (Reg. UE 2019/947, categoria deschisa, 120 m)",
    ],
)

articol(
    "cea-mai-buna-bicicleta-electrica-2026",
    "Cea mai bună bicicletă electrică 2026: 250 W și 25 km/h",
    "Ce înseamnă legal o bicicletă electrică în UE (motor de 250 W, asistență până la 25 km/h), ce contează la "
    "baterie și autonomie și cum alegi între oraș, trekking și MTB.",
    "Sport",
    f"""
## Cea mai bună bicicletă electrică în 2026

O bicicletă electrică „legală” în UE e, juridic, o bicicletă: fără înmatriculare și fără permis. Asta doar cât
timp respectă două limite.

{CUM_AM_ALES_GHID}

## Ce face dintr-o bicicletă electrică o bicicletă

- **Motor de cel mult 250 W** (putere nominală continuă).
- **Asistență doar cât pedalezi** și care se oprește la **25 km/h**.
- Un model mai puternic, mai rapid sau cu accelerație fără pedalare intră în altă categorie de vehicule, cu alte
  reguli. Dacă un vânzător îți promite „45 km/h”, întreabă ce înseamnă asta legal.

## Bateria și autonomia

- **Capacitatea, în Wh**, e cifra de comparat. Autonomia anunțată depinde mult de nivelul de asistență, de pante,
  de greutatea ta și de frig.
- **Bateria detașabilă** se încarcă în casă, nu doar lângă priză în garaj.
- **Încarcă doar cu încărcătorul original** și nu lăsa bateria la încărcat nesupravegheată ore în șir.

## Ce tip de bicicletă

- **Oraș** — cadru jos, apărători, portbagaj, lumini; poziție dreaptă.
- **Trekking** — drumuri mixte și distanțe lungi, cu bagaje.
- **MTB** — trasee de munte; suspensie și anvelope late.
- **Pliabilă** — pentru tren, metrou sau apartamente mici.

## Ce mai verifici

- **Motorul în butuc sau central** — cel central, la pedalier, merge de obicei mai natural pe pante.
- **Frânele pe disc**, hidraulice de preferință, la o bicicletă grea.
- **Mărimea cadrului** după înălțimea ta — tabelul e în fișa producătorului.

[Vezi magazinele de sport →](/categorii/sport)
""",
    [
        "https://eur-lex.europa.eu/eli/reg/2013/168/oj (Reg. UE 168/2013, art. 2(2)(h): 250 W, 25 km/h, excluse din categoria L)",
    ],
)

articol(
    "cele-mai-bune-accesorii-masina-2026",
    "Accesorii auto 2026: ce e obligatoriu și ce e util",
    "Trusa medicală, două triunghiuri și stingătorul sunt obligatorii, vesta doar peste 3,5 t: ce verifici la ele "
    "și ce accesorii utile merită luate pentru iarnă și drum lung.",
    "Auto",
    f"""
## Accesorii auto în 2026: întâi ce e obligatoriu

Înainte de gadgeturi, verifică trei lucruri pe care legea le cere în orice autoturism din România. Un produs
expirat sau neomologat contează ca lipsă la control.

{CUM_AM_ALES_GHID}

## Obligatorii (OUG 195/2002 și regulamentul de aplicare)

- **Trusa medicală** — completă și în termen de valabilitate; verifică data pe ambalaj.
- **Două triunghiuri reflectorizante omologate** — recunoști omologarea după litera „E” urmată de codul țării,
  într-un cerc.
- **Stingătorul** — în termen, cu acul manometrului în zona verde.
- Lipsa lor se sancționează cu amendă din clasa a II-a (4–5 puncte-amendă); valoarea punctului se schimbă, așa
  că suma exactă o găsești pe site-ul Poliției Române.

**Vesta reflectorizantă** e obligatorie doar pentru vehiculele de peste 3,5 tone, potrivit Registrului Auto
Român. Pentru autoturism nu e obligatorie, dar e utilă: ține-o în habitaclu, nu în portbagaj, ca să o poți
îmbrăca înainte să cobori.

## Utile, mai ales iarna

- **Racletă și perie** pentru zăpadă, **lichid de parbriz de iarnă**.
- **Cabluri de pornire** sau un **pornitor portabil (booster)** pentru bateria descărcată.
- **Lanțuri sau șosete textile** pentru drumurile de munte unde indicatorul le cere.
- **Compresor auto de 12 V** pentru presiunea din anvelope; presiunea corectă e pe eticheta de pe ușa
  șoferului sau în manual.

## Utile pe drum lung

- **Suport de telefon** fixat bine, ca să nu ții telefonul în mână.
- **Încărcător auto cu USB-C**.
- **Cameră de bord** — vezi [ghidul nostru despre camerele auto](/blog/cel-mai-bun-dashcam-2026).

[Vezi magazinele auto-moto →](/categorii/auto-moto)
""",
    [
        "https://infocons.ro/dotarile-auto-obligatorii-in-2026-ce-trebuie-sa-ai-in-masina-pentru-a-evita-amenda/ (trusa, 2 triunghiuri, stingator; vesta doar peste 3,5 t, dupa RAR)",
        "https://www.capital.ro/dotari-auto-obligatorii-in-2026-amenzi-intre-810-si-1-0125-lei-daca-nu-ai-aceste-obiecte-in-masina.html (clasa a II-a, 4-5 puncte-amenda)",
        "https://playtech.ro/2026/triunghiuri-vesta-si-trusa-in-2026-ce-trebuie-sa-ai-obligatoriu-in-masina-si-cum-verifici/ (omologarea „E”)",
    ],
)


# ─── Casa, animale, frumusete (08.10, lotul 5) ───────────────────────────────────────────────────
# Gresit in vechile articole: duritati H1-H5 legate de kilograme si durate de viata pe tip de saltea (inventate),
# „spuma TEMPUR din NASA", „proteine minim 25%" la hrana pentru caini, „retinolul e singurul antiaging validat FDA"
# (FDA a aprobat tretinoina, pe reteta), „80% din imbatranire = soare" fara sursa, „bestseller de 20+ ani".
# Ofertele de sub articole: temele saltele, hrana-caini, creme-antirid, fond-de-ten (lib/topFeed.ts).

articol(
    "cea-mai-buna-saltea-ortopedica-2026",
    "Cea mai bună saltea ortopedică 2026: cum alegi",
    "Spumă cu memorie, arcuri independente sau latex, ce înseamnă duritatea H2–H4, ce dimensiune și de ce poți "
    "returna o saltea comandată online chiar dacă ai desigilat-o.",
    "Casa",
    f"""
## Cea mai bună saltea ortopedică în 2026

„Ortopedică” nu e un termen definit de lege: îl folosesc producătorii pentru saltelele cu suport mai ferm. Ce
contează e cum te ține salteaua pe tine, în poziția în care dormi.

{CUM_AM_ALES_GHID}

## Tipurile de saltele

- **Spumă cu memorie** — se mulează pe corp și nu transmite mișcarea partenerului; poate fi mai caldă.
- **Arcuri independente (pocket)** — fiecare arc lucrează separat, aerisire bună; de obicei mai grele.
- **Latex** — elastic, revine repede la formă; de obicei mai scump.
- **Spumă clasică (poliuretan)** — ușoară și ieftină; potrivită pentru un pat folosit rar.
- **Hibride** — arcuri cu un strat de spumă deasupra.

## Duritatea

Scalele de tip H2, H3, H4 nu sunt un standard comun: un H3 de la un producător poate fi diferit de un H3 de la
altul. Ca regulă de pornire, cine doarme pe o parte are nevoie de o saltea care lasă umărul și șoldul să intre puțin;
cine doarme pe spate sau pe burtă, de una mai fermă. Dacă ai dureri de spate, întreabă medicul — nu există o
saltea care tratează.

## Dimensiuni și înălțime

- Lungimea standard e de 200 cm (190 cm la unele paturi mai vechi); lățimile cele mai întâlnite sunt 90, 140, 160
  și 180 cm. Măsoară interiorul ramei patului.
- Înălțimea saltelei schimbă înălțimea patului; o saltea groasă pe o ramă înaltă poate fi incomodă.

## Returul unei saltele

La comenzile online ai, prin lege, 14 zile ca să te răzgândești. Curtea de Justiție a UE a decis (cauza C-681/17)
că dreptul se aplică și unei saltele desigilate: folia de protecție nu o transformă într-un produs exclus din
motive de igienă. Condițiile de transport ale returului sunt pe site-ul magazinului.

[Vezi magazinele pentru casă →](/categorii/casa-gradina)
""",
    [
        "https://curia.europa.eu/juris/liste.jsf?num=C-681/17 (CJUE, C-681/17 slewo: retur pentru saltea desigilata)",
        "https://eur-lex.europa.eu/eli/dir/2011/83/oj (Directiva 2011/83/UE, 14 zile)",
    ],
)

articol(
    "cea-mai-buna-hrana-pentru-caini-2026",
    "Cea mai bună hrană pentru câini 2026: cum citești eticheta",
    "Hrană completă sau complementară, ce înseamnă proteina de pe etichetă și cum o compari între hrana uscată și "
    "cea umedă, plus ce verifici pentru căței și câinii în vârstă.",
    "Animale",
    f"""
## Cea mai bună hrană pentru câini în 2026

Marca spune puțin; eticheta spune aproape tot. În UE, ce scrie pe un sac de hrană pentru câini e reglementat, așa
că poți compara două produse fără să crezi pe cuvânt reclama.

{CUM_AM_ALES_GHID}

## Ce trebuie să scrie pe etichetă

- **„Hrană completă” sau „hrană complementară”.** Cea completă acoperă singură toate nevoile câinelui pentru vârsta
  indicată; cea complementară (recompense, multe conserve, suplimente) se dă doar împreună cu altă hrană.
- **Ingredientele, în ordinea greutății** — primul din listă e cel mai mult.
- **Constituenții analitici:** proteină brută, grăsimi brute, fibre brute și cenușă brută; umiditatea apare și ea
  pe multe etichete, mai ales la hrana umedă.
- **Pentru ce vârstă e:** cățel (creștere), adult, senior sau toate vârstele.

## Cum compari proteina

Procentele de pe etichetă sunt „ca atare”, adică includ apa. O conservă cu 8% proteină și 80% apă nu e mai săracă
decât o hrană uscată cu 25% proteină — trebuie comparate pe substanța uscată:

**proteina pe substanță uscată = proteina ÷ (100 − umiditatea) × 100**

Exemplu: 8 ÷ (100 − 80) × 100 = 40% proteină pe substanță uscată. Ca reper, ghidurile FEDIAF (federația europeană a
producătorilor de hrană pentru animale) dau pentru câinii adulți un minimum de aproximativ 18 g de proteină la
100 g de substanță uscată, pentru un câine cu nivel normal de activitate.

## Pe vârste și nevoi

- **Căței** — hrană de creștere; rasele mari au formule separate, pentru că cresc mai mult timp.
- **Câini în vârstă sau cu probleme de sănătate** — hrana dietetică (renală, digestivă) se alege cu medicul
  veterinar.
- **Schimbarea hranei** se face treptat, amestecând-o cu cea veche câteva zile, cum indică de obicei producătorii.

[Vezi magazinele pentru animale →](/categorii/animale)
""",
    [
        "https://en.wikivet.net/EU_Pet_Food_Labels (Reg. CE 767/2009: completa / complementara, constituenti analitici, ordinea ingredientelor)",
        "https://www.legislation.gov.uk/eur/2009/767/contents (Reg. CE 767/2009, textul)",
        "https://pmc.ncbi.nlm.nih.gov/articles/PMC7664208 (FEDIAF: minim 18 g proteina / 100 g substanta uscata la adulti)",
    ],
)

articol(
    "cea-mai-buna-crema-antirid-2026",
    "Cea mai bună cremă antirid 2026: ce funcționează",
    "Protecția solară zilnică, retinolul și diferența față de tretinoina pe rețetă, peptidele și niacinamida: ce "
    "poate face o cremă antirid și ce nu.",
    "Beauty",
    f"""
## Cea mai bună cremă antirid în 2026

Nicio cremă nu șterge ridurile adânci. Ce poate face o rutină bună e să încetinească apariția semnelor de
îmbătrânire și să îmbunătățească textura pielii, în săptămâni și luni, nu în zile.

{CUM_AM_ALES_GHID}

## Protecția solară, întâi

Academia Americană de Dermatologie pune protecția solară zilnică, cu spectru larg și SPF 30 sau mai mult, printre
primele măsuri împotriva îmbătrânirii premature a pielii. Razele UVA trec și prin geam, deci contează și în zilele
petrecute în casă, lângă fereastră.

## Ingredientele

- **Retinol** — un retinoid fără rețetă, mai blând decât **tretinoina**, care se dă pe rețetă. Se începe încet,
  seara, pentru că poate irita. În UE, produsele noi pot avea cel mult 0,3% vitamina A pe față și poartă mențiunea
  „Conține vitamina A”. Dacă ești însărcinată, întreabă medicul înainte de retinoizi.
- **Peptide** — folosite în multe creme pentru fermitate; de obicei bine tolerate.
- **Niacinamidă** — pentru textură, roșeață și pori; se combină ușor cu alte ingrediente.
- **Hidratarea** (glicerină, ceramide, acid hialuronic) — pielea hidratată arată mai netedă.

## Cum le folosești

- **Un produs nou pe rând**; prea multe produse anti-îmbătrânire începute deodată pot irita pielea.
- **Testează pe o zonă mică** — interiorul brațului, de două ori pe zi, 7–10 zile.
- **Zi:** cremă și protecție solară. **Seară:** produsul cu retinol, apoi cremă.

[Vezi magazinele de frumusețe →](/categorii/beauty)
""",
    [
        "https://www.aad.org/public/everyday-care/skin-care-secrets/anti-aging (protectia solara, inceputul unei rutine)",
        "https://dermatologytimes.com/view/anti-aging-skin-care-tips-from-aad (SPF 30, spectru larg, UVA prin geam)",
        "https://www.aad.org/public/everyday-care/skin-care-secrets/prevent-skin-problems/test-skin-care-products (testul pe zona mica)",
        "https://cosmeticobs.com/en/articles/news-59/regulation-2024996-restrictions-on-vitamin-a-arbutin-and-6-endocrine-disruptors-8029 (vitamina A, 0,3%)",
    ],
)

articol(
    "cel-mai-bun-fond-de-ten-2026",
    "Cel mai bun fond de ten 2026: tip de ten și nuanță",
    "Fluid, cushion, stick sau pudră, cum alegi după tipul de ten, cum găsești nuanța și subtonul și ce înseamnă "
    "simbolul cu borcanul deschis de pe ambalaj.",
    "Beauty",
    f"""
## Cel mai bun fond de ten în 2026

Fondul de ten bun e cel care nu se vede: aceeași nuanță cu pielea ta, pe tipul tău de ten. Marca contează mai
puțin decât formula și nuanța.

{CUM_AM_ALES_GHID}

## Formula, după tipul de ten

- **Ten gras sau mixt** — fluide cu finisaj mat, pudre minerale.
- **Ten uscat** — formule cremoase, cu finisaj satinat sau luminos, peste o cremă hidratantă.
- **Ten sensibil** — formule fără parfum; citește lista de ingrediente.
- **Acoperire:** ușoară (tentă, cushion), medie (majoritatea fluidelor), mare (stick, formule „full coverage”).

## Nuanța și subtonul

- **Subtonul** e cald (auriu), rece (roz) sau neutru; multe game îl scriu în codul nuanței (W, C, N).
- **Testează pe linia maxilarului**, nu pe mână, și privește la lumină naturală.
- La cumpărăturile online, compară cu nuanța pe care o folosești deja; unele magazine au mostre.

## Ce scrie pe ambalaj

- **Ingredientele** sunt listate de la cel mai mult la cel mai puțin, cu denumirile INCI.
- **Borcanul deschis cu „12M”** (sau alt număr) arată câte luni se poate folosi produsul după deschidere.

[Vezi magazinele de frumusețe →](/categorii/beauty)
""",
    [
        "https://eur-lex.europa.eu/eli/reg/2009/1223/oj (Reg. CE 1223/2009, art. 19: lista de ingrediente, simbolul PAO)",
    ],
)


# ─── Ghiduri (08.10, lotul 6) ────────────────────────────────────────────────────────────────────
# Ghidul Black Friday dadea data gresita („29 noiembrie 2026" — ultima vineri e 27) si statistici fara sursa
# („comerciantii cresc pretul cu 20-30%"); ghidul de cumparaturi sigure cerea „ANPC inregistrat" (nu exista asa
# ceva). Aici: regula pretului de referinta (HG 686/2022, minimul din ultimele 30 de zile) si drepturile din
# Directiva 2011/83/UE. Datele BF sunt cele din frontend/public/black-friday.json.

articol(
    "ghid-black-friday-romania-2026",
    "Black Friday 2026 în România: date și reduceri reale",
    "Black Friday la eMAG pe 6 noiembrie 2026 și valul internațional pe 27–30 noiembrie; cum verifici o reducere "
    "după prețul minim din ultimele 30 de zile și ce faci când nu se potrivește.",
    "Ghiduri",
    f"""
## Black Friday 2026 în România

În România, Black Friday nu e o singură zi. eMAG îl ține de obicei mai devreme decât restul lumii, iar valul
internațional vine la sfârșitul lunii.

- **eMAG: vineri, 6 noiembrie 2026.**
- **Black Friday internațional: vineri, 27 noiembrie 2026**, urmat de Cyber Monday pe **30 noiembrie**.
- Multe magazine își anunță campaniile cu câteva zile înainte sau le prelungesc o săptămână.

Ofertele active la magazinele partenere le găsești pe [pagina noastră de Black Friday](/black-friday).

## Cum recunoști o reducere reală

**Regula din România:** când un magazin anunță o reducere, prețul de referință față de care o calculează trebuie
să fie **cel mai mic preț practicat de el în ultimele 30 de zile** pentru același produs (10 zile la produsele care
se strică repede). Magazinul trebuie să arate clar și perioada în care s-a aplicat acel preț.

Ce înseamnă în practică:

- **Prețul tăiat nu e „prețul recomandat”**, ci minimul lui din ultima lună. Dacă produsul a costat mai puțin acum
  două săptămâni, „reducerea” se calculează de la acel preț.
- **Notează prețurile din timp.** Dacă știi cât costa produsul în octombrie, vezi singur dacă reducerea e reală.
- **Un banner „-50% la tot”** trebuie să fie adevărat pentru produsele la care e afișat.
- **Dacă ceva nu se potrivește**, poți face o reclamație la ANPC, cu capturi de ecran care arată prețurile și
  datele.

## Ce verifici înainte să plătești

- **Costul transportului** și termenul de livrare — în perioadele aglomerate cresc amândouă.
- **Vânzătorul** — pe marketplace-uri, mulți vânzători sunt terți; returul și garanția sunt la ei.
- **Returul**: pentru comenzile online ai 14 zile ca să te răzgândești, și de Black Friday.

[Vezi ofertele de Black Friday de la parteneri →](/black-friday)
""",
    [
        "https://www.wall-street.ro/articol/ecommerce/emag-black-friday-2026-cand-are-loc-anul-acesta-campania-de-reduceri.html (eMAG, 06.11.2026)",
        "https://spotmedia.ro/stiri/economie/noi-reguli-pentru-comercianti-privind-reducerile-de-pret-ce-sanctiuni-risca-cei-care-nu-le-respecta (HG 686/2022: minimul din 30 de zile, 10 zile la perisabile)",
        "https://gadget.ro/de-azi-28-mai-comerciantii-sunt-obligati-sa-afiseze-in-cazul-reducerilor-ofertelor-si-cel-mai-mic-pret-practicat-in-ultimele-30-de-zile/ (in vigoare din 28.05.2022)",
        "https://www.antena3.ro/actualitate/avertisment-anpc-reduceri-false-black-friday-2023-691026.html (avertismentele ANPC: bannere „-50% la tot”)",
    ],
)

articol(
    "ghid-cumparaturi-online-sigure-2026",
    "Cum cumperi online sigur în 2026: verificări și drepturi",
    "Ce date trebuie să afișeze un magazin online, cum îi verifici firma, cum plătești în siguranță și ce drepturi "
    "ai la retur, livrare întârziată și produs defect.",
    "Ghiduri",
    f"""
## Cum cumperi online sigur în 2026

Cele mai multe probleme la cumpărăturile online încep cu un magazin despre care nu știi nimic. Câteva verificări de
două minute te scutesc de ele.

## Verifică magazinul

- **Firma din spatele site-ului.** Un magazin online trebuie să afișeze denumirea firmei, sediul, codul fiscal (CUI)
  și datele de contact. Caută-le în subsolul paginii sau la „Termeni și condiții”.
- **Verifică CUI-ul** pe site-ul ANAF sau al Registrului Comerțului: vezi dacă firma există, de când și dacă e activă.
- **Recenzii din mai multe locuri**, nu doar de pe site-ul magazinului.
- **Un preț mult sub orice alt magazin**, pentru un produs de marcă, e un semnal de alarmă.

## Plătește în siguranță

- **Cu cardul**, nu prin transfer bancar către o persoană fizică. La card, banca ta poate contesta tranzacția
  (chargeback) în anumite situații, de exemplu dacă produsul nu vine.
- **Confirmarea 3D Secure** (în aplicația băncii) e normală; o cerere de cod prin SMS sau telefon de la „curier”
  sau „bancă” nu e.
- **Ramburs** — plătești la livrare, dar verifică pachetul dacă curierul îți permite.

## Drepturile tale

- **14 zile ca să te răzgândești** la comenzile online, fără să spui de ce. Magazinul îți returnează banii, inclusiv
  transportul standard de la livrare, în cel mult 14 zile de la anunțul tău.
- **Livrare întârziată:** dacă produsul nu vine în termenul promis (sau în 30 de zile, dacă nu s-a promis altul), îi
  ceri magazinului să livreze într-un termen suplimentar; dacă nici atunci nu livrează, poți renunța la comandă.
- **Produs defect:** vânzătorul răspunde pentru lipsa de conformitate timp de **2 ani** de la livrare.
- **Reclamații:** întâi la magazin, în scris; apoi la ANPC, cu dovezile (comanda, plata, mesajele).

[Vezi magazinele partenere →](/toate-magazinele)
""",
    [
        "https://eur-lex.europa.eu/eli/dir/2011/83/oj (Directiva 2011/83/UE: 14 zile, rambursare in 14 zile, livrare art. 18)",
        "https://eur-lex.europa.eu/eli/dir/2019/771/oj (Directiva 2019/771/UE: 2 ani de conformitate)",
        "https://legislatie.just.ro/Public/DetaliiDocumentAfis/77218 (Legea 365/2002, art. 5: datele furnizorului)",
        "https://anpc.ro (reclamatii)",
    ],
)


# ─── Sanatate: suplimente (07.10) ─────────────────────────────────────────────────────────────────
# Regula in plus fata de restul: in UE un supliment poate pretinde un efect asupra sanatatii DOAR cu formularea
# autorizata (Reg. 1924/2006, lista in Reg. 432/2012 si in registrul UE). Articolele vechi aveau statistici fara
# sursa („70% din romani au deficit"), „confirmat de studii clinice", doze recomandate de noi si plante cu efecte
# neautorizate. Aici: doar afirmatiile autorizate, limitele maxime EFSA (versiunea 11, august 2025), fara doze
# recomandate de noi, fara produse anume — ofertele de sub articol vin din feed (tema vitamine-minerale).
SFAT_MEDIC = (
    "> **Înainte să cumperi.** Textul de mai jos nu e sfat medical. Dacă ești însărcinată, alăptezi, iei "
    "medicamente sau ai o boală cronică, întreabă medicul sau farmacistul înainte de orice supliment. Afirmațiile "
    "despre efecte sunt doar cele autorizate în Uniunea Europeană, iar limitele maxime sunt cele stabilite de EFSA, "
    "autoritatea europeană pentru siguranța alimentelor."
)
SURSE_SUPLIMENTE = [
    "https://www.efsa.europa.eu/sites/default/files/2024-05/ul-summary-report.pdf (EFSA, limitele maxime, versiunea 11, august 2025)",
    "https://eur-lex.europa.eu/eli/reg/2012/432/oj (Reg. UE 432/2012, afirmatiile de sanatate autorizate)",
    "https://ec.europa.eu/food/food-feed-portal/screen/health-claims/eu-register (registrul UE al afirmatiilor)",
    "https://eur-lex.europa.eu/eli/dir/2002/46/oj (Directiva 2002/46/CE, eticheta suplimentelor)",
    "https://food.ec.europa.eu/food-safety/labelling-and-nutrition/nutrition-and-health-claims_en (afirmatiile despre plante, in asteptare)",
]

articol(
    "cele-mai-bune-vitamine-suplimente-2026",
    "Cele mai bune vitamine și suplimente 2026: ce contează",
    "Ce efecte are voie să pretindă un supliment în UE, limitele maxime EFSA pentru vitamina D, zinc, magneziu și "
    "seleniu, și ce să citești pe etichetă înainte să cumperi.",
    "Sanatate",
    f"""
## Vitamine și suplimente în 2026: ce merită știut înainte să cumperi

Pe raftul farmaciei, aproape orice cutie promite ceva: energie, imunitate, piele frumoasă. În Uniunea Europeană,
însă, un supliment are voie să spună că are un efect asupra sănătății doar cu o formulare autorizată de Comisia
Europeană, după evaluarea EFSA. Ghidul de mai jos pornește de la aceste formulări și de la limitele maxime oficiale.

{SFAT_MEDIC}

## Ce să citești pe etichetă

- **Doza zilnică recomandată de producător** și avertismentul că nu trebuie depășită — sunt obligatorii pe
  eticheta oricărui supliment din UE, la fel ca mențiunea că suplimentele nu înlocuiesc o dietă variată.
- **Cât din substanța activă e într-o doză.** „815 mg de bisglicinat de magneziu" nu înseamnă 815 mg de magneziu:
  cantitatea de magneziu propriu-zis e în tabelul cu valori nutriționale.
- **Procentul din valoarea de referință (VNR).** Arată cât acoperă o doză din necesarul zilnic al unui adult.
- **Ce mai iei deja.** Limitele maxime de mai jos sunt pentru tot ce consumi într-o zi, din toate sursele: mâncare,
  alimente fortificate și toate suplimentele luate împreună.

## Vitaminele și mineralele căutate cel mai des

### Vitamina D
Afirmații autorizate în UE: contribuie la funcționarea normală a sistemului imunitar, la menținerea oaselor și a
mușchilor în stare normală și la absorbția normală a calciului. Limita maximă stabilită de EFSA pentru adulți:
100 µg pe zi (4.000 UI). Pe piață există și capsule de 5.000 UI, adică 125 µg — peste această limită; asemenea doze
se iau doar la recomandarea medicului, de obicei după analize.

### Vitamina C
Contribuie la funcționarea normală a sistemului imunitar, la formarea normală a colagenului pentru funcționarea
normală a pielii, la reducerea oboselii și extenuării și crește absorbția fierului. EFSA nu a stabilit o limită
maximă pentru vitamina C: datele nu au fost suficiente.

### Magneziul
Contribuie la reducerea oboselii și extenuării și la funcționarea normală a sistemului nervos și a mușchilor.
Limita maximă EFSA pentru magneziul din suplimente (nu și pentru cel din mâncare): 250 mg pe zi pentru adulți.

### Zincul
Contribuie la funcționarea normală a sistemului imunitar, la protejarea celulelor împotriva stresului oxidativ și
la menținerea normală a pielii, a părului și a unghiilor. Limita maximă EFSA pentru adulți: 25 mg pe zi.

### Omega-3 (EPA și DHA)
EPA și DHA contribuie la funcționarea normală a inimii — efect obținut cu un aport zilnic de 250 mg de EPA și DHA.
DHA contribuie la menținerea funcției normale a creierului și a vederii normale, cu 250 mg de DHA pe zi. Pentru
EPA și DHA, EFSA nu a stabilit o limită maximă.

### Vitamina B12
Contribuie la reducerea oboselii și extenuării, la formarea normală a globulelor roșii și la funcționarea normală
a sistemului imunitar. Cine nu mănâncă deloc produse de origine animală are nevoie de o sursă de B12 — alimente
fortificate sau supliment; discută cu medicul.

### Acidul folic, în sarcină
Afirmația autorizată: suplimentarea cu acid folic crește nivelul de folat al mamei, iar un nivel scăzut este un
factor de risc pentru defecte de tub neural la făt. Condiția: 400 µg pe zi, cu cel puțin o lună înainte și până la
trei luni după concepție. Limita maximă EFSA pentru acidul folic din suplimente și alimente fortificate: 1.000 µg
pe zi.

### Fierul — doar după analize
Fierul contribuie la formarea normală a globulelor roșii și a hemoglobinei, dar se ia de obicei la recomandarea
medicului, după analize. EFSA a stabilit pentru adulți un nivel de 40 mg pe zi până la care nu se așteaptă efecte
adverse.

## Ce nu are o afirmație autorizată

- **Plantele** (echinaceea, socul, ginsengul): evaluarea afirmațiilor despre plante e suspendată la
  Comisia Europeană din 2010. Pot apărea pe ambalaje în baza regulilor de tranziție, dar nu sunt confirmate oficial.
- **Probioticele**: singura afirmație autorizată legată de bacterii vii e că culturile vii din iaurt îmbunătățesc
  digestia lactozei.
- **Colagenul**: nu are o afirmație de sănătate autorizată pentru piele; vitamina C are una — vezi mai sus.

[Vezi magazinele de sănătate și farmaciile partenere →](/categorii/sanatate)
""",
    SURSE_SUPLIMENTE + [
        "https://www.efsa.europa.eu/en/efsajournal/pub/2813 (EFSA, vitamina D: 100 µg/zi la adulti)",
    ],
)

articol(
    "cele-mai-bune-suplimente-imunitate-2026",
    "Suplimente pentru imunitate 2026: ce e dovedit în UE",
    "Zece vitamine și minerale au în UE o afirmație autorizată despre sistemul imunitar. Care sunt, ce limite "
    "maxime au cele căutate des și de ce echinaceea și propolisul nu sunt pe listă.",
    "Sanatate",
    f"""
## Suplimente pentru imunitate în 2026: ce e dovedit și ce nu

Toamna, rafturile se umplu de cutii „pentru imunitate". În Uniunea Europeană, un supliment are voie să spună că
ajută sistemul imunitar doar dacă are o substanță pentru care Comisia Europeană a autorizat această afirmație, după
evaluarea EFSA. Lista e scurtă și publică.

{SFAT_MEDIC}

## Ce substanțe au afirmația autorizată

Pentru „contribuie la funcționarea normală a sistemului imunitar", lista UE cuprinde zece substanțe: vitaminele A,
B6, B12, C și D, acidul folic, zincul, seleniul, cuprul și fierul. Formularea e aceeași pentru toate:
„contribuie la funcționarea normală" — nu „întărește", „previne răceala" sau „vindecă". Un supliment care
promite mai mult decât atât promite ceva neautorizat.

## Cele căutate cel mai des

### Vitamina C
Contribuie la funcționarea normală a sistemului imunitar, inclusiv în timpul și după un efort fizic intens (afirmație
autorizată pentru 200 mg pe zi, în plus față de doza zilnică recomandată). EFSA nu a stabilit o limită maximă
pentru vitamina C.

### Vitamina D
Contribuie la funcționarea normală a sistemului imunitar. Limita maximă EFSA pentru adulți: 100 µg pe zi (4.000 UI),
din toate sursele. Capsulele de 5.000 UI (125 µg) depășesc această limită — se iau doar la recomandarea medicului.

### Zincul
Contribuie la funcționarea normală a sistemului imunitar. Limita maximă EFSA pentru adulți: 25 mg pe zi. Multe
complexe „pentru imunitate" combină zincul cu vitamina C și D — adună cantitățile dacă iei mai multe produse.

### Seleniul
Contribuie la funcționarea normală a sistemului imunitar și a glandei tiroide. Limita maximă EFSA pentru adulți:
255 µg pe zi.

## Ce nu are afirmația autorizată

- **Echinaceea și socul**: evaluarea afirmațiilor despre plante e suspendată la Comisia Europeană din 2010. Pot
  apărea pe ambalaje în baza regulilor de tranziție, dar efectul nu e confirmat oficial.
- **Propolisul și mierea de Manuka**: nu au nicio afirmație de sănătate autorizată.
- **Probioticele**: nicio afirmație despre imunitate nu e autorizată.
- **Vitamina D luată „preventiv" în doze mari**: limita de 100 µg pe zi rămâne valabilă și iarna.

## Cum alegi

- Caută pe etichetă substanța și cantitatea pe doză, nu numele produsului.
- Verifică dacă nu iei deja aceeași substanță din alt produs — limitele maxime sunt pentru totalul zilei.
- Pentru copii, limitele sunt mai mici decât pentru adulți; folosește doar produse făcute pentru vârsta lor.

[Vezi magazinele de sănătate și farmaciile partenere →](/categorii/sanatate)
""",
    SURSE_SUPLIMENTE,
)


# ─── Scriere si verificari ────────────────────────────────────────────────────────────────────────
INTERZISE = [
    (re.compile(r"\b\d[\d.]*\s?(?:lei|RON|€|EUR)\b|~\s?\d"), "pret scris in articol"),
    (re.compile(r"\b(?:testat\w*|am testat|garantat\w*|verificat\w*)\b", re.I), "promisiune de testare/verificare"),
    (re.compile(r"\b[Cc]oduri? (?:de )?reducere\b"), "promisiune de coduri"),
    (re.compile(r"/cod-reducere/"), "link spre pagina de magazin (se verifica la generare, nu aici)"),
    (re.compile(r"\b\d+/10\b|\bnota\b", re.I), "nota fara metodologie"),
]


def probleme(a: dict) -> list[str]:
    text = f"{a['title']}\n{a['excerpt']}\n{a['content']}"
    gasite = [f"{a['slug']}: {motiv}: {m.group(0)!r}" for rx, motiv in INTERZISE for m in [rx.search(text)] if m]
    if len(a["title"]) > 60:
        gasite.append(f"{a['slug']}: titlu de {len(a['title'])} caractere (max 60)")
    titluri = [l[4:] for l in a["content"].split("\n") if l.startswith("### ")]
    for m in a.get("oferte_modele", []):
        if not any(t.startswith(m["titlu"]) for t in titluri):
            gasite.append(f"{a['slug']}: modelul {m['titlu']!r} nu e titlu H3 in articol")
    if not SURSE.get(a["slug"]):
        gasite.append(f"{a['slug']}: fara surse")
    if "„" in a["content"] and re.search(r"„[^”\"\n]*\"", a["content"]):
        pass  # ghilimelele romanesti sunt ok in markdown (nu e TSX)
    return gasite


def scrie() -> int:
    erori = [p for a in ARTICOLE for p in probleme(a)]
    if erori:
        print("NU scriu — probleme:\n  " + "\n  ".join(erori))
        return 1
    existente = json.load(io.open(MANUALE, encoding="utf-8")) if os.path.exists(MANUALE) else []
    noi = {a["slug"]: a for a in ARTICOLE}
    rezultat = [noi.pop(e["slug"], e) for e in existente] + list(noi.values())
    io.open(MANUALE, "w", encoding="utf-8", newline="\n").write(json.dumps(rezultat, ensure_ascii=False, indent=2) + "\n")
    print(f"articole_verificate: {len(ARTICOLE)} articole in {os.path.relpath(MANUALE, ROOT)} ({len(rezultat)} manuale in total)")
    return 0


def test() -> int:
    esecuri = 0
    for a in ARTICOLE:
        for p in probleme(a):
            esecuri += 1
            print("  PICA ", p)
    # regulile trebuie sa poata pica: un articol cu pret, „testat" si promisiune de cod
    rau = {"slug": "x", "title": "x", "excerpt": "Coduri reducere incluse.", "content": "Testat 2 saptamani. ~350 lei."}
    SURSE["x"] = ["y"]
    if len(probleme(rau)) < 3:
        esecuri += 1
        print("  PICA  regulile nu prind articolul gresit:", probleme(rau))
    print(f"\n{esecuri} ESECURI" if esecuri else "TOATE TREC")
    return 1 if esecuri else 0


if __name__ == "__main__":
    sys.exit(test() if "--test" in sys.argv else scrie())
