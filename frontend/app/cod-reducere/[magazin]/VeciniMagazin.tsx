import Link from "next/link";
import { numeAfisat } from "@/lib/numeMagazin";

/** Linkuri spre magazinele vecine din categorie. In HTML, ca Google sa ajunga la fiecare pagina de magazin. */
export default function VeciniMagazin({ categorie, lista }: { categorie: string; lista: string[] }) {
  if (lista.length === 0) return null;
  return (
    <nav aria-label="Alte magazine din categorie" className="max-w-5xl mx-auto px-4 pb-10">
      <p className="text-sm font-black text-[var(--foreground)] mb-3">Alte magazine din {categorie}</p>
      <ul className="flex flex-wrap gap-2">
        {lista.map((s) => (
          <li key={s}>
            <Link href={`/cod-reducere/${s}`} className="inline-block text-sm px-3 py-1.5 rounded-full border border-[var(--border-strong)] text-[var(--text-soft)] hover:text-[var(--accent-text)] hover:border-[var(--accent-text)]">
              Cod reducere {numeAfisat(s)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
