# PLAN MASTER — Imperiul AmCupon & Rețeaua de 100 Site-uri

> **Documentul-busolă.** Aici trăiește strategia, nu codul (codul = `CLAUDE.md`).
> Orice sesiune cu decizii noi → actualizează aici. Notion oglindește acest fișier.
> Ultima actualizare: **30.06.2026**

---

## 🎯 VIZIUNEA (visul, tradus în cifre)

**Obiectiv final:** independență financiară din venituri pasive — site-uri, afaceri,
închirieri, vânzări, Shopify, randamente. Alex să trăiască din randamente, nu din muncă.

**Ținta operațională:**
- **100 site-uri** construite + administrate
- Fiecare site → **200-500 €/lună** venit
- **1000+ parteneriate afiliere** integrabile în orice site din rețea
- La 100 site-uri × 300 € mediu = **30.000 €/lună** venit pasiv

**Regula de aur:** fiecare unealtă, motor, pagină pe care o construim acum trebuie să fie
**REUTILIZABILĂ** în toate cele 100 site-uri viitoare. Nu construim de unică folosință.

**Regula a 2-a (30.06.2026):** ne poziționăm după unde MERGEM, nu după unde suntem acum.
La înscrieri în rețele (Awin sectoare, categorii), bifăm/selectăm verticalele pe care le
construim progresiv, nu doar ce avem azi. Ex: AmCupon NU e doar cupoane — devine hub de
economii + comparații + asigurări + finanțe. Gândire de imperiu, nu de site mic.

---

## 📊 DRUM CĂTRE 1000 AFILIAȚI

### Status actual (30.06.2026): **929 magazine** 🚀 (de la 132 azi dimineață)
| Rețea | Acum | Potențial real | Cum ajungem |
|-------|------|----------------|-------------|
| Impact.com | 280 | 400+ | Aplică la programe noi în dashboard → export CSV → import automat |
| 2Performant | 583 | 600+ | ✅ REZOLVAT — API fix (paginare + filter accepted) trage toate cele ~600 aprobate |
| Profitshare | 63 | 150+ | Aplică la programe noi → re-sync |
| Direct (Binance etc.) | 3 | 10 | Manual |
| **TOTAL** | **929** | **1160+** | **Mai sunt 71 până la 1000!** |

**🔑 Cum am sărit la 929 (30.06):** bug-ul 2P era dublu — (1) API capează 20/pagină iar
`fetch_all_pages` se oprea la pagina 1, (2) lipsea `filter[affrequest_status]=accepted`. Reparat în
`fetch_2p_api.py` → trage toate cele 600 programe aprobate. Drumul la 1000+: Impact (mai aplică) +
Awin/CJ (în curs) + Profitshare. Aproape acolo.

**Lecție Promotions CSV (30.06):** export-ul 2P Promotions conține DOAR programele acceptate care
au promoție activă (63 magazine → +47 noi). Ca să crească: Alex aplică la MAI MULTE programe 2P
(lista "Comercianții mei" = toate acceptate, inclusiv fără promoție) → reexportă. `import_csv_promotii.py`
le potrivește + creează noi cu quicklink real.

**Lecție feed produse 2P (30.06):** feed-ul `4a3fc5d5f` are doar 13 magazine .ro (e dominat de
produse internaționale). Extragerea din feed = doar magazinele acceptate care au produse în feed.
Drumul REAL la sute: (1) Alex adaugă mai multe surse în 2P "My Feeds", (2) **export Promotions CSV**
din 2P (cel mai mare câștig). Tool gata: `extract_merchants_from_feed.py` (XML, nu CSV — CSV dă header gol).

### Rețele NOI de adăugat (fiecare = +50-200 afiliați)
| Rețea | Specializare | Prioritate | Status |
|-------|-------------|------------|--------|
| **Awin** | Global, branduri mari EU | 🔴 Mare | De înscris |
| **CJ Affiliate** (Commission Junction) | US + global, branduri premium | 🔴 Mare | De înscris |
| **TradeTracker** | EU, cod deja pregătit în pipeline | 🟡 Mediu | Secrets lipsesc |
| **Admitad** | EU + Asia, multe magazine | 🟡 Mediu | De înscris |
| **Tradedoubler** | EU nordic + travel | 🟢 Mic | De evaluat |
| **Webgains** | UK/EU fashion + tech | 🟢 Mic | De evaluat |
| **Daisycon** | Benelux + travel | 🟢 Mic | De evaluat |

### Motorul de import — REUTILIZABIL ✅
- `scripts/import_impact_campaigns.py` — importă orice export Impact CSV
- `scripts/import_csv_promotii.py` — importă promoții 2Performant CSV
- **DE CONSTRUIT:** `scripts/import_generic_affiliate.py` — un singur importer care
  acceptă orice CSV de rețea (mapare coloane configurabilă), ca să nu scriem cod nou
  pentru fiecare rețea.

### 🔑 CE FACE ALEX (singurul blocaj real către 1000)
Eu nu pot aplica la programe în dashboard-uri (necesită login + accept manual). Tu faci:
1. **2Performant** → Affiliate Programs → aplică la TOATE programele relevante (sortează după
   comision). Apoi Promotions → Export CSV → pune-l în `data/promotii_2p.csv`. **Aici sunt
   sute de magazine.**
2. **Impact** → Brands → aplică la programe noi → Campaigns → Export → `data/impact_campaigns.csv`
3. **Awin + CJ** → înscrie-te ca publisher (amcupon.ro e site live, calificat) → aplică → export
4. Trimite-mi fiecare CSV → eu import automat în minute.

---

## 🏗️ MOTORUL REUTILIZABIL (inima rețelei de 100 site-uri)

Tot ce construim pe AmCupon devine **modul** pe care îl plug-uim în orice site nou:

| Motor | Ce face | Status | Reutilizabil în |
|-------|---------|--------|-----------------|
| **Affiliate DB** | output.json cu 1000+ magazine + linkuri | ✅ Are | Toate site-urile |
| **Importer multi-rețea** | CSV → JSON normalizat | 🟡 Parțial (Impact, 2P) | Toate |
| **Pagină magazin SEO** | page.tsx + JSON-LD + recenzii | ✅ Are | Site-uri cupoane |
| **Generator blog AI** | articole automate din date | ✅ Are | Toate (conținut) |
| **Video AI zilnic** | digest → MP4 vertical TikTok | ✅ Are | Toate (social) |
| **Comparator produse** | tabele comparative SEO | ✅ Are | Review-uri, nișe |
| **Sistem recenzii** | Supabase + moderare | ✅ Are | Review-uri |
| **Postări sociale** | banner + text per platformă | 🟡 Parțial | Toate |
| **Newsletter** | Brevo digest | ⚠️ Blocat sender | Toate |
| **Schema/SEO engine** | breadcrumb, FAQ, Offer JSON-LD | ✅ Are | Toate |

**Principiul:** site nou = clonezi structura + schimbi nișa + plug-uiești afiliații relevanți
filtrați pe categorie. Zero rescriere de la zero.

---

## 🌐 CELE 100 SITE-URI (cucerirea piețelor)

### Faza 1 — Active acum
1. **AmCupon.ro** — cupoane/oferte (hub principal, motorul-mamă) — LIVE
2. **AlexMarinescu.ro** — brand personal, creator AI — LIVE

### Faza 2 — Următoarele (după primul venit constant)
| Site | Nișă / Piață țintă | Model venit | Afiliați-cheie |
|------|-------------------|-------------|----------------|
| **[agenție turism]** | Turism, eSIM, hoteluri, zboruri | Booking, Pelago, KKday, Airalo, eSIM-uri | 40+ travel din Impact |
| Site review eSIM | eSIM internațional | Airalo, Saily, 10+ eSIM | ✅ deja avem datele |
| Site review VPN/antivirus | Securitate digitală | NordVPN, Surfshark, Bitdefender | ✅ avem |
| Site review AI tools | Unelte AI (val 2026) | InVideo, ElevenLabs, sider, byteplus | ✅ avem |
| Site hosting/domenii | Web/dezvoltatori | Hostinger, Shopify, ScalaHosting | ✅ avem |
| Site fashion feminin | Modă (29 branduri Impact) | Answear, DHgate, fashion Impact | ✅ avem |
| Site cadouri/ocazii | Cadouri sezoniere | Flori, bijuterii, experiențe | ✅ avem |
| Site sport/outdoor | Echipamente sport (31 branduri) | Decathlon, Alpinestars, sport Impact | ✅ avem |
| Site sănătate/suplimente | Wellness | DrMax, diet/nutrition Impact | ✅ avem |
| Site casă/grădină | Amenajări | vidaXL, Home&Garden Impact | ✅ avem |

**Observație critică:** avem deja datele de afiliere pentru ~10 site-uri de nișă din
importul Impact. Fiecare nișă cu 20-40 afiliați = un site dedicat gata de lansat.

### 🆕 Verticală nouă — ASIGURĂRI & FINANȚE (build progresiv, decizie 30.06.2026)
Comisioane mari, intenție mare de cumpărare. Se construiește progresiv pe AmCupon (secțiune
dedicată) + posibil site separat la maturitate.
- **Asigurare de călătorie** — start aici, se leagă de `/esim` + `/calatorie` (combo natural)
- **RCA / asigurare auto** — volum mare RO, reînnoire anuală
- **Asigurare casă / locuință** — cross-sell cu `/casa`
- **Asigurare viață / sănătate** — comision mare, recurent
- **Produse financiare** — carduri, conturi, investiții (avem deja Revolut, trading)
- Surse afiliere de căutat: programe pe 2P/Awin/CJ (asigurători RO), comparatoare, broker-i digitali
- Pagini de construit: `/asigurari` hub + `/asigurare-calatorie`, `/rca`, `/asigurare-casa` (comparatoare)

### Strategia de cucerire piață
- **Domenii exact-match** pe nișă (ex: cel-mai-bun-esim.ro, review-vpn.ro)
- **Long-tail SEO** — "cel mai bun X 2026", "X vs Y", "X review românia"
- **Conținut programatic** — 1 motor generează 100 pagini comparative
- **Social organic** — TikTok/Reels din video AI zilnic, zero buget reclame la început

---

## 💰 MONETIZARE — Scheme de la cei mai buni

### Învățăm de la liderii pieței
| Sursă | Ce furăm (elegant) | Aplicăm pe |
|-------|---------------------|------------|
| **Cuponeria.ro** (700 mag) | Volum magazine + verificare zilnică coduri | AmCupon |
| **RetailMeNot** | UX cupoane + "verified today" badges | AmCupon |
| **NerdWallet/MoneySavingExpert** | Conținut educativ → trust → conversie | Review sites |
| **Wirecutter** (NYT) | Review-uri profunde, "the best X" autoritate | Toate review |
| **Honey/Capital One Shopping** | Extensie browser auto-aplicare cod | Extensia noastră |
| **FutureTools.io** | Director AI tools cu trafic organic masiv | Site AI tools |

### Scheme de venit per site (stratificat)
1. **Afiliere** (primar) — comision pe vânzare
2. **AdSense** (secundar) — pe paginile-unelte (calculatoare, fără afiliere)
3. **Lead-gen** — eSIM, VPN, hosting plătesc per sign-up
4. **Recurring** — VPN/software/hosting = comision lunar recurent (cel mai bun cash-flow)
5. **CPA fix** — Revolut $50-200/client, Shopify $25-150
6. **Newsletter sponsor** (viitor, la volum)
7. **Shopify dropship** (viitor, produs propriu)

### ⭐ Principiu central — PROMOVĂM TOT, nu doar reducerile (decizie 30.06.2026)
Comisionul curge pe ORICE link afiliat, nu doar pe cupoane. Deci:
- **Nu filtra/ascunde magazinele fără reducere** — toate cele 389 (curând 1000+) se prezintă elegant.
- Magazinele fără cod = **recomandări curate** (framing onest, ca la postările sociale: "recomandat",
  NU "reducere falsă", NU comisionul afișat ca cashback).
- Redesign = **organizare elegantă a TOT**, nu tăiere de magazine. Tăiem doar REDUNDANȚA (8 secțiuni
  care arată aceleași magazine de 5 ori) → consolidăm în puține secțiuni curate care le acoperă pe toate.
- **Lanț de afiliere complet:** cele 100 site-uri își trimit trafic reciproc + către magazine. Fiecare
  magazin = pagină dedicată curată + descoperibil. Fiecare nișă = site care hrănește hub-ul și invers.

### Pâlnia de conversie (de implementat pe fiecare pagină)
```
Trafic SEO/Social → Pagină nișă (autoritate) → Comparație/Review (decizie)
→ CTA afiliat (acțiune) → Newsletter (retenție) → Email recurent (LTV)
```

---

## 📣 POSTĂRI AUTOMATE — Banner + Text zilnic/săptămânal

### Ce vrea Alex
- Postări corecte gramatical, clare, profesionale
- Bannere zilnice + săptămânale
- Idei noi de postări, din toate categoriile
- Postare automată (pe cât posibil)

### Sistem de implementat
| Frecvență | Conținut | Sursă | Canal |
|-----------|----------|-------|-------|
| Zilnic | Digest "Radar" + 1 video AI | generate_daily_digest + video | TikTok, Telegram, FB |
| Zilnic | 2 postări (dimineață/seară) | skill `postari` | FB, Instagram |
| Săptămânal | "Top reduceri săptămâna" banner | output.json | FB, Newsletter |
| Săptămânal | "X vs Y" comparație nouă | comparisons.json | Blog → social |
| Sezonier | Black Friday, Crăciun, etc. | calendar | Toate |

### Calendar de conținut (idei rotative, din toate categoriile)
- Luni: Tech/AI tools deal-ul săptămânii
- Marți: Fashion/beauty oferte
- Miercuri: Travel/eSIM (sezon vacanțe)
- Joi: Casă/grădină/DIY
- Vineri: Gaming/divertisment + weekend deals
- Sâmbătă: Top săptămână (recap)
- Duminică: Educativ ("cum economisești la X")

**DE CONSTRUIT:** `scripts/generate_social_calendar.py` — generează automat postările
săptămânii din output.json, corecte gramatical, cu banner, gata de copy-paste sau autopost.

---

## 🔍 AUDIT PAGINI — Verificăm și îmbunătățim fiecare (102 pagini)

### Metodă
Trecem prin fiecare pagină → verificăm: SEO (title/meta/schema), conversie (CTA clar),
design (elegant, dark indigo/cyan, fără orange), linkuri interne (anti-orfan), date reale
(nu placeholder). Notăm în `CLAUDE.md` ce s-a reparat.

### Categorii de pagini (102 total)
- **Hub-uri** (/, /categorii, /toate-magazinele, /oferte-azi) — 4
- **Nișe produse** (fashion, frumusete, electronice...) — ~30
- **Nișe tech/financiar** (vpn, hosting, ai-tools, esim...) — ~16
- **Magazine individuale** (emag, altex, answear...) — ~40
- **Unelte** (calculator, calculator-salariu, generator-proforma) — 3
- **Comparații** (/comparatii/[slug]) — 10
- **Legal/utilitare** — ~9

### Prioritate audit (impact venit)
1. 🔴 Pagini cu trafic + afiliat real (esim, vpn, hosting, emag, fashiondays)
2. 🟡 Hub-uri (homepage, categorii) — prima impresie
3. 🟢 Restul nișelor

---

## 🚧 CE AM NEVOIE DE LA ALEX (blocaje pe care doar tu le deblochezi)

### Imediat (deblochează venitul)
1. **2Performant** — aplică la programe în masă + export CSV promoții → +200-400 afiliați
2. **Brevo sender** — validează `newsletter@amcupon.ro` → deblochează newsletter + alerte preț
3. **Impact** — aplică la programe noi + reexport CSV → +100 afiliați

### Curând (scalare)
4. **Awin + CJ Affiliate** — înscrie-te ca publisher → noi rețele
5. **Domenii** — decide primele 3 domenii de nișă pentru Faza 2 (buget mic)
6. **FB Page Token** — pentru autopost Facebook

### Când avem venit (investiție)
7. Hosting/infra pentru site-urile cu backend (CuponAzi model)
8. Buget reclame test (după ce SEO-ul organic validează nișele)

---

## 📝 LOG DECIZII

- **30.06.2026** — Import 247 magazine noi din Impact (379 total). Pagină /esim live.
  Plan master creat. Țintă: 1000 afiliați, 100 site-uri, 200-500€/site/lună.
- **30.06.2026 (continuare)** — Motor import generic gata (orice rețea). Money-leak reparat
  pe /vpn, /cursuri-online, /antivirus (linkuri false → reale Impact). Generator social extins
  cu nișe de bani (11 nișe, 165 postări, postări de recomandare oneste). Decizie Alex: NU push
  încă — construim mai mult, push tot la final. Focus aprobat: TOATE (audit pagini + calendar
  social + pagini noi + scheme marketing).
- **[următoarele decizii aici]**

---

## ✅ NEXT ACTIONS (sesiunea curentă + următoarele)

- [x] Import Impact 247 magazine → 379 total
- [x] Pagină /esim cu 10 afiliați eSIM reali
- [x] Plan master MD
- [ ] Importer generic multi-rețea (reutilizabil)
- [ ] Audit + îmbunătățire pagini prioritare (esim✓, vpn, hosting, homepage)
- [ ] Generator calendar social săptămânal
- [ ] Update Notion cu planul
- [ ] Push live (cu aprobare Alex)
