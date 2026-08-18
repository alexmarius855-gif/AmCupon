# Brief pentru Lovable — referință de design pentru AmCupon.ro

> **Creat 17.08.2026.** De citit ÎNAINTE de a-l lipi în Lovable — primele 15 rânduri
> te scutesc de o săptămână pierdută.

---

## ⚠️ Ce poate și ce NU poate face Lovable aici

**NU poate prelua AmCupon.** Lovable construiește aplicații React de la zero, într-un mediu al lui.
AmCupon are lucruri pe care Lovable nu le poate atinge:

| Ce avem | De ce Lovable nu poate prelua |
|---|---|
| Pipeline Python (7 scripturi, GitHub Actions la 4h) | Lovable nu rulează cron, nu are Python, nu are secretele rețelelor de afiliere |
| `output.json` — 1.161 magazine, regenerat automat | ar trebui re-inventat de la zero, cu risc de a pierde linkurile de comision |
| Regula de indexare (`seoIndexable.ts`), sitemap-ul, canonical-urile | munca de SEO din august s-ar pierde silențios |
| Supabase (recenzii, voturi) cu RLS și RPC | — |

Dacă îi ceri „refă-mi site-ul", primești un site **frumos și gol**, care arată bine în demo și
aduce zero — exact opusul problemei pe care o avem (noi avem date reale și lipsă de trafic).

**CE poate face, și e chiar valoros:** îți produce o **referință vizuală** — un site-demo pe care
îl vezi cu ochii, îl răsucești, spui „asta da, asta nu". Exact așa a apărut tema actuală:
pe 11.08 ai ales `deal-findr-spark.lovable.app`, eu i-am descărcat CSS-ul, i-am convertit
culorile `oklch` în hex și le-am portat în codul real. **Aia e metoda care a funcționat deja.**

**Fluxul corect:**
```
Lovable → demo vizual (30 min, gratis)
   ↓  tu te uiți și alegi ce-ți place
   ↓  îmi dai linkul
eu → extrag paleta/spațierea/ierarhia și le port în codul REAL
   ↓  build + verificare live
```

---

## 📋 PROMPTUL — copiază de aici în jos în Lovable

```
Build a design reference for a Romanian coupon and deals website called AmCupon.ro.
This is a DESIGN EXPLORATION — use realistic placeholder data, no backend needed.

## What the site is
A Romanian affiliate site listing discount codes and offers from ~1.100 online stores.
The single most important page type is the STORE PAGE — that page IS the business.
Everything else is secondary. Design it like the money depends on that page, because it does.

## Language
Everything in Romanian, with correct diacritics (ă â î ș ț). No English strings anywhere in the UI.

## Visual direction
Dark, modern, editorial — closer to a fintech dashboard than to a coupon-clipping site.
- page background: near-black, cool neutral (#06080b)
- cards: #14181c, borders #1f2329, hover border #2a2f36
- text: white primary, #c9ced5 secondary, #9399a0 muted
- ONE accent color, lime #ddf93c, used ONLY on numbers, buttons and badges — never as a
  full-width hero background. Text on the lime accent must be near-black (#0c1000), never white.
- border radius max 12px
- NO orange, NO amber, NO multi-color "rainbow" category gradients
- store logo boxes stay WHITE — the logos are PNGs designed for white backgrounds

## Pages to design

### 1. Store page (THE priority — spend most of the effort here)
URL shape: /cod-reducere/emag.ro
Must contain, in this order:
- hero: store logo, name, category badge, "verified N days ago" badge, primary CTA
- tabs: Coduri / Oferte / Produse / Recenzii — with a count badge on each
  IMPORTANT: design the tabs so that inactive panels are still part of the page
  (hidden, not unmounted) — the text in them matters for search engines
- each coupon/offer as its own card with a heading naming the actual discount
  ("Cod reducere eMAG -10% la electrocasnice"), a masked code that reveals on click,
  a copy button, and an expiry indicator
- a product grid (image, title, price, old price, discount %) — 12-24 items
- a price-context block: "what prices does this store have" (min / median / max)
- a comparison block: this store vs the rest of its category
- a 4-step "how to use a discount code here" section, steps visible as text
- an FAQ section as a native accordion (details/summary), text present even when collapsed
- a community vote on each code: "worked" / "didn't work", showing a percentage ONLY
  when there are at least 3 votes
- similar stores grid at the bottom

### 2. Homepage
- hero with one clear promise and a search entry point
- quick filters that show a count and HIDE THEMSELVES when they would return zero results
- a grid of store cards
- a product row by category
- a newsletter block

### 3. Category page (/categorii/fashion)
Store grid with filters and sorting.

### 4. Global search overlay (Cmd+K / ⌘K)
Instant, keyboard-driven, grouped results (stores, categories, articles), arrow-key navigation.

## Hard rules — these are the point, do not skip them
1. NEVER invent trust signals. No fake star ratings, no "487 people viewing now",
   no "94% success rate", no fabricated review counts. If there is no data, show nothing.
   Empty states must be honest and useful, not filled with decoration.
2. Every number shown must be traceable to real data. Prefer showing less over showing invented.
3. The affiliate relationship is disclosed plainly, not buried.
4. Mobile first — most traffic is mobile.
5. Accessible: real focus states, working keyboard navigation, contrast that passes WCAG AA,
   respect prefers-reduced-motion.
6. Animation is restrained: a copy confirmation, a subtle hover. No confetti, no parallax.

## What I want out of this
A design reference I can look at and pick from. Prioritize: the store page, the coupon card,
the product card, and the tab structure. Those four are what I will actually port.
```

---

## 🔁 Ce fac eu după ce alegi

1. Îmi dai linkul demo-ului.
2. Îi descarc bundle-ul CSS și extrag valorile reale (culori, spațiere, dimensiuni de font) —
   **nu ghicesc din screenshot**, exact ca pe 11.08.
3. Le port în codul real, componentă cu componentă, cu `tsc` + `build` + verificare live după fiecare.
4. Verific manual cele **4 tipare pe care o migrare automată de culori NU le prinde**
   (ternare, clase din variabile, fundal pe părinte cu text pe copil, culoare venită din JS) —
   sunt documentate în `CLAUDE.md`, secțiunea Tema vizuală. Un text invizibil compilează perfect.

---

## 🧭 Alternative, dacă vrei să compari

| Unealtă | Bună la | Slabă la |
|---|---|---|
| **Lovable** | referință vizuală completă, navigabilă | crede că poate prelua tot; nu poate |
| **v0.dev** (Vercel) | componente izolate (un card, un modal) — mai ușor de portat | nu-ți dă senzația de site întreg |
| **Figma + AI** | control fin pe spațiere și tipografie | nu vezi interacțiunea reală |

**Recomandarea mea:** Lovable pentru direcție (ce vezi și simți), v0 pentru câte o componentă
punctuală dacă rămâne ceva neclar.
