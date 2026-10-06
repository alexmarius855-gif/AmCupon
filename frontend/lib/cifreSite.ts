import fs from "fs";
import path from "path";
import { linkAfiliat } from "./linkMagazin";
import { numeAfisat } from "./numeMagazin";

/**
 * Cifrele si numele de magazine care apar in TEXT (descrieri, FAQ, pagini „despre"),
 * calculate din output.json la build — SURSA UNICA.
 *
 * De ce (05.10.2026): „1000+ magazine" era scris de mana in 11 fisiere — descrierea
 * implicita a site-ului (layout.tsx), subsolul celor 216 articole de blog, FAQ-ul primei
 * pagini, /despre-noi, /contact, /categorii, /cadouri — cand pe site erau 957. Cifra
 * fusese adevarata in august si a ramas scrisa dupa ce magazinele fara livrare in Romania
 * au fost scoase (19.09). Langa ea: „coduri verificate zilnic" (nu testam codurile),
 * „2Performant, Profitshare si Impact.com" (Profitshare e exclus din 19.08) si descrieri
 * de nisa care promiteau reduceri „la eMAG, Altex, Flanco, Dedeman, IKEA, Zara" — magazine
 * fara program la noi. O cifra sau un nume scris de mana devine fals fara ca nimeni sa
 * atinga fisierul; unul calculat, nu.
 *
 * Doar pentru cod de SERVER (citeste fisierul). Componentele client primesc fraza gata
 * facuta, ca prop (vezi app/page.tsx -> HomeClient).
 */

interface MagazinMin {
  magazin: string;
  url?: string | null;
  url_afiliat?: string | null;
  platforma?: string;
  categorie_slug?: string;
  scor_final?: number;
}

const NUME_RETEA: Record<string, string> = {
  "2performant": "2Performant",
  impact: "Impact.com",
  awin: "Awin",
};

let _mag: MagazinMin[] | null = null;
function magazine(): MagazinMin[] {
  if (_mag) return _mag;
  try {
    _mag = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "output.json"), "utf-8"));
  } catch {
    _mag = [];
  }
  return _mag as MagazinMin[];
}

export function numarMagazine(): number {
  return magazine().length;
}

/**
 * „peste 900 de magazine" — rotunjit IN JOS la suta, ca fraza sa ramana adevarata si cand
 * ies cateva magazine pana la urmatorul build. Fara date: „sute de magazine".
 */
export function pesteMagazine(): string {
  const n = numarMagazine();
  if (n >= 100) {
    const s = Math.floor(n / 100) * 100;
    return n > s ? `peste ${s} de magazine` : `${n} de magazine`;
  }
  if (n > 0) return `${n}${n >= 20 ? " de" : ""} magazine`;
  return "sute de magazine";
}

/** Aceeasi fraza, cu majuscula, pentru inceput de propozitie. */
export function PesteMagazine(): string {
  const s = pesteMagazine();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** „A, B și C". */
export function enumerare(xs: string[]): string {
  if (xs.length <= 1) return xs.join("");
  return `${xs.slice(0, -1).join(", ")} și ${xs[xs.length - 1]}`;
}

/** „2Performant, Impact.com și Awin" — retelele care au azi magazine pe site, dupa numar. */
export function reteleAfiliere(): string {
  const pe = new Map<string, number>();
  for (const m of magazine()) {
    const p = (m.platforma || "").toLowerCase();
    if (p) pe.set(p, (pe.get(p) || 0) + 1);
  }
  return enumerare([...pe.entries()].sort((a, b) => b[1] - a[1]).map(([p]) => NUME_RETEA[p] || p));
}

/**
 * Partenerii cu link PLATIT din categoriile date (sluguri reale, vezi lib/categoriiNisa.ts),
 * magazinele .ro intai, apoi dupa scor_final. Numele vin din numeAfisat — aceleasi ca pe
 * restul site-ului. Lista goala daca nu exista niciunul: textul trebuie sa se descurce fara.
 */
export function parteneriCategorie(sluguri: string[], n = 4): string[] {
  const lista = magazine().filter(
    (m) => sluguri.includes((m.categorie_slug || "").toLowerCase()) && linkAfiliat(m),
  );
  lista.sort(
    (a, b) =>
      Number(b.magazin.endsWith(".ro")) - Number(a.magazin.endsWith(".ro")) ||
      (b.scor_final || 0) - (a.scor_final || 0),
  );
  const nume: string[] = [];
  for (const m of lista) {
    const x = numeAfisat(m.magazin);
    if (!nume.includes(x)) nume.push(x);
    if (nume.length >= n) break;
  }
  return nume;
}

/** „la Cărturești, Litera și Nemira" sau „la magazinele partenere", daca lista e goala. */
export function laParteneri(sluguri: string[], n = 4): string {
  const p = parteneriCategorie(sluguri, n);
  return p.length ? `la ${enumerare(p)}` : "la magazinele partenere";
}
