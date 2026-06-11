import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cel mai bun Hosting Romania 2026 — Hostinger vs SiteGround | AmCupon.ro",
  description: "Comparam cele mai bune servicii de hosting pentru Romania in 2026. Hostinger, SiteGround, Cloudways — preturi, viteza, suport. Alege gazduirea web potrivita.",
  keywords: ["cel mai bun hosting romania", "hostinger parere", "gazduire web ieftina", "hosting wordpress romania", "hosting ieftin 2026", "siteground parere"],
  alternates: { canonical: "https://amcupon.ro/hosting" },
  openGraph: {
    title: "Cel mai bun Hosting Romania 2026 | AmCupon.ro",
    description: "Comparatie Hostinger vs SiteGround vs Cloudways. Ghid complet pentru alegerea hostingului perfect in Romania.",
    url: "https://amcupon.ro/hosting",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

const HOSTING_LIST = [
  {
    rank: 1,
    name: "Hostinger",
    tagline: "Cel mai accesibil hosting premium — perfect pentru inceput si proiecte mici",
    badge: "Recomandat #1",
    badgeColor: "bg-violet-600",
    emoji: "🏆",
    pret_luna: "1.99€",
    pret_nota: "plan Starter 48 luni",
    rating: "9.6",
    url: "https://hostinger.com",
    // ACTUALIZARE: inlocuieste cu linkul tau de afiliat Hostinger (60% comision) dupa ce aplici la hostinger.com/affiliates
    tip: "Shared Hosting / WordPress",
    ideal: "Bloguri, site-uri mici, magazine online, portofolii",
    pros: [
      "Pret excelent — de la 1.99€/luna",
      "WordPress in 1 click (LiteSpeed)",
      "SSL gratuit inclus",
      "Domeniu .com gratuit 1 an",
      "Uptime 99.9% garantat",
      "Suport chat 24/7 in romana",
      "Panou de control cPanel/hPanel simplu",
    ],
    cons: ["Performanta mai mica la trafic mare", "Backup zilnic doar pe planuri superioare"],
  },
  {
    rank: 2,
    name: "SiteGround",
    tagline: "Hosting profesional cu suport top si viteza exceptionala",
    badge: "Cel mai profesional",
    badgeColor: "bg-orange-600",
    emoji: "⚡",
    pret_luna: "3.99€",
    pret_nota: "plan StartUp (primul an)",
    rating: "9.3",
    url: "https://siteground.com",
    // ACTUALIZARE: inlocuieste cu linkul tau de afiliat SiteGround (~75$ per signup) dupa ce aplici la siteground.com/web-hosting/affiliate.htm
    tip: "Shared / Cloud Hosting",
    ideal: "Site-uri de business, WooCommerce, magazine cu trafic",
    pros: [
      "Viteza mare (SSD NVMe + CDN inclus)",
      "Backup zilnic automat pe toate planurile",
      "Staging environment (testezi inainte de live)",
      "Security AI — blocheaza atacuri automat",
      "Suport premium cu timp de raspuns rapid",
      "Email gratuit inclus",
    ],
    cons: ["Mai scump decat Hostinger", "Pretul creste mult dupa primul an"],
  },
  {
    rank: 3,
    name: "Cloudways",
    tagline: "Cloud hosting gestionat — puterea AWS/Google Cloud fara complexitate",
    badge: "Cel mai scalabil",
    badgeColor: "bg-blue-600",
    emoji: "☁️",
    pret_luna: "11€",
    pret_nota: "plan DigitalOcean 1GB",
    rating: "9.0",
    url: "https://cloudways.com",
    // ACTUALIZARE: inlocuieste cu linkul tau de afiliat Cloudways dupa ce aplici la cloudways.com/affiliate
    tip: "Managed Cloud Hosting",
    ideal: "Agentii, magazine cu trafic mare, developeri",
    pros: [
      "Infrastructura AWS, Google Cloud, DigitalOcean",
      "Performanta exceptional de mare",
      "Scalare instant la trafic",
      "Backup automat la cloud",
      "Suport de la echipe tehnice specializate",
    ],
    cons: ["Cel mai scump din lista", "Necesita cunostinte tehnice de baza"],
  },
];

const TIPURI_HOSTING = [
  { emoji: "🏠", titlu: "Shared Hosting", desc: "Imparti serverul cu alti utilizatori. Cel mai ieftin, bun pentru site-uri noi si bloguri. Hostinger e liderul acestei categorii.", recomandat: "Inceput, blog, portofoliu" },
  { emoji: "⚡", titlu: "VPS Hosting", desc: "Server virtual dedicat tie. Mai scump dar mult mai rapid si flexibil. Necesar cand traficul creste.", recomandat: "Magazine online, SaaS" },
  { emoji: "☁️", titlu: "Cloud Hosting", desc: "Resurse din mai multi servere simultan. Scalare automata. Platesti cat consumi. Cloudways e cel mai bun.", recomandat: "Trafic mare, agentii" },
  { emoji: "📦", titlu: "WordPress Hosting", desc: "Hosting optimizat specific pentru WordPress. Configurat automat, cache, updates automate.", recomandat: "Site-uri WordPress" },
];

const FAQ = [
  { q: "Cat costa un hosting bun pentru Romania?", a: "Hostinger ofera planuri de la 1.99€/luna pentru shared hosting. SiteGround de la 3.99€/luna. Pentru un blog sau site mic, Hostinger e suficient. Pentru un magazin online sau site de business, SiteGround sau Cloudways." },
  { q: "Hosting romanesc sau international?", a: "International e mai bun in 2026. Hostinger, SiteGround si Cloudways au servere in Europa (Frankfurt, Londra, Amsterdam) cu latenta excelenta pentru Romania. Suportul Hostinger e disponibil in romana." },
  { q: "Hosting ieftin vs hosting scump — ce diferenta e?", a: "Viteza de incarcare, uptime (disponibilitate), securitate, suport si resurse server. Un hosting scump e de 3-10x mai rapid si are backup zilnic inclus. Pentru un site de business, viteza = bani." },
  { q: "WordPress are nevoie de hosting special?", a: "Nu obligatoriu, dar un hosting WordPress optimizat (LiteSpeed + cache) incarca site-ul de 2-3x mai rapid. Hostinger are WordPress in 1 click, complet optimizat." },
  { q: "Pot migra site-ul la un hosting nou gratuit?", a: "Da. Hostinger si SiteGround ofera migrare gratuita a site-ului. Trimiti cererea, ei se ocupa de tot — zero downtime in mod normal." },
  { q: "Ce e SSL si am nevoie de el?", a: "SSL e certificatul care pune 'https' si catel in bara de adrese — esential pentru SEO si pentru increderea utilizatorilor. Toti hosteri din lista il includ GRATUIT. Fara SSL esti penalizat de Google." },
];

export default function HostingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="relative bg-slate-950 border-b border-slate-800 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139,92,246,0.08) 0%, transparent 65%)" }} />
        <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-10 text-center">
          <nav className="flex justify-center gap-2 text-xs text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300">AmCupon.ro</Link>
            <span>/</span>
            <span className="text-slate-300">Cel mai bun Hosting Romania</span>
          </nav>
          <div className="text-5xl mb-4">🌐</div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Cel mai bun <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #8b5cf6, #a78bfa)" }}>Hosting Romania</span> 2026
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-6">
            Am comparat cei mai populari hosteri pentru site-uri romanesti. Preturi reale, teste de viteza, calitate suport — tot ce trebuie sa stii.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Actualizat iunie 2026</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Preturi verificate</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Suport in romana</span>
          </div>
        </div>
      </section>

      {/* Tipuri de hosting */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-xl font-black text-white mb-5">Ce tip de hosting ai nevoie?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TIPURI_HOSTING.map((t, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-2xl mb-2">{t.emoji}</div>
              <h3 className="text-sm font-bold text-white mb-1">{t.titlu}</h3>
              <p className="text-xs text-slate-400 mb-2">{t.desc}</p>
              <p className="text-[10px] text-violet-400 font-bold">Recomandat: {t.recomandat}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparatie hosteri */}
      <section className="max-w-5xl mx-auto px-4 py-8 border-t border-slate-800">
        <h2 className="text-2xl font-black text-white mb-3">Top 3 Hosteri pentru Romania</h2>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
          <p className="text-slate-300 text-sm text-center">
            <strong className="text-white">Concluzia scurta:</strong> Incepi un site? Alege <span className="text-violet-400 font-bold">Hostinger</span> — cel mai ieftin, cel mai usor. Ai deja trafic si vrei performanta? <span className="text-orange-400 font-bold">SiteGround</span>. Vrei cloud si scalare? <span className="text-blue-400 font-bold">Cloudways</span>.
          </p>
        </div>

        <div className="space-y-6">
          {HOSTING_LIST.map((h) => (
            <div key={h.name} className={`bg-slate-900 border rounded-2xl p-6 ${h.rank === 1 ? "border-violet-500/40 shadow-lg shadow-violet-500/10" : "border-slate-800"}`}>
              {h.rank === 1 && (
                <div className="text-xs text-violet-400 font-bold mb-3">⭐ CEL MAI RECOMANDAT PENTRU INCEPUT</div>
              )}
              <div className="flex flex-col md:flex-row md:items-start gap-5">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{h.emoji}</span>
                    <h2 className="text-xl font-black text-white">#{h.rank} {h.name}</h2>
                    <span className={`text-[10px] font-black text-white px-2 py-0.5 rounded-full ${h.badgeColor}`}>{h.badge}</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-1">{h.tagline}</p>
                  <p className="text-xs text-slate-500 mb-4">Tip: {h.tip} | Ideal pentru: {h.ideal}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-emerald-400 font-bold mb-2">AVANTAJE</p>
                      <ul className="space-y-1">
                        {h.pros.map((p, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                            <span className="text-emerald-400 shrink-0">+</span>{p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs text-red-400 font-bold mb-2">DEZAVANTAJE</p>
                      <ul className="space-y-1">
                        {h.cons.map((c, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                            <span className="text-red-400 shrink-0">-</span>{c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="md:w-44 flex flex-col items-center gap-3 shrink-0">
                  <div className="text-center">
                    <div className="text-3xl font-black text-white">{h.pret_luna}</div>
                    <div className="text-xs text-slate-500">/luna ({h.pret_nota})</div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <span className="text-yellow-400 text-sm">★</span>
                      <span className="text-white font-bold text-sm">{h.rating}</span>
                      <span className="text-slate-500 text-xs">/10</span>
                    </div>
                  </div>
                  <a href={h.url} target="_blank" rel="sponsored noopener noreferrer"
                    className={`w-full text-center py-3 px-4 rounded-xl font-black text-sm text-white transition-all hover:-translate-y-0.5 shadow-lg ${h.rank === 1 ? "bg-violet-600 hover:bg-violet-500 shadow-violet-500/20" : "bg-slate-700 hover:bg-slate-600"}`}>
                    Incearca {h.name} →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-5xl mx-auto px-4 py-10 border-t border-slate-800">
        <h2 className="text-2xl font-black text-white mb-6">Intrebari frecvente despre hosting</h2>
        <div className="space-y-4">
          {FAQ.map((item, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="font-bold text-white mb-2">{item.q}</h3>
              <p className="text-slate-400 text-sm">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="bg-gradient-to-r from-violet-950/40 to-blue-950/30 border border-violet-800/30 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-black text-white mb-3">Lanseaza-ti site-ul azi</h2>
          <p className="text-slate-400 mb-6 text-sm max-w-xl mx-auto">Hostinger e ales de peste 3 milioane de utilizatori din toata lumea. Setup in 5 minute, domeniu gratuit inclus.</p>
          <a href="https://hostinger.com" target="_blank" rel="sponsored noopener noreferrer"
            className="inline-block bg-violet-600 hover:bg-violet-500 text-white font-black px-10 py-4 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-violet-500/20 text-base">
            Incepe cu Hostinger — de la 1.99€/luna →
          </a>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 pb-8">
        <p className="text-slate-600 text-xs text-center">
          Unele linkuri de pe aceasta pagina sunt linkuri de afiliat. Daca faci o achizitie, AmCupon.ro primeste un comision fara cost suplimentar pentru tine. Recomandam doar servicii pe care le-am testat sau verificat independent.
        </p>
      </div>
    </div>
  );
}
