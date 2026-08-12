import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import MagazinCard from "../components/MagazinCard";
import NewsletterCTA from "../components/NewsletterCTA";
import NisaProduse from "../components/NisaProduse";

interface Promotie { nume: string; cod_cupon: string; landing_page: string; zile_ramase: number; }
interface Magazin {
  magazin: string; url: string; url_afiliat: string; logo_url?: string;
  categorie: string; categorie_slug?: string; scor_final: number;
  are_promotie: boolean; cod_cupon: boolean; promotii: Promotie[]; trend: number;
}

export const metadata: Metadata = {
  title: "Cod Reducere Supermarket Online 2026 — Carrefour, Kaufland, Auchan | AmCupon.ro",
  description: "Coduri de reducere supermarket online Romania: Carrefour, Kaufland, Auchan, Bringo, Freshful. Alimente, bauturi, produse de casa la preturi mici. Livrare la domiciliu.",
  keywords: ["cod reducere carrefour","reduceri kaufland","auchan cod cupon","bringo reducere","supermarket online romania","alimente ieftine","livrare mancare reducere"],
  alternates: { canonical: "https://amcupon.ro/supermarket" },
  openGraph: { title: "Supermarket Online cu Reducere 2026 | AmCupon.ro", url: "https://amcupon.ro/supermarket", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_SUPERMARKET = ["carrefour.ro","bringo.ro","freshful.ro","auchan.ro","kaufland.ro","emag.ro","glovo.ro","tazz.ro"];
const CAT_SUPERMARKET = ["grocer","supermarket","aliment","food","hypermarket","grocery","market","bringo","freshful","tazz"];

const AVANTAJE = [
  { icon: "🥩", titlu: "Carne & Mezeluri", desc: "Oferte saptamanale la carne proaspata, mezeluri si preparate" },
  { icon: "🥛", titlu: "Lactate & Oua", desc: "Lapte, iaurt, branza, oua la preturi promotionale zilnic" },
  { icon: "🥦", titlu: "Fructe & Legume", desc: "Legume si fructe proaspete, bio sau conventionale cu reducere" },
  { icon: "🧹", titlu: "Produse de Casa", desc: "Detergenti, produse curatenie, hartie, cosuri complete" },
  { icon: "🚚", titlu: "Livrare la Domiciliu", desc: "Bringo, Freshful, Tazz — comenzi online cu livrare 1-3h" },
  { icon: "💳", titlu: "Carduri Fidelitate", desc: "Puncte bonus, cashback si promotii exclusive pentru membrii clubului" },
];


const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Supermarket Online cu Reducere 2026",
  "url": "https://amcupon.ro/supermarket",
  "description": "Coduri reducere supermarket online Romania — Carrefour, Kaufland, Auchan, livrare la domiciliu"
};

export default function SupermarketPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topSupermarket = TOP_SUPERMARKET
    .map(s => all.find(m => m.magazin === s))
    .filter(Boolean) as Magazin[];

  const restSupermarket = all.filter(m =>
    !TOP_SUPERMARKET.includes(m.magazin) && m.are_promotie &&
    CAT_SUPERMARKET.some(c =>
      (m.categorie_slug||"").includes(c) ||
      m.categorie.toLowerCase().includes(c) ||
      m.magazin.toLowerCase().includes(c)
    )
  ).slice(0, 10);

  const magazine = [...topSupermarket, ...restSupermarket];
  const cuPromo = magazine.filter(m => m.are_promotie);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[#06080b]">

        {/* Header */}

        {/* Breadcrumb */}
        <nav className="bg-[#06080b] border-b border-[#1f2329]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[#9399a0]">
            <Link href="/" className="hover:text-[#ddf93c]">Acasa</Link>
            <span className="mx-1">/</span>
            <span className="text-[#c9ced5] font-medium">Supermarket Online</span>
          </div>
        </nav>

        {/* Hero */}
        <section className="bg-gradient-to-br from-[#c3dd2c] via-[#ddf93c] to-[#c3dd2c] text-[#0c1000] py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">🛒</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Supermarket Online cu Reducere {an}</h1>
            <p className="text-[#2a2f10] text-lg mb-6 max-w-xl mx-auto">
              Coduri reducere pentru comenzi online la Carrefour, Bringo, Freshful si alte supermarketuri cu livrare la domiciliu.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Carrefour","Kaufland","Auchan","Bringo","Freshful","Tazz","Livrare Rapida"].map(c => (
                <span key={c} className="bg-[#1f2329] text-[#ffffff] text-sm font-semibold px-4 py-1.5 rounded-full border border-[#2a2f36]">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="bg-[#14181c] border-[#1f2329] py-3 px-4">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-6 text-sm">
            <span className="text-[#c3dd2c] font-semibold">
              <span className="font-black text-[#ddf93c]">{magazine.length}</span> magazine alimentare
            </span>
            <span className="text-[#c3dd2c] font-semibold">
              <span className="font-black text-[#ddf93c]">{cuPromo.length}</span> cu promotii active
            </span>
            <span className="text-[#c3dd2c] font-semibold">&#10003; Actualizat zilnic</span>
          </div>
        </div>

        {/* Avantaje */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-[#ffffff] mb-6 text-center">De ce sa comanzi online de la supermarket</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVANTAJE.map(a => (
              <div key={a.titlu} className="bg-[#14181c] border border-[#1f2329] rounded-xl p-5">
                <div className="text-3xl mb-2">{a.icon}</div>
                <h3 className="font-bold text-[#ffffff] text-sm mb-1">{a.titlu}</h3>
                <p className="text-xs text-[#c9ced5]">{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Magazine */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <h2 className="text-xl font-black text-[#ffffff] mb-5">Supermarketuri online cu reduceri active</h2>
          {magazine.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {magazine.map((m) => (
              <MagazinCard key={m.magazin} m={m} />
            ))}
            </div>
          ) : (
            <div className="bg-[#14181c] border border-[#1f2329] rounded-xl p-10 text-center">
              <p className="text-4xl mb-3">🛒</p>
              <p className="font-bold text-[#c9ced5] mb-2">Magazine actualizate zilnic</p>
              <p className="text-[#9399a0] text-sm mb-4">Revino curand pentru promotii la supermarketuri online.</p>
              <Link href="/toate-magazinele" className="text-[#ddf93c] font-bold hover:text-[#c3dd2c] text-sm">Toate magazinele &rarr;</Link>
            </div>
          )}
        </section>

        {/* Produse */}
        <NewsletterCTA />

        <NisaProduse
          merchantSlugs={["carrefour.ro","bringo.ro","freshful.ro","auchan.ro"]}
          catSlug="alimente"
          titlu="Produse alimentare populare cu reducere"
          culoareAccent="blue"
          limit={12}
        />

        {/* Editorial */}
        <section className="bg-[#14181c] border-t border-[#1f2329] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[#ffffff] mb-5">Ghid: Cumparaturi alimentare online — cum economisesti</h2>
            <div className="space-y-4 text-sm text-[#c9ced5] leading-relaxed">
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">Carrefour vs Bringo vs Freshful</h3>
                <p>Carrefour.ro are cele mai mari promotii pe categorii in fiecare saptamana si permite ridicarea din magazin (click & collect). Bringo livreaza direct de la Carrefour/Mega Image in 1-2 ore. Freshful (eMAG) se concentreaza pe produse premium, bio si internationale.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">Trucuri pentru cosul de cumparaturi mai mic</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Prima comanda</strong> — Bringo, Tazz, Glovo ofera -20-30 lei la prima comanda online</li>
                  <li><strong>Comanda minima</strong> — livrarea e gratuita peste un anumit prag (70-150 lei)</li>
                  <li><strong>Slot-uri de livrare</strong> — alege livrarea programata (mai ieftina decat urgenta)</li>
                  <li><strong>Abonament lunar</strong> — Bringo Pass si Tazz Gold includ livrari gratuite nelimitate</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">Produse pe care merita sa le comanzi online</h3>
                <p>Produsele grele (apa, detergenti, conserve, faina, ulei) sunt ideale pentru comanda online — economisesti timp si efort fizic. Promotiile la apa plata online bat frecvent pretul din fizic. Baxurile si loturile mari ofera economii semnificative per unitate.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Internal links */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-base font-black text-[#c9ced5] mb-4">Exploreaza si alte categorii</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/sanatate",   label: "🌿 Sanatate & Naturiste" },
              { href: "/casa",       label: "🏠 Casa & Gradina" },
              { href: "/copii",      label: "👶 Copii & Jucarii" },
              { href: "/animale",    label: "🐾 Animale de Companie" },
              { href: "/oferte-azi", label: "🔥 Toate Ofertele de Azi" },
              { href: "/categorii",  label: "📂 Toate Categoriile" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-[#14181c] hover:bg-[#1f2329] hover:text-[#c3dd2c] text-[#c9ced5] text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-[#1f2329] hover:border-[#c9ced5]">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-[#1f2329] py-6 text-center text-xs text-[#9399a0] mt-4">
          &copy; {an} AmCupon.ro &middot;{" "}
          <Link href="/sanatate" className="hover:text-[#ddf93c]">Sanatate</Link>{" · "}
          <Link href="/casa" className="hover:text-[#ddf93c]">Casa</Link>{" · "}
          <Link href="/categorii" className="hover:text-[#ddf93c]">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
