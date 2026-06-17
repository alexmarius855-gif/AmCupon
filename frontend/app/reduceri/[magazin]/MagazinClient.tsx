"use client";

import Link from "next/link";

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

function numeAfisat(magazin: string): string {
  return magazin
    .split(".")[0]
    .replace(/-/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function extractDiscount(text: string): string | null {
  const m = text?.match(/(\d+)\s*%/);
  return m ? m[1] + "%" : null;
}

export default function MagazinClient({ magazin: m }: { magazin: Magazin }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [copiat, setCopiat] = useState<number | null>(null);
  const [imgOk, setImgOk] = useState(true);

  const nume = numeAfisat(m.magazin);
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
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1.5 shrink-0">
            <div className="bg-indigo-600 text-white font-black text-base px-2 py-1 rounded-lg">Am</div>
            <span className="font-black text-gray-900 text-xl">Cupon</span>
            <span className="text-indigo-400 font-black text-xl">.ro</span>
          </Link>
          <span className="text-gray-300">/</span>
          <nav className="text-sm text-gray-500 flex items-center gap-1">
            <Link href="/" className="hover:text-indigo-400 transition-colors">Reduceri</Link>
            <span className="text-gray-300 mx-1">/</span>
            <span className="text-gray-800 font-semibold">{nume}</span>
          </nav>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* PROFIL MAGAZIN */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center bg-gray-50 border border-gray-100 p-1 shrink-0">
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

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-2xl font-black text-gray-900">{nume}</h1>
              {m.rank && m.rank <= 20 && (
                <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                  Top #{m.rank} Romania
                </span>
              )}
              {m.exclusiv && (
                <span className="text-xs font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                  Exclusiv
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm mb-3">{m.categorie}</p>

            <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm mb-4">
              {m.cod_cupon && (
                <div className="flex items-center gap-1">
                  <span className="text-green-500">✓</span>
                  <span className="font-semibold text-green-600">{m.procent_succes}% rată succes</span>
                </div>
              )}
              {m.folosit_de > 0 && (
                <div>
                  <span className="text-gray-400">Folosit de </span>
                  <span className="font-semibold text-gray-700">{m.folosit_de}x</span>
                </div>
              )}
              {m.trend > 0 && (
                <div>
                  <span className="text-purple-500">↑ Trending </span>
                  <span className="font-semibold text-purple-600">+{m.trend}%</span>
                </div>
              )}
              <div>
                <span className="text-gray-400">Promoții: </span>
                <span className="font-semibold text-indigo-300">{m.promotii.length} active</span>
              </div>
            </div>

            <a
              href={m.url_afiliat || m.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              Vizitează {nume}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* PROMOTII */}
        {m.promotii.length > 0 ? (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-xl font-black text-gray-900">Promoții Active</h2>
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
                            <span className="text-sm font-black text-indigo-400 bg-cyan-50 px-2 py-0.5 rounded-lg">
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
                              <div className="border-2 border-dashed border-indigo-400 rounded-xl py-2.5 px-3 text-center bg-cyan-50">
                                <span className="font-mono font-black text-indigo-300 tracking-widest text-sm">
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
                                className="flex items-center justify-center w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                              >
                                Mergi la magazin
                              </a>
                            </div>
                          ) : (
                            <button
                              onClick={() => copiazaCod(idx, promo.cod_cupon)}
                              className="w-full border-2 border-dashed border-gray-300 hover:border-indigo-400 rounded-xl py-2.5 px-3 text-center transition-colors group"
                            >
                              <span className="font-mono text-gray-400 group-hover:text-indigo-400 text-sm">
                                {promo.cod_cupon.slice(0, 4)}{"*".repeat(Math.max(0, Math.min(promo.cod_cupon.length - 4, 6)))}
                              </span>
                              <p className="text-xs text-gray-400 mt-0.5 group-hover:text-indigo-400">
                                Click pentru cod complet
                              </p>
                            </button>
                          )
                        ) : (
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
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
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              Mergi la {nume}
            </a>
          </div>
        )}

        {/* BACK LINK */}
        <div className="mt-10 pt-6 border-t border-gray-100 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors">
            ← Înapoi la toate promoțiile
          </Link>
        </div>
      </div>
    </div>
  );
}
