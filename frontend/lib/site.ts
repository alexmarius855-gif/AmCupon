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

/** Meniul de sus, pe ecrane late. */
export const MENIU_PRINCIPAL: Link[] = [
  { href: "/", label: "Acasa" },
  { href: "/#promotii", label: "Promotii" },
  { href: "/produse", label: "Produse" },
  { href: "/blog", label: "Blog" },
  { href: "/toate-magazinele", label: "Magazine" },
  { href: "/categorii", label: "Categorii" },
  { href: "/comparator", label: "Comparator" },
  { href: "/top-reduceri", label: "Top reduceri" },
];

/** Meniul de pe telefon (butonul ☰). */
export const MENIU_MOBIL: Link[] = [
  { href: "/", label: "🏠 Acasa" },
  { href: "/#promotii", label: "🔥 Promotii active" },
  { href: "/produse", label: "🛍️ Produse" },
  { href: "/blog", label: "📝 Blog" },
  { href: "/toate-magazinele", label: "🏪 Toate magazinele" },
  { href: "/categorii", label: "📂 Categorii" },
  { href: "/comparator", label: "⚖️ Comparator magazine" },
  { href: "/top-reduceri", label: "⭐ Top reduceri" },
  { href: "/esim", label: "📡 eSIM Calatorie" },
  { href: "/vpn", label: "🛡️ Cel mai bun VPN" },
  { href: "/hosting", label: "🌐 Hosting ieftin" },
  { href: "/extensie", label: "🧩 Extensie Chrome" },
  { href: "/ai-tools", label: "🧠 Programe Afiliere AI" },
  { href: "/newsletter", label: "📧 Newsletter" },
];

/**
 * Coloanele din subsol. Subsolul apare pe toate paginile (si prima pagina il refoloseste), deci un link pus aici
 * scoate o pagina din starea de „orfana" — fara linkuri interne Google o gaseste doar din sitemap.
 * Sluguri de categorie: doar cele reale din output.json (vezi CLAUDE.md, „Categorii sluguri").
 */
export const SUBSOL: { categorii: Link[]; reduceri: Link[]; utilizatori: Link[]; parteneri: Link[] } = {
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
    { href: "/produse", label: "Produse de la parteneri" },
    { href: "/black-friday", label: "Black Friday" },
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
  utilizatori: [
    { href: "/blog", label: "Revista & Ghiduri" },
    { href: "/newsletter", label: "Newsletter gratuit" },
    { href: "/extensie", label: "Extensie Chrome" },
    { href: "/toate-magazinele", label: "Toate magazinele" },
    { href: "/despre-noi", label: "Despre noi" },
    { href: "/contact", label: "Contact" },
    { href: "/confidentialitate", label: "Politica GDPR" },
    { href: "/termeni", label: "Termeni și condiții" },
  ],
  parteneri: [
    { href: "/despre-noi", label: "Colaborează cu noi" },
    { href: "/contact", label: "Listează magazinul tău" },
    { href: "/servicii", label: "Servicii & Software" },
    { href: "/asigurari", label: "Asigurări RCA & CASCO" },
    { href: "/instrumente-seo", label: "Instrumente marketing" },
  ],
};
