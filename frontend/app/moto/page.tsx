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
      <div className="min-h-screen bg-[#F7F9FC]">

        <section className="relative bg-[#F7F9FC] border-b border-[#e2e8f0] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(13,148,136,0.1) 0%, transparent 65%)" }} />
          <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-10 text-center">
            <nav className="flex justify-center gap-2 text-xs text-[#64748b] mb-8">
              <Link href="/" className="hover:text-[#334155]">AmCupon.ro</Link>
              <span>/</span>
              <span className="text-[#334155]">Auto-Moto</span>
            </nav>
            <div className="text-5xl mb-4">🚗</div>
            <h1 className="text-4xl md:text-5xl font-black text-[#0f172a] mb-4">Auto-Moto {an}</h1>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto mb-8">
              Piese auto, anvelope, echipament moto — alege ce cauti mai jos.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
              <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-xl py-3 px-2">
                <div className="text-xl font-black text-[#0f172a]">{magazineAuto.length}</div>
                <div className="text-xs text-[#64748b]">Magazine auto</div>
              </div>
              <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-xl py-3 px-2">
                <div className="text-xl font-black text-[#0f172a]">{cuPromo}</div>
                <div className="text-xs text-[#64748b]">Cu reduceri</div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {HUBURI.map(h => (
              <Link key={h.href} href={h.href}
                className="group bg-[#ffffff] border border-[#e2e8f0] hover:border-[#14b8a6]/40 rounded-xl p-6 transition-all">
                <div className="text-4xl mb-3">{h.emoji}</div>
                <h2 className="text-xl font-black text-[#0f172a] mb-2 group-hover:text-[#0d9488] transition-colors">{h.titlu}</h2>
                <p className="text-[#475569] text-sm">{h.desc}</p>
                <span className="inline-block mt-4 text-[#0d9488] text-sm font-semibold">Vezi magazinele →</span>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            {[
              { href: "/categorii/auto-moto", label: "📂 Toate magazinele Auto" },
              { href: "/gadgets", label: "📡 Gadgets" },
              { href: "/oferte-azi", label: "🔥 Oferte de azi" },
            ].map(l => (
              <Link key={l.href} href={l.href}
                className="bg-[#ffffff] hover:bg-[#e2e8f0] text-[#334155] hover:text-[#0f172a] text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-[#e2e8f0]">
                {l.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
