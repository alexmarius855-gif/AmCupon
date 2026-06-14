import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Idei Cadouri 2026 — Cadouri pentru Orice Ocazie | AmCupon.ro",
  description: "Cele mai bune idei de cadouri pentru orice ocazie: botez, nastere, Valentine, Craciun, nasi, mama, tata. Produse cu preturi reale si livrare rapida in Romania.",
  keywords: ["idei cadouri romania", "cadouri originale", "cadouri botez", "cadouri nasi", "cadouri nastere", "cadouri valentine", "cadouri craciun", "cadouri mama"],
  alternates: { canonical: "https://amcupon.ro/cadouri" },
  openGraph: {
    title: "Idei Cadouri pentru Orice Ocazie | AmCupon.ro",
    description: "Cadouri botez, nasi, Valentine, Craciun, nastere — idei originale cu preturi reale din 291+ magazine romanesti.",
    url: "https://amcupon.ro/cadouri",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

const OCAZII = [
  { slug: "ea",         emoji: "💝", titlu: "Cadouri pentru Ea",       desc: "Bijuterii, fashion, parfumuri", color: "#f43f5e", popular: true },
  { slug: "el",         emoji: "🎁", titlu: "Cadouri pentru El",       desc: "Electronice, auto, sport",     color: "#3b82f6", popular: true },
  { slug: "copii",      emoji: "🧸", titlu: "Cadouri Copii",           desc: "Jucarii, carti, sport",        color: "#a855f7", popular: true },
  { slug: "mama",       emoji: "🌸", titlu: "Cadouri Mama",            desc: "Bijuterii, cosmetice, rasfat", color: "#f43f5e", popular: true },
  { slug: "tata",       emoji: "👨", titlu: "Cadouri Tata",            desc: "Gadgeturi, auto, unelte",      color: "#1e293b", popular: false },
  { slug: "botez",      emoji: "👶", titlu: "Cadouri Botez",           desc: "Bijuterii argint, personalizate", color: "#60a5fa", popular: true },
  { slug: "nasi",       emoji: "💍", titlu: "Cadouri Nasi",            desc: "Bijuterii premium, elegante",  color: "#d97706", popular: true },
  { slug: "nastere",    emoji: "🎂", titlu: "Cadouri Nastere",         desc: "Bijuterii, parfumuri, gadgeturi", color: "#f97316", popular: false },
  { slug: "valentine",  emoji: "❤️", titlu: "Valentine's Day",         desc: "Bijuterii romantice, parfumuri", color: "#ef4444", popular: false },
  { slug: "craciun",    emoji: "🎄", titlu: "Cadouri Craciun",         desc: "Cadouri pentru toata familia", color: "#16a34a", popular: false },
  { slug: "absolvire",  emoji: "🎓", titlu: "Cadouri Absolvire",       desc: "Gadgeturi, bijuterii, carti",  color: "#7c3aed", popular: false },
  { slug: "pasti",      emoji: "🐣", titlu: "Cadouri Paste",           desc: "Seturi cadou, bijuterii, flori", color: "#84cc16", popular: false },
];

const SFATURI = [
  { emoji: "🎯", titlu: "Personalizeaza cadoul", desc: "Un cadou cu gravura sau personalizat cu numele destinatarului are valoare emotionala mult mai mare." },
  { emoji: "💰", titlu: "Buget recomandat", desc: "Nasi/Fini: 300-1000 RON. Familie apropiata: 150-500 RON. Prieteni: 50-200 RON. Colegi: 30-100 RON." },
  { emoji: "⏰", titlu: "Comanda din timp", desc: "Magazinele livreaza in 24-48h, dar in perioada sarbatorilor comanda cu 5-7 zile inainte pentru siguranta." },
  { emoji: "📦", titlu: "Ambalaj premium", desc: "Multe magazine ofera ambalaj cadou gratuit sau contra cost. Intreaba la checkout — face diferenta!" },
];

export default function CadouriPage() {
  const populare = OCAZII.filter(o => o.popular);
  const altele   = OCAZII.filter(o => !o.popular);

  return (
    <div className="min-h-screen bg-slate-950">

      {/* Header breadcrumb */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm">
          <Link href="/" className="flex items-center gap-1.5 shrink-0">
            <div className="bg-orange-500 text-white font-black text-sm px-1.5 py-0.5 rounded-md">Am</div>
            <span className="font-black text-white">Cupon.ro</span>
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-slate-300 font-semibold">Idei Cadouri</span>
        </div>
      </header>

      {/* Hero */}
      <div className="relative py-12 px-4 text-center overflow-hidden border-b border-slate-800"
        style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(236,72,153,0.06) 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(249,115,22,0.12) 0%, transparent 70%)" }} />
        <div className="relative max-w-3xl mx-auto">
          <div className="text-5xl mb-4">🎁</div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
            Idei Cadouri pentru Orice Ocazie
          </h1>
          <p className="text-slate-400 text-base mb-6 max-w-xl mx-auto">
            De la botez la Craciun, de la nasi la mama — gasesti cadoul perfect
            din <span className="text-white font-bold">291+ magazine</span> partenere cu livrare in Romania.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            {[
              { v: "12", l: "Ocazii acoperite" },
              { v: "6000+", l: "Produse disponibile" },
              { v: "291+", l: "Magazine partenere" },
              { v: "24h", l: "Livrare medie" },
            ].map(s => (
              <div key={s.l} className="bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-2 text-center">
                <div className="text-orange-400 font-black text-lg">{s.v}</div>
                <div className="text-slate-500 text-xs">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* Ocazii populare */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-black text-white">Ocazii populare</h2>
            <span className="text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full font-bold">TRENDING</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {populare.map(o => (
              <Link
                key={o.slug}
                href={`/cadouri/${o.slug}`}
                className="group relative rounded-2xl overflow-hidden border border-slate-800 hover:border-slate-600 transition-all hover:-translate-y-1 hover:shadow-xl"
                style={{ background: `linear-gradient(135deg, ${o.color}15 0%, ${o.color}08 100%)` }}
              >
                <div className="p-5">
                  <div className="text-4xl mb-3">{o.emoji}</div>
                  <h3 className="text-white font-black text-base mb-1 group-hover:text-orange-300 transition-colors">{o.titlu}</h3>
                  <p className="text-slate-500 text-xs mb-3">{o.desc}</p>
                  <div
                    className="inline-flex items-center gap-1 text-xs font-bold"
                    style={{ color: o.color }}
                  >
                    Vezi idei <span>→</span>
                  </div>
                </div>
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 opacity-40 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(90deg, ${o.color}, transparent)` }}
                />
              </Link>
            ))}
          </div>
        </section>

        {/* Alte ocazii */}
        <section className="mb-12">
          <h2 className="text-lg font-black text-white mb-4">Toate ocaziile</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {altele.map(o => (
              <Link
                key={o.slug}
                href={`/cadouri/${o.slug}`}
                className="group flex flex-col items-center text-center bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-4 transition-all hover:-translate-y-0.5"
              >
                <div className="text-3xl mb-2">{o.emoji}</div>
                <div className="text-white text-xs font-bold group-hover:text-orange-300 transition-colors">{o.titlu}</div>
                <div className="text-slate-600 text-[10px] mt-1">{o.desc}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Sfaturi */}
        <section className="mb-10">
          <h2 className="text-lg font-black text-white mb-4">Sfaturi pentru alegerea cadoului perfect</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SFATURI.map((s, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-2xl mb-2">{s.emoji}</div>
                <h3 className="text-sm font-bold text-white mb-1">{s.titlu}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Link magazine relevante */}
        <section className="border-t border-slate-800 pt-8">
          <h2 className="text-base font-bold text-white mb-4">Magazine recomandate pentru cadouri</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/noriel", label: "Noriel — Jucarii" },
              { href: "/elefant", label: "Elefant — Carti & Cadouri" },
              { href: "/notino", label: "Notino — Parfumuri" },
              { href: "/fashiondays", label: "FashionDays — Fashion" },
              { href: "/bijuterii", label: "Bijuterii & Ceasuri" },
              { href: "/sport", label: "Sport & Fitness" },
              { href: "/idei-cadouri", label: "Idei Cadouri — Ghid complet" },
            ].map(m => (
              <Link
                key={m.href}
                href={m.href}
                className="text-sm text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-orange-500/40 px-3 py-2 rounded-lg transition-all"
              >
                {m.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
