import { aceeasiTara } from "./taraDomeniu";

/**
 * Magazinul din spatele unei pagini de brand (/altex, /drmax...) — SURSA UNICA pentru
 * `app/components/BrandPageTemplate.tsx` (metadata + pagina) SI pentru `app/sitemap.ts`.
 *
 * Fara magazin in date, pagina de brand e `noindex` (metadataBrand). 29.10.2026: sitemap-ul
 * trimitea toate cele 31 de pagini de brand la indexare, desi 11 erau `noindex` si 18 isi
 * declarau canonical-ul pe /cod-reducere/<magazin>.
 *
 * Potrivire in ordinea specificitatii: egalitate > prefix de domeniu > subsir. Doar subsirul
 * producea potriviri gresite („otter" prindea si „spotter.ro"). Prefixul si subsirul nu trec
 * granita de tara: /vidaxl (vidaxl.ro) gasea vidaxl.bg.
 */
export function gasesteMagazinBrand<T extends { magazin: string }>(data: T[], slugs: string[]): T | null {
  const lower = slugs.map((s) => s.toLowerCase());
  const tara = (m: T) => aceeasiTara(lower[0], m.magazin);
  return (
    data.find((m) => lower.includes(m.magazin.toLowerCase())) ||
    data.find((m) => tara(m) && lower.some((s) => m.magazin.toLowerCase().startsWith(s + "."))) ||
    data.find((m) => tara(m) && lower.some((s) => m.magazin.toLowerCase().includes(s))) ||
    null
  );
}
