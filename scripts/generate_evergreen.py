"""
Generare articole evergreen SEO pentru AmCupon.ro.
Nu sunt legate de luna curenta — sluguri permanente, rankate pe termeni generici.
Tipuri:
  - ghid-cumparaturi-{categorie} — informationale, long-tail
  - top-magazine-{categorie}-romania — liste magazine
  - cum-sa-economisesti-{topic} — how-to
"""

import json
import os
from datetime import datetime

AN = datetime.now().year


def nume_afisat(magazin: str) -> str:
    return " ".join(w.capitalize() for w in magazin.split(".")[0].replace("-", " ").split())


ARTICOLE_EVERGREEN = [
    # ── BEST-OF / NISA (intentie comerciala mare) ──────────────────────────────
    {
        "slug": "cele-mai-bune-produse-animale-companie-romania",
        "title": f"Cele Mai Bune Produse pentru Animale de Companie {AN}",
        "excerpt": f"Ghid complet {AN} pentru produse de calitate pentru caini si pisici: hrana, antiparazitare, accesorii. Unde cumperi cel mai ieftin si cum economisesti pana la 40%.",
        "category": "Animale",
        "tip": "ghid",
        "content": f"""## Cum cumperi inteligent pentru animalul tau de companie in {AN}

Romanii cheltuie tot mai mult pe animalele de companie — iar preturile la hrana premium si produsele veterinare au crescut. Vestea buna: cu putina atentie, poti economisi 30-40% la aceleasi produse de calitate. Iata ghidul complet.

## Pe ce categorii merita sa fii atent la pret

### 1. Hrana (cea mai mare cheltuiala lunara)
Hrana de calitate face diferenta pentru sanatatea animalului — dar e si cheltuiala recurenta cea mai mare. Cumparata la sac mare (la oferta) costa cu pana la 35% mai putin pe kilogram decat la punga mica.

### 2. Antiparazitare (sezonier, esential)
Primavara si vara = sezonul de capuse si purici. Antiparazitarele pentru caini si pisici sunt produse pe care le cumperi oricum — asa ca merita sa prinzi o reducere. La [PetMart](/cod-reducere/petmart.ro) gasesti frecvent oferte la antiparazitare de la branduri verificate.

### 3. Accesorii si jucarii
Lese, hamuri, paturi, jucarii — produse cu marja mare, deci si reduceri mari (pana la 50% in campanii). Nu te grabi: astea apar des la oferta.

### 4. Suplimente si produse veterinare
Vitamine, suplimente pentru articulatii, produse de igiena. Aici calitatea conteaza — cauta branduri recomandate de veterinar, dar verifica pretul intre magazine.

## Top sfaturi sa economisesti la produse pentru animale

**1. Cumpara hrana la sac mare cand e la oferta**
Un sac de 12-15 kg la reducere costa mult mai putin pe kg decat pungile mici. Daca ai spatiu de depozitare, e cea mai simpla economie.

**2. Foloseste coduri de reducere inainte de comanda**
AmCupon.ro verifica zilnic ofertele active la magazinele de animale. Un cod de 15% pe o comanda de 250 lei = aproape 40 lei economisiti instant.

**3. Aboneaza-te la newslettere pentru reduceri la prima comanda**
Majoritatea magazinelor ofera 10-15% la prima comanda. Inscrie-te, cumpara, gata.

**4. Profita de campaniile sezoniere**
Antiparazitarele sunt mai ieftine primavara, paturile si culcusurile — toamna. Black Friday aduce reduceri la hrana premium si accesorii.

**5. Compara intre magazine**
Acelasi sac de hrana poate varia cu 20-30% intre magazine. Verifica intotdeauna 2-3 surse inainte sa comanzi.

## Cand sa cumperi — calendarul reducerilor

| Perioada | Ce e la reducere | Reducere medie |
|----------|------------------|----------------|
| Primavara | Antiparazitare, vitamine | 20-30% |
| Vara | Accesorii outdoor, racire | 25-40% |
| Toamna | Culcusuri, paturi, hrana | 20-35% |
| Black Friday | Hrana premium, tot | 30-50% |
| Ianuarie | Lichidari de stoc | 30-60% |

## Greseli frecvente de evitat

- **Nu cumpara cea mai ieftina hrana** — calitatea proasta costa mai mult la veterinar pe termen lung.
- **Nu schimba brusc hrana** — tranzitia se face gradual, in 7-10 zile.
- **Nu ignora data de expirare** la ofertele de lichidare.
- **Nu cumpara antiparazitare necorespunzatoare greutatii** animalului.

## Concluzie

Animalul tau merita produse de calitate — iar tu meriti sa nu platesti pretul intreg. Secretul e simplu: cumperi acelasi lucru, dar cu cod de reducere si la momentul potrivit. [AmCupon.ro](/categorii/pet-supplies) centralizeaza ofertele active la magazinele de animale, verificate zilnic.

[**Vezi toate ofertele pentru animale de companie →**](/categorii/pet-supplies)""",
    },
    {
        "slug": "cele-mai-bune-oferte-carti-online-romania",
        "title": f"Cele Mai Bune Oferte la Carti Online Romania {AN}",
        "excerpt": f"Ghid {AN} pentru carti online ieftine: Carturesti, Litera, Bookzone, Humanitas. Coduri reducere active si sfaturi sa economisesti pana la 50% la carti.",
        "category": "Carti",
        "tip": "ghid",
        "content": f"""## Cumparaturile de carti online in Romania in {AN}

Cititul a redevenit la moda, iar magazinele online de carti se intrec in reduceri. Vestea buna: cu un cod de reducere potrivit, poti economisi 20-50% la carti — fie ca iei beletristica, manuale sau carti pentru copii.

## Top magazine de carti cu coduri de reducere

### 1. [Carturesti](/cod-reducere/carturesti.ro) — cel mai cunoscut
Carturesti are cea mai mare selectie de carti, plus papetarie si cadouri. Promotiile pe categorii ajung frecvent la 25-30%, iar tombolele si campaniile sezoniere aduc oferte si mai bune.

### 2. [Litera](/cod-reducere/litera.ro) — editura cu preturi bune
Litera publica bestselleruri si carti pentru copii. Cumparand direct de la editura, prinzi reduceri mari la titlurile proprii.

### 3. [Bookzone](/cod-reducere/bookzone.ro) — noutati si carti in engleza
Bookzone aduce constant noutati editoriale si o selectie buna de carti in limba engleza. Codurile de tip EXTRA aplica reduceri suplimentare peste preturile deja mici.

### 4. [Humanitas](/cod-reducere/libhumanitas.ro) — calitate si fond de carte
Libraria Humanitas are titluri de stiinta, filosofie si beletristica de top. Reducerile pe colectii ajung la 20-25%.

## Cum economisesti la carti online

**1. Cumpara in campanii**
Cele mai mari reduceri apar de Ziua Cartii (aprilie), la inceput de an scolar (august-septembrie) si de Black Friday. Atunci reducerile trec de 40%.

**2. Foloseste coduri de reducere**
AmCupon.ro verifica zilnic codurile active de la librariile online. Un cod de 20% pe o comanda de 150 lei = 30 lei economisiti.

**3. Profita de transportul gratuit**
Majoritatea librariilor ofera livrare gratuita peste un anumit prag. Comanda mai multe carti odata ca sa atingi pragul.

**4. Urmareste editurile direct**
Cumparand de la editura (Litera, Humanitas), eviti adaosul si prinzi reduceri la titlurile proprii.

## Cand sa cumperi carti — calendarul reducerilor

| Perioada | Eveniment | Reducere medie |
|----------|-----------|----------------|
| Aprilie | Ziua Cartii | 30-50% |
| August-Septembrie | Inceput an scolar | 25-40% |
| Noiembrie | Black Friday | 40-60% |
| Decembrie | Craciun | 20-35% |

## Concluzie

Cartile online sunt mult mai ieftine daca stii unde si cand sa cauti. [AmCupon.ro](/categorii/books) centralizeaza codurile de reducere active de la toate librariile — verificate zilnic — ca sa nu platesti niciodata pretul intreg.

[**Vezi toate ofertele la carti →**](/categorii/books)""",
    },
    {
        "slug": "cele-mai-bune-oferte-casa-gradina-romania",
        "title": f"Cele Mai Bune Oferte Casa si Gradina {AN}",
        "excerpt": f"Ghid {AN} pentru amenajari casa si gradina la preturi mici. Mobilier, decor, scule, gratare. Coduri reducere active si sfaturi sa economisesti pana la 50%.",
        "category": "Casa",
        "tip": "ghid",
        "content": f"""## Amenajarile pentru casa si gradina in {AN}

Fie ca renovezi, mobilezi sau pregatesti gradina de vara, costurile se aduna repede. Cu putina atentie la reduceri, poti economisi sume importante la mobilier, decor, scule si produse de gradina.

## Top magazine casa si gradina cu reduceri

### 1. [Kamin](/cod-reducere/kamin.ro) — gratare si exterior
Kamin e specializat pe gratare, seminee si produse pentru exterior. Campaniile aduc frecvent cadouri si reduceri mari la branduri precum Weber.

### 2. [Dedeman](/cod-reducere/dedeman.ro) — bricolaj si materiale
Cel mai mare lant de bricolaj din Romania. Reducerile la scule, materiale de constructii si gradina sunt constante, mai ales in sezonul cald.

### 3. [Dacris](/cod-reducere/dacris.net) — birou si organizare
Dacris are accesorii premium pentru birou si organizarea casei. Bun pentru cei care lucreaza de acasa.

## Cum economisesti la amenajari

**1. Cumpara sculele in afara sezonului**
Sculele de gradina sunt mai ieftine toamna-iarna, iar cele de iarna (deszapezire) — primavara. Reducerile ajung la 40%.

**2. Profita de campaniile de primavara**
Martie-mai aduc cele mai mari reduceri la mobilier de gradina, gratare si plante.

**3. Foloseste coduri de reducere**
AmCupon.ro verifica zilnic ofertele active. La o comanda mare de mobilier, un cod de 15% inseamna sute de lei economisiti.

**4. Compara preturile la produsele mari**
Mobilierul si electrocasnicele variaza mult intre magazine. Verifica 2-3 surse inainte de o achizitie importanta.

## Cand sa cumperi — calendarul reducerilor

| Perioada | Ce e la reducere | Reducere medie |
|----------|------------------|----------------|
| Martie-Mai | Gradina, gratare, mobilier exterior | 20-40% |
| Septembrie | Scule, amenajari interioare | 25-35% |
| Noiembrie | Black Friday (tot) | 30-50% |
| Ianuarie | Lichidari de stoc | 30-60% |

## Concluzie

Amenajarile nu trebuie sa coste o avere. [AmCupon.ro](/categorii/home-garden) aduna codurile de reducere active de la magazinele de casa si gradina — verificate zilnic.

[**Vezi toate ofertele casa si gradina →**](/categorii/home-garden)""",
    },
    {
        "slug": "cele-mai-bune-oferte-sport-fitness-romania",
        "title": f"Cele Mai Bune Oferte Sport si Fitness {AN}",
        "excerpt": f"Ghid {AN} pentru echipament sportiv ieftin: adidasi, haine sport, fitness. SportDepot, Decathlon, Fitlife. Coduri reducere active si sfaturi de economisire.",
        "category": "Sport",
        "tip": "ghid",
        "content": f"""## Echipamentul sportiv in {AN} — cum cumperi inteligent

Fie ca incepi sa alergi, mergi la sala sau practici un sport, echipamentul de calitate conteaza. Vestea buna: cu reducerile potrivite, prinzi branduri bune (Nike, Puma, Adidas) la preturi accesibile.

## Top magazine sport cu reduceri

### 1. [SportDepot](/cod-reducere/sportdepot.ro) — branduri internationale
SportDepot are cea mai buna selectie de adidasi si echipament de la branduri mari. Campaniile Mid Season Sale aduc reduceri de pana la 40%, iar codurile EXTRA aplica reduceri suplimentare.

### 2. [Decathlon](/cod-reducere/decathlon.ro) — raport calitate-pret
Decathlon e ideal pentru echipament de toate tipurile la preturi mici. Produsele proprii sunt foarte bune ca raport calitate-pret.

### 3. [Fitlife](/cod-reducere/fitlife.ro) — fitness si suplimente
Fitlife e specializat pe fitness, suplimente si accesorii de sala. Spring Sale aduce reduceri de pana la 70%.

## Cum economisesti la echipament sportiv

**1. Cumpara adidasii la finalul sezonului**
Modelele din sezonul trecut ajung la -50% cand apar cele noi. Performanta ramane aceeasi.

**2. Foloseste coduri de reducere**
AmCupon.ro verifica zilnic ofertele active. Un cod de 10% extra pe o comanda de 400 lei la SportDepot = 40 lei economisiti instant.

**3. Profita de campaniile de sezon**
Mid Season Sale (mar-apr, sep-oct) aduce cele mai bune reduceri la echipament.

**4. Cumpara suplimentele la cantitate**
Proteinele si suplimentele sunt mai ieftine la pachete mari, mai ales in campanii.

## Cand sa cumperi — calendarul reducerilor

| Perioada | Ce e la reducere | Reducere medie |
|----------|------------------|----------------|
| Martie-Aprilie | Colectii primavara-vara | 30-50% |
| Iulie | Summer sale | 40-60% |
| Septembrie-Octombrie | Mid season | 30-40% |
| Noiembrie | Black Friday | 40-70% |

## Concluzie

Echipamentul sportiv de calitate nu trebuie sa fie scump. [AmCupon.ro](/categorii/sports-outdoors) aduna codurile active de la magazinele de sport — verificate zilnic.

[**Vezi toate ofertele sport →**](/sport)""",
    },
    {
        "slug": "ghid-black-friday-romania",
        "title": f"Ghid Black Friday Romania {AN}",
        "excerpt": f"Ghid complet Black Friday {AN} in Romania: cand e, cum te pregatesti, ce magazine au cele mai bune reduceri si cum eviti falsele oferte.",
        "category": "Ghid",
        "tip": "ghid",
        "content": f"""## Black Friday in Romania {AN} — ghidul complet

Black Friday e cel mai mare eveniment de reduceri din an. Dar atentie: nu toate ofertele sunt reale. Iata cum prinzi reducerile adevarate si eviti capcanele.

## Cand e Black Friday in {AN}

In Romania, Black Friday cade de obicei in a treia sau a patra vineri din noiembrie. Multe magazine il intind pe toata luna („Black Friday Month"), cu valuri de oferte.

## Cum te pregatesti din timp

**1. Fa-ti lista de dorinte ACUM**
Noteaza produsele pe care le vrei si pretul lor actual. Asa vei sti daca reducerea de Black Friday e reala sau falsa.

**2. Verifica istoricul preturilor**
Multe magazine umfla pretul cu o saptamana inainte ca sa para reducerea mai mare. Daca stii pretul normal, nu te pacalesti.

**3. Aboneaza-te la newslettere**
Magazinele trimit codurile si ofertele exclusive pe email cu cateva zile inainte. Inscrie-te din timp.

## Ce magazine au cele mai bune reduceri

- **Electronice/IT:** [eMAG](/cod-reducere/emag.ro), Altex, PCGarage — reduceri reale la telefoane, laptopuri
- **Fashion:** [FashionDays](/cod-reducere/fashiondays.ro), Answear — pana la 70-80%
- **Beauty:** [Notino](/cod-reducere/notino.ro) — parfumuri si cosmetice la jumatate de pret
- **Carti:** Carturesti, Litera — reduceri masive
- **Sport:** SportDepot, Decathlon

## Cum eviti falsele oferte

1. **Compara cu pretul normal** (l-ai notat din timp)
2. **Nu te grabi** — „stoc limitat" e adesea o presiune falsa
3. **Citeste recenziile** produsului inainte sa cumperi
4. **Verifica costul de livrare** — uneori anuleaza reducerea

## Strategia castigatoare

In ziua de Black Friday:
1. Intra dimineata devreme (cele mai bune stocuri pleaca repede)
2. Verifica pe AmCupon.ro codurile active — multe magazine dau coduri EXTRA peste reducerile afisate
3. Cumpara ce ai pe lista, nu ce „pare" ieftin

## Concluzie

Black Friday e o oportunitate reala de a economisi sute de lei — daca esti pregatit. [AmCupon.ro](/black-friday) aduna toate codurile si ofertele active de Black Friday, verificate zilnic.

[**Vezi ofertele Black Friday →**](/black-friday)""",
    },
    # ── GHIDURI CATEGORII ──────────────────────────────────────────────────────
    {
        "slug": "ghid-cumparaturi-fashion-online-romania",
        "title": f"Ghid Cumparaturi Fashion Online Romania {AN}",
        "excerpt": f"Ghid complet pentru cumparaturi fashion online in Romania {AN}. Magazine de top, coduri reducere active si sfaturi sa economisesti pana la 60% la haine si accesorii.",
        "category": "Fashion",
        "tip": "ghid",
        "content": f"""## Cumparaturile fashion online in Romania in {AN}

Piata de fashion online din Romania a crescut cu peste 25% in ultimii 2 ani. In {AN}, ai acces la sute de magazine internationale si romanesti — dar cum alegi cel mai bun pret?

## Top magazine fashion cu coduri de reducere

### 1. [FashionDays](/cod-reducere/fashiondays.ro) — liderul pietei
FashionDays este cel mai mare retailer de fashion online din Romania, cu peste 1.500 branduri. Reducerile ajung frecvent la 60-70% in perioadele de sezoane.

### 2. [Answear.ro](/cod-reducere/answear.ro) — branduri internationale
Answear.ro aduce branduri precum Adidas, Nike, Tommy Hilfiger la preturi competitive. Codurile de reducere sunt disponibile saptamanal.

### 3. [H&M](/cod-reducere/hm.com) — fashion accesibil
H&M combina designul suedez cu preturile accesibile. Membrii clubului H&M au acces la reduceri exclusive de 10-20%.

### 4. [Reserved](/cod-reducere/reserved.com) — brand polonez cu prezenta puternica
Reserved are colectii actuale la preturi mid-range. Reducerile de sfarsit de sezon ajung la 50%.

### 5. [About You](/cod-reducere/about-you.ro) — personalizat dupa stilul tau
About You foloseste AI pentru a personaliza sugestiile. Newsletter-ul ofera coduri de 10-15% pentru abonati.

## Cum sa economisesti la fashion online

**1. Cumpara la finalul sezonului**
Cele mai mari reduceri la haine de vara apar in august, iar la cele de iarna — in ianuarie-februarie. Reduceri de 50-70% sunt comune.

**2. Foloseste coduri de reducere**
AmCupon.ro verifica zilnic codurile active de la toate magazinele fashion. Un cod de 15% pe o comanda de 200 lei = 30 lei economisiti instant.

**3. Aboneaza-te la newsletter**
Toate magazinele mari ofera 10-15% reducere la prima comanda prin newsletter. Inscrie-te, cumpara, dezaboneaza-te daca vrei.

**4. Compara preturile inainte de cumparare**
Acelasi produs poate varia cu 20-30% intre magazine. Verifica intotdeauna 2-3 surse.

**5. Verifica politica de retur**
Cumparaturile online au avantajul returului gratuit la multe magazine. FashionDays, Answear si H&M ofera retur gratuit 30 de zile.

## Cele mai bune perioade de reduceri fashion

| Luna | Eveniment | Reducere medie |
|------|-----------|----------------|
| Ianuarie | Reduceri post-sarbatori | 40-60% |
| Martie | Colectii primavara | 20-30% |
| Iulie | Summer sale | 50-70% |
| Noiembrie | Black Friday | 40-80% |
| Decembrie | Craciun | 20-40% |

## Concluzie

Cumparaturile fashion online in Romania sunt mai ieftine ca niciodata daca stii unde sa cauti. [AmCupon.ro](/toate-magazinele) centralizeaza toate codurile de reducere active — verificate zilnic — asa ca nu platesti niciodata pretul intreg.

[**Vezi toate codurile fashion active →**](/categorii/fashion)""",
    },
    {
        "slug": "ghid-cumparaturi-electronice-online-romania",
        "title": f"Ghid Electronice Online Romania {AN}",
        "excerpt": f"Unde cumperi electronice online mai ieftin in Romania {AN}? eMAG vs Altex vs Flanco — comparatie completa + coduri reducere active la laptopuri, telefoane si electrocasnice.",
        "category": "Electronice",
        "tip": "ghid",
        "content": f"""## Electroniceole online in Romania — Ghid {AN}

Romania are una din cele mai competitive piete de electronice online din Europa de Est. In {AN}, preturile la laptopuri, telefoane si electrocasnice pot varia cu 15-25% intre magazine.

## Top magazine electronice online Romania

### 1. [eMAG](/cod-reducere/emag.ro) — liderul incontestabil
Cu peste 8 milioane de produse si livrare rapida, eMAG este prima optiune pentru romani. Campania Genius Month aduce reduceri de pana la 70%.

### 2. [Altex](/cod-reducere/altex.ro) — retea nationala puternica
Altex combina prezenta fizica cu magazinul online. Avantajul: poti ridica produsul din magazin in aceeasi zi.

### 3. [Flanco](/cod-reducere/flanco.ro) — specialist electrocasnice
Flanco este puternic pe electrocasnice mari (masini de spalat, frigidere). Promotiile cu rate fara dobanda sunt frecvente.

### 4. [PCGarage](/cod-reducere/pcgarage.ro) — pentru pasionati IT
PCGarage este referinta pentru componente PC, gaming si periferice. Preturile sunt de obicei cele mai mici la componente.

### 5. [Evomag](/cod-reducere/evomag.ro) — alternativa solida
Evomag are adesea preturi mai mici decat eMAG pe anumite categorii si livrare rapida.

## Cum sa gasesti cel mai mic pret la electronice

**Regula de aur: nu cumpara niciodata la primul pret vazut.**

1. Cauta produsul pe 3-4 magazine simultan
2. Verifica daca exista cod de reducere activ pe [AmCupon.ro](/)
3. Verifica istoricul pretului (pretul "redus" poate fi artificial)
4. Compara garantia si conditiile de retur
5. Calculeaza costul total cu livrarea

## Perioadele cu cele mai mari reduceri

- **eMAG Genius Month** (octombrie) — reduceri reale 30-50%
- **Black Friday** (noiembrie) — reduceri masive dar stocuri limitate
- **Ziua Clientului** (mai) — promotii surpriza
- **Reduceri Back to School** (august-septembrie)

[**Coduri reducere electronice active →**](/categorii/electronics-itc)""",
    },
    {
        "slug": "ghid-cumparaturi-farmacie-online-romania",
        "title": f"Farmacie Online Romania {AN} — Ghid Economii",
        "excerpt": f"Ghid farmacie online Romania {AN}. Dr. Max, Vegis, Catena — comparatie preturi + coduri reducere active la medicamente OTC, suplimente si produse naturiste.",
        "category": "Farmacie",
        "tip": "ghid",
        "content": f"""## Farmacia online in Romania in {AN}

Cumparaturile din farmacii online au crescut exploziv in Romania. In {AN}, poti economisi 15-40% pe suplimente si produse OTC cumparand online fata de pretul din farmacia fizica.

## Top farmacii online Romania

### 1. [Dr. Max](/cod-reducere/drmax.ro) — lider national
Dr. Max este cel mai mare lant de farmacii din Romania, cu prezenta online puternica. Programul de fidelitate DM Card aduce reduceri suplimentare.

### 2. [Vegis.ro](/cod-reducere/vegis.ro) — specialist naturiste si bio
Vegis are cea mai mare gama de produse naturiste, bio si suplimente din Romania. Reducerile la comenzi mari (10-15%) sunt frecvente.

### 3. [Catena](/cod-reducere/catena.ro) — farmacia de proximitate online
Catena Online are livrare rapida (24h in Bucuresti) si promotii regulate la produse de sezon.

### 4. [Farmacia Tei](/cod-reducere/farmaciatei.ro)
Farmacia Tei are promotii saptamanale si un card de fidelitate activ in toata tara.

## Ce poti cumpara mai ieftin online

- **Suplimente vitamine** — cu 20-35% mai ieftin online vs farmacie fizica
- **Produse cosmetice farmaceutice** — Avene, La Roche-Posay, Vichy
- **Produse naturiste** — cea mai mare diferenta de pret
- **Medicamente OTC** — aspirina, antialgice, antihistaminice (nu necesita reteta)

> **Important:** Medicamentele cu prescriptie (Rx) nu se pot cumpara online in Romania. Farmaciile online vand doar produse OTC (fara reteta).

## Sfaturi economisire farmacie online

1. Cumpara suplimentele in cantitati mai mari — pret per unitate mai mic
2. Aboneaza-te la newsletter pentru coduri exclusive
3. Urmareste promotiile de sezon (vitamina D iarna, antihistaminice primavara)
4. Compara pretul per unitate, nu per ambalaj

[**Coduri reducere farmacie active →**](/categorii/pharma)""",
    },
    {
        "slug": "ghid-cumparaturi-copii-jucarii-online",
        "title": f"Jucarii si Produse Copii Online Romania {AN}",
        "excerpt": f"Ghid jucarii si produse copii online Romania {AN}. Noriel, Bebetei, Smyths Toys — unde gasesti cel mai bun pret + coduri reducere active pentru parinti.",
        "category": "Copii",
        "tip": "ghid",
        "content": f"""## Cumparaturile pentru copii online in Romania

In {AN}, piata de jucarii si produse pentru copii online din Romania a depasit 500 milioane euro. Ca parinte, ai mai multe optiuni ca oricand — dar si mai multa nevoie de ghidare.

## Top magazine jucarii si produse copii

### 1. [Noriel](/cod-reducere/noriel.ro) — liderul jucariilor din Romania
Noriel este brandul de referinta pentru jucarii in Romania, cu peste 40 de magazine fizice si prezenta online puternica. Jocurile de societate, LEGO si jucariile educative sunt punctele forte.

### 2. [Bebetei.ro](/cod-reducere/bebetei.ro) — specialist bebelusi 0-3 ani
Bebetei.ro are cea mai completa gama de produse pentru nou-nascuti si copii mici: carucioare, patutete, scaune auto, jucarii pentru bebelusi.

### 3. [Smyths Toys](/cod-reducere/smythstoys.com) — lantar international cu preturi bune
Smyths Toys, brandul irlandez, a intrat puternic pe piata romaneasca. Preturile la jucarii de brand (Barbie, Hot Wheels, LEGO) sunt adesea mai mici decat la concurenta locala.

### 4. [eMAG Copii](/cod-reducere/emag.ro) — sectiunea dedicata de pe eMAG
eMAG are o selectie uriasa de produse pentru copii, cu beneficiile eMAG Genius (livrare gratuita, retur 30 zile).

## Cand sa cumperi jucarii mai ieftin

- **Ianuarie** — reduceri post-Craciun de 40-60%
- **Iulie-August** — reduceri de vara, reinnoire stocuri
- **Septembrie** — promotii back-to-school
- **Noiembrie** — Black Friday (cel mai bun moment pentru jucarii scumpe)

## Siguranta produselor pentru copii

Cumpara intotdeauna de la magazine autorizate care garanteaza certificarea CE pe produse. Evita produsele fara marcare CE sau de pe site-uri necunoscute.

[**Coduri reducere jucarii active →**](/categorii/babies-kids-toys)""",
    },
    {
        "slug": "cum-sa-economisesti-la-shopping-online-romania",
        "title": f"Cum sa Economisesti la Shopping Online Romania {AN}",
        "excerpt": f"15 metode testate pentru a economisi la cumparaturi online in Romania in {AN}. Coduri reducere, cashback, timing corect si trucuri pentru fiecare magazine mare.",
        "category": "Ghiduri",
        "tip": "ghid",
        "content": f"""## 15 metode sa economisesti la shopping online in Romania

### 1. Foloseste coduri de reducere (cel mai rapid)
Cel mai simplu mod: inainte de orice comanda, cauta codul de reducere pe AmCupon.ro. Un cod de 10-15% pe o comanda de 300 lei = 30-45 lei economisiti in 30 de secunde.

[Coduri reducere active acum →](/)

### 2. Aboneaza-te la newsletter-ul magazinelor
Aproape toate magazinele mari ofera 10-15% reducere la prima comanda pentru abonarea la newsletter. Inscrie-te, cumpara, dezaboneaza-te daca nu mai vrei emailuri.

### 3. Cosuletul abandonat — trucul psihologic
Adauga produsele in cos si paraseste site-ul. Multi retaileri trimit email in 24-48h cu o reducere suplimentara de 5-10% pentru a-ti "recupera" comanda.

### 4. Compara preturile pe 3 magazine
Acelasi produs poate varia cu 20-30% intre eMAG, Altex si un retailer mai mic. Intotdeauna verifica 2-3 surse.

### 5. Cumpara la finalul sezonului
Hainele de vara sunt cele mai ieftine in august-septembrie. Electronicele scad in pret dupa lansarea modelelor noi. Jucariile — in ianuarie.

### 6. Programele de fidelitate
eMAG Genius, H&M Club, DM Card — fiecare program de fidelitate aduce beneficii reale: livrare gratuita, reduceri exclusive, puncte pentru cumparaturi viitoare.

### 7. Flash deals si oferte de o zi
Multe magazine au "oferta zilei" cu reduceri semnificative (20-50%) dar valabile doar cateva ore. AmCupon.ro le centralizeaza pe /oferte-azi.

### 8. Cumpara in pachet/cantitati mari
La produse consumabile (cafea, suplimente, produse cosmetice), comanda in cantitati mai mari reduce pretul per unitate cu 15-25%.

### 9. Black Friday — dar cu cap
Black Friday aduce reduceri reale, dar si false (pret "redus" de la un pret artificial ridicat). Verifica istoricul pretului inainte.

### 10. Extensia Chrome AmCupon
[Extensia gratuita AmCupon](https://chromewebstore.google.com/detail/mahfankpalkgognhnllkgdkjncmmkllb) aplica automat coduri de reducere la checkout — fara sa cauti manual.

### 11. Livrare gratuita — calculeaza pragul
Multor magazine au livrare gratuita de la 150-200 lei. Daca comanda ta e aproape de prag, adauga un produs mic de care oricum ai nevoie.

### 12. Cashback-ul ascuns
Unele magazine ofera cashback prin link-urile de afiliere de pe AmCupon.ro. Nu platesti mai mult — comisionul e din bugetul de marketing al magazinului.

### 13. Recenzii si retur gratuit
Cumpara de la magazine cu politica clara de retur gratuit. Iti da libertatea sa incerci fara risc.

### 14. Alertele de pret
Seteaza alerte de pret pe eMAG sau foloseste extensii browser care iti notifica cand produsul dorit scade la pretul tinta.

### 15. Compara costul total
Pretul produsului + transport + eventual taxe vamale (pentru comenzi din afara UE) poate face "oferta" mai scumpa decat pare.

---

**Concluzie:** Cel mai simplu mod de a incepe este sa verifici [codurile de reducere active pe AmCupon.ro](/) inainte de orice comanda. Dureaza 30 de secunde si economisesti garantat.""",
    },
    {
        "slug": "black-friday-romania-ghid-complet",
        "title": f"Black Friday Romania {AN} — Ghid Complet",
        "excerpt": f"Ghid complet Black Friday Romania {AN}. Cand incepe, ce magazine participa, cum sa identifici reducerile reale si codurile de reducere pentru cumparaturi inteligente.",
        "category": "Ghiduri",
        "tip": "ghid",
        "content": f"""## Black Friday Romania {AN} — Tot ce trebuie sa stii

Black Friday in Romania a evoluat de la o zi de reduceri la o intreaga luna de promotii. In {AN}, evenimentul aduce reduceri intre 20-80% la sute de magazine online.

## Cand are loc Black Friday in Romania

**Data officiala:** Ultima vineri din noiembrie — in {AN}, pe **28 noiembrie**.
**Dar incepand din 2023**, majoritatea magazinelor mari incep cu 1-2 saptamani inainte:

- eMAG — incepe pe 1 noiembrie cu "Lunile eMAG"
- FashionDays — incepe cu 7-10 zile inainte
- Altex/Flanco — saptamana Black Friday
- Magazine mai mici — chiar din 1 noiembrie

## Ce magazine au Black Friday real

| Magazin | Reduceri tipice | Categoria forte |
|---------|-----------------|-----------------|
| [eMAG](/cod-reducere/emag.ro) | 20-70% | Electronice, electrocasnice |
| [FashionDays](/cod-reducere/fashiondays.ro) | 30-70% | Fashion, incaltaminte |
| [Altex](/cod-reducere/altex.ro) | 20-50% | Electronice, electrocasnice |
| [Notino](/cod-reducere/notino.ro) | 20-40% | Parfumuri, cosmetice |
| [Answear](/cod-reducere/answear.ro) | 30-60% | Fashion, sport |
| [Elefant](/cod-reducere/elefant.ro) | 20-40% | Carti, electronice |
| [Noriel](/cod-reducere/noriel.ro) | 30-50% | Jucarii |

## Cum identifici reducerile REALE

**Trucul pretului gonflat:** Multi vanzatori cresc pretul cu 2-3 saptamani inainte de BF, apoi aplica "reducerea" revenind la pretul normal.

**Cum verifici:**
1. Cauta produsul pe Google Shopping si urmareste istoricul pretului
2. Instaleaza extensii care arata istoricul pretului (Keepa pentru Amazon, CamelCamelCamel)
3. Compara cu pretul din magazine fizice

## Strategie de cumparaturi pentru BF

**Cu 2 saptamani inainte:**
- Fa o lista cu produsele dorite
- Nota pretul actual al fiecarui produs
- Seteaza alerte de pret

**Cu 1 saptamana inainte:**
- Verifica daca reducerile au inceput deja
- Nu te grabi — preturile pot scadea si mai mult

**In ziua BF:**
- Verifica codurile de reducere pe [AmCupon.ro](/) — pot adauga inca 5-15%
- Cumpara produsele cu stoc limitat primul
- Verifica politica de retur

## Coduri de reducere Black Friday

In perioada Black Friday, AmCupon.ro actualizeaza codurile in timp real. Unele magazine ofera coduri speciale BF cu reduceri suplimentare de 5-20% peste pretul deja redus.

[**Urmareste codurile Black Friday pe AmCupon.ro →**](/black-friday)""",
    },
    {
        "slug": "top-magazine-online-romania-cu-reduceri",
        "title": f"Top 20 Magazine Online Romania cu Reduceri {AN}",
        "excerpt": f"Top 20 magazine online Romania {AN} cu reduceri reale si coduri verificate. eMAG, FashionDays, Notino, Answear — ghid complet cu rating si coduri active.",
        "category": "Ghiduri",
        "tip": "ghid",
        "content": f"""## Top 20 magazine online Romania cu cele mai bune reduceri

AmCupon.ro monitorizeaza peste 288 magazine online din Romania. Iata top 20 dupa combinatia: frecventa promotiilor + marimea reducerilor + rata de succes a codurilor.

### 1. [eMAG.ro](/cod-reducere/emag.ro) ⭐⭐⭐⭐⭐
**Cel mai mare retailer online din Romania.** Peste 8 milioane de produse, reduceri zilnice, program Genius cu livrare gratuita. Evenimentele majore (Genius Month, eMAG Summer, Black Friday) aduc reduceri de 30-70%.

### 2. [FashionDays.ro](/cod-reducere/fashiondays.ro) ⭐⭐⭐⭐⭐
**Lider fashion online Romania.** Peste 1.500 branduri, reduceri zilnice de 30-70% in sezon. Aplicatia mobila ofera notificari pentru flash deals.

### 3. [Notino.ro](/cod-reducere/notino.ro) ⭐⭐⭐⭐⭐
**Cel mai mare retailer de parfumuri si cosmetice online.** Reduceri de 20-40% la branduri premium. Coduri de fidelitate pentru clienti repetenti.

### 4. [Answear.ro](/cod-reducere/answear.ro) ⭐⭐⭐⭐
**Fashion international la preturi competitive.** Adidas, Nike, Tommy Hilfiger cu reduceri saptamanale. Livrare gratuita la comenzi peste 150 lei.

### 5. [Altex.ro](/cod-reducere/altex.ro) ⭐⭐⭐⭐
**Electronice si electrocasnice cu preturi garantate.** Politica "cel mai mic pret" — returneaza diferenta daca gasesti mai ieftin in 15 zile.

### 6. [Noriel.ro](/cod-reducere/noriel.ro) ⭐⭐⭐⭐
**Referinta pentru jucarii in Romania.** Reduceri saptamanale, promotii speciale de sarbatori. LEGO, Barbie, jocuri de societate.

### 7. [Elefant.ro](/cod-reducere/elefant.ro) ⭐⭐⭐⭐
**Carti si electronice la preturi bune.** Cea mai mare librarie online din Romania. Reduceri frecvente la bestsellers.

### 8. [Dr. Max](/cod-reducere/drmax.ro) ⭐⭐⭐⭐
**Farmacie online lider.** Suplimente, cosmetice farmaceutice si OTC cu 15-30% sub pretul din farmacie fizica.

### 9. [Vegis.ro](/cod-reducere/vegis.ro) ⭐⭐⭐⭐
**Specialist produse bio si naturiste.** Cea mai mare gama de produse naturale din Romania online.

### 10. [Sportisimo.ro](/cod-reducere/sportisimo.ro) ⭐⭐⭐⭐
**Echipament sport si outdoor.** Reduceri sezoniere de 30-50% la articole de sport, fitness si outdoor.

[**+ 278 magazine cu coduri active pe AmCupon.ro →**](/toate-magazinele)

## Cum alegi magazinul potrivit

1. **Verifica recenziile** — Google Reviews, Trustpilot
2. **Cauta codul de reducere** pe AmCupon.ro inainte de comanda
3. **Verifica politica de retur** — ideal gratuit, minim 14 zile
4. **Compara pretul total** incluzand transportul
5. **Verifica daca au livrare rapida** in zona ta

[**Toate magazinele cu reduceri →**](/toate-magazinele)""",
    },
    {
        "slug": "cod-reducere-emag-ghid-complet",
        "title": f"Cod Reducere eMAG {AN} — Ghid Complet",
        "excerpt": f"Ghid complet coduri reducere eMAG {AN}. Genius, cashback, newsletter, Black Friday — toate metodele sa economisesti la cel mai mare retailer online din Romania.",
        "category": "Electronice",
        "tip": "ghid",
        "content": f"""## Codul de reducere eMAG — Ghid complet {AN}

eMAG este cel mai mare retailer online din Romania cu peste 8 milioane de produse. Daca stii cum sa folosesti sistemul de reduceri, poti economisi consistent la fiecare comanda.

## Tipuri de reduceri disponibile la eMAG

### 1. Vouchere eMAG (cele mai comune)
Voucherele de tip "VOUCHER10" ofera reduceri procentuale (5-25%) sau fixe (10-100 lei). Se introduc la checkout in campul "Cod promotional".

**Unde gasesti vouchere eMAG:**
- [AmCupon.ro — coduri eMAG verificate](/cod-reducere/emag.ro)
- Newsletter-ul eMAG (aboneaza-te pentru 10% la prima comanda)
- Pagina eMAG pe Facebook (concursuri si promotii)

### 2. eMAG Genius
Abonamentul Genius (29.99 lei/luna sau 199 lei/an) include:
- Livrare GRATUITA la toate comenzile
- Reduceri Genius exclusive (5-15% in plus)
- Retur extins 60 zile
- Acces la oferte flash inainte de ceilalti

**Merita?** Daca comanzi de minim 2-3 ori pe luna, da.

### 3. Cashback si puncte de loialitate
eMAG nu are un program clasic de puncte, dar:
- Unele carduri bancare (BT, ING) ofera cashback la cumparaturile eMAG
- Plateste cu cardul potrivit si primesti 1-3% inapoi

### 4. Evenimentele mari eMAG

| Eveniment | Luna | Reduceri tipice |
|-----------|------|-----------------|
| eMAG Genius Month | Octombrie | 30-70% |
| Summer Deals | Iulie | 20-50% |
| Ziua Clientului | Mai | 15-40% |
| Black Friday | Noiembrie | 40-80% |
| Craciun eMAG | Decembrie | 20-40% |

### 5. Oferta Zilei
In fiecare zi, eMAG are produse cu reduceri de 30-70% valabile 24h. Verifica dimineata pe homepage.

## Cum combini reducerile pentru economii maxime

**Metoda 1: Voucher + Genius**
Cu un abonament Genius activ si un voucher de 10%, reducerile se cumuleaza. Pe un laptop de 2.000 lei: -200 lei voucher + -100 lei reducere Genius = -300 lei economisiti.

**Metoda 2: Eveniment + Voucher**
In perioada Genius Month, adauga voucherul de pe AmCupon.ro la pretul deja redus.

**Metoda 3: Rate 0% + Voucher**
eMAG ofera adesea rate fara dobanda la electronice mari. Combina cu un voucher de reducere pentru pretul final cel mai bun.

[**Cod reducere eMAG activ astazi →**](/cod-reducere/emag.ro)""",
    },
    {
        "slug": "reduceri-cosmetice-parfumuri-online-romania",
        "title": f"Reduceri Cosmetice si Parfumuri Romania {AN}",
        "excerpt": f"Comparatie completa Notino vs Douglas vs Sephora Romania {AN}. Unde gasesti parfumuri si cosmetice mai ieftin + coduri reducere active verificate zilnic.",
        "category": "Frumusete",
        "tip": "ghid",
        "content": f"""## Cosmetice si parfumuri online in Romania — Ghid {AN}

Piata de beauty online din Romania a explodat in ultimii ani. In {AN}, ai acces la toate brandurile premium la preturi competitive — daca stii unde sa cauti.

## Notino vs Douglas vs Sephora — Comparatie completa

### [Notino.ro](/cod-reducere/notino.ro) — liderul pietei
Notino este retailerul ceh care a cucerit Romania cu preturile agresive. Avantaje:
- Cele mai mici preturi la parfumuri internationale
- Produse originale, garantate
- Livrare rapida, retur gratuit
- Coduri de reducere frecvente (10-20% pentru abonati)

### [Douglas.ro](/cod-reducere/douglas.ro) — experienta premium
Douglas este lanteul german de parfumuri cu magazine in mall-uri romanesti. Online-ul ofera:
- Produse exclusive Douglas
- Programa de fidelitate Beauty Card
- Set-uri cadou speciale

### [Sephora.ro](/cod-reducere/sephora.ro) — trendul global
Sephora aduce branduri de nisa si tendinte globale. Puncte forte:
- Branduri exclusive (NARS, Too Faced, Charlotte Tilbury)
- Beauty Insider cu puncte si reduceri
- Tutoriale si teste de make-up

### [Makeup.ro](/cod-reducere/makeup.ro) — alternativa romaneasca
Makeup.ro ofera gama completa la preturi competitive, cu livrare rapida in Romania.

## Categorii si unde gasesti cel mai ieftin

| Produs | Cel mai ieftin | Diferenta |
|--------|----------------|-----------|
| Parfumuri internationale | Notino | 10-20% sub Douglas |
| Skincare premium | Notino / Douglas | similar |
| Make-up nisa | Sephora | exclusiv |
| Produse naturiste | Vegis | 20-30% mai ieftin |

## Cum economisesti la cosmetice

1. **Seturi cadou** — de obicei mai ieftine per unitate decat produsele separate
2. **Marime travel** — testa un produs nou fara sa investesti in varianta full-size
3. **Programe fideltate** — Notino Premium, Douglas Beauty Card, Sephora Beauty Insider
4. **Coduri reducere** — AmCupon.ro verifica zilnic codurile active de la toate magazinele beauty
5. **Set-urile de Craciun** — cel mai bun raport calitate-pret la parfumuri

[**Coduri reducere beauty active →**](/categorii/beauty)""",
    },
    {
        "slug": "cum-folosesti-cod-reducere-online",
        "title": "Cum Folosesti un Cod de Reducere Online — Ghid Pas cu Pas pentru Incepatori",
        "excerpt": "Nu stii cum sa folosesti un cod de reducere online? Ghid complet pas cu pas: unde gasesti coduri, cum le aplici la checkout si ce faci daca nu functioneaza.",
        "category": "Ghiduri",
        "tip": "ghid",
        "content": f"""## Ce este un cod de reducere online?

Un cod de reducere (sau voucher, cupon, cod promotional) este o combinatie de litere si cifre pe care o introduci la finalizarea unei comenzi online pentru a obtine o reducere.

**Exemplu:** La o comanda de 200 lei cu codul "SAVE10", primesti 10% reducere = 20 lei inapoi.

## Unde gasesti coduri de reducere

### 1. AmCupon.ro (recomandat)
AmCupon.ro verifica zilnic codurile de reducere de la peste 288 magazine online. Toate codurile afisate sunt testate si verificate.

**Cum folosesti AmCupon.ro:**
1. Cauta magazinul unde vrei sa cumperi
2. Gaseste codul potrivit pentru produsele tale
3. Copiaza codul cu un click
4. Mergi la magazin si aplica la checkout

### 2. Newsletter-ul magazinelor
Inscrie-te la newsletter si primesti automat coduri exclusive, de obicei 10-15% la prima comanda.

### 3. Pagina de Facebook a magazinului
Multe magazine posteaza coduri flash pe social media cu valabilitate de 24-48h.

## Cum aplici codul la checkout — pas cu pas

**Pasul 1:** Adauga produsele in cosul de cumparaturi

**Pasul 2:** Click pe "Finalizeaza comanda" sau "Checkout"

**Pasul 3:** Pe pagina de checkout, cauta campul cu unul din aceste denumiri:
- "Cod promotional"
- "Voucher"
- "Cod reducere"
- "Cupon"
- "Discount code"

**Pasul 4:** Introdu codul (respecta majusculele) si apasa "Aplica" sau "Verifica"

**Pasul 5:** Verifica ca reducerea s-a aplicat inainte de plata

## Ce faci daca codul nu functioneaza?

**Verifica mai intai:**
- Codul e scris corect (fara spatii la inceput/sfarsit)
- Nu a expirat (AmCupon.ro afiseaza zilele ramase)
- Indeplinesti conditiile (cos minim, produse eligibile)
- Nu ai folosit deja codul (unele sunt valabile o singura data)

**Daca tot nu merge:**
- Incearca un alt cod din lista
- Contacteaza suportul magazinului
- Raporteaza codul pe AmCupon.ro pentru verificare

## Tipuri de coduri de reducere

| Tip | Cum functioneaza | Exemplu |
|-----|-----------------|---------|
| Procentual | X% din total | -15% |
| Fix | X lei reducere | -50 lei |
| Livrare gratuita | Transport gratuit | FREE SHIP |
| Bun venit | Prima comanda | WELCOME10 |
| Sezonier | Valabil in anumita perioada | VARA2026 |

[**Coduri verificate pentru toate magazinele →**](/)""",
    },
]


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root  = os.path.dirname(script_dir)
    blog_path  = os.path.join(repo_root, "frontend", "public", "blog-posts.json")

    posts = []
    if os.path.exists(blog_path):
        with open(blog_path, encoding="utf-8") as f:
            posts = json.load(f)

    sluguri_existente = {p["slug"] for p in posts}
    noi = []
    data_azi = datetime.now().strftime("%Y-%m-%d")

    for art in ARTICOLE_EVERGREEN:
        if art["slug"] in sluguri_existente:
            print(f"  Exista deja: {art['slug']}")
            continue
        art["date"]  = data_azi
        art["cover"] = f"https://picsum.photos/seed/{art['slug']}/800/400"
        noi.append(art)
        print(f"  Adaugat: {art['title'][:60]}")

    if not noi:
        print("Toate articolele evergreen exista deja.")
        return

    all_posts = noi + posts
    all_posts = sorted(all_posts, key=lambda x: x["date"], reverse=True)[:500]

    with open(blog_path, "w", encoding="utf-8") as f:
        json.dump(all_posts, f, ensure_ascii=False, indent=2)

    print(f"\nBlog actualizat: {len(noi)} articole evergreen adaugate, {len(all_posts)} total.")


if __name__ == "__main__":
    main()
