import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import MagazinCard from "../components/MagazinCard";
import NewsletterCTA from "../components/NewsletterCTA";
import NisaProduse from "../components/NisaProduse";
import { esteInCategorie } from "../../lib/categoriiNisa";
import { laParteneri } from "@/lib/cifreSite";
import { NISA_CATEGORII } from "@/lib/categoriiNisa";

interface Promotie { nume: string; cod_cupon: string; landing_page: string; zile_ramase: number; }
interface Magazin {
  magazin: string; url: string; url_afiliat: string; logo_url?: string;
  categorie: string; categorie_slug?: string; scor_final: number;
  are_promotie: boolean; cod_cupon: boolean; promotii: Promotie[]; trend: number;
}

export const metadata: Metadata = {
  title: "Farmacie Online Ieftină România 2026 — Reduceri Dr. Max",
  description: `Coduri de reducere și oferte la farmaciile online ${laParteneri(NISA_CATEGORII.farmacie)}: suplimente, medicamente fără rețetă, dermatocosmetice.`,
  keywords: ["farmacie online", "cod reducere dr max", "reduceri vegis", "suplimente ieftine", "medicamente online romania", "farmacie reducere", "catena online"],
  alternates: { canonical: "https://amcupon.ro/farmacie" },
  openGraph: { title: "Farmacie Online 2026 | AmCupon.ro", url: "https://amcupon.ro/farmacie", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_PHARMA = ["drmax.ro"];
// Sluguri REALE din output.json — potrivire EXACTA, nu subsir (vezi lib/categoriiNisa.ts)
const CAT_PHARMA = ["sanatate"];
const AVANTAJE = [
  { icon: "💊", titlu: "Medicamente OTC", desc: "Antialgice, antitusive, vitamine — fara rețetă" },
  { icon: "🌿", titlu: "Naturiste & Suplimente", desc: "Plante medicinale, vitamine, probiotice" },
  { icon: "💄", titlu: "Cosmetice Medicale", desc: "Vichy, La Roche-Posay, Avène — dermatologic testate" },
  { icon: "🩺", titlu: "Aparate Medicale", desc: "Tensiometre, glucometre, termometre" },
  { icon: "🍼", titlu: "Mamă & Bebe", desc: "Produse pentru sarcină, bebeluși, alăptare" },
  { icon: "🐾", titlu: "Produse Veterinare", desc: "Antiparazitare, vitamine pentru animale" },
];

const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Farmacie Online 2026","url":"https://amcupon.ro/farmacie","description":"Coduri si oferte de la farmaciile online partenere AmCupon" };

export default function FarmaciePage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topPharma = TOP_PHARMA.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restPharma = all.filter(m =>
    !TOP_PHARMA.includes(m.magazin) &&
    esteInCategorie(m, CAT_PHARMA)
  ).sort((a,b)=>(b.are_promotie?1:0)-(a.are_promotie?1:0)||(b.scor_final||0)-(a.scor_final||0)).slice(0, 16);
  const magazine = [...topPharma, ...restPharma];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[#06080b]">
        <nav className="bg-[#06080b] border-b border-[#1f2329]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[#9399a0]">
            <Link href="/" className="hover:text-[#ddf93c]">Acasă</Link>
            <span className="mx-1">/</span>
            <span className="text-[#c9ced5] font-medium">Farmacie Online</span>
          </div>
        </nav>

        {/* HERO */}
        <section className="bg-gradient-to-br from-[#c3dd2c] via-[#ddf93c] to-[#c3dd2c] text-[#0c1000] py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">💊</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Farmacie Online {an}</h1>
            <p className="text-[#2a2f10] text-lg mb-6 max-w-xl mx-auto">
              Oferte {laParteneri(NISA_CATEGORII.farmacie, 3)} și la alte farmacii online partenere
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Suplimente","Vitamine","Cosmetice medicale","Aparate medicale","Mamă & Bebe"].map(c => (
                <span key={c} className="bg-[#1f2329] text-[#ffffff] text-sm font-semibold px-4 py-1.5 rounded-full border border-[#2a2f36]">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* AVANTAJE */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-[#ffffff] mb-6 text-center">Ce găsești la farmacie online</h2>
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

        {/* MAGAZINE */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <div className="flex items-center gap-3 mb-5">
            
            <h2 className="text-xl font-black text-[#ffffff]">Farmacii si magazine de sanatate</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {magazine.map((m) => (
              <MagazinCard key={m.magazin} m={m} />
            ))}
          </div>
        </section>
        <NewsletterCTA />


        <NisaProduse
          merchantSlugs={["drmax.ro","catena.ro","helpnet.ro","farmaciatei.ro","farmacia.ro"]}
          catSlug="farmacie"
          titlu="Produse de farmacie de la parteneri"
          culoareAccent="indigo"
          limit={12}
        />

        {/* SEO */}
        <section className="bg-[#14181c] border-t border-[#1f2329] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[#ffffff] mb-5">Ghid: Farmacie online în România</h2>
            <div className="space-y-4 text-sm text-[#c9ced5] leading-relaxed">
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">De ce farmacie online?</h3>
                <p>Online găsești de obicei o gamă mai largă și poți compara prețurile între farmacii. Termenul de livrare diferă de la o farmacie la alta. Dr. Max, Vegis și ceilalți parteneri AmCupon apar mai sus, cu ofertele active.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">Produse căutate des</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Vitamina D3 + K2</strong> — nivelul vitaminei D se află din analize</li>
                  <li><strong>Magneziu</strong> — există mai multe forme (citrat, bisglicinat); întreabă farmacistul</li>
                  <li><strong>Omega-3 (EPA + DHA)</strong></li>
                  <li><strong>Dermatocosmetice</strong> — Vichy, La Roche-Posay</li>
                  <li><strong>Tensiometre</strong> — Omron și alte mărci</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">Sfaturi pentru economii</h3>
                <p>Abonează-te la newsletterul farmaciei preferate — anunță promoțiile. La produsele pe care le iei constant, pachetele mai mari ies de obicei mai ieftin. Înainte de un supliment, întreabă medicul sau farmacistul.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-base font-black text-[#c9ced5] mb-4">Exploreaza si alte categorii</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/sanatate", label: "🌿 Sanatate" },
              { href: "/frumusete", label: "💄 Frumusete" },
              { href: "/copii", label: "👶 Copii" },
              { href: "/animale", label: "🐾 Animale" },
              { href: "/sport", label: "🏃 Sport" },
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
          <Link href="/gadgets" className="hover:text-[#ddf93c]">Gadgets</Link>{" · "}
          <Link href="/categorii" className="hover:text-[#ddf93c]">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
