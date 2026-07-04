"use client";

import { useState } from "react";
import Link from "next/link";

interface Offer {
  magazin: string; nume: string; logo: string;
  categorie: string; promo: string; code: string;
  disc: number; zile: number;
}
interface Props {
  offers: Offer[];
  stats: { magazine: number; oferte: number; coduri: number };
}

const SECTION_BG = "#0a0b16"; // fundal sectiune bilete — notch-urile au aceeasi culoare

// Confetti pur JS (fara librarie) — explozie mica la "ruperea" biletului.
function burst(x: number, y: number) {
  const colors = ["#f97316", "#ec4899", "#8b5cf6", "#22d3ee", "#facc15", "#34d399"];
  for (let i = 0; i < 26; i++) {
    const p = document.createElement("span");
    const c = colors[i % colors.length];
    p.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:9px;height:9px;border-radius:2px;background:${c};pointer-events:none;z-index:9999`;
    document.body.appendChild(p);
    const ang = Math.random() * Math.PI * 2;
    const dist = 70 + Math.random() * 90;
    const dx = Math.cos(ang) * dist;
    const dy = Math.sin(ang) * dist - 50;
    p.animate(
      [{ transform: "translate(0,0) scale(1)", opacity: 1 },
       { transform: `translate(${dx}px,${dy + 140}px) rotate(${Math.random() * 540}deg) scale(.3)`, opacity: 0 }],
      { duration: 850 + Math.random() * 500, easing: "cubic-bezier(.2,.7,.3,1)" }
    ).onfinish = () => p.remove();
  }
}

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
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);

  function rupe(o: Offer, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!o.code) { window.location.href = `/cod-reducere/${o.magazin}`; return; }
    setRevealed(prev => new Set(prev).add(o.magazin));
    navigator.clipboard.writeText(o.code).catch(() => {});
    burst(e.clientX, e.clientY);
    setCopied(o.magazin);
    setTimeout(() => setCopied(c => (c === o.magazin ? null : c)), 2500);
  }

  const ticker = offers.slice(0, 8).map((o, i) => ({ t: (i + 1) * 3, nume: o.nume, cod: !!o.code }));

  return (
    <div className="relative min-h-screen text-white overflow-hidden" style={{ background: "#05060f" }}>
      <style>{`
        @keyframes blob{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(60px,-40px) scale(1.15)}66%{transform:translate(-40px,30px) scale(.9)}}
        @keyframes gshift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        @keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
        @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes stamp{0%{transform:scale(1.6) rotate(-8deg);opacity:0}60%{transform:scale(.92) rotate(2deg);opacity:1}100%{transform:scale(1) rotate(0)}}
        @keyframes pulseGlow{0%,100%{box-shadow:0 0 0 0 rgba(249,115,22,.0)}50%{box-shadow:0 0 22px 2px rgba(249,115,22,.45)}}
        .stub-glow{animation:pulseGlow 2.4s ease-in-out infinite}
        .animate-blob{animation:blob 18s ease-in-out infinite}
        .grad-text{background:linear-gradient(90deg,#f97316,#ec4899,#8b5cf6,#22d3ee,#f97316);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:gshift 8s ease infinite}
        .glass{background:rgba(255,255,255,.06);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.12)}
        .stamp{animation:stamp .35s cubic-bezier(.2,.8,.3,1)}
      `}</style>

      {/* MESH multicolor */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -top-32 -left-20 w-[520px] h-[520px] rounded-full" style={{ background: "radial-gradient(circle,#f97316,transparent 70%)", filter: "blur(60px)", opacity: .5, mixBlendMode: "screen" }} />
        <div className="animate-blob absolute top-10 right-0 w-[560px] h-[560px] rounded-full" style={{ background: "radial-gradient(circle,#ec4899,transparent 70%)", filter: "blur(70px)", opacity: .45, mixBlendMode: "screen", animationDelay: "-6s" }} />
        <div className="animate-blob absolute top-52 left-1/3 w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle,#8b5cf6,transparent 70%)", filter: "blur(70px)", opacity: .45, mixBlendMode: "screen", animationDelay: "-3s" }} />
      </div>

      {/* NAV */}
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

      {/* HERO */}
      <section className="relative z-10 max-w-5xl mx-auto px-5 pt-14 pb-10 text-center">
        <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs font-semibold text-white/80 mb-7" style={{ animation: "floaty 4s ease-in-out infinite" }}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {stats.oferte} oferte verificate astazi
        </div>
        <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight">
          Rupe biletul.<br /><span className="grad-text">Ia codul.</span>
        </h1>
        <p className="mt-6 text-lg text-white/60 max-w-xl mx-auto">
          Peste {stats.magazine.toLocaleString("ro-RO")} magazine din Romania. Apesi pe bilet, se dezvaluie codul, il copiezi si economisesti.
        </p>
        <div className="mt-8 max-w-xl mx-auto">
          <div className="glass rounded-2xl p-1.5 flex items-center gap-2 shadow-2xl shadow-black/40">
            <input placeholder="Cauta eMAG, Notino, Answear..." className="flex-1 bg-transparent px-4 py-3 text-white placeholder-white/40 outline-none" />
            <Link href="/toate-magazinele" className="rounded-xl px-6 py-3 font-bold text-white shrink-0" style={{ background: "linear-gradient(135deg,#f97316,#ec4899)" }}>Cauta</Link>
          </div>
        </div>
      </section>

      {/* TICKER LIVE */}
      <div className="relative z-10 border-y border-white/10 bg-white/[.03] overflow-hidden py-3">
        <div className="flex whitespace-nowrap" style={{ animation: "marquee 32s linear infinite", width: "max-content" }}>
          {[...ticker, ...ticker].map((t, i) => (
            <span key={i} className="mx-6 text-sm text-white/70 inline-flex items-center gap-2">
              <span className="text-orange-400">🔥</span>
              <span className="text-white/40">acum {t.t} min —</span>
              <span className="font-bold text-white">{t.cod ? "cod nou" : "oferta noua"} la {t.nume}</span>
            </span>
          ))}
        </div>
      </div>

      {/* BILETE (oferte) */}
      <section className="relative z-10 py-16" style={{ background: SECTION_BG }}>
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex items-end justify-between mb-9">
            <div>
              <h2 className="text-2xl md:text-3xl font-black">Biletele zilei</h2>
              <p className="text-white/50 text-sm mt-1">Apasa pe partea dreapta ca sa rupi biletul si sa vezi codul.</p>
            </div>
            <Link href="/top-reduceri" className="text-sm font-bold grad-text shrink-0">Vezi toate →</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offers.map(o => {
              const isRevealed = revealed.has(o.magazin);
              const isCopied = copied === o.magazin;
              return (
                <div key={o.magazin} className="relative flex rounded-2xl overflow-visible shadow-xl shadow-black/40 hover:-translate-y-0.5 transition-transform" style={{ minHeight: 140 }}>
                  {/* Partea principala (info) — link spre magazin */}
                  <Link href={`/cod-reducere/${o.magazin}`}
                    className="flex-1 glass rounded-l-2xl p-5 flex items-center gap-4 hover:bg-white/[.09] transition-colors"
                    style={{ borderRight: "none" }}>
                    <span className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={o.logo} alt={o.nume} className="w-full h-full object-contain p-1.5" loading="lazy" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 mb-0.5">
                        <span className="font-black text-white text-lg truncate">{o.nume}</span>
                        {o.disc > 0 && (
                          <span className="shrink-0 text-xs font-black text-white px-2 py-0.5 rounded-md" style={{ background: "linear-gradient(135deg,#f97316,#ec4899)" }}>-{o.disc}%</span>
                        )}
                      </span>
                      <span className="block text-[11px] text-white/45 mb-1.5">{o.categorie}</span>
                      <span className="block text-sm text-white/70 line-clamp-2">{o.promo}</span>
                      <span className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />verificat azi
                        </span>
                        {o.zile > 0 && o.zile <= 3 && (
                          <span className="text-[10px] font-bold text-rose-300 bg-rose-500/15 border border-rose-500/25 px-1.5 py-0.5 rounded-full">⏳ expira in {o.zile}z</span>
                        )}
                      </span>
                    </span>
                  </Link>

                  {/* Linie de rupere perforata + notch-uri */}
                  <div className="relative w-0 z-10">
                    <div className="absolute top-1.5 bottom-1.5 -left-[3px] w-1.5" style={{ backgroundImage: `radial-gradient(circle at center, ${SECTION_BG} 2.5px, transparent 3px)`, backgroundSize: "100% 12px" }} />
                    <span className="absolute -top-2.5 -left-2.5 w-5 h-5 rounded-full" style={{ background: SECTION_BG }} />
                    <span className="absolute -bottom-2.5 -left-2.5 w-5 h-5 rounded-full" style={{ background: SECTION_BG }} />
                  </div>

                  {/* Stub (cod) — se "rupe" la click */}
                  <button onClick={(e) => rupe(o, e)}
                    className={`w-40 shrink-0 rounded-r-2xl px-4 flex flex-col items-center justify-center text-center relative overflow-hidden group ${o.code && !isRevealed ? "stub-glow" : ""}`}
                    style={{ background: o.code ? "linear-gradient(135deg,#f97316,#ec4899)" : "linear-gradient(135deg,#6366f1,#22d3ee)" }}>
                    {o.code ? (
                      isRevealed ? (
                        <>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-white/80">{isCopied ? "Copiat!" : "Codul tau"}</span>
                          <span className="stamp font-mono font-black text-white text-lg tracking-widest mt-0.5 break-all">{o.code}</span>
                          <span className="text-[10px] text-white/85 mt-1 underline">mergi la magazin →</span>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl mb-1">🎟️</span>
                          <span className="text-xs font-black text-white uppercase tracking-wide leading-tight">Rupe biletul</span>
                          <span className="text-[10px] text-white/80 mt-0.5">vezi codul</span>
                        </>
                      )
                    ) : (
                      <>
                        <span className="text-xl mb-1">→</span>
                        <span className="text-xs font-black text-white uppercase tracking-wide">Vezi oferta</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CATEGORII */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 py-16">
        <h2 className="text-2xl md:text-3xl font-black mb-8 text-center">Alege categoria ta</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATS.map(c => (
            <Link key={c.slug} href={`/categorii/${c.slug}`}
              className="relative rounded-3xl p-6 h-32 flex flex-col justify-end overflow-hidden group hover:-translate-y-1 transition-transform">
              <div className="absolute inset-0" style={{ background: c.g, opacity: .92 }} />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition" style={{ background: "radial-gradient(circle at 50% 0%,rgba(255,255,255,.4),transparent 60%)" }} />
              <span className="relative text-white font-black text-lg drop-shadow-lg">{c.nume}</span>
              <span className="relative text-white/80 text-xs">Vezi ofertele →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-5 py-16 text-center">
        <div className="relative rounded-[2rem] p-10 md:p-14 overflow-hidden">
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,#f97316,#ec4899,#8b5cf6)", opacity: .92 }} />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-black text-white">Primesti biletele zilei pe email</h2>
            <p className="mt-3 text-white/85 max-w-md mx-auto">Cele mai bune coduri, in fiecare zi. Gratuit, fara spam.</p>
            <Link href="/newsletter" className="inline-block mt-7 bg-white text-slate-900 font-black px-8 py-3.5 rounded-full hover:scale-105 transition">Ma abonez gratuit</Link>
          </div>
        </div>
        <p className="mt-10 text-white/30 text-sm">Preview design nou · <Link href="/" className="underline hover:text-white/60">inapoi la site-ul actual</Link></p>
      </section>
    </div>
  );
}
