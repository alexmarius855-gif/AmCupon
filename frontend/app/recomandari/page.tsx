import { Metadata } from "next";
import Link from "next/link";
import { linkPlatit } from "@/lib/linkPlatit";

export const metadata: Metadata = {
  title: "Recomandari Premium — VPN, Hosting, Freelancing, SEO Tools",
  description: "Servicii online recomandate de AmCupon.ro, alese după prețurile și condițiile publicate: VPN, hosting, unelte SEO, design, freelancing, travel.",
  keywords: ["recomandari servicii online", "nordvpn romania", "hostinger parere", "fiverr romania", "semrush pret", "canva pro"],
  alternates: { canonical: "https://amcupon.ro/recomandari" },
  openGraph: {
    title: "Recomandari Premium AmCupon.ro — VPN, Hosting, SEO, Freelancing",
    description: "Servicii online recomandate: VPN, hosting, unelte SEO, design, freelancing și travel.",
    url: "https://amcupon.ro/recomandari",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

// Adresele oficiale; linkul platit vine din output.json prin linkPlatit() (NordVPN, Surfshark).
// 07.10.2026: fara preturi scrise de mana (se schimba, iar pagina nu afla) si fara superlative.
const CATEGORII = [
  {
    titlu: "VPN — Navigare Sigura",
    emoji: "🔒",
    slug: "/vpn",
    desc: "Conexiune criptată pe Wi-Fi public, mai multă confidențialitate și acces la servere din alte țări.",
    servicii: [
      {
        name: "NordVPN",
        tagline: "VPN cu protocolul NordLynx și blocare de reclame și malware",
        badge: "VPN + blocare reclame",
        url: "https://nordvpn.com",
        beneficii: ["Protocolul NordLynx", "Threat Protection — blochează reclame și site-uri periculoase", "Până la 10 dispozitive simultan", "Politică no-logs verificată de auditori externi", "Garanție de rambursare 30 de zile"],
      },
      {
        name: "Surfshark",
        tagline: "VPN cu dispozitive nelimitate, pe un singur abonament",
        badge: "Dispozitive nelimitate",
        url: "https://surfshark.com",
        beneficii: ["Dispozitive nelimitate", "CleanWeb — blochează reclame și trackere", "Camouflage Mode", "MultiHop — conexiune prin două țări", "Garanție de rambursare 30 de zile"],
      },
    ],
  },
  {
    titlu: "Hosting — Gazduire Web",
    emoji: "🌐",
    slug: "/hosting",
    desc: "Ai un site sau vrei să lansezi unul? Hostingul decide cât de repede se încarcă și cât de des cade.",
    servicii: [
      {
        name: "Hostinger",
        tagline: "Hosting pentru site-uri la început: bloguri, portofolii, magazine mici",
        badge: "Planuri pentru început",
        url: "https://www.hostinger.ro",
        beneficii: ["Instalare WordPress cu un clic", "SSL gratuit", "Panou de control propriu (hPanel)", "Suport 24/7 prin chat"],
      },
      {
        name: "SiteGround",
        tagline: "Hosting gestionat, pentru site-uri de firmă și magazine WooCommerce",
        badge: "Hosting gestionat",
        url: "https://www.siteground.com",
        beneficii: ["Backup zilnic automat", "CDN inclus", "Mediu de test (staging) pe planurile superioare", "Suport prin chat și tichete"],
      },
    ],
  },
  {
    titlu: "SEO & Marketing Digital",
    emoji: "📊",
    slug: "/instrumente-seo",
    desc: "Unelte pentru SEO: cercetare de cuvinte cheie, analiza concurenței și creșterea traficului organic.",
    servicii: [
      {
        name: "Semrush",
        tagline: "Platformă SEO și de marketing: cuvinte cheie, audit de site, concurență",
        badge: "SEO all-in-one",
        url: "https://www.semrush.com",
        beneficii: ["Cercetare de cuvinte cheie", "Audit SEO al site-ului", "Monitorizarea pozițiilor în Google", "Analiza concurenței și a backlinkurilor"],
      },
      {
        name: "Ahrefs",
        tagline: "Unealtă SEO cunoscută pentru analiza backlinkurilor",
        badge: "Analiză backlinkuri",
        url: "https://ahrefs.com",
        beneficii: ["Site Explorer — backlinkuri și trafic estimat", "Keywords Explorer", "Content Explorer", "Rank Tracker"],
      },
    ],
  },
  {
    titlu: "Design & Creatie",
    emoji: "🎨",
    slug: null,
    desc: "Unelte de design pentru oricine — de la postări pe social media până la prezentări profesionale.",
    servicii: [
      {
        name: "Canva Pro",
        tagline: "Design online fără experiență: postări, prezentări, materiale de marketing",
        badge: "Design online",
        url: "https://www.canva.com",
        beneficii: ["Șabloane, fonturi și imagini Pro", "Brand Kit", "Programarea postărilor pe social media", "Eliminarea fundalului cu un clic"],
      },
      {
        name: "Adobe Creative Cloud",
        tagline: "Suita Adobe: Photoshop, Illustrator, Premiere Pro și altele",
        badge: "Suită profesională",
        url: "https://www.adobe.com/creativecloud.html",
        beneficii: ["Photoshop, Illustrator, Premiere Pro", "Adobe Fonts inclus", "Spațiu de stocare în cloud", "Actualizările incluse în abonament"],
      },
    ],
  },
  {
    titlu: "Freelancing & Venituri Online",
    emoji: "💼",
    slug: null,
    desc: "Platforme unde poți câștiga bani online sau găsi freelanceri pentru proiectele tale.",
    servicii: [
      {
        name: "Fiverr",
        tagline: "Platformă de servicii freelance: comanzi sau vinzi servicii",
        badge: "Freelanceri",
        url: "https://www.fiverr.com",
        beneficii: ["Design, web, SEO, video, traduceri", "Plata ajunge la freelancer după ce accepți livrarea", "Recenzii publice pentru fiecare freelancer"],
      },
      {
        name: "Coursera",
        tagline: "Cursuri și certificate de la universități și companii",
        badge: "Certificări",
        url: "https://www.coursera.org",
        beneficii: ["Certificate profesionale Google, IBM, Meta", "Specializări cu proiecte practice", "Perioadă de probă gratuită la Coursera Plus"],
      },
    ],
  },
  {
    titlu: "Travel — Rezervari si Vacante",
    emoji: "✈️",
    slug: "/calatorie",
    desc: "Cazare și mașini de închiriat — compară ofertele înainte să rezervi.",
    servicii: [
      {
        name: "Booking.com",
        tagline: "Rezervări de cazare: hoteluri, apartamente, case de vacanță",
        badge: "Cazare",
        url: "https://www.booking.com",
        beneficii: ["Anulare gratuită la multe opțiuni", "Programul Genius, cu reduceri la cazările participante", "Plata la proprietate, unde e disponibilă", "Aplicație pentru telefon"],
      },
      {
        name: "Rentalcars",
        tagline: "Compari mașini de închiriat de la mai multe firme",
        badge: "Mașini de închiriat",
        url: "https://www.rentalcars.com",
        beneficii: ["Oferte de la mai multe firme de închiriere", "Anulare gratuită la multe rezervări", "Asigurarea și politica de combustibil apar la fiecare ofertă"],
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
            VPN, hosting, SEO tools, freelancing si travel — servicii alese de echipa AmCupon.ro pe baza prețurilor și a condițiilor publice. Alege ce ți se potrivește.
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
                      <span className="text-[10px] font-black text-[#0c1000] bg-[#ddf93c] px-2 py-0.5 rounded-full">{s.badge}</span>
                    </div>
                    <p className="text-[#c9ced5] text-sm">{s.tagline}</p>
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
                  <a href={linkPlatit(s.url)} target="_blank" rel="sponsored noopener noreferrer"
                    className="bg-[#ddf93c] hover:bg-[#ddf93c] text-[#0c1000] font-black px-5 py-3 rounded-xl text-sm transition-all text-center shadow-lg shadow-[#ddf93c]/20 hover:-translate-y-0.5 duration-200">
                    Incearca {s.name} →
                  </a>
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
            Descrierile se bazează pe ce publică fiecare serviciu; prețurile și condițiile se schimbă, așa că verifică-le pe site înainte să cumperi.
          </p>
        </div>
      </section>
    </div>
  );
}
