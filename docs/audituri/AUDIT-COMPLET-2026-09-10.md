# Audit complet AmCupon.ro — 10.09.2026

> **Metoda:** măsurat, nu presupus. Pagini live interogate direct, eșantion aleator de 45 de
> URL-uri din sitemap, plus inventarul din `output.json` și raportul de linkuri interne.
> Fiecare cifră de mai jos se poate reproduce cu comanda de lângă ea.
>
> **Ce NU acoperă:** date din Google Search Console și Analytics — vezi de ce la CRITIC-1.
> Fără ele, nu pot spune care pagini aduc trafic, doar care *ar putea*.

---

## Rezumat: diagnosticul e altul decât se aștepta

Am pornit căutând probleme tehnice. **Nu prea sunt.**

| Verificare | Rezultat pe 45 de pagini |
|---|---|
| Răspund cu 200 | 45 / 45 |
| Conținut subțire (sub 300 cuvinte) | **0** — minim 401, mediană 952, maxim 2.525 |
| Fără canonical | 0 |
| Fără H1 sau cu H1 multipli | 0 |
| Fără date structurate (JSON-LD) | 0 |
| Marcate `noindex` din greșeală | 0 |
| Greutate mediană | 113 KB |

Sitemap valid, 403 URL-uri, robots.txt corect, TTFB 175 ms, cache Vercel activ.

**Concluzia:** partea tehnică nu e frâna. Frâna e că **site-ul nu poate fi măsurat**, iar
inventarul nu susține promisiunea din titlu. Astea sunt problemele reale, în ordine.

---

# CRITIC

## C1. Site-ul își blochează singur instrumentele de măsurare — pe producție, acum

**Ce e greșit.** Antetul `Content-Security-Policy` din `frontend/next.config.ts` nu include
`va.vercel-scripts.com` și `cdn.2performant.com` în `script-src`. Verificat live azi:
ambele sunt încă blocate pe amcupon.ro.

Consecințe: **Vercel Analytics și Speed Insights nu au înregistrat niciodată nimic**, deși
sunt importate în `layout.tsx` și par instalate. Scriptul Link2 al 2Performant — rețeaua cu
507 magazine — nu rulează.

**De ce contează.** Nu e o problemă de SEO, e o problemă de orbire. Nu poți răspunde la
„ce pagină aduce trafic", „de unde vin oamenii", „ce convertește" — nu pentru că datele sunt
proaste, ci pentru că nu există. Fiecare decizie de până acum s-a luat pe presupuneri.

**Cum se repară.** Adaugă cele două domenii în `script-src`. Reparația e deja scrisă local,
**necomisă**. Repo-ul local e și cu 6 commit-uri în urma originii.

**Impact:** deblochează măsurarea, adică toate deciziile ulterioare. **Dificultate:** o linie.

## C2. 37 de magazine primesc clicuri și nu plătesc nimic

**Ce e greșit.** 37 de magazine au `url_afiliat` identic cu `url` — linkul dus utilizatorului
e linkul normal al magazinului, fără tracking. 34 sunt din Impact (aprobate, dar exportul
n-a adus linkul), 3 sunt adăugate manual (`temu.com`, `shein.com`, `trendyol.com`).

**De ce contează.** Comision zero pe traficul pe care îl ai deja. Nu e trafic viitor
ipotetic — sunt clicuri care se pierd azi.

**Cum se repară.** Pentru cele 34 de la Impact: reia exportul de linkuri, nu e nevoie de
aprobare nouă. Pentru cele 3: aplică în rețelele unde ești deja publisher.
Verificare: `python scripts/verifica_deblocare.py --leak`

**Impact:** direct pe venit. **Dificultate:** mică tehnic, dar pasul e manual, în conturi.

## C3. Linkul cel mai valoros de pe pagina unui magazin nu e afiliat

**Ce e greșit.** Pe `/cod-reducere/answear.ro`, printre linkurile către
`event.2performant.com` (corecte, cu `aff_code`), apare și un link simplu către
`https://answear.ro` — fără niciun tracking.

**De ce contează.** Ăla e clicul cu cea mai mare intenție de cumpărare de pe toată pagina:
omul a citit despre magazin și vrea la magazin. Se duce, cumpără, tu nu iei nimic.

**Cum se repară.** Orice link către domeniul magazinului, de pe pagina magazinului, trece
prin `url_afiliat`. Dacă lipsește, linkul nu se afișează deloc — vezi lecția „semnalele
fabricate": mai bine niciun link decât unul care pare că plătește și nu plătește.

**Impact:** direct pe conversie. **Dificultate:** mică, e o regulă în componentă.

---

# MARE

## H1. Fără trafic, restul e teoretic

Ultima măsurătoare (22.08.2026, export GSC): **64 de pagini indexate, 22 de clicuri din
Google în trei luni, 0 backlink-uri externe** în afară de AlexMarinescu.ro.

Nimic din ce urmează în audit nu contează până nu se mișcă asta. Partea tehnică e curată
tocmai ca să nu fie ea scuza — Google nu crawlează un domeniu fără niciun link extern,
indiferent cât de curat e sitemap-ul.

**Cum se repară:** `docs/operational/BACKLINK-PLAN.md` și `PITCH-PRESA.md`, ambele scrise,
ambele nefolosite. **Atenție:** cifra din ele (1,6%) e depășită — azi e 3,0%.

## H2. Inventarul susține 3% din promisiune

| | |
|---|---|
| Magazine în bază | 1.153 |
| Cu promoție activă | 123 (11%) |
| Cu cod de reducere real | **35 (3,0%)** |
| Fără nicio ofertă | 1.030 (89%) |

Titlul spune „coduri de reducere", iar 97% din magazine n-au niciunul. Nu e o problemă de
onestitate — pagina nu minte — dar e o problemă de potrivire între promisiune și marfă.

Cele 403 pagini din sitemap, față de 1.153 de magazine, sunt o **decizie corectă**
(`lib/seoIndexable.ts` ține paginile goale în afara sitemap-ului). Nu forța indexarea
celorlalte 1.016: ar fi 1.016 pagini subțiri, exact ce penalizează Google.

**Direcția corectă:** nu mai multe pagini de cupoane, ci altă promisiune pe aceleași date.

## H3. Homepage-ul cântărește 1,5 MB

477 KB HTML + **1.068 KB de script inline** (datele Next.js), 184 de imagini, 339 de linkuri.
TTFB e bun (175 ms, cache HIT), dar costul e la parsare, pe telefon, pe rețea slabă.

**Cum se repară:** mai puține date trimise în prima încărcare — secțiunile de sub prima
vedere (produse, magazine partenere) încărcate la cerere, nu în payload-ul inițial.

## H4. Zero venit din reclamă

AdSense e permis în CSP dar **nu apare pe nicio pagină verificată**. Cu trafic mic, AdSense
oricum nu aduce nimic — dar merită știut că linia asta e la zero, nu că e mică.

## H5. Linkurile afiliate nu sunt marcate `sponsored`

Doar 5 din 14 linkuri externe au `rel="nofollow"` sau `sponsored`. Google cere explicit
`rel="sponsored"` pe linkuri afiliate. Nu e penalizare automată, dar e semnal de calitate,
și e gratis de reparat.

---

# MEDIU

## M1. Sub-id-ul de atribuire depinde de JavaScript
Linkurile pleacă din HTML fără `st=`; sub-id-ul se adaugă la click, din browser. Dacă
scriptul nu rulează, clicul se atribuie fără sub-id — comisionul vine, dar nu știi de unde.
Ruta `/go/[magazin]` face asta pe server și **nu e folosită de nicio pagină verificată**.

## M2. Două linkuri interne rupte
Din 955 de linkuri pe 94 de pagini. Puțin, dar gratuit de reparat.

## M3. `/oferte-azi` are 7.161 de cuvinte și 490 de butoane „Vezi oferta"
O pagină cu 490 de îndemnuri nu are niciun îndemn. Paginare sau filtrare.

---

# MIC

- **L1.** Titlurile de pagină nu conțin anul — „Cod reducere X" vs „Cod reducere X (2026)".
- **L2.** Menționarea afilierii apare pe pagina de magazin, dar nu pe `/oferte-azi`.
- **L3.** Robots.txt interzice `/go/`, corect — dar nicio pagină nu folosește `/go/`.

---

# Verdictul strategic: ce ar trebui să fie AmCupon

Ai cerut să aleg între cinci variante. Răspunsul măsurat:

**C + D — sursă de trafic și brand de cupoane, dar NU brandul principal al ecosistemului.**

**De ce nu A (brand principal):** categoria de cupoane e în declin, dominată de jucători
mari, cu marje subțiri — și inventarul tău susține 3% din propria promisiune. Un brand
umbrelă construit pe „cupon" moștenește un plafon pe care nu-l poți ridica.

**De ce nu E (redesign):** n-ar rezolva nimic. Auditul arată că designul și codul nu sunt
problema. Un redesign ar consuma săptămâni și ar lăsa cele trei probleme critice pe loc.

**De ce C + D:** domeniul are 403 pagini indexabile cu conținut real, un pipeline care
rulează singur, și o cifră proprie (3,0% din magazinele românești au cod activ) pe care
n-o are nimeni. Ca sursă de trafic și ca dovadă de capabilitate, valorează. Ca plan de
venit principal, nu.

**Ce urmează din asta:** brandul umbrelă se construiește separat, iar AmCupon devine o
verticală în el — nu invers. Detaliile, în Faza 5 și 6.

---

## Cele trei lucruri de făcut înainte de orice altceva

1. **Push-ul cu reparația de CSP.** Fără el, nu se măsoară nimic, deci nu se decide nimic.
2. **Cele 37 de linkuri lipsă.** Bani pe trafic pe care îl ai deja.
3. **Cele patru email-uri de presă** din `PITCH-PRESA.md`, cu cifra actualizată la 3,0%.

Toate trei sunt scrise, verificate și nefăcute. Niciuna nu cere cod nou.
