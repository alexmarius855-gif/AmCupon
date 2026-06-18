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
  title: "Cod Reducere Electronice România 2026 — eMag, Altex, PCGarage | AmCupon.ro",
  description: "Coduri de reducere electronice România: eMag, Altex, PCGarage, Flanco, Cel.ro. Telefoane, laptopuri, TV, gaming la prețuri reduse. Verificate zilnic.",
  keywords: ["cod reducere emag", "reduceri altex", "electronice ieftine", "cod reducere pcgarage", "laptop reducere", "telefon reducere romania", "electronice online"],
  alternates: { canonical: "https://amcupon.ro/electronice" },
  openGraph: { title: "Electronice cu Reducere 2026 | AmCupon.ro", url: "https://amcupon.ro/electronice", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_TECH = ["emag.ro","altex.ro","pcgarage.ro","flanco.ro","cel.ro","mediagalaxy.ro","evomag.ro","vexio.ro"];
const CAT_TECH = ["electronics","itc","electronice","tech","it","gadget","electro"];
const AVANTAJE = [
  { icon: "📱", titlu: "Telefoane & Tablete", desc: "iPhone, Samsung, Xiaomi — cele mai bune oferte" },
  { icon: "💻", titlu: "Laptopuri & PC", desc: "Gaming, office, ultrabook-uri la prețuri reduse" },
  { icon: "📺", titlu: "TV & Audio", desc: "Smart TV 4K, soundbar, căști wireless" },
  { icon: "🎮", titlu: "Gaming", desc: "Console, jocuri, accesorii PlayStation & Xbox" },
  { icon: "📷", titlu: "Foto & Video", desc: "Camere foto, drone, accesorii" },
  { icon: "⌚", titlu: "Smartwatch & Wearables", desc: "Apple Watch, Samsung Galaxy Watch, brățări fitness" },
];

function numeAfisat(s: string) { return s.split(".")[0].replace(/-/g," ").split(" ").map(w=>w[0].toUpperCase()+w.slice(1)).join(" "); }
const CULORI = ["bg-indigo-600","bg-indigo-500","bg-indigo-600","bg-cyan-500","bg-indigo-600","bg-indigo-600"];
const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Electronice cu Reducere 2026","url":"https://amcupon.ro/electronice","description":"Coduri reducere electronice online Romania — eMag, Altex, PCGarage" };

export default function ElectronicePage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topTech = TOP_TECH.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restTech = all.filter(m =>
    !TOP_TECH.includes(m.magazin) && m.are_promotie &&
    CAT_TECH.some(c => (m.categorie_slug||"").includes(c) || m.categorie.toLowerCase().includes(c))
  ).slice(0, 16);
  const magazine = [...topTech, ...restTech];
  const cuPromo = magazine.filter(m => m.are_promotie);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-slate-950">
        <nav className="bg-slate-950 border-b border-slate-800">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-slate-500">
            <Link href="/" className="hover:text-indigo-400">Acasă</Link>
            <span className="mx-1">/</span>
            <span className="text-slate-300 font-medium">Electronice cu Reducere</span>
          </div>
        </nav>

        <section className="bg-gradient-to-br from-indigo-700 via-blue-700 to-cyan-700 text-white py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">📱</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Electronice cu Reducere {an}</h1>
            <p className="text-indigo-100 text-lg mb-6 max-w-xl mx-auto">
              Coduri de reducere verificate la eMag, Altex, PCGarage și alte magazine de electronice din România
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Telefoane","Laptopuri","TV 4K","Gaming","Căști","Smartwatch"].map(c => (
                <span key={c} className="bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full border border-white/30">{c}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-white mb-6 text-center">Ce găsești la electronice online</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVANTAJE.map(a => (
              <div key={a.titlu} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="text-3xl mb-2">{a.icon}</div>
                <h3 className="font-bold text-white text-sm mb-1">{a.titlu}</h3>
                <p className="text-xs text-slate-400">{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-10">
          <div className="flex items-center gap-3 mb-5">
            
            <h2 className="text-xl font-black text-white">Magazine electronice cu reduceri active</h2>
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
                      {m.are_promotie && !m.cod_cupon && <span className="text-xs text-blue-500 font-medium">Ofertă</span>}
                    </div>
                  </div>
                  {promo ? (
                    <p className="text-slate-400 text-xs line-clamp-2">{promo.nume}</p>
                  ) : (
                    <p className="text-slate-500 text-xs italic">Verifică ofertele curente</p>
                  )}
                  <div className="flex justify-end mt-2">
                    <span className="text-xs text-blue-500 font-semibold group-hover:text-blue-600">Vezi →</span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        <NisaProduse
          merchantSlugs={["emag.ro","altex.ro","pcgarage.ro","flanco.ro","cel.ro","evomag.ro","vexio.ro"]}
          catSlug="electronice"
          titlu="Produse populare — Electronice cu reducere"
          culoareAccent="blue"
          limit={12}
        />

        <section className="bg-slate-900 border-t border-slate-800 py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-white mb-5">Ghid: Electronice ieftine online în România</h2>
            <div className="space-y-4 text-sm text-slate-400 leading-relaxed">
              <div>
                <h3 className="font-bold text-white mb-1">Cele mai bune momente să cumperi</h3>
                <p>Black Friday (noiembrie), Campania 11.11, zilele de naștere ale magazinelor (eMag aniversare, Altex Birthday). Reducerile pot ajunge la 40-60% la telefoane și laptopuri de generație anterioară.</p>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Top magazine electronice România</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>eMag</strong> — cel mai mare, livrare rapidă, retur 30 zile</li>
                  <li><strong>Altex</strong> — network fizic + online, prețuri competitive</li>
                  <li><strong>PCGarage</strong> — specializat IT, componente PC, gaming</li>
                  <li><strong>Flanco</strong> — electrocasnice + electronice, rate 0%</li>
                  <li><strong>CEL.ro</strong> — gamă largă, prețuri bune la accesorii</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Sfaturi economii</h3>
                <p>Compară prețul pe eMag vs Altex vs PCGarage înainte de cumpărare. Activează alertele de preț. Codurile de reducere AmCupon se cumulează deseori cu prețurile deja reduse.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-base font-black text-slate-300 mb-4">Exploreaza si alte categorii</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/gadgets", label: "📡 Gadgets" },
              { href: "/moto", label: "🚗 Auto-Moto" },
              { href: "/sport", label: "🏃 Sport" },
              { href: "/idei-cadouri", label: "🎁 Idei Cadouri" },
              { href: "/categorii", label: "📂 Categorii" },
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
          <Link href="/gadgets" className="hover:text-indigo-400">Gadgets</Link>{" · "}
          <Link href="/farmacie" className="hover:text-indigo-400">Farmacie</Link>{" · "}
          <Link href="/categorii" className="hover:text-indigo-400">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
