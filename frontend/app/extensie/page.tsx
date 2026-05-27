import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Extensie Chrome AmCupon — Coduri Reducere Automate | AmCupon.ro",
  description: "Instalează extensia Chrome AmCupon gratis. Găsești automat coduri de reducere pe orice site de shopping din România — eMag, Altex, Zara, H&M, Notino și 600+ magazine.",
  keywords: ["extensie chrome coduri reducere", "amcupon extensie", "cod reducere automat chrome", "extensie shopping romania"],
  alternates: { canonical: "https://amcupon.ro/extensie" },
  openGraph: {
    title: "Extensie Chrome AmCupon — Coduri Reducere Automate",
    url: "https://amcupon.ro/extensie",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
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
  { icon: "📦", titlu: "600+ magazine", desc: "Toate magazinele partenere AmCupon" },
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
  "url": "https://chromewebstore.google.com/detail/mahfankpalkgognhnllkgdkjncmmkllb",
  "description": "Găsești automat coduri de reducere pe orice site de shopping din România",
};

export default function ExtensiePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
            <a href="/" className="flex items-center gap-1.5 shrink-0">
              <div className="bg-orange-500 text-white font-black text-base px-2 py-1 rounded-lg">Am</div>
              <span className="font-black text-gray-900 text-xl">Cupon</span>
              <span className="text-orange-500 font-black text-xl">.ro</span>
            </a>
          </div>
        </header>

        <nav className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-gray-400">
            <a href="/" className="hover:text-orange-500">Acasă</a>
            <span className="mx-1">/</span>
            <span className="text-gray-700 font-medium">Extensie Chrome</span>
          </div>
        </nav>

        {/* HERO */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold px-4 py-1.5 rounded-full mb-6">
              🔌 Extensie Chrome — 100% Gratuită
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
              Coduri de reducere automate<br />pe orice site de shopping
            </h1>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              Instalezi o singură dată extensia AmCupon și ea găsește automat codurile active
              pe fiecare magazin pe care îl vizitezi. Fără căutări manuale.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://chromewebstore.google.com/detail/mahfankpalkgognhnllkgdkjncmmkllb"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-orange-500 hover:bg-orange-400 text-white font-black px-8 py-4 rounded-2xl text-base transition-colors shadow-lg shadow-orange-500/25"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                </svg>
                Instalează în Chrome — Gratuit
              </a>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <span>⭐⭐⭐⭐⭐</span>
                <span>Chrome Web Store</span>
              </div>
            </div>
          </div>
        </section>

        {/* CUM FUNCTIONEAZA */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-black text-gray-900 mb-10 text-center">Cum funcționează</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PASII.map((p) => (
              <div key={p.nr} className="text-center">
                <div className="w-14 h-14 bg-orange-50 border-2 border-orange-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                  {p.icon}
                </div>
                <div className="text-xs font-black text-orange-500 mb-1">PAS {p.nr}</div>
                <h3 className="font-black text-gray-900 text-sm mb-2">{p.titlu}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section className="bg-gray-50 border-y border-gray-100 py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-black text-gray-900 mb-10 text-center">De ce AmCupon Extension?</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((f) => (
                <div key={f.titlu} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-start gap-4">
                  <div className="text-2xl shrink-0">{f.icon}</div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1">{f.titlu}</h3>
                    <p className="text-xs text-gray-500">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MAGAZINE COMPATIBILE */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-black text-gray-900 mb-4 text-center">Funcționează pe 600+ magazine</h2>
          <p className="text-center text-gray-500 text-sm mb-8">Inclusiv cele mai populare din România</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "eMag","Altex","Zara","H&M","Notino","Douglas","Sephora",
              "FashionDays","Libris","Elefant","Decathlon","Noriel",
              "PCGarage","Flanco","Dr. Max","Vegis","Booking","Answear",
              "Reserved","Carturesti","Mobexpert","IKEA",
            ].map((m) => (
              <span key={m} className="bg-gray-100 text-gray-700 text-sm font-semibold px-4 py-2 rounded-full">
                {m}
              </span>
            ))}
            <span className="bg-orange-50 text-orange-600 text-sm font-bold px-4 py-2 rounded-full">
              + 580 altele
            </span>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="bg-gradient-to-br from-orange-500 to-red-500 py-16 px-4">
          <div className="max-w-2xl mx-auto text-center text-white">
            <div className="text-5xl mb-4">🎟</div>
            <h2 className="text-2xl font-black mb-3">Începe să economisești azi</h2>
            <p className="text-orange-100 mb-8 text-sm">
              Instalezi în 10 secunde. Găsești coduri pe orice site. Economisești la fiecare comandă.
            </p>
            <a
              href="https://chromewebstore.google.com/detail/mahfankpalkgognhnllkgdkjncmmkllb"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-orange-600 font-black px-8 py-4 rounded-2xl text-base hover:bg-orange-50 transition-colors shadow-xl"
            >
              Instalează Extensia Gratuit →
            </a>
            <p className="text-orange-200 text-xs mt-4">Compatibil cu Chrome, Edge și Brave</p>
          </div>
        </section>

        <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} AmCupon.ro ·{" "}
          <a href="/" className="hover:text-orange-500">Acasă</a>{" · "}
          <a href="/toate-magazinele" className="hover:text-orange-500">Magazine</a>{" · "}
          <a href="/categorii" className="hover:text-orange-500">Categorii</a>
        </footer>
      </div>
    </>
  );
}
