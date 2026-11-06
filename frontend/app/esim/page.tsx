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
  title: "eSIM pentru călătorii în afara UE 2026 | AmCupon.ro",
  description: "Comparăm furnizori de eSIM pentru călătorii în afara UE: acoperire, activare, compatibilitate, date mobile fără SIM fizic. Pagina conține linkuri afiliate.",
  keywords: ["cel mai bun esim", "esim călătorie", "airalo părere", "esim ieftin", "date mobile călătorie", "esim românia 2026", "esim internațional"],
  alternates: { canonical: "https://amcupon.ro/esim" },
  openGraph: {
    title: "eSIM pentru călătorii în afara UE 2026 | AmCupon.ro",
    description: "Date mobile în afara UE fără SIM fizic. Comparație de furnizori eSIM — acoperire, activare, compatibilitate.",
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
    tagline: "eSIM pentru 190+ țări, cu aplicație pentru iOS și Android",
    badge: "Cea mai mare acoperire",
    badgeColor: "bg-[#ddf93c]",
    pret_min: "preț pe destinație",
    pret_nota: "1GB / 7 zile",
    url: LINK_AIRALO,
    acoperire: "190+ tari",
    activare: "Instant (app)",
    valabilitate: "7-90 zile",
    pros: [
      "Catalog mare: 190+ țări și pachete regionale",
      "App intuitivă iOS/Android",
      "Prețuri competitive per GB",
      "Suport 24/7 în app",
      "eSIM regional (Asia, Europa, Global) — mai ieftin decât național",
      "Compatibil cu toate telefoanele noi",
    ],
    cons: ["Prețul per GB crește pentru date puține", "Nu include apeluri/SMS în toate planurile"],
    ideal: "Călători frecvenți, backpackers, business travel",
  },
  {
    rank: 2,
    name: "Saily",
    tagline: "De la echipa NordVPN — aplicație simplă, activare instant",
    badge: "De la echipa NordVPN",
    badgeColor: "bg-[#ddf93c]",
    pret_min: "preț pe destinație",
    pret_nota: "1GB / 7 zile",
    url: LINK_SAILY,
    acoperire: "150+ tari",
    activare: "Instant (app)",
    valabilitate: "7-30 zile",
    pros: [
      "De la echipa NordVPN — brand de încredere",
      "App simplă și curată",
      "Prețuri competitive",
      "Activare rapidă",
      "Date nerestricționate pe viteză (FUP aplicat doar la abuz)",
    ],
    cons: ["Catalog de țări mai mic decât Airalo", "Brand nou — mai puține review-uri"],
    ideal: "Călători care vor simplitate și un brand cunoscut",
  },
  {
    rank: 3,
    name: "AmigoSIM",
    tagline: "Date nelimitate în unele țări",
    badge: "Date nelimitate",
    badgeColor: "bg-[#ddf93c]",
    pret_min: "preț pe destinație",
    pret_nota: "date nelimitate",
    url: LINK_AMIGO,
    acoperire: "130+ tari",
    activare: "Instant (app)",
    valabilitate: "7-30 zile",
    pros: [
      "Planuri cu date nelimitate disponibile",
      "Preț mic per zi",
      "Activare ușoară",
      "Bun pentru călătorii lungi",
    ],
    cons: ["Viteza poate fi limitată după un anumit volum", "Acoperire mai mică decât Airalo"],
    ideal: "Călătorii lungi (1-4 săptămâni), buget limitat",
  },
];

const ALTE_ESIM = [
  {
    name: "ChillSIM",
    emoji: "🧊",
    desc: "eSIM European — ideal pentru călătorii în UE, preț mic, activare rapidă.",
    url: LINK_CHILLSIM,
  },
  {
    name: "eSIMo",
    emoji: "🌍",
    desc: "Acoperire globală, planuri flexibile. Bun pentru Asia și America.",
    url: LINK_ESIMO,
  },
  {
    name: "Esimatic",
    emoji: "📡",
    desc: "eSIM specializat pentru Asia. Prețuri bune pentru Japonia, Coreea, China.",
    url: LINK_ESIMATIC,
  },
  {
    name: "eTravelSIM",
    emoji: "✈️",
    desc: "Dedicat călătorilor — planuri combinate voce + date în 130+ țări.",
    url: LINK_ETRAVELSIM,
  },
  {
    name: "ByteSIM",
    emoji: "💾",
    desc: "Date ieftine în Asia și Europa. Activare rapidă, app simplă.",
    url: LINK_BYTESIM,
  },
  {
    name: "AirZlink",
    emoji: "🔗",
    desc: "eSIM global cu prețuri transparente și suport rapid.",
    url: LINK_AIRZLINK,
  },
  {
    name: "Orbit Mobile",
    emoji: "🛸",
    desc: "eSIM cu roaming global inclus, ideal pentru business travelers.",
    url: LINK_ORBITMOBILE,
  },
];

const FAQ = [
  {
    q: "Ce este un eSIM și cum funcționează?",
    a: "Un eSIM (embedded SIM) este un chip SIM integrat direct în telefonul tău. Nu ai nevoie de un SIM fizic — activezi datele mobile digital, instant, înainte sau în timpul călătoriei. Funcționează pe toate telefoanele produse după 2018 (iPhone XS+, Samsung S20+, Google Pixel 3+).",
  },
  {
    q: "Telefonul meu este compatibil cu eSIM?",
    a: "Majoritatea telefoanelor lansate după 2019 suportă eSIM: iPhone XS/XR și modele noi, Samsung Galaxy S20+, Google Pixel 3+, Xiaomi Mi 11 și versiuni mai noi. Verifică în Setări > General > Informații sau contactează producătorul.",
  },
  {
    q: "Pot folosi eSIM și SIM fizic simultan?",
    a: "Da! Dacă telefonul tău suportă Dual SIM (fizic + eSIM), poți păstra numărul românesc activ pentru apeluri/SMS și folosi eSIM-ul pentru date mobile ieftine. Astfel nu plătești roaming și nu ratezi apeluri importante.",
  },
  {
    q: "Am nevoie de eSIM când călătoresc în Europa?",
    a: "În țările UE și SEE, cu un abonament românesc ai roaming ca acasă (Regulamentul (UE) 2022/612), în limitele politicii de utilizare corectă a operatorului, deci de obicei nu ai nevoie de eSIM. Un eSIM de date are sens în afara UE (de exemplu Turcia, Egipt, Emiratele Arabe Unite, SUA) sau în țări europene din afara UE, precum Elveția sau Marea Britanie. Prețurile variază pe destinație și se schimbă des, așa că verifică prețul actual pe site-ul furnizorului.",
  },
  {
    q: "Airalo sau Saily — pe care îl aleg?",
    a: "Airalo are un catalog foarte mare (peste 200 de destinații), util dacă mergi în mai multe țări sau în destinații mai rare. Saily e mai simplu de folosit și e făcut de firma din spatele NordVPN. Înainte să alegi, compară prețul pentru destinația ta pe ambele site-uri.",
  },
  {
    q: "Pot face apeluri cu un eSIM de date?",
    a: "Planurile de date pure nu includ apeluri/SMS. Poți folosi WhatsApp, Signal, Telegram, Google Meet sau FaceTime prin datele mobile. Unele eSIM-uri au și planuri cu minute incluse, de obicei mai scumpe.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Cele mai bune eSIM pentru călătorii 2026",
  description: "Comparație de furnizori eSIM pentru călătorii în afara UE",
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

      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        {/* Hero */}
        <div className="bg-gradient-to-b from-[var(--surface)]/40 to-[var(--background)] border-b border-[var(--border)]">
          <div className="max-w-5xl mx-auto px-4 py-14 text-center">
            <div className="inline-flex items-center gap-2 bg-[var(--background)]/30 border border-[#c3dd2c]/40 rounded-full px-4 py-1.5 text-sm text-[var(--accent-text)] mb-5">
              <span>📡</span>
              <span>Date mobile în 190+ țări fără SIM fizic</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--foreground)] mb-4">
              Cel mai bun <span className="text-[var(--accent-text)]">eSIM</span> pentru Călătorie 2026
            </h1>
            <p className="text-lg text-[var(--text-soft)] max-w-2xl mx-auto mb-8">
              Comparăm cele mai bune eSIM-uri — date mobile ieftine în 190+ țări,
              activare instant, fără SIM fizic. Ideal pentru orice călător român.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-[var(--text-soft)]">
              <span className="flex items-center gap-1.5"><span className="text-[var(--accent-text)]">✓</span> Activare instant</span>
              <span className="flex items-center gap-1.5"><span className="text-[var(--accent-text)]">✓</span> Fără contracte</span>
              <span className="flex items-center gap-1.5"><span className="text-[var(--accent-text)]">✓</span> Păstrezi numărul RO</span>
              <span className="flex items-center gap-1.5"><span className="text-[var(--accent-text)]">✓</span> 190+ țări acoperite</span>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-10">

          {/* Top 3 */}
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">Top 3 eSIM-uri recomandate</h2>
          <div className="space-y-5 mb-14">
            {ESIM_TOP.map((esim) => (
              <div key={esim.name} className="bg-[var(--surface)] border border-[var(--border-strong)] rounded-xl p-6 hover:border-[#c3dd2c]/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start gap-5">
                  <div className="flex-shrink-0 text-center">
                    <div className="w-16 h-16 bg-[var(--surface-alt)] rounded-xl flex items-center justify-center text-2xl font-bold text-[var(--accent-text)] mx-auto mb-2 border border-[var(--border-strong)]">
                      #{esim.rank}
                    </div>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full text-[var(--foreground)] ${esim.badgeColor}`}>
                      {esim.badge}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-[var(--foreground)]">{esim.name}</h3>
                    </div>
                    <p className="text-[var(--text-soft)] text-sm mb-4">{esim.tagline}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="bg-[var(--surface-alt)]/60 rounded-lg p-2.5 text-center">
                        <div className="text-xs text-[var(--text-muted)] mb-0.5">Preț de la</div>
                        <div className="text-sm font-bold text-[var(--accent-text)]">{esim.pret_min}</div>
                        <div className="text-xs text-[var(--text-muted)]">{esim.pret_nota}</div>
                      </div>
                      <div className="bg-[var(--surface-alt)]/60 rounded-lg p-2.5 text-center">
                        <div className="text-xs text-[var(--text-muted)] mb-0.5">Acoperire</div>
                        <div className="text-sm font-bold text-[var(--foreground)]">{esim.acoperire}</div>
                      </div>
                      <div className="bg-[var(--surface-alt)]/60 rounded-lg p-2.5 text-center">
                        <div className="text-xs text-[var(--text-muted)] mb-0.5">Activare</div>
                        <div className="text-sm font-bold text-[var(--foreground)]">{esim.activare}</div>
                      </div>
                      <div className="bg-[var(--surface-alt)]/60 rounded-lg p-2.5 text-center">
                        <div className="text-xs text-[var(--text-muted)] mb-0.5">Valabilitate</div>
                        <div className="text-sm font-bold text-[var(--foreground)]">{esim.valabilitate}</div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3 mb-4">
                      <div>
                        <div className="text-xs text-[var(--text-muted)] uppercase mb-1.5 font-medium">Avantaje</div>
                        <ul className="space-y-1">
                          {esim.pros.map((p) => (
                            <li key={p} className="text-sm text-[var(--text-soft)] flex gap-2">
                              <span className="text-[var(--accent-text)] flex-shrink-0">+</span> {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-xs text-[var(--text-muted)] uppercase mb-1.5 font-medium">Dezavantaje</div>
                        <ul className="space-y-1">
                          {esim.cons.map((c) => (
                            <li key={c} className="text-sm text-[var(--text-soft)] flex gap-2">
                              <span className="text-[var(--text-muted)] flex-shrink-0">-</span> {c}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 text-xs text-[var(--text-muted)]">
                          <span className="font-medium text-[var(--text-soft)]">Ideal pentru:</span> {esim.ideal}
                        </div>
                      </div>
                    </div>
                    <a
                      href={esim.url}
                      target="_blank"
                      rel="sponsored nofollow noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#ddf93c] hover:bg-[#ddf93c] text-[#0c1000] font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
                    >
                      Alege {esim.name} &rarr;
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Ce este eSIM */}
          <div className="bg-[var(--surface)]/60 border border-[var(--border)] rounded-xl p-7 mb-12">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Ce este un eSIM și de ce să îl folosești în călătorie?</h2>
            <div className="grid md:grid-cols-3 gap-5 text-sm">
              <div>
                <div className="text-[var(--accent-text)] font-semibold mb-2">Fără SIM fizic</div>
                <p className="text-[var(--text-soft)]">Activezi datele mobile direct din aplicație. Fără să mergi la un magazin, fără să aștepți poșta, fără riscul de a pierde SIM-ul.</p>
              </div>
              <div>
                <div className="text-[var(--accent-text)] font-semibold mb-2">Util în afara UE</div>
                <p className="text-[var(--text-soft)]">În UE ai &bdquo;roaming ca acasă&rdquo; cu abonamentul românesc. În afara UE, roamingul poate fi scump, iar un eSIM de date e de obicei alternativa. Compară prețul pentru destinația ta înainte să cumperi.</p>
              </div>
              <div>
                <div className="text-[var(--accent-text)] font-semibold mb-2">Păstrezi numărul RO</div>
                <p className="text-[var(--text-soft)]">Dacă telefonul are Dual SIM, poți folosi eSIM-ul pentru date și SIM-ul fizic pentru apeluri românești. Nu ratezi niciun SMS sau apel.</p>
              </div>
            </div>
          </div>

          {/* Alte eSIM-uri */}
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-5">Alte opțiuni eSIM</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-14">
            {ALTE_ESIM.map((e) => (
              <a
                key={e.name}
                href={e.url}
                target="_blank"
                rel="sponsored nofollow noopener noreferrer"
                className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 hover:border-[#c3dd2c]/50 transition-colors group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{e.emoji}</span>
                  <span className="font-semibold text-[var(--foreground)] group-hover:text-[var(--accent-text)] transition-colors">{e.name}</span>
                </div>
                <p className="text-[var(--text-soft)] text-sm">{e.desc}</p>
              </a>
            ))}
          </div>

          {/* Tabel comparativ */}
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-5">Comparație rapidă</h2>
          <div className="overflow-x-auto mb-14">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[var(--surface-alt)] text-[var(--text-soft)] text-left">
                  <th className="px-4 py-3 rounded-tl-lg font-medium">eSIM</th>
                  <th className="px-4 py-3 font-medium">Țări</th>
                  <th className="px-4 py-3 font-medium">Preț de la</th>
                  <th className="px-4 py-3 rounded-tr-lg font-medium">Activare</th>
                </tr>
              </thead>
              <tbody>
                {ESIM_TOP.map((e, i) => (
                  <tr key={e.name} className={i % 2 === 0 ? "bg-[var(--surface)]/40" : "bg-[var(--surface)]/20"}>
                    <td className="px-4 py-3 font-medium text-[var(--foreground)]">
                      <a href={e.url} target="_blank" rel="sponsored nofollow noopener noreferrer" className="hover:text-[var(--accent-text)] transition-colors">
                        {e.name}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-soft)]">{e.acoperire}</td>
                    <td className="px-4 py-3 text-[var(--accent-text)]">{e.pret_min}</td>
                    <td className="px-4 py-3 text-[var(--text-soft)]">{e.activare}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FAQ */}
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-5">Întrebări frecvente despre eSIM</h2>
          <div className="space-y-4 mb-14">
            {FAQ.map((item) => (
              <div key={item.q} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
                <h3 className="font-semibold text-[var(--foreground)] mb-2">{item.q}</h3>
                <p className="text-[var(--text-soft)] text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>

          {/* CTA + navlink */}
          <div className="bg-gradient-to-r from-[var(--background)]/30 to-[var(--background)]/30 border border-[var(--border)]/40 rounded-xl p-7 text-center mb-10">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Pregătit pentru următoarea călătorie?</h2>
            <p className="text-[var(--text-soft)] text-sm mb-5">Activează eSIM-ul înainte să pleci — 5 minute și ești conectat oriunde în lume.</p>
            <a
              href={LINK_AIRALO}
              target="_blank"
              rel="sponsored nofollow noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#ddf93c] hover:bg-[#ddf93c] text-[#0c1000] font-semibold px-7 py-3 rounded-xl text-sm transition-colors"
            >
              Cumpara eSIM pe Airalo &rarr;
            </a>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/calatorie" className="text-[var(--text-soft)] hover:text-[var(--accent-text)] transition-colors">Oferte Călătorie</Link>
            <span className="text-[var(--text-soft)]">•</span>
            <Link href="/vpn" className="text-[var(--text-soft)] hover:text-[var(--accent-text)] transition-colors">Cele mai bune VPN-uri</Link>
            <span className="text-[var(--text-soft)]">•</span>
            <Link href="/hosting" className="text-[var(--text-soft)] hover:text-[var(--accent-text)] transition-colors">Hosting ieftin</Link>
            <span className="text-[var(--text-soft)]">•</span>
            <Link href="/toate-magazinele" className="text-[var(--text-soft)] hover:text-[var(--accent-text)] transition-colors">Toate magazinele</Link>
          </div>
        </div>
      </div>
    </>
  );
}
