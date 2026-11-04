import { imagineSigura, titluAfisat } from "@/lib/topFeed";
import type { CampanieBF } from "@/lib/campaniiBlackFriday";

/** Formate si cardul de produs, comune paginilor /black-friday/<magazin> si /black-friday/categorie/<slug>. */

export const zi = (iso: string, luna: "long" | "short" = "long") =>
  new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: luna, timeZone: "UTC" }).format(new Date(iso + "T00:00:00Z"));

export const pret = (n: number) => `${n.toLocaleString("ro-RO", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} lei`;

export function interval(c: CampanieBF): string {
  return c.start === c.final ? zi(c.start) : `${zi(c.start)} – ${zi(c.final)}`;
}

export function stare(c: CampanieBF, ziua: string): "urmeaza" | "acum" | "incheiata" {
  if (c.final < ziua) return "incheiata";
  return c.start <= ziua ? "acum" : "urmeaza";
}

export function CardProdus({ p, nota }: { p: { url?: string; title?: string; image?: string; price?: number }; nota?: string }) {
  const titlu = titluAfisat(p.title);
  const img = imagineSigura(p.image);
  return (
    <a
      href={p.url}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 hover:border-[var(--border-strong)] transition-colors"
    >
      <div className="aspect-square w-full rounded-lg bg-white overflow-hidden flex items-center justify-center">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element -- imagini externe din feed, fara pipeline de optimizare (vezi MagazinCard)
          <img src={img} alt={titlu} loading="lazy" decoding="async" className="h-full w-full object-contain" />
        ) : null}
      </div>
      <p className="mt-2 text-sm leading-snug line-clamp-2">{titlu}</p>
      {typeof p.price === "number" && p.price > 0 && <p className="mt-1 font-black">{pret(p.price)}</p>}
      {nota && <p className="text-xs text-[var(--accent-text)] mt-0.5">{nota}</p>}
    </a>
  );
}
