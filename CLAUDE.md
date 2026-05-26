# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: AmCupon.ro

Site afiliat românesc — coduri de reducere + oferte de la 2Performant și Profitshare. Deployed pe Vercel, date actualizate zilnic prin GitHub Actions. Răspunde întotdeauna în română.

---

## Commands

**Frontend (din `frontend/`):**
```bash
npm run dev        # localhost:3000
npm run build      # build producție
npm run lint       # ESLint
```

**Python scripts (din `scripts/`):**
```bash
pip install -r requirements.txt

# Env vars necesare:
set TWOPEFORMANT_EMAIL=alexmarius855@gmail.com
set TWOPEFORMANT_PASS=...
set TWOPEFORMANT_USER=541547473

python fetch_2p_api.py          # magazine + promoții 2Performant
python fetch_product_feeds.py   # produse din feed-uri
python process_profitshare.py   # date Profitshare
python merge_platforms.py       # merge → output.json
python generate_blog.py         # articole blog automate
python generate_best_of.py      # articole "Cel mai bun X"
```

---

## Arhitectură — Data Flow

```
GitHub Actions (zilnic 06:00 UTC)
    ↓
fetch_2p_api.py        → data/output.json + frontend/public/output.json
process_profitshare.py → data/profitshare_output.json
merge_platforms.py     → frontend/public/output.json (merged)
fetch_product_feeds.py → frontend/public/products.json
generate_blog.py       → frontend/public/blog-posts.json
    ↓
git commit + push → Vercel redeploy automat
```

**Nu există backend runtime** — toate datele sunt JSON statice în `frontend/public/`. Next.js le servește direct.

---

## Frontend Architecture (Next.js 16.2.6 + React 19 + Tailwind 4)

### Pattern server/client split
Fiecare pagină dinamică are două fișiere:
- `page.tsx` — **Server Component**: citește JSON cu `fs.readFileSync` la build time, generează `metadata` + JSON-LD
- `[Nume]Client.tsx` — **Client Component** (`"use client"`): interactivitate, useState, filtre

**Excepție**: `app/page.tsx` (homepage) este full client — face `fetch("/output.json")` în `useEffect` pentru date fără rebuild.

### Data loading
- Server pages: `fs.readFileSync(path.join(process.cwd(), "public", "output.json"))`
- Homepage: `fetch("/output.json")` în useEffect
- `/produse`: server component citește `public/products.json`

### Pagini speciale (landing pages)
`/farmacie`, `/sport`, `/copii`, `/frumusete`, `/calatorie`, `/gadgets`, `/moto`, `/idei-cadouri`, `/black-friday`, `/craciun` — filtrează `output.json` după categorie/keyword cu conținut editorial static.

---

## Fișiere cheie

| Fișier | Rol |
|--------|-----|
| `frontend/public/output.json` | Sursa de adevăr — toate magazinele + promoțiile |
| `frontend/public/products.json` | Produse din feed-uri (structură: `{updated, count, products:[]}`) |
| `frontend/public/blog-posts.json` | Articole blog generate automat |
| `frontend/app/page.tsx` | Homepage (~900 linii, client component) |
| `frontend/app/layout.tsx` | Root layout: GA4, Vercel Analytics, JSON-LD global, bara anunțuri |
| `frontend/app/sitemap.ts` | Sitemap dinamic generat din output.json + blog-posts.json |
| `scripts/fetch_2p_api.py` | Auth 2Performant + descărcare magazine/promoții |
| `scripts/fetch_product_feeds.py` | Descărcare produse din API feed-uri |
| `.github/workflows/update-data.yml` | Pipeline zilnic GitHub Actions |

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

Quicklinks: `https://event.2performant.com/events/click?ad_type=quicklink&aff_code=541547473&unique={md5(url)[:9]}&redirect_to={quote(url)}`

---

## Chrome Extension

- **Extension ID:** `mahfankpalkgognhnllkgdkjncmmkllb`
- **Web Store:** https://chromewebstore.google.com/detail/mahfankpalkgognhnllkgdkjncmmkllb
- **Status:** In review (trimis 2026-05-26)
- **Cod sursa:** `extension/` folder

---

## GitHub Secrets

| Secret | Valoare |
|--------|---------|
| `TWOPEFORMANT_EMAIL` | alexmarius855@gmail.com |
| `TWOPEFORMANT_PASS` | parola cont 2Performant |
| `TWOPEFORMANT_USER` | 541547473 (AFF_CODE pentru quicklinks) |
| `PROFITSHARE_USER` | marinescu_alex_marius_6a1454f45dc33 |
| `PROFITSHARE_KEY` | 4e57ac2e62b978256949426d88ede8b61c8a7f86 |
| `BREVO_SMTP_USER` | ac67f7001@smtp-brevo.com |
| `BREVO_SMTP_PASS` | xsmtpsib-... (in GitHub Secrets) |
| `NEXT_PUBLIC_ADSENSE_ID` | ca-pub-1744566936173747 |

---

## Categorii sluguri

Mapping fix `categorie_slug` din output.json → URL `/categorii/{slug}`:
`fashion`, `electronics-itc`, `beauty`, `home-garden`, `sports-outdoors`, `pharma`, `babies-kids-toys`, `automotive`, `books`, `hypermarket-groceries`, `gifts-flowers`, `telecom`, `pet-supplies`, `health-personal-care`, `jewelry`, `games`, `online-mall`

---

## SEO Conventions

- `generateMetadata()` în fiecare `page.tsx`: titlu format `"Cod reducere {Magazin} {luna} {an} — AmCupon.ro"`
- JSON-LD per pagină: `BreadcrumbList` + `ItemList` (categorie/magazin), `BlogPosting` (blog)
- `robots.ts` permite tot, `sitemap.ts` include toate magazinele + categorii + blog

## Bug cunoscut

Ghilimelele tipografice românești `„..."` în fișiere TSX cauzează erori Turbopack (interpretate ca ASCII `"`). Folosește template literals `` ` `` sau ghilimele normale.
