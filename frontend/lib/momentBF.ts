/**
 * Carligul Black Friday de pe site: in ce faza suntem si ce e adevarat de spus azi (03.11.2026).
 *
 * Functii PURE, fara importuri, testate cu `node lib/momentBF.test.mjs`. Datele vin din
 * public/black-friday.json (o data pe an) si din lib/campaniiBlackFriday.ts. Dupa ultima zi sau cu
 * fisierul neactualizat pe anul nou, faza e „inchis": site-ul revine singur la mesajul obisnuit,
 * fara sa ramana un Black Friday trecut pe prima pagina.
 */
export interface DateBF {
  an: number;
  emag: string;
  international: [string, string];
}

export interface CampanieScurta {
  magazin: string;
  nume: string;
  start: string;
  final: string;
}

export type FazaBF = "inchis" | "inainte-emag" | "intre-valuri" | "international";

export function fazaBF(azi: string, d: DateBF): FazaBF {
  const [, finalInt] = d.international;
  if (azi < `${d.an}-10-15` || azi > finalInt) return "inchis";
  if (azi <= d.emag) return "inainte-emag";
  return azi >= d.international[0] ? "international" : "intre-valuri";
}

/** Campaniile in curs azi si urmatoarele `n`, in ordinea in care incep. */
export function calendarScurt<C extends CampanieScurta>(azi: string, campanii: readonly C[], n = 4) {
  const active = campanii.filter((c) => c.start <= azi && c.final >= azi);
  const toateUrmatoare = campanii
    .filter((c) => c.start > azi)
    .sort((a, b) => a.start.localeCompare(b.start) || a.nume.localeCompare(b.nume, "ro"));
  return { inCurs: active.length, urmeaza: toateUrmatoare.length, urmatoare: toateUrmatoare.slice(0, n) };
}

/** Azi, in ora Romaniei: site-ul se construieste in UTC, iar ziua de BF e cea din Romania. */
export function aziRomania(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Bucharest" }).format(d);
}
