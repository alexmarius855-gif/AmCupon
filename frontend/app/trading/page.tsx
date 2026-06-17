import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cel mai bun Broker Romania 2026 — Binance, XTB, eToro Comparatie | AmCupon.ro",
  description: "Comparam cele mai bune platforme de trading si investitii pentru romani in 2026. XTB actiuni 0% comision, Binance crypto, eToro copy trading. Ghid complet cu bonusuri de inregistrare.",
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
    description: "XTB, Binance, eToro — comparatie completa pentru investitori romani. Bonusuri, comisioane, siguranta.",
    url: "https://amcupon.ro/trading",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
    images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }],
  },
};

// ── LINKURI AFILIATE ── inlocuieste cu codurile tale ───────────────────────
const LINK_XTB       = "https://www.xtb.com/ro?ref=amcupon";           // IB link XTB
const LINK_BINANCE   = "https://accounts.binance.com/register?ref=205306153"; // ref code Binance real (20% comision Spot)
const LINK_ETORO     = "https://www.etoro.com/ro/?dl=30001846";         // afiliat eToro
const LINK_TRADING212 = "https://www.trading212.com/invite/AMCUPON";   // referral Trading212
const LINK_REVOLUT   = "https://revolut.com/referral/AMCUPON";         // referral Revolut
// ───────────────────────────────────────────────────────────────────────────

const PLATFORME = [
  {
    rank: 1,
    name: "XTB",
    tagline: "Actiuni & ETF-uri la 0% comision — brokerul preferat al romanilor",
    badge: "Recomandat #1",
    badgeColor: "bg-indigo-600",
    emoji: "📈",
    tip: "Actiuni, ETF-uri, Forex, Crypto",
    pret_min: "0 RON minim",
    comision: "0% actiuni/ETF sub 100.000€/luna",
    rating: "9.8",
    url: LINK_XTB,
    program_url: "https://www.xtb.com/ro/partener",
    reglementat: "KNF (Polonia) + FCA (UK)",
    avantaje: [
      "Actiuni si ETF-uri fara comision (sub 100k€/luna)",
      "Platforma xStation 5 — cea mai buna din Romania",
      "Cont demo gratuit cu 100.000$ virtual",
      "Suport in romana 24/5",
      "Depozit minim 0 RON — incepi cu orice suma",
      "ETF-uri VWCE, CSPX, EQQQ disponibile",
      "Reglementat BNR + CNVM",
    ],
    dezavantaje: ["Spread criptomonede mai mare decat pe exchange-uri", "Comision actiuni dupa 100.000€/luna"],
    ideal: "Investitori pe termen lung, DCA, ETF-uri indice",
    culoare: "from-indigo-700 to-indigo-900",
    culoare_accent: "indigo",
  },
  {
    rank: 2,
    name: "Binance",
    tagline: "Cel mai mare exchange crypto din lume — volum nr. 1 global",
    badge: "Crypto #1",
    badgeColor: "bg-yellow-500",
    emoji: "₿",
    tip: "Crypto, DeFi, Futures, Staking",
    pret_min: "~10 USD minim",
    comision: "0.1% spot (reducere cu BNB)",
    rating: "9.5",
    url: LINK_BINANCE,
    program_url: "https://www.binance.com/en/activity/referral",
    reglementat: "Reglementat multiplu (UE, Asia)",
    avantaje: [
      "600+ criptomonede listate",
      "Lichiditate maxima — spread mic",
      "Staking cu randament 4-15% APY",
      "Card Binance Visa — cashback in crypto",
      "Futures cu leverage pana la 125x",
      "P2P trading RON fara comision",
      "Bonus inregistrare prin linkul nostru",
    ],
    dezavantaje: ["Interfata complexa pentru incepatori", "Nu e disponibil app pe unele tari UE"],
    ideal: "Traderi activi crypto, staking pe termen lung",
    culoare: "from-yellow-600 to-amber-800",
    culoare_accent: "yellow",
  },
  {
    rank: 3,
    name: "eToro",
    tagline: "Copy trading social — invata de la cei mai buni traderi",
    badge: "Social Trading",
    badgeColor: "bg-green-600",
    emoji: "🤝",
    tip: "Actiuni, ETF-uri, Crypto, Copy Trading",
    pret_min: "50 USD minim",
    comision: "0% actiuni (spread inclus)",
    rating: "9.1",
    url: LINK_ETORO,
    program_url: "https://partners.etoro.com",
    reglementat: "CySEC (UE) + FCA (UK)",
    avantaje: [
      "CopyTrader — copiezi automat portofoliul unui expert",
      "30M utilizatori activi — cea mai mare comunitate",
      "Actiuni fractionare de la 10$",
      "Smart Portfolios diversificate tematic",
      "Cont demo 100.000$ virtual",
    ],
    dezavantaje: ["Spread mai mare la crypto vs Binance", "Comision retragere $5", "USD ca moneda de baza"],
    ideal: "Incepatori, copy trading, portofolii diversificate",
    culoare: "from-green-700 to-teal-900",
    culoare_accent: "green",
  },
  {
    rank: 4,
    name: "Trading212",
    tagline: "Actiuni fractionate si ISA — ideal pentru incepatori europeni",
    badge: "Fractionale",
    badgeColor: "bg-blue-600",
    emoji: "📊",
    tip: "Actiuni, ETF-uri, CFD-uri",
    pret_min: "1 EUR minim",
    comision: "0% actiuni si ETF-uri",
    rating: "8.9",
    url: LINK_TRADING212,
    program_url: "https://www.trading212.com/invite",
    reglementat: "FCA (UK) + BaFin (DE)",
    avantaje: [
      "Actiuni fractionate de la 1 EUR",
      "0% comision actiuni si ETF-uri",
      "Pie — portofoliu auto-rebalansare",
      "Dobanda la cash (4%+ EUR)",
      "Actiune gratuita la inregistrare prin link",
    ],
    dezavantaje: ["Fara suport telefonic", "Selectie mai mica decat XTB"],
    ideal: "Incepatori cu bugete mici, DCA fractionate",
    culoare: "from-blue-700 to-indigo-900",
    culoare_accent: "blue",
  },
];

const COMPARATIE = [
  { feature: "0% comision actiuni", xtb: true, binance: false, etoro: true, t212: true },
  { feature: "Crypto disponibil", xtb: true, binance: true, etoro: true, t212: false },
  { feature: "ETF-uri (VWCE etc)", xtb: true, binance: false, etoro: true, t212: true },
  { feature: "Copy trading", xtb: false, binance: false, etoro: true, t212: false },
  { feature: "Staking crypto", xtb: false, binance: true, etoro: false, t212: false },
  { feature: "Reglementat UE", xtb: true, binance: true, etoro: true, t212: true },
  { feature: "Suport romana", xtb: true, binance: false, etoro: false, t212: false },
  { feature: "Cont demo gratuit", xtb: true, binance: true, etoro: true, t212: true },
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
      <div className="min-h-screen bg-slate-950">

        {/* Breadcrumb */}
        <nav className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-1.5 text-xs text-slate-500">
            <Link href="/" className="hover:text-indigo-400 transition-colors">Acasa</Link>
            <span>/</span>
            <span className="text-slate-300 font-medium">Trading & Investitii</span>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-blue-950 py-16 px-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Ghid actualizat {an}
            </div>
            <div className="text-6xl mb-5 drop-shadow-2xl">📈</div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Cel mai bun Broker Romania{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #34d399, #3b82f6)" }}>
                {an}
              </span>
            </h1>
            <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              Am testat XTB, Binance, eToro si Trading212. Comparatie completa: comisioane, siguranta, usurinta utilizare — ghid honest pentru romani.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Actiuni 0%", "ETF-uri", "Crypto", "Copy Trading", "Staking", "Cont Demo"].map(c => (
                <span key={c} className="bg-white/8 border border-white/15 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="bg-amber-950/50 border-b border-amber-800/40">
          <div className="max-w-6xl mx-auto px-4 py-3 text-xs text-amber-300/80 text-center">
            ⚠️ Investitiile implica riscuri. Acest ghid are scop informativ, nu constituie sfat financiar. Tranzactionarea produselor leverage comporta risc ridicat de pierdere a capitalului.
          </div>
        </div>

        {/* Top 4 platforme */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">COMPARATIE PLATFORME</p>
            <h2 className="text-3xl font-black text-white">Top 4 platforme de investitii pentru romani</h2>
            <p className="text-slate-400 text-sm mt-2">Testate personal — actualizat {an}</p>
          </div>

          <div className="space-y-6">
            {PLATFORME.map((p) => (
              <div key={p.name} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl overflow-hidden transition-all duration-200">
                {/* Header */}
                <div className={`bg-gradient-to-r ${p.culoare} p-6`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-3xl font-black text-white shrink-0">
                        {p.emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-black text-white ${p.badgeColor} px-2 py-0.5 rounded-full`}>#{p.rank} {p.badge}</span>
                          <span className="text-white/60 text-xs">{p.reglementat}</span>
                        </div>
                        <h2 className="text-2xl font-black text-white">{p.name}</h2>
                        <p className="text-white/75 text-sm mt-0.5">{p.tagline}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 hidden sm:block">
                      <div className="text-3xl font-black text-white">{p.rating}</div>
                      <div className="text-white/60 text-xs">/ 10</div>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6">
                  <div className="grid sm:grid-cols-3 gap-4 mb-5">
                    <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-500 mb-1">Tip active</p>
                      <p className="text-white font-bold text-sm">{p.tip}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-500 mb-1">Depozit minim</p>
                      <p className="text-white font-bold text-sm">{p.pret_min}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-500 mb-1">Comision</p>
                      <p className="text-emerald-400 font-bold text-sm">{p.comision}</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mb-5">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Avantaje</p>
                      <ul className="space-y-1.5">
                        {p.avantaje.map(a => (
                          <li key={a} className="flex items-start gap-2 text-sm text-slate-300">
                            <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">De stiut</p>
                      <ul className="space-y-1.5">
                        {p.dezavantaje.map(d => (
                          <li key={d} className="flex items-start gap-2 text-sm text-slate-400">
                            <span className="text-amber-400 mt-0.5 shrink-0">!</span>
                            {d}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 bg-slate-800 rounded-xl p-3">
                        <p className="text-xs text-slate-500">Ideal pentru</p>
                        <p className="text-white text-sm font-semibold mt-0.5">{p.ideal}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <a href={p.url} target="_blank" rel="nofollow noopener noreferrer"
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm py-3 px-6 rounded-2xl text-center transition-colors">
                      Deschide cont {p.name} gratuit →
                    </a>
                    <a href={p.program_url} target="_blank" rel="nofollow noopener noreferrer"
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-semibold text-sm py-3 px-5 rounded-2xl text-center transition-colors">
                      Program afiliere
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tabel comparatie */}
        <section className="bg-slate-900 border-t border-b border-slate-800 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">COMPARATIE RAPIDA</p>
              <h2 className="text-2xl font-black text-white">XTB vs Binance vs eToro vs Trading212</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">Caracteristica</th>
                    <th className="py-3 px-4 text-indigo-400 font-bold">XTB</th>
                    <th className="py-3 px-4 text-yellow-400 font-bold">Binance</th>
                    <th className="py-3 px-4 text-green-400 font-bold">eToro</th>
                    <th className="py-3 px-4 text-blue-400 font-bold">T212</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARATIE.map((row, i) => (
                    <tr key={row.feature} className={`border-b border-slate-800 ${i % 2 === 0 ? "bg-slate-900/50" : ""}`}>
                      <td className="py-3 px-4 text-slate-300">{row.feature}</td>
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
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">GHID ALEGERE</p>
          <h2 className="text-2xl font-black text-white mb-7">Ce platforma sa alegi in {an}?</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: "🏆", titlu: "Vrei ETF-uri (VWCE, CSPX)?", raspuns: "XTB este alegerea clara — 0% comision, interfata in romana, cont in RON. Alternativa: Trading212." },
              { icon: "₿", titlu: "Vrei sa cumperi Bitcoin/Ethereum?", raspuns: "Binance pentru volume mari si spot. eToro pentru incepatori care vor sa tina cripto fara wallet separat." },
              { icon: "🤝", titlu: "Esti incepator si vrei sa copiezi?", raspuns: "eToro CopyTrader — copiezi automat portofoliul unui expert, fara sa stii nimic despre trading." },
              { icon: "💰", titlu: "Ai sub 100 EUR si vrei actiuni?", raspuns: "Trading212 — actiuni fractionate de la 1 EUR. Alternativ XTB cu orice suma in RON." },
            ].map(g => (
              <div key={g.titlu} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="text-2xl mb-3">{g.icon}</div>
                <h3 className="font-bold text-white text-sm mb-2">{g.titlu}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{g.raspuns}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Revolut bonus */}
        <section className="max-w-6xl mx-auto px-4 pb-8">
          <div className="bg-gradient-to-r from-violet-900 to-indigo-900 border border-violet-700/40 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-violet-300 uppercase tracking-widest mb-1">BONUS</p>
              <h3 className="text-xl font-black text-white mb-1">Revolut — actiuni si crypto in aplicatie</h3>
              <p className="text-slate-300 text-sm">Deschizi cont gratuit si cumperi actiuni fractionate + crypto direct din app. Ideal ca portofel secundar.</p>
            </div>
            <a href={LINK_REVOLUT} target="_blank" rel="nofollow noopener noreferrer"
              className="shrink-0 bg-white text-violet-900 font-black text-sm py-3 px-6 rounded-2xl hover:bg-violet-50 transition-colors whitespace-nowrap">
              Cont Revolut gratuit →
            </a>
          </div>
        </section>

        {/* Related */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">EXPLOREAZA SI</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/vpn", label: "🔒 VPN & Securitate" },
              { href: "/hosting", label: "🌐 Hosting Web" },
              { href: "/instrumente-seo", label: "📊 Instrumente SEO" },
              { href: "/ai-tools", label: "🤖 AI Tools" },
              { href: "/servicii", label: "⚙️ Servicii Online" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/40 text-slate-300 hover:text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-600">
          &copy; {an} AmCupon.ro &middot;{" "}
          <Link href="/servicii" className="hover:text-indigo-400 transition-colors">Servicii Online</Link>{" · "}
          <Link href="/vpn" className="hover:text-indigo-400 transition-colors">VPN</Link>{" · "}
          <Link href="/categorii" className="hover:text-indigo-400 transition-colors">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
