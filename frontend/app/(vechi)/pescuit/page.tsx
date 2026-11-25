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
  title: "Reduceri Echipamente Pescuit 2026 — Undite, Năluci",
  description: "Coduri reducere magazine pescuit România: Pescar Expert, Decathlon. Undite, mulinete, năluci, corturi carp — reduceri verificate, livrare rapida.",
  keywords: ["reduceri pescuit", "cod reducere pescar expert", "echipamente pescuit ieftine", "undita reducere", "năluci reducere", "pescuit românia online"],
  alternates: { canonical: "https://amcupon.ro/pescuit" },
  openGraph: {
    title: "Reduceri Echipamente Pescuit 2026 | AmCupon.ro",
    url: "https://amcupon.ro/pescuit",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
    images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }],
  },
};

const TOP_PESCUIT = ["pescar-expert.ro"];
const FALLBACK_SPORTS = ["decathlon.ro", "sportisimo.ro"];

const ECHIPAMENTE = [
  { emoji: "🎣", label: "Undite & Lansete", desc: "Crap, păstrăv, feeder, spinning, match" },
  { emoji: "🪝", label: "Năluci & Momeli", desc: "Siliconi, wobblere, twistere, popere" },
  { emoji: "🌀", label: "Mulinete", desc: "Spinning, staționar, multiplier, baitcasting" },
  { emoji: "🎒", label: "Genți & Carry-all", desc: "Transport echipament, tacklebox, rucsacuri" },
  { emoji: "⛺", label: "Corturi & Umbrele", desc: "Bivvace carp, umbrele pescuit, sleeping bag" },
  { emoji: "🧲", label: "Accesorii", desc: "Plumbi, cârlige, fir, vârtej, agrafe, flotor" },
];

const BRANDURI = ["Daiwa", "Okuma", "Trabucco", "Prologic", "Delphin", "Jaxon", "Nash", "Fox"];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Reduceri Echipamente Pescuit 2026",
  "url": "https://amcupon.ro/pescuit",
};

export default function PescuitPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topMag = TOP_PESCUIT
    .map(s => all.find(m => m.magazin === s))
    .filter(Boolean) as Magazin[];

  const fallback = FALLBACK_SPORTS
    .map(s => all.find(m => m.magazin === s))
    .filter(Boolean) as Magazin[];

  const magazine = topMag.length > 0 ? topMag : fallback.slice(0, 4);
  const allSlugs = [...TOP_PESCUIT, ...FALLBACK_SPORTS];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-[var(--background)]">

        <nav className="bg-[var(--background)] border-b border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Link href="/" className="hover:text-[var(--accent-text)]">Acasă</Link>
            <span className="mx-1">/</span>
            <span className="text-[var(--text-soft)] font-medium">Pescuit</span>
          </div>
        </nav>

        {/* HERO */}
        <AntetNisa titlu={<>Echipamente Pescuit cu Reducere {an}</>}>Undite, mulinete, năluci și accesorii la preturi mai mici. Reduceri active pentru pasionații de pescuit din România.</AntetNisa>
        <OferteNisa magazine={magazine} titlu="Magazine pescuit cu reduceri active" />
        <NisaProduse
          merchantSlugs={allSlugs}
          potrivire={/^(lanseta|mulineta|undita|naluca|naluci|vobler|fir (textil|monofilament)|momeala|nada|feeder|minciog|juvelnic|avertizor|swinger|sezlong de pescuit|scaun de pescuit|cort de pescuit|cutie (de )?pescuit)\b/}
          titlu="Echipamente de pescuit de la parteneri"
          culoareAccent="emerald"
          limit={12}
        />

        {/* CATEGORII ECHIPAMENTE */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-[var(--foreground)] mb-6 text-center">Ce găsești la preturi mai mici</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ECHIPAMENTE.map(e => (
              <div key={e.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:shadow-md transition-all">
                <div className="text-3xl mb-2">{e.emoji}</div>
                <h3 className="font-bold text-[var(--foreground)] text-sm mb-1">{e.label}</h3>
                <p className="text-xs text-[var(--text-soft)]">{e.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* MAGAZINE */}
        

        {/* PRODUSE din products.json */}

        

        {/* SEO TEXT */}
        <section className="bg-[var(--surface)] border-t border-[var(--border)] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[var(--foreground)] mb-5">Cum alegi echipamentele de pescuit</h2>
            <div className="space-y-4 text-sm text-[var(--text-soft)] leading-relaxed">
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Undite: spinning, feeder sau crap?</h3>
                <p>Pentru început, o undita spinning universala (2-3m, 10-30g) acoperă cele mai multe situații. Feeder-ul e optim pentru râuri și lacuri cu fund nisipos, iar setup-ul de crap necesita investiție mai mare dar oferă sesiuni lungi și capturi mari.</p>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Branduri de încredere la preturi corecte</h3>
                <p>Daiwa și Okuma oferă cel mai bun raport calitate-preț pentru începători și intermediari. Trabucco e preferat la pescuitul la feeder. Prologic și Delphin au accesorii excelente. Fox și Nash sunt pentru crap-iști serioși cu buget dedicat.</p>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Sfaturi pentru economii la echipamente {an}</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Sezonul off (iarna) aduce reduceri de 20-40% la undite și mulinete</li>
                  <li>Codurile de reducere de la Pescar Expert se pot combina cu promoțiile active</li>
                  <li>Kit-urile complete costa mai puțin decât componentele cumpărate separat</li>
                  <li>Verifica AmCupon zilnic — reducerile la sport expira rapid</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* LINK-URI INRUDITE */}
        

        
      </div>
    </>
  );
}
