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
  title: "Cod Reducere Sanatate & Naturiste 2026 — Vitamine, Suplimente | AmCupon.ro",
  description: "Coduri de reducere produse naturiste si suplimente Romania: Pronaturiste, Vitamix, GoldNutrition, Apiland, Botaniq. Vitamine, suplimente, bio si wellness la preturi reduse.",
  keywords: ["cod reducere sanatate","reduceri suplimente","produse naturiste reducere","vitamine ieftine","goldnutrition cod cupon","pronaturiste reducere","suplimente online romania"],
  alternates: { canonical: "https://amcupon.ro/sanatate" },
  openGraph: { title: "Sanatate & Naturiste cu Reducere 2026 | AmCupon.ro", url: "https://amcupon.ro/sanatate", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_SANATATE = ["pronaturiste.ro","vitamix.ro","goldnutrition.ro","apiland.ro","botaniq.ro","republicabio.ro","zephyrlabs.ro","tratamentenaturiste.ro","vioi.ro","biomag.ro","unicorn-naturals.ro","minuneanaturii.ro"];
const CAT_SANATATE = ["health","personal care","sanatate","natur","bio","wellness","supli","vita"];

const AVANTAJE = [
  { icon: "💊", titlu: "Vitamine & Minerale", desc: "Multivitamine, vitamina D, C, zinc, magneziu — oferte permanente" },
  { icon: "🌿", titlu: "Produse Naturiste", desc: "Plante medicinale, tincturi, ceaiuri bio din surse naturale" },
  { icon: "💪", titlu: "Suplimente Sport", desc: "Proteine, aminoacizi, creatina pentru performanta maxima" },
  { icon: "🧴", titlu: "Ingrijire Naturala", desc: "Cosmetice bio, creme naturale, uleiuri esentiale" },
  { icon: "🫀", titlu: "Sanatate Cardiovasculara", desc: "Omega-3, coenzima Q10, produse pentru inima sanatoasa" },
  { icon: "🧠", titlu: "Nootropice & Focus", desc: "Suplimente pentru memorie, concentrare si energie" },
];

function numeAfisat(s: string) {
  return s.split(".")[0].replace(/-/g," ").split(" ").map(w=>w[0].toUpperCase()+w.slice(1)).join(" ");
}
const CULORI = ["bg-green-500","bg-teal-500","bg-emerald-500","bg-lime-600","bg-green-600","bg-cyan-600"];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Sanatate & Naturiste cu Reducere 2026",
  "url": "https://amcupon.ro/sanatate",
  "description": "Coduri reducere suplimente, naturiste si wellness Romania"
};

export default function SanatatePage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topSanatate = TOP_SANATATE
    .map(s => all.find(m => m.magazin === s))
    .filter(Boolean) as Magazin[];

  const restSanatate = all.filter(m =>
    !TOP_SANATATE.includes(m.magazin) && m.are_promotie &&
    CAT_SANATATE.some(c =>
      (m.categorie_slug||"").includes(c) ||
      m.categorie.toLowerCase().includes(c) ||
      m.magazin.toLowerCase().includes(c)
    )
  ).slice(0, 12);

  const magazine = [...topSanatate, ...restSanatate];
  const cuPromo = magazine.filter(m => m.are_promotie);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-white">

        {/* Header */}

        {/* Breadcrumb */}
        <nav className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-gray-400">
            <Link href="/" className="hover:text-orange-500">Acasa</Link>
            <span className="mx-1">/</span>
            <span className="text-gray-700 font-medium">Sanatate & Naturiste</span>
          </div>
        </nav>

        {/* Hero */}
        <section className="bg-gradient-to-br from-green-600 via-teal-600 to-emerald-700 text-white py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">🌿</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Sanatate & Naturiste cu Reducere {an}</h1>
            <p className="text-green-100 text-lg mb-6 max-w-xl mx-auto">
              Vitamine, suplimente si produse naturiste la preturi mici. Verificate zilnic la Pronaturiste, GoldNutrition, Vitamix si alte magazine.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Vitamine","Suplimente Sport","Naturiste","Bio","Omega-3","Probiotice","Collagen"].map(c => (
                <span key={c} className="bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full border border-white/30">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <div className="bg-green-50 border-b border-green-100 py-3 px-4">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-6 text-sm">
            <span className="text-green-700 font-semibold">
              <span className="font-black text-green-600">{magazine.length}</span> magazine sanatate
            </span>
            <span className="text-green-700 font-semibold">
              <span className="font-black text-green-600">{cuPromo.length}</span> cu promotii active
            </span>
            <span className="text-green-700 font-semibold">
              &#10003; Actualizat zilnic
            </span>
          </div>
        </div>

        {/* Avantaje */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-gray-900 mb-6 text-center">Ce gasesti la magazinele de sanatate online</h2>
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

        {/* Magazine */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-xl font-black text-gray-900">Magazine sanatate cu reduceri active</h2>
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
                      {m.are_promotie && !m.cod_cupon && <span className="text-xs text-green-600 font-medium">Oferta</span>}
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

        {/* Produse */}
        <NisaProduse
          merchantSlugs={["pronaturiste.ro","vitamix.ro","goldnutrition.ro","apiland.ro","botaniq.ro","republicabio.ro"]}
          titlu="Suplimente si produse naturiste populare"
          culoareAccent="green"
          limit={12}
        />

        {/* Editorial */}
        <section className="bg-gray-50 border-t border-gray-200 py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-gray-900 mb-5">Ghid: Suplimente si naturiste — ce sa alegi</h2>
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Pronaturiste vs Vitamix vs GoldNutrition</h3>
                <p>Pronaturiste are cel mai mare catalog de produse naturiste romanesti (plante, tincturi, ceaiuri). Vitamix se specializeaza in suplimente importate la preturi competitive. GoldNutrition este lider in suplimente pentru sportivi — proteine, aminoacizi, creatina.</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Vitamine esentiale in Romania</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Vitamina D3</strong> — esentiala iarna cand soarele lipseste, deficienta larg raspandita</li>
                  <li><strong>Magneziu</strong> — pentru somn, stress si muschi; lipseste din dieta moderna</li>
                  <li><strong>Omega-3</strong> — cardiovascular si anti-inflamator; cel mai bine din ulei de peste</li>
                  <li><strong>Zinc</strong> — imunitate si piele; important pentru barbati</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Cum economisesti la suplimente</h3>
                <p>Cumpara in cantitati mai mari (3-6 luni) cand gasesti promotii — suplimentele au termen lung de valabilitate. Newsletter-urile magazinelor anunta frecvent reduceri de 20-30%. Pachetele combo sunt intotdeauna mai ieftine decat produsele individuale.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Internal links */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-base font-black text-gray-700 mb-4">Exploreaza si alte categorii</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/farmacie",   label: "💊 Farmacie Online" },
              { href: "/sport",      label: "🏃 Sport & Fitness" },
              { href: "/frumusete",  label: "💄 Frumusete & Beauty" },
              { href: "/animale",    label: "🐾 Animale de Companie" },
              { href: "/copii",      label: "👶 Copii & Jucarii" },
              { href: "/oferte-azi", label: "🔥 Toate Ofertele de Azi" },
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
          <Link href="/farmacie" className="hover:text-orange-500">Farmacie</Link>{" · "}
          <Link href="/frumusete" className="hover:text-orange-500">Frumusete</Link>{" · "}
          <Link href="/categorii" className="hover:text-orange-500">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
