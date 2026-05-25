import json
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BLOG_PATH = os.path.join(SCRIPT_DIR, '..', 'frontend', 'public', 'blog-posts.json')

with open(BLOG_PATH, 'r', encoding='utf-8') as f:
    posts = json.load(f)

existing_slugs = {p['slug'] for p in posts}

new_posts = [
    {
        "slug": "cele-mai-bune-reduceri-saptamana-mai-2026",
        "title": "Cele mai bune reduceri ale saptamanii — Mai 2026",
        "date": "2026-05-25",
        "excerpt": "Top oferte active saptamana aceasta: fashion, electronice, cosmetice si carti. Coduri verificate si actualizate zilnic pe AmCupon.ro.",
        "category": "Lunare",
        "magazin": None,
        "cover": "https://picsum.photos/seed/reduceri-sapt-mai26/800/400",
        "content": (
            "## Cele mai bune oferte active saptamana aceasta\n\n"
            "Echipa AmCupon.ro a selectat manual cele mai valoroase promotii disponibile acum. "
            "Toate codurile sunt verificate si afisam rata de succes pentru fiecare.\n\n"
            "## Fashion — reduceri de pana la 50%\n\n"
            "Categoria fashion este cea mai activa in aceasta perioada. "
            "Answear, Fashion Days si Zalando au promotii active cu reduceri semnificative la colectiile de primavara-vara.\n\n"
            "- **Answear** — coduri de 10-20% la intreaga selectie\n"
            "- **Fashion Days** — reduceri flash la branduri premium\n"
            "- **Zalando** — promotii la incaltaminte si accesorii\n\n"
            "## Electronice si IT\n\n"
            "Perioada mai-iunie este excelenta pentru cumparaturi tech. "
            "eMAG si Altex au oferte regulate la laptopuri, telefoane si accesorii.\n\n"
            "- **eMAG** — Deals zilnice cu pana la 30% reducere\n"
            "- **Altex** — Promotii la electrocasnice\n\n"
            "## Cosmetice si farmacie\n\n"
            "Notino si Dr. Max au coduri active cu reduceri de 10-15% la parfumuri si produse de ingrijire.\n\n"
            "## Carti si educatie\n\n"
            "Elefant.ro si Libris ofera coduri regulate. Ideal pentru listele de lectura de vara.\n\n"
            "## Cum gasesti rapid cel mai bun cod\n\n"
            "- Intra pe pagina magazinului dorit pe AmCupon.ro\n"
            "- Verifica rata de succes (afisata la fiecare cod)\n"
            "- Copiaza codul cu cel mai mare procent de succes\n"
            "- Aplica la checkout si bucura-te de reducere"
        )
    },
    {
        "slug": "cum-folosesti-cod-promotional-ghid-complet",
        "title": "Cum folosesti un cod promotional — Ghid complet pas cu pas",
        "date": "2026-05-19",
        "excerpt": "Ghid detaliat despre cum sa gasesti, copiezi si aplici un cod promotional la orice magazin online din Romania. Sfaturi pentru a maximiza reducerile.",
        "category": "Ghiduri",
        "magazin": None,
        "cover": "https://picsum.photos/seed/ghid-cod-promotional/800/400",
        "content": (
            "## Ce este un cod promotional?\n\n"
            "Un cod promotional (numit si cod de reducere, voucher sau cupon) este un sir de caractere "
            "pe care il introduci la finalizarea unei comenzi online pentru a primi o reducere de pret, "
            "transport gratuit sau alt avantaj.\n\n"
            "## Unde gasesti coduri promotionale valabile?\n\n"
            "Cea mai rapida metoda este AmCupon.ro — colectam zilnic toate codurile active de la "
            "peste 600 de magazine din Romania. Alte surse:\n\n"
            "- Newsletter-ul magazinului (aboneaza-te pentru oferte exclusive)\n"
            "- Aplicatia mobila a magazinului (adesea ofera cod la prima comanda)\n"
            "- Paginile de social media ale brandurilor\n"
            "- Programe de fidelitate pentru clienti fideli\n\n"
            "## Ghid pas cu pas: cum aplici codul\n\n"
            "**Pasul 1:** Gaseste un cod activ pe AmCupon.ro pentru magazinul dorit\n\n"
            "**Pasul 2:** Apasa butonul de copiere — codul e acum in clipboard\n\n"
            "**Pasul 3:** Mergi pe site-ul magazinului si adauga produsele in cos\n\n"
            "**Pasul 4:** La pagina de checkout, cauta campul cu unul din numele:\n"
            "- Cod promotional\n"
            "- Cod reducere\n"
            "- Voucher\n"
            "- Cupon\n"
            "- Discount code\n\n"
            "**Pasul 5:** Lipeste codul copiat si apasa Aplica sau Enter\n\n"
            "**Pasul 6:** Verifica ca reducerea s-a aplicat in totalul comenzii\n\n"
            "## De ce nu functioneaza uneori un cod?\n\n"
            "- Codul a expirat (verifica data de valabilitate)\n"
            "- Nu ai atins cosul minim necesar\n"
            "- Produsele nu sunt eligibile pentru promotie\n"
            "- Codul e pentru prima comanda, dar ai mai comandat inainte\n\n"
            "Pe AmCupon.ro afisam rata de succes pentru fiecare cod — alege-l pe cel cu procentul cel mai mare."
        )
    },
    {
        "slug": "top-magazine-online-romania-2026",
        "title": "Top 20 magazine online din Romania in 2026 — cu cele mai bune reduceri",
        "date": "2026-05-16",
        "excerpt": "Clasamentul celor mai populare magazine online din Romania dupa numarul de vanzari, varietatea produselor si frecventa promotiilor. Cu linkuri directe la coduri active.",
        "category": "Ghiduri",
        "magazin": None,
        "cover": "https://picsum.photos/seed/top-magazine-ro-2026/800/400",
        "content": (
            "## Criteriile de selectie\n\n"
            "Am analizat peste 600 de magazine partenere dupa: numarul de vanzari, "
            "frecventa promotiilor, rata de succes a codurilor si diversitatea produselor.\n\n"
            "## Top magazine fashion\n\n"
            "- **Answear.ro** — Cel mai mare magazin de moda cu branduri internationale\n"
            "- **Fashion Days** — Promotii frecvente la branduri premium\n"
            "- **Zalando** — Selectie extinsa cu returnare gratuita 100 de zile\n"
            "- **Reserved** — Moda accesibila cu reduceri sezoniere\n\n"
            "## Top magazine electronice\n\n"
            "- **eMAG** — Cel mai mare retailer online din Romania\n"
            "- **Altex** — Electrocasnice si IT cu promotii regulate\n"
            "- **Flanco** — Alternativa solida cu oferte competitive\n\n"
            "## Top magazine cosmetice\n\n"
            "- **Notino** — Parfumuri si cosmetice la preturi europene\n"
            "- **Douglas** — Branduri de lux cu reduceri periodice\n"
            "- **Farmec** — Cosmetice romanesti de calitate\n"
            "- **Dr. Max** — Farmacie online cu oferte la suplimente\n\n"
            "## Top magazine carti si educatie\n\n"
            "- **Elefant.ro** — Cea mai mare librarie online din Romania\n"
            "- **Libris** — Oferte regulate cu coduri de 10-20%\n"
            "- **Bookzone** — Carti de business si dezvoltare personala\n\n"
            "## Top magazine casa si gradina\n\n"
            "- **IKEA** — Mobila si accesorii pentru casa\n"
            "- **Dedeman** — Materiale de constructii si bricolaj\n"
            "- **Jysk** — Mobila si textil la preturi accesibile\n\n"
            "## Cum gasesti codurile active\n\n"
            "Pentru orice magazin din lista, gasesti codurile actualizate zilnic pe AmCupon.ro. "
            "Cauta magazinul dorit sau navigheaza pe categorii."
        )
    },
    {
        "slug": "black-friday-romania-2026-ghid-complet",
        "title": "Black Friday Romania 2026 — Calendar, magazine si sfaturi pentru cele mai mari reduceri",
        "date": "2026-05-21",
        "excerpt": "Tot ce trebuie sa stii despre Black Friday 2026 in Romania: cand incepe, ce magazine participa, cum sa te pregatesti si cum sa obtii cele mai mari reduceri.",
        "category": "Ghiduri",
        "magazin": None,
        "cover": "https://picsum.photos/seed/black-friday-2026/800/400",
        "content": (
            "## Cand este Black Friday 2026 in Romania?\n\n"
            "Black Friday 2026 cade pe **27 noiembrie**. Insa in Romania, multe magazine incep "
            "promotiile cu 1-2 saptamani inainte — deci din jurul datei de 13-14 noiembrie.\n\n"
            "## Calendar Black Friday 2026\n\n"
            "- **Octombrie** — Pre-BF: unele magazine lanseaza teaser deals\n"
            "- **1-13 noiembrie** — Promotii early bird la magazine selectate\n"
            "- **13-27 noiembrie** — Saptamana Black Friday (oferte majore)\n"
            "- **27 noiembrie** — Ziua principala Black Friday\n"
            "- **30 noiembrie - 2 decembrie** — Cyber Monday si extensii BF\n\n"
            "## Magazine care participa traditional la BF in Romania\n\n"
            "- **eMAG** — Cel mai mare eveniment BF din Romania, mii de produse\n"
            "- **Fashion Days** — Reduceri de 30-70% la fashion\n"
            "- **Answear** — Colectii internationale la preturi speciale\n"
            "- **Altex / Flanco** — Electronice si electrocasnice\n"
            "- **Notino** — Pachete si reduceri la parfumuri\n"
            "- **Elefant** — Carti si jucarii\n\n"
            "## Cum sa te pregatesti pentru Black Friday\n\n"
            "- Fa o lista cu produsele dorite din timp\n"
            "- Urmareste preturile cu cateva saptamani inainte (unele magazine umfla pretul inainte de BF)\n"
            "- Creeaza conturi pe magazinele dorite inainte de eveniment\n"
            "- Salveaza produsele in wishlist\n"
            "- Verifica AmCupon.ro inainte de cumparatura pentru coduri suplimentare\n\n"
            "## Sfatul nostru\n\n"
            "AmCupon.ro va actualiza in timp real toate codurile de reducere active de Black Friday. "
            "Marcheaza pagina noastra in browser si revino cu o zi inainte de eveniment."
        )
    },
    {
        "slug": "reduceri-fashion-days-luna-aceasta",
        "title": "Reduceri Fashion Days — Mai 2026: Coduri active si promotii verificate",
        "date": "2026-05-23",
        "excerpt": "Toate promotiile active Fashion Days in Mai 2026. Coduri de reducere verificate, rate de succes si sfaturi pentru a economisi la cumparaturile de moda.",
        "category": "Fashion",
        "magazin": "fashiondays.ro",
        "cover": "https://picsum.photos/seed/fashion-days-mai26/800/400",
        "content": (
            "## Fashion Days in Mai 2026\n\n"
            "Fashion Days este unul dintre cele mai mari magazine de moda online din Romania, "
            "cu branduri de la accesibil la premium. Luna mai vine cu oferte de sezon si lichidari de stoc.\n\n"
            "## Tipuri de promotii active la Fashion Days\n\n"
            "**Coduri procentuale:** Reduceri de 10-25% aplicabile la intreaga comanda sau la categorii selectate.\n\n"
            "**Reduceri de sezon:** Colectiile de primavara sunt reduse cu 20-50% pentru a face loc noilor colectii de vara.\n\n"
            "**Promotii flash:** Durata limitata (24-48h) cu reduceri mai mari. Le gasesti in sectiunea SALE.\n\n"
            "**Transport gratuit:** De obicei activat automat la comenzi peste o anumita suma.\n\n"
            "## Branduri disponibile la Fashion Days\n\n"
            "Fashion Days are mii de branduri, printre care:\n\n"
            "- Adidas, Nike, Puma (sport)\n"
            "- Tommy Hilfiger, Calvin Klein, Lacoste (premium casual)\n"
            "- Guess, Michael Kors (fashion)\n"
            "- Vero Moda, Vila, Only (accesibil)\n\n"
            "## Sfaturi pentru cumparaturi la Fashion Days\n\n"
            "- Filtreaza dupa SALE pentru a vedea toate articolele deja reduse\n"
            "- Combina reducerea de sezon cu un cod promotional pentru economii maxime\n"
            "- Verifica sectiunea de outlet pentru reduceri permanente\n"
            "- Politica de returnare: 30 de zile, simplu si gratuit\n\n"
            "## Unde gasesti codurile active\n\n"
            "Toate codurile de reducere Fashion Days sunt actualizate zilnic pe AmCupon.ro. "
            "Afisam rata de succes si data de expirare pentru fiecare cod."
        )
    },
    {
        "slug": "cod-reducere-emag-ghid-2026",
        "title": "Cod reducere eMAG 2026 — Cum economisesti la cel mai mare magazin online din Romania",
        "date": "2026-05-17",
        "excerpt": "Ghid complet pentru codurile de reducere eMAG: Genius, cashback, promotii zilnice. Tot ce trebuie sa stii pentru a cumpara mai ieftin pe eMAG in 2026.",
        "category": "Ghiduri",
        "magazin": "emag.ro",
        "cover": "https://picsum.photos/seed/emag-reduceri-2026/800/400",
        "content": (
            "## De ce eMAG este diferit de alte magazine\n\n"
            "eMAG este cel mai mare retailer online din Romania cu milioane de produse. "
            "Au un ecosistem complex de promotii care poate fi folosit strategic.\n\n"
            "## Modalitati de a economisi la eMAG\n\n"
            "**1. Coduri de reducere clasice**\n\n"
            "Coduri procentuale sau de suma fixa, aplicabile la checkout. "
            "Le gasesti actualizate pe AmCupon.ro.\n\n"
            "**2. eMAG Genius**\n\n"
            "Abonamentul Genius ofera transport gratuit nelimitat, reduceri exclusive si acces la "
            "oferte Genius. Daca cumperi des de pe eMAG, se amortizeaza rapid.\n\n"
            "**3. Deals zilnice**\n\n"
            "In fiecare zi, eMAG publica un set de produse cu reduceri semnificative (Lightning Deals). "
            "Sunt limitate ca timp si stoc.\n\n"
            "**4. Cashback**\n\n"
            "Prin platforme de cashback sau programul eMAG propriu, poti recupera un procent din suma platita.\n\n"
            "**5. Rate fara dobanda**\n\n"
            "Pentru cumparaturi mari, ratele 0% sunt o forma indirecta de a economisi.\n\n"
            "## Categorii cu cele mai bune reduceri pe eMAG\n\n"
            "- Electronice si IT — promotii regulate, mai ales la lansari noi\n"
            "- Electrocasnice — reduceri sezoniere semnificative\n"
            "- Jucarii si jocuri — reduceri inainte de sarbatori\n"
            "- Carti — sectiune dedicata cu preturi competitive\n\n"
            "## Cum combini economiile\n\n"
            "Strategie maxima: Genius + cod reducere + cashback = economii de 15-25% per comanda. "
            "Verifica AmCupon.ro inainte de orice comanda eMAG."
        )
    },
    {
        "slug": "reduceri-notino-cosmetice-parfumuri-2026",
        "title": "Reduceri Notino 2026 — Coduri active pentru parfumuri si cosmetice",
        "date": "2026-05-15",
        "excerpt": "Cele mai bune coduri de reducere Notino pentru parfumuri, skincare si cosmetice. Reduceri verificate de 10-20% plus sfaturi pentru cumparaturi inteligente.",
        "category": "Ghiduri",
        "magazin": "notino.ro",
        "cover": "https://picsum.photos/seed/notino-cosmetice-2026/800/400",
        "content": (
            "## De ce Notino pentru cosmetice si parfumuri?\n\n"
            "Notino este unul dintre cele mai mari magazine europene de cosmetice, "
            "cu peste 100.000 de produse de la mii de branduri. "
            "Preturile sunt adesea sub media pietei romanesti.\n\n"
            "## Categorii disponibile pe Notino\n\n"
            "- **Parfumuri** — branduri de la accesibil la luxury\n"
            "- **Skincare** — ingrijire ten, antirid, hidratare\n"
            "- **Makeup** — fond de ten, lip gloss, mascara\n"
            "- **Ingrijire par** — sampoane, balsame, masti\n"
            "- **Ingrijire corp** — lotiuni, uleiuri, exfoliere\n\n"
            "## Tipuri de reduceri la Notino\n\n"
            "**Coduri promotionale:** Reduceri de 10-15% aplicabile la comenzi peste o suma minima.\n\n"
            "**Seturi si bundleuri:** Notino ofera frecvent seturi gift cu economii de 20-30%.\n\n"
            "**Sample gratuit:** La comenzi peste o anumita suma, primesti sample-uri gratuite.\n\n"
            "**Transport gratuit:** Activat la comenzi peste pragul stabilit.\n\n"
            "## Sfaturi pentru cumparaturi pe Notino\n\n"
            "- Compara pretul Notino cu parfumeria locala — de obicei Notino e mai ieftin\n"
            "- Cauta varianta EDT vs EDP — aceeasi esenta, preturi diferite\n"
            "- Cumpara seturi cadou pentru sarbatori — raport calitate/pret excelent\n"
            "- Verifica sectiunea de reduceri pentru articole cu stoc limitat\n\n"
            "## Coduri active Notino\n\n"
            "Gasesti toate codurile de reducere Notino actualizate zilnic pe pagina dedicata de pe AmCupon.ro."
        )
    },
    {
        "slug": "platforme-afiliere-romania-ghid",
        "title": "Platforme de afiliere din Romania — Ghid complet 2Performant, Profitshare si altele",
        "date": "2026-05-14",
        "excerpt": "Ghid pentru cumparatori: cum functioneaza linkurile de afiliere, de ce codurile de reducere sunt gratuite si cum beneficiezi tu din sistemul de afiliere.",
        "category": "Despre noi",
        "magazin": None,
        "cover": "https://picsum.photos/seed/afiliere-platforme-ro/800/400",
        "content": (
            "## Ce este marketingul afiliat?\n\n"
            "Marketingul afiliat este un sistem prin care publisheri (site-uri precum AmCupon.ro) "
            "promoveaza produsele unui magazin si primesc un comision pentru fiecare vanzare generata.\n\n"
            "## Platformele principale din Romania\n\n"
            "**2Performant** — Cea mai mare platforma de afiliere din Romania cu peste 600 de magazine partenere. "
            "AmCupon.ro foloseste 2Performant ca sursa principala de date si linkuri.\n\n"
            "**Profitshare** — A doua platforma importanta, cu magazine romanesti si internationale.\n\n"
            "**Awin** — Platforma globala cu prezenta in Romania, magazine de top din Europa.\n\n"
            "**CJ Affiliate** — Platforma internationala cu branduri mari globale.\n\n"
            "## Cum beneficiezi tu ca si cumparator?\n\n"
            "Cand cumperi printr-un link de pe AmCupon.ro:\n\n"
            "- **Tu primesti:** codul de reducere + pretul normal sau mai mic\n"
            "- **Magazinul plateste:** un comision mic din bugetul de marketing\n"
            "- **AmCupon.ro primeste:** comisionul afiliat\n"
            "- **Tu nu platesti nimic in plus**\n\n"
            "## De ce sunt gratuite codurile de reducere?\n\n"
            "Magazinele ofera coduri de reducere ca instrument de atragere clienti noi. "
            "Ele sunt dispuse sa plateasca un comision platformelor afiliate (2Performant, Profitshare) "
            "deoarece genereaza vanzari suplimentare.\n\n"
            "## Transparenta AmCupon.ro\n\n"
            "Suntem transparenti: toate linkurile de pe AmCupon.ro sunt linkuri afiliate. "
            "Asta ne permite sa mentinem site-ul gratuit si sa continuam sa verificam zilnic codurile."
        )
    },
]

added = 0
for post in new_posts:
    if post['slug'] not in existing_slugs:
        posts.append(post)
        existing_slugs.add(post['slug'])
        added += 1
        print(f"  + {post['slug']}")
    else:
        print(f"  skip (exista): {post['slug']}")

# Sorteaza dupa data descrescator
posts.sort(key=lambda p: p['date'], reverse=True)

# Pastreaza max 60
posts = posts[:60]

with open(BLOG_PATH, 'w', encoding='utf-8') as f:
    json.dump(posts, f, ensure_ascii=False, indent=2)

print(f"\nTotal: {len(posts)} articole ({added} adaugate)")
