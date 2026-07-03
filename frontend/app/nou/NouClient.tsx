"use client";

import { useRef } from "react";
import Link from "next/link";

interface Offer {
  magazin: string; nume: string; logo: string;
  categorie: string; promo: string; cod: boolean;
}
interface Props {
  offers: Offer[];
  stats: { magazine: number; oferte: number; coduri: number };
}

// Card cu tilt 3D la miscarea mouse-ului (perspectiva) — pur CSS + un handler mic.
function Tilt({ children, className, max = 10 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  function move(e: React.MouseEvent) {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * max}deg) rotateX(${-y * max}deg) translateY(-4px)`;
  }
  function leave() { if (ref.current) ref.current.style.transform = ""; }
  return (
    <div ref={ref} onMouseMove={move} onMouseLeave={leave}
      className={className} style={{ transition: "transform .18s ease-out", transformStyle: "preserve-3d" }}>
      {children}
    </div>
  );
}

// Categorii cu gradient propriu vibrant (paleta libera acum — inclusiv cald)
const CATS = [
  { nume: "Fashion", slug: "fashion", g: "linear-gradient(135deg,#ec4899,#f97316)" },
  { nume: "Electronice", slug: "electronice-itc", g: "linear-gradient(135deg,#3b82f6,#22d3ee)" },
  { nume: "Frumusete", slug: "beauty", g: "linear-gradient(135deg,#d946ef,#8b5cf6)" },
  { nume: "Casa & Gradina", slug: "home-garden", g: "linear-gradient(135deg,#10b981,#22d3ee)" },
  { nume: "Sport", slug: "sports-outdoors", g: "linear-gradient(135deg,#f59e0b,#ef4444)" },
  { nume: "Sanatate", slug: "health-personal-care", g: "linear-gradient(135deg,#14b8a6,#3b82f6)" },
  { nume: "Copii", slug: "babies-kids-toys", g: "linear-gradient(135deg,#f97316,#facc15)" },
  { nume: "Calatorie", slug: "travel-holidays", g: "linear-gradient(135deg,#6366f1,#ec4899)" },
];

export default function NouClient({ offers, stats }: Props) {
  return (
    <div className="relative min-h-screen bg-[#05060f] text-white overflow-hidden">
      <style>{`
        @keyframes blob { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(60px,-40px) scale(1.15)} 66%{transform:translate(-40px,30px) scale(.9)} }
        @keyframes gshift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes floaty { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .animate-blob{animation:blob 18s ease-in-out infinite}
        .grad-text{background:linear-gradient(90deg,#f97316,#ec4899,#8b5cf6,#22d3ee,#f97316);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:gshift 8s ease infinite}
        .glass{background:rgba(255,255,255,.06);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.12)}
      `}</style>

      {/* ── MESH ANIMAT MULTICOLOR ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -top-32 -left-20 w-[520px] h-[520px] rounded-full" style={{ background: "radial-gradient(circle,#f97316,transparent 70%)", filter: "blur(60px)", opacity: .55, mixBlendMode: "screen" }} />
        <div className="animate-blob absolute top-10 right-0 w-[560px] h-[560px] rounded-full" style={{ background: "radial-gradient(circle,#ec4899,transparent 70%)", filter: "blur(70px)", opacity: .5, mixBlendMode: "screen", animationDelay: "-6s" }} />
        <div className="animate-blob absolute top-40 left-1/3 w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle,#8b5cf6,transparent 70%)", filter: "blur(70px)", opacity: .5, mixBlendMode: "screen", animationDelay: "-3s" }} />
        <div className="animate-blob absolute -bottom-20 right-1/4 w-[520px] h-[520px] rounded-full" style={{ background: "radial-gradient(circle,#22d3ee,transparent 70%)", filter: "blur(70px)", opacity: .45, mixBlendMode: "screen", animationDelay: "-9s" }} />
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)", backgroundSize: "48px 48px", maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%,#000,transparent)" }} />
      </div>

      {/* ── NAV ── */}
      <header className="relative z-20 max-w-7xl mx-auto px-5 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5">
          <span className="font-black text-lg px-2 py-1 rounded-lg text-white" style={{ background: "linear-gradient(135deg,#f97316,#ec4899)" }}>Am</span>
          <span className="font-black text-xl">Cupon<span className="grad-text">.ro</span></span>
        </Link>
        <div className="hidden sm:flex items-center gap-6 text-sm font-semibold text-white/70">
          <Link href="/top-reduceri" className="hover:text-white transition">Oferte</Link>
          <Link href="/produse" className="hover:text-white transition">Produse</Link>
          <Link href="/blog" className="hover:text-white transition">Revista</Link>
          <Link href="/newsletter" className="glass px-4 py-2 rounded-full text-white hover:bg-white/10 transition">Newsletter</Link>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-5 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs font-semibold text-white/80 mb-8" style={{ animation: "floaty 4s ease-in-out infinite" }}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {stats.oferte} oferte verificate astazi
        </div>
        <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight">
          Reduceri reale.<br />
          <span className="grad-text">Coduri care merg.</span>
        </h1>
        <p className="mt-6 text-lg text-white/60 max-w-xl mx-auto">
          Peste {stats.magazine.toLocaleString("ro-RO")} magazine din Romania, verificate zilnic. Gasesti codul, copiezi, economisesti.
        </p>

        {/* Search glass */}
        <div className="mt-9 max-w-xl mx-auto">
          <div className="glass rounded-2xl p-1.5 flex items-center gap-2 shadow-2xl shadow-black/40">
            <input placeholder="Cauta eMAG, Notino, Answear..." className="flex-1 bg-transparent px-4 py-3 text-white placeholder-white/40 outline-none" />
            <Link href="/toate-magazinele" className="rounded-xl px-6 py-3 font-bold text-white shrink-0" style={{ background: "linear-gradient(135deg,#f97316,#ec4899)" }}>Cauta</Link>
          </div>
        </div>

        {/* Stat pills */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {[
            { n: stats.magazine.toLocaleString("ro-RO"), l: "magazine" },
            { n: stats.coduri.toLocaleString("ro-RO"), l: "coduri active" },
            { n: stats.oferte.toLocaleString("ro-RO"), l: "oferte azi" },
            { n: "100%", l: "gratuit" },
          ].map(s => (
            <div key={s.l} className="glass rounded-2xl px-5 py-3">
              <div className="text-xl font-black grad-text">{s.n}</div>
              <div className="text-[11px] text-white/50">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORII (tilt 3D, gradient vibrant) ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 py-14">
        <h2 className="text-2xl md:text-3xl font-black mb-8 text-center">Alege categoria ta</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATS.map(c => (
            <Link key={c.slug} href={`/categorii/${c.slug}`}>
              <Tilt className="relative rounded-3xl p-6 h-36 flex flex-col justify-end overflow-hidden group cursor-pointer">
                <div className="absolute inset-0" style={{ background: c.g, opacity: .9 }} />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition" style={{ background: "radial-gradient(circle at 50% 0%,rgba(255,255,255,.4),transparent 60%)" }} />
                <span className="relative text-white font-black text-lg drop-shadow-lg">{c.nume}</span>
                <span className="relative text-white/80 text-xs">Vezi ofertele →</span>
              </Tilt>
            </Link>
          ))}
        </div>
      </section>

      {/* ── OFERTE (glass cards + tilt) ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 py-14">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-black">Cele mai cautate acum</h2>
          <Link href="/top-reduceri" className="text-sm font-bold grad-text">Vezi toate →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {offers.map(o => (
            <Link key={o.magazin} href={`/cod-reducere/${o.magazin}`}>
              <Tilt max={8} className="glass rounded-3xl p-5 h-full flex flex-col cursor-pointer group">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={o.logo} alt={o.nume} className="w-full h-full object-contain p-1" loading="lazy" />
                  </span>
                  <div className="min-w-0">
                    <div className="font-black text-white truncate">{o.nume}</div>
                    <div className="text-[11px] text-white/50 truncate">{o.categorie}</div>
                  </div>
                </div>
                <p className="text-sm text-white/70 line-clamp-2 flex-1">{o.promo}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${o.cod ? "text-cyan-300 bg-cyan-400/15 border border-cyan-400/25" : "text-pink-300 bg-pink-400/15 border border-pink-400/25"}`}>
                    {o.cod ? "COD REDUCERE" : "OFERTA ACTIVA"}
                  </span>
                  <span className="text-sm font-bold text-white/80 group-hover:text-white transition">→</span>
                </div>
              </Tilt>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="relative z-10 max-w-4xl mx-auto px-5 py-20 text-center">
        <div className="relative rounded-[2rem] p-10 md:p-14 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#f97316,#ec4899,#8b5cf6)", opacity: .9 }} />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-black text-white">Nu rata nicio reducere</h2>
            <p className="mt-3 text-white/85 max-w-md mx-auto">Codurile zilei direct pe email. Gratuit, fara spam, dezabonare cu un click.</p>
            <Link href="/newsletter" className="inline-block mt-7 bg-white text-slate-900 font-black px-8 py-3.5 rounded-full hover:scale-105 transition">
              Ma abonez gratuit
            </Link>
          </div>
        </div>
        <p className="mt-10 text-white/30 text-sm">
          Preview design nou · <Link href="/" className="underline hover:text-white/60">inapoi la site-ul actual</Link>
        </p>
      </section>
    </div>
  );
}
