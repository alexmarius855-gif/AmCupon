import json
import os

posts = [
  {
    "slug": "ghid-coduri-reducere-online-2026",
    "title": "Ghid complet: Cum sa economisesti cu coduri de reducere online in 2026",
    "date": "2026-05-20",
    "excerpt": "Tot ce trebuie sa stii despre codurile de reducere: cum le gasesti, cum le folosesti si cum economisesti cel mai mult la cumparaturile online.",
    "category": "Ghiduri",
    "magazin": None,
    "cover": "https://picsum.photos/seed/ghid-reduceri-2026/800/400",
    "content": (
      "## Ce sunt codurile de reducere?\n\n"
      "Codurile de reducere sunt siruri de litere si cifre pe care le introduci la finalizarea unei comenzi online pentru a primi o reducere. "
      "Magazinele le ofera ca metoda de promovare, iar tu beneficiezi direct.\n\n"
      "## Unde gasesti coduri de reducere in 2026?\n\n"
      "Cea mai simpla metoda este sa folosesti un agregator de coduri precum AmCupon.ro. "
      "Noi colectam si verificam zilnic codurile de la peste 600 de magazine partenere din Romania.\n\n"
      "Alte surse:\n\n"
      "- Newsletter-ul magazinelor favorite\n"
      "- Paginile de social media ale brandurilor\n"
      "- Programe de loialitate pentru clienti fideli\n\n"
      "## Cum folosesti un cod de reducere?\n\n"
      "Procesul este simplu si dureaza sub un minut:\n\n"
      "- Copiaza codul din pagina promotiei de pe AmCupon.ro\n"
      "- Adauga produsele dorite in cosul de cumparaturi al magazinului\n"
      "- La pasul de checkout, cauta campul Cod promotional, Voucher sau Cupon\n"
      "- Introdu codul si apasa Aplica\n"
      "- Reducerea se scade automat din total\n\n"
      "## Cele mai bune categorii pentru reduceri\n\n"
      "- **Fashion** - reduceri de 20-50% la colectiile de sezon\n"
      "- **Electronice** - cashback si reduceri la lansari de produse\n"
      "- **Farmacie si Cosmetice** - coduri regulate cu reduceri de 10-15%\n"
      "- **Carti** - reduceri consistente la edituri online\n"
      "- **Sport si Outdoor** - promotii in perioadele pre-sezon\n\n"
      "## Sfaturi pentru a maximiza economiile\n\n"
      "- Verifica AmCupon.ro inainte de orice cumparatura\n"
      "- Urmareste sectiunea Expira azi pentru oferte urgente\n"
      "- Compara rata de succes a codurilor\n"
      "- Actualizare zilnica - intotdeauna gasesti cel mai nou cod disponibil."
    )
  },
  {
    "slug": "top-reduceri-mai-2026",
    "title": "Top reduceri online - Mai 2026: Cele mai bune oferte ale lunii",
    "date": "2026-05-22",
    "excerpt": "Cele mai bune coduri de reducere si promotii active in Mai 2026 de la fashion, electronice, cosmetice si alte magazine populare din Romania.",
    "category": "Lunare",
    "magazin": None,
    "cover": "https://picsum.photos/seed/top-mai-2026/800/400",
    "content": (
      "## Reduceri fashion - Mai 2026\n\n"
      "Luna mai aduce colectii de vara si reduceri la hainele de primavara. "
      "Cele mai active magazine in aceasta perioada sunt cele din categoria fashion, cu reduceri de pana la 40%.\n\n"
      "Answear, Fashion Days si Zalando au promotii active constant in aceasta perioada.\n\n"
      "## Electronice si IT&C\n\n"
      "Perioada mai-iunie este favorabila pentru cumpararea de electronice:\n\n"
      "- Laptopuri si tablete - reduceri la stocuri ramase\n"
      "- Telefoane - oferte bundle cu accesorii\n"
      "- Casti si audio - reduceri frecvente de 15-25%\n\n"
      "## Cosmetice si ingrijire\n\n"
      "Categoria beauty este una dintre cele mai active in termeni de coduri de reducere. "
      "Notino, Douglas si Farmec actualizeaza constant ofertele.\n\n"
      "Reducerile tipice in mai: 10-20% la parfumuri, 15% la skincare, oferte 1+1 la produse de ingrijire.\n\n"
      "## Carti si educatie\n\n"
      "Finele anului scolar aduce promotii la carti si materiale educationale. "
      "Elefant.ro si Libris ofera coduri regulate cu reduceri de 10-20%.\n\n"
      "## Cum folosesti aceasta lista?\n\n"
      "Pentru fiecare categorie mentionata, poti gasi codurile actualizate pe AmCupon.ro. "
      "Toate codurile sunt verificate si afisam rata de succes."
    )
  },
  {
    "slug": "cum-functioneaza-site-afiliat-romania",
    "title": "Cum functioneaza un site de coduri reducere? Tot adevarul despre linkurile afiliate",
    "date": "2026-05-18",
    "excerpt": "Transparenta totala: cum functioneaza AmCupon.ro, ce sunt linkurile afiliate si de ce codurile de reducere sunt gratuite pentru tine.",
    "category": "Despre noi",
    "magazin": None,
    "cover": "https://picsum.photos/seed/afiliere-transparenta/800/400",
    "content": (
      "## Ce este un site de coduri reducere?\n\n"
      "AmCupon.ro este un agregator de oferte - colectam si verificam coduri de reducere de la sute de magazine partenere "
      "si le afisam centralizat, gratuit pentru utilizatori.\n\n"
      "## Ce sunt linkurile de afiliat?\n\n"
      "Atunci cand dai click pe butonul Mergi la magazin de pe AmCupon.ro, esti redirectat prin sistemul 2Performant. "
      "Daca finalizezi o comanda la magazin, noi primim un comision mic de la magazin.\n\n"
      "Important de retinut:\n\n"
      "- Tu nu platesti nimic in plus\n"
      "- Comisionul este platit de magazin din bugetul de marketing\n"
      "- Codul de reducere functioneaza indiferent de sursa\n\n"
      "## De ce sunt gratuite codurile de reducere?\n\n"
      "Este un model win-win-win:\n\n"
      "- Magazinul obtine clienti noi\n"
      "- AmCupon.ro primeste un comision mic\n"
      "- Tu economisesti cu codul de reducere\n\n"
      "## Cum verificam codurile?\n\n"
      "- Rata de succes (% utilizatori care au reusit sa foloseasca codul)\n"
      "- Zilele ramase de valabilitate\n"
      "- Descrierea exacta a conditilor de utilizare\n\n"
      "## Concluzie\n\n"
      "AmCupon.ro functioneaza transparent: codul tau de reducere este real, gratuit si verificat. "
      "Noi castigam doar daca tu cumperi."
    )
  },
  {
    "slug": "coduri-reducere-fashion-vara-2026",
    "title": "Coduri reducere Fashion Vara 2026 - Answear, Fashion Days, Zalando",
    "date": "2026-05-24",
    "excerpt": "Cele mai bune coduri de reducere pentru haine si accesorii online in vara 2026. Reduceri verificate la Answear, Fashion Days, Zalando si alte magazine de moda.",
    "category": "Fashion",
    "magazin": "answear.ro",
    "cover": "https://picsum.photos/seed/fashion-vara-2026/800/400",
    "content": (
      "## De ce vara este sezonul reducerilor fashion?\n\n"
      "Magazinele de moda online folosesc sezonul de vara pentru a lichida stocurile de primavara si a face loc colectiilor noi. "
      "Asta inseamna reduceri reale de 20-50%.\n\n"
      "## Answear.ro - Moda internationala cu reduceri\n\n"
      "Answear este unul dintre cele mai populare magazine de moda online din Romania, "
      "cu branduri internationale precum Tommy Hilfiger, Calvin Klein si Levis.\n\n"
      "Tipuri de reduceri disponibile:\n\n"
      "- Coduri procentuale (10-20% din total cos)\n"
      "- Reduceri la colectiile de sezon\n"
      "- Transport gratuit de la o anumita suma\n\n"
      "## Fashion Days - Reduceri la branduri premium\n\n"
      "Fashion Days organizeaza frecvent campanii cu reduceri semnificative. "
      "Evenimentele lor pot aduce reduceri de 30-60% la articolele selectate.\n\n"
      "Ce sa verifici:\n\n"
      "- Coduri pentru prima comanda (reduceri mai mari pentru clienti noi)\n"
      "- Oferte la cos minim\n"
      "- Campanii flash cu durata limitata\n\n"
      "## Zalando Romania - Selectie extinsa\n\n"
      "Zalando are una dintre cele mai mari selectii de moda din Europa, cu returnare gratuita 100 de zile.\n\n"
      "## Sfaturi pentru cumparaturi fashion online\n\n"
      "- Adauga in wishlist articolele dorite si verifica daca pretul scade\n"
      "- Cumpara la finalul sezonului pentru reduceri maxime\n"
      "- Verifica politica de returnare inainte de cumparare\n\n"
      "Toate magazinele de fashion mentionate sunt partenere AmCupon.ro. Codurile sunt actualizate zilnic."
    )
  }
]

out_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'public', 'blog-posts.json')
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(posts, f, ensure_ascii=False, indent=2)

print(f"Written {len(posts)} posts to {out_path}")

# Validate
with open(out_path, 'r', encoding='utf-8') as f:
    check = json.load(f)
print(f"Validation OK: {len(check)} posts loaded")
for p in check:
    print(f"  - {p['slug']}")
