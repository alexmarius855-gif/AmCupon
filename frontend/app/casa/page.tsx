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
  title: "Cod Reducere Casa & Gradina 2026 — Dedeman, IKEA, Leroy Merlin | AmCupon.ro",
  description: "Coduri de reducere casa si gradina Romania: Dedeman, IKEA, Leroy Merlin, Mobexpert, Jysk. Mobila, decoratiuni, gradina, electrocasnice mari la preturi reduse. Verificate zilnic.",
  keywords: ["cod reducere dedeman","reduceri ikea","mobila ieftina","cod reducere leroy merlin","mobexpert reducere","casa gradina reducere romania","electrocasnice reducere"],
  alternates: { canonical: "https://amcupon.ro/casa" },
  openGraph: { title: "Casa & Gradina cu Reducere 2026 | AmCupon.ro", url: "https://amcupon.ro/casa", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_CASA = ["dedeman.ro","ikea.com","leroy-merlin.ro","mobexpert.ro","jysk.ro","hornbach.ro","kika.ro","someproducts.ro"];
const CAT_CASA = ["home","garden","casa","gradina","home-garden","mobila","decor","furniture"];
const AVANTAJE = [
  { icon: "🛋️", titlu: "Mobila & Living", desc: "Canapele, paturi, dulapuri — branduri top la preturi reduse" },
  { icon: "🌿", titlu: "Gradina & Terasa", desc: "Mobilier gradina, plante, unelte — tot ce ai nevoie" },
  { icon: "🔨", titlu: "Bricolaj & Constructii", desc: "Materiale, scule, vopsele — Dedeman, Hornbach, Leroy" },
  { icon: "🍳", titlu: "Bucatarie", desc: "Electrocasnice, vase, accesorii bucatarie" },
  { icon: "🛁", titlu: "Baie & Sanitare", desc: "Cazi, dusuri, obiecte sanitare cu discount" },
  { icon: "💡", titlu: "Iluminat & Decoratiuni", desc: "Lustre, lampi, tablouri, obiecte decorative" },
];

function numeAfisat(s: string) { return s.split(".")[0].replace(/-/g," ").split(" ").map(w=>w[0].toUpperCase()+w.slice(1)).join(" "); }
const CULORI = ["bg-green-600","bg-emerald-500","bg-teal-500","bg-lime-600","bg-green-500","bg-cyan-600"];
const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Casa & Gradina cu Reducere 2026","url":"https://amcupon.ro/casa","description":"Coduri reducere casa si gradina Romania — Dedeman, IKEA, Leroy Merlin, Mobexpert" };

export default function CasaPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topCasa = TOP_CASA.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restCasa = all.filter(m =>
    !TOP_CASA.includes(m.magazin) && m.are_promotie &&
    CAT_CASA.some(c => (m.categorie_slug||"").includes(c) || m.categorie.toLowerCase().includes(c))
  ).slice(0, 16);
  const magazine = [...topCasa, ...restCasa];
  const cuPromo = magazine.filter(m => m.are_promotie);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-white">
        <nav className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-gray-400">
            <Link href="/" className="hover:text-orange-500">Acasa</Link>
            <span className="mx-1">/</span>
            <span className="text-gray-700 font-medium">Casa & Gradina cu Reducere</span>
          </div>
        </nav>

        <section className="bg-gradient-to-br from-green-700 via-emerald-600 to-teal-600 text-white py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">🏡</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Casa & Gradina cu Reducere {an}</h1>
            <p className="text-green-100 text-lg mb-6 max-w-xl mx-auto">
              Coduri de reducere verificate la Dedeman, IKEA, Leroy Merlin si alte magazine de amenajari din Romania
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Mobila","Bricolaj","Gradina","Electrocasnice","Decoratiuni","Baie"].map(c => (
                <span key={c} className="bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full border border-white/30">{c}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-gray-900 mb-6 text-center">Ce gasesti la magazine casa & gradina</h2>
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

        <section className="max-w-6xl mx-auto px-4 pb-10">
          <div className="flex items-center gap-3 mb-5">
            
            <h2 className="text-xl font-black text-gray-900">Magazine casa cu reduceri active</h2>
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
                      {m.are_promotie && !m.cod_cupon && <span className="text-xs text-green-500 font-medium">Oferta</span>}
                    </div>
                  </div>
                  {promo ? (
                    <p className="text-gray-500 text-xs line-clamp-2">{promo.nume}</p>
                  ) : (
                    <p className="text-gray-400 text-xs italic">Verifica ofertele curente</p>
                  )}
                  <div className="flex justify-end mt-2">
                    <span className="text-xs text-green-600 font-semibold group-hover:text-green-700">Vezi &rarr;</span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        <NisaProduse
          merchantSlugs={["dedeman.ro","ikea.com","leroy-merlin.ro","mobexpert.ro","jysk.ro","hornbach.ro"]}
          catSlug="casa"
          titlu="Produse populare — Casa & Gradina cu reducere"
          culoareAccent="green"
          limit={12}
        />

        <section className="bg-gray-50 border-t border-gray-200 py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-gray-900 mb-5">Ghid: Amenajari casa mai ieftine in Romania</h2>
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Dedeman vs IKEA vs Leroy Merlin</h3>
                <p>Dedeman este liderul la materiale de constructii si bricolaj — preturi competitive, retea nationala extinsa. IKEA exceleaza la mobilier functional, design scandinav si pret accesibil. Leroy Merlin are cea mai larga gama de produse gradina si amenajari.</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Cand sa cumperi mobila si electrocasnice</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Black Friday</strong> — reduceri 30-50% la electrocasnice mari si mobilier</li>
                  <li><strong>Ianuarie</strong> — solduri de iarna, stocuri vechi cu discount mare</li>
                  <li><strong>Primavara</strong> — promotii la articole gradina si mobilier exterior</li>
                  <li><strong>Septembrie</strong> — reluare sezon, promotii la renovari</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Sfaturi economii amenajari</h3>
                <p>Cumparati pachete complete de mobilier pentru discount suplimentar. Urmariti sectiunile "Outlet" si "Produse discontinue" la IKEA si Mobexpert — economisesti 40-70%. Codurile de reducere AmCupon se aplica la comenzile online.</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400 mt-4">
          © {an} AmCupon.ro ·{" "}
          <Link href="/electronice" className="hover:text-orange-500">Electronice</Link>{" · "}
          <Link href="/moto" className="hover:text-orange-500">Auto-Moto</Link>{" · "}
          <Link href="/categorii" className="hover:text-orange-500">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
