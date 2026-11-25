# Prompt: noul AmCupon — „Prețul adevărat”

Scris de Claude pentru Claude pe 24.11.2026, după un research internațional cerut de Alex: „dă-ți singur un prompt
pentru noul site, cu altă temă, dinamic, ceva wow, ceva ce va prinde”. Se lipește ca prim mesaj într-o sesiune nouă
sau se citește înainte de orice lucru pe tema nouă. Pagina pentru Alex, cu demonstrațiile: vezi CLAUDE.md, intrarea
din 24.11, partea a doua.

## Rolul tău

Ești designerul și inginerul principal al AmCupon.ro. Construiești noul site: temă nouă, dinamică, cu un moment „wow”
care ține oamenii pe pagină și îi aduce înapoi. Nu e o recolorare. E o promisiune nouă, pe care o poate face doar
AmCupon, pentru că doar noi avem datele: istoricul propriu de preț pe zeci de mii de produse.

## Citește întâi

1. `CLAUDE.md`: regulile de onestitate, poarta de publicare, capcanele. Are prioritate față de acest fișier.
2. `docs/LECTII-TEHNICE.md`: tiparele de bug care revin, mai ales 10 (semnale inventate), 11 (măsoară înainte să
   tai), 14 (linkuri spre pagini care nu există) și 16 (CSS fără strat bate CSS din strat).
3. Acest fișier, până la capăt.

## Precondiții (verifică înainte de prima linie de cod)

- **Site-ul trebuie să fie sus.** Din 14.11 amcupon.ro răspunde 402 „DEPLOYMENT_DISABLED” (contul Vercel e blocat;
  deblocarea o face Alex). Fără deploy, nicio temă nu ajunge la oameni.
- **/alege trebuie să trăiască.** 124 din cele 155 de clicuri reale (30 de zile, până la 14.11) au venit de pe /alege.
  Pe 24.11 erau publicate doar 7 pagini din 130 aprobate, fiindcă confirmările de preț la magazin au scăzut la circa 5
  pe zi (sarcină separată). Noua temă se sprijină pe aceste pagini; dacă ele dispar, „wow”-ul nu are ce arăta.
- **Poarta de publicare verde** (`gh run list --workflow=update-data.yml`).

Dacă una lipsește, spune-i lui Alex și lucrează mai departe doar pe ramură (macheta, componentele), fără să publici.

## Ce știm (măsurat pe 24.11.2026, nu presupus)

- 922 de magazine (423 .ro), 148 cu ofertă activă, 66 cu cod (124 de coduri), 19.683 de produse de la 460 de magazine.
- Istoric de preț propriu pe 82.005 produse, din 07.10. Din cele 10.249 cu cel puțin 14 zile de istoric: 1.512 s-au
  ieftinit, 617 s-au scumpit (mediana scumpirii +17,5%), 47 sunt azi sub minimul din 30 de zile.
- Bani: 155 de clicuri reale în 30 de zile, 124 de pe /alege, aproape toate pe telefon; între 07 și 14.11, 85 de
  clicuri; de pe prima pagină, 1 din 11 (19.10–03.11); 0 vânzări în 90 de zile.
- Oamenii vin din căutări „cod reducere” + numele unui magazin mic (coada lungă), Bing înaintea Google.
- Pe ce se câștigă cel mai mult pe vânzare: analiza privată din `Projects/pasul-0/` (nu în repo: comisioanele nu se
  publică).

## Ce am aflat afară (research, noiembrie 2026)

1. **Încrederea e marfa rară.** Verificarea UE a reducerilor de Black Friday și Cyber Monday 2025 (rezultate pe
   26.03.2026): 30% din 314 magazine online au calculat reducerea greșit; o parte au folosit presiune (numărători
   inverse, „stoc pe terminate”), iar peste jumătate din acele afirmații erau înșelătoare. Propunerea Digital Fairness
   Act (11.11.2026) interzice tiparele manipulative, între care raritatea falsă. Scandalul Honey (decembrie 2024) a
   adus reguli noi în Chrome Web Store pentru extensiile care schimbă linkuri de afiliere fără știrea omului.
2. **Google răsplătește implicarea reală.** Politica „site reputation abuse” a scos din rezultate secțiunile de cupoane
   ale publicațiilor; o analiză arată că site-urile de cupoane dedicate au câștigat în aceeași perioadă. Avantajul
   nostru nu e numărul de pagini, ci datele proprii pe care nu le are altcineva.
3. **Prețul în context se vinde.** Google Shopping arată „preț mic / obișnuit / mare” pe ultimele trei luni, doar în
   SUA. În UE, „prețul anterior” al unei reduceri e prin lege cel mai mic preț din ultimele 30 de zile (în România,
   HG 686/2022). La concurenții români văzuți în research (Picodi, cu cashback și coduri; Cuponeria; Cuponescu;
   Shopilo, nou din octombrie 2025) nu am găsit istoricul prețului lângă cupon. De confirmat pe paginile lor în Faza 0.
4. **Comunitatea merge doar cu masă critică.** La Pepper (hotukdeals, mydealz, dealabs) votul „hot/cold” urcă o
   ofertă de la 0° la 100° (HOT); hotukdeals are în jur de două milioane de membri. Fără mii de utilizatori, un
   termometru de comunitate stă gol. Al nostru vine din date, nu din voturi, și spune cum e calculat.
5. **Telefonul decide.** România 2025: circa 74% din comenzile online de pe smartphone; la eMAG, de Black Friday 2025,
   84% din 7,7 milioane de vizite au venit de pe mobil; în ziua de Black Friday, 1,31 milioane de tranzacții online,
   în jur de 720 de milioane de lei.
6. **Asistenții AI cumpără deja.** Într-un studiu pe 3.312 cereri de cumpărături, ChatGPT a arătat carduri de produs
   la 87%, Google AI Mode la 91%. Există protocoale de cumpărare prin agenți (OpenAI ACP din septembrie 2025, Google
   UCP anunțat în ianuarie 2026). Cine are date de produs curate (preț, monedă, disponibilitate, data confirmării)
   ajunge în răspunsuri.
7. **Social: descoperire, nu cumpărare.** Tinerii găsesc oferte pe TikTok și Instagram, dar cumpără de acolo mai rar
   (44% preferă descoperirea, 24% cumpărarea, într-un sondaj Bazaarvoice). Deci: o ofertă trebuie să se poată trimite
   ușor mai departe; nu construim o rețea socială.
8. **Design 2026.** Grile bento (6–9 plăci), tipografie cinetică doar în titlul mare, animații legate de derulare cu
   măsură, View Transitions; reacție la designul generic făcut cu AI și la scroll-jacking. Liquid Glass și
   glassmorphism sunt criticate pentru contrast: sticla doar pe elemente care nu poartă text de citit.

Sursele, cu adrese: pagina publicată pentru Alex (CLAUDE.md, 24.11, partea a doua).

## Conceptul: „Prețul adevărat”

Promisiunea, într-o propoziție: **„Codul, oferta și adevărul despre preț, înainte să plătești.”**

Trei piloni, în ordinea banilor:

1. **Găsește-l** (inima site-ului). Un căutător ghidat: „Ce cumperi?”, apoi caracteristica, apoi bugetul, apoi
   produsele cu prețul confirmat la magazin și data confirmării. E /alege, adus în primul ecran. Fără model de limbaj:
   reguli și datele din `data/criterii-stare.json`. Stări goale oneste („încă nu avem prețuri confirmate pentru X”).
2. **Termometrul prețului** (semnătura vizuală). O bară cu minimul și maximul din ultimele 30 de zile și prețul de azi
   marcat pe ea. Eticheta „Reducere reală” apare DOAR când prețul de azi e sub minimul din 30 de zile ȘI varianta e
   aceeași. Pe 24.11, două din primele trei „scăderi” arătau a schimbare de variantă: o mostră de 15 ml la 95 de lei
   față de 200, un sac de hrană la exact jumătate de preț, cu 7 și 12 kg în numele imaginii. Regula cere aceeași
   variantă (volum, greutate, mărime, din titlu și din adresă) sau tace, cu test care pică fără ea. Termometrul apare
   pe paginile /alege, pe /reduceri-reale și la cerere („Verifică prețul”), **nu pe fiecare card**: decizia lui Alex
   din 21.06 („produsele lejere și curate”) rămâne în picioare.
3. **Codul** (gestul). Dezvăluirea și copierea codului devin momentul memorabil: bonul care iese din imprimantă,
   ștampila, confetti (ce există deja din 24.11, rafinat).

## Direcția vizuală (de validat cu Alex în Faza 0)

Recomandarea: **„Bon de noapte”**. Temă închisă (Alex a ales închis de două ori), cu un obiect-semnătură luat din
lumea cupoanelor: bonul de casă.

- Fond de cerneală albăstruie, suprafețe închise. Cardul de cod și termometrul stau pe „hârtie termică” deschisă, cu
  marginea perforată. Contrastul vine din obiect, nu din multe culori.
- O singură culoare de marcă: **cobalt de ștampilă** (pe hârtie: textul și ștampila „REDUCERE REALĂ”; pe fond închis:
  o variantă luminoasă pentru linkuri și acțiuni). Verde doar pentru „preț bun”, roșu doar pentru expirare: culori de
  stare, nu accente.
- Tipografie: o față de afișaj cu personalitate pentru titluri (de ales în Faza 0, testată cu ș, ț, ă, î, â), Geist
  pentru text (deja încărcat), Geist Mono pentru prețuri și coduri, cu cifre tabulare, ca pe un bon.
- Bento pe prima pagină: căutătorul, ofertele de azi, „sub minimul din 30 de zile”, calendarul Black Friday,
  magazinele.
- Alternativa B, doar pentru comparație în Faza 0: **„Aurora de date”**, fond închis cu lumină care vine din date
  (termometrul colorează placa), fără hârtie.

Interzise (din istoricul proiectului și din research): portocaliu și amber, auriu, curcubeu pe carduri, text alb pe
un accent deschis, combinația „aproape negru + o singură culoare acidă” (arată generată de AI și e exact tema de azi,
lime), sticlă sub text.

## Dinamica: „wow”-ul, cu frână

- **Un singur moment orchestrat:** pe prima pagină, bonul se tipărește (hârtia coboară, rândurile apar pe rând) și
  ștampila cade. Doar `transform`; textul e în HTML și vizibil de la prima pictură, deci LCP-ul nu așteaptă animația.
- Termometrul se umple când intră în ecran; cifrele din primul ecran numără o singură dată până la valoarea reală.
- „Oferta zilei” pe telefon: un pachet de carduri care se glisează (scroll-snap și puțin JavaScript, fără bibliotecă).
- Trecerea card → pagina magazinului: View Transitions (Next 16 are `experimental.viewTransition`), doar ca experiment
  măsurat, cu revenire la trecerea obișnuită dacă LCP sau INP se strică.
- Rămâne tot ce există din 24.11: `components/Aparitii.tsx`, tranzițiile în afara stratului (lecția 16), confetti,
  „mișcare redusă”, tipăritul.
- Bugete, măsurate cu A/B intercalat față de main (34 + 34 de rulări pe prima pagină, telefon, procesor încetinit de 4
  ori; `scripts/proba_animatii.cjs` și scriptul de A/B din sesiunea din 24.11): LCP nu mai rău, CLS 0, TBT nu mai rău;
  JavaScript în plus cel mult 10 KB gzip, CSS cel mult 8 KB gzip; zero biblioteci de animație.

## Pagini (adresele NU se schimbă: SEO)

- **Prima pagină:** în primul ecran, căutătorul („Ce cumperi?”) și bonul-demonstrație cu un produs real de azi; apoi
  bento. Cifrele din date, niciodată scrise de mână (`lib/cifreSite.ts`, `lib/acordNumeral.ts`).
- **Pagina de magazin** (coada lungă „cod reducere X”): aceeași ordine (coduri, oferte, produse), pielea nouă; codul
  ca bon.
- **/alege/[criteriu]:** termometrul pe fiecare produs (prețul e confirmat la magazin) și „confirmat la magazin pe
  [data]”.
- **/reduceri-reale:** pagina-vedetă a termometrului; povestea „Câte reduceri sunt reale”, doar cifre agregate, fără
  nume de magazine în statistici.
- **Partajare:** imagine de previzualizare pe ofertă și pe produs (`opengraph-image`), buton WhatsApp. Fără cod în
  imagine (codul se vede doar după linkul plătit).
- **Pentru asistenții AI:** JSON-LD Product și Offer doar cu ce e adevărat (preț, monedă, disponibilitate, data
  confirmării) și `llms.txt` actualizat cu căutătorul.

## Ce NU facem

Contoare inventate („X oameni se uită acum”), urgență falsă, roți ale norocului și cartonașe de răzuit (apar în
tendințele de cupoane și sunt exact ce vrea să interzică DFA), „verificat” sau „testat” despre coduri, comisionul
afișat, procente de vot sub 3 voturi, sticlă sub text, scroll-jacking, video care pornește singur, ferestre agresive,
cashback (nu avem), etichete de preț pe fiecare card.

## Cum lucrezi

- Ramura `claude/site-nou` (pornită din `claude/animatii`). Pe main doar cu „da” explicit de la Alex, în chat.
- **Faza 0, macheta pe date reale (o zi):** prima pagină, o pagină de magazin și o pagină /alege, în cele două
  direcții (A recomandată, B pentru comparație), cu un comutator; publicată ca pagină pentru telefonul lui Alex
  (modelul: `docs/design/macheta/`, generată din date). Alex alege. Nimic din site nu se atinge înainte.
- **Faza 1, fundația:** tokenii noi (fără hex în componente), fonturile prin `next/font`, componentele de bază (cardul
  de cupon, cardul de produs, termometrul, bonul), contrast calculat pe fundalul efectiv (cel puțin 4,5:1 la text,
  3:1 la text mare).
- **Faza 2, paginile:** prima pagină, pagina de magazin, /alege, /reduceri-reale; restul moștenesc tokenii.
- **Faza 3, termometrul și căutătorul:** regula de variantă, cu test care pică fără ea; căutătorul cu stări goale
  oneste.
- **Faza 4, partajare și AI:** imagini de previzualizare, JSON-LD, `llms.txt`.
- La fiecare fază: tsc, eslint (0 erori), `next build`, `verifica_text.py`, `verifica_site.py --html`,
  `audit_pagini.py`, `node scripts/proba_animatii.cjs`, A/B față de main (cu portul eliberat cu `fuser` și CSS-ul
  cerut cu curl înainte), capturi la 390 și la 1280 px privite, nu doar măsurate. Commit și push pe ramură, CLAUDE.md
  actualizat în același commit.
- Testele nu fac clicuri false: tot ce iese din serverul local e blocat, `/api/` la fel, `sendBeacon` oprit.

## Cum știm că a mers (după publicare, 30 de zile)

- Clicuri reale pe zi (din `clicuri_afiliate`, fără boți): cel puțin dublu față de 07–14.11 (85 de clicuri în 8 zile).
- Clicuri de pe prima pagină: de la 1 din 11 la peste 15% din total.
- Prima vânzare confirmată pe 2Performant.
- LCP pe telefon nu mai rău decât main, CLS 0, poarta verde la fiecare rulare.
