"use client";

import Link from "next/link";
import Image from "next/image";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Ticket, Tag, ShoppingBag, Star, Timer, ClipboardCopy, ShoppingCart, CheckCircle2, Puzzle, Mail, Flame, Truck } from "lucide-react";
import PriceAlert from "../../components/PriceAlert";
import ReviewSection from "./ReviewSection";
import ShareButton from "../../components/ShareButton";
import BannerAd2P from "../../components/BannerAd2P";
import RedirectModal from "../../components/RedirectModal";
import { useCopyCod } from "../../hooks/useCopyCod";
import { calculateDealScore, DEAL_SCORE_VISIBLE_THRESHOLD } from "../../../lib/dealScore";

// ── Deal Score badge cu count-up (0 -> scor) la mount ───────────────────────────
function DealScoreBadge({ score }: { score: number }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 700;
    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      setDisplayed(Math.round(score * (1 - Math.pow(1 - t, 3)))); // ease-out cubic
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      title="Scor calculat de AmCupon din reducere, cod, prospețime și exclusivitate — nu e un rating extern"
      className="flex items-center gap-1.5 bg-[#1f2329] border border-[#ddf93c]/40 text-[#ecff7a] text-xs font-bold px-3 py-1.5 rounded-full"
    >
      <Flame className="w-3.5 h-3.5" /> Deal Score {displayed}/100
    </motion.div>
  );
}

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
      <Timer className="w-3.5 h-3.5" /> {zileRamase === 0 ? "Expiră azi" : "Expiră mâine"} — {timeLeft}
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
  ultima_verificare?: string;
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

// Detectat din textul REAL al promotiei — nu presupunem transport gratuit fara
// mentiune explicita in date (acelasi principiu ca MagazinCard.tsx).
function areTransportGratuit(promo: Promotie): boolean {
  const text = `${promo.nume} ${promo.descriere || ""}`.toLowerCase();
  return /transport gratuit|livrare gratuit[aă]|free shipping/.test(text);
}

// ── Produs card ───────────────────────────────────────────────────────────────
function ProdusCard({ produs: p }: { produs: Produs }) {
  const [imgOk, setImgOk] = useState(true);
  const hasDiscount = p.discount_pct > 0 && p.old_price;
  return (
    <a href={p.url} target="_blank" rel="sponsored noopener noreferrer"
      className="group bg-[#14181c] border border-[#1f2329] hover:border-[#ddf93c] rounded-xl overflow-hidden transition-all hover:shadow-xl hover:shadow-black/40 hover:-translate-y-0.5 duration-200 flex flex-col">
      <div className="relative bg-[#1f2329] overflow-hidden" style={{aspectRatio:"1"}}>
        {p.image && imgOk ? (
          <Image src={p.image} alt={p.title} fill sizes="(max-width: 640px) 50vw, 176px"
            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgOk(false)} unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-10 h-10 text-[#3a4048]" /></div>
        )}
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-gradient-to-br from-[#34d399] to-[#ddf93c] text-[#0c1000] text-xs font-black px-2 py-0.5 rounded-lg shadow-sm">
            -{p.discount_pct}%
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs text-[#9399a0] mb-1 line-clamp-1">{p.brand || p.category}</p>
        <p className="text-sm font-semibold text-[#c9ced5] line-clamp-2 flex-1 group-hover:text-[#ddf93c] transition-colors leading-snug">{p.title}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-black text-[#ddf93c] text-base">
            {p.price > 0 ? `${p.price.toFixed(2)} lei` : "Vezi pretul"}
          </span>
          {hasDiscount && p.old_price && (
            <span className="text-xs text-[#9399a0] line-through">{p.old_price.toFixed(2)} lei</span>
          )}
        </div>
        <div className="mt-2 text-xs font-bold text-[#ddf93c] group-hover:text-[#c3dd2c] flex items-center gap-1">
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

export default function MagazinClient({ magazin: m, produse = [], similare = [], comparatii = [], blogPost = null, banner = null, descriere = null, astazi }: {
  magazin: Magazin;
  produse?: Produs[];
  similare?: MagazinSimilar[];
  comparatii?: { slug: string; label: string }[];
  blogPost?: BlogPostMic | null;
  banner?: Banner2P | null;
  descriere?: { titlu: string; paragrafe: string[] } | null;
  astazi: string; // data serverului (YYYY-MM-DD), pt comparatie reala cu ultima_verificare
}) {
  const [revealed, setRevealed]   = useState<Set<number>>(new Set());
  const [imgOk, setImgOk]         = useState(true);
  // Tab-ul implicit = primul care are CONTINUT REAL, nu mereu "coduri".
  // Bug de conversie gasit 08.08.2026: 55 din 62 de magazine cu oferte active au 0
  // coduri (temu, shein, emag, trendyol, fashiondays...). Pagina se deschidea pe tabul
  // "Coduri" — gol — iar ofertele, singurul lucru monetizabil de acolo, stateau ascunse
  // in spatele unui tab pe care vizitatorul trebuia sa-l descopere si sa-l apese.
  // Exact paginile cele mai valoroase (singurele cu ceva de vandut) isi ascundeau marfa.
  const [tabActiv, setTabActiv]   = useState<Tab>(() => {
    if (m.promotii.some(p => p.cod_cupon)) return "coduri";
    if (m.promotii.some(p => !p.cod_cupon)) return "oferte";
    if ((produse?.length ?? 0) > 0) return "produse";
    return "coduri";
  });
  const [modalOpen, setModalOpen] = useState(false);
  const { copiedKey, redirectFailed, copyAndOpen, retryRedirect } = useCopyCod(trackClick);
  const copiat = copiedKey !== null ? Number(copiedKey) : null;

  const nume      = numeAfisat(m.magazin);
  const an        = new Date().getFullYear();
  const initiala  = nume.charAt(0).toUpperCase();

  const cuCod     = m.promotii.filter(p => p.cod_cupon);
  const faraCodd  = m.promotii.filter(p => !p.cod_cupon);

  // Prospetime REALA fata de ultima_verificare (setat de merge_platforms.py la fiecare
  // rulare a pipeline-ului) — inainte badge-ul afisa new Date() necondiționat, adica
  // "azi" pe orice vizita, indiferent cand au fost verificate datele. Omite daca nu avem
  // data (nu ghici).
  const zileDeLaVerificare = m.ultima_verificare
    ? Math.round((Date.parse(astazi) - Date.parse(m.ultima_verificare)) / 86400000)
    : null;

  // Deal Score onest (lib/dealScore.ts) — un singur badge/pagina (nu pe fiecare card
  // dintr-un grid, ca in MagazinCard.tsx), cu count-up la mount.
  const dealScore = calculateDealScore(m, astazi);
  const showDealScore = dealScore >= DEAL_SCORE_VISIBLE_THRESHOLD;

  // Vizualizari deterministe
  const culoare = "bg-gradient-to-br from-[#ddf93c] to-[#c3dd2c]";

  function copiazaCod(idx: number, cod: string, link?: string) {
    setRevealed(prev => new Set(prev).add(idx));
    // copy + open sincron (popup blocker) + tracking, unificat in useCopyCod (folosit
    // si de MagazinCard.tsx — inainte logica era duplicata separat in fiecare fisier).
    copyAndOpen(String(idx), cod, link, m.magazin);
    setModalOpen(true);
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
  const tabs: { id: Tab; label: string; count: number; icon: typeof Ticket }[] = [
    { id: "coduri",   label: "Coduri",   count: cuCod.length,       icon: Ticket },
    { id: "oferte",   label: "Oferte",   count: faraCodd.length,    icon: Tag },
    { id: "produse",  label: "Produse",  count: produse.length,     icon: ShoppingBag },
    { id: "recenzii", label: "Recenzii", count: 0,                   icon: Star },
  ];

  return (
    <div className="min-h-screen bg-[#06080b]">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="bg-[#14181c] border-b border-[#1f2329] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 shrink-0">
            <div className="bg-[#ddf93c] text-[#0c1000] font-black text-base px-2 py-1 rounded-lg">Am</div>
            <span className="font-black text-[#ffffff] text-xl">Cupon</span>
            <span className="text-[#ddf93c] font-black text-xl">.ro</span>
          </Link>
          <span className="text-[#9399a0]">/</span>
          <Link href="/toate-magazinele" className="text-sm text-[#c9ced5] hover:text-[#ffffff] transition-colors">Magazine</Link>
          <span className="text-[#9399a0]">/</span>
          <span className="text-sm font-semibold text-[#c9ced5] truncate max-w-[160px]">{nume}</span>
          <Link href="/toate-magazinele" className="ml-auto text-[#c9ced5] hover:text-[#ffffff] transition-colors" title="Cauta magazin">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </Link>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#14181c] via-[#14181c] to-[#1f2329] border-b border-[#2a2f36] pt-8 pb-0 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6">

            {/* Logo */}
            <div className="relative w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center bg-[#ffffff] border border-[#2a2f36] p-1.5 shrink-0 shadow-xl shadow-black/40">
              {m.logo_url && imgOk ? (
                <Image src={m.logo_url} alt={`Logo ${nume}`} fill sizes="80px" className="object-contain p-1.5"
                  onError={() => setImgOk(false)} unoptimized />
              ) : (
                <div className={`w-full h-full rounded-xl ${culoare} flex items-center justify-center`}>
                  <span className="text-white font-black text-3xl">{initiala}</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-black text-[#ffffff]">Cod Reducere {nume} {an}</h1>
                {m.rank && m.rank <= 20 && (
                  <span className="text-xs font-bold bg-[#ddf93c]/15 text-[#c3dd2c] border border-[#ddf93c]/30 px-2 py-0.5 rounded-full">Top #{m.rank} Romania</span>
                )}
                {m.exclusiv && (
                  <span className="text-xs font-bold bg-[#ddf93c] text-[#0c1000] px-2 py-0.5 rounded-full">Exclusiv</span>
                )}
              </div>
              <p className="text-[#c9ced5] text-sm mb-3">{m.categorie}</p>

              {/* Stats pills */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
                {m.promotii.length > 0 && (
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                    {m.promotii.length} {m.promotii.length === 1 ? "oferta" : "oferte"} active
                  </div>
                )}
                {m.trend > 0 && (
                  <div className="flex items-center gap-1.5 bg-[#ddf93c]/10 border border-[#ddf93c]/20 text-[#c3dd2c] text-xs font-semibold px-3 py-1.5 rounded-full">
                    ↑ Trending +{m.trend}%
                  </div>
                )}
                {showDealScore && <DealScoreBadge score={dealScore} />}
                {zileDeLaVerificare !== null && (
                  <div className="flex items-center gap-1.5 bg-[#ddf93c]/10 border border-[#ddf93c]/20 text-[#c3dd2c] text-xs font-semibold px-3 py-1.5 rounded-full">
                    {zileDeLaVerificare <= 0 ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ddf93c] animate-pulse"/>
                    ) : null}
                    ✓ {zileDeLaVerificare <= 0
                      ? "Verificat azi"
                      : `Verificat acum ${zileDeLaVerificare} ${zileDeLaVerificare === 1 ? "zi" : "zile"}`}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <a href={m.url_afiliat || m.url} target="_blank" rel="sponsored noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#ddf93c] to-[#ddf93c] hover:from-[#ddf93c] hover:to-[#ddf93c] text-[#0c1000] font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-[#ddf93c]/25" onClick={() => trackClick("vizita_magazin", m.magazin)}>
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
          <div className="flex gap-0 border-t border-[#1f2329] overflow-x-auto" style={{scrollbarWidth:"none"}}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTabActiv(t.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                  tabActiv === t.id
                    ? "border-[#ddf93c] text-[#ffffff]"
                    : "border-transparent text-[#c9ced5] hover:text-[#c9ced5] hover:border-[#3a4048]"
                }`}>
                <t.icon className="w-4 h-4" />
                <span>{t.label}</span>
                {t.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-black ${
                    tabActiv === t.id ? "bg-[#ddf93c] text-[#0c1000]" : "bg-[#2a2f36] text-[#c9ced5]"
                  }`}>{t.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── TAB CONTENT ────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-8 text-[#ffffff]">

        <AnimatePresence mode="wait">
        {/* ─── TAB: CODURI ──────────────────────────────────────────────────── */}
        {tabActiv === "coduri" && (
          <motion.div key="coduri" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
            {/* ── Cum functioneaza (3 pasi) ─────────────────────────────────── */}
            <div className="flex items-stretch gap-2 sm:gap-4 mb-7 bg-[#14181c]/60 border border-[#1f2329] rounded-xl p-4">
              {[
                { nr: "1", icon: ClipboardCopy, titlu: "Copiaza codul", desc: "Click pe cod — se copiaza automat" },
                { nr: "2", icon: ShoppingCart, titlu: "Mergi la magazin", desc: `Te redirectam la ${nume}` },
                { nr: "3", icon: CheckCircle2, titlu: "Aplica la checkout", desc: `Lipeste codul in camp "Voucher"` },
              ].map((pas) => (
                <div key={pas.nr} className="flex-1 flex flex-col items-center text-center gap-1.5 px-2">
                  <pas.icon className="w-5 h-5 text-[#ddf93c]" />
                  <span className="text-[10px] font-black text-[#ddf93c] uppercase tracking-widest">Pas {pas.nr}</span>
                  <span className="text-xs font-bold text-[#ffffff] leading-tight">{pas.titlu}</span>
                  <span className="text-[11px] text-[#9399a0] leading-snug hidden sm:block">{pas.desc}</span>
                </div>
              ))}
            </div>

            {cuCod.length > 0 ? (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-xl font-black text-[#ffffff]">Coduri Reducere {nume} {an}</h2>
                  <span className="text-sm text-[#9399a0]">{cuCod.length} coduri active</span>
                </div>
                <div className="space-y-4">
                  {cuCod.map((promo, idx) => {
                    // Daca promotia a expirat (zile_ramase < 0) folosim quicklink magazin
                    const link     = (promo.zile_ramase >= 0 && promo.landing_page) ? promo.landing_page : (m.url_afiliat || m.url);
                    const discount = extractDiscount(promo.nume) || extractDiscount(promo.descriere || "");
                    const isRevealed = revealed.has(idx);
                    const isCopiat   = copiat === idx;
                    return (
                      <div key={idx} className="bg-[#14181c] rounded-xl border border-[#1f2329] hover:shadow-lg hover:shadow-black/40 transition-all hover:border-[#2a2f36] p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              {discount && (
                                <span className="text-sm font-black text-[#ddf93c] bg-[#14181c]/50 px-2 py-0.5 rounded-lg">-{discount}</span>
                              )}
                              <span className="text-xs font-bold text-[#ddf93c] bg-[#ddf93c]/10 px-2 py-0.5 rounded-full uppercase tracking-wide">Cod Reducere</span>
                              {areTransportGratuit(promo) && (
                                <span className="flex items-center gap-1 text-xs font-bold text-[#ecff7a] bg-[#ddf93c]/10 border border-[#ddf93c]/30 px-2 py-0.5 rounded-full">
                                  <Truck className="w-3 h-3" /> Transport gratuit
                                </span>
                              )}
                              {promo.zile_ramase <= 1 && promo.zile_ramase >= 0 && <CountdownTimer zileRamase={promo.zile_ramase}/>}
                              {promo.zile_ramase > 1 && promo.zile_ramase <= 3 && (
                                <span className="text-xs font-bold text-[#ddf93c] bg-[#14181c]/50 px-2 py-0.5 rounded-full">Expira in {promo.zile_ramase} zile</span>
                              )}
                              {promo.zile_ramase > 3 && (
                                <span className="text-xs text-[#9399a0]">{promo.zile_ramase} zile ramase</span>
                              )}
                            </div>
                            <h3 className="font-bold text-[#ffffff] text-base mb-1">{promo.nume}</h3>
                            {promo.descriere && promo.descriere !== promo.nume && (
                              <p className="text-sm text-[#c9ced5]">{promo.descriere}</p>
                            )}
                          </div>
                          <div className="shrink-0 w-full sm:w-48">
                            {isRevealed ? (
                              <div className="space-y-2">
                                <div className="border-2 border-dashed border-[#ddf93c] rounded-xl py-2.5 px-3 text-center bg-[#ddf93c]/10">
                                  <span className="font-mono font-black text-[#c3dd2c] tracking-widest text-sm">{promo.cod_cupon}</span>
                                  {isCopiat && <p className="text-xs text-green-600 mt-0.5">✓ Copiat!</p>}
                                </div>
                                <a href={link} target="_blank" rel="sponsored noopener noreferrer"
                                  className="flex items-center justify-center w-full bg-gradient-to-r from-[#ddf93c] to-[#ddf93c] hover:from-[#ddf93c] hover:to-[#ddf93c] text-[#0c1000] font-bold py-2.5 rounded-xl text-sm transition-colors" onClick={() => trackClick("cod", m.magazin, promo.cod_cupon)}>
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
                                className="w-full border-2 border-dashed border-[#2a2f36] hover:border-[#ddf93c] rounded-xl bg-[#1f2329] py-2.5 px-3 text-center transition-colors group">
                                <span className="font-mono text-[#9399a0] group-hover:text-[#ddf93c] text-sm">
                                  {promo.cod_cupon.slice(0,4)}{"*".repeat(Math.max(0, Math.min(promo.cod_cupon.length - 4, 6)))}
                                </span>
                                <p className="text-xs text-[#9399a0] mt-0.5 group-hover:text-[#ddf93c]">Click → cod + mergi la magazin</p>
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
              <div className="bg-[#14181c] rounded-xl border border-[#1f2329] p-12 text-center">
                <Ticket className="w-12 h-12 mb-4 mx-auto text-[#3a4048]" />
                <h3 className="text-lg font-black text-[#ffffff] mb-2">Niciun cod cupon activ</h3>
                <p className="text-[#9399a0] text-sm mb-5">Momentan nu avem coduri. Verifica sectiunea Oferte sau viziteaza direct magazinul.</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {faraCodd.length > 0 && (
                    <button onClick={() => setTabActiv("oferte")}
                      className="bg-[#ddf93c] text-[#0c1000] font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#ddf93c] transition-colors">
                      Vezi {faraCodd.length} oferte active
                    </button>
                  )}
                  <a href={m.url_afiliat || m.url} target="_blank" rel="sponsored noopener noreferrer"
                    className="bg-[#1f2329] border border-[#2a2f36] text-[#c9ced5] font-bold px-5 py-2.5 rounded-xl text-sm hover:border-[#ddf93c] hover:text-[#ffffff] transition-colors">
                    Viziteaza {nume}
                  </a>
                </div>
              </div>
            )}

            {/* FAQ compact in tab coduri */}
            <section className="mt-10">
              <h2 className="text-lg font-black text-[#ffffff] mb-4">Intrebari frecvente</h2>
              <div className="space-y-2">
                {[
                  { q: `Cum folosesc un cod de reducere ${nume}?`, a: `Copiaza codul de pe aceasta pagina, adauga produsele in cos pe ${m.url}, iar la checkout introdu codul in campul "Cod promotional" si apasa Aplica. Reducerea se scade automat.` },
                  { q: `Codurile ${nume} sunt verificate?`, a: `Da. Actualizate zilnic din platforma 2Performant. Fiecare cod afiseaza rata de succes si data de expirare.` },
                  { q: `Ce fac daca codul nu functioneaza?`, a: `Verifica daca nu a expirat si daca indeplinesti conditiile (cos minim, produse eligibile). Incearca un alt cod activ de pe pagina.` },
                ].map((item, i) => (
                  <details key={i} className="bg-[#14181c] border border-[#1f2329] rounded-xl group">
                    <summary className="px-5 py-4 font-semibold text-[#ffffff] text-sm cursor-pointer list-none flex items-center justify-between gap-4 hover:text-[#ddf93c] transition-colors">
                      {item.q}
                      <svg className="w-4 h-4 shrink-0 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                      </svg>
                    </summary>
                    <p className="px-5 pb-4 text-[#c9ced5] text-sm leading-relaxed">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          </motion.div>
        )}

        {/* ─── TAB: OFERTE ──────────────────────────────────────────────────── */}
        {tabActiv === "oferte" && (
          <motion.div key="oferte" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
            {faraCodd.length > 0 ? (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-xl font-black text-[#ffffff]">Oferte {nume} {an}</h2>
                  <span className="text-sm text-[#9399a0]">{faraCodd.length} oferte active</span>
                </div>
                <div className="space-y-4">
                  {faraCodd.map((promo, idx) => {
                    // Daca promotia a expirat (zile_ramase < 0) folosim quicklink magazin
                    const link     = (promo.zile_ramase >= 0 && promo.landing_page) ? promo.landing_page : (m.url_afiliat || m.url);
                    const discount = extractDiscount(promo.nume) || extractDiscount(promo.descriere || "");
                    return (
                      <div key={idx} className="bg-[#14181c] rounded-xl border border-[#1f2329] hover:shadow-lg hover:shadow-black/40 transition-all hover:border-[#2a2f36] p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              {discount && (
                                <span className="text-sm font-black text-[#ddf93c] bg-[#14181c]/50 px-2 py-0.5 rounded-lg">-{discount}</span>
                              )}
                              <span className="text-xs font-bold text-[#c3dd2c] bg-[#ddf93c]/10 px-2 py-0.5 rounded-full uppercase tracking-wide">Oferta</span>
                              {areTransportGratuit(promo) && (
                                <span className="flex items-center gap-1 text-xs font-bold text-[#ecff7a] bg-[#ddf93c]/10 border border-[#ddf93c]/30 px-2 py-0.5 rounded-full">
                                  <Truck className="w-3 h-3" /> Transport gratuit
                                </span>
                              )}
                              {promo.zile_ramase <= 1 && promo.zile_ramase >= 0 && <CountdownTimer zileRamase={promo.zile_ramase}/>}
                              {promo.zile_ramase > 1 && promo.zile_ramase <= 3 && (
                                <span className="text-xs font-bold text-[#ddf93c] bg-[#14181c]/50 px-2 py-0.5 rounded-full">Expira in {promo.zile_ramase} zile</span>
                              )}
                              {promo.zile_ramase > 3 && (
                                <span className="text-xs text-[#9399a0]">{promo.zile_ramase} zile ramase</span>
                              )}
                            </div>
                            <h3 className="font-bold text-[#ffffff] text-base mb-1">{promo.nume}</h3>
                            {promo.descriere && promo.descriere !== promo.nume && (
                              <p className="text-sm text-[#c9ced5]">{promo.descriere}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <a href={link} target="_blank" rel="sponsored noopener noreferrer"
                              className="bg-gradient-to-r from-[#ddf93c] to-[#ddf93c] hover:from-[#ddf93c] hover:to-[#ddf93c] text-[#0c1000] font-bold px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap">
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
              <div className="bg-[#14181c] rounded-xl border border-[#1f2329] p-12 text-center">
                <Tag className="w-12 h-12 mb-4 mx-auto text-[#3a4048]" />
                <h3 className="text-lg font-black text-[#ffffff] mb-2">Nicio oferta activa</h3>
                <p className="text-[#9399a0] text-sm mb-5">Revino curand. Ofertele se actualizeaza zilnic.</p>
                {cuCod.length > 0 && (
                  <button onClick={() => setTabActiv("coduri")}
                    className="bg-[#ddf93c] text-[#0c1000] font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#ddf93c] transition-colors">
                    Vezi {cuCod.length} coduri disponibile
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ─── TAB: PRODUSE ─────────────────────────────────────────────────── */}
        {tabActiv === "produse" && (
          <motion.div key="produse" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
            {produse.length > 0 ? (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-[#ffffff]">Produse {nume} cu reducere</h2>
                    <span className="text-sm text-[#9399a0]">{produse.length} produse</span>
                  </div>
                  <Link href="/produse" className="text-sm font-semibold text-[#ddf93c] hover:text-[#c3dd2c]">Toate produsele →</Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {produse.map((p, i) => <ProdusCard key={i} produs={p}/>)}
                </div>
              </section>
            ) : (
              <div className="bg-[#14181c] rounded-xl border border-[#1f2329] p-12 text-center">
                <ShoppingBag className="w-12 h-12 mb-4 mx-auto text-[#3a4048]" />
                <h3 className="text-lg font-black text-[#ffffff] mb-2">Feed produse indisponibil</h3>
                <p className="text-[#9399a0] text-sm mb-5">Produsele individuale nu sunt disponibile pentru acest magazin. Viziteaza direct site-ul.</p>
                <a href={m.url_afiliat || m.url} target="_blank" rel="sponsored noopener noreferrer"
                  className="bg-[#ddf93c] text-[#0c1000] font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#ddf93c] transition-colors">
                  Viziteaza {nume}
                </a>
              </div>
            )}
          </motion.div>
        )}

        {/* ─── TAB: RECENZII ────────────────────────────────────────────────── */}
        {tabActiv === "recenzii" && (
          <motion.div key="recenzii" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
            <ReviewSection magazin={m.magazin} />
          </motion.div>
        )}
        </AnimatePresence>

        {/* ── BOTTOM CTAs (toate tab-urile) ────────────────────────────────── */}
        <div className="mt-8 space-y-3">
          <div className="bg-gradient-to-r from-[#e2e8f0] to-[#14181c] border border-[#2a2f36] rounded-xl p-5 flex flex-col sm:flex-row items-center gap-4">
            <Puzzle className="w-8 h-8 shrink-0 text-[#ddf93c]" />
            <div className="flex-1 text-center sm:text-left">
              <p className="font-black text-[#ffffff] text-sm">Extensie Chrome AmCupon — Gratis</p>
              <p className="text-[#c9ced5] text-xs mt-0.5">Coduri de reducere aplicate automat pe orice site de shopping</p>
            </div>
            <a href="https://chromewebstore.google.com/detail/mahfankpalkgognhnllkgdkjncmmkllb"
              target="_blank" rel="noopener noreferrer"
              className="shrink-0 bg-gradient-to-r from-[#ddf93c] to-[#ddf93c] hover:from-[#ddf93c] hover:to-[#ddf93c] text-[#0c1000] font-bold text-xs px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap">
              Instaleaza gratuit →
            </a>
          </div>
          <div className="bg-[#ddf93c]/8 border border-[#ddf93c]/25 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-4">
            <Mail className="w-6 h-6 shrink-0 text-[#ddf93c]" />
            <div className="flex-1 text-center sm:text-left">
              <p className="font-bold text-[#ffffff] text-sm">Nu rata promotiile viitoare {nume}</p>
              <p className="text-[#c9ced5] text-xs mt-0.5">Saptamanal — cele mai bune coduri pe email. Gratuit.</p>
            </div>
            <Link href="/newsletter"
              className="shrink-0 bg-gradient-to-r from-[#ddf93c] to-[#ddf93c] hover:from-[#ddf93c] hover:to-[#ddf93c] text-[#0c1000] font-bold text-xs px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap">
              Aboneaza-te →
            </Link>
          </div>
        </div>


        {/* ── ARTICOL BLOG ─────────────────────────────────────────────────── */}
        {blogPost && (
          <section className="mt-10">
            <h2 className="text-lg font-black text-[#ffffff] mb-4">Ghid complet {nume}</h2>
            <a href={`/blog/${blogPost.slug}`}
              className="group flex gap-4 bg-[#14181c] border border-[#1f2329] hover:border-[#ddf93c] rounded-xl p-4 hover:shadow-lg hover:shadow-black/40 transition-all">
              <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-[#1f2329]">
                <Image src={blogPost.cover} alt={blogPost.title} fill sizes="80px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-[#ddf93c] uppercase tracking-wide">Articol blog</span>
                <p className="text-sm font-bold text-[#ffffff] mt-0.5 line-clamp-2 group-hover:text-[#ddf93c] transition-colors leading-snug">
                  {blogPost.title}
                </p>
                <p className="text-xs text-[#c9ced5] mt-1 line-clamp-2 leading-relaxed">{blogPost.excerpt}</p>
                <span className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-[#ddf93c] group-hover:text-[#c3dd2c]">
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
              <h2 className="text-lg font-black text-[#ffffff]">Magazine similare</h2>
              <Link href="/toate-magazinele" className="text-sm font-semibold text-[#ddf93c] hover:text-[#c3dd2c]">Toate →</Link>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
              {similare.map(s => {
                const numeSim = numeAfisat(s.magazin);
                const pctSim  = maxPct(s.promotii);
                return (
                  <a key={s.magazin} href={`/cod-reducere/${s.magazin}`}
                    className="group flex flex-col items-center gap-1.5 p-2.5 bg-[#14181c] rounded-xl border border-[#1f2329] hover:border-[#ddf93c] hover:shadow-sm transition-all text-center">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-[#14181c] border border-[#1f2329]">
                      {s.logo_url ? (
                        <Image src={s.logo_url} alt={numeSim} fill sizes="40px" className="object-contain p-0.5" unoptimized />
                      ) : (
                        <span className="text-base font-black text-[#9399a0]">{numeSim.charAt(0)}</span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-[#c9ced5] group-hover:text-[#ddf93c] leading-tight line-clamp-1 w-full">{numeSim}</span>
                    {pctSim > 0 ? (
                      <span className="text-[10px] font-black text-[#ddf93c]">-{pctSim}%</span>
                    ) : s.cod_cupon ? (
                      <span className="text-[10px] font-bold text-emerald-600">Cod</span>
                    ) : s.are_promotie ? (
                      <span className="text-[10px] text-[#9399a0]">Oferta</span>
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
              <h2 className="text-lg font-black text-[#ffffff]">{nume} vs alte magazine</h2>
              <Link href="/comparatii" className="text-sm font-semibold text-[#ddf93c] hover:text-[#c3dd2c]">Toate comparatiile →</Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {comparatii.map(c => (
                <Link key={c.slug} href={`/comparatii/${c.slug}`}
                  className="group flex items-center justify-between gap-3 p-4 bg-[#14181c] rounded-xl border border-[#1f2329] hover:border-[#ddf93c] transition-all">
                  <span className="text-sm font-bold text-[#c9ced5] group-hover:text-[#c3dd2c]">{c.label}</span>
                  <span className="text-xs font-semibold text-[#9399a0] group-hover:text-[#ddf93c] whitespace-nowrap">Compara →</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── DESPRE MAGAZIN (text editorial SEO) ──────────────────────────── */}
        {descriere && descriere.paragrafe?.length > 0 && (
          <section className="mt-12 bg-[#14181c] border border-[#1f2329] rounded-xl p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-black text-[#ffffff] mb-4">{descriere.titlu}</h2>
            <div className="space-y-3 text-sm sm:text-[15px] text-[#c9ced5] leading-relaxed">
              {descriere.paragrafe.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 pt-6 border-t border-[#1f2329] text-center">
          <Link href="/" className="text-sm text-[#9399a0] hover:text-[#ddf93c] transition-colors">
            ← Inapoi la toate promotiile
          </Link>
        </div>
      </div>

      <RedirectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        storeName={nume}
        redirectFailed={redirectFailed}
        onRetry={retryRedirect}
      />
    </div>
  );
}
