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

ARTICOLE: list[dict] = []
SURSE: dict[str, list[str]] = {}


def articol(slug: str, title: str, excerpt: str, category: str, content: str, surse: list[str]) -> None:
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
