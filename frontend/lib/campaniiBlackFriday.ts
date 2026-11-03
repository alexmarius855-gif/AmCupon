import fs from "fs";
import path from "path";

/**
 * Campaniile de Black Friday ale partenerilor — SURSA UNICA pentru /black-friday si pentru
 * sectiunea „Black Friday la X" de pe pagina fiecarui magazin (01.11.2026).
 *
 * Doua fisiere din public/:
 *  - black-friday.json::parteneri — confirmate de mana, cu sursa (presa); castiga la acelasi magazin;
 *  - black-friday-parteneri.json — generat de scripts/calendar_black_friday.py din promotiile anuntate
 *    de magazine in 2Performant (doar parteneri cu link platit, date in ora Romaniei).
 * O campanie terminata (final < azi) nu se mai intoarce: pagina se regenereaza la fiecare deploy.
 */
export interface CampanieBF {
  magazin: string;
  nume: string;
  start: string;
  final: string;
  nota?: string;
  sursa?: string;
  /** Textul magazinului despre campanie, curatat de scripts/calendar_black_friday.py. */
  descriere?: string;
  are_cod?: boolean;
}

function citeste(fisier: string): CampanieBF[] {
  try {
    const d = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", fisier), "utf-8"));
    return (d.parteneri || []) as CampanieBF[];
  } catch {
    return [];
  }
}

let _toate: CampanieBF[] | null = null;

/**
 * Toate campaniile anului, inclusiv cele terminate: fiecare are o pagina /black-friday/<magazin>, iar o adresa
 * trimisa la indexare nu trebuie sa dea 404 cand campania se termina. Manualele castiga, dar iau textul din 2P.
 */
export function toateCampaniileBF(): CampanieBF[] {
  return toate();
}

/** Toate campaniile, manuale intai (fara dubluri pe magazin), in ordinea in care incep. */
function toate(): CampanieBF[] {
  if (_toate) return _toate;
  const din2p = citeste("black-friday-parteneri.json");
  const dupaSlug = new Map(din2p.map((c) => [c.magazin, c]));
  const manuale = citeste("black-friday.json").map((c) => ({
    ...c,
    descriere: dupaSlug.get(c.magazin)?.descriere,
    are_cod: dupaSlug.get(c.magazin)?.are_cod,
  }));
  const vazute = new Set(manuale.map((c) => c.magazin));
  _toate = [...manuale, ...din2p.filter((c) => !vazute.has(c.magazin))]
    .sort((a, b) => a.start.localeCompare(b.start) || a.nume.localeCompare(b.nume, "ro"));
  return _toate;
}

/** Campaniile care nu s-au terminat pana azi (AAAA-LL-ZZ). */
export function campaniiBF(azi: string): CampanieBF[] {
  return toate().filter((c) => c.final >= azi);
}

/** Campania unui magazin, daca exista si nu s-a terminat. */
export function campanieMagazin(magazin: string, azi: string): CampanieBF | null {
  return campaniiBF(azi).find((c) => c.magazin === magazin) || null;
}
