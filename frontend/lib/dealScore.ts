/**
 * Deal Score 1-100 — extensie ONESTA a scor_final (deja real, rule-based, vezi
 * scripts/fetch_2p_api.py::calculeaza_scor). Foloseste DOAR semnale reale din date:
 * reducere procentuala reala, prospetime reala (ultima_verificare), exclusivitate reala.
 *
 * NU foloseste procent_succes/folosit_de — sunt FABRICATE (random.Random(hash(...)) in
 * fetch_2p_api.py), eliminate din UI pe 03.07.2026. Un Deal Score bazat pe ele ar repeta
 * exact greseala pe care site-ul a corectat-o deja o data (vezi CLAUDE.md).
 *
 * Comisionul NU intra in formula — e ce castigam noi, nu o masura a ofertei pt cumparator;
 * includerea lui ar fi genul de "cashback fals" deja interzis explicit.
 *
 * Functie PURA: `astazi` se primeste ca parametru (nu Date.now()/new Date() intern), ca
 * sa poata rula identic in Server si Client Components fara sa calce pe regula
 * react-hooks/purity (vezi CLAUDE.md, audit 24.07.2026).
 */

export interface DealScorePromo {
  nume?: string;
  descriere?: string;
  cod_cupon?: string;
}

export interface DealScoreInput {
  scor_final?: number;
  exclusiv?: boolean;
  ultima_verificare?: string; // "YYYY-MM-DD"
  promotii?: DealScorePromo[];
}

/** Prag peste care Deal Score-ul devine vizibil proeminent (badge). Sub prag, un magazin
 * fara promotie activa scoreaza legitim ~0-15 — nu-l ascunde din date, doar nu-l arata
 * ca gamification, altfel contrazice principiul "promoveaza tot" (nu doar cupoane). */
export const DEAL_SCORE_VISIBLE_THRESHOLD = 50;

function extractDiscountPercent(text?: string): number {
  const m = text?.match(/(\d+)\s*%/);
  const v = m ? parseInt(m[1], 10) : 0;
  return v > 0 && v <= 90 ? v : 0;
}

function bestDiscountPercent(promotii: DealScorePromo[]): number {
  let best = 0;
  for (const p of promotii) {
    best = Math.max(best, extractDiscountPercent(p.nume), extractDiscountPercent(p.descriere));
  }
  return best;
}

function bonusDinReducere(procent: number): number {
  if (procent >= 70) return 30;
  if (procent >= 50) return 25;
  if (procent >= 30) return 18;
  if (procent >= 15) return 10;
  if (procent > 0) return 5;
  return 0;
}

function bonusDinProspetime(ultimaVerificare: string | undefined, astazi: string | undefined): number {
  if (!ultimaVerificare || !astazi) return 0; // necunoscut -> 0, nu ghicim
  const zile = Math.round((Date.parse(astazi) - Date.parse(ultimaVerificare)) / 86400000);
  if (zile <= 0) return 15;
  if (zile <= 3) return 8;
  if (zile <= 7) return 3;
  return 0;
}

/**
 * @param m Datele magazinului (subset din output.json)
 * @param astazi Data serverului "YYYY-MM-DD" — obligatoriu pt bonusul de prospetime;
 *   fara el, bonusul e omis (nu presupus), restul scorului se calculeaza normal.
 */
export function calculateDealScore(m: DealScoreInput, astazi?: string): number {
  const bazaNormalizata = (Math.min(60, Math.max(0, m.scor_final ?? 0)) / 60) * 45;
  const discount = bestDiscountPercent(m.promotii ?? []);
  const bonusReducere = bonusDinReducere(discount);
  const bonusProspetime = bonusDinProspetime(m.ultima_verificare, astazi);
  const bonusExclusivitate = m.exclusiv ? 10 : 0;

  const total = bazaNormalizata + bonusReducere + bonusProspetime + bonusExclusivitate;
  return Math.min(100, Math.max(1, Math.round(total)));
}
