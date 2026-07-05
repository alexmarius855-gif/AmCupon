"use client";

import Link from "next/link";

import { useState, useEffect, useMemo } from "react";
import PriceAlert from "../../components/PriceAlert";
import ReviewSection from "./ReviewSection";
import ShareButton from "../../components/ShareButton";
import BannerAd2P from "../../components/BannerAd2P";

// ── Countdown timer ───────────────────────────────────────────────────────────
function CountdownTimer({ zileRamase }: { zileRamase: number }) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    function calc() {
      const now = new Date();
      const target = new Date();
      target.setHours(23, 59, 59, 0);
      if (zileRamase === 1) target.setDate(target.getDate() + 1);
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) { setTimeLeft("Expirat"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
    }
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [zileRamase]);
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-black text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
      ⏱ {zileRamase === 0 ? "Expiră azi" : "Expiră mâine"} — {timeLeft}
    </span>
  );
}

// ── Interfaces ────────────────────────────────────────────────────────────────
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
  comision: string;
  rank?: number;
  trend: number;
  are_promotie: boolean;
  cod_cupon: boolean;
  zile_ramase: number;
  promotii: Promotie[];
  folosit_de: number;
  procent_succes: number;
  exclusiv: boolean;
  canal_recomandat?: string;
  prioritate?: string;
  sales_number?: number;
  scor_afiliere?: number;
  scor_final?: number;
}

interface MagazinSimilar {
  magazin: string;
  logo_url?: string;
  are_promotie: boolean;
  cod_cupon: boolean;
  promotii: { nume: string }[];
}

interface BlogPostMic {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  cover: string;
}

interface Produs {
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

// ── Helpers ───────────────────────────────────────────────────────────────────
function numeAfisat(magazin: string): string {
  return magazin.split(".")[0].replace(/-/g," ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function maxPct(promotii: { nume: string }[]): number {
  let max = 0;
  for (const p of promotii) {
    const m = p.nume?.match(/(\d+)\s*%/);
    if (m) { const v = parseInt(m[1]); if (v > max && v <= 90) max = v; }
  }
  return max;
}

function extractDiscount(text: string): string | null {
  const m = text?.match(/(\d+)\s*%/);
  return m ? m[1] + "%" : null;
}

// ── Produs card ───────────────────────────────────────────────────────────────
function ProdusCard({ produs: p }: { produs: Produs }) {
  const [imgOk, setImgOk] = useState(true);
  const hasDiscount = p.discount_pct > 0 && p.old_price;
  return (
    <a href={p.url} target="_blank" rel="sponsored noopener noreferrer"
      className="group bg-[#15120c] border border-[#26211a] hover:border-[#c9a63e] rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5 duration-200 flex flex-col">
      <div className="relative bg-[#26211a] overflow-hidden" style={{aspectRatio:"1"}}>
        {p.image && imgOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image} alt={p.title} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgOk(false)} loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🛍️</div>
        )}
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-gradient-to-br from-[#e9d9b0] to-[#c9a63e] text-[#1a1408] text-xs font-black px-2 py-0.5 rounded-lg shadow-sm">
            -{p.discount_pct}%
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs text-[#8c8064] mb-1 line-clamp-1">{p.brand || p.category}</p>
        <p className="text-sm font-semibold text-[#dcd0b8] line-clamp-2 flex-1 group-hover:text-[#d8c091] transition-colors leading-snug">{p.title}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-black text-[#d8c091] text-base">
            {p.price > 0 ? `${p.price.toFixed(2)} lei` : "Vezi pretul"}
          </span>
          {hasDiscount && p.old_price && (
            <span className="text-xs text-[#8c8064] line-through">{p.old_price.toFixed(2)} lei</span>
          )}
        </div>
        <div className="mt-2 text-xs font-bold text-[#d8c091] group-hover:text-[#e3d1a6] flex items-center gap-1">
          Cumpara acum
          <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    </a>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
type Tab = "coduri" | "oferte" | "produse" | "recenzii";

interface Banner2P {
  id: number; image_url: string; landing_url: string; landing_raw: string;
  width: number; height: number; merchant: string; merchant_slug: string;
  name: string; category: string; b_type: string;
}

export default function MagazinClient({ magazin: m, produse = [], similare = [], comparatii = [], blogPost = null, banner = null, descriere = null }: {
  magazin: Magazin;
  produse?: Produs[];
  similare?: MagazinSimilar[];
  comparatii?: { slug: string; label: string }[];
  blogPost?: BlogPostMic | null;
  banner?: Banner2P | null;
  descriere?: { titlu: string; paragrafe: string[] } | null;
}) {
  const [revealed, setRevealed]   = useState<Set<number>>(new Set());
  const [copiat, setCopiat]       = useState<number | null>(null);
  const [imgOk, setImgOk]         = useState(true);
  const [tabActiv, setTabActiv]   = useState<Tab>("coduri");

  const nume      = numeAfisat(m.magazin);
  const an        = new Date().getFullYear();
  const initiala  = nume.charAt(0).toUpperCase();

  const cuCod     = m.promotii.filter(p => p.cod_cupon);
  const faraCodd  = m.promotii.filter(p => !p.cod_cupon);

  // Vizualizari deterministe
  const culoare = "bg-gradient-to-br from-[#c9a63e] to-[#9c7a26]";

  function copiazaCod(idx: number, cod: string, link?: string) {
    setRevealed(prev => new Set(prev).add(idx));
    navigator.clipboard.writeText(cod).catch(() => {});
    setCopiat(idx);
    setTimeout(() => setCopiat(null), 3000);
    trackClick("copiere_cod", m.magazin, cod);
    // Deschide magazinul cu link-ul afiliat — seteaza cookie-ul = prinde comisionul.
    // Sincron (in click handler) ca sa NU fie blocat de popup blocker.
    if (link) window.open(link, "_blank", "noopener,noreferrer");
  }


  function trackClick(tip: string, magazinSlug: string, cod?: string) {
    try {
      if (typeof window !== "undefined" && (window as unknown as {gtag?: (...args: unknown[]) => void}).gtag) {
        (window as unknown as {gtag: (...args: unknown[]) => void}).gtag("event", "affiliate_click", {
          event_category: "afiliere",
          event_label: magazinSlug,
          affiliate_type: tip,
          coupon_code: cod || "",
          value: 1,
        });
      }
    } catch {}
  }

  // Tab-uri cu count-uri
  const tabs: { id: Tab; label: string; count: number; icon: string }[] = [
    { id: "coduri",   label: "Coduri",   count: cuCod.length,       icon: "🎟" },
    { id: "oferte",   label: "Oferte",   count: faraCodd.length,    icon: "🏷" },
    { id: "produse",  label: "Produse",  count: produse.length,     icon: "🛍" },
    { id: "recenzii", label: "Recenzii", count: 0,                   icon: "⭐" },
  ];

  return (
    <div className="min-h-screen bg-[#0b0a07]">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="bg-[#15120c] border-b border-[#26211a] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 shrink-0">
            <div className="bg-[#b8912e] text-white font-black text-base px-2 py-1 rounded-lg">Am</div>
            <span className="font-black text-white text-xl">Cupon</span>
            <span className="text-[#d8c091] font-black text-xl">.ro</span>
          </Link>
          <span className="text-[#473d28]">/</span>
          <Link href="/toate-magazinele" className="text-sm text-[#a89a78] hover:text-white transition-colors">Magazine</Link>
          <span className="text-[#473d28]">/</span>
          <span className="text-sm font-semibold text-[#c8bda2] truncate max-w-[160px]">{nume}</span>
          <Link href="/toate-magazinele" className="ml-auto text-[#a89a78] hover:text-white transition-colors" title="Cauta magazin">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </Link>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#15120c] via-[#15120c] to-[#26211a] border-b border-[#37301f] pt-8 pb-0 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6">

            {/* Logo */}
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center bg-white border border-[#37301f] p-1.5 shrink-0 shadow-xl shadow-black/30">
              {m.logo_url && imgOk ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.logo_url} alt={`Logo ${nume}`} className="w-full h-full object-contain"
                  onError={() => setImgOk(false)} />
              ) : (
                <div className={`w-full h-full rounded-xl ${culoare} flex items-center justify-center`}>
                  <span className="text-white font-black text-3xl">{initiala}</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-black text-white">Cod Reducere {nume} {an}</h1>
                {m.rank && m.rank <= 20 && (
                  <span className="text-xs font-bold bg-[#c9a63e]/15 text-[#e3d1a6] border border-[#c9a63e]/30 px-2 py-0.5 rounded-full">Top #{m.rank} Romania</span>
                )}
                {m.exclusiv && (
                  <span className="text-xs font-bold bg-[#d8c091] text-[#15120c] px-2 py-0.5 rounded-full">Exclusiv</span>
                )}
              </div>
              <p className="text-[#a89a78] text-sm mb-3">{m.categorie}</p>

              {/* Stats pills */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
                {m.promotii.length > 0 && (
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                    {m.promotii.length} {m.promotii.length === 1 ? "oferta" : "oferte"} active
                  </div>
                )}
                {m.trend > 0 && (
                  <div className="flex items-center gap-1.5 bg-[#c9a63e]/10 border border-[#c9a63e]/20 text-[#e3d1a6] text-xs font-semibold px-3 py-1.5 rounded-full">
                    ↑ Trending +{m.trend}%
                  </div>
                )}
                <div className="flex items-center gap-1.5 bg-[#c9a63e]/10 border border-[#c9a63e]/20 text-[#e3d1a6] text-xs font-semibold px-3 py-1.5 rounded-full">
                  ✓ Verificat {new Date().toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <a href={m.url_afiliat || m.url} target="_blank" rel="sponsored noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c9a63e] to-[#b8912e] hover:from-[#d8b850] hover:to-[#c9a63e] text-[#1a1408] font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-[#b8912e]/25" onClick={() => trackClick("vizita_magazin", m.magazin)}>
                  Viziteaza {nume}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                  </svg>
                </a>
                <ShareButton
                  pageSlug={`/cod-reducere/${m.magazin}`}
                  title={`Cod reducere ${nume} — AmCupon.ro`}
                  text={`💰 ${m.promotii.length > 0 ? m.promotii.length + " reduceri active" : "Oferte"} la ${nume}! Verificate pe AmCupon.ro`}
                  label="Distribuie"
                />
                <PriceAlert magazin={m.magazin} numeMagazin={nume} />
              </div>
            </div>
          </div>

          {/* ── BANNER PUBLICITAR 2PERFORMANT (mutat sub hero — vizibilitate maxima,
               era ingropat dupa tab-uri+CTA-uri+blog, sectiunea 13/15) ──────────── */}
          {banner && (
            <div className="px-4 pb-4 flex justify-center">
              <BannerAd2P banner={banner} />
            </div>
          )}

          {/* ── TAB NAVIGATION ─────────────────────────────────────────────── */}
          <div className="flex gap-0 border-t border-[#26211a] overflow-x-auto" style={{scrollbarWidth:"none"}}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTabActiv(t.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                  tabActiv === t.id
                    ? "border-[#c9a63e] text-white"
                    : "border-transparent text-[#a89a78] hover:text-[#dcd0b8] hover:border-[#473d28]"
                }`}>
                <span>{t.icon}</span>
                <span>{t.label}</span>
                {t.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-black ${
                    tabActiv === t.id ? "bg-[#b8912e] text-white" : "bg-[#37301f] text-[#c8bda2]"
                  }`}>{t.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── TAB CONTENT ────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-8 text-white">

        {/* ─── TAB: CODURI ──────────────────────────────────────────────────── */}
        {tabActiv === "coduri" && (
          <>
            {/* ── Cum functioneaza (3 pasi) ─────────────────────────────────── */}
            <div className="flex items-stretch gap-2 sm:gap-4 mb-7 bg-[#15120c]/60 border border-[#26211a] rounded-2xl p-4">
              {[
                { nr: "1", icon: "📋", titlu: "Copiaza codul", desc: "Click pe cod — se copiaza automat" },
                { nr: "2", icon: "🛒", titlu: "Mergi la magazin", desc: `Te redirectam la ${nume}` },
                { nr: "3", icon: "✅", titlu: "Aplica la checkout", desc: `Lipeste codul in camp "Voucher"` },
              ].map((pas) => (
                <div key={pas.nr} className="flex-1 flex flex-col items-center text-center gap-1.5 px-2">
                  <span className="text-xl">{pas.icon}</span>
                  <span className="text-[10px] font-black text-[#d8c091] uppercase tracking-widest">Pas {pas.nr}</span>
                  <span className="text-xs font-bold text-white leading-tight">{pas.titlu}</span>
                  <span className="text-[11px] text-[#8c8064] leading-snug hidden sm:block">{pas.desc}</span>
                </div>
              ))}
            </div>

            {cuCod.length > 0 ? (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-xl font-black text-white">Coduri Reducere {nume} {an}</h2>
                  <span className="text-sm text-[#8c8064]">{cuCod.length} coduri active</span>
                </div>
                <div className="space-y-4">
                  {cuCod.map((promo, idx) => {
                    // Daca promotia a expirat (zile_ramase < 0) folosim quicklink magazin
                    const link     = (promo.zile_ramase >= 0 && promo.landing_page) ? promo.landing_page : (m.url_afiliat || m.url);
                    const discount = extractDiscount(promo.nume) || extractDiscount(promo.descriere || "");
                    const isRevealed = revealed.has(idx);
                    const isCopiat   = copiat === idx;
                    return (
                      <div key={idx} className="bg-[#15120c] rounded-2xl border border-[#26211a] hover:shadow-lg hover:shadow-black/20 transition-all hover:border-[#37301f] p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              {discount && (
                                <span className="text-sm font-black text-[#d8c091] bg-[#1a1408]/50 px-2 py-0.5 rounded-lg">-{discount}</span>
                              )}
                              <span className="text-xs font-bold text-[#d8c091] bg-[#c9a63e]/10 px-2 py-0.5 rounded-full uppercase tracking-wide">Cod Reducere</span>
                              {promo.zile_ramase <= 1 && promo.zile_ramase >= 0 && <CountdownTimer zileRamase={promo.zile_ramase}/>}
                              {promo.zile_ramase > 1 && promo.zile_ramase <= 3 && (
                                <span className="text-xs font-bold text-[#d8c091] bg-[#1a1408]/50 px-2 py-0.5 rounded-full">Expira in {promo.zile_ramase} zile</span>
                              )}
                              {promo.zile_ramase > 3 && (
                                <span className="text-xs text-[#8c8064]">{promo.zile_ramase} zile ramase</span>
                              )}
                            </div>
                            <h3 className="font-bold text-white text-base mb-1">{promo.nume}</h3>
                            {promo.descriere && promo.descriere !== promo.nume && (
                              <p className="text-sm text-[#a89a78]">{promo.descriere}</p>
                            )}
                          </div>
                          <div className="shrink-0 w-full sm:w-48">
                            {isRevealed ? (
                              <div className="space-y-2">
                                <div className="border-2 border-dashed border-[#d8c091] rounded-xl py-2.5 px-3 text-center bg-[#c9a63e]/10">
                                  <span className="font-mono font-black text-[#e3d1a6] tracking-widest text-sm">{promo.cod_cupon}</span>
                                  {isCopiat && <p className="text-xs text-green-600 mt-0.5">✓ Copiat!</p>}
                                </div>
                                <a href={link} target="_blank" rel="sponsored noopener noreferrer"
                                  className="flex items-center justify-center w-full bg-gradient-to-r from-[#c9a63e] to-[#b8912e] hover:from-[#d8b850] hover:to-[#c9a63e] text-[#1a1408] font-bold py-2.5 rounded-xl text-sm transition-colors" onClick={() => trackClick("cod", m.magazin, promo.cod_cupon)}>
                                  Mergi la magazin →
                                </a>
                                <div className="flex justify-center">
                                  <ShareButton
                                    pageSlug={`/cod-reducere/${m.magazin}`}
                                    title={`Cod reducere ${discount ? discount + " " : ""}${nume}`}
                                    text={`🔥 Cod reducere${discount ? " " + discount : ""} la ${nume}!\nCod: ${promo.cod_cupon}${promo.descriere && promo.descriere !== promo.nume ? "\n" + promo.descriere : ""}`}
                                    small
                                    label="Trimite"
                                  />
                                </div>
                              </div>
                            ) : (
                              <button onClick={() => copiazaCod(idx, promo.cod_cupon, link)}
                                className="w-full border-2 border-dashed border-[#37301f] hover:border-[#d8c091] rounded-xl bg-[#26211a] py-2.5 px-3 text-center transition-colors group">
                                <span className="font-mono text-[#8c8064] group-hover:text-[#d8c091] text-sm">
                                  {promo.cod_cupon.slice(0,4)}{"*".repeat(Math.max(0, Math.min(promo.cod_cupon.length - 4, 6)))}
                                </span>
                                <p className="text-xs text-[#8c8064] mt-0.5 group-hover:text-[#d8c091]">Click → cod + mergi la magazin</p>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : (
              <div className="bg-[#15120c] rounded-2xl border border-[#26211a] p-12 text-center">
                <div className="text-5xl mb-4">🎟</div>
                <h3 className="text-lg font-black text-white mb-2">Niciun cod cupon activ</h3>
                <p className="text-[#8c8064] text-sm mb-5">Momentan nu avem coduri. Verifica sectiunea Oferte sau viziteaza direct magazinul.</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {faraCodd.length > 0 && (
                    <button onClick={() => setTabActiv("oferte")}
                      className="bg-[#b8912e] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#c9a63e] transition-colors">
                      Vezi {faraCodd.length} oferte active
                    </button>
                  )}
                  <a href={m.url_afiliat || m.url} target="_blank" rel="sponsored noopener noreferrer"
                    className="bg-[#26211a] border border-[#37301f] text-[#c8bda2] font-bold px-5 py-2.5 rounded-xl text-sm hover:border-[#c9a63e] hover:text-white transition-colors">
                    Viziteaza {nume}
                  </a>
                </div>
              </div>
            )}

            {/* FAQ compact in tab coduri */}
            <section className="mt-10">
              <h2 className="text-lg font-black text-white mb-4">Intrebari frecvente</h2>
              <div className="space-y-2">
                {[
                  { q: `Cum folosesc un cod de reducere ${nume}?`, a: `Copiaza codul de pe aceasta pagina, adauga produsele in cos pe ${m.url}, iar la checkout introdu codul in campul "Cod promotional" si apasa Aplica. Reducerea se scade automat.` },
                  { q: `Codurile ${nume} sunt verificate?`, a: `Da. Actualizate zilnic din platforma 2Performant. Fiecare cod afiseaza rata de succes si data de expirare.` },
                  { q: `Ce fac daca codul nu functioneaza?`, a: `Verifica daca nu a expirat si daca indeplinesti conditiile (cos minim, produse eligibile). Incearca un alt cod activ de pe pagina.` },
                ].map((item, i) => (
                  <details key={i} className="bg-[#15120c] border border-[#26211a] rounded-2xl group">
                    <summary className="px-5 py-4 font-semibold text-white text-sm cursor-pointer list-none flex items-center justify-between gap-4 hover:text-[#d8c091] transition-colors">
                      {item.q}
                      <svg className="w-4 h-4 shrink-0 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                      </svg>
                    </summary>
                    <p className="px-5 pb-4 text-[#a89a78] text-sm leading-relaxed">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ─── TAB: OFERTE ──────────────────────────────────────────────────── */}
        {tabActiv === "oferte" && (
          <>
            {faraCodd.length > 0 ? (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-xl font-black text-white">Oferte {nume} {an}</h2>
                  <span className="text-sm text-[#8c8064]">{faraCodd.length} oferte active</span>
                </div>
                <div className="space-y-4">
                  {faraCodd.map((promo, idx) => {
                    // Daca promotia a expirat (zile_ramase < 0) folosim quicklink magazin
                    const link     = (promo.zile_ramase >= 0 && promo.landing_page) ? promo.landing_page : (m.url_afiliat || m.url);
                    const discount = extractDiscount(promo.nume) || extractDiscount(promo.descriere || "");
                    return (
                      <div key={idx} className="bg-[#15120c] rounded-2xl border border-[#26211a] hover:shadow-lg hover:shadow-black/20 transition-all hover:border-[#37301f] p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              {discount && (
                                <span className="text-sm font-black text-[#d8c091] bg-[#1a1408]/50 px-2 py-0.5 rounded-lg">-{discount}</span>
                              )}
                              <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full uppercase tracking-wide">Oferta</span>
                              {promo.zile_ramase <= 1 && promo.zile_ramase >= 0 && <CountdownTimer zileRamase={promo.zile_ramase}/>}
                              {promo.zile_ramase > 1 && promo.zile_ramase <= 3 && (
                                <span className="text-xs font-bold text-[#d8c091] bg-[#1a1408]/50 px-2 py-0.5 rounded-full">Expira in {promo.zile_ramase} zile</span>
                              )}
                              {promo.zile_ramase > 3 && (
                                <span className="text-xs text-[#8c8064]">{promo.zile_ramase} zile ramase</span>
                              )}
                            </div>
                            <h3 className="font-bold text-white text-base mb-1">{promo.nume}</h3>
                            {promo.descriere && promo.descriere !== promo.nume && (
                              <p className="text-sm text-[#a89a78]">{promo.descriere}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <a href={link} target="_blank" rel="sponsored noopener noreferrer"
                              className="bg-gradient-to-r from-[#c9a63e] to-[#b8912e] hover:from-[#d8b850] hover:to-[#c9a63e] text-[#1a1408] font-bold px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap">
                              Vezi oferta →
                            </a>
                            <ShareButton
                              pageSlug={`/cod-reducere/${m.magazin}`}
                              title={`Oferta${discount ? " " + discount : ""} ${nume}`}
                              text={`🏷 Oferta${discount ? " " + discount : ""} la ${nume}!\n${promo.descriere && promo.descriere !== promo.nume ? promo.descriere : promo.nume}`}
                              small
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : (
              <div className="bg-[#15120c] rounded-2xl border border-[#26211a] p-12 text-center">
                <div className="text-5xl mb-4">🏷</div>
                <h3 className="text-lg font-black text-white mb-2">Nicio oferta activa</h3>
                <p className="text-[#8c8064] text-sm mb-5">Revino curand. Ofertele se actualizeaza zilnic.</p>
                {cuCod.length > 0 && (
                  <button onClick={() => setTabActiv("coduri")}
                    className="bg-[#b8912e] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#c9a63e] transition-colors">
                    Vezi {cuCod.length} coduri disponibile
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* ─── TAB: PRODUSE ─────────────────────────────────────────────────── */}
        {tabActiv === "produse" && (
          <>
            {produse.length > 0 ? (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-white">Produse {nume} cu reducere</h2>
                    <span className="text-sm text-[#8c8064]">{produse.length} produse</span>
                  </div>
                  <Link href="/produse" className="text-sm font-semibold text-[#d8c091] hover:text-[#e3d1a6]">Toate produsele →</Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {produse.map((p, i) => <ProdusCard key={i} produs={p}/>)}
                </div>
              </section>
            ) : (
              <div className="bg-[#15120c] rounded-2xl border border-[#26211a] p-12 text-center">
                <div className="text-5xl mb-4">🛍</div>
                <h3 className="text-lg font-black text-white mb-2">Feed produse indisponibil</h3>
                <p className="text-[#8c8064] text-sm mb-5">Produsele individuale nu sunt disponibile pentru acest magazin. Viziteaza direct site-ul.</p>
                <a href={m.url_afiliat || m.url} target="_blank" rel="sponsored noopener noreferrer"
                  className="bg-[#b8912e] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#c9a63e] transition-colors">
                  Viziteaza {nume}
                </a>
              </div>
            )}
          </>
        )}

        {/* ─── TAB: RECENZII ────────────────────────────────────────────────── */}
        {tabActiv === "recenzii" && (
          <ReviewSection magazin={m.magazin} />
        )}

        {/* ── BOTTOM CTAs (toate tab-urile) ────────────────────────────────── */}
        <div className="mt-8 space-y-3">
          <div className="bg-gradient-to-r from-[#26211a] to-[#15120c] border border-[#37301f] rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4">
            <div className="text-3xl shrink-0">🔌</div>
            <div className="flex-1 text-center sm:text-left">
              <p className="font-black text-white text-sm">Extensie Chrome AmCupon — Gratis</p>
              <p className="text-[#a89a78] text-xs mt-0.5">Coduri de reducere aplicate automat pe orice site de shopping</p>
            </div>
            <a href="https://chromewebstore.google.com/detail/mahfankpalkgognhnllkgdkjncmmkllb"
              target="_blank" rel="noopener noreferrer"
              className="shrink-0 bg-gradient-to-r from-[#c9a63e] to-[#b8912e] hover:from-[#d8b850] hover:to-[#c9a63e] text-[#1a1408] font-bold text-xs px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap">
              Instaleaza gratuit →
            </a>
          </div>
          <div className="bg-[#c9a63e]/8 border border-[#c9a63e]/25 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4">
            <div className="text-2xl shrink-0">📬</div>
            <div className="flex-1 text-center sm:text-left">
              <p className="font-bold text-white text-sm">Nu rata promotiile viitoare {nume}</p>
              <p className="text-[#a89a78] text-xs mt-0.5">Saptamanal — cele mai bune coduri pe email. Gratuit.</p>
            </div>
            <Link href="/newsletter"
              className="shrink-0 bg-gradient-to-r from-[#c9a63e] to-[#b8912e] hover:from-[#d8b850] hover:to-[#c9a63e] text-[#1a1408] font-bold text-xs px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap">
              Aboneaza-te →
            </Link>
          </div>
        </div>


        {/* ── ARTICOL BLOG ─────────────────────────────────────────────────── */}
        {blogPost && (
          <section className="mt-10">
            <h2 className="text-lg font-black text-white mb-4">Ghid complet {nume}</h2>
            <a href={`/blog/${blogPost.slug}`}
              className="group flex gap-4 bg-[#15120c] border border-[#26211a] hover:border-[#c9a63e] rounded-2xl p-4 hover:shadow-lg hover:shadow-black/30 transition-all">
              <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={blogPost.cover} alt={blogPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-[#d8c091] uppercase tracking-wide">Articol blog</span>
                <p className="text-sm font-bold text-white mt-0.5 line-clamp-2 group-hover:text-[#d8c091] transition-colors leading-snug">
                  {blogPost.title}
                </p>
                <p className="text-xs text-[#a89a78] mt-1 line-clamp-2 leading-relaxed">{blogPost.excerpt}</p>
                <span className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-[#d8c091] group-hover:text-[#e3d1a6]">
                  Citeste ghidul
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                  </svg>
                </span>
              </div>
            </a>
          </section>
        )}

        {/* ── MAGAZINE SIMILARE ────────────────────────────────────────────── */}
        {similare.length > 0 && (
          <section className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-white">Magazine similare</h2>
              <Link href="/toate-magazinele" className="text-sm font-semibold text-[#d8c091] hover:text-[#e3d1a6]">Toate →</Link>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
              {similare.map(s => {
                const numeSim = numeAfisat(s.magazin);
                const pctSim  = maxPct(s.promotii);
                return (
                  <a key={s.magazin} href={`/cod-reducere/${s.magazin}`}
                    className="group flex flex-col items-center gap-1.5 p-2.5 bg-[#15120c] rounded-xl border border-[#26211a] hover:border-[#c9a63e] hover:shadow-sm transition-all text-center">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 border border-[#26211a]">
                      {s.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.logo_url} alt={numeSim} className="w-full h-full object-contain p-0.5" loading="lazy"/>
                      ) : (
                        <span className="text-base font-black text-[#8c8064]">{numeSim.charAt(0)}</span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-[#c8bda2] group-hover:text-[#d8c091] leading-tight line-clamp-1 w-full">{numeSim}</span>
                    {pctSim > 0 ? (
                      <span className="text-[10px] font-black text-[#d8c091]">-{pctSim}%</span>
                    ) : s.cod_cupon ? (
                      <span className="text-[10px] font-bold text-emerald-600">Cod</span>
                    ) : s.are_promotie ? (
                      <span className="text-[10px] text-[#8c8064]">Oferta</span>
                    ) : null}
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* ── COMPARATII (X vs Y) — link contextual intern pt SEO ──────────── */}
        {comparatii.length > 0 && (
          <section className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-white">{nume} vs alte magazine</h2>
              <Link href="/comparatii" className="text-sm font-semibold text-[#d8c091] hover:text-[#e3d1a6]">Toate comparatiile →</Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {comparatii.map(c => (
                <Link key={c.slug} href={`/comparatii/${c.slug}`}
                  className="group flex items-center justify-between gap-3 p-4 bg-[#15120c] rounded-xl border border-[#26211a] hover:border-[#c9a63e] transition-all">
                  <span className="text-sm font-bold text-[#dcd0b8] group-hover:text-[#e3d1a6]">{c.label}</span>
                  <span className="text-xs font-semibold text-[#8c8064] group-hover:text-[#d8c091] whitespace-nowrap">Compara →</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── DESPRE MAGAZIN (text editorial SEO) ──────────────────────────── */}
        {descriere && descriere.paragrafe?.length > 0 && (
          <section className="mt-12 bg-[#15120c] border border-[#26211a] rounded-2xl p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-black text-white mb-4">{descriere.titlu}</h2>
            <div className="space-y-3 text-sm sm:text-[15px] text-[#c8bda2] leading-relaxed">
              {descriere.paragrafe.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 pt-6 border-t border-gray-100 text-center">
          <Link href="/" className="text-sm text-[#8c8064] hover:text-[#d8c091] transition-colors">
            ← Inapoi la toate promotiile
          </Link>
        </div>
      </div>
    </div>
  );
}
