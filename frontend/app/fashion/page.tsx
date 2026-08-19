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
  title: "Cod Reducere Fashion & Haine 2026 — FashionDays, Answear, H&M | AmCupon.ro",
  description: "Coduri de reducere fashion Romania: FashionDays, Answear, H&M, Reserved, About You, Zara. Haine, pantofi, accesorii la preturi reduse. Verificate zilnic.",
  keywords: ["cod reducere fashiondays","reduceri answear","haine ieftine online","cod reducere hm","reserved reducere","fashion online romania","imbracaminte reducere"],
  alternates: { canonical: "https://amcupon.ro/fashion" },
  openGraph: { title: "Fashion & Haine cu Reducere 2026 | AmCupon.ro", url: "https://amcupon.ro/fashion", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_FASHION = ["answear.ro","hm.com","reserved.com","about-you.ro","lc-waikiki.ro","zara.com","peek-cloppenburg.ro"];
// Sluguri REALE din output.json — potrivire EXACTA, nu subsir (vezi lib/categoriiNisa.ts)
const CAT_FASHION = ["fashion"];
const AVANTAJE = [
  { icon: "👗", titlu: "Haine Dama", desc: "Rochii, bluze, pantaloni — branduri premium cu discount" },
  { icon: "👔", titlu: "Haine Barbati", desc: "Tricouri, camasi, costume — moda masculina la preturi reduse" },
  { icon: "👟", titlu: "Pantofi & Incaltaminte", desc: "Adidasi, pantofi, cizme — Nike, Adidas, Puma" },
  { icon: "👜", titlu: "Genti & Accesorii", desc: "Genti, curele, bijuterii fashion" },
  { icon: "🧥", titlu: "Outerwear", desc: "Geci, paltoane, jachete de sezon" },
  { icon: "🩱", titlu: "Lenjerie & Pijamale", desc: "Lenjerie intima, pijamale, sosete — branduri de calitate" },
];

const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Fashion & Haine cu Reducere 2026","url":"https://amcupon.ro/fashion","description":"Coduri reducere fashion si haine Romania — FashionDays, Answear, H&M, Reserved" };

export default function FashionPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topFashion = TOP_FASHION.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restFashion = all.filter(m =>
    !TOP_FASHION.includes(m.magazin) &&
    esteInCategorie(m, CAT_FASHION)
  ).sort((a,b)=>(b.are_promotie?1:0)-(a.are_promotie?1:0)||(b.scor_final||0)-(a.scor_final||0)).slice(0, 16);
  const magazine = [...topFashion, ...restFashion];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[#06080b]">
        <nav className="bg-[#06080b] border-b border-[#1f2329]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[#9399a0]">
            <Link href="/" className="hover:text-[#ddf93c]">Acasa</Link>
            <span className="mx-1">/</span>
            <span className="text-[#c9ced5] font-medium">Fashion & Haine cu Reducere</span>
          </div>
        </nav>

        <section className="bg-gradient-to-br from-[#c3dd2c] via-[#ddf93c] to-[#c3dd2c] text-[#0c1000] py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">👗</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Fashion & Haine cu Reducere {an}</h1>
            <p className="text-[#2a2f10] text-lg mb-6 max-w-xl mx-auto">
              Coduri de reducere verificate la FashionDays, Answear, H&M si alte magazine de moda din Romania
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Haine Dama","Haine Barbati","Pantofi","Genti","Geci","Lenjerie","Accesorii"].map(c => (
                <span key={c} className="bg-[#1f2329] text-[#ffffff] text-sm font-semibold px-4 py-1.5 rounded-full border border-[#2a2f36]">{c}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-[#ffffff] mb-6 text-center">Ce gasesti la magazine fashion online</h2>
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

        <section className="max-w-6xl mx-auto px-4 pb-10">
          <div className="flex items-center gap-3 mb-5">
            
            <h2 className="text-xl font-black text-[#ffffff]">Magazine fashion cu reduceri active</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {magazine.map((m) => (
              <MagazinCard key={m.magazin} m={m} />
            ))}
          </div>
        </section>
        <NewsletterCTA />


        <NisaProduse
          merchantSlugs={["answear.ro","hm.com","reserved.com","about-you.ro","lc-waikiki.ro"]}
          catSlug="fashion"
          titlu="Haine & accesorii populare cu reducere"
          culoareAccent="indigo"
          limit={12}
        />

        <section className="bg-[#14181c] border-t border-[#1f2329] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[#ffffff] mb-5">Ghid: Haine online mai ieftine in Romania</h2>
            <div className="space-y-4 text-sm text-[#c9ced5] leading-relaxed">
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">FashionDays vs Answear vs H&M</h3>
                <p>FashionDays are cele mai frecvente reduceri flash (24-48h) cu discount de 50-70%. Answear exceleaza la branduri premium internationale. H&M are mereu o sectiune Sale cu articole sub 50 lei, plus promotii pentru membrii club.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">Cele mai bune perioade pentru cumparaturi fashion</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Solduri de iarna (ianuarie)</strong> — reduceri 50-80% la colectiile de toamna-iarna</li>
                  <li><strong>Solduri de vara (iulie)</strong> — lichidare stocuri primavara-vara</li>
                  <li><strong>Black Friday</strong> — discount-uri la branduri premium</li>
                  <li><strong>Saptamana modei (septembrie)</strong> — promotii la colectii noi</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">Cum economisesti la haine online</h3>
                <p>Adauga produsele in wishlist si asteapta promotii. FashionDays trimite notificari cand un produs din wishlist intra la reducere. Cumparaturile de la sfarsit de sezon pot economisi 60-80% fata de pretul initial.</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-[#1f2329] py-6 text-center text-xs text-[#9399a0] mt-4">
          © {an} AmCupon.ro ·{" "}
          <Link href="/frumusete" className="hover:text-[#ddf93c]">Frumusete</Link>{" · "}
          <Link href="/idei-cadouri" className="hover:text-[#ddf93c]">Idei Cadouri</Link>{" · "}
          <Link href="/categorii" className="hover:text-[#ddf93c]">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
