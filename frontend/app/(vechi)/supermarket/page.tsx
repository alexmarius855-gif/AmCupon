import Link from "next/link";
import { Metadata } from "next";
import OferteNisa, { AntetNisa } from "../components/OferteNisa";
import fs from "fs";
import path from "path";
import NisaProduse from "../components/NisaProduse";
import { esteInCategorie, NISA_CATEGORII } from "@/lib/categoriiNisa";
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
        <AntetNisa titlu={<>Supermarket Online {an}</>}>Alimente și băuturi {laParteneri(NISA_CATEGORII.supermarket)} și la alte magazine partenere, cu livrare la domiciliu.</AntetNisa>
        <OferteNisa magazine={magazine} titlu="Supermarketuri online cu reduceri active" />
        <NisaProduse
          merchantSlugs={["carrefour.ro","bringo.ro","freshful.ro","auchan.ro"]}
          catSlug="alimente"
          titlu="Produse alimentare de la parteneri"
          culoareAccent="blue"
          limit={12}
        />

        {/* Stats */}
        <div className="bg-[var(--surface)] border-[var(--border)] py-3 px-4">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-6 text-sm">
            <span className="text-[var(--accent-text)] font-semibold">
              <span className="font-black text-[var(--accent-text)]">{magazine.length}</span> magazine alimentare
            </span>
            <span className="text-[var(--accent-text)] font-semibold">
              <span className="font-black text-[var(--accent-text)]">{cuPromo.length}</span> cu promotii active
            </span>
            <span className="text-[var(--accent-text)] font-semibold">&#10003; Actualizat zilnic</span>
          </div>
        </div>

        {/* Avantaje */}
        

        {/* Magazine */}
        

        {/* Produse */}

        

        {/* Editorial */}
        <section className="bg-[var(--surface)] border-t border-[var(--border)] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[var(--foreground)] mb-5">Ghid: Cumpărături alimentare online — cum economisești</h2>
            <div className="space-y-4 text-sm text-[var(--text-soft)] leading-relaxed">
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Supermarket mare sau magazin specializat?</h3>
                <p>Supermarketurile online au cea mai larga gama; magazinele specializate — cafea, ulei de masline, produse bio, delicatese — au de obicei mai multa alegere in nisa lor. Partenerii AmCupon din aceasta categorie sunt magazine specializate.</p>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Trucuri pentru coșul de cumpărături mai mic</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Prima comanda</strong> — multe magazine au o reducere pentru clientii noi; verifica pe site</li>
                  <li><strong>Comanda minima</strong> — livrarea e gratuita peste un prag, diferit de la un magazin la altul</li>
                  <li><strong>Slot-uri de livrare</strong> — livrarea programata e de obicei mai ieftina decât cea urgenta</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Produse pe care merita sa le comanzi online</h3>
                <p>Produsele grele (apa, detergenți, conserve, faina, ulei) sunt ideale pentru comanda online — economisești timp și efort fizic. La baxuri și ambalaje mari, compara prețul pe unitate.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Internal links */}
        

        
      </div>
    </>
  );
}
