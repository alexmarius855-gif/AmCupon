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
  title: "Cod Reducere Cărți Online România 2026 — Libris, Cărturești",
  description: `Coduri de reducere cărți online ${laParteneri(NISA_CATEGORII.carti)}. Cărți, audiobook-uri, e-book-uri la prețuri reduse. Actualizate zilnic.`,
  keywords: ["cod reducere carti", "reduceri libris", "carti ieftine online", "cod reducere elefant", "carturesti reducere", "carti online românia", "audiobook reducere"],
  alternates: { canonical: "https://amcupon.ro/carti" },
  openGraph: { title: "Cărți Online 2026 | AmCupon.ro", url: "https://amcupon.ro/carti", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_BOOKS = ["libris.ro","carturesti.ro","librarie.net"];
// Sluguri REALE din output.json — potrivire EXACTA, nu subsir (vezi lib/categoriiNisa.ts)
const CAT_BOOKS = ["carti-educatie"];

const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Cărți Online 2026","url":"https://amcupon.ro/carti","description":"Coduri și oferte de la librăriile online partenere AmCupon" };

export default function CartiPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topBooks = TOP_BOOKS.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restBooks = all.filter(m =>
    !TOP_BOOKS.includes(m.magazin) &&
    esteInCategorie(m, CAT_BOOKS)
  ).sort((a,b)=>(b.are_promotie?1:0)-(a.are_promotie?1:0)||(b.scor_final||0)-(a.scor_final||0)).slice(0, 12);
  const magazine = [...topBooks, ...restBooks];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[var(--background)]">
        <nav className="bg-[var(--background)] border-b border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Link href="/" className="hover:text-[var(--accent-text)]">Acasă</Link>
            <span className="mx-1">/</span>
            <span className="text-[var(--text-soft)] font-medium">Cărți Online</span>
          </div>
        </nav>

        <AntetNisa titlu={<>Cărți Online {an}</>}>Coduri de reducere și oferte {laParteneri(NISA_CATEGORII.carti, 3)} și la alte librării partenere</AntetNisa>
        <OferteNisa magazine={magazine} titlu="Librării online cu reduceri active" />
        <NisaProduse
          merchantSlugs={["elefant.ro","carturesti.ro","librarie.net","bookhub.ro"]}
          catSlug="carti"
          titlu="Cărți de la librăriile partenere"
          culoareAccent="indigo"
          limit={12}
        />

        

        

        

        <section className="bg-[var(--surface)] border-t border-[var(--border)] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[var(--foreground)] mb-5">Ghid: Cărți ieftine online în România</h2>
            <div className="space-y-4 text-sm text-[var(--text-soft)] leading-relaxed">
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Librăriile partenere</h3>
                <p>Libris și Cărturești au des campanii cu reduceri; Cărturești are și ediții speciale și cărți de artă. Ofertele lor active apar mai sus, pe cardurile magazinelor.</p>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Cărți populare</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Atomic Habits</strong> — James Clear, bestseller non-ficțiune</li>
                  <li><strong>Sapiens</strong> — Yuval Noah Harari</li>
                  <li><strong>Moromeții</strong> — Marin Preda, clasic al literaturii române</li>
                  <li><strong>Seria Harry Potter</strong> — se vinde și în pachet</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Economisește la cărți</h3>
                <p>Abonează-te la newsletterul librăriei preferate — anunță campaniile de reducere. Seturile și pachetele ies de obicei mai ieftin decât cărțile luate separat.</p>
              </div>
            </div>
          </div>
        </section>

        

        
      </div>
    </>
  );
}
