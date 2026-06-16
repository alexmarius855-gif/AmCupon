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
  { pret: "Sub 1.000 lei", emoji: "📱", desc: "Android de baza, retea 4G, camera decenta", culoare: "bg-green-500" },
  { pret: "1.000 – 2.000 lei", emoji: "📲", desc: "Mid-range solid: Xiaomi, Samsung A, OnePlus Nord", culoare: "bg-blue-500" },
  { pret: "2.000 – 4.000 lei", emoji: "✨", desc: "Flagship mid: Samsung S, Pixel, iPhone SE", culoare: "bg-purple-500" },
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
const CULORI = ["bg-teal-500","bg-orange-500","bg-blue-600","bg-red-500","bg-green-600","bg-purple-500","bg-yellow-500","bg-indigo-500"];
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
      <div className="min-h-screen bg-white">
        <nav className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-gray-400">
            <Link href="/" className="hover:text-orange-500">Acasa</Link>
            <span className="mx-1">/</span>
            <span className="text-gray-700 font-medium">Telefoane cu Reducere</span>
          </div>
        </nav>

        <section className="bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 text-white py-14 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">📲</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Telefoane cu Reducere {an}</h1>
            <p className="text-teal-100 text-lg mb-6 max-w-xl mx-auto">
              Samsung, iPhone, Xiaomi, OnePlus — coduri reducere verificate zilnic la eMAG, Altex, Flanco, Orange
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Samsung Galaxy","iPhone 15","Xiaomi 14","OnePlus 13","Sub 1000 lei","Sub 2000 lei","5G"].map(c => (
                <span key={c} className="bg-white/15 text-white text-sm font-semibold px-4 py-1.5 rounded-full border border-white/25">{c}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-gray-900 mb-6 text-center">Alege telefonul dupa buget</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BUGETE_TEL.map(b => (
              <div key={b.pret} className="bg-white border-2 border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all">
                <div className={`w-10 h-10 ${b.culoare} rounded-xl flex items-center justify-center text-xl mb-3`}>
                  {b.emoji}
                </div>
                <h3 className="font-black text-gray-900 text-sm mb-1">{b.pret}</h3>
                <p className="text-xs text-gray-500">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-10">
          <h2 className="text-xl font-black text-gray-900 mb-5">Magazine telefoane cu reduceri active</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {magazine.map((m, i) => {
              const nume = numeAfisat(m.magazin);
              const culoare = CULORI[i % CULORI.length];
              const promo = m.promotii[0];
              return (
                <a key={m.magazin} href={`/cod-reducere/${m.magazin}`}
                  className="group bg-white border border-gray-200 hover:border-teal-300 rounded-2xl p-4 transition-all hover:shadow-md">
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
                    <span className="text-xs text-teal-600 font-semibold group-hover:text-teal-700">Vezi &rarr;</span>
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

        <section className="bg-gray-50 border-t border-gray-200 py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-gray-900 mb-5">Ghid: Ce telefon sa cumperi in {an}</h2>
            <div className="space-y-5 text-sm text-gray-600 leading-relaxed">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Cele mai bune branduri in {an}</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {BRANDURI_TEL.map(b => (
                    <div key={b.brand} className="bg-white border border-gray-100 rounded-xl p-3">
                      <p className="font-bold text-gray-900 text-xs mb-1">{b.brand}</p>
                      <p className="text-xs text-gray-500">{b.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Android sau iPhone — care e mai bun?</h3>
                <p>Depinde de ecosistem. Daca ai deja Mac/iPad, iPhone se integreaza perfect. Daca vrei flexibilitate maxima si pret mai bun la specificatii similare, Samsung sau Xiaomi sunt alegeri mai inteligente. Xiaomi Redmi Note 13 Pro+ ofera camera 200MP si incarcare 67W la 1.600 lei — raport calitate-pret greu de batut.</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Cand sa cumperi un telefon mai ieftin</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Dupa lansarea modelului nou</strong> — pretul modelului vechi scade cu 15-30% imediat</li>
                  <li><strong>Black Friday</strong> — reduceri 20-40% la modele mid-range si flagship din generatia anterioara</li>
                  <li><strong>Zilele eMAG</strong> — campanii de 2-3 ori pe an cu preturi foarte bune</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-base font-black text-gray-700 mb-4">Exploreaza si alte categorii</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/laptop", label: "💻 Laptop" },
              { href: "/electronice", label: "📱 Electronice" },
              { href: "/gadgets", label: "📡 Gadgets" },
              { href: "/gaming", label: "🎮 Gaming" },
              { href: "/oferte-azi", label: "🔥 Oferte de Azi" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-gray-100 hover:bg-teal-50 hover:text-teal-600 text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-gray-200 hover:border-teal-200">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400 mt-4">
          &copy; {an} AmCupon.ro &middot;{" "}
          <Link href="/electronice" className="hover:text-orange-500">Electronice</Link>{" · "}
          <Link href="/laptop" className="hover:text-orange-500">Laptop</Link>{" · "}
          <Link href="/categorii" className="hover:text-orange-500">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
