import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cel mai bun Cont Bancar Online Romania 2026 — Revolut",
  description: "Comparăm conturile digitale pe care le pot deschide românii în 2026 — Revolut, Wise, Salt Bank: costuri, schimb valutar, transferuri internaționale, carduri gratuite.",
  keywords: [
    "cont bancar online romania",
    "revolut parere romania",
    "wise transfer bani strainatate",
    "n26 cont romania",
    "salt bank parere",
    "cel mai bun cont digital 2026",
    "card fara comision strainatate",
  ],
  alternates: { canonical: "https://amcupon.ro/carduri-bancare" },
  openGraph: {
    title: "Cel mai bun Cont Bancar Online Romania 2026 | AmCupon.ro",
    description: "Revolut, Wise, Salt Bank — comparație pentru români: costuri, schimb valutar, transferuri internaționale.",
    url: "https://amcupon.ro/carduri-bancare",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
    images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }],
  },
};

// Adresele oficiale (nu avem linkuri de recomandare la aceste banci).
const LINK_REVOLUT  = "https://www.revolut.com";
const LINK_WISE     = "https://wise.com";
const LINK_SALTBANK = "https://salt.bank";           // domeniul corect: salt.bank, NU saltbank.ro

// 07.10.2026: N26 scos — nu deschide conturi pentru rezidentii din Romania (lista oficiala de tari
// pe support.n26.com). Fara „bonus la inregistrare": linkurile noastre nu sunt de recomandare.
// culoare = antet inchis cu o nuanta, ca textul alb sa se citeasca; badgeColor include culoarea textului.
const CONTURI = [
  {
    rank: 1,
    name: "Revolut",
    tagline: "Cont digital multi-valută: plăți, schimb valutar, acțiuni și crypto într-o aplicație",
    badge: "Cont multi-valută",
    badgeColor: "bg-[#ddf93c] text-[#0c1000]",
    emoji: "💜",
    cost: "Gratuit (plan Standard)",
    url: LINK_REVOLUT,
    avantaje: [
      "Cont și card gratuite pe planul Standard, deschise din telefon",
      "Schimb valutar fără comision până la o limită lunară (în timpul săptămânii)",
      "Cumperi acțiuni și crypto din aplicație",
      "Carduri virtuale pentru cumpărături online",
      "Împarți notele cu prietenii direct din aplicație",
    ],
    dezavantaje: ["Suportul e în principal prin chat în aplicație", "Peste limita lunară și în weekend, schimbul valutar are comision"],
    ideal: "Călătorii, cumpărături online, primii pași în acțiuni",
    culoare: "from-[#ddf93c]/20 to-[#14181c]",
  },
  {
    rank: 2,
    name: "Wise",
    tagline: "Transferuri internaționale la cursul real, cu taxa afișată înainte",
    badge: "Transferuri internaționale",
    badgeColor: "bg-emerald-600 text-[#ffffff]",
    emoji: "🌍",
    cost: "Cont gratuit; taxă per transfer, afișată înainte",
    url: LINK_WISE,
    avantaje: [
      "Cont multi-valută (RON, EUR, USD, GBP și altele)",
      "Transfer la cursul real de schimb, fără adaos ascuns",
      "Card Wise, cu retrageri gratuite până la o limită lunară",
      "Vezi taxa exactă înainte de transfer",
      "Util pentru freelanceri plătiți din străinătate",
    ],
    dezavantaje: ["Taxă la fiecare transfer (mică, dar există)", "Nu e bancă: banii sunt protejați prin separare, nu prin fondul de garantare a depozitelor"],
    ideal: "Freelanceri, nomazi digitali, transferuri frecvente în valută",
    culoare: "from-emerald-700/40 to-[#14181c]",
  },
  {
    rank: 3,
    name: "Salt Bank",
    tagline: "Bancă digitală românească, din grupul Banca Transilvania",
    badge: "Bancă românească",
    badgeColor: "bg-[#ddf93c] text-[#0c1000]",
    emoji: "🧂",
    cost: "Gratuit",
    url: LINK_SALTBANK,
    avantaje: [
      "Dobândă la economii (rata actuală e pe site)",
      "Deschidere de cont 100% online, în română",
      "Fără comision lunar de administrare",
      "Depozitele sunt garantate de FGDB, ca la orice bancă din România",
    ],
    dezavantaje: ["Fără sucursale fizice", "Bancă mai nouă, cu mai puține funcții decât băncile mari"],
    ideal: "Cine vrea banking 100% digital, în română",
    culoare: "from-[#c3dd2c]/20 to-[#14181c]",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Cel mai bun Cont Bancar Online Romania 2026",
  url: "https://amcupon.ro/carduri-bancare",
  description: "Comparație Revolut, Wise, Salt Bank pentru români, 2026",
};

export default function CarduriBancarePage() {
  const an = new Date().getFullYear();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-[#06080b]">

        <nav className="bg-[#14181c]/80 backdrop-blur-sm border-b border-[#1f2329]">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-1.5 text-xs text-[#9399a0]">
            <Link href="/" className="hover:text-[#ddf93c] transition-colors">Acasa</Link>
            <span>/</span>
            <span className="text-[#c9ced5] font-medium">Carduri & Conturi Bancare</span>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#14181c] via-[#14181c] to-emerald-950 py-16 px-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ddf93c]/15 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#ddf93c]/20 border border-[#ddf93c]/30 text-[#c3dd2c] text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ddf93c] animate-pulse" />
              Ghid actualizat {an}
            </div>
            <div className="text-6xl mb-5 drop-shadow-2xl">💳</div>
            <h1 className="text-4xl md:text-5xl font-black text-[#ffffff] mb-4 tracking-tight">
              Cel mai bun Cont Bancar Online{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #ddf93c, #34d399)" }}>
                {an}
              </span>
            </h1>
            <p className="text-[#c9ced5] text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              Revolut, Wise și Salt Bank — conturi digitale pe care le poți deschide din România, comparate pe condițiile publicate de fiecare: costuri, schimb valutar, transferuri.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Cont gratuit", "Card virtual", "Schimb valutar", "Transferuri rapide", "Fara birocratie"].map(c => (
                <span key={c} className="bg-[#1f2329] border border-[#2a2f36] text-[#c9ced5] text-xs font-semibold px-3 py-1.5 rounded-full">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Conturi */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#c3dd2c] uppercase tracking-widest mb-2">COMPARATIE CONTURI</p>
            <h2 className="text-3xl font-black text-[#ffffff]">Conturi digitale pentru români</h2>
            <p className="text-[#c9ced5] text-sm mt-2">Comparate pe condițiile publicate de fiecare bancă — verifică-le pe site-ul ei înainte să deschizi contul</p>
          </div>

          <div className="space-y-6">
            {CONTURI.map((c) => (
              <div key={c.name} className="bg-[#14181c] border border-[#1f2329] hover:border-[#2a2f36] rounded-xl overflow-hidden transition-all duration-200">
                <div className={`bg-gradient-to-r ${c.culoare} p-6`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-[#1f2329] backdrop-blur-sm flex items-center justify-center text-3xl font-black text-[#ffffff] shrink-0">
                        {c.emoji}
                      </div>
                      <div>
                        <span className={`text-[10px] font-black ${c.badgeColor} px-2 py-0.5 rounded-full`}>#{c.rank} {c.badge}</span>
                        <h2 className="text-2xl font-black text-[#ffffff] mt-1">{c.name}</h2>
                        <p className="text-[#c9ced5] text-sm mt-0.5">{c.tagline}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="bg-[#1f2329]/50 rounded-xl p-3 text-center mb-5 max-w-xs">
                    <p className="text-xs text-[#9399a0] mb-1">Cost cont</p>
                    <p className="text-emerald-400 font-bold text-sm">{c.cost}</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mb-5">
                    <div>
                      <p className="text-xs font-bold text-[#9399a0] uppercase tracking-wider mb-2">Avantaje</p>
                      <ul className="space-y-1.5">
                        {c.avantaje.map(a => (
                          <li key={a} className="flex items-start gap-2 text-sm text-[#c9ced5]">
                            <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#9399a0] uppercase tracking-wider mb-2">De stiut</p>
                      <ul className="space-y-1.5">
                        {c.dezavantaje.map(d => (
                          <li key={d} className="flex items-start gap-2 text-sm text-[#c9ced5]">
                            <span className="text-[#c3dd2c] mt-0.5 shrink-0">!</span>
                            {d}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 bg-[#1f2329] rounded-xl p-3">
                        <p className="text-xs text-[#9399a0]">Ideal pentru</p>
                        <p className="text-[#ffffff] text-sm font-semibold mt-0.5">{c.ideal}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <a href={c.url} target="_blank" rel="nofollow noopener noreferrer"
                      className="flex-1 bg-[#ddf93c] hover:bg-[#c3dd2c] text-[#0c1000] font-black text-sm py-3 px-6 rounded-xl text-center transition-colors">
                      Vezi {c.name} →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ghid alegere */}
        <section className="bg-[#14181c] border-t border-b border-[#1f2329] py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs font-bold text-[#c3dd2c] uppercase tracking-widest mb-3">GHID ALEGERE</p>
            <h2 className="text-2xl font-black text-[#ffffff] mb-7">Ce cont sa alegi in {an}?</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: "✈️", titlu: "Călătorești des în străinătate?", raspuns: "Revolut — schimb valutar fără comision până la limita lunară a planului; peste limită și în weekend se aplică un comision." },
                { icon: "💸", titlu: "Primești bani din străinătate (freelance)?", raspuns: "Wise — transferuri la cursul real, cu taxa afișată înainte, și cont multi-valută cu date bancare locale în mai multe țări." },
                { icon: "🇪🇺", titlu: "Te muți în altă țară din UE?", raspuns: "N26 deschide conturi doar rezidenților din anumite țări — România nu e pe listă. Dacă locuiești deja acolo, verifică lista pe site-ul N26." },
                { icon: "🇷🇴", titlu: "Vrei totul în română, la o bancă din România?", raspuns: "Salt Bank — 100% digitală, din grupul Banca Transilvania, cu depozitele garantate de FGDB." },
              ].map(g => (
                <div key={g.titlu} className="bg-[#1f2329] border border-[#2a2f36] rounded-xl p-5">
                  <div className="text-2xl mb-3">{g.icon}</div>
                  <h3 className="font-bold text-[#ffffff] text-sm mb-2">{g.titlu}</h3>
                  <p className="text-xs text-[#c9ced5] leading-relaxed">{g.raspuns}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-xs font-bold text-[#9399a0] uppercase tracking-widest mb-4">EXPLOREAZA SI</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/trading", label: "📈 Trading & Investitii" },
              { href: "/vpn", label: "🔒 VPN & Securitate" },
              { href: "/hosting", label: "🌐 Hosting Web" },
              { href: "/servicii", label: "⚙️ Servicii Online" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-[#1f2329] hover:bg-[#2a2f36] border border-[#2a2f36] hover:border-[#ddf93c]/40 text-[#c9ced5] hover:text-[#ffffff] text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-[#1f2329] py-6 text-center text-xs text-[#9399a0]">
          &copy; {an} AmCupon.ro &middot;{" "}
          <Link href="/trading" className="hover:text-[#ddf93c] transition-colors">Trading</Link>{" · "}
          <Link href="/servicii" className="hover:text-[#ddf93c] transition-colors">Servicii</Link>{" · "}
          <Link href="/categorii" className="hover:text-[#ddf93c] transition-colors">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
