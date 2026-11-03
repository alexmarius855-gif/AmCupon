import Link from "next/link";
import LogoMagazin from "./LogoMagazin";
import { numeAfisat } from "@/lib/numeMagazin";

/**
 * Magazinele fara oferta azi: cutie cu logo + nume, nu card mare care anunta „fara promotii". Primele `vizibile`,
 * restul intr-un <details> (linkurile raman in HTML). 03.11.2026, pe /categorii/casa-gradina erau 103 carduri.
 */
export default function MagazineCompacte({ magazine, vizibile = 18 }: {
  magazine: { magazin: string; logo_url?: string | null }[];
  vizibile?: number;
}) {
  const grila = (lista: typeof magazine) => (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
      {lista.map((m) => {
        const nume = numeAfisat(m.magazin);
        return (
          <Link key={m.magazin} href={`/cod-reducere/${m.magazin}`} className="group bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] rounded-xl p-2.5 flex flex-col items-center gap-2 transition-colors">
            <span className="w-full h-12 rounded-lg bg-[#ffffff] p-1.5 flex items-center justify-center overflow-hidden">
              <LogoMagazin src={m.logo_url} nume={nume} className="max-w-full max-h-full object-contain" />
            </span>
            <span className="text-[11px] font-semibold text-[var(--text-soft)] group-hover:text-[var(--foreground)] text-center leading-tight line-clamp-2">{nume}</span>
          </Link>
        );
      })}
    </div>
  );
  return (
    <>
      {grila(magazine.slice(0, vizibile))}
      {magazine.length > vizibile && (
        <details className="mt-3">
          <summary className="cursor-pointer text-sm font-bold text-[var(--accent-text)]">Încă {magazine.length - vizibile} magazine</summary>
          <div className="mt-3">{grila(magazine.slice(vizibile))}</div>
        </details>
      )}
    </>
  );
}
