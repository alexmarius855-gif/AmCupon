# 🔍 Audit complet pe pagini — AmCupon (04.07.2026)

> Scan sistematic al tuturor celor 111 rute. Grounded în cod + date reale (1047 magazine,
> 951 cu link afiliat tracked). Scop: tabloul complet + probleme + ce reparăm, în ordine.

---

## 📊 SCORECARD

| Zonă | Stare |
|---|---|
| Total rute | 111 |
| Temă premium auriu | ✅ aplicată pe tot (mai puțin `/nou` = preview bold) |
| Homepage | ✅ server-side, gold, structură Kuplio (bara categorii + bannere) |
| Blog / Revista | ✅ layout Kuplio gold + 169 coperți editoriale |
| Cifre fabricate în UI | ✅ **curățate azi** (mai jos) |
| Taxonomie categorii | 🔴 fragmentată (plan în `CATEGORII-SEO-MASTER.md`) |
| Pagini nișă subțiri | 🟡 ~14 pagini cu <5 magazine |
| Resturi light-theme | 🟡 3-4 pagini/elemente |
| Variety (magazine fără cupon) | 🟢 posibilă (951 tracked), de întărit |

---

## ✅ REPARAT AZI — cifre fabricate rămase (onestitate)

`procent_succes` (random 72-96) și `folosit_de` (random 15-800) mai apăreau, deși le
curățasem pe homepage/blog. Eliminate acum din:
- `categorii/[slug]/CategorieClient.tsx` — „X% succes" + „Nx" → „✓ verificat azi"
- `top-reduceri/TopReduceriClient.tsx` — „X% succes" + „N utilizatori" → „✓ verificat azi"
- `cod-reducere/[magazin]/page.tsx` — **FAQ în structured data** care pretindea rata falsă → scos
- `reduceri/[magazin]` — fișier redirect mort (vezi mai jos), de șters

---

## 🗺️ AUDIT PE GRUPURI DE PAGINI

### 1. Core (funcționează)
| Pagină | Stare | Notă |
|---|---|---|
| `/` homepage | ✅ | server-side, gold, bara categorii + bannere |
| `/blog` Revista | ✅ | layout Kuplio, coperți editoriale |
| `/produse`, `/top`, `/top-reduceri`, `/toate-magazinele`, `/cautare`, `/comparator`, `/categorii`, `/radar`, `/recomandari`, `/oferte-azi` | ✅ | gold aplicat |
| `/wishlist` | 🟡 | fără metadata SEO (client page — minor) |

### 2. Pagini magazin (store landing) — ~35, folosesc `BrandPageTemplate`
emag, altex, notino, fashiondays, decathlon, drmax, answear, asos, shein, temu, trendyol,
elefant, libris, litera, carturesti, bookzone, noriel, brico, vidaxl, sportdepot, petmart,
petmax, pfarma, vegis, iherb, liki24, otter, scule365, banggood, automobilus, flanco, pcmadd, kitunghii...
- **Stare:** ✅ în general OK (template unificat, JSON-LD, gold).
- **De verificat:** unele au link afiliat, altele nu — cele fără tracking real ar trebui
  să nu fie promovate agresiv (vezi subagent `affiliate-link-auditor`).

### 3. Pagini categorie/nișă — ~40 (AICI e haosul)
**Duplicate cu paginile din `/categorii/[slug]`** (același subiect, 2 pagini care se concurează):
| Standalone | Duplică `/categorii/...` | Magazine |
|---|---|---|
| `/electronice` (25) | electronics-itc (87) | fragmentare 4x |
| `/casa` (16) | home-garden (129) | fragmentare |
| `/sanatate` (4) + `/farmacie` | health-personal-care (41) + pharma (21) | 3-4 pagini |
| `/frumusete` (9) | beauty (78) | duplicat |
| `/bijuterii` (4) | jewelry-accessories (11) | duplicat |
| `/copii` (5) | babies-kids-toys (35) | duplicat |
| `/telefoane`, `/laptop`, `/gadgets` | subseturi din electronice | canibalizare |
| `/moto`, `/piese-auto`, `/echipament-moto`, `/automobilus` | toate = auto | 4 pagini fragmentate |

**Nișă subțire (<5 magazine → thin content, risc penalizare Google):**
`albire-dinti`, `echipament-moto`, `rochii-mireasa`, `pescuit`, `jocuri`, `trading`,
`servicii-internationale`, `ai-tools` (3), `cursuri-online` (5), `gadgets`, `kitunghii`.

**Buckete-gunoi în date:** `online-mall` (160!) + `diverse` (10) = 170 magazine neclasificate.

### 4. Sezoniere
| Pagină | Stare |
|---|---|
| `/black-friday` | 🟡 **light-theme** (bg alb pe site dark) — de reparat sau ascuns până în sezon |
| `/craciun` | 🟡 **light-theme** — la fel |
| `/oferte-azi` | ✅ |

### 5. Tool-uri (SEO gratuit, cost 0 — bune)
`/calculator`, `/calculator-salariu`, `/generator-proforma`, `/instrumente-seo` — ✅ păstrăm.

### 6. Utility
`/despre-noi`, `/contact`, `/termeni`, `/confidentialitate`, `/extensie`, `/newsletter` — ✅.

### 7. Alte
- `/nou` — preview design bold (intenționat multicolor, neatins).
- `/admin` — panou intern.
- `/reduceri/[magazin]` — **redirect 308 mort** (fișier client vechi light-theme) → de șters.
- `/top/[slug]` (`TopProduseClient`) — 🟡 resturi light-theme.

---

## 🎯 PROBLEME, ÎN ORDINEA IMPACTULUI

1. **🔴 Taxonomie fragmentată** (SEO #1) — 40 etichete în loc de 18; pagini duplicate se
   canibalizează. **Fix:** mapare canonică în `merge_platforms.py` + redirect 301 (plan complet
   în `CATEGORII-SEO-MASTER.md`).
2. **🔴 170 magazine în `online-mall`/`diverse`** — neclasificate = invizibile la căutare pe
   categorie. **Fix:** reclasificare heuristică (nume + feed produse).
3. **🟡 ~14 pagini nișă subțiri** — thin content. **Fix:** `noindex` până au ≥5 magazine, SAU
   consolidare în categoria-mamă.
4. **🟡 Pagini duplicate standalone vs `/categorii`** — canibalizare. **Fix:** păstrăm UNA
   (cea canonică din `/categorii`), redirect 301 de la cealaltă.
5. **🟡 Light-theme:** `black-friday`, `craciun`, `top/[slug]`, badge countdown din MagazinClient.
   **Fix:** remap la gold-dark.
6. **🟢 Variety (cererea ta):** 951 magazine au link tracked. Paginile deja arată magazine
   fără cupon ca „Ofertă Specială". **Fix de întărit:** pe categorii + homepage, secțiune
   „Magazine recomandate" cu toate cele afiliate (nu doar cu cupon) + produse din feed pentru servicii.
7. **🟢 `wishlist` fără metadata**, `reduceri/[magazin]` fișier mort → șters.

---

## 🛠️ PLAN — ce fac eu (în ordine), cu decizii pt tine

**Faza 1 (fix-uri sigure, le fac fără să te întreb):**
- ✅ Cifre fabricate curățate (azi).
- Light-theme: black-friday, craciun, top/[slug], badge countdown → gold.
- `noindex` pe cele ~14 pagini nișă subțiri (până se umplu).
- Șterg `reduceri/[magazin]` (redirect mort), adaug metadata la wishlist.

**Faza 2 (taxonomie — impact SEO mare, o fac dar vreau OK pe structură):**
- Mapare canonică 40→18 în `merge_platforms.py` + reclasificare online-mall/diverse.
- Redirect 301 de la slug-urile vechi.
- (Structura celor 18 e în `CATEGORII-SEO-MASTER.md` — confirmi sau ajustezi.)

**Faza 3 (variety):**
- Secțiune „Magazine recomandate" (toate cele afiliate, cu/fără cupon) pe categorii + homepage.
- Produse din feed pentru magazine de servicii (unde nu-s coduri, dar sunt produse/servicii).

> Regula peste tot: onest (zero cifre inventate), pe brand (gold), fără thin content.
