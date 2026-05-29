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
  title: "Cod Reducere Pet Shop & Animale 2026 — Hrana Caini, Pisici | AmCupon.ro",
  description: "Coduri de reducere pet shop Romania: Petmart, Petmax, Bravapet, Animax. Hrana caini, hrana pisici, accesorii animale la preturi mici. Verificate zilnic.",
  keywords: ["cod reducere petmart","reduceri pet shop","hrana caini ieftina","hrana pisici reducere","petmax cod cupon","accesorii animale reducere","zooplus romania"],
  alternates: { canonical: "https://amcupon.ro/animale" },
  openGraph: { title: "Pet Shop & Animale cu Reducere 2026 | AmCupon.ro", url: "https://amcupon.ro/animale", siteName: "AmCupon.ro", locale: "ro_RO", type: "website" },
};

const TOP_ANIMALE = ["petmart.ro","petmax.ro","bravapet.ro","ehranaanimale.ro","mobilepet.ro","husse.ro","novapet.ro","gopet.ro"];
const CAT_ANIMALE = ["pet","animal","zoo","dog","cat","fur"];

const AVANTAJE = [
  { icon: "🐶", titlu: "Hrana Caini", desc: "Kibble, conserve, trate pentru caini de toate rasele si varstele" },
  { icon: "🐱", titlu: "Hrana Pisici", desc: "Hrana uscata si umeda pentru pisici — Royal Canin, Whiskas, Hills" },
  { icon: "🐠", titlu: "Acvaristice", desc: "Hrana si accesorii pentru pesti, acvarii si reptile" },
  { icon: "🦜", titlu: "Pasari & Rozatoare", desc: "Seminte, cagini, jucarii pentru papagali, hamster, iepuri" },
  { icon: "🛁", titlu: "Ingrijire & Igiena", desc: "Sampon, periute, accesorii grooming pentru animale de companie" },
  { icon: "🏥", titlu: "Sanatate Animale", desc: "Antiparazitare, vitamine, suplimente pentru animale sanatoase" },
];

function numeAfisat(s: string) {
  return s.split(".")[0].replace(/-/g," ").split(" ").map(w=>w[0].toUpperCase()+w.slice(1)).join(" ");
}
const CULORI = ["bg-amber-500","bg-orange-500","bg-yellow-600","bg-amber-600","bg-orange-600","bg-yellow-500"];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Pet Shop & Animale cu Reducere 2026",
  "url": "https://amcupon.ro/animale",
  "description": "Coduri reducere pet shop online Romania — hrana si accesorii pentru animale de companie"
};

export default function AnimalePage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topAnimale = TOP_ANIMALE
    .map(s => all.find(m => m.magazin === s))
    .filter(Boolean) as Magazin[];

  const restAnimale = all.filter(m =>
    !TOP_ANIMALE.includes(m.magazin) && m.are_promotie &&
    CAT_ANIMALE.some(c =>
      (m.categorie_slug||"").includes(c) ||
      m.categorie.toLowerCase().includes(c) ||
      m.magazin.toLowerCase().includes(c)
    )
  ).slice(0, 8);

  const magazine = [...topAnimale, ...restAnimale];
  const cuPromo = magazine.filter(m => m.are_promotie);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-white">

        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
            <a href="/" className="flex items-center gap-1.5 shrink-0">
              <div className="bg-orange-500 text-white font-black text-base px-2 py-1 rounded-lg">Am</div>
              <span className="font-black text-gray-900 text-xl">Cupon</span>
              <span className="text-orange-500 font-black text-xl">.ro</span>
            </a>
          </div>
        </header>

        {/* Breadcrumb */}
        <nav className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-gray-400">
            <a href="/" className="hover:text-orange-500">Acasa</a>
            <span className="mx-1">/</span>
            <span className="text-gray-700 font-medium">Animale de Companie</span>
          </div>
        </nav>

        {/* Hero */}
        <section className="bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-600 text-white py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">🐾</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Pet Shop cu Reducere {an}</h1>
            <p className="text-amber-100 text-lg mb-6 max-w-xl mx-auto">
              Hrana, jucarii si accesorii pentru animalele tale de companie la preturi mici. Petmart, Petmax, Bravapet si alte magazine verificate zilnic.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Caini","Pisici","Pasari","Rozatoare","Pesti","Reptile","Accesorii"].map(c => (
                <span key={c} className="bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full border border-white/30">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <div className="bg-amber-50 border-b border-amber-100 py-3 px-4">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-6 text-sm">
            <span className="text-amber-700 font-semibold">
              <span className="font-black text-amber-600">{magazine.length}</span> magazine pet shop
            </span>
            <span className="text-amber-700 font-semibold">
              <span className="font-black text-amber-600">{cuPromo.length}</span> cu promotii active
            </span>
            <span className="text-amber-700 font-semibold">
              &#10003; Actualizat zilnic
            </span>
          </div>
        </div>

        {/* Avantaje */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-gray-900 mb-6 text-center">Ce gasesti la pet shop-urile online din Romania</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVANTAJE.map(a => (
              <div key={a.titlu} className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                <div className="text-3xl mb-2">{a.icon}</div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{a.titlu}</h3>
                <p className="text-xs text-gray-500">{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Magazine */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-xl font-black text-gray-900">Magazine pet shop cu reduceri active</h2>
          </div>

          {magazine.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {magazine.map((m, i) => {
                const nume = numeAfisat(m.magazin);
                const culoare = CULORI[i % CULORI.length];
                const promo = m.promotii[0];
                return (
                  <a key={m.magazin} href={`/cod-reducere/${m.magazin}`}
                    className="group bg-white border border-gray-200 hover:border-amber-300 rounded-2xl p-4 transition-all hover:shadow-md">
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
                        {m.are_promotie && !m.cod_cupon && <span className="text-xs text-amber-600 font-medium">Oferta</span>}
                      </div>
                    </div>
                    {promo ? (
                      <p className="text-gray-500 text-xs line-clamp-2">{promo.nume}</p>
                    ) : (
                      <p className="text-gray-400 text-xs italic">Verifica ofertele curente</p>
                    )}
                    <div className="flex justify-end mt-2">
                      <span className="text-xs text-amber-600 font-semibold group-hover:text-amber-700">Vezi &rarr;</span>
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-10 text-center">
              <p className="text-4xl mb-3">🐾</p>
              <p className="font-bold text-gray-700 mb-2">Magazine actualizate zilnic</p>
              <p className="text-gray-400 text-sm mb-4">Revino curand pentru promotii noi la pet shop-uri.</p>
              <a href="/toate-magazinele" className="text-orange-500 font-bold hover:text-orange-600 text-sm">
                Toate magazinele &rarr;
              </a>
            </div>
          )}
        </section>

        {/* Produse */}
        <NisaProduse
          merchantSlugs={["petmart.ro","petmax.ro","bravapet.ro","ehranaanimale.ro","mobilepet.ro","husse.ro"]}
          titlu="Hrana si accesorii populare pentru animale"
          culoareAccent="orange"
          limit={12}
        />

        {/* Editorial */}
        <section className="bg-gray-50 border-t border-gray-200 py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-gray-900 mb-5">Ghid: Cum economisesti la cumparaturile pentru animale</h2>
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Petmart vs Petmax vs Bravapet</h3>
                <p>Petmart are cel mai larg catalog si frecvent promotii la saci mari de hrana. Petmax se remarca prin livrare rapida si oferte flash. Bravapet este o alegere buna pentru hrana premium (Royal Canin, Hill's, Purina Pro Plan) cu preturi competitive.</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Sfaturi pentru economii la hrana pentru animale</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Cumpara saci mari</strong> — pretul per kg scade semnificativ la cantitatile de 12-15 kg</li>
                  <li><strong>Aboneaza-te la newsletter</strong> — pet shop-urile trimit frecvent coduri de 10-15% off</li>
                  <li><strong>Comanda in avans</strong> — nu in ultima clipa, ca sa poti astepta o promotie</li>
                  <li><strong>Combina hrana uscata cu umeda</strong> — mai economic si mai sanatos pentru animale</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Branduri premium la preturi mai mici</h3>
                <p>Royal Canin, Hill's Science Diet si Purina Pro Plan sunt disponibile pe toate platformele mari de pet shop. Preturile variaza cu 20-30% intre magazine — compara inainte sa cumperi si foloseste codurile de reducere de pe AmCupon.ro.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Internal links */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-base font-black text-gray-700 mb-4">Exploreaza si alte categorii</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/sanatate",   label: "🌿 Sanatate & Naturiste" },
              { href: "/farmacie",   label: "💊 Farmacie Online" },
              { href: "/copii",      label: "👶 Copii & Jucarii" },
              { href: "/sport",      label: "🏃 Sport & Outdoor" },
              { href: "/oferte-azi", label: "🔥 Toate Ofertele de Azi" },
              { href: "/categorii",  label: "📂 Toate Categoriile" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-gray-100 hover:bg-orange-50 hover:text-orange-600 text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-gray-200 hover:border-orange-200">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400 mt-4">
          &copy; {an} AmCupon.ro &middot;{" "}
          <a href="/sanatate" className="hover:text-orange-500">Sanatate</a>{" · "}
          <a href="/farmacie" className="hover:text-orange-500">Farmacie</a>{" · "}
          <a href="/categorii" className="hover:text-orange-500">Categorii</a>
        </footer>
      </div>
    </>
  );
}
