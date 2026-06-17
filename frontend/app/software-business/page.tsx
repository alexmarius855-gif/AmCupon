import { Metadata } from "next";
import Link from "next/link";
import fs from "fs";
import path from "path";

export const metadata: Metadata = {
  title: "Software Business cu Reducere Romania 2026 — SaaS, Facturare, Tools | AmCupon.ro",
  description: "Coduri de reducere la software business: facturare online, contabilitate, SEO tools, design, project management. Facturis-online.ro 35% comision si multe altele.",
  keywords: ["software facturare reducere", "facturis-online reducere", "saas romania reducere", "tools business reducere", "semrush reducere", "canva pro reducere"],
  alternates: { canonical: "https://amcupon.ro/software-business" },
  openGraph: { title: "Software Business cu Reducere 2026 | AmCupon.ro", url: "https://amcupon.ro/software-business", siteName: "AmCupon.ro", locale: "ro_RO", type: "website" },
};

const TOOLS_INTL = [
  {
    categ: "SEO & Marketing",
    items: [
      { name: "Semrush", desc: "Unealta SEO #1 la nivel mondial. Cercetare cuvinte, audit site, competitor analysis.", pret: "de la 99$/luna", comision: "200$ per vanzare", badge: "Comision maxim", url: "https://semrush.com", program: "semrush.com/lp/inter-affiliate" },
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
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="relative bg-slate-950 border-b border-slate-800 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245,158,11,0.07) 0%, transparent 65%)" }} />
        <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-10 text-center">
          <nav className="flex justify-center gap-2 text-xs text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300">AmCupon.ro</Link>
            <span>/</span>
            <Link href="/servicii" className="hover:text-slate-300">Servicii</Link>
            <span>/</span>
            <span className="text-slate-300">Software Business</span>
          </nav>
          <div className="text-5xl mb-4">📊</div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Software Business cu <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #f59e0b, #fbbf24)" }}>Reducere</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            SaaS-uri si tools pentru business cu comisioane mari. Facturare, SEO, design, contabilitate — toate mai ieftine.
          </p>
        </div>
      </section>

      {/* Highlight: facturis-online.ro 35% */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-700/30 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="text-4xl">🏆</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-black text-white text-lg">Facturis-Online.ro</span>
              <span className="text-xs bg-amber-600 text-white font-black px-2 py-0.5 rounded-full">35% comision</span>
              <span className="text-xs bg-emerald-800/60 text-emerald-400 border border-emerald-700/40 font-bold px-2 py-0.5 rounded-full">Cel mai mare din Romania</span>
            </div>
            <p className="text-slate-300 text-sm">
              Software de facturare online romanesc cu cel mai mare comision de afiliere din output.json. Fiecare abonament referit = 35% comision recurent.
              Ideal pentru audienta de antreprenori, freelanceri si IMM-uri.
            </p>
          </div>
          <a href="https://facturis-online.ro" target="_blank" rel="sponsored noopener noreferrer"
            className="shrink-0 bg-amber-500 hover:bg-amber-400 text-white font-black px-6 py-3 rounded-xl text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-amber-500/20">
            Vezi Facturis →
          </a>
        </div>
      </section>

      {/* Software 2Performant */}
      {sw2p.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-6 border-t border-slate-800">
          <h2 className="text-xl font-black text-white mb-5">Software & SaaS Romania — Parteneri 2Performant</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sw2p.map(m => {
              const promo = m.promotii.find(p => (p.zile_ramase ?? 99) >= 0) ?? m.promotii[0] ?? {};
              const isFact = m.magazin === "facturis-online.ro";
              return (
                <div key={m.magazin} className={`bg-slate-900 border rounded-xl p-5 flex flex-col gap-3 transition-all ${isFact ? "border-amber-700/30 hover:border-amber-500/40" : "border-slate-800 hover:border-cyan-500/20"}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-black text-white">{m.magazin.split(".")[0].charAt(0).toUpperCase() + m.magazin.split(".")[0].slice(1).replace("-", " ")}</p>
                      <p className="text-xs text-slate-500">{m.magazin}</p>
                    </div>
                    {m.comision && (
                      <span className={`text-xs font-black px-2 py-0.5 rounded-full ${isFact ? "bg-amber-600 text-white" : "text-indigo-400"}`}>
                        {m.comision.replace(" sale commission","").replace(" % sale commission","%")}
                      </span>
                    )}
                  </div>
                  {promo.descriere && <p className="text-slate-300 text-xs">{promo.descriere.slice(0,100)}</p>}
                  {promo.cod_cupon && (
                    <div className="bg-slate-800 border border-dashed border-slate-600 rounded-lg px-3 py-2 text-center">
                      <p className="text-[10px] text-slate-500 mb-0.5">Cod reducere</p>
                      <p className="font-mono font-black text-indigo-400 text-sm">{promo.cod_cupon}</p>
                    </div>
                  )}
                  <a href={m.url_afiliat} target="_blank" rel="sponsored noopener noreferrer"
                    className={`mt-auto text-white text-sm font-bold py-2.5 rounded-lg text-center transition-all ${isFact ? "bg-amber-600 hover:bg-amber-500" : "bg-slate-800 hover:bg-slate-700 border border-slate-700"}`}>
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
        <section key={group.categ} className="max-w-5xl mx-auto px-4 py-6 border-t border-slate-800">
          <h2 className="text-xl font-black text-white mb-5">{group.categ} — International</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {group.items.map(item => (
              <div key={item.name} className="bg-slate-900 border border-slate-800 hover:border-cyan-500/20 rounded-xl p-5 flex flex-col gap-3 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-black text-white">{item.name}</span>
                      <span className="text-[10px] bg-blue-800/50 text-blue-400 border border-blue-700/40 px-1.5 py-0.5 rounded-full font-bold">{item.badge}</span>
                    </div>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-indigo-400 text-xs font-bold">{item.pret}</p>
                    <p className="text-emerald-400 text-[10px]">{item.comision}</p>
                  </div>
                </div>
                <a href={item.url} target="_blank" rel="sponsored noopener noreferrer"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-2.5 rounded-lg text-center transition-all hover:-translate-y-0.5">
                  Incearca {item.name} →
                </a>
                <p className="text-[10px] text-slate-600 text-center">Program afiliere: {item.program}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="max-w-5xl mx-auto px-4 pb-8">
        <p className="text-slate-600 text-xs text-center">Unele linkuri sunt linkuri de afiliat. AmCupon.ro primeste un comision daca faci o achizitie, fara cost suplimentar pentru tine.</p>
      </div>
    </div>
  );
}
