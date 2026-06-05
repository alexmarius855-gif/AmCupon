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
  title: "Cod Reducere Fashion & Haine 2026 — FashionDays, Answear, H&M | AmCupon.ro",
  description: "Coduri de reducere fashion Romania: FashionDays, Answear, H&M, Reserved, About You, Zara. Haine, pantofi, accesorii la preturi reduse. Verificate zilnic.",
  keywords: ["cod reducere fashiondays","reduceri answear","haine ieftine online","cod reducere hm","reserved reducere","fashion online romania","imbracaminte reducere"],
  alternates: { canonical: "https://amcupon.ro/fashion" },
  openGraph: { title: "Fashion & Haine cu Reducere 2026 | AmCupon.ro", url: "https://amcupon.ro/fashion", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_FASHION = ["fashiondays.ro","answear.ro","hm.com","reserved.com","about-you.ro","lc-waikiki.ro","zara.com","peek-cloppenburg.ro"];
const CAT_FASHION = ["fashion","clothing","clothes","haine","moda","apparel","imbracaminte"];
const AVANTAJE = [
  { icon: "👗", titlu: "Haine Dama", desc: "Rochii, bluze, pantaloni — branduri premium cu discount" },
  { icon: "👔", titlu: "Haine Barbati", desc: "Tricouri, camasi, costume — moda masculina la preturi reduse" },
  { icon: "👟", titlu: "Pantofi & Incaltaminte", desc: "Adidasi, pantofi, cizme — Nike, Adidas, Puma" },
  { icon: "👜", titlu: "Genti & Accesorii", desc: "Genti, curele, bijuterii fashion" },
  { icon: "🧥", titlu: "Outerwear", desc: "Geci, paltoane, jachete de sezon" },
  { icon: "🩱", titlu: "Lenjerie & Pijamale", desc: "Lenjerie intima, pijamale, sosete — branduri de calitate" },
];

function numeAfisat(s: string) { return s.split(".")[0].replace(/-/g," ").split(" ").map(w=>w[0].toUpperCase()+w.slice(1)).join(" "); }
const CULORI = ["bg-purple-500","bg-violet-500","bg-fuchsia-500","bg-indigo-500","bg-purple-600","bg-pink-500"];
const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Fashion & Haine cu Reducere 2026","url":"https://amcupon.ro/fashion","description":"Coduri reducere fashion si haine Romania — FashionDays, Answear, H&M, Reserved" };

export default function FashionPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topFashion = TOP_FASHION.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restFashion = all.filter(m =>
    !TOP_FASHION.includes(m.magazin) && m.are_promotie &&
    CAT_FASHION.some(c => (m.categorie_slug||"").includes(c) || m.categorie.toLowerCase().includes(c))
  ).slice(0, 16);
  const magazine = [...topFashion, ...restFashion];
  const cuPromo = magazine.filter(m => m.are_promotie);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-white">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 shrink-0">
              <div className="bg-orange-500 text-white font-black text-base px-2 py-1 rounded-lg">Am</div>
              <span className="font-black text-gray-900 text-xl">Cupon</span>
              <span className="text-orange-500 font-black text-xl">.ro</span>
            </Link>
          </div>
        </header>
        <nav className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-gray-400">
            <Link href="/" className="hover:text-orange-500">Acasa</Link>
            <span className="mx-1">/</span>
            <span className="text-gray-700 font-medium">Fashion & Haine cu Reducere</span>
          </div>
        </nav>

        <section className="bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-600 text-white py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">👗</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Fashion & Haine cu Reducere {an}</h1>
            <p className="text-purple-100 text-lg mb-6 max-w-xl mx-auto">
              Coduri de reducere verificate la FashionDays, Answear, H&M si alte magazine de moda din Romania
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Haine Dama","Haine Barbati","Pantofi","Genti","Geci","Lenjerie","Accesorii"].map(c => (
                <span key={c} className="bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full border border-white/30">{c}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-gray-900 mb-6 text-center">Ce gasesti la magazine fashion online</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVANTAJE.map(a => (
              <div key={a.titlu} className="bg-purple-50 border border-purple-100 rounded-2xl p-5">
                <div className="text-3xl mb-2">{a.icon}</div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{a.titlu}</h3>
                <p className="text-xs text-gray-500">{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-10">
          <div className="flex items-center gap-3 mb-5">
            
            <h2 className="text-xl font-black text-gray-900">Magazine fashion cu reduceri active</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {magazine.map((m, i) => {
              const nume = numeAfisat(m.magazin);
              const culoare = CULORI[i % CULORI.length];
              const promo = m.promotii[0];
              return (
                <a key={m.magazin} href={`/cod-reducere/${m.magazin}`}
                  className="group bg-white border border-gray-200 hover:border-purple-300 rounded-2xl p-4 transition-all hover:shadow-md">
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
                      {m.are_promotie && !m.cod_cupon && <span className="text-xs text-purple-500 font-medium">Oferta</span>}
                    </div>
                  </div>
                  {promo ? (
                    <p className="text-gray-500 text-xs line-clamp-2">{promo.nume}</p>
                  ) : (
                    <p className="text-gray-400 text-xs italic">Verifica ofertele curente</p>
                  )}
                  <div className="flex justify-end mt-2">
                    <span className="text-xs text-purple-500 font-semibold group-hover:text-purple-600">Vezi &rarr;</span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        <NisaProduse
          merchantSlugs={["fashiondays.ro","answear.ro","hm.com","reserved.com","about-you.ro","lc-waikiki.ro"]}
          titlu="Haine & accesorii populare cu reducere"
          culoareAccent="purple"
          limit={12}
        />

        <section className="bg-gray-50 border-t border-gray-200 py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-gray-900 mb-5">Ghid: Haine online mai ieftine in Romania</h2>
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">FashionDays vs Answear vs H&M</h3>
                <p>FashionDays are cele mai frecvente reduceri flash (24-48h) cu discount de 50-70%. Answear exceleaza la branduri premium internationale. H&M are mereu o sectiune Sale cu articole sub 50 lei, plus promotii pentru membrii club.</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Cele mai bune perioade pentru cumparaturi fashion</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Solduri de iarna (ianuarie)</strong> — reduceri 50-80% la colectiile de toamna-iarna</li>
                  <li><strong>Solduri de vara (iulie)</strong> — lichidare stocuri primavara-vara</li>
                  <li><strong>Black Friday</strong> — discount-uri la branduri premium</li>
                  <li><strong>Saptamana modei (septembrie)</strong> — promotii la colectii noi</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Cum economisesti la haine online</h3>
                <p>Adauga produsele in wishlist si asteapta promotii. FashionDays trimite notificari cand un produs din wishlist intra la reducere. Cumparaturile de la sfarsit de sezon pot economisi 60-80% fata de pretul initial.</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400 mt-4">
          © {an} AmCupon.ro ·{" "}
          <Link href="/frumusete" className="hover:text-orange-500">Frumusete</Link>{" · "}
          <Link href="/idei-cadouri" className="hover:text-orange-500">Idei Cadouri</Link>{" · "}
          <Link href="/categorii" className="hover:text-orange-500">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
