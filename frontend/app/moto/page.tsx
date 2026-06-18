import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";

interface Magazin { magazin: string; categorie_slug?: string; are_promotie: boolean; }

export const metadata: Metadata = {
  title: "Auto-Moto — Coduri Reducere 2026 | AmCupon.ro",
  description: "Piese auto, anvelope, echipament moto si accesorii — toate magazinele partenere verificate zilnic pe AmCupon.ro.",
  keywords: ["cod reducere auto", "cod reducere moto", "piese auto reducere", "echipament moto reducere"],
  alternates: { canonical: "https://amcupon.ro/moto" },
  openGraph: { title: "Auto-Moto — Coduri Reducere 2026 | AmCupon.ro", url: "https://amcupon.ro/moto", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const jsonLd = { "@context": "https://schema.org", "@type": "CollectionPage", "name": "Auto-Moto — Coduri Reducere 2026", "url": "https://amcupon.ro/moto" };

const HUBURI = [
  { href: "/piese-auto", emoji: "🔧", titlu: "Piese Auto", desc: "Anvelope, jante, vopsele, navigatie, baterii — magazine romanesti verificate" },
  { href: "/echipament-moto", emoji: "🏍️", titlu: "Echipament Moto", desc: "Casti, geci, manusi si piese pentru motociclete si scutere" },
];

export default function MotoPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();
  const magazineAuto = all.filter(m => m.categorie_slug === "automotive");
  const cuPromo = magazineAuto.filter(m => m.are_promotie).length;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-slate-950">

        <section className="relative bg-slate-950 border-b border-slate-800 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.1) 0%, transparent 65%)" }} />
          <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-10 text-center">
            <nav className="flex justify-center gap-2 text-xs text-slate-500 mb-8">
              <Link href="/" className="hover:text-slate-300">AmCupon.ro</Link>
              <span>/</span>
              <span className="text-slate-300">Auto-Moto</span>
            </nav>
            <div className="text-5xl mb-4">🚗</div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Auto-Moto {an}</h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
              Piese auto, anvelope, echipament moto — alege ce cauti mai jos.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl py-3 px-2">
                <div className="text-xl font-black text-white">{magazineAuto.length}</div>
                <div className="text-xs text-slate-500">Magazine auto</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl py-3 px-2">
                <div className="text-xl font-black text-white">{cuPromo}</div>
                <div className="text-xs text-slate-500">Cu reduceri</div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {HUBURI.map(h => (
              <Link key={h.href} href={h.href}
                className="group bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-6 transition-all">
                <div className="text-4xl mb-3">{h.emoji}</div>
                <h2 className="text-xl font-black text-white mb-2 group-hover:text-indigo-400 transition-colors">{h.titlu}</h2>
                <p className="text-slate-400 text-sm">{h.desc}</p>
                <span className="inline-block mt-4 text-indigo-400 text-sm font-semibold">Vezi magazinele →</span>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            {[
              { href: "/categorii/automotive", label: "📂 Toate magazinele Auto" },
              { href: "/gadgets", label: "📡 Gadgets" },
              { href: "/oferte-azi", label: "🔥 Oferte de azi" },
            ].map(l => (
              <Link key={l.href} href={l.href}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-slate-800">
                {l.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
