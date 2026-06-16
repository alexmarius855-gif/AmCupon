import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import NisaProduse from "../components/NisaProduse";

interface Promotie { nume: string; cod_cupon: string; landing_page: string; zile_ramase: number; }
interface Magazin {
  magazin: string; url: string; url_afiliat: string; logo_url?: string;
  categorie: string; categorie_slug?: string; scor_final: number;
  are_promotie: boolean; cod_cupon: boolean; promotii: Promotie[]; trend: number;
}

export const metadata: Metadata = {
  title: "Reduceri Gaming 2026 — Coduri eMAG, PCGarage, Altex | AmCupon.ro",
  description: "Coduri reducere gaming Romania 2026: laptopuri gaming, placi video, monitoare, periferice. eMAG, PCGarage, Altex, Evomag — oferte verificate zilnic.",
  keywords: ["reduceri gaming", "laptop gaming ieftin", "placa video reducere", "monitor gaming reducere", "pcgarage cod reducere", "emag gaming reducere", "periferice gaming ieftine"],
  alternates: { canonical: "https://amcupon.ro/gaming" },
  openGraph: { title: "Reduceri Gaming 2026 | AmCupon.ro", url: "https://amcupon.ro/gaming", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_GAMING = ["pcgarage.ro","emag.ro","altex.ro","evomag.ro","flanco.ro","cel.ro","quickmobile.ro"];
const CAT_GAMING = ["gaming","periferice","electronics","electronice"];
const CATEGORII_GAMING = [
  { emoji: "💻", titlu: "Laptopuri Gaming", desc: "ASUS ROG, Lenovo Legion, MSI, Acer Nitro — performanta maxima portabila" },
  { emoji: "🖥️", titlu: "Monitoare Gaming", desc: "144Hz, 240Hz, 4K — pentru gaming competitiv sau casual" },
  { emoji: "🎮", titlu: "Console & Jocuri", desc: "PS5, Xbox, Nintendo Switch, jocuri digitale la pret redus" },
  { emoji: "⌨️", titlu: "Periferice", desc: "Tastatura mecanica, mouse gaming, casti, controller wireless" },
  { emoji: "🖱️", titlu: "Placi Video", desc: "NVIDIA RTX, AMD Radeon — upgrade pentru FPS maxim" },
  { emoji: "🔊", titlu: "Audio Gaming", desc: "Casti surround 7.1, microfoane, soundbar gaming" },
];

function numeAfisat(s: string) { return s.split(".")[0].replace(/-/g," ").split(" ").map(w=>w[0].toUpperCase()+w.slice(1)).join(" "); }
const CULORI_BADGE = ["bg-purple-600","bg-indigo-600","bg-blue-600","bg-violet-600","bg-sky-600","bg-purple-500","bg-blue-500"];
const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Reduceri Gaming 2026","url":"https://amcupon.ro/gaming","description":"Coduri reducere gaming Romania — laptopuri, placi video, monitoare, periferice" };

export default function GamingPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topGaming = TOP_GAMING.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restGaming = all.filter(m =>
    !TOP_GAMING.includes(m.magazin) && m.are_promotie &&
    CAT_GAMING.some(c => (m.categorie_slug||"").includes(c) || m.categorie.toLowerCase().includes(c))
  ).slice(0, 8);
  const magazine = [...topGaming, ...restGaming];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-slate-950">

        {/* Breadcrumb */}
        <nav className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-1.5 text-xs text-slate-500">
            <Link href="/" className="hover:text-orange-400 transition-colors">Acasa</Link>
            <span>/</span>
            <span className="text-slate-300 font-medium">Gaming</span>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-slate-900 to-indigo-950 py-16 px-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl" />
            <div className="absolute inset-0" style={{backgroundImage:"radial-gradient(circle at 50% 50%, transparent 0%, rgba(15,23,42,0.6) 100%)"}} />
          </div>
          <div className="relative max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"/>
              Oferte verificate zilnic
            </div>
            <div className="text-6xl mb-5 drop-shadow-2xl">🎮</div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Gaming cu Reducere <span className="text-transparent bg-clip-text" style={{backgroundImage:"linear-gradient(135deg, #c084fc, #818cf8)"}}>{an}</span>
            </h1>
            <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Laptopuri gaming, placi video, monitoare si periferice — coduri reducere verificate la PCGarage, eMAG, Altex
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {["Laptop Gaming","Monitor 144Hz","Placa Video RTX","Mouse Gaming","Tastatura Mecanica","Casti Gaming","Controller PS5"].map(c => (
                <span key={c} className="bg-white/8 border border-white/15 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Categorii gaming */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">CATEGORII</p>
            <h2 className="text-2xl font-black text-white">Echipament gaming pe categorii</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORII_GAMING.map((a, i) => (
              <div key={a.titlu}
                className="group bg-slate-900 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${CULORI_BADGE[i % CULORI_BADGE.length]}`}>{a.emoji}</div>
                  <h3 className="font-bold text-white text-sm">{a.titlu}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Magazine */}
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">MAGAZINE PARTENERE</p>
              <h2 className="text-xl font-black text-white">Magazine gaming cu reduceri active</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {magazine.map((m, i) => {
              const nume = numeAfisat(m.magazin);
              const culoare = CULORI_BADGE[i % CULORI_BADGE.length];
              const promo = m.promotii[0];
              return (
                <a key={m.magazin} href={`/cod-reducere/${m.magazin}`}
                  className="group bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/10">
                  <div className="flex items-center gap-3 mb-3">
                    {m.logo_url ? (
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-white flex items-center justify-center shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={m.logo_url} alt={`Logo ${nume}`} className="w-8 h-8 object-contain" loading="lazy" />
                      </div>
                    ) : (
                      <div className={`w-10 h-10 rounded-xl ${culoare} flex items-center justify-center text-white font-black text-lg shrink-0`}>{nume[0]}</div>
                    )}
                    <div>
                      <p className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors">{nume}</p>
                      {m.are_promotie && m.cod_cupon && <span className="text-[10px] font-black text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded-full">COD</span>}
                      {m.are_promotie && !m.cod_cupon && <span className="text-[10px] font-medium text-emerald-400">Oferta activa</span>}
                    </div>
                  </div>
                  {promo ? (
                    <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">{promo.nume}</p>
                  ) : (
                    <p className="text-slate-600 text-xs italic">Verifica ofertele curente</p>
                  )}
                  <div className="flex justify-end mt-3">
                    <span className="text-xs text-purple-400 font-semibold group-hover:text-purple-300 flex items-center gap-1">
                      Vezi <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        <NisaProduse
          merchantSlugs={["pcgarage.ro","emag.ro","altex.ro","evomag.ro","flanco.ro","cel.ro"]}
          catSlug="electronice"
          titlu="Produse gaming populare cu reducere"
          culoareAccent="purple"
          limit={12}
        />

        {/* Ghid */}
        <section className="bg-slate-900 border-t border-slate-800 py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">GHID CUMPARATURI</p>
            <h2 className="text-2xl font-black text-white mb-7">Cum cumperi echipament gaming mai ieftin</h2>
            <div className="space-y-6 text-sm text-slate-400 leading-relaxed">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <h3 className="font-bold text-white mb-2 text-base">PCGarage vs eMAG vs Altex — care e mai ieftin?</h3>
                <p>PCGarage are cel mai bun pret la componente PC (placi video, procesoare, RAM) — specializati in gaming. eMAG are gama mai larga si frecvent campanii cu reduceri masive. Altex are avantaj la laptopuri gaming prin promotii periodice. Verifica mereu toate trei inainte de orice achizitie.</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <h3 className="font-bold text-white mb-3 text-base">Cel mai bun moment sa cumperi echipament gaming</h3>
                <ul className="space-y-2">
                  {[
                    ["Black Friday (noiembrie)","reduceri 20-40% la laptopuri gaming si monitoare"],
                    ["Lansarea generatiei noi","cand apare RTX 5000, pretul la RTX 4000 scade instant"],
                    ["Vara (iulie-august)","reduceri la stocuri de iarna (casti, controllere)"],
                    ["Campionii de Gaming eMAG","campanie dedicata, reduceri bune la periferice"],
                  ].map(([bold, text]) => (
                    <li key={bold} className="flex gap-2">
                      <span className="text-purple-400 mt-0.5 shrink-0">→</span>
                      <span><strong className="text-white">{bold}</strong> — {text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <h3 className="font-bold text-white mb-2 text-base">Laptop gaming recomandat sub 4000 lei</h3>
                <p>Acer Nitro 5 si Lenovo IdeaPad Gaming ofera cel mai bun raport performanta-pret sub 4000 lei. Cauta modele cu RTX 3050 sau RTX 4050, 16GB RAM, SSD 512GB. Frecvent gasesti reduceri de 300-500 lei la eMAG sau PCGarage cu coduri AmCupon.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Related */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">EXPLOREAZA SI</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/electronice", label: "📱 Electronice" },
              { href: "/gadgets", label: "📡 Gadgets" },
              { href: "/laptop", label: "💻 Laptop" },
              { href: "/jocuri", label: "🕹️ Jocuri" },
              { href: "/oferte-azi", label: "🔥 Oferte de Azi" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-purple-500/40 text-slate-300 hover:text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-600 mt-4">
          &copy; {an} AmCupon.ro &middot;{" "}
          <Link href="/electronice" className="hover:text-orange-400 transition-colors">Electronice</Link>{" · "}
          <Link href="/gadgets" className="hover:text-orange-400 transition-colors">Gadgets</Link>{" · "}
          <Link href="/categorii" className="hover:text-orange-400 transition-colors">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
