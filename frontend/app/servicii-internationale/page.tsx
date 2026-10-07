import { Metadata } from "next";
import Link from "next/link";
import { linkPlatit } from "@/lib/linkPlatit";

export const metadata: Metadata = {
  title: "Servicii Internationale 2026 — VPN, Hosting, Software",
  description: "Servicii internaționale pe care le poți folosi din România: VPN, antivirus, hosting, cursuri online, software creativ, freelancing, e-commerce.",
  keywords: [
    "servicii internationale romania", "vpn romania", "hosting ieftin", "antivirus online",
    "cursuri online internationale", "shopify romania", "surfshark romania", "bitdefender",
    "hostinger romania", "coursera romana", "invideo", "logitech", "razer gaming"
  ],
  alternates: { canonical: "https://amcupon.ro/servicii-internationale" },
  openGraph: {
    title: "Servicii Internaționale 2026 | AmCupon.ro",
    description: "VPN, antivirus, hosting, cursuri, software și altele — servicii internaționale pe care le poți folosi din România.",
    url: "https://amcupon.ro/servicii-internationale",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

// Fiecare badgeColor poarta si culoarea textului: pe lime textul e inchis (alb pe lime nu se citeste).
// Linkul platit vine din output.json prin linkPlatit(); fara parteneriat, adresa oficiala.
const CATEGORII = [
  {
    slug: "vpn-securitate",
    titlu: "VPN & Securitate",
    emoji: "🔒",
    desc: "VPN și antivirus de la branduri internaționale",
    branduri: [
      { nume: "Surfshark", badge: "Dispozitive nelimitate", badgeColor: "bg-[#ddf93c] text-[#0c1000]", url: "https://surfshark.sjv.io/c/7401119/529009/9043",
        descriere: "VPN cu dispozitive nelimitate, mod Camouflage și MultiHop, cu aplicații pentru toate platformele." },
      { nume: "Bitdefender", badge: "Brand românesc", badgeColor: "bg-red-700 text-[#ffffff]", url: "https://www.bitdefender.com",
        descriere: "Antivirus pentru PC, Mac, Android și iOS: Antivirus Plus, Internet Security, Total Security." },
      { nume: "Norton", badge: "", badgeColor: "", url: "https://us.norton.com",
        descriere: "Norton 360: antivirus cu VPN inclus, backup în cloud și monitorizare dark web." },
      { nume: "Intego", badge: "Doar Mac", badgeColor: "bg-[#2a2f36] text-[#ffffff]", url: "https://www.intego.com",
        descriere: "Antivirus pentru Mac, care detectează malware scris special pentru macOS." },
    ],
  },
  {
    slug: "hosting-domenii",
    titlu: "Hosting & Domenii",
    emoji: "🌐",
    desc: "Găzduire web și domenii pentru site-ul tău",
    branduri: [
      { nume: "Hostinger", badge: "", badgeColor: "", url: "https://www.hostinger.ro",
        descriere: "Hosting cu servere LiteSpeed, SSL gratuit, instalare WordPress cu un clic și suport 24/7." },
      { nume: "Bluehost", badge: "Listat pe WordPress.org", badgeColor: "bg-[#ddf93c] text-[#0c1000]", url: "https://www.bluehost.com",
        descriere: "Hosting WordPress, listat pe pagina de găzduire recomandată de WordPress.org. Instalare cu un clic și SSL inclus." },
      { nume: "Domain.com", badge: "", badgeColor: "", url: "https://www.domain.com",
        descriere: "Înregistrare de domenii (.com, .net și altele), cu email profesional opțional." },
    ],
  },
  {
    slug: "ecommerce-business",
    titlu: "Ecommerce & Business",
    emoji: "🛒",
    desc: "Platforme pentru magazine online și pentru firme",
    branduri: [
      { nume: "Shopify", badge: "Magazin online", badgeColor: "bg-green-700 text-[#ffffff]", url: "https://www.shopify.com",
        descriere: "Platformă pentru magazin online: teme, plăți și integrări, fără server propriu." },
      { nume: "HubSpot", badge: "CRM gratuit", badgeColor: "bg-[#ddf93c] text-[#0c1000]", url: "https://www.hubspot.com",
        descriere: "CRM cu plan gratuit, plus module plătite de marketing, vânzări și suport clienți." },
      { nume: "Debutify", badge: "", badgeColor: "", url: "https://debutify.com",
        descriere: "Temă Shopify cu add-on-uri pentru conversie: dovezi sociale, cronometre, upsell." },
    ],
  },
  {
    slug: "cursuri-educatie",
    titlu: "Cursuri & Educatie Online",
    emoji: "🎓",
    desc: "Platforme de cursuri online, cu certificat",
    branduri: [
      { nume: "Coursera", badge: "Certificate", badgeColor: "bg-[#ddf93c] text-[#0c1000]", url: "https://www.coursera.org",
        descriere: "Cursuri și certificate de la Google, IBM, Meta și de la universități." },
      { nume: "DataCamp", badge: "Data Science", badgeColor: "bg-green-700 text-[#ffffff]", url: "https://www.datacamp.com",
        descriere: "Cursuri practice de Python, R, SQL și machine learning, direct în browser." },
      { nume: "Blinkist", badge: "", badgeColor: "", url: "https://www.blinkist.com",
        descriere: "Rezumate audio și text ale cărților de non-ficțiune." },
      { nume: "O'Reilly", badge: "", badgeColor: "", url: "https://www.oreilly.com",
        descriere: "Cărți, cursuri video și laboratoare pentru programare, cloud, DevOps, AI și securitate." },
      { nume: "Magoosh", badge: "", badgeColor: "", url: "https://magoosh.com",
        descriere: "Pregătire pentru GRE, GMAT, IELTS și TOEFL, cu lecții video și exerciții." },
    ],
  },
  {
    slug: "software-creativi",
    titlu: "Software Creativ & Productivitate",
    emoji: "🎨",
    desc: "Unelte pentru designeri, fotografi, videografi și creatori",
    branduri: [
      { nume: "InVideo", badge: "Video AI", badgeColor: "bg-[#ddf93c] text-[#0c1000]", url: "https://invideo.sjv.io/c/7401119/883681/12258",
        descriere: "Videoclipuri create cu AI din text, cu șabloane pentru YouTube, TikTok și Reels." },
      { nume: "Envato Market", badge: "", badgeColor: "", url: "https://market.envato.com",
        descriere: "Teme WordPress, video stock, muzică, pluginuri și ilustrații, cumpărate bucată cu bucată." },
      { nume: "Skylum", badge: "Foto AI", badgeColor: "bg-[#c3dd2c] text-[#0c1000]", url: "https://skylum.com",
        descriere: "Luminar Neo: editare foto cu AI — înlocuirea cerului, retuș de portret, îmbunătățire automată." },
      { nume: "Alamy", badge: "", badgeColor: "", url: "https://www.alamy.com",
        descriere: "Bibliotecă de fotografii stock și imagini editoriale." },
    ],
  },
  {
    slug: "gadgets-periferice",
    titlu: "Gadgeturi & Periferice",
    emoji: "🖥",
    desc: "Electronice, gaming și accesorii de la branduri internaționale",
    branduri: [
      { nume: "Logitech", badge: "", badgeColor: "", url: "https://www.logitech.com",
        descriere: "Mouse-uri, tastaturi și camere web: MX Master, G Pro, BRIO. Compatibile Mac și Windows." },
      { nume: "Razer", badge: "Gaming", badgeColor: "bg-green-800 text-[#ffffff]", url: "https://www.razer.com",
        descriere: "Mouse-uri, tastaturi, căști și laptopuri de gaming." },
      { nume: "Lenovo", badge: "", badgeColor: "", url: "https://www.lenovo.com/ro",
        descriere: "ThinkPad pentru business, IdeaPad pentru uz general, Legion pentru gaming." },
      { nume: "Banggood", badge: "", badgeColor: "", url: "https://www.banggood.com",
        descriere: "Magazin online din China: drone, electronice, unelte, articole sport. Livrare internațională." },
      { nume: "UPERFECT", badge: "Portabil", badgeColor: "bg-[#ddf93c] text-[#0c1000]", url: "https://www.uperfectmonitor.com",
        descriere: "Monitoare portabile pentru laptop, consolă sau telefon." },
    ],
  },
  {
    slug: "freelancing-remote",
    titlu: "Freelancing & Munca Remote",
    emoji: "💼",
    desc: "Platforme pentru freelanceri și angajatori",
    branduri: [
      { nume: "Upwork", badge: "", badgeColor: "", url: "https://www.upwork.com",
        descriere: "Platformă de freelancing: găsești freelanceri sau proiecte în programare, design, marketing, redactare." },
      { nume: "Revolut Business", badge: "Fintech", badgeColor: "bg-[#ddf93c] text-[#0c1000]", url: "https://www.revolut.com/business",
        descriere: "Cont de firmă multi-valută, cu carduri virtuale și plăți internaționale. Planurile și comisioanele le vezi pe site." },
    ],
  },
  {
    slug: "fashion-lifestyle",
    titlu: "Fashion & Lifestyle",
    emoji: "👗",
    desc: "Îmbrăcăminte, încălțăminte și accesorii internaționale",
    branduri: [
      { nume: "DHgate", badge: "", badgeColor: "", url: "https://www.dhgate.com",
        descriere: "Marketplace din China, cu prețuri de angro: haine, bijuterii, electronice, accesorii." },
      { nume: "StockX", badge: "", badgeColor: "", url: "https://stockx.com",
        descriere: "Sneakers și streetwear la preț de piață; produsele trec prin verificarea StockX înainte de livrare." },
      { nume: "Crocs", badge: "", badgeColor: "", url: "https://www.crocs.com",
        descriere: "Încălțămintea Crocs, colecțiile în colaborare și accesoriile Jibbitz." },
    ],
  },
];

export default function ServiciiInternationale() {
  const totalBranduri = CATEGORII.reduce((s, c) => s + c.branduri.length, 0);

  return (
    <div className="min-h-screen bg-[#06080b]">
      {/* Hero */}
      <section className="border-b border-[#1f2329] overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(13,148,136,0.07) 0%, transparent 65%)" }} />
        <div className="relative max-w-5xl mx-auto px-4 pt-12 pb-10 text-center">
          <nav className="flex justify-center gap-2 text-xs text-[#9399a0] mb-8">
            <Link href="/" className="hover:text-[#c9ced5]">AmCupon.ro</Link>
            <span>/</span>
            <span className="text-[#c9ced5]">Servicii Internationale</span>
          </nav>
          <div className="text-5xl mb-4">🌍</div>
          <h1 className="text-4xl md:text-5xl font-black text-[#ffffff] mb-4">
            Servicii Internaționale{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #ddf93c, #ddf93c)" }}>
              2026
            </span>
          </h1>
          <p className="text-[#c9ced5] text-lg max-w-2xl mx-auto mb-6">
            {totalBranduri} servicii internaționale — VPN, antivirus, hosting, cursuri, software și altele. Unde avem parteneriat, linkul e de afiliat; altfel te trimitem direct pe site-ul lor.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            {CATEGORII.map((c) => (
              <a key={c.slug} href={`#${c.slug}`}
                className="bg-[#1f2329] hover:bg-[#2a2f36] text-[#c9ced5] px-3 py-1.5 rounded-full transition-colors">
                {c.emoji} {c.titlu}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Categorii */}
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-16">
        {CATEGORII.map((cat) => (
          <section key={cat.slug} id={cat.slug}>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">{cat.emoji}</span>
              <div>
                <h2 className="text-xl font-black text-[#ffffff]">{cat.titlu}</h2>
                <p className="text-[#9399a0] text-sm">{cat.desc}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cat.branduri.map((brand) => (
                <a key={brand.nume} href={linkPlatit(brand.url)} target="_blank" rel="sponsored noopener noreferrer"
                  className="group bg-[#14181c] border border-[#1f2329] hover:border-[#3a4048] rounded-xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40 block">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-[#ffffff] group-hover:text-[#c3dd2c] transition-colors">{brand.nume}</h3>
                      {brand.badge && (
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${brand.badgeColor}`}>
                          {brand.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[#c9ced5] text-xs leading-relaxed">{brand.descriere}</p>
                  <div className="mt-3 text-xs text-[#9399a0] group-hover:text-[#c9ced5] transition-colors flex items-center gap-1">
                    <span>Viziteaza</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* De ce servicii internationale */}
      <section className="max-w-5xl mx-auto px-4 py-10 border-t border-[#1f2329]">
        <h2 className="text-2xl font-black text-[#ffffff] mb-6">De ce sa alegi servicii internationale?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { emoji: "🧩", titlu: "Ce nu găsești local", desc: "Pentru unele lucruri (VPN, unelte AI, cursuri cu certificat internațional) alternativele românești sunt puține sau lipsesc." },
            { emoji: "🇷🇴", titlu: "Și un brand românesc", desc: "Bitdefender, din listă, e o companie românească, fondată în București." },
            { emoji: "🌍", titlu: "Verifică livrarea", desc: "Serviciile digitale merg de obicei de oriunde; la produsele fizice (Crocs, Razer, Lenovo), verifică pe site livrarea în România înainte să comanzi." },
          ].map((item, i) => (
            <div key={i} className="bg-[#14181c] border border-[#1f2329] rounded-xl p-5">
              <div className="text-2xl mb-2">{item.emoji}</div>
              <h3 className="font-bold text-[#ffffff] mb-1">{item.titlu}</h3>
              <p className="text-sm text-[#c9ced5]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Link categorii aferente */}
      <section className="max-w-5xl mx-auto px-4 py-8 border-t border-[#1f2329]">
        <h2 className="text-xl font-black text-[#ffffff] mb-4">Exploreaza si paginile dedicate</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { href: "/vpn", label: "VPN Romania" },
            { href: "/hosting", label: "Hosting Web" },
            { href: "/software-business", label: "Software Business" },
            { href: "/cursuri-online", label: "Cursuri Online" },
            { href: "/ai-tools", label: "AI Tools" },
            { href: "/electronice", label: "Electronice" },
            { href: "/gadgets", label: "Gadgeturi" },
          ].map((link) => (
            <Link key={link.href} href={link.href}
              className="bg-[#1f2329] hover:bg-[#2a2f36] text-[#c9ced5] px-4 py-2 rounded-lg text-sm transition-colors">
              {link.label} →
            </Link>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <div className="max-w-5xl mx-auto px-4 pb-10">
        <p className="text-[#9399a0] text-xs text-center">
          Paginile de pe AmCupon.ro conțin linkuri de afiliat. Dacă faci o achiziție, primim un comision, fără cost suplimentar pentru tine. Descrierile se bazează pe ce publică fiecare serviciu; prețurile și condițiile le vezi pe site-ul lor.
        </p>
      </div>
    </div>
  );
}
