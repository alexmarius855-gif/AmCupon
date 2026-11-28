/**
 * Formatari pentru noul site (25.11.2026): pret in lei, procent, date scurte — ca in romana, cu virgula zecimala si
 * punct la mii („1.657,18 lei"). Functii PURE, fara fus orar de server: datele vin ca ISO (AAAA-LL-ZZ).
 */
const LUNI = ["ian.", "feb.", "mar.", "apr.", "mai", "iun.", "iul.", "aug.", "sept.", "oct.", "nov.", "dec."];
const LUNI_LUNG = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];

export function lei(n: number | string | null | undefined): string {
  const v = typeof n === "string" ? Number.parseFloat(n) : Number(n);
  if (!Number.isFinite(v)) return "";
  return `${v.toLocaleString("ro-RO", { minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 })} lei`;
}

/** „−18,6%" cu minus tipografic; o zecimala sub 10, fara zecimala peste. */
export function procent(n: number): string {
  const a = Math.abs(n);
  const t = a < 10 ? a.toLocaleString("ro-RO", { maximumFractionDigits: 1 }) : Math.round(a).toLocaleString("ro-RO");
  return `${n < 0 ? "+" : "−"}${t}%`;
}

/** „24 nov." */
export function ziScurta(iso: string): string {
  const [, l, z] = iso.split("-").map(Number);
  return l && z ? `${z} ${LUNI[l - 1]}` : iso;
}

/** „24 noiembrie 2026" */
export function ziLunga(iso: string): string {
  const [a, l, z] = iso.split("-").map(Number);
  return a && l && z ? `${z} ${LUNI_LUNG[l - 1]} ${a}` : iso;
}

/** „24.11.2026" */
export function ziPuncte(iso: string): string {
  const [a, l, z] = iso.split("-");
  return a && l && z ? `${z}.${l}.${a}` : iso;
}

/** Zile intre doua date ISO (b - a). */
export function zileIntre(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}
