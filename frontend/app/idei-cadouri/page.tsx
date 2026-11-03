import Link from "next/link";
import { Metadata } from "next";
import OferteNisa, { AntetNisa } from "../components/OferteNisa";
import fs from "fs";
import path from "path";
import NisaProduse from "../components/NisaProduse";
import { esteInCategorie } from "../../lib/categoriiNisa";

interface Promotie { nume: string; cod_cupon: string; landing_page: string; zile_ramase: number; }
interface Magazin {
  magazin: string; url: string; url_afiliat: string; logo_url?: string;
  categorie: string; categorie_slug?: string; scor_final: number;
  are_promotie: boolean; cod_cupon: boolean; promotii: Promotie[]; trend: number;
}

export const metadata: Metadata = {
  title: "Idei de Cadouri 2026 — Reduceri la Cadouri Online",
  description: "Idei de cadouri pentru orice ocazie: ziua de naștere, aniversare, Crăciun, Valentine's Day. Coduri de reducere și oferte active la jucării, fashion, beauty, electronice și bijuterii, de la magazinele partenere.",
  keywords: ["idei cadouri", "cadouri reducere", "cadou ziua nașterii", "cadou crăciun", "cadouri online ieftine", "voucher cadou românia", "cod reducere cadouri"],
  alternates: { canonical: "https://amcupon.ro/idei-cadouri" },
  openGraph: { title: "Idei Cadouri cu Reducere 2026 | AmCupon.ro", url: "https://amcupon.ro/idei-cadouri", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_CADOURI = [
  "noriel.ro","notino.ro","elefant.ro",
  "floria.ro","answear.ro","zchocolat.com",
];
// Sluguri REALE din output.json — potrivire EXACTA, nu subsir (vezi lib/categoriiNisa.ts)
const CAT_CADOURI = ["cadouri-flori"];

const IDEI_PER_PROFIL = [
  {
    profil: "👩 Cadouri pentru ea", culoare: "bg-[var(--surface)] border-[var(--accent-text)]",
    idei: ["Parfumuri & Cosmetice → Notino", "Haine & Accesorii → Answear", "Bijuterii → Teilor", "Carte preferată → Cărturești"],
    link: "/categorii/beauty",
  },
  {
    profil: "👨 Cadouri pentru el", culoare: "bg-[var(--surface)] border-[var(--accent-text)]",
    idei: ["Gadget tech → Evomag", "Echipament sport → Decathlon", "Parfum masculin → Notino", "Carte business → Libris"],
    link: "/categorii/electronice",
  },
  {
    profil: "🧒 Cadouri pentru copii", culoare: "bg-[var(--surface)] border-yellow-200",
    idei: ["Jucării educative → Noriel", "Cărți ilustrate → Libris", "Jocuri de masă → Cărturești", "Set creativ → Craftup"],
    link: "/categorii/copii",
  },
  {
    profil: "👴 Cadouri pentru părinți", culoare: "bg-[var(--surface)] border-green-200",
    idei: ["Electrocasnice → Electrolux", "Cărți → Libris", "Îngrijire → Notino", "Casă și grădină → partenerii din categorie"],
    link: "/categorii/casa-gradina",
  },
];

const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Idei Cadouri cu Reducere 2026","url":"https://amcupon.ro/idei-cadouri" };

export default function IdeiCadouriPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topCadouri = TOP_CADOURI.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restCadouri = all.filter(m =>
    !TOP_CADOURI.includes(m.magazin) &&
   
    esteInCategorie(m, CAT_CADOURI)
  ).sort((a,b)=>(b.are_promotie?1:0)-(a.are_promotie?1:0)||(b.scor_final||0)-(a.scor_final||0)).slice(0, 20);
  const magazine = [...topCadouri, ...restCadouri];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[var(--background)]">

        <nav className="bg-[var(--background)] border-b border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Link href="/" className="hover:text-[var(--accent-text)]">Acasă</Link>
            <span className="mx-1 text-gray-300">/</span>
            <span className="text-[var(--text-soft)] font-medium">Idei Cadouri</span>
          </div>
        </nav>

        {/* HERO */}
        <AntetNisa titlu={<>Idei de Cadouri {an}</>}>Cadoul perfect pentru orice ocazie, la prețuri reduse — jucării, fashion, beauty, electronice, cărți</AntetNisa>
        <OferteNisa magazine={magazine} titlu="Magazine cu reduceri la cadouri" />
        <NisaProduse
          merchantSlugs={["noriel.ro","notino.ro","elefant.ro","floria.ro"]}
          catSlug="bijuterii"
          titlu="Idei de cadouri de la parteneri"
          culoareAccent="indigo"
          limit={12}
        />

        {/* IDEI PER PROFIL */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-[var(--foreground)] mb-6 text-center">Cadouri după persoană</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {IDEI_PER_PROFIL.map(p => (
              <a key={p.profil} href={p.link}
                className={`${p.culoare} rounded-xl p-5 border hover:shadow-md transition-all group`}>
                <h3 className="font-black text-[var(--foreground)] text-sm mb-3">{p.profil}</h3>
                <ul className="space-y-1.5">
                  {p.idei.map(i => (
                    <li key={i} className="text-xs text-[var(--text-soft)] flex items-start gap-1.5">
                      <span className="text-[var(--text-muted)] mt-0.5 shrink-0">·</span>{i}
                    </li>
                  ))}
                </ul>
                <p className="text-xs font-bold text-[var(--accent-text)] mt-3 group-hover:text-[var(--accent-text)]">
                  Vezi reduceri →
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* MAGAZINE CU REDUCERI */}
        

        

        {/* SEO CONTENT */}
        <section className="bg-[var(--surface)] border-t border-[var(--border)] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[var(--foreground)] mb-5">Ghid: Cum alegi cadoul perfect</h2>
            <div className="space-y-4 text-sm text-[var(--text-soft)] leading-relaxed">
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Cum economisești la cadouri online?</h3>
                <p>Folosește codurile de reducere de pe AmCupon.ro înainte de orice comandă. Ofertele se actualizează automat de trei ori pe zi, de la Noriel, Notino și celelalte magazine partenere.</p>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Când să cumperi cadourile?</h3>
                <p>Cel mai bun moment: Black Friday (noiembrie), perioadele de sale (ianuarie, iulie) sau cu 1-2 săptămâni înainte de ocazie. Evită cumpărăturile din ultimele zile — livrarea poate întârzia.</p>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Cadouri care nu dau greș niciodată</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Parfumuri originale</strong> — Notino</li>
                  <li><strong>Cărți</strong> — Libris, Cărturești</li>
                  <li><strong>Jucării educative</strong> — Noriel (set LEGO, puzzle)</li>
                  <li><strong>Card cadou</strong> — flexibil pentru oricine; multe magazine îl vând online</li>
                  <li><strong>Experiențe</strong> — SPA, escape room, un curs</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        

        
      </div>
    </>
  );
}
