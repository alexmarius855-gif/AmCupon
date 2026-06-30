"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface MagazinMini {
  magazin: string;
  logo_url?: string;
  are_promotie: boolean;
  cod_cupon: boolean;
}

function numeAfisat(slug: string) {
  return slug.split(".")[0].replace(/-/g, " ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function Navbar() {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<MagazinMini[]>([]);
  const [allStores, setAllStores] = useState<MagazinMini[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/nav-index.json").then(r => r.json()).then(setAllStores).catch(() => {});
  }, []);

  useEffect(() => {
    if (search.length < 2) { setResults([]); setShowDropdown(false); return; }
    const q = search.toLowerCase();
    const filtered = allStores
      .filter(m => m.magazin.toLowerCase().includes(q) || numeAfisat(m.magazin).toLowerCase().includes(q))
      .sort((a, b) => {
        const aExact = a.magazin.toLowerCase().startsWith(q) ? 1 : 0;
        const bExact = b.magazin.toLowerCase().startsWith(q) ? 1 : 0;
        return bExact - aExact || (b.are_promotie ? 1 : 0) - (a.are_promotie ? 1 : 0);
      })
      .slice(0, 7);
    setResults(filtered);
    setShowDropdown(focused && filtered.length > 0);
  }, [search, allStores, focused]);

  // Nu arata pe pagini cu propriul header.
  // IMPORTANT: acest return TREBUIE sa fie DUPA toate hook-urile, altfel cand
  // navighezi (soft nav) catre o pagina ascunsa, Navbar-ul re-randeaza cu mai
  // putine hooks => React error #300 ("rendered fewer hooks") => pagina alba.
  if (
    pathname === "/" ||
    pathname.startsWith("/cod-reducere/") ||
    pathname.startsWith("/reduceri/")
  ) return null;

  function handleSelect(slug: string) {
    setSearch(""); setShowDropdown(false); setMenuOpen(false);
    window.location.href = `/cod-reducere/${slug}`;
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      setShowDropdown(false);
      window.location.href = `/cautare?q=${encodeURIComponent(search.trim())}`;
    }
  }

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
    { href: "/calculator", label: "🧮 Calculator" },
    { href: "/calculator-salariu", label: "💰 Calculator Salariu" },
    { href: "/generator-proforma", label: "📄 Generator Proforma" },
    { href: "/extensie", label: "🧩 Extensie Chrome" },
    { href: "/ai-tools", label: "🧠 Programe Afiliere AI" },
    { href: "/newsletter", label: "📧 Newsletter" },
  ];

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-[64px] flex items-center gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 shrink-0 group">
          <div className="bg-indigo-600 group-hover:bg-indigo-500 text-white font-black text-sm px-2 py-0.5 rounded-lg tracking-tighter transition-colors">Am</div>
          <span className="font-black text-white text-xl tracking-tight">Cupon<span className="text-indigo-400">.ro</span></span>
        </Link>

        {/* Search cu autocomplete */}
        <div className="flex-1 relative max-w-2xl hidden sm:block">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => { setFocused(true); if (results.length > 0) setShowDropdown(true); }}
                onBlur={() => { setFocused(false); setTimeout(() => setShowDropdown(false), 160); }}
                placeholder="Cauta: eMAG, Answear, Notino..."
                className="w-full bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 text-slate-100 placeholder-slate-500 rounded-full pl-10 pr-10 py-2.5 text-sm focus:outline-none transition-all"
              />
              {search && (
                <button type="button" onClick={() => { setSearch(""); setShowDropdown(false); inputRef.current?.focus(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </div>
          </form>

          {/* Dropdown autocomplete */}
          {showDropdown && results.length > 0 && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
              {results.map(m => (
                <button key={m.magazin} onMouseDown={() => handleSelect(m.magazin)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 transition-colors text-left group/item">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden border border-slate-700">
                    {m.logo_url
                      ? <img src={m.logo_url} alt={numeAfisat(m.magazin)} className="w-6 h-6 object-contain"/>
                      : <span className="text-xs font-black text-indigo-400">{numeAfisat(m.magazin)[0]}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate group-hover/item:text-indigo-400 transition-colors">{numeAfisat(m.magazin)}</p>
                    <p className="text-xs text-slate-400 truncate">{m.magazin}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {m.cod_cupon && (
                      <span className="text-[10px] font-black bg-amber-900/50 text-amber-400 px-1.5 py-0.5 rounded-full">Cod</span>
                    )}
                    {m.are_promotie && (
                      <span className="text-[10px] font-black bg-emerald-900/50 text-emerald-400 px-1.5 py-0.5 rounded-full">Activ</span>
                    )}
                  </div>
                </button>
              ))}
              <div className="border-t border-slate-700 mt-1 pt-1">
                <button onMouseDown={handleSearchSubmit as never}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-indigo-400 font-bold hover:bg-slate-800 transition-colors">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                  Cauta <span className="text-slate-300">&quot;{search}&quot;</span> in toate magazinele
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4 text-sm font-semibold text-slate-300 ml-auto shrink-0">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href}
              className={`hover:text-indigo-400 transition-colors whitespace-nowrap ${pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href)) ? "text-indigo-400" : ""}`}>
              {l.label}
            </Link>
          ))}
          {/* Social media icons */}
          <div className="flex items-center gap-1.5 border-l border-slate-700 pl-4 ml-1">
            <a href="https://www.facebook.com/amcupon.ro" target="_blank" rel="noopener noreferrer" aria-label="Facebook AmCupon"
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-[#1877F2] flex items-center justify-center transition-colors group">
              <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
              </svg>
            </a>
            <a href="https://www.instagram.com/amcupon.ro" target="_blank" rel="noopener noreferrer" aria-label="Instagram AmCupon"
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-gradient-to-br hover:from-purple-600 hover:to-orange-400 flex items-center justify-center transition-colors group">
              <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a href="https://www.tiktok.com/@amcupon.ro" target="_blank" rel="noopener noreferrer" aria-label="TikTok AmCupon"
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-black flex items-center justify-center transition-colors group">
              <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.74a4.85 4.85 0 01-1.01-.05z"/>
              </svg>
            </a>
          </div>
          <Link href="/extensie"
            className="flex items-center gap-1.5 bg-slate-700 hover:bg-indigo-600 text-white px-3.5 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105 duration-150">
            🧩 Extensie
          </Link>
        </nav>

        {/* Mobile menu btn */}
        <button onClick={() => setMenuOpen(o => !o)}
          className="md:hidden ml-auto p-2 rounded-xl hover:bg-slate-800 transition-colors text-slate-300" aria-label="Meniu">
          {menuOpen
            ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
            : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16"/></svg>
          }
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-4 space-y-3 shadow-lg">
          <form onSubmit={handleSearchSubmit} className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cauta magazin..."
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-full pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </form>
          <nav className="space-y-0.5">
            {mobileLinks.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-indigo-400 transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
