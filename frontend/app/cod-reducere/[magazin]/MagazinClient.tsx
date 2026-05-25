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
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <a href="/" className="flex items-center gap-1.5 shrink-0">
            <div className="bg-orange-500 text-white font-black text-base px-2 py-1 rounded-lg">Am</div>
            <span className="font-black text-gray-900 text-xl">Cupon</span>
            <span className="text-orange-500 font-black text-xl">.ro</span>
          </a>
        </div>
      </header>

      {/* BREADCRUMB */}
      <nav
        aria-label="Breadcrumb"
        className="bg-white border-b border-gray-100"
      >
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-gray-400 flex-wrap">
          <a href="/" className="hover:text-orange-500 transition-colors flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Acasă
          </a>
          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <a href="/toate-magazinele" className="hover:text-orange-500 transition-colors">
            Magazine
          </a>
          <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-700 font-medium">Cod Reducere {nume}</span>
        </div>
      </nav>

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
              <h1 className="text-2xl font-black text-gray-900">
                Cod Reducere {nume} {an}
              </h1>
              {m.rank && m.rank <= 20 && (
                <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                  Top #{m.rank} Romania
                </span>
              )}
              {m.exclusiv && (
                <span className="text-xs font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full">
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
                <span className="text-gray-400">Promoții active: </span>
                <span className="font-semibold text-orange-600">{m.promotii.length}</span>
              </div>
            </div>

            <a
              href={m.url_afiliat || m.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
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

        {/* BACK LINK */}
        <div className="mt-10 pt-6 border-t border-gray-100 text-center">
          <a href="/" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
            ← Înapoi la toate promoțiile
          </a>
        </div>
      </div>
    </div>
  );
}
