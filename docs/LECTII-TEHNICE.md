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
> Ultima actualizare: 16.08.2026.

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
**4 valuri**, la săptămâni distanță — de fiecare dată credeam că le-am prins pe toate.

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

**Regula:** o listă folosită în două locuri se **exportă dintr-unul și se importă în celălalt**.
Nu se copiază, oricât de mică e.

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

**Regula:** într-un fișier care e și intrare și ieșire, orice eroare devine permanentă. Trebuie
prevăzut explicit un mecanism de corecție care bate datele existente.

---

## 6. Paginare: nu presupune că API-ul respectă `per_page`

**Găsit de două ori, în două scripturi, cu exact aceeași cauză.**

API-ul 2Performant **capează la 20 de elemente pe pagină și ignoră `per_page`**. Codul cerea 50 sau
100 și se oprea cu `if len(items) < per_page: break` — primea 20, 20 < 50, deci se oprea după prima
pagină.

- 30.06: `/affiliate/programs.json` → aducea 20 din 600 de programe
- 16.08: `fetch_product_feeds.py` → fix 20 de produse din fiecare feed. **Dovada în date, nu
  deducție: din 86 de magazine, 20 aveau EXACT 20 de produse.**

**Regula:** oprește-te pe `metadata.pagination.pages` (numărul real de pagini). Rezervă pe
`len(items) == 0` doar când lipsește metadata. **Niciodată pe `len(items) < per_page`.**

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

Fabricația a fost eliminată de trei ori și a reapărut de fiecare dată în alt loc:

- 03.07: contoare random afișate ca statistici, comisionul afișat ca „cashback"
- 08.08: același comision afișat ca reducere, dar în newsletter
- 10.08: 142 de produse cu poze stock prezentate ca fiind produsul, plus 14 pretenții de testare
- 09.08: afirmația „am testat independent" reapăruse pe `/vpn`, `/hosting`, `/recomandari` după o
  rescriere ulterioară de pagină

**Reguli stabilite:**
- nu se afișează niciodată o cifră pe care nu o putem susține din date reale;
- unde eșantionul e prea mic, se scrie explicit **„date insuficiente"** — nu se publică o cifră care
  pare măsurătoare (vezi pragul din `generate_studiu_cupoane.py` și din `statisticiMagazin.ts`);
- comisionul nostru NU se publică — e ce câștigăm noi, nu o măsură a ofertei pentru cumpărător;
- `AggregateRating` NU se reintroduce fabricat, oricât ar avea concurența stele în Google;
- **verifică periodic** că fix-urile de onestitate nu au revenit la o rescriere ulterioară.

---

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
