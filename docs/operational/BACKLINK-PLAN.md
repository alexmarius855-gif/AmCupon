# 🔗 Plan Backlink-uri AmCupon.ro

> **Actualizat 22.08.2026** cu date reale din Search Console. Versiunea din iulie conținea
> cifre vechi (1055 magazine, 78 cu ofertă) și menționa Profitshare — cont respins pe 19.08.
> Textul de înscriere de mai jos era, la data asta, parțial fals.

---

## De ce contează mai mult decât orice altceva

Măsurat pe 22.08.2026, din exportul GSC:

| | |
|---|---|
| Pagini indexate | **64** |
| Clicuri din Google, în 3 luni | **22** |
| Pagini pe care Google le-a accesat vreodată | **13** |
| Backlink-uri externe | **0** (în afară de AlexMarinescu.ro) |

Partea tehnică e rezolvată: sitemap 463 URL-uri, toate 200, citit de Google pe 22.08.
Nu mai există niciun 404 în sitemap, niciun redirect trimis la indexare, nicio pagină goală.

**Ce lipsește nu e cod. E ca Google să aibă un motiv să ne crawleze.** Un domeniu fără
niciun link extern nu primește buget de crawl, indiferent cât de curat e.

---

## A. Directoare românești — zero cost, ~45 min, azi

Înscriere directă, fără aprobare complexă.

- [ ] [web-trafic.ro](https://web-trafic.ro)
- [x] **[linkpro.ro](https://linkpro.ro) — ARTICOL TRIMIS 22.08.2026.** Listare gratuită,
      deci link **nofollow**. Titlu: „Cate magazine online din Romania au cu adevarat un cod
      de reducere activ?", URL către pagina de studiu, imagine generată cu
      `scripts/generate_imagine_articol.py`.
      **LISTARE SITE trimisă tot pe 22.08** (descriere diferită de a articolului — formularul
      avertizează „Nu adaugati acelasi site de mai multe ori", iar conținut duplicat între două
      listări pe același domeniu le devalorizează pe amândouă).
      **Rămas: „Adaugă Comunicat gratuit"** — textul e gata în `TEXTE-DIRECTOARE.md`.
      *Ambele opțiuni plătite (35 lei la articol, 25 lei la site) și „listarea reciprocă"
      au fost respinse deliberat — vezi nota de la finalul secțiunii.*
- [ ] [dirpedia.ro](https://www.dirpedia.ro/directoare-generale.html) — verifică 5-10 din listă
- [ ] [PROMOdesk — 70 de directoare românești](https://www.promodesk.ro/directoare-web/lista-directoare-web-romanesti)
      — primele 10-15 cu trafic real, sari peste cele moarte

### Text de înscriere — verificat 22.08.2026, copy-paste direct

```
Nume site: AmCupon.ro
URL: https://amcupon.ro
Categorie: Cupoane și reduceri / E-commerce

Descriere scurtă (50 car.):
Coduri de reducere verificate zilnic din România

Descriere lungă:
AmCupon.ro este o platformă românească de coduri de reducere și oferte
verificate zilnic, cu peste 1150 de magazine partenere prin rețelele
2Performant, Impact.com și Awin. Datele se actualizează automat de trei
ori pe zi. Gratuit, fără cont necesar și fără reclame invazive.

Cuvinte cheie: coduri reducere, cupoane, oferte, discount, promotii, romania
Email contact: alexmarius855@gmail.com
```

> **Ce s-a schimbat față de versiunea veche:** „1000+" → 1150; s-a scos **Profitshare**
> (cont respins 19.08) și s-au adăugat **Impact.com** și **Awin**, care sunt rețelele reale
> de azi; „la fiecare 4 ore" → „de trei ori pe zi", care e ritmul adevărat al pipeline-ului.
> Un director care verifică și găsește o afirmație falsă respinge înscrierea.

> **De ce nu cumpărăm linkuri dofollow din directoare.** Două motive, ambele verificate:
> (1) e exact clasa de link pe care Google o devalorizează — `cuponescu.ro`, cu ~350k vizite/lună,
> se ține pe **~5 linkuri editoriale reale** (retail.ro, startupcafe.ro, carturesti.ro,
> euplatesc.ro), nu pe directoare; (2) un dofollow **plătit** încalcă politica Google de link spam
> — linkurile cumpărate trebuie marcate `nofollow` sau `sponsored`. Cine vinde dofollow pe 35 de lei
> vinde ceva ce n-ar trebui să vândă.
>
> Nofollow-ul gratuit rămâne util: din 2019 Google tratează `nofollow` ca **sugestie**, nu ordin,
> deci tot crawlează linkul, iar un profil 100% dofollow arată nenatural.
>
> **A treia variantă, apărută abia la formularul de site: „listare reciprocă dofollow"** — primești
> dofollow dacă pui tu un link dofollow către director pe amcupon.ro. Respinsă, și nu în principal
> pentru că schimburile de linkuri sunt numite explicit în politica Google. Motivul practic e mai
> simplu: **dai mai mult decât primești.** Linkurile pe care le dai TU spun lui Google în ce companie
> stă site-ul tău — a trimite autoritate către un director de linkuri e un semnal mai prost decât e
> de bun linkul primit înapoi. Plus clutter pe un site care trebuie să rămână curat.

---

## B. Pinterest — cel mai mare payoff pe termen mediu

Cuponeria.ro (liderul, ~350k vizite/lună) face asta masiv. Fiecare pin = backlink + trafic
direct. Nu necesită cod.

- [ ] Cont Pinterest Business `AmCupon.ro`
- [ ] Board-uri, alese după categoriile care CHIAR au oferte acum (nu după intuiție):
      **Fashion** (14 oferte) · **Casă & Grădină** (21) · **Sănătate & Farmacie** (16) ·
      **Beauty** (8) · **Cadouri sub 100 lei** (pagina există deja)
- [ ] Ritm: 3-5 pin-uri/săptămână, link direct spre `/cod-reducere/[magazin]`
- [ ] Pot genera titluri + descrieri în bloc, ca la `postari-zilnice.txt` — cere-mi

> **Nu face board „Coduri Reducere eMAG"** (era în planul vechi). eMAG e Profitshare,
> cont respins — n-avem nici pagină, nici comision. Un board care duce în gol strică
> și contul de Pinterest, și încrederea.

---

## C. Rețele de afiliere — dublu efect (venit + prezență)

- [x] **Awin** — ✅ terminat. 57 de magazine importate (16.07 și 19.08).
- [ ] **CJ (Commission Junction)** — **blocat pe un singur lucru**: PID-ul contului
      (Cont → Website/Property ID). Cu el, 111 advertiseri intră în site. 2 minute de lucru.
- [ ] **Temu** — aplică direct la `temu.com/affiliate_recruit.html`. Are pagină pe site,
      dar linkul nu e afiliat (money-leak pe un brand căutat).
- [ ] **TradeDoubler** — cont nou. `cuponescu.ro` (liderul) o folosește, noi n-o avem deloc.

---

## D. Magazine cu cerere DOVEDITĂ — nou, 22.08

Din Search Console: Google ne arată deja în rezultate pentru magazinele astea, dar **nu le
avem**. Iar competitorii le au. Două semnale independente pe același brand.

- [ ] **dedeman** — „cod reducere dedeman", „cupoane dedeman"
- [ ] **luxury beauty** — 8 expuneri pe 2 variante de interogare
- [ ] **color cosmetics** — poziția 17
- [ ] **dalisticq** — poziția 11
- [ ] **ginsari** — poziția 19
- [ ] **orisee** — poziția 33
- [ ] **olfactiv** — poziția 78

Detaliile complete: `docs/operational/CERERE-REALA-GSC-22-08-2026.md`.

---

## E. Organic, lent, dar real

- [ ] **Reddit r/Romania** — răspunsuri genuine, link doar când e relevant. Spam = ban.
- [ ] **Link din bio Instagram** @alexmarinescu98 (15k) — verifică dacă e acolo
- [x] **Cross-link AlexMarinescu.ro → AmCupon.ro** — ✅ dofollow, 4 locuri (footer,
      /despre, /proiecte, /link). Verificat 12.07.2026.

---

## Ce NU merită timp acum

- **Tool-uri SEO plătite** (Ahrefs, Surfer) — cost minim până curg venituri.
- **Guest posting la bloguri mari** — necesită relații pe care nu le ai încă.
- **Optimizări de CTR pe titluri.** Am verificat pe 22.08: la 46-52 de expuneri pe pagină,
  diferența dintre 0 și 2 clicuri e zgomot statistic, nu un defect de titlu. Revenim la asta
  când avem volum destul cât să însemne ceva.

---

## Progres

**12.07.2026** — plan creat; cross-link AlexMarinescu.ro confirmat activ.
**22.08.2026** — **primele două backlink-uri trimise** (articol + listare site pe linkpro.ro, nofollow). Awin bifat (57 magazine). Text de înscriere corectat (conținea Profitshare
și cifre vechi). Adăugată secțiunea D din date Search Console. Notat de ce board-ul eMAG
din planul vechi nu trebuie făcut.

**Bifate: 4 din 20.** Asta e, în continuare, cel mai important număr din tot proiectul.
