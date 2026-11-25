import Link from "next/link";
import { Metadata } from "next";
import OferteNisa, { AntetNisa } from "../components/OferteNisa";
import fs from "fs";
import path from "path";
import NisaProduse from "../components/NisaProduse";
import { esteInCategorie } from "@/lib/categoriiNisa";

interface Promotie { nume: string; cod_cupon: string; landing_page: string; zile_ramase: number; }
interface Magazin {
  magazin: string; url: string; url_afiliat: string; logo_url?: string;
  categorie: string; categorie_slug?: string; scor_final: number;
  are_promotie: boolean; cod_cupon: boolean; promotii: Promotie[]; trend: number;
}

export const metadata: Metadata = {
  title: "Cod Reducere Sănătate & Naturiste 2026 — Vitamine",
  description: "Coduri de reducere și oferte la produse naturiste și suplimente de la magazinele partenere: Pronaturiste, GoldNutrition, Apiland și altele. Vitamine, suplimente, bio.",
  keywords: ["cod reducere sănătate","reduceri suplimente","produse naturiste reducere","vitamine ieftine","goldnutrition cod cupon","pronaturiste reducere","suplimente online românia"],
  alternates: { canonical: "https://amcupon.ro/sanatate" },
  openGraph: { title: "Sănătate & Naturiste 2026 | AmCupon.ro", url: "https://amcupon.ro/sanatate", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_SANATATE = ["pronaturiste.ro","vitamix.ro","goldnutrition.ro","apiland.ro","botaniq.ro","republicabio.ro","zephyrlabs.ro","tratamentenaturiste.ro","vioi.ro","biomag.ro","minuneanaturii.ro","nutraceutics.ro"];
// Sluguri REALE din output.json — potrivire EXACTA, nu subsir (vezi lib/categoriiNisa.ts)
const CAT_SANATATE = ["sanatate"];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Sănătate & Naturiste 2026",
  "url": "https://amcupon.ro/sanatate",
  "description": "Coduri reducere suplimente, naturiste și wellness România"
};

export default function SanatatePage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topSanatate = TOP_SANATATE
    .map(s => all.find(m => m.magazin === s))
    .filter(Boolean) as Magazin[];

  const restSanatate = all.filter(m =>
    !TOP_SANATATE.includes(m.magazin) &&
    esteInCategorie(m, CAT_SANATATE)
  ).sort((a,b)=>(b.are_promotie?1:0)-(a.are_promotie?1:0)||(b.scor_final||0)-(a.scor_final||0)).slice(0, 12);

  const magazine = [...topSanatate, ...restSanatate];
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
            <span className="text-[var(--text-soft)] font-medium">Sănătate & Naturiste</span>
          </div>
        </nav>

        {/* Hero */}
        <AntetNisa titlu={<>Sănătate & Naturiste {an}</>}>Vitamine, suplimente și produse naturiste de la Pronaturiste, GoldNutrition, Apiland și alte magazine partenere, actualizate zilnic.</AntetNisa>
        <OferteNisa magazine={magazine} titlu="Magazine sănătate cu reduceri active" />
        <NisaProduse
          merchantSlugs={["pronaturiste.ro","vitamix.ro","goldnutrition.ro","apiland.ro","botaniq.ro","republicabio.ro"]}
          catSlug="farmacie"
          titlu="Suplimente și produse naturiste populare"
          culoareAccent="indigo"
          limit={12}
        />

        {/* Stats bar */}
        <div className="bg-[var(--surface)] border-[var(--border)] py-3 px-4">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-6 text-sm">
            <span className="text-[var(--accent-text)] font-semibold">
              <span className="font-black text-[var(--accent-text)]">{magazine.length}</span> magazine sanatate
            </span>
            <span className="text-[var(--accent-text)] font-semibold">
              <span className="font-black text-[var(--accent-text)]">{cuPromo.length}</span> cu promotii active
            </span>
            <span className="text-[var(--accent-text)] font-semibold">
              &#10003; Actualizat zilnic
            </span>
          </div>
        </div>

        {/* Avantaje */}
        

        {/* Magazine */}
        

        {/* Produse */}

        

        {/* Editorial */}
        <section className="bg-[var(--surface)] border-t border-[var(--border)] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[var(--foreground)] mb-5">Ghid: Suplimente și naturiste — ce sa alegi</h2>
            <div className="space-y-4 text-sm text-[var(--text-soft)] leading-relaxed">
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Ce găsești la partenerii AmCupon</h3>
                <p>Pronaturiste are produse naturiste (plante, tincturi, ceaiuri), GoldNutrition — suplimente pentru sportivi (proteine, aminoacizi, creatina), iar Apiland — produse apicole. Ofertele lor active apar mai sus.</p>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Înainte sa cumperi suplimente</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Întreabă medicul</strong> — mai ales dacă iei un tratament sau ești insarcinata</li>
                  <li><strong>Analize</strong> — de exemplu, nivelul vitaminei D se afla dintr-un test de sânge</li>
                  <li><strong>Doza</strong> — respecta doza de pe eticheta; mai mult nu inseamna mai bine</li>
                  <li><strong>Dieta</strong> — suplimentele alimentare nu înlocuiesc o dieta variata</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Cum economisești la suplimente</h3>
                <p>La promotii poti cumpara pentru cateva luni — verifica data de expirare. Pachetele combo ies de obicei mai ieftin; compara pretul pe doza.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Internal links */}
        

        
      </div>
    </>
  );
}
