# 🔑 Deblocare AmCupon — cele trei acțiuni pe care numai tu le poți face

> **De unde vine:** artifactul „Deblocare AmCupon" (16.08.2026), mutat în repo pe **08.09.2026**
> ca să nu mai trăiască separat de proiect. Un plan care stă într-o pagină pe care n-o deschide
> nimeni nu e plan, e amintire.
>
> **Ce s-a schimbat la mutare:** am reverificat toate cifrele pe repo și pe `output.json`.
> Una din trei acțiuni s-a făcut între timp (studiul e construit și live), iar **cifra centrală
> a studiului s-a mișcat de șase ori** — 0,5% în august, 3,0% azi. Emailul din artifact,
> trimis azi ca atare, ar conține o cifră falsă.
>
> **Verificat ultima dată: 09.09.2026**, pe datele aduse de pipeline la 08.09 ora 19:41 UTC.
>
> **Regula documentului:** nimic nu se bifează pe încredere. Fiecare stare de mai jos are o
> comandă care o verifică. Rulează întâi:
>
> ```bash
> python scripts/verifica_deblocare.py
> ```

---

## Starea celor trei, la 09.09.2026

| # | Acțiune | 16.08 | 09.09 | Blocajul real |
|---|---|---|---|---|
| 1 | **Temu, Shein, Trendyol** | deschis | **încă deschis** — și sunt 37, nu 3 | conturi de rețea, numai tu |
| 2 | **Cele două atribute Brevo** | deschis | **încă deschis** — codul le cere în 3 fișiere | cont Brevo, numai tu |
| 3 | **Studiul pentru backlink** | de construit | **pagina e live și sincronă cu datele** | au rămas email-urile, numai tu |

Sunt independente. Poți începe cu oricare. Ordinea de mai sus e după cât de repede se văd banii.

---

## 1. Magazinele care primesc clicuri și nu plătesc nimic

**Ce deblochează:** comision pe trafic pe care îl ai deja · **Unde:** rețelele unde ești deja
publisher · **Durează:** ~20 min + așteptare aprobare

### Cifra reală, măsurată azi

Artifactul vorbea de trei magazine. Sunt **37 de magazine live pe site cu `url_afiliat` identic
cu `url`** — adică linkul dus la utilizator e linkul normal al magazinului, fără niciun tracking.
Șase dintre ele au și promoție afișată, deci primesc clicurile cele mai bune.

| Grup | Câte | Situația |
|---|---|---|
| `temu.com`, `shein.com`, `trendyol.com` | 3 | `platforma: direct`, adăugate manual, niciodată afiliate |
| Magazine Impact fără link generat | 34 | aprobate în Impact, dar exportul n-a adus linkul |

Grupul crește singur: 36 pe 08.09, 37 pe 09.09. Fiecare import Impact aduce magazine noi, iar
cele fără link intră direct în găleata asta.

```bash
# lista completă, oricând
python scripts/verifica_deblocare.py --leak
```

### Începe de unde ești deja înscris

Cea mai rapidă cale nu e site-ul brandului, ci contul de rețea pe care îl ai deja. Un program
găsit într-o rețea unde ești publisher se aprobă cu un buton, fără cont nou și fără verificare
de la zero.

- [ ] **Awin, CJ Affiliate, Impact** — caută în directorul de advertiseri `Shein`, `Temu`,
      `Trendyol`. Unde apare, „Join / Apply" și ai terminat.
- [ ] **Shein** — a fost listat pe Awin, CJ și Admitad. Verifică Awin și CJ întâi; dacă nu apare,
      Admitad e varianta (cont nou, dar `import_generic_affiliate.py` suportă deja formatul).
- [ ] **Trendyol** — program oficial pentru România, direct pe site-ul lor:
      `trendyol.com/ro/s/trendyol-influencer-program`.
- [ ] **Temu** — program propriu, în afara rețelelor. „Temu affiliate" pe site-ul lor.
- [ ] **Cele 33 de la Impact** — nu e nevoie de aprobare nouă, sunt deja aprobate. Lipsește
      linkul din export. Reia exportul de linkuri din Impact și dă-mi CSV-ul.

La formularul de înscriere, la descrierea site-ului, folosește cifre reale — cresc rata de
aprobare: site de cupoane, **1.148 de magazine urmărite**, actualizare automată la 4 ore,
trafic organic din Google, fără trafic plătit și fără PBN-uri.

> **Când vine aprobarea, nu-mi trimite doar vestea bună — trimite exportul CSV cu linkul REAL
> din dashboard.** Regula e scrisă în `docs/LECTII-TEHNICE.md` după un bug care ne-a costat:
> cineva a adăugat cândva linkuri „probabil așa arată", iar 208 magazine au trăit luni întregi
> cu tracking fals. Un link ghicit e mai rău decât niciun link — arată ca și cum ai fi plătit,
> dar nu ești.

După ce ai CSV-ul, importul e o comandă:

```bash
python scripts/import_generic_affiliate.py --network awin --file data/awin_export.csv
```

### Un al doilea lucru, tot aici

Cele trei magazine `direct` au în `output.json` `cod_cupon: true`, dar promoția lor nu conține
niciun cod (`cod_cupon: ""`). Pe site apar cu semn de „are cod" fără să aibă. E exact tiparul
reparat pe 07.09 la „Cashback" — un semnal adevărat în structură, fals pentru cititor. Se repară
în `data/extra_merchants.json` odată cu linkurile.

---

## 2. Cele două atribute din Brevo

**Ce deblochează:** emailurile de ziua 3 și 7 + alertele de cod nou · **Unde:** Brevo → Contacts ·
**Durează:** 2 minute

Seria de bun-venit și alertele de preț sunt scrise și pornesc în pipeline. Nu trimit nimic
fiindcă le lipsesc două câmpuri pe care codul le cere:

| Atribut | Cerut de | Ce se rupe fără el |
|---|---|---|
| `WELCOME_STEP` | `scripts/send_welcome_series.py`, `frontend/app/api/newsletter/route.ts` | seria de bun-venit nu avansează niciodată de la pasul 0 |
| `ALERT_STORES` | `scripts/check_price_alerts.py` | alertele de cod nou n-au pe cine anunța |

- [ ] Brevo → **Contacts** → **Settings** (rotița, dreapta sus) → **Contact attributes**
- [ ] „Add an attribute" → nume exact `WELCOME_STEP`, tip **Text**
- [ ] încă o dată, `ALERT_STORES`, tot **Text**

> **Numele trebuie scris identic**, majuscule și underscore. Brevo nu dă eroare la un nume greșit:
> primește atributul necunoscut și îl aruncă în tăcere. De-aia n-a observat nimeni că lipsește,
> luni de zile.

**Cum verifici:** abonează-te la newsletter cu o adresă nouă, apoi caută contactul în Brevo. Dacă
`WELCOME_STEP` e completat cu ceva, e legat corect. Emailul de ziua 3 pleacă la prima rulare de
pipeline după ce trec 3 zile.

**Atenție, blocaj separat pe același traseu:** senderul `newsletter@amcupon.ro` e încă
nevalidat (vezi `docs/strategie/STRATEGIE.md`). Atributele fac seria să *pornească*; senderul
face emailul să *plece*. Ai nevoie de amândouă.

---

## 3. Studiul care aduce backlink

**Ce deblochează:** autoritate de domeniu, deci indexare · **Durează:** o după-amiază

Concurentul cu ~350.000 de vizite pe lună se ține pe vreo cinci linkuri editoriale reale — bara
e mult mai joasă decât pare.

### Ce era de făcut în august și e făcut acum

- [x] **Pagina de studiu** — `frontend/app/studiu/coduri-reducere-romania/`, live, cu grafic
      pe categorii și limitele metodei scrise pe pagină
- [x] **Se actualizează singură** — `scripts/generate_studiu_cupoane.py` rulează în pipeline
      (pasul „Genereaza datele studiului") și rescrie `frontend/public/studiu-cupoane.json`.
      Nicio cifră nu e hardcodată în pagină.
- [x] **Textele de presă** — `docs/operational/PITCH-PRESA.md`, șase ținte, mesaje diferite
      pentru fiecare
- [x] **linkpro.ro** — articol + listare trimise pe 22.08 (nofollow, dar e primul)

### Ce a rămas

- [ ] **Recalculează cifra înainte să trimiți orice** (vezi mai jos — s-a mișcat mult)
- [ ] **Patru email-uri, nu patruzeci** — retail.ro, StartupCafe, Profit.ro, Economedia.
      Primele două au dat deja link concurentului. Textele sunt în `PITCH-PRESA.md`.
- [ ] **Scrie-i unei persoane, nu redacției** — caută cine a semnat ultimul articol despre
      e-commerce și scrie-i lui

### ⚠️ Cifra s-a mutat de sub tine

Povestea din august era „din 1.162 de magazine, doar 6 au un cod real" — **0,5%**. Azi:

| Sursă | Data | Magazine cu cod real | Procent |
|---|---|---|---|
| Artifactul original | 16.08.2026 | 6 din 1.162 | 0,5% |
| `PITCH-PRESA.md` | 22.08.2026 | 18 din 1.156 | 1,6% |
| `studiu-cupoane.json` (pagina publică) | 07.09.2026 | 10 din 1.148 | 0,9% |
| `output.json` + pagina, sincrone | **09.09.2026** | **35 din 1.153** | **3,0%** |

Creșterea nu e o eroare — sunt ofertele Impact conectate pe 07.09 (commit `f5fc780`). Ce
înseamnă:

1. **Desincronizarea s-a reparat singură.** Pe 08.09 pagina arăta 0,9% iar datele 2,7%;
   pipeline-ul a rulat de trei ori pe 08.09 și acum ambele spun 3,0%. Verifică oricând cu
   `python scripts/verifica_deblocare.py` — dacă iar apare „PAGINA E IN URMA DATELOR", nu
   trimite nimic presei până nu rulezi `generate_studiu_cupoane.py`.
2. **Titlul se schimbă, și textele de presă sunt depășite.** „Doar 6 din 1.162" era o știre.
   „35 din 1.153" e tot o cifră mică (3,0%), dar altă poveste: nu „nu există cupoane", ci
   **„97% dintre magazinele online românești n-au niciun cod de reducere activ azi"**.
   `PITCH-PRESA.md` (1,6%, 18 magazine) și `TEXTE-DIRECTOARE.md` sunt scrise pe cifra din
   august — **rescrie-le la cifra zilei în care trimiți**, nu invers.

> **Spune limita în articol, nu o ascunde.** Cifra acoperă magazinele accesibile prin rețelele
> de afiliere și codurile publice de acolo. Un magazin care dă coduri doar pe newsletter sau în
> aplicație nu intră la socoteală. Dacă nu scrii asta, primul jurnalist care întreabă te prinde
> și pierzi și articolul, și relația. Dacă o scrii, arăți că știi ce măsori.

---

## Întreținerea documentului

Documentul ăsta e util doar cât timp cifrele din el sunt de azi. Regula:

- **Înainte să-l citești ca adevăr**, rulează `python scripts/verifica_deblocare.py` — el
  citește datele reale, nu textul de aici.
- **Când o acțiune se face**, bifează și scrie data lângă ea. Nu șterge rândul: istoricul lui
  „când s-a deblocat" e singurul mod de a măsura cât a stat blocat.
- **Când o cifră din tabele se schimbă**, actualizeaz-o aici în același commit. Un tabel vechi
  e mai rău decât niciun tabel.

**Legături:** [`ACTIUNI-VENIT.md`](ACTIUNI-VENIT.md) (lista lungă de acțiuni manuale) ·
[`BACKLINK-PLAN.md`](BACKLINK-PLAN.md) (directoare + strategia de linkuri) ·
[`PITCH-PRESA.md`](PITCH-PRESA.md) (textele de trimis) ·
[`GHID-EXPORT-RETELE.md`](GHID-EXPORT-RETELE.md) (cum scoți CSV-ul din fiecare rețea) ·
[`../LECTII-TEHNICE.md`](../LECTII-TEHNICE.md) (de ce nu ghicim linkuri)
