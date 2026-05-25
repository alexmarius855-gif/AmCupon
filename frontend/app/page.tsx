"use client";

import { useEffect, useState } from "react";

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
  { slug: "fashion", emoji: "👗", label: "Fashion", bg: "bg-pink-50", hover: "hover:bg-pink-100", border: "border-pink-200" },
  { slug: "electronics-itc", emoji: "💻", label: "Electronice", bg: "bg-blue-50", hover: "hover:bg-blue-100", border: "border-blue-200" },
  { slug: "beauty", emoji: "💄", label: "Frumusețe", bg: "bg-rose-50", hover: "hover:bg-rose-100", border: "border-rose-200" },
  { slug: "home-garden", emoji: "🏡", label: "Casă & Grădină", bg: "bg-green-50", hover: "hover:bg-green-100", border: "border-green-200" },
  { slug: "sports-outdoors", emoji: "🏃", label: "Sport", bg: "bg-orange-50", hover: "hover:bg-orange-100", border: "border-orange-200" },
  { slug: "pharma", emoji: "💊", label: "Farmacie", bg: "bg-red-50", hover: "hover:bg-red-100", border: "border-red-200" },
  { slug: "babies-kids-toys", emoji: "👶", label: "Copii", bg: "bg-purple-50", hover: "hover:bg-purple-100", border: "border-purple-200" },
  { slug: "automotive", emoji: "🚗", label: "Auto-Moto", bg: "bg-slate-50", hover: "hover:bg-slate-100", border: "border-slate-200" },
  { slug: "books", emoji: "📚", label: "Cărți", bg: "bg-yellow-50", hover: "hover:bg-yellow-100", border: "border-yellow-200" },
  { slug: "hypermarket-groceries", emoji: "🛒", label: "Hypermarket", bg: "bg-emerald-50", hover: "hover:bg-emerald-100", border: "border-emerald-200" },
  { slug: "gifts-flowers", emoji: "🎁", label: "Cadouri", bg: "bg-fuchsia-50", hover: "hover:bg-fuchsia-100", border: "border-fuchsia-200" },
  { slug: "telecom", emoji: "📱", label: "Telecom", bg: "bg-cyan-50", hover: "hover:bg-cyan-100", border: "border-cyan-200" },
  { slug: "pet-supplies", emoji: "🐾", label: "Animale", bg: "bg-amber-50", hover: "hover:bg-amber-100", border: "border-amber-200" },
  { slug: "health-personal-care", emoji: "🧴", label: "Sănătate", bg: "bg-teal-50", hover: "hover:bg-teal-100", border: "border-teal-200" },
  { slug: "jewelry", emoji: "💎", label: "Bijuterii", bg: "bg-violet-50", hover: "hover:bg-violet-100", border: "border-violet-200" },
  { slug: "games", emoji: "🎮", label: "Jocuri", bg: "bg-indigo-50", hover: "hover:bg-indigo-100", border: "border-indigo-200" },
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

  useEffect(() => {
    fetch("/output.json").then((r) => r.json()).then((data) => { setMagazine(data); setLoading(false); });
    fetch("/blog-posts.json").then((r) => r.json()).then((posts: BlogPost[]) => setBlogPosts(posts.slice(0, 3))).catch(() => {});
  }, []);

  const filtrate = magazine.filter((m) =>
    cautare === "" || m.magazin.toLowerCase().includes(cautare.toLowerCase()) || numeAfisat(m.magazin).toLowerCase().includes(cautare.toLowerCase())
  );

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
            <a href="/blog" className="hover:text-orange-500 transition-colors">Blog</a>
            <div className="relative group">
              <button className="flex items-center gap-1 hover:text-orange-500 transition-colors py-1">
                Categorii
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute right-0 top-full pt-1 hidden group-hover:block z-50">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-xl py-2 w-56">
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

      {/* HERO */}
      <div className="relative bg-gradient-to-br from-orange-500 via-orange-500 to-red-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl transform translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white blur-3xl transform -translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-14 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs font-bold mb-6 border border-white/30">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
            Actualizat zilnic · Coduri verificate
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
            Coduri de reducere verificate<br className="hidden md:block" /> din România
          </h1>
          <p className="text-orange-100 text-base md:text-lg mb-10 max-w-xl mx-auto">
            Economisește la cele mai mari magazine online. Sute de oferte actualizate zilnic, gratuit.
          </p>

          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {[
              { value: magazine.length > 0 ? magazine.length.toString() : "610+", label: "magazine partenere" },
              { value: cuPromotii.length > 0 ? cuPromotii.length.toString() : "...", label: "promoții active" },
              { value: "100%", label: "gratuit pentru tine" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-black tabular-nums">{s.value}</div>
                <div className="text-orange-200 text-xs font-medium mt-1 uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CATEGORY GRID */}
      <div className="bg-white border-b border-gray-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black text-gray-900">Caută după categorie</h2>
            <a href="/categorii" className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">
              Vezi toate →
            </a>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 md:gap-3">
            {CATEGORII.map((c) => (
              <a key={c.slug} href={`/categorii/${c.slug}`}
                className={`relative flex flex-col items-center gap-1.5 p-2.5 md:p-3 rounded-2xl border ${c.bg} ${c.hover} ${c.border} transition-all duration-200 group`}>
                <span className="text-2xl md:text-3xl group-hover:scale-110 transition-transform duration-200">{c.emoji}</span>
                <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{c.label}</span>
                {promoPerCateg[c.slug] > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                    {promoPerCateg[c.slug] > 9 ? "9+" : promoPerCateg[c.slug]}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

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
                <Card key={m.magazin + "_azi"} m={m} revealed={coduriReveal.has(m.magazin)} copiat={copiat === m.magazin} onCopiere={copiazaCod} />
              ))}
            </div>
          </section>
        )}

        {/* PROMOTII ACTIVE */}
        {!loading && cuPromotii.length > 0 && (
          <section id="promotii" className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">LIVE</span>
              <h2 className="text-xl font-black text-gray-900">Promoții Active</h2>
              <span className="text-sm text-gray-400">{cuPromotii.length} oferte</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cuPromotii.slice(0, 12).map((m) => (
                <Card key={m.magazin} m={m} revealed={coduriReveal.has(m.magazin)} copiat={copiat === m.magazin} onCopiere={copiazaCod} />
              ))}
            </div>
          </section>
        )}

        {/* MAGAZINE PARTENERE */}
        {!loading && faraPromotii.length > 0 && (
          <section id="magazine">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-xl font-black text-gray-900">Magazine Partenere</h2>
              <span className="text-sm text-gray-400">{magazine.length} total</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {faraPromotii.slice(0, storeLimit).map((m) => (
                <Card key={m.magazin} m={m} revealed={coduriReveal.has(m.magazin)} copiat={copiat === m.magazin} onCopiere={copiazaCod} />
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
                  <div className="overflow-hidden h-44 bg-gray-100">
                    <img src={post.cover} alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
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

      {/* NEWSLETTER */}
      <div className="relative bg-gradient-to-r from-orange-500 to-red-500 py-14 px-4 mt-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative max-w-2xl mx-auto text-center">
          <div className="text-5xl mb-4">🎁</div>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-2">Primește ofertele zilei pe email</h2>
          <p className="text-orange-100 text-sm mb-8 max-w-md mx-auto">
            Fii primul care află codurile exclusive. Fără spam, dezabonare oricând cu un click.
          </p>
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
              <h3 className="text-white font-bold text-xs mb-4 uppercase tracking-wider">Pagini</h3>
              <ul className="space-y-2.5 text-sm">
                <li><a href="/blog" className="hover:text-orange-400 transition-colors">Blog</a></li>
                <li><a href="/despre-noi" className="hover:text-orange-400 transition-colors">Despre noi</a></li>
                <li><a href="/categorii" className="hover:text-orange-400 transition-colors">Toate categoriile</a></li>
                <li><a href="/termeni" className="hover:text-orange-400 transition-colors">Termeni și Condiții</a></li>
                <li><a href="/termeni#gdpr" className="hover:text-orange-400 transition-colors">GDPR & Confidențialitate</a></li>
                <li><a href="/termeni#cookies" className="hover:text-orange-400 transition-colors">Politica Cookies</a></li>
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

function Card({ m, revealed, copiat, onCopiere }: {
  m: Magazin;
  revealed: boolean;
  copiat: boolean;
  onCopiere: (id: string, cod: string) => void;
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

  const culori = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500", "bg-red-500", "bg-yellow-500"];
  const culoare = culori[initiala.charCodeAt(0) % culori.length];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden">

      <a href={`/cod-reducere/${m.magazin}`} className="flex flex-col items-center justify-center pt-5 pb-3 px-4 group relative">
        {m.exclusiv && (
          <span className="absolute top-3 left-3 text-xs font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full shadow-sm">
            Exclusiv
          </span>
        )}
        <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center mb-3 bg-white border border-gray-100 p-1 group-hover:border-orange-300 group-hover:shadow-md transition-all duration-200">
          {logoSrc && imgOk ? (
            <img src={logoSrc} alt={numeMagazin} className="w-full h-full object-contain" onError={() => setImgOk(false)} />
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
        {promo && promo.zile_ramase <= 3 && (
          <span className="text-xs font-semibold text-red-500">
            Expiră {promo.zile_ramase === 0 ? "azi" : `în ${promo.zile_ramase}z`}
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
