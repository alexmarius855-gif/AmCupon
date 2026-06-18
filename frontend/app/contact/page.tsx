import Link from "next/link";
import { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact | AmCupon.ro",
  description:
    "Contactează-ne pentru întrebări, parteneriate sau raportare de coduri expirate. Răspundem în 24h la contact@amcupon.ro",
  alternates: { canonical: "https://amcupon.ro/contact" },
  openGraph: {
    title: "Contact | AmCupon.ro",
    description: "Trimite-ne un mesaj — răspundem în 24h.",
    url: "https://amcupon.ro/contact",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
      images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }],
  },
};

const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact AmCupon.ro",
  url: "https://amcupon.ro/contact",
  mainEntity: {
    "@type": "Organization",
    name: "AmCupon.ro",
    email: "contact@amcupon.ro",
    url: "https://amcupon.ro",
  },
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />

      <div className="min-h-screen bg-slate-950">
        {/* Header */}

        {/* Breadcrumb */}
        <nav className="max-w-5xl mx-auto px-4 pt-4 pb-0 text-xs text-slate-500 flex items-center gap-1">
          <Link href="/" className="hover:text-indigo-400 transition-colors">Acasă</Link>
          <span className="mx-1">/</span>
          <span className="text-slate-400">Contact</span>
        </nav>

        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-white mb-3">Contactează-ne</h1>
            <p className="text-slate-400 max-w-lg mx-auto">
              Ai întrebări, vrei să raportezi un cod expirat sau ești interesat de un parteneriat?
              Scrie-ne — răspundem în maxim 24h.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              {
                icon: "✉️",
                titlu: "Email direct",
                detalii: "contact@amcupon.ro",
                href: "mailto:contact@amcupon.ro",
                culoare: "indigo",
              },
              {
                icon: "⏱️",
                titlu: "Timp de răspuns",
                detalii: "Maxim 24 de ore",
                href: null,
                culoare: "green",
              },
              {
                icon: "🤝",
                titlu: "Parteneriate",
                detalii: "Afiliați & Magazine",
                href: "mailto:contact@amcupon.ro?subject=Parteneriat",
                culoare: "blue",
              },
            ].map((card) => (
              <div
                key={card.titlu}
                className="bg-white rounded-2xl border border-slate-800 shadow-sm p-6 text-center"
              >
                <div className="text-4xl mb-3">{card.icon}</div>
                <h2 className="font-bold text-white mb-1">{card.titlu}</h2>
                {card.href ? (
                  <a
                    href={card.href}
                    className="text-indigo-400 hover:text-indigo-300 font-medium text-sm underline underline-offset-2"
                  >
                    {card.detalii}
                  </a>
                ) : (
                  <p className="text-slate-400 text-sm">{card.detalii}</p>
                )}
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Form */}
            <ContactForm />

            {/* Info box */}
            <div className="space-y-4">
              <div className="bg-cyan-50 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                  <span>💡</span> Cum te putem ajuta?
                </h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  {[
                    "Raportare cod de reducere expirat sau incorect",
                    "Solicitare adăugare magazin nou",
                    "Propunere parteneriat sau afiliere",
                    "Întrebări despre funcționarea site-ului",
                    "Probleme tehnice sau sugestii",
                    "Solicitare retragere date (GDPR)",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-indigo-400 mt-0.5 shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-2">Despre AmCupon.ro</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  AmCupon.ro este un site de coduri de reducere 100% gratuit pentru utilizatori.
                  Lucrăm cu peste 300 magazine partenere prin platformele 2Performant și Profitshare.
                  Actualizăm codurile zilnic și verificăm fiecare promoție înainte de publicare.
                </p>
              </div>
            </div>
          </div>
        </div>

        <footer className="border-t border-slate-800 mt-12 py-6 text-center text-sm text-slate-500">
          <p>
            © {new Date().getFullYear()} AmCupon.ro ·{" "}
            <Link href="/confidentialitate" className="hover:text-indigo-400">Confidențialitate</Link>
            {" · "}
            <Link href="/termeni" className="hover:text-indigo-400">Termeni</Link>
            {" · "}
            <Link href="/" className="hover:text-indigo-400">Toate reducerile</Link>
          </p>
        </footer>
      </div>
    </>
  );
}
