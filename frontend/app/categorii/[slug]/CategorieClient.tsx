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
  const promo = m.promotii[0];
  const numeMagazin = numeAfisat(m.magazin);
  const initiala = numeMagazin.charAt(0).toUpperCase();

  // Cascada logo: logo_url din date -> favicon Google al domeniului (slug=domeniu,
  // arata marca reala; nu da niciodata 404) -> tile cu litera. Repara logo-urile
  // moarte (clearbit inchis, thumburi wiki trunchiate, SVG cu hotlink blocat).
  const domeniu = (m.magazin || "").match(/[a-z0-9-]+\.[a-z]{2,}(?:\.[a-z]{2,})?/i)?.[0] || null;
  const logoSurse = [m.logo_url, domeniu ? `https://www.google.com/s2/favicons?domain=${domeniu}&sz=128` : null].filter(Boolean) as string[];
  const [logoIdx, setLogoIdx] = useState(0);
  const logoSrc = logoSurse[logoIdx];

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

  const culoare = "bg-gradient-to-br from-[#c9a63e] to-[#9c7a26]";

  return (
    <div className="bg-[#15120c] rounded-2xl border border-[#26211a] hover:border-[#c9a63e]/40 shadow-sm hover:shadow-lg hover:shadow-black/30 transition-all duration-200 flex flex-col overflow-hidden">
      <a href={`/cod-reducere/${m.magazin}`} className="flex flex-col items-center pt-5 pb-3 px-4 group relative">
        {m.exclusiv && (
          <span className="absolute top-3 right-3 text-xs font-bold bg-[#b8912e] text-white px-2 py-0.5 rounded-full">Exclusiv</span>
        )}
        <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center mb-3 bg-white border border-[#26211a] p-1 group-hover:border-[#c9a63e]/50 transition-colors">
          {logoSrc ? (
            <img src={logoSrc} alt={numeMagazin} className="w-full h-full object-contain" loading="lazy" decoding="async" onError={() => setLogoIdx((i) => i + 1)} />
          ) : (
            <div className={`w-full h-full rounded-xl ${culoare} flex items-center justify-center`}>
              <span className="text-white font-black text-3xl">{initiala}</span>
            </div>
          )}
        </div>
        <h3 className="font-black text-white text-base text-center group-hover:text-[#d8c091] transition-colors">{numeMagazin}</h3>
      </a>

      <div className="px-4 pb-2 text-center min-h-[20px]">
        {promo && (
          <span className="text-xs font-bold text-[#d8c091] uppercase tracking-wide">
            {promo.cod_cupon ? "Cod Reducere" : "Ofertă Specială"}
            {discount && <span className="ml-1 text-[#d8c091]">{discount}</span>}
          </span>
        )}
      </div>

      <div className="px-4 pb-3 flex-1">
        {promo ? (
          <p className="text-sm text-[#a89a78] text-center line-clamp-2">{promo.nume}</p>
        ) : (
          <p className="text-sm text-[#8c8064] text-center italic">Verifică ofertele curente</p>
        )}
      </div>

      <div className="px-4 pb-2 flex flex-wrap justify-center gap-2">
        {promo && promo.zile_ramase <= 3 && (
          <span className="text-xs font-semibold text-red-400">⏰ Expiră în {promo.zile_ramase === 0 ? "azi" : `${promo.zile_ramase}z`}</span>
        )}
        {m.are_promotie && <span className="text-xs text-emerald-400 font-semibold">✓ verificat azi</span>}
      </div>

      <div className="px-4 pb-5">
        {promo?.cod_cupon ? (
          revealed ? (
            <div className="space-y-2">
              <div className="border-2 border-dashed border-[#c9a63e]/50 rounded-xl py-2 text-center bg-[#26211a]">
                <span className="font-mono font-black text-[#d8c091] tracking-widest text-sm">{promo.cod_cupon}</span>
                {copiat && <p className="text-xs text-emerald-400 mt-0.5">✓ Copiat!</p>}
              </div>
              <a href={link} target="_blank" rel="sponsored noopener noreferrer"
                className="flex items-center justify-center w-full bg-gradient-to-r from-[#c9a63e] to-[#b8912e] hover:from-[#d8b850] hover:to-[#c9a63e] text-[#1a1408] font-bold py-2.5 rounded-xl text-sm transition-all">
                Mergi la {numeMagazin} →
              </a>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="border-2 border-dashed border-[#37301f] rounded-xl py-2 text-center">
                <span className="font-mono text-[#8c8064] text-sm">{maskCod(promo.cod_cupon)}</span>
              </div>
              <button onClick={() => onCopiere(m.magazin, promo.cod_cupon)}
                className="w-full bg-gradient-to-r from-[#c9a63e] to-[#b8912e] hover:from-[#d8b850] hover:to-[#c9a63e] text-[#1a1408] font-bold py-2.5 rounded-xl text-sm transition-all">
                Copiază codul
              </button>
            </div>
          )
        ) : promo ? (
          <a href={link} target="_blank" rel="sponsored noopener noreferrer"
            className="flex items-center justify-center w-full bg-gradient-to-r from-[#c9a63e] to-[#b8912e] hover:from-[#d8b850] hover:to-[#c9a63e] text-[#1a1408] font-bold py-2.5 rounded-xl text-sm transition-all">
            Vezi oferta →
          </a>
        ) : (
          /* Fara promotii — link direct afiliat */
          <a href={affiliateLink} target="_blank" rel="sponsored noopener noreferrer"
            className="flex items-center justify-center w-full bg-[#26211a] hover:bg-[#37301f] border border-[#37301f] text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
            Mergi la {numeMagazin} →
          </a>
        )}
      </div>
    </div>
  );
}

interface Produs {
  title: string; url: string; image: string; price: number;
  old_price?: number | null; discount_pct: number; merchant?: string; merchant_slug?: string;
}

export default function CategorieClient({ magazine, numeCategorie, slug, produse = [] }: {
  magazine: Magazin[];
  numeCategorie: string;
  slug: string;
  produse?: Produs[];
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
    <div className="min-h-screen bg-[#0b0a07]">
      {/* BREADCRUMB */}
      <nav aria-label="Breadcrumb" className="bg-[#0b0a07] border-b border-[#26211a]">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[#8c8064] flex-wrap">
          <Link href="/" className="hover:text-[#d8c091] transition-colors flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Acasă
          </Link>
          <svg className="w-3 h-3 text-[#37301f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link href="/categorii" className="hover:text-[#d8c091] transition-colors">Categorii</Link>
          <svg className="w-3 h-3 text-[#37301f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-[#c8bda2] font-medium">{numeCategorie}</span>
        </div>
      </nav>

      {/* HERO */}
      <div className="relative bg-[#0b0a07] border-b border-[#26211a] overflow-hidden py-10 px-4">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(184,145,46,0.15) 0%, transparent 65%)" }} />
        <div className="relative max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-black mb-1 text-white">
            Coduri reducere <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #e3d1a6, #b8912e)" }}>{numeCategorie}</span> {an}
          </h1>
          <p className="text-[#a89a78] text-sm">
            {cuPromotii.length} promoții active · {magazine.length} magazine · Actualizat zilnic
          </p>
          {descCateg && (
            <p className="text-[#a89a78] text-sm mt-2 max-w-2xl opacity-90">{descCateg}</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* CU PROMOTII */}
        {cuPromotii.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-xl font-black text-white">Promoții Active {an}</h2>
              <span className="text-sm text-[#8c8064]">{cuPromotii.length} oferte</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cuPromotii.map((m) => (
                <MagazinCard key={m.magazin} m={m} revealed={coduriReveal.has(m.magazin)} copiat={copiat === m.magazin} onCopiere={copiazaCod} />
              ))}
            </div>
          </section>
        )}

        {/* PRODUSE LA REDUCERE (din feed) — umple categoria cu dovada vizuala */}
        {produse.length >= 4 && (
          <section className="mb-10">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-white">Produse la reducere {numeCategorie}</h2>
                <span className="text-sm text-[#8c8064]">{produse.length} produse</span>
              </div>
              <Link href="/produse" className="hidden sm:inline text-xs font-bold text-[#d8c091] hover:text-[#e3d1a6] transition-colors">Toate produsele →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {produse.map((p, i) => {
                const hasOld = !!(p.old_price && p.old_price > p.price);
                return (
                  <a key={i} href={p.url} target="_blank" rel="sponsored noopener noreferrer"
                    className="group bg-[#15120c] border border-[#26211a] hover:border-[#c9a63e]/50 rounded-2xl overflow-hidden flex flex-col transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40">
                    <div className="relative bg-white aspect-square overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt={p.title} loading="lazy" className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { (e.currentTarget.closest("a") as HTMLElement).style.display = "none"; }} />
                      {p.discount_pct > 0 && (
                        <span className="absolute top-2 left-2 bg-gradient-to-br from-[#e9d9b0] to-[#c9a63e] text-[#1a1408] text-[11px] font-black px-2 py-0.5 rounded-lg shadow">-{p.discount_pct}%</span>
                      )}
                    </div>
                    <div className="p-3 flex flex-col flex-1">
                      <p className="text-xs font-semibold text-[#dcd0b8] line-clamp-2 flex-1 group-hover:text-white transition-colors leading-snug">{p.title}</p>
                      <div className="mt-2 flex items-baseline gap-1.5">
                        <span className="text-sm font-black text-[#e3d1a6]">{p.price.toLocaleString("ro-RO")} lei</span>
                        {hasOld && <span className="text-[10px] text-[#8c8064] line-through">{p.old_price!.toLocaleString("ro-RO")}</span>}
                      </div>
                      {p.merchant && <span className="text-[10px] text-[#8c8064] mt-1 truncate">{p.merchant}</span>}
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* FARA PROMOTII */}
        {faraPromotii.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-black text-[#c8bda2]">Toate magazinele {numeCategorie}</h2>
              <span className="text-sm text-[#8c8064]">{faraPromotii.length} magazine</span>
            </div>
            <p className="text-xs text-[#8c8064] mb-4">
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
        <section className="mt-14 bg-[#15120c] rounded-2xl border border-[#26211a] p-6 md:p-8">
          <h2 className="text-lg font-black text-white mb-4">
            Cum găsești cele mai bune reduceri {numeCategorie}?
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-[#a89a78]">
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

        <div className="mt-8 pt-6 border-t border-[#26211a] flex items-center justify-between flex-wrap gap-3">
          <Link href="/categorii" className="text-sm text-[#8c8064] hover:text-[#d8c091] transition-colors">
            ← Toate categoriile
          </Link>
          <Link href="/toate-magazinele" className="text-sm text-[#8c8064] hover:text-[#d8c091] transition-colors">
            Toate magazinele →
          </Link>
        </div>
      </div>
    </div>
  );
}
