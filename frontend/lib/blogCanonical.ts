/**
 * Canonicalul unui articol de blog — SURSA UNICA, citita si de
 * `app/blog/[slug]/page.tsx` (pentru `metadata`) si de `app/sitemap.ts`.
 *
 * ── Problema, masurata 23.08.2026 ─────────────────────────────────────────
 * Din cele 500 de articole, 433 sunt de tip `magazin` — generate automat, unul
 * per magazin. 96 dintre ele trec filtrul de sitemap, deci le trimitem activ la
 * indexare. Masurat pe continutul lor real:
 *
 *     tip `magazin`  : 96 articole, similitudine MEDIANA 88,1% (max 90,5%)
 *     tip `best-of`  : 64 articole, similitudine mediana   7,2%
 *
 * Adica cele 96 sunt practic acelasi text cu numele magazinului schimbat —
 * fix problema de thin content care a cauzat criza de indexare (10.08), dar de
 * data asta pe blog, nu pe paginile de magazin. Alea au fost reparate atunci;
 * articolele DESPRE aceleasi magazine n-au fost niciodata verificate.
 *
 * ── Si o a doua problema, mai subtila: canibalizare ───────────────────────
 *     /blog/cod-reducere-libris-august-2026   "Cod Reducere Libris August 2026"
 *     /cod-reducere/libris.ro                 "Cod reducere Libris august 2026"
 *
 * Doua pagini pe ACEEASI interogare, fiecare cu canonical propriu. Semnalul se
 * imparte in loc sa se cumuleze — pe un domeniu cu autoritate aproape zero,
 * pierdere neta exact pe cuvintele care conteaza.
 *
 * Acelasi tipar a fost reparat pe 10.08 pentru 29 de pagini de BRAND (`/drmax`,
 * `/answear`...), care isi declara acum canonical catre pagina de magazin.
 * Articolele de blog au ramas pe dinafara acelei reparatii.
 *
 * ── De ce castiga pagina de magazin, nu articolul ─────────────────────────
 * Aceleasi motive ca in 10.08: se potriveste semantic cu interogarea, se
 * actualizeaza singura la fiecare rulare de pipeline, are tab-uri cu produse,
 * recenzii si comparatii, si e deja tinta linkurilor interne. Articolul e un
 * sablon lunar care imbatraneste din titlu ("august 2026").
 *
 * NIMIC NU SE STERGE. Articolul ramane live si linkuit; doar semnalul se
 * consolideaza intr-o singura adresa.
 */

import { buildMerchantTokens, esteIndexabil, type IndexableProdus } from "./seoIndexable";

const BASE = "https://amcupon.ro";

export interface PostCanonic {
  slug: string;
  magazin?: string | null;
  tip?: string | null;
  excerpt?: string;
}

export interface MagazinCanonic {
  magazin: string;
  are_promotie?: boolean;
  promotii?: unknown[];
}

/** Index construit o singura data si pasat mai departe (sitemap-ul are 500 de articole). */
export function construiesteIndexMagazine(
  magazine: MagazinCanonic[],
  produse: IndexableProdus[]
): Set<string> {
  const tokens = buildMerchantTokens(produse);
  const indexabile = new Set<string>();
  for (const m of magazine) {
    if (m.magazin && esteIndexabil(m, tokens)) indexabile.add(m.magazin.toLowerCase());
  }
  return indexabile;
}

/**
 * Adresa canonica a unui articol.
 *
 * Intoarce pagina de MAGAZIN cand articolul e de tip `magazin` SI magazinul are
 * o pagina care merita indexata. Altfel, articolul isi pastreaza propriul URL.
 *
 * Conditia pe indexabilitate nu e formala: daca pagina de magazin e `noindex`
 * (magazin fara continut propriu), un canonical catre ea ar trimite semnalul
 * catre o pagina pe care tocmai i-am spus lui Google s-o ignore. In cazul ala
 * articolul ramane singurul candidat, si e corect sa se declare pe el insusi.
 */
export function canonicalArticol(post: PostCanonic, magazineIndexabile: Set<string>): string {
  const propriu = `${BASE}/blog/${post.slug}`;
  if (post.tip !== "magazin") return propriu;

  const slug = (post.magazin || "").toLowerCase().trim();
  if (!slug || !magazineIndexabile.has(slug)) return propriu;

  return `${BASE}/cod-reducere/${slug}`;
}

/**
 * Articolul cere indexarea propriei adrese?
 *
 * Fals cand isi declara canonical in alta parte — a trimite la indexare un URL
 * care se declara duplicat e un semnal care se contrazice singur. Aceeasi regula
 * aplicata paginilor `/nisa/*` pe 16.08.
 */
export function ceruteInSitemap(post: PostCanonic, magazineIndexabile: Set<string>): boolean {
  return canonicalArticol(post, magazineIndexabile) === `${BASE}/blog/${post.slug}`;
}
