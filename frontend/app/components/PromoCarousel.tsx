"use client";

import { useRef, useState, useEffect } from "react";

export interface PromoBanner {
  magazin: string;
  nume: string;
  logo?: string;
  discount: number;
  cod?: string;
  text: string;
  url: string;
}

// Gradienturi vii, alternante (teal principal + accente proaspete) — fara auriu
const GRADS = [
  "from-[#0d9488] to-[#0f766e]", // teal
  "from-[#f97316] to-[#ef4444]", // coral
  "from-[#2563eb] to-[#1d4ed8]", // albastru
  "from-[#14b8a6] to-[#0d9488]", // teal deschis
  "from-[#ec4899] to-[#db2777]", // roz
  "from-[#8b5cf6] to-[#6d28d9]", // violet
];

export default function PromoCarousel({ banners }: { banners: PromoBanner[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function scrollTo(i: number) {
    const el = ref.current;
    if (!el) return;
    const card = el.children[i] as HTMLElement | undefined;
    if (card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: "smooth" });
  }

  function nav(dir: number) {
    const next = (active + dir + banners.length) % banners.length;
    setActive(next);
    scrollTo(next);
  }

  // Auto-avans la 5s (pauza pe hover prin logica de mai jos ar complica; pastram simplu)
  useEffect(() => {
    if (banners.length <= 2) return;
    const t = setInterval(() => {
      setActive((a) => {
        const n = (a + 1) % banners.length;
        scrollTo(n);
        return n;
      });
    }, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banners.length]);

  function onScroll() {
    const el = ref.current;
    if (!el) return;
    let best = 0, bd = Infinity;
    for (let i = 0; i < el.children.length; i++) {
      const c = el.children[i] as HTMLElement;
      const d = Math.abs(c.offsetLeft - el.offsetLeft - el.scrollLeft);
      if (d < bd) { bd = d; best = i; }
    }
    setActive(best);
  }

  if (!banners.length) return null;

  return (
    <div className="relative">
      <div
        ref={ref}
        onScroll={onScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {banners.map((b, i) => (
          <a
            key={b.magazin + i}
            href={b.url}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className={`snap-start shrink-0 w-full md:w-[calc(50%-8px)] rounded-xl overflow-hidden bg-gradient-to-br ${GRADS[i % GRADS.length]} p-6 flex items-center gap-4 min-h-[190px] group`}
          >
            <div className="flex-1 text-white min-w-0">
              <div className="inline-flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-black leading-none tracking-tight">-{b.discount}%</span>
                {b.cod && (
                  <span className="text-[10px] font-black uppercase bg-white/20 border border-white/30 px-1.5 py-0.5 rounded-md tracking-wide">cod</span>
                )}
              </div>
              <div className="font-black text-lg mt-2.5 truncate">{b.nume}</div>
              <p className="text-white/85 text-sm mt-1 line-clamp-2 leading-snug">{b.text}</p>
              <span className="inline-flex items-center gap-1 mt-4 bg-white text-[#0f172a] font-bold text-sm px-4 py-2 rounded-lg group-hover:gap-2 transition-all">
                Vezi oferta →
              </span>
            </div>
            {b.logo && (
              <div className="w-20 h-20 rounded-xl bg-white flex items-center justify-center p-2 shrink-0 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.logo} alt={b.nume} className="max-w-full max-h-full object-contain" loading="lazy" />
              </div>
            )}
          </a>
        ))}
      </div>

      {/* Sageti */}
      {banners.length > 2 && (
        <>
          <button onClick={(e) => { e.preventDefault(); nav(-1); }} aria-label="Anterior"
            className="hidden sm:flex absolute -left-3 top-[85px] -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg border border-[#e2e8f0] items-center justify-center text-[#0f172a] hover:bg-[#f1f5f9] hover:border-[#14b8a6] transition-colors z-10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={(e) => { e.preventDefault(); nav(1); }} aria-label="Urmator"
            className="hidden sm:flex absolute -right-3 top-[85px] -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg border border-[#e2e8f0] items-center justify-center text-[#0f172a] hover:bg-[#f1f5f9] hover:border-[#14b8a6] transition-colors z-10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </button>
        </>
      )}

      {/* Puncte */}
      {banners.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {banners.map((_, i) => (
            <button key={i} onClick={() => { setActive(i); scrollTo(i); }} aria-label={`Banner ${i + 1}`}
              className={`h-2 rounded-full transition-all ${i === active ? "w-6 bg-[#0d9488]" : "w-2 bg-[#cbd5e1] hover:bg-[#94a3b8]"}`} />
          ))}
        </div>
      )}
    </div>
  );
}
