import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import MagazinCard from "../components/MagazinCard";
import NewsletterCTA from "../components/NewsletterCTA";
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

const TOP_SANATATE = ["pronaturiste.ro","vitamix.ro","goldnutrition.ro","apiland.ro","botaniq.ro","republicabio.ro","zephyrlabs.ro","tratamentenaturiste.ro","vioi.ro","biomag.ro","unicorn-naturals.ro","minuneanaturii.ro","nutraceutics.ro"];
const CAT_SANATATE = ["health","personal care","sanatate","natur","bio","wellness","supli","vita"];

const AVANTAJE = [
  { icon: "💊", titlu: "Vitamine & Minerale", desc: "Multivitamine, vitamina D, C, zinc, magneziu — oferte permanente" },
  { icon: "🌿", titlu: "Produse Naturiste", desc: "Plante medicinale, tincturi, ceaiuri bio din surse naturale" },
  { icon: "💪", titlu: "Suplimente Sport", desc: "Proteine, aminoacizi, creatina pentru performanta maxima" },
  { icon: "🧴", titlu: "Ingrijire Naturala", desc: "Cosmetice bio, creme naturale, uleiuri esentiale" },
  { icon: "🫀", titlu: "Sanatate Cardiovasculara", desc: "Omega-3, coenzima Q10, produse pentru inima sanatoasa" },
  { icon: "🧠", titlu: "Nootropice & Focus", desc: "Suplimente pentru memorie, concentrare si energie" },
];


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
    !TOP_SANATATE.includes(m.magazin) &&
    CAT_SANATATE.some(c =>
      (m.categorie_slug||"").includes(c) ||
      m.categorie.toLowerCase().includes(c) ||
      m.magazin.toLowerCase().includes(c)
    )
  ).sort((a,b)=>(b.are_promotie?1:0)-(a.are_promotie?1:0)||(b.scor_final||0)-(a.scor_final||0)).slice(0, 12);

  const magazine = [...topSanatate, ...restSanatate];
  const cuPromo = magazine.filter(m => m.are_promotie);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[#06080b]">

        {/* Header */}

        {/* Breadcrumb */}
        <nav className="bg-[#06080b] border-b border-[#1f2329]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[#9399a0]">
            <Link href="/" className="hover:text-[#ddf93c]">Acasa</Link>
            <span className="mx-1">/</span>
            <span className="text-[#c9ced5] font-medium">Sanatate & Naturiste</span>
          </div>
        </nav>

        {/* Hero */}
        <section className="bg-gradient-to-br from-[#c3dd2c] via-[#ddf93c] to-[#c3dd2c] text-[#0c1000] py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">🌿</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Sanatate & Naturiste cu Reducere {an}</h1>
            <p className="text-[#2a2f10] text-lg mb-6 max-w-xl mx-auto">
              Vitamine, suplimente si produse naturiste la preturi mici. Verificate zilnic la Pronaturiste, GoldNutrition, Vitamix si alte magazine.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Vitamine","Suplimente Sport","Naturiste","Bio","Omega-3","Probiotice","Collagen"].map(c => (
                <span key={c} className="bg-[#1f2329] text-[#ffffff] text-sm font-semibold px-4 py-1.5 rounded-full border border-[#2a2f36]">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <div className="bg-[#14181c] border-[#1f2329] py-3 px-4">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-6 text-sm">
            <span className="text-[#c3dd2c] font-semibold">
              <span className="font-black text-[#ddf93c]">{magazine.length}</span> magazine sanatate
            </span>
            <span className="text-[#c3dd2c] font-semibold">
              <span className="font-black text-[#ddf93c]">{cuPromo.length}</span> cu promotii active
            </span>
            <span className="text-[#c3dd2c] font-semibold">
              &#10003; Actualizat zilnic
            </span>
          </div>
        </div>

        {/* Avantaje */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-[#ffffff] mb-6 text-center">Ce gasesti la magazinele de sanatate online</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVANTAJE.map(a => (
              <div key={a.titlu} className="bg-[#14181c] border border-[#1f2329] rounded-xl p-5">
                <div className="text-3xl mb-2">{a.icon}</div>
                <h3 className="font-bold text-[#ffffff] text-sm mb-1">{a.titlu}</h3>
                <p className="text-xs text-[#c9ced5]">{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Magazine */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-xl font-black text-[#ffffff]">Magazine sanatate cu reduceri active</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {magazine.map((m) => (
              <MagazinCard key={m.magazin} m={m} />
            ))}
          </div>
        </section>

        {/* Produse */}
        <NewsletterCTA />

        <NisaProduse
          merchantSlugs={["pronaturiste.ro","vitamix.ro","goldnutrition.ro","apiland.ro","botaniq.ro","republicabio.ro"]}
          catSlug="farmacie"
          titlu="Suplimente si produse naturiste populare"
          culoareAccent="indigo"
          limit={12}
        />

        {/* Editorial */}
        <section className="bg-[#14181c] border-t border-[#1f2329] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[#ffffff] mb-5">Ghid: Suplimente si naturiste — ce sa alegi</h2>
            <div className="space-y-4 text-sm text-[#c9ced5] leading-relaxed">
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">Pronaturiste vs Vitamix vs GoldNutrition</h3>
                <p>Pronaturiste are cel mai mare catalog de produse naturiste romanesti (plante, tincturi, ceaiuri). Vitamix se specializeaza in suplimente importate la preturi competitive. GoldNutrition este lider in suplimente pentru sportivi — proteine, aminoacizi, creatina.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">Vitamine esentiale in Romania</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Vitamina D3</strong> — esentiala iarna cand soarele lipseste, deficienta larg raspandita</li>
                  <li><strong>Magneziu</strong> — pentru somn, stress si muschi; lipseste din dieta moderna</li>
                  <li><strong>Omega-3</strong> — cardiovascular si anti-inflamator; cel mai bine din ulei de peste</li>
                  <li><strong>Zinc</strong> — imunitate si piele; important pentru barbati</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">Cum economisesti la suplimente</h3>
                <p>Cumpara in cantitati mai mari (3-6 luni) cand gasesti promotii — suplimentele au termen lung de valabilitate. Newsletter-urile magazinelor anunta frecvent reduceri de 20-30%. Pachetele combo sunt intotdeauna mai ieftine decat produsele individuale.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Internal links */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-base font-black text-[#c9ced5] mb-4">Exploreaza si alte categorii</h2>
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
                className="bg-[#14181c] hover:bg-[#1f2329] hover:text-[#c3dd2c] text-[#c9ced5] text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-[#1f2329] hover:border-[#c9ced5]">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-[#1f2329] py-6 text-center text-xs text-[#9399a0] mt-4">
          &copy; {an} AmCupon.ro &middot;{" "}
          <Link href="/farmacie" className="hover:text-[#ddf93c]">Farmacie</Link>{" · "}
          <Link href="/frumusete" className="hover:text-[#ddf93c]">Frumusete</Link>{" · "}
          <Link href="/categorii" className="hover:text-[#ddf93c]">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
