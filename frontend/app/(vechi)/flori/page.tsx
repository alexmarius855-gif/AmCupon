import Link from "next/link";
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
  title: "Reduceri Flori & Buchete 2026 — Florării Online | AmCupon.ro",
  description: "Florării online partenere AmCupon — Floria.ro, 3gifts.ro: flori și buchete pentru orice ocazie, cu ofertele active când există.",
  keywords: ["reduceri flori", "cod reducere floria", "livrare flori online românia", "buchete reducere", "florărie online ieftina", "flori cadou reducere"],
  alternates: { canonical: "https://amcupon.ro/flori" },
  openGraph: { title: "Reduceri Flori & Buchete 2026 | AmCupon.ro", url: "https://amcupon.ro/flori", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_FLORI = ["floria.ro", "3gifts.ro", "mariart.ro"];
// brazicraciun.net e in aceeasi categorie 2P "Gifts & Flowers" dar vinde brazi de Craciun,
// nu flori — exclus explicit ca sa nu apara gresit pe pagina de flori.
const EXCLUSE = new Set(["brazicraciun.net"]);

const OCAZII = [
  { emoji: "💐", label: "Zi de naștere", desc: "Buchete vesele, colorate" },
  { emoji: "💍", label: "Aniversare/Nuntă", desc: "Aranjamente elegante" },
  { emoji: "❤️", label: "Valentine's Day", desc: "Trandafiri & romantism" },
  { emoji: "👩", label: "8 Martie", desc: "Flori pentru femeile dragi" },
  { emoji: "🎉", label: "Felicitări", desc: "Promovare, examen, reușită" },
  { emoji: "🕊️", label: "Condoleanțe", desc: "Coroane & aranjamente discrete" },
];

const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Reduceri Flori & Buchete 2026","url":"https://amcupon.ro/flori" };

export default function FloriPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topFlori = TOP_FLORI.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restFlori = all.filter(m =>
    !TOP_FLORI.includes(m.magazin) && !EXCLUSE.has(m.magazin) &&
    m.categorie_slug === "cadouri-flori"
  ).slice(0, 8);
  const magazine = [...topFlori, ...restFlori];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[var(--background)]">
        <nav className="bg-[var(--background)] border-b border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Link href="/" className="hover:text-[var(--accent-text)]">Acasă</Link>
            <span className="mx-1">/</span>
            <span className="text-[var(--text-soft)] font-medium">Flori & Buchete</span>
          </div>
        </nav>

        {/* HERO */}
        <AntetNisa titlu={<>Flori & Buchete {an}</>}>Florării online partenere, cu ofertele active pentru orice ocazie</AntetNisa>
        <OferteNisa magazine={magazine} titlu="Florării cu reduceri active" />
        <NisaProduse
          merchantSlugs={[]}
          potrivire={/^(buchet|aranjament (floral|de flori|cu flori)|cutie (cu|de) (flori|trandafiri)|trandafiri? (criogenat|naturali|rosii|in cutie)|flori (naturale|criogenate|uscate))/}
          titlu="Buchete și aranjamente de la parteneri"
          culoareAccent="rose"
          limit={12}
        />

        {/* OCAZII */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-[var(--foreground)] mb-6 text-center">Flori pentru orice ocazie</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {OCAZII.map(o => (
              <div key={o.label}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:shadow-md transition-all">
                <div className="text-3xl mb-2">{o.emoji}</div>
                <h3 className="font-bold text-[var(--foreground)] text-sm mb-1">{o.label}</h3>
                <p className="text-xs text-[var(--text-soft)]">{o.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* MAGAZINE */}
        

        

        {/* SEO */}
        <section className="bg-[var(--surface)] border-t border-[var(--border)] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[var(--foreground)] mb-5">Cum alegi florăria potrivită</h2>
            <div className="space-y-4 text-sm text-[var(--text-soft)] leading-relaxed">
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Livrare rapidă vs. programată</h3>
                <p>Pentru ocaziile de ultim moment, caută florăriile cu livrare în aceeași zi și verifică ora-limită pentru comenzi. Pentru evenimente planificate (nuntă, aniversare), comandă din timp.</p>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Sfaturi pentru economii la flori {an}</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Abonamente flori</strong> — unele florării oferă reduceri la livrări recurente lunare</li>
                  <li><strong>Sezonalitate</strong> — florile de sezon sunt de obicei mai ieftine decât cele de import</li>
                  <li><strong>Coduri de reducere</strong> — verifică AmCupon înainte de orice comandă, mai ales de 8 Martie și Valentine&apos;s Day</li>
                  <li><strong>Combo cadou</strong> — buchet + cadou mic (ciocolată, vin) e deseori mai ieftin combinat decât separat</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-base font-black text-[var(--text-soft)] mb-4">Explorează și alte categorii</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/idei-cadouri", label: "🎁 Idei Cadouri" },
              { href: "/calatorie", label: "✈️ Vacanțe & Călătorii" },
              { href: "/fashion", label: "👗 Fashion" },
              { href: "/top-reduceri", label: "🏆 Top Reduceri" },
              { href: "/categorii", label: "📂 Categorii" },
              { href: "/oferte-azi", label: "🔥 Oferte de Azi" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-[var(--surface)] hover:bg-[var(--surface-alt)] hover:text-[var(--accent-text)] text-[var(--text-soft)] text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-[var(--border)] hover:border-[var(--accent-text)]">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        
      </div>
    </>
  );
}
