"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Promotie {
  nume: string;
  descriere: string;
  cod_cupon: string;
  landing_page: string;
  zile_ramase: number;
}

interface Magazin {
  magazin: string;
  url: string;
  url_afiliat: string;
  logo_url?: string;
  categorie: string;
  categorie_slug?: string;
  comision: string;
  scor_afiliere: number;
  scor_final: number;
  rank?: number;
  prioritate: string;
  canal_recomandat: string;
  sales_number: number;
  trend: number;
  are_promotie: boolean;
  cod_cupon: boolean;
  zile_ramase: number;
  promotii: Promotie[];
  folosit_de: number;
  procent_succes: number;
  exclusiv: boolean;
}

const CATEGORII = [
  { slug: "fashion",              emoji: "👗", label: "Fashion",       bg: "bg-pink-50",    hover: "hover:bg-pink-100",    border: "border-pink-200" },
  { slug: "electronics-itc",     emoji: "💻", label: "Electronice",   bg: "bg-blue-50",    hover: "hover:bg-blue-100",    border: "border-blue-200" },
  { slug: "beauty",              emoji: "💄", label: "Frumusețe",     bg: "bg-rose-50",    hover: "hover:bg-rose-100",    border: "border-rose-200" },
  { slug: "home-garden",         emoji: "🏡", label: "Casă & Grădină",bg: "bg-green-50",   hover: "hover:bg-green-100",   border: "border-green-200" },
  { slug: "sports-outdoors",     emoji: "🏃", label: "Sport",         bg: "bg-orange-50",  hover: "hover:bg-orange-100",  border: "border-orange-200" },
  { slug: "pharma",              emoji: "💊", label: "Farmacie",      bg: "bg-red-50",     hover: "hover:bg-red-100",     border: "border-red-200" },
  { slug: "babies-kids-toys",    emoji: "👶", label: "Copii & Jucării",bg:"bg-purple-50",  hover: "hover:bg-purple-100",  border: "border-purple-200" },
  { slug: "automotive",          emoji: "🚗", label: "Auto-Moto",     bg: "bg-slate-50",   hover: "hover:bg-slate-100",   border: "border-slate-200" },
  { slug: "books",               emoji: "📚", label: "Cărți",         bg: "bg-yellow-50",  hover: "hover:bg-yellow-100",  border: "border-yellow-200" },
  { slug: "hypermarket-groceries",emoji:"🛒", label: "Hypermarket",   bg: "bg-emerald-50", hover: "hover:bg-emerald-100", border: "border-emerald-200" },
  { slug: "gifts-flowers",       emoji: "🎁", label: "Cadouri",       bg: "bg-fuchsia-50", hover: "hover:bg-fuchsia-100", border: "border-fuchsia-200" },
  { slug: "telecom",             emoji: "📱", label: "Telecom",       bg: "bg-cyan-50",    hover: "hover:bg-cyan-100",    border: "border-cyan-200" },
  { slug: "pet-supplies",        emoji: "🐾", label: "Animale",       bg: "bg-amber-50",   hover: "hover:bg-amber-100",   border: "border-amber-200" },
  { slug: "health-personal-care",emoji: "🧴", label: "Sănătate",      bg: "bg-teal-50",    hover: "hover:bg-teal-100",    border: "border-teal-200" },
  { slug: "jewelry",             emoji: "💎", label: "Bijuterii",     bg: "bg-violet-50",  hover: "hover:bg-violet-100",  border: "border-violet-200" },
  { slug: "games",               emoji: "🎮", label: "Jocuri",        bg: "bg-indigo-50",  hover: "hover:bg-indigo-100",  border: "border-indigo-200" },
];

// Sectiuni speciale (pagini dedicate)
const SECTIUNI_SPECIALE = [
  { href: "/gadgets", emoji: "📡", label: "Gadgets & Tech", desc: "Smartwatch, căști, drone", gradient: "from-blue-500 to-indigo-600" },
  { href: "/moto", emoji: "🏍️", label: "Auto-Moto", desc: "Piese, accesorii, anvelope", gradient: "from-slate-600 to-gray-800" },
  { href: "/idei-cadouri", emoji: "🎁", label: "Idei Cadouri", desc: "Cadoul perfect la preț mic", gradient: "from-pink-500 to-purple-600" },
  { href: "/farmacie", emoji: "💊", label: "Farmacie Online", desc: "Dr. Max, Vegis, Catena", gradient: "from-green-500 to-teal-600" },
  { href: "/sport", emoji: "🏃", label: "Sport & Outdoor", desc: "Decathlon, Hervis, Intersport", gradient: "from-orange-500 to-amber-600" },
  { href: "/copii", emoji: "👶", label: "Copii & Jucării", desc: "Noriel, Bebetei, Smyths", gradient: "from-yellow-400 to-orange-500" },
  { href: "/frumusete", emoji: "💄", label: "Beauty", desc: "Notino, Douglas, Sephora", gradient: "from-pink-400 to-rose-600" },
  { href: "/calatorie", emoji: "✈️", label: "Vacanțe & Travel", desc: "Booking, Airbnb, Trip.com", gradient: "from-sky-500 to-blue-600" },
  { href: "/black-friday", emoji: "🖤", label: "Black Friday", desc: "Cele mai mari reduceri", gradient: "from-gray-900 to-black" },
  { href: "/craciun", emoji: "🎄", label: "Crăciun", desc: "Oferte de sărbători", gradient: "from-red-600 to-green-700" },
  { href: "/categorii", emoji: "📂", label: "Toate categoriile", desc: "Explorează tot", gradient: "from-orange-500 to-red-500" },
];

function maskCod(cod: string): string {
  if (!cod || cod.length <= 4) return cod;
  return cod.slice(0, 4) + "*".repeat(Math.min(cod.length - 4, 6));
}

function extractDiscount(text: string): string | null {
  const m = text?.match(/(\d+)\s*%/);
  return m ? m[1] + "%" : null;
}

function maxDiscount(promotii: Promotie[]): string | null {
  let maxPct = 0;
  for (const p of promotii) {
    const texts = [p.nume || "", p.descriere || ""];
    for (const t of texts) {
      const m = t.match(/(\d+)\s*%/g);
      if (m) {
        for (const match of m) {
          const val = parseInt(match);
          if (val > maxPct && val <= 90) maxPct = val;
        }
      }
    }
  }
  return maxPct > 0 ? `Până la ${maxPct}% reducere` : null;
}

function numeAfisat(magazin: string): string {
  return magazin.split(".")[0].replace(/-/g, " ")
    .split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
  cover: string;
}

export default function Home() {
  const [magazine, setMagazine] = useState<Magazin[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [cautare, setCautare] = useState("");
  const [coduriReveal, setCoduriReveal] = useState<Set<string>>(new Set());
  const [copiat, setCopiat] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [storeLimit, setStoreLimit] = useState(12);
  const [filtruActiv, setFiltruActiv] = useState<"toate" | "cod" | "promotie" | "favorite">("toate");
  const [favorite, setFavorite] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/output.json").then((r) => r.json()).then((data) => { setMagazine(data); setLoading(false); });
    fetch("/blog-posts.json").then((r) => r.json()).then((posts: BlogPost[]) => setBlogPosts(posts.slice(0, 3))).catch(() => {});
    // Încarcă favorite din localStorage
    try {
      const saved = JSON.parse(localStorage.getItem("favorite_magazine") || "[]");
      setFavorite(new Set(saved));
    } catch {}
  }, []);

  function toggleFavorit(slug: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setFavorite(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug); else next.add(slug);
      localStorage.setItem("favorite_magazine", JSON.stringify([...next]));
      return next;
    });
  }

  const filtrate = magazine.filter((m) => {
    const matchCautare = cautare === "" || m.magazin.toLowerCase().includes(cautare.toLowerCase()) || numeAfisat(m.magazin).toLowerCase().includes(cautare.toLowerCase());
    if (!matchCautare) return false;
    if (filtruActiv === "cod") return m.cod_cupon;
    if (filtruActiv === "promotie") return m.are_promotie;
    if (filtruActiv === "favorite") return favorite.has(m.magazin);
    return true;
  });

  const expiraAzi = filtrate.filter((m) => m.are_promotie && m.zile_ramase <= 1);
  const cuPromotii = filtrate.filter((m) => m.are_promotie);
  const faraPromotii = filtrate.filter((m) => !m.are_promotie);

  const promoPerCateg = magazine.reduce((acc, m) => {
    if (m.are_promotie && m.categorie_slug) {
      acc[m.categorie_slug] = (acc[m.categorie_slug] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  function copiazaCod(id: string, cod: string) {
    setCoduriReveal((prev) => new Set(prev).add(id));
    navigator.clipboard.writeText(cod).catch(() => {});
    setCopiat(id);
    setTimeout(() => setCopiat(null), 3000);
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <a href="/" className="flex items-center gap-1.5 shrink-0">
            <div className="bg-orange-500 text-white font-black text-base px-2 py-1 rounded-lg">Am</div>
            <span className="font-black text-gray-900 text-xl">Cupon</span>
            <span className="text-orange-500 font-black text-xl">.ro</span>
          </a>

          <div className="flex-1 relative max-w-2xl">
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Answear, Farmec, Noriel..."
              value={cautare}
              onChange={(e) => { setCautare(e.target.value); setMenuOpen(false); }}
              className="w-full border border-gray-300 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
            />
          </div>

          <nav className="hidden md:flex items-center gap-5 text-sm font-semibold text-gray-600">
            <a href="#promotii" className="hover:text-orange-500 transition-colors">Promoții</a>
            <a href="/produse" className="hover:text-orange-500 transition-colors">Produse</a>
            <a href="/blog" className="hover:text-orange-500 transition-colors">Blog</a>
            <div className="relative group">
              <button className="flex items-center gap-1 hover:text-orange-500 transition-colors py-1">
                Categorii
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute right-0 top-full pt-1 hidden group-hover:block z-50">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-xl py-2 w-64">
                  {CATEGORII.slice(0, 8).map((c) => (
                    <a key={c.slug} href={`/categorii/${c.slug}`}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                      <span className="text-lg">{c.emoji}</span>
                      <span className="font-medium">{c.label}</span>
                    </a>
                  ))}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <a href="/categorii"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-orange-500 hover:bg-orange-50 transition-colors">
                      Vezi toate categoriile →
                    </a>
                  </div>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <p className="px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Pagini speciale</p>
                    {[
                      { href: "/farmacie", emoji: "💊", label: "Farmacie Online" },
                      { href: "/sport", emoji: "🏃", label: "Sport & Outdoor" },
                      { href: "/frumusete", emoji: "💄", label: "Beauty" },
                      { href: "/calatorie", emoji: "✈️", label: "Vacanțe & Travel" },
                      { href: "/copii", emoji: "👶", label: "Copii & Jucării" },
                    ].map((l) => (
                      <a key={l.href} href={l.href}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                        <span className="text-base">{l.emoji}</span>
                        <span className="font-medium">{l.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Hamburger button — mobile only */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden shrink-0 p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-700"
            aria-label="Meniu"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu panel */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-5">

              {/* Nav links */}
              <nav className="space-y-1">
                {[
                  { href: "/#promotii", label: "🔥 Promoții active" },
                  { href: "/blog", label: "📝 Blog" },
                  { href: "/farmacie", label: "💊 Farmacie Online" },
                  { href: "/sport", label: "🏃 Sport & Outdoor" },
                  { href: "/frumusete", label: "💄 Beauty" },
                  { href: "/calatorie", label: "✈️ Vacanțe & Travel" },
                  { href: "/copii", label: "👶 Copii & Jucării" },
                  { href: "/categorii", label: "📂 Toate categoriile" },
                  { href: "/despre-noi", label: "ℹ️ Despre noi" },
                ].map((l) => (
                  <a key={l.href} href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                    {l.label}
                  </a>
                ))}
              </nav>

              {/* Category grid */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-3">Categorii populare</p>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORII.slice(0, 8).map((c) => (
                    <a key={c.slug} href={`/categorii/${c.slug}`}
                      onClick={() => setMenuOpen(false)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border ${c.bg} ${c.border} hover:border-orange-300 transition-colors`}>
                      <span className="text-xl">{c.emoji}</span>
                      <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{c.label}</span>
                    </a>
                  ))}
                </div>
                <a href="/categorii" onClick={() => setMenuOpen(false)}
                  className="block text-center text-xs font-bold text-orange-500 mt-3 hover:text-orange-600">
                  Vezi toate categoriile →
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* HERO — upgraded */}
      <div className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 text-white overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-red-600/30 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-orange-400/20 blur-3xl" />
        </div>
        {/* Floating deal bubbles — decorative */}
        <div className="absolute left-6 top-8 hidden lg:flex flex-col gap-3 opacity-90">
          {["💊 -40%", "👗 -60%", "💻 -35%"].map((t, i) => (
            <div key={i} className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-3 py-2 text-xs font-bold shadow-lg">
              {t}
            </div>
          ))}
        </div>
        <div className="absolute right-6 top-8 hidden lg:flex flex-col gap-3 opacity-90">
          {["🏃 -50%", "🎁 -45%", "🏡 -30%"].map((t, i) => (
            <div key={i} className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-3 py-2 text-xs font-bold shadow-lg">
              {t}
            </div>
          ))}
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs font-bold mb-6 border border-white/25">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
            🔥 {cuPromotii.length > 0 ? cuPromotii.length : "Sute de"} oferte active acum
          </div>

          {/* H1 */}
          <h1 className="text-4xl md:text-6xl font-black mb-5 leading-[1.1] tracking-tight">
            Cele mai bune<br />
            <span className="text-amber-200">coduri de reducere</span><br />
            din România
          </h1>
          <p className="text-orange-100 text-base md:text-xl mb-8 max-w-lg mx-auto leading-relaxed">
            Verificate zilnic. Gratuit. Peste {magazine.length > 0 ? magazine.length : "610"} magazine partenere.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <a href="#promotii"
              className="bg-white text-orange-600 font-black px-7 py-3.5 rounded-2xl text-sm hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-200">
              🔥 Oferte active
            </a>
            <a href="#categorii"
              className="bg-white/15 backdrop-blur-sm border border-white/30 text-white font-bold px-7 py-3.5 rounded-2xl text-sm hover:bg-white/25 transition-all duration-200">
              Caută după categorie →
            </a>
          </div>

          {/* Quick search */}
          <div className="max-w-xl mx-auto relative">
            <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Caută magazin: eMAG, Answear, Notino..."
              value={cautare}
              onChange={(e) => setCautare(e.target.value)}
              className="w-full bg-white text-gray-900 font-medium rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* TRUST BAR */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {[
              { icon: "🏪", value: magazine.length > 0 ? `${magazine.length}+` : "610+", label: "Magazine partenere" },
              { icon: "⚡", value: cuPromotii.length > 0 ? `${cuPromotii.length}` : "200+", label: "Promoții active" },
              { icon: "✅", value: "100%", label: "Coduri verificate" },
              { icon: "🆓", value: "Gratuit", label: "Fără abonament" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center text-xl shrink-0 transition-colors">
                  {s.icon}
                </div>
                <div>
                  <p className="font-black text-gray-900 text-lg leading-tight">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CATEGORY GRID — Wirecutter style */}
      <div id="categorii" className="bg-white border-b border-gray-100 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-7">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Explorează pe categorii</h2>
              <p className="text-sm text-gray-400 mt-0.5">Găsește cele mai bune oferte din categoria ta preferată</p>
            </div>
            <a href="/categorii" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors border border-orange-200 hover:border-orange-400 px-4 py-2 rounded-full">
              Toate categoriile
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Grid mare — carduri vizuale */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 md:gap-4">
            {CATEGORII.slice(0, 8).map((c) => {
              const nrPromo = promoPerCateg[c.slug] || 0;
              return (
                <a key={c.slug} href={`/categorii/${c.slug}`}
                  className={`group relative flex flex-col items-center justify-center gap-3 p-6 md:p-7 rounded-3xl border-2 ${c.bg} ${c.hover} ${c.border} hover:border-orange-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden min-h-[140px]`}>
                  {/* Glow decorativ */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
                  {/* Emoji */}
                  <span className="text-4xl md:text-5xl group-hover:scale-110 transition-transform duration-200 drop-shadow-sm">{c.emoji}</span>
                  {/* Nume */}
                  <span className="font-black text-sm md:text-base text-gray-800 text-center leading-tight">{c.label}</span>
                  {/* Badge promoții */}
                  {nrPromo > 0 ? (
                    <span className="bg-orange-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                      {nrPromo} {nrPromo === 1 ? "ofertă" : "oferte"}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 font-medium">Vezi magazine</span>
                  )}
                </a>
              );
            })}
          </div>

          {/* Al doilea rând — categorii secundare, mai mici */}
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-2 mt-3">
            {CATEGORII.slice(8).map((c) => {
              const nrPromo = promoPerCateg[c.slug] || 0;
              return (
                <a key={c.slug} href={`/categorii/${c.slug}`}
                  className={`group relative flex flex-col items-center gap-1.5 p-3 rounded-2xl border ${c.bg} ${c.hover} ${c.border} hover:border-orange-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{c.emoji}</span>
                  <span className="text-xs font-bold text-gray-700 text-center leading-tight">{c.label}</span>
                  {nrPromo > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                      {nrPromo > 9 ? "9+" : nrPromo}
                    </span>
                  )}
                </a>
              );
            })}
          </div>

          <a href="/categorii" className="sm:hidden mt-4 flex items-center justify-center gap-1.5 text-sm font-bold text-orange-500 border border-orange-200 py-2.5 rounded-2xl">
            Toate categoriile →
          </a>
        </div>
      </div>

      {/* DEAL ZILEI */}
      {!loading && cuPromotii.length > 0 && (() => {
        const deal = cuPromotii.find(m => m.cod_cupon) || cuPromotii[0];
        const promo = deal.promotii[0];
        const discountText = maxDiscount(deal.promotii);
        const link = promo?.landing_page || deal.url_afiliat || deal.url;
        return (
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 py-6 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-orange-500 text-white text-xs font-black px-3 py-1 rounded-full animate-pulse">🔥 DEAL ZILEI</span>
                <span className="text-gray-400 text-xs">{new Date().toLocaleDateString("ro-RO", { day: "numeric", month: "long" })}</span>
              </div>
              <a href={link} target="_blank" rel="sponsored noopener noreferrer"
                className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/50 rounded-2xl p-5 transition-all duration-200">
                {/* Logo */}
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-lg">
                  {deal.logo_url ? (
                    <img src={deal.logo_url} alt={numeAfisat(deal.magazin)} className="w-12 h-12 object-contain" loading="lazy" />
                  ) : (
                    <span className="text-2xl font-black text-orange-500">{numeAfisat(deal.magazin)[0]}</span>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-white font-black text-lg">{numeAfisat(deal.magazin)}</span>
                    <span className="text-gray-400 text-xs">{deal.categorie}</span>
                  </div>
                  <p className="text-gray-300 text-sm line-clamp-1">{promo?.nume || "Ofertă specială disponibilă"}</p>
                  {discountText && (
                    <span className="inline-block mt-2 bg-green-500/20 text-green-400 text-xs font-black px-2.5 py-0.5 rounded-full border border-green-500/30">
                      {discountText}
                    </span>
                  )}
                </div>
                {/* CTA */}
                <div className="flex items-center gap-3 shrink-0">
                  {promo?.cod_cupon && (
                    <div className="hidden sm:block border-2 border-dashed border-orange-400/60 rounded-xl px-4 py-2 bg-orange-500/10">
                      <span className="font-mono font-black text-orange-400 text-sm tracking-widest">{promo.cod_cupon}</span>
                    </div>
                  )}
                  <span className="bg-orange-500 group-hover:bg-orange-400 text-white font-black px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap">
                    Activează →
                  </span>
                </div>
              </a>
            </div>
          </div>
        );
      })()}

      {/* TRENDING — scroll orizontal */}
      {!loading && cuPromotii.length >= 3 && (
        <div className="bg-white border-b border-gray-100 py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full">LIVE</span>
                <h2 className="text-xl font-black text-gray-900">Trending acum</h2>
              </div>
              <a href="#promotii" className="text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors hidden sm:block">
                Toate ofertele →
              </a>
            </div>
            {/* Scroll orizontal cu hide scrollbar */}
            <div className="overflow-x-auto -mx-4 px-4 pb-3" style={{ scrollbarWidth: "none" }}>
              <div className="flex gap-3" style={{ minWidth: "max-content" }}>
                {cuPromotii.slice(0, 12).map((m) => {
                  const promo = m.promotii[0];
                  const discount = maxDiscount(m.promotii);
                  const link = promo?.landing_page || m.url_afiliat || m.url;
                  return (
                    <a key={m.magazin} href={link} target="_blank" rel="sponsored noopener noreferrer"
                      className="group flex-shrink-0 w-52 bg-white border border-gray-200 hover:border-orange-300 rounded-2xl p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                          {m.logo_url ? (
                            <img src={m.logo_url} alt={numeAfisat(m.magazin)} className="w-8 h-8 object-contain" loading="lazy" />
                          ) : (
                            <span className="text-base font-black text-orange-500">{numeAfisat(m.magazin)[0]}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-gray-900 text-xs truncate group-hover:text-orange-600 transition-colors">{numeAfisat(m.magazin)}</p>
                          <p className="text-gray-400 text-xs truncate">{m.categorie}</p>
                        </div>
                      </div>
                      {discount && (
                        <div className="bg-green-50 border border-green-200 rounded-lg px-2.5 py-1 mb-2.5 text-center">
                          <span className="text-green-700 font-black text-xs">{discount}</span>
                        </div>
                      )}
                      <p className="text-gray-500 text-xs line-clamp-2 mb-3">{promo?.nume || "Ofertă activă"}</p>
                      <div className="bg-orange-500 group-hover:bg-orange-600 text-white text-xs font-black py-1.5 rounded-lg text-center transition-colors">
                        {m.cod_cupon ? "🎟 Cod disponibil" : "Vezi oferta"}
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTIUNI SPECIALE */}
      <div className="bg-gray-50 border-b border-gray-100 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Secțiuni speciale</h2>
              <p className="text-sm text-gray-400 mt-0.5">Ghiduri dedicate cu cele mai bune oferte</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {SECTIUNI_SPECIALE.slice(0, 10).map((s) => (
              <a key={s.href} href={s.href}
                className={`group relative bg-gradient-to-br ${s.gradient} rounded-3xl p-5 md:p-6 text-white hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden`}>
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/10 blur-xl transform translate-x-4 -translate-y-4 group-hover:scale-150 transition-transform duration-300" />
                <div className="relative">
                  <div className="text-3xl mb-3">{s.emoji}</div>
                  <p className="font-black text-sm leading-tight">{s.label}</p>
                  <p className="text-white/65 text-xs mt-1 leading-tight">{s.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-white/80 text-xs font-semibold">
                    Descoperă
                    <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* TOP PICKS — 3 oferte premium */}
      {!loading && cuPromotii.length >= 3 && (
        <div className="bg-white border-b border-gray-100 py-10 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Top picks săptămâna aceasta</h2>
                <p className="text-sm text-gray-400 mt-0.5">Cele mai bune oferte selectate de echipa noastră</p>
              </div>
              <a href="#promotii" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors">
                Toate ofertele
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {cuPromotii.slice(0, 3).map((m, i) => {
                const nume = numeAfisat(m.magazin);
                const promo = m.promotii[0];
                const discountText = maxDiscount(m.promotii);
                const link = promo?.landing_page || m.url_afiliat || m.url;
                const badges = [
                  { bg: "bg-orange-500", label: "#1 Recomandat" },
                  { bg: "bg-purple-600", label: "Popular" },
                  { bg: "bg-blue-600", label: "Trending" },
                ];
                return (
                  <a key={m.magazin} href={link} target="_blank" rel="sponsored noopener noreferrer"
                    className="group relative bg-white border-2 border-gray-100 hover:border-orange-300 rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-200">
                    {/* Top banner color */}
                    <div className={`h-2 ${["bg-gradient-to-r from-orange-500 to-red-500", "bg-gradient-to-r from-purple-500 to-pink-500", "bg-gradient-to-r from-blue-500 to-indigo-500"][i]}`} />
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <span className={`${badges[i].bg} text-white text-xs font-black px-2.5 py-1 rounded-full`}>
                          {badges[i].label}
                        </span>
                        {m.cod_cupon && (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-1 rounded-full">
                            🎟 Cod cupon
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                          {m.logo_url ? (
                            <img src={m.logo_url} alt={`Logo ${nume}`} className="w-12 h-12 object-contain" loading="lazy" />
                          ) : (
                            <span className="text-2xl font-black text-orange-500">{nume[0]}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-black text-gray-900 text-lg group-hover:text-orange-600 transition-colors leading-tight">{nume}</h3>
                          <p className="text-gray-400 text-xs">{m.categorie}</p>
                          {discountText && (
                            <span className="inline-block mt-1 bg-green-50 text-green-700 border border-green-200 text-xs font-bold px-2 py-0.5 rounded-full">
                              {discountText}
                            </span>
                          )}
                        </div>
                      </div>
                      {promo && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">{promo.nume}</p>
                      )}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span>✓ Verificat azi</span>
                          <span>·</span>
                          <span>{m.promotii.length} {m.promotii.length === 1 ? "ofertă" : "oferte"}</span>
                        </div>
                        <span className="bg-orange-500 group-hover:bg-orange-600 text-white font-black text-xs px-4 py-2 rounded-xl transition-colors">
                          Activează →
                        </span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* FILTRE RAPIDE */}
        {!loading && (
          <div className="flex flex-wrap gap-2 mb-6 items-center">
            {([
              { key: "toate", label: "Toate" },
              { key: "cod", label: "🎟 Cod cupon" },
              { key: "promotie", label: "⚡ Promoții active" },
              { key: "favorite", label: `❤️ Favorite${favorite.size > 0 ? ` (${favorite.size})` : ""}` },
            ] as { key: "toate"|"cod"|"promotie"|"favorite"; label: string }[]).map(f => (
              <button key={f.key} onClick={() => setFiltruActiv(f.key)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${filtruActiv === f.key ? "bg-orange-500 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:border-orange-300"}`}>
                {f.label}
              </button>
            ))}
            <a href="/toate-magazinele"
              className="ml-auto text-sm text-orange-500 hover:text-orange-600 font-semibold transition-colors">
              Vezi toate ({magazine.length}) →
            </a>
          </div>
        )}

        {/* SKELETON LOADING */}
        {loading && (
          <section className="mb-10">
            <div className="h-7 w-48 bg-gray-200 rounded-lg animate-pulse mb-5" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </section>
        )}

        {/* EXPIRA AZI */}
        {!loading && expiraAzi.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full animate-pulse">EXPIRĂ AZI</span>
              <h2 className="text-xl font-black text-gray-900">Oferte care se termină azi</h2>
              <span className="text-sm text-gray-400">{expiraAzi.length} oferte</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {expiraAzi.map((m) => (
                <Card key={m.magazin + "_azi"} m={m} revealed={coduriReveal.has(m.magazin)} copiat={copiat === m.magazin} onCopiere={copiazaCod} isFavorit={favorite.has(m.magazin)} onToggleFavorit={toggleFavorit} />
              ))}
            </div>
          </section>
        )}

        {/* PROMOTII ACTIVE */}
        {!loading && cuPromotii.length > 0 && (
          <section id="promotii" className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="bg-red-500 text-white text-xs font-black px-3 py-1 rounded-full animate-pulse">LIVE</span>
                <h2 className="text-xl font-black text-gray-900">Toate promoțiile active</h2>
                <span className="text-sm text-gray-400 hidden sm:inline">{cuPromotii.length} oferte</span>
              </div>
              <a href="/toate-magazinele" className="text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors hidden sm:block">
                Toate magazinele →
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cuPromotii.slice(0, 12).map((m) => (
                <Card key={m.magazin} m={m} revealed={coduriReveal.has(m.magazin)} copiat={copiat === m.magazin} onCopiere={copiazaCod} isFavorit={favorite.has(m.magazin)} onToggleFavorit={toggleFavorit} />
              ))}
            </div>
          </section>
        )}

        {/* MAGAZINE PARTENERE */}
        {!loading && faraPromotii.length > 0 && (
          <section id="magazine">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-gray-900">Toate magazinele</h2>
                <span className="text-sm text-gray-400 hidden sm:inline">{magazine.length} partenere</span>
              </div>
              <a href="/toate-magazinele" className="text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors">
                Pagina completă →
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {faraPromotii.slice(0, storeLimit).map((m) => (
                <Card key={m.magazin} m={m} revealed={coduriReveal.has(m.magazin)} copiat={copiat === m.magazin} onCopiere={copiazaCod} isFavorit={favorite.has(m.magazin)} onToggleFavorit={toggleFavorit} />
              ))}
            </div>
            {faraPromotii.length > storeLimit && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setStoreLimit((l) => l + 24)}
                  className="bg-white border-2 border-gray-200 hover:border-orange-400 text-gray-600 hover:text-orange-500 font-bold px-8 py-3 rounded-2xl text-sm transition-all hover:shadow-md"
                >
                  Încarcă mai multe ({faraPromotii.length - storeLimit} magazine rămase)
                </button>
              </div>
            )}
          </section>
        )}
      </div>

      {/* BLOG PREVIEW */}
      {blogPosts.length > 0 && (
        <div className="bg-white border-t border-gray-100 py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-7">
              <div>
                <h2 className="text-xl font-black text-gray-900">Din blog</h2>
                <p className="text-sm text-gray-400 mt-0.5">Sfaturi și ghiduri despre reduceri online</p>
              </div>
              <a href="/blog" className="text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1">
                Toate articolele
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <a key={post.slug} href={`/blog/${post.slug}`}
                  className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">
                  <div className="relative overflow-hidden h-44 bg-gray-100">
                    <Image src={post.cover} alt={post.title} fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 380px" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <span className="text-xs font-bold text-orange-500 uppercase tracking-wide">{post.category}</span>
                    <h3 className="font-black text-gray-900 text-sm mt-1.5 mb-2 line-clamp-2 group-hover:text-orange-500 transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 flex-1">{post.excerpt}</p>
                    <div className="mt-3 text-xs font-bold text-orange-500 flex items-center gap-1">
                      Citește articolul
                      <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* NEWSLETTER — upgraded */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16 px-4 mt-12 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-orange-500/10 blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-1.5 text-orange-400 text-xs font-bold mb-5">
            📬 Newsletter zilnic gratuit
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-white mb-3 leading-tight">
            Nu rata nicio ofertă bună
          </h2>
          <p className="text-gray-400 text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">
            Primești în fiecare dimineață top 5 cele mai bune coduri de reducere. Fără spam, dezabonare cu un click.
          </p>
          {/* Trust signals */}
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500 mb-8">
            {["✓ Gratuit", "✓ Fără spam", "✓ Dezabonare oricând", "✓ 0 reclame"].map(t => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <NewsletterForm />
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-gray-950 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 pt-12 pb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-10">

            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-orange-500 text-white font-black text-sm px-2 py-0.5 rounded-md">Am</div>
                <span className="font-black text-white text-lg">Cupon.ro</span>
              </div>
              <p className="text-sm leading-relaxed mb-5">
                Coduri de reducere verificate de la cele mai mari magazine online din România. Actualizat zilnic, gratuit.
              </p>
              <div className="flex flex-col gap-2 mb-5">
                <div className="flex items-center gap-2 bg-gray-900 rounded-xl px-3 py-2 text-xs">
                  <svg className="w-3.5 h-3.5 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  SSL 256-bit · GDPR Conform
                </div>
              </div>
              <div className="flex items-center gap-3">
                {[
                  { label: "Facebook", path: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
                  { label: "Instagram", path: "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M6.5 19.5h11a3 3 0 003-3v-11a3 3 0 00-3-3h-11a3 3 0 00-3 3v11a3 3 0 003 3z" },
                  { label: "TikTok", path: "M9 12a4 4 0 104 4V4a5 5 0 005 5" },
                ].map((s) => (
                  <a key={s.label} href="#" aria-label={s.label}
                    className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-orange-500 flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={s.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Categorii */}
            <div>
              <h3 className="text-white font-bold text-xs mb-4 uppercase tracking-wider">Categorii</h3>
              <ul className="space-y-2.5 text-sm">
                {[
                  { href: "/categorii/fashion", label: "Fashion" },
                  { href: "/categorii/electronics-itc", label: "Electronice IT&C" },
                  { href: "/categorii/beauty", label: "Frumusețe" },
                  { href: "/categorii/home-garden", label: "Casă & Grădină" },
                  { href: "/categorii/sports-outdoors", label: "Sport" },
                  { href: "/categorii/pharma", label: "Farmacie" },
                  { href: "/categorii", label: "Toate categoriile →" },
                ].map((l) => (
                  <li key={l.href}><a href={l.href} className="hover:text-orange-400 transition-colors">{l.label}</a></li>
                ))}
              </ul>
            </div>

            {/* Cautari populare */}
            <div>
              <h3 className="text-white font-bold text-xs mb-4 uppercase tracking-wider">Căutări populare</h3>
              <ul className="space-y-2.5 text-sm">
                {[
                  { href: "/cod-reducere/answear.ro", label: "Cod reducere Answear" },
                  { href: "/cod-reducere/fashiondays.ro", label: "Cod reducere Fashion Days" },
                  { href: "/cod-reducere/notino.ro", label: "Cod reducere Notino" },
                  { href: "/cod-reducere/emag.ro", label: "Cod reducere eMAG" },
                  { href: "/cod-reducere/farmec.ro", label: "Cod reducere Farmec" },
                  { href: "/cod-reducere/noriel.ro", label: "Cod reducere Noriel" },
                  { href: "/cod-reducere/elefant.ro", label: "Cod reducere Elefant" },
                ].map((l) => (
                  <li key={l.href}><a href={l.href} className="hover:text-orange-400 transition-colors">{l.label}</a></li>
                ))}
              </ul>
            </div>

            {/* Pagini */}
            <div>
              <h3 className="text-white font-bold text-xs mb-4 uppercase tracking-wider">Pagini speciale</h3>
              <ul className="space-y-2.5 text-sm">
                <li><a href="/farmacie" className="hover:text-orange-400 transition-colors">💊 Farmacie Online</a></li>
                <li><a href="/sport" className="hover:text-orange-400 transition-colors">🏃 Sport & Outdoor</a></li>
                <li><a href="/frumusete" className="hover:text-orange-400 transition-colors">💄 Beauty</a></li>
                <li><a href="/calatorie" className="hover:text-orange-400 transition-colors">✈️ Vacanțe & Travel</a></li>
                <li><a href="/copii" className="hover:text-orange-400 transition-colors">👶 Copii & Jucării</a></li>
                <li><a href="/gadgets" className="hover:text-orange-400 transition-colors">📡 Gadgets & Tech</a></li>
                <li><a href="/idei-cadouri" className="hover:text-orange-400 transition-colors">🎁 Idei Cadouri</a></li>
                <li><a href="/produse" className="hover:text-orange-400 transition-colors">🛍️ Produse cu reducere</a></li>
                <li><a href="/blog" className="hover:text-orange-400 transition-colors">📝 Blog</a></li>
                <li><a href="/categorii" className="hover:text-orange-400 transition-colors">Toate categoriile</a></li>
                <li><a href="/toate-magazinele" className="hover:text-orange-400 transition-colors">Toate magazinele</a></li>
                <li><a href="/despre-noi" className="hover:text-orange-400 transition-colors">Despre noi</a></li>
                <li><a href="/termeni" className="hover:text-orange-400 transition-colors">Termeni și Condiții</a></li>
                <li><a href="/confidentialitate" className="hover:text-orange-400 transition-colors">Politică Confidențialitate</a></li>
                <li><a href="mailto:contact@amcupon.ro" className="hover:text-orange-400 transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Linkuri utile */}
            <div>
              <h3 className="text-white font-bold text-xs mb-4 uppercase tracking-wider">Linkuri utile</h3>
              <ul className="space-y-2.5 text-sm">
                {[
                  { href: "https://anpc.ro", label: "ANPC" },
                  { href: "https://ec.europa.eu/consumers/odr", label: "SAL-UE" },
                  { href: "https://eccromania.ro", label: "ECC România" },
                  { href: "https://ancom.ro", label: "ANCOM" },
                  { href: "https://2performant.com", label: "2Performant" },
                ].map((l) => (
                  <li key={l.href}>
                    <a href={l.href} target="_blank" rel="noopener noreferrer"
                      className="hover:text-orange-400 transition-colors flex items-center gap-1">
                      {l.label}
                      <svg className="w-2.5 h-2.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 space-y-3">
            <p className="text-xs text-gray-600 leading-relaxed max-w-4xl">
              Linkurile de pe AmCupon.ro sunt linkuri de afiliat generate prin platforma 2Performant. Când accesezi un magazin partener și efectuezi o achiziție, primim un comision de la magazin — fără niciun cost suplimentar pentru tine. Comisionul nu influențează prețul sau calitatea produselor achiziționate.
            </p>
            <p className="text-xs text-gray-700">
              © {new Date().getFullYear()} AmCupon.ro · Toate drepturile rezervate.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Card({ m, revealed, copiat, onCopiere, isFavorit, onToggleFavorit }: {
  m: Magazin;
  revealed: boolean;
  copiat: boolean;
  onCopiere: (id: string, cod: string) => void;
  isFavorit: boolean;
  onToggleFavorit: (slug: string, e: React.MouseEvent) => void;
}) {
  const promo = m.promotii[0];
  const logoSrc = m.logo_url || "";
  const badgeReducere = m.promotii.length > 0 ? maxDiscount(m.promotii) : null;
  const numeMagazin = numeAfisat(m.magazin);
  const initiala = numeMagazin.charAt(0).toUpperCase();
  const link = promo?.landing_page || m.url_afiliat || m.url;
  const nrCupoane = m.promotii.filter(p => p.cod_cupon).length;
  const nrOferte = m.promotii.length;
  const [imgOk, setImgOk] = useState(true);
  const [rating, setRating] = useState<"ok"|"nok"|null>(() => {
    try { return (localStorage.getItem(`rating_${m.magazin}`) as "ok"|"nok"|null); } catch { return null; }
  });

  function voteaza(v: "ok"|"nok", e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    setRating(v);
    try { localStorage.setItem(`rating_${m.magazin}`, v); } catch {}
  }

  const culori = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500", "bg-red-500", "bg-yellow-500"];
  const culoare = culori[initiala.charCodeAt(0) % culori.length];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden">

      <a href={`/cod-reducere/${m.magazin}`} className="flex flex-col items-center justify-center pt-5 pb-3 px-4 group relative">
        {/* Buton favorit */}
        <button onClick={(e) => onToggleFavorit(m.magazin, e)}
          className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors z-10"
          title={isFavorit ? "Elimină din favorite" : "Adaugă la favorite"}>
          <svg className={`w-4 h-4 transition-colors ${isFavorit ? "fill-red-500 stroke-red-500" : "fill-none stroke-gray-300 hover:stroke-red-400"}`}
            viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        {m.exclusiv && (
          <span className="absolute top-3 left-3 text-xs font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full shadow-sm">
            Exclusiv
          </span>
        )}
        <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center mb-3 bg-white border border-gray-100 p-1 group-hover:border-orange-300 group-hover:shadow-md transition-all duration-200">
          {logoSrc && imgOk ? (
            <img src={logoSrc} alt={numeMagazin} className="w-full h-full object-contain" loading="lazy" decoding="async" onError={() => setImgOk(false)} />
          ) : (
            <div className={`w-full h-full rounded-xl ${culoare} flex items-center justify-center`}>
              <span className="text-white font-black text-3xl">{initiala}</span>
            </div>
          )}
        </div>
        <h3 className="font-black text-gray-900 text-sm text-center group-hover:text-orange-500 transition-colors leading-tight">
          {m.promotii.length > 0 ? (nrCupoane > 0 ? "Cupoane" : "Reduceri") : "Magazine"} {numeMagazin}
        </h3>
        <span className="text-xs text-gray-400 mt-0.5">{m.categorie}</span>
      </a>

      {/* Nr. cupoane / oferte */}
      <div className="px-4 pb-1 text-center min-h-[18px]">
        {nrOferte > 0 && (
          <span className="text-xs text-gray-500">
            {nrCupoane > 0
              ? `${nrCupoane} cupon${nrCupoane > 1 ? "e" : ""}`
              : `${nrOferte} ofert${nrOferte > 1 ? "e" : "ă"}`}
          </span>
        )}
      </div>

      {/* Badge "Până la X% reducere" */}
      <div className="px-4 pb-3 text-center min-h-[28px] flex items-center justify-center">
        {badgeReducere ? (
          <span className="inline-block bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1 rounded-full">
            {badgeReducere}
          </span>
        ) : m.are_promotie ? (
          <span className="inline-block bg-orange-50 text-orange-600 border border-orange-200 text-xs font-bold px-3 py-1 rounded-full">
            Ofertă activă
          </span>
        ) : (
          <span className="inline-block bg-gray-50 text-gray-400 text-xs px-3 py-1 rounded-full">
            Fără promoții acum
          </span>
        )}
      </div>

      <div className="px-4 pb-3 flex-1">
        {promo ? (
          <p className="text-sm text-gray-600 text-center line-clamp-2">{promo.nume}</p>
        ) : (
          <p className="text-sm text-gray-400 text-center italic">Fără promoții active momentan</p>
        )}
      </div>

      <div className="px-4 pb-2 flex flex-wrap justify-center gap-2 min-h-[24px]">
        {/* Timestamp verificare */}
        {m.are_promotie && !promo?.zile_ramase || (promo && promo.zile_ramase > 3) ? (
          <span className="text-xs text-green-600 font-medium">✓ Verificat azi</span>
        ) : null}
        {promo && promo.zile_ramase <= 3 && promo.zile_ramase > 0 && (
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            ⏰ Expiră în {promo.zile_ramase}z
          </span>
        )}
        {promo && promo.zile_ramase === 0 && (
          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full animate-pulse">
            🔴 Expiră azi!
          </span>
        )}
        {m.trend > 0 && <span className="text-xs text-purple-500 font-medium">↑ Trending</span>}
        {m.are_promotie && m.cod_cupon && (
          <span className="text-xs text-green-600 font-semibold">{m.procent_succes}% succes</span>
        )}
        {m.folosit_de > 0 && (
          <span className="text-xs text-gray-400">{m.folosit_de}x folosit</span>
        )}
      </div>

      <div className="px-4 pb-5">
        {promo?.cod_cupon ? (
          revealed ? (
            <div className="space-y-2">
              <div className="border-2 border-dashed border-orange-400 rounded-xl py-2.5 text-center bg-orange-50">
                <span className="font-mono font-black text-orange-600 tracking-widest text-sm">{promo.cod_cupon}</span>
              </div>
              <a href={link} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                {copiat ? "✓ Copiat! Mergi la magazin" : "Mergi la magazin →"}
              </a>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="border-2 border-dashed border-gray-300 rounded-xl py-2.5 text-center bg-gray-50">
                <span className="font-mono text-gray-400 text-sm">{maskCod(promo.cod_cupon)}</span>
              </div>
              <button onClick={() => onCopiere(m.magazin, promo.cod_cupon)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                Copiază codul
              </button>
            </div>
          )
        ) : promo ? (
          <a href={link} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
            Vezi oferta →
          </a>
        ) : (
          <a href={m.url_afiliat || m.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center w-full border border-gray-200 hover:border-orange-300 text-gray-500 hover:text-orange-500 font-medium py-2.5 rounded-xl text-sm transition-colors">
            Vizitează magazinul
          </a>
        )}
      </div>

      {/* RATING — A funcționat codul? */}
      {promo && (
        <div className="px-4 pb-4 border-t border-gray-50 pt-3">
          {rating ? (
            <p className="text-xs text-center font-semibold text-green-600">
              {rating === "ok" ? "✓ Mulțumim pentru feedback!" : "✓ Am notat, verificăm!"}
            </p>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs text-gray-400">A funcționat?</span>
              <button onClick={(e) => voteaza("ok", e)}
                className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-600 hover:bg-green-100 font-semibold transition-colors border border-green-200">
                ✓ Da
              </button>
              <button onClick={(e) => voteaza("nok", e)}
                className="text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-500 hover:bg-red-100 font-semibold transition-colors border border-red-200">
                ✗ Nu
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 animate-pulse overflow-hidden">
      <div className="flex flex-col items-center pt-5 pb-3 px-4">
        <div className="w-20 h-20 rounded-2xl bg-gray-200 mb-3" />
        <div className="h-4 w-28 bg-gray-200 rounded mb-1.5" />
        <div className="h-3 w-16 bg-gray-100 rounded" />
      </div>
      <div className="px-4 pb-3 space-y-2">
        <div className="h-3 w-full bg-gray-100 rounded" />
        <div className="h-3 w-3/4 bg-gray-100 rounded mx-auto" />
      </div>
      <div className="px-4 pb-5">
        <div className="h-10 w-full bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

  async function trimite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) { setStatus("err"); return; }
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) { setStatus("ok"); setEmail(""); }
      else setStatus("err");
    } catch {
      setStatus("err");
    }
  }

  if (status === "ok") {
    return (
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-5 text-white text-center border border-white/30">
        <p className="font-black text-xl mb-1">Mulțumim! 🎉</p>
        <p className="text-sm text-orange-100">Te-ai abonat cu succes. Vei primi ofertele zilei pe email.</p>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={trimite} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="adresa@email.ro"
          disabled={status === "loading"}
          className="flex-1 px-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-60 border-2 border-transparent focus:border-white"
        />
        <button type="submit" disabled={status === "loading"}
          className="bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white font-bold px-7 py-3 rounded-xl text-sm transition-colors whitespace-nowrap">
          {status === "loading" ? "Se trimite..." : "Abonează-te"}
        </button>
      </form>
      {status === "err" && (
        <p className="text-white/80 text-xs mt-2 text-center">Verifică emailul și încearcă din nou.</p>
      )}
    </div>
  );
}
