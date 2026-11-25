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
  title: "Reduceri Sport & Fitness 2026 | AmCupon.ro",
  description: `Coduri de reducere și oferte la echipament sport și fitness ${laParteneri(NISA_CATEGORII.sport)}: biciclete, sală, outdoor, running.`,
  keywords: ["reduceri sport", "cod reducere decathlon", "echipament fitness ieftin", "bicicleta reducere", "sportisimo reducere", "sport outdoor reducere românia"],
  alternates: { canonical: "https://amcupon.ro/sport" },
  openGraph: { title: "Reduceri Sport & Fitness 2026 | AmCupon.ro", url: "https://amcupon.ro/sport", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_SPORT = ["decathlon.ro","trampolinepartsandsupply.com"];
// Sluguri REALE din output.json — potrivire EXACTA, nu subsir (vezi lib/categoriiNisa.ts)
const CAT_SPORT = ["sport"];

const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Reduceri Sport & Fitness 2026","url":"https://amcupon.ro/sport" };

export default function SportPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topSport = TOP_SPORT.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restSport = all.filter(m =>
    !TOP_SPORT.includes(m.magazin) &&
    esteInCategorie(m, CAT_SPORT)
  ).sort((a,b)=>(b.are_promotie?1:0)-(a.are_promotie?1:0)||(b.scor_final||0)-(a.scor_final||0)).slice(0, 16);
  const magazine = [...topSport, ...restSport];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[var(--background)]">
        <nav className="bg-[var(--background)] border-b border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Link href="/" className="hover:text-[var(--accent-text)]">Acasă</Link>
            <span className="mx-1">/</span>
            <span className="text-[var(--text-soft)] font-medium">Sport & Fitness</span>
          </div>
        </nav>

        {/* HERO */}
        <AntetNisa titlu={<>Sport & Fitness {an}</>}>Echipament sport, biciclete, sală fitness — oferte {laParteneri(NISA_CATEGORII.sport)}, actualizate zilnic</AntetNisa>
        <OferteNisa magazine={magazine} titlu="Magazine sport cu reduceri active" />
        <NisaProduse
          merchantSlugs={["decathlon.ro","sportisimo.ro","sport-vision.ro","intersport.ro","hervis.ro","gigasport.ro"]}
          catSlug="sport"
          // 07.10.2026: doar Decathlon are feed, iar marketplace-ul lui vinde si ce nu e echipament:
          // capsule „Evening Primrose Oil", o camera foto pentru copii, saboti Crocs. Le scoate titlul.
          potrivire={/^(?!.*\b(acizi|ulei|capsule|supliment\w*|vitamin\w*|camera|cam|saboti?|crocs|sandale|papuci)\b)/}
          titlu="Echipament sportiv de la parteneri"
          culoareAccent="indigo"
          limit={12}
        />

        {/* MAGAZINE */}
        

        

        {/* SEO */}
        <section className="bg-[var(--surface)] border-t border-[var(--border)] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[var(--foreground)] mb-5">Ghid: Echipament sport mai ieftin</h2>
            <div className="space-y-4 text-sm text-[var(--text-soft)] leading-relaxed">
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Cum economisești la echipament sport</h3>
                <p>Brandurile proprii Decathlon (Quechua, Domyos, Kipsta) sunt de obicei mai ieftine decât brandurile mari de sport. Pentru echipament premium, caută reducerile de la final de sezon (ianuarie și august).</p>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Cele mai bune perioade pentru cumpărături sport</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Ianuarie</strong> — solduri de iarnă, reduceri echipament ski și fitness</li>
                  <li><strong>Iulie-August</strong> — solduri de vară, echipament outdoor, biciclete</li>
                  <li><strong>Black Friday</strong> — reduceri mari la electronice sport (ceasuri GPS, earbuds sport)</li>
                  <li><strong>Back to School</strong> — septembrie, echipament pentru activități sportive școlare</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Compară înainte să cumperi</h3>
                <p>La echipamentul scump (biciclete, ceasuri GPS, căști sport), compară prețul aceluiași model în mai multe magazine și verifică dacă partenerul are un cod activ pe AmCupon.ro.</p>
              </div>
            </div>
          </div>
        </section>

        

        
      </div>
    </>
  );
}
