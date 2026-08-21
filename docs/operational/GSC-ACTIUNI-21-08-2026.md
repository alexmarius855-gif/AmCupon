# Google Search Console — ce arată datele și ce ai de făcut

> Sursă: exporturile trimise de Alex pe 21.08.2026 (Coverage + HTTPS).
> Atenție la dată: graficele se opresc pe **17-19.08**, deci **nu conțin încă** efectul
> muncii din 19-21.08 (sitemap 355→457, pagini indexabile 82→198, Profitshare scos).

## Cifrele, fără ambalaj

| | Valoare |
|---|---|
| Pagini indexate | **64** |
| Pagini neindexate | 37 (din care **35 sunt 404**) |
| Expuneri în Google | **0-3 pe zi** |
| Pagini pe care Google le-a accesat vreodată | **13** |
| Ultima citire a sitemap-ului real | **6 iulie** (acum 46 de zile) |

Cele 13 pagini pe care Google le vizitează, cu ultima accesare:

```
18.08  /                          27.07  /farmacie
12.08  /categorii/fashion         26.07  /produse
11.08  /categorii/beauty          26.07  /casa
01.08  /oferte-azi                21.07  /calatorie
30.07  /sport                     19.07  /cod-reducere/vidaxl.ro
27.07  /cod-reducere/noriel.ro    16.07  /animale
                                  04.07  /petmax
```

Homepage-ul e singura pagină vizitată des. Restul site-ului — iulie.
**Google practic nu ne cunoaște.** Nu e o problemă de conținut: e lipsa de autoritate
(0 backlink-uri) plus blocajele tehnice de mai jos.

---

## Ce am reparat eu (gata, în producție)

1. **29 de adrese vechi de categorie dădeau 404 din iulie.** Slugurile de dinainte de
   commit `b048300` (jumătate în engleză: `pet-supplies`, `electronics-itc`,
   `health-personal-care`…). Toate au acum 301 către echivalentul real. Astea sunt
   aproape sigur majoritatea celor 35 de 404-uri raportate.
2. **7 URL-uri din sitemap răspundeau cu redirect** (308) în loc de 200. Scoase.
   Lista de redirecturi e acum o singură sursă citită și de `next.config.ts` și de
   `sitemap.ts` — nu mai pot diverge.
3. **4 magazine bune redirecționate din greșeală de mine pe 19.08** (libris.ro,
   vegis.ro, pint.ro, pcmadd.com — 2Performant, comision 8%, promoții active).
   Repuse în funcțiune.
4. **Homepage-ul linka către 4 pagini moarte** — cele mai crawl-ate linkuri de pe site.

---

## Ce trebuie să faci TU (eu n-am acces la GSC)

### 1. Șterge sitemap-urile false — 5 minute

Cineva a trimis, pe **20 iunie**, zeci de pagini normale ca și cum ar fi sitemap-uri:
`/blog`, `/vpn`, `/frumusete`, `/oferte-azi`, `/idei-cadouri`, `/categorii/fashion`,
`/cod-reducere/carturesti.ro`, `/cod-reducere/depox.ro` etc.

Am verificat: toate sunt pagini normale, care răspund 200. Nu sunt XML, deci Google le
marchează „O eroare" / tip „Necunoscut" și returnează 0 pagini descoperite. Le reîncearcă
și azi, două luni mai târziu.

**Sitemap-uri → pentru fiecare rând cu tipul „Necunoscut" → meniul ⋮ → „Elimină sitemapul".**
Singurul rând care trebuie să rămână e `/sitemap.xml`, tip „Sitemap".

> Nu pot demonstra că astea au împiedicat citirea sitemap-ului real. Dar sunt greșite
> fără discuție, poluează raportul până la a-l face inutilizabil, și curățarea nu are
> niciun risc.

### 2. Retrimite `/sitemap.xml` — 1 minut

A fost citit ultima oară pe **6 iulie**, când avea 1.519 URL-uri. Azi are 457, complet
altele. Google nu a văzut nimic din ce s-a construit în iulie și august.

**Sitemap-uri → „Adaugă un sitemap nou" → scrie `sitemap.xml` → TRIMITE.**
(Retrimiterea aceluiași sitemap forțează o citire nouă — nu e duplicat.)

### 3. Exportă lista celor 35 de 404-uri — 2 minute

Ca să confirm că cele 29 pe care le-am reparat sunt chiar alea, și să prind restul de ~6.

**Indexare → Pagini → click pe „Nu a fost găsită (404)" → butonul de export (dreapta sus).**

### 4. După ce ai făcut 1 și 2: validează 404-urile

În aceeași pagină „Nu a fost găsită (404)" e un buton **„VALIDEAZĂ REMEDIEREA"**.
Validarea anterioară a eșuat (de aia scrie „A eșuat") — pentru că într-adevăr nu era
reparat nimic. Acum e. Apasă-l.

---

## Ce NU rezolvă asta

Nimic de mai sus nu aduce trafic singur. Reparăm semnale negative — nu construim
autoritate. Cu 0 backlink-uri, un domeniu nou rămâne invizibil oricât de curat e tehnic.

`docs/operational/BACKLINK-PLAN.md` are în continuare **0 bifate**. Ăla e blocajul real.
