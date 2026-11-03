import GrilaOferte from "./GrilaOferte";
import MagazineCompacte from "./MagazineCompacte";
import { poolOferte, grilaOferte, type MagazinGrila } from "@/lib/grilaOferte";
import { EXCLUSE_ACASA } from "@/lib/oferteAcasa";

/**
 * Antetul si blocul de oferte ale paginilor pe teme (/fashion, /casa, /farmacie...), o singura structura din
 * 03.11.2026. Inainte, fiecare pagina avea propriul antet lime cu emoji, carduri-umplutura si un card mare pentru
 * fiecare magazin, deci ofertele incepeau abia dupa ~900 px. Aceeasi grila si aceeasi ordine ca pe prima pagina.
 */
export function AntetNisa({ titlu, children }: { titlu: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="max-w-6xl mx-auto px-4 pt-6 pb-2">
      <h1 className="text-[1.75rem] md:text-4xl font-black tracking-tight leading-tight text-[var(--foreground)] mb-2">{titlu}</h1>
      {children && <p className="text-[var(--text-soft)] max-w-3xl">{children}</p>}
    </header>
  );
}

export default function OferteNisa({ magazine, titlu }: { magazine: MagazinGrila[]; titlu: string }) {
  const pool = poolOferte(magazine);
  const cuOferta = new Set(pool.map((o) => o.m.magazin));
  const fara = magazine.filter((m) => !cuOferta.has(m.magazin) && !EXCLUSE_ACASA.has(m.magazin));
  return (
    <section className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {pool.length > 0 && (
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-[var(--foreground)] mb-3">{titlu}</h2>
          <GrilaOferte {...grilaOferte(pool, { limita: 24 })} sursa="nisa" />
        </div>
      )}
      {fara.length > 0 && (
        <div>
          <h2 className="text-base font-black text-[var(--text-soft)] mb-3">{pool.length > 0 ? "Alte magazine partenere" : titlu}</h2>
          <MagazineCompacte magazine={fara} vizibile={12} />
        </div>
      )}
    </section>
  );
}
