# 🗂️ Arhitectură categorii + SEO — AmCupon (04.07.2026)

> Analiză grounded în inventarul REAL (1047 magazine din `output.json`), nu generică.
> Scop: taxonomie curată românească, scalabilă, care oprește diluarea SEO și adaugă
> pagini indexabile cu intenție reală. Regula: **NU creăm pagini fără ≥5 magazine reale.**

---

## 1. AUDIT — ce e stricat acum

### A. Duplicate (aceeași categorie spartă pe mai multe etichete EN+RO)
| Concept | Etichete actuale (magazine) | Total real |
|---|---|---|
| Electronice | Electronics IT&C (48) · Electronice & IT (25) · Electronice IT&C (22) · Electronice (1) | **96** |
| Casă & Grădină | Home & Garden (127) · Casa & Gradina (18) | **145** |
| Sănătate | Health & Personal care (39) · Pharma (20) · Sanatate (5) · Farmacie (3) | **67** |
| Beauty | Beauty (78) · Frumusete (9) | **87** |
| Sport | Sport (35) · Sports & outdoors (20) | **55** |
| Software/digital | Software & Aplicatii (41) · Hosting & Domenii (9) · AI Tools (3) · Antivirus (2) | **55** |
| Copii | Babies Kids & Toys (31) · Copii & Jucarii (7) | **38** |
| Auto | Automotive (29) · Auto (2) | **31** |
| Cărți | Books (25) · Carti (1) | **26** |
| Animale | Pet supplies (17) · Animale de Companie (2) | **19** |
| Bijuterii | Jewelry & Accessories (11) · Bijuterii (4) | **15** |

**Efect:** Google indexează 3-4 pagini subțiri pe același subiect → nicio pagină nu rankează.
Consolidarea în 1 pagină canonică per concept = semnal SEO concentrat + pagină mai bogată.

### B. Buckete-gunoi (fără valoare de căutare)
- `Diverse` (89) și `Online Mall` (78) = **167 magazine** în categorii pe care nimeni nu le caută.
  Trebuie **reclasificate** pe categorii reale (din nume magazin / feed produse), nu lăsate așa.

### C. Limbă amestecată
Etichete EN (Home & Garden, Beauty, Books, Pet supplies) pe site românesc = prost pt SEO RO
și pt încredere. **Tot în română.**

### D. Pagini nișă orfane (deja există fișiere, dar subțiri/goale)
`echipament-moto`, `albire-dinti`, `gadgets` etc. — există `page.tsx` dar cu 0-2 magazine.
Astea diluează autoritatea. **noindex până au ≥5 magazine** (vezi `AUDIT-REMODELARE`).

---

## 2. TAXONOMIA NOUĂ — 18 categorii principale (română, canonică)

Fiecare categorie principală = 1 pagină SEO puternică. Subcategoriile primesc pagină proprie
DOAR când au ≥5 magazine (altfel = filtru pe pagina principală, nu pagină nouă = evităm thin content).

### Tabel SEO — categorii principale

| # | Categorie | Slug | Meta title | Meta description | Keywords | Prio | Magazine reale |
|---|---|---|---|---|---|---|---|
| 1 | Casă & Grădină | `casa-gradina` | Coduri reducere Casă & Grădină {luna} {an} \| AmCupon | Reduceri la mobilă, decorațiuni, electrocasnice și grădină. Coduri verificate zilnic la mari magazine. | cod reducere mobila, reduceri electrocasnice, cupon casa gradina, oferte decoratiuni | 🔴 P1 | 145 |
| 2 | Fashion | `fashion` | Coduri reducere Haine & Fashion {luna} {an} \| AmCupon | Reduceri la îmbrăcăminte, încălțăminte și accesorii damă/bărbați. Coduri active verificate. | cod reducere haine, cupon fashion, reduceri incaltaminte, voucher answear | 🔴 P1 | 111 |
| 3 | Electronice & IT | `electronice` | Coduri reducere Electronice & IT {luna} {an} \| AmCupon | Reduceri la telefoane, laptopuri, TV și electrocasnice. Coduri eMAG, Altex, Flanco verificate. | cod reducere emag, reduceri electronice, cupon telefoane, oferte laptopuri | 🔴 P1 | 96 |
| 4 | Beauty & Îngrijire | `beauty` | Coduri reducere Beauty & Cosmetice {luna} {an} \| AmCupon | Reduceri la machiaj, parfumuri și îngrijire. Coduri Notino, Douglas, Sephora verificate. | cod reducere notino, cupon parfumuri, reduceri cosmetice, voucher beauty | 🔴 P1 | 87 |
| 5 | Sănătate & Farmacie | `sanatate` | Coduri reducere Farmacie & Sănătate {luna} {an} \| AmCupon | Reduceri la farmacie online, suplimente și dispozitive medicale. Coduri Dr.Max, Catena. | cod reducere farmacie, cupon suplimente, reduceri drmax, oferte vitamine | 🔴 P1 | 67 |
| 6 | Software & Digital | `software` | Coduri reducere Software, VPN & Hosting {luna} {an} \| AmCupon | Reduceri la VPN, antivirus, hosting și AI tools. Coduri și oferte verificate pe abonamente. | cod reducere vpn, cupon hosting, reduceri antivirus, oferte software | 🔴 P1 | 55 |
| 7 | Sport & Fitness | `sport` | Coduri reducere Sport & Fitness {luna} {an} \| AmCupon | Reduceri la echipament sportiv, fitness și outdoor. Coduri Decathlon și magazine sport. | cod reducere decathlon, cupon sport, reduceri fitness, oferte biciclete | 🔴 P1 | 55 |
| 8 | Copii & Familie | `copii` | Coduri reducere Copii & Bebe {luna} {an} \| AmCupon | Reduceri la jucării, articole bebe și îmbrăcăminte copii. Coduri Noriel și magazine copii. | cod reducere jucarii, cupon noriel, reduceri articole bebe, oferte copii | 🔴 P1 | 38 |
| 9 | Călătorii & Turism | `calatorii` | Coduri reducere Călătorii & Vacanțe {luna} {an} \| AmCupon | Reduceri la zboruri, cazare, eSIM și închirieri auto. Oferte verificate pentru vacanță. | cod reducere cazare, cupon esim, reduceri zboruri, oferte vacante | 🔴 P1 | 31 |
| 10 | Auto & Moto | `auto-moto` | Coduri reducere Auto & Moto {luna} {an} \| AmCupon | Reduceri la piese auto, anvelope și accesorii moto. Coduri verificate pentru șoferi. | cod reducere piese auto, cupon anvelope, reduceri accesorii auto, oferte moto | 🟡 P2 | 31 |
| 11 | Cărți & Educație | `carti-educatie` | Coduri reducere Cărți & Cursuri {luna} {an} \| AmCupon | Reduceri la cărți, e-books și cursuri online. Coduri Cărturești, Elefant, Litera. | cod reducere carturesti, cupon carti, reduceri cursuri online, oferte elefant | 🟡 P2 | 31 |
| 12 | Mâncare & Băuturi | `food-delivery` | Coduri reducere Mâncare & Livrare {luna} {an} \| AmCupon | Reduceri la livrare mâncare, cafea, vin și băuturi. Coduri și oferte verificate. | cod reducere mancare, cupon livrare, reduceri cafea, oferte bauturi | 🟡 P2 | 21 |
| 13 | Pet Shop | `animale` | Coduri reducere Pet Shop & Animale {luna} {an} \| AmCupon | Reduceri la hrană, accesorii și îngrijire pentru câini, pisici și alte animale. | cod reducere hrana caini, cupon pet shop, reduceri accesorii animale, oferte zooplus | 🟡 P2 | 19 |
| 14 | Cadouri & Flori | `cadouri-flori` | Coduri reducere Cadouri & Flori {luna} {an} \| AmCupon | Reduceri la flori online, cadouri personalizate și experiențe. Livrare pentru orice ocazie. | cod reducere flori, cupon cadouri, reduceri experiente cadou, oferte floraria | 🟡 P2 | 14 |
| 15 | Bijuterii & Ceasuri | `bijuterii` | Coduri reducere Bijuterii & Ceasuri {luna} {an} \| AmCupon | Reduceri la bijuterii, ceasuri și accesorii de lux. Coduri verificate zilnic. | cod reducere bijuterii, cupon ceasuri, reduceri accesorii, oferte aur | 🟡 P2 | 15 |
| 16 | Financiar & Asigurări | `financiar` | Coduri & bonusuri Carduri, Credite, Asigurări {an} \| AmCupon | Bonusuri la carduri bancare, credite, asigurări și investiții. Oferte verificate. | card bancar bonus, cupon asigurari, oferte credite, reduceri investitii | 🟢 P3 | 7 |
| 17 | Marketplace-uri | `marketplace` | Coduri reducere Marketplace {luna} {an} \| AmCupon | Coduri și oferte pentru eMAG, Amazon, AliExpress, Temu și alte marketplace-uri mari. | cod reducere amazon, cupon aliexpress, reduceri temu, oferte marketplace | 🟡 P2 | (din reclasif.) |
| 18 | Supermarket & Zilnice | `supermarket` | Coduri reducere Supermarket & Alimente {luna} {an} \| AmCupon | Reduceri la alimente online, băuturi și produse zilnice. Livrare la domiciliu. | cod reducere supermarket, cupon alimente, reduceri online food, oferte bio | 🟢 P3 | 2 |

---

## 3. SUBCATEGORII per categorie principală (pagini doar la ≥5 magazine)

- **Fashion:** damă · bărbați · încălțăminte · genți & accesorii · modă copii · lenjerie · ceasuri
- **Electronice & IT:** telefoane · laptopuri & PC · TV & audio · electrocasnice mari · electrocasnice mici · foto-video · wearables · accesorii
- **Casă & Grădină:** mobilă · decorațiuni · bucătărie · grădină & exterior · unelte & bricolaj · textile · iluminat
- **Beauty & Îngrijire:** machiaj · parfumuri · îngrijire ten · îngrijire păr · unghii · aparate cosmetice · îngrijire bărbați
- **Sănătate & Farmacie:** farmacie online · suplimente & vitamine · dispozitive medicale · optică · stomatologie · îngrijire personală
- **Software & Digital:** VPN & securitate · hosting & domenii · AI tools · antivirus · aplicații & SaaS · cloud
- **Sport & Fitness:** echipament fitness · îmbrăcăminte sport · biciclete · outdoor & camping · suplimente sport
- **Copii & Familie:** jucării · îmbrăcăminte copii · articole bebe · cărucioare & scaune auto · școală
- **Călătorii:** zboruri · cazare & hoteluri · eSIM & roaming · închirieri auto · asigurări călătorie · circuite
- **Auto & Moto:** piese auto · anvelope · accesorii auto · echipament moto · ulei & consumabile
- **Cărți & Educație:** cărți · e-books · cursuri online · limbi străine
- **Mâncare & Băuturi:** livrare mâncare · restaurante · cafea · vin & băuturi
- **Pet Shop:** hrană câini · hrană pisici · accesorii · acvaristică
- **Cadouri & Flori:** flori online · cadouri personalizate · experiențe cadou
- **Financiar:** carduri bancare · credite · asigurări · investiții & crypto

---

## 4. UX & NAVIGAȚIE

- **Navbar (mereu vizibil):** cele 8-9 categorii P1 în bara orizontală de categorii (deja implementată pe homepage).
- **Dropdown „Toate categoriile":** toate cele 18 + subcategoriile (mega-menu pe 3 coloane).
- **Homepage:** bara de categorii (P1) + grid de category cards (top 8 după inventar).
- **Sezoniere/promoționale (pagini temporare, nu în taxonomia permanentă):** Black Friday, Crăciun, Reduceri de vară, 1 Iunie, Back to School — pagini de campanie cu `<link rel=canonical>` propriu, activate pe sezon.
- **Breadcrumb pe fiecare pagină:** Acasă › Categorie › Subcategorie (BreadcrumbList schema — deja ai pattern-ul).

---

## 5. PRIORITIZARE (după inventar real)

- **🔴 P1 — imediat (≥55 magazine sau nișă strategică):** Casă & Grădină, Fashion, Electronice, Beauty, Sănătate, Software, Sport, Copii, Călătorii. Astea aduc 90% din trafic.
- **🟡 P2 — după consolidare (15-31 magazine):** Auto, Cărți & Educație, Mâncare, Pet Shop, Cadouri & Flori, Bijuterii, Marketplace.
- **🟢 P3 — doar când cresc ofertele (<10 magazine):** Financiar, Supermarket, + subcategorii de nișă.

---

## 6. IMPLEMENTARE (pași tehnici, ordine)

1. **Mapare canonică în `merge_platforms.py`:** un dict `CATEGORIE_CANONICA` care normalizează toate etichetele EN+RO în cele 18 slug-uri. Rulează la fiecare sync → curăță automat.
2. **Reclasificare `Diverse`/`Online Mall`:** heuristică pe nume magazin + categorie feed produse → categorie reală.
3. **Redirect 301** de la slug-urile vechi (`/home-garden`, `/beauty`) la cele noi RO — nu pierzi linkurile existente.
4. **Pagină categorie = pattern existent** (`categorii/[slug]` + metadata + BreadcrumbList + FAQ schema).
5. **noindex** pe paginile cu <5 magazine până se umplu.
6. **Sitemap** regenerat cu noile URL-uri canonice.

> Regula de aur: 18 pagini PUTERNICE > 40 pagini subțiri. Consolidăm întâi, împărțim în
> subcategorii doar când inventarul cere.
