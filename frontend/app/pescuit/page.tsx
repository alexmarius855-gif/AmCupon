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
  title: "Reduceri Echipamente Pescuit 2026 — Undite, Naluci | AmCupon.ro",
  description: "Coduri reducere magazine pescuit Romania: Pescar Expert, Decathlon. Undite, mulinete, naluci, corturi carp — reduceri verificate, livrare rapida.",
  keywords: ["reduceri pescuit", "cod reducere pescar expert", "echipamente pescuit ieftine", "undita reducere", "naluci reducere", "pescuit romania online"],
  alternates: { canonical: "https://amcupon.ro/pescuit" },
  openGraph: {
    title: "Reduceri Echipamente Pescuit 2026 | AmCupon.ro",
    url: "https://amcupon.ro/pescuit",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
    images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }],
  },
};

const TOP_PESCUIT = ["pescar-expert.ro"];
const FALLBACK_SPORTS = ["decathlon.ro", "sportisimo.ro"];

const ECHIPAMENTE = [
  { emoji: "🎣", label: "Undite & Lansete", desc: "Crap, pastrav, feeder, spinning, match" },
  { emoji: "🪝", label: "Naluci & Momeli", desc: "Siliconi, wobblere, twistere, popere" },
  { emoji: "🌀", label: "Mulinete", desc: "Spinning, stationar, multiplier, baitcasting" },
  { emoji: "🎒", label: "Genti & Carry-all", desc: "Transport echipament, tacklebox, rucsacuri" },
  { emoji: "⛺", label: "Corturi & Umbrele", desc: "Bivvace carp, umbrele pescuit, sleeping bag" },
  { emoji: "🧲", label: "Accesorii", desc: "Plumbi, carlige, fir, vartej, agrafe, flotor" },
];

const BRANDURI = ["Daiwa", "Okuma", "Trabucco", "Prologic", "Delphin", "Jaxon", "Nash", "Fox"];

function numeAfisat(s: string) {
  return s.split(".")[0].replace(/-/g, " ").split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
}

const CULORI = ["bg-emerald-600", "bg-green-600", "bg-teal-600", "bg-emerald-500", "bg-green-500"];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Reduceri Echipamente Pescuit 2026",
  "url": "https://amcupon.ro/pescuit",
};

export default function PescuitPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topMag = TOP_PESCUIT
    .map(s => all.find(m => m.magazin === s))
    .filter(Boolean) as Magazin[];

  const fallback = FALLBACK_SPORTS
    .map(s => all.find(m => m.magazin === s))
    .filter(Boolean) as Magazin[];

  const magazine = topMag.length > 0 ? topMag : fallback.slice(0, 4);
  const allSlugs = [...TOP_PESCUIT, ...FALLBACK_SPORTS];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-slate-950">

        <nav className="bg-slate-950 border-b border-slate-800">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-slate-500">
            <Link href="/" className="hover:text-indigo-400">Acasa</Link>
            <span className="mx-1">/</span>
            <span className="text-slate-300 font-medium">Pescuit</span>
          </div>
        </nav>

        {/* HERO */}
        <section className="bg-gradient-to-br from-emerald-800 via-green-800 to-teal-800 text-white py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">🎣</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">
              Echipamente Pescuit cu Reducere {an}
            </h1>
            <p className="text-emerald-100 text-lg mb-6 max-w-xl mx-auto">
              Undite, mulinete, naluci si accesorii la preturi mai mici. Reduceri verificate pentru pasionatii de pescuit din Romania.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {BRANDURI.map(b => (
                <span key={b} className="bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full border border-white/30">
                  {b}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORII ECHIPAMENTE */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-white mb-6 text-center">Ce gasesti la preturi mai mici</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ECHIPAMENTE.map(e => (
              <div key={e.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:shadow-md transition-all">
                <div className="text-3xl mb-2">{e.emoji}</div>
                <h3 className="font-bold text-white text-sm mb-1">{e.label}</h3>
                <p className="text-xs text-slate-400">{e.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* MAGAZINE */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <h2 className="text-xl font-black text-white mb-5">Magazine pescuit cu reduceri active</h2>
          {magazine.length === 0 ? (
            <div className="text-center py-10 bg-slate-900 rounded-2xl">
              <p className="text-2xl mb-3">🎣</p>
              <p className="text-slate-400 font-medium mb-2">Curand disponibil — verifica ofertele sport</p>
              <Link href="/categorii/sports-outdoors" className="inline-block bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-500 transition-colors">
                Sport & Outdoor →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {magazine.map((m, i) => {
                const nume = numeAfisat(m.magazin);
                const culoare = CULORI[i % CULORI.length];
                const promo = m.promotii?.[0];
                return (
                  <a key={m.magazin} href={`/cod-reducere/${m.magazin}`}
                    className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 transition-all hover:shadow-md">
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
                        {m.are_promotie && m.cod_cupon && <span className="text-xs text-emerald-400 font-bold">COD</span>}
                        {m.are_promotie && !m.cod_cupon && <span className="text-xs text-teal-400 font-medium">Oferta</span>}
                      </div>
                    </div>
                    {promo ? (
                      <p className="text-slate-400 text-xs line-clamp-2">{promo.nume}</p>
                    ) : (
                      <p className="text-slate-500 text-xs italic">Verifica ofertele curente</p>
                    )}
                    <div className="flex justify-end mt-2">
                      <span className="text-xs text-sky-500 font-semibold group-hover:text-sky-600">Vezi →</span>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </section>

        {/* PRODUSE din products.json */}
        <NisaProduse
          merchantSlugs={allSlugs}
          catSlug="sports-outdoors"
          titlu="Echipamente pescuit la reducere"
          culoareAccent="emerald"
          limit={12}
        />

        {/* SEO TEXT */}
        <section className="bg-slate-900 border-t border-slate-800 py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-white mb-5">Cum alegi echipamentele de pescuit</h2>
            <div className="space-y-4 text-sm text-slate-400 leading-relaxed">
              <div>
                <h3 className="font-bold text-white mb-1">Undite: spinning, feeder sau crap?</h3>
                <p>Pentru inceput, o undita spinning universala (2-3m, 10-30g) acopera cele mai multe situatii. Feeder-ul e optim pentru rauri si lacuri cu fund nisipos, iar setup-ul de crap necesita investitie mai mare dar ofera sesiuni lungi si capturi mari.</p>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Branduri de incredere la preturi corecte</h3>
                <p>Daiwa si Okuma ofera cel mai bun raport calitate-pret pentru incepatori si intermediari. Trabucco e preferat la pescuitul la feeder. Prologic si Delphin au accesorii excelente. Fox si Nash sunt pentru crap-isti seriosi cu buget dedicat.</p>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Sfaturi pentru economii la echipamente {an}</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Sezonul off (iarna) aduce reduceri de 20-40% la undite si mulinete</li>
                  <li>Codurile de reducere de la Pescar Expert se pot combina cu promotiile active</li>
                  <li>Kit-urile complete costa mai putin decat componentele cumparate separat</li>
                  <li>Verifica AmCupon zilnic — reducerile la sport expira rapid</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* LINK-URI INRUDITE */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-base font-black text-slate-300 mb-4">Exploreaza si alte categorii</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/gradina", label: "🌿 Gradina & Plante" },
              { href: "/decathlon", label: "🏃 Decathlon" },
              { href: "/flori", label: "💐 Flori & Buchete" },
              { href: "/top-reduceri", label: "🏆 Top Reduceri" },
              { href: "/categorii", label: "📂 Categorii" },
              { href: "/oferte-azi", label: "🔥 Oferte de Azi" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-slate-900 hover:bg-slate-800 hover:text-emerald-300 text-slate-300 text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-slate-800 hover:border-emerald-400">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500 mt-4">
          © {an} AmCupon.ro ·{" "}
          <Link href="/blog" className="hover:text-indigo-400">Blog</Link>{" · "}
          <Link href="/categorii" className="hover:text-indigo-400">Categorii</Link>{" · "}
          <Link href="/" className="hover:text-indigo-400">Acasa</Link>
        </footer>
      </div>
    </>
  );
}
