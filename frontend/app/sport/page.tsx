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
  title: "Reduceri Sport & Fitness 2026 | AmCupon.ro",
  description: "Coduri de reducere echipament sport și fitness 2026: Decathlon, Sportisimo, Sport Vision, Intersport. Biciclete, echipament sală, outdoor, running.",
  keywords: ["reduceri sport", "cod reducere decathlon", "echipament fitness ieftin", "bicicleta reducere", "sportisimo reducere", "sport outdoor reducere romania"],
  alternates: { canonical: "https://amcupon.ro/sport" },
  openGraph: { title: "Reduceri Sport & Fitness 2026 | AmCupon.ro", url: "https://amcupon.ro/sport", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_SPORT = ["decathlon.ro","sportisimo.ro","sport-vision.ro","intersport.ro","hervis.ro","gigasport.ro","trampolinepartsandsupply.com"];
// Sluguri REALE din output.json — potrivire EXACTA, nu subsir (vezi lib/categoriiNisa.ts)
const CAT_SPORT = ["sport"];
const SUBCATEGORII = [
  { emoji: "🏃", label: "Running", href: "/categorii/sport" },
  { emoji: "🚴", label: "Ciclism", href: "/categorii/sport" },
  { emoji: "⛺", label: "Camping", href: "/categorii/sport" },
  { emoji: "🏋️", label: "Fitness & Sală", href: "/categorii/sport" },
  { emoji: "⚽", label: "Fotbal", href: "/categorii/sport" },
  { emoji: "🎿", label: "Ski & Iarnă", href: "/categorii/sport" },
  { emoji: "🏊", label: "Înot", href: "/categorii/sport" },
  { emoji: "🧗", label: "Hiking & Alpinism", href: "/categorii/sport" },
];

const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Reduceri Sport & Fitness 2026","url":"https://amcupon.ro/sport" };

export default function SportPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topSport = TOP_SPORT.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restSport = all.filter(m =>
    !TOP_SPORT.includes(m.magazin) &&
    esteInCategorie(m, CAT_SPORT)
  ).sort((a,b)=>(b.are_promotie?1:0)-(a.are_promotie?1:0)||(b.scor_final||0)-(a.scor_final||0)).slice(0, 16);
  const magazine = [...topSport, ...restSport];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[#06080b]">
        <nav className="bg-[#06080b] border-b border-[#1f2329]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[#9399a0]">
            <Link href="/" className="hover:text-[#ddf93c]">Acasă</Link>
            <span className="mx-1">/</span>
            <span className="text-[#c9ced5] font-medium">Sport & Fitness</span>
          </div>
        </nav>

        {/* HERO */}
        <section className="bg-gradient-to-br from-[#c3dd2c] via-[#ddf93c] to-[#c3dd2c] text-[#0c1000] py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">🏃</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Sport & Fitness cu Reducere {an}</h1>
            <p className="text-[#2a2f10] text-lg mb-6 max-w-xl mx-auto">
              Echipament sport, biciclete, sală fitness — coduri de reducere verificate zilnic
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUBCATEGORII.map(s => (
                <a key={s.label} href={s.href}
                  className="flex items-center gap-1.5 bg-[#1f2329] hover:bg-[#2a2f36] text-[#ffffff] text-sm font-semibold px-4 py-1.5 rounded-full border border-[#2a2f36] transition-colors">
                  {s.emoji} {s.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* MAGAZINE */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-center gap-3 mb-5">
            
            <h2 className="text-xl font-black text-[#ffffff]">Magazine sport cu reduceri active</h2>
          </div>
          {magazine.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#c9ced5] mb-4">Momentan nu sunt magazine sport cu promoții active.</p>
              <Link href="/categorii/sport"
                className="inline-block bg-[#ddf93c] text-[#0c1000] font-bold px-6 py-3 rounded-xl hover:bg-[#ddf93c] transition-colors">
                Vezi echipament sport →
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
          merchantSlugs={["decathlon.ro","sportisimo.ro","sport-vision.ro","intersport.ro","hervis.ro","gigasport.ro"]}
          catSlug="sport"
          titlu="Echipament sport popular cu reducere"
          culoareAccent="indigo"
          limit={12}
        />

        {/* SEO */}
        <section className="bg-[#14181c] border-t border-[#1f2329] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[#ffffff] mb-5">Ghid: Echipament sport mai ieftin</h2>
            <div className="space-y-4 text-sm text-[#c9ced5] leading-relaxed">
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">Cum economisești la echipament sport</h3>
                <p>Decathlon oferă cel mai bun raport calitate-preț pentru echipament entry-level cu brandurile proprii (Quechua, Domyos, Kipsta). Pentru echipament premium, caută reduceri la finalul sezonului — reduceri de 40-60% sunt frecvente în ianuarie și august.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">Cele mai bune perioade pentru cumpărături sport</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Ianuarie</strong> — solduri de iarnă, reduceri echipament ski și fitness</li>
                  <li><strong>Iulie-August</strong> — solduri de vară, echipament outdoor, biciclete</li>
                  <li><strong>Black Friday</strong> — reduceri mari la electronice sport (ceasuri GPS, earbuds sport)</li>
                  <li><strong>Back to School</strong> — septembrie, echipament pentru activități sportive școlare</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">Echipament sport la cel mai mic preț</h3>
                <p>Combină prețul din ShopMania cu codul de reducere de pe AmCupon.ro. La echipament scump (biciclete, ceasuri GPS, căști sport), diferența poate ajunge la sute de lei.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-base font-black text-[#c9ced5] mb-4">Exploreaza si alte categorii</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/farmacie", label: "💊 Farmacie" },
              { href: "/gadgets", label: "📡 Gadgets" },
              { href: "/moto", label: "🚗 Auto-Moto" },
              { href: "/sanatate", label: "🌿 Sanatate" },
              { href: "/copii", label: "👶 Copii" },
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
          <Link href="/moto" className="hover:text-[#ddf93c]">Auto-Moto</Link>{" · "}
          <Link href="/gadgets" className="hover:text-[#ddf93c]">Gadgets</Link>{" · "}
          <Link href="/categorii" className="hover:text-[#ddf93c]">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
