/**
 * SURSA UNICA pentru redirecturile permanente ale site-ului.
 *
 * De ce exista fisierul asta separat, si nu doar o lista in `next.config.ts`:
 * pe 21.08.2026, exportul GSC a aratat ca 7 din cele 462 de URL-uri din sitemap
 * raspundeau 308 (redirect). Motivul: paginile fusesera sterse si redirectionate
 * in `next.config.ts`, dar nimeni nu le-a scos si din `app/sitemap.ts` — doua liste
 * intretinute manual care au divergat tacut.
 *
 * Un sitemap trebuie sa contina DOAR URL-uri canonice care raspund 200. Un redirect
 * trimis la indexare e un semnal care se contrazice singur ("indexeaza asta" +
 * "asta e de fapt in alta parte"), iar Google il raporteaza ca "Pagina cu redirect".
 *
 * Acum ambele fisiere citesc de AICI. Adaugi un redirect intr-un singur loc si
 * sitemap-ul se curata singur.
 */

export type Redirect = {
  source: string;
  destination: string;
  permanent: boolean;
};

export const REDIRECTURI: Redirect[] = [
  // ── Unelte de calcul, ELIMINATE 11.08.2026 (decizie explicita Alex) ────────
  // Cele fiscale dadeau cifre care se schimba prin lege (cote CAS/CASS/impozit,
  // cote TVA) si te pot expune daca cineva isi calculeaza gresit obligatiile, iar
  // generatorul de proforma producea un document cu aspect oficial intr-un context
  // in care e-Factura e obligatorie din 2024. Nu au fost sterse pur si simplu:
  // erau indexate si primeau trafic, deci 301 catre /servicii — semnalul SEO se
  // transfera, iar linkurile vechi nu ajung in 404.
  // Daca se reiau vreodata: NU repune calcule fiscale fara sursa oficiala verificata
  // la fiecare rulare + disclaimer explicit; varianta fara risc e aritmetica pura.
  { source: "/calculator",          destination: "/servicii", permanent: true },
  { source: "/calculator-salariu",  destination: "/servicii", permanent: true },
  { source: "/calculator-tva",      destination: "/servicii", permanent: true },
  { source: "/calculator-procente", destination: "/servicii", permanent: true },
  { source: "/generator-proforma",  destination: "/servicii", permanent: true },

  // ── Profitshare EXCLUS 19.08.2026 (cont respins) ──────────────────────────
  // Magazinele au disparut din date. Astea erau in sitemap, deci indexate: fara
  // 301 ar fi devenit 404-uri. Destinatia e categoria reala a fiecaruia.
  //
  // CORECTIE 21.08.2026: pe 19.08 redirectionasem si libris.ro, vegis.ro, pint.ro
  // si pcmadd.com. Gresit — alea NU erau Profitshare-only: exista si pe 2Performant,
  // cu link afiliat real (aff_code 541547473) si comision 8%. Mi-am taiat singur
  // 4 pagini monetizabile timp de 2 zile. Regula invatata: exclude dupa PLATFORMA
  // din inregistrare, niciodata dupa numele magazinului — acelasi brand poate exista
  // in mai multe retele simultan.
  { source: "/cod-reducere/daedalusonline.eu", destination: "/categorii/casa-gradina",  permanent: true },
  { source: "/cod-reducere/emag.ro",           destination: "/categorii/marketplace",   permanent: true },
  { source: "/cod-reducere/evrik.ro",          destination: "/categorii/casa-gradina",  permanent: true },
  { source: "/cod-reducere/exclusive-home.ro", destination: "/categorii/casa-gradina",  permanent: true },
  { source: "/cod-reducere/fashiondays.ro",    destination: "/categorii/fashion",       permanent: true },
  { source: "/cod-reducere/giftspot.ro",       destination: "/categorii/cadouri-flori", permanent: true },
  { source: "/cod-reducere/itgalaxy.ro",       destination: "/categorii/electronice",   permanent: true },
  { source: "/cod-reducere/mathaus.ro",        destination: "/categorii/casa-gradina",  permanent: true },
  { source: "/cod-reducere/vapetronic.ro",     destination: "/categorii/marketplace",   permanent: true },


  // -- Taxonomie veche, ELIMINATA la commit b048300 --------------------------
  // "Taxonomie canonica: 40 etichete fragmentate -> 18 categorii RO curate".
  // Slugurile vechi (jumatate in engleza) au ramas 404 de atunci. Descoperit
  // 21.08.2026 din GSC: "Nu a fost gasita (404) - 35 pagini, validare esuata".
  // Am testat live toate cele 38 de sluguri vechi: 29 raspundeau 404.
  //
  // A PATRA oara cand tiparul asta loveste proiectul (vezi docs/LECTII-TEHNICE.md).
  // Regula: cand redenumesti un slug care a fost VREODATA public, redirectul se scrie
  // in ACELASI commit cu redenumirea. Un 404 pe o pagina indexata nu e o pagina lipsa,
  // e un semnal de calitate slaba trimis lui Google.
  //
  // Fiecare destinatie a fost verificata live ca raspunde 200 inainte de commit -
  // un redirect catre alt 404 ar fi fost mai rau decat 404-ul original.
  { source: "/categorii/ai-tools",            destination: "/ai-tools", permanent: true },
  { source: "/categorii/automotive",          destination: "/categorii/auto-moto", permanent: true },
  { source: "/categorii/babies-kids-toys",    destination: "/categorii/copii", permanent: true },
  { source: "/categorii/books",               destination: "/categorii/carti-educatie", permanent: true },
  { source: "/categorii/calatorie",           destination: "/categorii/calatorii", permanent: true },
  { source: "/categorii/carduri-bancare",     destination: "/carduri-bancare", permanent: true },
  { source: "/categorii/casa",                destination: "/categorii/casa-gradina", permanent: true },
  { source: "/categorii/cursuri-online",      destination: "/cursuri-online", permanent: true },
  { source: "/categorii/diverse",             destination: "/categorii", permanent: true },
  { source: "/categorii/electronics-itc",     destination: "/categorii/electronice", permanent: true },
  { source: "/categorii/farmacie",            destination: "/categorii/sanatate", permanent: true },
  { source: "/categorii/flowers-gifts",       destination: "/categorii/cadouri-flori", permanent: true },
  { source: "/categorii/food-beverages",      destination: "/categorii/mancare-bauturi", permanent: true },
  { source: "/categorii/frumusete",           destination: "/categorii/beauty", permanent: true },
  { source: "/categorii/games",               destination: "/jocuri", permanent: true },
  { source: "/categorii/gifts-flowers",       destination: "/categorii/cadouri-flori", permanent: true },
  { source: "/categorii/health-personal-care", destination: "/categorii/sanatate", permanent: true },
  { source: "/categorii/home-garden",         destination: "/categorii/casa-gradina", permanent: true },
  { source: "/categorii/hosting",             destination: "/hosting", permanent: true },
  { source: "/categorii/idei-cadouri",        destination: "/idei-cadouri", permanent: true },
  { source: "/categorii/jewelry-accessories", destination: "/categorii/bijuterii", permanent: true },
  { source: "/categorii/jocuri",              destination: "/jocuri", permanent: true },
  { source: "/categorii/online-mall",         destination: "/categorii/marketplace", permanent: true },
  { source: "/categorii/pet-supplies",        destination: "/categorii/animale", permanent: true },
  { source: "/categorii/pharma",              destination: "/categorii/sanatate", permanent: true },
  { source: "/categorii/software-business",   destination: "/software-business", permanent: true },
  { source: "/categorii/sports-outdoors",     destination: "/categorii/sport", permanent: true },
  { source: "/categorii/supermarket",         destination: "/supermarket", permanent: true },
  { source: "/categorii/telecom",             destination: "/categorii/servicii", permanent: true },

  // ── Pagini de brand STERSE fizic (app/emag/, app/libris/ etc. nu mai exista) ──
  { source: "/emag",        destination: "/categorii/marketplace",  permanent: true },
  { source: "/fashiondays", destination: "/fashion",                permanent: true },
  { source: "/libris",      destination: "/carti",                  permanent: true },
  { source: "/vegis",       destination: "/sanatate",               permanent: true },
  { source: "/pcmadd",      destination: "/categorii/electronice",  permanent: true },
];

/** Caile care raspund cu redirect — folosit de `app/sitemap.ts` ca filtru final. */
export const CAI_REDIRECTIONATE: ReadonlySet<string> = new Set(
  REDIRECTURI.map((r) => r.source)
);
