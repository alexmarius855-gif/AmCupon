import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cel mai bun Broker Romania 2026 — Binance, XTB",
  description: "Comparăm platformele de investiții folosite de români în 2026 — XTB (acțiuni și ETF-uri), Binance (crypto), eToro (copy trading), Trading212 — pe condițiile publicate de fiecare.",
  keywords: [
    "cel mai bun broker romania",
    "xtb parere romania",
    "binance romania",
    "etoro parere",
    "trading212 parere",
    "investitii actiuni romania 2026",
    "platforma crypto romania",
    "broker actiuni 0 comision",
  ],
  alternates: { canonical: "https://amcupon.ro/trading" },
  openGraph: {
    title: "Cel mai bun Broker & Platforma Trading Romania 2026 | AmCupon.ro",
    description: "XTB, Binance, eToro, Trading212 — comparație pe condițiile publicate: comisioane, reglementare, tipuri de active.",
    url: "https://amcupon.ro/trading",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
    images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }],
  },
};

// Adresele platformelor (Binance = link de referral, eToro = link cu id de partener).
const LINK_XTB       = "https://www.xtb.com/ro";
const LINK_BINANCE   = "https://accounts.binance.com/register?ref=205306153";
const LINK_ETORO     = "https://www.etoro.com/ro/?dl=30001846";
const LINK_TRADING212 = "https://www.trading212.com";
const LINK_REVOLUT   = "https://www.revolut.com";

// 07.10.2026: doar conditii publicate si stabile; fara randamente, dobanzi, leverage, numar de
// utilizatori sau bonusuri (se schimba, iar unele nu erau adevarate pentru linkurile noastre).
// culoare = antet inchis cu o nuanta, ca textul alb sa se citeasca; badgeColor include culoarea textului.
const PLATFORME = [
  {
    rank: 1,
    name: "XTB",
    tagline: "Acțiuni și ETF-uri fără comision până la 100.000 € rulaj pe lună, cont în RON",
    badge: "Acțiuni și ETF-uri",
    badgeColor: "bg-[#ddf93c] text-[#0c1000]",
    emoji: "📈",
    tip: "Acțiuni, ETF-uri, CFD-uri",
    pret_min: "Fără depozit minim",
    comision: "0% la acțiuni și ETF-uri până la 100.000 €/lună, plus conversia valutară",
    url: LINK_XTB,
    reglementat: "KNF (Polonia), sucursală în România",
    avantaje: [
      "Acțiuni și ETF-uri fără comision până la 100.000 € rulaj lunar",
      "Platforma xStation, pe web și pe telefon",
      "Cont demo gratuit",
      "Suport în limba română",
      "Fără depozit minim",
      "ETF-uri precum VWCE și CSPX",
    ],
    dezavantaje: ["Comision la acțiuni peste 100.000 € rulaj lunar", "Conversia valutară se plătește când cumperi în altă monedă decât a contului", "Criptomonede doar prin CFD-uri"],
    ideal: "Investiții pe termen lung în ETF-uri și acțiuni",
    culoare: "from-[#c3dd2c]/25 to-[#14181c]",
  },
  {
    rank: 2,
    name: "Binance",
    tagline: "Exchange de criptomonede: spot, P2P și staking",
    badge: "Crypto",
    badgeColor: "bg-yellow-500 text-[#0c1000]",
    emoji: "₿",
    tip: "Criptomonede (spot, P2P, staking)",
    pret_min: "Depinde de metoda de plată",
    comision: "0,1% la spot (nivelul standard)",
    url: LINK_BINANCE,
    reglementat: "Statutul diferă de la o țară la alta — verifică pe site",
    avantaje: [
      "Sute de criptomonede listate",
      "Piață P2P cu plată în lei",
      "Staking (randamentele variază)",
    ],
    dezavantaje: ["Interfață complexă pentru începători", "Criptomonedele sunt foarte volatile: poți pierde tot ce investești"],
    ideal: "Cumpărare de crypto, pentru cine înțelege riscul",
    culoare: "from-yellow-600/25 to-[#14181c]",
  },
  {
    rank: 3,
    name: "eToro",
    tagline: "Platformă socială: vezi și copiezi portofoliile altor investitori",
    badge: "Social Trading",
    badgeColor: "bg-green-600 text-[#ffffff]",
    emoji: "🤝",
    tip: "Acțiuni, ETF-uri, crypto, copy trading",
    pret_min: "Depinde de țară — vezi pe site",
    comision: "Vezi grila de taxe pe site",
    url: LINK_ETORO,
    reglementat: "CySEC (Cipru), pentru clienții din UE",
    avantaje: [
      "CopyTrader — copiezi automat tranzacțiile altui investitor",
      "Comunitate mare de investitori",
      "Acțiuni fracționate",
      "Portofolii tematice (Smart Portfolios)",
      "Cont demo",
    ],
    dezavantaje: ["Taxe de conversie valutară, de retragere și de inactivitate — vezi grila", "Copy trading-ul copiază și pierderile"],
    ideal: "Începători care vor portofolii diversificate",
    culoare: "from-green-700/40 to-[#14181c]",
  },
  {
    rank: 4,
    name: "Trading212",
    tagline: "Acțiuni fracționate și portofolii automate (Pie)",
    badge: "Acțiuni fracționate",
    badgeColor: "bg-[#ddf93c] text-[#0c1000]",
    emoji: "📊",
    tip: "Acțiuni, ETF-uri, CFD-uri",
    pret_min: "Vezi pe site",
    comision: "0% la acțiuni și ETF-uri, plus conversia valutară",
    url: LINK_TRADING212,
    reglementat: "Reglementată în UE — entitatea depinde de tipul contului",
    avantaje: [
      "Acțiuni fracționate",
      "0% comision la acțiuni și ETF-uri",
      "Pie — portofolii care se reechilibrează automat",
      "Dobândă la numerarul neinvestit (rata variază)",
    ],
    dezavantaje: ["Fără suport telefonic", "Conversia valutară se plătește la tranzacțiile în altă monedă"],
    ideal: "Începători cu sume mici, investiții lunare",
    culoare: "from-[#ddf93c]/20 to-[#14181c]",
  },
];

const COMPARATIE = [
  { feature: "Criptomonede reale (nu CFD)", xtb: false, binance: true, etoro: true, t212: false },
  { feature: "ETF-uri", xtb: true, binance: false, etoro: true, t212: true },
  { feature: "Copy trading", xtb: false, binance: false, etoro: true, t212: false },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Cel mai bun Broker Romania 2026",
  url: "https://amcupon.ro/trading",
  description: "Comparatie XTB, Binance, eToro, Trading212 pentru investitori romani 2026",
};

export default function TradingPage() {
  const an = new Date().getFullYear();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-[#06080b]">

        {/* Breadcrumb */}
        <nav className="bg-[#14181c]/80 backdrop-blur-sm border-b border-[#1f2329]">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-1.5 text-xs text-[#9399a0]">
            <Link href="/" className="hover:text-[#ddf93c] transition-colors">Acasa</Link>
            <span>/</span>
            <span className="text-[#c9ced5] font-medium">Trading & Investitii</span>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-[#14181c] to-[#14181c] py-16 px-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#ddf93c]/15 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Ghid actualizat {an}
            </div>
            <div className="text-6xl mb-5 drop-shadow-2xl">📈</div>
            <h1 className="text-4xl md:text-5xl font-black text-[#ffffff] mb-4 tracking-tight">
              Cel mai bun Broker Romania{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #34d399, #ddf93c)" }}>
                {an}
              </span>
            </h1>
            <p className="text-[#c9ced5] text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              Am comparat XTB, Binance, eToro si Trading212 pe conditiile publicate de fiecare: comisioane, siguranta, usurinta utilizarii. Nu e consultanta financiara.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Actiuni 0%", "ETF-uri", "Crypto", "Copy Trading", "Staking", "Cont Demo"].map(c => (
                <span key={c} className="bg-[#1f2329] border border-[#2a2f36] text-[#c9ced5] text-xs font-semibold px-3 py-1.5 rounded-full">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="bg-[#ddf93c]/10 border-b border-[#ddf93c]/30">
          <div className="max-w-6xl mx-auto px-4 py-3 text-xs text-[#ddf93c] text-center">
            ⚠️ Investitiile implica riscuri. Acest ghid are scop informativ, nu constituie sfat financiar. Tranzactionarea produselor leverage comporta risc ridicat de pierdere a capitalului.
          </div>
        </div>

        {/* Top 4 platforme */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">COMPARATIE PLATFORME</p>
            <h2 className="text-3xl font-black text-[#ffffff]">Top 4 platforme de investitii pentru romani</h2>
            <p className="text-[#c9ced5] text-sm mt-2">Comparate pe condițiile publicate de fiecare platformă — nu e consultanță financiară</p>
          </div>

          <div className="space-y-6">
            {PLATFORME.map((p) => (
              <div key={p.name} className="bg-[#14181c] border border-[#1f2329] hover:border-[#2a2f36] rounded-xl overflow-hidden transition-all duration-200">
                {/* Header */}
                <div className={`bg-gradient-to-r ${p.culoare} p-6`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-[#1f2329] backdrop-blur-sm flex items-center justify-center text-3xl font-black text-[#ffffff] shrink-0">
                        {p.emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-black ${p.badgeColor} px-2 py-0.5 rounded-full`}>#{p.rank} {p.badge}</span>
                          <span className="text-[#c9ced5] text-xs">{p.reglementat}</span>
                        </div>
                        <h2 className="text-2xl font-black text-[#ffffff]">{p.name}</h2>
                        <p className="text-[#c9ced5] text-sm mt-0.5">{p.tagline}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6">
                  <div className="grid sm:grid-cols-3 gap-4 mb-5">
                    <div className="bg-[#1f2329]/50 rounded-xl p-3 text-center">
                      <p className="text-xs text-[#9399a0] mb-1">Tip active</p>
                      <p className="text-[#ffffff] font-bold text-sm">{p.tip}</p>
                    </div>
                    <div className="bg-[#1f2329]/50 rounded-xl p-3 text-center">
                      <p className="text-xs text-[#9399a0] mb-1">Depozit minim</p>
                      <p className="text-[#ffffff] font-bold text-sm">{p.pret_min}</p>
                    </div>
                    <div className="bg-[#1f2329]/50 rounded-xl p-3 text-center">
                      <p className="text-xs text-[#9399a0] mb-1">Comision</p>
                      <p className="text-emerald-400 font-bold text-sm">{p.comision}</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mb-5">
                    <div>
                      <p className="text-xs font-bold text-[#9399a0] uppercase tracking-wider mb-2">Avantaje</p>
                      <ul className="space-y-1.5">
                        {p.avantaje.map(a => (
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
                        {p.dezavantaje.map(d => (
                          <li key={d} className="flex items-start gap-2 text-sm text-[#c9ced5]">
                            <span className="text-[#c3dd2c] mt-0.5 shrink-0">!</span>
                            {d}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 bg-[#1f2329] rounded-xl p-3">
                        <p className="text-xs text-[#9399a0]">Ideal pentru</p>
                        <p className="text-[#ffffff] text-sm font-semibold mt-0.5">{p.ideal}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <a href={p.url} target="_blank" rel="sponsored nofollow noopener noreferrer"
                      className="flex-1 bg-[#ddf93c] hover:bg-[#c3dd2c] text-[#0c1000] font-black text-sm py-3 px-6 rounded-xl text-center transition-colors">
                      Vezi {p.name} →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tabel comparatie */}
        <section className="bg-[#14181c] border-t border-b border-[#1f2329] py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">COMPARATIE RAPIDA</p>
              <h2 className="text-2xl font-black text-[#ffffff]">XTB vs Binance vs eToro vs Trading212</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2a2f36]">
                    <th className="text-left py-3 px-4 text-[#c9ced5] font-semibold">Caracteristica</th>
                    <th className="py-3 px-4 text-[#ddf93c] font-bold">XTB</th>
                    <th className="py-3 px-4 text-yellow-400 font-bold">Binance</th>
                    <th className="py-3 px-4 text-green-400 font-bold">eToro</th>
                    <th className="py-3 px-4 text-[#c3dd2c] font-bold">T212</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARATIE.map((row, i) => (
                    <tr key={row.feature} className={`border-b border-[#1f2329] ${i % 2 === 0 ? "bg-[#14181c]/50" : ""}`}>
                      <td className="py-3 px-4 text-[#c9ced5]">{row.feature}</td>
                      <td className="py-3 px-4 text-center">{row.xtb ? "✅" : "—"}</td>
                      <td className="py-3 px-4 text-center">{row.binance ? "✅" : "—"}</td>
                      <td className="py-3 px-4 text-center">{row.etoro ? "✅" : "—"}</td>
                      <td className="py-3 px-4 text-center">{row.t212 ? "✅" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Ghid alegere */}
        <section className="max-w-4xl mx-auto px-4 py-12">
          <p className="text-xs font-bold text-[#9399a0] uppercase tracking-widest mb-3">GHID ALEGERE</p>
          <h2 className="text-2xl font-black text-[#ffffff] mb-7">Ce platforma sa alegi in {an}?</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: "🏆", titlu: "Vrei ETF-uri (VWCE, CSPX)?", raspuns: "XTB are ETF-uri precum VWCE și CSPX, fără comision până la 100.000 € rulaj lunar, cu interfață în română și cont în RON. Alternativă: Trading212." },
              { icon: "₿", titlu: "Vrei să cumperi Bitcoin/Ethereum?", raspuns: "Binance e un exchange dedicat crypto; pe eToro ții crypto în același cont cu acțiunile. Criptomonedele sunt foarte volatile — investește doar ce îți permiți să pierzi." },
              { icon: "🤝", titlu: "Vrei să copiezi alți investitori?", raspuns: "eToro CopyTrader copiază automat tranzacțiile altui investitor — inclusiv pierderile. Rezultatele trecute nu garantează rezultate viitoare." },
              { icon: "💰", titlu: "Începi cu o sumă mică?", raspuns: "Trading212 are acțiuni fracționate, deci poți începe cu puțin. XTB nu are depozit minim." },
            ].map(g => (
              <div key={g.titlu} className="bg-[#14181c] border border-[#1f2329] rounded-xl p-5">
                <div className="text-2xl mb-3">{g.icon}</div>
                <h3 className="font-bold text-[#ffffff] text-sm mb-2">{g.titlu}</h3>
                <p className="text-xs text-[#c9ced5] leading-relaxed">{g.raspuns}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Revolut bonus */}
        <section className="max-w-6xl mx-auto px-4 pb-8">
          <div className="bg-gradient-to-r from-[#14181c] to-[#06080b] border border-[#ddf93c]/40 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[#c3dd2c] uppercase tracking-widest mb-1">ALTERNATIVĂ</p>
              <h3 className="text-xl font-black text-[#ffffff] mb-1">Revolut — actiuni si crypto in aplicatie</h3>
              <p className="text-[#c9ced5] text-sm">Planul Standard e gratuit; din aplicație cumperi acțiuni fracționate și crypto. Util ca al doilea cont.</p>
            </div>
            <a href={LINK_REVOLUT} target="_blank" rel="nofollow noopener noreferrer"
              className="shrink-0 bg-[#14181c] text-[#ddf93c] font-black text-sm py-3 px-6 rounded-xl hover:bg-[#ddf93c] hover:text-[#0c1000] transition-colors whitespace-nowrap">
              Cont Revolut gratuit →
            </a>
          </div>
        </section>

        {/* Related */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-xs font-bold text-[#9399a0] uppercase tracking-widest mb-4">EXPLOREAZA SI</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/vpn", label: "🔒 VPN & Securitate" },
              { href: "/hosting", label: "🌐 Hosting Web" },
              { href: "/instrumente-seo", label: "📊 Instrumente SEO" },
              { href: "/ai-tools", label: "🤖 AI Tools" },
              { href: "/servicii", label: "⚙️ Servicii Online" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-[#1f2329] hover:bg-[#2a2f36] border border-[#2a2f36] hover:border-emerald-500/40 text-[#c9ced5] hover:text-[#ffffff] text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-[#1f2329] py-6 text-center text-xs text-[#9399a0]">
          &copy; {an} AmCupon.ro &middot;{" "}
          <Link href="/servicii" className="hover:text-[#ddf93c] transition-colors">Servicii Online</Link>{" · "}
          <Link href="/vpn" className="hover:text-[#ddf93c] transition-colors">VPN</Link>{" · "}
          <Link href="/categorii" className="hover:text-[#ddf93c] transition-colors">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
