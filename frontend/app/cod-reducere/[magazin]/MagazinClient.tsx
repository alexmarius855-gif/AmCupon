"use client";

import { useState } from "react";

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
}

interface MagazinSimilar {
  magazin: string;
  logo_url?: string;
  are_promotie: boolean;
  cod_cupon: boolean;
  promotii: { nume: string }[];
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

function numeAfisat(magazin: string): string {
  return magazin
    .split(".")[0]
    .replace(/-/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
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

function ProdusCard({ produs: p }: { produs: Produs }) {
  const [imgOk, setImgOk] = useState(true);
  const hasDiscount = p.discount_pct > 0 && p.old_price;
  return (
    <a href={p.url} target="_blank" rel="sponsored noopener noreferrer"
      className="group bg-white border border-gray-200 hover:border-orange-300 rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 duration-200 flex flex-col">
      <div className="relative bg-gray-50 overflow-hidden" style={{aspectRatio:"1"}}>
        {p.image && imgOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image} alt={p.title} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgOk(false)} loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🛍️</div>
        )}
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full shadow-sm">
            -{p.discount_pct}%
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs text-gray-500 mb-1 line-clamp-1">{p.brand || p.category}</p>
        <p className="text-sm font-semibold text-gray-900 line-clamp-2 flex-1 group-hover:text-orange-600 transition-colors leading-snug">
          {p.title}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-black text-orange-600 text-base">
            {p.price > 0 ? `${p.price.toFixed(2)} lei` : "Vezi prețul"}
          </span>
          {hasDiscount && p.old_price && (
            <span className="text-xs text-gray-400 line-through">{p.old_price.toFixed(2)} lei</span>
          )}
        </div>
        <div className="mt-2 text-xs font-bold text-orange-500 group-hover:text-orange-600 flex items-center gap-1">
          Cumpără acum
          <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </a>
  );
}

export default function MagazinClient({ magazin: m, produse = [], similare = [] }: { magazin: Magazin; produse?: Produs[]; similare?: MagazinSimilar[] }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [copiat, setCopiat] = useState<number | null>(null);
  const [imgOk, setImgOk] = useState(true);

  const nume = numeAfisat(m.magazin);
  const an = new Date().getFullYear();
  const initiala = nume.charAt(0).toUpperCase();

  const culoriInitiala = [
    "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500",
    "bg-indigo-500", "bg-teal-500", "bg-red-500", "bg-yellow-500",
  ];
  const culoare = culoriInitiala[initiala.charCodeAt(0) % culoriInitiala.length];

  function copiazaCod(idx: number, cod: string) {
    setRevealed((prev) => new Set(prev).add(idx));
    navigator.clipboard.writeText(cod).catch(() => {});
    setCopiat(idx);
    setTimeout(() => setCopiat(null), 3000);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── HEADER dark ────────────────────────────────────────────────── */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <a href="/" className="flex items-center gap-1.5 shrink-0">
            <div className="bg-orange-500 text-white font-black text-base px-2 py-1 rounded-lg">Am</div>
            <span className="font-black text-white text-xl">Cupon</span>
            <span className="text-orange-500 font-black text-xl">.ro</span>
          </a>
          <span className="text-slate-600">/</span>
          <a href="/toate-magazinele" className="text-sm text-slate-400 hover:text-white transition-colors">Magazine</a>
          <span className="text-slate-600">/</span>
          <span className="text-sm font-semibold text-slate-300 truncate max-w-[160px]">{nume}</span>
        </div>
      </header>

      {/* ── HERO dark ──────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-b border-slate-700 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

            {/* Logo */}
            <div className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center bg-white border border-slate-700 p-1.5 shrink-0 shadow-xl shadow-black/30">
              {m.logo_url && imgOk ? (
                <img
                  src={m.logo_url}
                  alt={`Logo ${nume}`}
                  className="w-full h-full object-contain"
                  onError={() => setImgOk(false)}
                />
              ) : (
                <div className={`w-full h-full rounded-xl ${culoare} flex items-center justify-center`}>
                  <span className="text-white font-black text-4xl">{initiala}</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-black text-white">
                  Cod Reducere {nume} {an}
                </h1>
                {m.rank && m.rank <= 20 && (
                  <span className="text-xs font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 px-2 py-0.5 rounded-full">
                    Top #{m.rank} Romania
                  </span>
                )}
                {m.exclusiv && (
                  <span className="text-xs font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full">
                    Exclusiv
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm mb-4">{m.categorie}</p>

              {/* Stats pills */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-5">
                {m.promotii.length > 0 && (
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {m.promotii.length} {m.promotii.length === 1 ? "oferta activa" : "oferte active"}
                  </div>
                )}
                {m.cod_cupon && (
                  <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold px-3 py-1.5 rounded-full">
                    🎟 {m.procent_succes}% rata succes
                  </div>
                )}
                {m.folosit_de > 0 && (
                  <div className="flex items-center gap-1.5 bg-slate-700/60 border border-slate-600 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-full">
                    👤 Folosit de {m.folosit_de}x
                  </div>
                )}
                {m.trend > 0 && (
                  <div className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                    ↑ Trending +{m.trend}%
                  </div>
                )}
              </div>

              <a
                href={m.url_afiliat || m.url}
                target="_blank"
                rel="sponsored noopener noreferrer"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-orange-500/25"
              >
                Viziteaza {nume}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* PROMOTII */}
        {m.promotii.length > 0 ? (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">LIVE</span>
              <h2 className="text-xl font-black text-gray-900">Promoții Active {an}</h2>
              <span className="text-sm text-gray-400">{m.promotii.length} oferte</span>
            </div>

            <div className="space-y-4">
              {m.promotii.map((promo, idx) => {
                const link = promo.landing_page || m.url_afiliat || m.url;
                const discount = extractDiscount(promo.nume) || extractDiscount(promo.descriere || "");
                const isRevealed = revealed.has(idx);
                const isCopiat = copiat === idx;

                return (
                  <div key={idx} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {discount && (
                            <span className="text-sm font-black text-orange-500 bg-orange-50 px-2 py-0.5 rounded-lg">
                              -{discount}
                            </span>
                          )}
                          {promo.cod_cupon && (
                            <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                              Cod Reducere
                            </span>
                          )}
                          {promo.zile_ramase <= 3 && (
                            <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                              Expiră în {promo.zile_ramase}z
                            </span>
                          )}
                          {promo.zile_ramase > 3 && (
                            <span className="text-xs text-gray-400">
                              {promo.zile_ramase} zile rămase
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-900 text-base mb-1">{promo.nume}</h3>
                        {promo.descriere && promo.descriere !== promo.nume && (
                          <p className="text-sm text-gray-500">{promo.descriere}</p>
                        )}
                      </div>

                      <div className="shrink-0 w-full sm:w-48">
                        {promo.cod_cupon ? (
                          isRevealed ? (
                            <div className="space-y-2">
                              <div className="border-2 border-dashed border-orange-400 rounded-xl py-2.5 px-3 text-center bg-orange-50">
                                <span className="font-mono font-black text-orange-600 tracking-widest text-sm">
                                  {promo.cod_cupon}
                                </span>
                                {isCopiat && (
                                  <p className="text-xs text-green-600 mt-0.5">Copiat!</p>
                                )}
                              </div>
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                              >
                                Mergi la magazin
                              </a>
                            </div>
                          ) : (
                            <button
                              onClick={() => copiazaCod(idx, promo.cod_cupon)}
                              className="w-full border-2 border-dashed border-gray-300 hover:border-orange-400 rounded-xl py-2.5 px-3 text-center transition-colors group"
                            >
                              <span className="font-mono text-gray-400 group-hover:text-orange-500 text-sm">
                                {promo.cod_cupon.slice(0, 4)}{"*".repeat(Math.max(0, Math.min(promo.cod_cupon.length - 4, 6)))}
                              </span>
                              <p className="text-xs text-gray-400 mt-0.5 group-hover:text-orange-400">
                                Click pentru cod complet
                              </p>
                            </button>
                          )
                        ) : (
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                          >
                            Vezi oferta
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <p className="text-gray-400 text-lg mb-1">Nicio promoție activă momentan</p>
            <p className="text-gray-300 text-sm mb-5">Revino în curând sau vizitează direct magazinul</p>
            <a
              href={m.url_afiliat || m.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              Mergi la {nume}
            </a>
          </div>
        )}

        {/* PRODUSE CU REDUCERE */}
        {produse.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-gray-900">Produse {nume} cu reducere</h2>
                <span className="text-sm text-gray-400">{produse.length} produse</span>
              </div>
              <a href="/produse" className="text-sm font-semibold text-orange-500 hover:text-orange-600">
                Toate produsele →
              </a>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {produse.map((p, i) => (
                <ProdusCard key={i} produs={p} />
              ))}
            </div>
          </section>
        )}

        {/* FAQ SECTION */}
        <section className="mt-12">
          <h2 className="text-xl font-black text-gray-900 mb-5">Întrebări frecvente</h2>
          <div className="space-y-3">
            {[
              {
                q: `Cum folosesc un cod de reducere ${nume}?`,
                a: `Copiază codul de pe această pagină, adaugă produsele în coș pe ${m.url}, iar la checkout introdu codul în câmpul destinat și apasă Aplică. Reducerea se scade automat din total.`,
              },
              {
                q: `Codurile de reducere ${nume} sunt verificate?`,
                a: `Da. AmCupon.ro actualizează zilnic codurile direct din platforma 2Performant. Fiecare cod afișează rata de succes și data de expirare.`,
              },
              {
                q: "Este gratuit să folosesc AmCupon.ro?",
                a: "100% gratuit. Nu plătești nimic în plus față de prețul normal. Magazinul ne plătește un mic comision din bugetul de marketing, iar tu primești reducerea.",
              },
              {
                q: `Ce fac dacă un cod ${nume} nu funcționează?`,
                a: "Verifică dacă codul nu a expirat (afișăm zilele rămase) și dacă îndeplinești condițiile promoției (coș minim, produse eligibile). Dacă totul e în regulă, încearcă un alt cod activ de pe pagină.",
              },
            ].map((item, i) => (
              <details key={i} className="bg-white border border-gray-200 rounded-2xl group">
                <summary className="px-6 py-4 font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between gap-4 hover:text-orange-500 transition-colors">
                  {item.q}
                  <svg className="w-5 h-5 shrink-0 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="px-6 pb-5 text-gray-600 text-sm leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* MAGAZINE SIMILARE */}
        {similare.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-gray-900">Magazine similare cu reduceri</h2>
              <a href="/toate-magazinele" className="text-sm font-semibold text-orange-500 hover:text-orange-600">
                Toate →
              </a>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
              {similare.map((s) => {
                const numeSim = numeAfisat(s.magazin);
                const pctSim  = maxPct(s.promotii);
                return (
                  <a key={s.magazin} href={`/cod-reducere/${s.magazin}`}
                    className="group flex flex-col items-center gap-1.5 p-2.5 bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-sm transition-all text-center">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 border border-gray-100">
                      {s.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.logo_url} alt={numeSim} className="w-full h-full object-contain p-0.5" loading="lazy" />
                      ) : (
                        <span className="text-base font-black text-gray-400">{numeSim.charAt(0)}</span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-gray-700 group-hover:text-orange-600 leading-tight line-clamp-1 w-full">{numeSim}</span>
                    {pctSim > 0 ? (
                      <span className="text-[10px] font-black text-orange-500">-{pctSim}%</span>
                    ) : s.cod_cupon ? (
                      <span className="text-[10px] font-bold text-emerald-600">Cod</span>
                    ) : s.are_promotie ? (
                      <span className="text-[10px] text-gray-400">Oferta</span>
                    ) : null}
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* BACK LINK */}
        <div className="mt-10 pt-6 border-t border-gray-100 text-center">
          <a href="/" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
            ← Inapoi la toate promotiile
          </a>
        </div>
      </div>
    </div>
  );
}
