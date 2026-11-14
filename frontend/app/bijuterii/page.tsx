import Link from "next/link";
import { deNumar } from "@/lib/acordNumeral";
import { Metadata } from "next";
import OferteNisa, { AntetNisa } from "../components/OferteNisa";
import fs from "fs";
import path from "path";
import NisaProduse from "../components/NisaProduse";

interface Promotie { nume: string; cod_cupon: string; landing_page: string; zile_ramase: number; }
interface Magazin {
  magazin: string; url: string; url_afiliat: string; logo_url?: string;
  categorie: string; categorie_slug?: string; scor_final: number;
  are_promotie: boolean; cod_cupon: boolean; promotii: Promotie[]; trend: number;
}

export const metadata: Metadata = {
  title: "Cod Reducere Bijuterii & Accesorii 2026 — Aur, Argint",
  description: "Coduri de reducere și oferte la bijuterii de la magazinele partenere: Chic Bijoux, Novvu, Bijubox, Lu.ro și altele. Aur, argint, cristale, inele, bratari, coliere.",
  keywords: ["cod reducere bijuterii","reduceri aur","argint reducere","bijuterii online românia","inele reducere","bratari reducere","coliere reducere"],
  alternates: { canonical: "https://amcupon.ro/bijuterii" },
  openGraph: { title: "Bijuterii 2026 | AmCupon.ro", url: "https://amcupon.ro/bijuterii", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Bijuterii 2026",
  "url": "https://amcupon.ro/bijuterii",
  "description": "Coduri reducere bijuterii online România — aur, argint, cristale, inele, bratari, coliere"
};

export default function BijuteriiPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const magazine = all.filter(m => m.categorie_slug === "bijuterii" || ["pandahall.com", "silverrushstyle.com"].includes(m.magazin));
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
            <span className="text-[var(--text-soft)] font-medium">Bijuterii & Accesorii</span>
          </div>
        </nav>

        {/* Hero */}
        <AntetNisa titlu={<>Bijuterii {an}</>}>Inele, coliere, bratari și seturi de bijuterii de la Novvu, Bijubox, Chic Bijoux și alte magazine partenere, actualizate zilnic.</AntetNisa>
        <OferteNisa magazine={magazine} titlu="Magazine bijuterii partenere" />
        <NisaProduse
          merchantSlugs={["fluturasi.ro","chicbijoux.ro","novvu.ro","bijubox.ro","androvelli.ro","lu.ro"]}
          catSlug="bijuterii"
          titlu="Bijuterii de la magazinele partenere"
          culoareAccent="indigo"
          limit={12}
        />

        {/* Stats */}
        <div className="bg-[var(--surface)] border-[var(--border)] py-3 px-4">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-6 text-sm">
            <span className="text-[var(--accent-text)] font-semibold">
              <span className="font-black text-[var(--accent-text)]">{magazine.length}</span>{deNumar(magazine.length)} magazine bijuterii
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
            <h2 className="text-xl font-black text-[var(--foreground)] mb-5">Ghid: Bijuterii online — cum alegi și cum economisești</h2>
            <div className="space-y-4 text-sm text-[var(--text-soft)] leading-relaxed">
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Magazine romanesti de bijuterii online</h3>
                <p>Chic Bijoux, Novvu, Bijubox și Lu.ro sunt printre magazinele romanesti partenere AmCupon.ro pentru bijuterii — fiecare cu propriul stil și gama de preturi, de la argint accesibil la piese premium din aur. Verifica fiecare magazin pe pagina lui dedicata pentru codurile active.</p>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Cum verifici calitatea bijuteriilor online</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Marca poansonare</strong> — aur 585 (14K), 750 (18K) sau argint 925 obligatoriu stampilate</li>
                  <li><strong>Certificat de autenticitate</strong> — pentru diamante și pietre prețioase, cere certificat de la un laborator recunoscut (de exemplu GIA)</li>
                  <li><strong>Garanție</strong> — garantia legala de conformitate e de 2 ani; unele magazine ofera si garantie comerciala</li>
                  <li><strong>Politica de retur</strong> — conteaza daca marimea inelului nu se potriveste; verifica daca returul e gratuit</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Când sa cumperi bijuterii</h3>
                <p>Reducerile apar de obicei de Valentine&apos;s Day (februarie), de Crăciun și la lichidările de stoc (ianuarie, iulie). Când vine o colecție noua, cea veche intra des la reducere.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Internal links */}
        

        
      </div>
    </>
  );
}
