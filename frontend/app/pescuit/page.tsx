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
  title: "Reduceri Echipamente Pescuit 2026 — Undite, Naluci",
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
      <div className="min-h-screen bg-[var(--background)]">

        <nav className="bg-[var(--background)] border-b border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Link href="/" className="hover:text-[var(--accent-text)]">Acasa</Link>
            <span className="mx-1">/</span>
            <span className="text-[var(--text-soft)] font-medium">Pescuit</span>
          </div>
        </nav>

        {/* HERO */}
        <section className="bg-gradient-to-br from-emerald-800 via-green-800 to-[#14181c] text-[var(--foreground)] py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">🎣</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">
              Echipamente Pescuit cu Reducere {an}
            </h1>
            <p className="text-emerald-100 text-lg mb-6 max-w-xl mx-auto">
              Undite, mulinete, naluci si accesorii la preturi mai mici. Reduceri active pentru pasionatii de pescuit din Romania.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {BRANDURI.map(b => (
                <span key={b} className="bg-[var(--surface-alt)] text-[var(--foreground)] text-sm font-semibold px-4 py-1.5 rounded-full border border-[var(--border-strong)]">
                  {b}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORII ECHIPAMENTE */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-[var(--foreground)] mb-6 text-center">Ce gasesti la preturi mai mici</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ECHIPAMENTE.map(e => (
              <div key={e.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:shadow-md transition-all">
                <div className="text-3xl mb-2">{e.emoji}</div>
                <h3 className="font-bold text-[var(--foreground)] text-sm mb-1">{e.label}</h3>
                <p className="text-xs text-[var(--text-soft)]">{e.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* MAGAZINE */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <h2 className="text-xl font-black text-[var(--foreground)] mb-5">Magazine pescuit cu reduceri active</h2>
          {magazine.length === 0 ? (
            <div className="text-center py-10 bg-[var(--surface)] rounded-xl">
              <p className="text-2xl mb-3">🎣</p>
              <p className="text-[var(--text-soft)] font-medium mb-2">Curand disponibil — verifica ofertele sport</p>
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
          potrivire={/^(lanseta|mulineta|undita|naluca|naluci|vobler|fir (textil|monofilament)|momeala|nada|feeder|minciog|juvelnic|avertizor|swinger|sezlong de pescuit|scaun de pescuit|cort de pescuit|cutie (de )?pescuit)\b/}
          titlu="Echipamente de pescuit de la parteneri"
          culoareAccent="emerald"
          limit={12}
        />

        {/* SEO TEXT */}
        <section className="bg-[var(--surface)] border-t border-[var(--border)] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[var(--foreground)] mb-5">Cum alegi echipamentele de pescuit</h2>
            <div className="space-y-4 text-sm text-[var(--text-soft)] leading-relaxed">
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Undite: spinning, feeder sau crap?</h3>
                <p>Pentru inceput, o undita spinning universala (2-3m, 10-30g) acopera cele mai multe situatii. Feeder-ul e optim pentru rauri si lacuri cu fund nisipos, iar setup-ul de crap necesita investitie mai mare dar ofera sesiuni lungi si capturi mari.</p>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Branduri de incredere la preturi corecte</h3>
                <p>Daiwa si Okuma ofera cel mai bun raport calitate-pret pentru incepatori si intermediari. Trabucco e preferat la pescuitul la feeder. Prologic si Delphin au accesorii excelente. Fox si Nash sunt pentru crap-isti seriosi cu buget dedicat.</p>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Sfaturi pentru economii la echipamente {an}</h3>
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
          <h2 className="text-base font-black text-[var(--text-soft)] mb-4">Exploreaza si alte categorii</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/casa", label: "🌿 Casa & Gradina" },
              { href: "/decathlon", label: "🏃 Decathlon" },
              { href: "/flori", label: "💐 Flori & Buchete" },
              { href: "/top-reduceri", label: "🏆 Top Reduceri" },
              { href: "/categorii", label: "📂 Categorii" },
              { href: "/oferte-azi", label: "🔥 Oferte de Azi" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-[var(--surface)] hover:bg-[var(--surface-alt)] hover:text-emerald-300 text-[var(--text-soft)] text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-[var(--border)] hover:border-emerald-400">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-[var(--text-muted)] mt-4">
          © {an} AmCupon.ro ·{" "}
          <Link href="/blog" className="hover:text-[var(--accent-text)]">Blog</Link>{" · "}
          <Link href="/categorii" className="hover:text-[var(--accent-text)]">Categorii</Link>{" · "}
          <Link href="/" className="hover:text-[var(--accent-text)]">Acasa</Link>
        </footer>
      </div>
    </>
  );
}
