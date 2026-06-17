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
  title: "Laptop Ieftin Romania 2026 — Coduri Reducere eMAG, Altex, PCGarage | AmCupon.ro",
  description: "Cele mai bune oferte laptopuri 2026: gaming, business, student. Reduceri verificate la eMAG, Altex, PCGarage, Flanco. Laptop sub 2000 lei, 3000 lei, 5000 lei.",
  keywords: ["laptop ieftin romania", "laptop gaming reducere", "laptop student ieftin", "cel mai bun laptop 2026", "laptop sub 3000 lei", "emag laptop reducere", "altex laptop promotie"],
  alternates: { canonical: "https://amcupon.ro/laptop" },
  openGraph: { title: "Laptop Ieftin Romania 2026 | AmCupon.ro", url: "https://amcupon.ro/laptop", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_LAPTOP = ["emag.ro","altex.ro","pcgarage.ro","flanco.ro","evomag.ro","cel.ro","quickmobile.ro"];
const CAT_LAPTOP = ["electronics","electronice","laptop","it"];

const BUGETE = [
  { pret: "Sub 2.000 lei", emoji: "💰", desc: "Chromebook, student basic, navigare web", culoare: "bg-emerald-600" },
  { pret: "2.000 – 3.500 lei", emoji: "💻", desc: "Office, multitasking, student productivitate", culoare: "bg-blue-600" },
  { pret: "3.500 – 5.000 lei", emoji: "⚡", desc: "Laptop gaming entry, creatori continut", culoare: "bg-violet-600" },
  { pret: "Peste 5.000 lei", emoji: "🚀", desc: "Gaming high-end, workstation, MacBook", culoare: "bg-indigo-600" },
];

const BRANDURI = [
  { brand: "ASUS", desc: "ROG (gaming), Zenbook (ultrabook), VivoBook (buget)" },
  { brand: "Lenovo", desc: "ThinkPad (business), Legion (gaming), IdeaPad (buget)" },
  { brand: "HP", desc: "Pavilion (buget), Spectre (premium), Omen (gaming)" },
  { brand: "Dell", desc: "XPS (ultrabook premium), Inspiron (buget), Alienware (gaming)" },
  { brand: "Acer", desc: "Nitro (gaming buget), Swift (ultrabook), Aspire (student)" },
  { brand: "Apple", desc: "MacBook Air M3 (eficienta), MacBook Pro (profesional)" },
];

function numeAfisat(s: string) { return s.split(".")[0].replace(/-/g," ").split(" ").map(w=>w[0].toUpperCase()+w.slice(1)).join(" "); }
const CULORI_BADGE = ["bg-blue-600","bg-indigo-600","bg-violet-600","bg-sky-600","bg-blue-500","bg-indigo-500","bg-teal-600"];
const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Laptop Ieftin Romania 2026","url":"https://amcupon.ro/laptop","description":"Oferte laptopuri Romania 2026 — gaming, business, student la preturi reduse" };

export default function LaptopPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topLaptop = TOP_LAPTOP.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restLaptop = all.filter(m =>
    !TOP_LAPTOP.includes(m.magazin) && m.are_promotie &&
    CAT_LAPTOP.some(c => (m.categorie_slug||"").includes(c) || m.categorie.toLowerCase().includes(c))
  ).slice(0, 8);
  const magazine = [...topLaptop, ...restLaptop];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-slate-950">

        {/* Breadcrumb */}
        <nav className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-1.5 text-xs text-slate-500">
            <Link href="/" className="hover:text-indigo-400 transition-colors">Acasa</Link>
            <span>/</span>
            <span className="text-slate-300 font-medium">Laptop Ieftin</span>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 py-16 px-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"/>
              Oferte verificate zilnic
            </div>
            <div className="text-6xl mb-5 drop-shadow-2xl">💻</div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Laptop Ieftin Romania <span className="text-transparent bg-clip-text" style={{backgroundImage:"linear-gradient(135deg, #60a5fa, #818cf8)"}}>{an}</span>
            </h1>
            <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Gaming, business, student — cele mai bune oferte laptopuri cu reduceri verificate zilnic
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Gaming","Student","Business","MacBook","Sub 3000 lei","Sub 5000 lei","Ultrabook"].map(c => (
                <span key={c} className="bg-white/8 border border-white/15 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Bugete */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">BUGET</p>
            <h2 className="text-2xl font-black text-white">Alege laptopul dupa buget</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BUGETE.map(b => (
              <div key={b.pret} className="bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/10">
                <div className={`w-11 h-11 ${b.culoare} rounded-xl flex items-center justify-center text-2xl mb-4`}>{b.emoji}</div>
                <h3 className="font-black text-white text-base mb-1.5">{b.pret}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Magazine */}
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">MAGAZINE PARTENERE</p>
              <h2 className="text-xl font-black text-white">Magazine laptopuri cu reduceri active</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {magazine.map((m, i) => {
              const nume = numeAfisat(m.magazin);
              const culoare = CULORI_BADGE[i % CULORI_BADGE.length];
              const promo = m.promotii[0];
              return (
                <a key={m.magazin} href={`/cod-reducere/${m.magazin}`}
                  className="group bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/10">
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
                      <p className="font-bold text-white text-sm group-hover:text-blue-300 transition-colors">{nume}</p>
                      {m.are_promotie && m.cod_cupon && <span className="text-[10px] font-black text-indigo-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded-full">COD</span>}
                      {m.are_promotie && !m.cod_cupon && <span className="text-[10px] font-medium text-emerald-400">Oferta activa</span>}
                    </div>
                  </div>
                  {promo ? (
                    <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">{promo.nume}</p>
                  ) : (
                    <p className="text-slate-600 text-xs italic">Verifica ofertele curente</p>
                  )}
                  <div className="flex justify-end mt-3">
                    <span className="text-xs text-blue-400 font-semibold group-hover:text-blue-300 flex items-center gap-1">
                      Vezi <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        <NisaProduse
          merchantSlugs={["emag.ro","altex.ro","pcgarage.ro","flanco.ro","evomag.ro","cel.ro"]}
          catSlug="electronice"
          titlu="Laptopuri populare cu reducere"
          culoareAccent="blue"
          limit={12}
        />

        {/* Ghid */}
        <section className="bg-slate-900 border-t border-slate-800 py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">GHID CUMPARATURI</p>
            <h2 className="text-2xl font-black text-white mb-7">Ce laptop sa cumperi in {an}</h2>
            <div className="space-y-5">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <h3 className="font-bold text-white mb-3 text-base">Cele mai bune branduri laptop in {an}</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {BRANDURI.map(b => (
                    <div key={b.brand} className="bg-slate-900 border border-slate-700 rounded-xl p-3">
                      <p className="font-bold text-white text-xs mb-1">{b.brand}</p>
                      <p className="text-xs text-slate-400">{b.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <h3 className="font-bold text-white mb-3 text-base">Ce specificatii conteaza cu adevarat</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  {[
                    ["Procesor","Intel Core i5/i7 13th gen sau AMD Ryzen 5/7 7000 — ambele excelente"],
                    ["RAM","minimum 16GB pentru confort real in 2026 (8GB e deja insuficient)"],
                    ["SSD","minimum 512GB NVMe — viteza de boot si aplicatii radical mai buna"],
                    ["Display","IPS 1920x1080 minimum; daca lucrezi cu imagini, cauta 2K/OLED"],
                    ["Baterie","50+ Wh pentru o zi completa de lucru fara incarcator"],
                  ].map(([bold, text]) => (
                    <li key={bold} className="flex gap-2">
                      <span className="text-blue-400 mt-0.5 shrink-0">→</span>
                      <span><strong className="text-white">{bold}:</strong> {text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <h3 className="font-bold text-white mb-2 text-base">Cand sunt cele mai mari reduceri la laptopuri</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Black Friday (noiembrie) si Zilele eMAG (mai, octombrie) aduc reduceri de 20-35% la laptopuri. Verifica codurile AmCupon pentru discount suplimentar de 5-10% aplicabil pe langa promotia activa.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Related */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">EXPLOREAZA SI</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/gaming", label: "🎮 Gaming" },
              { href: "/electronice", label: "📱 Electronice" },
              { href: "/gadgets", label: "📡 Gadgets" },
              { href: "/telefoane", label: "📲 Telefoane" },
              { href: "/oferte-azi", label: "🔥 Oferte de Azi" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500/40 text-slate-300 hover:text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-600">
          &copy; {an} AmCupon.ro &middot;{" "}
          <Link href="/electronice" className="hover:text-indigo-400 transition-colors">Electronice</Link>{" · "}
          <Link href="/gaming" className="hover:text-indigo-400 transition-colors">Gaming</Link>{" · "}
          <Link href="/categorii" className="hover:text-indigo-400 transition-colors">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
