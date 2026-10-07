# Lecții tehnice — tipare care se repetă în acest proiect

> **Ce e acest fișier și de ce e separat de `CLAUDE.md`.**
> `CLAUDE.md` e jurnal cronologic: „pe 14.08 s-a reparat X". E indispensabil pentru starea
> proiectului, dar prost la citit când vrei să afli *ce tinde să se strice aici*. Fișierul ăsta e
> organizat pe **TIPAR**, nu pe dată — fiecare secțiune adună toate aparițiile aceleiași greșeli,
> ca a doua oară s-o recunoști înainte s-o repeți.
>
> Regula de întreținere: când găsești un bug care seamănă cu unul de mai jos, **adaugă-l la tiparul
> existent**, nu crea o secțiune nouă. Numărul de apariții e informația cea mai valoroasă din
> fișier — arată ce se repetă cu adevărat.
>
> Ultima actualizare: 07.09.2026.

---

## 1. Potrivire pe SUBȘIR acolo unde există un câmp EXACT

**Cel mai frecvent bug din proiect. Găsit în 4 straturi diferite, în 3 sesiuni.**

Cineva scrie o listă de cuvinte-cheie și o trece prin `.includes()` / `in`, deși datele au deja
un câmp exact (`categorie_slug`). Subșirurile scurte se potrivesc accidental cu orice.

| Unde | Coliziunea reală | Efect |
|---|---|---|
| 22 de pagini de nișă (14.08) | `"cat"` ⊂ `"eduCATie"` | 8 din 14 magazine de pe `/animale` erau librării |
| aceleași pagini | `"marke"` ⊂ `"MARKEtplace"` | `/supermarket` afișa eMAG și Temu |
| aceleași pagini | `"software"` în `/gadgets` | 20 din 22 „magazine de gadgets" erau firme SaaS |
| `canonicalize_categories.py` (14.08) | `"pet"` ⊂ `"vaPETronic"`, `"kosPET"` | vape shop și ceasuri smart clasificate ca pet shop |
| `app/categorii/page.tsx` (16.08) | `"orange"`, `"digi"` în numele altor magazine | categoria `telecom` părea populată, dar pagina ei dădea 404 |

**Regula:** dacă datele au un câmp exact, compară exact. Sursa unică e
`frontend/lib/categoriiNisa.ts` (`esteInCategorie`) — orice pagină nouă o folosește, nu-și
inventează altă listă de cuvinte-cheie.

**Când chiar ai nevoie de subșir** (ghicit dintr-un nume de domeniu, unde cuvintele sunt lipite):
aplică graniță de cuvânt DOAR la cuvintele-cheie scurte (≤3 litere). O regulă de graniță globală ar
fi rupt 30+ hoteluri clasificate corect (`zenhotels`, `savelectro`) — măsurat înainte de a schimba.

---

## 2. Taxonomie moartă care supraviețuiește migrărilor

`categorie_slug` a migrat demult din engleză în română. Resturile englezești au fost găsite în
**5 valuri**, la săptămâni distanță — de fiecare dată credeam că le-am prins pe toate.

- 09.08: `app/categorii/page.tsx` (18 linkuri → 404) + `generate_store_descriptions.py` (237 de
  descrieri identice)
- 14.08: încă 5 fișiere — `"jewelry"`, `"gifts-flowers"`, `"automotive"` (×2), `"office-supplies"`.
  `/flori` avea chiar **dublă condiție moartă** (slug EN + `categorie.includes("flower")`, dar
  eticheta reală e „Cadouri & Flori") → 0 magazine, mereu.

- 21.08: **al 4-lea val, cel mai scump** — de data asta nu în cod, ci în URL-uri publice.
  Exportul GSC a arătat „Nu a fost găsită (404) — 35 de pagini, validare eșuată". Am testat live
  toate cele 38 de sluguri de dinainte de commit `b048300`: **29 răspundeau 404**, din iulie.
  Nu erau linkuri moarte în cod (alea fuseseră reparate în valurile 1-3) — erau adresele vechi,
  pe care Google le avea deja indexate, rămase fără redirect.

- 22.08, **al 5-lea val, în aceeași zi cu al 4-lea** — `DESC_CATEG` din
  `app/categorii/[slug]/CategorieClient.tsx`: 11 din 13 descrieri SEO cheiate pe sluguri moarte,
  deci nu s-au afișat niciodată. Iar cele 2 vii numeau magazine inexistente (FashionDays,
  Zara, H&M, Douglas, Sephora) — singurul text SEO vizibil de pe acele pagini era parțial fals.
  Găsit accidental, căutând altceva. Asta spune ceva: patru „curățări complete" anterioare
  n-au găsit-o, pentru că nimeni nu caută un `Record` de descrieri când vânează linkuri rupte.

**Regula a treia, adăugată 22.08:** nu mai repara instanțe — schimbă ce face repararea posibilă.
Textul scris de mână care numește date (magazine, categorii, cifre) se învechește tăcut, pentru
că nimic nu-l verifică. `DESC_CATEG` a fost rescris ca să NU mai numească niciun magazin; numele
vin acum dintr-o propoziție generată din `output.json`. O propoziție generată nu poate deveni
falsă. Aplică asta oriunde textul editorial pomenește date reale.

**Regula:** după orice migrare de taxonomie, `grep` pe `categorie_slug ===` și compară fiecare
valoare cu lista reală din date. Nu presupune că o migrare anterioară le-a prins pe toate.
Documentația stale a fost ea însăși cauza — tabelul din `CLAUDE.md` a rămas pe engleză luni întregi
și a indus în eroare.

**Regula a doua, adăugată 21.08:** reparatul linkurilor interne NU e suficient. Când redenumești
un slug care a fost vreodată public, redirectul 301 se scrie în **același commit** cu redenumirea.
Un link intern rupt îl vezi la primul click; o adresă veche fără redirect e invizibilă local și
trăiește luni întregi ca semnal de calitate slabă către Google. Valurile 1-3 au reparat codul.
Valul 4 a fost tot ce codul nu putea arăta.

---

## 3. Liste duplicate care se desincronizează

Când același lucru e scris în două locuri, al doilea rămâne în urmă. Garantat, doar e o chestiune
de timp.

- 09.08: homepage folosea un card de magazin **separat**, mai vechi, niciodată atins de
  îmbunătățirile aplicate peste tot. Avea și 2 semnale false pe care restul site-ului le eliminase.
- 16.08: `Footer.tsx` se ascunde explicit pe `/` (`if (pathname === "/") return null`) pentru că
  `HomeClient` are footer propriu cu liste **copiate**. Cele 6 linkuri noi au apărut pe ~100 de
  pagini, dar nu pe homepage — adică exact pagina cu cea mai multă autoritate.

- **07.09:** eticheta de expirare a promoțiilor era scrisă de mână în **5 locuri**, cu praguri
  diferite. `BrandPageTemplate` și `oferte-azi` plafonau corect afișarea (`< 99` → text fără cifră);
  `cod-reducere/[magazin]` (×2 blocuri) și `reduceri/[magazin]` **n-aveau nicio limită superioară**
  și afișau brut valoarea din date. Rezultat măsurat live: `incaltamintelamoda.ro` → **„3571 zile
  ramase"**, `jojofashion.ro` → 4924 în date. 17 promoții pe 10 magazine. Cea mai importantă pagină
  a site-ului (`/cod-reducere/*`) era printre cele nereparate.
  **Ce spune tiparul aici:** cineva reparase deja bug-ul — de două ori — dar în instanțe, nu
  centralizat. A treia pagină care a avut nevoie de un countdown l-a rescris de la zero, fără plafon.
  Reparațiile pe instanță nu se propagă; sursa unică se propagă. Acum: `lib/expirarePromo.ts`.

- **07.09, în aceeași zi: DOUĂ secțiuni „Întrebări frecvente" pe aceeași pagină de magazin.**
  Măsurat pe HTML-ul live: titlul apărea de 2 ori, iar întrebarea „e verificat?" primea **două
  răspunsuri diferite** — unul corect (`intrebari` din `page.tsx`, reparat pe 16.08 și declarat
  acolo „o SINGURĂ sursă pentru textul vizibil și pentru schemă"), altul, mai jos în
  `MagazinClient.tsx`, care afirma două neadevăruri pe toate cele 1.148 de pagini:
  „Actualizate zilnic din platforma 2Performant" (fals pentru 644 de magazine — Impact, Awin,
  directe) și „Fiecare cod afișează rata de succes" (semnal eliminat pe 03.07).
  **Nota din 16.08 spunea adevărul despre propriul array, dar nimeni nu s-a uitat dacă mai există
  un al doilea FAQ în componenta-copil.** „Sursă unică" e o afirmație verificabilă: numără
  aparițiile în HTML-ul generat, nu te baza pe comentariul care spune că e unică.

**Regula:** o listă folosită în două locuri se **exportă dintr-unul și se importă în celălalt**.
Nu se copiază, oricât de mică e. **Același lucru pentru o REGULĂ de afișare**, nu doar pentru o
listă de date: un prag, un format, o condiție de vizibilitate copiate în două componente diverg la
fel de sigur. Dacă repari același comportament a doua oară, semnul e că trebuie centralizat, nu
reparat încă o dată.

---

## 4. Plase de siguranță pe care nu le verifică nimeni

Un fallback despre care toată lumea presupune că merge, dar nimeni nu l-a testat.

- **14.08:** `merge_platforms.py` trimitea orice logo cu sursă moartă către faviconul Google, cu
  un comentariu care spunea „nu dă niciodată 404". **43 din cele 58 de logo-uri rupte ERAU exact
  acel fallback.** Google chiar dă 404 pentru domeniile pe care nu le rezolvă.
- **16.08:** garda anti-regresie de la `products.json` se declanșa doar sub 4 **magazine** — și
  de-aia n-a prins regresia reală 33.096 → 3.468 de **produse**: magazinele erau 86, doar produsele
  se prăbușiseră. Garda măsura altă dimensiune decât cea care ceda.

**Regula:** testează plasa de siguranță, nu doar drumul principal. Și verifică dacă garda măsoară
chiar dimensiunea care poate ceda.

- **16.09: „✓" tipărit indiferent de rezultat, pe pași cu `continue-on-error`.** Facebook scria
  „0 posturi publicate ✓" zi de zi cu tokenul mort (cod 190); Telegram a tăcut 3 zile, workflow verde;
  site-ul a afișat 58 de promoții expirate, workflow verde. Nimic nu verifica ce ajunge efectiv la
  cititor. **Regula:** un script de publicare iese cu cod ≠ 0 când n-a publicat ce a încercat, iar
  datele publice au o gardă proprie la final (`verifica_promotii.py`, `if: always()`), dovedită că pică.

---

## 5. Fișiere auto-referențiale: o greșeală se auto-confirmă la infinit

`data/output.json` e simultan **intrare și ieșire** pentru `merge_platforms.py`. Consecința e
contraintuitivă și a costat de două ori:

- **06.08:** un link fals cu scor mare bloca la infinit un link real cu scor mic. La fiecare rulare,
  dedup-ul îl păstra pe cel greșit. Nu se putea auto-repara niciodată.
- **14.08:** `_canon_from_label` citește eticheta scrisă la rularea precedentă. O categorie greșită
  o dată rămâne greșită pentru totdeauna — nicio ghicire după nume n-o mai poate corecta, pentru că
  numele nici nu se mai consultă. De-aia există `OVERRIDE`: e singurul mod de a desface o
  clasificare blocată.

- **16.09:** `fetch_impact_deals.py` doar ADĂUGA promoții, iar `zile_ramase` se calcula o singură
  dată. O ofertă retrasă, expirată sau atașată greșit rămânea pentru totdeauna, cu același „expiră în
  2 zile": 58 de expirate pe site și 178 de contoare înghețate. Corecția: câmpurile derivate
  (`zile_ramase`, flag-urile de magazin) nu se păstrează, se RECALCULEAZĂ din sursă (`expira`) la
  fiecare rulare (`scripts/promotii.py`), iar lista unei surse se ÎNLOCUIEȘTE cu oferta de azi.

**Regula:** într-un fișier care e și intrare și ieșire, orice eroare devine permanentă. Trebuie
prevăzut explicit un mecanism de corecție care bate datele existente.

---

## 6. Paginare: nu presupune că API-ul respectă `per_page`

**Găsit de patru ori, în patru scripturi, cu exact aceeași cauză.**

API-ul 2Performant **capează la 20 de elemente pe pagină și ignoră `per_page`**. Codul cerea 50 sau
100 și se oprea cu `if len(items) < per_page: break` — primea 20, 20 < 50, deci se oprea după prima
pagină.

- 30.06: `/affiliate/programs.json` → aducea 20 din 600 de programe
- 16.08: `fetch_product_feeds.py` → fix 20 de produse din fiecare feed. **Dovada în date, nu
  deducție: din 86 de magazine, 20 aveau EXACT 20 de produse.**
- 16.09: **același fișier, altă funcție** — `get_product_feeds()` (lista de feed-uri) avea încă
  `if len(items) < 50`. Logul scria „Pagina 1: 20 feed-uri (20 total)" la fiecare rulare. Efect:
  produsele săreau între rulări (7.873 → 12.100, cu ALTE magazine), iar o reparație de o zi (memorie
  între rulări) a ratat cauza. Căutat apoi tiparul în tot `scripts/`: al patrulea, `fetch_banners.py`.

**Regula:** oprește-te pe `metadata.pagination.pages` (numărul real de pagini). Rezervă pe
`len(items) == 0` doar când lipsește metadata. **Niciodată pe `len(items) < per_page`.**
**Regula a doua (16.09):** când repari tiparul într-un loc, `grep -n "len(items) <" scripts/*.py` pe
TOT folderul, în același commit. De două ori l-am reparat într-o funcție și l-am lăsat în vecina ei.
Și un „N total" egal cu dimensiunea unei pagini (20) într-un log e semnătura lui — citește-l ca atare.

**A cincea oară, 24.09.2026, și de data asta regula însăși era incompletă.** `fetch_all_pages()` din
`fetch_2p_api.py` respecta regula de mai sus — citea `metadata.pagination.pages` — dar la promoții
(`advertiser_promotions`) API-ul pune paginarea **direct în `pagination`**, fără `metadata`. Nu o
găsea, cădea pe `len(items) < per_page`, și la fiecare rulare logul scria „Pagina 1/?: 20 elemente
(20 total)" — exact semnătura de mai sus, necitită timp de cel puțin trei luni. Efect: pipeline-ul aducea
20 de promoții 2Performant, iar restul intrau doar când Alex importa manual un CSV (29.06, 16.07, 20.08).
Între importuri, numărul lor doar scădea (146 → 111 → 63). Prins din istoricul ofertelor, nu din cod.
**Regula completată:** paginarea se caută în AMBELE locuri (`_pagini_totale`), iar fără ea reperul e
mărimea primei pagini, nu `per_page`. `scripts/test_paginare_2p.py` pică pe codul vechi.

**A șasea, 06.10.2026, și probabil premisa titlului era greșită.** API-ul nu „ignoră `per_page`":
parametrul, după toate probele, **nu se numește așa**. Clientul oficial 2Parale/2Performant-php folosește
`perpage` (`unset($params['page'], $params['perpage'])`), iar CharityDiscount cere `perpage=40` în
producție — găsite cu `gh search code "api.2performant.com"`. Confirmarea noastră = logul primei rulări cu
`perpage` („Pagina 1/15: 40"); dacă tot vin 20, paginarea merge la fel și ipoteza cade. Trei luni am
construit reguli în jurul unui nume de parametru netestat, iar 20 pe pagină ne înjumătățea bugetul de
cereri (limita 429). În același log, alt plafon
ascuns: `get_product_feeds()` se oprea la `MAX_FEEDS * 3` = 180 de feed-uri din ~600 („Pagina 9/30"), deci
lista nu era NICIODATĂ completă și ~420 de magazine nu intrau în rotație.
**Regula a treia:** când un API pare să „ignore" un parametru, caută întâi cum îl numește clientul oficial
sau un integrator din producție — nu construi pe ocolire. Și un „Pagina 9/30" urmat de oprire e tot o
semnătură: bucla s-a oprit pe altceva decât pe ultima pagină.

---

## 7. Date structurate fără conținut vizibil

**16.08:** emiteam `FAQPage` cu 5 întrebări pe toate cele 1.162 de pagini de magazin, dar niciuna
nu apărea pe pagină (verificat pe HTML: 5 în schema, 0 în text). Google cere explicit ca un conținut
marcat FAQPage să fie vizibil utilizatorului — marcaj ascuns e motiv de acțiune manuală.

Înrudit, aceeași zi: `/categorii` emitea în `ItemList` un URL (`/categorii/telecom`) care răspundea
404. Un link rupt vizibil e o problemă; același link declarat lui Google ca pagină reală e mai rău.

**Regula:** schema descrie ce e PE pagină. Generează ambele din aceeași sursă, ca să nu poată
diverge — vezi array-ul `intrebari` din `cod-reducere/[magazin]/page.tsx`.

---

## 8. Capcane de verificare (m-au păcălit pe mine, nu pe altcineva)

1. **`npx tsc --noEmit | head; echo $?` raportează MEREU 0** — `$?` prinde exit-ul lui `head`, nu al
   lui `tsc`. Am raportat „type-check curat" și build-ul a picat imediat după.
   Corect: `npx tsc --noEmit -p . > /tmp/out.txt 2>&1; echo $?` — redirect, nu pipe.
2. **`.next` trunchiat**: dacă oprești dev server-ul în timp ce compilează, rămâne un
   `routes.d.ts` tăiat la mijloc și `tsc` raportează zeci de erori care NU sunt în codul tău.
   Semnul: toate erorile pe același rând, într-un fișier din `.next/`. Fix: `rm -rf .next`.
3. **„A răspuns" ≠ „a făcut ce am cerut".** API-ul Profitshare răspundea vesel la cererea de produse
   pentru eMAG — și întorcea produse Anvelino. Dacă m-aș fi oprit la „merge", aș fi scris un fetcher
   care cere produsele unui magazin și primește liniștit produsele altuia. **Verifică în răspuns că
   filtrul chiar s-a aplicat.**
4. **Testează presupunerea de bază înainte să rafinezi strategia.** Am pierdut două iterații
   încercând variante de eșantionare peste catalogul Profitshare, până am testat dacă paginarea e
   stabilă. (Era — dar catalogul se rearanjează după `last_update` la câteva minute, deci orice
   strategie de tip „magazinul X stă la pagina N, mă întorc acolo mai târziu" e greșită din
   PRINCIPIU, nu din implementare.) Testul costa 2 minute și le-ar fi economisit pe amândouă.
5. **`actions/checkout` clonează shallow (`fetch-depth: 1`).** Deci `git log -1 -- <fișier>` în CI
   întoarce singurul commit disponibil — aceeași dată pentru toate fișierele. Era să reintroduc
   tăcut exact bug-ul de `lastModified` pe care tocmai îl reparam.
6. **Verifică marcajul înainte să repari.** Într-o verificare live am confirmat „e deployat" pentru
   că am căutat un șir care exista deja în pagină de dinainte. Alege un marcaj care apare DOAR în
   codul nou.
7. **Telegram, `parse_mode: "Markdown"` (vechi): `\_` NU e escape ÎN INTERIORUL unei entități.** Un
   titlu cu „_" pus între `_..._` lasă un caracter fără pereche și API-ul respinge tot mesajul
   („can't find end of the entity starting at byte offset N" — N arată exact acel caracter). Folosește
   `HTML`: se escapează doar `< > &`, oriunde (`html.escape`). Reproduce mesajul din datele rulării și
   compară offsetul înainte să crezi o cauză.

---

## 9. Rezultatele propriilor audituri au nevoie de verificare

- **09.08:** un workflow cu agenți paraleli a găsit 21 de candidați. Trei erau **halucinații** (un
  link typo „cod-reduciere/jollymag", un link „/alte-categorii", un „Deal Score 0/100" pe eMAG) —
  nu existau. Au fost respinse după verificare cu `curl` pe producție, nu raportate ca reparate.
- **16.08:** propriul meu detector de pagini orfane a raportat 25. **13 erau false pozitive** —
  linkurile `/blog?cat=X` existau, doar regexul meu ignora URL-urile cu parametru.

**Regula:** verifică fiecare finding pe producție înainte de a-l repara. Un audit care „găsește"
lucruri inexistente e mai scump decât niciun audit, pentru că produce modificări inutile în cod real.

---

## 10. Onestitatea datelor — regresii care revin

Fabricația a fost eliminată de patru ori și a reapărut de fiecare dată în alt loc:

- 03.07: contoare random afișate ca statistici, comisionul afișat ca „cashback"
- 08.08: același comision afișat ca reducere, dar în newsletter
- 10.08: 142 de produse cu poze stock prezentate ca fiind produsul, plus 14 pretenții de testare
- 09.08: afirmația „am testat independent" reapăruse pe `/vpn`, `/hosting`, `/recomandari` după o
  rescriere ulterioară de pagină
- **07.09, mai târziu în aceeași zi: comisionul publicat ca „Cashback", a treia oară.**
  Regula „comisionul nostru NU se publică" e scrisă mai jos din 03.07 și repetată pe 08.08.
  A reapărut totuși în **două locuri noi**, ambele publice:
  - `generate_comparisons.py::_max_cashback()` → paginile `/comparatii/*`. Pe
    `surfshark-vs-hostinger` scria **LIVE „Cashback: până la 40%" și „până la 60%"**. Cifrele
    erau reale — dar erau *comisionul nostru*. Cititorul înțelege că primește el 60% înapoi.
  - `post_facebook.py::format_discount()` → același lucru, publicat pe Facebook, ca text de
    ofertă pentru orice magazin care n-avea promoție reală.

  **De ce a revenit exact la fel:** ambele erau *fallback-uri*. Nimeni nu scrie intenționat
  „afișează comisionul ca reducere"; scrie „dacă n-avem ofertă, pune ceva acolo" — și singura
  cifră la îndemână în obiectul magazinului e `comision`. Regula, ca să reziste, trebuie pusă
  nu la „ce afișăm", ci la **„ce facem când n-avem ce afișa": nimic.** Ambele funcții întorc
  acum `""` / `"—"`, iar apelantul sare elementul.

  **Regula de căutare, pentru data viitoare:** `grep` după `comision` în ORICE script care
  produce text pentru public (postări, newsletter, comparații, meta description), nu doar în
  componentele care afișează prețuri.

- **07.09: curățarea din 03.07 nu prinsese trei locuri VII.** `procent_succes`
  (`random.Random(hash(m)).randint(72,96)`) și `folosit_de` (`randint(15,800)`) erau încă folosite:
  1. `/comparator` — afișa `procent_succes` sub eticheta **„Trust Score"**, cu bară verde/roșie și
     prag 80/60. Când lipsea, cădea pe `are_promotie ? 78 : 50` — un număr inventat direct în
     componentă, deci nici măcar din date. Pagina răspunde 200, e în meniu.
  2. `/top-reduceri` — **sorta „cele mai bune coduri" după `procent_succes`**, adică ordinea era
     literal aleatorie. Seed pe hash ⇒ stabilă între rulări, deci nimeni n-avea cum să observe.
     Titlul vizibil promitea explicit „sortate după rata de succes".
  3. `/reduceri/[magazin]` — afișa toate trei semnalele; salvat doar de faptul că ruta e 308.

  Plus **patru texte** care promiteau „rata de succes" — inclusiv `/despre-noi`, la secțiunea
  numită chiar **„Statistici reale"**: „Calculăm rata de succes și contorizăm de câte ori a fost
  folosit fiecare cod, **direct din date**". Pagina care explică de ce să ai încredere în noi
  descria cel mai bine exact semnalul inventat.

  **Ce a făcut posibilă supraviețuirea:** pe 03.07 s-a curățat *afișarea* semnalului, dar câmpul a
  rămas în `output.json` și în `interface Magazin` din fiecare pagină. Un câmp care există într-un
  tip e o invitație permanentă să fie folosit — a doua oară nu ca statistică, ci ca *sortare* și ca
  *scor*, unde nu-l caută nimeni când vânează „cifre fabricate afișate".

  **Regula nouă:** când elimini un semnal fals, `grep` după **numele câmpului**, nu după textul
  afișat — și verifică cele trei forme în care poate trăi mai departe: afișat, **folosit la
  sortare**, intrat într-un **scor compus**. Ideal, scoate-l și din generator, nu doar din UI.
  `trend` e cazul-limită: e `0` hardcodat în `fetch_2p_api.py`, deci nu minte, dar face `/top-reduceri`
  să aibă o secțiune „Trending" care nu s-a randat niciodată — cod mort care arată ca funcționalitate.

- **13.09: același tipar de fallback, dar în BANI, nu în text.** `fetch_impact_api.py`, când nu
  găsea reclamă text, scria în `url_afiliat` URL-ul campaniei — site-ul normal. Magazinul părea
  „rezolvat" și ieșea din toate rapoartele. Iar pe ofertă, `landing_page or url_afiliat` punea
  pagina brută înaintea linkului plătit: **210 oferte**. **Un link fără comision care arată bun e
  cea mai scumpă formă a fallback-ului**: nu minte cititorul, minte contabilitatea.
  **Regula de căutare:** orice `X or url_afiliat` / `X || m.url` pe un link de ieșire — verifică
  dacă X are tracking. Și definiția „are link afiliat" se face pe **semnătura de tracking**
  (`link_oferta.are_tracking`), niciodată pe `url_afiliat !== url`.
- **15.09: „are tracking" nu înseamnă „duce unde trebuie".** 17+ magazine aveau linkuri Impact
  perfecte ca formă, pe campania ALTUI brand din același grup (ExpressVPN → holiday.com). Toate
  verificările căutau lipsa trackingului, niciuna destinația. Iar cauza e un câmp cu nume înșelător:
  `AdvertiserUrl` e site-ul **firmei**, `CampaignUrl` e al **brandului**. **Regula:** un link de
  ieșire se verifică pe două axe — plătește? și ajunge la magazinul de pe buton? A doua se testează
  live, nu din date.
- **Câmpurile booleene din API-uri externe vin des ca TEXT.** `bool("false")` e `True`. Prins doar
  pentru că numărul tipărit („535 din 535 permise") contrazicea o numărătoare făcută înainte.

**Reguli stabilite:**
- nu se afișează niciodată o cifră pe care nu o putem susține din date reale;
- unde eșantionul e prea mic, se scrie explicit **„date insuficiente"** — nu se publică o cifră care
  pare măsurătoare (vezi pragul din `generate_studiu_cupoane.py` și din `statisticiMagazin.ts`);
- comisionul nostru NU se publică — e ce câștigăm noi, nu o măsură a ofertei pentru cumpărător;
- `AggregateRating` NU se reintroduce fabricat, oricât ar avea concurența stele în Google;
- **verifică periodic** că fix-urile de onestitate nu au revenit la o rescriere ulterioară.

---

### 22.09.2026 — a cincea oară, și de data asta curățarea parțială a fost mai rea decât nimic

`procent_succes` / `folosit_de` (random pur) au fost scoase din **afișare** pe 03.07 și din
**generatorul 2Performant** pe 07.09. Pe 22.09 erau din nou pe **578 de magazine**. Cauza nu a fost
o rescriere neglijentă, ci două lucruri structurale:

1. **Curățarea a atins un generator dintr-o familie de șapte.** `import_csv_promotii.py` genera
   `randint(15, 800)` la **fiecare rulare de pipeline**; alte cinci importatoare scriau constante
   (`80`, `85`); `data/extra_merchants.json` — fișier versionat, intrare *și* ieșire — le păstra pe
   604 din 615 magazine din 2026. Un `grep` după numele funcției curățate nu le-ar fi găsit pe
   niciuna: scriau literalul direct în dict.

2. **Curățarea parțială a inversat sensul filtrelor.** Patru canale de promovare filtrau
   `m.get("procent_succes", 0) >= 50`. Cât timp toate magazinele aveau câmpul (72–96), filtrul era
   decorativ — trecea mereu. După curățarea parțială, magazinele **curate** cădeau pe valoarea
   implicită `0` și erau **excluse**. Măsurat pe datele zilei: **16 din 65 de magazine cu ofertă
   reală**, toate românești (otter.ro, regata.ro, labelshop.ro, craftup.ro), nu mai ajungeau în
   niciun canal de promovare. Plus `scor_comercianti.py`, unde `folosit_de / 500` era **14% din
   scorul fiecărui comerciant**, pur zgomot.

**Regula care lipsea:** un câmp fabricat nu se scoate dintr-un generator, se scoate din **gâtuitura**
prin care trece totul. `scripts/campuri_interzise.py` e apelat de `merge_platforms.py` — pasul final
prin care trece orice importator, vechi sau nou. Același tipar ca `promotii.curata_promotii()` și
`link_oferta.link_potrivit()`. La prima rulare a scos **1.156 de valori**.

**Regula a doua, despre curățare parțială:** când scoți un câmp, caută întâi cine îl **citește cu
valoare implicită** (`.get(camp, 0)`). Un consumator cu implicit tăcut transformă absența câmpului
într-o valoare care înseamnă altceva. Nu curăța sursa înainte de a curăța consumatorii — altfel
datele oneste devin cetățeni de clasa a doua.

**Cum a fost prinsă:** de garda `scripts/verifica_site.py`, la **prima ei rulare pe date reale**.
Trei luni în care nimic nu se uita la date ca întreg, versus 10 secunde.

### 05.10.2026 — a șasea oară: în COD și în TEXT, nu în date

Măsurat în Vercel Analytics: paginile cu vizitatori din căutări sunt `/top/*` și articolele „Cel mai
bun X”. Exact pe ele, afirmațiile false stăteau scrise de mână:
- `/top/[slug]`: secțiunea „Cum testăm” — „Fiecare produs este testat timp de minim 2 săptămâni în
  condiții reale de utilizare” — și FAQ-ul „Topul nostru include doar modele testate și verificate de
  echipa AmCupon.ro”. Reparația din 10.08 curățase **datele** (`fix_top_onestitate.py`); textul din
  `page.tsx` a rămas. **O curățare de date nu atinge textul din cod** — se caută în ambele.
- **„verificat”** în peste 100 de locuri (după sweep-ul din 22.09): `/radar` „ales și verificat de
  noi”, `/contact` „verificăm fiecare promoție înainte de publicare”, insigna „VERIFICAT” pe `/produse`,
  „verificat și funcțional” în **toate** cele 147 de articole de magazin, „testate și verificate” în
  generatorul evergreen. Sweep-ul din 22.09 căutase „verificate zilnic” — o formă din zece.
- „1000+ magazine” scris de mână în 11 fișiere (erau 957), „Profitshare” listat ca rețea pe `/contact`
  la șapte săptămâni după excludere, „Rată de succes afișată” pe `/despre-noi` (regex-ul gărzii cerea
  „rată **de** succes”).

**Reguli noi:** (1) o cifră sau un nume de magazin din text se **calculează** (`lib/cifreSite.ts`);
(2) garda `verifica_site.py --html` are acum trei reguli pe textul paginii (pretenție de testare,
„verificat” despre coduri/oferte, număr de magazine scris de mână) — negațiile („Nu le-am testat”) și
indicațiile pentru cititor („verifică pe site”) trec; (3) după orice sweep de formulări, `grep` pe
**rădăcina** cuvântului (`verific`), nu pe expresia exactă.

### 06.10.2026 — a șaptea, a doua zi după sweep: regula (3) n-a fost aplicată pe markdown

La push, garda a prins un link 404 într-un articol de magazin; deschizându-l, am găsit în **toate cele 147**
„AmCupon.ro verifica **zilnic** validitatea fiecarui cod. Nu afisam niciodata coduri expirate”, un buton
„Raporteaza cod” și o etichetă „Reducere automata” care nu există, „Codul ... este valid în momentul în care
îl accesați”, „Ofertă exclusivă — nu o găsești în altă parte” și reduceri inventate („70-80%”). Plus un
`<!-- comentariu -->` intern în conținut, afișat ca TEXT. Sweep-ul de ieri le ratase din două motive:
`**zilnic**` rupea orice regex scris pe text simplu, iar garda căuta „verificăm”, nu „verifică”.
**Reguli:** (1) regexurile de gardă tolerează marcajul dintre cuvinte (`**`, `<strong>`); (2) garda rulează
și în CI, pe `blog-posts.json`, nu doar local pe HTML; (3) un șablon se citește INTEGRAL, propoziție cu
propoziție, întrebând „e adevărat pentru ORICE magazin?” — nu se caută doar cuvintele deja cunoscute;
(4) comentariile despre cod stau în cod, nu în șirul de text care ajunge pe pagină.

### 07.10.2026 — a opta: paginile scrise de mână în iunie (recomandări, servicii, financiar)

Sweep-urile de până acum trecuseră prin date, generatoare și șabloane; paginile editoriale scrise de mână
(o singură dată, în iunie) nu le citise nimeni integral. Găsite pe 12 pagini: **comisionul nostru afișat
cumpărătorului** (/cursuri-online de 44 de ori — grila lua TOATĂ categoria software și scria „Appsumo 100%
comision”; /servicii „200$ per vanzare”, „150$ CPA”; insigna „Cel mai mare comision”; „Program afiliere: …”
sub butoane), note „9.8/10” fără metodologie, prețuri din iunie prezentate ca actuale (ExpressVPN „6.67€”
= prețul vechi în USD pe 15 luni), fapte expirate sau false (XTB „reglementat BNR + CNVM” — CNVM nu mai
există din 2013; cardul Binance retras în SEE; „NordVPN Teams” redenumit NordLayer în 2021; N26 recomandat
românilor, deși N26 nu deschide conturi rezidenților din România), „bonus la înregistrare” pe linkuri care
nu sunt de recomandare, trei butoane spre 404 (Shopify, Coursera, Bitdefender) și secțiuni de produse care
arătau orice vindea magazinul (pe /laptop: o roată de abdomene și plăcuțe de frână).
**Reguli:** (1) o pagină scrisă de mână nu primește preț, notă, număr de servere/utilizatori sau dobândă
fără o sursă care se actualizează singură — se scrie modelul („prețul crește la reînnoire”), nu cifra;
(2) o grilă de produse sub un titlu de nișă trece prin regula temei (`lib/topFeed.ts`) sau printr-un filtru
pe tipul produsului — fără potrivire, secțiunea nu apare; (3) garda are reguli pentru comision publicat și
pentru șablonul de link Impact `…/c/<cont>/1/0` (dovedite pe text injectat).

### 07.10.2026 — a noua, în aceeași zi: ce pare un preț, ce pare un cod, ce pare al magazinului

Trei regresii cu aceeași rădăcină — un câmp „completat” dintr-o sursă care nu-l conține:
**(1)** `enrich_products_from_promos.py` lua primul număr cu „lei” din textul promoției drept preț
(„de minimum 149 lei” = pragul comenzii) și **calcula** „prețul vechi” din procent (149 / 0,8 = 186,25 lei) —
un preț tăiat pe care magazinul nu l-a scris nicăieri. **(2)** Grila de pe pagina de magazin alegea produsele
pe subșir (tiparul #1, a cincea oară): la `ro.roborock.com` primul label e „ro”, deci 39 de pagini arătau
produsele altor magazine, iar statisticile „Ce prețuri are X” se calculau din ele. **(3)** Codul: pe 7 tipuri
de pagini se vedea întreg, fără clic pe linkul plătit, iar „Copiază și mergi” nu copia nimic.
**Reguli:** o promoție nu are preț de produs; potrivirea produs→magazin e EXACTĂ și are test cu invariantul
„un produs pe o singură pagină” (`lib/produseMagazin.test.mjs`, pică pe varianta veche); codul apare întreg
doar după clicul care deschide linkul plătit — oriunde altundeva, `maskCod` sau `CuponInteractiv`, iar
garda caută codurile active în textul articolelor. Și: când schimbi cheia unui istoric (codul intră în cheie),
unește intrările vechi, altfel aceeași ofertă apare de două ori — o dată ca „trecută”.

## 11. Măsoară înainte să tai, și înainte să repari

- **08.08:** două secțiuni de homepage păreau redundante. Măsurate: suprapunere **zero**, seturi
  complet diferite de magazine. N-au fost tăiate.
- **14.08:** înainte de a schimba filtrele de categorie, am verificat că fix-ul **umple** paginile,
  nu le golește (`/bijuterii` 2 → 12, `/supermarket` 2 → 11).
- **16.08:** înainte de a deschide la indexare cele 1.075 de pagini `noindex`, am măsurat cât de
  unice sunt: **77–89% identice** între ele. Decizia veche de a le ține închise a rămas în picioare.

---

## 12. Ce am aflat despre nișă (corecții la presupuneri greșite)

- **„Un site nou nu poate prinde «cod reducere X»" e FALS.** Doar eMAG e greu (KD 34). Restul nișei
  e KD 6–16, cu volum real. **Paginile de magazin sunt activul principal.**
- **„Avem zero backlink-uri" e FALS.** 83 linkuri / 68 domenii. Iar concurentul cu ~350k vizite/lună
  se ține pe **~5 linkuri editoriale reale** — bara e mult mai joasă decât pare.
- **Structura concurentului**, măsurată pe sitemap-ul lui: **998 de pagini de magazin și exact 4
  alte pagini.** Zero blog, zero categorii, zero topuri. Noi avem 514 articole de blog și ~90 de
  pagini de categorii/nișe. Efortul e împrăștiat exact invers față de singurul concurent care chiar
  are trafic.
- **Q&A/FAQ ca strategie de conținut nu merge în română** — întrebările au volum ~0, spre deosebire
  de engleză. (Asta nu contrazice punctul 7: FAQ-ul de pe pagina de magazin e acolo pentru
  conformitate cu schema, nu ca pariu de trafic.)
- **Google NU participă la IndexNow.** Bing/Yandex da. Pentru Google rămân sitemap.xml + „Request
  Indexing" manual din GSC.

---

## 13. Limite de cont, nu de cod

Trei API-uri au fost integrate corect și tot nu produc date, din motive care nu țin de cod. Merită
recunoscute rapid, ca să nu se piardă zile pe depanare:

| API | Simptom | Realitate |
|---|---|---|
| Impact.com Deals/PromoCodes | 403 Forbidden | contul are acces la `/Campaigns`, nu la conținut promoțional |
| Profitshare `affiliate-products` | se oprește după ~10 pagini din 17.220 raportate | limită de acces a contului; nu e rate limit (testat cu pauze mari) |
| feed combinat 2Performant | HTML în loc de XML, doar din CI | blocat pe IP de datacenter; local merge |

**Regula:** când un API răspunde dar nu livrează, verifică întâi dacă e limită de plan/cont înainte
să rescrii codul. Toate trei au fost confirmate prin workflow-uri manuale (`workflow_dispatch`,
`--dry-run`) care folosesc secretele existente fără ca cineva să le vadă.

## 14. Linkuri spre pagini care nu există (și ce arată „bine” fără să fie)

A șasea apariție pe 05.10.2026, de data asta pe paginile care chiar au trafic:
- 16.08 `/categorii/telecom`, 21.08 `/pcmadd` și `/cod-reducere/bookzone.ro` (din subsol, pe toate paginile),
  08.08 altex/flanco/elefant — reparate de fiecare dată **în locul găsit**, nu în clasa de bug.
- 05.10: pe toate cele 30 de pagini `/top`, „Caută preț” ducea la `/cod-reducere/emag.ro` (redirect spre
  `/categorii/marketplace`) și 12 butoane de magazin dădeau 404; în articolele „Cel mai bun X”, **147 de
  linkuri** spre magazine care nu sunt pe site, în 53 de articole; patru pagini de brand (Temu, Shein,
  Trendyol, Banggood) își declarau `canonical` către un 404.

**De ce a revenit:** linkul se construiește din **numele magazinului scris în cod** (`/cod-reducere/${slug}`),
iar pagina există doar dacă magazinul e în `output.json`. Magazinele ies din date (Profitshare exclus,
program închis), codul rămâne. Iar fișierele care **doar adaugă** (`generate_product_tops.py`,
`generate_best_of.py`) nu șterg niciodată ce nu mai e adevărat — tiparul #5, altă formă.

**Regula:** (1) un link intern către o pagină generată din date se construiește doar după ce verifici
că elementul e în date (`lib/linkPlatit.ts`, `lib/oferteTema.ts`); (2) garda `verifica_site.py --html`
verifică acum **toate** linkurile interne `/cod-reducere|top|categorii|comparatii|cadouri|esim|nisa|produse/*`
contra paginilor generate (404 = blochează) și numără separat pe cele prin redirect; (3) textul care stă
în fișiere intrare-ieșire trece la fiecare rulare printr-o poartă (`scripts/curata_articole.py`), nu
printr-o reparație o singură dată.

## 15. Limitele de deploy cresc odată cu datele, nu cu codul

**06.10.2026.** Toate deploy-urile Vercel ale zilei au picat cu „The Vercel Function "blog" is
258.85mb uncompressed which exceeds the maximum ... 250mb", iar site-ul a rămas pe versiunea de ieri
fără să se înroșească nimic în pipeline (GitHub Actions doar face push; build-ul pică la Vercel).
Cauza nu era codul zilei: paginile citesc JSON-uri din `public/` cu `path.join(process.cwd(), "public",
fisier)`, tracer-ul Next nu poate ști care fișier, deci include **tot** `public/` în fiecare funcție
dinamică — 2.306 fișiere, din care 218 MB de coperți PNG de articol. Fiecare articol nou adăuga o
copertă; ziua în care s-a trecut de 250 MB a fost doar ziua în care s-a văzut.
**Regula:** (1) `outputFileTracingExcludes` în `next.config.ts` ține imaginile și media în afara
funcțiilor (le servește CDN-ul); (2) după un push, verifică starea deploy-ului (`get_deployment` →
`errorMessage`), nu doar build-ul local — `next build` local NU aplică limita Vercel; (3) orice
folder care crește zilnic în `public/` e o limită care se va atinge: măsoară-l
(`.next/server/**/*.nft.json`) înainte să devină o pană.
