# 🔬 Audit dur + plan remodelare AmCupon (03.07.2026)

> Audit bazat pe cod + date reale, nu pe presupuneri. Cifre verificate direct în
> `output.json` / `products.json` / pipeline la data auditului. Competitori: cercetare
> live (Kuplio, Picodi bot-blocate la fetch → date din SimilarWeb/Chrome Store/căutare).
> Regulile de business rămân în `PLAN-MASTER.md`; nișele în `NISE-MASTER.md`; acest
> fișier = DOAR auditul tehnic + deciziile de remodelare.

---

## 🔴 Descoperirea #1 (existențială): AmCupon nu are coduri

Cifre reale la 03.07.2026:
- **1044 magazine** în output.json
- **75** au promoții active (7%)
- **0 (zero)** au cod cupon real — `cod_cupon: ""` la toate. `cu cod: 0`.
- 95 magazine fără `url_afiliat` distinct (link fără comision)

**Problema:** site-ul se numește AmCupon, meta title-urile spun "Cod reducere {magazin}",
extensia promite "coduri de reducere" — dar **nu există niciun cod**. Suntem un agregator
de *oferte/reduceri procentuale*, nu un site de *coduri*. Kuplio (concurentul direct) își
construiește TOT pe "300+ coduri noi zilnic în 1000+ magazine". Noi rankăm pe "cod reducere
emag" și livrăm... o pagină fără cod. Google + userul văd asta = bounce + neîncredere.

**Decizia care schimbă tot (singura pe care o poate lua doar Alex):**
- **Varianta A — pivot onest la "oferte & reduceri":** schimbăm limbajul (title, extensie,
  carduri) din "cod" în "ofertă/reducere activă". Rămânem ce SUNTEM cu adevărat. Rapid, 0€,
  onest. Pierdem cuvântul-cheie "cod reducere X" (volum mare) dar câștigăm credibilitate.
- **Varianta B — chasing coduri reale:** intrăm în rețele care dau coduri (Awin, CJ, Admitad
  dau coduri; 2P/Impact dau mai ales linkuri), curăm manual coduri reale. Mult efort continuu,
  dar deblochează exact cuvintele-cheie unde e volumul.
- **Recomandare: A acum + B țintit.** Pivotăm limbajul imediat (credibilitate), și adăugăm
  coduri REALE doar pentru 10-20 magazine mari unde chiar există (nu fake). Hibrid onest.

---

## A. Ce e slab acum (verificat)

1. **Zero coduri** (mai sus) — cel mai grav, contrazice tot brandingul.
2. **Homepage 1944 linii, full client**, face `fetch("/output.json")` (929KB) în useEffect →
   userul vede spinner/gol până se încarcă 929KB + parse client. Lent pe mobil, prost pt SEO
   (conținut nu e în HTML la crawl). Concurenții randează server-side.
3. **products.json 3.4MB** servit pe pagini — greu pe mobil.
4. **110 pagini `page.tsx`** — suprafață uriașă de întreținut; multe nișe cu 0 trafic
   (pescuit, rochii-mireasa, echipament-moto = placeholder) diluează autoritatea.
5. **Blog generat automat zilnic** (generate_blog + best_of + AI guides + comparisons rulează
   la fiecare pipeline complet) → risc mare de "thin/AI content" penalizat de Google Helpful
   Content. Cantitate > calitate acum.
6. **Backlinks ~0** (din memorie, neinfirmat) — blocajul real de autoritate, nu conținutul.
7. **95 magazine cu link fără comision** — money-leak rezidual.
8. **Extensia** = draft nefinalizat, promite coduri pe care nu le avem.

## B. Ce trebuie remodelat complet

1. **Homepage → server-side + secțiuni statice.** Randează top oferte/magazine în HTML la
   build (ISR/revalidate), nu fetch client de 929KB. Țintă: LCP < 2s pe mobil, conținut în
   sursă pt Google. Ăsta e cel mai mare câștig de perf + SEO dintr-o mișcare.
2. **Cardul de ofertă** — un singur component curat, onest: "reducere X%" / "ofertă activă" /
   (dacă există) "COD: XXX". Fără procente inventate, fără comision afișat ca cashback.
3. **Poziționarea/limbajul** — pivot "cod" → "ofertă" peste tot (title, extensie, carduri, hero)
   SAU adăugare coduri reale (decizia A/B de sus).
4. **Blogul** — din "fabrică zilnică" în "motor editorial cu scop" (vezi H).

## C. Ce păstrăm (funcționează)

- Pipeline-ul de date 2P/Impact/Profitshare + merge (solid, matur).
- `BrandPageTemplate.tsx` (motor pagini magazin reutilizabil).
- Sistemul de scor comercianți + alerte preț + review Supabase (construite bine, doar
  neactivate/neafișate).
- Tema indigo/cyan (curată acum), generatoarele de bannere/social.
- Calculatoarele (SEO gratuit, cost 0).

## D. Ce eliminăm/simplificăm

- **Pagini nișă placeholder cu 0 partener real** (rochii-mireasa, echipament-moto, pescuit-
  fallback) → noindex sau ștergere până există partener. Nu diluăm autoritatea pe pagini goale.
- **Generarea zilnică de blog AI** → throttle (vezi G + H).
- **products.json 3.4MB** → limitează la produsele afișate efectiv (top per magazin), nu tot.
- **Video zilnic + toate canalele social în pipeline** — păstrăm generarea, dar nu forțăm
  zilnic dacă nu e conținut nou real.

## E. Ce fac competitorii mai bine

- **Kuplio:** coduri reale zilnice + review-uri produse + extensie funcțională live + SEO
  matur (ani de backlinks). Trafic real (SimilarWeb îi dă volum, noi ~0).
- **Picodi:** cashback real (1-30%) ca hook — motiv concret să te întorci, nu doar coduri.
- **Cuponeria:** 20.400 backlinks, ritm zilnic, Pinterest masiv.
- **Toți:** randare server-side rapidă, homepage clar, encredere (recenzii, "verificat azi").

## F. Cum îi depășim (realist, nu fantezie)

Nu la scară (ei au ani + backlinks). La **onestitate + nișă + viteză**:
1. Server-side rapid (mulți concurenți mici sunt lenți) — câștig tehnic real.
2. **Voce editorială "Alex recomandă / merită-nu merită"** — ei sunt agregatoare reci; noi
   avem un om cu opinie. Ăsta e diferențiatorul necopiat (vezi `project_amcupon_editorial_radar`).
3. Nișe unde ei sunt slabi (eSIM, AI tools, hosting, solar) — long-tail cu comision mare.
4. Backlinks agresiv (blocajul #1) — Pinterest, directoare, cross-promo.

## G. Pipeline & push automat — verdict

**Starea reală:** deja optimizat la **3 rulări/zi** (nu 9): sync date 07:00+19:00, pipeline
complet 08:00. Commit-ul are deja guard `git diff --staged --quiet` → **nu face push dacă nu
sunt schimbări reale**. Deci spam-ul de push NU e problema pe care o bănuiai — e deja rezolvat.

**Ce E de schimbat:** pipeline-ul complet de dimineață generează ZILNIC blog + best-of + AI
guides + comparisons + video + social + descrieri. Asta:
- consumă `ANTHROPIC_API_KEY` zilnic (cost real pe usage)
- produce conținut care se schimbă des fără valoare nouă (risc thin content)

**Recomandare concretă:**
- Sync date: **rămâne 2x/zi** (bun, ieftin).
- Blog/AI guides/comparisons: **din zilnic în 2x/săptămână** (marți + vineri) SAU declanșat
  doar când apar promoții noi semnificative. Tai ~70% din apelurile Claude din pipeline.
- Video + social: **rămân zilnice DAR** doar dacă digest-ul are conținut nou (guard pe diff).
- Adaugă **mod editorial**: conținutul AI merge într-un branch/draft, nu direct live, pentru
  articolele "grele" (ghiduri) — review rapid de la tine înainte de publish. Ofertele/datele
  rămân automate.

## H. Blogul — din fabrică în motor SEO

Regula nouă per articol (altfel nu se publică):
- 1 keyword clar + intenție (cumpărare/comparație/review)
- imagine RELEVANTĂ (cover pe brand generat, nu random — deja reparat, dar verifică toate)
- min. 3 linkuri interne + 1 CTA afiliat real
- fără articole "umplutură" fără magazin real în spate

Tipuri prioritare (volum + monetizare): ghiduri cumpărare, "cel mai bun X", comparații
X vs Y, "merită sau nu {magazin}", reduceri sezoniere, eSIM/VPN/hosting/AI tools/solar.
**Mai puține articole, mai bune.** 20 articole solide > 109 subțiri.

## I. Review-uri & încredere

Ai deja `ReviewSection.tsx` + Supabase (0 recenzii reale). Kuplio are review-uri = avantaj lor.
**Plan onest (fără rating-uri inventate):**
- **"Alex recomandă"** — verdict editorial transparent per magazin: merită/nu, pro/contra,
  criterii explicite. Ăsta nu are nevoie de useri, îl scrii tu/AI cu voce.
- **Scor ofertă afișat** (îl ai calculat în `scor_comercianti.py`, doar nu-l arăți) — badge
  "ofertă puternică" pe carduri, cu criteriu explicat.
- Recenzii user rămân deschise, dar NU inventăm — până vin, folosim verdict editorial marcat clar.

## J. Nișe de atacat — vezi `NISE-MASTER.md` (nu duplicăm)

Top acum (scor ≥40): eSIM, hosting, suplimente, AI tools, cadouri. Comision mare + long-tail
unde concurenții mari sunt slabi. Sistemul de testare 14-30 zile e în `PLAN-REPLICARE-SITEURI-AFACERI.md`.

## K. Servicii proprii — vezi `Desktop/Claude/Imperiu/VIBETRACE-GROWTH-SUITE.md`

10 servicii scorate (newsletter setup, popup-uri, landing pages, automatizări social etc.).
Verdict: **Faza 1, DUPĂ venit AmCupon constant** — nu acum (regula focus exclusiv).

## L. Ce faci manual azi (tu, deblochezi cel mai mult)

1. **Validează sender Brevo** → deblochează welcome + alerte preț (0€, 5 min).
2. **Decide A vs B** pe coduri (întrebarea existențială de sus).
3. Trimite extensia la review (asset-uri gata în `extension/store-assets/`).
4. GSC: URL Inspection pt paginile noi (nu câmpul sitemap).
5. Postează din `data/bannere-nise/` (9 gata) — backlink + trafic.

## M. Ce implementez eu (în ordine, după decizia ta A/B)

1. **Pivot limbaj cod→ofertă** (dacă alegi A) SAU **adăugare coduri reale** (dacă B) — peste
   tot: title, carduri, extensie, hero.
2. **Homepage server-side** (cel mai mare câștig perf+SEO).
3. **Throttle pipeline AI** (blog/guides 2x/săpt, guard pe conținut nou).
4. **noindex/ștergere pagini placeholder** goale.
5. **"Alex recomandă" + scor ofertă afișat** (încredere).
6. Blog: regula nouă + curățare articole subțiri.

## N. Ce aduce bani RAPID

- Sender Brevo (alerte preț = revin userii = click-uri afiliate).
- Coduri/oferte oneste pe top 20 magazine mari (unde e traficul de căutare).
- Postare zilnică din bannerele gata (singurul trafic pe termen scurt).
- Reparare ultimele money-leak (95 linkuri fără comision).

## O. Ce construiește pe TERMEN LUNG

- Backlinks (autoritate) — blocajul real.
- Voce editorială "Alex recomandă" (diferențiator necopiat).
- Homepage/site rapid server-side (fundație tehnică).
- Nișe validate prin circuitul semi-închis → active proprii → servicii (Faza 1).
