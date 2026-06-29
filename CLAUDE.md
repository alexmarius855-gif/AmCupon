# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Intretinere:** acest fisier e sursa unica de adevar pentru starea tehnica a proiectului. La
> finalul oricarei sesiuni cu modificari semnificative (pagini noi, fix-uri, rebrand), actualizeaza
> sectiunea "Stare curenta" + tabelele relevante de mai jos, in acelasi commit cu codul. Scopul:
> niciun viitor Claude Code nu trebuie sa redeschida zeci de fisiere individuale sau sa parcurga
> `git log` extins ca sa afle ce exista deja — citeste DOAR acest fisier intai.

## Project: AmCupon.ro

Site afiliat românesc — coduri de reducere + oferte de la 2Performant și Profitshare. Deployed pe Vercel, date actualizate automat (cron 4h) prin GitHub Actions. Răspunde întotdeauna în română.

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
| **Newsletter/welcome email nu se trimit** | Brevo respinge cu `HTTP 400 Sender is invalid/inactive` | Verifică `newsletter@amcupon.ro` în Brevo → Settings → Senders. 4 abonați reali așteaptă. Blochează și alertele de preț (folosesc același sender). |
| **Alerte de preț (`check_price_alerts.py`) nu pot citi/scrie abonamentele** | Atributul custom `ALERT_STORES` nu există încă în Brevo | Brevo → Contacts → Settings → Contact attributes → adaugă atribut tip **Text** cu numele exact `ALERT_STORES`. Fără el, tag-ul de magazin se pierde silențios (Brevo ignoră atribute necunoscute). |
| Proiectul Supabase (`reviews`) se poate re-pauza automat | Free tier — pauzează după ~1 săptămână fără activitate API | Dacă recenziile dispar brusc, verifică status proiect (Supabase dashboard sau MCP `list_projects`) și repornește cu `restore_project`. Risc recurent pe free tier dacă traficul pe `/cod-reducere/*` scade. |
| `FACEBOOK_PAGE_TOKEN` lipsește | Autopost Facebook blocat | Generează token + adaugă în GitHub Secrets. Workaround manual: `POSTEAZA-FB.bat` pe Desktop |
| `TRADETRACKER_SITE_ID/API_KEY` lipsesc | Cod gata, neactiv | Adaugă în GitHub Secrets dacă se folosește TradeTracker |
| 5 programe 2Performant în așteptare aprobare | Fixato, MxEnduro, Trendiva, Viada, DYFashion | Aplică din 2Performant → Affiliate Programs, apoi înlocuiește constantele `LINK_*` din paginile respective |
| cursuri-ai.ro se închide | — | De verificat eliminat complet până **07-07-2026** |
| outfitblack.ro se închide | — | De verificat eliminat complet până **10-07-2026** |

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

### Tema vizuala — dark indigo/cyan (din 18-19.06.2026)
**Standard pentru orice cod nou**: `bg-slate-950` (page wrapper), `bg-slate-900` (carduri), `border-slate-800` (borduri), accent `indigo-500/600` + `cyan-400`. **NU folosi orange — interzis explicit** (preferință Alex). Paleta veche orange + roz/mov/verde a fost complet înlocuită (commit `b8f9f29` + `7ea8b1f`). Pentru migrări similare la scară (10+ fișiere), folosește un script regex dedicat (vezi `scripts/retheme_pages.js` ca model — are protecție pentru logo box-uri albe și lookahead `(?!\d)` ca să nu corupă clase gen `bg-rose-500` în `bg-slate-9000`), nu editare manuală fișier cu fișier.

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
`/gaming`, `/laptop`, `/telefoane`, `/antivirus`, `/smart-home`, `/instrumente-seo`, `/trading`, `/carduri-bancare`, `/vpn`, `/hosting`, `/ai-tools`, `/cursuri-online`, `/software-business`, `/servicii`, `/recomandari`, `/albire-dinti`

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
| Impact.com | Direct (Account 7401119) | ✅ ACTIV — 6+ parteneri reali cu tracking link |
| Binance | Direct | ✅ ACTIV — ref `205306153`, în `/trading` |
| Fiverr, Hostinger, NordVPN | Impact.com / direct | 🔄 In review / pending |
| Semrush | Impact.com | ❌ RESPINS (18.06.2026, "business model mismatch") |
| pescar-expert.ro | 2Performant | 🔄 Aplicat 29.06.2026 — aprobare in ~31 zile (5-6% comision, 25k produse) |
| Fixato, MxEnduro, Trendiva, Viada, DYFashion | 2Performant | 🔄 De aplicat — vezi Probleme active |
| TradeTracker | Direct | ⚠️ cod gata, secrets lipsesc |

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
| `scripts/fetch_2p_api.py` | Auth 2Performant + descărcare magazine/promoții |
| `scripts/fetch_product_feeds.py` | Descărcare produse din API feed-uri |
| `scripts/send_newsletter.py` | Campanie Brevo către abonați (template indigo/cyan) |
| `scripts/check_price_alerts.py` | Alerte țintite per magazin — diff `output.json` vs `data/price_alert_snapshot.json`, trimite doar abonaților cu `ALERT_STORES` matching |
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
- **Status:** trimis spre review 2026-05-26 (verifică manual în Chrome Web Store Developer Dashboard pentru status curent — nu e tracked automat)

---

## GitHub Secrets

| Secret | Status |
|--------|--------|
| `TWOPEFORMANT_EMAIL/PASS/USER` | ✅ |
| `PROFITSHARE_USER/KEY` | ✅ |
| `BREVO_API_KEY` | ✅ (Campaigns/Contacts API — diferit de SMTP, vezi nota jos) |
| `BREVO_SMTP_USER/PASS` | ✅ (doar pentru `--test` local, NU pentru campanii reale) |
| `NEXT_PUBLIC_ADSENSE_ID` | ✅ `ca-pub-1744566936173747` |
| `FACEBOOK_PAGE_TOKEN` | ❌ LIPSEȘTE — blochează autopost Facebook |
| `TRADETRACKER_SITE_ID/API_KEY` | ❌ LIPSESC |

**Gotcha Brevo**: `BREVO_API_KEY` (Campaigns/Contacts API) și `BREVO_SMTP_USER/PASS` (SMTP) sunt credențiale DIFERITE, nu interschimbabile. Workflow-ul folosește API_KEY pentru trimiterea reală.

---

## Categorii sluguri

Mapping fix `categorie_slug` din output.json → URL `/categorii/{slug}`:
`fashion`, `electronics-itc`, `beauty`, `home-garden`, `sports-outdoors`, `pharma`, `babies-kids-toys`, `automotive`, `books`, `hypermarket-groceries`, `gifts-flowers`, `telecom`, `pet-supplies`, `health-personal-care`, `jewelry`, `games`, `online-mall`

---

## SEO Conventions

- `generateMetadata()` în fiecare `page.tsx`: titlu format `"Cod reducere {Magazin} {luna} {an} — AmCupon.ro"`, **sub 60 caractere** (Google taie în SERP peste asta — lecție din audit 17.06)
- JSON-LD per pagină: `BreadcrumbList` + `ItemList` (categorie/magazin), `BlogPosting` (blog)
- `robots.ts` permite tot, `sitemap.ts` include toate magazinele + categorii + blog
- Redirect-urile permanente folosesc `permanentRedirect()` (308), NU `redirect()` (307) — Google cere 308 pentru consolidare SEO corectă (fix 16.06.2026, vezi `app/reduceri/[magazin]/page.tsx`)

## Bug cunoscut

Ghilimelele tipografice românești `„..."` în fișiere TSX cauzează erori Turbopack (interpretate ca ASCII `"`). Folosește template literals `` ` `` sau ghilimele normale.
