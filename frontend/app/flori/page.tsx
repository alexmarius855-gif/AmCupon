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
  title: "Reduceri Flori & Buchete 2026 — Livrare Rapida | AmCupon.ro",
  description: "Coduri de reducere la florarii online din Romania: Floria.ro, 3gifts.ro, Mariart.ro. Livrare flori si buchete rapida pentru orice ocazie — reduceri verificate.",
  keywords: ["reduceri flori", "cod reducere floria", "livrare flori online romania", "buchete reducere", "florarie online ieftina", "flori cadou reducere"],
  alternates: { canonical: "https://amcupon.ro/flori" },
  openGraph: { title: "Reduceri Flori & Buchete 2026 | AmCupon.ro", url: "https://amcupon.ro/flori", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_FLORI = ["floria.ro", "3gifts.ro", "mariart.ro"];
// brazicraciun.net e in aceeasi categorie 2P "Gifts & Flowers" dar vinde brazi de Craciun,
// nu flori — exclus explicit ca sa nu apara gresit pe pagina de flori.
const EXCLUSE = new Set(["brazicraciun.net"]);

const OCAZII = [
  { emoji: "💐", label: "Zi de naștere", desc: "Buchete vesele, colorate" },
  { emoji: "💍", label: "Aniversare/Nuntă", desc: "Aranjamente elegante" },
  { emoji: "❤️", label: "Valentine's Day", desc: "Trandafiri & romantism" },
  { emoji: "👩", label: "8 Martie", desc: "Flori pentru femeile dragi" },
  { emoji: "🎉", label: "Felicitări", desc: "Promovare, examen, reușită" },
  { emoji: "🕊️", label: "Condoleanțe", desc: "Coroane & aranjamente discrete" },
];

const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Reduceri Flori & Buchete 2026","url":"https://amcupon.ro/flori" };

export default function FloriPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topFlori = TOP_FLORI.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restFlori = all.filter(m =>
    !TOP_FLORI.includes(m.magazin) && !EXCLUSE.has(m.magazin) &&
    m.categorie_slug === "gifts-flowers" &&
    (m.categorie || "").toLowerCase().includes("flower")
  ).slice(0, 8);
  const magazine = [...topFlori, ...restFlori];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[#0a0f1a]">
        <nav className="bg-[#0a0f1a] border-b border-[#1e293b]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[#94a3b8]">
            <Link href="/" className="hover:text-[#0d9488]">Acasă</Link>
            <span className="mx-1">/</span>
            <span className="text-[#cbd5e1] font-medium">Flori & Buchete</span>
          </div>
        </nav>

        {/* HERO */}
        <section className="bg-gradient-to-br from-[#14b8a6] via-[#14b8a6] to-[#14b8a6] text-white py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">💐</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Flori & Buchete cu Reducere {an}</h1>
            <p className="text-[#0f766e] text-lg mb-6 max-w-xl mx-auto">
              Livrare rapidă, aranjamente proaspete și reduceri verificate pentru orice ocazie
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Trandafiri","Buchete mixte","Cutii cu flori","Aranjamente nuntă","Livrare azi","Coroane"].map(c => (
                <span key={c} className="bg-[#1e293b] text-[#f1f5f9] text-sm font-semibold px-4 py-1.5 rounded-full border border-[#334155]">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* OCAZII */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-[#f1f5f9] mb-6 text-center">Flori pentru orice ocazie</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {OCAZII.map(o => (
              <div key={o.label}
                className="bg-[#111827] border border-[#1e293b] rounded-xl p-5 hover:shadow-md transition-all">
                <div className="text-3xl mb-2">{o.emoji}</div>
                <h3 className="font-bold text-[#f1f5f9] text-sm mb-1">{o.label}</h3>
                <p className="text-xs text-[#cbd5e1]">{o.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* MAGAZINE */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-xl font-black text-[#f1f5f9]">Florării cu reduceri active</h2>
          </div>
          {magazine.length === 0 ? (
            <div className="text-center py-10 bg-[#111827] rounded-xl">
              <p className="text-2xl mb-3">💐</p>
              <p className="text-[#cbd5e1] font-medium mb-2">Explorează ofertele noastre de cadouri</p>
              <Link href="/idei-cadouri" className="inline-block bg-[#0d9488] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#14b8a6] transition-colors">
                Vezi idei de cadouri →
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
        <NewsletterCTA />


        <NisaProduse
          merchantSlugs={TOP_FLORI}
          catSlug="flori"
          titlu="Buchete & aranjamente cu reducere"
          culoareAccent="rose"
          limit={12}
        />

        {/* SEO */}
        <section className="bg-[#111827] border-t border-[#1e293b] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[#f1f5f9] mb-5">Cum alegi florăria potrivită</h2>
            <div className="space-y-4 text-sm text-[#cbd5e1] leading-relaxed">
              <div>
                <h3 className="font-bold text-[#f1f5f9] mb-1">Livrare rapidă vs. programată</h3>
                <p>Pentru ocazii de ultim moment, alege florării cu livrare în 2-4 ore în oraș mare. Pentru evenimente planificate (nuntă, aniversare), comandă cu 2-3 zile înainte pentru cele mai proaspete aranjamente și prețuri mai mici.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#f1f5f9] mb-1">Sfaturi pentru economii la flori {an}</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Abonamente flori</strong> — unele florării oferă reduceri la livrări recurente lunare</li>
                  <li><strong>Sezonalitate</strong> — florile de sezon sunt cu 20-30% mai ieftine decât cele de import</li>
                  <li><strong>Coduri de reducere</strong> — verifică AmCupon înainte de orice comandă, mai ales de 8 Martie și Valentine&apos;s Day</li>
                  <li><strong>Combo cadou</strong> — buchet + cadou mic (ciocolată, vin) e deseori mai ieftin combinat decât separat</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-base font-black text-[#cbd5e1] mb-4">Explorează si alte categorii</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/idei-cadouri", label: "🎁 Idei Cadouri" },
              { href: "/calatorie", label: "✈️ Vacanțe & Călătorii" },
              { href: "/fashion", label: "👗 Fashion" },
              { href: "/top-reduceri", label: "🏆 Top Reduceri" },
              { href: "/categorii", label: "📂 Categorii" },
              { href: "/oferte-azi", label: "🔥 Oferte de Azi" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-[#111827] hover:bg-[#1e293b] hover:text-[#0f766e] text-[#cbd5e1] text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-[#1e293b] hover:border-[#14b8a6]">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-[#1e293b] py-6 text-center text-xs text-[#94a3b8] mt-4">
          © {an} AmCupon.ro ·{" "}
          <Link href="/blog" className="hover:text-[#0d9488]">Blog</Link>{" · "}
          <Link href="/categorii" className="hover:text-[#0d9488]">Categorii</Link>{" · "}
          <Link href="/" className="hover:text-[#0d9488]">Acasă</Link>
        </footer>
      </div>
    </>
  );
}
