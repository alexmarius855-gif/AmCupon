# Pitch presă — mesaje gata de trimis

> **Rescris pe 15.10.2026, cu cifrele de azi.** Cifra veche (1,6%, 22.08) nu mai e valabilă. Între timp au intrat
> ofertele Impact, iar 35 din cele 38 de magazine „cu cod” erau branduri internaționale. Studiul numără acum
> **doar magazinele cu domeniu .ro**, iar celelalte apar separat pe pagină.
> **Cifra centrală: 3 din 451 de magazine online românești au azi un cod de reducere real (0,7%).**

> **De ce contează mai mult decât 50 de directoare:** `cuponescu.ro` are 23.296 de vizite pe lună
> și se ține pe **~5 linkuri editoriale românești** — retail.ro (AS 34), startupcafe.ro (AS 45),
> carturesti.ro (AS 55), euplatesc.ro (AS 35). Restul profilului lor sunt directoare și PBN-uri,
> care nu-i țin sus. **Nu-ți trebuie 500 de linkuri. Îți trebuie 5 reale.**

---

## Înainte de fiecare trimitere (2 minute)

Cifrele se schimbă de trei ori pe zi. Un jurnalist care găsește pe site alt număr decât cel din email nu mai răspunde.

```
python scripts/generate_studiu_cupoane.py
python scripts/verifica_deblocare.py
```

La secțiunea [3], `verifica_deblocare.py` trebuie să spună „OK — pagina publica si datele spun acelasi lucru”.
Apoi deschide https://amcupon.ro/studiu/coduri-reducere-romania. **Dacă cifrele s-au mișcat, înlocuiește-le în
text** (3 / 451 / 0,7% / 70 / 16,2% și mediane). Le găsești pe pagină, în aceeași ordine ca în email.

Nu e o comunicare comercială: nu vinzi nimic și nu ceri nimic. Oferi o redacției date, cu sursa și metodologia.

---

## Regula care decide dacă merge sau nu

Un jurnalist economic primește zeci de comunicate pe zi, aproape toate promoționale, și le
șterge. Ce trece filtrul: **o cifră pe care n-o are de nicăieri altundeva, care spune ceva
despre piață, nu despre tine.**

De asta toate mesajele de mai jos:
- pun cifra în primul rând, nu numele site-ului;
- spun explicit că cifra ne dezavantajează (asta e ce le arată că nu e reclamă);
- oferă datele brute, nu doar concluzia;
- nu cer nimic. Nu „vă rugăm să publicați". Doar oferă.

**Nu trimite același text la două publicații.** Se vede, și te scoate din joc la amândouă.
Variantele de mai jos sunt scrise diferit intenționat.

---

## Ținte, în ordinea priorității

| Publicație | De ce | Contact |
|---|---|---|
| **retail.ro** | A linkuit deja un competitor pe exact acest tip de studiu | redactie@retail.ro *(verificat pe site 15.10.2026)* |
| **startupcafe.ro** | AS 45, cel mai mare din listă; acoperă antreprenoriat mic | redactie@startupcafe.ro *(verificat 15.10.2026, pagina Contact; vechea adresă „redactia@” era greșită)* |
| **economica.net** | Acoperă consum și comerț, apetit pentru date | redactie@economica.net *(neverificat)* |
| **profit.ro** | Business, audiență mare | redactia@profit.ro *(neverificat)* |
| **wall-street.ro** | Economic, publică des studii de piață | redactia@wall-street.ro *(neverificat)* |
| **gpec.ro** | Autoritatea de e-commerce din RO; nișă exactă | contact@gpec.ro *(neverificat)* |

> La startupcafe.ro, pagina „Redacția” (startupcafe.ro/redactia-htm) listează și editorii. Un jurnalist care
> semnează articole despre comerț online e mai bun decât adresa generală. Alege-l citind ultimele lor articole.

---

## Varianta 1 — retail.ro (comerț) · gata de trimis pe 15.10.2026

**Către:** redactie@retail.ro

**Subiect:**
```
Date: doar 3 din 451 de magazine online romanesti au un cod de reducere real
```

**Mesaj:**
```
Buna ziua,

Va scriu pentru ca am o cifra pe care cred ca n-o are nimeni altcineva si care
contrazice o presupunere raspandita despre comertul online romanesc.

Monitorizam automat promotiile din 451 de magazine online romanesti (cu domeniu
.ro), prin retelele de afiliere 2Performant, Impact.com si Awin. Am numarat cate
au un cod de reducere real: un text pe care cumparatorul chiar il introduce la
finalizarea comenzii.

Raspunsul, la 15 octombrie 2026: 3. Adica 0,7%.

Alte 70 de magazine au reduceri active, dar aplicate direct in pret, fara cod.
Raportul e de peste 20 la 1 in favoarea reducerii directe. Restul, peste 83%, nu
au nicio promotie activa.

Mentionez ca cifra ne dezavantajeaza direct: administram un site de cupoane, deci
spunem public ca aproape nu exista cupoane. Am publicat-o pentru ca un numar
umflat s-ar demonta la prima verificare. Din acelasi motiv am scos din calcul
cele 503 magazine internationale pe care le urmarim: ele descriu alte piete.

Studiul include si reducerea mediana pe categorie, publicata doar unde cel putin
3 magazine declara un procent. Esantioanele sunt mici (4-9 magazine), si scriem
asta pe pagina:

  Carti & educatie     65%
  Casa & gradina       50%
  Cadouri & flori      40,5%
  Beauty & ingrijire   40%
  Fashion              37,5%
  Sanatate & farmacie  22,5%

Pe 1 noiembrie, inainte de Black Friday, publicam pe aceeasi pagina prima serie
lunara: cate promotii noi au aparut in octombrie, pe categorii. Daca va e utila
pentru un material despre Black Friday, v-o pot trimite in ziua aparitiei.

Datele complete, metodologia si limitele masuratorii:
https://amcupon.ro/studiu/coduri-reducere-romania

Fisierul brut e public sub licenta CC-BY, deci il puteti folosi si verifica singuri:
https://amcupon.ro/studiu-cupoane.json

Cu stima,
Alex Marinescu
AmCupon.ro
alexmarius855@gmail.com
```

---

## Varianta 2 — startupcafe.ro (antreprenoriat) · gata de trimis pe 15.10.2026

**Către:** redactie@startupcafe.ro (sau editorul de comerț online de pe pagina Redacția)

**Subiect:**
```
Un site de cupoane care publica date aratand ca aproape nu exista cupoane
```

**Mesaj:**
```
Buna ziua,

Am construit singur o platforma care urmareste automat promotiile magazinelor
online din Romania. Va scriu pentru cifra pe care am gasit-o, nu pentru platforma.

Din 451 de magazine online romanesti, doar 3 au azi un cod de reducere real.
0,7%. Alte 70 au reduceri aplicate direct in pret, fara cod.

Cifra e incomoda pentru mine: administrez un site de cupoane. Toata categoria
asta de site-uri, inclusiv al meu, promite "mii de coduri", iar datele arata
altceva. Am ales sa public masuratoarea asa cum e, cu metodologia si limitele
ei scrise pe aceeasi pagina.

Pentru un antreprenor care vinde online cred ca e partea utila: cine isi
construieste promotiile presupunand ca "toata lumea da coduri" lucreaza cu o
imagine gresita a pietei. Aproape toti concurentii lui reduc direct pretul.

Publicam reducerea mediana doar unde cel putin 3 magazine declara un procent.
Din 16 categorii, doar 6 trec pragul; pentru celelalte scriem "date
insuficiente" in loc sa aproximam.

Studiul: https://amcupon.ro/studiu/coduri-reducere-romania
Datele brute, CC-BY: https://amcupon.ro/studiu-cupoane.json

Daca subiectul va intereseaza, va pot da si contextul de constructie: e un
proiect facut de o singura persoana, cu date actualizate automat de trei ori pe
zi, fara servere proprii si fara costuri de infrastructura. Dar cifra de mai sus
mi se pare partea care merita publicata, nu povestea mea.

Cu stima,
Alex Marinescu
AmCupon.ro
alexmarius855@gmail.com
```

---

## Varianta 3 — gpec.ro (e-commerce, public tehnic) · cifre de 15.10.2026

**Subiect:**
```
Masuratoare pe 451 de magazine .ro: cat de rare sunt, de fapt, codurile de reducere
```

**Mesaj:**
```
Buna ziua,

Pentru publicul GPeC cred ca e relevanta o masuratoare pe care am facut-o pe
partea de promotii distribuite prin afiliere.

Am urmarit automat 451 de magazine online romanesti (domeniu .ro), prin
2Performant, Impact.com si Awin, si am separat promotiile cu cod de cupon real
de cele cu reducere aplicata direct in pret.

    451  magazine .ro urmarite
     73  cu promotie activa            (16,2%)
      3  cu cod de cupon real          (0,7%)
     70  cu reducere fara cod          (15,5%)

Ce cred ca e interesant pentru un magazin: raportul de peste 20 la 1 intre
reducerea directa si codul de cupon. Pe 503 magazine internationale care livreaza
in Romania, masurate la fel dar separat, 35 au cod (7%). Asta sugereaza ca
raritatea codurilor tine de piata romaneasca, nu de metoda.

Metodologia si limitele sunt scrise pe pagina. Masuram doar partea vizibila prin
afiliere, deci codurile trimise pe newsletter sau in aplicatie nu apar. E, totusi,
exact partea pe care o vede oricine cauta un cod pe Google.

  https://amcupon.ro/studiu/coduri-reducere-romania
  https://amcupon.ro/studiu-cupoane.json  (CC-BY)

Cu stima,
Alex Marinescu
AmCupon.ro
alexmarius855@gmail.com
```

---

## După ce trimiți

- **Nu insista.** Un singur follow-up, la 7-10 zile, de o singură frază. Cel mai bun moment e **1 noiembrie**,
  când apare seria lunară: „Am publicat azi datele pe octombrie, înainte de Black Friday. Vă sunt utile?”
  Al doilea follow-up te scoate din joc.
- **Dacă cineva publică**, spune-mi: adaug linkul în `BACKLINK-PLAN.md` și verificăm când îl indexează Google.

## Ce să nu faci

- Nu trimite la mai mult de 6 publicații. Peste atât devine listă de spam, iar redacțiile
  românești de nișă se cunosc între ele.
- Nu plăti pentru articol. Un advertorial e marcat `nofollow`/`sponsored` (sau ar trebui să fie),
  deci plătești pentru exact ce iei gratis de la un director.
- Nu trimite până când pagina de studiu n-are cifrele actualizate și corecte. Pe 22.08 spunea
  „la fiecare 4 ore" în loc de „de trei ori pe zi”. Pe 15.10 numea „magazine românești” 35 de branduri străine.
  Ambele erau afirmații false despre propriul proces, verificabile de oricine deschide repo-ul public.
