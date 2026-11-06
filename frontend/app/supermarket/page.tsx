import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import MagazinCard from "../components/MagazinCard";
import NewsletterCTA from "../components/NewsletterCTA";
import NisaProduse from "../components/NisaProduse";
import { esteInCategorie, NISA_CATEGORII } from "../../lib/categoriiNisa";
import { laParteneri } from "@/lib/cifreSite";

interface Promotie { nume: string; cod_cupon: string; landing_page: string; zile_ramase: number; }
interface Magazin {
  magazin: string; url: string; url_afiliat: string; logo_url?: string;
  categorie: string; categorie_slug?: string; scor_final: number;
  are_promotie: boolean; cod_cupon: boolean; promotii: Promotie[]; trend: number;
}

export const metadata: Metadata = {
  title: "Supermarket Online 2026 — Alimente de la Magazine Partenere",
  description: `Alimente și băuturi online ${laParteneri(NISA_CATEGORII.supermarket)} — magazine specializate, cu livrare la domiciliu. Oferte actualizate zilnic.`,
  keywords: ["cod reducere carrefour","reduceri kaufland","auchan cod cupon","bringo reducere","supermarket online românia","alimente ieftine","livrare mâncare reducere"],
  alternates: { canonical: "https://amcupon.ro/supermarket" },
  openGraph: { title: "Supermarket Online 2026 | AmCupon.ro", url: "https://amcupon.ro/supermarket", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_SUPERMARKET = ["carrefour.ro","bringo.ro","freshful.ro","auchan.ro","kaufland.ro","glovo.ro","tazz.ro"];
// Sluguri REALE din output.json — potrivire EXACTA, nu subsir (vezi lib/categoriiNisa.ts)
const CAT_SUPERMARKET = ["mancare-bauturi"];

const AVANTAJE = [
  { icon: "🥩", titlu: "Carne & Mezeluri", desc: "Oferte săptămânale la carne proaspătă, mezeluri și preparate" },
  { icon: "🥛", titlu: "Lactate & Ouă", desc: "Lapte, iaurt, brânză, ouă la prețuri promoționale zilnic" },
  { icon: "🥦", titlu: "Fructe & Legume", desc: "Legume și fructe proaspete, bio sau convenționale cu reducere" },
  { icon: "🧹", titlu: "Produse de Casă", desc: "Detergenți, produse curățenie, hârtie, coșuri complete" },
  { icon: "🚚", titlu: "Livrare la Domiciliu", desc: "Comenzi online, livrate acasă" },
  { icon: "💳", titlu: "Carduri Fidelitate", desc: "Puncte bonus, cashback și promoții exclusive pentru membrii clubului" },
];


const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Supermarket Online 2026",
  "url": "https://amcupon.ro/supermarket",
  "description": "Alimente și băuturi online de la magazinele partenere AmCupon"
};

export default function SupermarketPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topSupermarket = TOP_SUPERMARKET
    .map(s => all.find(m => m.magazin === s))
    .filter(Boolean) as Magazin[];

  const restSupermarket = all.filter(m =>
    !TOP_SUPERMARKET.includes(m.magazin) &&
    esteInCategorie(m, CAT_SUPERMARKET)
  ).sort((a,b)=>(b.are_promotie?1:0)-(a.are_promotie?1:0)||(b.scor_final||0)-(a.scor_final||0)).slice(0, 10);

  const magazine = [...topSupermarket, ...restSupermarket];
  const cuPromo = magazine.filter(m => m.are_promotie);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[var(--background)]">

        {/* Header */}

        {/* Breadcrumb */}
        <nav className="bg-[var(--background)] border-b border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Link href="/" className="hover:text-[var(--accent-text)]">Acasă</Link>
            <span className="mx-1">/</span>
            <span className="text-[var(--text-soft)] font-medium">Supermarket Online</span>
          </div>
        </nav>

        {/* Hero */}
        <section className="bg-gradient-to-br from-[#c3dd2c] via-[#ddf93c] to-[#c3dd2c] text-[#0c1000] py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">🛒</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Supermarket Online {an}</h1>
            <p className="text-[#2a2f10] text-lg mb-6 max-w-xl mx-auto">
              Alimente și băuturi {laParteneri(NISA_CATEGORII.supermarket)} și la alte magazine partenere, cu livrare la domiciliu.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Cafea","Ulei de măsline","Bio","Delicatese","Băuturi","Livrare la domiciliu"].map(c => (
                <span key={c} className="bg-[var(--surface-alt)] text-[var(--foreground)] text-sm font-semibold px-4 py-1.5 rounded-full border border-[var(--border-strong)]">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="bg-[var(--surface)] border-[var(--border)] py-3 px-4">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-6 text-sm">
            <span className="text-[var(--accent-text)] font-semibold">
              <span className="font-black text-[var(--accent-text)]">{magazine.length}</span> magazine alimentare
            </span>
            <span className="text-[var(--accent-text)] font-semibold">
              <span className="font-black text-[var(--accent-text)]">{cuPromo.length}</span> cu promoții active
            </span>
            <span className="text-[var(--accent-text)] font-semibold">&#10003; Actualizat zilnic</span>
          </div>
        </div>

        {/* Avantaje */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-[var(--foreground)] mb-6 text-center">De ce să comanzi online de la supermarket</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVANTAJE.map(a => (
              <div key={a.titlu} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
                <div className="text-3xl mb-2">{a.icon}</div>
                <h3 className="font-bold text-[var(--foreground)] text-sm mb-1">{a.titlu}</h3>
                <p className="text-xs text-[var(--text-soft)]">{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Magazine */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <h2 className="text-xl font-black text-[var(--foreground)] mb-5">Supermarketuri online cu reduceri active</h2>
          {magazine.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {magazine.map((m) => (
              <MagazinCard key={m.magazin} m={m} />
            ))}
            </div>
          ) : (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-10 text-center">
              <p className="text-4xl mb-3">🛒</p>
              <p className="font-bold text-[var(--text-soft)] mb-2">Magazine actualizate zilnic</p>
              <p className="text-[var(--text-muted)] text-sm mb-4">Revino curând pentru promoții la supermarketuri online.</p>
              <Link href="/toate-magazinele" className="text-[var(--accent-text)] font-bold hover:text-[var(--accent-text)] text-sm">Toate magazinele &rarr;</Link>
            </div>
          )}
        </section>

        {/* Produse */}
        <NewsletterCTA />

        <NisaProduse
          merchantSlugs={["carrefour.ro","bringo.ro","freshful.ro","auchan.ro"]}
          catSlug="alimente"
          titlu="Produse alimentare de la parteneri"
          culoareAccent="blue"
          limit={12}
        />

        {/* Editorial */}
        <section className="bg-[var(--surface)] border-t border-[var(--border)] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[var(--foreground)] mb-5">Ghid: Cumpărături alimentare online — cum economisești</h2>
            <div className="space-y-4 text-sm text-[var(--text-soft)] leading-relaxed">
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Supermarket mare sau magazin specializat?</h3>
                <p>Supermarketurile online au cea mai largă gamă; magazinele specializate — cafea, ulei de măsline, produse bio, delicatese — au de obicei mai multă alegere în nișa lor. Partenerii AmCupon din această categorie sunt magazine specializate.</p>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Trucuri pentru coșul de cumpărături mai mic</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Prima comandă</strong> — multe magazine au o reducere pentru clienții noi; verifică pe site</li>
                  <li><strong>Comandă minimă</strong> — livrarea e gratuită peste un prag, diferit de la un magazin la altul</li>
                  <li><strong>Slot-uri de livrare</strong> — livrarea programată e de obicei mai ieftină decât cea urgentă</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Produse pe care merită să le comanzi online</h3>
                <p>Produsele grele (apă, detergenți, conserve, făină, ulei) sunt ideale pentru comandă online — economisești timp și efort fizic. La baxuri și ambalaje mari, compară prețul pe unitate.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Internal links */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-base font-black text-[var(--text-soft)] mb-4">Explorează și alte categorii</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/sanatate",   label: "🌿 Sănătate & Naturiste" },
              { href: "/casa",       label: "🏠 Casă & Grădină" },
              { href: "/copii",      label: "👶 Copii & Jucării" },
              { href: "/animale",    label: "🐾 Animale de Companie" },
              { href: "/oferte-azi", label: "🔥 Toate Ofertele de Azi" },
              { href: "/categorii",  label: "📂 Toate Categoriile" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-[var(--surface)] hover:bg-[var(--surface-alt)] hover:text-[var(--accent-text)] text-[var(--text-soft)] text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-[var(--border)] hover:border-[#c9ced5]">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-[var(--text-muted)] mt-4">
          &copy; {an} AmCupon.ro &middot;{" "}
          <Link href="/sanatate" className="hover:text-[var(--accent-text)]">Sănătate</Link>{" · "}
          <Link href="/casa" className="hover:text-[var(--accent-text)]">Casa</Link>{" · "}
          <Link href="/categorii" className="hover:text-[var(--accent-text)]">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
