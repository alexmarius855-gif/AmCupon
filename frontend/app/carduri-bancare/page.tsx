import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cel mai bun Cont Bancar Online Romania 2026 — Revolut, Wise, N26 | AmCupon.ro",
  description: "Comparam cele mai bune conturi bancare digitale pentru romani in 2026. Revolut, Wise, N26, Salt Bank — comisioane, transferuri internationale, carduri gratuite. Bonus la inregistrare.",
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
    description: "Revolut, Wise, N26, Salt Bank — comparatie completa pentru romani. Carduri gratuite, transferuri ieftine, bonus inregistrare.",
    url: "https://amcupon.ro/carduri-bancare",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
    images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }],
  },
};

// ── LINKURI AFILIATE ── inlocuieste cu codurile/linkurile tale ────────────
const LINK_REVOLUT  = "https://www.revolut.com";          // cod referral din app Revolut
const LINK_WISE     = "https://wise.com";                // link afiliat Wise (Partnerize)
const LINK_N26      = "https://n26.com";                      // link referral N26
const LINK_SALTBANK = "https://salt.bank";           // link referral Salt Bank (domeniu corect: salt.bank, NU saltbank.ro)
// ──────────────────────────────────────────────────────────────────────────

const CONTURI = [
  {
    rank: 1,
    name: "Revolut",
    tagline: "Cel mai popular cont digital din Romania — bani, crypto si actiuni intr-o app",
    badge: "Recomandat #1",
    badgeColor: "bg-[#0d9488]",
    emoji: "💜",
    cost: "Gratuit (plan Standard)",
    rating: "9.7",
    url: LINK_REVOLUT,
    program_url: "https://www.revolut.com/referral-program",
    avantaje: [
      "Cont si card gratuite, deschis in 5 minute din telefon",
      "Schimb valutar la curs interbancar (fara comision ascuns)",
      "Cumperi crypto si actiuni direct din aplicatie",
      "Card virtual instant pentru cumparaturi online",
      "Plati split intre prieteni (Revolut Pay)",
      "Bonus la inregistrare prin link de recomandare",
    ],
    dezavantaje: ["Suport clienti doar prin chat in app", "Planul gratuit are limite la schimb valutar"],
    ideal: "Calatorii, cumparaturi online, prima expunere la crypto/actiuni",
    culoare: "from-[#14b8a6] to-[#111827]",
  },
  {
    rank: 2,
    name: "Wise",
    tagline: "Cele mai ieftine transferuri internationale — taxe reale, fara costuri ascunse",
    badge: "Transferuri #1",
    badgeColor: "bg-emerald-600",
    emoji: "🌍",
    cost: "Gratuit cont, comision mic per transfer",
    rating: "9.5",
    url: LINK_WISE,
    program_url: "https://wise.com/help/articles/2932160",
    avantaje: [
      "Cont multi-valuta (RON, EUR, USD, GBP si altele)",
      "Transfer la curs real de schimb — fara markup ascuns",
      "Card Wise pentru retrageri ieftine in strainatate",
      "Transparenta totala — vezi comisionul exact inainte de transfer",
      "Ideal pentru freelanceri platiti din strainatate",
    ],
    dezavantaje: ["Nu are functii de investitii/crypto", "Comision per transfer (mic, dar exista)"],
    ideal: "Freelanceri, nomazi digitali, transferuri frecvente in valuta",
    culoare: "from-emerald-700 to-[#111827]",
  },
  {
    rank: 3,
    name: "N26",
    tagline: "Banca digitala germana — cont european complet, fara birocratie",
    badge: "Cont European",
    badgeColor: "bg-[#0d9488]",
    emoji: "🇪🇺",
    cost: "Gratuit (plan Standard)",
    rating: "8.9",
    url: LINK_N26,
    program_url: "https://n26.com/en-eu/referral",
    avantaje: [
      "IBAN german — util pentru salarii/plati din UE",
      "Notificari instant la fiecare tranzactie",
      "Spatii (Spaces) pentru economii separate pe obiective",
      "Aplicatie foarte simpla si rapida",
    ],
    dezavantaje: ["Suport mai limitat in romana", "Retrageri numerar limitate gratuit pe luna"],
    ideal: "Studenti si lucratori in UE, cont secundar in euro",
    culoare: "from-[#14b8a6] to-[#0a0f1a]",
  },
  {
    rank: 4,
    name: "Salt Bank",
    tagline: "Banca 100% digitala romaneasca — dobanda la cash, fara birou fizic",
    badge: "100% Romanesc",
    badgeColor: "bg-[#0d9488]",
    emoji: "🧂",
    cost: "Gratuit",
    rating: "8.7",
    url: LINK_SALTBANK,
    program_url: "https://www.saltbank.ro",
    avantaje: [
      "Dobanda la soldul din cont (peste media pietei)",
      "Deschidere cont 100% online, in romana",
      "Fara comisioane lunare de mentinere",
      "Susitnuta de Banca Transilvania — incredere si garantie depozite",
    ],
    dezavantaje: ["Fara optiuni de investitii inca", "Ecosistem mai tanar, mai putine functii"],
    ideal: "Romani care vor banking 100% digital, in limba romana",
    culoare: "from-[#0d9488] to-[#111827]",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Cel mai bun Cont Bancar Online Romania 2026",
  url: "https://amcupon.ro/carduri-bancare",
  description: "Comparatie Revolut, Wise, N26, Salt Bank pentru romani 2026",
};

export default function CarduriBancarePage() {
  const an = new Date().getFullYear();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-[#0a0f1a]">

        <nav className="bg-[#111827]/80 backdrop-blur-sm border-b border-[#1e293b]">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-1.5 text-xs text-[#94a3b8]">
            <Link href="/" className="hover:text-[#0d9488] transition-colors">Acasa</Link>
            <span>/</span>
            <span className="text-[#cbd5e1] font-medium">Carduri & Conturi Bancare</span>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#111827] via-[#111827] to-emerald-950 py-16 px-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#14b8a6]/15 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#14b8a6]/20 border border-[#14b8a6]/30 text-[#0f766e] text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#14b8a6] animate-pulse" />
              Ghid actualizat {an}
            </div>
            <div className="text-6xl mb-5 drop-shadow-2xl">💳</div>
            <h1 className="text-4xl md:text-5xl font-black text-[#f1f5f9] mb-4 tracking-tight">
              Cel mai bun Cont Bancar Online{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #0d9488, #34d399)" }}>
                {an}
              </span>
            </h1>
            <p className="text-[#cbd5e1] text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              Revolut, Wise, N26, Salt Bank — comparatie completa pentru romani. Carduri gratuite, schimb valutar fara comision, transferuri internationale ieftine.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Cont gratuit", "Card virtual", "Schimb valutar", "Transferuri rapide", "Fara birocratie"].map(c => (
                <span key={c} className="bg-slate-100 border border-slate-200 text-slate-500 text-xs font-semibold px-3 py-1.5 rounded-full">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Conturi */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-[#0f766e] uppercase tracking-widest mb-2">COMPARATIE CONTURI</p>
            <h2 className="text-3xl font-black text-[#f1f5f9]">Top 4 conturi bancare digitale pentru romani</h2>
            <p className="text-[#cbd5e1] text-sm mt-2">Testate personal — actualizat {an}</p>
          </div>

          <div className="space-y-6">
            {CONTURI.map((c) => (
              <div key={c.name} className="bg-[#111827] border border-[#1e293b] hover:border-[#334155] rounded-xl overflow-hidden transition-all duration-200">
                <div className={`bg-gradient-to-r ${c.culoare} p-6`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-slate-100 backdrop-blur-sm flex items-center justify-center text-3xl font-black text-[#f1f5f9] shrink-0">
                        {c.emoji}
                      </div>
                      <div>
                        <span className={`text-[10px] font-black text-[#f1f5f9] ${c.badgeColor} px-2 py-0.5 rounded-full`}>#{c.rank} {c.badge}</span>
                        <h2 className="text-2xl font-black text-[#f1f5f9] mt-1">{c.name}</h2>
                        <p className="text-slate-500 text-sm mt-0.5">{c.tagline}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 hidden sm:block">
                      <div className="text-3xl font-black text-[#f1f5f9]">{c.rating}</div>
                      <div className="text-slate-500 text-xs">/ 10</div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="bg-[#1e293b]/50 rounded-xl p-3 text-center mb-5 max-w-xs">
                    <p className="text-xs text-[#94a3b8] mb-1">Cost cont</p>
                    <p className="text-emerald-400 font-bold text-sm">{c.cost}</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mb-5">
                    <div>
                      <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2">Avantaje</p>
                      <ul className="space-y-1.5">
                        {c.avantaje.map(a => (
                          <li key={a} className="flex items-start gap-2 text-sm text-[#cbd5e1]">
                            <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2">De stiut</p>
                      <ul className="space-y-1.5">
                        {c.dezavantaje.map(d => (
                          <li key={d} className="flex items-start gap-2 text-sm text-[#cbd5e1]">
                            <span className="text-[#0f766e] mt-0.5 shrink-0">!</span>
                            {d}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 bg-[#1e293b] rounded-xl p-3">
                        <p className="text-xs text-[#94a3b8]">Ideal pentru</p>
                        <p className="text-[#f1f5f9] text-sm font-semibold mt-0.5">{c.ideal}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <a href={c.url} target="_blank" rel="nofollow noopener noreferrer"
                      className="flex-1 bg-[#0d9488] hover:bg-[#14b8a6] text-white font-black text-sm py-3 px-6 rounded-xl text-center transition-colors">
                      Deschide cont {c.name} gratuit →
                    </a>
                    <a href={c.program_url} target="_blank" rel="nofollow noopener noreferrer"
                      className="bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-[#cbd5e1] hover:text-[#f1f5f9] font-semibold text-sm py-3 px-5 rounded-xl text-center transition-colors">
                      Program recomandare
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ghid alegere */}
        <section className="bg-[#111827] border-t border-b border-[#1e293b] py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs font-bold text-[#0f766e] uppercase tracking-widest mb-3">GHID ALEGERE</p>
            <h2 className="text-2xl font-black text-[#f1f5f9] mb-7">Ce cont sa alegi in {an}?</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: "✈️", titlu: "Calatoresti des in strainatate?", raspuns: "Revolut — schimb valutar la curs real, card acceptat global, fara comisioane ascunse la plata in alta valuta." },
                { icon: "💸", titlu: "Primesti bani din strainatate (freelance)?", raspuns: "Wise — cel mai ieftin pentru transferuri internationale, cont multi-valuta cu IBAN-uri locale in mai multe tari." },
                { icon: "🇪🇺", titlu: "Lucrezi sau studiezi in UE?", raspuns: "N26 — IBAN german, ideal pentru salarii si plati locale in zona euro." },
                { icon: "🇷🇴", titlu: "Vrei tot in romana, susitnut de o banca mare?", raspuns: "Salt Bank — 100% digital, dobanda la cash, backing de la Banca Transilvania." },
              ].map(g => (
                <div key={g.titlu} className="bg-[#1e293b] border border-[#334155] rounded-xl p-5">
                  <div className="text-2xl mb-3">{g.icon}</div>
                  <h3 className="font-bold text-[#f1f5f9] text-sm mb-2">{g.titlu}</h3>
                  <p className="text-xs text-[#cbd5e1] leading-relaxed">{g.raspuns}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-4">EXPLOREAZA SI</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/trading", label: "📈 Trading & Investitii" },
              { href: "/vpn", label: "🔒 VPN & Securitate" },
              { href: "/hosting", label: "🌐 Hosting Web" },
              { href: "/servicii", label: "⚙️ Servicii Online" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-[#1e293b] hover:bg-[#334155] border border-[#334155] hover:border-[#14b8a6]/40 text-[#cbd5e1] hover:text-[#f1f5f9] text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-[#1e293b] py-6 text-center text-xs text-[#94a3b8]">
          &copy; {an} AmCupon.ro &middot;{" "}
          <Link href="/trading" className="hover:text-[#0d9488] transition-colors">Trading</Link>{" · "}
          <Link href="/servicii" className="hover:text-[#0d9488] transition-colors">Servicii</Link>{" · "}
          <Link href="/categorii" className="hover:text-[#0d9488] transition-colors">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
