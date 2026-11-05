/**
 * Magazinele care interzic in 2Performant site-urile de cupoane (06.11.2026, decizia lui Alex).
 *
 * `scripts/merge_platforms.py` le scoate din output.json si scrie `public/magazine-fara-cupoane.json`, cu destinatia
 * fiecaruia (categoria lui, sau toate magazinele cand categoria a ramas goala). Adresele vechi nu dau 404 si nu mai
 * arata „Cod reducere <magazin>", exact ce interzic programele: trimit permanent spre categorie. La fel pagina lor de
 * Black Friday si pagina de brand scrisa de mana (/petmart, /kitunghii), daca exista.
 *
 * Citit DOAR la build, de next.config.ts (redirecturi) si de sitemap.ts (prin CAI_REDIRECTIONATE).
 */
import fs from "fs";
import path from "path";
import type { Redirect } from "./redirecturi";

type FaraCupoane = { magazin: string; categorie_slug?: string; destinatie: string };

const SLUG_SIGUR = /^[a-z0-9.-]+$/;

export function redirecturiFaraCupoane(radacina = process.cwd()): Redirect[] {
  let lista: FaraCupoane[] = [];
  try {
    lista = JSON.parse(fs.readFileSync(path.join(radacina, "public", "magazine-fara-cupoane.json"), "utf-8"));
  } catch {
    return [];
  }
  const rez: Redirect[] = [];
  for (const m of Array.isArray(lista) ? lista : []) {
    const slug = (m.magazin || "").toLowerCase();
    if (!SLUG_SIGUR.test(slug) || !m.destinatie?.startsWith("/")) continue;
    rez.push({ source: `/cod-reducere/${slug}`, destination: m.destinatie, permanent: true });
    rez.push({ source: `/black-friday/${slug}`, destination: "/black-friday", permanent: true });
    // Pagina de brand scrisa de mana (app/petmart, app/kitunghii): numele fara domeniu.
    const brand = slug.split(".")[0];
    if (brand && fs.existsSync(path.join(radacina, "app", brand, "page.tsx"))) {
      rez.push({ source: `/${brand}`, destination: m.destinatie, permanent: true });
    }
  }
  return rez;
}
