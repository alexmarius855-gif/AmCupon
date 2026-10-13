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
  { href: "/piese-auto", emoji: "🔧", titlu: "Piese Auto", desc: "Anvelope, jante, vopsele, navigatie, baterii — magazine romanesti de profil" },
  { href: "/echipament-moto", emoji: "🏍️", titlu: "Echipament Moto", desc: "Casti, geci, manusi si piese pentru motociclete si scutere" },
];

export default function MotoPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();
  const magazineAuto = all.filter(m => m.categorie_slug === "auto-moto");
  const cuPromo = magazineAuto.filter(m => m.are_promotie).length;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-[var(--background)]">

        <section className="relative bg-[var(--background)] border-b border-[var(--border)] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(13,148,136,0.1) 0%, transparent 65%)" }} />
          <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-10 text-center">
            <nav className="flex justify-center gap-2 text-xs text-[var(--text-muted)] mb-8">
              <Link href="/" className="hover:text-[var(--text-soft)]">AmCupon.ro</Link>
              <span>/</span>
              <span className="text-[var(--text-soft)]">Auto-Moto</span>
            </nav>
            <div className="text-5xl mb-4">🚗</div>
            <h1 className="text-4xl md:text-5xl font-black text-[var(--foreground)] mb-4">Auto-Moto {an}</h1>
            <p className="text-[var(--text-soft)] text-lg max-w-2xl mx-auto mb-8">
              Piese auto, anvelope, echipament moto — alege ce cauti mai jos.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl py-3 px-2">
                <div className="text-xl font-black text-[var(--foreground)]">{magazineAuto.length}</div>
                <div className="text-xs text-[var(--text-muted)]">Magazine auto</div>
              </div>
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl py-3 px-2">
                <div className="text-xl font-black text-[var(--foreground)]">{cuPromo}</div>
                <div className="text-xs text-[var(--text-muted)]">Cu reduceri</div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {HUBURI.map(h => (
              <Link key={h.href} href={h.href}
                className="group bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent-text)]/40 rounded-xl p-6 transition-all">
                <div className="text-4xl mb-3">{h.emoji}</div>
                <h2 className="text-xl font-black text-[var(--foreground)] mb-2 group-hover:text-[var(--accent-text)] transition-colors">{h.titlu}</h2>
                <p className="text-[var(--text-soft)] text-sm">{h.desc}</p>
                <span className="inline-block mt-4 text-[var(--accent-text)] text-sm font-semibold">Vezi magazinele →</span>
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
                className="bg-[var(--surface)] hover:bg-[var(--surface-alt)] text-[var(--text-soft)] hover:text-[var(--foreground)] text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-[var(--border)]">
                {l.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
