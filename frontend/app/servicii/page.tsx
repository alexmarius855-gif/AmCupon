import { Metadata } from "next";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { pesteMagazine } from "@/lib/cifreSite";
import { numeAfisat } from "@/lib/numeMagazin";
import { maskCod } from "@/lib/maskCod";
import { linkPlatit } from "@/lib/linkPlatit";

export const metadata: Metadata = {
  title: "Servicii Online Romania 2026 — Ghiduri și Parteneri",
  description: "Servicii online de la partenerii AmCupon — sănătate, telecomunicații, software — și ghiduri pentru cursuri, hosting, VPN, conturi bancare și asigurări.",
  keywords: ["servicii cu reducere", "cod reducere servicii online", "albire dinti reducere", "cursuri online reducere", "software facturare reducere", "hosting reducere romania"],
  alternates: { canonical: "https://amcupon.ro/servicii" },
  openGraph: {
    title: "Servicii Online Romania 2026 | AmCupon.ro",
    description: "Servicii online de la partenerii AmCupon și ghiduri pentru cursuri, hosting, VPN, conturi bancare și asigurări.",
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
  categorie_slug?: string;
}

// Sluguri care sunt servicii (nu produse fizice)
const SERVICII_SLUGS: Record<string, { label: string; emoji: string; desc: string; slug_url: string | null }> = {
  "albirea-dintilor.com": { label: "Sanatate & Estetica", emoji: "🦷", desc: "Serviciu albire dinti", slug_url: "/albire-dinti" },
  "facturis-online.ro":   { label: "Software & SaaS",     emoji: "📊", desc: "Software de facturare", slug_url: "/software-business" },
  "chroot.ro":            { label: "Software & SaaS",      emoji: "💻", desc: "Servicii IT & cloud", slug_url: "/software-business" },
  "nextsim.eu":           { label: "Telecomunicatii",      emoji: "📱", desc: "SIM & servicii telecom", slug_url: null },
  "telvertical.ro":       { label: "Telecomunicatii",      emoji: "📡", desc: "Servicii de telecomunicații", slug_url: null },
  "reincarcareprepay.ro": { label: "Telecomunicatii",      emoji: "📱", desc: "Reincarcari prepay",    slug_url: null },
  "feelnue.ro":           { label: "Sanatate & Estetica",  emoji: "💆", desc: "Sănătate și wellness", slug_url: null },
  "21collagen.ro":        { label: "Sanatate & Estetica",  emoji: "✨", desc: "Colagen și suplimente", slug_url: null },
  "apiland.ro":           { label: "Sanatate & Estetica",  emoji: "🍯", desc: "Produse naturale & apicultura", slug_url: null },
};

// Servicii internationale (afiliere directa, nu 2Performant)
const SERVICII_INTERNATIONALE = [
  {
    label: "Software & SaaS",
    emoji: "📊",
    items: [
      { name: "Semrush", desc: "Unealtă SEO: cercetare de cuvinte cheie, audit de site, analiza concurenței.", url: "https://www.semrush.com" },
      { name: "Canva Pro", desc: "Design online pentru social media, prezentări și materiale de marketing.", url: "https://www.canva.com" },
    ],
  },
  {
    label: "Educatie & Cursuri",
    emoji: "🎓",
    items: [
      { name: "Coursera", desc: "Cursuri și certificate de la universități și companii.", url: "https://www.coursera.org" },
    ],
  },
  {
    label: "Freelancing",
    emoji: "💼",
    items: [
      { name: "Fiverr", desc: "Platformă de servicii freelance: design, programare, marketing, traduceri.", url: "https://www.fiverr.com" },
    ],
  },
];

function getBestPromo(m: Magazin): Promotie {
  const active = m.promotii.filter(p => (p.zile_ramase ?? 99) >= 0);
  const cuCod = active.filter(p => p.cod_cupon);
  return cuCod[0] ?? active[0] ?? {};
}

// Culoare distincta per categorie de serviciu — niciodata portocaliu
const CATEG_COLOR: Record<string, { from: string; to: string; text: string; ring: string; textBtn: string }> = {
  "Sanatate & Estetica":  { from: "#c3dd2c", to: "#ddf93c", text: "text-[#c3dd2c]",   ring: "hover:border-[#ddf93c]/30",   textBtn: "text-[#0c1000]" },
  "Educatie & Cursuri":   { from: "#ddf93c", to: "#ddf93c", text: "text-[#c3dd2c]",   ring: "hover:border-[#ddf93c]/30",   textBtn: "text-[#0c1000]" },
  "Software & SaaS":      { from: "#ddf93c", to: "#c3dd2c", text: "text-[#c3dd2c]",   ring: "hover:border-[#ddf93c]/30",   textBtn: "text-[#0c1000]" },
  "Hosting":              { from: "#ddf93c", to: "#c3dd2c", text: "text-[#ddf93c]",   ring: "hover:border-[#ddf93c]/30",   textBtn: "text-[#0c1000]" },
  "Telecomunicatii":      { from: "#ddf93c", to: "#ddf93c", text: "text-[#c3dd2c]",   ring: "hover:border-[#ddf93c]/30",   textBtn: "text-[#0c1000]" },
  "Financiar":            { from: "#10b981", to: "#059669", text: "text-emerald-400", ring: "hover:border-emerald-500/30", textBtn: "text-[#0c1000]" },
};

const PAGINI_DEDICATE = [
  { href: "/albire-dinti",          emoji: "🦷", name: "Albire Dinti",         sub: "Serviciu estetic",          from: "#c3dd2c", to: "#ddf93c" },
  { href: "/cursuri-online",        emoji: "🎓", name: "Cursuri Online",       sub: "Educatie & certificari",    from: "#ddf93c", to: "#ddf93c" },
  { href: "/software-business",     emoji: "📊", name: "Software Business",    sub: "Software pentru firme",     from: "#ddf93c", to: "#c3dd2c" },
  { href: "/hosting",               emoji: "🌐", name: "Hosting Web",          sub: "Gazduire site-uri",         from: "#ddf93c", to: "#c3dd2c" },
  { href: "/vpn",                   emoji: "🔒", name: "VPN & Securitate",     sub: "NordVPN, Surfshark",        from: "#ddf93c", to: "#c3dd2c" },
  { href: "/ai-tools",              emoji: "🤖", name: "AI Tools",             sub: "Unelte AI pentru munca",    from: "#ddf93c", to: "#ddf93c" },
  { href: "/trading",               emoji: "📈", name: "Trading & Investitii", sub: "XTB, Binance, eToro",       from: "#10b981", to: "#059669" },
  { href: "/instrumente-seo",       emoji: "📊", name: "Instrumente SEO",      sub: "Semrush, Ahrefs, Moz",      from: "#ddf93c", to: "#c3dd2c" },
  { href: "/carduri-bancare",       emoji: "💳", name: "Carduri Bancare",      sub: "Conturi & carduri online",  from: "#ddf93c", to: "#ddf93c" },
  { href: "/asigurari",             emoji: "🛡️", name: "Asigurari",           sub: "RCA, CASCO, locuinta",       from: "#c3dd2c", to: "#ddf93c" },
  { href: "/servicii-internationale", emoji: "🌍", name: "Servicii Internationale", sub: "VPN, hosting, software", from: "#ddf93c", to: "#c3dd2c" },
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
    <div className="min-h-screen bg-[#06080b]">
      {/* Hero */}
      <section className="relative bg-[#06080b] border-b border-[#1f2329] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 20% 0%, rgba(13,148,136,0.10) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 10%, rgba(16,185,129,0.10) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 50% 100%, rgba(20,184,166,0.08) 0%, transparent 60%)" }} />
        <div className="relative max-w-5xl mx-auto px-4 pt-12 pb-10 text-center">
          <nav className="flex justify-center gap-2 text-xs text-[#9399a0] mb-8">
            <Link href="/" className="hover:text-[#c9ced5]">AmCupon.ro</Link>
            <span>/</span>
            <span className="text-[#c9ced5]">Servicii</span>
          </nav>
          <div className="text-5xl mb-4">⚙️</div>
          <h1 className="text-4xl md:text-5xl font-black text-[#ffffff] mb-4">
            Servicii <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #c3dd2c, #ddf93c, #ddf93c)" }}>online</span>
          </h1>
          <p className="text-[#c9ced5] text-lg max-w-2xl mx-auto mb-6">
            Servicii de la partenerii AmCupon — sănătate, telecomunicații, software — și ghiduri pentru cursuri, hosting, VPN, conturi bancare și asigurări. Ofertele active apar pe pagina fiecărui partener.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {ordineCateg.map(c => (
              <a key={c} href={`#${c.toLowerCase().replace(/[^a-z]/g, "-")}`}
                className="text-xs bg-[#1f2329] hover:bg-[#2a2f36] text-[#c9ced5] px-3 py-1.5 rounded-full border border-[#2a2f36] transition-colors">
                {c}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Servicii speciale cu pagini dedicate */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-xs text-[#c9ced5] font-bold mb-3 uppercase tracking-wider">Pagini dedicate</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PAGINI_DEDICATE.map(item => (
            <Link key={item.href} href={item.href}
              className="group relative rounded-xl overflow-hidden p-4 text-center transition-all duration-300 hover:scale-[1.04] hover:shadow-xl"
              style={{ background: `linear-gradient(135deg, ${item.from} 0%, ${item.to} 100%)` }}>
              <div className="relative">
                <div className="text-3xl mb-2">{item.emoji}</div>
                <div className="text-sm font-black text-[#0c1000]">{item.name}</div>
                <div className="text-[11px] mt-0.5 text-[#2a2f10]">{item.sub}</div>
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
            className="max-w-5xl mx-auto px-4 py-8 border-t border-[#1f2329]">
            <h2 className="text-xl font-black text-[#ffffff] mb-5 flex items-center gap-3">
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
                  <div key={mag.magazin} className={`bg-[#14181c] border border-[#1f2329] ${culoare.ring} rounded-xl p-5 flex flex-col gap-3 transition-all`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[#ffffff] font-black text-sm">{numeAfisat(mag.magazin)}</span>
                          {arePromo && <span className={`text-[10px] bg-[#1f2329] ${culoare.text} border border-[#2a2f36] px-1.5 py-0.5 rounded-full font-bold`}>Activ</span>}
                        </div>
                        <p className="text-[#9399a0] text-xs">{info.desc}</p>
                      </div>
                    </div>

                    {descriere && (
                      <p className="text-[#c9ced5] text-xs line-clamp-2">{descriere}</p>
                    )}

                    {cod && (
                      <div className="bg-[#1f2329] border border-dashed border-[#3a4048] rounded-lg px-3 py-2 text-center">
                        <p className="text-[10px] text-[#9399a0] mb-0.5">Cod reducere</p>
                        <p className={`font-mono font-black ${culoare.text} text-sm tracking-wider`}>{maskCod(cod)}</p>
                      </div>
                    )}

                    <Link href={`/cod-reducere/${mag.magazin}`}
                      className={`mt-auto ${culoare.textBtn} text-xs font-bold py-2.5 rounded-lg text-center transition-all hover:-translate-y-0.5`}
                      style={{ background: `linear-gradient(135deg, ${culoare.from}, ${culoare.to})` }}>
                      {cod ? "Vezi codul" : arePromo ? "Vezi oferta" : `Vezi ${numeAfisat(mag.magazin)}`} →
                    </Link>

                    {info.slug_url && (
                      <Link href={info.slug_url} className="text-[10px] text-[#9399a0] hover:text-[#c9ced5] text-center transition-colors">
                        Ghid complet →
                      </Link>
                    )}
                  </div>
                );
              })}

              {/* Servicii internationale */}
              {itemsIntl.map(item => (
                <div key={item.name} className={`bg-[#14181c] border border-[#1f2329] ${culoare.ring} rounded-xl p-5 flex flex-col gap-3 transition-all`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[#ffffff] font-black text-sm">{item.name}</span>
                        <span className={`text-[10px] bg-[#1f2329] ${culoare.text} border border-[#2a2f36] px-1.5 py-0.5 rounded-full font-bold`}>International</span>
                      </div>
                      <p className="text-[#9399a0] text-xs">{item.desc}</p>
                    </div>
                  </div>

                  <a href={linkPlatit(item.url)} target="_blank" rel="sponsored noopener noreferrer"
                    className={`mt-auto ${culoare.textBtn} text-xs font-bold py-2.5 rounded-lg text-center transition-all hover:-translate-y-0.5`}
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
      <section className="max-w-5xl mx-auto px-4 py-10 border-t border-[#1f2329]">
        <div className="relative overflow-hidden rounded-xl p-7" style={{ background: "linear-gradient(120deg, rgba(13,148,136,0.12), rgba(20,184,166,0.10), rgba(16,185,129,0.10))" }}>
          <div className="absolute inset-0 border border-[#ddf93c]/20 rounded-xl pointer-events-none" />
          <h2 className="text-xl font-black text-[#ffffff] mb-2">Cauți un serviciu care lipsește?</h2>
          <p className="text-[#c9ced5] text-sm mb-5">
            AmCupon.ro preia automat ofertele de la {pesteMagazine()} și servicii partenere. Dacă știi un serviciu pe care nu-l avem, scrie-ne.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/recomandari"
              className="text-[#0c1000] font-bold px-5 py-2.5 rounded-xl text-sm transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #ddf93c, #ddf93c)" }}>
              Servicii recomandate →
            </Link>
            <Link href="/contact"
              className="bg-[#1f2329] hover:bg-[#2a2f36] text-[#ffffff] font-bold px-5 py-2.5 rounded-xl text-sm transition-all border border-[#2a2f36]">
              Sugereaza un serviciu
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
