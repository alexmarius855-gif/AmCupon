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
  title: "Farmacie Online Ieftină România 2026 — Reduceri Dr. Max, Vegis | AmCupon.ro",
  description: "Coduri de reducere farmacie online România: Dr. Max, Vegis, Catena, Sensiblu. Suplimente, medicamente OTC, cosmetice medicale la prețuri reduse. Livrare rapidă.",
  keywords: ["farmacie online", "cod reducere dr max", "reduceri vegis", "suplimente ieftine", "medicamente online romania", "farmacie reducere", "catena online"],
  alternates: { canonical: "https://amcupon.ro/farmacie" },
  openGraph: { title: "Farmacie Online cu Reducere 2026 | AmCupon.ro", url: "https://amcupon.ro/farmacie", siteName: "AmCupon.ro", locale: "ro_RO", type: "website" },
};

const TOP_PHARMA = ["drmax.ro","vegis.ro","catena.ro","helpnet.ro","farmaciatei.ro","farmacia.ro"];
const CAT_PHARMA = ["pharma","health","sanatate","farmacie","medical","wellness"];
const AVANTAJE = [
  { icon: "💊", titlu: "Medicamente OTC", desc: "Antialgice, antitusive, vitamine — fara rețetă" },
  { icon: "🌿", titlu: "Naturiste & Suplimente", desc: "Plante medicinale, vitamine, probiotice" },
  { icon: "💄", titlu: "Cosmetice Medicale", desc: "Vichy, La Roche-Posay, Avène — dermatologic testate" },
  { icon: "🩺", titlu: "Aparate Medicale", desc: "Tensiometre, glucometre, termometre" },
  { icon: "🍼", titlu: "Mamă & Bebe", desc: "Produse pentru sarcină, bebeluși, alăptare" },
  { icon: "🐾", titlu: "Produse Veterinare", desc: "Antiparazitare, vitamine pentru animale" },
];

function numeAfisat(s: string) { return s.split(".")[0].replace(/-/g," ").split(" ").map(w=>w[0].toUpperCase()+w.slice(1)).join(" "); }
const CULORI = ["bg-green-500","bg-teal-500","bg-emerald-500","bg-cyan-500","bg-lime-500","bg-blue-500"];
const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Farmacie Online cu Reducere 2026","url":"https://amcupon.ro/farmacie","description":"Coduri reducere farmacii online Romania" };

export default function FarmaciePage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topPharma = TOP_PHARMA.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restPharma = all.filter(m =>
    !TOP_PHARMA.includes(m.magazin) && m.are_promotie &&
    CAT_PHARMA.some(c => (m.categorie_slug||"").includes(c) || m.categorie.toLowerCase().includes(c))
  ).slice(0, 16);
  const magazine = [...topPharma, ...restPharma];
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
            <span className="text-gray-700 font-medium">Farmacie Online</span>
          </div>
        </nav>

        {/* HERO */}
        <section className="bg-gradient-to-br from-green-600 via-teal-600 to-emerald-500 text-white py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">💊</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Farmacie Online cu Reducere {an}</h1>
            <p className="text-green-100 text-lg mb-6 max-w-xl mx-auto">
              Coduri de reducere verificate la Dr. Max, Vegis, Catena și alte farmacii online din România
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Suplimente","Vitamine","Cosmetice medicale","Aparate medicale","Mamă & Bebe"].map(c => (
                <span key={c} className="bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full border border-white/30">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* AVANTAJE */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-gray-900 mb-6 text-center">Ce găsești la farmacie online</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVANTAJE.map(a => (
              <div key={a.titlu} className="bg-green-50 border border-green-100 rounded-2xl p-5">
                <div className="text-3xl mb-2">{a.icon}</div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{a.titlu}</h3>
                <p className="text-xs text-gray-500">{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* MAGAZINE */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <div className="flex items-center gap-3 mb-5">
            {cuPromo.length > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">LIVE</span>}
            <h2 className="text-xl font-black text-gray-900">Farmacii online cu reduceri active</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {magazine.map((m, i) => {
              const nume = numeAfisat(m.magazin);
              const culoare = CULORI[i % CULORI.length];
              const promo = m.promotii[0];
              return (
                <a key={m.magazin} href={`/cod-reducere/${m.magazin}`}
                  className="group bg-white border border-gray-200 hover:border-green-300 rounded-2xl p-4 transition-all hover:shadow-md">
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
                    <span className="text-xs text-green-500 font-semibold group-hover:text-green-600">Vezi →</span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* SEO */}
        <section className="bg-gray-50 border-t border-gray-200 py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-gray-900 mb-5">Ghid: Farmacie online în România</h2>
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">De ce farmacie online?</h3>
                <p>Prețurile la suplimente și produse OTC pot fi cu 20-40% mai mici online față de farmacia fizică. Livrarea se face în 24-48h, iar gama de produse este mult mai largă. Dr. Max, Vegis și Catena sunt cele mai populare opțiuni în România.</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Cele mai cumpărate produse</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Vitamina D3 + K2</strong> — deficiență comună la români, esențial în anotimpul rece</li>
                  <li><strong>Magneziu bisglicinat</strong> — stres, somn, crampe musculare</li>
                  <li><strong>Omega-3 EPA+DHA</strong> — sănătate cardiovasculară și cognitivă</li>
                  <li><strong>Crema Vichy / La Roche-Posay</strong> — cosmetice dermatologice cu discounturi frecvente</li>
                  <li><strong>Tensiometru Omron</strong> — aparatură medicală la prețuri mai bune online</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Sfaturi pentru economii</h3>
                <p>Abonează-te la newsletter-ul Dr. Max și Vegis pentru coduri exclusive. Cumpără în cantități mai mari pentru discount suplimentar. Verifică secțiunea &ldquo;Oferte Zilnice&rdquo; înainte de orice comandă.</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400 mt-4">
          © {an} AmCupon.ro ·{" "}
          <a href="/idei-cadouri" className="hover:text-orange-500">Idei Cadouri</a>{" · "}
          <a href="/gadgets" className="hover:text-orange-500">Gadgets</a>{" · "}
          <a href="/categorii" className="hover:text-orange-500">Categorii</a>
        </footer>
      </div>
    </>
  );
}
