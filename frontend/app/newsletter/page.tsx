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
      <div className="min-h-screen bg-slate-950">

        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 text-4xl mb-6 shadow-xl shadow-orange-500/30">
              🎁
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">
              Reduceri exclusive pe email
            </h1>
            <p className="text-slate-400 text-lg">
              Peste <span className="text-white font-bold">600 magazine</span> monitorizate zilnic.
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
              <div key={s.label} className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
                <p className="text-xl font-black text-orange-400">{s.nr}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/" className="text-sm text-slate-500 hover:text-orange-400 transition-colors">
              &larr; Inapoi la homepage
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
