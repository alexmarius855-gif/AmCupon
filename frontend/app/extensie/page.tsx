import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Extensie Chrome AmCupon — Coduri Reducere Automate | AmCupon.ro",
  description: "Extensia Chrome AmCupon gaseste automat coduri de reducere pe orice site de shopping din Romania — eMag, Altex, Zara, H&M, Notino si 1000+ magazine. In curs de aprobare Chrome Web Store.",
  keywords: ["extensie chrome coduri reducere", "amcupon extensie", "cod reducere automat chrome", "extensie shopping romania"],
  alternates: { canonical: "https://amcupon.ro/extensie" },
  openGraph: {
    title: "Extensie Chrome AmCupon — Coduri Reducere Automate",
    url: "https://amcupon.ro/extensie",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
      images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }],
  },
};

const PASII = [
  {
    nr: "1",
    titlu: "Instalează extensia",
    desc: "Click pe butonul de mai jos și adaugă extensia în Chrome. Durează 10 secunde.",
    icon: "⬇️",
  },
  {
    nr: "2",
    titlu: "Navighează pe orice site de shopping",
    desc: "Mergi pe eMag, Zara, Notino sau oricare alt magazin partener AmCupon.",
    icon: "🛒",
  },
  {
    nr: "3",
    titlu: "Extensia găsește codurile automat",
    desc: "Un popup apare cu codurile de reducere active pentru acel magazin. Un click — copiat.",
    icon: "🎟",
  },
  {
    nr: "4",
    titlu: "Aplici codul și economisești",
    desc: "Copiezi codul, îl aplici la checkout și economisești instant. 100% gratuit.",
    icon: "💰",
  },
];

const FEATURES = [
  { icon: "⚡", titlu: "Instant", desc: "Detectează magazinul în mai puțin de o secundă" },
  { icon: "🔒", titlu: "Privat", desc: "Nu colectăm date personale. Zero tracking." },
  { icon: "🔄", titlu: "Actualizat", desc: "Codurile se sincronizează automat la 6 ore" },
  { icon: "📦", titlu: "1000+ magazine", desc: "Toate magazinele partenere AmCupon" },
  { icon: "🆓", titlu: "100% Gratuit", desc: "Nu plătești nimic, niciodată" },
  { icon: "🇷🇴", titlu: "Made for Romania", desc: "Magazinele online din România" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "AmCupon — Coduri de reducere",
  "operatingSystem": "Chrome",
  "applicationCategory": "ShoppingApplication",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "RON" },
  "url": "https://amcupon.ro/extensie",
  "description": "Găsești automat coduri de reducere pe orice site de shopping din România",
};

export default function ExtensiePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-[#0a0f1a]">

        <nav className="bg-[#0a0f1a] border-b border-[#1e293b]">
          <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[#94a3b8]">
            <Link href="/" className="hover:text-[#0d9488]">Acasă</Link>
            <span className="mx-1">/</span>
            <span className="text-[#cbd5e1] font-medium">Extensie Chrome</span>
          </div>
        </nav>

        {/* HERO */}
        <section className="bg-gradient-to-br from-[#0f766e] via-[#14b8a6] to-[#0f766e] text-[#f1f5f9] py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#14b8a6]/15 border border-[#14b8a6]/30 text-[#0f766e] text-xs font-bold px-4 py-1.5 rounded-full mb-6">
              ⏳ În curs de aprobare pe Chrome Web Store
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
              Coduri de reducere automate<br />pe orice site de shopping
            </h1>
            <p className="text-[#cbd5e1] text-lg mb-8 max-w-xl mx-auto">
              Extensia AmCupon găsește automat codurile active pe fiecare magazin pe care îl vizitezi.
              Momentan e în proces de revizuire la Google — lasă-ți emailul și te anunțăm exact
              când devine disponibilă pentru instalare.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/newsletter"
                className="flex items-center gap-3 bg-[#0d9488] hover:bg-[#14b8a6] text-white font-black px-8 py-4 rounded-xl text-base transition-colors shadow-lg shadow-[#14b8a6]/25"
              >
                📬 Anunță-mă când e disponibilă
              </Link>
            </div>
          </div>
        </section>

        {/* CUM FUNCTIONEAZA */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-black text-[#f1f5f9] mb-10 text-center">Cum funcționează</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PASII.map((p) => (
              <div key={p.nr} className="text-center">
                <div className="w-14 h-14 bg-[#111827] border-2 border-[#1e293b] rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">
                  {p.icon}
                </div>
                <div className="text-xs font-black text-[#0d9488] mb-1">PAS {p.nr}</div>
                <h3 className="font-black text-[#f1f5f9] text-sm mb-2">{p.titlu}</h3>
                <p className="text-xs text-[#cbd5e1] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section className="bg-[#111827] border-y border-[#1e293b] py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-black text-[#f1f5f9] mb-10 text-center">De ce AmCupon Extension?</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((f) => (
                <div key={f.titlu} className="bg-[#0a0f1a] rounded-xl border border-[#1e293b] p-5 flex items-start gap-4">
                  <div className="text-2xl shrink-0">{f.icon}</div>
                  <div>
                    <h3 className="font-bold text-[#f1f5f9] text-sm mb-1">{f.titlu}</h3>
                    <p className="text-xs text-[#cbd5e1]">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MAGAZINE COMPATIBILE */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-black text-[#f1f5f9] mb-4 text-center">Funcționează pe 1000+ magazine</h2>
          <p className="text-center text-[#cbd5e1] text-sm mb-8">Inclusiv cele mai populare din România</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "eMag","Altex","Zara","H&M","Notino","Douglas","Sephora",
              "FashionDays","Libris","Elefant","Decathlon","Noriel",
              "PCGarage","Flanco","Dr. Max","Vegis","Booking","Answear",
              "Reserved","Carturesti","Mobexpert","IKEA",
            ].map((m) => (
              <span key={m} className="bg-[#111827] border border-[#1e293b] text-[#cbd5e1] text-sm font-semibold px-4 py-2 rounded-full">
                {m}
              </span>
            ))}
            <span className="bg-[#14b8a6]/10 border border-[#14b8a6]/30 text-[#0f766e] text-sm font-bold px-4 py-2 rounded-full">
              + 1000 altele
            </span>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="bg-gradient-to-br from-[#0f766e] to-[#0f766e] py-16 px-4">
          <div className="max-w-2xl mx-auto text-center text-[#f1f5f9]">
            <div className="text-5xl mb-4">🎟</div>
            <h2 className="text-2xl font-black mb-3">Fii primul care o instalează</h2>
            <p className="text-[#ccfbf1] mb-8 text-sm">
              E în review la Google chiar acum. Lasă-ți emailul și primești acces + un cod exclusiv
              imediat ce e publicată.
            </p>
            <Link
              href="/newsletter"
              className="inline-flex items-center gap-2 bg-[#111827] text-[#0f766e] font-black px-8 py-4 rounded-xl text-base hover:bg-[#0d9488]/10 transition-colors shadow-xl"
            >
              📬 Anunță-mă când e disponibilă →
            </Link>
            <p className="text-[#cbd5e1] text-xs mt-4">Compatibil cu Chrome, Edge și Brave</p>
          </div>
        </section>

        <footer className="border-t border-[#1e293b] py-6 text-center text-xs text-[#94a3b8]">
          © {new Date().getFullYear()} AmCupon.ro ·{" "}
          <Link href="/" className="hover:text-[#0d9488]">Acasă</Link>{" · "}
          <Link href="/toate-magazinele" className="hover:text-[#0d9488]">Magazine</Link>{" · "}
          <Link href="/categorii" className="hover:text-[#0d9488]">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
