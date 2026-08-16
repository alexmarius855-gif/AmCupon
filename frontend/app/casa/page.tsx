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
  title: "Cod Reducere Casa & Gradina 2026 | AmCupon.ro",
  description: "Coduri de reducere casa si gradina Romania: Dedeman, IKEA, Leroy Merlin, Mobexpert, Jysk. Mobila, decoratiuni, gradina, electrocasnice mari la preturi reduse. Verificate zilnic.",
  keywords: ["cod reducere dedeman","reduceri ikea","mobila ieftina","cod reducere leroy merlin","mobexpert reducere","casa gradina reducere romania","electrocasnice reducere"],
  alternates: { canonical: "https://amcupon.ro/casa" },
  openGraph: { title: "Casa & Gradina cu Reducere 2026 | AmCupon.ro", url: "https://amcupon.ro/casa", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_CASA = ["dedeman.ro","ikea.com","leroy-merlin.ro","mobexpert.ro","jysk.ro","hornbach.ro","kika.ro","someproducts.ro","electrolux.ro","clickandgrow.com"];
// Sluguri REALE din output.json — potrivire EXACTA, nu subsir (vezi lib/categoriiNisa.ts)
const CAT_CASA = ["casa-gradina"];
const AVANTAJE = [
  { icon: "🛋️", titlu: "Mobila & Living", desc: "Canapele, paturi, dulapuri — branduri top la preturi reduse" },
  { icon: "🌿", titlu: "Gradina & Terasa", desc: "Mobilier gradina, plante, unelte — tot ce ai nevoie" },
  { icon: "🔨", titlu: "Bricolaj & Constructii", desc: "Materiale, scule, vopsele — Dedeman, Hornbach, Leroy" },
  { icon: "🍳", titlu: "Bucatarie", desc: "Electrocasnice, vase, accesorii bucatarie" },
  { icon: "🛁", titlu: "Baie & Sanitare", desc: "Cazi, dusuri, obiecte sanitare cu discount" },
  { icon: "💡", titlu: "Iluminat & Decoratiuni", desc: "Lustre, lampi, tablouri, obiecte decorative" },
];

const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Casa & Gradina cu Reducere 2026","url":"https://amcupon.ro/casa","description":"Coduri reducere casa si gradina Romania — Dedeman, IKEA, Leroy Merlin, Mobexpert" };

export default function CasaPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topCasa = TOP_CASA.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restCasa = all.filter(m =>
    !TOP_CASA.includes(m.magazin) &&
    esteInCategorie(m, CAT_CASA)
  ).sort((a,b)=>(b.are_promotie?1:0)-(a.are_promotie?1:0)||(b.scor_final||0)-(a.scor_final||0)).slice(0, 16);
  const magazine = [...topCasa, ...restCasa];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[#06080b]">
        <nav className="bg-[#06080b] border-b border-[#1f2329]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[#9399a0]">
            <Link href="/" className="hover:text-[#ddf93c]">Acasa</Link>
            <span className="mx-1">/</span>
            <span className="text-[#c9ced5] font-medium">Casa & Gradina cu Reducere</span>
          </div>
        </nav>

        <section className="bg-gradient-to-br from-[#c3dd2c] via-[#ddf93c] to-[#c3dd2c] text-[#0c1000] py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">🏡</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Casa & Gradina cu Reducere {an}</h1>
            <p className="text-[#2a2f10] text-lg mb-6 max-w-xl mx-auto">
              Coduri de reducere verificate la Dedeman, IKEA, Leroy Merlin si alte magazine de amenajari din Romania
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Mobila","Bricolaj","Gradina","Electrocasnice","Decoratiuni","Baie"].map(c => (
                <span key={c} className="bg-[#1f2329] text-[#ffffff] text-sm font-semibold px-4 py-1.5 rounded-full border border-[#2a2f36]">{c}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-[#ffffff] mb-6 text-center">Ce gasesti la magazine casa & gradina</h2>
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
            
            <h2 className="text-xl font-black text-[#ffffff]">Magazine casa cu reduceri active</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {magazine.map((m) => (
              <MagazinCard key={m.magazin} m={m} />
            ))}
          </div>
        </section>
        <NewsletterCTA />


        <NisaProduse
          merchantSlugs={["dedeman.ro","ikea.com","leroy-merlin.ro","mobexpert.ro","jysk.ro","hornbach.ro"]}
          catSlug="casa"
          titlu="Produse populare — Casa & Gradina cu reducere"
          culoareAccent="indigo"
          limit={12}
        />

        <section className="bg-[#14181c] border-t border-[#1f2329] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[#ffffff] mb-5">Ghid: Amenajari casa mai ieftine in Romania</h2>
            <div className="space-y-4 text-sm text-[#c9ced5] leading-relaxed">
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">Dedeman vs IKEA vs Leroy Merlin</h3>
                <p>Dedeman este liderul la materiale de constructii si bricolaj — preturi competitive, retea nationala extinsa. IKEA exceleaza la mobilier functional, design scandinav si pret accesibil. Leroy Merlin are cea mai larga gama de produse gradina si amenajari.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">Cand sa cumperi mobila si electrocasnice</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Black Friday</strong> — reduceri 30-50% la electrocasnice mari si mobilier</li>
                  <li><strong>Ianuarie</strong> — solduri de iarna, stocuri vechi cu discount mare</li>
                  <li><strong>Primavara</strong> — promotii la articole gradina si mobilier exterior</li>
                  <li><strong>Septembrie</strong> — reluare sezon, promotii la renovari</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">Sfaturi economii amenajari</h3>
                <p>Cumparati pachete complete de mobilier pentru discount suplimentar. Urmariti sectiunile &quot;Outlet&quot; si &quot;Produse discontinue&quot; la IKEA si Mobexpert — economisesti 40-70%. Codurile de reducere AmCupon se aplica la comenzile online.</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-[#1f2329] py-6 text-center text-xs text-[#9399a0] mt-4">
          © {an} AmCupon.ro ·{" "}
          <Link href="/electronice" className="hover:text-[#ddf93c]">Electronice</Link>{" · "}
          <Link href="/moto" className="hover:text-[#ddf93c]">Auto-Moto</Link>{" · "}
          <Link href="/categorii" className="hover:text-[#ddf93c]">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
