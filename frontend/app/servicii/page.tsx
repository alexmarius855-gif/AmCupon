import { Metadata } from "next";
import fs from "fs";
import path from "path";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Servicii cu Reducere Romania 2026 — Coduri si Oferte Verificate | AmCupon.ro",
  description: "Coduri de reducere la servicii online: albire dinti, cursuri online, software facturare, hosting, telecomunicatii, sanatate. Toate verificate pe AmCupon.ro.",
  keywords: ["servicii cu reducere", "cod reducere servicii online", "albire dinti reducere", "cursuri online reducere", "software facturare reducere", "hosting reducere romania"],
  alternates: { canonical: "https://amcupon.ro/servicii" },
  openGraph: {
    title: "Servicii cu Reducere Romania 2026 | AmCupon.ro",
    description: "Reduceri la servicii online verificate zilnic: sanatate, educatie, software, hosting, telecomunicatii.",
    url: "https://amcupon.ro/servicii",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

interface Promotie {
  nume?: string;
  descriere?: string;
  cod_cupon?: string;
  zile_ramase?: number;
  landing_page?: string;
}
interface Magazin {
  magazin: string;
  url_afiliat: string;
  logo_url?: string;
  are_promotie: boolean;
  promotii: Promotie[];
  scor_final?: number;
  comision?: string;
  categorie_slug?: string;
}

// Sluguri care sunt servicii (nu produse fizice)
const SERVICII_SLUGS: Record<string, { label: string; emoji: string; desc: string; slug_url: string | null }> = {
  "albirea-dintilor.com": { label: "Sanatate & Estetica", emoji: "🦷", desc: "Serviciu albire dinti", slug_url: "/albire-dinti" },
  "facturis-online.ro":   { label: "Software & SaaS",     emoji: "📊", desc: "Software facturare 35% comision", slug_url: "/software-business" },
  "hostico.ro":           { label: "Hosting",              emoji: "🌐", desc: "Hosting romanesc 25% comision", slug_url: "/hosting" },
  "chroot.ro":            { label: "Software & SaaS",      emoji: "💻", desc: "Servicii IT & cloud", slug_url: "/software-business" },
  "creditprime.ro":       { label: "Financiar",            emoji: "💳", desc: "Credite si finantare", slug_url: null },
  "axi-card.ro":          { label: "Financiar",            emoji: "💳", desc: "Card prepay & servicii financiare", slug_url: null },
  "nextsim.eu":           { label: "Telecomunicatii",      emoji: "📱", desc: "SIM & servicii telecom", slug_url: null },
  "telvertical.ro":       { label: "Telecomunicatii",      emoji: "📡", desc: "Telecomunicatii 20% comision", slug_url: null },
  "reincarcareprepay.ro": { label: "Telecomunicatii",      emoji: "📱", desc: "Reincarcari prepay",    slug_url: null },
  "feelnue.ro":           { label: "Sanatate & Estetica",  emoji: "💆", desc: "Sanatate & wellness 25% comision", slug_url: null },
  "21collagen.ro":        { label: "Sanatate & Estetica",  emoji: "✨", desc: "Colagen & suplimente 15% comision", slug_url: null },
  "apiland.ro":           { label: "Sanatate & Estetica",  emoji: "🍯", desc: "Produse naturale & apicultura", slug_url: null },
  "dacris.net":           { label: "Software & SaaS",      emoji: "🖨️", desc: "Consumabile & birou",  slug_url: null },
};

// Servicii internationale (afiliere directa, nu 2Performant)
const SERVICII_INTERNATIONALE = [
  {
    label: "Software & SaaS",
    emoji: "📊",
    items: [
      { name: "Semrush", desc: "Unealta SEO #1 — 200$ per vanzare", pret: "de la 99$/luna", url: "https://semrush.com", program: "semrush.com/lp/inter-affiliate", comision: "200$/vanzare" },
      { name: "Canva Pro", desc: "Design profesional — 36$ per Pro signup", pret: "~13€/luna", url: "https://canva.com", program: "canva.com/affiliates", comision: "36$/conversie" },
    ],
  },
  {
    label: "Educatie & Cursuri",
    emoji: "🎓",
    items: [
      { name: "Coursera", desc: "Cursuri certificate de la universitati top", pret: "49$/luna", url: "https://coursera.org", program: "coursera.org/affiliates", comision: "45% abonament" },
      { name: "Fiverr Learn", desc: "Cursuri freelancing & digital skills", pret: "de la 30$", url: "https://fiverr.com", program: "affiliates.fiverr.com", comision: "30% per curs" },
    ],
  },
  {
    label: "Freelancing",
    emoji: "💼",
    items: [
      { name: "Fiverr", desc: "Cea mai mare platforma de freelancing — 150$ CPA", pret: "comision 20%", url: "https://fiverr.com", program: "affiliates.fiverr.com", comision: "150$ per cumparator" },
    ],
  },
];

function getBestPromo(m: Magazin): Promotie {
  const active = m.promotii.filter(p => (p.zile_ramase ?? 99) >= 0);
  const cuCod = active.filter(p => p.cod_cupon);
  return cuCod[0] ?? active[0] ?? {};
}

// Culoare distincta per categorie de serviciu — niciodata portocaliu
const CATEG_COLOR: Record<string, { from: string; to: string; text: string; ring: string }> = {
  "Sanatate & Estetica":  { from: "#0f766e", to: "#14b8a6", text: "text-[#0f766e]",    ring: "hover:border-[#14b8a6]/30" },
  "Educatie & Cursuri":   { from: "#0d9488", to: "#0d9488", text: "text-[#0f766e]",  ring: "hover:border-[#14b8a6]/30" },
  "Software & SaaS":      { from: "#14b8a6", to: "#0f766e", text: "text-[#0f766e]",    ring: "hover:border-[#14b8a6]/30" },
  "Hosting":              { from: "#0d9488", to: "#0f766e", text: "text-[#0d9488]",   ring: "hover:border-[#14b8a6]/30" },
  "Telecomunicatii":      { from: "#0d9488", to: "#14b8a6", text: "text-[#0f766e]",    ring: "hover:border-[#14b8a6]/30" },
  "Financiar":            { from: "#10b981", to: "#059669", text: "text-emerald-400",ring: "hover:border-emerald-500/30" },
};

const PAGINI_DEDICATE = [
  { href: "/albire-dinti",          emoji: "🦷", name: "Albire Dinti",         sub: "Serviciu estetic",          from: "#0f766e", to: "#14b8a6" },
  { href: "/cursuri-online",        emoji: "🎓", name: "Cursuri Online",       sub: "Educatie & certificari",    from: "#0d9488", to: "#0d9488" },
  { href: "/software-business",     emoji: "📊", name: "Software Business",    sub: "SaaS cu comision mare",     from: "#14b8a6", to: "#0f766e" },
  { href: "/hosting",               emoji: "🌐", name: "Hosting Web",          sub: "Gazduire site-uri",         from: "#0d9488", to: "#0f766e" },
  { href: "/vpn",                   emoji: "🔒", name: "VPN & Securitate",     sub: "NordVPN, Surfshark",        from: "#14b8a6", to: "#0f766e" },
  { href: "/ai-tools",              emoji: "🤖", name: "AI Tools",             sub: "Unelte AI pentru munca",    from: "#0d9488", to: "#0d9488" },
  { href: "/trading",               emoji: "📈", name: "Trading & Investitii", sub: "XTB, Binance, eToro",       from: "#10b981", to: "#059669" },
  { href: "/instrumente-seo",       emoji: "📊", name: "Instrumente SEO",      sub: "Semrush, Ahrefs, Moz",      from: "#14b8a6", to: "#0f766e" },
  { href: "/carduri-bancare",       emoji: "💳", name: "Carduri Bancare",      sub: "Conturi & carduri online",  from: "#0d9488", to: "#0d9488" },
  { href: "/servicii-internationale", emoji: "🌍", name: "Servicii Internationale", sub: "VPN, hosting, software", from: "#14b8a6", to: "#0f766e" },
  { href: "/calculator",            emoji: "🧮", name: "Calculator Reduceri", sub: "Calculeaza economia reala", from: "#0f766e", to: "#14b8a6" },
  { href: "/calculator-salariu",    emoji: "💼", name: "Calculator Salariu",  sub: "Net-brut 2026",             from: "#0d9488", to: "#0d9488" },
  { href: "/generator-proforma",    emoji: "📄", name: "Generator Proforma",  sub: "Document instant gratuit",  from: "#64748b", to: "#94a3b8" },
];

export default function ServiciiPage() {
  const allMag: Magazin[] = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "public", "output.json"), "utf-8")
  );

  // Grupam serviciile 2P pe categorii
  const grupate: Record<string, { info: typeof SERVICII_SLUGS[string]; mag: Magazin }[]> = {};
  for (const m of allMag) {
    const info = SERVICII_SLUGS[m.magazin];
    if (!info) continue;
    if (!grupate[info.label]) grupate[info.label] = [];
    grupate[info.label].push({ info, mag: m });
  }

  const ordineCateg = ["Sanatate & Estetica", "Educatie & Cursuri", "Software & SaaS", "Hosting", "Telecomunicatii", "Financiar"];

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      {/* Hero */}
      <section className="relative bg-[#F7F9FC] border-b border-[#e2e8f0] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 20% 0%, rgba(13,148,136,0.10) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 10%, rgba(16,185,129,0.10) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 50% 100%, rgba(20,184,166,0.08) 0%, transparent 60%)" }} />
        <div className="relative max-w-5xl mx-auto px-4 pt-12 pb-10 text-center">
          <nav className="flex justify-center gap-2 text-xs text-[#64748b] mb-8">
            <Link href="/" className="hover:text-[#334155]">AmCupon.ro</Link>
            <span>/</span>
            <span className="text-[#334155]">Servicii</span>
          </nav>
          <div className="text-5xl mb-4">⚙️</div>
          <h1 className="text-4xl md:text-5xl font-black text-[#0f172a] mb-4">
            Servicii cu <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #0f766e, #14b8a6, #0d9488)" }}>Reducere</span>
          </h1>
          <p className="text-[#475569] text-lg max-w-2xl mx-auto mb-6">
            Coduri de reducere la servicii online verificate zilnic: sanatate si estetica, cursuri, software, hosting, telecomunicatii. Tot ce folosesti, mai ieftin.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {ordineCateg.map(c => (
              <a key={c} href={`#${c.toLowerCase().replace(/[^a-z]/g, "-")}`}
                className="text-xs bg-[#e2e8f0] hover:bg-[#cbd5e1] text-[#334155] px-3 py-1.5 rounded-full border border-[#cbd5e1] transition-colors">
                {c}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Servicii speciale cu pagini dedicate */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-xs text-[#475569] font-bold mb-3 uppercase tracking-wider">Pagini dedicate</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PAGINI_DEDICATE.map(item => (
            <Link key={item.href} href={item.href}
              className="group relative rounded-xl overflow-hidden p-4 text-center transition-all duration-300 hover:scale-[1.04] hover:shadow-xl"
              style={{ background: `linear-gradient(135deg, ${item.from} 0%, ${item.to} 100%)` }}>
              <div className="absolute inset-0 bg-black/15 group-hover:bg-black/0 transition-colors duration-300" />
              <div className="relative">
                <div className="text-3xl mb-2">{item.emoji}</div>
                <div className="text-sm font-black text-[#0f172a]">{item.name}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{item.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Servicii 2Performant pe categorii */}
      {ordineCateg.map(categLabel => {
        const items2p = grupate[categLabel] || [];
        const itemsIntl = SERVICII_INTERNATIONALE.find(s => s.label === categLabel)?.items || [];
        if (items2p.length === 0 && itemsIntl.length === 0) return null;
        const culoare = CATEG_COLOR[categLabel];

        return (
          <section key={categLabel} id={categLabel.toLowerCase().replace(/[^a-z]/g, "-")}
            className="max-w-5xl mx-auto px-4 py-8 border-t border-[#e2e8f0]">
            <h2 className="text-xl font-black text-[#0f172a] mb-5 flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                style={{ background: `linear-gradient(135deg, ${culoare.from}, ${culoare.to})` }}>
                {items2p[0]?.info.emoji || (itemsIntl[0] ? "🌐" : "⚙️")}
              </span>
              {categLabel}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Servicii 2Performant */}
              {items2p.map(({ info, mag }) => {
                const promo = getBestPromo(mag);
                const cod = promo.cod_cupon;
                const descriere = promo.descriere || promo.nume || info.desc;
                const arePromo = mag.are_promotie && mag.promotii.some(p => (p.zile_ramase ?? 99) >= 0);

                return (
                  <div key={mag.magazin} className={`bg-[#ffffff] border border-[#e2e8f0] ${culoare.ring} rounded-xl p-5 flex flex-col gap-3 transition-all`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[#0f172a] font-black text-sm">{mag.magazin.split(".")[0].charAt(0).toUpperCase() + mag.magazin.split(".")[0].slice(1)}</span>
                          {arePromo && <span className={`text-[10px] bg-[#e2e8f0] ${culoare.text} border border-[#cbd5e1] px-1.5 py-0.5 rounded-full font-bold`}>Activ</span>}
                        </div>
                        <p className="text-[#64748b] text-xs">{info.desc}</p>
                      </div>
                      {mag.comision && <span className={`${culoare.text} text-xs font-bold shrink-0`}>{mag.comision.replace(" sale commission", "").replace(" % sale commission", "%")}</span>}
                    </div>

                    {descriere && (
                      <p className="text-[#334155] text-xs line-clamp-2">{descriere}</p>
                    )}

                    {cod && (
                      <div className="bg-[#e2e8f0] border border-dashed border-[#94a3b8] rounded-lg px-3 py-2 text-center">
                        <p className="text-[10px] text-[#64748b] mb-0.5">Cod reducere</p>
                        <p className={`font-mono font-black ${culoare.text} text-sm tracking-wider`}>{cod}</p>
                      </div>
                    )}

                    <a href={mag.url_afiliat || `https://${mag.magazin}`} target="_blank" rel="sponsored noopener noreferrer"
                      className="mt-auto text-[#0f172a] text-xs font-bold py-2.5 rounded-lg text-center transition-all hover:-translate-y-0.5"
                      style={{ background: `linear-gradient(135deg, ${culoare.from}, ${culoare.to})` }}>
                      {cod ? `Foloseste codul ${cod}` : "Vezi oferta"} →
                    </a>

                    {info.slug_url && (
                      <Link href={info.slug_url} className="text-[10px] text-[#94a3b8] hover:text-[#475569] text-center transition-colors">
                        Ghid complet →
                      </Link>
                    )}
                  </div>
                );
              })}

              {/* Servicii internationale */}
              {itemsIntl.map(item => (
                <div key={item.name} className={`bg-[#ffffff] border border-[#e2e8f0] ${culoare.ring} rounded-xl p-5 flex flex-col gap-3 transition-all`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[#0f172a] font-black text-sm">{item.name}</span>
                        <span className={`text-[10px] bg-[#e2e8f0] ${culoare.text} border border-[#cbd5e1] px-1.5 py-0.5 rounded-full font-bold`}>International</span>
                      </div>
                      <p className="text-[#64748b] text-xs">{item.desc}</p>
                    </div>
                    <span className={`${culoare.text} text-xs font-bold shrink-0`}>{item.pret}</span>
                  </div>

                  <a href={item.url} target="_blank" rel="sponsored noopener noreferrer"
                    className="mt-auto text-[#0f172a] text-xs font-bold py-2.5 rounded-lg text-center transition-all hover:-translate-y-0.5"
                    style={{ background: `linear-gradient(135deg, ${culoare.from}, ${culoare.to})` }}>
                    Incearca {item.name} →
                  </a>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* CTA aplica la programe */}
      <section className="max-w-5xl mx-auto px-4 py-10 border-t border-[#e2e8f0]">
        <div className="relative overflow-hidden rounded-xl p-7" style={{ background: "linear-gradient(120deg, rgba(13,148,136,0.12), rgba(20,184,166,0.10), rgba(16,185,129,0.10))" }}>
          <div className="absolute inset-0 border border-[#14b8a6]/20 rounded-xl pointer-events-none" />
          <h2 className="text-xl font-black text-[#0f172a] mb-2">Cunosti si alte servicii cu programe de afiliere?</h2>
          <p className="text-[#475569] text-sm mb-5">
            AmCupon.ro monitorizeaza automat 900+ magazine si servicii din Romania. Daca gasesti un serviciu cu reduceri active pe care nu il vedem, scrie-ne.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/recomandari"
              className="text-[#0f172a] font-bold px-5 py-2.5 rounded-xl text-sm transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}>
              Servicii recomandate →
            </Link>
            <Link href="/contact"
              className="bg-[#e2e8f0] hover:bg-[#cbd5e1] text-[#0f172a] font-bold px-5 py-2.5 rounded-xl text-sm transition-all border border-[#cbd5e1]">
              Sugereaza un serviciu
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
