import { imagineSigura, titluAfisat } from "@/lib/topFeed";
import type { StatisticaPret } from "@/lib/preturi";
import PriceDropBadge from "./PriceDropBadge";

const lei = (n: number) => `${n.toLocaleString("ro-RO", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} lei`;

export interface ProductDealCardProps {
  titlu: string;
  pret: number;
  /** Pretul vechi anuntat de magazin; apare doar daca e mai mare decat cel nou. */
  pretVechi?: number | null;
  imagine?: string;
  url: string;
  magazin: string;
  /** „4 noiembrie 2026": cand a citit feed-ul pretul. Data reala, nu un „acum X minute" inventat. */
  dataPret: string;
  stat?: StatisticaPret | null;
  cta?: string;
  /** Pretul a fost citit de pe pagina magazinului, nu doar din feed. */
  dePeSite?: boolean;
  /** Primele carduri nu asteapta derularea: poza goala in primul ecran arata a pagina stricata. */
  imediat?: boolean;
}

/**
 * Cardul unui produs, cu prioritate pe ce decide clicul: reducerea, economia in lei, pretul, butonul.
 * Fara numaratoare inversa si fara stoc inventat. Componenta server: linkul si pretul sunt in HTML, iar clicul il
 * numara AffiliateClickTracker, ca pe restul site-ului (`data-loc` spune de unde a venit).
 */
export default function ProductDealCard({ titlu, pret, pretVechi, imagine, url, magazin, dataPret, stat, cta = "Vezi oferta", imediat = false, dePeSite = false }: ProductDealCardProps) {
  const nume = titluAfisat(titlu);
  const img = imagineSigura(imagine);
  const areReducere = typeof pretVechi === "number" && pretVechi > pret;
  const economie = areReducere ? Math.round((pretVechi as number) - pret) : 0;
  const procent = areReducere ? Math.round((((pretVechi as number) - pret) / (pretVechi as number)) * 100) : 0;
  return (
    <a
      href={url}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      data-loc="produs"
      className="group relative flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 hover:border-[var(--accent-text)] transition-colors"
    >
      {procent >= 1 && (
        <span className="absolute left-2 top-2 z-10 rounded-lg bg-[#ddf93c] px-2 py-1 text-sm font-black text-[#0c1000]">-{procent}%</span>
      )}
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-white flex items-center justify-center">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element -- imagini externe din feed, fara pipeline de optimizare
          <img src={img} alt={nume} loading={imediat ? "eager" : "lazy"} decoding="async" className="h-full w-full object-contain" />
        ) : null}
      </div>
      <p className="mt-2 text-sm leading-snug line-clamp-2 text-[var(--foreground)]">{nume}</p>
      <div className="mt-auto pt-2">
        {areReducere && <p className="text-xs text-[var(--text-muted)] line-through">{lei(pretVechi as number)}</p>}
        <p className="text-xl font-black text-[var(--foreground)]">{lei(pret)}</p>
        {economie > 0 && <p className="text-xs font-bold text-emerald-400">Economisești {lei(economie)}</p>}
        <PriceDropBadge stat={stat} />
        <p className="mt-1 text-[11px] text-[var(--text-muted)]">la {magazin} · {dePeSite ? "preț citit de pe site" : "preț din feed"}, {dataPret}</p>
        <span className="mt-2 block rounded-lg bg-[#ddf93c] px-3 py-2 text-center text-sm font-black text-[#0c1000] group-hover:bg-[#c3dd2c] transition-colors">
          {cta} &rarr;
        </span>
      </div>
    </a>
  );
}
