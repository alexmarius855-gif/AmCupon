import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import MagazinCard from "../components/MagazinCard";
import NewsletterCTA from "../components/NewsletterCTA";

interface Promotie { nume: string; cod_cupon: string; landing_page: string; zile_ramase: number; }
interface Magazin {
  magazin: string; url: string; url_afiliat: string; logo_url?: string;
  categorie: string; categorie_slug?: string; scor_final: number;
  are_promotie: boolean; cod_cupon: boolean; promotii: Promotie[]; comision?: string;
}

export const metadata: Metadata = {
  title: "Piese Auto Online Romania 2026 — Coduri Reducere Verificate | AmCupon.ro",
  description: "Compara magazinele de piese auto, anvelope, jante si detailing din Romania. Coduri de reducere verificate zilnic — Automobilus, Janta.ro, Anvelino si altele.",
  keywords: ["piese auto online", "cod reducere piese auto", "anvelope reducere", "jante auto reducere", "detailing auto romania", "magazin piese auto romania"],
  alternates: { canonical: "https://amcupon.ro/piese-auto" },
  openGraph: { title: "Piese Auto Online Romania 2026 | AmCupon.ro", url: "https://amcupon.ro/piese-auto", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const SUBCATEGORII = [
  { emoji: "🛞", label: "Anvelope" },
  { emoji: "⚙️", label: "Jante" },
  { emoji: "🎨", label: "Vopsele & Detailing" },
  { emoji: "🔧", label: "Piese motor" },
  { emoji: "📡", label: "Navigatie auto" },
  { emoji: "🔋", label: "Baterii auto" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Piese Auto Online Romania 2026",
  "url": "https://amcupon.ro/piese-auto",
};

export default function PieseAutoPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const magazine = all.filter(m => m.categorie_slug === "automotive");
  const cuPromo = magazine.filter(m => m.are_promotie);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-[#0a0f1a]">

        {/* HERO */}
        <section className="relative bg-[#0a0f1a] border-b border-[#1e293b] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(13,148,136,0.1) 0%, transparent 65%)" }} />
          <div className="relative max-w-5xl mx-auto px-4 pt-12 pb-10 text-center">
            <nav className="flex justify-center gap-2 text-xs text-[#94a3b8] mb-8">
              <Link href="/" className="hover:text-[#cbd5e1]">AmCupon.ro</Link>
              <span>/</span>
              <span className="text-[#cbd5e1]">Piese Auto</span>
            </nav>
            <div className="text-5xl mb-4">🔧</div>
            <h1 className="text-4xl md:text-5xl font-black text-[#f1f5f9] mb-4">
              Piese Auto cu <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #0d9488, #0d9488)" }}>Reducere</span> {an}
            </h1>
            <p className="text-[#cbd5e1] text-lg max-w-2xl mx-auto mb-8">
              Anvelope, jante, vopsele, navigatie si piese de motor — magazine romanesti verificate zilnic.
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              {[
                { val: `${magazine.length}`, label: "Magazine" },
                { val: `${cuPromo.length}`, label: "Cu reduceri" },
                { val: "Zilnic", label: "Verificat" },
              ].map(s => (
                <div key={s.label} className="bg-[#111827] border border-[#1e293b] rounded-xl py-3 px-2">
                  <div className="text-xl font-black text-[#f1f5f9]">{s.val}</div>
                  <div className="text-xs text-[#94a3b8]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SUBCATEGORII */}
        <section className="border-b border-[#1e293b] py-5 px-4">
          <div className="max-w-5xl mx-auto flex flex-wrap gap-2 justify-center">
            {SUBCATEGORII.map(c => (
              <span key={c.label} className="flex items-center gap-1.5 bg-[#111827] text-[#cbd5e1] font-semibold text-sm px-4 py-2 rounded-full border border-[#1e293b]">
                <span>{c.emoji}</span>{c.label}
              </span>
            ))}
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 py-8">
          {magazine.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-black text-[#f1f5f9] mb-5">Magazine de piese auto</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {magazine.map(m => (
                  <MagazinCard key={m.magazin} m={m} />
                ))}
              </div>
            </section>
          )}

          <NewsletterCTA />

          {/* GHID */}
          <section className="mt-10 bg-[#111827] border border-[#1e293b] rounded-xl p-6">
            <h2 className="text-lg font-black text-[#f1f5f9] mb-4">Cum economisesti la piese auto online?</h2>
            <ul className="space-y-2 text-sm text-[#cbd5e1]">
              <li><strong className="text-[#cbd5e1]">Compara pretul</strong> intre cel putin 2-3 magazine — diferentele pot fi de 15-30% pentru aceeasi piesa</li>
              <li><strong className="text-[#cbd5e1]">Verifica compatibilitatea</strong> cu modelul exact al masinii inainte de comanda</li>
              <li><strong className="text-[#cbd5e1]">Anvelopele si jantele</strong> au cele mai mari reduceri sezoniere — primavara si toamna (schimb sezonier)</li>
              <li><strong className="text-[#cbd5e1]">Foloseste codul de reducere</strong> afisat pe AmCupon.ro — verificat zilnic, fara cod expirat</li>
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
                className="bg-[#111827] hover:bg-[#1e293b] text-[#cbd5e1] hover:text-[#f1f5f9] text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-[#1e293b]">
                {l.label}
              </Link>
            ))}
          </div>

          <p className="text-[#94a3b8] text-xs text-center mt-8">Unele linkuri sunt linkuri de afiliat. Daca faci o achizitie, AmCupon.ro primeste un comision fara cost suplimentar pentru tine.</p>
        </div>
      </div>
    </>
  );
}
