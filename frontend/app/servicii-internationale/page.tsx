import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Servicii Internationale 2026 — VPN, Hosting, Software, Cursuri | AmCupon.ro",
  description: "Cele mai bune servicii internationale disponibile in Romania: VPN, hosting, antivirus, cursuri online, freelancing, ecommerce. Oferte verificate si comisioane afiliat.",
  keywords: [
    "servicii internationale romania", "vpn romania", "hosting ieftin", "antivirus online",
    "cursuri online internationale", "shopify romania", "surfshark romania", "bitdefender",
    "hostinger romania", "coursera romana", "invideo", "logitech", "razer gaming"
  ],
  alternates: { canonical: "https://amcupon.ro/servicii-internationale" },
  openGraph: {
    title: "Servicii Internationale cu Oferte 2026 | AmCupon.ro",
    description: "VPN, hosting, antivirus, cursuri, software si mai mult — servicii internationale cu cele mai bune preturi pentru romani.",
    url: "https://amcupon.ro/servicii-internationale",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

const CATEGORII = [
  {
    slug: "vpn-securitate",
    titlu: "VPN & Securitate",
    emoji: "🔒",
    desc: "Protejeaza-ti conexiunea cu VPN-uri si antivirus de top",
    branduri: [
      {
        nume: "Surfshark",
        tagline: "VPN cu dispozitive nelimitate — 40% comision recurent",
        comision: "40% + recurent",
        badge: "Top ales",
        badgeColor: "bg-[#b8912e]",
        url: "https://surfshark.sjv.io/c/7401119/529009/9043",
        descriere: "VPN premium cu no-logs verificat. Disponibil pe toate dispozitivele, camouflage mode, MultiHop.",
      },
      {
        nume: "Bitdefender",
        tagline: "Antivirus romanesc premiat mondial — 20-40% comision",
        comision: "20-40%",
        badge: "Brand Romanesc",
        badgeColor: "bg-red-700",
        url: "https://www.bitdefender.ro/affiliate/",
        descriere: "Protectie completa pentru PC, Mac, Android, iOS. Total Security, Internet Security, Antivirus Plus.",
      },
      {
        nume: "Norton",
        tagline: "Protectie avansata cu LifeLock — 25% comision",
        comision: "25%",
        badge: "",
        badgeColor: "",
        url: "https://us.norton.com",
        descriere: "Norton 360 cu backup in cloud, VPN inclus, monitorizare dark web si protectie identitate.",
      },
      {
        nume: "Intego",
        tagline: "Cel mai bun antivirus Mac — 25-40% comision",
        comision: "25-40%",
        badge: "Mac Only",
        badgeColor: "bg-[#473d28]",
        url: "https://www.intego.com",
        descriere: "Protectie specializata pentru Mac si iOS. Detecteaza malware specific macOS.",
      },
    ],
  },
  {
    slug: "hosting-domenii",
    titlu: "Hosting & Domenii",
    emoji: "🌐",
    desc: "Gazduire web si domenii pentru site-ul tau",
    branduri: [
      {
        nume: "Hostinger",
        tagline: "Hosting accesibil cu WP installer 1-click — 60% comision",
        comision: "60%",
        badge: "Cel mai mare comision",
        badgeColor: "bg-[#b8912e]",
        url: "https://www.hostinger.ro",
        descriere: "Hosting rapid cu LiteSpeed, SSL gratuit, domeniu gratuit 1 an, suport 24/7. Cel mai bun raport calitate/pret.",
      },
      {
        nume: "Bluehost",
        tagline: "Hosting WordPress recomandat oficial — $65-130 per vanzare",
        comision: "$65-130 per sale",
        badge: "WordPress Official",
        badgeColor: "bg-[#b8912e]",
        url: "https://www.bluehost.com",
        descriere: "Gazduire WordPress recomandata de WordPress.org. Instalare cu 1 click, domeniu gratuit, SSL inclus.",
      },
      {
        nume: "Domain.com",
        tagline: "Domenii .com, .ro, .net la preturi mici — 10-20% comision",
        comision: "10-20%",
        badge: "",
        badgeColor: "",
        url: "https://www.domain.com",
        descriere: "Inregistreaza orice domeniu simplu. Include email profesional si hosting de baza.",
      },
    ],
  },
  {
    slug: "ecommerce-business",
    titlu: "Ecommerce & Business",
    emoji: "🛒",
    desc: "Platforme pentru magazine online si management business",
    branduri: [
      {
        nume: "Shopify",
        tagline: "Platforma #1 ecommerce mondial — $25-150 per referral",
        comision: "$25-150 per referral",
        badge: "Recomandat",
        badgeColor: "bg-green-700",
        url: "https://shopify.pxf.io/c/7761435/1/0",
        descriere: "Creeaza magazin online in minute. 4 milioane de comercianti, teme profesionale, integrari complete.",
      },
      {
        nume: "HubSpot",
        tagline: "CRM gratuit pentru marketing si vanzari — 30% comision",
        comision: "30%",
        badge: "CRM Gratuit",
        badgeColor: "bg-[#b8912e]",
        url: "https://www.hubspot.com",
        descriere: "CRM complet cu email marketing, landing pages, formulare, live chat. Gratuit pentru startup-uri.",
      },
      {
        nume: "Debutify",
        tagline: "Tema Shopify #1 pentru conversii — 20-40% comision",
        comision: "20-40%",
        badge: "",
        badgeColor: "",
        url: "https://debutify.com",
        descriere: "Tema Shopify cu sute de add-ons pentru cresterea vanzarilor. Social proof, countdowns, upsells.",
      },
    ],
  },
  {
    slug: "cursuri-educatie",
    titlu: "Cursuri & Educatie Online",
    emoji: "🎓",
    desc: "Invata orice, oriunde, cu cele mai bune platforme online",
    branduri: [
      {
        nume: "Coursera",
        tagline: "Cursuri universitare online Google, IBM, Stanford — 15-45% comision",
        comision: "15-45%",
        badge: "Top Platforma",
        badgeColor: "bg-[#b8912e]",
        url: "https://coursera.pxf.io/c/7761435/1/0",
        descriere: "Cursuri si certificate de la Google, IBM, Meta, Stanford. Disponibil si in romana pentru unele cursuri.",
      },
      {
        nume: "DataCamp",
        tagline: "Data Science, Python, SQL, AI — 35% comision",
        comision: "35%",
        badge: "Data Science",
        badgeColor: "bg-green-700",
        url: "https://www.datacamp.com",
        descriere: "350+ cursuri de Data Science, Python, R, SQL, Machine Learning. Hands-on, fara teorie sterila.",
      },
      {
        nume: "Blinkist",
        tagline: "Rezumate carti business in 15 minute — 20-25% comision",
        comision: "20-25%",
        badge: "",
        badgeColor: "",
        url: "https://www.blinkist.com",
        descriere: "7500+ rezumate de carti non-fiction. Audio si text. Invata din cele mai bune carti business.",
      },
      {
        nume: "O'Reilly",
        tagline: "Biblioteca completa tech & programare — 20% comision",
        comision: "20%",
        badge: "",
        badgeColor: "",
        url: "https://www.oreilly.com",
        descriere: "Carti, videocursuri si sandbox-uri live pentru programare, cloud, DevOps, AI, securitate.",
      },
      {
        nume: "Magoosh",
        tagline: "Pregatire GRE, GMAT, IELTS, TOEFL — 20% comision",
        comision: "20%",
        badge: "",
        badgeColor: "",
        url: "https://magoosh.com",
        descriere: "Platforma de pregatire examene internationale cu lectii video si practica adaptiva AI.",
      },
    ],
  },
  {
    slug: "software-creativi",
    titlu: "Software Creativ & Productivitate",
    emoji: "🎨",
    desc: "Unelte pentru designeri, fotografi, videografi si creatori",
    branduri: [
      {
        nume: "InVideo",
        tagline: "Video AI pentru YouTube si Social Media — 25-50% comision",
        comision: "25-50%",
        badge: "AI Video",
        badgeColor: "bg-[#b8912e]",
        url: "https://invideo.sjv.io/c/7401119/883681/12258",
        descriere: "Creeaza videoclipuri profesionale cu AI in minute. Template-uri pentru YouTube, TikTok, Reels.",
      },
      {
        nume: "Envato Market",
        tagline: "Milioane resurse creative — 30% comision",
        comision: "30%",
        badge: "",
        badgeColor: "",
        url: "https://market.envato.com",
        descriere: "Teme WordPress, videoclipuri stock, muzica, pluginuri, ilustratii. Pachet Elements nelimitat.",
      },
      {
        nume: "Skylum",
        tagline: "Editare foto AI cu Luminar Neo — 20-30% comision",
        comision: "20-30%",
        badge: "AI Photo",
        badgeColor: "bg-[#8a6a1e]",
        url: "https://skylum.com",
        descriere: "Luminar Neo editeaza fotografii cu AI: inlocuire cer, retusare portrete, imbunatatire automata.",
      },
      {
        nume: "Alamy",
        tagline: "350 milioane stock photos — 10-20% comision",
        comision: "10-20%",
        badge: "",
        badgeColor: "",
        url: "https://www.alamy.com",
        descriere: "Cea mai mare biblioteca de stock photos si imagini editoriale. Fotografii profesionale la preturi corecte.",
      },
    ],
  },
  {
    slug: "gadgets-periferice",
    titlu: "Gadgeturi & Periferice",
    emoji: "🖥",
    desc: "Electronice, gaming si accesorii tech de la branduri internationale",
    branduri: [
      {
        nume: "Logitech",
        tagline: "Mouse, tastatura, webcam profesionale — 4-8% comision",
        comision: "4-8%",
        badge: "Brand #1 Periferice",
        badgeColor: "bg-[#37301f]",
        url: "https://www.logitech.com",
        descriere: "Cel mai vandut brand de periferice. MX Master, G Pro, BRIO webcam. Compatibil Mac si Windows.",
      },
      {
        nume: "Razer",
        tagline: "Gaming peripherals premium — 5-10% comision",
        comision: "5-10%",
        badge: "Gaming",
        badgeColor: "bg-green-800",
        url: "https://www.razer.com",
        descriere: "Mouse, tastatura, casti si laptop-uri gaming Razer. Chroma RGB, switches mecanice personalizabile.",
      },
      {
        nume: "Lenovo",
        tagline: "Laptopuri, PC si tablete — 4-8% comision",
        comision: "4-8%",
        badge: "",
        badgeColor: "",
        url: "https://www.lenovo.com/ro",
        descriere: "ThinkPad pentru business, IdeaPad pentru uz general, Legion pentru gaming. Qualitate garantata.",
      },
      {
        nume: "Banggood",
        tagline: "Gadgeturi ieftine din China — 5-12% comision",
        comision: "5-12%",
        badge: "Pret Mic",
        badgeColor: "bg-[#b8912e]",
        url: "https://www.banggood.com",
        descriere: "Milioane de produse: drone, electronice, unelte, sport la preturi angro. Livrare internationala.",
      },
      {
        nume: "UPERFECT",
        tagline: "Monitoare portabile 4K — 10% comision",
        comision: "10%",
        badge: "Portabil",
        badgeColor: "bg-[#b8912e]",
        url: "https://www.uperfectmonitor.com",
        descriere: "Monitor portabil 4K pentru laptop, PS5, Switch. Ideal pentru remote work si gaming on-the-go.",
      },
    ],
  },
  {
    slug: "freelancing-remote",
    titlu: "Freelancing & Munca Remote",
    emoji: "💼",
    desc: "Platforme pentru freelanceri si angajatori",
    branduri: [
      {
        nume: "Upwork",
        tagline: "Cea mai mare platforma freelancing — $150 per client nou",
        comision: "$150 per client nou",
        badge: "Popular",
        badgeColor: "bg-green-700",
        url: "https://www.upwork.com",
        descriere: "Gaseste freelanceri sau proiecte in orice domeniu: programare, design, marketing, redactare.",
      },
      {
        nume: "Revolut Business",
        tagline: "Banking digital pentru firme — $50-200 per referral",
        comision: "$50-200 per referral",
        badge: "Fintech",
        badgeColor: "bg-[#b8912e]",
        url: "https://www.revolut.com/business",
        descriere: "Cont business multi-valuta fara comisioane. Carduri virtuale, API, platI internationale gratuite.",
      },
    ],
  },
  {
    slug: "fashion-lifestyle",
    titlu: "Fashion & Lifestyle",
    emoji: "👗",
    desc: "Imbracaminte, incaltaminte si accesorii internationale",
    branduri: [
      {
        nume: "DHgate",
        tagline: "Marketplace angro China — 2-50% comision",
        comision: "2-50%",
        badge: "Mega Selectie",
        badgeColor: "bg-[#b8912e]",
        url: "https://www.dhgate.com",
        descriere: "Milioane de produse la preturi angro: haine, bijuterii, electronice, accesorii. Livrare globala.",
      },
      {
        nume: "StockX",
        tagline: "Sneakers si streetwear autentice — 3-8% comision",
        comision: "3-8%",
        badge: "Autenticate",
        badgeColor: "bg-red-700",
        url: "https://stockx.com",
        descriere: "Cumparati si vindeti sneakers Nike, Jordan, Adidas, Yeezy la preturi de piata. 100% autentice.",
      },
      {
        nume: "Crocs",
        tagline: "Incaltaminte confortabila colorata — 5-10% comision",
        comision: "5-10%",
        badge: "",
        badgeColor: "",
        url: "https://www.crocs.com",
        descriere: "Clasicii Crocs si noile colectii colaborari. Jibbitz personalizare, colectii sezoniere.",
      },
    ],
  },
];

export default function ServiciiInternationale() {
  const totalBranduri = CATEGORII.reduce((s, c) => s + c.branduri.length, 0);

  return (
    <div className="min-h-screen bg-[#0b0a07]">
      {/* Hero */}
      <section className="border-b border-[#26211a] overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(139,92,246,0.07) 0%, transparent 65%)" }} />
        <div className="relative max-w-5xl mx-auto px-4 pt-12 pb-10 text-center">
          <nav className="flex justify-center gap-2 text-xs text-[#8c8064] mb-8">
            <Link href="/" className="hover:text-[#c8bda2]">AmCupon.ro</Link>
            <span>/</span>
            <span className="text-[#c8bda2]">Servicii Internationale</span>
          </nav>
          <div className="text-5xl mb-4">🌍</div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Servicii Internationale{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #c9a63e, #b8912e)" }}>
              cu Oferte 2026
            </span>
          </h1>
          <p className="text-[#a89a78] text-lg max-w-2xl mx-auto mb-6">
            {totalBranduri} servicii internationale disponibile in Romania — VPN, hosting, antivirus, cursuri, software si mai mult. Toate cu comision verificat.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            {CATEGORII.map((c) => (
              <a key={c.slug} href={`#${c.slug}`}
                className="bg-[#26211a] hover:bg-[#37301f] text-[#c8bda2] px-3 py-1.5 rounded-full transition-colors">
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
                <h2 className="text-xl font-black text-white">{cat.titlu}</h2>
                <p className="text-[#8c8064] text-sm">{cat.desc}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cat.branduri.map((brand) => (
                <a key={brand.nume} href={brand.url} target="_blank" rel="sponsored noopener noreferrer"
                  className="group bg-[#15120c] border border-[#26211a] hover:border-[#473d28] rounded-xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30 block">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-white group-hover:text-[#e3d1a6] transition-colors">{brand.nume}</h3>
                      {brand.badge && (
                        <span className={`text-[9px] font-black text-white px-2 py-0.5 rounded-full ${brand.badgeColor}`}>
                          {brand.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[#a89a78] text-xs leading-relaxed">{brand.descriere}</p>
                  <div className="mt-3 text-xs text-[#8c8064] group-hover:text-[#a89a78] transition-colors flex items-center gap-1">
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
      <section className="max-w-5xl mx-auto px-4 py-10 border-t border-[#26211a]">
        <h2 className="text-2xl font-black text-white mb-6">De ce sa alegi servicii internationale?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { emoji: "💰", titlu: "Preturi mai mici", desc: "Multe servicii internationale sunt cu 30-70% mai ieftine decat echivalentele locale, mai ales pentru software si abonamente." },
            { emoji: "🏆", titlu: "Calitate mai buna", desc: "Branduri internationale investesc masiv in produse premium. Bitdefender, de exemplu, e cel mai premiat antivirus la nivel mondial." },
            { emoji: "🌍", titlu: "Disponibile in Romania", desc: "Toate serviciile de pe aceasta pagina accepta plati cu carduri romanesti si livreaza (fizic sau digital) in Romania." },
          ].map((item, i) => (
            <div key={i} className="bg-[#15120c] border border-[#26211a] rounded-xl p-5">
              <div className="text-2xl mb-2">{item.emoji}</div>
              <h3 className="font-bold text-white mb-1">{item.titlu}</h3>
              <p className="text-sm text-[#a89a78]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Link categorii aferente */}
      <section className="max-w-5xl mx-auto px-4 py-8 border-t border-[#26211a]">
        <h2 className="text-xl font-black text-white mb-4">Exploreaza si paginile dedicate</h2>
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
              className="bg-[#26211a] hover:bg-[#37301f] text-[#c8bda2] px-4 py-2 rounded-lg text-sm transition-colors">
              {link.label} →
            </Link>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <div className="max-w-5xl mx-auto px-4 pb-10">
        <p className="text-[#473d28] text-xs text-center">
          Paginile de pe AmCupon.ro contin linkuri de afiliat. Daca faci o achizitie, primim un comision mic, fara cost suplimentar pentru tine. Recomandam doar servicii verificate editorial.
        </p>
      </div>
    </div>
  );
}
