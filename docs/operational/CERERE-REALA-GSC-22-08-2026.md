# Ce caută oamenii când ne găsesc — date reale, nu estimări

> Sursa: export Search Console „Performanță în Căutare", 3 luni (27.05 – 22.08.2026).
> Prima dată când avem interogări reale, nu volume estimate din Semrush.

## Cifrele brute

**22 de clicuri și 229 de expuneri în 3 luni.** Mic. Dar forma cererii e informația.

| | Clicuri | Expuneri | CTR | Poziție |
|---|---|---|---|---|
| Desktop | 11 | 175 | 6,3% | 19,8 |
| **Mobil** | 10 | 53 | **18,9%** | 26,9 |
| România | 20 | 136 | 14,7% | 29,7 |

Mobilul convertește de **3× mai bine** decât desktopul, deși primește de 3× mai puține
expuneri. Orice decizie de design se ia mobile-first, iar asta e măsurat, nu presupus.

## Descoperirea principală: nișa e magazinul mic românesc

Aproape fiecare interogare are aceeași formă — **„cod reducere \<magazin mic\>"**:

```
dalisticq shop · ruby fashion · sevich · ginsari · fsm romania · afisport
makeup shop · beauty lounge · color cosmetics · uniquestore · barber store
orisee · xpert beauty · olfactiv · everin · tress fashion · hni cosmetice
stay fit · sport partner · optiblu · sport depot · luxury beauty
```

Nimeni nu ne caută pentru „cod reducere eMAG". Ne găsesc pentru magazine pe care
nimeni nu le optimizează. Pe un domeniu cu 0 backlink-uri, **acolo se poate câștiga**
— nu în competiția pentru brandurile mari.

## Lista de aplicat: 7 magazine, două semnale independente

Din ~26 de magazine căutate, **13 nu le avem deloc**. Din alea 13, **7 le au competitorii**
(verificat în `data/cerere-concurenta.json`):

| Magazin | Google ne arată pentru el | Competitorii îl au |
|---|---|---|
| **dedeman** | „cod reducere dedeman" (poz 36,5), „cupoane dedeman" (poz 43) | DA |
| **luxury beauty** | „cod reducere luxury beauty" (5 expuneri), „cupon reducere…" (3) | DA |
| **color cosmetics** | „cod reducere color cosmetics" (poz 17) | DA |
| **dalisticq** | „cod reducere dalisticq shop" (poz 11) | DA |
| **ginsari** | „cod reducere ginsari" (poz 19) | DA |
| **orisee** | „cod reducere orisee" (poz 33) | DA |
| **olfactiv** | „cod reducere olfactiv" (poz 78) | DA |

Două semnale independente care converg: Google ne arată deja pentru interogările astea,
**și** concurența are magazinele. Asta e cea mai bine susținută listă de aplicat pe care
am avut-o vreodată — mai bună decât orice listă construită din volume estimate.

Restul de 6 (ruby fashion, beauty lounge, xpert beauty, tress fashion, hni cosmetice,
stay fit) apar doar la noi, cu 1-2 expuneri. Prea puțin ca să justifice efort acum.

## Anomalii de investigat (câștig ieftin)

| Pagina | Expuneri | Poziție | Clicuri | Problema |
|---|---|---|---|---|
| `/produse` | 46 | **2,9** | 1 | La poziția 3 se așteaptă ~10% CTR. Avem 2,2%. |
| `/categorii/fashion` | 52 | 7,1 | **0** | Cele mai multe expuneri din site, zero clicuri. |
| `/categorii/beauty` | 37 | 36,4 | 0 | Poziția 36 — pagina 4. |

Primele două sunt poziții bune cu CTR anormal de mic. Cauza tipică e titlul sau
descrierea din rezultate, nu conținutul. De verificat înainte de a schimba altceva.

## Ce am reparat pe baza datelor

**`albirea-dintilor.com`** — 34 de expuneri, 1 clic, poziția 17: a 4-a pagină a site-ului
după clicuri. Era `noindex` de pe 10.08. Cererea vine din 6 variante distincte de
interogare (25 de expuneri cumulat). Adăugată în `BRANDURI_CU_CERERE` — prima intrare
din lista aia bazată pe date proprii, nu pe estimări.

Observație: `/albire-dinti` există ca landing page dedicată, e în sitemap de luni de
zile, are **0 expuneri**. Vizează „albire dinti" (serviciul); oamenii caută „albirea
dintilor" (numele magazinului). Google a ales singur pagina de magazin.

## Zgomot de ignorat

Interogările `"underarmour" -site:reddit.com -site:twitter.com…` (20 + 5 expuneri,
pozițiile 4 și 5,4) **nu sunt oameni**. E un instrument de rank-tracking care rulează
căutări cu operatori de excludere. Reprezintă ~11% din toate expunerile noastre și
0 clicuri. Nu construi nimic pe baza lor.

## Ce NU spun datele

Nu pot concluziona că `noindex`-ul din 10.08 a stricat ceva. În cele 11 zile de după:
0 clicuri, 2,2 expuneri/zi. Înainte: 0,29 clicuri/zi, 2,7 expuneri/zi. La volumul ăsta,
0 clicuri în 11 zile e complet în limita zgomotului. Nu e dovadă nici într-un sens,
nici în celălalt.
