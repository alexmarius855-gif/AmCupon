import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import MagazinCard from "../components/MagazinCard";
import NewsletterCTA from "../components/NewsletterCTA";
import NisaProduse from "../components/NisaProduse";
import { esteInCategorie } from "../../lib/categoriiNisa";

interface Promotie { nume: string; cod_cupon: string; landing_page: string; zile_ramase: number; }
interface Magazin {
  magazin: string; url: string; url_afiliat: string; logo_url?: string;
  categorie: string; categorie_slug?: string; scor_final: number;
  are_promotie: boolean; cod_cupon: boolean; promotii: Promotie[]; trend: number;
}

export const metadata: Metadata = {
  title: "Reduceri Jucării & Haine Copii 2026 — Coduri Noriel, eMAG | AmCupon.ro",
  description: "Coduri reducere magazine copii 2026: Noriel, eMAG, FashionDays Copii, H&M Kids. Jucării, haine, cărucioare, scaune auto — la prețuri reduse.",
  keywords: ["reduceri jucarii", "cod reducere noriel", "haine copii reducere", "jucarii ieftine online", "emag copii reducere", "carucior reducere", "scaun auto copil reducere"],
  alternates: { canonical: "https://amcupon.ro/copii" },
  openGraph: { title: "Reduceri Copii & Jucării 2026 | AmCupon.ro", url: "https://amcupon.ro/copii", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_COPII = ["noriel.ro","emag.ro","smythstoys.com","bebetei.ro","bebe-tei.ro","mothercare.ro","chicco.ro"];
// Sluguri REALE din output.json — potrivire EXACTA, nu subsir (vezi lib/categoriiNisa.ts)
const CAT_COPII = ["copii"];
const GRUPE_VARSTA = [
  { emoji: "👶", label: "0-2 ani", desc: "Cărucioare, scaune auto, jucării senzoriale" },
  { emoji: "🧒", label: "3-6 ani", desc: "LEGO Duplo, jocuri de rol, seturi creative" },
  { emoji: "👦", label: "7-12 ani", desc: "LEGO Technic, cărți, jocuri video, biciclete" },
  { emoji: "👧", label: "Fete 3-12 ani", desc: "Păpuși, seturi bijuterii, cărți ilustrate" },
];

const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Reduceri Copii & Jucării 2026","url":"https://amcupon.ro/copii" };

export default function CopiiPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topCopii = TOP_COPII.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restCopii = all.filter(m =>
    !TOP_COPII.includes(m.magazin) &&
    esteInCategorie(m, CAT_COPII)
  ).sort((a,b)=>(b.are_promotie?1:0)-(a.are_promotie?1:0)||(b.scor_final||0)-(a.scor_final||0)).slice(0, 16);
  const magazine = [...topCopii, ...restCopii];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[#06080b]">
        <nav className="bg-[#06080b] border-b border-[#1f2329]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[#9399a0]">
            <Link href="/" className="hover:text-[#ddf93c]">Acasă</Link>
            <span className="mx-1">/</span>
            <span className="text-[#c9ced5] font-medium">Copii & Jucării</span>
          </div>
        </nav>

        {/* HERO */}
        <section className="bg-gradient-to-br from-[#c3dd2c] via-[#ddf93c] to-[#c3dd2c] text-[#0c1000] py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">🧸</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Jucării & Copii cu Reducere {an}</h1>
            <p className="text-[#2a2f10] text-lg mb-6 max-w-xl mx-auto">
              LEGO, păpuși, haine copii, cărucioare, scaune auto — coduri de reducere verificate
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["LEGO","Păpuși","Haine Kids","Cărucioare","Scaune auto","Cărți copii","Parcuri de joacă","Baby monitor"].map(c => (
                <span key={c} className="bg-[#1f2329] text-[#ffffff] text-sm font-semibold px-4 py-1.5 rounded-full border border-[#2a2f36]">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* GRUPE VARSTA */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-[#ffffff] mb-6 text-center">Cadouri și cumpărături pe vârstă</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {GRUPE_VARSTA.map(g => (
              <Link key={g.label} href="/categorii/copii"
                className="bg-[#14181c] border border-yellow-200 rounded-xl p-5 hover:shadow-md transition-all group">
                <div className="text-3xl mb-2">{g.emoji}</div>
                <h3 className="font-bold text-[#ffffff] text-sm mb-1">{g.label}</h3>
                <p className="text-xs text-[#c9ced5]">{g.desc}</p>
                <p className="text-xs font-bold text-[#ddf93c] mt-3 group-hover:text-[#c3dd2c]">Vezi reduceri →</p>
              </Link>
            ))}
          </div>
        </section>

        {/* MAGAZINE */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <div className="flex items-center gap-3 mb-5">
            
            <h2 className="text-xl font-black text-[#ffffff]">Magazine copii cu reduceri active</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {magazine.map((m) => (
              <MagazinCard key={m.magazin} m={m} />
            ))}
          </div>
        </section>
        <NewsletterCTA />


        <NisaProduse
          merchantSlugs={["noriel.ro","emag.ro","smythstoys.com","bebetei.ro","bebe-tei.ro","chicco.ro"]}
          catSlug="copii"
          titlu="Jucarii si produse copii cu reducere"
          culoareAccent="indigo"
          limit={12}
        />

        {/* SEO */}
        <section className="bg-[#14181c] border-t border-[#1f2329] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[#ffffff] mb-5">Ghid cumpărături copii inteligente</h2>
            <div className="space-y-4 text-sm text-[#c9ced5] leading-relaxed">
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">Cum economisești la jucării și haine copii</h3>
                <p>Noriel oferă cele mai bune prețuri la jucăriile populare (LEGO, Barbie, Hot Wheels) și are frecvent reduceri și pachete speciale. eMAG are gamă mai largă dar prețuri variabile — compară mereu.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">Cele mai bune momente pentru cumpărături copii</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Noiembrie (Black Friday)</strong> — cele mai mari reduceri la jucării scumpe (LEGO, console)</li>
                  <li><strong>Ianuarie</strong> — solduri post-Crăciun, reduceri 40-60% la stocuri rămase</li>
                  <li><strong>August (Back to School)</strong> — rechizite, ghiozdane, haine de scoală</li>
                  <li><strong>Luna nașterii</strong> — multe magazine trimit coduri exclusive la zi de naștere</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-base font-black text-[#c9ced5] mb-4">Exploreaza si alte categorii</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/farmacie", label: "💊 Farmacie" },
              { href: "/animale", label: "🐾 Animale" },
              { href: "/idei-cadouri", label: "🎁 Idei Cadouri" },
              { href: "/sanatate", label: "🌿 Sanatate" },
              { href: "/carti", label: "📚 Carti" },
              { href: "/oferte-azi", label: "🔥 Oferte de Azi" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-[#14181c] hover:bg-[#1f2329] hover:text-[#c3dd2c] text-[#c9ced5] text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-[#1f2329] hover:border-[#c9ced5]">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-[#1f2329] py-6 text-center text-xs text-[#9399a0] mt-4">
          © {an} AmCupon.ro ·{" "}
          <Link href="/idei-cadouri" className="hover:text-[#ddf93c]">Idei Cadouri</Link>{" · "}
          <Link href="/categorii/copii" className="hover:text-[#ddf93c]">Categorie Copii</Link>{" · "}
          <Link href="/categorii" className="hover:text-[#ddf93c]">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
