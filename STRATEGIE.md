# Strategie Alex — Viziune completa

> Actualizat: 29.06.2026 | Target: €50.000 net pana Dec 2026

---

## Cine sunt si ce construiesc

**Alex, 26 ani, Romania.** Construiesc un ecosistem de venituri pasive si semi-pasive online,
fara angajati, de pe orice calculator sau telefon. Modelul: construiesc odata, incasez continuu.

**Regula de aur:** Focus exclusiv pe AmCupon pana curg primii bani. Restul ideilor se noteaza
si se activeaza pe rand, in ordinea ROI-ului.

---

## Proiectele active

### 1. AmCupon.ro — PRIORITATE #1
Site afiliat LIVE cu 170+ magazine, pipeline automat la 4h, tema dark indigo/cyan.
Surse de venit: comisioane afiliere (2Performant + Profitshare + Impact.com) + AdSense viitor.

**Motoare de crestere:**
- Pagini nisa noi (fiecare = SEO + afiliere per categorie)
- Radarul AmCupon `/radar` — editorial zilnic cu voce (Claude haiku)
- Newsletter (4 abonati reali, Brevo blocat — de reparat)
- Video AI zilnic din digest-today.txt → TikTok/Reels

**Stack tehnic:** Next.js 16 + React 19 + Tailwind 4 + Vercel + GitHub Actions
**Repo:** https://github.com/alexmarius855-gif/AmCupon (PUBLIC — necesar pentru Actions gratuit)

### 2. AlexMarinescu.ro — In asteptare
Blog personal + brand personal. Activat dupa primii bani din AmCupon.
Directie: site 3D/animat fara fata (avatar abstract), cursuri AI, newsletter "Saptamana in AI".

### 3. Trading Bot v9 — Oprit temporar
Bot Binance pe VPS 199.247.2.194. Oprit din 06.06.2026 (API key invalid). De reluat separat.

---

## Pagini live AmCupon cu partener real

| Pagina | Partener | Comision | Canal promovare |
|--------|----------|----------|-----------------|
| `/flori` | floria.ro (2P) | 7% | Pinterest, TikTok ocazii |
| `/pescuit` | pescar-expert.ro (in aprobare) | 5-6% | YouTube, Facebook pescari |
| `/fashion` | FashionDays, Answear | 5-8% | TikTok, Instagram Reels |
| `/frumusete` | Notino, DrMax | 4-7% | YouTube, TikTok skincare |
| `/electronice` | Altex, Flanco | 2-4% | YouTube comparatii |
| `/animale` | Petmart, Petmax | 4-6% | TikTok (viral nativ) |
| `/farmacie` | DrMax, Liki24 | 3-5% | Facebook grupuri |
| `/calatorie` | KKday, Pelago (Impact) | 5-10% | Blog, Pinterest |
| `/trading` | Binance ref | fix | YouTube, newsletter |
| `/hosting` | Hostinger (Impact) | 30-60% | Blog tech, YouTube |
| `/vpn` | NordVPN, AdGuard (Impact) | 30-40% | YouTube, TikTok |
| `/radar` | — | AdSense | Newsletter, Telegram, TikTok |
| `/calculator-salariu` | — | AdSense | SEO organic |
| `/generator-proforma` | — | AdSense | SEO, Facebook freelanceri |

---

## Nise urmatoare (in ordinea prioritatii)

1. **Gradina/plante** — sezon activ, Plantor.ro pe PS (aplica acum)
2. **Hrana animale** — achizitie repetitiva, Zooplus pe PS
3. **Suplimente/fitness** — marje mari, Vegis.ro pe 2P
4. **Copii/bebelusi** — ocazii frecvente, Noriel pe 2P
5. **Zboruri** — volum mare, esky.ro sau Kiwi pe PS
6. **Bricolaj** — Brico Depot/Dedeman cand se aproba

**Regula:** construim pagina DOAR dupa ce avem partener real aprobat.
Fara link = fara pagina (nu are rost SEO fara monetizare).

---

## Canale de promovare

```
CANAL           NISE POTRIVITE                  EFORT
TikTok          animale, fashion, radar zilnic   Mic (30s clip AI)
YouTube         pescuit, tech, hosting           Mare (10+ min)
Pinterest       flori, calatorie, cadouri        Mic (pin automat)
Facebook grp    pescuit, animale, farmacie       Mic (link + text)
SEO organic     calculatoare, blog, nise long    Zero (automat)
Newsletter      radar zilnic, top saptamana      Mic (automat Brevo)
Telegram        radar zilnic                     Zero (copy-paste)
```

---

## Flux video AI (fara fata, fara filmare) — AUTOMATIZAT 29.06.2026

```
1. digest-today.json  →  script vocal scurt    (generate_video_daily.py)
2. script             →  voce RO + subtitrari   (edge-tts, GRATIS fara cont)
3. voce + fundal brand→  MP4 vertical 1080x1920 (ffmpeg, fundal PIL fara portocaliu)
4. rezultat           →  amcupon.ro/video-today.mp4 + caption-uri per platforma
5. MANUAL (Alex)      →  descarci MP4 → postezi pe TikTok / Reels / Shorts
```

Cost total per clip: **$0** (edge-tts + ffmpeg, fara niciun API key platit).
Ruleaza automat in pipeline dimineata. Singurul pas manual: descarci si urci
clipul (postarea video nu se automatizeaza fara API-uri platite / risc de ban).
Caption-uri gata de copiat: `amcupon.ro/video-captions.txt`.

---

## Reguli de lucru cu Claude Code

- **Raspunde intotdeauna in romana**
- **Push pe main = confirmare explicita in chat inainte** (fara exceptii)
- **NU folosi orange in UI** (logo-ul are gradient, UI-ul nu)
- **Site lejer si curat** — fara clutter pe carduri, fara grafice de pret
- **Tokeni eficient** — Claude haiku pentru scripturi, Sonnet pentru creatie publica
- **Nu construi pagina nisa fara partener aprobat**
- **Nu promova ChatGPT/OpenAI/Claude** — nu au program afiliere public
- **Repo AmCupon TREBUIE sa ramana PUBLIC** (Actions gratuit nelimitat)
- **cursuri-ai.ro de eliminat pana 07-07-2026**
- **outfitblack.ro de eliminat pana 10-07-2026**

---

## De facut imediat (Alex)

- [ ] Brevo: reactiveaza sender `newsletter@amcupon.ro` (4 abonati asteapta)
- [ ] Brevo: adauga atribut `ALERT_STORES` (tip Text) in Contact attributes
- [ ] Profitshare: apasa "Valideaza" dupa deploy — meta tag e live acum
- [ ] 2Performant: aplica la Plantor.ro / gradinarit / plante

## De facut imediat (Claude)

- [ ] Investigheaza scaderea de la 370 la 174 magazine
- [ ] Pagina `/gradina` dupa aprobare partener
- [ ] Telegram Radar — poster zilnic automat
- [ ] Notion "Idei & Afaceri" — expandat cu toate nisele
