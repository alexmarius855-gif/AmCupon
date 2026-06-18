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
  title: "Reduceri Beauty & Cosmetice 2026 — Coduri Notino, Douglas, Sephora | AmCupon.ro",
  description: "Coduri de reducere beauty și cosmetice 2026: Notino, Douglas, Sephora, Makeup.ro. Parfumuri, skincare, machiaj la prețuri reduse. Reduceri verificate zilnic.",
  keywords: ["reduceri beauty", "cod reducere notino", "reduceri douglas", "sephora reducere", "parfumuri ieftine", "cosmetice reducere romania", "skincare reducere", "machiaj ieftin"],
  alternates: { canonical: "https://amcupon.ro/frumusete" },
  openGraph: { title: "Reduceri Beauty & Cosmetice 2026 | AmCupon.ro", url: "https://amcupon.ro/frumusete", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_BEAUTY = ["notino.ro","douglas.ro","sephora.ro","makeup.ro","beautik.ro","elenfashion.ro"];
const CAT_BEAUTY = ["beauty","cosmetice","parfum","skincare","makeup","frumusete"];
const SUBCATEGORII = [
  { emoji: "🌸", label: "Skincare", desc: "Seruri, creme, măști" },
  { emoji: "💄", label: "Machiaj", desc: "Fond de ten, ruj, farduri" },
  { emoji: "🌹", label: "Parfumuri", desc: "Femei, bărbați, unisex" },
  { emoji: "💆", label: "Îngrijire corp", desc: "Loțiuni, scrub, uleiuri" },
  { emoji: "✂️", label: "Păr", desc: "Șampoane, măști, styling" },
  { emoji: "💅", label: "Manichiură", desc: "Ojă, gel UV, set unghii" },
];

function numeAfisat(s: string) { return s.split(".")[0].replace(/-/g," ").split(" ").map(w=>w[0].toUpperCase()+w.slice(1)).join(" "); }
const CULORI = ["bg-indigo-600","bg-indigo-600","bg-indigo-600","bg-indigo-600","bg-red-400","bg-pink-400"];
const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Reduceri Beauty & Cosmetice 2026","url":"https://amcupon.ro/frumusete" };

export default function FrumusetePage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topBeauty = TOP_BEAUTY.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restBeauty = all.filter(m =>
    !TOP_BEAUTY.includes(m.magazin) && m.are_promotie &&
    CAT_BEAUTY.some(c => (m.categorie_slug||"").includes(c) || m.categorie.toLowerCase().includes(c))
  ).slice(0, 16);
  const magazine = [...topBeauty, ...restBeauty];
  const cuPromo = magazine.filter(m => m.are_promotie);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-slate-950">
        <nav className="bg-slate-950 border-b border-slate-800">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-slate-500">
            <Link href="/" className="hover:text-indigo-400">Acasă</Link>
            <span className="mx-1">/</span>
            <span className="text-slate-300 font-medium">Frumusețe & Beauty</span>
          </div>
        </nav>

        {/* HERO */}
        <section className="bg-gradient-to-br from-indigo-700 via-blue-700 to-cyan-700 text-white py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">💄</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Beauty & Cosmetice cu Reducere {an}</h1>
            <p className="text-indigo-100 text-lg mb-6 max-w-xl mx-auto">
              Parfumuri originale, skincare premium, machiaj — coduri de reducere verificate zilnic la Notino, Douglas, Sephora
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUBCATEGORII.map(s => (
                <span key={s.label} className="bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full border border-white/30">
                  {s.emoji} {s.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* SUBCATEGORII */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-white mb-6 text-center">Categorii beauty populare</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SUBCATEGORII.map(s => (
              <a key={s.label} href="/categorii/beauty"
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:shadow-md transition-all group">
                <div className="text-3xl mb-2">{s.emoji}</div>
                <h3 className="font-bold text-white text-sm mb-1">{s.label}</h3>
                <p className="text-xs text-slate-400 mb-3">{s.desc}</p>
                <p className="text-xs font-bold text-indigo-400 group-hover:text-indigo-400">Vezi reduceri →</p>
              </a>
            ))}
          </div>
        </section>

        {/* MAGAZINE */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <div className="flex items-center gap-3 mb-5">
            
            <h2 className="text-xl font-black text-white">Magazine beauty cu reduceri active</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {magazine.map((m, i) => {
              const nume = numeAfisat(m.magazin);
              const culoare = CULORI[i % CULORI.length];
              const promo = m.promotii[0];
              return (
                <a key={m.magazin} href={`/cod-reducere/${m.magazin}`}
                  className="group bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-4 transition-all hover:shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    {m.logo_url ? (
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-slate-800 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={m.logo_url} alt={`Logo ${nume}`} className="w-full h-full object-contain" loading="lazy" />
                      </div>
                    ) : (
                      <div className={`w-10 h-10 rounded-xl ${culoare} flex items-center justify-center text-white font-black text-lg shrink-0`}>
                        {nume[0]}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-white text-sm">{nume}</p>
                      {m.are_promotie && m.cod_cupon && <span className="text-xs text-indigo-400 font-bold">COD</span>}
                      {m.are_promotie && !m.cod_cupon && <span className="text-xs text-cyan-400 font-medium">Ofertă</span>}
                    </div>
                  </div>
                  {promo ? (
                    <p className="text-slate-400 text-xs line-clamp-2">{promo.nume}</p>
                  ) : (
                    <p className="text-slate-500 text-xs italic">Verifică ofertele curente</p>
                  )}
                  <div className="flex justify-end mt-2">
                    <span className="text-xs text-indigo-400 font-semibold group-hover:text-indigo-400">Vezi →</span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        <NisaProduse
          merchantSlugs={["notino.ro","douglas.ro","sephora.ro","makeup.ro","beautik.ro"]}
          catSlug="beauty"
          titlu="Produse beauty populare cu reducere"
          culoareAccent="indigo"
          limit={12}
        />

        {/* SEO */}
        <section className="bg-slate-900 border-t border-slate-800 py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-white mb-5">Ghid cumpărături beauty inteligente</h2>
            <div className="space-y-4 text-sm text-slate-400 leading-relaxed">
              <div>
                <h3 className="font-bold text-white mb-1">Parfumuri originale mai ieftin</h3>
                <p>Notino este cel mai bun loc pentru parfumuri originale din România — prețuri cu 30-50% sub parfumeria fizică, autenticitate garantată. Douglas are exclusivități și pachete cadou premium. Caută coduri de reducere Notino pe AmCupon.ro înainte de orice comandă.</p>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Skincare la prețuri reduse</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Vichy & La Roche-Posay</strong> — mai ieftin în farmacii online (Dr. Max, Sensiblu) decât în parfumerii</li>
                  <li><strong>The Ordinary</strong> — raport calitate-preț excepțional, activi puri la prețuri mici</li>
                  <li><strong>Notino Flash Sales</strong> — reduceri temporare la branduri premium, abonează-te la newsletter</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Cele mai bune momente pentru cumpărături beauty</h3>
                <p>Valentine&apos;s Day (parfumuri), 8 Martie (seturi cadou), Black Friday (electrice păr, skincare) și Crăciunul (seturi premium) sunt perioadele cu cele mai mari reduceri la beauty.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-base font-black text-slate-300 mb-4">Exploreaza si alte categorii</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/parfumuri", label: "🌹 Parfumuri" },
              { href: "/sanatate", label: "🌿 Sanatate" },
              { href: "/fashion", label: "👗 Fashion" },
              { href: "/idei-cadouri", label: "🎁 Idei Cadouri" },
              { href: "/farmacie", label: "💊 Farmacie" },
              { href: "/oferte-azi", label: "🔥 Oferte de Azi" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-slate-900 hover:bg-slate-800 hover:text-indigo-300 text-slate-300 text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-slate-800 hover:border-cyan-200">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500 mt-4">
          © {an} AmCupon.ro ·{" "}
          <Link href="/idei-cadouri" className="hover:text-indigo-400">Idei Cadouri</Link>{" · "}
          <Link href="/categorii/beauty" className="hover:text-indigo-400">Categorie Beauty</Link>{" · "}
          <Link href="/categorii" className="hover:text-indigo-400">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
