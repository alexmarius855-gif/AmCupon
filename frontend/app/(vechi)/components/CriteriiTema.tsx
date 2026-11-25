import Link from "next/link";

/**
 * Linkuri spre paginile /alege ale unei teme („6 kg", „7 kg", „cu uscător"...). Componenta server: linkurile
 * trebuie sa fie in HTML, ca Google sa le gaseasca si omul sa ajunga dintr-un clic la produsele care il intereseaza.
 */
export default function CriteriiTema({ lista, activ, titlu = "Alege după ce te interesează" }: { lista: { slug: string; titlu: string }[]; activ?: string; titlu?: string }) {
  if (lista.length === 0) return null;
  return (
    <nav aria-label={titlu} className="my-6">
      <p className="text-sm font-black text-[var(--foreground)] mb-3">{titlu}</p>
      <ul className="flex flex-wrap gap-2">
        {lista.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/alege/${c.slug}`}
              aria-current={c.slug === activ ? "page" : undefined}
              className={`inline-block text-sm font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                c.slug === activ
                  ? "bg-[#ddf93c] border-[#ddf93c] text-[#0c1000]"
                  : "bg-[var(--surface)] border-[var(--border-strong)] text-[var(--text-soft)] hover:border-[var(--accent-text)] hover:text-[var(--accent-text)]"
              }`}
            >
              {c.titlu}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
