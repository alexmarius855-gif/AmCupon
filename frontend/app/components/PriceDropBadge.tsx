import type { StatisticaPret } from "@/lib/preturi";

/** Linia cu evolutia pretului, fara biblioteca: SVG in HTML, deci niciun JavaScript in plus pe pagina. */
function Grafic({ preturi }: { preturi: number[] }) {
  if (preturi.length < 2) return null;
  const min = Math.min(...preturi);
  const max = Math.max(...preturi);
  const interval = max - min || 1;
  const puncte = preturi
    .map((p, i) => `${((i / (preturi.length - 1)) * 58 + 1).toFixed(1)},${(17 - ((p - min) / interval) * 14).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox="0 0 60 18" width="60" height="18" role="img" aria-label={`Prețul a variat între ${min} și ${max} lei`} className="shrink-0">
      <polyline points={puncte} fill="none" stroke="var(--accent-text)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Spune „cel mai mic pret din 30/90 de zile" DOAR daca urmarim produsul de atat timp. Altfel n-ar fi adevarat, iar
 * 29% dintre romani spun ca nu au incredere in reducerile afisate: asta e motivul pentru care cineva ne-ar crede pe noi.
 */
export default function PriceDropBadge({ stat }: { stat?: StatisticaPret | null }) {
  if (!stat) return null;
  const text = stat.celMaiMic90 ? "Cel mai mic preț din 90 de zile" : stat.celMaiMic30 ? "Cel mai mic preț din 30 de zile" : null;
  if (!text && stat.istoric.length < 2) return null;
  return (
    <div className="mt-1.5 flex items-center gap-2 text-xs">
      <Grafic preturi={stat.istoric} />
      {text && <span className="font-bold text-emerald-400">{text}</span>}
    </div>
  );
}
