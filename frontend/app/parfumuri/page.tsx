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
  title: "Parfumuri România 2026 — Oferte de la Notino și Parteneri",
  description: `Oferte la parfumuri, cosmetice și skincare ${laParteneri(NISA_CATEGORII.parfumuri)}. Actualizate zilnic.`,
  keywords: ["cod reducere parfumuri", "reduceri douglas", "parfumuri ieftine", "cod reducere notino", "sephora reducere", "parfumuri originale românia", "cosmetice reducere"],
  alternates: { canonical: "https://amcupon.ro/parfumuri" },
  openGraph: { title: "Parfumuri 2026 | AmCupon.ro", url: "https://amcupon.ro/parfumuri", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_BEAUTY = ["notino.ro"];
// Sluguri REALE din output.json — potrivire EXACTA, nu subsir (vezi lib/categoriiNisa.ts)
const CAT_BEAUTY = ["beauty"];

const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Parfumuri 2026","url":"https://amcupon.ro/parfumuri","description":"Oferte la parfumuri și cosmetice de la magazinele partenere AmCupon" };

export default function ParfumuriPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topBeauty = TOP_BEAUTY.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restBeauty = all.filter(m =>
    !TOP_BEAUTY.includes(m.magazin) &&
    esteInCategorie(m, CAT_BEAUTY)
  ).sort((a,b)=>(b.are_promotie?1:0)-(a.are_promotie?1:0)||(b.scor_final||0)-(a.scor_final||0)).slice(0, 16);
  const magazine = [...topBeauty, ...restBeauty];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[var(--background)]">
        <nav className="bg-[var(--background)] border-b border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Link href="/" className="hover:text-[var(--accent-text)]">Acasă</Link>
            <span className="mx-1">/</span>
            <span className="text-[var(--text-soft)] font-medium">Parfumuri</span>
          </div>
        </nav>

        <AntetNisa titlu={<>Parfumuri {an}</>}>Oferte {laParteneri(NISA_CATEGORII.parfumuri, 3)} și la alte magazine partenere de cosmetice</AntetNisa>
        <OferteNisa magazine={magazine} titlu="Magazine cu parfumuri și cosmetice" />
        <NisaProduse
          merchantSlugs={[]}
          teme={["parfumuri-femei", "parfumuri-barbati"]}
          titlu="Parfumuri de la parteneri"
          culoareAccent="indigo"
          limit={12}
        />

        

        

        

        <section className="bg-[var(--surface)] border-t border-[var(--border)] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[var(--foreground)] mb-5">Ghid: Parfumuri originale ieftine în România</h2>
            <div className="space-y-4 text-sm text-[var(--text-soft)] leading-relaxed">
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Unde cumperi parfumuri originale</h3>
                <p>Cumpără de la magazine care declară că vând produse originale, de la distribuitori autorizați, și citește politica de retur: la parfumurile desigilate, dreptul de retur poate să nu se aplice. Notino și ceilalți parteneri AmCupon apar mai sus, cu ofertele active.</p>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Parfumuri populare</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Chanel Coco Mademoiselle</strong> — chypre floral</li>
                  <li><strong>Dior Sauvage</strong> — aromatic fougère, unul dintre cele mai cunoscute parfumuri masculine</li>
                  <li><strong>YSL Black Opium</strong> — oriental-vanilat, cu note de cafea</li>
                  <li><strong>Giorgio Armâni Sì</strong> — chypre fructat</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Când să cumperi</h3>
                <p>Cele mai mari reduceri la parfumuri apar în noiembrie (Black Friday), înainte de Crăciun și de Valentine&apos;s Day.</p>
              </div>
            </div>
          </div>
        </section>

        

        
      </div>
    </>
  );
}
