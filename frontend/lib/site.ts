/**
 * CONFIGURAREA SITE-ULUI — locul unde schimbi ce se modifica des, fara sa umbli prin componente.
 *
 * 14.10.2026, la cererea lui Alex („sa fie usor de modificat aproape orice"): listele de linkuri din meniu si
 * din subsol erau scrise direct in Navbar.tsx si Footer.tsx, iar prima pagina isi importa o parte din Footer.
 * Acum stau AICI, intr-un fisier fara cod de interfata — il poate citi orice componenta (server sau client).
 *
 * Harta completa „vrei sa schimbi X -> editezi Y": docs/HARTA-SITE.md.
 */

export type Link = { href: string; label: string };

/** Identitatea site-ului. */
export const SITE = {
  nume: "AmCupon.ro",
  domeniu: "amcupon.ro",
  url: "https://amcupon.ro",
  emailContact: "contact@amcupon.ro",
  social: [
    { href: "https://www.facebook.com/amcupon.ro", label: "Facebook" },
    { href: "https://www.instagram.com/amcupon.ro", label: "Instagram" },
    { href: "https://www.tiktok.com/@amcupon.ro", label: "TikTok" },
    { href: "https://www.pinterest.com/amcuponro", label: "Pinterest" },
  ] as Link[],
};

/** Categoriile, cu slugurile reale din output.json (o categorie fara magazine nu se afiseaza). */
export const CATEGORII_SITE: { slug: string; label: string; desc: string }[] = [
  { slug: "fashion", label: "Fashion", desc: "Haine, pantofi și accesorii" },
  { slug: "casa-gradina", label: "Casă & Grădină", desc: "Mobilă, decor, unelte" },
  { slug: "electronice", label: "Electronice & IT", desc: "Telefoane, laptopuri, gadgeturi" },
  { slug: "beauty", label: "Beauty & Îngrijire", desc: "Cosmetice, parfumuri, unghii" },
  { slug: "sanatate", label: "Sănătate & Farmacie", desc: "Farmacie, suplimente, îngrijire" },
  { slug: "software", label: "Software & Digital", desc: "VPN, hosting, aplicații" },
  { slug: "sport", label: "Sport & Fitness", desc: "Echipament sportiv și outdoor" },
  { slug: "copii", label: "Copii & Familie", desc: "Jucării, bebe, îmbrăcăminte" },
  { slug: "calatorii", label: "Călătorii", desc: "Cazare, zboruri, eSIM" },
  { slug: "auto-moto", label: "Auto & Moto", desc: "Piese, anvelope, accesorii" },
  { slug: "carti-educatie", label: "Cărți & Educație", desc: "Cărți, e-books, manuale" },
  { slug: "mancare-bauturi", label: "Mâncare & Băuturi", desc: "Cafea, vin, alimente" },
  { slug: "animale", label: "Pet Shop", desc: "Hrană și accesorii pentru animale" },
  { slug: "cadouri-flori", label: "Cadouri & Flori", desc: "Flori, cadouri, experiențe" },
  { slug: "bijuterii", label: "Bijuterii & Ceasuri", desc: "Bijuterii, ceasuri, accesorii" },
  { slug: "financiar", label: "Financiar", desc: "Carduri, credite, asigurări" },
  { slug: "servicii", label: "Servicii", desc: "Servicii online și abonamente" },
  { slug: "marketplace", label: "Marketplace", desc: "Magazine cu de toate" },
];

/** Paginile pe teme (fiecare are oferte + ghid), listate pe /categorii. */
export const NISE_SITE: Link[] = [
  { href: "/fashion", label: "Fashion & Haine" },
  { href: "/electronice", label: "Electronice & IT" },
  { href: "/frumusete", label: "Beauty & Cosmetice" },
  { href: "/parfumuri", label: "Parfumuri" },
  { href: "/casa", label: "Casă & Grădină" },
  { href: "/sport", label: "Sport & Outdoor" },
  { href: "/farmacie", label: "Farmacie online" },
  { href: "/sanatate", label: "Sănătate & Naturiste" },
  { href: "/copii", label: "Copii & Jucării" },
  { href: "/animale", label: "Animale de companie" },
  { href: "/calatorie", label: "Vacanțe & Travel" },
  { href: "/gadgets", label: "Gadgets & Tech" },
  { href: "/moto", label: "Auto-Moto" },
  { href: "/carti", label: "Cărți & Educație" },
  { href: "/idei-cadouri", label: "Idei de cadouri" },
];

/** Meniul de sus, pe ecrane late. */
export const MENIU_PRINCIPAL: Link[] = [
  { href: "/oferte-azi", label: "Oferte azi" },
  { href: "/black-friday", label: "Black Friday" },
  { href: "/top-reduceri", label: "Top reduceri" },
  { href: "/categorii", label: "Categorii" },
  { href: "/toate-magazinele", label: "Magazine" },
  { href: "/alege", label: "Alege produsul" }, // 77 din 86 de clicuri reale (07-14.11.2026) vin de pe /alege
  { href: "/produse", label: "Produse" },
  { href: "/blog", label: "Ghiduri" },
];

/** Meniul de pe telefon (butonul ☰). */
export const MENIU_MOBIL: Link[] = [
  ...MENIU_PRINCIPAL,
  { href: "/comparator", label: "Comparator magazine" },
  { href: "/esim", label: "eSIM de călătorie" },
  { href: "/vpn", label: "VPN" },
  { href: "/hosting", label: "Hosting" },
  { href: "/newsletter", label: "Newsletter" },
];

/**
 * Coloanele din subsol. Subsolul apare pe toate paginile, inclusiv pe prima (din 03.11.2026), deci un link pus aici
 * scoate o pagina din starea de „orfana" — fara linkuri interne Google o gaseste doar din sitemap.
 * Sluguri de categorie: doar cele reale din output.json (vezi CLAUDE.md, „Categorii sluguri").
 */
export const SUBSOL: { categorii: Link[]; reduceri: Link[]; nise: Link[]; utilizatori: Link[] } = {
  categorii: [
    { href: "/categorii/fashion", label: "Fashion & Haine" },
    { href: "/categorii/electronice", label: "Electronice & IT" },
    { href: "/categorii/beauty", label: "Frumusețe & Beauty" },
    { href: "/categorii/casa-gradina", label: "Casă & Grădină" },
    { href: "/categorii/sanatate", label: "Sănătate & Farmacie" },
    { href: "/categorii/sport", label: "Sport & Fitness" },
    { href: "/categorii/copii", label: "Copii & Familie" },
    { href: "/categorii/auto-moto", label: "Auto & Moto" },
    { href: "/categorii/carti-educatie", label: "Cărți & Educație" },
    { href: "/categorii/bijuterii", label: "Bijuterii & Ceasuri" },
  ],
  reduceri: [
    { href: "/oferte-azi", label: "Oferte de azi" },
    { href: "/top-reduceri", label: "Top reduceri" },
    { href: "/top", label: "Topuri: cele mai bune produse" },
    { href: "/alege", label: "Alege după caracteristică" },
    { href: "/produse", label: "Produse de la parteneri" },
    { href: "/black-friday", label: "Black Friday" },
    { href: "/reduceri-reale", label: "Reduceri reale (istoric de preț)" },
    { href: "/craciun", label: "Reduceri Crăciun" },
    { href: "/idei-cadouri", label: "Idei cadouri" },
    { href: "/comparatii", label: "Comparații magazine" },
    { href: "/supermarket", label: "Supermarket online" },
    { href: "/smart-home", label: "Smart Home" },
    { href: "/antivirus", label: "Antivirus & securitate" },
    { href: "/pescuit", label: "Echipament pescuit" },
    { href: "/rochii-mireasa", label: "Rochii de mireasă" },
    { href: "/studiu/coduri-reducere-romania", label: "Studiu: coduri de reducere" },
    { href: "/calculatoare", label: "Calculatoare și unelte" },
  ],
  nise: [
    { href: "/fashion", label: "Fashion & Haine" },
    { href: "/casa", label: "Casă & Grădină" },
    { href: "/frumusete", label: "Beauty" },
    { href: "/farmacie", label: "Farmacie online" },
    { href: "/sanatate", label: "Sănătate & Naturiste" },
    { href: "/sport", label: "Sport & Outdoor" },
    { href: "/copii", label: "Copii & Jucării" },
    { href: "/animale", label: "Animale de companie" },
    { href: "/gadgets", label: "Gadgets & Tech" },
    { href: "/calatorie", label: "Vacanțe & Travel" },
    { href: "/flori", label: "Flori & Buchete" },
    { href: "/servicii", label: "Servicii & Software" },
    { href: "/asigurari", label: "Asigurări RCA & CASCO" },
    { href: "/instrumente-seo", label: "Instrumente marketing" },
  ],
  utilizatori: [
    { href: "/blog", label: "Revista & Ghiduri" },
    { href: "/newsletter", label: "Newsletter gratuit" },
    { href: "/extensie", label: "Extensie Chrome" },
    { href: "/toate-magazinele", label: "Toate magazinele" },
    { href: "/despre-noi", label: "Despre noi" },
    { href: "/contact", label: "Contact și listare magazin" },
    { href: "/confidentialitate", label: "Politica GDPR" },
    { href: "/termeni", label: "Termeni și condiții" },
  ],
};
