import Link from "next/link";
import { Metadata } from "next";
import OferteNisa, { AntetNisa } from "../components/OferteNisa";
import fs from "fs";
import path from "path";
import NisaProduse from "../components/NisaProduse";
import { esteInCategorie } from "@/lib/categoriiNisa";
import { laParteneri } from "@/lib/cifreSite";
import { NISA_CATEGORII } from "@/lib/categoriiNisa";

interface Promotie { nume: string; cod_cupon: string; landing_page: string; zile_ramase: number; }
interface Magazin {
  magazin: string; url: string; url_afiliat: string; logo_url?: string;
  categorie: string; categorie_slug?: string; scor_final: number;
  are_promotie: boolean; cod_cupon: boolean; promotii: Promotie[]; trend: number;
}

export const metadata: Metadata = {
  title: "Cod Reducere Casa & Gradina 2026 | AmCupon.ro",
  description: `Coduri de reducere și oferte pentru casă și grădină ${laParteneri(NISA_CATEGORII.casa)}: mobilă, decorațiuni, grădină. Actualizate zilnic.`,
  keywords: ["cod reducere dedeman","reduceri ikea","mobila ieftina","cod reducere leroy merlin","mobexpert reducere","casa gradina reducere românia","electrocasnice reducere"],
  alternates: { canonical: "https://amcupon.ro/casa" },
  openGraph: { title: "Casa & Gradina 2026 | AmCupon.ro", url: "https://amcupon.ro/casa", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_CASA = ["electrolux.ro","clickandgrow.com"];
// Sluguri REALE din output.json — potrivire EXACTA, nu subsir (vezi lib/categoriiNisa.ts)
const CAT_CASA = ["casa-gradina"];

const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Casa & Gradina 2026","url":"https://amcupon.ro/casa","description":"Coduri și oferte pentru casa și gradina de la magazinele partenere AmCupon" };

export default function CasaPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topCasa = TOP_CASA.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restCasa = all.filter(m =>
    !TOP_CASA.includes(m.magazin) &&
    esteInCategorie(m, CAT_CASA)
  ).sort((a,b)=>(b.are_promotie?1:0)-(a.are_promotie?1:0)||(b.scor_final||0)-(a.scor_final||0)).slice(0, 16);
  const magazine = [...topCasa, ...restCasa];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[var(--background)]">
        <nav className="bg-[var(--background)] border-b border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Link href="/" className="hover:text-[var(--accent-text)]">Acasă</Link>
            <span className="mx-1">/</span>
            <span className="text-[var(--text-soft)] font-medium">Casa & Gradina</span>
          </div>
        </nav>

        <AntetNisa titlu={<>Casa & Gradina {an}</>}>Oferte {laParteneri(NISA_CATEGORII.casa, 3)} și la alte magazine partenere de amenajări</AntetNisa>
        <OferteNisa magazine={magazine} titlu="Magazine casa cu reduceri active" />
        <NisaProduse
          merchantSlugs={["dedeman.ro","ikea.com","leroy-merlin.ro","mobexpert.ro","jysk.ro","hornbach.ro"]}
          catSlug="casa"
          titlu="Produse pentru casă și grădină de la parteneri"
          culoareAccent="indigo"
          limit={12}
        />

        

        

        

        <section className="bg-[var(--surface)] border-t border-[var(--border)] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[var(--foreground)] mb-5">Ghid: Amenajări casa mai ieftine în România</h2>
            <div className="space-y-4 text-sm text-[var(--text-soft)] leading-relaxed">
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Magazin mare sau magazin specializat?</h3>
                <p>Lanturile mari de bricolaj si mobila au gama cea mai larga; magazinele specializate (mobila, saltele, electrocasnice, gradina) au de obicei mai multa alegere in nisa lor. Partenerii AmCupon din aceasta categorie apar mai sus, cu ofertele active.</p>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Când sa cumperi mobila și electrocasnice</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Black Friday</strong> — reduceri la electrocasnice mari și mobilier</li>
                  <li><strong>Ianuarie</strong> — solduri de iarna, stocuri vechi cu discount mare</li>
                  <li><strong>Primavara</strong> — promoții la articole gradina și mobilier exterior</li>
                  <li><strong>Septembrie</strong> — reluare sezon, promoții la renovări</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Sfaturi economii amenajări</h3>
                <p>Urmăriți secțiunile &quot;Outlet&quot; și produsele din colecții retrase, unde reducerile sunt de obicei mai mari. Când un partener are un cod activ, îl găsiți pe pagina lui de pe AmCupon.ro.</p>
              </div>
            </div>
          </div>
        </section>

        
      </div>
    </>
  );
}
