# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Intretinere:** acest fisier e sursa unica de adevar pentru starea tehnica a proiectului. La
> finalul oricarei sesiuni cu modificari semnificative (pagini noi, fix-uri, rebrand), actualizeaza
> sectiunea "Stare curenta" + tabelele relevante de mai jos, in acelasi commit cu codul. Scopul:
> niciun viitor Claude Code nu trebuie sa redeschida zeci de fisiere individuale sau sa parcurga
> `git log` extins ca sa afle ce exista deja — citeste DOAR acest fisier intai.

## Project: AmCupon.ro

Site afiliat românesc — coduri de reducere + oferte de la 2Performant și Profitshare. Deployed pe Vercel, date actualizate automat (cron 4h) prin GitHub Actions. Răspunde întotdeauna în română.

**UPDATE 16.08.2026 — partea a 3-a (adancime pagina magazin + de ce indexarea NU se poate forta — PUSHED):**
- **De ce nu deschidem cele 1.075 de pagini `noindex` — masurat, nu presupus.** Doar **87 din 1.162**
  de pagini de magazin sunt indexabile. Am verificat daca decizia din 10.08 mai e valida acum ca
  paginile au mai mult continut: doua pagini subtiri sunt **77-89% IDENTICE** intre ele (5.500 de
  caractere, dar ~80% acelasi sablon cu numele schimbat). Deschiderea lor ar reintroduce exact
  problema de thin content care a cauzat criza. **Decizia ramane corecta.**
  - Verificat si pragul: la 1 sau la 10 produse in feed, tot 87 de pagini ies indexabile — magazinele
    cu 1-4 produse au oricum promotie (produsele lor vin din `enrich_products_from_promos.py`).
    Deci `esteIndexabil` nu are nevoie de reglaj.
  - **Parghia nu e sa deschidem pagini, ci sa le facem sa merite**: continut propriu = promotii (66
    magazine) sau produse in feed (20 reale). Ambele depind de surse noi, nu de cod.
- **`FAQPage` fara continut vizibil — bug de conformitate reparat.** Emiteam 5 intrebari in schema pe
  TOATE cele 1.162 de pagini de magazin, dar niciuna nu aparea pe pagina (verificat pe HTML: 5 in
  schema, 0 in text). Google cere ca un continut marcat FAQPage sa fie **vizibil**; marcaj ascuns e
  motiv de actiune manuala. Reparat cu o sursa unica (`intrebari` in `page.tsx`) din care se deriva
  si schema, si textul — nu mai pot diverge.
- **`ContextMagazin.tsx`** (nou, SERVER component pasat ca slot catre `MagazinClient`, ca textul sa
  fie in HTML nu adaugat dupa hidratare): "Ce preturi are X" (min/median/max din feed, doar cu >=5
  produse cu pret valid) + "X fata de restul categoriei" (din studiul propriu, deci pe FIECARE
  pagina). Rezultat masurat: 112coffee.com **3.273 -> 4.869 caractere**, 6 -> 13 titluri;
  libris.ro 5.478 si 15 titluri. Concurenta e la 9.762 si 19.
  - **NU am afisat `brand` si `category` desi campurile exista**: la librarii `brand` contine AUTORUL
    ("Brian Michael Bendis" la libris.ro), iar `category` vine in ENGLEZA din feed. Ar fi fost gresit
    pe orice magazin de carti, respectiv neingrijit pe o pagina romaneasca.
- **Profitshare `affiliate-products` — descoperit, sondat, LIMITAT DE CONT.** Cautam o a doua sursa de
  produse (2P acopera doar ~20 de magazine). Endpoint-ul exista, are campuri mai bune decat 2P
  (categorie in ROMANA, `affiliate_link` deja cu tracking, `free_shipping`, `price_discounted`) si
  raporteaza **17.220 pagini (~344.000 produse)**. Trei constatari, toate verificate in raspuns:
  1. **nu se poate filtra pe magazin** — 6 nume de parametru testate, toate ignorate (am cerut eMAG,
     am primit constant Anvelino);
  2. **paginarea E stabila** (aceeasi pagina de doua ori la rand = aceleasi produse), dar catalogul
     e ordonat dupa `last_update` si se rearanjeaza in cateva minute — deci orice strategie de tip
     "retine ca magazinul X sta la pagina N si intoarce-te acolo" e gresita din PRINCIPIU. Am pierdut
     doua iteratii pe asta inainte sa testez presupunerea de baza; **testeaz-o prima data**;
  3. **contul citeste doar primele ~10-13 pagini** din cele 17.220 raportate, indiferent de pauza —
     nu e rate limit, e limita de acces, acelasi tipar ca 403-ul de la Impact Deals.
  - Randament efectiv: ~160 de produse din 3 magazine. Prea putin pentru ~8 min/rulare, deci
    `scripts/fetch_profitshare_products.py` ramane MANUAL, in afara pipeline-ului, gata de pornit
    daca se deblocheaza contul. **Actiune Alex**: intreaba suportul Profitshare de ce endpoint-ul se
    opreste dupa ~10 pagini desi raporteaza 17.220, si daca se poate activa filtrarea pe advertiser.

**UPDATE 16.08.2026 — partea a 2-a (studiu public + orfane + ce face CONCURENTA — PUSHED):**
- **ANALIZA CONCURENTEI, masurata pe sitemap-ul lor, nu presupusa.** `cuponescu.ro` (~350k
  vizite/luna) are in TOT sitemap-ul: **998 de pagini de magazin si exact 4 alte pagini**. Zero blog,
  zero categorii, zero nise, zero topuri, zero comparatii. **Pagina de magazin E toata afacerea.**
  Pentru comparatie, AmCupon are 423 URL in sitemap, din care 514 articole de blog + ~90 pagini de
  categorii/nise/topuri — adica efortul e imprastiat exact invers fata de singurul concurent care
  chiar are trafic.
  - Comparatie cap la cap pe acelasi magazin (`112coffee.com`): la ei **9.762 caractere de text si
    19 titluri**, la noi **3.273 caractere si 6 titluri**. Au sectiuni pe care noi nu le avem:
    fiecare cupon ca bloc separat cu titlu propriu, "Despre X", "Contact X", "Intrebari frecvente X".
  - Au si `AggregateRating` in schema (stelute in SERP). **NU-l reintroduce fabricat** — a fost
    eliminat pe 03.07 tocmai pentru ca era inventat. Ruta onesta e sistemul de recenzii Supabase,
    deja construit si gol.
  - **Concluzie operationala**: urmatoarea investitie mare de continut merge in ADANCIMEA paginii de
    magazin, nu in pagini noi. Tinta e sa triplam textul cu date REALE pe care le avem deja
    (categorii de produse din feed, interval de pret, cate produse urmarim), nu cu umplutura.
  - Confirmarea metodei de sitemap: `lastmod`-urile lor sunt REALE si variate (2025-11, 2026-03,
    2026-08) — exact ce am implementat noi azi in locul lui `new Date()`.
- **12 pagini ORFANE reparate** (in sitemap, zero link intern de nicaieri): `/supermarket`,
  `/smart-home`, `/antivirus`, `/pescuit`, `/rochii-mireasa`, pagina noua de studiu + cele 7
  `/nisa/*`. Metoda: comparatie intre URL-urile din sitemap si toate linkurile din cod.
  **13 din cele 25 de "orfane" gasite initial erau false pozitive** (`/blog?cat=X` — regexul meu
  ignora URL-urile cu parametru), verificate pe productie inainte de a repara ceva nestricat.
- **`/nisa/*` — canibalizare, acelasi tipar ca la paginile de brand (10.08).** `/nisa/fashion` si
  `/fashion` tintesc aceeasi cautare, fiecare cu canonical propriu. NU sterse (au continut real, 19
  magazine): canonical catre pagina principala (`CANONIC_PRINCIPAL` in `nisa/[slug]/page.tsx`) +
  **scoase din sitemap** — a trimite la indexare un URL care se declara duplicat e contradictoriu.
- **Homepage-ul primea linkurile noi ultima, sau deloc.** `Footer.tsx` se ascunde explicit pe `/`
  (`if (pathname === "/") return null`) fiindca `HomeClient` are footer propriu cu liste COPIATE —
  acelasi tipar ca la cardul separat de homepage din 09.08. Lista se exporta acum din `Footer.tsx`
  si se importa in `HomeClient`: o singura sursa, orice link viitor ajunge automat si pe homepage.
- **`/studiu/coduri-reducere-romania`** (nou) — activul pentru backlink editorial, generat de
  `scripts/generate_studiu_cupoane.py` in pipeline. Cifra centrala ne contrazice interesul comercial
  (din 1.162 magazine, 6 au cod real) — de-aia e credibila. Mediana pe categorie se publica DOAR cu
  esantion >= 3; azi trec pragul 4 din 19 categorii, iar pagina scrie explicit "date insuficiente"
  pentru restul. Date brute la `/studiu-cupoane.json`, JSON-LD `Dataset` + CC-BY.
- **`scripts/check_internal_links.py`** (nou, reutilizabil, iese cu cod 1 la eroare) — 98 pagini,
  911 linkuri interne verificate live. IndexNow rulat: 346 URL acceptate.

**UPDATE 16.08.2026 (sitemap cu date reale + regresia feed produse REZOLVATA + linkuri interne — PUSHED):**
- **REGRESIA FEED PRODUSE (33.096 -> 3.468) — cauza gasita, reparata, VERIFICATA pe API-ul real.**
  E acelasi bug de paginare documentat mai jos pentru `/affiliate/programs.json`, reaparut in
  `fetch_product_feeds.py`: **API-ul 2Performant capeaza la 20 de elemente pe pagina si ignora
  `per_page`**. Codul cerea `per_page=50` si se oprea cu `if len(items) < 50: break` — primea 20,
  20 < 50, deci se oprea dupa PRIMA pagina, aducand fix 20 de produse din fiecare feed.
  - **Dovada in date, nu deductie**: din cele 86 de magazine, **20 aveau EXACT 20 de produse**.
  - Fix: oprire pe `metadata.pagination.pages`, ca in `fetch_all_pages` din `fetch_2p_api.py`.
    Rezerva pe `len(items) == 0` cand lipseste metadata — **niciodata pe `len(items) < per_page`**.
  - **Verificat live** prin `.github/workflows/test-product-feeds.yml` (nou, `workflow_dispatch`,
    `--dry-run`, nu scrie si nu comite nimic — acelasi tipar ca `test-impact-deals.yml`, fiindca
    credentialele 2P sunt doar in Secrets si nu se poate testa local):
    **3.512 -> 19.220 produse**, 14 feed-uri. Feed-urile au cataloage uriase (12.367 / 65.736 pagini),
    deci plafonul e acum al nostru: `MAX_PRODUSE_PER_FEED = 1200`, ales pentru DIVERSITATE intre
    magazine, nu ca sa umple un singur feed tot fisierul. Durata pasului: ~14 min.
  - **Garda anti-regresie intarita**: cea existenta se declanseaza doar sub 4 MAGAZINE, si de-aia
    regresia asta i-a trecut pe sub nas (magazinele erau 86, doar produsele se prabusisera).
    Adaugata o garda pe numarul de PRODUSE: cadere sub 40% dintr-un fisier cu peste 1000 de produse
    = sursa stricata, se pastreaza fisierul vechi. Ar fi prins-o din prima.
  - Tot din rularea de test: **`liki24.nl`** intra in feed alaturi de `liki24.ro` (filtrul de
    magazine straine exista, dar `.nl` lipsea — completat cu TLD-urile europene lipsa), si nume cu
    spatiu/slash in coada (`"libris.ro "`, `"autoeqt.ro/"`) care produceau dubluri — normalizate la sursa.
- **`sitemap.ts`: `lastModified: new Date()` in 120 de locuri — REPARAT.** Pipeline-ul ruleaza la 4h,
  deci Google primea "toate cele 429 de URL-uri s-au modificat acum", de 6 ori pe zi. Cand totul pare
  mereu proaspat, nimic nu mai pare proaspat.
  - `scripts/track_sitemap_dates.py` (nou, in pipeline inainte de commit) -> `public/sitemap-dates.json`:
    pagini de DATE (1210) prin **amprenta de continut** persistata in `data/sitemap_fingerprints.json`
    (data se muta doar la schimbare reala — o promotie noua la drmax.ro muta doar drmax.ro);
    articole (514) cu data reala de publicare; pagini statice (98) cu data ultimului commit git.
  - Rezultat pe sitemap-ul generat: **de la 1 data unica la 20**.
  - **CAPCANA prinsa inainte sa ajunga in CI**: `actions/checkout` cloneaza implicit cu
    `fetch-depth: 1`, deci in Actions `git log -1 -- <fisier>` intoarce singurul commit disponibil —
    data ultimei rulari, identica pe toate paginile. Adica exact bug-ul reparat, reintrodus tacit.
    Scriptul detecteaza clona shallow (`git rev-parse --is-shallow-repository`) si pastreaza datele
    calculate anterior. **Nu folosi `git log` in CI fara sa verifici asta.**
- **Linkuri interne verificate SISTEMATIC, prima data** (`scripts/check_internal_links.py`, nou si
  reutilizabil): 98 de pagini live, 806 linkuri interne distincte, fiecare cerut efectiv -> **3 rupte**.
  Toate linkurile moarte de pana acum fusesera gasite din intamplare; scriptul iese cu cod 1, deci
  poate fi pus si intr-un workflow.
  1. **`/categorii/telecom` (404)** — ACELASI bug de subsir, a treia oara: `/categorii` numara
     magazinele cu `includes(kw)` pe slug/nume, deci `telecom` parea populat (de la "orange"/"digi"
     gasite in numele ALTOR magazine), dar pagina nu se genereaza niciodata (`generateStaticParams`
     deriva din `categorie_slug` real). Fix: potrivire exacta + categoriile fara magazine se ascund
     singure. **Mai grav decat linkul vizibil**: acelasi URL inexistent era emis si in JSON-LD
     (`ItemList`) — il declaram lui Google ca pagina reala. Acum si ItemList, si numarul "N categorii"
     folosesc lista filtrata. Verificat pe build: 0 aparitii, 17 categorii reale.
  2-3. Doua linkuri de pe `/gadgets` catre articole inexistente: "Camere actiune" -> `/top/camere-actiune`
     (pagina reala), "Gadgeturi sub 100 lei" **sters** (articolul nu exista si n-are echivalent — o
     redirectare aiurea ar fi fost o promisiune falsa).

**UPDATE 14.08.2026 (categorii reale pe paginile de nisa + 58 logo-uri rupte — PUSHED, 3 commits):**
- **CAUZA RADACINA, acelasi tipar in 3 straturi: potrivire pe SUBSIR acolo unde exista un camp EXACT.**
  22 de pagini de nisa filtrau magazinele cu liste de cuvinte-cheie scrise de mana
  (`["pet","animal","zoo","dog","cat"]`) trecute prin `.includes()`, desi `output.json` are deja
  `categorie_slug`. Coliziuni reale, live: `"cat"` se potrivea cu `"eduCATie"` → **8 din 14 magazine
  de pe `/animale` erau librarii**, badge-uite "Cărți & Educație"; `"marke"` cu `"MARKEtplace"` →
  `/supermarket` arata eMAG/Temu; `/gadgets` avea **20 din 22 "magazine de gadgets" = firme SaaS**.
  - Fix: **`frontend/lib/categoriiNisa.ts`** (nou) — o singura sursa de adevar pagina → slug real, cu
    `esteInCategorie()` care compara EXACT. Aplicat pe 21 de pagini. **Orice pagina noua de nisa
    foloseste asta, nu inventa alta lista de cuvinte-cheie.**
  - **Verifica INAINTE ca fix-ul sa nu goleasca paginile** — masurat pe date reale ca fiecare din cele
    21 ramane cu continut (a fost si castig: `/bijuterii` 2 → 12, `/supermarket` 2 → 11).
- **Taxonomia moarta englezeasca — inca 5 fisiere**, supravietuitoare ale migrarii din 09.08 (care
  reparase doar 2): `categorie_slug === "jewelry"` / `"gifts-flowers"` / `"automotive"` (×2) /
  `"office-supplies"` — valori care nu exista in date, deci paginile erau aproape goale.
  `/flori` avea chiar **dubla conditie moarta** (slug EN + `categorie.includes("flower")`, iar
  eticheta reala e "Cadouri & Flori") → 0 magazine mereu. **Cand cauti resturi, grepeaza `categorie_slug ===`
  si compara cu cele 18 sluguri RO** — nu presupune ca o migrare trecuta le-a prins pe toate.
- **Filtrul obligatoriu `are_promotie` scos de pe 8 pagini de nisa** (contrazicea "promoveaza tot",
  acelasi fix ca pe 06.08 dar pe alte pagini): promotiile raman primele prin sortare, nu mai exclud
  restul. `/sport` 3 → 12. Ramane obligatoriu, corect, pe `/black-friday`, `/craciun`, `/top-reduceri`.
- **`canonicalize_categories.py` — doua bug-uri, unul foarte urat:**
  1. **NU era idempotent.** Cheile din `LABEL_TO_CANON` sunt ASCII (`"casa"`, `"calatori"`, `"carti"`,
     `"mancare"`), dar `CANON` scrie etichete CU diacritice (`"Casă & Grădină"`, `"Călătorii"`). La a
     doua trecere peste propriul output acele 5 categorii nu se mai recunosteau si cadeau in
     `marketplace`. **Am declansat-o eu rulandu-l standalone** (mod suportat, documentat in docstring):
     casa-gradina 145 → 35, calatorii 81 → 51, carti-educatie 37 → 19, marketplace 208 → 365.
     Restaurat cu `git checkout`. Reparat cu normalizare de diacritice inainte de potrivire.
  2. Acelasi bug de subsir, o treapta mai sus, in `_canon_from_name`: cuvintele-cheie de **≤3 litere**
     se cauta acum la granita de cuvant (vaPETronic/kosPET nu mai sunt pet shop). Cele mai lungi raman
     pe subsir **deliberat** — o regula de granita globala ar fi rupt 30+ hoteluri clasificate corect
     (`zenhotels`, `savelectro`); masurat inainte de a schimba ceva.
  3. **`OVERRIDE` explicit** (nou): `output.json` e SI intrare SI iesire, iar `_canon_from_label` citeste
     eticheta scrisa la rularea precedenta → **o categorie gresita se auto-confirma la infinit** si nicio
     ghicire dupa nume n-o mai poate corecta. Lista de override e singurul mod de a desface o
     clasificare blocata. Extinde-o cand gasesti altele.
- **58 de logo-uri rupte — si fallback-ul oficial era el insusi mort.** Testat live fiecare din cele
  1167 `logo_url`. **43 din 58 erau DEJA faviconul Google** catre care `merge_platforms.py` trimite
  orice logo cu sursa moarta (comentariul de acolo zicea "nu da niciodata 404" — ba da, pentru
  domeniile pe care nu le rezolva). Restul de 15: URL-uri de brand hardcodate, moarte intre timp.
  - **`scripts/fix_logo_urls.py`** (nou, in pipeline pe rularea de dimineata): verifica live, cade in
    ordine **pastreaza > Google > DuckDuckGo > gol**. Rezultat: 34 recuperate (15 Google, 19 DDG),
    24 fara iconita nicaieri → gol. **Gol e intentionat** (UI-ul arata initialele, curat); un URL rupt
    lasat in date afiseaza iconita de imagine stricata. Guard: daca >30% din probe pica, nu scrie nimic.
  - **`MagazinClient.tsx` (pagina care aduce comisionul) avea UN SINGUR pas de logo** — acum cascada
    completa, ca in `MagazinCard.tsx`.
  - **Al 5-lea caz al tiparului de contrast**: initiala de rezerva era `text-white` peste `${culoare}`
    = gradient lime → invizibila. Tiparul 2 din sectiunea de tema (clasa dintr-o variabila).
  - **Imaginile de PRODUSE sunt sanatoase** — verificat separat, 120/120 raspund 200 pe esantion
    aleator, 2 din 3473 fara imagine. Nu necesita interventie.
- **Nota de taxonomie**: NU exista categoria `telecom` in date, desi apare in tabelul de sluguri de mai
  jos si in `CategoryIcon.tsx`. Cele 18 valori reale, cu numarul de magazine (14.08.2026): marketplace
  212, casa-gradina 145, electronice 122, fashion 109, software 95, beauty 84, calatorii 82, sanatate 61,
  sport 48, carti-educatie 37, copii 35, auto-moto 30, bijuterii 22, servicii 22, animale 17,
  mancare-bauturi 17, cadouri-flori 15, financiar 14.

**UPDATE 10.08.2026 (SEO: cauza reala a neindexarii gasita + recenzii fabricate eliminate + calculator TVA — PUSHED):**
- **DESCOPERIREA CENTRALA: 92% din URL-urile trimise la Google erau template gol.** Masurat:
  din 1177 pagini de magazin, doar **92** au continut propriu (62 cu promotie activa, 80 cu
  produse in feed, cu suprapunere). Restul de **1085** erau acelasi template cu numele schimbat.
  Toate cele **1507** URL-uri erau in sitemap. Pentru un domeniu fara autoritate asta e cea mai
  rea combinatie: Google vede ca aproape tot ce-i trimitem e subtire, trateaza domeniul ca fiind
  de calitate mica, si bugetul de crawl (mic, proportional cu autoritatea) se arde pe paginile
  goale. **Asta explica "Discovered – currently not indexed" la scara, mai mult decat backlink-urile.**
  - Fix: `frontend/lib/seoIndexable.ts` — o SINGURA sursa de adevar, folosita SI de `sitemap.ts`
    SI de `metadata` din `cod-reducere/[magazin]/page.tsx`. Paginile fara continut primesc
    `noindex, follow` (raman live, link afiliat functional, link equity trece) si ies din sitemap.
    Se auto-repara la urmatorul pipeline cand apare o promotie.
  - **Verificat pe build**: sitemap **1507 → 425** URL; `logitech.com` (gol) = `noindex` + absent
    din sitemap; `drmax.ro` si `emag.ro` = indexate + prezente. Coerenta perfecta sitemap↔meta.
- **CORECTIE IMPORTANTA la strategia de continut** (cercetare Semrush, baza `ro`, august 2026):
  presupunerea "un site nou nu poate prinde «cod reducere X»" e **GRESITA**. Doar eMAG e greu
  (KD 34). Restul nisei e KD 6–16, cu volum real: `cod reducere about you` 8.100/KD12,
  `zalando` 6.600/KD14, `trendyol` 5.400/KD10, `fashion days` 3.600/KD12, `dr max` 2.400/KD10,
  `douglas` 1.600/KD9, `elefant` 880/KD6. **Paginile de magazin SUNT activul principal** — de-aia
  regula de indexare are si o lista `BRANDURI_CU_CERERE` (drmax, answear, philips, kitunghii,
  noriel), care raman indexate chiar fara promotie: altfel exact paginile castigabile ar fi disparut.
  - **A doua rezerva, mai usoara**: calculatoarele. `calculator tva` 18.100/luna KD14,
    `calculator procente` 12.100/KD14, `calculator impozit auto` 6.600/KD17, `calculator concediu
    medical` 1.600/KD11, `calculator dividende` 1.300/KD8. Construit primul: **`/calculator-tva`**
    (cote verificate live: 21% standard + 11% redusa din 01.08.2025; cea de 9% tranzitorie a
    expirat 31.07.2026). Urmatoarele de construit, in ordinea volumului: procente, impozit auto.
  - **NU investi in continut Q&A/FAQ** — intrebarile au volum ~0 in RO (verificat), spre deosebire
    de engleza. Formatul care merge aici e calculator/comparatie/pagina de brand.
- **RECENZII FABRICATE pe cele 30 de pagini `/top` — eliminate.** Toate cele **142 de produse**
  aveau `imagine: picsum.photos/...` = poze STOCK ALEATOARE prezentate ca fiind produsul (10 live
  doar pe `/top/laptopuri`). Plus 14 descrieri care pretindeau testare reala ("Am analizat 20+
  modele", "testate in bucatarie") si bara de statistici scria "Produse testate" — nicio dovada de
  testare nicaieri in repo. Acelasi tip de fabricatie eliminat pe 03.07 (procent_succes random,
  comision afisat ca cashback), reaparut aici. Fix cu `scripts/fix_top_onestitate.py` (reutilizabil):
  imagini false eliminate, pretentii rescrise in ce s-a intamplat de fapt, nota de metodologie
  explicita pe pagina. Scorurile raman, dar etichetate ca **editoriale**, nu masuratori.
  **Verificat ca NU erau emise ca date structurate** → nu exista risc de penalizare manuala.
- **Backlink-uri — cifra reala, nu "zero"**: 83 linkuri / 68 domenii, Authority Score 2. Mai util:
  competitorul `cuponescu.ro` (~350k vizite/luna) se tine pe **~5 linkuri editoriale romanesti**
  reale (retail.ro AS34, startupcafe.ro AS45, carturesti.ro AS55, euplatesc.ro AS35) — restul sunt
  PBN-uri spam. **Bara e mult mai joasa decat pare.** Ce a functionat la ei: un studiu pe date
  proprii ("din peste 900 de magazine"), preluat de retail.ro cu link. AmCupon are date pe care
  nimeni altcineva nu le are (1177 magazine, istoric promotii, comisioane pe categorie) — vezi
  ideile de continut linkabil in PLAN-MASTER.
- **CAPCANA DE VERIFICARE (m-a pacalit azi, nu o repeta)**: `npx tsc --noEmit -p . 2>&1 | head -15;
  echo "EXIT=$?"` raporteaza MEREU 0 — `$?` prinde exit-ul lui `head`, nu al lui `tsc`. Am crezut
  ca type-check-ul trece, iar `npm run build` a picat imediat dupa. Corect:
  `npx tsc --noEmit -p . > /tmp/out.txt 2>&1; echo $?` (redirect, nu pipe), apoi citesti fisierul.
- **GOTCHA `.next` (varianta noua a celui documentat pe 08.08)**: daca opresti dev server-ul in
  timp ce compileaza, ramane un `.next/dev/types/routes.d.ts` TRUNCHIAT la mijloc, iar `tsc` il
  include si raporteaza zeci de erori de sintaxa care NU sunt in codul tau. Semnul distinctiv:
  toate erorile sunt pe acelasi rand dintr-un fisier din `.next/`. Fix: `rm -rf .next` + rebuild.
- **CANIBALIZARE — REPARATA** (`scripts/fix_canibalizare_canonical.py`, reutilizabil): **29 de
  branduri** aveau DOUA pagini pe aceeasi cautare — una editoriala (`/drmax`, `/answear`,
  `/noriel`, `/trendyol`, `/temu`, `/fashiondays`, `/decathlon`, `/notino`...) si una generata
  (`/cod-reducere/drmax.ro` etc), fiecare cu canonical propriu. Semnalul se imparte in loc sa se
  cumuleze — pe un domeniu cu Authority Score 2, pierdere neta pe exact cuvintele valoroase.
  Fix: pagina de brand isi declara canonical catre pagina de MAGAZIN. Nimic sters, niciun link
  rupt — pagina ramane live si utila, doar semnalul se consolideaza intr-o singura adresa.
  De ce castiga pagina de magazin: se potriveste semantic cu interogarea, se actualizeaza singura
  cu promotiile (pipeline 4h), are tab-uri/produse/recenzii/comparatii, si e deja tinta linkurilor
  interne. Cele 7 branduri FARA pagina de magazin (altex, flanco, elefant, asos, iherb, asigurari,
  albire-dinti) nu se ating — acolo pagina de brand e singura.
  **Capcana prinsa in propriul script**: pentru brandurile cu mai multe domenii de tara
  (liki24.co.uk/.pl, vidaxl.ro/.bg) `setdefault` alegea arbitrar dupa ordinea din fisier — putea
  canonicaliza un site ROMANESC catre `.co.uk`. Acum sorteaza cu preferinta `.ro` > `.com` > restul.
- **TOATE UNELTELE DE CALCUL — ELIMINATE 11.08.2026** (decizie explicita Alex: "scoatem calculator
  si tot ce ne poate fi raportat"). Sterse: `/calculator` (reduceri), `/calculator-salariu`,
  `/calculator-tva`, `/generator-proforma`. Plus `/calculator-procente`, construit in aceeasi zi si
  niciodata deployat.
  - **Motivul**: cele fiscale afiseaza cifre reglementate (cote CAS/CASS/impozit, cote TVA) care se
    schimba prin lege — daca raman nesincronizate, cineva isi poate calcula gresit obligatiile;
    generatorul de proforma producea un document cu aspect oficial intr-un context in care
    e-Factura e obligatorie din 2024.
  - **NU au fost sterse pur si simplu**: erau indexate, deci **redirect 301 catre `/servicii`** in
    `next.config.ts` (semnalul SEO se transfera, linkurile vechi nu ajung in 404). Scoase si din
    `sitemap.ts`, `Navbar.tsx`, `Footer.tsx`, `servicii/page.tsx`, `top-reduceri/TopReduceriClient.tsx`
    (acolo grila a trecut de la 2 coloane la 1, ca sa nu ramana jumatate de rand goala).
  - **Costul asumat**: ~40.000 cautari/luna cu dificultate mica (calculator tva 18.100/KD14,
    procente 12.100/KD14, impozit auto 6.600/KD17) — era cea mai usoara rezerva de trafic pentru un
    domeniu fara autoritate. Decizie de risc, luata in cunostinta de cauza.
  - **Daca se reiau vreodata**: varianta FARA risc e aritmetica pura (procente, reduceri), nu cote
    reglementate. Pentru orice calcul fiscal: sursa oficiala verificata la fiecare rulare +
    disclaimer explicit. NU inventa procente intr-un calculator fiscal.
- **RAMAS de reparat (gasit, nereparat inca)**:
  1. **`lastModified: new Date()`** in 123 de locuri din `sitemap.ts` — toate URL-urile par
     modificate la fiecare build, ceea ce anuleaza semnalul de prospetime. Atentie: `ultima_verificare`
     NU e o alternativa mai buna (pipeline-ul il seteaza "azi" pe toate magazinele la fiecare rulare).
  2. **REGRESIE feed produse: 33.096 → 3.468 produse**, din care 3.000 de la UN singur magazin
     (navstore.ro); restul de 79 au ~20 fiecare. Zero scule/gradina in feed (0 motocoase, 0 drujbe),
     desi exista 8 magazine partenere reale in nisa cu link de tracking (scule365.ro, sculefix.ro,
     evolutionpowertools.ro, albertool.com, brico.ro, agroclima.ro, hototools.com, magroup.ro).
     Asta blocheaza orice pagina noua de tip "top produse" pe categorii de scule.

**UPDATE 09.08.2026 (homepage unificat cu cardul premium + audit strict + bug taxonomie categorii — PUSHED, 4 commits):**
- **Homepage folosea un card SEPARAT, mai vechi** (`Card` inline în `HomeClient.tsx`), niciodată
  atins de polish-ul `.glass`/Deal Score aplicat pe `MagazinCard.tsx` (folosit pe /toate-magazinele,
  categorii etc). Găsit direct de Alex ("nici ca in ss nu imi place aspectul"). Conținea și 2 semnale
  false: un "Trust Score" hardcodat 100%/45% (nimic real în spate) și un vot "A funcționat oferta?"
  care scria doar în `localStorage`, fără să ajungă nicăieri — părea că "ascultăm feedback", nu făcea
  nimic cu el. Homepage-ul folosește acum `MagazinCard.tsx` peste tot (adăugat suport opțional
  `isFavorit`/`onToggleFavorit` acolo, singurul lucru bun din cardul vechi).
- **Badge nou "Transport gratuit"**, detectat din textul real al promoției (regex pe nume/descriere),
  pe `MagazinCard.tsx` + `MagazinClient.tsx`. NU e inventat — doar afișat cand apare explicit în date.
- **Bara de căutare din hero eliminată** — făcea `scrollIntoView(smooth)` pe FIECARE literă tastată,
  pagina sărea continuu cât timp scriai. Se simțea ca un bug (userul a raportat "nu funcționează"),
  dar filtrarea chiar mergea — doar UX-ul de scroll era stricat. Căutarea rămâne în header + meniu
  mobil, fără acest defect.
- **`next/image` cu `unoptimized`** pe `MagazinCard.tsx` + `MagazinClient.tsx` (5 imagini) —
  lazy-loading + zero layout shift, dar FĂRĂ pipeline-ul de optimizare Vercel. Motiv: 1176+ logo-uri
  externe + zeci de mii de imagini de produse ar putea depăși cota gratuită de "source images" a
  Vercel Image Optimization foarte repede → risc de factură surpriză. `next.config.ts` are deja
  `remotePatterns: [{hostname: "**"}]` (nu era blocajul tehnic presupus în audit-ul din 24.07).
- **BUG DE FOND, gasit prin audit strict, prezent in 2 locuri**: taxonomia de categorii (`categorie_slug`)
  a migrat demult de la sluguri ENGLEZESTI la ROMANESTI (18 valori reale: fashion, beauty, bijuterii,
  electronice, software, telecom, casa-gradina, animale, mancare-bauturi, carti-educatie, copii,
  cadouri-flori, calatorii, sanatate, financiar, sport, auto-moto, marketplace — vezi si
  `CategoryIcon.tsx`), dar 2 fisiere ramasesera pe taxonomia veche englezeasca:
  1. `app/categorii/page.tsx` — toate cele 18 linkuri de categorie duceau la 404 (sluguri gen
     `electronics-itc`/`home-garden` nu exista in `categorie_slug` real, deci `generateStaticParams()`
     din `[slug]/page.tsx` nu genera niciodata acele pagini). Rescris array-ul cu cele 18 sluguri reale,
     adaugate `financiar` si `calatorii` (lipseau complet din pagina).
  2. `scripts/generate_store_descriptions.py` — dictionarul `CATEGORIE_RO` cadea pe fallback-ul
     generic "produse variate" pentru aproape orice magazin, producand text de deschidere IDENTIC pe
     237 din 1176 pagini de magazin (continut duplicat = semnal SEO slab). Corectat + regenerat toate
     cele 1176 descrieri (`--force`) — duplicate ramase: 9, toate marketplace-uri reale unde fraza
     generica e de fapt corecta.
  **Lectie**: NUME_CATEGORIE din `[slug]/page.tsx` are ACELASI tabel vechi englezesc, dar acolo e
  inofensiv (doar fallback pe `mag[0].categorie` daca lipseste cheia) — nu l-am mai atins, dar orice
  cod nou care mapeaza categorie_slug -> text trebuie sa foloseasca cele 18 sluguri RO, nu cele vechi.
- **Alte fix-uri gasite prin acelasi audit** (link-uri/copy verificate live cu curl, nu presupuse):
  `/pescuit` avea link mort catre `/gradina` (-> `/casa`); `/vpn`+`/hosting`+`/recomandari` aveau din
  nou afirmatia nesustinuta "am testat sau verificat independent" (regresie fata de fix-ul documentat
  06.08 — verifica periodic ca fix-urile de onestitate nu revin la o rescriere ulterioara de pagina);
  `/despre-noi` contrazicea direct `/termeni` (promitea "garantam" functionalitate, termenii spun
  explicit "nu garantam") — aliniat, link direct catre termeni; `/vpn` avea fraza incoerenta "multi
  bani putini" (-> "buget limitat"); titluri peste 60 caractere pe `/vpn`/`/casa`/`/sport` scurtate.
- **Metoda de audit**: un workflow cu 4 agenti paraleli (linkuri/imagini/copy/SEO) a gasit 21 candidati,
  dar faza de verificare adversariala a picat integral pe limita de sesiune Claude. Fiecare fix de mai
  sus a fost verificat MANUAL cu curl/grep direct pe productie inainte de reparare — 3 din candidati
  (link typo "cod-reduciere/jollymag", link "/alte-categorii", "Deal Score 0/100" pe eMAG) s-au dovedit
  halucinatii ale agentului finder, NU probleme reale, si au fost respinse, nu raportate ca reparate.
- **Impact.com Deals API — cercetat, construit, testat, BLOCAT pe cont**: exista real endpoint-uri
  `/Mediapartners/{sid}/Deals` si `/PromoCodes` (Partner API) care ar aduce oferte/cupoane reale, nu
  doar link-uri de tracking. Script nou `scripts/fetch_impact_deals.py` (aceleasi credentiale ca
  `fetch_impact_api.py`, pattern defensiv identic cu `fetch_awin_api.py` — afiseaza raw JSON inainte
  de parsare, nu scrie nimic daca schema nu se potriveste). Testat live prin `.github/workflows/
  test-impact-deals.yml` (workflow manual, doar `workflow_dispatch`, foloseste secretele deja existente
  fara sa le vad vreodata): **ambele endpoint-uri dau 403 Forbidden ("Access Denied")** — contul Impact
  (7401119) are acces la `/Campaigns` dar NU la continut promotional. Nu e bug de cod. Actiune Alex:
  intreaba suportul Impact.com daca poate fi activat accesul la Deals/Content API.
- **Awin — la fel, are endpoint real de oferte**: `POST /publisher/{id}/promotions` (cod de cupon +
  interval de valabilitate confirmate in raspuns), dar tokenul Awin curent ar putea avea nevoie de
  regenerare cu scope de "promotions" — neverificat inca (asteapta `AWIN_API_TOKEN` in secrets).
- **CJ Affiliate**: API-ul modern GraphQL NU are query de deals/cupoane; exista un API REST legacy
  ("Link Search") care poate partial, cu Personal Access Token nou din `developers.cj.com`.
- Tag verificare `impact-site-verification` adaugat in `layout.tsx` (acelasi tipar ca `profitshareid`)
  — Alex a atasat meta tag-ul din dashboard-ul Impact.com (canal "Website", verificare esuase pt ca
  tag-ul nu exista inca pe site).

**UPDATE 08.08.2026 — partea a 2-a (redesign vizual: iconografie, homepage -50%, fix conversie major — PUSHED):**
- **BUG DE CONVERSIE, cel mai scump din sesiune: 55 din 62 de pagini cu oferte se
  deschideau pe un tab GOL.** `MagazinClient.tsx` pornea mereu pe tabul "Coduri", dar din
  62 de magazine cu promotii active doar **7** au cod real. Restul (emag, temu, shein,
  trendyol, fashiondays...) aveau doar oferte — deci cine venea din Google pe "Cod Reducere
  eMAG" ateriza pe un tab gol, iar ofertele reale stateau ascunse in spatele unui tab pe
  care trebuia sa-l observe. Fix: tabul implicit = primul cu CONTINUT REAL (coduri >
  oferte > produse). **Verifica asta la orice tab nou** — nu presupune ca primul tab are date.
- **Iconografie categorii: emoji -> Lucide, 16 culori -> 5 familii.** `CategoryIcon.tsx`
  (nou). Emoji-ul mare pe patrat cu gradient saturat era cel mai slab element vizual (se
  randeaza diferit pe fiecare OS, nu poate fi stilizat). Ironic: CLAUDE.md documenta ca
  "curcubeul" a fost eliminat pe 30.06 — exact el ramasese pe categorii, mutat din
  `from/to` in `accent`. Acopera AMBELE taxonomii (sluguri RO magazine + EN produse).
- **Homepage 19657px -> 9926px (-49,5%), 20,6 -> 13,8 ecrane, 12 -> 10 sectiuni.** Taiate,
  dupa masurarea fiecarei sectiuni in DOM: spotlight-ul DUPLICAT ("Oferta zilei" si "Deal
  zilei" erau doua sectiuni care alegeau magazine diferite si pretindeau amandoua ca sunt
  oferta zilei), sectiunea "Oferte care se termina azi" (327px pt 4 carduri care apar
  oricum mai jos cu badge rosu), si 12 carduri "Fara promotii active momentan" inlocuite
  cu perete compact de logo-uri (aceleasi magazine si linkuri — regula "promoveaza tot" —
  dar ~4 ecrane -> 563px). Randurile de produse limitate de la 6 la 4 (ocupau 23% din pagina).
- **NU am taiat** desi pareau candidati, pentru ca verificarea a aratat valoare reala:
  "Magazine de incredere" (12, cu oferte) vs "Magazine partenere" (24, fara) — suprapunere
  masurata **zero**, seturi diferite; "Ghiduri dedicate" — 0 carduri dar linkuri interne
  SEO catre paginile brand. **Masoara inainte sa tai**, nu presupune redundanta.

**UPDATE 08.08.2026 (atribuire pe pagina + polish vizual + 3 bug-uri live gasite prin verificare, nu raportate — PUSHED):**
- **BUG GRAV reparat — caseta de cautare de pe homepage avea text INVIZIBIL.** `bg-slate-100`
  (#f1f5f9) cu `text-[#f1f5f9]` — aceeasi culoare. Oricine tasta acolo nu vedea nimic. Confirmat
  in DOM (computed styles identice) inainte de fix. **Cauza radacina**: `retheme_dark_2026.js`
  (migrarea la dark, 16.07) a convertit hexurile arbitrare dar NU si clasele Tailwind NUMITE —
  112 aparitii ramase in 40 de fisiere, invizibile la orice audit pe hexuri. Curatate cu
  `scripts/fix_light_leftovers.js` (nou), care NU atinge `bg-white` (cutiile de logo raman
  intentionat albe). **Daca faci alt rebrand: cauta SI clasele numite, nu doar hexurile.**
- **Newsletter: comisionul era afisat ca reducere.** `send_newsletter.py` (NU
  `generate_daily_digest.py`) — `format_comision()` era atribuit variabilei `disc` si randat sub
  logo, exact unde cititorul asteapta reducerea: "Comision 10%" se citea ca "10% reducere".
  Aceeasi greseala "cashback fals" eliminata din site pe 03.07, supravietuise aici. Inlocuit cu
  `badge_onest()`: procent REAL parsat > cod real > verificat CHIAR azi > neutru. NU s-a folosit
  badge-ul "Cod Exclusiv" (0 magazine au `exclusiv=True` — ar fi fost fabricat). Plus grupare pe
  4 sectiuni tematice (top 3 fiecare) si HTML rescris **table-based**: versiunea veche folosea
  `display:flex` SI `display:grid`, niciunul suportat de Outlook. Nou flag `--dry-run`.
- **Atribuire pe pagina, gratuit (in loc de ~59 EUR/luna).** 1099 din 1178 de linkuri (93%) nu
  aveau NICIUN sub-id: la o vanzare, reteaua raporta "comision de la AmCupon" fara sa spuna de pe
  ce pagina. `AffiliateClickTracker.tsx` scrie acum calea paginii in parametrul fiecarei retele
  — `st=` (2Performant, confirmat in documentatia lor), `subId1=` (Impact), `clickref=` (Awin),
  `sub_id=` (Profitshare), `sid=` (CJ). Cand exista deja valoare, o pastreaza si adauga pagina
  dupa `~`. Verificat live: ambele URL-uri modificate raspund 200 (atribuirea nu strica comisionul).
  **Acelasi fisier avea si `AFFILIATE_HOSTS` doar cu 2performant+profitshare** — click-urile pe
  Impact/Awin/CJ (~580 magazine) nu generau deloc eveniment GA4. Reparat.
- **Linkuri interne moarte pe TOATE cele 107 pagini.** `MAGAZINE_POPULARE` din `Footer.tsx`
  (global) continea altex.ro/flanco.ro/elefant.ro — branduri fara program de afiliere, deci
  absente din output.json, deci `/cod-reducere/<slug>` = 404 (confirmat pe productie cu curl).
  Fix: camp optional `href` care suprascrie tiparul; paginile `/altex`,`/flanco`,`/elefant` exista
  si raspund 200. Acelasi bug in `BrandPageTemplate.tsx` (buton neconditionat, 5 pagini) si
  `HomeClient.tsx`. **Regula: orice link nou catre `/cod-reducere/X` presupune ca X e in
  output.json — verifica intai.**
- **Profitshare — verificat, NU s-a sters nimic.** Alex a cerut stergerea ("nu raspund"), dar
  `scripts/check_affiliate_links.py` (nou, reutilizabil pe orice retea, cu `--delete-dead`
  optional) a testat live toate cele 60 de linkuri: **60/60 vii (200 OK), 0 moarte**. "Nu raspund"
  = suportul, nu linkurile. Semnalat ca eMAG e EXCLUSIV pe Profitshare (nu e pe Impact — ce parea
  potrivire era `tangemag.pxf.io`, fals pozitiv), deci stergerea ar fi taiat cel mai cautat brand RO.
- **Polish vizual** (fara Supabase, fara `/go` — decizie explicita Alex dupa ce am aratat ca
  brief-ul de "rescriere completa" cerea lucruri deja construite): design tokens in `globals.css`
  (`--surface`/`--border`/`--accent`...), utilitare `.glass` si `.elevate`, focus-visible,
  `prefers-reduced-motion`. Sters cod mort verificat de 3 ori: `ThemeToggle.tsx` (0 importuri,
  `layout.tsx:137` sterge activ clasa `dark` la load), `PromoCarousel.tsx`, ~70 linii CSS `.dark`.
  Portocaliul/amber eliminat de unde mai era (HomeClient accent categorii + /cadouri) — **0 in tot `app/`**.
- **Gotcha de dev**: dupa modificarea `globals.css`, dev server-ul servea CSS-ul VECHI din cache-ul
  `.next` (continea inca reguli sterse). Restart simplu nu ajuta — necesita `rm -rf .next`.

**UPDATE 06.08.2026 (fix acces /admin + panou Affiliate Audit + reconciliere Impact extinsa — PUSHED, commits 88e877f+dc26f7c+11b3c9e):**
- **Bug real gasit + reparat: `/admin` nu se putea accesa cu NICIO parola.** `app/admin/page.tsx`
  compara cookie-ul de sesiune (hash SHA-256, `deriveSessionToken()`) direct cu `ADMIN_PASSWORD` in
  clar — `login/route.ts` fusese deja hardened sa stocheze hash-ul, dar aceasta pagina a ramas pe
  verificarea veche, deci comparatia nu se putea potrivi NICIODATA. Fix: foloseste `checkAuth()`
  (`lib/adminAuth.ts`), la fel ca `/api/admin/status` si `/api/admin/trigger`.
- **Panou nou `/admin` — "Affiliate Audit"**: `api/admin/status/route.ts` (`getAffiliateAudit()`) +
  tab nou in `AdminDashboard.tsx` — lista magazinele fara link de tracking real (acelasi regex ca
  `merge_platforms.py`), sortate promotie-activa-prima (clicuri reale acum) apoi scor descrescator,
  breakdown pe platforma, link direct catre pagina publica a fiecarui magazin. Scop: Alex vede mereu
  exact unde e monetizarea 0, fara sa mai numere manual in output.json.
- **`reconcile_impact_links.py` extins — verifica acum si `data/output.json`, nu doar
  `extra_merchants.json`.** Gasit prin panoul de mai sus: 50+ magazine (kkday.com, artlist.io,
  travala.com, jackery, roborock etc.) aveau program Impact ACTIV in CSV dar traiau in
  `data/output.json` (fisierul etichetat "2Performant" in `merge_platforms.py`, folosit istoric si
  pt Impact) — niciun script nu le verifica vreodata. Adaugat si matching eTLD+1/subdomeniu explicit
  (`MULTI_TLD` — co.uk/com.au/etc, ca sa nu confunde TLD compus cu root real), pt cazuri ca
  `nl.jackery.com` -> program-ul de baza `jackery.com`.
  - **Wired in `update-data.yml`, inainte de `merge_platforms.py`** — pana acum scriptul exista dar
    rula DOAR manual, o singura data; acum e permanent, se auto-corecteaza la fiecare rulare de 4h
    cand apar magazine noi descoperite (`discover_impact_merchants.py`) fara link inca reconciliat.
  - **Rezultat verificat**: orfane reale (fara tracking) **138 → 88** (3 direct + 85 impact, din 1178
    total). Restul de 88 sunt genuine — verificat manual (grep pe CSV) ca temu.com/shein.com/
    trendyol.com/hostinger.ro/norton/revolut/envato/banggood/logitech/upwork/razer/blinkist NU au
    program Impact activ acum, nu e o eroare de matching — necesita aplicare noua la retea (actiune
    Alex, nu se poate reconstrui din date existente fara sa ghicim, exact eroarea reparata pe 06.08).
- **Descoperire in timpul lucrului**: exista deja `AGENTS.md` (root) + `.codex/agents/*.toml` (3
  agenti Codex: affiliate-link-auditor, brand-guard, seo-schema-checker) — workflow-ul Codex al lui
  Alex, separat de acest fisier, nu s-a modificat nimic acolo.
- Build + `tsc --noEmit` + `eslint` verificate. Testat live in dev (login real cu parola din
  `.env.local` local, nu afecteaza `ADMIN_PASSWORD`-ul real din Vercel).

**UPDATE 06.08.2026 (Impact.com import proaspat + fix critic onestitate linkuri — PUSHED):**
- Alex a atasat un export nou Impact.com (`Campaigns.csv`, 530 programe active, fata de 484 din
  iunie) cu cererea explicita "nu vreau afiliere fara link verificat, nu vreau sa pierd nimic".
- Import normal (`import_generic_affiliate.py --network impact`): +57 magazine noi. Verificat live
  (10 linkuri random, toate 200 OK cu tracking real).
- **Bug critic descoperit in timpul verificarii**: 208 din 567 magazine `platforma:impact` aveau
  link FALS sau netrackuit — mostenire din `add_impact_merchants.py` (lista veche hardcodata, ghicea
  "probabil au program pe Impact" fara sa verifice niciodata, folosea `?ref=amcupon`/
  `REFERRALCODE=AMCUPON` placeholder). **Root cause structural**: `merge_platforms.py` e
  auto-referential (`data/output.json` e simultan input SI output al scriptului) si dedup-ul pastra
  intrarea cu scor mai mare — un link fals cu scor 95 (ex. Hostinger) bloca la infinit un link real
  cu scor mai mic, pe FIECARE rulare viitoare a pipeline-ului, fara sa se auto-repare niciodata.
- **Fix pe 2 straturi** (permanent, nu doar patch o singura data):
  1. `scripts/reconcile_impact_links.py` (nou) — cross-referenteaza `extra_merchants.json` cu
     exportul CSV proaspat: upgradeaza la link real unde exista program activ, curata parametrul
     fals unde nu exista (NU sterge magazinul — devine recomandare onesta fara comision, politica
     deja stabilita pt branduri fara program afiliat).
  2. `merge_platforms.py` — regula noua in dedup: link cu tracking real castiga MEREU in fata unui
     link fara, indiferent de scor. Plus o pasa finala de siguranta la fiecare merge: orice
     `url_afiliat` cu parametru fals ramas (din orice sursa veche) se curata automat, de acum
     incolo — self-healing, nu mai poate reveni tacit.
- **Rezultat verificat**: 0 linkuri false `ref=amcupon` in tot `output.json` (erau 32+ doar in
  `extra_merchants.json`, plus altele direct in `data/output.json`). Impact: **359 → 432 magazine
  cu tracking real**, restul (135) sunt recomandari oneste, nu mai pretind fals ca ar fi trackuite.
  Build + `npm run build` curate, pushed.
- **Notă onestitate pentru viitor**: cand se aplica manual la un program nou (Alex, in dashboard-ul
  unei retele), NU se adauga niciodata magazinul in `extra_merchants.json`/scripturi cu link ghicit
  "probabil va fi asa" — se asteapta exportul CSV cu linkul REAL, apoi `reconcile_impact_links.py`
  sau `import_generic_affiliate.py` il adauga corect. Lectie directa din acest bug.

**UPDATE 06.08.2026 (bug real thin-content pe 12 pagini + redesign newsletter — PUSHED):**
- **Bug critic gasit + reparat**: `/calatorie` afisa 0 magazine (grila complet goala) — `CAT_TRAVEL`
  cauta slug-ul `"calatorie"` dar datele reale au `categorie_slug:"calatorii"` (plural, nu se potrivea
  cu `.includes()`). Adaugat `"calatorii"` in lista.
- **Bug structural gasit + reparat pe 12 pagini de nisa** (fashion, electronice, casa, copii, animale,
  sanatate, gaming, laptop, telefoane, antivirus, smart-home, calatorie): filtrul cerea `m.are_promotie`
  obligatoriu, dar `are_promotie:true` e rar (ex. 0/37 la calatorii, 2/37 la copii) — contrazicea explicit
  principiul "promoveaza tot, nu doar cupoane". Scos filtrul obligatoriu, adaugat `.sort()` care pune
  magazinele cu promotie activa primele (fara sa mai excluda restul).
- **`scripts/generate_banner_auto.py`**: `draw_grid()` desena cu `fill=(249//10,115//10,22//10)` — rest
  literal din vechiul portocaliu interzis (249,115,22), opac, in loc de variabila `color` (indigo
  transparent) definita dar niciodata folosita. Corectat.
- **`sitemap.ts`**: scoase 3 intrari duplicate (`/vpn`,`/hosting`,`/ai-tools` apareau de 2 ori cu
  priority/frequency diferite), adaugate 2 pagini orfane (`/comparator`, `/servicii-internationale`
  — existau ca rute reale dar nu erau in niciun sitemap).
- **`/vpn`, `/hosting`**: copy corectat — pretindea "am testat"/"testate independent" fara nicio dovada
  de testare reala in cod/date; inlocuit cu "am comparat public preturile/specificatiile".
- **Newsletter redesign** (cerere Alex: peste 20 coduri in email): welcome email (`api/newsletter/route.ts`)
  si campania saptamanala (`scripts/send_newsletter.py`) — de la 6/5 oferte la **20** (8 carduri complete
  cu cod vizibil + grila compacta 2 coloane pt restul de 12). `send_newsletter.py` era ramas complet pe
  tema veche indigo/violet (`#4338ca` etc.) de la rebranding-ul din vara — rebranduit la tema teal
  curenta. `/newsletter`: statistici hardcodate stale ("600+ magazine", "top 5 coduri") inlocuite cu
  numere reale citite din `output.json` la request.
- Verificat: `npm run build` + `tsc --noEmit` + `eslint` curat pe toate fisierele. Testat generarea reala
  a HTML-ului newsletter cu date live (20 oferte, grila completa). Pushed pe `main` (rebase curat peste
  27 de commit-uri automate acumulate).
- **Networks — status neschimbat, cerere Alex 06.08 sa avanseze**: cod-ul e 100% pregatit pt toate 4
  retele (`scripts/import_generic_affiliate.py` are preset pt `impact`/`awin`/`cj`/`admitad`) — blocajul
  e strict pe 2 export-uri CSV pe care doar Alex le poate face: **Awin** (dashboard → Joined Programmes
  → export cu coloana "Click Through Link" → salveaza ca `data/awin_export.csv`) si **CJ** (dashboard →
  Advertisers → Export joined → salveaza ca `data/cj_export.csv`). 2Performant si Impact sunt deja ACTIVE.

**UPDATE 24.07.2026 (audit calitate cod — lint 53→24 probleme, build verde, NEPUSHED):**
- Cerere Alex: audit general de calitate/eroare/performanță. `npm run lint` inainte: 53 probleme
  (14 erori, 39 warnings). Dupa: **24 probleme (11 erori, 14 warnings)**, `npm run build` verde,
  0 regresii vizuale verificate in dev (homepage, `/copii`, `/altex`, `/produse/fashion`, `/admin`).
- **Fixate real (nu doar silentiate):** 2× `Date.now()` impur in JSON-LD (`cod-reducere/[magazin]/page.tsx`,
  `produse/[categorie]/page.tsx`) — Server Components, valoare stabila per generare, disable scoped cu
  justificare. 1× eroare reala de directiva eslint gresit plasata (`HomeClient.tsx` — `eslint-disable-next-line`
  pe acelasi rand cu codul, nu pe randul urmator → nu suprima nimic; corectat). 1× comentariu JSX afisat ca
  text literal (`AdminDashboard.tsx`, `react/jsx-no-comment-textnodes`) — mutat in `{"..."}`. 11 variabile
  `cuPromo` moarte (calculate, niciodata afisate) sterse din paginile de nisa. Import-uri moarte (`Script`,
  `ThemeToggle` din `layout.tsx` — tema e hardcodata pe hex, toggle-ul nu mai e randat nicaieri; `redirect`
  din `admin/page.tsx`; `useMemo` din `MagazinClient.tsx`; `hasCod` din `BrandPageTemplate.tsx`; `lastRun`+
  `agent` din `AdminDashboard.tsx`; `nrCupoane`+`nrOferte`+`link` duplicat din `HomeClient.tsx`).
  Eroare "This value cannot be modified" pe `Navbar.tsx:59` (`window.location.href =` intr-un handler) —
  fals pozitiv al noii reguli `react-hooks/immutability` (acelasi pattern la `handleSearchSubmit` alaturi
  NU e semnalat) — documentat cu disable scoped, nu schimbat comportamentul.
- **`eslint.config.mjs`**: adaugat `argsIgnorePattern`/`varsIgnorePattern: "^_"` pt `no-unused-vars` —
  fixeaza radacina (nu doar simptomul) pt parametri intentionat neutilizati (conventia `_nume` deja
  folosita in cod, dar config-ul n-o respecta).
- **Ramas neatins, deliberat (risc > beneficiu pt o trecere automata):** 8 erori `react-hooks/set-state-in-effect`
  (`HomeClient`, `ReviewSection`, `ComparatorClient`, `AffiliateScript`, `ConsentAnalytics`, `CookieBanner`,
  `Navbar`, `ThemeToggle`, `useWishlist`, `ToateMagazineleClient`) — toate sunt patternul standard Next.js
  "citeste din localStorage/window dupa mount, seteaza state" pt a evita hidration mismatch SSR/CSR. Regula
  noua a React Compiler-ului il considera suboptim (cauzeaza un re-render in plus), dar rescrierea corecta
  (`useSyncExternalStore`) atinge cod sensibil (consimtamant cookie-uri = legal, cautare navbar = UX central) —
  nu s-a facut o rescriere mecanica fara testare individuala atenta. 14 warnings `<img>` (next/image) —
  migrare reala de performanta (LCP/bandwidth), dar necesita configurare `remotePatterns` pt domeniile
  externe de logo-uri + verificare vizuala per pagina — backlog separat, nu facut acum.
- **Descoperiri din audit, corectii la documentatia stale de mai jos:** (1) `BrandPageTemplate.tsx` deja
  are JSON-LD BreadcrumbList+FAQPage si matching de slug pe niveluri (egalitate>prefix>substring) — nota
  veche din 30.06 care zicea ca lipsesc era **depasita**, corectata. (2) `amazon.com` are acum link afiliat
  real (Impact, `ggamazon.sjv.io`) — nu mai e money-leak. (3) **Inca nerezolvat, activ chiar acum**: `altex.ro`
  si `flanco.ro` lipsesc complet din `output.json` (paginile `/altex`, `/flanco` exista cu continut SEO
  complet dar 0 link de afiliere — CTA-ul se ascunde automat, nu link mort, dar 0 monetizare). **`temu.com`
  si `shein.com` au `url_afiliat` = URL brut, netrackuit** desi apar cu `are_promotie:true` si sunt promovate
  activ (inclusiv in batch-ul de Pinterest din 24.07) — clic-uri reale, comision 0. Necesita aplicare Alex
  la programele de afiliere Temu/Shein (probabil via Awin/CJ/Impact, nu 2Performant).

**UPDATE 20.07.2026 (audit vizual complet — 1 bug live + 2 bug-uri pipeline gasite/reparate):**
- Cerere Alex: verifica fiecare pagina + fiecare banner cum arata. Screenshot-ul din Browser pane nu a
  functionat deloc in sesiune (a picat si pe example.com — problema de infrastructura, nu de site) —
  verificarea s-a facut prin DOM (imagini rupte, culori efective) + fetch pe toate rutele + log-uri
  reale din GitHub Actions. Homepage + fiecare tip de pagina (magazin, categorie, nisa, brand template,
  cadouri, comparatii, unelte, blog) — 0 imagini rupte, 0 resturi tema veche (auriu/portocaliu), tema
  dark consistenta peste tot.
- **BUG live gasit**: `frontend/app/blog/[slug]/page.tsx` construia titlul manual cu `${post.title} |
  AmCupon.ro`, dar `post.title` (din `generate_blog.py`) include deja " | AmCupon.ro" -> titlul aparea
  DUBLAT in tab/SERP pe toate cele 200+ articole ("...Iulie 2026 | AmCupon.ro | AmCupon.ro"). Reparat —
  foloseste direct `post.title`. Verificat ca restul paginilor (`categorii`, `cod-reducere`, `cadouri`,
  `top`, `oferte-azi` etc.) construiesc titlul din campuri care NU includ deja numele site-ului, deci nu
  au aceeasi problema.
- **BUG pipeline gasit (silentios de 3 saptamani)**: fluxul video zilnic (`generate_video_daily.py`,
  documentat "LIVE" din 29.06.2026) nu a produs NICIODATA `frontend/public/video-today.mp4` — verificat
  cu `git log` (fisierul n-a existat niciodata in istoric) + log-uri reale din Actions: **ffmpeg nu e
  preinstalat pe `ubuntu-latest`**, pasul degradeaza silentios ("ffmpeg negasit in PATH — skip video")
  fara sa pice pipeline-ul, deci nimeni nu observa. Reparat — pas nou `sudo apt-get install ffmpeg` in
  workflow (doar pe rularea completa de dimineata).
- **BUG pipeline gasit**: `telegram_daily.py` trimite mesajul cu `parse_mode: Markdown`, dar titlurile
  reale de promotie pot contine `_`/`*`/`` ` ``/`[` neescapate (ex. Videt: "...soare_15-21.07.2026") care
  rup parsing-ul Telegram ("can't find end of the entity") — postarea de azi a picat din cauza asta.
  Reparat — `esc_md()` pe `nume`/`titlu` inainte de interpolare.
- Alte descoperiri din log-urile Actions (NU reparate, necesita actiune Alex): Facebook posting da
  `Bad signature` (OAuthException) — tokenul e setat dar invalid/expirat, nu doar "lipseste" cum scria
  inainte in acest fisier; vezi Probleme active.

**UPDATE 20.07.2026 (email bun-venit cu oferte reale + postari zilnice reorganizate + IndexNow corectat):**
- **`sendWelcomeEmail()` (`frontend/app/api/newsletter/route.ts`) nu mai afiseaza 5 magazine hardcodate**
  (emag/fashiondays/drmax/noriel/carturesti, static indiferent de ce e activ acum). Functie noua
  `getTopOferte()` face `fetch("https://amcupon.ro/output.json")` (edge runtime nu are `fs`), ia top 6
  magazine cu promotie activa sortate `scor_final`, extrage cod/procent real. Daca fetch-ul pica, blocul
  de oferte nu se randeaza deloc — NU cade pe lista veche fabricata (acelasi principiu de onestitate ca
  auditul din 03.07.2026).
  - `scripts/generate_postari_simple.py` era un dump plat de 2017 linii / 95 magazine, identic structurat
  la fiecare magazin ("✅ Verificat azi de echipa AmCupon" ca filler generic). Acum: **index rapid** cu
  numar de magazine per categorie la inceputul fisierului, **sectiune "ASTAZI"** care extrage magazinele
  din tema zilei (`CALENDAR_SAPTAMANAL`, aceleasi categorii ca planul de continut), apoi restul grupat pe
  categorie (nu mai e un flux nediferentiat). Hook-uri cu emoji specific per categorie (👗 fashion, 💊
  sanatate etc, nu 🔥 la toate), plus o a 2-a linie de continut real din `descriere` promotiei cand difera
  de titlu (mai putina umplutura identica). **Atentie**: `CATEG_LABEL`/`HASHTAG_CATEG`/`CALENDAR_SAPTAMANAL`
  din acest script folosesc slug-urile REALE gasite in `categorie_slug` (fashion, beauty, sanatate,
  electronice, sport, copii, casa-gradina, auto-moto, calatorii, software, financiar, marketplace,
  carti-educatie, bijuterii, animale, mancare-bauturi, servicii, cadouri-flori) — sunt DIFERITE de slug-urile
  din sectiunea "Categorii sluguri" mai jos (acelea sunt pt. `/categorii/[slug]`, engleza). Nu unifica din
  greseala cele doua liste. Format JSON (`postari-zilnice.json`) ramane un array plat (`SocialItem[]`) —
  `frontend/app/admin/social/page.tsx` il parseaza direct ca atare, nu schimba forma fara sa actualizezi si acel fisier.
- **IndexNow**: `scripts/submit_indexnow.py` avea o functie moarta de 3 ani (`ping_google_sitemap`, endpoint
  Google deprecat iunie 2023, 404 silentios) — stearsa. Descoperire importanta: **Google NU participa la
  protocolul IndexNow** (testat de Google din 2021, niciodata adoptat — doar Bing/Yandex/Naver/Seznam/Yep).
  Pentru indexare Google specifica, singurele mecanisme reale raman sitemap.xml + GSC "Request Indexing"
  manual (cota ~10-12 URL/zi, doar Alex poate face asta). `/asigurari` era lipsa din `STATIC_PAGES` de la
  crearea paginii — adaugata, si s-a rulat o trimitere reala (400 URL-uri noi confirmate la Bing/Yandex).

**UPDATE 20.07.2026 (fix email dublu la abonare):**
- Alex a raportat ca primeste 2 email-uri la abonarea la newsletter. Cauza: site-ul are 5+ formulare
  de abonare independente (`NewsletterPopup`, `Footer`, `HomeClient`, `NewsletterCTA`, `NewsletterForm`)
  — daca cineva se reaboneaza printr-un alt formular, `route.ts` trimitea oricum un nou welcome email.
  Root cause exact: raspunsul Brevo `204` (contact existent, actualizat) era tratat identic cu `201`
  (contact nou) — ambele declansau `sendWelcomeEmail()`. Acum welcome se trimite DOAR pe `201`.
- Newsletter-ul pare sa functioneze acum (Alex confirma ca primeste email-uri) — vezi "Probleme active"
  pentru nota de verificare a sender-ului Brevo, nu presupune inca rezolvat 100% fara confirmare explicita.

**UPDATE 17.07.2026 (import Awin 16 magazine + redesign carduri magazin + pagina noua /asigurari):**
- **Import Awin real** (`scripts/import_awin_links.py`, CSV "Linkuri si produse" — format diferit de "Joined Programmes") — 16 magazine noi cu deep-link universal Awin (`cread.php`, nu linkuri de banner specifice/expirate): Abelssoft, Air Serbia, CarmelLimo, Click & Grow, Electrolux.ro, GetResponse, HideMy.Name, NUTRACEUTICS RO/HU, NordPass, O&O Software, PandaHall, Philips.ro, SilverRushStyle, Tenergy, Trampoline Parts, zChocolat. Integrate manual in paginile de nisa relevante (nu doar grid generic). 9 advertiseri Awin sarite (domeniu incert sau deja pe alta retea) — vezi Probleme active.
- **Redesign complet al cardurilor de magazin** — `frontend/app/components/MagazinCard.tsx` (nou, partajat) inlocuieste cardul bland "logo mic + Verifica ofertele curente + buton simplu" pe **27 de pagini** (23 pagini de nisa + `/categorii/[slug]` + `/craciun`, `/gadgets`, `/piese-auto`, `/cautare` gasite intr-un sweep ulterior). Card nou: logo mai mare, badge categorie, cod cupon mascat/dezvaluit cu copy-to-clipboard (fost doar in `CategorieClient.tsx`, acum peste tot). **Nu inventeaza pro/contra per magazin** — doar date reale din output.json; comparatii editoriale scrise de mana raman doar pe paginile curate (`/vpn` etc.).
- **`frontend/app/components/NewsletterCTA.tsx`** (nou) — sectiune compacta de abonare (POST direct catre `/api/newsletter`), inserata pe toate cele 27 de pagini de mai sus.
- **Pagina noua `/asigurari`** — descoperire din audit: `ottobroker.ro` (broker de asigurari RCA/CASCO/locuinta/viata/calatorie, 15 ani experienta, 130k+ clienti) era deja program 2Performant **aprobat si cu link functional**, dar `rank:999`/`scor:0` (niciodata curatat manual) si fara nicio pagina — complet invizibil. Construita cu `BrandPageTemplate.tsx` (acelasi tipar ca `/albire-dinti`), continut verificat direct pe ottobroker.ro (nu inventat). Adaugata in sitemap, `/servicii`, Footer.
- Build + lint verificate la fiecare pas (0 warning-uri noi). Verificare vizuala in browser pe fiecare pagina modificata.
- **Revenire deliberata la tema dark** (peste light/teal din 06.07), decizie explicita Alex ("da dark. fa-l dark") dupa ce am flagat tensiunea cu regula veche "NU reintroduce dark". Vezi sectiunea "Tema vizuala" mai jos pentru paleta completa si scripturile folosite (`retheme_dark_2026.js`, `purge_gold_leftover.js`, `fix_logo_boxes_dark.js`). Accentul teal a ramas neschimbat — doar bg/carduri/text au trecut de la deschis la inchis. 96 fisiere `.tsx` convertite, build + lint verificate (doar erorile pre-existente cunoscute au ramas: `Date.now()` impurity in `produse/[categorie]/page.tsx`, `setState-in-effect` in `ToateMagazineleClient.tsx`).
- **Fix critic gasit in timpul conversiei**: `:root { --background }` din `globals.css` ramasese `#ffffff` (nefolosit de paginile propriu-zise, dar `<body>` insusi era alb) — corectat la `#0a0f1a`, altfel aparea o margine/flash alb la scroll pe unele pagini.
- **Fix critic logo-uri**: conversia generala a innegrit si cutiile mici de logo ale magazinelor (erau `bg-[#ffffff]` → deveneau `bg-[#111827]`), facand logo-urile (PNG-uri cu forme inchise la culoare, proiectate pt fundal alb) ilizibile. Reparat separat cu `fix_logo_boxes_dark.js` (30+ cutii in ~30 fisiere) — cutiile de logo raman intentionat albe pe fundal dark.
- **Import CSV 2Performant** (`data/promotii_2p.csv` inlocuit cu export proaspat) — 973 linii, 113 promotii. Rulat initial contra output.json vechi (+40 magazine noi create), apoi re-rulat contra output.json proaspat din pipeline (dupa sincronizare cu `origin/main`) — de data asta cele 40 de magazine existau deja (aduse separat de pipeline-ul automat), doar promotiile s-au atasat: 1065 magazine / 97 cu promotii active / 22 cu cod real.
- **Awin — blocat, necesita actiune Alex**: CSV atasat initial era tipul gresit ("Advertiser Directory", fara link-uri de tracking). Alex a aratat un screenshot cu 27 programe aprobate in tab-ul "Joined Programmes" al dashboard-ului Awin, dar inca nu a exportat CSV-ul corect (cu coloana "Click Through Link"). Fara acel export, cele 27 de programe Awin nu pot fi importate cu linkuri reale.

**UPDATE 03.07.2026 (audit dur + curățenie ONESTITATE — NEPUSHED încă):**
- **Audit complet tehnic + competitori** în `docs/audituri/AUDIT-REMODELARE-2026-07.md`. Descoperire cheie:
  1044 magazine, 75 cu promoții, **0 cu cod real** (`cod_cupon: ""` la toate) — site "de coduri" fără
  coduri. Decizie Alex: **hibrid onest** (limbaj cod→ofertă + coduri reale doar unde există în date).
- **Semnale FALSE eliminate din UI** (cereau credibilitate, o distrugeau): pe homepage (`page.tsx`) +
  pagina magazin (`MagazinClient.tsx`) am scos: contoare fabricate cu hash/RNG ("X vizualizări azi",
  "X persoane caută acum"), `procent_succes` afișat ca "% rata succes" (random 72-96 din
  `calculeaza_succes`), `folosit_de` "Nx folosit" (random 15-800), și **comisionul afișat ca
  "Cashback până la X%"** (userul NU primește cashback — e comisionul nostru; `formatCashback` șters).
- **Blog (`generate_blog.py`)** scria fabricația în TEXT + meta excerpt (apare în Google): *"Rata de
  succes verificată: X% — mult peste media de piață de 65%"* + "folosit de X ori" + "Cashback din
  comandă". Toate neutralizate (string gol). `procent_succes`/`folosit_de` rămân DOAR ca cheie de
  sortare internă, niciodată afișate ca fapt. Articolele vechi se regenerează la următorul pipeline complet.
- **Sursa fabricației rămâne** `fetch_2p_api.py` (`calculeaza_folosit`/`calculeaza_succes` random) —
  acceptabil DOAR pentru ordonare internă acum că nu se mai afișează. De curățat complet dacă se reia.
- Build verde. **Necesită push** (confirmare Alex) ca să fie live.

**UPDATE 30.06.2026 (audit vizual + rebrand imagini — PUSHED):**
- **Audit real pe cod** (agent Explore) a găsit pagini "uitate" din migrarea dark theme + portocaliu/violet ramas.
  Reparate: `CategorieClient.tsx` (template pt TOATE paginile `/categorii/[slug]` — era light theme complet +
  hero violet), `NewsletterPopup.tsx` (modal peste TOT site-ul — era light+violet), `ReviewSection.tsx`
  (pe toate paginile de magazin — carduri light pe pagina dark), `not-found.tsx`, `ContactForm.tsx`,
  `contact/page.tsx`, `cautare/page.tsx`, `confidentialitate/page.tsx`, `termeni/page.tsx`,
  `NisaProduse.tsx` (componenta folosita in pagini de nisa), `gaming/page.tsx` + `smart-home/page.tsx`
  (hero-uri purple/amber + array-uri curcubeu `CULORI_BADGE` → indigo unic).
- **Rebrand imagini complet — logo-ul "AC" (favicon/PWA/OG) avea gradient violet→portocaliu**, decizie
  explicită Alex sa fie schimbat la indigo→cyan pentru consistenta totala cu UI-ul. `scripts/recolor_logo_indigo.py`
  recoloreaza shape-ul EXACT (stele/contur/ticket) prin remapare de nuanta HSV (nu recreeaza logo-ul).
  Backup original: `frontend/public/logo-ac-ORIGINAL-BACKUP.png` (gitignored, local only).
  Regenerat din noul logo: `icon-192/512/maskable-512.png` (`scripts/regenerate_favicons.py`),
  `og-image.png` (`scripts/generate_og_image.py`, count 370+→1000+).
- **Coperta Facebook** (`facebook-cover.png`) nu avea generator — era facuta manual, portocalie, nemaiactualizata.
  Generator nou `scripts/generate_facebook_cover.py`: wordmark identic cu navbar-ul ("Am" pill indigo +
  "Cupon" alb + ".ro" indigo), badge-uri cu reduceri REALE trase din output.json (nu text fictiv).
  Ruleaza manual (nu e in pipeline-ul automat 4h — o coperta nu trebuie sa se schimbe des).
- **`generate_banner_auto.py` (bannere zilnice social)**: paleta portocalie hardcodata (constante ORANGE*
  + zeci de tuple rgba literale) → indigo (INDIGO*). Bug separat gasit si reparat: emoji-urile categorie
  (📚💊 etc) si checkmark-ul ✓ nu se randau cu fonturile de sistem PIL (Arial/DejaVu) — aparea patratel gol
  ("tofu box"). Inlocuite cu un punct/marcaj indigo desenat vectorial (nu text unicode).
- **Iconita extensie Chrome** (`extension/generate_icons.py`): fundal slate + litera "A" emerald + punct
  verde → fundal indigo solid + litera alba + punct cyan (aliniat cu wordmark-ul "Am" din navbar).

> **⭐ PLAN MASTER (strategie):** vezi `docs/strategie/PLAN-MASTER.md` — busola pentru 1000 afiliați,
> 100 site-uri, 200-500€/site/lună. Oglindit în Notion (hub "IMPERIU CLAUDE"). Citește-l la
> începutul oricărei sesiuni strategice. `CLAUDE.md` = adevărul TEHNIC, `docs/strategie/PLAN-MASTER.md` = adevărul de BUSINESS.
>
> **Fișiere .md de strategie/audit/operațional grupate în `docs/`** (08.07.2026): `docs/strategie/`
> (PLAN-MASTER, STRATEGIE, NISE-MASTER, PLAN-REPLICARE-SITEURI-AFACERI), `docs/audituri/`
> (AUDIT-PAGINI-SITE, AUDIT-REMODELARE-2026-07, CATEGORII-SEO-MASTER), `docs/operational/`
> (ACTIUNI-VENIT, SABLON-POSTARI). Rămân în root: `AGENTS.md`, `CLAUDE.md`, `PROMPT-SESIUNE.md`.

**UPDATE 30.06.2026 (UPDATE MASIV UI — PUSHED + LIVE):**
- **Audit workflow (8 agenți paraleli) → 57 findings, reparate cele high/medium.** Plan complet în
  `tasks/w3oud47r0.output` (3 agenți au picat pe session limit: niche-pages, seo-structure, verify).
- **PORTOCALIU INTERZIS eliminat COMPLET din tot site-ul** (rgba 249,115,22 + amber 245,158,11):
  `BrandPageTemplate.tsx` (afecta TOATE cele 12 pagini brand!), software-business (5 locuri),
  oferte-azi (2), cadouri, produse, produse/[categorie], recomandari. Grep `249,115,22` = 0 acum.
- **Curcubeu eliminat** (gradiente per-card multicolore din array `CATEGORII` cu `c.from/c.to`):
  homepage grila categorii + chips, /categorii grila, /comparator header carduri → slate-900 uniform + accent indigo/cyan.
- **Money-leak +16 linkuri** (peste vpn/cursuri/antivirus de dinainte): carduri-bancare, hosting,
  servicii-internationale (Surfshark+InVideo REALE Impact, rest homepage curat), trading. Pattern:
  link real din output.json/CSV unde există, altfel homepage curat FĂRĂ `?ref=amcupon` fals.
- **Retheme dark**: /comparator era TOT pe light (bg-white/slate-50) → dark complet (logo-uri păstrate albe);
  bug swapMagazin reparat (ștergea ambele). /top: nav+carduri light remnants + CULORI spart → accent uniform.
- **Counts**: 300+/600+ magazine → 900+ (servicii, categorii, oferte-azi, calculator).
- **RĂMAS (lower priority, next)**: (1) flori/pescuit hero tonal (low). (2) ~~BrandPageTemplate: lipsă
  JSON-LD BreadcrumbList+FAQPage + slug matching fragil~~ **REZOLVAT** (verificat 24.07.2026 — ambele
  există deja în cod, nota era depășită). (3) **Money-leak brand pages fără magazin în output.json**:
  altex, flanco lipsesc (amazon REZOLVAT — are link Impact real acum) + temu/shein (url brut, încă activ,
  vezi update 24.07 mai sus) — necesită Alex să aplice la programe sau link real. (4) calculator-salariu/
  comparator: lipsă JSON-LD WebApplication — neverificat încă dacă tot mai e valabil.

**UPDATE 30.06.2026 (sesiune amplă — push-uit anterior):**
- **REDESIGN HOMEPAGE — direcție "premium minimalist" (pass 1+2 DONE).** Decizie Alex: slate uniform,
  1 accent indigo→cyan, ZERO gradiente curcubeu, aerisit + **promovăm TOATE magazinele** (comision pe
  orice link afiliat, nu doar cupoane — cele fără cod = recomandări curate). Făcut:
  - Hero rescris: scos glow-ul PORTOCALIU (`rgba(249,115,22)` = bug), scoase badge-urile flotante,
    trust row emerald→cyan (accent unic).
  - **Tăiate 6 secțiuni redundante** (arătau aceleași magazine de 5×): "NISE & INTERNATIONAL"
    (CATEGORII_INTL curcubeu), al 2-lea STATS BAR duplicat, "Trending acum", "Oferte pe nise",
    "Sectiuni speciale" (SECTIUNI_SPECIALE curcubeu), "Bannere/Oferte vizuale", "Top picks".
  - Rezultat: **17 → 11 secțiuni h2**, flux logic. Magazinele TOATE rămân vizibile (secțiunea
    "Magazine partenere" arată `faraPromotii` cu load-more + "Magazine de incredere" recomandate).
  - **Cod mort de șters** (cleanup viitor, nu blochează build): array-urile `CATEGORII_INTL` (~linia 92)
    și `SECTIUNI_SPECIALE` + ref-urile `trendingRef`/`bannersRef` (acum nefolosite). Verificat vizual OK.
- **🚀 BUG CRITIC 2P REPARAT — 84 → 583 magazine 2Performant (total site 929).** Misterul vechi
  ("API-ul nu aduce toate programele acceptate") rezolvat: (1) `/affiliate/programs.json` **capează
  la 20 elemente/pagină** (ignoră `per_page=100`) — `fetch_all_pages` se oprea la pagina 1 (20<100→break),
  aducând 20 din 600. Fix: paginare prin `metadata.pagination.pages` (parcurge toate cele 30 pagini).
  (2) Lipsea filtrul **`filter[affrequest_status]=accepted`** → acum aduce toate cele ~600 programe
  APROBATE (528 .ro), nu doar 20. Verificat live cu credențiale (în GitHub Secrets pt pipeline).
  Pipeline-ul va trage automat toate cele 600 la fiecare rulare. NOTĂ: rulează cu `PYTHONIOENCODING=utf-8`
  local (emoji-urile crapă pe cp1250 Windows). **Coerciție tipuri adăugată în merge_platforms.py**
  (promo descriere=bool spărgea build-ul cu "a.match is not a function" — acum forțat string).
- **Import masiv afiliați — 132 → 929 magazine** (583 2P + 280 impact + 63 profitshare + 3 direct,
  TOATE cu link afiliat, 2413 pagini build). La 71 de 1000. (1) Impact CSV +247, (2) feed 2P +10, (3) **Promotions
  CSV 2P** (`promotions (8).csv` → `data/promotii_2p.csv`, 91 promoții/63 magazine) importat cu
  `import_csv_promotii.py` → **+47 magazine** (2performant 37→84), 77 cu promoții, 18 cu cod. Build 1424 pagini.
- **Import masiv Impact.com — 132 → 389 magazine.** CSV `data/impact_campaigns.csv` (315 programe active)
  importat cu `scripts/import_impact_campaigns.py`. 247 magazine noi cu tracking links REALE (account 7401119).
  `merge_platforms.py` rulat → output.json: 280 impact + 69 profitshare + 37 2performant + 3 direct.
- **Extragere magazine din feed produse 2P** (`scripts/extract_merchants_from_feed.py`) — feed-ul
  XML (`MY_FEED_URL` = feeds.2performant.com/feed/4a3fc5d5f.xml, 2GB, 1.03M produse) contine
  `campaign_name` = magazin ACCEPTAT (produsele vin doar pt programe aprobate → recuperam magazine
  pe care API-ul nu le aduce). Doar 13 magazine .ro in acest feed (restul international) → +10 noi
  cu quicklink real (foglia, dyfashion, gameology, farmec, sofiline etc.). **NOTA:** feed CSV da doar
  header gol — foloseste XML. Feed-ul e blocat pe IP datacenter (CI) dar merge pe IP rezidential (local).
  Ca sa creasca: Alex adauga mai multe surse in 2P "My Feeds" SAU exporta Promotions CSV (sute de magazine).
- **Motor import GENERIC reutilizabil:** `scripts/import_generic_affiliate.py` — un singur script pentru
  ORICE rețea (impact/awin/cj/admitad preconfigurate în `NETWORKS`, adaugi altele cu mapare coloane).
  `python scripts/import_generic_affiliate.py --network awin --file data/awin.csv`. Ăsta e drumul spre 1000.
- **Pagină nouă `/esim` LIVE** — 10 afiliați eSIM reali (Airalo, Saily, AmigoSIM, ChillSIM, eSIMo...).
  Comparație top 3 + tabel + FAQ + ItemList/FAQPage JSON-LD. În sitemap + meniu Navbar + link din `/calatorie`.
- **MONEY-LEAK reparat — linkuri afiliate FALSE înlocuite cu cele REALE din Impact:**
  `/vpn` (NordVPN, Surfshark, AdGuard, IceVPN, IPRoyal), `/cursuri-online` (Coursera, Udemy),
  `/antivirus` (Bitdefender). Brandurile fără program afiliat (ExpressVPN, Norton, ESET, Kaspersky,
  LinkedIn Learning) → linkuri curate homepage (FĂRĂ tracking fals `?ref=amcupon`). Restul (carduri-bancare
  Revolut/Wise/N26, hosting Hostinger/SiteGround) încă au placeholder — de reparat când avem linkuri reale.
- **Generator social extins cu nișe de bani:** `scripts/generate_social_content.py` — adăugate nișe
  software-ai, hosting, security, esim (5→11 nișe active, 60→165 postări). Magazinele fără promoții (VPN/AI/
  hosting) primesc postări de tip RECOMANDARE (flag `_recomandare`) cu limbaj onest — NU "reducere falsă",
  NU comisionul afișat ca cashback. Fix encoding UTF-8 stdout (crăpa pe cp1250 Windows).

**UPDATE 29.06.2026:**
- **Pagini comparatii SEO + linkuri interne anti-orfan.** `scripts/generate_comparisons.py` genereaza `frontend/public/comparisons.json` (10 perechi: fashiondays-vs-answear, temu-vs-shein, libris-vs-carturesti, emag-vs-elefant, emag-vs-temu, surfshark-vs-hostinger, drmax-vs-farmec, noriel-vs-decathlon, fashiondays-vs-shein, libris-vs-elefant) cu date live din output.json (promotii active, cashback, verdict). Rute: `/comparatii` (index) + `/comparatii/[slug]` (Server Component, BreadcrumbList + FAQPage JSON-LD). Ruleaza in pipeline doar la `IS_FULL_DAILY`. **CRITIC pt indexare**: paginile erau ORFANE (0 linkuri interne) → reparat cu (1) link `/comparatii` in Footer.tsx (INFO, apare pe toate 105 pagini) + (2) bloc contextual "X vs alte magazine" pe `/cod-reducere/[magazin]` — `loadComparatii(slug)` in page.tsx filtreaza perechile care includ magazinul, pasate ca prop `comparatii` la MagazinClient, randate langa "Magazine similare". 14 magazine primesc linkuri contextuale. Cand adaugi perechi noi in `PERECHI` din generate_comparisons.py, linkurile interne + sitemap se actualizeaza automat (slug-urile m1/m2 trebuie sa fie slug-uri de domeniu reale din output.json).
- **Import promotii CSV 2Performant — +55 magazine RO noi cu link afiliat real.** Multe programe ACCEPTATE cu promotii active NU vin prin API (`/affiliate/advertiser_promotions.json` returneaza doar o parte). Solutie: `import_csv_promotii.py` imbunatatit — citeste `data/promotii_2p.csv` (export manual din 2P dashboard → Promotions → Export), potriveste cu magazinele existente SI **creeaza magazine noi cu quicklink 2P real** (`build_quicklink()`, redirect catre landing page-ul promotiei), categorie ghicita din nume (`guess_category()`). Ruleaza in pipeline dupa merge (pas 5a), durabil — promotiile expirate se sar automat. Rezultat: **132 → 187 magazine, 23 → 84 cu promotii active, 6 → 20 cu cod**. Cand Alex exporta CSV nou, inlocuieste `data/promotii_2p.csv`. NOTA: de investigat de ce API-ul 2P nu aduce toate programele acceptate (posibil paginare/filtru in `fetch_2p_api.py`).
- **Linkuri invalide reparate — slug-uri normalizate la domeniu** (`merge_platforms.py`). Cauza: slug-ul (`magazin`) e segment de URL in `/cod-reducere/[magazin]` + canonical + sitemap, dar sursele (mai ales Impact) bagau **nume de brand cu spatii** ("Revolut Business", "O'Reilly Learning"), majuscule ("Surfshark"), UUID-uri lipite ("bookzone-ro-9c9bce7e-...") si liniute in loc de punct ("otter-ro"). Slug cu spatiu = canonical rupt (`amcupon.ro/cod-reducere/Revolut Business`). Fix: `domain_slug()` deriva slug-ul din DOMENIUL `url`-ului (consistent cu emag.ro/temu.com), fallback pe nume slugificat; dedup pe slug curat pastrand scorul mai mare. Vechiul merge avea bug: dedup pe lowercase dar salva slug-ul original (de-aia ramaneau majusculele) + permitea INTENTIONAT spatii in slug (comentariu gresit). Rezultat: 174 → **172 magazine, 0 slug-uri malformate** (2 erau duplicate care s-au unit: bookzone-ro-UUID→bookzone.ro). Ruta `page.tsx` are acum `gasesteMagazin()` (fallback case-insensitive + pe primul label de domeniu) ca URL-urile vechi sa nu dea 404, iar canonical foloseste mereu `m.magazin` curat. **NU readauga slug-uri non-domeniu** — orice sursa noua trece prin `domain_slug()`.
- **Flux video AI zilnic LIVE** (`scripts/generate_video_daily.py`) — transforma `digest-today.json` intr-un clip vertical 1080x1920 gata de postat pe TikTok/Reels/Shorts, **100% gratuit, fara niciun API key platit**. Lant: digest → script vocal scurt (~40s) → **edge-tts** (voce neural RO `ro-RO-EmilNeural` + subtitrari sincronizate) → **ffmpeg** (MP4 cu fundal brand curat dark indigo/cyan generat cu PIL — ZERO portocaliu — + subtitrari arse in zona centrala). Degradare in straturi: script+captions mereu, voce+SRT daca edge-tts, MP4 daca ffmpeg. Output in `data/video-today/` (gitignored); pipeline copiaza `video-today.mp4` + `video-captions.txt` + `video-script.txt` in `frontend/public/` → descarcabile la `amcupon.ro/video-today.mp4`. Ruleaza in workflow doar dimineata (`0 6` cron + dispatch), un clip/zi. Subtitrari: `.ass` cu PlayRes 1080x1920 (pozitionare exacta), NU SRT+force_style (rezolutie implicita 384x288 → MarginV iese din cadru). edge-tts emite **SentenceBoundary** nu WordBoundary — colectam ambele si spargem in cuvinte cu timing proportional. Banner-story.png NU se foloseste ca fundal (e plin de portocaliu); fundalul video se genereaza separat cu `make_video_bg()`.
- **Profitshare meta tag validare** adaugat in `layout.tsx` (`verification.other["profitshareid"] = "55a94904302585d3a4d01658d993fd4d"`). Apasa "Valideaza" in dashboard-ul Profitshare dupa deploy pentru a activa accesul la 62 magazine PS.
- **Pagina `/pescuit` LIVE** — nisa echipamente pescuit (Daiwa, Okuma, Trabucco, Prologic etc.), hero emerald, 6 categorii, SEO text. `pescar-expert.ro` aplicat pe 2Performant (aprobare ~31 zile). Pana atunci fallback pe decathlon.ro. Adaugat in `sitemap.ts`.
- **Pagina `/radar` LIVE** (28.06) — rubrica editoriala zilnica cu voce. `generate_daily_digest.py` in pipeline, `/radar` in sitemap.
- **BUG CRITIC rezolvat 28.06 — pipeline-ul era OPRIT ~6 zile din facturare GitHub.** Repo PRIVAT → 2000 min consumate → rulari esuau instant. Fix: repo facut PUBLIC. Repo trebuie sa ramana public.
- ⚠️ **Magazine scazute: 174 (de la 370 pe 20.06)** — de investigat separat (posibil programe 2P expirate sau pierdere la merge). Neinvestigat inca.

**Stare curentă (20.06.2026, seara — sesiune amplă, TOTUL push-uit pe `main` și LIVE):**
- **Feed de produse rezolvat definitiv**: 33.096 produse din 20 magazine românești reale (era 3.076/1 magazin) — vezi tabelul de mai jos "products.json — REZOLVAT". Produsele apar automat pe fiecare pagină de magazin.
- 370 magazine active (`output.json`), tema dark indigo+cyan pe **toate** paginile (rebrand orange→indigo complet, ultimele 28 pagini retemuite pe 19.06)
- ~217+ articole blog (titluri sub 60 caractere, cover = logo real magazin, nu mai poze stock random)
- GitHub Actions: cron 4h, retry 5x la push — vezi `.github/workflows/update-data.yml`
- **BUG CRITIC reparat 22.06.2026 — push-ul pipeline-ului esua silentios.** Stepul "Commit si push" face `git add` selectiv pe fisiere anume, apoi `git pull --rebase`. Rebase-ul **refuza cand exista fisiere tracked modificate dar nestaged** (regenerate de scripturi, in afara listei de add) → `cannot pull with rebase: You have unstaged changes` → toate 5 retry-urile pica → commit-ul ramane local, NU se publica. Efect: **tot site-ul inghetat din 20.06** (magazine, blog, IndexNow, bannere — nu doar produsele), desi runul aparea "success". Fix: `git pull --rebase --autostash origin main` (stash-eaza automat nestaged-ul inainte de rebase). Daca live-ul pare inghetat desi runul e verde, verifica intai stepul de push pentru "unstaged changes".
- Newsletter Brevo: cod reparat (logging + secret check), dar **trimiterea reala e BLOCATA** — vezi „Probleme active" mai jos
- **Alerte de preț per magazin** (20.06.2026): `PriceAlert.tsx` era construit dar niciodată randat — acum vizibil pe `/cod-reducere/[magazin]` (lângă butonul Distribuie), retemuit dark. Tag-ul `alert_{magazin}` trimis de componentă era ignorat de `/api/newsletter/route.ts` — acum salvat ca atribut Brevo `ALERT_STORES` (CSV). Script nou `scripts/check_price_alerts.py` rulează la fiecare cron 4h, detectează coduri noi (diff vs `data/price_alert_snapshot.json`) și trimite email țintit doar abonaților care urmăresc magazinul respectiv. **Necesită setup manual în Brevo înainte să funcționeze — vezi „Probleme active"**.
- **Sistem recenzii (ReviewSection.tsx) reparat complet** (20.06.2026): proiectul Supabase `AmCupon.ro` (`ktfoaqprezeqzoeuohnh`) era INACTIVE (pauzat) — repornit. Tabela `reviews` nu exista niciodată — creată acum cu RLS (citire publică doar `aprobat=true`, insert public mereu `aprobat=false`, moderare doar din Supabase dashboard). Cheia anon (publică prin design, protecția reală e RLS) e acum hardcodată ca fallback în `lib/supabase.ts`, nu mai depinde de `NEXT_PUBLIC_SUPABASE_ANON_KEY` în Vercel. Testat end-to-end (submit real prin formular → verificat în DB → șters). 0 recenzii reale momentan — normal, e funcțional dar gol.
- **Incadrare produse homepage reparata (21.06.2026)** — `generate_homepage_data.py`: categorisirea era PER-MAGAZIN (magazinele multi-categorie bagau tot intr-o categorie gresita: chiuvete depox/foglia la "Copii", suport gel de dus la "Frumusete", figurine carturesti la "Carti"). Acum **clasificare PER-TITLU** (`_detect_cat_from_title`, prioritara), magazinul doar fallback verificat manual (`MERCHANT_CAT_OVERRIDE`). Fix-uri cheie: normalizare diacritice (ă→a, altfel "Cremă"≠"crema") + potrivire pe **cuvant intreg** `\b` (altfel "romantic"→roman, "matlasat"→atlas, "carter"→carte = rochii la Carti). `depox.ro` exclus complet (`MERCHANT_GRID_BLOCKLIST`) — vinde arme/autoaparare (spray paralizant, electrosoc, cutite), nepotrivit. Filtru titluri-gunoi (voucher/resigilat/<6 car). **NU readauga categorisirea per-magazin din output.json** — e sursa bug-ului.
- **Istoric de preturi / price intelligence — INCERCAT SI SCOS (21.06.2026).** S-a construit un recorder (`track_price_history.py`, sharded per magazin) + afisare badge "cel mai mic pret" pe pagina de magazin. Alex a respins afisarea: vrea produsele **lejere si curate**, fara comentarii de pret pe fiecare card ("nu vreau sa ingreunez tot mai mult"). Tot ce tine de price intelligence a fost revertat complet (UI + recorder + date). **NU reconstrui** fara cerere explicita. Daca se revine vreodata: principiul de motor reutilizabil ramane valid (vezi `project_1000_jobs_vision`), dar afisarea trebuie minimala/optionala, nu impusa pe toate cardurile.
- Push pe `main` necesită mereu confirmare explicită în chat înainte de execuție, chiar dacă o sesiune anterioară a aprobat un push similar

---

## Plan promovare + Nise

### Pagini live cu partener real
| Pagina | Partener | Comision | Canal promovare ideal |
|--------|----------|----------|-----------------------|
| `/flori` | floria.ro (2P) | 7% | Pinterest, Instagram, TikTok ocazii |
| `/pescuit` | pescar-expert.ro (2P, in asteptare) | 5-6% | YouTube fishing, Facebook grupuri pescari |
| `/fashion` | FashionDays, Answear | 5-8% | TikTok outfit, Instagram Reels |
| `/frumusete` | Notino, DrMax | 4-7% | YouTube recenzii, TikTok skincare |
| `/electronice` | Altex, Flanco | 2-4% | YouTube comparatii, Reddit |
| `/gaming` | diverse 2P | 3-5% | TikTok gaming, Discord |
| `/calatorie` | KKday, Pelago (Impact) | 5-10% | Blog articole, Pinterest |
| `/farmacie` | DrMax, Liki24 | 3-5% | Facebook grupuri sanatate |
| `/animale` | Petmart, Petmax | 4-6% | TikTok animale (viral nativ) |
| `/trading` | Binance ref | fix | YouTube, newsletter |
| `/hosting` | Hostinger (Impact) | 30-60% | Blog tech, YouTube tutoriale |
| `/vpn` | NordVPN, AdGuard (Impact) | 30-40% | YouTube, TikTok privacy |

### Canale de promovare per tip
```
TikTok        → animale, fashion, frumusete, gaming, radar zilnic
YouTube       → pescuit, tech, hosting/vpn (tutoriale lungi)
Pinterest     → flori, calatorie, idei cadouri, fashion
Facebook grp  → pescuit, animale, farmacie, sanatate
SEO organic   → calculator-salariu, generator-proforma, blog
Newsletter    → radar zilnic, alerte pret, top saptamana
Telegram      → radar zilnic (copy-paste din digest-today.txt)
```

### Nise urmatoare (cu partener posibil pe 2P/PS)
| Nisa | Partener potential | Prioritate |
|------|-------------------|------------|
| Gradina/plante | Plantor.ro, pepiniere PS | Mare — sezon activ |
| Hrana animale | Zooplus (PS), Animax | Mare — achizitie repetitiva |
| Suplimente/fitness | Vegis, GNC Romania | Mare — marje bune |
| Copii/bebelusi | Noriel, Bebeshop (2P) | Mare — ocazii frecvente |
| Bricolaj/scule | Brico, Dedeman (2P) | Mediu |
| Zboruri/travel | esky.ro, Kiwi (PS) | Mare — volum mare |
| Mobilier | vidaXL, IKEA-like (PS) | Mediu |

### Video AI — flux continut fara fata (AUTOMATIZAT 29.06.2026)
```
digest-today.json → script vocal (generate_video_daily.py)
→ Voce RO + subtitrari (edge-tts, GRATIS fara cont)
→ MP4 vertical 1080x1920 (ffmpeg, fundal brand PIL fara portocaliu)
→ amcupon.ro/video-today.mp4  → descarci → postezi pe TikTok/Reels/Shorts
```
Ruleaza automat in pipeline dimineata. Caption-uri per platforma in
`amcupon.ro/video-captions.txt`. **Singurul pas manual ramas: descarci MP4-ul
si il urci pe platforme** (postarea video nu se poate automatiza fara API-uri
platite/risc de ban). Schimba vocea cu `--voice ro-RO-AlinaNeural` (feminin).

---

## ⚠️ Probleme active / acțiuni necesare de la Alex

| Problemă | Status | Acțiune necesară |
|----------|--------|-------------------|
| **Extensia Chrome = draft nefinalizat, niciodată trimisă la review** | Dashboard 02.07: 2 drafturi "Versiune nefinalizată" din 26.05 | Finalizează listing-ul (screenshot 1280x800 + descriere + privacy URL /confidentialitate + justificare permisiuni) → "Trimite spre examinare". Șterge draftul duplicat. |
| **Newsletter — posibil deblocat (de confirmat)** | Alex a raportat 20.07.2026 că primește email-uri — sender-ul Brevo pare validat de-acum (spre deosebire de blocajul `HTTP 400 Sender is invalid` documentat anterior). Verifică explicit în Brevo → Settings → Senders înainte să presupui rezolvat. | Dacă e confirmat validat, șterge acest rând și marchează alertele de preț ca funcționale. |
| **Alerte de preț (`check_price_alerts.py`) nu pot citi/scrie abonamentele** | Atributul custom `ALERT_STORES` nu există încă în Brevo | Brevo → Contacts → Settings → Contact attributes → adaugă atribut tip **Text** cu numele exact `ALERT_STORES`. Fără el, tag-ul de magazin se pierde silențios (Brevo ignoră atribute necunoscute). |
| **Seria de bun-venit (ziua 3/7, `send_welcome_series.py`, nou 09.08.2026) nu poate funcționa încă** | Atributul custom `WELCOME_STEP` nu există încă în Brevo — același gotcha ca `ALERT_STORES` | Brevo → Contacts → Settings → Contact attributes → adaugă atribut tip **Text** cu numele exact `WELCOME_STEP`. Fără el, `route.ts` nu poate marca "a primit ziua 0" și scriptul nu găsește niciodată contacte eligibile. |
| Proiectul Supabase (`reviews`) se poate re-pauza automat | Free tier — pauzează după ~1 săptămână fără activitate API. **Găsit pauzat + repornit din nou pe 17.07.2026** (al 2-lea episod cunoscut) | Dacă recenziile dispar brusc, verifică status proiect (Supabase dashboard sau MCP `list_projects`) și repornește cu `restore_project`. Risc recurent pe free tier dacă traficul pe `/cod-reducere/*` scade — merită verificat periodic, nu doar cand se sesizeaza o problema. |
| **`FACEBOOK_PAGE_TOKEN` setat dar invalid** | Corectat 20.07.2026: nu "lipsește" cum scria — secretul E setat, dar Actions dă `Bad signature` (OAuthException) la fiecare rulare, adica tokenul a expirat/e gresit | Regenerează Page Access Token (Meta for Developers → tools → Graph API Explorer, cere long-lived token) + actualizează în GitHub Secrets. Workaround manual: `POSTEAZA-FB.bat` pe Desktop |
| `TRADETRACKER_SITE_ID/API_KEY` lipsesc | Cod gata, neactiv | Adaugă în GitHub Secrets dacă se folosește TradeTracker |
| **CJ Affiliate — cont creat, 0 date importate** | Alex a aplicat, dar n-a trimis inca export CSV | Exporta din CJ dashboard → Advertisers → programe "joined" (CSV), trimite-l ca sa fie importat la fel ca Awin |
| **5 magazine Awin sarite — domeniu neconfirmat** | Diecast, GearUP, Tvrzenaskla/Momanio Europe, Unizdrav cz/sk/hu, Skytours US — vezi `scripts/import_awin_links.py` | Alex confirma domeniul real (site.ro/.com) pentru fiecare, sau le lasam sarite definitiv |

---

## Commands

**Frontend (din `frontend/`):**
```bash
npm run dev        # localhost:3000
npm run build      # build producție — OBLIGATORIU înainte de push cu pagini noi
npm run lint       # ESLint
```

**Python scripts (din `scripts/`):**
```bash
pip install -r requirements.txt

python fetch_2p_api.py          # magazine + promoții 2Performant
python fetch_product_feeds.py   # produse din feed-uri
python process_profitshare.py   # date Profitshare
python merge_platforms.py       # merge → output.json
python generate_blog.py         # articole blog automate
python generate_best_of.py      # articole "Cel mai bun X"
python generate_evergreen.py    # articole evergreen permanente
python send_newsletter.py       # campanie Brevo către abonați (vezi problema activă sus)
python generate_og_image.py     # regenerează frontend/public/og-image.png (PIL, 1200x630)
node scripts/retheme_pages.js   # transformare regex bulk light→dark (vezi sectiunea Tema vizuala)
```

**Git (push sigur, evită conflict cu Actions):**
```bash
git pull --rebase origin main && git push origin main
```

---

## Arhitectură — Data Flow

```
GitHub Actions (cron 4h)
    ↓
fetch_2p_api.py        → frontend/public/output.json
process_profitshare.py → data/profitshare_output.json
merge_platforms.py     → frontend/public/output.json (merged, + data/extra_merchants.json)
fetch_product_feeds.py → frontend/public/products.json
generate_blog.py       → frontend/public/blog-posts.json
    ↓
git commit + push → Vercel redeploy automat
```

**Nu există backend runtime** — toate datele sunt JSON statice în `frontend/public/`. Next.js le servește direct.

`data/extra_merchants.json` — magazine adăugate manual, incluse de `merge_platforms.py`, supraviețuiesc re-sync-urilor automate.

---

## Frontend Architecture (Next.js 16.2.6 + React 19 + Tailwind 4)

### Pattern server/client split
Fiecare pagină dinamică are două fișiere:
- `page.tsx` — **Server Component**: citește JSON cu `fs.readFileSync` la build time, generează `metadata` + JSON-LD
- `[Nume]Client.tsx` — **Client Component** (`"use client"`): interactivitate, useState, filtre

**Excepție**: `app/page.tsx` (homepage) este full client — face `fetch("/output.json")` în `useEffect` pentru date fără rebuild.

### Tema vizuala — DARK / LIME (din 11.08.2026) ⬅ ACTUALA

Alex a ales o referinta concreta (`deal-findr-spark.lovable.app`) si a cerut modernizarea
dupa ea. Paleta NU e ghicita din screenshot: i-am descarcat bundle-ul CSS si i-am convertit
valorile `oklch` in hex.

- **fundal pagina**: `#06080b` (neutru rece, aproape negru — NU mai e bleumarin)
- **card**: `#14181c` · **card secundar / border**: `#1f2329` · **hover / border vizibil**: `#2a2f36`
- **border slab**: `#3a4048` · **text foarte estompat**: `#6b7178`
- **text principal**: `#ffffff` · secundar `#c9ced5` · muted `#9399a0`
- **ACCENT lime**: `#ddf93c` · hover/apasat `#c3dd2c` · deschis `#ecff7a`
- **⚠️ TEXT PE ACCENT**: `#0c1000` (inchis!). Vezi regula de contrast mai jos.
- **rosu urgenta**: `#e64343` · **succes/verificat**: acelasi lime (o singura voce vizuala)
- **radius max 12px** (`rounded-xl`) — neschimbat
- **Cutii logo raman ALBE** (`bg-[#ffffff]`) — regula neschimbata, logo-urile sunt PNG-uri
  proiectate pentru fundal alb.

**⚠️ REGULA DE CONTRAST — cea mai importanta la aceasta tema.** La teal accentul era INCHIS
(`#0d9488`), deci butoanele erau `bg-accent text-white`. Lime-ul e FOARTE DESCHIS (L=93%), deci
alb pe el e ilizibil. Orice `bg-[#ddf93c] text-white` mostenit e un BUG de contrast.
Migrarea a reparat 159 + 15 astfel de cazuri automat.

**Ce NU prinde o migrare automata de culori** (lectie din 11.08 — PATRU tipare, valabile la
orice retema viitoare). Scriptul cauta perechea "fundal accent + text alb" ca TEXT, deci rateaza:
  1. clase intr-un **ternar** (`cond ? "bg-[#ddf93c] text-white" : ...`) — nu sunt in `className="..."`;
     rezolvat cu `scripts/fix_contrast_lime.js`, care scaneaza ORICE literal de string;
  2. clase venite dintr-o **variabila** (`` `bg-gradient-to-br ${gradient} text-white` ``) — culoarea
     nici nu apare in string. Se gasesc doar cautand `bg-gradient.*\$\{` + verificare manuala
     (au fost 2: `/top/[slug]` si `/comparator`);
  3. **fundal pe parinte, text pe copil** (`<div class="bg-lime"><span class="text-white">`) — cele
     doua clase sunt in className-uri DIFERITE, deci nicio cautare de pereche nu le vede. A fost
     fallback-ul cu initiala din `MagazinCard.tsx`;
  4. **culoare din JS**, prin `style={{ background: functie(...) }}` — culoarea nu exista nicaieri
     ca text in cod, deci e invizibila oricarei cautari. A fost badge-ul cu numarul de oferte de pe
     chip-urile de categorii. Rezolvat la radacina: `CategoryIcon.tsx` exporta acum
     `TEXT_PE_CATEGORIE`, ca sa nu se mai ghiceasca in fiecare loc.

**Concluzie operationala**: dupa orice retema, cele 4 tipare de mai sus se verifica MANUAL. Faptul
ca `tsc` + `build` trec nu spune nimic despre contrast — un text invizibil compileaza perfect.
- **Lime e ACCENT, nu suprafata.** In referinta, lime apare pe cifre, butoane si badge-uri, pe
  fundal inchis — niciodata ca hero plin pe toata latimea. Cele 2 hero-uri care erau gradient
  colorat plin au fost facute inchise (rezolva si contrastul, si aspectul).
- Scripturi: `retheme_lime_2026.js` (migrarea de culori + prima trecere de contrast),
  `fix_contrast_lime.js` (a doua trecere, string-uri in ternar).

**Istoric teme** (sa nu se reintroduca din greseala): orange (initial) → indigo/cyan dark →
auriu/sampanie dark → light/teal (06.07) → dark/teal (16.07) → **dark/lime (11.08, actuala)**.
Portocaliul/amberul raman **INTERZISE** — referinta le folosea pentru badge-ul "HOT", noi
folosim lime acolo.

---

### Tema veche — DARK / teal (16.07.2026 – 11.08.2026), pastrata ca referinta istorica
**Standard ACTUAL pentru orice cod nou** (decizie explicita Alex, "da dark. fa-l dark" — revenire deliberata la dark peste tema light/teal din 06.07, pastrand acelasi accent teal):
- **background pagina**: `#0a0f1a` (aproape negru, albastrui) · **carduri**: `#111827` · **carduri alt/sectiuni**: `#1e293b` / `#334155`
- **border card**: `#1e293b` · **border mai vizibil**: `#334155` / `#475569`
- **text principal**: `#f1f5f9` (aproape alb) · text secundar `#cbd5e1` · muted `#94a3b8`
- **accent principal (teal, NESCHIMBAT fata de tema light)**: `#14b8a6` / `#0d9488` / `#0f766e` (butoane, linkuri, medalioane)
- **accent promo (rosu)**: `#ef4444` (urgenta/expira) · **verificat/succes**: `emerald`
- **radius max 12px** (`rounded-xl`) — NU folosi `rounded-2xl`/`rounded-3xl`
- **`:root { --background/--foreground }` din `globals.css`** aliniate la `#0a0f1a`/`#f1f5f9` — altfel `<body>` ramane alb si da flash/margine alba la scroll pe paginile care nu acopera tot ecranul cu wrapper-ul dark.
- **Cutii logo (`w-N h-N rounded-xl [overflow-hidden] bg-...`) raman ALBE intentionat** (`bg-[#ffffff]`) — logo-urile magazinelor sunt PNG-uri cu fundal transparent, forme/text inchise la culoare, proiectate pentru fundal alb; pe card dark ar deveni ilizibile. Orice cutie noua de logo trebuie sa foloseasca explicit `bg-[#ffffff]`, NU culoarea de card standard.
- **INTERZIS**: tema aurie/sampanie (`#c9a63e`, `#b8912e`, `#2e2410`, `#15120c`, `#26211a`, `#37301f`, `#0b0a07`, `#e6d5a8`, `#8c8064`, `#d8c091`, `#a89a78`, `#f5ead0`, `#e8e0d0`) — NU reintroduce, indiferent de prefixul Tailwind (bg-/text-/border-/from-/to-/shadow-/hover:).
- **Istoric teme** (sa nu se reintroduca din greseala): orange (initial) → indigo/cyan dark → auriu/sampanie dark → light/teal (06.07) → **dark/teal (actual, 16.07)**.
- Migrari la scara: scripturi regex dedicate in `scripts/` — `retheme_dark_2026.js` (conversie hex arbitrar light→dark, pastreaza accentul teal), `purge_gold_leftover.js` (sweep generic pentru orice hex auriu ramas, indiferent de prefix), `fix_logo_boxes_dark.js` (readuce la alb cutiile mici de logo dupa conversia generala). Nu editare manuala fisier cu fisier pentru migrari de 10+ fisiere. `.dark` overrides din `globals.css` (sectiunea "DARK MODE") sunt legacy/dormante (html NU are clasa `.dark`) — tema vine din hexuri hardcodate in pagini, nu din acel bloc.

### Data loading
- Server pages: `fs.readFileSync(path.join(process.cwd(), "public", "output.json"))`
- Homepage: `fetch("/output.json")` în useEffect
- `/produse`: server component citește `public/products.json`
- Pagini de nișă noi (`/bijuterii`, `/piese-auto` etc.): filtrează direct după `categorie_slug`, NU listă hardcodată de magazine (lecție din bug-ul `/bijuterii` — 8 branduri inexistente hardcodate produceau 0 rezultate; vezi Categorii sluguri pentru valorile valide)

---

## Pagini live

### Hub-uri principale & categorii generale
`/`, `/categorii`, `/toate-magazinele`, `/oferte-azi`, `/produse`, `/top`, `/top/[slug]` (30 categorii), `/cadouri` + 16 sub-pagini ocazii (`/cadouri/ea`, `/el`, `/copii`, `/mama`, `/tata`, `/botez`, `/nasi`, `/nastere`, `/valentine`, `/craciun`, `/absolvire`, `/pasti`, `/sub-100-lei`, `/sub-200-lei`, `/sub-500-lei`, `/peste-500-lei`)

### Nise produse/servicii
`/fashion`, `/frumusete`, `/electronice`, `/gadgets`, `/sport`, `/copii`, `/animale`, `/casa`, `/calatorie`, `/carti`, `/parfumuri`, `/sanatate`, `/farmacie`, `/supermarket`, `/jocuri`, `/idei-cadouri`, `/bijuterii`, `/craciun`, `/extensie`

### Nise tech & financiar
`/gaming`, `/laptop`, `/telefoane`, `/antivirus`, `/smart-home`, `/instrumente-seo`, `/trading`, `/carduri-bancare`, `/vpn`, `/hosting`, `/ai-tools`, `/cursuri-online`, `/software-business`, `/servicii`, `/recomandari`, `/albire-dinti`, `/asigurari`

### Nise adăugate 29.06.2026
| URL | Status date |
|-----|-------------|
| `/pescuit` | LIVE, hero emerald, fallback decathlon.ro pana la aprobare pescar-expert.ro (~31 zile) |

### Nise adăugate 20.06.2026
| URL | Status date |
|-----|-------------|
| `/flori` | LIVE, floria.ro (partener real 2P, 7% comision) + 3gifts.ro + mariart.ro — model `/calatorie` |
| Banner publicitar 2P mutat pe pagina de magazin | Era pozitionat al 13/15 sectiuni (dupa tab-uri, CTA-uri, eligibilitate, articol blog) — vizibilitate aproape zero. Mutat imediat sub hero, inainte de tab navigation — confirmat vizual la ~300px de sus, inainte de fold pe majoritatea ecranelor. |
| Pagina de magazin — produse reale automat pentru 20 magazine | `loadProducts()` in `page.tsx` citea deja `products.json` filtrat per `merchant_slug` — nu necesita nicio modificare de cod, doar date reale (vezi fix-ul feed combinat de mai sus). Verificat live pe libris.ro: 24 produse reale cu poze. |
| `/servicii` — design colorat per categorie | Era complet monocrom (gri + accent emerald uniform peste tot). Acum: grid "Pagini dedicate" (13 tile-uri) cu gradient distinct per pagina, cele 6 categorii de servicii (Sanatate, Educatie, Software, Hosting, Telecom, Financiar) au fiecare propria culoare (icon badge, buton CTA, hover border), hero cu gradient multi-culoare. Pattern preluat de la `/categorii` care deja avea culori per categorie. Niciun portocaliu. |
| Homepage — sectiunea "Produse pe categorii" mutata | Era ingropata la sectiunea 11/16, mutata imediat dupa hero (a 2-a derulare) — prima dovada vizuala de produse reale cu poze/preturi/reduceri, cerut explicit de Alex pentru impact "wow" la intrare pe site |
| `/servicii` — grid "Pagini dedicate" extins de la 4 la 13 linkuri | vpn, ai-tools, trading, instrumente-seo, carduri-bancare, servicii-internationale, calculator, calculator-salariu, generator-proforma erau deja construite dar nelinkuite din /servicii |
| **`products.json` — REZOLVAT 20.06.2026: feed combinat 2Performant** | Problema veche (18/19 URL-uri ghicite moarte, doar navstore.ro funcțional) e rezolvata definitiv. 2Performant are propriul mecanism: Affiliate → My Feeds → combini surse intr-un singur feed cu URL stabil (`MY_FEED_URL` in `fetch_product_feeds.py`). Parser nou `parse_my_feed_combined()` — format nativ 2P (`<items><item><title>/<aff_code>/<price>/<campaign_name>/<image_urls>`, DIFERIT de Google Shopping XML), streaming prin `ET.iterparse` direct pe raspunsul HTTP (nu bufereaza tot fisierul — feed-ul are 414k+ produse). Rezultat: **33.096 produse din 20 magazine romanesti reale** (bookzone, carturesti, libris, evomag, dyfashion, foglia, depox etc.), filtrate sa fie doar domenii `.ro` (feed-ul include si magazine .hu/.bg irelevante). `KNOWN_FEEDS` (lista veche de URL-uri ghicite) redusa la doar `navstore.ro` (singurul confirmat functional), restul eliminate ca sa nu mai iroseasca timp de executie. Bug gasit si reparat: `image_urls` e uneori CSV cu mai multe poze per produs (mai ales carturesti.ro, 4825 produse afectate) — parser-ul ia acum doar prima. **De facut pe viitor**: adauga mai multe surse in My Feeds (automobilus.ro are 1M+ produse disponibile, vidaXL 277k — vezi 2Performant → Product Feeds → "Add to my feeds"), apoi actualizeaza `MY_FEED_URL` daca se regenereaza alt ID de feed. **FIX 21.06.2026**: 2Performant a mutat feed-urile de pe `api.2performant.com` pe `feeds.2performant.com` — `api.*` returna un redirect HTML, iar `ET.iterparse` crapa ("not well-formed line 1 col 0") -> 0 produse, products.json inghetat din 20.06. `MY_FEED_URL` pointeaza acum direct la `feeds.2performant.com`. Daca produsele se ingheata iar, verifica intai daca feed-ul mai raspunde XML (nu HTML/redirect). **FIX 22.06.2026 (important)**: feed-ul combinat `feeds.2performant.com` e **blocat pe IP de datacenter** (Cloudflare/bot-management) — local (IP rezidential) raspunde XML, dar din **GitHub Actions returneaza HTML** → `ET.iterparse` crapa → 0 produse combinate, ramanea doar navstore.ro (3000/1 magazin). Auth-ul 2P NU rezolva (e bloc pe IP). Solutie: `fetch_product_feeds.py` foloseste acum **API-ul autentificat** `api.2performant.com` (`get_products_from_api`, NU e blocat in CI) pentru cele ~20 feed-uri din "My Feeds" ca **sursa de diversitate** (nu doar ca fallback cand e gol). Plus **guard anti-regresie** la scriere: daca un run iese cu <4 magazine (feed combinat blocat + API picat), NU suprascrie un `products.json` existent mai bogat (pastreaza date stabile vs. fisier cu 1 magazin). |
| **Logo nou "AC"** (`public/logo-ac.png`, generat ChatGPT 20.06.2026) | Inlocuieste favicon (`icon-192.png`, `icon-512.png`, `icon-maskable-512.png`), `og-image.png` static, si `app/opengraph-image.tsx` (acesta din urma era sursa REALA a imaginii vechi aratate la distribuire — avea "300 magazine" hardcodat si logo text vechi; `og-image.png` static nu era folosit pentru homepage din cauza conventiei Next.js care prioritizeaza `opengraph-image.tsx`). **Atentie**: logo-ul foloseste gradient violet→portocaliu — portocaliul ramane interzis explicit doar pentru UI-ul paginilor (butoane/badge-uri), nu si pentru marca/logo. Navbar-ul (text "Am"+"Cupon.ro") NU a fost schimbat — de discutat cu Alex daca vrea inlocuirea completa cu imaginea noua. |

### Nise adăugate 18-19.06.2026
| URL | Status date |
|-----|-------------|
| `/piese-auto` | LIVE, 12 magazine reale (`categorie_slug==="automotive"`) |
| `/echipament-moto` | LIVE, linkuri placeholder (Fixato, MxEnduro — vezi Probleme active) |
| `/rochii-mireasa` | LIVE, linkuri placeholder (Trendiva, Viada, DYFashion — vezi Probleme active) |

**Deliberat neconstruite** (fără model de afiliere realist): "motoare la vânzare" (piață mâna-a-doua), "servicii de nuntă" (fotografi/organizatori — piață locală fragmentată, fără programe standard).

### Unelte gratuite (monetizate doar AdSense, fără dependință de aprobări afiliate)
`/calculator` (reduceri/cupoane), `/calculator-salariu` (net-brut 2026), `/generator-proforma` (document FĂRĂ valoare fiscală — **NU genera "factură"**, e-Factura e obligatorie din 2024-2025, vezi memoria `project-affiliate-site` pentru detalii legale)

### Legal/utilitare
`/despre-noi`, `/contact`, `/confidentialitate`, `/termeni`, `/wishlist`, `/cautare`, `/nisa/[slug]`, `/blog`, `/reduceri/[magazin]` (redirect 308 → `/cod-reducere/[magazin]`), `/cod-reducere/[magazin]`

---

## Programe afiliere — status

| Program | Platformă | Status |
|---------|----------|--------|
| 2Performant | Direct | ✅ ACTIV — sursa principală (226+ magazine) |
| Profitshare | Direct | ✅ ACTIV (62 magazine) |
| Impact.com | Direct (Account 7401119) | ✅ ACTIV — **483 magazine cu tracking real verificat** (actualizat 06.08.2026, reconciliere extinsa la data/output.json). Restul de 568 magazine `platforma:impact` (85, era 135) sunt recomandari oneste fara comision, nu mai au link fals — vezi update 06.08 mai jos. Reconcilierea ruleaza acum automat la fiecare pipeline (nu mai e manuala). |
| Binance | Direct | ✅ ACTIV — ref `205306153`, în `/trading` |
| Awin | Direct (account 101829567) | ✅ ACTIV — 16 magazine importate 16.07.2026, vezi `scripts/import_awin_links.py` |
| Otto Broker (asigurări) | 2Performant | ✅ ACTIV — descoperit 17.07.2026 in output.json (aprobat, dar niciodata folosit), acum pe `/asigurari` |
| Fiverr, Hostinger, NordVPN | Impact.com / direct | 🔄 In review / pending |
| Semrush | Impact.com | ❌ RESPINS (18.06.2026, "business model mismatch") |
| pescar-expert.ro | 2Performant | 🔄 Aplicat 29.06.2026 — aprobare in ~31 zile (5-6% comision, 25k produse) |
| Fixato, MxEnduro, Trendiva, Viada, DYFashion | 2Performant | 🔄 De aplicat — vezi Probleme active |
| TradeTracker | Direct | ⚠️ cod gata, secrets lipsesc |
| CJ Affiliate | — | 🔄 Alex a aplicat, export CSV asteptat (seara 17.07.2026) — vezi Probleme active |

**Important**: ChatGPT/OpenAI și Claude/Anthropic NU au program de afiliere public — nu construi link pentru ele indiferent de cerere.

---

## Fișiere cheie

| Fișier | Rol |
|--------|-----|
| `frontend/public/output.json` | Sursa de adevăr — toate magazinele + promoțiile |
| `frontend/public/products.json` | Produse din feed-uri (`{updated, count, products:[]}`) |
| `frontend/public/blog-posts.json` | Articole blog generate automat |
| `data/extra_merchants.json` | Magazine adăugate manual, supraviețuiesc re-sync |
| `frontend/app/page.tsx` | Homepage (client component, secțiune `CATEGORII_INTL`) |
| `frontend/app/layout.tsx` | Root layout: GA4, Vercel Analytics, JSON-LD global |
| `frontend/app/sitemap.ts` | Sitemap dinamic din output.json + blog-posts.json |
| `frontend/app/api/newsletter/route.ts` | Subscribe + `sendWelcomeEmail()` (Brevo) |
| `scripts/reconcile_impact_links.py` | Upgradeaza magazine Impact fara link real (extra_merchants.json + data/output.json) la linkul real din CSV cand exista program activ; curata parametri falsi cand nu exista. Ruleaza automat in pipeline, inainte de merge_platforms.py |
| `scripts/check_affiliate_links.py` | Verifica LIVE ca linkurile de afiliere raspund (urmareste redirectul complet). `--platform <nume>` sau `--all`; implicit doar raport, `--delete-dead` sterge mortii. Raport in `data/link_check_report.json` |
| `scripts/fetch_awin_api.py` | Programe Awin via API oficial (fara CSV manual). Necesita `AWIN_API_TOKEN` — pana atunci face skip elegant. Afiseaza JSON-ul brut al primului program ca sa confirmam denumirile campurilor la prima rulare reala |
| `scripts/fix_light_leftovers.js` | One-shot: converteste clasele Tailwind NUMITE de tema light ramase (bg-slate-100 etc). Nu atinge `bg-white` (cutii logo). Reruleaza daca apare alt rebrand |
| `scripts/fetch_2p_api.py` | Auth 2Performant + descărcare magazine/promoții |
| `scripts/fetch_product_feeds.py` | Descărcare produse din API feed-uri |
| `scripts/send_newsletter.py` | Campanie Brevo către abonați (template indigo/cyan) |
| `scripts/check_price_alerts.py` | Alerte țintite per magazin — diff `output.json` vs `data/price_alert_snapshot.json`, trimite doar abonaților cu `ALERT_STORES` matching |
| `scripts/send_welcome_series.py` | Continuă seria de bun-venit după emailul 0 din `route.ts` — ziua 3 + ziua 7, idempotent pe atributul `WELCOME_STEP`. Necesită atributul Brevo creat manual (vezi Probleme active) |
| `scripts/generate_video_daily.py` | Flux video AI: `digest-today.json` → script vocal + edge-tts (voce RO + subtitrări) + ffmpeg → MP4 vertical TikTok/Reels/Shorts. Fundal brand curat (PIL, fără portocaliu). Output `data/video-today/`, copiat în public/ de pipeline |
| `data/price_alert_snapshot.json` | Snapshot coduri active per magazin, folosit pentru detectarea codurilor noi |
| `frontend/lib/supabase.ts` | Client Supabase (proiect `ktfoaqprezeqzoeuohnh`) pentru `reviews` — URL + cheie anon hardcodate ca fallback |
| `frontend/app/cod-reducere/[magazin]/ReviewSection.tsx` | Tab Recenzii pe pagina de magazin — citire + formular submit, moderare manuală din Supabase dashboard |
| `scripts/retheme_pages.js` | Transformator regex bulk pentru rebrand-uri de scară mare |
| `.github/workflows/update-data.yml` | Pipeline cron GitHub Actions |

---

## 2Performant API — Auth corect (DeviseTokenAuth)

**NU** HMAC. Flow corect:
```
POST https://api.2performant.com/users/sign_in.json
  Body: {"user": {"email": "...", "password": "..."}}
  Response headers: access-token, client, uid

GET https://api.2performant.com/affiliate/programs.json
  Headers: access-token, client, uid, token-type: Bearer
```

Endpoint-uri (toate cu `.json` suffix, fără slash final):
- `/affiliate/programs.json` — magazine aprobate
- `/affiliate/advertiser_promotions.json` — promoții active
- `/affiliate/product_feeds.json` — lista feed-uri
- `/affiliate/product_feeds/{id}/products.json` — produse

Quicklinks: `https://event.2performant.com/events/click?ad_type=quicklink&aff_code=541547473&unique=bb3071a7d&redirect_to={quote(url)}`

⚠️ **CRITIC:** `unique` TREBUIE să fie token-ul REAL al afiliatului (`bb3071a7d`), UNIVERSAL pentru toate magazinele. **NU folosi `md5(url)[:9]`** — produce `unique` invalid → 2P respinge cu `notoolerror` → toate linkurile stricate. Constanta `QUICKLINK_UNIQUE` în `fetch_2p_api.py` + `fetch_product_feeds.py`.

---

## Chrome Extension

- **Extension ID:** `mahfankpalkgognhnllkgdkjncmmkllb`
- **Cod sursă:** `extension/` folder
- **Status REAL (screenshot dashboard 02.07.2026): "Versiune nefinalizată" (draft)** — extensia NU a
  fost niciodată trimisă la review, contrar notei vechi "trimis spre review 26.05". Există 2 drafturi
  duplicate din 26.05.2026. **Ce lipsește pt publicare (Alex, manual în dashboard):** completează
  listing-ul (descriere, min. 1 screenshot 1280x800, iconă 128px — o avem indigo acum), privacy
  policy URL (avem `/confidentialitate`), justificarea permisiunilor, apoi "Trimite spre examinare".
  Șterge draftul duplicat. Review-ul Google durează de obicei 1-3 zile lucrătoare.
- **Fix aplicat 01.07.2026**: `/extensie` trimitea vizitatori activ către linkul mort (2 CTA-uri + JSON-LD
  `url`). Înlocuit cu mesaj onest "În curs de aprobare" + CTA "Anunță-mă când e disponibilă" → `/newsletter`
  (captează lead-ul in loc sa piarda vizitatorul pe un link mort). Mesajul din `AnuntAnimat.tsx` (bara de
  sus) actualizat la fel — nu mai pretinde "disponibilă". **Nu reintroduce linkul chromewebstore.google.com
  direct pana Alex confirma ca extensia e din nou LIVE (aprobata).**

---

## GitHub Secrets

| Secret | Status |
|--------|--------|
| `TWOPEFORMANT_EMAIL/PASS/USER` | ✅ |
| `PROFITSHARE_USER/KEY` | ✅ |
| `BREVO_API_KEY` | ✅ (Campaigns/Contacts API — diferit de SMTP, vezi nota jos) |
| `BREVO_SMTP_USER/PASS` | ✅ (doar pentru `--test` local, NU pentru campanii reale) |
| `NEXT_PUBLIC_ADSENSE_ID` | ✅ `ca-pub-1744566936173747` |
| `FACEBOOK_PAGE_TOKEN` | ⚠️ setat dar EXPIRAT/invalid (`Bad signature`, verificat 20.07.2026) — vezi Probleme active |
| `TRADETRACKER_SITE_ID/API_KEY` | ❌ LIPSESC |

**Gotcha Brevo**: `BREVO_API_KEY` (Campaigns/Contacts API) și `BREVO_SMTP_USER/PASS` (SMTP) sunt credențiale DIFERITE, nu interschimbabile. Workflow-ul folosește API_KEY pentru trimiterea reală.

---

## Categorii sluguri

**CORECTAT 09.08.2026** — tabelul de mai jos documenta taxonomia veche ENGLEZEASCA, dar
`categorie_slug` real din output.json foloseste de mult sluguri ROMANESTI. Documentatia stale de aici
a fost o cauza directa a bug-ului "18 linkuri /categorii moarte" + "237 descrieri magazin duplicate"
gasite si reparate pe 09.08 (vezi update-ul de mai sus). Aceasta e acum sursa corecta:

Mapping real `categorie_slug` din output.json → URL `/categorii/{slug}` (18 categorii, vezi si
`CategoryIcon.tsx` pentru iconita+culoare fiecarei categorii):
`fashion`, `beauty`, `bijuterii`, `electronice`, `software`, `telecom`, `casa-gradina`, `animale`, `mancare-bauturi`, `carti-educatie`, `copii`, `cadouri-flori`, `calatorii`, `sanatate`, `financiar`, `sport`, `auto-moto`, `marketplace`

**Nota reziduala**: `NUME_CATEGORIE` din `app/categorii/[slug]/page.tsx` inca are cheile in engleza
(fallback inofensiv pe `mag[0].categorie` cand cheia nu se potriveste — pagina tot functioneaza, doar
nu foloseste eticheta "frumoasa" din acel tabel). De curatat cand se mai atinge fisierul, nu urgent.

---

## SEO Conventions

- `generateMetadata()` în fiecare `page.tsx`: titlu format `"Cod reducere {Magazin} {luna} {an} — AmCupon.ro"`, **sub 60 caractere** (Google taie în SERP peste asta — lecție din audit 17.06)
- JSON-LD per pagină: `BreadcrumbList` + `ItemList` (categorie/magazin), `BlogPosting` (blog)
- `robots.ts` permite tot, `sitemap.ts` include toate magazinele + categorii + blog
- Redirect-urile permanente folosesc `permanentRedirect()` (308), NU `redirect()` (307) — Google cere 308 pentru consolidare SEO corectă (fix 16.06.2026, vezi `app/reduceri/[magazin]/page.tsx`)

## Bug cunoscut

Ghilimelele tipografice românești `„..."` în fișiere TSX cauzează erori Turbopack (interpretate ca ASCII `"`). Folosește template literals `` ` `` sau ghilimele normale.
