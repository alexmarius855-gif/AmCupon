/**
 * Prima pagina, din ofertele reale: „Codurile zilei", cifrele din panoul „Acum, pe AmCupon"
 * si „Magazine populare" (docs/design/macheta/, 24.09.2026).
 *
 * Functii PURE, fara React si FARA importuri: se testeaza direct cu Node pe output.json
 * (`node lib/oferteAcasa.test.mjs`, din frontend/). Ce vine din alte module — linkul platit
 * (lib/linkMagazin.ts), pragul de urgenta (lib/expirarePromo.ts), brandurile cunoscute
 * (lib/magazinePopulare.ts) — intra ca argument, ca sa nu existe a doua copie a lor aici.
 */

export interface PromoAcasa {
  nume: string;
  descriere?: string | null;
  cod_cupon?: string | null;
  landing_page?: string | null;
  zile_ramase?: number | null;
}

export interface MagazinAcasa {
  magazin: string;
  logo_url?: string | null;
  sales_number?: number | null;
  promotii?: PromoAcasa[] | null;
}

type PromoDin<M extends MagazinAcasa> = NonNullable<M["promotii"]>[number];

export interface OfertaAcasa<M extends MagazinAcasa> {
  m: M;
  promo: PromoDin<M>;
  cod: string;
  /** Linkul platit. Pe prima pagina intra DOAR oferte care il au (vezi `oferteAcasa`). */
  link: string;
  zile: number;
  /** Identitate stabila pentru starea „dezvaluit/copiat": magazin + pozitia promotiei. */
  cheie: string;
}

export type FiltruAcasa = "toate" | "cod" | "oferta" | "curand";

// depox.ro vinde spray paralizant si electrosocuri — scos de pe prima pagina din 21.06.2026
// (MERCHANT_GRID_BLOCKLIST in scripts/generate_homepage_data.py). Aceeasi regula aici.
export const EXCLUSE_ACASA: ReadonlySet<string> = new Set(["depox.ro"]);

// Text scris pentru un cititor roman: diacritice sau cuvinte uzuale. Ofertele in engleza
// ale magazinelor straine raman pe pagina, dar dupa cele romanesti.
const RE_RO = /[ăâîșțşţ]|\b(reducere|reduceri|livrare|transport|pentru|comenzi|comanda|produse|toate|la)\b/i;
// Text UTF-8 citit gresit („rÃ©duction", „â\u0080\u0093"): „â"-ul lui ar trece drept litera romaneasca,
// iar o oferta franceza cu cod ar urca inaintea celor romanesti (revizia din 24.09.2026, insotel/cllix).
// Aceeasi expresie ca RE_MOJIBAKE_SIGUR din scripts/promotii.py, care il si repara la sursa.
const RE_MOJIBAKE = /[\u0080-\u009f]|Ã[ -¿]/;

/**
 * Toate ofertele afisabile pe prima pagina, in ordinea din macheta: text romanesc, apoi
 * cele CU cod, apoi magazinele .ro, apoi cele care expira mai repede.
 *
 * O oferta fara link platit NU intra: pe prima pagina butonul ei n-ar avea unde duce, iar
 * garda (scripts/verifica_site.py) considera pierdere orice oferta afisata care pleaca fara
 * tracking. Masurat 24.09.2026: 0 din 188 — regula nu scoate azi nimic, doar previne.
 */
export function oferteAcasa<M extends MagazinAcasa>(
  magazine: readonly M[],
  linkPlatit: (m: M, p: PromoDin<M>) => string | null,
): OfertaAcasa<M>[] {
  const pool: (OfertaAcasa<M> & { ro: boolean; dro: boolean })[] = [];
  for (const m of magazine) {
    if (EXCLUSE_ACASA.has(m.magazin)) continue;
    (m.promotii || []).forEach((p: PromoDin<M>, i: number) => {
      const zile = typeof p.zile_ramase === "number" && Number.isFinite(p.zile_ramase) ? p.zile_ramase : 99;
      if (zile < 0) return; // expirata: curata_promotii o scoate oricum, dar nu ne bazam pe ordine
      const link = linkPlatit(m, p);
      if (!link) return;
      const text = `${p.nume || ""} ${p.descriere || ""}`;
      pool.push({
        m, promo: p, link, zile,
        cod: String(p.cod_cupon || "").trim(),
        cheie: `${m.magazin}#${i}`,
        ro: !RE_MOJIBAKE.test(text) && RE_RO.test(text),
        dro: m.magazin.endsWith(".ro"),
      });
    });
  }
  pool.sort((a, b) =>
    Number(b.ro) - Number(a.ro) ||
    Number(!!b.cod) - Number(!!a.cod) ||
    Number(b.dro) - Number(a.dro) ||
    a.zile - b.zile);
  return pool.map(({ ro: _ro, dro: _dro, ...o }) => o);
}

export function treceFiltru<M extends MagazinAcasa>(o: OfertaAcasa<M>, f: FiltruAcasa, pragUrgent: number): boolean {
  if (f === "cod") return !!o.cod;
  if (f === "oferta") return !o.cod;
  if (f === "curand") return o.zile <= pragUrgent;
  return true;
}

export function numaraFiltre<M extends MagazinAcasa>(pool: readonly OfertaAcasa<M>[], pragUrgent: number): Record<FiltruAcasa, number> {
  const n: Record<FiltruAcasa, number> = { toate: pool.length, cod: 0, oferta: 0, curand: 0 };
  for (const o of pool) {
    if (o.cod) n.cod++; else n.oferta++;
    if (o.zile <= pragUrgent) n.curand++;
  }
  return n;
}

/**
 * Filtrele care se afiseaza: nu apare unul FARA rezultate (buton mort), nici unul care
 * da exact ce da „Toate" (buton care nu schimba nimic). „Toate" apare doar daca mai
 * ramane macar un filtru langa el.
 */
export function filtreAfisate(n: Record<FiltruAcasa, number>): FiltruAcasa[] {
  const alte = (["cod", "oferta", "curand"] as const).filter((f) => n[f] > 0 && n[f] < n.toate);
  return alte.length ? ["toate", ...alte] : [];
}

/**
 * Ce se vede in grila: primele `limita` oferte care trec filtrul, maximum `maxPerMagazin`
 * de la acelasi magazin (altfel un magazin cu cinci coduri umple jumatate de pagina).
 * `exclude` = cheia ofertei din panoul de sus, ca sa nu apara de doua ori pe acelasi ecran —
 * DOAR la „Toate". Contoarele filtrelor numara tot pool-ul, deci la un filtru ales oferta din
 * panou trebuie sa fie si in grila: altfel „Expiră curând 1" putea deschide o grila goala.
 */
export function alegeAfisate<M extends MagazinAcasa>(
  pool: readonly OfertaAcasa<M>[],
  f: FiltruAcasa,
  pragUrgent: number,
  { limita = 12, maxPerMagazin = 2, exclude }: { limita?: number; maxPerMagazin?: number; exclude?: string } = {},
): OfertaAcasa<M>[] {
  const per = new Map<string, number>();
  const out: OfertaAcasa<M>[] = [];
  for (const o of pool) {
    if (out.length >= limita) break;
    if ((f === "toate" && o.cheie === exclude) || !treceFiltru(o, f, pragUrgent)) continue;
    const k = per.get(o.m.magazin) || 0;
    if (k >= maxPerMagazin) continue;
    per.set(o.m.magazin, k + 1);
    out.push(o);
  }
  return out;
}

/** Cate coduri si cate oferte fara cod are fiecare magazin — pentru insigna de pe logo. */
export function oferteDePeMagazin<M extends MagazinAcasa>(pool: readonly OfertaAcasa<M>[]): Map<string, { cod: number; oferta: number }> {
  const r = new Map<string, { cod: number; oferta: number }>();
  for (const o of pool) {
    const x = r.get(o.m.magazin) || { cod: 0, oferta: 0 };
    if (o.cod) x.cod++; else x.oferta++;
    r.set(o.m.magazin, x);
  }
  return r;
}

/**
 * „Magazine populare": intai brandurile din lib/magazinePopulare.ts care exista in date si
 * au logo, apoi magazinele .ro cu oferta azi, apoi restul .ro dupa vanzari. Fara logo nu
 * intra — placa e doar logo, iar initialele singure nu spun nimic.
 */
export function magazinePopulareAcasa<M extends MagazinAcasa>(
  magazine: readonly M[],
  preferate: readonly string[],
  cuOferta: ReadonlySet<string>,
  n = 12,
): M[] {
  const bun = (m: M | undefined): m is M => !!m && !!m.logo_url && !EXCLUSE_ACASA.has(m.magazin);
  const idx = new Map(magazine.map((m) => [m.magazin, m] as const));
  const out: M[] = [];
  for (const s of preferate) {
    const m = idx.get(s);
    if (bun(m) && !out.includes(m)) out.push(m);
  }
  const rest = magazine
    .filter((m) => bun(m) && m.magazin.endsWith(".ro") && !out.includes(m))
    .sort((a, b) =>
      Number(cuOferta.has(b.magazin)) - Number(cuOferta.has(a.magazin)) ||
      (b.sales_number || 0) - (a.sales_number || 0));
  return [...out, ...rest].slice(0, n);
}

/**
 * „1 cod", „2 coduri", „20 de coduri". In romana, „de" apare cand ultimele doua cifre
 * sunt 00 sau 20-99 („101 coduri", dar „120 de coduri").
 */
export function cuNumar(n: number, singular: string, plural: string): string {
  if (n === 1) return `1 ${singular}`;
  const r = n % 100;
  return n > 0 && (r === 0 || r >= 20) ? `${n} de ${plural}` : `${n} ${plural}`;
}
