"use client";

import Link from "next/link";

import { useState, useMemo, useEffect } from "react";
import { numeAfisat } from "@/lib/numeMagazin";

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
  rank?: number;
  scor_final?: number;
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
  "from-[#ddf93c] to-[#ddf93c]",
  "from-emerald-500 to-[#ddf93c]",
  "from-[#ddf93c] to-[#ddf93c]",
  "from-[#ddf93c] to-[#ddf93c]",
  "from-[#ddf93c] to-[#ddf93c]",
  "from-[#ddf93c] to-[#ddf93c]",
  "from-red-500 to-[#ddf93c]",
  "from-[#ddf93c] to-[#ddf93c]",
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
    <div className="min-h-screen bg-[var(--background)]">

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#14181c] via-[#14181c] to-[#1f2329] py-12 px-4 border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-[var(--accent-text)] uppercase tracking-widest mb-3">DIRECTORUL REDUCERILOR</p>
          <h1 className="text-3xl md:text-4xl font-black text-[var(--foreground)] mb-2 tracking-tight">
            Toate magazinele cu reduceri
          </h1>
          <p className="text-[var(--text-soft)] text-sm mb-1">
            <span className="text-[var(--foreground)] font-bold">{magazine.length} magazine partenere</span>
            {" · "}
            <span className="text-emerald-400 font-bold">{cuPromotii} cu promoții active</span>
            {" · "}
            <span className="text-[var(--accent-text)] font-bold">{cuCod} cu cod cupon</span>
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto mt-6">
            <svg className="absolute left-4 top-3.5 w-5 h-5 text-[var(--text-soft)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cauta magazin (ex: Zara, eMAG, Notino...)"
              value={cautare}
              onChange={e => setCautare(e.target.value)}
              className="w-full bg-[var(--surface-alt)] text-[var(--foreground)] rounded-xl pl-12 pr-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-[#ddf93c]/50 border border-[var(--border-strong)] focus:border-[var(--accent-text)]/50 placeholder-[var(--text-muted)] transition-all"
            />
            {cautare && (
              <button onClick={() => setCautare("")}
                className="absolute right-4 top-3.5 text-[var(--text-soft)] hover:text-[var(--foreground)] transition-colors">
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
                  ? "bg-[#ddf93c] text-[#0c1000] shadow-lg shadow-[#ddf93c]/25"
                  : "bg-[var(--surface-alt)] border border-[var(--border-strong)] text-[var(--text-soft)] hover:border-[var(--accent-text)]/50 hover:text-white"
              }`}>
              {f === "toate" ? "Toate" : f === "cod" ? "🎟 Cod cupon" : "⚡ Promoții active"}
            </button>
          ))}

          <select
            value={sortare}
            onChange={e => setSortare(e.target.value as "az" | "reducere" | "rank")}
            className="ml-auto bg-[var(--surface-alt)] border border-[var(--border-strong)] text-[var(--text-soft)] text-sm font-semibold rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ddf93c]/40 cursor-pointer hover:border-[#6b7178] transition-colors">
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
                  ? "bg-[#ddf93c] text-[#0c1000]"
                  : "bg-[var(--surface-alt)]/60 border border-[var(--border-strong)] text-[var(--text-soft)] hover:border-[#6b7178] hover:text-[var(--text-soft)]"
              }`}>
              {cat.label}
            </button>
          ))}
        </div>

        {/* ── REZULTAT COUNT ──────────────────────────────────────────── */}
        <p className="text-sm text-[var(--text-muted)] mb-5">
          {filtrate.length} magazine{" "}
          {cautare ? <span>pentru <span className="text-[var(--foreground)] font-semibold">&quot;{cautare}&quot;</span></span> : ""}
          {categorie !== "Toate" ? <span className="text-[var(--accent-text)]"> · {CATEGORII_FILTRE.find(c => c.key === categorie)?.label}</span> : ""}
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
                className="group relative bg-gradient-to-b from-[#14181c] to-[#14181c]/60 rounded-xl border border-[var(--border)]/80 hover:border-[var(--accent-text)]/50 p-4 flex flex-col items-center gap-3 hover:-translate-y-1 transition-all duration-200"
                style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }}
              >
                {/* Logo */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center bg-[#ffffff] shrink-0 p-2 group-hover:ring-2 group-hover:ring-[#ddf93c]/40 transition-all">
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
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-[#ffffff]" />
                  )}
                </div>

                {/* Nume */}
                <span className="text-xs font-bold text-[var(--text-soft)] text-center group-hover:text-[var(--foreground)] transition-colors leading-tight line-clamp-2 min-h-[2rem] flex items-center">
                  {nume}
                </span>

                {/* Badge status — omis complet daca nu e nimic de spus, fara placeholder gol */}
                {pct > 0 ? (
                  <span className="text-[10px] font-black text-[#0c1000] bg-[#ddf93c] px-2.5 py-1 rounded-full">
                    -{pct}%
                  </span>
                ) : m.cod_cupon ? (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    Cod cupon
                  </span>
                ) : m.are_promotie ? (
                  <span className="text-[10px] font-semibold text-[var(--accent-text)] bg-[#ddf93c]/10 border border-[var(--accent-text)]/20 px-2.5 py-1 rounded-full">
                    Ofertă
                  </span>
                ) : null}
              </a>
            );
          })}
        </div>

        {/* EMPTY STATE */}
        {filtrate.length === 0 && (
          <div className="text-center py-24 text-[var(--text-muted)]">
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-bold text-lg text-[var(--text-soft)]">Niciun magazin gasit</p>
            <p className="text-sm mt-1">Incearca alt termen de cautare sau sterge filtrele</p>
            <button onClick={() => { setCautare(""); setCategorie("Toate"); setFiltru("toate"); }}
              className="mt-4 text-[var(--accent-text)] hover:text-[var(--accent-text)] text-sm font-bold transition-colors">
              Reseteaza filtrele
            </button>
          </div>
        )}

        {/* FOOTER NAV */}
        <div className="mt-12 pt-6 border-t border-[var(--border)] flex items-center justify-between flex-wrap gap-3">
          <Link href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-text)] transition-colors">
            &larr; Inapoi la homepage
          </Link>
          <Link href="/categorii" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-text)] transition-colors">
            Exploreaza categorii &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
