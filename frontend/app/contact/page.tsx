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

      <div className="min-h-screen bg-[#06080b]">
        {/* Header */}

        {/* Breadcrumb */}
        <nav className="max-w-5xl mx-auto px-4 pt-4 pb-0 text-xs text-[#9399a0] flex items-center gap-1">
          <Link href="/" className="hover:text-[#ddf93c] transition-colors">Acasă</Link>
          <span className="mx-1">/</span>
          <span className="text-[#c9ced5]">Contact</span>
        </nav>

        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-[#ffffff] mb-3">Contactează-ne</h1>
            <p className="text-[#c9ced5] max-w-lg mx-auto">
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
                className="bg-[#14181c] rounded-xl border border-[#1f2329] shadow-sm p-6 text-center"
              >
                <div className="text-4xl mb-3">{card.icon}</div>
                <h2 className="font-bold text-[#ffffff] mb-1">{card.titlu}</h2>
                {card.href ? (
                  <a
                    href={card.href}
                    className="text-[#ddf93c] hover:text-[#c3dd2c] font-medium text-sm underline underline-offset-2"
                  >
                    {card.detalii}
                  </a>
                ) : (
                  <p className="text-[#c9ced5] text-sm">{card.detalii}</p>
                )}
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Form */}
            <ContactForm />

            {/* Info box */}
            <div className="space-y-4">
              <div className="bg-[#14181c] border border-[#1f2329] rounded-xl p-6">
                <h3 className="font-bold text-[#ffffff] mb-3 flex items-center gap-2">
                  <span>💡</span> Cum te putem ajuta?
                </h3>
                <ul className="space-y-2 text-sm text-[#c9ced5]">
                  {[
                    "Raportare cod de reducere expirat sau incorect",
                    "Solicitare adăugare magazin nou",
                    "Propunere parteneriat sau afiliere",
                    "Întrebări despre funcționarea site-ului",
                    "Probleme tehnice sau sugestii",
                    "Solicitare retragere date (GDPR)",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-[#ddf93c] mt-0.5 shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#14181c] border border-[#1f2329] rounded-xl p-6">
                <h3 className="font-bold text-[#ffffff] mb-2">Despre AmCupon.ro</h3>
                <p className="text-sm text-[#c9ced5] leading-relaxed">
                  AmCupon.ro este un site de coduri de reducere 100% gratuit pentru utilizatori.
                  Lucrăm cu peste 1000 magazine partenere prin platformele 2Performant, Profitshare și Impact.com.
                  Actualizăm codurile zilnic și verificăm fiecare promoție înainte de publicare.
                </p>
              </div>
            </div>
          </div>
        </div>

        <footer className="border-t border-[#1f2329] mt-12 py-6 text-center text-sm text-[#9399a0]">
          <p>
            © {new Date().getFullYear()} AmCupon.ro ·{" "}
            <Link href="/confidentialitate" className="hover:text-[#ddf93c]">Confidențialitate</Link>
            {" · "}
            <Link href="/termeni" className="hover:text-[#ddf93c]">Termeni</Link>
            {" · "}
            <Link href="/" className="hover:text-[#ddf93c]">Toate reducerile</Link>
          </p>
        </footer>
      </div>
    </>
  );
}
