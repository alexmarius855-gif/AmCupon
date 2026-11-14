"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MENIU_PRINCIPAL, MENIU_MOBIL } from "@/lib/site";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  /**
   * Cautarea a fost mutata in `SearchModal` (Cmd+K), montat global in layout.
   *
   * Doua motive, ambele masurate:
   *  1. Navbar-ul avea PROPRIA implementare (fetch + filtrare + dropdown), deci
   *     existau doua cautari care trebuiau tinute sincron manual — exact tiparul
   *     care s-a desincronizat deja de doua ori in proiect (cardul de homepage
   *     09.08, footerul 16.08). Acum e una singura.
   *  2. `nav-index.json` (196 KB) se descarca la FIECARE incarcare de pagina,
   *     inclusiv pentru cei care nu cauta niciodata. Acum se incarca lenes, la
   *     prima deschidere a modalului.
   */

  // Nu arata pe pagini cu propriul header.
  // IMPORTANT: acest return TREBUIE sa fie DUPA toate hook-urile, altfel cand
  // navighezi (soft nav) catre o pagina ascunsa, Navbar-ul re-randeaza cu mai
  // putine hooks => React error #300 ("rendered fewer hooks") => pagina alba.
  if (pathname.startsWith("/reduceri/")) return null;

  // Linkurile meniului stau in lib/site.ts (MENIU_PRINCIPAL, MENIU_MOBIL), 14.10.2026.
  const navLinks = MENIU_PRINCIPAL;
  const mobileLinks = MENIU_MOBIL;

  return (
    <header className="bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--border)] sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-[64px] flex items-center gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 shrink-0 group">
          <div className="bg-[#ddf93c] group-hover:bg-[#ddf93c] text-[#0c1000] font-black text-sm px-2 py-0.5 rounded-lg tracking-tighter transition-colors">Am</div>
          <span className="font-black text-[var(--foreground)] text-xl tracking-tight">Cupon<span className="text-[var(--accent-text)]">.ro</span></span>
        </Link>

        {/* Cautare — deschide SearchModal (Cmd+K). Arata ca un camp, e buton:
            o singura implementare de cautare in tot proiectul. */}
        <div className="flex-1 max-w-2xl hidden sm:block">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("amcupon:cauta"))}
            className="group w-full flex items-center gap-3 bg-[var(--surface-alt)] border border-[var(--border-strong)] hover:border-[var(--accent-text)]/50 rounded-full pl-10 pr-3 py-2.5 text-sm text-left relative transition-colors"
            aria-label="Cauta un magazin"
          >
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-text)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <span className="flex-1 min-w-0 truncate text-left text-[var(--text-muted)]">Caută un magazin: Notino, Answear...</span>
            <kbd className="hidden 2xl:inline-flex items-center gap-0.5 text-[10px] font-mono font-bold text-[var(--text-muted)] bg-[var(--surface)] border border-[var(--border-strong)] rounded px-1.5 py-0.5">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Desktop nav */}
        <nav className="hidden xl:flex items-center gap-4 text-sm font-semibold text-[var(--text-soft)] ml-auto shrink-0">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href}
              className={`hover:text-[var(--accent-text)] transition-colors whitespace-nowrap ${pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href)) ? "text-[var(--accent-text)]" : ""}`}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Pe telefon, cautarea e la un clic, nu ascunsa in meniu: e primul lucru pe care il face cine vine dupa un cod. */}
        <button type="button" onClick={() => window.dispatchEvent(new Event("amcupon:cauta"))}
          className="sm:hidden ml-auto p-2 rounded-xl hover:bg-[var(--surface-alt)] transition-colors text-[var(--text-soft)]" aria-label="Caută un magazin">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </button>

        {/* Mobile menu btn */}
        <button onClick={() => setMenuOpen(o => !o)}
          className="xl:hidden sm:ml-auto p-2 rounded-xl hover:bg-[var(--surface-alt)] transition-colors text-[var(--text-soft)]" aria-label="Meniu">
          {menuOpen
            ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
            : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16"/></svg>
          }
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="xl:hidden border-t border-[var(--border)] bg-[var(--surface)] px-4 py-4 space-y-3 shadow-lg">
          <button
            type="button"
            onClick={() => { setMenuOpen(false); window.dispatchEvent(new Event("amcupon:cauta")); }}
            className="w-full flex items-center gap-2 bg-[var(--surface-alt)] border border-[var(--border-strong)] text-[var(--text-muted)] rounded-full px-4 py-2.5 text-sm text-left"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            Cauta magazin...
          </button>
          <nav className="space-y-0.5">
            {mobileLinks.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold text-[var(--text-soft)] hover:bg-[var(--surface-alt)] hover:text-[var(--accent-text)] transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
