"use client";

import { useState, useMemo } from "react";

export interface Produs {
  title: string;
  url: string;
  image: string;
  price: number;
  old_price?: number;
  discount_pct: number;
  category: string;
  brand: string;
  merchant: string;
  merchant_slug: string;
}

type Sort = "discount" | "pret_asc" | "pret_desc" | "nou";

const DISCOUNT_FILTERS = [
  { label: "Toate", min: 0 },
  { label: "≥10%", min: 10 },
  { label: "≥25%", min: 25 },
  { label: "≥50%", min: 50 },
];

function numeAfisat(s: string) {
  return s.split(".")[0].replace(/-/g, " ").split(" ").map(w => w[0]?.toUpperCase() + w.slice(1)).join(" ");
}

function ProdusCard({ p }: { p: Produs }) {
  const [imgOk, setImgOk] = useState(true);
  const hasDiscount = p.discount_pct > 0 && p.old_price;
  return (
    <a href={p.url} target="_blank" rel="sponsored noopener noreferrer"
      className="group bg-white border border-gray-200 hover:border-orange-300 rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 duration-200 flex flex-col">
      <div className="relative bg-gray-50 overflow-hidden" style={{ aspectRatio: "1" }}>
        {p.image && imgOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image} alt={p.title} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgOk(false)} loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">🛍️</div>
        )}
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full shadow">
            -{p.discount_pct}%
          </span>
        )}
        {p.merchant_slug && (
          <span className="absolute bottom-2 right-2 bg-white/90 text-gray-600 text-xs px-1.5 py-0.5 rounded-lg border border-gray-100 font-medium">
            {numeAfisat(p.merchant_slug || p.merchant)}
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs text-gray-400 mb-0.5 line-clamp-1">{p.brand || p.category}</p>
        <p className="text-sm font-semibold text-gray-900 line-clamp-2 flex-1 group-hover:text-orange-600 transition-colors leading-snug">
          {p.title}
        </p>
        <div className="flex items-baseline gap-2 mt-2 flex-wrap">
          <span className="font-black text-orange-600 text-base">
            {p.price > 0 ? `${p.price.toFixed(2)} lei` : "Vezi prețul"}
          </span>
          {hasDiscount && p.old_price && (
            <span className="text-xs text-gray-400 line-through">{p.old_price.toFixed(2)} lei</span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-1 text-xs font-bold text-orange-500 group-hover:text-orange-600">
          Cumpără acum
          <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </a>
  );
}

export default function ProduseClient({
  products,
  updated,
  an,
}: {
  products: Produs[];
  updated: string;
  an: number;
}) {
  const [search, setSearch] = useState("");
  const [categorie, setCategorie] = useState("");
  const [magazin, setMagazin] = useState("");
  const [minDiscount, setMinDiscount] = useState(0);
  const [sort, setSort] = useState<Sort>("discount");
  const [limit, setLimit] = useState(48);

  const categorii = useMemo(() => {
    const s = new Set(products.map(p => p.category).filter(Boolean));
    return [...s].sort();
  }, [products]);

  const magazine = useMemo(() => {
    const s = new Set(products.map(p => p.merchant_slug || p.merchant).filter(Boolean));
    return [...s].sort();
  }, [products]);

  const filtrate = useMemo(() => {
    let list = [...products];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.brand || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q)
      );
    }
    if (categorie) list = list.filter(p => p.category === categorie);
    if (magazin) list = list.filter(p => (p.merchant_slug || p.merchant) === magazin);
    if (minDiscount > 0) list = list.filter(p => p.discount_pct >= minDiscount);
    switch (sort) {
      case "discount": list.sort((a, b) => b.discount_pct - a.discount_pct); break;
      case "pret_asc": list.sort((a, b) => (a.price || 9999) - (b.price || 9999)); break;
      case "pret_desc": list.sort((a, b) => (b.price || 0) - (a.price || 0)); break;
      case "nou": break; // ordinea originala
    }
    return list;
  }, [products, search, categorie, magazin, minDiscount, sort]);

  const cuDiscount = products.filter(p => p.discount_pct > 0).length;
  const bestDiscount = products.reduce((mx, p) => Math.max(mx, p.discount_pct), 0);

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
          <div className="flex-1 relative max-w-lg">
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Caută produs, brand..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
        </div>
      </header>

      {/* BREADCRUMB */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-gray-400">
          <a href="/" className="hover:text-orange-500">Acasă</a>
          <span className="mx-1">/</span>
          <span className="text-gray-700 font-medium">Produse cu Reducere</span>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white py-10 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-4xl mb-3">🛍️</div>
          <h1 className="text-3xl md:text-4xl font-black mb-2">Produse cu Reducere {an}</h1>
          <p className="text-orange-100 text-base mb-5 max-w-xl mx-auto">
            {products.length > 0
              ? `${products.length.toLocaleString()} produse din magazine partenere — reduceri până la ${bestDiscount}%`
              : "Produse cu discount din cele mai mari magazine din România"}
          </p>
          {products.length > 0 && (
            <div className="flex flex-wrap justify-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-black">{products.length.toLocaleString()}</div>
                <div className="text-orange-200 text-xs uppercase tracking-wide">produse totale</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black">{cuDiscount.toLocaleString()}</div>
                <div className="text-orange-200 text-xs uppercase tracking-wide">cu discount</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black">până la {bestDiscount}%</div>
                <div className="text-orange-200 text-xs uppercase tracking-wide">reducere maximă</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black">{magazine.length}</div>
                <div className="text-orange-200 text-xs uppercase tracking-wide">magazine</div>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {products.length === 0 ? (
          /* ── EMPTY STATE ── */
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <div className="text-5xl mb-4">⏳</div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Produsele se încarcă în curând</h2>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
              Feed-urile de produse se generează automat zilnic din parteneriatele 2Performant.
              Revino mâine sau caută coduri de reducere direct pe homepage.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="/" className="bg-orange-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors text-sm">
                Coduri de reducere →
              </a>
              <a href="/toate-magazinele" className="border border-gray-200 text-gray-600 font-semibold px-6 py-3 rounded-xl hover:border-orange-300 transition-colors text-sm">
                Toate magazinele
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* ── FILTRE ── */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-3 items-end">
              {/* Categorie */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Categorie</label>
                <select value={categorie} onChange={e => setCategorie(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 min-w-[160px]">
                  <option value="">Toate categoriile</option>
                  {categorii.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Magazin */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Magazin</label>
                <select value={magazin} onChange={e => setMagazin(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 min-w-[160px]">
                  <option value="">Toate magazinele</option>
                  {magazine.map(m => <option key={m} value={m}>{numeAfisat(m)}</option>)}
                </select>
              </div>

              {/* Discount minim */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reducere minimă</label>
                <div className="flex gap-1">
                  {DISCOUNT_FILTERS.map(f => (
                    <button key={f.min} onClick={() => setMinDiscount(f.min)}
                      className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${minDiscount === f.min ? "bg-orange-500 text-white" : "border border-gray-200 text-gray-600 hover:border-orange-300"}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="flex flex-col gap-1 ml-auto">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sortare</label>
                <select value={sort} onChange={e => setSort(e.target.value as Sort)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                  <option value="discount">Discount maxim</option>
                  <option value="pret_asc">Preț crescător</option>
                  <option value="pret_desc">Preț descrescător</option>
                  <option value="nou">Cele mai noi</option>
                </select>
              </div>

              {/* Reset */}
              {(categorie || magazin || minDiscount > 0 || search) && (
                <button onClick={() => { setCategorie(""); setMagazin(""); setMinDiscount(0); setSearch(""); }}
                  className="text-sm text-orange-500 font-semibold hover:text-orange-600 border border-orange-200 px-3 py-2 rounded-xl">
                  Resetează filtrele
                </button>
              )}
            </div>

            {/* ── REZULTATE ── */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                <span className="font-bold text-gray-900">{filtrate.length.toLocaleString()}</span> produse găsite
                {updated && <span className="ml-2 text-gray-400">· actualizat {new Date(updated).toLocaleDateString("ro-RO")}</span>}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filtrate.slice(0, limit).map((p, i) => (
                <ProdusCard key={i} p={p} />
              ))}
            </div>

            {filtrate.length > limit && (
              <div className="text-center mt-8">
                <button onClick={() => setLimit(l => l + 48)}
                  className="bg-white border-2 border-gray-200 hover:border-orange-400 text-gray-600 hover:text-orange-500 font-bold px-8 py-3 rounded-2xl text-sm transition-all hover:shadow-md">
                  Încarcă mai multe ({filtrate.length - limit} rămase)
                </button>
              </div>
            )}

            {filtrate.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <p className="text-2xl mb-3">🔍</p>
                <p className="text-gray-600 font-semibold mb-2">Niciun produs găsit</p>
                <button onClick={() => { setCategorie(""); setMagazin(""); setMinDiscount(0); setSearch(""); }}
                  className="text-orange-500 font-semibold text-sm hover:text-orange-600">
                  Resetează filtrele →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400 mt-4">
        © {an} AmCupon.ro ·{" "}
        <a href="/" className="hover:text-orange-500">Acasă</a>{" · "}
        <a href="/toate-magazinele" className="hover:text-orange-500">Magazine</a>{" · "}
        <a href="/blog" className="hover:text-orange-500">Blog</a>
      </footer>
    </div>
  );
}
