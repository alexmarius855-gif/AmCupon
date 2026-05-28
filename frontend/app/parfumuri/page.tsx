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
  title: "Cod Reducere Parfumuri România 2026 — Douglas, Notino, Sephora | AmCupon.ro",
  description: "Coduri de reducere parfumuri România: Douglas, Notino, Sephora, Makeup. Parfumuri originale, cosmetice, skincare la prețuri reduse. Verificate zilnic.",
  keywords: ["cod reducere parfumuri", "reduceri douglas", "parfumuri ieftine", "cod reducere notino", "sephora reducere", "parfumuri originale romania", "cosmetice reducere"],
  alternates: { canonical: "https://amcupon.ro/parfumuri" },
  openGraph: { title: "Parfumuri cu Reducere 2026 | AmCupon.ro", url: "https://amcupon.ro/parfumuri", siteName: "AmCupon.ro", locale: "ro_RO", type: "website" },
};

const TOP_BEAUTY = ["douglas.ro","notino.ro","sephora.ro","makeup.ro","marionnaud.ro","kiehl.ro","parfumexpress.ro"];
const CAT_BEAUTY = ["beauty","parfum","cosmet","frumus","makeup","skincare"];
const AVANTAJE = [
  { icon: "🌹", titlu: "Parfumuri de Lux", desc: "Chanel, Dior, YSL, Gucci — originale certificate" },
  { icon: "💄", titlu: "Machiaj", desc: "Fond de ten, ruj, rimel — branduri premium" },
  { icon: "🧴", titlu: "Skincare", desc: "Serumuri, creme, măști — rutina completă" },
  { icon: "🛁", titlu: "Îngrijire Corp", desc: "Loțiuni, uleiuri, exfolianți de lux" },
  { icon: "💅", titlu: "Nail Art", desc: "Ojă, geluri, accesorii manichiură" },
  { icon: "🎁", titlu: "Seturi Cadou", desc: "Seturi parfum + cremă — cadoul perfect" },
];

function numeAfisat(s: string) { return s.split(".")[0].replace(/-/g," ").split(" ").map(w=>w[0].toUpperCase()+w.slice(1)).join(" "); }
const CULORI = ["bg-pink-500","bg-rose-500","bg-fuchsia-500","bg-purple-500","bg-pink-600","bg-red-400"];
const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Parfumuri cu Reducere 2026","url":"https://amcupon.ro/parfumuri","description":"Coduri reducere parfumuri si cosmetice Romania — Douglas, Notino, Sephora" };

export default function ParfumuriPage() {
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
            <span className="text-gray-700 font-medium">Parfumuri cu Reducere</span>
          </div>
        </nav>

        <section className="bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-600 text-white py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">🌹</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Parfumuri cu Reducere {an}</h1>
            <p className="text-pink-100 text-lg mb-6 max-w-xl mx-auto">
              Coduri de reducere verificate la Douglas, Notino, Sephora și alte magazine de cosmetice din România
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Parfumuri originale","Machiaj","Skincare","Îngrijire corp","Seturi cadou","Nail art"].map(c => (
                <span key={c} className="bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full border border-white/30">{c}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-gray-900 mb-6 text-center">Ce găsești la parfumuri online</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVANTAJE.map(a => (
              <div key={a.titlu} className="bg-pink-50 border border-pink-100 rounded-2xl p-5">
                <div className="text-3xl mb-2">{a.icon}</div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{a.titlu}</h3>
                <p className="text-xs text-gray-500">{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-10">
          <div className="flex items-center gap-3 mb-5">
            {cuPromo.length > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">LIVE</span>}
            <h2 className="text-xl font-black text-gray-900">Magazine parfumuri cu reduceri active</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {magazine.map((m, i) => {
              const nume = numeAfisat(m.magazin);
              const culoare = CULORI[i % CULORI.length];
              const promo = m.promotii[0];
              return (
                <a key={m.magazin} href={`/cod-reducere/${m.magazin}`}
                  className="group bg-white border border-gray-200 hover:border-pink-300 rounded-2xl p-4 transition-all hover:shadow-md">
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
                      {m.are_promotie && !m.cod_cupon && <span className="text-xs text-pink-500 font-medium">Ofertă</span>}
                    </div>
                  </div>
                  {promo ? (
                    <p className="text-gray-500 text-xs line-clamp-2">{promo.nume}</p>
                  ) : (
                    <p className="text-gray-400 text-xs italic">Verifică ofertele curente</p>
                  )}
                  <div className="flex justify-end mt-2">
                    <span className="text-xs text-pink-500 font-semibold group-hover:text-pink-600">Vezi →</span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        <NisaProduse
          merchantSlugs={["douglas.ro","notino.ro","sephora.ro","makeup.ro","marionnaud.ro"]}
          titlu="Produse populare — Parfumuri & Cosmetice cu reducere"
          culoareAccent="pink"
          limit={12}
        />

        <section className="bg-gray-50 border-t border-gray-200 py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-gray-900 mb-5">Ghid: Parfumuri originale ieftine în România</h2>
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Douglas vs Notino vs Sephora</h3>
                <p>Douglas are cele mai frecvente reduceri și o gamă largă de branduri premium. Notino excelează la parfumuri de nișă și prețuri competitive. Sephora atrage cu seturi exclusive și produse limitată.</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Parfumuri populare cu reduceri frecvente</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Chanel Coco Mademoiselle</strong> — bestseller cu -15% periodic</li>
                  <li><strong>Dior Sauvage</strong> — cel mai vândut parfum masculin</li>
                  <li><strong>YSL Black Opium</strong> — favorit feminin cu reduceri regulate</li>
                  <li><strong>Giorgio Armani Si</strong> — floral, reduceri la seturi cadou</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Când să cumperi</h3>
                <p>Cele mai mari reduceri la parfumuri apar în noiembrie (Black Friday), înainte de Crăciun și de Valentine&apos;s Day. Douglas lansează frecvent promoții pentru membrii clubului de fidelitate.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-base font-black text-gray-700 mb-4">Exploreaza si alte categorii</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/frumusete", label: "💄 Frumusete" },
              { href: "/fashion", label: "👗 Fashion" },
              { href: "/idei-cadouri", label: "🎁 Idei Cadouri" },
              { href: "/sanatate", label: "🌿 Sanatate" },
              { href: "/categorii", label: "📂 Categorii" },
              { href: "/oferte-azi", label: "🔥 Oferte de Azi" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-gray-100 hover:bg-orange-50 hover:text-orange-600 text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-gray-200 hover:border-orange-200">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400 mt-4">
          © {an} AmCupon.ro ·{" "}
          <a href="/frumusete" className="hover:text-orange-500">Frumusețe</a>{" · "}
          <a href="/farmacie" className="hover:text-orange-500">Farmacie</a>{" · "}
          <a href="/categorii" className="hover:text-orange-500">Categorii</a>
        </footer>
      </div>
    </>
  );
}
