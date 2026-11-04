import { SUPABASE_KEY, SUPABASE_URL } from "./supabaseRest";

/**
 * Istoricul de pret, din Supabase — DOAR pe server (04.11.2026).
 * Tabelele le umple scripts/ingest-2p.mts. O eroare sau o baza goala nu rupe pagina: produsul apare fara indicator.
 */
export interface StatisticaPret {
  pret: number;
  min30: number | null;
  min90: number | null;
  urmaritDin: string | null;
  celMaiMic30: boolean;
  celMaiMic90: boolean;
  istoric: number[];
}

const antet = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };

async function citeste<T>(cale: string): Promise<T[]> {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${cale}`, { headers: antet, next: { revalidate: 21600 }, signal: AbortSignal.timeout(5000) });
    return r.ok ? ((await r.json()) as T[]) : [];
  } catch {
    return [];
  }
}

/** Statisticile produselor, dupa id-ul din feed. Cele fara istoric nu apar in rezultat. */
export async function statisticiPreturi(iduri: string[]): Promise<Map<string, StatisticaPret>> {
  const rez = new Map<string, StatisticaPret>();
  const curate = [...new Set(iduri.filter(Boolean))];
  if (curate.length === 0) return rez;
  const lista = curate.map((x) => `"${x.replace(/["\\]/g, "")}"`).join(",");
  const randuri = await citeste<{
    product_id: number; p2_id: string; price: number; min_30d: number | null; min_90d: number | null;
    tracked_since: string | null; is_lowest_30d: boolean | null; is_lowest_90d: boolean | null;
  }>(`product_price_stats?select=product_id,p2_id,price,min_30d,min_90d,tracked_since,is_lowest_30d,is_lowest_90d&p2_id=in.(${encodeURIComponent(lista)})`);
  if (randuri.length === 0) return rez;

  const istoric = await citeste<{ product_id: number; price: number }>(
    `price_history?select=product_id,price&product_id=in.(${randuri.map((r) => r.product_id).join(",")})&order=recorded_at.asc`,
  );
  const pePodus = new Map<number, number[]>();
  for (const h of istoric) pePodus.set(h.product_id, [...(pePodus.get(h.product_id) || []), Number(h.price)]);

  for (const r of randuri) {
    rez.set(r.p2_id, {
      pret: Number(r.price),
      min30: r.min_30d === null ? null : Number(r.min_30d),
      min90: r.min_90d === null ? null : Number(r.min_90d),
      urmaritDin: r.tracked_since,
      celMaiMic30: Boolean(r.is_lowest_30d),
      celMaiMic90: Boolean(r.is_lowest_90d),
      istoric: pePodus.get(r.product_id) || [],
    });
  }
  return rez;
}
