"use client";

import Link from "next/link";

import { useState, useMemo, useEffect } from "react";

interface Magazin {
  magazin: string;
  url: string;
  url_afiliat: string;
  logo_url?: string;
  categorie: string;
  categorie_slug?: string;
  are_promotie: boolean;
  cod_cupon: boolean;
  promotii: { nume: string; descriere: string }[];
  procent_succes: number;
  rank?: number;
  scor_final?: number;
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
  { key: "Toate", label: "Toate" },
  { key: "Fashion", label: "Fashion" },
  { key: "Beauty", label: "Frumusete" },
  { key: "Electronics IT&C", label: "Electronice" },
  { key: "Home & Garden", label: "Casa & Gradina" },
  { key: "Sports & outdoors", label: "Sport" },
  { key: "Pharma", label: "Farmacie" },
  { key: "Babies Kids & Toys", label: "Copii" },
  { key: "Automotive", label: "Auto-Moto" },
  { key: "Books", label: "Carti" },
  { key: "Online Mall", label: "Online Mall" },
  { key: "Health & Personal care", label: "Sanatate" },
  { key: "Pet supplies", label: "Animale" },
];

const CULORI_BG = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-purple-500 to-violet-600",
  "from-pink-500 to-rose-600",
  "from-orange-500 to-amber-600",
  "from-teal-500 to-cyan-600",
  "from-red-500 to-pink-600",
  "from-yellow-500 to-orange-500",
];

export default function ToateMagazineleClient({ magazine }: { magazine: Magazin[] }) {
  const [cautare, setCautare]     = useState("");
  const [categorie, setCategorie] = useState("Toate");

  // Citeste ?q= din URL la mount (permite link direct cu search pre-completat)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) setCautare(decodeURIComponent(q));
  }, []);
  const [filtru, setFiltru]       = useState<"toate" | "cod" | "promotie">("toate");
  const [sortare, setSortare]     = useState<"az" | "reducere" | "rank">("rank");
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  const filtrate = useMemo(() => {
    let result = [...magazine];
    if (cautare) {
      const q = cautare.toLowerCase();
      result = result.filter(m =>
        m.magazin.toLowerCase().includes(q) || numeAfisat(m.magazin).toLowerCase().includes(q)
      );
    }
    if (categorie !== "Toate") result = result.filter(m => m.categorie === categorie);
    if (filtru === "cod")      result = result.filter(m => m.cod_cupon);
    if (filtru === "promotie") result = result.filter(m => m.are_promotie);
    result.sort((a, b) => {
      if (sortare === "az")       return numeAfisat(a.magazin).localeCompare(numeAfisat(b.magazin), "ro");
      if (sortare === "reducere") return maxPct(b.promotii) - maxPct(a.promotii);
      return (a.rank || 999) - (b.rank || 999);
    });
    return result;
  }, [magazine, cautare, categorie, filtru, sortare]);

  const cuPromotii = magazine.filter(m => m.are_promotie).length;
  const cuCod      = magazine.filter(m => m.cod_cupon).length;

  return (
    <div className="min-h-screen bg-slate-950">

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 py-12 px-4 border-b border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-3">DIRECTORUL REDUCERILOR</p>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
            Toate magazinele cu reduceri
          </h1>
          <p className="text-slate-400 text-sm mb-1">
            <span className="text-white font-bold">{magazine.length} magazine partenere</span>
            {" · "}
            <span className="text-emerald-400 font-bold">{cuPromotii} cu promoții active</span>
            {" · "}
            <span className="text-orange-400 font-bold">{cuCod} cu cod cupon</span>
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto mt-6">
            <svg className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cauta magazin (ex: Zara, eMAG, Notino...)"
              value={cautare}
              onChange={e => setCautare(e.target.value)}
              className="w-full bg-slate-800 text-white rounded-2xl pl-12 pr-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-orange-500/50 border border-slate-700 focus:border-orange-500/50 placeholder-slate-500 transition-all"
            />
            {cautare && (
              <button onClick={() => setCautare("")}
                className="absolute right-4 top-3.5 text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ── FILTRE TIP ──────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-5 items-center">
          {(["toate", "cod", "promotie"] as const).map(f => (
            <button key={f} onClick={() => setFiltru(f)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                filtru === f
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                  : "bg-slate-800 border border-slate-700 text-slate-300 hover:border-orange-500/50 hover:text-white"
              }`}>
              {f === "toate" ? "Toate" : f === "cod" ? "🎟 Cod cupon" : "⚡ Promoții active"}
            </button>
          ))}

          <select
            value={sortare}
            onChange={e => setSortare(e.target.value as "az" | "reducere" | "rank")}
            className="ml-auto bg-slate-800 border border-slate-700 text-slate-300 text-sm font-semibold rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/40 cursor-pointer hover:border-slate-500 transition-colors">
            <option value="rank">Popularitate</option>
            <option value="reducere">Reducere maximă</option>
            <option value="az">A – Z</option>
          </select>
        </div>

        {/* ── FILTRE CATEGORII ────────────────────────────────────────── */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORII_FILTRE.map(cat => (
            <button key={cat.key} onClick={() => setCategorie(cat.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                categorie === cat.key
                  ? "bg-slate-100 text-slate-900"
                  : "bg-slate-800/60 border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
              }`}>
              {cat.label}
            </button>
          ))}
        </div>

        {/* ── REZULTAT COUNT ──────────────────────────────────────────── */}
        <p className="text-sm text-slate-500 mb-5">
          {filtrate.length} magazine{" "}
          {cautare ? <span>pentru <span className="text-white font-semibold">"{cautare}"</span></span> : ""}
          {categorie !== "Toate" ? <span className="text-orange-400"> · {CATEGORII_FILTRE.find(c => c.key === categorie)?.label}</span> : ""}
        </p>

        {/* ── GRID MAGAZINE ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtrate.map(m => {
            const nume     = numeAfisat(m.magazin);
            const initiala = nume.charAt(0);
            const culoare  = CULORI_BG[initiala.charCodeAt(0) % CULORI_BG.length];
            const pct      = maxPct(m.promotii);
            const logoOk   = !imgErrors.has(m.magazin);

            return (
              <a
                key={m.magazin}
                href={`/cod-reducere/${m.magazin}`}
                className="group relative bg-slate-900 rounded-2xl border border-slate-800 hover:border-orange-500/40 p-4 flex flex-col items-center gap-2.5 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
              >
                {/* Subtle glow la hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-transparent transition-all duration-300 pointer-events-none rounded-2xl" />

                {/* Badge promotie (colt dreapta-sus) */}
                {m.are_promotie && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}

                {/* Logo */}
                <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center bg-white border border-slate-700/50 p-1 shrink-0 group-hover:border-orange-400/40 transition-colors">
                  {m.logo_url && logoOk ? (
                    <img
                      src={m.logo_url}
                      alt={nume}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      decoding="async"
                      onError={() => setImgErrors(prev => new Set(prev).add(m.magazin))}
                    />
                  ) : (
                    <div className={`w-full h-full rounded-lg bg-gradient-to-br ${culoare} flex items-center justify-center`}>
                      <span className="text-white font-black text-xl">{initiala}</span>
                    </div>
                  )}
                </div>

                {/* Nume */}
                <span className="text-xs font-bold text-slate-200 text-center group-hover:text-white transition-colors leading-tight">
                  {nume}
                </span>

                {/* Badge status */}
                {pct > 0 ? (
                  <span className="text-[10px] font-black text-white bg-orange-500 px-2 py-0.5 rounded-full">
                    -{pct}%
                  </span>
                ) : m.cod_cupon ? (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    Cod cupon
                  </span>
                ) : m.are_promotie ? (
                  <span className="text-[10px] font-semibold text-orange-300 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
                    Ofertă
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-600 px-2 py-0.5">—</span>
                )}
              </a>
            );
          })}
        </div>

        {/* EMPTY STATE */}
        {filtrate.length === 0 && (
          <div className="text-center py-24 text-slate-500">
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-bold text-lg text-slate-300">Niciun magazin gasit</p>
            <p className="text-sm mt-1">Incearca alt termen de cautare sau sterge filtrele</p>
            <button onClick={() => { setCautare(""); setCategorie("Toate"); setFiltru("toate"); }}
              className="mt-4 text-orange-400 hover:text-orange-300 text-sm font-bold transition-colors">
              Reseteaza filtrele
            </button>
          </div>
        )}

        {/* FOOTER NAV */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <Link href="/" className="text-sm text-slate-500 hover:text-orange-400 transition-colors">
            &larr; Inapoi la homepage
          </Link>
          <Link href="/categorii" className="text-sm text-slate-500 hover:text-orange-400 transition-colors">
            Exploreaza categorii &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
