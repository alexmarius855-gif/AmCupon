import fs from "fs";
import path from "path";
import { temaArticol } from "./topFeed";

/**
 * Produse pe o singura caracteristica: „masina de spalat 6 kg", „televizor 55 inch" (04.11.2026).
 * Datele vin din scripts/criterii_produse.py (public/criterii.json). Pagina exista doar cu cel putin
 * MIN_PRODUSE produse reale: fara pagini goale, care n-ar folosi nimanui si ar arata a pagini-punte.
 */
export interface ProdusCriteriu {
  titlu: string;
  pret: number;
  imagine: string;
  url: string;
  magazin: string;
  /** Id-ul din feed: leaga produsul de istoricul de pret si de linkul scurt /go/p/<id>. */
  id?: string;
  brand?: string;
  /** Pretul vechi anuntat de magazin; doar daca e plauzibil (scripts/criterii_produse.py). */
  pret_vechi?: number | null;
  /** Data la care pretul a fost citit de pe pagina magazinului. */
  verificat?: string;
}

export interface Criteriu {
  slug: string;
  tema: string;
  tema_nume: string;
  titlu: string;
  nota?: string | null;
  in_text?: string | null;
  actualizat: string;
  produse: ProdusCriteriu[];
  magazine?: string[];
  /** Pusa de scripts/criterii_produse.py: pagina a fost citita, iar preturile sunt confirmate pe site-ul magazinului. */
  publicat?: boolean;
}

export const MIN_PRODUSE = 4;

let _toate: Criteriu[] | null = null;

/** Criteriile cu destule produse, in ordinea din scripts/criterii_produse.py. */
export function criterii(): Criteriu[] {
  if (!_toate) {
    try {
      const d = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "criterii.json"), "utf-8"));
      _toate = ((d.criterii || []) as Criteriu[])
        .map((c) => ({ ...c, produse: (c.produse || []).filter((p) => p.verificat) }))
        .filter((c) => c.publicat === true && c.produse.length >= MIN_PRODUSE);
    } catch {
      _toate = [];
    }
  }
  return _toate;
}

export function criteriu(slug: string): Criteriu | null {
  return criterii().find((c) => c.slug === slug) || null;
}

/**
 * Cateva produse confirmate pentru o tema: pe rand din fiecare pagina, fara dubluri si cel mult doua de la acelasi
 * magazin. Le folosesc paginile /top, de unde vin clicurile.
 */
export function produseTema(tema: string, maxim = 8): ProdusCriteriu[] {
  const liste = criteriiTema(tema).map((c) => c.produse);
  const rez: ProdusCriteriu[] = [];
  const vazute = new Set<string>();
  const pe: Record<string, number> = {};
  for (let i = 0; i < 30 && rez.length < maxim; i++) {
    for (const l of liste) {
      const p = l[i];
      if (!p || vazute.has(p.url) || (pe[p.magazin] || 0) >= 2 || rez.length >= maxim) continue;
      vazute.add(p.url);
      pe[p.magazin] = (pe[p.magazin] || 0) + 1;
      rez.push(p);
    }
  }
  return rez;
}

export function criteriiTema(tema: string): Criteriu[] {
  return criterii().filter((c) => c.tema === tema);
}

/** Temele, cu criteriile lor, pentru pagina /alege. */
export function temeCriterii(): { tema: string; nume: string; criterii: Criteriu[] }[] {
  const harta = new Map<string, { tema: string; nume: string; criterii: Criteriu[] }>();
  for (const c of criterii()) {
    if (!harta.has(c.tema)) harta.set(c.tema, { tema: c.tema, nume: c.tema_nume, criterii: [] });
    harta.get(c.tema)?.criterii.push(c);
  }
  return [...harta.values()];
}

/**
 * Temele fiecarei categorii. Chei: paginile /categorii/<slug>, /produse/<slug> si /black-friday/categorie/<slug>.
 * Alex, 04.11.2026: „la unele categorii prin blocuri nu sunt puse link-uri detaliate, gen masina de spalat 6 kg".
 */
const CASA = ["masini-de-spalat", "frigidere", "friteuze", "saltele", "aer-conditionat", "aspiratoare-robot", "masini-de-spalat-vase", "cafetiere", "aspiratoare-fara-fir", "cuptoare", "roboti-de-bucatarie", "scaune-birou", "scule"];
const CATEGORII_TEME: Record<string, string[]> = {
  electronice: ["televizoare", "laptopuri", "telefoane", "monitoare", "tablete", "casti-wireless", "boxe-bluetooth", "smartwatch-uri", "imprimante", "componente", "power-bank", "drone", "supraveghere"],
  casa: CASA,
  "casa-gradina": CASA,
  beauty: ["cosmetice", "parfumuri-femei", "parfumuri-barbati"],
  sanatate: ["suplimente"],
  farmacie: ["suplimente", "cosmetice"],
  sport: ["sport", "biciclete-electrice", "trotinete-electrice"],
  auto: ["anvelope"],
  "auto-moto": ["anvelope"],
  jocuri: ["casti-gaming", "scaune-gaming", "monitoare"],
  fashion: ["incaltaminte", "imbracaminte"],
  copii: ["copii"],
  animale: ["animale"],
  bijuterii: ["bijuterii", "smartwatch-uri"],
  carti: ["carti"],
  "carti-educatie": ["carti"],
  marketplace: ["televizoare", "masini-de-spalat", "laptopuri", "saltele"],
};

/** Caracteristicile unei categorii, pe rand din fiecare tema, ca o tema sa nu ia tot randul. */
export function criteriiCategorie(slug: string, maxim = 12): { slug: string; titlu: string }[] {
  const liste = (CATEGORII_TEME[slug] || []).map((t) => criteriiTema(t));
  const rez: { slug: string; titlu: string }[] = [];
  for (let i = 0; rez.length < maxim && liste.some((l) => l[i]); i++) {
    for (const l of liste) {
      if (l[i] && rez.length < maxim && !rez.some((x) => x.slug === l[i].slug)) rez.push({ slug: l[i].slug, titlu: l[i].titlu });
    }
  }
  return rez;
}

/** Harta pentru prima pagina: fara produse, doar ce trebuie pentru linkuri. */
export function criteriiPeCategorii(maxim = 6): Record<string, { slug: string; titlu: string }[]> {
  return Object.fromEntries(Object.keys(CATEGORII_TEME).map((k) => [k, criteriiCategorie(k, maxim)]));
}

/** Articolele cu tema doar pentru criterii (fara sectiune de oferte din feed, in lib/topFeed.ts). */
const ARTICOLE_CRITERII: Record<string, string> = {
  "cea-mai-buna-masina-de-spalat": "masini-de-spalat",
  "cel-mai-bun-televizor-4k": "televizoare",
  "cel-mai-bun-stick-smart-tv": "televizoare",
  "cel-mai-bun-frigider": "frigidere",
  "cel-mai-bun-laptop-gaming": "laptopuri",
  "cel-mai-bun-pc-gaming": "componente",
  "cea-mai-buna-bicicleta-electrica": "biciclete-electrice",
  "cea-mai-buna-drona": "drone",
  "cel-mai-bun-power-bank": "power-bank",
};

/** Tema de criterii a unui articol, sau null. */
export function temaCriteriiArticol(slug: string): string | null {
  const baza = slug.replace(/-\d{4}$/, "");
  return ARTICOLE_CRITERII[baza] || temaArticol(slug)?.tema || null;
}

// `\b` din JavaScript nu stie de diacritice: „două" n-ar avea margine dupa „ă". Limita de cuvant, pe litere Unicode.
const MARGINE = "(?:(?<![\\p{L}\\p{N}])(?=[\\p{L}\\p{N}])|(?<=[\\p{L}\\p{N}])(?![\\p{L}\\p{N}]))";

/**
 * Criteriul despre care vorbeste un rand dintr-un articol: „1-2 persoane: 3-4 litri" -> friteuze de 3-4 litri.
 * Asa fiecare caracteristica din ghid duce la produse, fara sa rescriem articolele.
 */
export function criteriuInText(tema: string | null, text: string): Criteriu | null {
  if (!tema || !text) return null;
  for (const c of criteriiTema(tema)) {
    if (!c.in_text) continue;
    try {
      if (new RegExp(c.in_text.replace(/\\b/g, MARGINE), "iu").test(text)) return c;
    } catch {
      /* un tipar invalid nu rupe articolul */
    }
  }
  return null;
}

/** „4 noiembrie 2026". */
export function dataRo(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Bucharest" }).format(d);
}
