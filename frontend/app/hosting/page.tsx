import { Metadata } from "next";
import Link from "next/link";

import { linkPlatit } from "@/lib/linkPlatit";

// Adresele oficiale. Daca un furnizor devine partener, linkPlatit() ia linkul platit din output.json.
const LINK_HOSTINGER  = "https://www.hostinger.ro";
const LINK_SITEGROUND = "https://www.siteground.com";
const LINK_CLOUDWAYS  = "https://www.cloudways.com";

export const metadata: Metadata = {
  title: "Cel mai bun Hosting Romania 2026 — Hostinger vs SiteGround",
  description: "Comparăm Hostinger, SiteGround și Cloudways pentru site-uri românești în 2026: tipul de hosting, funcții, suport. Alege găzduirea web potrivită.",
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

// 07.10.2026: fara preturi scrise de mana (se schimba des, iar pagina nu afla) si fara superlative.
const HOSTING_LIST = [
  {
    rank: 1,
    name: "Hostinger",
    tagline: "Hosting pentru început și proiecte mici, cu panou simplu",
    badge: "Planuri pentru început",
    badgeColor: "bg-[#ddf93c] text-[#0c1000]",
    emoji: "🏆",
    url: LINK_HOSTINGER,
    tip: "Shared Hosting / WordPress",
    ideal: "Bloguri, site-uri mici, magazine online, portofolii",
    pros: [
      "Instalare WordPress cu un clic",
      "Servere LiteSpeed",
      "SSL gratuit inclus",
      "Garanție de uptime 99,9%",
      "Suport 24/7 prin chat",
      "Site și panou de control (hPanel) în română",
    ],
    cons: ["Resursele planurilor de bază ajung greu la trafic mare", "Backup zilnic doar pe planurile superioare"],
  },
  {
    rank: 2,
    name: "SiteGround",
    tagline: "Hosting gestionat, cu backup zilnic și unelte pentru dezvoltatori",
    badge: "Hosting gestionat",
    badgeColor: "bg-[#ddf93c] text-[#0c1000]",
    emoji: "⚡",
    url: LINK_SITEGROUND,
    tip: "Shared / Cloud Hosting",
    ideal: "Site-uri de firmă, WooCommerce, magazine cu trafic",
    pros: [
      "Backup zilnic automat pe toate planurile",
      "CDN inclus",
      "Staging (mediu de test) pe planurile GrowBig și GoGeek",
      "Firewall și protecție anti-bot",
      "Email inclus",
    ],
    cons: ["Mai scump decât Hostinger la planurile de bază", "Prețul crește mult la reînnoire"],
  },
  {
    rank: 3,
    name: "Cloudways",
    tagline: "Cloud hosting gestionat, pe infrastructura pe care o alegi tu",
    badge: "Cloud gestionat",
    badgeColor: "bg-[#ddf93c] text-[#0c1000]",
    emoji: "☁️",
    url: LINK_CLOUDWAYS,
    tip: "Managed Cloud Hosting",
    ideal: "Agenții, magazine cu trafic mare, developeri",
    pros: [
      "Alegi furnizorul: DigitalOcean, Vultr, Linode, AWS sau Google Cloud",
      "Scalezi resursele din panou",
      "Backup automat",
      "Plătești lunar, după consum",
    ],
    cons: ["Mai scump decât hostingul shared", "Cere cunoștințe tehnice de bază"],
  },
];

const TIPURI_HOSTING = [
  { emoji: "🏠", titlu: "Shared Hosting", desc: "Împarți serverul cu alți utilizatori. Cel mai ieftin tip, bun pentru site-uri noi și bloguri.", recomandat: "Început, blog, portofoliu" },
  { emoji: "⚡", titlu: "VPS Hosting", desc: "Server virtual cu resurse doar pentru tine. Mai scump, mai flexibil — util când traficul crește.", recomandat: "Magazine online, SaaS" },
  { emoji: "☁️", titlu: "Cloud Hosting", desc: "Resurse pe care le mărești sau le micșorezi după nevoie; plătești după consum.", recomandat: "Trafic mare, agenții" },
  { emoji: "📦", titlu: "WordPress Hosting", desc: "Hosting configurat pentru WordPress: instalare automată, cache, actualizări.", recomandat: "Site-uri WordPress" },
];

const FAQ = [
  { q: "Cât costă un hosting bun pentru România?", a: "Hostingul shared pornește de la câțiva euro pe lună la planurile pe mai mulți ani, iar prețul crește la reînnoire. Pentru un blog sau un site mic ajunge un plan shared; pentru un magazin online sau un site de firmă, un plan gestionat sau cloud." },
  { q: "Hosting românesc sau internațional?", a: "Contează mai mult unde sunt serverele decât țara firmei. Hostinger, SiteGround și Cloudways au servere în Europa, aproape de România. Hostinger are site și panou în română." },
  { q: "Hosting ieftin vs hosting scump — ce diferență e?", a: "Resursele serverului, viteza, backupul, securitatea și suportul. Planurile mai scumpe au de obicei backup zilnic și resurse dedicate." },
  { q: "WordPress are nevoie de hosting special?", a: "Nu obligatoriu. Un hosting cu cache la nivel de server (de exemplu LiteSpeed) ajută WordPress să se încarce mai repede. Hostinger are instalare WordPress cu un clic." },
  { q: "Pot muta site-ul la un hosting nou gratuit?", a: "Da, la Hostinger și la SiteGround (la SiteGround, pentru WordPress, prin pluginul lor de migrare). Verifică pe site condițiile planului ales." },
  { q: "Ce e SSL și am nevoie de el?", a: "SSL e certificatul care pune 'https' și lacătul în bara de adrese. Toți cei trei îl includ gratuit. Fără SSL, browserele marchează site-ul ca nesigur, iar Google folosește HTTPS ca semnal de clasare." },
];

export default function HostingPage() {
  // Disclaimerul spune adevarul despre linkurile de AZI: platite doar daca output.json are linkul platit.
  const arePlatite = HOSTING_LIST.some(h => linkPlatit(h.url) !== h.url);
  return (
    <div className="min-h-screen bg-[#06080b]">
      {/* Hero */}
      <section className="relative bg-[#06080b] border-b border-[#1f2329] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(13,148,136,0.08) 0%, transparent 65%)" }} />
        <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-10 text-center">
          <nav className="flex justify-center gap-2 text-xs text-[#9399a0] mb-8">
            <Link href="/" className="hover:text-[#c9ced5]">AmCupon.ro</Link>
            <span>/</span>
            <span className="text-[#c9ced5]">Cel mai bun Hosting Romania</span>
          </nav>
          <div className="text-5xl mb-4">🌐</div>
          <h1 className="text-4xl md:text-5xl font-black text-[#ffffff] mb-4">
            Cel mai bun <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #ddf93c, #ddf93c)" }}>Hosting Romania</span> 2026
          </h1>
          <p className="text-[#c9ced5] text-lg max-w-2xl mx-auto mb-6">
            Am comparat trei hosteri populari pentru site-uri românești, din ce publică fiecare: tipul de hosting, funcțiile și suportul. Prețurile se schimbă des — le vezi actualizate pe site-ul lor.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-[#c9ced5]">
            <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Revizuit în octombrie 2026</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Hostinger are site în română</span>
          </div>
        </div>
      </section>

      {/* Tipuri de hosting */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-xl font-black text-[#ffffff] mb-5">Ce tip de hosting ai nevoie?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TIPURI_HOSTING.map((t, i) => (
            <div key={i} className="bg-[#14181c] border border-[#1f2329] rounded-xl p-4">
              <div className="text-2xl mb-2">{t.emoji}</div>
              <h3 className="text-sm font-bold text-[#ffffff] mb-1">{t.titlu}</h3>
              <p className="text-xs text-[#c9ced5] mb-2">{t.desc}</p>
              <p className="text-[10px] text-[#c3dd2c] font-bold">Recomandat: {t.recomandat}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparatie hosteri */}
      <section className="max-w-5xl mx-auto px-4 py-8 border-t border-[#1f2329]">
        <h2 className="text-2xl font-black text-[#ffffff] mb-3">Top 3 Hosteri pentru Romania</h2>
        <div className="bg-[#14181c] border border-[#1f2329] rounded-xl p-4 mb-6">
          <p className="text-[#c9ced5] text-sm text-center">
            <strong className="text-[#ffffff]">Concluzia scurtă:</strong> Începi un site? <span className="text-[#c3dd2c] font-bold">Hostinger</span> are planuri de început și instalare WordPress cu un clic. Ai deja trafic? <span className="text-[#ddf93c] font-bold">SiteGround</span>, gestionat. Vrei cloud și scalare? <span className="text-[#c3dd2c] font-bold">Cloudways</span>.
          </p>
        </div>

        <div className="space-y-6">
          {HOSTING_LIST.map((h) => (
            <div key={h.name} className={`bg-[#14181c] border rounded-xl p-6 ${h.rank === 1 ? "border-[#ddf93c]/40 shadow-lg shadow-[#ddf93c]/10" : "border-[#1f2329]"}`}>
              <div className="flex flex-col md:flex-row md:items-start gap-5">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{h.emoji}</span>
                    <h2 className="text-xl font-black text-[#ffffff]">#{h.rank} {h.name}</h2>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${h.badgeColor}`}>{h.badge}</span>
                  </div>
                  <p className="text-[#c9ced5] text-sm mb-1">{h.tagline}</p>
                  <p className="text-xs text-[#9399a0] mb-4">Tip: {h.tip} | Ideal pentru: {h.ideal}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-emerald-400 font-bold mb-2">AVANTAJE</p>
                      <ul className="space-y-1">
                        {h.pros.map((p, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-[#c9ced5]">
                            <span className="text-emerald-400 shrink-0">+</span>{p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs text-red-400 font-bold mb-2">DEZAVANTAJE</p>
                      <ul className="space-y-1">
                        {h.cons.map((c, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-[#c9ced5]">
                            <span className="text-red-400 shrink-0">-</span>{c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="md:w-44 flex flex-col items-center gap-3 shrink-0">
                  <a href={linkPlatit(h.url)} target="_blank" rel="sponsored noopener noreferrer"
                    className={`w-full text-center py-3 px-4 rounded-xl font-black text-sm transition-all hover:-translate-y-0.5 shadow-lg ${h.rank === 1 ? "bg-[#ddf93c] hover:bg-[#c3dd2c] text-[#0c1000] shadow-[#ddf93c]/20" : "bg-[#2a2f36] hover:bg-[#3a4048] text-[#ffffff]"}`}>
                    Vezi {h.name} →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-5xl mx-auto px-4 py-10 border-t border-[#1f2329]">
        <h2 className="text-2xl font-black text-[#ffffff] mb-6">Întrebări frecvente despre hosting</h2>
        <div className="space-y-4">
          {FAQ.map((item, i) => (
            <div key={i} className="bg-[#14181c] border border-[#1f2329] rounded-xl p-5">
              <h3 className="font-bold text-[#ffffff] mb-2">{item.q}</h3>
              <p className="text-[#c9ced5] text-sm">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="bg-gradient-to-r from-[#ddf93c]/40 to-[#ddf93c]/30 border border-[#ddf93c]/30 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-black text-[#ffffff] mb-3">Lansează-ți site-ul</h2>
          <p className="text-[#c9ced5] mb-6 text-sm max-w-xl mx-auto">Hostinger are planuri de început și instalare WordPress cu un clic. Domeniul gratuit vine doar cu unele planuri — verifică pe site.</p>
          <a href={linkPlatit(LINK_HOSTINGER)} target="_blank" rel="sponsored noopener noreferrer"
            className="inline-block bg-[#ddf93c] hover:bg-[#ddf93c] text-[#0c1000] font-black px-10 py-4 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-[#ddf93c]/20 text-base">
            Vezi planurile Hostinger →
          </a>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 pb-8">
        <p className="text-[#9399a0] text-xs text-center">
          {arePlatite
            ? "Unele linkuri de pe această pagină sunt linkuri de afiliat. Dacă faci o achiziție, AmCupon.ro primește un comision, fără cost suplimentar pentru tine."
            : "Nu avem parteneriat cu acești furnizori: linkurile duc direct pe site-ul lor."}{" "}
          Descrierile se bazează pe ce publică fiecare furnizor; prețurile și condițiile le vezi pe site-ul lor.
        </p>
      </div>
    </div>
  );
}
