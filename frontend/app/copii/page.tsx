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
  title: "Reduceri Jucării & Haine Copii 2026 — Coduri Noriel, eMAG | AmCupon.ro",
  description: "Coduri reducere magazine copii 2026: Noriel, eMAG, FashionDays Copii, H&M Kids. Jucării, haine, cărucioare, scaune auto — la prețuri reduse.",
  keywords: ["reduceri jucarii", "cod reducere noriel", "haine copii reducere", "jucarii ieftine online", "emag copii reducere", "carucior reducere", "scaun auto copil reducere"],
  alternates: { canonical: "https://amcupon.ro/copii" },
  openGraph: { title: "Reduceri Copii & Jucării 2026 | AmCupon.ro", url: "https://amcupon.ro/copii", siteName: "AmCupon.ro", locale: "ro_RO", type: "website" },
};

const TOP_COPII = ["noriel.ro","emag.ro","smythstoys.com","bebetei.ro","bebe-tei.ro","mothercare.ro","chicco.ro"];
const CAT_COPII = ["kids","babies","toys","copii","jucarii","bebelusi","children","baby"];
const GRUPE_VARSTA = [
  { emoji: "👶", label: "0-2 ani", desc: "Cărucioare, scaune auto, jucării senzoriale" },
  { emoji: "🧒", label: "3-6 ani", desc: "LEGO Duplo, jocuri de rol, seturi creative" },
  { emoji: "👦", label: "7-12 ani", desc: "LEGO Technic, cărți, jocuri video, biciclete" },
  { emoji: "👧", label: "Fete 3-12 ani", desc: "Păpuși, seturi bijuterii, cărți ilustrate" },
];

function numeAfisat(s: string) { return s.split(".")[0].replace(/-/g," ").split(" ").map(w=>w[0].toUpperCase()+w.slice(1)).join(" "); }
const CULORI = ["bg-yellow-400","bg-pink-500","bg-blue-400","bg-green-400","bg-purple-400","bg-orange-400"];
const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Reduceri Copii & Jucării 2026","url":"https://amcupon.ro/copii" };

export default function CopiiPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topCopii = TOP_COPII.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restCopii = all.filter(m =>
    !TOP_COPII.includes(m.magazin) && m.are_promotie &&
    CAT_COPII.some(c => (m.categorie_slug||"").includes(c) || m.categorie.toLowerCase().includes(c))
  ).slice(0, 16);
  const magazine = [...topCopii, ...restCopii];
  const cuPromo = magazine.filter(m => m.are_promotie);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-white">
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
            <span className="mx-1">/</span>
            <span className="text-gray-700 font-medium">Copii & Jucării</span>
          </div>
        </nav>

        {/* HERO */}
        <section className="bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-400 text-white py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">🧸</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Jucării & Copii cu Reducere {an}</h1>
            <p className="text-yellow-100 text-lg mb-6 max-w-xl mx-auto">
              LEGO, păpuși, haine copii, cărucioare, scaune auto — coduri de reducere verificate
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["LEGO","Păpuși","Haine Kids","Cărucioare","Scaune auto","Cărți copii","Parcuri de joacă","Baby monitor"].map(c => (
                <span key={c} className="bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full border border-white/30">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* GRUPE VARSTA */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-gray-900 mb-6 text-center">Cadouri și cumpărături pe vârstă</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {GRUPE_VARSTA.map(g => (
              <a key={g.label} href="/categorii/babies-kids-toys"
                className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 hover:shadow-md transition-all group">
                <div className="text-3xl mb-2">{g.emoji}</div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{g.label}</h3>
                <p className="text-xs text-gray-500">{g.desc}</p>
                <p className="text-xs font-bold text-orange-500 mt-3 group-hover:text-orange-600">Vezi reduceri →</p>
              </a>
            ))}
          </div>
        </section>

        {/* MAGAZINE */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <div className="flex items-center gap-3 mb-5">
            {cuPromo.length > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">LIVE</span>}
            <h2 className="text-xl font-black text-gray-900">Magazine copii cu reduceri active</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {magazine.map((m, i) => {
              const nume = numeAfisat(m.magazin);
              const culoare = CULORI[i % CULORI.length];
              const promo = m.promotii[0];
              return (
                <a key={m.magazin} href={`/cod-reducere/${m.magazin}`}
                  className="group bg-white border border-gray-200 hover:border-yellow-300 rounded-2xl p-4 transition-all hover:shadow-md">
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
                      {m.are_promotie && m.cod_cupon && <span className="text-xs text-orange-500 font-bold">COD</span>}
                      {m.are_promotie && !m.cod_cupon && <span className="text-xs text-green-500 font-medium">Ofertă</span>}
                    </div>
                  </div>
                  {promo ? (
                    <p className="text-gray-500 text-xs line-clamp-2">{promo.nume}</p>
                  ) : (
                    <p className="text-gray-400 text-xs italic">Verifică ofertele curente</p>
                  )}
                  <div className="flex justify-end mt-2">
                    <span className="text-xs text-yellow-600 font-semibold group-hover:text-yellow-700">Vezi →</span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        <NisaProduse
          merchantSlugs={["noriel.ro","emag.ro","smythstoys.com","bebetei.ro","bebe-tei.ro","chicco.ro"]}
          titlu="Jucarii si produse copii cu reducere"
          culoareAccent="yellow"
          limit={12}
        />

        {/* SEO */}
        <section className="bg-gray-50 border-t border-gray-200 py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-gray-900 mb-5">Ghid cumpărături copii inteligente</h2>
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Cum economisești la jucării și haine copii</h3>
                <p>Noriel oferă cele mai bune prețuri la jucăriile populare (LEGO, Barbie, Hot Wheels) și are frecvent reduceri și pachete speciale. eMAG are gamă mai largă dar prețuri variabile — compară mereu.</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Cele mai bune momente pentru cumpărături copii</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Noiembrie (Black Friday)</strong> — cele mai mari reduceri la jucării scumpe (LEGO, console)</li>
                  <li><strong>Ianuarie</strong> — solduri post-Crăciun, reduceri 40-60% la stocuri rămase</li>
                  <li><strong>August (Back to School)</strong> — rechizite, ghiozdane, haine de scoală</li>
                  <li><strong>Luna nașterii</strong> — multe magazine trimit coduri exclusive la zi de naștere</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400 mt-4">
          © {an} AmCupon.ro ·{" "}
          <a href="/idei-cadouri" className="hover:text-orange-500">Idei Cadouri</a>{" · "}
          <a href="/categorii/babies-kids-toys" className="hover:text-orange-500">Categorie Copii</a>{" · "}
          <a href="/categorii" className="hover:text-orange-500">Categorii</a>
        </footer>
      </div>
    </>
  );
}
