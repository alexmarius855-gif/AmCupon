/**
 * Unde duce butonul „Vezi la X" de pe /top/<tema> (04.11.2026).
 *
 * Pana acum, oricine citea despre Dior Sauvage si apasa „Vezi la Notino" ajungea pe PRIMA PAGINA a
 * magazinului si trebuia sa caute singur parfumul. Mai rau: 10 din cele 39 de butoane trimiteau la un
 * magazin care nu vinde produsul (Bleu de Chanel la Notino, Secretlab la GeekMall).
 *
 * Fiecare intrare a fost verificata pe site-ul magazinului, in browser, pe 04.11.2026:
 *  - `url`: pagina unde gasesti produsul. Linkul platit ramane acelasi, se schimba doar `redirect_to`.
 *  - `modele: true`: pagina arata produse din familia lui, nu neaparat modelul exact; butonul spune
 *    „Vezi modele la X", ca sa nu promita ce pagina nu arata.
 *  - `null`: magazinul nu are produsul, deci nu primeste buton.
 *
 * Un produs sau un magazin care nu e in tabel pastreaza linkul spre prima pagina: nu inventam adrese
 * neverificate. `destinatiiTop.test.mjs` pica daca /top primeste un buton fara intrare aici.
 */
export interface DestinatieTop {
  url: string;
  modele?: boolean;
}

const notino = (termen: string) => `https://www.notino.ro/search.asp?exps=${encodeURIComponent(termen).replace(/%20/g, "+")}`;
const noriel = (termen: string) => `https://noriel.ro/catalogsearch/result/?q=${encodeURIComponent(termen).replace(/%20/g, "+")}`;
const evomag = (termen: string) => `https://www.evomag.ro/?sn.q=${encodeURIComponent(termen).replace(/%20/g, "+")}`;
const answear = (cale: string) => `https://answear.ro${cale}`;
const vidaxl = (termen: string) => `https://www.vidaxl.ro/catalogsearch/result?q=${encodeURIComponent(termen).replace(/%20/g, "+")}`;

export const DESTINATII_TOP: Record<string, Record<string, DestinatieTop | null>> = {
  "notino.ro": {
    "Lancome La Vie Est Belle": { url: notino("Lancome La Vie Est Belle") },
    "Yves Saint Laurent Libre": { url: notino("Yves Saint Laurent Libre") },
    "Chloe Eau de Parfum": { url: notino("Chloe Eau de Parfum") },
    "Carolina Herrera Good Girl": { url: notino("Carolina Herrera Good Girl") },
    "Nivea / Bruno Banani Woman": { url: notino("Bruno Banani Woman"), modele: true },
    "Dior Sauvage": { url: notino("Dior Sauvage") },
    "Paco Rabanne Invictus": { url: notino("Paco Rabanne Invictus") },
    "Jean Paul Gaultier Le Male": { url: notino("Jean Paul Gaultier Le Male") },
    // „STR8 Faded" da doar geluri de dus si after shave; parfumurile Adidas chiar exista.
    "Adidas / STR8 Faded Glory": { url: notino("Adidas parfum"), modele: true },
    // Cautarea da alte parfumuri (Light Blue, Bleu Noir): Notino nu vinde Chanel.
    "Bleu de Chanel": null,
  },
  "noriel.ro": {
    "Set LEGO Classic constructie": { url: noriel("LEGO Classic"), modele: true },
    "Puzzle educativ lemn": { url: noriel("puzzle lemn"), modele: true },
    "Masina telecomanda off-road": { url: noriel("masina cu telecomanda"), modele: true },
    "Microscop / kit stiinta copii": { url: noriel("microscop"), modele: true },
    "Set plus / jucarie senzoriala": { url: noriel("jucarie plus"), modele: true },
  },
  "evomag.ro": {
    "Apple iPad (A16)": { url: evomag("Apple iPad") },
    "Razer BlackShark V2 Pro": { url: evomag("Razer BlackShark V2 Pro") },
    "DJI Osmo Action 4": { url: evomag("DJI Osmo Action"), modele: true },
    "Rowenta X-Force Flex 9.60": { url: evomag("Rowenta X-Force"), modele: true },
    // Doar huse si accesorii, tableta nu apare.
    "Samsung Galaxy Tab S9 FE": null,
    // „Nu am gasit produse pentru Brother HL-L2400DW".
    "Brother HL-L2400DW": null,
    "Daikin Sensira 12000 BTU": null,
  },
  // Answear nu are adresa de cautare; duce la categoria produsului (generice, fara model exact).
  "answear.ro": {
    "Adidas Runfalcon 3.0": { url: answear("/m/adidas/barbati/incaltaminte/pantofi-sport"), modele: true },
    "Adidas Ultraboost Light": { url: answear("/m/adidas/femei/incaltaminte/pantofi-sport"), modele: true },
    "Geanta Tote piele ecologica": { url: answear("/k/femei/accesorii/genti-de-umar/shopper-si-tote"), modele: true },
    "Geanta Crossbody mini": { url: answear("/k/femei/accesorii/genti-de-umar/crossbody"), modele: true },
    "Geanta umar piele naturala": { url: answear("/k/femei/accesorii/genti-de-umar"), modele: true },
    "Geanta Shopper XL": { url: answear("/k/femei/accesorii/genti-de-umar/shopper-si-tote"), modele: true },
    "Geanta plic clutch": { url: answear("/k/femei/accesorii/genti-de-umar/borsete-si-genti-mici"), modele: true },
    "Colier argint 925 cu pandantiv": { url: answear("/k/femei/accesorii/bijuterii/coliere"), modele: true },
    "Cercei argint 925 tortite": { url: answear("/k/femei/accesorii/bijuterii/cercei"), modele: true },
    "Set argint colier + cercei": { url: answear("/k/femei/accesorii/bijuterii/seturi"), modele: true },
    "Bratara argint cu charm": { url: answear("/k/femei/accesorii/bijuterii/bratari"), modele: true },
  },
  // Verificat in browser pe 14.11.2026: vidaXL nu vinde biciclete electrice (cautarea da suporturi,
  // huse si biciclete de copii; „Engwe" da un set de safturi), dar are scaune de birou (509 rezultate,
  // 6 cu plasa). Scaunele din top sunt generice, deci „Vezi modele".
  "vidaxl.ro": {
    "Blaupunkt Fiene 500": null,
    "Ancheer 26 Mountain E-Bike": null,
    "Engwe EP-2 Pro": null,
    "Scaun ergonomic mesh premium": { url: vidaxl("scaun birou plasa"), modele: true },
    "Scaun birou mesh mid-back": { url: vidaxl("scaun birou plasa"), modele: true },
    "Scaun executiv piele ecologica": { url: vidaxl("scaun birou piele ecologica"), modele: true },
    "Scaun birou simplu reglabil": { url: vidaxl("scaun birou"), modele: true },
  },
  // Cautarea n-a gasit modelele (Rowenta, Levoit, Secretlab, DXRacer, bicicleta Xiaomi), iar
  // „Xiaomi Smart Air Purifier 4" a dat doar alte modele si filtre.
  "geekmall.ro": {
    "Rowenta Grind & Brew": null,
    "Xiaomi Smart Air Purifier 4": null,
    "Levoit Core 300S": null,
    "Secretlab TITAN Evo 2022": null,
    "DXRacer Formula F08": null,
    "Xiaomi Mi Smart Electric Folding Bike": null,
  },
};

/**
 * Paginile /top fara nicio oferta in feed (feed-ul are cel mult ~50 de produse pe magazin) si fara
 * magazin partener la modelele din top: pana pe 04.11.2026, televizoare, masini de spalat si alte 8
 * teme n-aveau NICIUN link spre un magazin, deci cititorul n-avea unde sa mearga.
 * Fiecare adresa a fost deschisa in browser si arata produse din tema, pe 04.11.2026.
 */
export interface LegaturaTema {
  magazin: string;
  eticheta: string;
  url: string;
}

const laEvomag = (termen: string): LegaturaTema => ({ magazin: "evomag.ro", eticheta: "Evomag", url: evomag(termen) });

export const LEGATURI_TEMA: Record<string, LegaturaTema[]> = {
  televizoare: [laEvomag("televizor")],
  cafetiere: [laEvomag("espressor")],
  "masini-de-spalat": [laEvomag("masina de spalat rufe")],
  "roboti-de-bucatarie": [laEvomag("robot de bucatarie")],
  "purificatoare-aer": [laEvomag("purificator aer")],
  "scaune-gaming": [laEvomag("scaun gaming")],
  imprimante: [laEvomag("imprimanta")],
  "aer-conditionat": [laEvomag("aer conditionat")],
  "boxe-bluetooth": [laEvomag("boxa bluetooth")],
  tablete: [laEvomag("tableta")],
  "casti-gaming": [laEvomag("casti gaming")],
  // Cautarea da mai ales accesorii, de aceea duce la categoria camerelor.
  "camere-actiune": [{ magazin: "evomag.ro", eticheta: "Evomag", url: "https://www.evomag.ro/foto-video-camere-video/" }],
  "biciclete-electrice": [{ magazin: "afisport.ro", eticheta: "AFI Sport", url: "https://afisport.ro/biciclete-electrice" }],
};

/** Legaturile unei teme, cu linkul platit al magazinului. Fara link platit, magazinul nu apare. */
export function legaturiTema(tema: string, linkuri: Map<string, string>): LegaturaTema[] {
  return (LEGATURI_TEMA[tema] || []).flatMap((l) => {
    const platit = linkuri.get(l.magazin);
    if (!platit) return [];
    const u = cuDestinatie(platit, l.url);
    return u ? [{ ...l, url: u }] : [];
  });
}

/** Acelasi link platit, cu alta pagina de destinatie; null daca linkul nu permite (fara `redirect_to`). */
function cuDestinatie(linkPlatit: string, destinatie: string): string | null {
  try {
    const u = new URL(linkPlatit);
    if (!u.searchParams.has("redirect_to")) return null;
    u.searchParams.set("redirect_to", destinatie);
    return u.toString();
  } catch {
    return null;
  }
}

/**
 * Linkul butonului pentru un produs, sau null cand magazinul nu are produsul.
 * Schimba doar `redirect_to` (linkurile rapide 2Performant); tracking-ul ramane neatins.
 */
export function destinatieTop(linkPlatit: string, magazin: string, produs: string): DestinatieTop | null {
  const intrare = DESTINATII_TOP[magazin]?.[produs];
  if (intrare === null) return null;
  if (!intrare) return { url: linkPlatit };
  const u = cuDestinatie(linkPlatit, intrare.url);
  return u ? { url: u, modele: intrare.modele } : { url: linkPlatit };
}
