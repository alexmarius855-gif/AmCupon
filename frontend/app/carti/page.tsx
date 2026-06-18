import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import NisaProduse from "../components/NisaProduse";

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
const CAT_BOOKS = ["books","carte","carti","librarie","educational","book"];
const AVANTAJE = [
  { icon: "📚", titlu: "Ficțiune & Romane", desc: "Bestselleruri românești și internaționale" },
  { icon: "🧠", titlu: "Non-ficțiune", desc: "Dezvoltare personală, business, psihologie" },
  { icon: "👶", titlu: "Cărți Copii", desc: "Povești, educative, enciclopedii pentru cei mici" },
  { icon: "🎓", titlu: "Manuale & Cursuri", desc: "Manuale școlare, ghiduri profesionale" },
  { icon: "🎧", titlu: "Audiobook-uri", desc: "Ascultă cărți în mașină, la sală, în parc" },
  { icon: "📱", titlu: "E-book-uri", desc: "Cărți digitale — instant, fără livrare" },
];

function numeAfisat(s: string) { return s.split(".")[0].replace(/-/g," ").split(" ").map(w=>w[0].toUpperCase()+w.slice(1)).join(" "); }
const CULORI = ["bg-indigo-600","bg-indigo-600","bg-indigo-500","bg-lime-500","bg-indigo-600","bg-indigo-600"];
const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Cărți Online cu Reducere 2026","url":"https://amcupon.ro/carti","description":"Coduri reducere carti online Romania — Libris, Elefant, Carturesti" };

export default function CartiPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topBooks = TOP_BOOKS.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restBooks = all.filter(m =>
    !TOP_BOOKS.includes(m.magazin) && m.are_promotie &&
    CAT_BOOKS.some(c => (m.categorie_slug||"").includes(c) || m.categorie.toLowerCase().includes(c))
  ).slice(0, 12);
  const magazine = [...topBooks, ...restBooks];
  const cuPromo = magazine.filter(m => m.are_promotie);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-slate-950">
        <nav className="bg-slate-950 border-b border-slate-800">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-slate-500">
            <Link href="/" className="hover:text-indigo-400">Acasă</Link>
            <span className="mx-1">/</span>
            <span className="text-slate-300 font-medium">Cărți Online cu Reducere</span>
          </div>
        </nav>

        <section className="bg-gradient-to-br from-indigo-700 via-blue-700 to-cyan-700 text-white py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">📚</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Cărți Online cu Reducere {an}</h1>
            <p className="text-indigo-100 text-lg mb-6 max-w-xl mx-auto">
              Coduri de reducere verificate la Libris, Elefant, Cărturești și alte librării online din România
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Ficțiune","Non-ficțiune","Cărți copii","Manuale","Audiobook","E-book"].map(c => (
                <span key={c} className="bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full border border-white/30">{c}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-white mb-6 text-center">Ce găsești la librăriile online</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVANTAJE.map(a => (
              <div key={a.titlu} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="text-3xl mb-2">{a.icon}</div>
                <h3 className="font-bold text-white text-sm mb-1">{a.titlu}</h3>
                <p className="text-xs text-slate-400">{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-10">
          <div className="flex items-center gap-3 mb-5">
            
            <h2 className="text-xl font-black text-white">Librării online cu reduceri active</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {magazine.map((m, i) => {
              const nume = numeAfisat(m.magazin);
              const culoare = CULORI[i % CULORI.length];
              const promo = m.promotii[0];
              return (
                <a key={m.magazin} href={`/cod-reducere/${m.magazin}`}
                  className="group bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-4 transition-all hover:shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    {m.logo_url ? (
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-slate-800 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={m.logo_url} alt={`Logo ${nume}`} className="w-full h-full object-contain" loading="lazy" />
                      </div>
                    ) : (
                      <div className={`w-10 h-10 rounded-xl ${culoare} flex items-center justify-center text-white font-black text-lg shrink-0`}>
                        {nume[0]}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-white text-sm">{nume}</p>
                      {m.are_promotie && m.cod_cupon && <span className="text-xs text-indigo-400 font-bold">COD</span>}
                      {m.are_promotie && !m.cod_cupon && <span className="text-xs text-cyan-400 font-medium">Ofertă</span>}
                    </div>
                  </div>
                  {promo ? (
                    <p className="text-slate-400 text-xs line-clamp-2">{promo.nume}</p>
                  ) : (
                    <p className="text-slate-500 text-xs italic">Verifică ofertele curente</p>
                  )}
                  <div className="flex justify-end mt-2">
                    <span className="text-xs text-cyan-400 font-semibold group-hover:text-cyan-400">Vezi →</span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        <NisaProduse
          merchantSlugs={["libris.ro","elefant.ro","carturesti.ro","librarie.net","bookhub.ro"]}
          catSlug="carti"
          titlu="Cărți populare cu reducere"
          culoareAccent="indigo"
          limit={12}
        />

        <section className="bg-slate-900 border-t border-slate-800 py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-white mb-5">Ghid: Cărți ieftine online în România</h2>
            <div className="space-y-4 text-sm text-slate-400 leading-relaxed">
              <div>
                <h3 className="font-bold text-white mb-1">Libris vs Elefant vs Cărturești</h3>
                <p>Libris are cele mai frecvente campanii cu -30% și transport gratuit de la sume mici. Elefant excelează la gama de cărți în limba engleză. Cărturești atrage cu ediții speciale și cărți de artă.</p>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Cărți populare cu reduceri frecvente</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Atomic Habits</strong> — James Clear, bestseller non-ficțiune</li>
                  <li><strong>Sapiens</strong> — Yuval Noah Harari, reduceri regulate</li>
                  <li><strong>Moromeții</strong> — Marin Preda, clasic cu prețuri bune</li>
                  <li><strong>Seria Harry Potter</strong> — pachete complete cu discount</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Economisește la cărți</h3>
                <p>Abonează-te la newsletterul Libris — primești coduri de -20% exclusiv abonaților. Cumpără seturi și pachete pentru discount suplimentar. Verifică zilnic secțiunea &quot;Carte Zilei&quot; pe Libris.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-base font-black text-slate-300 mb-4">Exploreaza si alte categorii</h2>
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
                className="bg-slate-900 hover:bg-slate-800 hover:text-indigo-300 text-slate-300 text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-slate-800 hover:border-cyan-200">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500 mt-4">
          © {an} AmCupon.ro ·{" "}
          <Link href="/idei-cadouri" className="hover:text-indigo-400">Idei Cadouri</Link>{" · "}
          <Link href="/copii" className="hover:text-indigo-400">Copii</Link>{" · "}
          <Link href="/categorii" className="hover:text-indigo-400">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
