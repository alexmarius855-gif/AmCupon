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
  title: "Farmacie Online Ieftină România 2026 — Reduceri Dr. Max, Vegis | AmCupon.ro",
  description: "Coduri de reducere farmacie online România: Dr. Max, Vegis, Catena, Sensiblu. Suplimente, medicamente OTC, cosmetice medicale la prețuri reduse. Livrare rapidă.",
  keywords: ["farmacie online", "cod reducere dr max", "reduceri vegis", "suplimente ieftine", "medicamente online romania", "farmacie reducere", "catena online"],
  alternates: { canonical: "https://amcupon.ro/farmacie" },
  openGraph: { title: "Farmacie Online cu Reducere 2026 | AmCupon.ro", url: "https://amcupon.ro/farmacie", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_PHARMA = ["drmax.ro","vegis.ro","catena.ro","helpnet.ro","farmaciatei.ro","farmacia.ro"];
const CAT_PHARMA = ["pharma","health","sanatate","farmacie","medical","wellness"];
const AVANTAJE = [
  { icon: "💊", titlu: "Medicamente OTC", desc: "Antialgice, antitusive, vitamine — fara rețetă" },
  { icon: "🌿", titlu: "Naturiste & Suplimente", desc: "Plante medicinale, vitamine, probiotice" },
  { icon: "💄", titlu: "Cosmetice Medicale", desc: "Vichy, La Roche-Posay, Avène — dermatologic testate" },
  { icon: "🩺", titlu: "Aparate Medicale", desc: "Tensiometre, glucometre, termometre" },
  { icon: "🍼", titlu: "Mamă & Bebe", desc: "Produse pentru sarcină, bebeluși, alăptare" },
  { icon: "🐾", titlu: "Produse Veterinare", desc: "Antiparazitare, vitamine pentru animale" },
];

const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Farmacie Online cu Reducere 2026","url":"https://amcupon.ro/farmacie","description":"Coduri reducere farmacii online Romania" };

export default function FarmaciePage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topPharma = TOP_PHARMA.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restPharma = all.filter(m =>
    !TOP_PHARMA.includes(m.magazin) && m.are_promotie &&
    CAT_PHARMA.some(c => (m.categorie_slug||"").includes(c) || m.categorie.toLowerCase().includes(c))
  ).slice(0, 16);
  const magazine = [...topPharma, ...restPharma];
  const cuPromo = magazine.filter(m => m.are_promotie);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[#0a0f1a]">
        <nav className="bg-[#0a0f1a] border-b border-[#1e293b]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[#94a3b8]">
            <Link href="/" className="hover:text-[#0d9488]">Acasă</Link>
            <span className="mx-1">/</span>
            <span className="text-[#cbd5e1] font-medium">Farmacie Online</span>
          </div>
        </nav>

        {/* HERO */}
        <section className="bg-gradient-to-br from-[#0f766e] via-[#14b8a6] to-[#0f766e] text-[#f1f5f9] py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">💊</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Farmacie Online cu Reducere {an}</h1>
            <p className="text-[#ccfbf1] text-lg mb-6 max-w-xl mx-auto">
              Coduri de reducere verificate la Dr. Max, Vegis, Catena și alte farmacii online din România
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Suplimente","Vitamine","Cosmetice medicale","Aparate medicale","Mamă & Bebe"].map(c => (
                <span key={c} className="bg-slate-100 text-[#f1f5f9] text-sm font-semibold px-4 py-1.5 rounded-full border border-slate-200">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* AVANTAJE */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-[#f1f5f9] mb-6 text-center">Ce găsești la farmacie online</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVANTAJE.map(a => (
              <div key={a.titlu} className="bg-[#111827] border border-[#1e293b] rounded-xl p-5">
                <div className="text-3xl mb-2">{a.icon}</div>
                <h3 className="font-bold text-[#f1f5f9] text-sm mb-1">{a.titlu}</h3>
                <p className="text-xs text-[#cbd5e1]">{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* MAGAZINE */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <div className="flex items-center gap-3 mb-5">
            
            <h2 className="text-xl font-black text-[#f1f5f9]">Farmacii online cu reduceri active</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {magazine.map((m) => (
              <MagazinCard key={m.magazin} m={m} />
            ))}
          </div>
        </section>
        <NewsletterCTA />


        <NisaProduse
          merchantSlugs={["drmax.ro","vegis.ro","catena.ro","helpnet.ro","farmaciatei.ro","farmacia.ro"]}
          catSlug="farmacie"
          titlu="Produse populare — Farmacie Online cu reducere"
          culoareAccent="indigo"
          limit={12}
        />

        {/* SEO */}
        <section className="bg-[#111827] border-t border-[#1e293b] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[#f1f5f9] mb-5">Ghid: Farmacie online în România</h2>
            <div className="space-y-4 text-sm text-[#cbd5e1] leading-relaxed">
              <div>
                <h3 className="font-bold text-[#f1f5f9] mb-1">De ce farmacie online?</h3>
                <p>Prețurile la suplimente și produse OTC pot fi cu 20-40% mai mici online față de farmacia fizică. Livrarea se face în 24-48h, iar gama de produse este mult mai largă. Dr. Max, Vegis și Catena sunt cele mai populare opțiuni în România.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#f1f5f9] mb-1">Cele mai cumpărate produse</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Vitamina D3 + K2</strong> — deficiență comună la români, esențial în anotimpul rece</li>
                  <li><strong>Magneziu bisglicinat</strong> — stres, somn, crampe musculare</li>
                  <li><strong>Omega-3 EPA+DHA</strong> — sănătate cardiovasculară și cognitivă</li>
                  <li><strong>Crema Vichy / La Roche-Posay</strong> — cosmetice dermatologice cu discounturi frecvente</li>
                  <li><strong>Tensiometru Omron</strong> — aparatură medicală la prețuri mai bune online</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-[#f1f5f9] mb-1">Sfaturi pentru economii</h3>
                <p>Abonează-te la newsletter-ul Dr. Max și Vegis pentru coduri exclusive. Cumpără în cantități mai mari pentru discount suplimentar. Verifică secțiunea &ldquo;Oferte Zilnice&rdquo; înainte de orice comandă.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-base font-black text-[#cbd5e1] mb-4">Exploreaza si alte categorii</h2>
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
                className="bg-[#111827] hover:bg-[#1e293b] hover:text-[#0f766e] text-[#cbd5e1] text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-[#1e293b] hover:border-[#cbd5e1]">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-[#1e293b] py-6 text-center text-xs text-[#94a3b8] mt-4">
          © {an} AmCupon.ro ·{" "}
          <Link href="/idei-cadouri" className="hover:text-[#0d9488]">Idei Cadouri</Link>{" · "}
          <Link href="/gadgets" className="hover:text-[#0d9488]">Gadgets</Link>{" · "}
          <Link href="/categorii" className="hover:text-[#0d9488]">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
