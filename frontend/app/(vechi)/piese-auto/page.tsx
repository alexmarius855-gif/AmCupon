import Link from "next/link";
import { Metadata } from "next";
import OferteNisa, { AntetNisa } from "../components/OferteNisa";
import fs from "fs";
import path from "path";
import { laParteneri } from "@/lib/cifreSite";

interface Promotie { nume: string; cod_cupon: string; landing_page: string; zile_ramase: number; }
interface Magazin {
  magazin: string; url: string; url_afiliat: string; logo_url?: string;
  categorie: string; categorie_slug?: string; scor_final: number;
  are_promotie: boolean; cod_cupon: boolean; promotii: Promotie[]; comision?: string;
}

export const metadata: Metadata = {
  title: "Piese Auto Online România 2026 — Coduri și Oferte",
  description: `Compara magazinele de piese auto, anvelope, jante și detailing din România. Coduri de reducere actualizate zilnic ${laParteneri(["auto-moto"], 3)} și la alte magazine partenere.`,
  keywords: ["piese auto online", "cod reducere piese auto", "anvelope reducere", "jante auto reducere", "detailing auto românia", "magazin piese auto românia"],
  alternates: { canonical: "https://amcupon.ro/piese-auto" },
  openGraph: { title: "Piese Auto Online România 2026 | AmCupon.ro", url: "https://amcupon.ro/piese-auto", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const SUBCATEGORII = [
  { emoji: "🛞", label: "Anvelope" },
  { emoji: "⚙️", label: "Jante" },
  { emoji: "🎨", label: "Vopsele & Detailing" },
  { emoji: "🔧", label: "Piese motor" },
  { emoji: "📡", label: "Navigație auto" },
  { emoji: "🔋", label: "Baterii auto" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Piese Auto Online România 2026",
  "url": "https://amcupon.ro/piese-auto",
};

export default function PieseAutoPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  // In categoria auto stau si firmele de inchirieri (dollarcars4rent, carrentalexpress): ele nu vand piese.
  const magazine = all.filter(m => m.categorie_slug === "auto-moto" && !/rent|vipcars/i.test(m.magazin));
  const cuPromo = magazine.filter(m => m.are_promotie);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-[var(--background)]">

        {/* HERO */}
        <AntetNisa titlu={<>Piese Auto Online {an}</>}>Anvelope, jante, vopsele, navigație și piese de motor — magazine romanesti actualizate zilnic.</AntetNisa>
        <OferteNisa magazine={magazine} titlu="Magazine de piese auto" />

        {/* SUBCATEGORII */}
        <section className="border-b border-[var(--border)] py-5 px-4">
          <div className="max-w-5xl mx-auto flex flex-wrap gap-2 justify-center">
            {SUBCATEGORII.map(c => (
              <span key={c.label} className="flex items-center gap-1.5 bg-[var(--surface)] text-[var(--text-soft)] font-semibold text-sm px-4 py-2 rounded-full border border-[var(--border)]">
                <span>{c.emoji}</span>{c.label}
              </span>
            ))}
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 py-8">
          

          {/* GHID */}
          <section className="mt-10 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <h2 className="text-lg font-black text-[var(--foreground)] mb-4">Cum economisești la piese auto online?</h2>
            <ul className="space-y-2 text-sm text-[var(--text-soft)]">
              <li><strong className="text-[var(--text-soft)]">Compara prețul</strong> intre cel puțin 2-3 magazine — prețul aceleiași piese poate diferi mult</li>
              <li><strong className="text-[var(--text-soft)]">Verifica compatibilitatea</strong> cu modelul exact al mașinii înainte de comanda</li>
              <li><strong className="text-[var(--text-soft)]">Anvelopele și jantele</strong> au cele mai mari reduceri sezoniere — primavara și toamna (schimb sezonier)</li>
              <li><strong className="text-[var(--text-soft)]">Folosește codul de reducere</strong> de pe pagina magazinului pe AmCupon.ro, dacă are unul activ — codurile dispar automat după data de expirare</li>
            </ul>
          </section>

          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            {[
              { href: "/echipament-moto", label: "🏍️ Echipament Moto" },
              { href: "/moto", label: "🔧 Auto-Moto General" },
              { href: "/categorii/auto-moto", label: "📂 Toate magazinele Auto" },
              { href: "/oferte-azi", label: "🔥 Oferte de azi" },
            ].map(l => (
              <Link key={l.href} href={l.href}
                className="bg-[var(--surface)] hover:bg-[var(--surface-alt)] text-[var(--text-soft)] hover:text-[var(--foreground)] text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-[var(--border)]">
                {l.label}
              </Link>
            ))}
          </div>

          <p className="text-[var(--text-muted)] text-xs text-center mt-8">Unele linkuri sunt linkuri de afiliat. Dacă faci o achiziție, AmCupon.ro primește un comision fără cost suplimentar pentru tine.</p>
        </div>
      </div>
    </>
  );
}
