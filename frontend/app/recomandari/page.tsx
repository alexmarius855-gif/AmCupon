import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Recomandari Premium — VPN, Hosting, Freelancing, SEO Tools | AmCupon.ro",
  description: "Servicii online testate si recomandate de AmCupon.ro. VPN sigur, hosting rapid, unelte SEO, freelancing, design — tot ce ai nevoie pentru a castiga bani online.",
  keywords: ["recomandari servicii online", "nordvpn romania", "hostinger parere", "fiverr romania", "semrush pret", "canva pro"],
  alternates: { canonical: "https://amcupon.ro/recomandari" },
  openGraph: {
    title: "Recomandari Premium AmCupon.ro — VPN, Hosting, SEO, Freelancing",
    description: "Servicii online testate si recomandate. Tot ce ai nevoie pentru a lucra, castiga si naviga in siguranta online.",
    url: "https://amcupon.ro/recomandari",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

// NOTA TEHNICA: URL-urile marcate cu [AFILIAT] sunt linkuri de afiliat.
// Inlocuieste placeholder-urile cu ID-urile tale reale dupa ce aplici la fiecare program.
// Pana atunci, linkurile duc direct la site-ul serviciului (functional pentru utilizatori).

const CATEGORII = [
  {
    titlu: "VPN — Navigare Sigura",
    emoji: "🔒",
    slug: "/vpn",
    desc: "Protejeaza-ti datele online si acceseaza continut din orice tara. Esential pentru Wi-Fi public, streaming si confidentialitate.",
    servicii: [
      {
        name: "NordVPN",
        tagline: "Cel mai popular VPN din lume — 6000+ servere in 111 tari",
        pret: "de la 2.99€/luna",
        comision: "40% recurring",
        badge: "Recomandat",
        badgeColor: "bg-[#ddf93c]",
        program: "partners.nordvpn.com",
        url: "https://nordvpn.com",
        // ACTUALIZARE: https://go.nordvpn.net/aff_c?offer_id=15&aff_id=TU_ID_NORDVPN
        beneficii: ["6000+ servere in 111 tari", "Viteza mare NordLynx", "Netflix, HBO, Disney+ deblocat", "10 dispozitive simultan", "Garantie 30 zile"],
      },
      {
        name: "Surfshark",
        tagline: "Dispozitive nelimitate — cel mai bun raport calitate/pret",
        pret: "de la 2.39€/luna",
        comision: "40% recurring",
        badge: "Dispozitive nelimitate",
        badgeColor: "bg-[#ddf93c]",
        program: "impact.com (Surfshark)",
        url: "https://surfshark.com",
        // ACTUALIZARE: https://get.surfshark.net/aff_c?offer_id=926&aff_id=TU_ID_SURFSHARK
        beneficii: ["Dispozitive NELIMITATE", "CleanWeb — blocheaza reclame", "Camouflage Mode", "MultiHop", "Garantie 30 zile"],
      },
    ],
  },
  {
    titlu: "Hosting — Gazduire Web",
    emoji: "🌐",
    slug: "/hosting",
    desc: "Ai un site sau vrei sa lansezi unul? Alege un hosting rapid si de incredere — diferenta dintre un site lent si unul rapid.",
    servicii: [
      {
        name: "Hostinger",
        tagline: "Cel mai accesibil hosting premium — perfect pentru inceput",
        pret: "de la 1.99€/luna",
        comision: "60% din prima achizitie",
        badge: "Cel mai accesibil",
        badgeColor: "bg-[#ddf93c]",
        program: "hostinger.com/affiliates",
        url: "https://hostinger.com",
        // ACTUALIZARE: https://www.hostinger.com/partners/TU_ID_HOSTINGER
        beneficii: ["WordPress in 1 click", "SSL gratuit", "Domeniu gratuit 1 an", "Uptime 99.9%", "Suport in romana 24/7"],
      },
      {
        name: "SiteGround",
        tagline: "Hosting profesional cu suport exceptional si viteza maxima",
        pret: "de la 3.99€/luna",
        comision: "~75$ per signup",
        badge: "Performanta top",
        badgeColor: "bg-[#ddf93c]",
        program: "siteground.com/affiliates",
        url: "https://siteground.com",
        // ACTUALIZARE: https://www.siteground.com/go/TU_ID_SITEGROUND
        beneficii: ["Viteza mare SSD NVMe + CDN", "Backup zilnic automat", "Staging environment", "Security AI", "Suport premium"],
      },
    ],
  },
  {
    titlu: "SEO & Marketing Digital",
    emoji: "📊",
    slug: null,
    desc: "Unelte profesionale pentru SEO, cercetare cuvinte cheie, analiza concurenta si cresterea traficului organic.",
    servicii: [
      {
        name: "Semrush",
        tagline: "Cea mai completa unealta SEO — folosita de 10 milioane de profesionisti",
        pret: "de la 99$/luna",
        comision: "200$ per vanzare + 10$ per lead",
        badge: "Recomandat #1",
        badgeColor: "bg-[#ddf93c]",
        program: "semrush.com/lp/inter-affiliate",
        url: "https://semrush.com",
        // ACTUALIZARE: link din programul Impact al Semrush
        beneficii: ["Cercetare cuvinte cheie", "Analiza backlink-uri", "Audit site SEO", "Monitorizare pozitii Google", "Analiza concurenta"],
      },
      {
        name: "Ahrefs",
        tagline: "Cel mai bun instrument pentru analiza link-uri si cercetare SEO",
        pret: "de la 99$/luna",
        comision: "program selectiv — aplica direct",
        badge: "Standard industrie",
        badgeColor: "bg-[#ddf93c]",
        program: "ahrefs.com (program intern)",
        url: "https://ahrefs.com",
        beneficii: ["Index backlink-uri masiv", "Content Explorer unic", "Site Explorer detaliat", "Keywords Explorer avansat", "Rank Tracker precis"],
      },
    ],
  },
  {
    titlu: "Design & Creatie",
    emoji: "🎨",
    slug: null,
    desc: "Unelte de design accesibile pentru oricine — de la postari social media pana la prezentari profesionale.",
    servicii: [
      {
        name: "Canva Pro",
        tagline: "Design profesional fara experienta — ales de 150 milioane de utilizatori",
        pret: "~13€/luna",
        comision: "36$ per conversie Pro",
        badge: "Cel mai usor",
        badgeColor: "bg-[#ddf93c]",
        program: "canva.com/affiliates",
        url: "https://canva.com",
        // ACTUALIZARE: link din programul Canva Affiliates
        beneficii: ["1000+ template-uri premium", "Fonturi si imagini Pro", "Programare social media", "Brand Kit personalizat", "Export fara watermark"],
      },
      {
        name: "Adobe Creative Cloud",
        tagline: "Suite profesionala completa — Photoshop, Illustrator, Premiere, mai mult",
        pret: "de la 59.99€/luna",
        comision: "85€ per abonament",
        badge: "Pro standard",
        badgeColor: "bg-red-600",
        program: "adobe.com/affiliates",
        url: "https://adobe.com/creativecloud",
        // ACTUALIZARE: link din programul Adobe Affiliates (Impact)
        beneficii: ["Photoshop + Illustrator + Premiere", "100GB cloud storage", "Adobe Fonts inclus", "Actualizari permanente", "Suport prioritar"],
      },
    ],
  },
  {
    titlu: "Freelancing & Venituri Online",
    emoji: "💼",
    slug: null,
    desc: "Platforme unde poti castiga bani online sau gasi freelanceri pentru proiectele tale.",
    servicii: [
      {
        name: "Fiverr",
        tagline: "Cea mai mare platforma de freelancing — angajezi sau castigi din servicii",
        pret: "comision 20% Fiverr",
        comision: "150$ CPA per cumparator",
        badge: "Foarte bun",
        badgeColor: "bg-green-600",
        program: "affiliates.fiverr.com",
        url: "https://fiverr.com",
        // ACTUALIZARE: link din programul Fiverr Affiliates (aprobare instantanee)
        beneficii: ["Milioane de servicii de la 5$", "Freelanceri din 190 tari", "Garantie ramburs", "Plata sigura prin escrow", "Logo, web, SEO, video, scris"],
      },
      {
        name: "Coursera",
        tagline: "Cursuri online certificate de la universitati de top din lume",
        pret: "de la 49$/luna (Plus)",
        comision: "45% din abonament",
        badge: "Certificari globale",
        badgeColor: "bg-[#ddf93c]",
        program: "coursera.org/affiliates",
        url: "https://coursera.org",
        // ACTUALIZARE: link din programul Coursera Affiliates (Impact)
        beneficii: ["Cursuri de la Stanford, Google, Meta", "Certificate recunoscute mondial", "Specializari complete", "7 zile trial gratuit", "Continut in romana disponibil"],
      },
    ],
  },
  {
    titlu: "Travel — Rezervari si Vacante",
    emoji: "✈️",
    slug: "/calatorie",
    desc: "Cel mai bun pret pentru cazare, zboruri si masini de inchiriat. Compara inainte de a rezerva.",
    servicii: [
      {
        name: "Booking.com",
        tagline: "Cea mai mare platforma de cazare din lume — 1 milion+ proprietati",
        pret: "fara taxe extra",
        comision: "4% din valoarea rezervarii",
        badge: "Cele mai multe optiuni",
        badgeColor: "bg-[#ddf93c]",
        program: "booking.com/affiliate-partner",
        url: "https://booking.com",
        // ACTUALIZARE: https://www.booking.com/index.html?aid=TU_ID_BOOKING
        beneficii: ["1M+ proprietati in 220 tari", "Anulare gratuita la multe optiuni", "Genius — discount 10-20%", "Plata la hotel (nu in avans)", "App mobila excelenta"],
      },
      {
        name: "Rentalcars",
        tagline: "Compara masini de inchiriat din toata lumea — cel mai mic pret garantat",
        pret: "fara taxe ascunse",
        comision: "~6% din rezervare",
        badge: "Masini de inchiriat",
        badgeColor: "bg-green-600",
        program: "rentalcars.com/affiliates",
        url: "https://rentalcars.com",
        // ACTUALIZARE: https://www.rentalcars.com/?affiliateCode=TU_COD_RENTALCARS
        beneficii: ["60.000+ puncte de ridicare", "Anulare gratuita", "Garantia pretului mic", "Asigurare inclusa", "Comparare instant"],
      },
    ],
  },
];

export default function RecomandariPage() {
  return (
    <div className="min-h-screen bg-[#06080b]">
      {/* Hero */}
      <section className="relative bg-[#06080b] border-b border-[#1f2329] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(13,148,136,0.08) 0%, transparent 65%)" }} />
        <div className="relative max-w-5xl mx-auto px-4 pt-12 pb-12 text-center">
          <nav className="flex justify-center gap-2 text-xs text-[#9399a0] mb-8">
            <Link href="/" className="hover:text-[#c9ced5]">AmCupon.ro</Link>
            <span>/</span>
            <span className="text-[#c9ced5]">Recomandari Premium</span>
          </nav>
          <div className="text-5xl mb-5">⭐</div>
          <h1 className="text-4xl md:text-5xl font-black text-[#ffffff] mb-4">
            Servicii <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #ddf93c, #ddf93c)" }}>Recomandate</span>
          </h1>
          <p className="text-[#c9ced5] text-lg max-w-2xl mx-auto mb-8">
            VPN, hosting, SEO tools, freelancing si travel — servicii testate si recomandate de echipa AmCupon.ro. Alege ce ti se potriveste.
          </p>
          {/* Jump links */}
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORII.map((c, i) => (
              <a key={i} href={`#cat-${i}`}
                className="text-xs bg-[#1f2329] hover:bg-[#2a2f36] text-[#c9ced5] px-3 py-1.5 rounded-full border border-[#2a2f36] transition-colors">
                {c.emoji} {c.titlu.split(" — ")[0]}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Categorii */}
      {CATEGORII.map((cat, ci) => (
        <section key={ci} id={`cat-${ci}`} className="max-w-5xl mx-auto px-4 py-10 border-b border-[#1f2329]/50 last:border-b-0">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-[#ffffff] flex items-center gap-3">
                <span className="text-3xl">{cat.emoji}</span>
                {cat.titlu}
              </h2>
              <p className="text-[#c9ced5] mt-1 text-sm max-w-2xl">{cat.desc}</p>
            </div>
            {cat.slug && (
              <Link href={cat.slug}
                className="text-xs text-[#ddf93c] hover:text-[#c3dd2c] border border-[#ddf93c]/30 hover:border-[#ddf93c]/50 px-3 py-1.5 rounded-lg transition-all shrink-0 ml-4">
                Ghid complet →
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {cat.servicii.map((s, si) => (
              <div key={si} className="bg-[#14181c] border border-[#1f2329] hover:border-[#ddf93c]/30 rounded-xl p-6 flex flex-col gap-4 transition-all group">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl font-black text-[#ffffff]">{s.name}</span>
                      <span className={`text-[10px] font-black text-[#ffffff] px-2 py-0.5 rounded-full ${s.badgeColor}`}>{s.badge}</span>
                    </div>
                    <p className="text-[#c9ced5] text-sm">{s.tagline}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[#ddf93c] font-black text-sm">{s.pret}</div>
                  </div>
                </div>

                <ul className="space-y-1.5">
                  {s.beneficii.map((b, bi) => (
                    <li key={bi} className="flex items-start gap-2 text-sm text-[#c9ced5]">
                      <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex flex-col gap-2">
                  <a href={s.url} target="_blank" rel="sponsored noopener noreferrer"
                    className="bg-[#ddf93c] hover:bg-[#ddf93c] text-[#0c1000] font-black px-5 py-3 rounded-xl text-sm transition-all text-center shadow-lg shadow-[#ddf93c]/20 hover:-translate-y-0.5 duration-200">
                    Incearca {s.name} →
                  </a>
                  <p className="text-[10px] text-[#9399a0] text-center">Program afiliere: {s.program}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Disclaimer */}
      <section className="max-w-5xl mx-auto px-4 pb-12 pt-4">
        <div className="bg-[#14181c]/50 border border-[#1f2329] rounded-xl p-5 text-center">
          <p className="text-[#9399a0] text-xs">
            Unele linkuri de pe aceasta pagina sunt linkuri de afiliat — daca faci o achizitie, AmCupon.ro primeste un comision, fara niciun cost suplimentar pentru tine.
            Am comparat public preturile si specificatiile serviciilor recomandate. Comisioanele afisate nu sunt garantate — variaza in functie de programul fiecarui partener.
          </p>
        </div>
      </section>
    </div>
  );
}
