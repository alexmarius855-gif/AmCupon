# 🏗️ PLAN REPLICARE — de la nișă testată la business propriu

> Regula de bază: **nu construim 100 site-uri goale.** Construim teste mici, măsurăm,
> scalăm doar ce dovedește cu date că merită. Acesta e arborele de decizie — "ce
> container aleg pentru nișa asta?" Circuitul complet (testare → validare → business
> propriu) e documentat în `NISE-MASTER.md`; acest fișier detaliază DOAR pasul
> "ce construiesc concret", care lipsea.

---

## 🌳 Arborele de decizie — ce container aleg?

```
Nișă nouă descoperită
        │
        ▼
  Are deja categorie_slug / pagină pe AmCupon?
        │
   DA ──┴── NU
   │          │
   ▼          ▼
Adaug      E suficient trafic potențial pt o
oferte     pagină noua PE AmCupon (/nisa-noua)?
in pagina         │
existenta    DA ──┴── NU (nișă foarte specifică, alt public)
                  │              │
                  ▼              ▼
            Pagina nouape    Landing page separată
            AmCupon (1 zi)    (subdomeniu/cont nou, 1-2 zile)
                  │              │
                  └──────┬───────┘
                         ▼
              14-30 zile: masor trafic (GSC) +
              clickuri afiliate (GA4) + comisioane reale
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
           SLAB      MEDIU       BUN
        (arhiveaza) (las activ, (avansez)
                     nu extind)      │
                                     ▼
                    Are sens TOOL propriu in nisa asta?
                    (calculator, alerta pret, comparator)
                         │
                    DA ──┴── NU
                    │           │
                    ▼           ▼
              Construiesc    Are sens NEWSLETTER
              tool-ul pe     de nisa? (frecventa
              AmCupon        cumparare + pasiune)
                    │              │
                    │         DA ──┴── NU
                    │         │          │
                    │         ▼          ▼
                    │    Segment nou   Raman doar
                    │    in Radar de   pagina + social
                    │    Reduceri
                    │
                    ▼
        Nișa PRODUCE bani reali 3+ luni consecutiv?
                    │
               DA ──┴── NU
               │          │
               ▼          └─► Ramane motor pe AmCupon, atat.
    Imi place + vad potential
    de BRAND propriu (nu doar
    agregare)?
               │
          DA ──┴── NU
          │          │
          ▼          ▼
    Cumpar domeniu    Ramane motor pe AmCupon
    + fac site/brand   (suficient, nu orice nisa
    dedicat             trebuie sa devina business)
```

---

## 📏 Reguli concrete per opțiune

### 1. Pagină nouă pe AmCupon (`/nisa`)
**Când:** categoria are 5+ magazine cu link afiliat real, dar nu se încadrează curat
în categoriile existente (ex: `/esim`, `/pescuit`).
**Cost:** 0€. **Timp:** o sesiune de lucru.
**Motor reutilizabil:** `BrandPageTemplate.tsx` / pattern-ul de pagină nișă deja stabilit.

### 2. Landing page separată (subdomeniu sau pagină simplă)
**Când:** publicul e clar diferit de AmCupon (ex: B2B, o limbă diferită, o intenție
foarte specifică) DAR nu justifică încă un domeniu propriu.
**Cost:** 0€ (subdomeniu Vercel). **Timp:** 1-2 zile.

### 3. Tool propriu (calculator/alertă/comparator)
**Când:** există o întrebare recurentă cu volum de căutare ("cât economisesc cu
codul X", "cel mai bun preț la Y") pe care o pagină statică n-o rezolvă.
**Cost:** 0€, doar timp de cod. **Precedent:** `/calculator`, `/calculator-salariu`.

### 4. Newsletter de nișă (segment în Radar de Reduceri, NU cont nou)
**Când:** nișa are frecvență de cumpărare (nu o dată/an) ȘI pasiune (oamenii vor
să afle primii). **Cost:** 0€ — Brevo suportă segmente/tag-uri pe aceeași listă.

### 5. Domeniu + site/brand propriu
**Când, TOATE trebuie bifate:**
- ✅ nișa a produs comision real 3+ luni consecutiv prin afiliere pe AmCupon
- ✅ Alex vrea să investească timp emoțional acolo (nu doar bani)
- ✅ există loc pentru diferențiere reală (nu doar reagregare de linkuri)

**Cost:** ~10-15€/an domeniu + 0€ hosting (Vercel free tier).
**Nu cumperi domeniul ÎNAINTE să ai cele 3 bife.** Domeniile nefolosite = bani morți.

### 6. Shopify / produs propriu / brand fizic
**Când:** nișa validată (pasul 5) ARE producători/dropshippere/print-on-demand
reali disponibili ȘI marja e credibilă (verifici cost produs + livrare + retur
înainte, nu după). **Asta e ultima treaptă, nu prima.** Nu se face din faza 0-500€/lună.

---

## ⏱️ Ciclul unui test (14-30 zile, ca în NISE-MASTER)

| Zi | Acțiune |
|----|---------|
| 0 | Pagină/conținut publicat + link intern din AmCupon + 1 postare social |
| 1-7 | Postări zilnice din nișă (`generate_niche_banners.py` are deja șablonul) |
| 7 | Request indexing în GSC pentru pagina nouă |
| 14 | Prima verificare: trafic (GSC), clickuri (GA4), comision (dashboard rețea) |
| 30 | Decizie: arhivă / rămâne motor / avansează la pasul următor din arbore |

**Nu ține teste "la infinit".** Dacă la 30 zile nu are trafic ȘI nu are click-uri,
marchezi `arhiva` în `data/nise-master.csv` și treci la următoarea din top 20.
