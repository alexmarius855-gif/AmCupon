"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useWishlist } from "../hooks/useWishlist";
import { CAT_META } from "./categorie-meta";

/* ─── Types ──────────────────────────────────────────────────────────────── */
export interface Produs {
  id?: number;
  title: string;
  url: string;
  url_original?: string;
  image: string;
  price: number;
  old_price?: number | null;
  discount_pct: number;
  category: string;
  cat_slug?: string;
  brand: string;
  merchant: string;
  merchant_slug: string;
  feed_id?: number;
}

export interface Promotie {
  nume: string;
  cod_cupon: string;
  landing_page: string;
  zile_ramase: number;
}

export interface Magazin {
  magazin: string;
  url: string;
  url_afiliat: string;
  logo_url?: string;
  categorie: string;
  categorie_slug?: string;
  comision: string;
  are_promotie: boolean;
  cod_cupon: boolean;
  zile_ramase: number;
  promotii: Promotie[];
  procent_succes: number;
  trend: number;
  exclusiv: boolean;
}

export interface Banner {
  id: string;
  image_url: string;
  landing_url: string;
  landing_raw: string;
  width: number;
  height: number;
  merchant: string;
  merchant_slug: string;
  name: string;
  category: string;
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function numeAfisat(s: string) {
  return (s || "").split(".")[0].replace(/-/g, " ")
    .split(" ").map(w => w[0]?.toUpperCase() + w.slice(1)).join(" ");
}

function maxDiscount(promotii: Promotie[]): number {
  let mx = 0;
  for (const p of promotii) {
    const t = (p.nume || "") + " ";
    const m = t.match(/(\d+)\s*%/g);
    if (m) for (const x of m) { const v = parseInt(x); if (v > mx && v <= 90) mx = v; }
  }
  return mx;
}

// Emoji per categorie produs
function catEmoji(cat: string): string {
  const c = (cat || "").toLowerCase();
  if (c.includes("fashion") || c.includes("clothing") || c.includes("shoes")) return "👗";
  if (c.includes("electronic") || c.includes("tech") || c.includes("phone") || c.includes("esim")) return "💻";
  if (c.includes("beauty") || c.includes("parfum") || c.includes("cosmet")) return "💄";
  if (c.includes("sport") || c.includes("outdoor") || c.includes("fitness")) return "🏃";
  if (c.includes("home") || c.includes("casa") || c.includes("garden")) return "🏡";
  if (c.includes("book") || c.includes("carte")) return "📚";
  if (c.includes("toy") || c.includes("copii") || c.includes("kids")) return "👶";
  if (c.includes("pharma") || c.includes("health") || c.includes("medic")) return "💊";
  if (c.includes("food") || c.includes("grocery") || c.includes("aliment")) return "🛒";
  if (c.includes("travel") || c.includes("hotel") || c.includes("flight")) return "✈️";
  if (c.includes("auto") || c.includes("car") || c.includes("moto")) return "🚗";
  if (c.includes("game") || c.includes("jocuri")) return "🎮";
  if (c.includes("pet") || c.includes("animal")) return "🐾";
  if (c.includes("jewel") || c.includes("bijuterie")) return "💎";
  if (c.includes("gift") || c.includes("cadou")) return "🎁";
  return "🛍️";
}

// Culori logo fallback
const LOG_COLORS = ["bg-blue-500","bg-violet-500","bg-teal-500","bg-pink-500","bg-indigo-500","bg-emerald-600","bg-red-500","bg-amber-500"];
function logoBg(name: string) {
  return LOG_COLORS[(name.charCodeAt(0) || 0) % LOG_COLORS.length];
}

type Sort = "discount" | "pret_asc" | "pret_desc" | "nou";
type Tab  = "oferte" | "produse" | "campanii";

/* ─── Product Card ────────────────────────────────────────────────────────── */
function ProdusCard({ p, onSave, saved }: { p: Produs; onSave: () => void; saved: boolean }) {
  const [imgOk, setImgOk] = useState(true);
  const hasImg = p.image && imgOk;
  const emoji  = catEmoji(p.category);
  const merchant = numeAfisat(p.merchant_slug || p.merchant);
  const hasDiscount = p.discount_pct > 0;
  const hasOldPrice = !!(p.old_price && p.old_price > p.price);
  const merchantInitial = merchant.charAt(0).toUpperCase();

  return (
    <div className="group bg-slate-900 border border-slate-700/60 hover:border-cyan-500/60 rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:shadow-cyan-500/5 hover:-translate-y-1 duration-200 flex flex-col relative">

      {/* Buton salvare */}
      <button
        onClick={(e) => { e.preventDefault(); onSave(); }}
        title={saved ? "Sterge din lista dorintelor" : "Salveaza pentru price alert"}
        className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full border flex items-center justify-center text-sm transition-all shadow-sm
          ${saved
            ? "bg-red-500/20 border-red-500/50 text-red-400"
            : "bg-slate-800/80 border-slate-600/60 text-slate-500 hover:text-red-400 hover:border-red-400/60 backdrop-blur-sm"
          }`}
      >
        {saved ? "♥" : "♡"}
      </button>

      <a href={p.url} target="_blank" rel="sponsored noopener noreferrer" className="flex flex-col flex-1">

        {/* Image */}
        <div className="relative bg-slate-800/60 overflow-hidden" style={{ aspectRatio: "1" }}>
          {hasImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.image} alt={p.title} loading="lazy"
              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              onError={() => setImgOk(false)} />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <span className="text-5xl opacity-60">{emoji}</span>
              <span className="text-[10px] font-semibold text-slate-500 text-center px-3 leading-tight">{merchant}</span>
            </div>
          )}

          {/* Badge discount MARE — RetailMeNot style */}
          {hasDiscount && (
            <div className="absolute top-2.5 left-2.5 bg-red-500 text-white font-black rounded-xl px-2.5 py-1 shadow-lg shadow-red-500/30 leading-none">
              <span className="text-base">-{p.discount_pct}%</span>
            </div>
          )}

          {/* Badge VERIFICAT */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-sm text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"/>
            VERIFICAT
          </div>
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col flex-1">

          {/* Merchant row */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className={`w-5 h-5 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0 ${logoBg(merchant)}`}>
              <span className="text-white text-[9px] font-black">{merchantInitial}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium truncate">{merchant}</span>
            {p.brand && p.brand !== merchant && (
              <span className="text-[10px] text-slate-600 truncate">· {p.brand}</span>
            )}
          </div>

          {/* Title */}
          <p className="text-xs font-semibold text-slate-200 line-clamp-2 flex-1 group-hover:text-white transition-colors leading-snug mb-3">
            {p.title}
          </p>

          {/* Price block */}
          <div className="mb-3">
            {hasOldPrice && (
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] text-slate-500 line-through">{p.old_price!.toFixed(2)} lei</span>
                {hasDiscount && (
                  <span className="text-[9px] font-black text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-full">
                    -{p.discount_pct}% REDUCERE
                  </span>
                )}
              </div>
            )}
            <span className="font-black text-indigo-400 text-lg leading-none">
              {p.price > 0 ? `${p.price.toFixed(2)} lei` : "Vezi pretul"}
            </span>
          </div>

          {/* CTA Button — buton real, RetailMeNot style */}
          <div className="mt-auto w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-cyan-500/20">
            Cumpara acum
            <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
            </svg>
          </div>

        </div>
      </a>
    </div>
  );
}

/* ─── Deal Card (din output.json) ─────────────────────────────────────────── */
function DealCard({ m, rank }: { m: Magazin; rank?: number }) {
  const [imgOk, setImgOk] = useState(true);
  const promo = m.promotii[0];
  const disc  = maxDiscount(m.promotii);
  const link  = promo?.landing_page || m.url_afiliat || m.url;
  const name  = numeAfisat(m.magazin);
  const initial = name.charAt(0).toUpperCase();

  return (
    <a href={link} target="_blank" rel="sponsored noopener noreferrer"
      className="group bg-slate-900 border border-slate-700 hover:border-cyan-500/50 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col">
      {/* Colored top bar */}
      <div className="h-1 bg-gradient-to-r from-indigo-400 to-violet-400"/>
      <div className="p-4 flex-1 flex flex-col">
        {/* Logo + rank */}
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 rounded-xl border border-slate-700 bg-slate-800 flex items-center justify-center overflow-hidden">
            {m.logo_url && imgOk ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.logo_url} alt={name} className="w-10 h-10 object-contain" loading="lazy" onError={() => setImgOk(false)}/>
            ) : (
              <div className={`w-full h-full ${logoBg(name)} flex items-center justify-center rounded-xl`}>
                <span className="text-white font-black text-lg">{initial}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {rank && rank <= 3 && (
              <span className="text-[10px] font-black bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">
                #{rank}
              </span>
            )}
            {disc > 0 && (
              <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                -{disc}%
              </span>
            )}
            {m.cod_cupon && (
              <span className="text-[10px] font-semibold bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full border border-violet-500/30">
                Cod
              </span>
            )}
          </div>
        </div>
        {/* Name + category */}
        <h3 className="font-black text-slate-100 text-sm group-hover:text-indigo-400 transition-colors leading-tight tracking-tight">
          {name}
        </h3>
        <p className="text-[10px] text-slate-400 mt-0.5">{m.categorie}</p>
        {/* Promo */}
        {promo && (
          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed flex-1">{promo.nume}</p>
        )}
        {/* Trust row */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700">
          <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-semibold">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse inline-block"/>
            Verificat azi
          </div>
          <span className="text-slate-300 text-[10px]">·</span>
          <span className="text-[10px] text-slate-400">{m.promotii.length} {m.promotii.length === 1 ? "oferta" : "oferte"}</span>
        </div>
      </div>
      {/* CTA */}
      <div className="px-4 pb-4">
        <div className="bg-indigo-600 group-hover:bg-indigo-500 text-white text-xs font-black py-2 rounded-xl text-center transition-colors">
          {m.cod_cupon ? "Copiaza codul" : "Vezi oferta"} →
        </div>
      </div>
    </a>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────────── */
export default function ProduseClient({
  products,
  updated,
  magazine,
  banners,
  an,
}: {
  products: Produs[];
  updated: string;
  magazine: Magazin[];
  banners: Banner[];
  an: number;
}) {
  const [search,      setSearch]      = useState("");
  const [categorie,   setCategorie]   = useState("");
  const [magazinFiltru, setMagazinFiltru] = useState("");
  const [minDiscount, setMinDiscount] = useState(0);
  const [sort,        setSort]        = useState<Sort>("nou");
  const [limit,       setLimit]       = useState(48);
  const [activeTab,   setActiveTab]   = useState<Tab>("oferte");
  const [savedToast,  setSavedToast]  = useState<string | null>(null);

  // Wishlist + price alerts
  const { isSaved, toggle, priceDrops } = useWishlist();

  // Magazine cu promotii active pentru "Top Deals"
  const cuPromotii = useMemo(() =>
    magazine.filter(m => m.are_promotie).sort((a, b) => maxDiscount(b.promotii) - maxDiscount(a.promotii)),
  [magazine]);

  // Bannere cu imagini valide
  const bannereValide = useMemo(() =>
    banners.filter(b => b.image_url && (b.landing_url || b.landing_raw)),
  [banners]);

  // Categorii produse unice
  const categorii = useMemo(() => {
    const s = new Set(products.map(p => p.category).filter(Boolean));
    return [...s].sort();
  }, [products]);

  // Magazine unice din produse
  const magazineList = useMemo(() => {
    const s = new Set(products.map(p => p.merchant_slug || p.merchant).filter(Boolean));
    return [...s].sort();
  }, [products]);

  // Produse filtrate
  const filtrate = useMemo(() => {
    let list = [...products];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.brand || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        (p.merchant || "").toLowerCase().includes(q)
      );
    }
    if (categorie)      list = list.filter(p => p.category === categorie);
    if (magazinFiltru)  list = list.filter(p => (p.merchant_slug || p.merchant) === magazinFiltru);
    if (minDiscount > 0) list = list.filter(p => p.discount_pct >= minDiscount);
    switch (sort) {
      case "discount": list.sort((a, b) => b.discount_pct - a.discount_pct); break;
      case "pret_asc": list.sort((a, b) => (a.price || 9999) - (b.price || 9999)); break;
      case "pret_desc": list.sort((a, b) => (b.price || 0) - (a.price || 0)); break;
      case "nou": break;
    }
    return list;
  }, [products, search, categorie, magazinFiltru, minDiscount, sort]);

  const statsProds = {
    total:     products.length,
    cuImag:    products.filter(p => p.image).length,
    cuDisc:    products.filter(p => p.discount_pct > 0).length,
    magazine:  new Set(products.map(p => p.merchant)).size,
    bestDisc:  products.reduce((mx, p) => Math.max(mx, p.discount_pct), 0),
  };

  const hasFiltre = !!(categorie || magazinFiltru || minDiscount > 0 || search);

  return (
    <div className="min-h-screen bg-slate-950">

      {/* ─── HERO DARK ────────────────────────────────────────────────────── */}
      <section className="relative bg-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{background:"radial-gradient(ellipse 80% 60% at 50% 0%, rgba(249,115,22,0.15) 0%, transparent 65%)"}}/>
          <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage:"linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize:"50px 50px"}}/>
        </div>
        <div className="relative max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/8 border border-white/15 rounded-full px-4 py-1.5 text-xs font-semibold text-white/70 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"/>
            {cuPromotii.length} magazine cu promotii active · {products.length} produse in catalog
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-4">
            <span className="text-white">Cumpara mai inteligent</span><br/>
            <span className="text-transparent bg-clip-text" style={{backgroundImage:"linear-gradient(135deg, #8b5cf6 0%, #22d3ee 100%)"}}>
              reduceri reale, {an}
            </span>
          </h1>
          <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">
            Top deals zilnice, feed-uri de produse si campanii vizuale de la {magazine.length}+ magazine partenere.
          </p>
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            {[
              { v: `${cuPromotii.length}+`, l: "Magazine cu deals" },
              { v: `${products.length}`,    l: "Produse in catalog" },
              { v: `${bannereValide.length}`,l: "Campanii vizuale" },
              { v: "100%",                  l: "Gratuit" },
            ].map(s => (
              <div key={s.l} className="text-center">
                <div className="font-black text-white text-2xl">{s.v}</div>
                <div className="text-slate-500 text-xs mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TABS ─────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-[64px] z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto" style={{scrollbarWidth:"none"}}>
            {([
              { id: "oferte",   label: `Top Deals (${cuPromotii.length})`,      emoji: "🔥" },
              { id: "campanii", label: `Campanii cu Imagini (${bannereValide.length})`, emoji: "🖼️" },
              { id: "produse",  label: `Feed Produse (${products.length})`,      emoji: "📦" },
            ] as {id: Tab; label: string; emoji: string}[]).map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === t.id
                    ? "border-indigo-500 text-indigo-400"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}>
                <span>{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── TAB: TOP DEALS ───────────────────────────────────────────────── */}
      {activeTab === "oferte" && (
        <section id="top-deals" className="max-w-7xl mx-auto px-4 py-10">
          <div className="mb-8">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">LIVE · ACTUALIZAT AZI</p>
            <h2 className="text-3xl font-black tracking-tight text-white">Top Deals din Romania</h2>
            <p className="text-slate-400 text-sm mt-1.5">
              {cuPromotii.length} magazine cu promotii actuale, sortate dupa reducere maxima
            </p>
          </div>

          {cuPromotii.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 rounded-2xl border border-slate-700">
              <p className="text-3xl mb-3">⏳</p>
              <p className="font-black text-slate-200 mb-2">Se incarca ofertele</p>
              <p className="text-slate-400 text-sm">Datele se actualizeaza zilnic la 08:00</p>
            </div>
          ) : (
            <>
              {/* Top 3 featured */}
              {cuPromotii.slice(0, 3).length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                  {cuPromotii.slice(0, 3).map((m, i) => (
                    <DealCard key={m.magazin} m={m} rank={i + 1}/>
                  ))}
                </div>
              )}
              {/* Restul in grid mai mic */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {cuPromotii.slice(3, 51).map(m => (
                  <DealCard key={m.magazin} m={m}/>
                ))}
              </div>
              {cuPromotii.length > 54 && (
                <div className="text-center mt-8">
                  <Link href="/" className="border-2 border-slate-700 hover:border-indigo-500 text-slate-400 hover:text-indigo-400 font-bold px-8 py-3 rounded-2xl text-sm transition-all hover:shadow-md inline-block">
                    Vezi toate {cuPromotii.length} magazine pe homepage →
                  </Link>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* ─── TAB: CAMPANII CU IMAGINI ─────────────────────────────────────── */}
      {activeTab === "campanii" && (
        <section className="max-w-7xl mx-auto px-4 py-10">
          <div className="mb-8">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">CAMPANII VIZUALE</p>
            <h2 className="text-3xl font-black tracking-tight text-white">Bannere & Campanii Active</h2>
            <p className="text-slate-400 text-sm mt-1.5">
              Imagini oficiale de la magazinele partenere. Clic = redirectionare cu tracking afiliat.
            </p>
          </div>

          {bannereValide.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 rounded-2xl border border-slate-700">
              <p className="text-3xl mb-3">🖼️</p>
              <p className="font-black text-slate-200 mb-2">Nicio campanie activa momentan</p>
              <p className="text-slate-400 text-sm">Bannere se actualizeaza zilnic odata ce magazinele activeaza campanii</p>
            </div>
          ) : (
            <>
              {/* Featured banner mare */}
              {bannereValide.slice(0, 1).map(b => (
                <a key={b.id} href={b.landing_url || b.landing_raw} target="_blank" rel="sponsored noopener noreferrer"
                  className="group relative block rounded-2xl overflow-hidden border border-slate-700 hover:border-cyan-500/50 hover:shadow-xl transition-all mb-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.image_url} alt={b.name || b.merchant}
                    className="w-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
                    onError={e => (e.target as HTMLImageElement).parentElement?.remove()}/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                    <div>
                      <p className="text-white font-black text-xl">{b.merchant}</p>
                      <p className="text-white/70 text-sm">{b.name || b.category}</p>
                    </div>
                    <span className="ml-auto bg-indigo-600 text-white font-black px-4 py-2 rounded-xl text-sm">
                      Vezi oferta →
                    </span>
                  </div>
                </a>
              ))}

              {/* Grid restul */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {bannereValide.slice(1).map((b, i) => (
                  <a key={b.id || i} href={b.landing_url || b.landing_raw} target="_blank" rel="sponsored noopener noreferrer"
                    title={b.name || b.merchant}
                    className="group relative block rounded-xl overflow-hidden border border-slate-700 hover:border-cyan-500/50 hover:shadow-lg transition-all">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.image_url} alt={b.name || b.merchant || "Banner"}
                      className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy"
                      onError={e => (e.target as HTMLImageElement).closest("a")?.remove()}/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <span className="text-white text-xs font-bold">{b.merchant}</span>
                    </div>
                  </a>
                ))}
              </div>

              <div className="mt-6 text-center text-xs text-slate-500 bg-slate-900 rounded-xl py-3 px-4">
                Bannere publicitare de la magazinele partenere 2Performant. Actualizate zilnic.
              </div>
            </>
          )}
        </section>
      )}

      {/* ─── TAB: FEED PRODUSE ────────────────────────────────────────────── */}
      {activeTab === "produse" && (
        <section id="produse-feed" className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">FEED-URI 2PERFORMANT</p>
              <h2 className="text-3xl font-black tracking-tight text-white">Catalog Produse</h2>
              <p className="text-slate-400 text-sm mt-1.5">
                {products.length} produse din feed-urile partenerilor · {statsProds.magazine} magazine
                {updated && ` · actualizat ${new Date(updated).toLocaleDateString("ro-RO")}`}
              </p>
            </div>
          </div>

          {/* ── Navigatie categorii ─────────────────────────────────────────────── */}
          {products.length > 0 && (() => {
            // Calculeaza numarul de produse per cat_slug
            const catCounts: Record<string, number> = {};
            for (const p of products) {
              const slug = p.cat_slug || "altele";
              catCounts[slug] = (catCounts[slug] || 0) + 1;
            }
            const catList = Object.entries(CAT_META)
              .filter(([slug]) => slug !== "altele" && (catCounts[slug] || 0) > 0)
              .sort((a, b) => (catCounts[b[0]] || 0) - (catCounts[a[0]] || 0));

            return catList.length > 0 ? (
              <div className="mb-8">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">NAVIGATIE PE CATEGORII</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2">
                  {catList.map(([slug, cm]) => (
                    <Link key={slug} href={`/produse/${slug}`}
                      className="group bg-slate-900 border border-slate-700 hover:border-cyan-500/60 rounded-xl p-2.5 text-center hover:-translate-y-0.5 transition-all duration-200">
                      <div className="text-xl mb-1">{cm.emoji}</div>
                      <p className="text-[10px] font-bold text-slate-300 group-hover:text-indigo-400 transition-colors leading-tight">{cm.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{(catCounts[slug] || 0).toLocaleString()} produse</p>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null;
          })()}

          {products.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 rounded-2xl border border-slate-700">
              <p className="text-4xl mb-4">📦</p>
              <h3 className="font-black text-slate-200 text-xl mb-2">Feed-urile se populeaza</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
                Produsele din feed-urile de afiliati se actualizeaza zilnic la 08:00. Intre timp, vezi ofertele din tab-ul Top Deals.
              </p>
              <button onClick={() => setActiveTab("oferte")}
                className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-500 transition-colors text-sm">
                Vezi Top Deals →
              </button>
            </div>
          ) : (
            <>
              {/* Filtre */}
              <div className="bg-slate-900 rounded-2xl border border-slate-700 p-4 mb-6">
                <div className="flex flex-wrap gap-3 items-end">
                  {/* Search */}
                  <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cauta produs</label>
                    <div className="relative">
                      <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                      </svg>
                      <input type="text" placeholder="Titlu, brand, magazin..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder:text-slate-500 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"/>
                    </div>
                  </div>
                  {/* Categorie */}
                  <div className="flex flex-col gap-1 min-w-[160px]">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categorie</label>
                    <select value={categorie} onChange={e => setCategorie(e.target.value)}
                      className="border border-slate-700 bg-slate-800 text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">Toate ({categorii.length})</option>
                      {categorii.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  {/* Magazin */}
                  <div className="flex flex-col gap-1 min-w-[160px]">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Magazin</label>
                    <select value={magazinFiltru} onChange={e => setMagazinFiltru(e.target.value)}
                      className="border border-slate-700 bg-slate-800 text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="">Toate ({magazineList.length})</option>
                      {magazineList.map(m => <option key={m} value={m}>{numeAfisat(m)}</option>)}
                    </select>
                  </div>
                  {/* Discount */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reducere min.</label>
                    <div className="flex gap-1">
                      {[0, 10, 25, 50].map(v => (
                        <button key={v} onClick={() => setMinDiscount(v)}
                          className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${minDiscount === v ? "bg-indigo-600 text-white" : "border border-slate-700 bg-slate-800 text-slate-300 hover:border-indigo-500"}`}>
                          {v === 0 ? "Toate" : `≥${v}%`}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Sort */}
                  <div className="flex flex-col gap-1 ml-auto">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sortare</label>
                    <select value={sort} onChange={e => setSort(e.target.value as Sort)}
                      className="border border-slate-700 bg-slate-800 text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="nou">Cele mai noi</option>
                      <option value="discount">Discount maxim</option>
                      <option value="pret_asc">Pret crescator</option>
                      <option value="pret_desc">Pret descrescator</option>
                    </select>
                  </div>
                  {hasFiltre && (
                    <button onClick={() => { setCategorie(""); setMagazinFiltru(""); setMinDiscount(0); setSearch(""); }}
                      className="text-sm text-indigo-400 font-semibold hover:text-indigo-400 border border-cyan-500/30 px-3 py-2 rounded-xl bg-slate-900">
                      Reseteaza
                    </button>
                  )}
                </div>
              </div>

              {/* Count */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-400">
                  <span className="font-bold text-slate-200">{filtrate.length.toLocaleString()}</span> produse gasite
                </p>
                {statsProds.cuImag > 0 && (
                  <span className="text-xs text-slate-400">{statsProds.cuImag} cu imagine</span>
                )}
              </div>

              {filtrate.length === 0 ? (
                <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-700">
                  <p className="text-3xl mb-3">🔍</p>
                  <p className="font-bold text-slate-200 mb-2">Niciun produs gasit</p>
                  <button onClick={() => { setCategorie(""); setMagazinFiltru(""); setMinDiscount(0); setSearch(""); }}
                    className="text-indigo-400 font-semibold text-sm hover:text-indigo-300">
                    Reseteaza filtrele →
                  </button>
                </div>
              ) : (
                <>
                  {/* Price drop banner */}
                  {priceDrops.length > 0 && (
                    <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 flex items-center gap-3">
                      <span className="text-xl">&#127381;</span>
                      <div className="flex-1 text-sm">
                        <span className="font-bold text-emerald-400">Pretul a scazut la {priceDrops.length} produse salvate!</span>
                      </div>
                      <Link href="/wishlist" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 whitespace-nowrap">
                        Vezi lista &#8594;
                      </Link>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filtrate.slice(0, limit).map((p, i) => {
                      const itemId = p.url_original || `${p.merchant}-${p.title}`;
                      return (
                        <ProdusCard
                          key={`${p.merchant}-${i}`}
                          p={p}
                          saved={isSaved(itemId)}
                          onSave={() => {
                            toggle({
                              id:       itemId,
                              title:    p.title,
                              url:      p.url,
                              image:    p.image || "",
                              price:    p.price,
                              merchant: p.merchant,
                            });
                            setSavedToast(isSaved(itemId) ? null : p.title.slice(0, 40));
                            setTimeout(() => setSavedToast(null), 2500);
                          }}
                        />
                      );
                    })}
                  </div>
                  {filtrate.length > limit && (
                    <div className="text-center mt-8">
                      <button onClick={() => setLimit(l => l + 48)}
                        className="bg-slate-800 border border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-indigo-400 font-bold px-8 py-3 rounded-2xl text-sm transition-all hover:shadow-md">
                        Incarca mai multe ({filtrate.length - limit} ramase)
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </section>
      )}

      {/* ─── CROSS-PROMO: Alte sectiuni ───────────────────────────────────── */}
      <section className="bg-slate-900 border-t border-slate-800 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">EXPLOREAZA SI</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { href: "/",               emoji: "🔥", label: "Coduri de reducere",   desc: "Toate codurile verificate" },
              { href: "/categorii",      emoji: "📂", label: "Categorii",             desc: "Fashion, Tech, Beauty..." },
              { href: "/toate-magazinele",emoji:"🏪", label: "Toate magazinele",       desc: `${magazine.length}+ magazine partenere` },
              { href: "/blog",           emoji: "📝", label: "Blog & Ghiduri",         desc: "Cum sa economisesti mai mult" },
            ].map(s => (
              <a key={s.href} href={s.href}
                className="group bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <div className="text-3xl mb-3">{s.emoji}</div>
                <p className="font-black text-slate-200 text-sm group-hover:text-indigo-400 transition-colors">{s.label}</p>
                <p className="text-xs text-slate-500 mt-1">{s.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TOAST salvare produs ──────────────────────────────────────────── */}
      {savedToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-sm font-semibold animate-in slide-in-from-bottom-4 duration-300">
          <span className="text-red-400">&#9829;</span>
          <span>Salvat: {savedToast}</span>
          <Link href="/wishlist" className="ml-2 text-emerald-400 hover:text-emerald-300 text-xs underline">
            Vezi lista
          </Link>
        </div>
      )}
    </div>
  );
}





