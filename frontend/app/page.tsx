"use client";

import { useEffect, useState } from "react";

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
  categorie: string;
  comision: string;
  scor_afiliere: number;
  scor_final: number;
  prioritate: string;
  canal_recomandat: string;
  sales_number: number;
  trend: number;
  are_promotie: boolean;
  cod_cupon: boolean;
  zile_ramase: number;
  promotii: Promotie[];
}

function getDomain(url: string): string {
  try { return new URL(url).hostname.replace("www.", ""); }
  catch { return ""; }
}

function getFavicon(url: string): string {
  const domain = getDomain(url);
  return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : "";
}

function extractDiscount(text: string): string | null {
  const m = text.match(/(\d+)\s*%/);
  return m ? m[1] + "%" : null;
}

export default function Home() {
  const [magazine, setMagazine] = useState<Magazin[]>([]);
  const [filtru, setFiltru] = useState("toate");
  const [cautare, setCautare] = useState("");
  const [coduriAratate, setCoduriAratate] = useState<Set<string>>(new Set());
  const [copiat, setCopiat] = useState<string | null>(null);

  useEffect(() => {
    fetch("/output.json").then((r) => r.json()).then(setMagazine);
  }, []);

  const categorii = ["toate", ...Array.from(new Set(magazine.map((m) => m.categorie).filter(Boolean))).sort()];

  const filtrate = magazine.filter((m) => {
    const cat = filtru === "toate" || m.categorie === filtru;
    const search = cautare === "" || m.magazin.toLowerCase().includes(cautare.toLowerCase());
    return cat && search;
  });

  const cuPromotii = filtrate.filter((m) => m.are_promotie);
  const faraPromotii = filtrate.filter((m) => !m.are_promotie).slice(0, 60);

  function arataCod(id: string, cod: string) {
    setCoduriAratate((prev) => new Set(prev).add(id));
    navigator.clipboard.writeText(cod).catch(() => {});
    setCopiat(id);
    setTimeout(() => setCopiat(null), 2500);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
          <a href="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-orange-500 text-white font-black text-lg px-2 py-1 rounded-lg">Am</div>
            <span className="font-black text-gray-900 text-xl">Cupon</span>
            <span className="text-orange-500 font-black text-xl">.ro</span>
          </a>
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Caută magazin sau cod reducere..."
              value={cautare}
              onChange={(e) => setCautare(e.target.value)}
              className="w-full border border-gray-300 rounded-full px-5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
            <svg className="absolute right-4 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="hidden md:flex items-center gap-1 text-sm text-gray-500 shrink-0">
            <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
            <span>{magazine.length} magazine active</span>
          </div>
        </div>
      </header>

      {/* HERO */}
      <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white py-10 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-black mb-2">
            Cele mai bune coduri de reducere din România
          </h1>
          <p className="text-orange-100 text-sm md:text-base mb-6">
            {cuPromotii.length} promoții active · {magazine.length} magazine partenere · Actualizat zilnic
          </p>
          {/* CATEGORII */}
          <div className="flex flex-wrap justify-center gap-2">
            {categorii.slice(0, 10).map((c) => (
              <button
                key={c}
                onClick={() => setFiltru(c)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filtru === c
                    ? "bg-white text-orange-600 shadow-md"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                {c === "toate" ? "Toate" : c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* PROMOTII ACTIVE */}
        {cuPromotii.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">LIVE</span>
              <h2 className="text-xl font-black text-gray-900">Promoții Active</h2>
              <span className="text-sm text-gray-500">{cuPromotii.length} oferte</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cuPromotii.slice(0, 9).map((m) => (
                <CardMagazin
                  key={m.magazin}
                  m={m}
                  coduriAratate={coduriAratate}
                  copiat={copiat}
                  onArataCod={arataCod}
                  highlight
                />
              ))}
            </div>
          </section>
        )}

        {/* TOATE MAGAZINELE */}
        {faraPromotii.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-xl font-black text-gray-900">Magazine Partenere</h2>
              <span className="text-sm text-gray-500">{filtrate.length} total</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {faraPromotii.map((m) => (
                <CardMagazin
                  key={m.magazin}
                  m={m}
                  coduriAratate={coduriAratate}
                  copiat={copiat}
                  onArataCod={arataCod}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 mt-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="bg-orange-500 text-white font-black text-sm px-2 py-0.5 rounded">Am</div>
            <span className="font-black text-white text-lg">Cupon.ro</span>
          </div>
          <p className="text-sm mb-2">Cele mai bune coduri de reducere și oferte din România</p>
          <p className="text-xs text-gray-600">
            Linkurile de pe AmCupon.ro sunt linkuri de afiliat. Primim un comision când cumperi prin linkurile noastre, fără costuri suplimentare pentru tine.
          </p>
        </div>
      </footer>
    </div>
  );
}

function CardMagazin({
  m,
  coduriAratate,
  copiat,
  onArataCod,
  highlight = false,
}: {
  m: Magazin;
  coduriAratate: Set<string>;
  copiat: string | null;
  onArataCod: (id: string, cod: string) => void;
  highlight?: boolean;
}) {
  const promo = m.promotii[0];
  const favicon = getFavicon(m.url);
  const discount = promo ? extractDiscount(promo.nume) || extractDiscount(promo.descriere || "") : null;
  const cardId = m.magazin;
  const codAratat = coduriAratate.has(cardId);
  const esteCopinat = copiat === cardId;
  const link = promo?.landing_page || m.url_afiliat || m.url;

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col ${
      highlight ? "border-orange-300 shadow-md" : "border-gray-200 shadow-sm"
    }`}>
      {/* TOP */}
      <div className="p-4 flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl border border-gray-100 overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center">
          {favicon ? (
            <img src={favicon} alt={m.magazin} className="w-8 h-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          ) : (
            <span className="text-lg font-bold text-gray-300">{m.magazin[0]?.toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm capitalize truncate">{m.magazin}</h3>
          <span className="text-xs text-gray-500">{m.categorie}</span>
        </div>
        {discount && (
          <div className="text-2xl font-black text-orange-500 shrink-0">{discount}</div>
        )}
      </div>

      {/* PROMO INFO */}
      {promo && (
        <div className="px-4 pb-3">
          <p className="text-xs text-gray-600 line-clamp-2">{promo.nume}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">✓ Verificat</span>
            {promo.zile_ramase <= 3 && (
              <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">🔥 Expiră în {promo.zile_ramase}z</span>
            )}
            {promo.cod_cupon && (
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">🏷 Cod cupon</span>
            )}
            {m.trend > 0 && (
              <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium">↑ Trending</span>
            )}
          </div>
        </div>
      )}

      {!promo && (
        <div className="px-4 pb-3">
          <div className="flex flex-wrap gap-1">
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{m.comision} comision</span>
            {m.trend > 0 && (
              <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium">↑ Trending</span>
            )}
          </div>
        </div>
      )}

      {/* BUTON */}
      <div className="px-4 pb-4 mt-auto">
        {promo?.cod_cupon ? (
          codAratat ? (
            <div className="flex gap-2">
              <div className="flex-1 bg-orange-50 border-2 border-dashed border-orange-300 rounded-xl px-3 py-2 text-center">
                <span className="font-mono font-black text-orange-600 text-sm tracking-wider">{promo.cod_cupon}</span>
              </div>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors"
              >
                {esteCopinat ? "Copiat!" : "Mergi"}
              </a>
            </div>
          ) : (
            <button
              onClick={() => onArataCod(cardId, promo.cod_cupon)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
            >
              Arată codul
            </button>
          )
        ) : (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-2.5 rounded-xl text-sm text-center transition-colors"
          >
            Vezi oferta →
          </a>
        )}
      </div>
    </div>
  );
}
