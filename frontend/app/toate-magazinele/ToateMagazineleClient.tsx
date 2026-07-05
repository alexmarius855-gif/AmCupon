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
  "from-[#c9a63e] to-[#b8912e]",
  "from-emerald-500 to-[#c9a63e]",
  "from-[#c9a63e] to-[#c9a63e]",
  "from-[#c9a63e] to-[#c9a63e]",
  "from-[#c9a63e] to-[#c9a63e]",
  "from-[#c9a63e] to-[#b8912e]",
  "from-red-500 to-[#c9a63e]",
  "from-[#d8c091] to-[#c9a63e]",
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
    <div className="min-h-screen bg-[#0b0a07]">

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#15120c] via-[#15120c] to-[#26211a] py-12 px-4 border-b border-[#26211a]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-[#d8c091] uppercase tracking-widest mb-3">DIRECTORUL REDUCERILOR</p>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
            Toate magazinele cu reduceri
          </h1>
          <p className="text-[#a89a78] text-sm mb-1">
            <span className="text-white font-bold">{magazine.length} magazine partenere</span>
            {" · "}
            <span className="text-emerald-400 font-bold">{cuPromotii} cu promoții active</span>
            {" · "}
            <span className="text-[#d8c091] font-bold">{cuCod} cu cod cupon</span>
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto mt-6">
            <svg className="absolute left-4 top-3.5 w-5 h-5 text-[#a89a78]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cauta magazin (ex: Zara, eMAG, Notino...)"
              value={cautare}
              onChange={e => setCautare(e.target.value)}
              className="w-full bg-[#26211a] text-white rounded-2xl pl-12 pr-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-[#c9a63e]/50 border border-[#37301f] focus:border-[#c9a63e]/50 placeholder-[#8c8064] transition-all"
            />
            {cautare && (
              <button onClick={() => setCautare("")}
                className="absolute right-4 top-3.5 text-[#a89a78] hover:text-white transition-colors">
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
                  ? "bg-[#b8912e] text-white shadow-lg shadow-[#c9a63e]/25"
                  : "bg-[#26211a] border border-[#37301f] text-[#c8bda2] hover:border-[#c9a63e]/50 hover:text-white"
              }`}>
              {f === "toate" ? "Toate" : f === "cod" ? "🎟 Cod cupon" : "⚡ Promoții active"}
            </button>
          ))}

          <select
            value={sortare}
            onChange={e => setSortare(e.target.value as "az" | "reducere" | "rank")}
            className="ml-auto bg-[#26211a] border border-[#37301f] text-[#c8bda2] text-sm font-semibold rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#c9a63e]/40 cursor-pointer hover:border-[#8c8064] transition-colors">
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
                  ? "bg-[#efe7d6] text-[#15120c]"
                  : "bg-[#26211a]/60 border border-[#37301f] text-[#a89a78] hover:border-[#8c8064] hover:text-[#dcd0b8]"
              }`}>
              {cat.label}
            </button>
          ))}
        </div>

        {/* ── REZULTAT COUNT ──────────────────────────────────────────── */}
        <p className="text-sm text-[#8c8064] mb-5">
          {filtrate.length} magazine{" "}
          {cautare ? <span>pentru <span className="text-white font-semibold">"{cautare}"</span></span> : ""}
          {categorie !== "Toate" ? <span className="text-[#d8c091]"> · {CATEGORII_FILTRE.find(c => c.key === categorie)?.label}</span> : ""}
        </p>

        {/* ── GRID MAGAZINE ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
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
                className="group relative bg-gradient-to-b from-[#15120c] to-[#15120c]/60 rounded-2xl border border-[#26211a]/80 hover:border-[#c9a63e]/50 p-4 flex flex-col items-center gap-3 hover:-translate-y-1 transition-all duration-200"
                style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }}
              >
                {/* Logo */}
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center bg-white shrink-0 p-2 group-hover:ring-2 group-hover:ring-[#d8c091]/40 transition-all">
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
                    <div className={`w-full h-full rounded-xl bg-gradient-to-br ${culoare} flex items-center justify-center`}>
                      <span className="text-white font-black text-xl">{initiala}</span>
                    </div>
                  )}
                  {/* Indicator activ, atasat de logo nu plutind pe card */}
                  {m.are_promotie && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-[#15120c]" />
                  )}
                </div>

                {/* Nume */}
                <span className="text-xs font-bold text-[#dcd0b8] text-center group-hover:text-white transition-colors leading-tight line-clamp-2 min-h-[2rem] flex items-center">
                  {nume}
                </span>

                {/* Badge status — omis complet daca nu e nimic de spus, fara placeholder gol */}
                {pct > 0 ? (
                  <span className="text-[10px] font-black text-white bg-[#b8912e] px-2.5 py-1 rounded-full">
                    -{pct}%
                  </span>
                ) : m.cod_cupon ? (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    Cod cupon
                  </span>
                ) : m.are_promotie ? (
                  <span className="text-[10px] font-semibold text-[#e3d1a6] bg-[#c9a63e]/10 border border-[#c9a63e]/20 px-2.5 py-1 rounded-full">
                    Ofertă
                  </span>
                ) : null}
              </a>
            );
          })}
        </div>

        {/* EMPTY STATE */}
        {filtrate.length === 0 && (
          <div className="text-center py-24 text-[#8c8064]">
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-bold text-lg text-[#c8bda2]">Niciun magazin gasit</p>
            <p className="text-sm mt-1">Incearca alt termen de cautare sau sterge filtrele</p>
            <button onClick={() => { setCautare(""); setCategorie("Toate"); setFiltru("toate"); }}
              className="mt-4 text-[#d8c091] hover:text-[#e3d1a6] text-sm font-bold transition-colors">
              Reseteaza filtrele
            </button>
          </div>
        )}

        {/* FOOTER NAV */}
        <div className="mt-12 pt-6 border-t border-[#26211a] flex items-center justify-between flex-wrap gap-3">
          <Link href="/" className="text-sm text-[#8c8064] hover:text-[#d8c091] transition-colors">
            &larr; Inapoi la homepage
          </Link>
          <Link href="/categorii" className="text-sm text-[#8c8064] hover:text-[#d8c091] transition-colors">
            Exploreaza categorii &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
