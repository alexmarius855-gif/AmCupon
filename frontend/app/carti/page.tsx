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
  title: "Cod Reducere Cărți Online România 2026 — Libris, Elefant, Emag | AmCupon.ro",
  description: "Coduri de reducere cărți online România: Libris, Elefant, Carturesti, eMag Books. Cărți, audiobook-uri, e-book-uri la prețuri reduse. Verificate zilnic.",
  keywords: ["cod reducere carti", "reduceri libris", "carti ieftine online", "cod reducere elefant", "carturesti reducere", "carti online romania", "audiobook reducere"],
  alternates: { canonical: "https://amcupon.ro/carti" },
  openGraph: { title: "Cărți Online cu Reducere 2026 | AmCupon.ro", url: "https://amcupon.ro/carti", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_BOOKS = ["libris.ro","elefant.ro","carturesti.ro","librarie.net","bookhub.ro"];
// Sluguri REALE din output.json — potrivire EXACTA, nu subsir (vezi lib/categoriiNisa.ts)
const CAT_BOOKS = ["carti-educatie"];
const AVANTAJE = [
  { icon: "📚", titlu: "Ficțiune & Romane", desc: "Bestselleruri românești și internaționale" },
  { icon: "🧠", titlu: "Non-ficțiune", desc: "Dezvoltare personală, business, psihologie" },
  { icon: "👶", titlu: "Cărți Copii", desc: "Povești, educative, enciclopedii pentru cei mici" },
  { icon: "🎓", titlu: "Manuale & Cursuri", desc: "Manuale școlare, ghiduri profesionale" },
  { icon: "🎧", titlu: "Audiobook-uri", desc: "Ascultă cărți în mașină, la sală, în parc" },
  { icon: "📱", titlu: "E-book-uri", desc: "Cărți digitale — instant, fără livrare" },
];

const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Cărți Online cu Reducere 2026","url":"https://amcupon.ro/carti","description":"Coduri reducere carti online Romania — Libris, Elefant, Carturesti" };

export default function CartiPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topBooks = TOP_BOOKS.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restBooks = all.filter(m =>
    !TOP_BOOKS.includes(m.magazin) &&
    esteInCategorie(m, CAT_BOOKS)
  ).sort((a,b)=>(b.are_promotie?1:0)-(a.are_promotie?1:0)||(b.scor_final||0)-(a.scor_final||0)).slice(0, 12);
  const magazine = [...topBooks, ...restBooks];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[#06080b]">
        <nav className="bg-[#06080b] border-b border-[#1f2329]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[#9399a0]">
            <Link href="/" className="hover:text-[#ddf93c]">Acasă</Link>
            <span className="mx-1">/</span>
            <span className="text-[#c9ced5] font-medium">Cărți Online cu Reducere</span>
          </div>
        </nav>

        <section className="bg-gradient-to-br from-[#c3dd2c] via-[#ddf93c] to-[#c3dd2c] text-[#0c1000] py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">📚</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Cărți Online cu Reducere {an}</h1>
            <p className="text-[#2a2f10] text-lg mb-6 max-w-xl mx-auto">
              Coduri de reducere verificate la Libris, Elefant, Cărturești și alte librării online din România
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Ficțiune","Non-ficțiune","Cărți copii","Manuale","Audiobook","E-book"].map(c => (
                <span key={c} className="bg-[#1f2329] text-[#ffffff] text-sm font-semibold px-4 py-1.5 rounded-full border border-[#2a2f36]">{c}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-[#ffffff] mb-6 text-center">Ce găsești la librăriile online</h2>
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
            
            <h2 className="text-xl font-black text-[#ffffff]">Librării online cu reduceri active</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {magazine.map((m) => (
              <MagazinCard key={m.magazin} m={m} />
            ))}
          </div>
        </section>
        <NewsletterCTA />


        <NisaProduse
          merchantSlugs={["libris.ro","elefant.ro","carturesti.ro","librarie.net","bookhub.ro"]}
          catSlug="carti"
          titlu="Cărți populare cu reducere"
          culoareAccent="indigo"
          limit={12}
        />

        <section className="bg-[#14181c] border-t border-[#1f2329] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[#ffffff] mb-5">Ghid: Cărți ieftine online în România</h2>
            <div className="space-y-4 text-sm text-[#c9ced5] leading-relaxed">
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">Libris vs Elefant vs Cărturești</h3>
                <p>Libris are cele mai frecvente campanii cu -30% și transport gratuit de la sume mici. Elefant excelează la gama de cărți în limba engleză. Cărturești atrage cu ediții speciale și cărți de artă.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">Cărți populare cu reduceri frecvente</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Atomic Habits</strong> — James Clear, bestseller non-ficțiune</li>
                  <li><strong>Sapiens</strong> — Yuval Noah Harari, reduceri regulate</li>
                  <li><strong>Moromeții</strong> — Marin Preda, clasic cu prețuri bune</li>
                  <li><strong>Seria Harry Potter</strong> — pachete complete cu discount</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">Economisește la cărți</h3>
                <p>Abonează-te la newsletterul Libris — primești coduri de -20% exclusiv abonaților. Cumpără seturi și pachete pentru discount suplimentar. Verifică zilnic secțiunea &quot;Carte Zilei&quot; pe Libris.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-base font-black text-[#c9ced5] mb-4">Exploreaza si alte categorii</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/idei-cadouri", label: "🎁 Idei Cadouri" },
              { href: "/copii", label: "👶 Copii" },
              { href: "/sanatate", label: "🌿 Sanatate" },
              { href: "/categorii", label: "📂 Categorii" },
              { href: "/blog", label: "✍️ Blog" },
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
          <Link href="/copii" className="hover:text-[#ddf93c]">Copii</Link>{" · "}
          <Link href="/categorii" className="hover:text-[#ddf93c]">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
