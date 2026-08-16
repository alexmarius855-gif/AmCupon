"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

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
  if (
    pathname === "/" ||
    pathname.startsWith("/cod-reducere/") ||
    pathname.startsWith("/reduceri/")
  ) return null;

  const navLinks = [
    { href: "/", label: "Acasa" },
    { href: "/#promotii", label: "Promotii" },
    { href: "/produse", label: "Produse" },
    { href: "/blog", label: "Blog" },
    { href: "/toate-magazinele", label: "Magazine" },
    { href: "/categorii", label: "Categorii" },
    { href: "/comparator", label: "Comparator" },
    { href: "/top-reduceri", label: "Top reduceri" },
  ];

  const mobileLinks = [
    { href: "/", label: "🏠 Acasa" },
    { href: "/#promotii", label: "🔥 Promotii active" },
    { href: "/produse", label: "🛍️ Produse" },
    { href: "/blog", label: "📝 Blog" },
    { href: "/toate-magazinele", label: "🏪 Toate magazinele" },
    { href: "/categorii", label: "📂 Categorii" },
    { href: "/comparator", label: "⚖️ Comparator magazine" },
    { href: "/top-reduceri", label: "⭐ Top reduceri" },
    { href: "/esim", label: "📡 eSIM Calatorie" },
    { href: "/vpn", label: "🛡️ Cel mai bun VPN" },
    { href: "/hosting", label: "🌐 Hosting ieftin" },
    { href: "/extensie", label: "🧩 Extensie Chrome" },
    { href: "/ai-tools", label: "🧠 Programe Afiliere AI" },
    { href: "/newsletter", label: "📧 Newsletter" },
  ];

  return (
    <header className="bg-[#14181c]/95 backdrop-blur-md border-b border-[#1f2329] sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-[64px] flex items-center gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 shrink-0 group">
          <div className="bg-[#ddf93c] group-hover:bg-[#ddf93c] text-[#0c1000] font-black text-sm px-2 py-0.5 rounded-lg tracking-tighter transition-colors">Am</div>
          <span className="font-black text-[#ffffff] text-xl tracking-tight">Cupon<span className="text-[#ddf93c]">.ro</span></span>
        </Link>

        {/* Cautare — deschide SearchModal (Cmd+K). Arata ca un camp, e buton:
            o singura implementare de cautare in tot proiectul. */}
        <div className="flex-1 max-w-2xl hidden sm:block">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("amcupon:cauta"))}
            className="group w-full flex items-center gap-3 bg-[#1f2329] border border-[#2a2f36] hover:border-[#ddf93c]/50 rounded-full pl-10 pr-3 py-2.5 text-sm text-left relative transition-colors"
            aria-label="Cauta un magazin"
          >
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9399a0] group-hover:text-[#ddf93c] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <span className="flex-1 text-[#9399a0]">Cauta: eMAG, Answear, Notino...</span>
            <kbd className="hidden md:inline-flex items-center gap-0.5 text-[10px] font-mono font-bold text-[#6b7178] bg-[#14181c] border border-[#2a2f36] rounded px-1.5 py-0.5">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4 text-sm font-semibold text-[#c9ced5] ml-auto shrink-0">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href}
              className={`hover:text-[#ddf93c] transition-colors whitespace-nowrap ${pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href)) ? "text-[#ddf93c]" : ""}`}>
              {l.label}
            </Link>
          ))}
          {/* Social media icons */}
          <div className="flex items-center gap-1.5 border-l border-[#2a2f36] pl-4 ml-1">
            <a href="https://www.facebook.com/amcupon.ro" target="_blank" rel="noopener noreferrer" aria-label="Facebook AmCupon"
              className="w-8 h-8 rounded-lg bg-[#1f2329] hover:bg-[#1877F2] flex items-center justify-center transition-colors group">
              <svg className="w-3.5 h-3.5 text-[#c9ced5] group-hover:text-[#ffffff] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
              </svg>
            </a>
            <a href="https://www.instagram.com/amcupon.ro" target="_blank" rel="noopener noreferrer" aria-label="Instagram AmCupon"
              className="w-8 h-8 rounded-lg bg-[#1f2329] hover:bg-gradient-to-br hover:from-[#ddf93c] hover:to-[#ddf93c] flex items-center justify-center transition-colors group">
              <svg className="w-3.5 h-3.5 text-[#c9ced5] group-hover:text-[#ffffff] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a href="https://www.tiktok.com/@amcupon.ro" target="_blank" rel="noopener noreferrer" aria-label="TikTok AmCupon"
              className="w-8 h-8 rounded-lg bg-[#1f2329] hover:bg-black flex items-center justify-center transition-colors group">
              <svg className="w-3.5 h-3.5 text-[#c9ced5] group-hover:text-[#ffffff] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.74a4.85 4.85 0 01-1.01-.05z"/>
              </svg>
            </a>
          </div>
          <Link href="/extensie"
            className="flex items-center gap-1.5 bg-[#2a2f10] hover:bg-[#ddf93c] text-[#c3dd2c] hover:text-[#0c1000] border border-[#99f6e4] px-3.5 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105 duration-150">
            🧩 Extensie
          </Link>
        </nav>

        {/* Mobile menu btn */}
        <button onClick={() => setMenuOpen(o => !o)}
          className="md:hidden ml-auto p-2 rounded-xl hover:bg-[#1f2329] transition-colors text-[#c9ced5]" aria-label="Meniu">
          {menuOpen
            ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
            : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16"/></svg>
          }
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#1f2329] bg-[#14181c] px-4 py-4 space-y-3 shadow-lg">
          <button
            type="button"
            onClick={() => { setMenuOpen(false); window.dispatchEvent(new Event("amcupon:cauta")); }}
            className="w-full flex items-center gap-2 bg-[#1f2329] border border-[#2a2f36] text-[#9399a0] rounded-full px-4 py-2.5 text-sm text-left"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            Cauta magazin...
          </button>
          <nav className="space-y-0.5">
            {mobileLinks.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold text-[#c9ced5] hover:bg-[#1f2329] hover:text-[#ddf93c] transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
