# Drumul de la zero — ce se construiește, în ce ordine, și de ce

> Scris 22.08.2026, pe cifre măsurate în ziua aia, nu pe estimări.
> Răspunde la două întrebări puse de Alex: „vreau site-ul top 1000 în lume, și ca design"
> și „vreau să lansez peste 100 de site-uri din care să fac trafic".

---

## 1. Unde suntem, măsurat

Semrush, baza `ro`, 22.08.2026:

| | Semrush Rank | Cuvinte cheie | Trafic organic/lună |
|---|---|---|---|
| **cuponeria.ro** | 929 | 3.973 | **97.033** |
| **cuponescu.ro** | 3.032 | 586 | **23.296** |
| **amcupon.ro** | **1.369.061** | **3** | **0** |

Search Console, aceeași zi, ultimele 3 luni: **22 de clicuri, 229 de expuneri, 64 de pagini
indexate, 13 pagini accesate vreodată de Google.**

Trei cuvinte cheie. Nu „trafic mic" — **zero**.

---

## 2. De ce designul nu e pârghia acum

Site-ul are deja mai multe funcții decât ambii competitori, verificat pe cod și live:

| | amcupon.ro | cuponescu.ro | cuponeria.ro |
|---|---|---|---|
| Căutare globală Cmd+K | ✅ | ❌ | ❌ |
| Vot comunitar pe cupoane | ✅ (Supabase, rate-limit real) | ❌ | ❌ |
| Filtre instant pe categorii | ✅ | ❌ | ❌ |
| Sitemap 100% URL-uri 200 | ✅ (463/463) | — | — |
| Studiu pe date proprii | ✅ | ❌ | ❌ |
| **Trafic organic** | **0** | **23.296** | **97.033** |

**Un design perfect arătat la nimeni valorează cât un design prost arătat la nimeni.**
Designul devine diferențiator când există trafic care să-l vadă — la 10.000 de vizite pe lună
decide cine convertește mai bine. La zero, nu decide nimic.

**Excepția, și de-aia contează totuși:** paginile pe care aterizează un *jurnalist* sau un
*partener*. Alea sunt puține (studiul, /despre-noi, homepage) și trebuie să fie impecabile,
pentru că acolo designul chiar schimbă o decizie — a lui, nu a lui Google.

---

## 3. Aritmetica celor 100 de site-uri

Un site: 5 luni de muncă · 1.156 magazine · pipeline complet automat · 500 de articole
→ **3 cuvinte cheie, 0 trafic.**

O sută de copii ale lui → **300 de cuvinte cheie, 0 trafic.**

**100 × 0 = 0.**

Nu pentru că ideea de rețea de site-uri e greșită — e în PLAN-MASTER și e o strategie
legitimă. Ci pentru că **replici un model care funcționează, nu unul care încă n-a funcționat.**
Fiecare din cele 100 ar avea exact aceeași problemă ca originalul: zero autoritate, zero
linkuri, zero motiv pentru Google să-l crawleze.

### Și un risc care nu e teoretic

100 de site-uri subțiri care își dau linkuri între ele **este** definiția unui PBN. Politica
Google de link spam vizează exact tiparul ăsta — „link schemes", rețele construite ca să
manipuleze PageRank. Nu doar că n-ar aduce trafic; ar putea costa domeniile, inclusiv pe cel
principal, dacă e legat de rețea.

Legătura între site-uri e utilă **doar** când fiecare are audiență proprie și linkul e
justificat editorial. Adică exact invers față de „100 de clone care se linkuiesc".

---

## 4. Ordinea corectă

```
FAZA 1 (acum)      un singur site, de la 0 la ~20.000 vizite/lună
                   ↓ dovada că modelul funcționează
FAZA 2             al doilea site, nișă COMPLET diferită, audiență proprie
                   ↓ dovada că modelul e replicabil, nu noroc
FAZA 3             replicare în serie, cu ce ai învățat din primele două
```

Pragul dintre Faza 1 și Faza 2 nu e o dată. E o cifră: **primul site trebuie să treacă de
cuponescu.ro (23.296 vizite/lună)**. Sub asta, n-avem un model, avem o speranță.

---

## 5. Ce mută acul în Faza 1, în ordinea impactului

### 5.1. Un link editorial real — cel mai important lucru din tot documentul

`cuponescu.ro` are 23.000 de vizite pe lună și se ține pe **~5 linkuri editoriale
românești**: retail.ro (AS 34), startupcafe.ro (AS 45), carturesti.ro (AS 55),
euplatesc.ro (AS 35). Restul profilului lor sunt directoare și PBN-uri, care nu-i țin sus.

**Bara e mult mai joasă decât pare.** Nu-ți trebuie 500 de linkuri. Îți trebuie 5 reale.

Ce a funcționat la ei: un studiu pe date proprii, preluat cu link. **Noi avem deja studiul**,
și cu o cifră mai bună decât a lor: 1,6% — un site de cupoane care spune că aproape nu există
cupoane. Vezi `docs/operational/PITCH-PRESA.md` pentru mesajele gata de trimis.

### 5.2. Cele 7 magazine cu cerere dovedită

Google ne arată deja în rezultate pentru dedeman, luxury beauty, color cosmetics, dalisticq,
ginsari, orisee, olfactiv — și **nu le avem**. Iar competitorii le au. Două semnale
independente pe același brand. Detalii: `docs/operational/CERERE-REALA-GSC-22-08-2026.md`.

### 5.3. Coada lungă de magazine mici

Din interogările reale GSC: aproape tot ce ne aduce expuneri e
„cod reducere \<magazin mic românesc\>". Nimeni nu ne caută pentru eMAG. Pe un domeniu fără
autoritate, **acolo se poate câștiga** — pentru că nimeni nu optimizează pentru „cod reducere
ginsari".

Constrângerea: 958 din 1.156 de pagini de magazin sunt `noindex`, pentru că n-au conținut
propriu. Pârghia nu e să le deschidem (ar reintroduce thin content, măsurat pe 16.08: două
pagini subțiri sunt 77-89% identice), ci **să le dăm conținut real**. Sursele posibile, în
ordinea efortului: mai multe feed-uri de produse în 2Performant „My Feeds" → mai multe
promoții din exporturi → conținut editorial pe magazinele cu cerere dovedită.

### 5.4. Ce NU merită acum

- **Redesign general.** Vezi secțiunea 2.
- **Tool-uri SEO plătite.** Cost minim până curg venituri.
- **Optimizări de CTR pe titluri.** Verificat 22.08: la 46-52 de expuneri pe pagină,
  diferența dintre 0 și 2 clicuri e zgomot statistic.
- **Site-uri noi.** Vezi secțiunea 3.

---

## 6. Cum arată succesul, pe etape

| Etapă | Semnal măsurabil | De unde se citește |
|---|---|---|
| Google ne cunoaște | pagini indexate **64 → 300+** | GSC → Indexare → Pagini |
| Avem autoritate minimă | **primul link editorial** | Semrush → Backlinks |
| Modelul funcționează | **1.000 vizite/lună** | Semrush / GA4 |
| Prag pentru Faza 2 | **23.000 vizite/lună** | idem |

Prima etapă e chestiune de săptămâni și depinde de sitemap-ul retrimis pe 22.08.
A doua depinde exclusiv de acțiuni manuale — nu se poate scrie cod care să obțină un link
editorial.

---

## 7. Ce rămâne adevărat din viziunea inițială

Nimic din documentul ăsta nu contrazice PLAN-MASTER. Rețeaua de site-uri rămâne obiectivul.
Se schimbă doar **momentul**: după ce unul funcționează, nu în loc de.

Iar partea de design rămâne, doar că țintită — paginile pe care aterizează oameni care iau
decizii despre noi, nu toate cele 3.000.
