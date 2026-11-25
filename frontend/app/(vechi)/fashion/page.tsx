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
  title: "Cod Reducere Fashion & Haine 2026 — Answear și Parteneri",
  description: `Coduri de reducere și oferte la haine, pantofi și accesorii ${laParteneri(NISA_CATEGORII.fashion)}. Actualizate zilnic.`,
  keywords: ["cod reducere fashiondays","reduceri answear","haine ieftine online","cod reducere hm","reserved reducere","fashion online românia","îmbrăcăminte reducere"],
  alternates: { canonical: "https://amcupon.ro/fashion" },
  openGraph: { title: "Fashion & Haine 2026 | AmCupon.ro", url: "https://amcupon.ro/fashion", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_FASHION = ["answear.ro"];
// Sluguri REALE din output.json — potrivire EXACTA, nu subsir (vezi lib/categoriiNisa.ts)
const CAT_FASHION = ["fashion"];

const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Fashion & Haine 2026","url":"https://amcupon.ro/fashion","description":"Coduri și oferte la haine de la magazinele partenere AmCupon" };

export default function FashionPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topFashion = TOP_FASHION.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restFashion = all.filter(m =>
    !TOP_FASHION.includes(m.magazin) &&
    esteInCategorie(m, CAT_FASHION)
  ).sort((a,b)=>(b.are_promotie?1:0)-(a.are_promotie?1:0)||(b.scor_final||0)-(a.scor_final||0)).slice(0, 16);
  const magazine = [...topFashion, ...restFashion];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[var(--background)]">
        <nav className="bg-[var(--background)] border-b border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Link href="/" className="hover:text-[var(--accent-text)]">Acasă</Link>
            <span className="mx-1">/</span>
            <span className="text-[var(--text-soft)] font-medium">Fashion & Haine</span>
          </div>
        </nav>

        <AntetNisa titlu={<>Fashion & Haine {an}</>}>Oferte {laParteneri(NISA_CATEGORII.fashion, 3)} și la alte magazine partenere de modă</AntetNisa>
        <OferteNisa magazine={magazine} titlu="Magazine fashion cu reduceri active" />
        <NisaProduse
          merchantSlugs={["answear.ro","hm.com","reserved.com","about-you.ro","lc-waikiki.ro"]}
          catSlug="fashion"
          titlu="Haine și accesorii de la parteneri"
          culoareAccent="indigo"
          limit={12}
        />

        

        

        

        <section className="bg-[var(--surface)] border-t border-[var(--border)] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[var(--foreground)] mb-5">Ghid: Haine online mai ieftine în România</h2>
            <div className="space-y-4 text-sm text-[var(--text-soft)] leading-relaxed">
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Unde găsești reduceri la haine</h3>
                <p>Answear si ceilalti parteneri AmCupon de moda au sectiuni de reduceri si promotii de sezon; ofertele lor active apar mai sus, pe cardurile magazinelor.</p>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Cele mai bune perioade pentru cumpărături fashion</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Solduri de iarna (ianuarie)</strong> — reduceri mari la colecțiile de toamna-iarna</li>
                  <li><strong>Solduri de vara (iulie)</strong> — lichidare stocuri primavara-vara</li>
                  <li><strong>Black Friday</strong> — discount-uri la branduri premium</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Cum economisești la haine online</h3>
                <p>Adauga produsele în lista de favorite a magazinului și așteaptă o promoție. La sfârșit de sezon, colecția care pleacă intra la reducere.</p>
              </div>
            </div>
          </div>
        </section>

        
      </div>
    </>
  );
}
