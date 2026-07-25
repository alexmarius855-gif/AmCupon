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
  title: "Cod Reducere Parfumuri România 2026 — Douglas, Notino, Sephora | AmCupon.ro",
  description: "Coduri de reducere parfumuri România: Douglas, Notino, Sephora, Makeup. Parfumuri originale, cosmetice, skincare la prețuri reduse. Verificate zilnic.",
  keywords: ["cod reducere parfumuri", "reduceri douglas", "parfumuri ieftine", "cod reducere notino", "sephora reducere", "parfumuri originale romania", "cosmetice reducere"],
  alternates: { canonical: "https://amcupon.ro/parfumuri" },
  openGraph: { title: "Parfumuri cu Reducere 2026 | AmCupon.ro", url: "https://amcupon.ro/parfumuri", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_BEAUTY = ["douglas.ro","notino.ro","sephora.ro","makeup.ro","marionnaud.ro","kiehl.ro","parfumexpress.ro"];
const CAT_BEAUTY = ["beauty","parfum","cosmet","frumus","makeup","skincare"];
const AVANTAJE = [
  { icon: "🌹", titlu: "Parfumuri de Lux", desc: "Chanel, Dior, YSL, Gucci — originale certificate" },
  { icon: "💄", titlu: "Machiaj", desc: "Fond de ten, ruj, rimel — branduri premium" },
  { icon: "🧴", titlu: "Skincare", desc: "Serumuri, creme, măști — rutina completă" },
  { icon: "🛁", titlu: "Îngrijire Corp", desc: "Loțiuni, uleiuri, exfolianți de lux" },
  { icon: "💅", titlu: "Nail Art", desc: "Ojă, geluri, accesorii manichiură" },
  { icon: "🎁", titlu: "Seturi Cadou", desc: "Seturi parfum + cremă — cadoul perfect" },
];

const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Parfumuri cu Reducere 2026","url":"https://amcupon.ro/parfumuri","description":"Coduri reducere parfumuri si cosmetice Romania — Douglas, Notino, Sephora" };

export default function ParfumuriPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topBeauty = TOP_BEAUTY.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restBeauty = all.filter(m =>
    !TOP_BEAUTY.includes(m.magazin) && m.are_promotie &&
    CAT_BEAUTY.some(c => (m.categorie_slug||"").includes(c) || m.categorie.toLowerCase().includes(c))
  ).slice(0, 16);
  const magazine = [...topBeauty, ...restBeauty];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[#0a0f1a]">
        <nav className="bg-[#0a0f1a] border-b border-[#1e293b]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[#94a3b8]">
            <Link href="/" className="hover:text-[#0d9488]">Acasă</Link>
            <span className="mx-1">/</span>
            <span className="text-[#cbd5e1] font-medium">Parfumuri cu Reducere</span>
          </div>
        </nav>

        <section className="bg-gradient-to-br from-[#0f766e] via-[#14b8a6] to-[#0f766e] text-[#f1f5f9] py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">🌹</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Parfumuri cu Reducere {an}</h1>
            <p className="text-[#ccfbf1] text-lg mb-6 max-w-xl mx-auto">
              Coduri de reducere verificate la Douglas, Notino, Sephora și alte magazine de cosmetice din România
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Parfumuri originale","Machiaj","Skincare","Îngrijire corp","Seturi cadou","Nail art"].map(c => (
                <span key={c} className="bg-slate-100 text-[#f1f5f9] text-sm font-semibold px-4 py-1.5 rounded-full border border-slate-200">{c}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-[#f1f5f9] mb-6 text-center">Ce găsești la parfumuri online</h2>
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

        <section className="max-w-6xl mx-auto px-4 pb-10">
          <div className="flex items-center gap-3 mb-5">
            
            <h2 className="text-xl font-black text-[#f1f5f9]">Magazine parfumuri cu reduceri active</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {magazine.map((m) => (
              <MagazinCard key={m.magazin} m={m} />
            ))}
          </div>
        </section>
        <NewsletterCTA />


        <NisaProduse
          merchantSlugs={["douglas.ro","notino.ro","sephora.ro","makeup.ro","marionnaud.ro"]}
          catSlug="beauty"
          titlu="Produse populare — Parfumuri & Cosmetice cu reducere"
          culoareAccent="indigo"
          limit={12}
        />

        <section className="bg-[#111827] border-t border-[#1e293b] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[#f1f5f9] mb-5">Ghid: Parfumuri originale ieftine în România</h2>
            <div className="space-y-4 text-sm text-[#cbd5e1] leading-relaxed">
              <div>
                <h3 className="font-bold text-[#f1f5f9] mb-1">Douglas vs Notino vs Sephora</h3>
                <p>Douglas are cele mai frecvente reduceri și o gamă largă de branduri premium. Notino excelează la parfumuri de nișă și prețuri competitive. Sephora atrage cu seturi exclusive și produse limitată.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#f1f5f9] mb-1">Parfumuri populare cu reduceri frecvente</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Chanel Coco Mademoiselle</strong> — bestseller cu -15% periodic</li>
                  <li><strong>Dior Sauvage</strong> — cel mai vândut parfum masculin</li>
                  <li><strong>YSL Black Opium</strong> — favorit feminin cu reduceri regulate</li>
                  <li><strong>Giorgio Armani Si</strong> — floral, reduceri la seturi cadou</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-[#f1f5f9] mb-1">Când să cumperi</h3>
                <p>Cele mai mari reduceri la parfumuri apar în noiembrie (Black Friday), înainte de Crăciun și de Valentine&apos;s Day. Douglas lansează frecvent promoții pentru membrii clubului de fidelitate.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-base font-black text-[#cbd5e1] mb-4">Exploreaza si alte categorii</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/frumusete", label: "💄 Frumusete" },
              { href: "/fashion", label: "👗 Fashion" },
              { href: "/idei-cadouri", label: "🎁 Idei Cadouri" },
              { href: "/sanatate", label: "🌿 Sanatate" },
              { href: "/categorii", label: "📂 Categorii" },
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
          <Link href="/frumusete" className="hover:text-[#0d9488]">Frumusețe</Link>{" · "}
          <Link href="/farmacie" className="hover:text-[#0d9488]">Farmacie</Link>{" · "}
          <Link href="/categorii" className="hover:text-[#0d9488]">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
