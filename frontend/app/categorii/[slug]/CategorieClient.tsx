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
  trend: number;
  are_promotie: boolean;
  cod_cupon: boolean;
  zile_ramase: number;
  promotii: Promotie[];
  folosit_de: number;
  procent_succes: number;
  exclusiv: boolean;
  rank?: number;
}

function numeAfisat(magazin: string): string {
  return magazin.split(".")[0].replace(/-/g, " ")
    .split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function maskCod(cod: string): string {
  if (!cod || cod.length <= 4) return cod;
  return cod.slice(0, 4) + "*".repeat(Math.max(0, Math.min(cod.length - 4, 6)));
}

function extractDiscount(text: string): string | null {
  const m = text?.match(/(\d+)\s*%/);
  return m ? m[1] + "%" : null;
}

// Descrieri SEO per categorie
const DESC_CATEG: Record<string, string> = {
  "fashion": "Găsești coduri de reducere pentru haine, pantofi și accesorii de la branduri precum FashionDays, Answear, Zara, H&M și multe altele. Actualizăm reducerile zilnic.",
  "electronics-itc": "Coduri reducere pentru electronice, laptopuri, telefoane și IT. Parteneri: eMAG, Altex, Flanco și alte magazine de top.",
  "beauty": "Voucher și coduri de reducere pentru parfumuri, cosmetice și produse de îngrijire. Parteneri: Notino, Douglas, Sephora.",
  "babies-kids-toys": "Reduceri la jucării, haine și produse pentru copii. Parteneri: Noriel, eMAG Kids, Smyths Toys.",
  "sports-outdoors": "Coduri reducere pentru echipament sportiv, îmbrăcăminte și outdoor. Parteneri: Decathlon, Sportisimo, Sport Vision.",
  "home-garden": "Voucher reducere pentru mobilă, decorațiuni și grădină. Parteneri: Dedeman, IKEA, Leroy Merlin.",
  "books": "Coduri reducere pentru cărți, audiobook-uri și manuale. Parteneri: Elefant, Libris, Bookzone.",
  "health-personal-care": "Reduceri la suplimente, vitamine și produse de îngrijire personală.",
  "pharma": "Coduri reducere la farmacii online: Dr. Max, Catena, Helpnet.",
  "gifts-flowers": "Reduceri pentru cadouri, flori și produse personalizate. Parteneri: Floria, Cadouri.ro.",
  "hypermarket-groceries": "Coduri reducere la supermarketuri și livrare alimente online.",
  "automotive": "Reduceri piese auto, accesorii și servicii auto.",
  "pet-supplies": "Coduri reducere pentru hrana și accesorii animale de companie.",
};

function MagazinCard({ m, revealed, copiat, onCopiere }: {
  m: Magazin;
  revealed: boolean;
  copiat: boolean;
  onCopiere: (id: string, cod: string) => void;
}) {
  const [imgOk, setImgOk] = useState(true);
  const promo = m.promotii[0];
  const numeMagazin = numeAfisat(m.magazin);
  const initiala = numeMagazin.charAt(0).toUpperCase();

  // Filtrăm linkuri invalide: placeholder NA6 de la Profitshare (cont neaprobat)
  const isValidAffiliateUrl = (url: string) => {
    if (!url) return false;
    if (url.includes("/NA6?") || url.includes("/NA6&")) return false;
    return true;
  };
  const validAffiliateLink = isValidAffiliateUrl(m.url_afiliat) ? m.url_afiliat : m.url;
  const link = promo?.landing_page || validAffiliateLink;
  const affiliateLink = validAffiliateLink;
  const discount = promo ? (extractDiscount(promo.nume) || extractDiscount(promo.descriere || "")) : null;

  const culoare = "bg-gradient-to-br from-indigo-500 to-indigo-700";

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 hover:border-indigo-500/40 shadow-sm hover:shadow-lg hover:shadow-black/30 transition-all duration-200 flex flex-col overflow-hidden">
      <a href={`/cod-reducere/${m.magazin}`} className="flex flex-col items-center pt-5 pb-3 px-4 group relative">
        {m.exclusiv && (
          <span className="absolute top-3 right-3 text-xs font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">Exclusiv</span>
        )}
        <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center mb-3 bg-white border border-slate-800 p-1 group-hover:border-indigo-500/50 transition-colors">
          {m.logo_url && imgOk ? (
            <img src={m.logo_url} alt={numeMagazin} className="w-full h-full object-contain" loading="lazy" decoding="async" onError={() => setImgOk(false)} />
          ) : (
            <div className={`w-full h-full rounded-xl ${culoare} flex items-center justify-center`}>
              <span className="text-white font-black text-3xl">{initiala}</span>
            </div>
          )}
        </div>
        <h3 className="font-black text-white text-base text-center group-hover:text-indigo-400 transition-colors">{numeMagazin}</h3>
      </a>

      <div className="px-4 pb-2 text-center min-h-[20px]">
        {promo && (
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wide">
            {promo.cod_cupon ? "Cod Reducere" : "Ofertă Specială"}
            {discount && <span className="ml-1 text-indigo-400">{discount}</span>}
          </span>
        )}
      </div>

      <div className="px-4 pb-3 flex-1">
        {promo ? (
          <p className="text-sm text-slate-400 text-center line-clamp-2">{promo.nume}</p>
        ) : (
          <p className="text-sm text-slate-600 text-center italic">Verifică ofertele curente</p>
        )}
      </div>

      <div className="px-4 pb-2 flex flex-wrap justify-center gap-2">
        {promo && promo.zile_ramase <= 3 && (
          <span className="text-xs font-semibold text-red-400">⏰ Expiră în {promo.zile_ramase === 0 ? "azi" : `${promo.zile_ramase}z`}</span>
        )}
        {m.cod_cupon && <span className="text-xs text-emerald-400 font-semibold">✓ {m.procent_succes}% succes</span>}
        {m.folosit_de > 0 && <span className="text-xs text-slate-500">👤 {m.folosit_de}x</span>}
      </div>

      <div className="px-4 pb-5">
        {promo?.cod_cupon ? (
          revealed ? (
            <div className="space-y-2">
              <div className="border-2 border-dashed border-cyan-500/50 rounded-xl py-2 text-center bg-slate-800">
                <span className="font-mono font-black text-indigo-400 tracking-widest text-sm">{promo.cod_cupon}</span>
                {copiat && <p className="text-xs text-emerald-400 mt-0.5">✓ Copiat!</p>}
              </div>
              <a href={link} target="_blank" rel="sponsored noopener noreferrer"
                className="flex items-center justify-center w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                Mergi la {numeMagazin} →
              </a>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="border-2 border-dashed border-slate-700 rounded-xl py-2 text-center">
                <span className="font-mono text-slate-500 text-sm">{maskCod(promo.cod_cupon)}</span>
              </div>
              <button onClick={() => onCopiere(m.magazin, promo.cod_cupon)}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                Copiază codul
              </button>
            </div>
          )
        ) : promo ? (
          <a href={link} target="_blank" rel="sponsored noopener noreferrer"
            className="flex items-center justify-center w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
            Vezi oferta →
          </a>
        ) : (
          /* Fara promotii — link direct afiliat */
          <a href={affiliateLink} target="_blank" rel="sponsored noopener noreferrer"
            className="flex items-center justify-center w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
            Mergi la {numeMagazin} →
          </a>
        )}
      </div>
    </div>
  );
}

export default function CategorieClient({ magazine, numeCategorie, slug }: {
  magazine: Magazin[];
  numeCategorie: string;
  slug: string;
}) {
  const [coduriReveal, setCoduriReveal] = useState<Set<string>>(new Set());
  const [copiat, setCopiat] = useState<string | null>(null);

  function copiazaCod(id: string, cod: string) {
    setCoduriReveal((prev) => new Set(prev).add(id));
    navigator.clipboard.writeText(cod).catch(() => {});
    setCopiat(id);
    setTimeout(() => setCopiat(null), 3000);
  }

  const cuPromotii = magazine.filter((m) => m.are_promotie);
  const faraPromotii = magazine.filter((m) => !m.are_promotie);
  const an = new Date().getFullYear();
  const descCateg = DESC_CATEG[slug];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* BREADCRUMB */}
      <nav aria-label="Breadcrumb" className="bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-slate-500 flex-wrap">
          <Link href="/" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Acasă
          </Link>
          <svg className="w-3 h-3 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link href="/categorii" className="hover:text-indigo-400 transition-colors">Categorii</Link>
          <svg className="w-3 h-3 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-slate-300 font-medium">{numeCategorie}</span>
        </div>
      </nav>

      {/* HERO */}
      <div className="relative bg-slate-950 border-b border-slate-800 overflow-hidden py-10 px-4">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(79,70,229,0.15) 0%, transparent 65%)" }} />
        <div className="relative max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-black mb-1 text-white">
            Coduri reducere <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #818cf8, #22d3ee)" }}>{numeCategorie}</span> {an}
          </h1>
          <p className="text-slate-400 text-sm">
            {cuPromotii.length} promoții active · {magazine.length} magazine · Actualizat zilnic
          </p>
          {descCateg && (
            <p className="text-slate-400 text-sm mt-2 max-w-2xl opacity-90">{descCateg}</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* CU PROMOTII */}
        {cuPromotii.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-xl font-black text-white">Promoții Active {an}</h2>
              <span className="text-sm text-slate-500">{cuPromotii.length} oferte</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cuPromotii.map((m) => (
                <MagazinCard key={m.magazin} m={m} revealed={coduriReveal.has(m.magazin)} copiat={copiat === m.magazin} onCopiere={copiazaCod} />
              ))}
            </div>
          </section>
        )}

        {/* FARA PROMOTII */}
        {faraPromotii.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-black text-slate-300">Toate magazinele {numeCategorie}</h2>
              <span className="text-sm text-slate-500">{faraPromotii.length} magazine</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Aceste magazine nu au promoții active momentan — butoanele duc direct la magazin prin linkul nostru afiliat.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {faraPromotii.map((m) => (
                <MagazinCard key={m.magazin} m={m} revealed={coduriReveal.has(m.magazin)} copiat={copiat === m.magazin} onCopiere={copiazaCod} />
              ))}
            </div>
          </section>
        )}

        {/* SEO CONTENT */}
        <section className="mt-14 bg-slate-900 rounded-2xl border border-slate-800 p-6 md:p-8">
          <h2 className="text-lg font-black text-white mb-4">
            Cum găsești cele mai bune reduceri {numeCategorie}?
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-slate-400">
            <div>
              <h3 className="font-bold text-white mb-2">✅ Coduri verificate zilnic</h3>
              <p>
                Toate codurile de reducere {numeCategorie} de pe AmCupon.ro sunt verificate automat.
                Afișăm rata de succes și data expirării pentru fiecare cod în parte.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">🔔 Cum folosești un cod</h3>
              <p>
                Copiază codul de pe această pagină, adaugă produsele în coș pe site-ul magazinului,
                iar la checkout introdu codul în câmpul „Cod promoțional". Reducerea se aplică automat.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">💡 Sfat de economii</h3>
              <p>
                Compară ofertele de la mai multe magazine înainte de cumpărare. Unele magazine oferă
                reduceri mai mari la prima comandă sau la comenzi peste o anumită valoare.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <Link href="/categorii" className="text-sm text-slate-500 hover:text-indigo-400 transition-colors">
            ← Toate categoriile
          </Link>
          <Link href="/toate-magazinele" className="text-sm text-slate-500 hover:text-indigo-400 transition-colors">
            Toate magazinele →
          </Link>
        </div>
      </div>
    </div>
  );
}
