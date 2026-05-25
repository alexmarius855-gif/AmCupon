"use client";

import { useState, useMemo } from "react";

interface Magazin {
  magazin: string;
  url: string;
  url_afiliat: string;
  logo_url?: string;
  categorie: string;
  are_promotie: boolean;
  cod_cupon: boolean;
  promotii: { nume: string; descriere: string }[];
  procent_succes: number;
  rank?: number;
}

function numeAfisat(magazin: string): string {
  return magazin.split(".")[0].replace(/-/g, " ")
    .split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function maxPct(promotii: { nume: string; descriere: string }[]): number {
  let max = 0;
  for (const p of promotii) {
    for (const t of [p.nume, p.descriere || ""]) {
      const matches = t.match(/(\d+)\s*%/g) || [];
      for (const m of matches) {
        const v = parseInt(m);
        if (v > max && v <= 90) max = v;
      }
    }
  }
  return max;
}

const CATEGORII_FILTRE = [
  "Toate", "Fashion", "Home & Garden", "Beauty", "Electronics IT&C",
  "Health & Personal care", "Babies Kids & Toys", "Books", "Sports & outdoors",
  "Pharma", "Automotive", "Online Mall", "Pet supplies",
];

export default function ToateMagazineleClient({ magazine }: { magazine: Magazin[] }) {
  const [cautare, setCautare] = useState("");
  const [categorie, setCategorie] = useState("Toate");
  const [filtru, setFiltru] = useState<"toate" | "cod" | "promotie">("toate");
  const [sortare, setSortare] = useState<"az" | "reducere" | "rank">("rank");
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  const culori = ["bg-blue-500","bg-green-500","bg-purple-500","bg-pink-500","bg-indigo-500","bg-teal-500","bg-red-500","bg-yellow-500"];

  const filtrate = useMemo(() => {
    let result = [...magazine];
    if (cautare) {
      const q = cautare.toLowerCase();
      result = result.filter(m =>
        m.magazin.toLowerCase().includes(q) || numeAfisat(m.magazin).toLowerCase().includes(q)
      );
    }
    if (categorie !== "Toate") {
      result = result.filter(m => m.categorie === categorie);
    }
    if (filtru === "cod") result = result.filter(m => m.cod_cupon);
    if (filtru === "promotie") result = result.filter(m => m.are_promotie);

    result.sort((a, b) => {
      if (sortare === "az") return numeAfisat(a.magazin).localeCompare(numeAfisat(b.magazin), "ro");
      if (sortare === "reducere") return maxPct(b.promotii) - maxPct(a.promotii);
      return (a.rank || 999) - (b.rank || 999);
    });
    return result;
  }, [magazine, cautare, categorie, filtru, sortare]);

  const cuPromotii = magazine.filter(m => m.are_promotie).length;
  const cuCod = magazine.filter(m => m.cod_cupon).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <a href="/" className="flex items-center gap-1.5 shrink-0">
            <div className="bg-orange-500 text-white font-black text-base px-2 py-1 rounded-lg">Am</div>
            <span className="font-black text-gray-900 text-xl">Cupon</span>
            <span className="text-orange-500 font-black text-xl">.ro</span>
          </a>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-semibold text-gray-700">Toate magazinele</span>
        </div>
      </header>

      {/* HERO */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-black mb-2">Toate magazinele cu reduceri</h1>
          <p className="text-orange-100 mb-5">
            <strong className="text-white">{magazine.length} magazine partenere</strong> ·{" "}
            {cuPromotii} cu promoții active · {cuCod} cu cod cupon
          </p>
          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <svg className="absolute left-4 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text" placeholder="Caută magazin..."
              value={cautare} onChange={e => setCautare(e.target.value)}
              className="w-full bg-white text-gray-900 rounded-2xl pl-12 pr-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-300 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* FILTRE */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          {/* Tip */}
          <div className="flex gap-2">
            {(["toate", "cod", "promotie"] as const).map(f => (
              <button key={f} onClick={() => setFiltru(f)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${filtru === f ? "bg-orange-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-orange-300"}`}>
                {f === "toate" ? "Toate" : f === "cod" ? "🎟 Doar cod cupon" : "⚡ Promoții active"}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select value={sortare} onChange={e => setSortare(e.target.value as "az" | "reducere" | "rank")}
            className="ml-auto px-4 py-2 rounded-full text-sm font-semibold bg-white border border-gray-200 text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-300 cursor-pointer">
            <option value="rank">Sortare: Popularitate</option>
            <option value="reducere">Sortare: Reducere maximă</option>
            <option value="az">Sortare: A–Z</option>
          </select>
        </div>

        {/* CATEGORII */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORII_FILTRE.map(cat => (
            <button key={cat} onClick={() => setCategorie(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${categorie === cat ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* REZULTAT */}
        <p className="text-sm text-gray-500 mb-5">{filtrate.length} magazine găsite</p>

        {/* GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtrate.map(m => {
            const nume = numeAfisat(m.magazin);
            const initiala = nume.charAt(0);
            const culoare = culori[initiala.charCodeAt(0) % culori.length];
            const pct = maxPct(m.promotii);
            const logoOk = !imgErrors.has(m.magazin);

            return (
              <a key={m.magazin} href={`/cod-reducere/${m.magazin}`}
                className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col items-center gap-2 hover:shadow-md hover:border-orange-300 transition-all group">
                {/* Logo */}
                <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center bg-gray-50 border border-gray-100 p-0.5">
                  {m.logo_url && logoOk ? (
                    <img src={m.logo_url} alt={nume} className="w-full h-full object-contain"
                      loading="lazy" decoding="async"
                      onError={() => setImgErrors(prev => new Set(prev).add(m.magazin))} />
                  ) : (
                    <div className={`w-full h-full rounded-lg ${culoare} flex items-center justify-center`}>
                      <span className="text-white font-black text-xl">{initiala}</span>
                    </div>
                  )}
                </div>
                {/* Nume */}
                <span className="text-xs font-bold text-gray-900 text-center group-hover:text-orange-500 transition-colors leading-tight">
                  {nume}
                </span>
                {/* Badge */}
                {pct > 0 ? (
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    -{pct}%
                  </span>
                ) : m.are_promotie ? (
                  <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                    Ofertă
                  </span>
                ) : (
                  <span className="text-xs text-gray-300 px-2 py-0.5">—</span>
                )}
              </a>
            );
          })}
        </div>

        {filtrate.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-semibold text-lg">Niciun magazin găsit</p>
            <p className="text-sm mt-1">Încearcă un alt termen de căutare</p>
          </div>
        )}

        <div className="mt-12 pt-6 border-t border-gray-100 text-center">
          <a href="/" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
            ← Înapoi la homepage
          </a>
        </div>
      </div>
    </div>
  );
}
