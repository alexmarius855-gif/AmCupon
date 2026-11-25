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
  title: "Gadgets & Accesorii Tech 2026 — Coduri Reducere | AmCupon.ro",
  description: "Gadgets, smartwatch-uri, căști wireless, smart home, drone și accesorii tech — coduri de reducere și oferte active de la magazinele partenere.",
  keywords: ["gadgets reducere", "smartwatch ieftin", "casti wireless reducere", "drone reducere", "smart home românia", "accesorii tech cod reducere"],
  alternates: { canonical: "https://amcupon.ro/gadgets" },
  openGraph: { title: "Gadgets & Tech — Coduri Reducere | AmCupon.ro", url: "https://amcupon.ro/gadgets", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const GADGET_SLUGS = ["altex.ro", "flanco.ro", "elefant.ro", "quickmobile.ro", "cel.ro", "pcgarage.ro", "evomag.ro"];
// Sluguri REALE din output.json — potrivire EXACTA, nu subsir (vezi lib/categoriiNisa.ts)
const CAT_GADGET = ["electronice"];

const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Gadgets & Tech — Coduri Reducere 2026","url":"https://amcupon.ro/gadgets" };

const ARTICOLE_GADGET = [
  { title: "Cel mai bun smartwatch 2026", href: "/blog/cel-mai-bun-smartwatch-2026" },
  { title: "Căști wireless — top recomandări", href: "/blog/cele-mai-bune-casti-wireless-2026" },
  { title: "Smart home — ghid complet", href: "/blog/cel-mai-bun-sistem-smart-home-2026" },
  { title: "Cel mai bun power bank 2026", href: "/blog/cel-mai-bun-power-bank-2026" },
  { title: "Drone pentru începători", href: "/blog/cea-mai-buna-drona-2026" },
];

export default function GadgetsPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topGadget = GADGET_SLUGS.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restTech = all.filter(m =>
    !GADGET_SLUGS.includes(m.magazin) &&
    esteInCategorie(m, CAT_GADGET)
  ).slice(0, 20);
  const magazine = [...topGadget, ...restTech];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[var(--background)]">

        <nav className="bg-[var(--background)] border-b border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[var(--text-muted)] flex-wrap">
            <Link href="/" className="hover:text-[var(--accent-text)] transition-colors">Acasă</Link>
            <span className="mx-1 text-gray-300">/</span>
            <span className="text-[var(--text-soft)] font-medium">Gadgets & Tech</span>
          </div>
        </nav>

        {/* HERO */}
        <AntetNisa titlu={<>Gadgets & Tech {an}</>}>Smartwatch-uri, căști wireless, drone, smart home — coduri de reducere și oferte active de la magazinele partenere</AntetNisa>
        <OferteNisa magazine={magazine} titlu="Magazine de gadgets și electronice" />
        <NisaProduse
          merchantSlugs={[]}
          teme={["casti-wireless", "smartwatch-uri"]}
          titlu="Căști wireless și smartwatch-uri de la parteneri"
          culoareAccent="blue"
          limit={12}
        />

        {/* CATEGORII GADGET */}
        <section className="bg-[var(--surface)] border-b border-[var(--border)] py-6 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { emoji:"⌚", label:"Smartwatch-uri", href:"/blog/cel-mai-bun-smartwatch-2026" },
                { emoji:"🎧", label:"Căști wireless", href:"/blog/cele-mai-bune-casti-wireless-2026" },
                { emoji:"🏠", label:"Smart Home", href:"/blog/cel-mai-bun-sistem-smart-home-2026" },
                { emoji:"🔋", label:"Power Bank", href:"/blog/cel-mai-bun-power-bank-2026" },
                { emoji:"🚁", label:"Drone", href:"/blog/cea-mai-buna-drona-2026" },
                { emoji:"📷", label:"Camere acțiune", href:"/top/camere-actiune" },
                { emoji:"🎮", label:"Gaming", href:"/categorii/electronice" },
                { emoji:"📱", label:"Telefoane", href:"/blog/cel-mai-bun-telefon-pentru-poze-2026" },
              ].map(c => (
                <a key={c.label} href={c.href}
                  className="flex items-center gap-2 bg-[var(--surface)] hover:bg-[#ddf93c] text-[var(--accent-text)] font-semibold text-sm px-4 py-2 rounded-full transition-colors border border-[var(--accent-text)]">
                  <span>{c.emoji}</span>{c.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* MAGAZINE */}
          

          {/* ARTICOLE */}
          <section className="bg-[var(--surface)] rounded-xl p-6">
            <h2 className="text-lg font-black text-[var(--foreground)] mb-4">📖 Ghiduri & Recenzii Gadgets</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ARTICOLE_GADGET.map(a => (
                <a key={a.href} href={a.href}
                  className="flex items-center gap-2 bg-[var(--surface)] rounded-xl px-4 py-3 text-sm font-semibold text-[var(--text-soft)] hover:text-[var(--accent-text)] hover:border-[var(--accent-text)]/40 border border-[var(--border)] transition-all group">
                  <span className="text-[var(--accent-text)] group-hover:text-[var(--accent-text)]">→</span>
                  {a.title}
                </a>
              ))}
            </div>
          </section>
        </div>

        

        

        
      </div>
    </>
  );
}
