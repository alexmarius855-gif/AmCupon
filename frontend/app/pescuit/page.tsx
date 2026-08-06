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
      <div className="min-h-screen bg-[#0a0f1a]">

        <nav className="bg-[#0a0f1a] border-b border-[#1e293b]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[#94a3b8]">
            <Link href="/" className="hover:text-[#0d9488]">Acasa</Link>
            <span className="mx-1">/</span>
            <span className="text-[#cbd5e1] font-medium">Pescuit</span>
          </div>
        </nav>

        {/* HERO */}
        <section className="bg-gradient-to-br from-emerald-800 via-green-800 to-[#111827] text-[#f1f5f9] py-12 px-4">
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
                <span key={b} className="bg-[#1e293b] text-[#f1f5f9] text-sm font-semibold px-4 py-1.5 rounded-full border border-[#334155]">
                  {b}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORII ECHIPAMENTE */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-[#f1f5f9] mb-6 text-center">Ce gasesti la preturi mai mici</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ECHIPAMENTE.map(e => (
              <div key={e.label} className="bg-[#111827] border border-[#1e293b] rounded-xl p-5 hover:shadow-md transition-all">
                <div className="text-3xl mb-2">{e.emoji}</div>
                <h3 className="font-bold text-[#f1f5f9] text-sm mb-1">{e.label}</h3>
                <p className="text-xs text-[#cbd5e1]">{e.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* MAGAZINE */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <h2 className="text-xl font-black text-[#f1f5f9] mb-5">Magazine pescuit cu reduceri active</h2>
          {magazine.length === 0 ? (
            <div className="text-center py-10 bg-[#111827] rounded-xl">
              <p className="text-2xl mb-3">🎣</p>
              <p className="text-[#cbd5e1] font-medium mb-2">Curand disponibil — verifica ofertele sport</p>
              <Link href="/categorii/sport" className="inline-block bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-500 transition-colors">
                Sport & Outdoor →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {magazine.map((m) => (
              <MagazinCard key={m.magazin} m={m} />
            ))}
            </div>
          )}
        </section>

        {/* PRODUSE din products.json */}
        <NewsletterCTA />

        <NisaProduse
          merchantSlugs={allSlugs}
          catSlug="sports-outdoors"
          titlu="Echipamente pescuit la reducere"
          culoareAccent="emerald"
          limit={12}
        />

        {/* SEO TEXT */}
        <section className="bg-[#111827] border-t border-[#1e293b] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[#f1f5f9] mb-5">Cum alegi echipamentele de pescuit</h2>
            <div className="space-y-4 text-sm text-[#cbd5e1] leading-relaxed">
              <div>
                <h3 className="font-bold text-[#f1f5f9] mb-1">Undite: spinning, feeder sau crap?</h3>
                <p>Pentru inceput, o undita spinning universala (2-3m, 10-30g) acopera cele mai multe situatii. Feeder-ul e optim pentru rauri si lacuri cu fund nisipos, iar setup-ul de crap necesita investitie mai mare dar ofera sesiuni lungi si capturi mari.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#f1f5f9] mb-1">Branduri de incredere la preturi corecte</h3>
                <p>Daiwa si Okuma ofera cel mai bun raport calitate-pret pentru incepatori si intermediari. Trabucco e preferat la pescuitul la feeder. Prologic si Delphin au accesorii excelente. Fox si Nash sunt pentru crap-isti seriosi cu buget dedicat.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#f1f5f9] mb-1">Sfaturi pentru economii la echipamente {an}</h3>
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
          <h2 className="text-base font-black text-[#cbd5e1] mb-4">Exploreaza si alte categorii</h2>
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
                className="bg-[#111827] hover:bg-[#1e293b] hover:text-emerald-300 text-[#cbd5e1] text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-[#1e293b] hover:border-emerald-400">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-[#1e293b] py-6 text-center text-xs text-[#94a3b8] mt-4">
          © {an} AmCupon.ro ·{" "}
          <Link href="/blog" className="hover:text-[#0d9488]">Blog</Link>{" · "}
          <Link href="/categorii" className="hover:text-[#0d9488]">Categorii</Link>{" · "}
          <Link href="/" className="hover:text-[#0d9488]">Acasa</Link>
        </footer>
      </div>
    </>
  );
}
