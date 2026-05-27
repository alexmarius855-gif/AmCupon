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
  title: "Coduri Reducere Auto-Moto 2026 — Piese, Accesorii, Echipamente | AmCupon.ro",
  description: "Coduri de reducere auto și moto verificate: piese auto, accesorii mașini, echipamente moto, anvelope, uleiuri. Magazine partenere verificate zilnic pe AmCupon.ro.",
  keywords: ["cod reducere auto", "reducere piese auto", "accesorii moto reducere", "anvelope reducere", "cod reducere moto", "magazin auto online reducere"],
  alternates: { canonical: "https://amcupon.ro/moto" },
  openGraph: { title: "Auto-Moto — Coduri Reducere 2026 | AmCupon.ro", url: "https://amcupon.ro/moto", siteName: "AmCupon.ro", locale: "ro_RO", type: "website" },
};

const MOTO_SLUGS = ["autonom.ro", "autodoc.ro", "kfzteile24.ro", "americanexpress.ro"];
const CAT_MOTO = ["automotive", "auto", "moto", "car"];

function numeAfisat(s: string) { return s.split(".")[0].replace(/-/g," ").split(" ").map(w=>w[0].toUpperCase()+w.slice(1)).join(" "); }
const CULORI = ["bg-slate-600","bg-gray-700","bg-zinc-600","bg-stone-600","bg-neutral-600","bg-blue-700","bg-red-700","bg-orange-600"];

const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Coduri Reducere Auto-Moto 2026","url":"https://amcupon.ro/moto" };

const ARTICOLE_MOTO = [
  { title: "Cel mai bun dash cam 2026", href: "/blog/cel-mai-bun-dashcam-2026" },
  { title: "Accesorii mașină esențiale", href: "/blog/cele-mai-bune-accesorii-masina-2026" },
  { title: "Scuter electric — ce alegi?", href: "/blog/cel-mai-bun-scuter-electric-2026" },
  { title: "Cum alegi anvelopele potrivite", href: "/blog/cum-alegi-anvelopele-2026" },
];

export default function MotoPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topMoto = MOTO_SLUGS.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restMoto = all.filter(m =>
    !MOTO_SLUGS.includes(m.magazin) &&
    CAT_MOTO.some(c => (m.categorie_slug||"").includes(c) || m.categorie.toLowerCase().includes(c))
  ).slice(0, 30);
  const magazine = [...topMoto, ...restMoto];
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
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-gray-400">
            <a href="/" className="hover:text-orange-500">Acasă</a>
            <span className="mx-1 text-gray-300">/</span>
            <span className="text-gray-700 font-medium">Auto-Moto</span>
          </div>
        </nav>

        {/* HERO */}
        <section className="bg-gradient-to-br from-gray-800 via-slate-700 to-gray-900 text-white py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">🏍️</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Auto-Moto {an}</h1>
            <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
              Piese auto, accesorii, echipamente moto, anvelope — coduri de reducere verificate
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
              {[
                { val: `${magazine.length}+`, label: "Magazine" },
                { val: `${cuPromo.length}`, label: "Cu reduceri" },
                { val: "Zilnic", label: "Verificat" },
              ].map(s => (
                <div key={s.label} className="bg-white/10 rounded-2xl py-3 px-2">
                  <div className="text-xl font-black">{s.val}</div>
                  <div className="text-xs text-gray-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SUBCATEGORII */}
        <section className="bg-white border-b border-gray-100 py-5 px-4">
          <div className="max-w-6xl mx-auto flex flex-wrap gap-2 justify-center">
            {[
              { emoji:"🔧", label:"Piese auto" },
              { emoji:"🛞", label:"Anvelope" },
              { emoji:"⛽", label:"Uleiuri & Filtre" },
              { emoji:"🚗", label:"Accesorii mașină" },
              { emoji:"🏍️", label:"Echipament moto" },
              { emoji:"📷", label:"Dashcam & GPS" },
              { emoji:"🔋", label:"Baterii auto" },
              { emoji:"🛵", label:"Scutere electrice" },
            ].map(c => (
              <span key={c.label}
                className="flex items-center gap-1.5 bg-slate-50 text-slate-700 font-semibold text-sm px-4 py-2 rounded-full border border-slate-200">
                <span>{c.emoji}</span>{c.label}
              </span>
            ))}
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {magazine.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <div className="text-5xl mb-4">🔧</div>
              <h2 className="text-xl font-black text-gray-900 mb-2">Magazine auto disponibile</h2>
              <p className="text-gray-500 mb-6">Verificăm zilnic ofertele de la partenerii auto. Încearcă categoria principală.</p>
              <a href="/categorii/automotive"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                Magazine Auto-Moto →
              </a>
            </div>
          ) : (
            <>
              {cuPromo.length > 0 && (
                <section className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">LIVE</span>
                    <h2 className="text-xl font-black text-gray-900">Oferte active</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cuPromo.map((m, i) => {
                      const nume = numeAfisat(m.magazin);
                      const culoare = CULORI[i % CULORI.length];
                      const promo = m.promotii[0];
                      return (
                        <a key={m.magazin} href={`/cod-reducere/${m.magazin}`}
                          className="group bg-white border border-gray-200 hover:border-orange-300 rounded-2xl p-5 transition-all hover:shadow-md">
                          <div className="flex items-center gap-3 mb-3">
                            {m.logo_url ? (
                              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 shrink-0">
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
                              {m.cod_cupon && <span className="text-xs text-orange-500 font-bold">COD REDUCERE</span>}
                            </div>
                          </div>
                          {promo && <p className="text-gray-500 text-xs line-clamp-2 mb-2">{promo.nume}</p>}
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400">{m.promotii.length} oferte</span>
                            <span className="text-xs text-orange-500 font-semibold group-hover:text-orange-600">Vezi →</span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </section>
              )}

              <section>
                <h2 className="text-lg font-black text-gray-900 mb-4">Toate magazinele auto-moto</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {magazine.filter(m => !m.are_promotie).map((m, i) => {
                    const nume = numeAfisat(m.magazin);
                    const culoare = CULORI[i % CULORI.length];
                    return (
                      <a key={m.magazin} href={`/cod-reducere/${m.magazin}`}
                        className="flex items-center gap-3 bg-white border border-gray-200 hover:border-orange-300 rounded-xl p-3 transition-all group">
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
                        <span className="text-sm font-semibold text-gray-700 group-hover:text-orange-500 transition-colors truncate">{nume}</span>
                      </a>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          {/* ARTICOLE */}
          {ARTICOLE_MOTO.length > 0 && (
            <section className="mt-10 bg-slate-50 rounded-2xl p-6">
              <h2 className="text-lg font-black text-gray-900 mb-4">🔧 Ghiduri Auto-Moto</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {ARTICOLE_MOTO.map(a => (
                  <a key={a.href} href={a.href}
                    className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 hover:text-orange-500 border border-gray-200 hover:border-orange-300 transition-all">
                    <span className="text-orange-400">→</span>{a.title}
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* SEO */}
          <section className="mt-10 bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-black text-gray-900 mb-4">Despre reducerile auto-moto</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              AmCupon.ro agregă coduri de reducere de la cele mai mari magazine auto online din România.
              Găsești oferte pentru piese auto, accesorii, anvelope, uleiuri și echipamente moto.
              Toate codurile sunt verificate zilnic — rata de succes și data expirării sunt afișate transparent.
              Economisești la întreținerea mașinii tale fără să pierzi timp cu coduri expirate.
            </p>
          </section>
        </div>

        <NisaProduse
          merchantSlugs={["autonom.ro","autodoc.ro","kfzteile24.ro"]}
          titlu="Accesorii auto cu reducere"
          culoareAccent="orange"
          limit={12}
        />

        <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400 mt-4">
          © {an} AmCupon.ro · <a href="/" className="hover:text-orange-500">Acasă</a>
          {" · "}<a href="/gadgets" className="hover:text-orange-500">Gadgets</a>
          {" · "}<a href="/idei-cadouri" className="hover:text-orange-500">Idei Cadouri</a>
        </footer>
      </div>
    </>
  );
}
