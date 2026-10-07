import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import NewsletterForm from "./NewsletterForm";

export const metadata: Metadata = {
  title: "Newsletter Gratuit — Coduri Reducere Zilnic | AmCupon.ro",
  description: "Aboneaza-te gratuit la newsletter-ul AmCupon.ro: ofertele active de la magazinele partenere, o data pe zi, direct in inbox (cel mult 12 pe email). Fara spam.",
  keywords: ["newsletter coduri reducere", "alerte oferte romania", "reduceri email gratuit", "amcupon newsletter"],
  alternates: { canonical: "https://amcupon.ro/newsletter" },
  openGraph: {
    title: "Newsletter Gratuit — Coduri Reducere | AmCupon.ro",
    description: "Ofertele active, o data pe zi, direct in inbox. Gratuit, fara spam.",
    url: "https://amcupon.ro/newsletter",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
      images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Newsletter AmCupon.ro",
  description: "Abonare la newsletter cu ofertele active de pe AmCupon.ro, o data pe zi",
  url: "https://amcupon.ro/newsletter",
  isPartOf: { "@type": "WebSite", url: "https://amcupon.ro", name: "AmCupon.ro" },
};

export default function NewsletterPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Array<{ are_promotie?: boolean }> = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const totalMagazine = all.length;
  const cuPromotie = all.filter(m => m.are_promotie).length;
  // 07.10.2026: eticheta spunea „Coduri active acum", dar cifra numara MAGAZINELE cu oferta.

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-[#06080b]">

        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-gradient-to-br from-[#ddf93c] to-[#ddf93c] text-4xl mb-6 shadow-xl shadow-[#ddf93c]/30">
              🎁
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] mb-3 tracking-tight">
              Codurile zilei, pe email
            </h1>
            <p className="text-[#c9ced5] text-lg">
              <span className="text-[#ffffff] font-bold">{totalMagazine} de magazine</span>, actualizate de trei ori pe zi.
              Ofertele active, pe categorii, intr-un email in fiecare dimineata.
            </p>
          </div>

          <NewsletterForm />

          <div className="grid grid-cols-3 gap-4 text-center mb-8">
            {[
              { nr: `${totalMagazine}`,   label: "Magazine urmărite" },
              { nr: `${cuPromotie}`,      label: "Magazine cu oferte acum" },
              { nr: "100%",   label: "Gratuit pentru tine" },
            ].map(s => (
              <div key={s.label} className="bg-[#14181c] rounded-xl border border-[#1f2329] p-4">
                <p className="text-xl font-black text-[#ddf93c]">{s.nr}</p>
                <p className="text-xs text-[#9399a0] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/" className="text-sm text-[#9399a0] hover:text-[#ddf93c] transition-colors">
              &larr; Inapoi la homepage
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
