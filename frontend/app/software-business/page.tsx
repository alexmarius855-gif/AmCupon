import { Metadata } from "next";
import Link from "next/link";
import fs from "fs";
import path from "path";

export const metadata: Metadata = {
  title: "Software Business cu Reducere Romania 2026 — SaaS, Facturare, Tools | AmCupon.ro",
  description: "Coduri de reducere la software business: facturare online, contabilitate, SEO tools, design, project management. Facturis-online.ro si multe altele.",
  keywords: ["software facturare reducere", "facturis-online reducere", "saas romania reducere", "tools business reducere", "semrush reducere", "canva pro reducere"],
  alternates: { canonical: "https://amcupon.ro/software-business" },
  openGraph: { title: "Software Business cu Reducere 2026 | AmCupon.ro", url: "https://amcupon.ro/software-business", siteName: "AmCupon.ro", locale: "ro_RO", type: "website" },
};

const TOOLS_INTL = [
  {
    categ: "Marketplace SaaS Deals",
    items: [
      { name: "AppSumo", desc: "Marketplace cu oferte lifetime deal la zeci de tool-uri SaaS — plata o singura data, acces pe viata, reduceri pana la 90%.", pret: "de la 29$ (lifetime)", comision: "program afiliat Impact.com", badge: "Oferte lifetime", url: "https://appsumo.8odi.net/AgnqdR", program: "appsumo.com/affiliate" },
    ],
  },
  {
    categ: "SEO & Marketing",
    items: [
      { name: "Semrush", desc: "Unealta SEO #1 la nivel mondial. Cercetare cuvinte, audit site, competitor analysis.", pret: "de la 99$/luna", comision: "200$ per vanzare", badge: "Recomandat #1", url: "https://semrush.com", program: "semrush.com/lp/inter-affiliate" },
      { name: "Canva Pro", desc: "Design profesional pentru social media, prezentari, materiale de marketing.", pret: "~13€/luna", comision: "36$ per conversie", badge: "Cel mai usor", url: "https://canva.com", program: "canva.com/affiliates" },
      { name: "GetResponse", desc: "Platforma completa de email marketing: newslettere, automatizari, landing pages si webinarii.", pret: "de la 15€/luna", comision: "program afiliat Awin", badge: "Email marketing", url: "https://www.awin1.com/cread.php?awinmid=3142111&awinaffid=101829567&clickref=", program: "getresponse.com/partners" },
    ],
  },
  {
    categ: "Productivitate & Colaborare",
    items: [
      { name: "Notion", desc: "All-in-one workspace: notite, baze de date, project management, wiki intern.", pret: "de la 8$/user/luna", comision: "program selectiv", badge: "Productivitate", url: "https://notion.so", program: "notion.so/affiliates" },
      { name: "Grammarly", desc: "Corectare gramatica si stil in engleza — esential pentru business international.", pret: "de la 12$/luna", comision: "20$ per Premium", badge: "Scriere profesionala", url: "https://grammarly.com", program: "grammarly.com/affiliates" },
    ],
  },
  {
    categ: "Securitate & Utilitare PC",
    items: [
      { name: "NordPass", desc: "Manager de parole de la echipa NordVPN — stocare criptata, autocompletare si monitorizare breșe de date.", pret: "de la 1.59€/luna", comision: "program afiliat Awin", badge: "Parole & securitate", url: "https://www.awin1.com/cread.php?awinmid=5324242&awinaffid=101829567&clickref=", program: "nordpass.com/partners" },
      { name: "Abelssoft", desc: "Pachet de utilitare PC: curatare, backup, dezinstalare completa, protectie date — pentru Windows.", pret: "de la 19.90€", comision: "program afiliat Awin", badge: "Utilitare PC", url: "https://www.awin1.com/cread.php?awinmid=6260179&awinaffid=101829567&clickref=", program: "abelssoft.de/affiliates" },
      { name: "O&O Software", desc: "Utilitare germane pentru optimizare Windows: defragmentare, stergere sigura, backup si migrare sistem.", pret: "de la 29.95€", comision: "program afiliat Awin", badge: "Optimizare Windows", url: "https://www.awin1.com/cread.php?awinmid=2381550&awinaffid=101829567&clickref=", program: "oo-software.com/affiliates" },
    ],
  },
];

interface Promotie { descriere?: string; cod_cupon?: string; zile_ramase?: number; }
interface Mag { magazin: string; url_afiliat: string; are_promotie: boolean; promotii: Promotie[]; comision?: string; descriere?: string; categorie_slug?: string; }

export default function SoftwareBusinessPage() {
  const allMag: Mag[] = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "public", "output.json"), "utf-8")
  );

  // Software/SaaS românesc din 2Performant
  const sw2p = allMag.filter(m =>
    ["facturis-online.ro", "chroot.ro"].includes(m.magazin) ||
    m.categorie_slug === "software"
  ).sort((a, b) => {
    // facturis primul (comision 35%)
    if (a.magazin === "facturis-online.ro") return -1;
    if (b.magazin === "facturis-online.ro") return 1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#06080b]">
      {/* Hero */}
      <section className="relative bg-[#06080b] border-b border-[#1f2329] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(13,148,136,0.10) 0%, transparent 65%)" }} />
        <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-10 text-center">
          <nav className="flex justify-center gap-2 text-xs text-[#9399a0] mb-8">
            <Link href="/" className="hover:text-[#c9ced5]">AmCupon.ro</Link>
            <span>/</span>
            <Link href="/servicii" className="hover:text-[#c9ced5]">Servicii</Link>
            <span>/</span>
            <span className="text-[#c9ced5]">Software Business</span>
          </nav>
          <div className="text-5xl mb-4">📊</div>
          <h1 className="text-4xl md:text-5xl font-black text-[#ffffff] mb-4">
            Software Business cu <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #c3dd2c, #ddf93c)" }}>Reducere</span>
          </h1>
          <p className="text-[#c9ced5] text-lg max-w-2xl mx-auto">
            SaaS-uri si tools pentru business, cu reduceri. Facturare, SEO, design, contabilitate — toate mai ieftine.
          </p>
        </div>
      </section>

      {/* Highlight: facturis-online.ro 35% */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-[#14181c]/40 to-[#14181c] border border-[#c3dd2c]/30 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="text-4xl">🏆</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-black text-[#ffffff] text-lg">Facturis-Online.ro</span>
              <span className="text-xs bg-emerald-800/60 text-emerald-400 border border-emerald-700/40 font-bold px-2 py-0.5 rounded-full">Recomandat</span>
            </div>
            <p className="text-[#c9ced5] text-sm">
              Software de facturare online romanesc, ideal pentru antreprenori, freelanceri si IMM-uri. Interfata simpla, functii complete si suport in romana.
            </p>
          </div>
          <a href="https://facturis-online.ro" target="_blank" rel="sponsored noopener noreferrer"
            className="shrink-0 bg-[#ddf93c] hover:bg-[#ddf93c] text-[#0c1000] font-black px-6 py-3 rounded-xl text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-[#ddf93c]/20">
            Vezi Facturis →
          </a>
        </div>
      </section>

      {/* Software 2Performant */}
      {sw2p.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-6 border-t border-[#1f2329]">
          <h2 className="text-xl font-black text-[#ffffff] mb-5">Software & SaaS Romania — Parteneri 2Performant</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sw2p.map(m => {
              const promo = m.promotii.find(p => (p.zile_ramase ?? 99) >= 0) ?? m.promotii[0] ?? {};
              const isFact = m.magazin === "facturis-online.ro";
              return (
                <div key={m.magazin} className={`bg-[#14181c] border rounded-xl p-5 flex flex-col gap-3 transition-all ${isFact ? "border-[#c3dd2c]/30 hover:border-[#ddf93c]/40" : "border-[#1f2329] hover:border-[#ddf93c]/20"}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-black text-[#ffffff]">{m.magazin.split(".")[0].charAt(0).toUpperCase() + m.magazin.split(".")[0].slice(1).replace("-", " ")}</p>
                      <p className="text-xs text-[#9399a0]">{m.magazin}</p>
                    </div>
                  </div>
                  {promo.descriere && <p className="text-[#c9ced5] text-xs">{promo.descriere.slice(0,100)}</p>}
                  {promo.cod_cupon && (
                    <div className="bg-[#1f2329] border border-dashed border-[#3a4048] rounded-lg px-3 py-2 text-center">
                      <p className="text-[10px] text-[#9399a0] mb-0.5">Cod reducere</p>
                      <p className="font-mono font-black text-[#ddf93c] text-sm">{promo.cod_cupon}</p>
                    </div>
                  )}
                  <a href={m.url_afiliat} target="_blank" rel="sponsored noopener noreferrer"
                    className={`mt-auto text-[#0c1000] text-sm font-bold py-2.5 rounded-lg text-center transition-all ${isFact ? "bg-[#ddf93c] hover:bg-[#ddf93c]" : "bg-[#2a2f36] hover:bg-[#1f2329]"}`}>
                    {promo.cod_cupon ? `Cod: ${promo.cod_cupon}` : "Vezi oferta"} →
                  </a>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Tools internationale */}
      {TOOLS_INTL.map(group => (
        <section key={group.categ} className="max-w-5xl mx-auto px-4 py-6 border-t border-[#1f2329]">
          <h2 className="text-xl font-black text-[#ffffff] mb-5">{group.categ} — International</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {group.items.map(item => (
              <div key={item.name} className="bg-[#14181c] border border-[#1f2329] hover:border-[#ddf93c]/20 rounded-xl p-5 flex flex-col gap-3 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-black text-[#ffffff]">{item.name}</span>
                      <span className="text-[10px] bg-[#ddf93c]/50 text-[#c3dd2c] border border-[#ddf93c]/40 px-1.5 py-0.5 rounded-full font-bold">{item.badge}</span>
                    </div>
                    <p className="text-xs text-[#c9ced5]">{item.desc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[#ddf93c] text-xs font-bold">{item.pret}</p>
                  </div>
                </div>
                <a href={item.url} target="_blank" rel="sponsored noopener noreferrer"
                  className="bg-[#ddf93c] hover:bg-[#ddf93c] text-[#0c1000] text-sm font-bold py-2.5 rounded-lg text-center transition-all hover:-translate-y-0.5">
                  Incearca {item.name} →
                </a>
                <p className="text-[10px] text-[#9399a0] text-center">Program afiliere: {item.program}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="max-w-5xl mx-auto px-4 pb-8">
        <p className="text-[#9399a0] text-xs text-center">Unele linkuri sunt linkuri de afiliat. AmCupon.ro primeste un comision daca faci o achizitie, fara cost suplimentar pentru tine.</p>
      </div>
    </div>
  );
}
