import Link from "next/link";
import { Metadata } from "next";
import OferteNisa, { AntetNisa } from "../components/OferteNisa";
import fs from "fs";
import path from "path";
import NisaProduse from "../components/NisaProduse";
import { esteInCategorie } from "../../lib/categoriiNisa";
import { laParteneri } from "@/lib/cifreSite";
import { NISA_CATEGORII } from "@/lib/categoriiNisa";

interface Promotie { nume: string; cod_cupon: string; landing_page: string; zile_ramase: number; }
interface Magazin {
  magazin: string; url: string; url_afiliat: string; logo_url?: string;
  categorie: string; categorie_slug?: string; scor_final: number;
  are_promotie: boolean; cod_cupon: boolean; promotii: Promotie[]; trend: number;
}

export const metadata: Metadata = {
  title: "Farmacie Online Ieftină România 2026 — Reduceri Dr. Max",
  description: `Coduri de reducere și oferte la farmaciile online ${laParteneri(NISA_CATEGORII.farmacie)}: suplimente, medicamente fără rețetă, dermatocosmetice.`,
  keywords: ["farmacie online", "cod reducere dr max", "reduceri vegis", "suplimente ieftine", "medicamente online românia", "farmacie reducere", "catena online"],
  alternates: { canonical: "https://amcupon.ro/farmacie" },
  openGraph: { title: "Farmacie Online 2026 | AmCupon.ro", url: "https://amcupon.ro/farmacie", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_PHARMA = ["drmax.ro"];
// Sluguri REALE din output.json — potrivire EXACTA, nu subsir (vezi lib/categoriiNisa.ts)
const CAT_PHARMA = ["sanatate"];
const AVANTAJE = [
  { icon: "💊", titlu: "Medicamente OTC", desc: "Antialgice, antitusive, vitamine — fără rețetă" },
  { icon: "🌿", titlu: "Naturiste & Suplimente", desc: "Plante medicinale, vitamine, probiotice" },
  { icon: "💄", titlu: "Cosmetice Medicale", desc: "Vichy, La Roche-Posay, Avène — dermatologic testate" },
  { icon: "🩺", titlu: "Aparate Medicale", desc: "Tensiometre, glucometre, termometre" },
  { icon: "🍼", titlu: "Mamă & Bebe", desc: "Produse pentru sarcină, bebeluși, alăptare" },
  { icon: "🐾", titlu: "Produse Veterinare", desc: "Antiparazitare, vitamine pentru animale" },
];

const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Farmacie Online 2026","url":"https://amcupon.ro/farmacie","description":"Coduri și oferte de la farmaciile online partenere AmCupon" };

export default function FarmaciePage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topPharma = TOP_PHARMA.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restPharma = all.filter(m =>
    !TOP_PHARMA.includes(m.magazin) &&
    esteInCategorie(m, CAT_PHARMA)
  ).sort((a,b)=>(b.are_promotie?1:0)-(a.are_promotie?1:0)||(b.scor_final||0)-(a.scor_final||0)).slice(0, 16);
  const magazine = [...topPharma, ...restPharma];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[var(--background)]">
        <nav className="bg-[var(--background)] border-b border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Link href="/" className="hover:text-[var(--accent-text)]">Acasă</Link>
            <span className="mx-1">/</span>
            <span className="text-[var(--text-soft)] font-medium">Farmacie Online</span>
          </div>
        </nav>

        {/* HERO */}
        <AntetNisa titlu={<>Farmacie Online {an}</>}>Oferte {laParteneri(NISA_CATEGORII.farmacie, 3)} și la alte farmacii online partenere</AntetNisa>
        <OferteNisa magazine={magazine} titlu="Farmacii și magazine de sănătate" />
        <NisaProduse
          merchantSlugs={["drmax.ro","catena.ro","helpnet.ro","farmaciatei.ro","farmacia.ro"]}
          catSlug="farmacie"
          titlu="Produse de farmacie de la parteneri"
          culoareAccent="indigo"
          limit={12}
        />

        {/* AVANTAJE */}
        

        {/* MAGAZINE */}
        

        

        {/* SEO */}
        <section className="bg-[var(--surface)] border-t border-[var(--border)] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[var(--foreground)] mb-5">Ghid: Farmacie online în România</h2>
            <div className="space-y-4 text-sm text-[var(--text-soft)] leading-relaxed">
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">De ce farmacie online?</h3>
                <p>Online găsești de obicei o gamă mai largă și poți compara prețurile între farmacii. Termenul de livrare diferă de la o farmacie la alta. Dr. Max, Vegis și ceilalți parteneri AmCupon apar mai sus, cu ofertele active.</p>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Produse căutate des</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Vitamina D3 + K2</strong> — nivelul vitaminei D se află din analize</li>
                  <li><strong>Magneziu</strong> — există mai multe forme (citrat, bisglicinat); întreabă farmacistul</li>
                  <li><strong>Omega-3 (EPA + DHA)</strong></li>
                  <li><strong>Dermatocosmetice</strong> — Vichy, La Roche-Posay</li>
                  <li><strong>Tensiometre</strong> — Omron și alte mărci</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Sfaturi pentru economii</h3>
                <p>Abonează-te la newsletterul farmaciei preferate — anunță promoțiile. La produsele pe care le iei constant, pachetele mai mari ies de obicei mai ieftin. Înainte de un supliment, întreabă medicul sau farmacistul.</p>
              </div>
            </div>
          </div>
        </section>

        

        
      </div>
    </>
  );
}
