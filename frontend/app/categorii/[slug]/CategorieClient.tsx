"use client";

import Link from "next/link";

import MagazinCard, { type CardMagazin } from "../../components/MagazinCard";
import NewsletterCTA from "../../components/NewsletterCTA";

interface Magazin extends CardMagazin {
  trend: number;
  zile_ramase: number;
  folosit_de: number;
  procent_succes: number;
  rank?: number;
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
  const cuPromotii = magazine.filter((m) => m.are_promotie);
  const faraPromotii = magazine.filter((m) => !m.are_promotie);
  const an = new Date().getFullYear();
  const descCateg = DESC_CATEG[slug];

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* BREADCRUMB */}
      <nav aria-label="Breadcrumb" className="bg-[#0a0f1a] border-b border-[#1e293b]">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[#94a3b8] flex-wrap">
          <Link href="/" className="hover:text-[#0d9488] transition-colors flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Acasă
          </Link>
          <svg className="w-3 h-3 text-[#cbd5e1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link href="/categorii" className="hover:text-[#0d9488] transition-colors">Categorii</Link>
          <svg className="w-3 h-3 text-[#cbd5e1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-[#cbd5e1] font-medium">{numeCategorie}</span>
        </div>
      </nav>

      {/* HERO */}
      <div className="relative bg-[#0a0f1a] border-b border-[#1e293b] overflow-hidden py-10 px-4">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(13,148,136,0.15) 0%, transparent 65%)" }} />
        <div className="relative max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-black mb-1 text-[#f1f5f9]">
            Coduri reducere <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #0f766e, #0d9488)" }}>{numeCategorie}</span> {an}
          </h1>
          <p className="text-[#cbd5e1] text-sm">
            {cuPromotii.length} promoții active · {magazine.length} magazine · Actualizat zilnic
          </p>
          {descCateg && (
            <p className="text-[#cbd5e1] text-sm mt-2 max-w-2xl opacity-90">{descCateg}</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* CU PROMOTII */}
        {cuPromotii.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-xl font-black text-[#f1f5f9]">Promoții Active {an}</h2>
              <span className="text-sm text-[#94a3b8]">{cuPromotii.length} oferte</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cuPromotii.map((m) => (
                <MagazinCard key={m.magazin} m={m} />
              ))}
            </div>
          </section>
        )}

        {/* PRODUSE LA REDUCERE (din feed) — umple categoria cu dovada vizuala */}
        {produse.length >= 4 && (
          <section className="mb-10">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-[#f1f5f9]">Produse la reducere {numeCategorie}</h2>
                <span className="text-sm text-[#94a3b8]">{produse.length} produse</span>
              </div>
              <Link href="/produse" className="hidden sm:inline text-xs font-bold text-[#0d9488] hover:text-[#0f766e] transition-colors">Toate produsele →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {produse.map((p, i) => {
                const hasOld = !!(p.old_price && p.old_price > p.price);
                return (
                  <a key={i} href={p.url} target="_blank" rel="sponsored noopener noreferrer"
                    className="group bg-[#111827] border border-[#1e293b] hover:border-[#14b8a6]/50 rounded-xl overflow-hidden flex flex-col transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40">
                    <div className="relative bg-[#111827] aspect-square overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt={p.title} loading="lazy" className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { (e.currentTarget.closest("a") as HTMLElement).style.display = "none"; }} />
                      {p.discount_pct > 0 && (
                        <span className="absolute top-2 left-2 bg-gradient-to-br from-[#34d399] to-[#14b8a6] text-[#ffffff] text-[11px] font-black px-2 py-0.5 rounded-lg shadow">-{p.discount_pct}%</span>
                      )}
                    </div>
                    <div className="p-3 flex flex-col flex-1">
                      <p className="text-xs font-semibold text-[#cbd5e1] line-clamp-2 flex-1 group-hover:text-[#f1f5f9] transition-colors leading-snug">{p.title}</p>
                      <div className="mt-2 flex items-baseline gap-1.5">
                        <span className="text-sm font-black text-[#0f766e]">{p.price.toLocaleString("ro-RO")} lei</span>
                        {hasOld && <span className="text-[10px] text-[#94a3b8] line-through">{p.old_price!.toLocaleString("ro-RO")}</span>}
                      </div>
                      {p.merchant && <span className="text-[10px] text-[#94a3b8] mt-1 truncate">{p.merchant}</span>}
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
              <h2 className="text-lg font-black text-[#cbd5e1]">Toate magazinele {numeCategorie}</h2>
              <span className="text-sm text-[#94a3b8]">{faraPromotii.length} magazine</span>
            </div>
            <p className="text-xs text-[#94a3b8] mb-4">
              Aceste magazine nu au promoții active momentan — butoanele duc direct la magazin prin linkul nostru afiliat.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {faraPromotii.map((m) => (
                <MagazinCard key={m.magazin} m={m} />
              ))}
            </div>
          </section>
        )}
      </div>

      <NewsletterCTA titlu={`Nu rata reducerile ${numeCategorie}`} />

      <div className="max-w-7xl mx-auto px-4 pb-8">
        {/* SEO CONTENT */}
        <section className="mt-14 bg-[#111827] rounded-xl border border-[#1e293b] p-6 md:p-8">
          <h2 className="text-lg font-black text-[#f1f5f9] mb-4">
            Cum găsești cele mai bune reduceri {numeCategorie}?
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-[#cbd5e1]">
            <div>
              <h3 className="font-bold text-[#f1f5f9] mb-2">✅ Coduri verificate zilnic</h3>
              <p>
                Toate codurile de reducere {numeCategorie} de pe AmCupon.ro sunt verificate automat.
                Afișăm rata de succes și data expirării pentru fiecare cod în parte.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[#f1f5f9] mb-2">🔔 Cum folosești un cod</h3>
              <p>
                Copiază codul de pe această pagină, adaugă produsele în coș pe site-ul magazinului,
                iar la checkout introdu codul în câmpul „Cod promoțional&quot;. Reducerea se aplică automat.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[#f1f5f9] mb-2">💡 Sfat de economii</h3>
              <p>
                Compară ofertele de la mai multe magazine înainte de cumpărare. Unele magazine oferă
                reduceri mai mari la prima comandă sau la comenzi peste o anumită valoare.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 pt-6 border-t border-[#1e293b] flex items-center justify-between flex-wrap gap-3">
          <Link href="/categorii" className="text-sm text-[#94a3b8] hover:text-[#0d9488] transition-colors">
            ← Toate categoriile
          </Link>
          <Link href="/toate-magazinele" className="text-sm text-[#94a3b8] hover:text-[#0d9488] transition-colors">
            Toate magazinele →
          </Link>
        </div>
      </div>
    </div>
  );
}
