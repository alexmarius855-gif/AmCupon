# AmCupon v2 — arhitectura și schema bazei de date

> Etapele 1 și 2 din planul de reconstrucție. **Propunere, nimic aplicat**: schema e verificată
> pe un Postgres de probă, nu pe Supabase. Data: 17.11.2026.
> Fișiere: `schema-v2.sql` (schema), `teste-schema-v2.sql` (testele), `stub-supabase.sql`
> (ce există deja într-un proiect Supabase, pentru proba locală).

## 1. Pe scurt

- **Recomandarea:** refacem arhitectura, nu adresele site-ului. Construim v2 în paralel, în același
  repo, pe aceleași URL-uri, și comutăm câte un tip de pagină după ce trece o verificare de
  paritate. Regulile de calitate de azi (module Python cu teste) se mută în noul flux, nu se rescriu.
- **Schimbarea de fond:** baza de date devine singura sursă de adevăr, în locul fișierelor JSON
  comise în git de trei ori pe zi. O greșeală oprește o înregistrare, nu tot site-ul. O ofertă
  nouă reîmprospătează doar paginile ei, în câteva minute, fără un build de ~2.600 de pagini.
- **Ce nu rezolvă reconstrucția:** traficul. Site-ul are 65 de pagini indexate și 0 vânzări în
  90 de zile. v2 face site-ul sigur, rapid și măsurabil pe fiecare clic; banii vin din indexare și
  din paginile pe care oamenii chiar dau clic (azi: /alege).

## 2. Auditul stării actuale (măsurat pe 17.11.2026)

### 2.1 Cifre

| Ce | Valoare | Sursă |
|---|---|---|
| Magazine în `output.json` | 919 (2Performant 459, Impact 403, Awin 57); 419 cu domeniu .ro | fișierul de azi |
| Oferte active | 259 la 146 de magazine; 120 cu cod | idem |
| Produse publicate | 19.728, de la 461 de magazine | `products.json` |
| Pagini construite la fiecare rulare | ~2.590 | logul gărzii de text |
| Rute scrise de mână | 94 de foldere cu `page.tsx`, dintre care 31 pagini de brand | `frontend/app` |
| Articole de blog | 398, dintre care 347 sunt articole lunare de magazin („Cod reducere X noiembrie 2026") | `blog-posts.json` |
| Scripturi Python | 124; workflow-ul are 64 de pași | `scripts/`, `update-data.yml` |
| Durata unei rulări | 11–25 de minute | ultimele 40 de rulări |
| Rulări picate | 17 din ultimele 40; între 6 și 10 noiembrie aproape toate | `gh run list` |
| Repo GitHub | ~700 MB, public; 292 MB doar coperți de blog în `public/` | API GitHub |
| Supabase | Postgres 17, 12 MB; `merchants/products/coupons/price_history` există, dar sunt **goale** (lipsește secretul de scriere) | interogare directă |
| Clicuri numărate | 156 din 22.10: 124 de pe /alege (80%), 5 de pe /cod-reducere (3%) | `clicuri_afiliate` |
| Google | 65 de pagini indexate, 1.011 „descoperite, neindexate", 38 de 404 | Search Console, 05.11 |
| Vânzări | 0 în ultimele 90 de zile | rapoartele rețelelor, 14.11 |

### 2.2 Ce e de fapt defect (structural, nu cosmetic)

1. **Git e folosit ca bază de date.** Datele (17,6 MB de produse, 1,5 MB de articole, 0,85 MB de
   magazine) se comit de 3 ori pe zi. Efecte: repo de ~700 MB, în creștere; câmpuri private în
   istoria unui repo public (comisionul e încă acolo); orice ofertă nouă cere un build complet și un
   deploy; istoricul ofertelor se reconstruiește din `git log`.
2. **Publicarea e „totul sau nimic".** Garda dinaintea publicării e corectă ca idee, dar o singură
   frază greșită oprește TOATE datele. În săptămâna Black Friday la eMAG (6–10 noiembrie) site-ul
   a stat patru zile pe date vechi din cauza formulei „918 de magazine" de pe trei pagini. O
   greșeală de text trebuia să oprească acel text, nu ofertele a 900 de magazine.
3. **Fișiere care sunt și intrare, și ieșire** (`output.json`, `extra_merchants.json`,
   `products-restrictionate.json`). O valoare greșită se reconfirmă la fiecare rulare: de aici
   „linkul fals blocat la infinit" și „categoria greșită care nu se mai corectează"
   (LECTII-TEHNICE #5).
4. **Nu există un model de date.** Magazinul e un slug ghicit din domeniu; magazinul și programul
   de afiliere sunt același obiect; ofertele stau în interiorul magazinului, fără identitate
   stabilă (voturile sunt legate de un hash al textului). De aici `de.fossibot.com` servit ca
   Eureka, `vidaxl.ro` servit ca `vidaxl.bg`, linkuri Impact pe brandul altui magazin.
5. **Valori calculate, salvate.** `zile_ramase`, „are cod", „verificat azi" s-au salvat o dată și
   au mințit apoi luni întregi (contoare de 4.924 de zile, „are cod" fără cod).
6. **Reguli duplicate în două limbaje** (`promotii.py` ↔ `oferta.ts`, `text_curat.py` ↔
   `acordNumeral.ts`, `numeMagazin.ts` citit din Python). O regulă nouă se scrie de două ori și se
   poate desincroniza.
7. **Conținut împrăștiat.** 94 de rute scrise de mână, ~50 de pagini de nișă cu text fix, 347 de
   articole lunare care dublează pagina magazinului și își schimbă adresa în fiecare lună (de aici
   o parte din cei 38 de 404). Concurentul cu trafic, Cuponescu, are aproape doar pagini de magazin.
8. **Supabase adoptat pe jumătate.** Schema din 04.11 e aplicată, dar nescrisă; voturile și
   recenziile (0 rânduri) merg cu cheia publică din browser.

### 2.3 Ce păstrăm (nu e cauza problemelor)

- Next.js 16 + React 19 + TypeScript + Tailwind 4 pe Vercel (același stack ca Cuponeria).
- Toate adresele: `/cod-reducere/<domeniu>`, `/alege/...`, `/top/...`, `/black-friday/...`,
  `/categorii/...`, ghidurile. Cele 65 de pagini indexate nu se mută.
- Regulile de calitate și testele lor: `promotii.py`, `link_oferta.py`, `reguli_produse.py`,
  `reguli_2p.py`, `text_curat.py`, `categorii_produse.py`, `criterii_produse.py`,
  `verifica_text.py`. Sunt munca de cinci luni care face datele publicabile.
- Principiile de onestitate (nimic „testat" sau „verificat" fără să fie adevărat, comisionul
  niciodată public, fără cifre inventate) și tema (închisă, lime).
- Numărătoarea de clicuri fără IP, voturile limitate de bază, atribuirea pe sub-id.

### 2.4 Ce spun datele despre bani

80% din clicuri vin de pe /alege (produse cu prețul confirmat pe site-ul magazinului), 3% de pe
paginile de cod (din 156 de clicuri; câteva rafale din 09.11 par teste). În 2Performant vânzările
sunt la cărți, încălțăminte, farmacie, jucării și modă. Arhitectura tratează deci **produsele cu
preț verificat** ca element de prim rang, nu doar codurile.

## 3. Ce schimb față de brief, și de ce

| Brief | Ce propun | De ce |
|---|---|---|
| Profitshare | Nu intră. Adaptoarele permit oricând o rețea nouă. | Cont respins; decizia ta din 06.10 e să nu mai aplici. |
| Pagini pentru eMAG, Altex, Fashion Days | Pagini informative, fără comision, `noindex`, ca azi. | Nu avem program de afiliere la ele (eMAG e doar pe Profitshare). |
| „Verificate astăzi" | Doar semnale adevărate: „văzută activă în rețea azi, la ora X", „a mers pentru N persoane în ultimele 30 de zile" (de la 3 voturi), „pagina ofertei răspunde" (verificare automată); „Verificat în coș pe <dată>" doar după o verificare făcută de om și înregistrată (`core.offer_checks`). | Nimeni nu testează codurile în coș; afirmația a fost scoasă din ~100 de locuri ca falsă. Schema o face adevărată prin construcție. |
| Cashback / cash-back tracking | Nu în v2. Tabela de conversii, necesară oricum pentru venit, e baza dacă îl vrei mai târziu. | Cashback înseamnă conturi, plăți către oameni, reconcilierea comisioanelor aprobate (30–90 de zile) și obligații fiscale: e alt produs. |
| 100/100 Lighthouse | Ținte măsurabile: ≥95 pe mobil pe paginile de magazin și /alege, ≥90 pe prima pagină; LCP sub 2 s, INP sub 200 ms, CLS sub 0,05. | Azi: magazin 88–89, prima pagină 64–65; concurența 82–91 (27.09). 100 se poate pe pagini statice, dar nu merită plătit cu funcții. |
| Algolia | Căutare în Postgres: română fără diacritice + toleranță la greșeli. | Gratuit și suficient pentru 1.000 de magazine și zeci de mii de produse; verificat pe schema de probă. |
| MerchantReturnPolicy, Offer pe pagini de cupoane | Fără `MerchantReturnPolicy`; `Product` + `Offer` doar pe pagina unui singur produs, cu preț confirmat. | Nu suntem vânzătorul: politica de retur e a magazinului (și a fost deja scrisă greșit de mână). Google nu acceptă marcaj de produs pe liste. |
| Reconstruire „de la zero" | v2 în paralel, aceleași adrese, comutare pe tip de pagină după verificarea de paritate. | O rescriere de la zero ar reintroduce bugurile documentate (cifrele inventate au revenit de 6 ori). |
| „Ca Picodi / Honey" | Schema suportă coduri exclusive reale (`is_exclusive` cere referința contractului) și extensia de browser. | Avantajul Picodi sunt codurile negociate direct cu magazinele (vânzări, nu cod); Honey e o extensie, iar a noastră e o ciornă nepublicată. |

## 4. Arhitectura propusă

### 4.1 Stack

| Strat | Alegere | De ce |
|---|---|---|
| Pagini | Next.js 16 (App Router), React 19, TypeScript, Tailwind 4: **rămân** | Nu sunt cauza problemelor. |
| Randare | Componente server; ISR cu etichete de cache (`"use cache"` + `cacheTag`); JavaScript în browser doar pentru „insule": dezvăluirea codului, votul, căutarea, filtrele | Paginile rămân statice și rapide, dar se reîmprospătează individual. |
| Bază de date | Supabase Postgres 17, proiectul existent (Frankfurt) | Există; are RLS, `pg_cron`, `pg_net`, dicționar românesc; 12 MB folosiți. |
| Acces din site | Conexiune Postgres directă prin pooler (Supavisor, modul tranzacție), cu rolul `amc_site` | Browserul nu mai vorbește cu baza; rolul site-ului citește doar vederile `site` și scrie doar prin 5 funcții. |
| Regiunea funcțiilor Vercel | `fra1` (Frankfurt) | Implicit e `iad1` (SUA): fiecare interogare ar traversa Atlanticul. |
| Import | Python 3.12 + psycopg 3, cu modulele de reguli de azi | Regulile au teste și cinci luni de buguri prinse; rescrise în alt limbaj le-am redescoperi pe rând. |
| Programare | GitHub Actions (gratuit cât repo-ul e public), pornit la ora exactă de `pg_cron` prin `pg_net` | Rulările programate de GitHub întârzie ~7 ore (măsurat pe 14.11). |
| Căutare | Postgres: configurația `romanian` + `unaccent` + `pg_trgm` | Verificat: „bicicleta rosie" și „bicicelta" găsesc „Bicicletă electrică roșie". |
| Email | Brevo, ca azi | Merge; consimțământul și dezabonarea rămân acolo. |
| Analiză | Vercel Analytics + tabela proprie de clicuri; GA4 doar după consimțământ, încărcat după interacțiune | Fără scripturi care strică LCP. |
| Imagini | Logo-uri normalizate o dată (WebP, 128 px) în Supabase Storage, cu cache lung; pozele de produs de la magazin, cu dimensiuni fixe | Azi logo-urile vin de la favicon-urile Google/DuckDuckGo, care pică; optimizarea de imagini Vercel are cotă. |
| Fonturi | `next/font/local` | Build-ul a picat de două ori când fontul Google nu s-a descărcat. |

### 4.2 Fluxul de date

```
 2Performant API    Impact API    Awin API / CSV    exporturi CSV (2P)
        │                │               │                  │
        └────────── (1) ADAPTOARE, câte unul pe rețea (Python) ──────────┘
                         │   înregistrări normalizate (contractul din 4.3)
                         ▼
        ops.raw_records ── ce a trimis rețeaua, exact (doar la schimbare; 14 zile)
                         │
        (2) REGULI: aceleași module ca azi (promotii.py, link_oferta.py, reguli_produse.py, text_curat.py ...)
                         │                                         │
                         ▼                                         ▼
        (3) PROMOVARE în core.* (o tranzacție pe sursă)   ops.quarantine (pe înregistrare, cu regula care a picat)
                         │
                         │  declanșatoarele cer singure reîmprospătarea: 'merchant:libris.ro', 'offers' ...
                         ▼
        ops.revalidation_queue ──(pg_cron + pg_net, la 2–5 min)──► /api/revalidate ──► revalidateTag()
                         │                                                  │
                         ▼                                                  ▼
        site.* (vederi: oferte active, magazine, sitemap ...) ◄── citite de paginile Next.js (ISR)
                                                                            │
                                                 clic ─► /go/<tip>/<id> ─► rețea ─► magazin
                                                           │  click_id în sub-id
                                                           ▼
                              track.clicks ◄── potrivire ── track.conversions ◄── rapoartele rețelelor
```

### 4.3 Adaptoarele de rețea

Fiecare adaptor citește programele, ofertele, produsele și conversiile și le scrie ca înregistrări
normalizate. Regulile, potrivirea cu magazinul și scrierea în bază sunt comune tuturor. Contractul
unei oferte:

```json
{
  "entity": "offer",
  "network": "2performant",
  "external_id": "api:184533",
  "program_external_id": "1234",
  "merchant_domain": "libris.ro",
  "kind": "code",
  "title": "20% reducere la cărțile de ficțiune",
  "description": "Pentru comenzi de minimum 100 de lei.",
  "code": "LIBRIS20",
  "discount": { "type": "percent", "value": 20, "upto": false },
  "min_order_value": 100,
  "landing_url": "https://www.libris.ro/carti/fictiune",
  "starts_at": "2026-11-17T00:00:00+02:00",
  "ends_at": "2026-11-25T00:00:00+02:00",
  "payload_hash": "9f1c..."
}
```

`ends_at` e deja momentul după care oferta nu mai e valabilă: când 2Performant scrie „24.11, 00:00",
oferta ține toată ziua de 24, deci `ends_at` = 25.11, 00:00, ora României (regula `sfarsit_real`).

Ce știm deja despre fiecare rețea (din buguri reale; rămâne scris în adaptoare):

- **2Performant:** login DeviseTokenAuth; programe cu `filter[affrequest_status]=accepted`;
  paginarea e în `metadata.pagination` la programe, dar direct în `pagination` la promoții;
  parametrul e `perpage=40`, nu `per_page`; limită după ~110–140 de cereri (pauze 30/90/180 s,
  buget de 15 minute); textul pentru cumpărător e `customer_description`, codul e `coupon`;
  regulile programului (`most_used_traffic_sources`) intră în `core.programs.allows_coupon_sites`;
  feed-ul combinat e blocat pe IP-urile de datacenter, deci produsele vin prin API.
- **Impact:** linkul vine din `Campaign.TrackingLink`; `AllowsDeeplinking` vine ca text („false"
  nu e fals în Python); domeniile de deep-link și țările de livrare vin din campanie; ofertele vin
  din `/Ads?Type=COUPON` (câmpurile `Deal*`), `/Deals` nu există pe cont; potrivirea cu magazinul
  se face pe `CampaignUrl`, niciodată pe `AdvertiserUrl` (site-ul firmei-mamă).
- **Awin:** API-ul de programe și promoții cere `AWIN_API_TOKEN` (lipsește); până atunci, CSV.
- **CJ:** blocat până la PID-ul contului.
- **Conversiile:** endpoint-urile de raportare ale fiecărei rețele se confirmă în Etapa 3 cu o
  rulare de probă, înainte de a scrie cod pe ele (lecția din 22.08 și 07.09: întâi verifici ce
  date există).

### 4.4 Reguli și carantină

- Fiecare înregistrare trece prin regulile de azi. O regulă fie **repară** (codul mutat din titlu,
  diacriticele cu virgulă, caracterele stricate, acordul numeralului), fie **oprește**
  înregistrarea, care ajunge în `ops.quarantine` cu numele regulii și bucata de text care a picat.
- O sursă se oprește întreagă doar dacă **pare stricată**: peste 2% din înregistrări în carantină,
  o scădere de peste 40% față de rularea anterioară sau 0 înregistrări (pragurile de azi din
  `carantina_date.py` și `fetch_product_feeds.py`). Rularea e marcată `source_broken`, nimic din
  sursa aceea nu se promovează, celelalte merg mai departe.
- Un rând dispare (`removed_at`) doar dacă rularea a citit **lista completă**: o listă tăiată de
  limita API-ului nu înseamnă oferte dispărute (lecția din 16.09).
- Greșelile din textul **nostru** (șabloane, titluri, „918 de magazine") sunt cod, nu date: le
  prinde CI-ul la fiecare modificare de cod, înainte de deploy. Datele nu mai pot fi oprite de o
  greșeală de șablon, iar un șablon greșit nu ajunge în producție.

### 4.5 Publicarea

- Build-ul generează doar paginile cele mai vizitate (~200); restul se generează la prima vizită
  și rămân în cache.
- Datele se citesc prin funcții cu `"use cache"` și etichete: `merchant:libris.ro`, `offers`,
  `category:<id>`, `page:/black-friday`.
- Declanșatoarele din bază pun eticheta în coadă la orice schimbare vizibilă (titlu, cod, date,
  preț, stoc, moderare). La 2–5 minute, `pg_cron` trimite etichetele la `/api/revalidate`
  (semnat); ruta reîmprospătează și confirmă (`site.ack_revalidation`); ce nu e confirmat se
  retrimite.
- Ofertele care expiră sau încep: un job la 10 minute pune magazinul lor în coadă, iar cardul
  ofertei se ascunde singur în browser când trece `ends_at`.
- Dacă baza nu răspunde la o reîmprospătare, Next păstrează ultima versiune bună a paginii.

### 4.6 Clicul pe un cod (UX și atribuire)

1. Omul apasă „Arată codul". În același gest, codul se copiază în clipboard, magazinul se deschide
   într-un tab nou prin `/go/o/<id>`, iar pe pagina noastră apare codul întreg, cu „Copiat" și un
   link de rezervă dacă tabul n-a pornit (fără a doua deschidere automată, care ar fi un clic dublu
   raportat rețelei).
2. `/go/<tip>/<id>` (funcție Node în `fra1`) citește destinația din `site.outbound`, generează un
   `click_id` de 10 caractere, îl pune în parametrul de sub-id al rețelei (`st` / `subId1` /
   `clickref` / `sid`, harta din `lib/subId.ts`), răspunde cu 302 și scrie clicul după răspuns
   (`after()`), fără să întârzie redirectul. Antete: `noindex`, `no-store`; `/go/` rămâne blocat
   în `robots.txt`.
3. Dacă programul nu mai e activ, `/go` trimite la pagina noastră a magazinului, nu la un link mort
   sau neplătit (aceeași regulă ca `link_iesire`, dar aplicată la clic, nu la build).
4. Rapoartele rețelelor aduc vânzarea cu sub-id-ul; `click_id` o leagă de pagină, poziție și
   campanie. Atribuirea se copiază în conversie, deci rămâne și după ștergerea clicurilor vechi
   (180 de zile).

Asta schimbă decizia din 17.08 („linkurile de pe site merg direct, fără hop"): hopul costă
~50–150 ms, dar aduce venitul pe fiecare clic și oprește linkurile moarte din paginile din cache.
Codul ofertei ajunge în pagină cu datele componentei care îl dezvăluie, nu ca text vizibil; citirea
codurilor în masă nu e posibilă din afară (rolul site-ului le citește doar pe server).

### 4.7 SEO

- Adresele rămân. Pagina de magazin poartă luna în titlu; cele 347 de articole lunare se retrag cu
  301 spre pagina magazinului (dublează conținutul și își schimbau adresa lunar).
- `noindex`-ul și sitemap-ul vin din **aceeași** vedere (`site.merchants.indexable`,
  `site.sitemap`), deci nu se mai pot contrazice (problema din 29.10). Regula e cea din
  `lib/seoIndexable.ts`: ofertă activă, produse publicate sau cerere măsurată.
- Sitemap împărțit pe tipuri (magazine, categorii, evenimente, ghiduri, /alege, /top), cu
  `lastmod` din data schimbării conținutului.
- JSON-LD: `Organization` + `WebSite` (cu căutare) pe prima pagină; `BreadcrumbList` peste tot;
  `FAQPage` doar cu întrebările vizibile; `ItemList` pe liste; `Product` + `Offer` doar pe pagina
  unui singur produs cu preț confirmat; `AggregateRating` doar din recenzii reale aprobate.
- Cele ~50 de pagini de nișă scrise de mână devin rânduri în `core.landing_pages`: același șablon,
  text de introducere aprobat de tine, titlu limitat la 60 de caractere de baza de date. Ghidurile
  editoriale rămân fișiere în git, cu surse și teste (ca `articole_verificate.py`).

### 4.8 Performanță

- Ținte: ≥95 Lighthouse mobil pe paginile de magazin și /alege, ≥90 pe prima pagină; LCP sub 2 s,
  INP sub 200 ms, CLS sub 0,05 (p75, date reale din Speed Insights).
- Buget: sub 90 KB de JavaScript comprimat pe pagina de magazin; HTML sub 100 KB comprimat.
- Pârghii: componente server în locul celor două componente client mari (`HomeClient`,
  `MagazinClient`), logo-uri proprii cu dimensiuni fixe, fonturi locale, fără citiri de date din
  browser la încărcare, GA4 amânat.

### 4.9 Monetizare și publicitate

- `ads.placements`: 6 spații (prima pagină sus, pagina de magazin lateral și între oferte,
  categorie sus, căutare sus, newsletter).
- `ads.campaigns`, `ads.creatives`, `ads.campaign_placements`: sumă fixă, CPM sau CPC, perioadă,
  țintire pe categorie, statistici zilnice.
- Eticheta „Promovat / Sponsorizat / Publicitate" e obligatorie prin constrângere în bază.
  Directiva (UE) 2019/2161 cere ca o clasare plătită să fie declarată: un magazin promovat apare
  într-un spațiu etichetat, nu urcat pe ascuns în clasament, iar listele de „top" nu amestecă
  rezultate plătite fără etichetă.
- Clicurile pe reclame trec prin același `/go`, deci se numără la fel.
- AdSense, dacă îl vrei: doar în spații cu dimensiune fixă, încărcat leneș, niciodată deasupra
  ofertelor pe pagina de magazin.

### 4.10 Securitate și date personale

- Trei roluri: `amc_site` (citește vederile `site`, scrie doar prin funcții), `amc_ingest` (scrie
  catalogul și conversiile), proprietarul (tu, din panoul Supabase).
- Schema `site` nu se expune prin API-ul public Supabase; browserul nu primește nicio cheie de bază
  de date.
- Comisionul nu există în nicio vedere `site` (verificat: 0 coloane).
- Fără IP, cookie sau user-agent salvat la clicuri; votul folosește un hash cu sare secretă;
  recenziile se aprobă manual; abonările la alerte țin doar id-ul contactului Brevo, nu emailul.
- Datele nu se mai comit în repo-ul public. Comisionul rămâne în istoria git: rescrierea istoriei
  sau trecerea repo-ului pe privat e decizia ta (secțiunea 8).
- Administrare: la început din panoul Supabase (carantină, aprobări, recenzii, campanii), apoi un
  `/admin` mic.

### 4.11 Joburi

| Job | Frecvență | Ce face |
|---|---|---|
| `offers-*` (2P, Impact) | la 2 ore | programe active + oferte |
| `programs-*` | zilnic | statusuri, reguli, linkuri, țări de livrare |
| `products-2p` | zilnic | rotația feed-urilor (limita API-ului: ~15 min) |
| `prices-verify` | zilnic | confirmă prețurile de pe /alege pe site-ul magazinului |
| `conversions-*` | zilnic | vânzări și statusurile lor |
| întreținere (`pg_cron`, în bază) | 10 min / zilnic | expirări, rezumatul clicurilor, retenție |

Fiecare job e independent: dacă produsele pică, ofertele se publică. Starea fiecăruia e în
`ops.ingest_runs`; dacă un job pică de două ori la rând sau ofertele au mai mult de 6 ore, primești
un email. Blocajul din săptămâna Black Friday ar fi fost semnalat în aceeași zi.

## 5. Schema bazei de date (Etapa 2)

Fișierul complet: `schema-v2.sql` (~900 de linii, o singură tranzacție): 28 de tabele, 13 vederi,
11 funcții, declanșatoare pentru istoricul de preț și reîmprospătare, 2 joburi `pg_cron`.

### 5.1 Schemele

| Schemă | Ce ține | Cine are acces |
|---|---|---|
| `core` | rețele, categorii, magazine, domenii, programe, evenimente, oferte, sursele ofertelor, verificări, produse, istoric de preț, pagini de destinație | importul scrie; site-ul citește doar prin `site` |
| `ops` | rulări de import, date brute, carantină, coada de reîmprospătare | importul și tu |
| `track` | clicuri, rezumat zilnic, conversii | site-ul scrie clicuri prin funcție; conversiile, doar importul |
| `community` | voturi, recenzii, abonări la alerte | site-ul scrie prin funcții; publicul vede agregate și recenzii aprobate |
| `ads` | spații, advertiseri, campanii, creative, statistici | tu |
| `site` | 13 vederi + 6 funcții: tot ce citește site-ul | rolul `amc_site` |

### 5.2 Deciziile care contează

1. **Magazin ≠ program.** `core.merchants` e magazinul ca adresă (`libris.ro`); `core.programs` e
   relația cu o rețea: status, link, reguli (cupoane da/nu, reclame pe căutare, cashback), țări de
   livrare, comision (privat). Un magazin poate avea programe în mai multe rețele; se folosește cel
   activ, permis, cu prioritatea cea mai bună.
2. **Potrivire pe domeniu exact** (`core.merchant_domains`), niciodată pe subșir: `de.fossibot.com`
   nu e `fossibot.com`; `www.` e respins de constrângere.
3. **„Activ" e o vedere, nu o coloană.** `site.offers_live` = moderată, nelistată ca ștearsă, între
   `starts_at` și `ends_at`, magazin vizibil, program activ care acceptă site-uri de cupoane.
4. **O ofertă, mai multe surse** (`core.offer_sources`): același Black Friday din API și din CSV e o
   singură ofertă.
5. **Constrângeri care fac imposibile bugurile din 2026** (testate, vezi 5.4): „cod" fără cod sau
   ofertă fără cod care are cod; reducere peste 100%; „exclusiv" fără referința contractului;
   ofertă ascunsă fără motiv; preț sub 1 leu; titlu de pagină peste 60 de caractere; pagină aprobată
   fără cine și când; domeniu cu `www.`; reclamă fără etichetă.
6. **Istoric de preț doar la schimbare** (`core.price_points`, prin declanșator), inclusiv
   creșterile; minimul din 30 și 90 de zile (`site.price_stats`) spune „nu știm" când urmărim
   produsul de mai puțin timp.
7. **Felul paginii de magazin e calculat** (`site.merchants.page_mode`): `full`, `no_program`
   (pagină informativă), `no_delivery` (programul nu acoperă România), `redirect` (programul
   interzice site-urile de cupoane: spre categoria magazinului), `hidden`. Plus `indexable`, din
   care se fac și `noindex`-ul, și sitemap-ul.
8. **Ieșirea se calculează la clic** (`site.outbound`): link plătit doar dacă programul e activ;
   altfel, pagina noastră.
9. **„Verificat" adevărat prin construcție** (`core.offer_checks` + `site.offer_signals`): site-ul
   poate scrie „Verificat în coș" doar dacă există o verificare `manual_cart` reușită.

### 5.3 Ce se întâmplă cu tabelele de azi din Supabase

- `public.merchants`, `products`, `coupons`, `price_history` (goale) și `scripts/ingest-2p.mts`: se
  retrag după ce importul v2 scrie în `core` (ideile lor bune, istoricul la schimbare și coloanele
  private, sunt preluate).
- `public.clicuri_afiliate` (156 de rânduri): se mută în `track.clicks` în Etapa 3.
- `public.voturi_cupoane` și `public.reviews` (0 rânduri): se înlocuiesc cu `community.*`; rutele
  `/api/vote` și recenziile trec pe funcțiile noi.

### 5.4 Verificarea schemei

Pe un PostgreSQL 16 de probă (nu pe Supabase), cu schema `extensions` și rolurile pe care le are
Supabase:

```bash
createdb proba
psql -d proba -f docs/arhitectura-v2/stub-supabase.sql
psql -d proba -f docs/arhitectura-v2/schema-v2.sql
psql -d proba -f docs/arhitectura-v2/teste-schema-v2.sql
```

Rezultat pe 17.11.2026:

- schema se aplică dintr-o bucată, fără erori;
- fiecare dintre cele 10 constrângeri oprește scrierea greșită cu motivul ei, nu cu altă eroare;
- istoricul de preț: 2 rânduri pentru o creare și o schimbare; același preț și „văzut azi" nu adaugă;
- coada de reîmprospătare ține fiecare etichetă o singură dată;
- vederile: oferta expirată nu apare, cea programată apare doar la „urmează"; magazinul al cărui
  program interzice cupoanele duce la `/categorii/beauty`; un program doar pentru NL și BE dă
  `no_delivery`; un magazin fără program dă `no_program`; sitemap-ul are doar pagina indexabilă;
- căutarea găsește „Bicicletă electrică roșie" după „bicicleta rosie" și după „bicicelta electrica";
- rolul site-ului nu citește `core.offers` sau `core.programs` (comisionul) și nu scrie direct
  clicuri, dar înregistrează un clic prin funcție (magazinul și programul se completează singure),
  votează o singură dată pe ofertă și nu poate vota o ofertă expirată.

**Nu** am verificat încă aplicarea pe Supabase (Postgres 17, `pg_cron`, conectarea rolurilor
proprii prin pooler). Se face în Faza A, după confirmare.

### 5.5 Mărime estimată

Primul an: sub 100 MB (magazine ~1.000, oferte câteva mii pe an, produse 20–50 de mii, istoric de
preț doar la schimbare, clicuri 180 de zile, date brute 14 zile). Planul gratuit Supabase are 500 MB.

## 6. Planul de migrare

Fiecare fază se încheie cu un criteriu verificabil, nu cu o dată. Lucrul se face pe o ramură
separată, ca să nu se ciocnească de pipeline-ul zilnic și de cealaltă sesiune care lucrează pe `main`.

| Fază | Ce se face | Gata când |
|---|---|---|
| A. Fundația | migrarea în `supabase/migrations/`, parolele celor două roluri (în afara repo-ului), regiunea Vercel `fra1`, conexiunea în Vercel și în GitHub | schema e pe Supabase și o pagină de probă citește din ea |
| B. Importul în paralel (Etapa 3) | adaptoarele scriu în bază cu regulile de azi; pipeline-ul vechi publică în continuare; un script compară zilnic baza cu `output.json` și `products.json` | 7 zile la rând fără diferențe neexplicate |
| C. Paginile, pe rând (Etapa 4) | întâi `/cod-reducere/[magazin]` și `/alege`, apoi `/top`, prima pagină, categoriile, Black Friday, restul; pentru fiecare tip se compară HTML-ul vechi cu cel nou pe toate paginile (titlu, canonical, robots, oferte, JSON-LD) | 0 diferențe neintenționate și ținta Lighthouse atinsă |
| D. Clic și venit (Etapa 5) | `/go` cu `click_id` pe toate linkurile, importul conversiilor, raportul de venit pe pagină și campanie | o vânzare (de test sau prima reală) apare legată de pagina ei |
| E. Curățenie | se opresc comiterea datelor și pașii vechi; articolele lunare primesc 301; decizia despre istoria git | repo-ul conține doar cod și texte |

## 7. Costuri și riscuri

- **Supabase:** spațiul gratuit ajunge. Proiectul s-a pus singur pe pauză de 5 ori pentru că nu-l
  folosea nimic; cu site-ul citind din el, nu mai stă nefolosit. Înainte ca baza să devină sursa
  paginilor (Faza C) recomand fie planul Pro (25 $/lună, cu backup zilnic restaurabil), fie un
  backup zilnic propriu (`pg_dump`) într-un loc privat, **nu** în repo-ul public.
- **Vercel:** planul Hobby e, după termenii Vercel, pentru uz personal, necomercial; un site de
  afiliere care câștigă comisioane intră la uz comercial, deci la primele venituri trece pe Pro
  (20 $/lună).
- **Dependența de bază la cerere:** paginile din cache rămân servite dacă baza nu răspunde; `/go`
  păstrează 60 de secunde ultima destinație citită, iar fără ea trimite la pagina noastră a
  magazinului.
- **Regresii la mutare:** aceleași module de reguli + verificarea de paritate pe fiecare tip de
  pagină + garda de text în CI.
- **Logurile GitHub Actions sunt publice** cât repo-ul e public: importul nu tipărește comisioane,
  coduri sau tokenuri.

## 8. Decizii pentru Alex

1. **Abordarea:** v2 construit în paralel, aceleași adrese, comutare pe tip de pagină.
   *Recomand: da.*
2. **Baza ca sursă de adevăr:** Supabase Pro (25 $/lună) înainte de Faza C, sau backup zilnic
   propriu pe planul gratuit. *Recomand: Pro când comutăm prima pagină.*
3. **Toate clicurile prin `/go` cu `click_id`** (schimbă decizia din 17.08). *Recomand: da.*
4. **Retragerea celor 347 de articole lunare**, cu 301 spre pagina magazinului. *Recomand: da.*
5. **„Verificat"** doar din semnale adevărate și din verificările tale în coș. *Recomand: da.*
6. **Fără conturi de utilizator și fără cashback** în v2. *Recomand: da.*
7. **Istoria git cu comisioane:** rescriem istoria, facem repo-ul privat (cu rulări mai scurte
   poate încăpea în cele 2.000 de minute gratuite pe lună) sau o lăsăm. *Recomand: privat, după
   Faza E.*

După confirmare: Faza A, apoi Etapa 3 pornind de la 2Performant, rețeaua în care au loc vânzările.
