import { Metadata } from "next";
import Link from "next/link";

// Linkuri afiliate reale din Impact.com
const LINK_AIRALO    = "https://airalo.pxf.io/c/7401119/1268485/15608";
const LINK_AMIGO     = "https://amigoesim.pxf.io/c/7401119/2900873/34019?irck=xyz12";
const LINK_SAILY     = "https://saily.sjv.io/c/7401119/2044403/25536";
const LINK_CHILLSIM  = "https://chillsim.sjv.io/c/7401119/3398439/45279";
const LINK_ESIMO     = "https://esimo.pxf.io/c/7401119/3792662/48791";
const LINK_ESIMATIC  = "https://esimsia.sjv.io/c/7401119/1826566/21770";
const LINK_ETRAVELSIM = "https://etravelsim.pxf.io/c/7401119/2002541/24670";
const LINK_BYTESIM   = "https://bytesimlimited.pxf.io/c/7401119/3106182/38561";
const LINK_AIRZLINK  = "https://zhonglianhongkonglimited.sjv.io/c/7401119/3766378/47959";
const LINK_ORBITMOBILE = "https://orbitmobile.sjv.io/c/7401119/2846112/32966";

export const metadata: Metadata = {
  title: "Cel mai bun eSIM pentru Calatorie 2026 — Comparatie Airalo vs Saily | AmCupon.ro",
  description: "Comparam cele mai bune eSIM-uri pentru calatorii internationale in 2026. Airalo, Saily, AmigoSIM — date mobile ieftine in 190+ tari fara SIM fizic. Ghid complet + linkuri afiliate.",
  keywords: ["cel mai bun esim", "esim calatorie", "airalo parere", "esim ieftin", "date mobile calatorie", "esim romania 2026", "esim international"],
  alternates: { canonical: "https://amcupon.ro/esim" },
  openGraph: {
    title: "Cel mai bun eSIM pentru Calatorie 2026 | AmCupon.ro",
    description: "Date mobile in 190+ tari fara SIM fizic. Comparatie Airalo, Saily, AmigoSIM — preturi, acoperire, activare.",
    url: "https://amcupon.ro/esim",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

const ESIM_TOP = [
  {
    rank: 1,
    name: "Airalo",
    tagline: "Cel mai popular eSIM din lume — 190+ tari, app excelenta",
    badge: "Recomandat #1",
    badgeColor: "bg-cyan-600",
    pret_min: "de la $4.50",
    pret_nota: "1GB / 7 zile",
    rating: "9.6",
    url: LINK_AIRALO,
    comision: "15%",
    acoperire: "190+ tari",
    activare: "Instant (app)",
    valabilitate: "7-90 zile",
    pros: [
      "Cel mai mare catalog de eSIM-uri din lume",
      "App intuitiva iOS/Android",
      "Preturi competitive per GB",
      "Suport 24/7 in app",
      "eSIM regional (Asia, Europa, Global) — mai ieftin decat national",
      "Compatibil cu toate telefoanele noi",
    ],
    cons: ["Pretul per GB creste pentru date putine", "Nu include apeluri/SMS in toate planurile"],
    ideal: "Calatori frecventi, backpackers, business travel",
  },
  {
    rank: 2,
    name: "Saily",
    tagline: "De la echipa NordVPN — securitate si simplitate garantate",
    badge: "Cel mai sigur",
    badgeColor: "bg-blue-600",
    pret_min: "de la $3.99",
    pret_nota: "1GB / 7 zile",
    rating: "9.2",
    url: LINK_SAILY,
    comision: "10%",
    acoperire: "150+ tari",
    activare: "Instant (app)",
    valabilitate: "7-30 zile",
    pros: [
      "De la echipa NordVPN — brand de incredere",
      "App simpla si curata",
      "Preturi competitive",
      "Activare rapida",
      "Date nerestricate pe viteza (FUP aplicat doar la abuz)",
    ],
    cons: ["Catalog de tari mai mic ca Airalo", "Brand nou — mai putine review-uri"],
    ideal: "Calatori care vor simplitate si un brand cunoscut",
  },
  {
    rank: 3,
    name: "AmigoSIM",
    tagline: "Date nelimitate in unele tari — raport calitate/pret excelent",
    badge: "Cel mai accesibil",
    badgeColor: "bg-indigo-600",
    pret_min: "de la $5",
    pret_nota: "date nelimitate",
    rating: "8.9",
    url: LINK_AMIGO,
    comision: "20%",
    acoperire: "130+ tari",
    activare: "Instant (app)",
    valabilitate: "7-30 zile",
    pros: [
      "Planuri cu date nelimitate disponibile",
      "Pret mic per zi",
      "Activare usoara",
      "Bun pentru calatorii lungi",
    ],
    cons: ["Viteza poate fi throttled dupa un anumit volum", "Acoperire mai mica ca Airalo"],
    ideal: "Calatorii lungi (1-4 saptamani), buget limitat",
  },
];

const ALTE_ESIM = [
  {
    name: "ChillSIM",
    emoji: "🧊",
    desc: "eSIM European — ideal pentru calatorii in UE, pret mic, activare rapida.",
    url: LINK_CHILLSIM,
    comision: "20%",
  },
  {
    name: "eSIMo",
    emoji: "🌍",
    desc: "Acoperire globala, planuri flexibile. Bun pentru Asia si America.",
    url: LINK_ESIMO,
    comision: "10%",
  },
  {
    name: "Esimatic",
    emoji: "📡",
    desc: "eSIM specializat pentru Asia. Preturi bune pentru Japonia, Coreea, China.",
    url: LINK_ESIMATIC,
    comision: "10%",
  },
  {
    name: "eTravelSIM",
    emoji: "✈️",
    desc: "Dedicat calatorilor — planuri combinate voce + date in 130+ tari.",
    url: LINK_ETRAVELSIM,
    comision: "11%",
  },
  {
    name: "ByteSIM",
    emoji: "💾",
    desc: "Date ieftine in Asia si Europa. Activare rapida, app simpla.",
    url: LINK_BYTESIM,
    comision: "10%",
  },
  {
    name: "AirZlink",
    emoji: "🔗",
    desc: "eSIM global cu preturi transparente si suport rapid.",
    url: LINK_AIRZLINK,
    comision: "15%",
  },
  {
    name: "Orbit Mobile",
    emoji: "🛸",
    desc: "eSIM cu roaming global inclus, ideal pentru business travelers.",
    url: LINK_ORBITMOBILE,
    comision: "20%",
  },
];

const FAQ = [
  {
    q: "Ce este un eSIM si cum functioneaza?",
    a: "Un eSIM (embedded SIM) este un chip SIM integrat direct in telefonul tau. Nu ai nevoie de un SIM fizic — activezi datele mobile digital, instant, inainte sau in timpul calatoriei. Functioneaza pe toate telefoanele produse dupa 2018 (iPhone XS+, Samsung S20+, Google Pixel 3+).",
  },
  {
    q: "Telefonul meu este compatibil cu eSIM?",
    a: "Majoritatea telefoanelor lansate dupa 2019 suporta eSIM: iPhone XS/XR si modele noi, Samsung Galaxy S20+, Google Pixel 3+, Xiaomi Mi 11 si versiuni mai noi. Verifica in Setari > General > Informatii sau contacteaza producatorul.",
  },
  {
    q: "Pot folosi eSIM si SIM fizic simultan?",
    a: "Da! Daca telefonul tau suporta Dual SIM (fizic + eSIM), poti pastra numarul romanesc activ pentru apeluri/SMS si folosi eSIM-ul pentru date mobile ieftine. Astfel nu platesti roaming si nu ratezi apeluri importante.",
  },
  {
    q: "Cat costa un eSIM pentru Europa?",
    a: "Preturile variaza: pentru Europa, un plan de 1GB / 7 zile costa intre $3-6 la Airalo sau Saily. Un plan de 5GB / 30 zile poate costa $10-18. Mult mai ieftin decat roaming-ul operatorilor romani (de obicei $2-5/zi pentru date limitate).",
  },
  {
    q: "Airalo sau Saily — pe care il aleg?",
    a: "Airalo are cel mai mare catalog si e ideal daca calatoresti in mai multe tari sau in destinatii exotice (Asia, Africa, America Latina). Saily e mai simplu de folosit si e de la echipa NordVPN — ideal pentru calatorii in Europa si America de Nord.",
  },
  {
    q: "Pot face apeluri cu un eSIM de date?",
    a: "Planurile de date pure nu includ apeluri/SMS. Poti folosi WhatsApp, Signal, Telegram, Google Meet sau FaceTime prin datele mobile. Unele eSIM-uri (ca eTravelSIM) ofera planuri combo cu voce, dar sunt mai scumpe.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Cele mai bune eSIM pentru calatorii 2026",
  description: "Comparatie Airalo vs Saily vs AmigoSIM si alte eSIM-uri pentru calatorii internationale",
  url: "https://amcupon.ro/esim",
  numberOfItems: ESIM_TOP.length,
  itemListElement: ESIM_TOP.map((e, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: e.name,
    url: e.url,
  })),
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function EsimPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="min-h-screen bg-slate-950 text-slate-100">
        {/* Hero */}
        <div className="bg-gradient-to-b from-cyan-950/40 to-slate-950 border-b border-slate-800">
          <div className="max-w-5xl mx-auto px-4 py-14 text-center">
            <div className="inline-flex items-center gap-2 bg-cyan-900/30 border border-cyan-700/40 rounded-full px-4 py-1.5 text-sm text-cyan-300 mb-5">
              <span>📡</span>
              <span>Date mobile in 190+ tari fara SIM fizic</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Cel mai bun <span className="text-cyan-400">eSIM</span> pentru Calatorie 2026
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
              Comparam cele mai bune eSIM-uri — date mobile ieftine in 190+ tari,
              activare instant, fara SIM fizic. Ideal pentru orice calator roman.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
              <span className="flex items-center gap-1.5"><span className="text-cyan-400">✓</span> Activare instant</span>
              <span className="flex items-center gap-1.5"><span className="text-cyan-400">✓</span> Fara contracte</span>
              <span className="flex items-center gap-1.5"><span className="text-cyan-400">✓</span> Pastrezi numarul RO</span>
              <span className="flex items-center gap-1.5"><span className="text-cyan-400">✓</span> 190+ tari acoperite</span>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-10">

          {/* Top 3 */}
          <h2 className="text-2xl font-bold text-white mb-6">Top 3 eSIM-uri recomandate</h2>
          <div className="space-y-5 mb-14">
            {ESIM_TOP.map((esim) => (
              <div key={esim.name} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 hover:border-cyan-700/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start gap-5">
                  <div className="flex-shrink-0 text-center">
                    <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center text-2xl font-bold text-cyan-400 mx-auto mb-2 border border-slate-700">
                      #{esim.rank}
                    </div>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full text-white ${esim.badgeColor}`}>
                      {esim.badge}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-white">{esim.name}</h3>
                      <span className="text-yellow-400 font-semibold">{esim.rating}/10</span>
                    </div>
                    <p className="text-slate-400 text-sm mb-4">{esim.tagline}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="bg-slate-800/60 rounded-lg p-2.5 text-center">
                        <div className="text-xs text-slate-500 mb-0.5">Pret de la</div>
                        <div className="text-sm font-bold text-cyan-300">{esim.pret_min}</div>
                        <div className="text-xs text-slate-500">{esim.pret_nota}</div>
                      </div>
                      <div className="bg-slate-800/60 rounded-lg p-2.5 text-center">
                        <div className="text-xs text-slate-500 mb-0.5">Acoperire</div>
                        <div className="text-sm font-bold text-white">{esim.acoperire}</div>
                      </div>
                      <div className="bg-slate-800/60 rounded-lg p-2.5 text-center">
                        <div className="text-xs text-slate-500 mb-0.5">Activare</div>
                        <div className="text-sm font-bold text-white">{esim.activare}</div>
                      </div>
                      <div className="bg-slate-800/60 rounded-lg p-2.5 text-center">
                        <div className="text-xs text-slate-500 mb-0.5">Valabilitate</div>
                        <div className="text-sm font-bold text-white">{esim.valabilitate}</div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3 mb-4">
                      <div>
                        <div className="text-xs text-slate-500 uppercase mb-1.5 font-medium">Avantaje</div>
                        <ul className="space-y-1">
                          {esim.pros.map((p) => (
                            <li key={p} className="text-sm text-slate-300 flex gap-2">
                              <span className="text-cyan-400 flex-shrink-0">+</span> {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 uppercase mb-1.5 font-medium">Dezavantaje</div>
                        <ul className="space-y-1">
                          {esim.cons.map((c) => (
                            <li key={c} className="text-sm text-slate-400 flex gap-2">
                              <span className="text-slate-500 flex-shrink-0">-</span> {c}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 text-xs text-slate-500">
                          <span className="font-medium text-slate-400">Ideal pentru:</span> {esim.ideal}
                        </div>
                      </div>
                    </div>
                    <a
                      href={esim.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
                    >
                      Alege {esim.name} &rarr;
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Ce este eSIM */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-7 mb-12">
            <h2 className="text-xl font-bold text-white mb-4">Ce este un eSIM si de ce sa il folosesti in calatorie?</h2>
            <div className="grid md:grid-cols-3 gap-5 text-sm">
              <div>
                <div className="text-cyan-400 font-semibold mb-2">Fara SIM fizic</div>
                <p className="text-slate-400">Activezi datele mobile direct din aplicatie. Fara sa mergi la un magazin, fara sa astepti posta, fara riscul de a pierde SIM-ul.</p>
              </div>
              <div>
                <div className="text-cyan-400 font-semibold mb-2">Mult mai ieftin ca roaming-ul</div>
                <p className="text-slate-400">Un plan de 5GB la Airalo costa $8-15. Roaming-ul Orange/Vodafone in afara UE costa de 5-10x mai mult pentru aceeasi cantitate de date.</p>
              </div>
              <div>
                <div className="text-cyan-400 font-semibold mb-2">Pastrezi numarul RO</div>
                <p className="text-slate-400">Daca telefonul are Dual SIM, poti folosi eSIM-ul pentru date si SIM-ul fizic pentru apeluri romanesti. Nu ratezi niciun SMS sau apel.</p>
              </div>
            </div>
          </div>

          {/* Alte eSIM-uri */}
          <h2 className="text-2xl font-bold text-white mb-5">Alte optiuni eSIM</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-14">
            {ALTE_ESIM.map((e) => (
              <a
                key={e.name}
                href={e.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-cyan-700/50 transition-colors group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{e.emoji}</span>
                  <span className="font-semibold text-white group-hover:text-cyan-300 transition-colors">{e.name}</span>
                  <span className="ml-auto text-xs text-cyan-400 font-medium">{e.comision}</span>
                </div>
                <p className="text-slate-400 text-sm">{e.desc}</p>
              </a>
            ))}
          </div>

          {/* Tabel comparativ */}
          <h2 className="text-2xl font-bold text-white mb-5">Comparatie rapida</h2>
          <div className="overflow-x-auto mb-14">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-800 text-slate-400 text-left">
                  <th className="px-4 py-3 rounded-tl-lg font-medium">eSIM</th>
                  <th className="px-4 py-3 font-medium">Tari</th>
                  <th className="px-4 py-3 font-medium">Pret de la</th>
                  <th className="px-4 py-3 font-medium">Activare</th>
                  <th className="px-4 py-3 rounded-tr-lg font-medium">Rating</th>
                </tr>
              </thead>
              <tbody>
                {ESIM_TOP.map((e, i) => (
                  <tr key={e.name} className={i % 2 === 0 ? "bg-slate-900/40" : "bg-slate-900/20"}>
                    <td className="px-4 py-3 font-medium text-white">
                      <a href={e.url} target="_blank" rel="noopener noreferrer nofollow" className="hover:text-cyan-400 transition-colors">
                        {e.name}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{e.acoperire}</td>
                    <td className="px-4 py-3 text-cyan-300">{e.pret_min}</td>
                    <td className="px-4 py-3 text-slate-300">{e.activare}</td>
                    <td className="px-4 py-3 text-yellow-400 font-semibold">{e.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FAQ */}
          <h2 className="text-2xl font-bold text-white mb-5">Intrebari frecvente despre eSIM</h2>
          <div className="space-y-4 mb-14">
            {FAQ.map((item) => (
              <div key={item.q} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="font-semibold text-white mb-2">{item.q}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>

          {/* CTA + navlink */}
          <div className="bg-gradient-to-r from-cyan-900/30 to-indigo-900/30 border border-cyan-800/40 rounded-2xl p-7 text-center mb-10">
            <h2 className="text-xl font-bold text-white mb-2">Pregatit pentru urmatoarea calatorie?</h2>
            <p className="text-slate-400 text-sm mb-5">Activeaza eSIM-ul inainte sa pleci — 5 minute si esti conectat oriunde in lume.</p>
            <a
              href={LINK_AIRALO}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-7 py-3 rounded-xl text-sm transition-colors"
            >
              Cumpara eSIM pe Airalo &rarr;
            </a>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/calatorie" className="text-slate-400 hover:text-cyan-400 transition-colors">Oferte Calatorie</Link>
            <span className="text-slate-700">•</span>
            <Link href="/vpn" className="text-slate-400 hover:text-cyan-400 transition-colors">Cele mai bune VPN-uri</Link>
            <span className="text-slate-700">•</span>
            <Link href="/hosting" className="text-slate-400 hover:text-cyan-400 transition-colors">Hosting ieftin</Link>
            <span className="text-slate-700">•</span>
            <Link href="/toate-magazinele" className="text-slate-400 hover:text-cyan-400 transition-colors">Toate magazinele</Link>
          </div>
        </div>
      </div>
    </>
  );
}
