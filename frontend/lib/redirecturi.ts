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
