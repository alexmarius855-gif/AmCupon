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
  title: "Cod Reducere Bijuterii & Accesorii 2026 — Aur, Argint, Cristale | AmCupon.ro",
  description: "Coduri de reducere bijuterii Romania: Fluturasi, Chic Bijoux, Novvu, Bijubox, Androvelli, Lu.ro. Aur, argint, cristale, inele, bratari si coliere la preturi mici.",
  keywords: ["cod reducere bijuterii","reduceri aur","argint reducere","bijuterii online romania","inele reducere","bratari reducere","coliere reducere"],
  alternates: { canonical: "https://amcupon.ro/bijuterii" },
  openGraph: { title: "Bijuterii cu Reducere 2026 | AmCupon.ro", url: "https://amcupon.ro/bijuterii", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const AVANTAJE = [
  { icon: "💍", titlu: "Inele & Verighete", desc: "Inele din aur, argint, cu pietre pretioase — colectii noi sezonier" },
  { icon: "📿", titlu: "Coliere & Bratari", desc: "Lanturi aur, bratari charm, coliere argint si cristale" },
  { icon: "👑", titlu: "Bijuterii Premium", desc: "Androvelli, Novvu, Bijubox — bijuterii certificate cu garantie" },
  { icon: "🎁", titlu: "Cadouri Speciale", desc: "Seturi cadou, ambalaj elegant, livrare rapida pentru ocazii deosebite" },
  { icon: "💎", titlu: "Pietre Pretioase", desc: "Diamante, rubine, smaralde, safire in monturi din aur alb sau galben" },
  { icon: "🥈", titlu: "Argint & Cristale", desc: "Bijuterii argint 925, cristale la preturi accesibile" },
];

function numeAfisat(s: string) {
  return s.split(".")[0].replace(/-/g," ").split(" ").map(w=>w[0].toUpperCase()+w.slice(1)).join(" ");
}
const CULORI = ["bg-indigo-600","bg-indigo-600","bg-indigo-600","bg-indigo-600","bg-indigo-600","bg-indigo-600"];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Bijuterii cu Reducere 2026",
  "url": "https://amcupon.ro/bijuterii",
  "description": "Coduri reducere bijuterii online Romania — aur, argint, cristale, inele, bratari, coliere"
};

export default function BijuteriiPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const magazine = all.filter(m => m.categorie_slug === "jewelry");
  const cuPromo = magazine.filter(m => m.are_promotie);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-slate-950">

        {/* Header */}

        {/* Breadcrumb */}
        <nav className="bg-slate-950 border-b border-slate-800">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-slate-500">
            <Link href="/" className="hover:text-indigo-400">Acasa</Link>
            <span className="mx-1">/</span>
            <span className="text-slate-300 font-medium">Bijuterii & Accesorii</span>
          </div>
        </nav>

        {/* Hero */}
        <section className="bg-gradient-to-br from-indigo-700 via-blue-700 to-cyan-700 text-white py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">💍</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Bijuterii cu Reducere {an}</h1>
            <p className="text-indigo-100 text-lg mb-6 max-w-xl mx-auto">
              Inele, coliere, bratari si seturi bijuterii la preturi reduse. Fluturasi, Novvu, Bijubox si alte magazine verificate zilnic.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Inele","Coliere","Bratari","Verighete","Cercei","Aur","Argint","Cristale"].map(c => (
                <span key={c} className="bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full border border-white/30">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="bg-slate-900 border-slate-800 py-3 px-4">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-6 text-sm">
            <span className="text-indigo-300 font-semibold">
              <span className="font-black text-indigo-400">{magazine.length}</span> magazine bijuterii
            </span>
            <span className="text-indigo-300 font-semibold">
              <span className="font-black text-indigo-400">{cuPromo.length}</span> cu promotii active
            </span>
            <span className="text-indigo-300 font-semibold">&#10003; Actualizat zilnic</span>
          </div>
        </div>

        {/* Avantaje */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-white mb-6 text-center">Ce gasesti la magazinele de bijuterii online</h2>
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

        {/* Magazine */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <h2 className="text-xl font-black text-white mb-5">Magazine bijuterii partenere</h2>
          {magazine.length > 0 ? (
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
                        {m.are_promotie && !m.cod_cupon && <span className="text-xs text-indigo-400 font-medium">Oferta</span>}
                      </div>
                    </div>
                    {promo ? (
                      <p className="text-slate-400 text-xs line-clamp-2">{promo.nume}</p>
                    ) : (
                      <p className="text-slate-500 text-xs italic">Verifica ofertele curente</p>
                    )}
                    <div className="flex justify-end mt-2">
                      <span className="text-xs text-indigo-400 font-semibold group-hover:text-indigo-300">Vezi &rarr;</span>
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
              <p className="text-4xl mb-3">💍</p>
              <p className="font-bold text-slate-300 mb-2">Magazine actualizate zilnic</p>
              <p className="text-slate-500 text-sm mb-4">Revino curand pentru promotii la bijuterii.</p>
              <Link href="/toate-magazinele" className="text-indigo-400 font-bold hover:text-indigo-300 text-sm">Toate magazinele &rarr;</Link>
            </div>
          )}
        </section>

        {/* Produse */}
        <NisaProduse
          merchantSlugs={["fluturasi.ro","chicbijoux.ro","novvu.ro","bijubox.ro","androvelli.ro","lu.ro"]}
          catSlug="bijuterii"
          titlu="Bijuterii populare cu reducere"
          culoareAccent="indigo"
          limit={12}
        />

        {/* Editorial */}
        <section className="bg-slate-900 border-t border-slate-800 py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-white mb-5">Ghid: Bijuterii online — cum alegi si cum economisesti</h2>
            <div className="space-y-4 text-sm text-slate-400 leading-relaxed">
              <div>
                <h3 className="font-bold text-white mb-1">Magazine romanesti de bijuterii online</h3>
                <p>Fluturasi, Chic Bijoux, Novvu, Bijubox, Androvelli si Lu.ro sunt magazinele romanesti partenere AmCupon.ro pentru bijuterii — fiecare cu propriul stil si gama de preturi, de la argint accesibil la piese premium din aur. Verifica fiecare magazin pe pagina lui dedicata pentru codurile active.</p>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Cum verifici calitatea bijuteriilor online</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Marca poansonare</strong> — aur 585 (14K), 750 (18K) sau argint 925 obligatoriu stampilate</li>
                  <li><strong>Certificat autenticitate</strong> — pentru diamante si pietre pretioase cere certificat GIA/EGL</li>
                  <li><strong>Garantie scrisa</strong> — magazinele serioase ofera minim 12 luni garantie</li>
                  <li><strong>Returnare gratuita</strong> — important daca marimea nu se potriveste (inele)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Cand sa cumperi bijuterii cu reducere</h3>
                <p>Reducerile maxime la bijuterii apar de Valentine's Day (feb), Craciun si in perioadele de lichidare (ian, iul). Abonarea la newsletter-ul magazinului preferat anunta frecvent promotii exclusive. Colectiile noi inseamna si reduceri la colectiile vechi.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Internal links */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-base font-black text-slate-300 mb-4">Exploreaza si alte categorii</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/frumusete",  label: "💄 Frumusete & Beauty" },
              { href: "/fashion",    label: "👗 Fashion & Imbracaminte" },
              { href: "/parfumuri",  label: "🌸 Parfumuri" },
              { href: "/idei-cadouri", label: "🎁 Idei de Cadouri" },
              { href: "/oferte-azi", label: "🔥 Toate Ofertele de Azi" },
              { href: "/categorii",  label: "📂 Toate Categoriile" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-slate-900 hover:bg-slate-800 hover:text-indigo-300 text-slate-300 text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-slate-800 hover:border-cyan-200">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500 mt-4">
          &copy; {an} AmCupon.ro &middot;{" "}
          <Link href="/fashion" className="hover:text-indigo-400">Fashion</Link>{" · "}
          <Link href="/frumusete" className="hover:text-indigo-400">Frumusete</Link>{" · "}
          <Link href="/categorii" className="hover:text-indigo-400">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
