"use client";

import Link from "next/link";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import type { Produs } from "../ProduseClient";
import { CAT_META } from "../categorie-meta";
import { CAT_FAQ } from "./categorie-faq";
import { useWishlist } from "../../hooks/useWishlist";

function numeAfisat(s: string) {
  return (s || "").split(".")[0].replace(/-/g, " ")
    .split(" ").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ");
}

type Sort = "discount" | "pret_asc" | "pret_desc" | "nou";

function ProdusCard({
  p,
  isSaved,
  onToggle,
}: {
  p: Produs;
  isSaved: boolean;
  onToggle: (p: Produs) => void;
}) {
  const [imgOk, setImgOk] = useState(true);
  const hasImg = p.image && imgOk;
  const merchant = numeAfisat(p.merchant_slug || p.merchant);

  return (
    <a
      href={p.url}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className="group bg-slate-900 border border-slate-700 hover:border-orange-500/70 rounded-2xl overflow-hidden transition-all hover:shadow-[0_0_24px_rgba(249,115,22,0.22)] hover:-translate-y-1 duration-200 flex flex-col relative"
    >
      {/* Image */}
      <div className="relative bg-slate-800 overflow-hidden" style={{ aspectRatio: "1" }}>
        {hasImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.image}
            alt={p.title}
            loading="lazy"
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgOk(false)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-slate-800">
            <span className="text-4xl">🛍️</span>
            <span className="text-[10px] font-bold text-slate-400 text-center px-2 leading-tight">{merchant}</span>
          </div>
        )}

        {/* Discount badge — stanga sus */}
        {p.discount_pct > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
            -{p.discount_pct}%
          </span>
        )}

        {/* TOP DEAL badge — dreapta sus */}
        {p.discount_pct >= 30 && (
          <span className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow uppercase tracking-wide">
            TOP DEAL
          </span>
        )}

        {/* Wishlist button — dreapta jos */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(p); }}
          className={`absolute bottom-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all duration-150 shadow-lg ${
            isSaved
              ? "bg-red-500 text-white scale-110"
              : "bg-slate-900/80 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-400"
          }`}
          title={isSaved ? "Salvat in wishlist — click sa stergi" : "Salveaza in wishlist"}
          aria-label={isSaved ? "Sterge din wishlist" : "Adauga in wishlist"}
        >
          {isSaved ? "♥" : "♡"}
        </button>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-[10px] text-slate-400 mb-0.5 truncate">{p.brand || merchant}</p>
        <p className="text-xs font-semibold text-slate-200 line-clamp-2 flex-1 group-hover:text-orange-400 transition-colors leading-snug">
          {p.title}
        </p>
        <div className="flex items-baseline gap-2 mt-2 flex-wrap">
          <span className="font-black text-orange-400 text-sm">
            {p.price > 0 ? `${p.price.toFixed(2)} lei` : "Vezi pretul"}
          </span>
          {p.old_price && p.old_price > p.price && (
            <span className="text-[10px] text-slate-400 line-through">{p.old_price.toFixed(2)} lei</span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-orange-500">
          Cumpara acum
          <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </a>
  );
}

/* ─── Skeleton ────────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-slate-800" />
      <div className="p-3 space-y-2">
        <div className="h-2 bg-slate-800 rounded w-1/2" />
        <div className="h-3 bg-slate-800 rounded w-full" />
        <div className="h-3 bg-slate-800 rounded w-3/4" />
        <div className="h-4 bg-slate-700 rounded w-1/3 mt-2" />
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function ProduseCategorieClient({
  products,
  updated,
  categorie,
  catMeta,
  totalAll,
}: {
  products: Produs[];
  updated: string;
  categorie: string;
  catMeta: { label: string; emoji: string; desc: string; h1: string };
  totalAll: number;
}) {
  const [search,      setSearch]      = useState("");
  const [minDiscount, setMinDiscount] = useState(0);
  const [maxPret,     setMaxPret]     = useState(0);
  const [sort,        setSort]        = useState<Sort>("discount");
  const [limit,       setLimit]       = useState(48);
  const [faqOpen,     setFaqOpen]     = useState<number | null>(null);
  const loadMoreRef                   = useRef<HTMLDivElement>(null);

  const { isSaved, toggle } = useWishlist();

  const handleToggle = useCallback((p: Produs) => {
    toggle({
      id:       p.url,
      title:    p.title,
      url:      p.url,
      image:    p.image,
      price:    p.price,
      merchant: numeAfisat(p.merchant_slug || p.merchant),
    });
  }, [toggle]);

  const pretMax = useMemo(() => {
    const prices = products.map((p) => p.price).filter((v) => v > 0);
    return prices.length ? Math.ceil(Math.max(...prices)) : 9999;
  }, [products]);

  const magazineList = useMemo(() => {
    const s = new Set(products.map((p) => p.merchant_slug || p.merchant).filter(Boolean));
    return [...s].sort();
  }, [products]);

  const brandList = useMemo(() => {
    const s = new Set(products.map((p) => p.brand).filter(Boolean));
    return [...s].sort().slice(0, 40);
  }, [products]);

  const [brand,   setBrand]   = useState("");
  const [magazin, setMagazin] = useState("");

  const filtrate = useMemo(() => {
    let list = [...products];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.brand || "").toLowerCase().includes(q) ||
          (p.merchant || "").toLowerCase().includes(q)
      );
    }
    if (brand)   list = list.filter((p) => p.brand === brand);
    if (magazin) list = list.filter((p) => (p.merchant_slug || p.merchant) === magazin);
    if (minDiscount > 0) list = list.filter((p) => p.discount_pct >= minDiscount);
    if (maxPret > 0 && maxPret < pretMax) list = list.filter((p) => p.price <= maxPret || p.price === 0);
    switch (sort) {
      case "discount": list.sort((a, b) => b.discount_pct - a.discount_pct); break;
      case "pret_asc": list.sort((a, b) => (a.price || 9999) - (b.price || 9999)); break;
      case "pret_desc": list.sort((a, b) => (b.price || 0) - (a.price || 0)); break;
    }
    return list;
  }, [products, search, brand, magazin, minDiscount, maxPret, sort, pretMax]);

  const hasFiltre = !!(search || brand || magazin || minDiscount > 0 || maxPret > 0);

  const resetFiltre = () => {
    setSearch(""); setBrand(""); setMagazin(""); setMinDiscount(0); setMaxPret(0);
  };

  // Infinite scroll — incarca mai multe cand ajungi la sentinel
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && limit < filtrate.length) {
          setLimit((l) => l + 48);
        }
      },
      { rootMargin: "300px" }
    );
    obs.observe(loadMoreRef.current);
    return () => obs.disconnect();
  }, [limit, filtrate.length]);

  const cuDiscount = products.filter((p) => p.discount_pct > 0).length;
  const bestDisc   = products.reduce((mx, p) => Math.max(mx, p.discount_pct), 0);
  const alteCategorii = Object.entries(CAT_META)
    .filter(([slug]) => slug !== categorie && slug !== "altele")
    .slice(0, 6);
  const faqItems = CAT_FAQ[categorie] || [];

  return (
    <div className="min-h-screen bg-slate-950">

      {/* ─── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative bg-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(249,115,22,0.12) 0%, transparent 65%)" }} />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 pt-12 pb-14 text-center">
          <nav className="flex justify-center gap-2 text-xs text-slate-500 mb-6">
            <Link href="/" className="hover:text-slate-300 transition-colors">AmCupon.ro</Link>
            <span>/</span>
            <Link href="/produse" className="hover:text-slate-300 transition-colors">Produse</Link>
            <span>/</span>
            <span className="text-slate-300">{catMeta.label}</span>
          </nav>

          <div className="text-5xl mb-4">{catMeta.emoji}</div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-3">
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #fb923c 0%, #fbbf24 100%)" }}>
              {catMeta.h1}
            </span>
          </h1>
          <p className="text-slate-400 text-base mb-8 max-w-xl mx-auto">{catMeta.desc}</p>

          <div className="flex flex-wrap justify-center gap-8 text-sm">
            {[
              { v: products.length.toLocaleString(), l: "Produse" },
              { v: cuDiscount.toLocaleString(),      l: "Cu discount" },
              { v: bestDisc > 0 ? `-${bestDisc}%` : "—", l: "Reducere max" },
              { v: magazineList.length.toString(),   l: "Magazine" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="font-black text-white text-2xl">{s.v}</div>
                <div className="text-slate-500 text-xs mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>

          {/* Link wishlist daca are produse salvate */}
          <div className="mt-6 flex justify-center">
            <Link href="/wishlist"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors border border-slate-700 px-3 py-1.5 rounded-full hover:border-red-400/50">
              ♥ Wishlist — produsele tale salvate
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CONTINUT ────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-8">

        {products.length === 0 ? (
          <div className="text-center py-20 bg-slate-900 rounded-2xl border border-slate-700">
            <p className="text-5xl mb-4">{catMeta.emoji}</p>
            <h2 className="font-black text-slate-200 text-xl mb-2">Feed-urile se actualizeaza</h2>
            <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
              Produsele din categoria {catMeta.label} se incarca la urmatoarea actualizare zilnica.
              Total in catalog: {totalAll.toLocaleString()} produse.
            </p>
            <Link href="/produse" className="bg-orange-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors text-sm inline-block">
              Toate produsele ({totalAll.toLocaleString()}) →
            </Link>
          </div>
        ) : (
          <>
            {/* ─── FILTRE ─────────────────────────────────────────────────────── */}
            <div className="bg-slate-900 rounded-2xl border border-slate-700 p-4 mb-6">
              <div className="flex flex-wrap gap-3 items-end">
                {/* Search */}
                <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cauta</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text" placeholder="Titlu, brand..."
                      value={search} onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder:text-slate-500 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* Brand */}
                {brandList.length > 1 && (
                  <div className="flex flex-col gap-1 min-w-[140px]">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Brand</label>
                    <select value={brand} onChange={(e) => setBrand(e.target.value)}
                      className="border border-slate-700 bg-slate-800 text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option value="">Toate</option>
                      {brandList.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                )}

                {/* Magazin */}
                {magazineList.length > 1 && (
                  <div className="flex flex-col gap-1 min-w-[140px]">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Magazin</label>
                    <select value={magazin} onChange={(e) => setMagazin(e.target.value)}
                      className="border border-slate-700 bg-slate-800 text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option value="">Toate ({magazineList.length})</option>
                      {magazineList.map((m) => <option key={m} value={m}>{numeAfisat(m)}</option>)}
                    </select>
                  </div>
                )}

                {/* Discount */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reducere min.</label>
                  <div className="flex gap-1">
                    {[0, 10, 25, 50, 70].map((v) => (
                      <button key={v} onClick={() => setMinDiscount(v)}
                        className={`px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors ${minDiscount === v ? "bg-orange-500 text-white" : "border border-slate-700 bg-slate-800 text-slate-300 hover:border-orange-500"}`}>
                        {v === 0 ? "Toate" : `>=${v}%`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pret max */}
                {pretMax > 0 && (
                  <div className="flex flex-col gap-1 min-w-[160px]">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Pret max: {maxPret > 0 && maxPret < pretMax ? `${maxPret} lei` : "Orice"}
                    </label>
                    <input
                      type="range" min={0} max={pretMax} step={Math.ceil(pretMax / 50)}
                      value={maxPret || pretMax}
                      onChange={(e) => setMaxPret(Number(e.target.value) >= pretMax ? 0 : Number(e.target.value))}
                      className="accent-orange-500 w-full h-2 cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500">
                      <span>0 lei</span><span>{pretMax.toLocaleString()} lei</span>
                    </div>
                  </div>
                )}

                {/* Sort */}
                <div className="flex flex-col gap-1 ml-auto">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sortare</label>
                  <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}
                    className="border border-slate-700 bg-slate-800 text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option value="discount">Discount maxim</option>
                    <option value="nou">Cele mai noi</option>
                    <option value="pret_asc">Pret crescator</option>
                    <option value="pret_desc">Pret descrescator</option>
                  </select>
                </div>

                {hasFiltre && (
                  <button onClick={resetFiltre}
                    className="text-sm text-orange-500 font-semibold hover:text-orange-400 border border-orange-500/30 px-3 py-2 rounded-xl bg-slate-900">
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-400">
                <span className="font-bold text-slate-200">{filtrate.length.toLocaleString()}</span> produse
                {hasFiltre && <span className="text-slate-500"> (din {products.length.toLocaleString()})</span>}
                {updated && <span className="text-slate-600"> · actualizat {new Date(updated).toLocaleDateString("ro-RO")}</span>}
              </p>
              <Link href="/wishlist" className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1">
                ♥ Wishlist
              </Link>
            </div>

            {/* Grid produse */}
            {filtrate.length === 0 ? (
              <div className="text-center py-16 bg-slate-900 rounded-2xl border border-slate-700">
                <p className="text-3xl mb-3">🔍</p>
                <p className="font-bold text-slate-200 mb-2">Niciun produs gasit</p>
                <button onClick={resetFiltre} className="text-orange-500 font-semibold text-sm hover:text-orange-600">
                  Reseteaza filtrele →
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filtrate.slice(0, limit).map((p, i) => (
                    <ProdusCard
                      key={`${p.merchant}-${i}`}
                      p={p}
                      isSaved={isSaved(p.url)}
                      onToggle={handleToggle}
                    />
                  ))}
                  {/* Skeleton-uri cand se incarca mai multe */}
                  {limit < filtrate.length && Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={`sk-${i}`} />
                  ))}
                </div>
                {/* Sentinel pentru infinite scroll */}
                <div ref={loadMoreRef} className="h-4 mt-4" />
                {limit >= filtrate.length && filtrate.length > 48 && (
                  <p className="text-center text-xs text-slate-600 mt-4">
                    Toate cele {filtrate.length.toLocaleString()} produse au fost incarcate.
                  </p>
                )}
              </>
            )}
          </>
        )}
      </section>

      {/* ─── FAQ ─────────────────────────────────────────────────────────────── */}
      {faqItems.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 py-12">
          <h2 className="text-xl font-black text-white mb-6 text-center">
            Intrebari frecvente despre {catMeta.label}
          </h2>
          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <div key={i} className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 hover:bg-slate-800 transition-colors"
                >
                  <span className="font-semibold text-slate-200 text-sm">{item.q}</span>
                  <span className={`text-orange-500 text-lg transition-transform ${faqOpen === i ? "rotate-45" : ""}`}>+</span>
                </button>
                {faqOpen === i && (
                  <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t border-slate-800 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── ALTE CATEGORII ──────────────────────────────────────────────────── */}
      <section className="bg-slate-900 border-t border-slate-800 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">EXPLOREAZA SI</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {alteCategorii.map(([slug, cm]) => (
              <Link key={slug} href={`/produse/${slug}`}
                className="group bg-slate-800 border border-slate-700 hover:border-orange-500/50 rounded-xl p-3 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="text-2xl mb-1">{cm.emoji}</div>
                <p className="text-xs font-semibold text-slate-300 group-hover:text-orange-400 transition-colors leading-tight">{cm.label}</p>
              </Link>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link href="/produse"
              className="text-sm font-bold text-orange-500 hover:text-orange-400 border border-orange-500/30 px-5 py-2 rounded-xl bg-slate-900 inline-block">
              Toate produsele ({totalAll.toLocaleString()}) →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
