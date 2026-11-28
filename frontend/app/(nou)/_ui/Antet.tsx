import Link from "next/link";
import { IconCauta, IconMeniu, SemnMarca } from "./Iconite";

/**
 * Antetul noului site (25.11.2026). Pe server, fara JavaScript: cautarea e un formular GET spre /cautare
 * (aceeasi pagina ca pana acum), iar meniul de pe telefon e un <details>. Ordinea linkurilor e ordinea banilor:
 * /alege aduce 124 din 155 de clicuri reale (30 de zile pana pe 14.11).
 */
const NAV = [
  { href: "/alege", label: "Alege produsul" },
  { href: "/oferte-azi", label: "Oferte azi" },
  { href: "/reduceri-reale", label: "Reduceri reale" },
  { href: "/black-friday", label: "Black Friday" },
  { href: "/toate-magazinele", label: "Magazine" },
  { href: "/blog", label: "Ghiduri" },
];

const IN_PLUS = [
  { href: "/categorii", label: "Categorii" },
  { href: "/top-reduceri", label: "Top reduceri" },
  { href: "/top", label: "Topuri de produse" },
  { href: "/produse", label: "Produse de la parteneri" },
  { href: "/newsletter", label: "Newsletter" },
];

function FormularCautare({ id }: { id: string }) {
  return (
    <form action="/cautare" method="get" role="search" className={id === "cauta-sus" ? "cauta" : undefined}>
      <label htmlFor={id} className="sr-only">Caută un magazin</label>
      <input id={id} name="q" type="search" placeholder="Caută un magazin" autoComplete="off" enterKeyHint="search" />
      {id === "cauta-sus" && (
        <button type="submit" aria-label="Caută"><IconCauta /></button>
      )}
    </form>
  );
}

export default function Antet({ anunt }: { anunt?: { text: string; href: string } | null }) {
  return (
    <>
      <a href="#continut" className="sari">Sari la conținut</a>
      <header className="antet">
        <div className="cadru antet-rand">
          <Link href="/" className="marca" aria-label="AmCupon.ro, prima pagină">
            <SemnMarca />
            <span>AmCupon<i>.ro</i></span>
          </Link>
          <nav className="nav" aria-label="Meniu principal">
            {NAV.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
          </nav>
          <FormularCautare id="cauta-sus" />
          <Link href="/cautare" className="antet-cauta" aria-label="Caută un magazin"><IconCauta /></Link>
          <details className="meniu">
            <summary className="meniu-buton" aria-label="Meniu"><IconMeniu /></summary>
            <div className="meniu-panou">
              <FormularCautare id="cauta-meniu" />
              <nav aria-label="Meniu">
                {[...NAV, ...IN_PLUS].map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
              </nav>
            </div>
          </details>
        </div>
      </header>
      {anunt && (
        <div className="anunt">
          <Link href={anunt.href}>
            <b>{anunt.text}</b>
            <span>Calendarul →</span>
          </Link>
        </div>
      )}
    </>
  );
}
