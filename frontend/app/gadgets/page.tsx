import { Metadata } from "next";
import fs from "fs";
import path from "path";

interface Promotie { nume: string; cod_cupon: string; landing_page: string; zile_ramase: number; }
interface Magazin {
  magazin: string; url: string; url_afiliat: string; logo_url?: string;
  categorie: string; categorie_slug?: string; scor_final: number;
  are_promotie: boolean; cod_cupon: boolean; promotii: Promotie[]; trend: number;
}

export const metadata: Metadata = {
  title: "Gadgets & Accesorii Tech 2026 — Coduri Reducere | AmCupon.ro",
  description: "Gadgets, smartwatch-uri, căști wireless, smart home, drone și accesorii tech — coduri de reducere verificate pentru tot ce e nou și interesant în tech.",
  keywords: ["gadgets reducere", "smartwatch ieftin", "casti wireless reducere", "drone reducere", "smart home romania", "accesorii tech cod reducere"],
  alternates: { canonical: "https://amcupon.ro/gadgets" },
  openGraph: { title: "Gadgets & Tech — Coduri Reducere | AmCupon.ro", url: "https://amcupon.ro/gadgets", siteName: "AmCupon.ro", locale: "ro_RO", type: "website" },
};

const GADGET_SLUGS = ["emag.ro", "altex.ro", "flanco.ro", "elefant.ro", "quickmobile.ro", "cel.ro", "pcgarage.ro", "evomag.ro"];
const CAT_GADGET = ["electronics", "telecom", "games", "software", "gadget"];

function numeAfisat(s: string) { return s.split(".")[0].replace(/-/g," ").split(" ").map(w=>w[0].toUpperCase()+w.slice(1)).join(" "); }
const CULORI = ["bg-blue-500","bg-indigo-500","bg-purple-500","bg-teal-500","bg-cyan-500","bg-sky-500","bg-violet-500","bg-emerald-500"];

const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Gadgets & Tech — Coduri Reducere 2026","url":"https://amcupon.ro/gadgets" };

const ARTICOLE_GADGET = [
  { title: "Cel mai bun smartwatch 2026", href: "/blog/cel-mai-bun-smartwatch-2026" },
  { title: "Căști wireless — top recomandări", href: "/blog/cele-mai-bune-casti-wireless-2026" },
  { title: "Smart home — ghid complet", href: "/blog/cel-mai-bun-sistem-smart-home-2026" },
  { title: "Cel mai bun power bank 2026", href: "/blog/cel-mai-bun-power-bank-2026" },
  { title: "Drone pentru începători", href: "/blog/cea-mai-buna-drona-2026" },
  { title: "Gadgeturi utile sub 100 lei", href: "/blog/cele-mai-bune-gadgeturi-ieftine-2026" },
];

export default function GadgetsPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topGadget = GADGET_SLUGS.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restTech = all.filter(m =>
    !GADGET_SLUGS.includes(m.magazin) &&
    CAT_GADGET.some(c => (m.categorie_slug||"").includes(c) || m.categorie.toLowerCase().includes(c))
  ).slice(0, 20);
  const magazine = [...topGadget, ...restTech];
  const cuPromo = magazine.filter(m => m.are_promotie);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
            <a href="/" className="flex items-center gap-1.5 shrink-0">
              <div className="bg-orange-500 text-white font-black text-base px-2 py-1 rounded-lg">Am</div>
              <span className="font-black text-gray-900 text-xl">Cupon</span>
              <span className="text-orange-500 font-black text-xl">.ro</span>
            </a>
          </div>
        </header>

        <nav className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-gray-400 flex-wrap">
            <a href="/" className="hover:text-orange-500 transition-colors">Acasă</a>
            <span className="mx-1 text-gray-300">/</span>
            <span className="text-gray-700 font-medium">Gadgets & Tech</span>
          </div>
        </nav>

        {/* HERO */}
        <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">📡</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Gadgets & Tech {an}</h1>
            <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              Smartwatch-uri, căști wireless, drone, smart home — coduri de reducere verificate pentru tot ce e nou în tech
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
              {[
                { val: `${magazine.length}+`, label: "Magazine" },
                { val: `${cuPromo.length}+`, label: "Oferte active" },
                { val: "Zilnic", label: "Actualizat" },
              ].map(s => (
                <div key={s.label} className="bg-white/15 rounded-2xl py-3 px-2">
                  <div className="text-xl font-black">{s.val}</div>
                  <div className="text-xs text-blue-200">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORII GADGET */}
        <section className="bg-white border-b border-gray-100 py-6 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { emoji:"⌚", label:"Smartwatch-uri", href:"/blog/cel-mai-bun-smartwatch-2026" },
                { emoji:"🎧", label:"Căști wireless", href:"/blog/cele-mai-bune-casti-wireless-2026" },
                { emoji:"🏠", label:"Smart Home", href:"/blog/cel-mai-bun-sistem-smart-home-2026" },
                { emoji:"🔋", label:"Power Bank", href:"/blog/cel-mai-bun-power-bank-2026" },
                { emoji:"🚁", label:"Drone", href:"/blog/cea-mai-buna-drona-2026" },
                { emoji:"📷", label:"Camere acțiune", href:"/blog/cea-mai-buna-camera-video-sport-2026" },
                { emoji:"🎮", label:"Gaming", href:"/categorii/games" },
                { emoji:"📱", label:"Telefoane", href:"/blog/cel-mai-bun-telefon-pentru-poze-2026" },
              ].map(c => (
                <a key={c.label} href={c.href}
                  className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold text-sm px-4 py-2 rounded-full transition-colors border border-blue-200">
                  <span>{c.emoji}</span>{c.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* MAGAZINE CU PROMOTII */}
          {cuPromo.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-5">
                <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">LIVE</span>
                <h2 className="text-xl font-black text-gray-900">Oferte active acum</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cuPromo.map((m, i) => {
                  const nume = numeAfisat(m.magazin);
                  const culoare = CULORI[i % CULORI.length];
                  const promo = m.promotii[0];
                  return (
                    <a key={m.magazin} href={`/cod-reducere/${m.magazin}`}
                      className="group bg-white border border-gray-200 hover:border-blue-300 rounded-2xl p-5 transition-all hover:shadow-md">
                      <div className="flex items-center gap-3 mb-3">
                        {m.logo_url ? (
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={m.logo_url} alt={`Logo ${nume}`} className="w-full h-full object-contain" loading="lazy" />
                          </div>
                        ) : (
                          <div className={`w-10 h-10 rounded-xl ${culoare} flex items-center justify-center text-white font-black text-lg shrink-0`}>
                            {nume[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{nume}</p>
                          {m.cod_cupon && <span className="text-xs text-blue-600 font-bold">COD REDUCERE</span>}
                        </div>
                      </div>
                      {promo && <p className="text-gray-500 text-xs line-clamp-2 mb-2">{promo.nume}</p>}
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">{m.promotii.length} oferte</span>
                        <span className="text-xs text-blue-500 font-semibold group-hover:text-blue-600">Vezi →</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </section>
          )}

          {/* TOATE MAGAZINELE */}
          <section className="mb-10">
            <h2 className="text-lg font-black text-gray-900 mb-4">Toate magazinele tech</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {magazine.filter(m => !m.are_promotie).map((m, i) => {
                const nume = numeAfisat(m.magazin);
                const culoare = CULORI[i % CULORI.length];
                return (
                  <a key={m.magazin} href={`/cod-reducere/${m.magazin}`}
                    className="flex items-center gap-3 bg-white border border-gray-200 hover:border-blue-300 rounded-xl p-3 transition-all group">
                    {m.logo_url ? (
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={m.logo_url} alt={`Logo ${nume}`} className="w-full h-full object-contain" loading="lazy" />
                      </div>
                    ) : (
                      <div className={`w-8 h-8 rounded-lg ${culoare} flex items-center justify-center text-white font-black text-sm shrink-0`}>
                        {nume[0]}
                      </div>
                    )}
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors truncate">{nume}</span>
                  </a>
                );
              })}
            </div>
          </section>

          {/* ARTICOLE */}
          <section className="bg-blue-50 rounded-2xl p-6">
            <h2 className="text-lg font-black text-gray-900 mb-4">📖 Ghiduri & Recenzii Gadgets</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ARTICOLE_GADGET.map(a => (
                <a key={a.href} href={a.href}
                  className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:border-blue-300 border border-gray-200 transition-all group">
                  <span className="text-blue-400 group-hover:text-blue-500">→</span>
                  {a.title}
                </a>
              ))}
            </div>
          </section>
        </div>

        <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400 mt-4">
          © {an} AmCupon.ro · <a href="/" className="hover:text-orange-500">Acasă</a>
          {" · "}<a href="/black-friday" className="hover:text-orange-500">Black Friday</a>
          {" · "}<a href="/moto" className="hover:text-orange-500">Auto-Moto</a>
        </footer>
      </div>
    </>
  );
}
