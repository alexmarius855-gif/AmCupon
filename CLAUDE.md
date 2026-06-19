# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Intretinere:** acest fisier e sursa unica de adevar pentru starea tehnica a proiectului. La
> finalul oricarei sesiuni cu modificari semnificative (pagini noi, fix-uri, rebrand), actualizeaza
> sectiunea "Stare curenta" + tabelele relevante de mai jos, in acelasi commit cu codul. Scopul:
> niciun viitor Claude Code nu trebuie sa redeschida zeci de fisiere individuale sau sa parcurga
> `git log` extins ca sa afle ce exista deja — citeste DOAR acest fisier intai.

## Project: AmCupon.ro

Site afiliat românesc — coduri de reducere + oferte de la 2Performant și Profitshare. Deployed pe Vercel, date actualizate automat (cron 4h) prin GitHub Actions. Răspunde întotdeauna în română.

**Stare curentă (19.06.2026):**
- 370 magazine active (`output.json`), tema dark indigo+cyan pe **toate** paginile (rebrand orange→indigo complet, ultimele 28 pagini retemuite pe 19.06)
- ~217+ articole blog (titluri sub 60 caractere, cover = logo real magazin, nu mai poze stock random)
- GitHub Actions: cron 4h, retry 5x la push — vezi `.github/workflows/update-data.yml`
- Newsletter Brevo: cod reparat (logging + secret check), dar **trimiterea reala e BLOCATA** — vezi „Probleme active" mai jos
- Push pe `main` necesită mereu confirmare explicită în chat înainte de execuție, chiar dacă o sesiune anterioară a aprobat un push similar

---

## ⚠️ Probleme active / acțiuni necesare de la Alex

| Problemă | Status | Acțiune necesară |
|----------|--------|-------------------|
| **Newsletter/welcome email nu se trimit** | Brevo respinge cu `HTTP 400 Sender is invalid/inactive` | Verifică `newsletter@amcupon.ro` în Brevo → Settings → Senders. 4 abonați reali așteaptă. |
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
