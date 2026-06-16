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
  title: "Telefon Ieftin Romania 2026 — Coduri Samsung, iPhone, Xiaomi | AmCupon.ro",
  description: "Cele mai bune oferte telefoane 2026: Samsung Galaxy, iPhone, Xiaomi, OnePlus. Reduceri verificate la eMAG, Altex, Flanco, Orange. Telefon sub 1000, 2000, 3000 lei.",
  keywords: ["telefon ieftin romania", "smartphone reducere 2026", "samsung reducere", "iphone reducere romania", "xiaomi ieftin", "telefon sub 2000 lei", "emag telefoane reducere"],
  alternates: { canonical: "https://amcupon.ro/telefoane" },
  openGraph: { title: "Telefon Ieftin Romania 2026 | AmCupon.ro", url: "https://amcupon.ro/telefoane", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_TEL = ["emag.ro","altex.ro","flanco.ro","evomag.ro","cel.ro","orange.ro","vodafone.ro","quickmobile.ro"];
const CAT_TEL = ["electronics","electronice","telecom","mobile"];

const BUGETE_TEL = [
  { pret: "Sub 1.000 lei", emoji: "📱", desc: "Android de baza, retea 4G, camera decenta", culoare: "bg-emerald-600" },
  { pret: "1.000 – 2.000 lei", emoji: "📲", desc: "Mid-range solid: Xiaomi, Samsung A, OnePlus Nord", culoare: "bg-teal-600" },
  { pret: "2.000 – 4.000 lei", emoji: "✨", desc: "Flagship mid: Samsung S, Pixel, iPhone SE", culoare: "bg-cyan-600" },
  { pret: "Peste 4.000 lei", emoji: "👑", desc: "Flagship: iPhone 16, Samsung S25, OnePlus 13", culoare: "bg-orange-500" },
];

const BRANDURI_TEL = [
  { brand: "Samsung", desc: "Galaxy A (buget), Galaxy S (flagship), Fold/Flip (pliabile)" },
  { brand: "Apple iPhone", desc: "SE (buget), 15 (standard), 15 Pro (premium)" },
  { brand: "Xiaomi", desc: "Redmi (buget), Mi/14 (flagship) — raport calitate-pret excelent" },
  { brand: "OnePlus", desc: "Nord (mid), 12/13 (flagship rapid) — incarcator 100W+" },
  { brand: "Google Pixel", desc: "Camera AI superioara, update-uri Android garantate 7 ani" },
  { brand: "Motorola", desc: "Moto G (buget solid), Edge (mid-range), Razr (pliabil)" },
];

function numeAfisat(s: string) { return s.split(".")[0].replace(/-/g," ").split(" ").map(w=>w[0].toUpperCase()+w.slice(1)).join(" "); }
const CULORI_BADGE = ["bg-teal-600","bg-cyan-600","bg-blue-600","bg-emerald-600","bg-sky-600","bg-teal-500","bg-green-600","bg-indigo-600"];
const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Telefon Ieftin Romania 2026","url":"https://amcupon.ro/telefoane","description":"Oferte telefoane Romania 2026 — Samsung, iPhone, Xiaomi la preturi reduse" };

export default function TelefoaneePage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topTel = TOP_TEL.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restTel = all.filter(m =>
    !TOP_TEL.includes(m.magazin) && m.are_promotie &&
    CAT_TEL.some(c => (m.categorie_slug||"").includes(c) || m.categorie.toLowerCase().includes(c))
  ).slice(0, 6);
  const magazine = [...topTel, ...restTel];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-slate-950">

        {/* Breadcrumb */}
        <nav className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-1.5 text-xs text-slate-500">
            <Link href="/" className="hover:text-orange-400 transition-colors">Acasa</Link>
            <span>/</span>
            <span className="text-slate-300 font-medium">Telefoane cu Reducere</span>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-teal-950 via-slate-900 to-cyan-950 py-16 px-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/3 w-80 h-80 bg-teal-600/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-cyan-600/15 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"/>
              Oferte verificate zilnic
            </div>
            <div className="text-6xl mb-5 drop-shadow-2xl">📲</div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Telefoane cu Reducere <span className="text-transparent bg-clip-text" style={{backgroundImage:"linear-gradient(135deg, #2dd4bf, #22d3ee)"}}>{an}</span>
            </h1>
            <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Samsung, iPhone, Xiaomi, OnePlus — coduri reducere verificate zilnic la eMAG, Altex, Flanco, Orange
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Samsung Galaxy","iPhone 15","Xiaomi 14","OnePlus 13","Sub 1000 lei","Sub 2000 lei","5G"].map(c => (
                <span key={c} className="bg-white/8 border border-white/15 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Bugete */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-2">BUGET</p>
            <h2 className="text-2xl font-black text-white">Alege telefonul dupa buget</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BUGETE_TEL.map(b => (
              <div key={b.pret} className="bg-slate-900 border border-slate-800 hover:border-teal-500/40 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-500/10">
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
              <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">MAGAZINE PARTENERE</p>
              <h2 className="text-xl font-black text-white">Magazine telefoane cu reduceri active</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {magazine.map((m, i) => {
              const nume = numeAfisat(m.magazin);
              const culoare = CULORI_BADGE[i % CULORI_BADGE.length];
              const promo = m.promotii[0];
              return (
                <a key={m.magazin} href={`/cod-reducere/${m.magazin}`}
                  className="group bg-slate-900 border border-slate-800 hover:border-teal-500/50 rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-500/10">
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
                      <p className="font-bold text-white text-sm group-hover:text-teal-300 transition-colors">{nume}</p>
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
                    <span className="text-xs text-teal-400 font-semibold group-hover:text-teal-300 flex items-center gap-1">
                      Vezi <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        <NisaProduse
          merchantSlugs={["emag.ro","altex.ro","flanco.ro","evomag.ro","cel.ro","orange.ro","quickmobile.ro"]}
          catSlug="electronice"
          titlu="Telefoane populare cu reducere"
          culoareAccent="teal"
          limit={12}
        />

        {/* Ghid */}
        <section className="bg-slate-900 border-t border-slate-800 py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-3">GHID CUMPARATURI</p>
            <h2 className="text-2xl font-black text-white mb-7">Ce telefon sa cumperi in {an}</h2>
            <div className="space-y-5">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <h3 className="font-bold text-white mb-3 text-base">Cele mai bune branduri in {an}</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {BRANDURI_TEL.map(b => (
                    <div key={b.brand} className="bg-slate-900 border border-slate-700 rounded-xl p-3">
                      <p className="font-bold text-white text-xs mb-1">{b.brand}</p>
                      <p className="text-xs text-slate-400">{b.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <h3 className="font-bold text-white mb-2 text-base">Android sau iPhone — care e mai bun?</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Daca ai deja Mac/iPad, iPhone se integreaza perfect. Daca vrei flexibilitate maxima si pret mai bun la specificatii similare, Samsung sau Xiaomi sunt alegeri mai inteligente. Xiaomi Redmi Note 13 Pro+ ofera camera 200MP si incarcare 67W la 1.600 lei — raport calitate-pret greu de batut.</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <h3 className="font-bold text-white mb-3 text-base">Cand sa cumperi un telefon mai ieftin</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  {[
                    ["Dupa lansarea modelului nou","pretul modelului vechi scade cu 15-30% imediat"],
                    ["Black Friday","reduceri 20-40% la modele mid-range si flagship din generatia anterioara"],
                    ["Zilele eMAG","campanii de 2-3 ori pe an cu preturi foarte bune"],
                  ].map(([bold, text]) => (
                    <li key={bold} className="flex gap-2">
                      <span className="text-teal-400 mt-0.5 shrink-0">→</span>
                      <span><strong className="text-white">{bold}</strong> — {text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Related */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">EXPLOREAZA SI</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/laptop", label: "💻 Laptop" },
              { href: "/electronice", label: "📱 Electronice" },
              { href: "/gadgets", label: "📡 Gadgets" },
              { href: "/gaming", label: "🎮 Gaming" },
              { href: "/oferte-azi", label: "🔥 Oferte de Azi" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-teal-500/40 text-slate-300 hover:text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-600">
          &copy; {an} AmCupon.ro &middot;{" "}
          <Link href="/electronice" className="hover:text-orange-400 transition-colors">Electronice</Link>{" · "}
          <Link href="/laptop" className="hover:text-orange-400 transition-colors">Laptop</Link>{" · "}
          <Link href="/categorii" className="hover:text-orange-400 transition-colors">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
