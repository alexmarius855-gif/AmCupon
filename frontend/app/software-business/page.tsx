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
    ],
  },
  {
    categ: "Productivitate & Colaborare",
    items: [
      { name: "Notion", desc: "All-in-one workspace: notite, baze de date, project management, wiki intern.", pret: "de la 8$/user/luna", comision: "program selectiv", badge: "Productivitate", url: "https://notion.so", program: "notion.so/affiliates" },
      { name: "Grammarly", desc: "Corectare gramatica si stil in engleza — esential pentru business international.", pret: "de la 12$/luna", comision: "20$ per Premium", badge: "Scriere profesionala", url: "https://grammarly.com", program: "grammarly.com/affiliates" },
    ],
  },
];

interface Promotie { descriere?: string; cod_cupon?: string; zile_ramase?: number; }
interface Mag { magazin: string; url_afiliat: string; are_promotie: boolean; promotii: Promotie[]; comision?: string; descriere?: string; }

export default function SoftwareBusinessPage() {
  const allMag: Mag[] = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "public", "output.json"), "utf-8")
  );

  // Software/SaaS românesc din 2Performant
  const sw2p = allMag.filter(m =>
    ["facturis-online.ro", "hostico.ro", "chroot.ro"].includes(m.magazin) ||
    (m as any).categorie_slug === "software" ||
    (m as any).categorie_slug === "office-supplies"
  ).sort((a, b) => {
    // facturis primul (comision 35%)
    if (a.magazin === "facturis-online.ro") return -1;
    if (b.magazin === "facturis-online.ro") return 1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      {/* Hero */}
      <section className="relative bg-[#F7F9FC] border-b border-[#e2e8f0] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(13,148,136,0.10) 0%, transparent 65%)" }} />
        <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-10 text-center">
          <nav className="flex justify-center gap-2 text-xs text-[#64748b] mb-8">
            <Link href="/" className="hover:text-[#334155]">AmCupon.ro</Link>
            <span>/</span>
            <Link href="/servicii" className="hover:text-[#334155]">Servicii</Link>
            <span>/</span>
            <span className="text-[#334155]">Software Business</span>
          </nav>
          <div className="text-5xl mb-4">📊</div>
          <h1 className="text-4xl md:text-5xl font-black text-[#0f172a] mb-4">
            Software Business cu <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #0f766e, #0d9488)" }}>Reducere</span>
          </h1>
          <p className="text-[#475569] text-lg max-w-2xl mx-auto">
            SaaS-uri si tools pentru business, cu reduceri. Facturare, SEO, design, contabilitate — toate mai ieftine.
          </p>
        </div>
      </section>

      {/* Highlight: facturis-online.ro 35% */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-[#ffffff]/40 to-[#ffffff] border border-[#0f766e]/30 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="text-4xl">🏆</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-black text-[#0f172a] text-lg">Facturis-Online.ro</span>
              <span className="text-xs bg-emerald-800/60 text-emerald-400 border border-emerald-700/40 font-bold px-2 py-0.5 rounded-full">Recomandat</span>
            </div>
            <p className="text-[#334155] text-sm">
              Software de facturare online romanesc, ideal pentru antreprenori, freelanceri si IMM-uri. Interfata simpla, functii complete si suport in romana.
            </p>
          </div>
          <a href="https://facturis-online.ro" target="_blank" rel="sponsored noopener noreferrer"
            className="shrink-0 bg-[#0d9488] hover:bg-[#14b8a6] text-white font-black px-6 py-3 rounded-xl text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-[#14b8a6]/20">
            Vezi Facturis →
          </a>
        </div>
      </section>

      {/* Software 2Performant */}
      {sw2p.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-6 border-t border-[#e2e8f0]">
          <h2 className="text-xl font-black text-[#0f172a] mb-5">Software & SaaS Romania — Parteneri 2Performant</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sw2p.map(m => {
              const promo = m.promotii.find(p => (p.zile_ramase ?? 99) >= 0) ?? m.promotii[0] ?? {};
              const isFact = m.magazin === "facturis-online.ro";
              return (
                <div key={m.magazin} className={`bg-[#ffffff] border rounded-xl p-5 flex flex-col gap-3 transition-all ${isFact ? "border-[#0f766e]/30 hover:border-[#14b8a6]/40" : "border-[#e2e8f0] hover:border-[#14b8a6]/20"}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-black text-[#0f172a]">{m.magazin.split(".")[0].charAt(0).toUpperCase() + m.magazin.split(".")[0].slice(1).replace("-", " ")}</p>
                      <p className="text-xs text-[#64748b]">{m.magazin}</p>
                    </div>
                  </div>
                  {promo.descriere && <p className="text-[#334155] text-xs">{promo.descriere.slice(0,100)}</p>}
                  {promo.cod_cupon && (
                    <div className="bg-[#e2e8f0] border border-dashed border-[#94a3b8] rounded-lg px-3 py-2 text-center">
                      <p className="text-[10px] text-[#64748b] mb-0.5">Cod reducere</p>
                      <p className="font-mono font-black text-[#0d9488] text-sm">{promo.cod_cupon}</p>
                    </div>
                  )}
                  <a href={m.url_afiliat} target="_blank" rel="sponsored noopener noreferrer"
                    className={`mt-auto text-white text-sm font-bold py-2.5 rounded-lg text-center transition-all ${isFact ? "bg-[#0d9488] hover:bg-[#14b8a6]" : "bg-[#e2e8f0] hover:bg-[#cbd5e1] border border-[#cbd5e1]"}`}>
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
        <section key={group.categ} className="max-w-5xl mx-auto px-4 py-6 border-t border-[#e2e8f0]">
          <h2 className="text-xl font-black text-[#0f172a] mb-5">{group.categ} — International</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {group.items.map(item => (
              <div key={item.name} className="bg-[#ffffff] border border-[#e2e8f0] hover:border-[#14b8a6]/20 rounded-xl p-5 flex flex-col gap-3 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-black text-[#0f172a]">{item.name}</span>
                      <span className="text-[10px] bg-[#14b8a6]/50 text-[#0f766e] border border-[#14b8a6]/40 px-1.5 py-0.5 rounded-full font-bold">{item.badge}</span>
                    </div>
                    <p className="text-xs text-[#475569]">{item.desc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[#0d9488] text-xs font-bold">{item.pret}</p>
                  </div>
                </div>
                <a href={item.url} target="_blank" rel="sponsored noopener noreferrer"
                  className="bg-[#0d9488] hover:bg-[#14b8a6] text-white text-sm font-bold py-2.5 rounded-lg text-center transition-all hover:-translate-y-0.5">
                  Incearca {item.name} →
                </a>
                <p className="text-[10px] text-[#94a3b8] text-center">Program afiliere: {item.program}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="max-w-5xl mx-auto px-4 pb-8">
        <p className="text-[#94a3b8] text-xs text-center">Unele linkuri sunt linkuri de afiliat. AmCupon.ro primeste un comision daca faci o achizitie, fara cost suplimentar pentru tine.</p>
      </div>
    </div>
  );
}
