import Link from "next/link";
import { Metadata } from "next";
import NewsletterForm from "./NewsletterForm";

export const metadata: Metadata = {
  title: "Newsletter Gratuit — Coduri Reducere Zilnic | AmCupon.ro",
  description: "Aboneaza-te gratuit la newsletter-ul AmCupon.ro. Primesti top 5 coduri de reducere verificate in fiecare saptamana, direct in inbox. Zero spam.",
  keywords: ["newsletter coduri reducere", "alerte oferte romania", "reduceri email gratuit", "amcupon newsletter"],
  alternates: { canonical: "https://amcupon.ro/newsletter" },
  openGraph: {
    title: "Newsletter Gratuit — Coduri Reducere | AmCupon.ro",
    description: "Top 5 coduri de reducere verificate saptamanal, direct in inbox. Gratuit, zero spam.",
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
  description: "Abonare la newsletter cu coduri de reducere verificate zilnic",
  url: "https://amcupon.ro/newsletter",
  isPartOf: { "@type": "WebSite", url: "https://amcupon.ro", name: "AmCupon.ro" },
};

export default function NewsletterPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-[#F7F9FC]">

        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-gradient-to-br from-[#0d9488] to-[#14b8a6] text-4xl mb-6 shadow-xl shadow-[#14b8a6]/30">
              🎁
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#0f172a] mb-3 tracking-tight">
              Reduceri exclusive pe email
            </h1>
            <p className="text-[#475569] text-lg">
              Peste <span className="text-[#0f172a] font-bold">1000 magazine</span> monitorizate zilnic.
              Fii primul care afla codurile noi.
            </p>
          </div>

          <NewsletterForm />

          <div className="grid grid-cols-3 gap-4 text-center mb-8">
            {[
              { nr: "600+",   label: "Magazine monitorizate" },
              { nr: "Zilnic", label: "Actualizare coduri" },
              { nr: "100%",   label: "Gratuit pentru tine" },
            ].map(s => (
              <div key={s.label} className="bg-[#ffffff] rounded-xl border border-[#e2e8f0] p-4">
                <p className="text-xl font-black text-[#0d9488]">{s.nr}</p>
                <p className="text-xs text-[#64748b] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/" className="text-sm text-[#64748b] hover:text-[#0d9488] transition-colors">
              &larr; Inapoi la homepage
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
