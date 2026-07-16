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
const CULORI = ["bg-[#0d9488]","bg-[#0d9488]","bg-[#14b8a6]","bg-[#14b8a6]","bg-[#0d9488]","bg-[#0d9488]"];
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
      <div className="min-h-screen bg-[#0a0f1a]">
        <nav className="bg-[#0a0f1a] border-b border-[#1e293b]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[#94a3b8]">
            <Link href="/" className="hover:text-[#0d9488]">Acasă</Link>
            <span className="mx-1">/</span>
            <span className="text-[#cbd5e1] font-medium">Cărți Online cu Reducere</span>
          </div>
        </nav>

        <section className="bg-gradient-to-br from-[#0f766e] via-[#14b8a6] to-[#0f766e] text-[#f1f5f9] py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">📚</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Cărți Online cu Reducere {an}</h1>
            <p className="text-[#ccfbf1] text-lg mb-6 max-w-xl mx-auto">
              Coduri de reducere verificate la Libris, Elefant, Cărturești și alte librării online din România
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Ficțiune","Non-ficțiune","Cărți copii","Manuale","Audiobook","E-book"].map(c => (
                <span key={c} className="bg-slate-100 text-[#f1f5f9] text-sm font-semibold px-4 py-1.5 rounded-full border border-slate-200">{c}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-[#f1f5f9] mb-6 text-center">Ce găsești la librăriile online</h2>
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
            
            <h2 className="text-xl font-black text-[#f1f5f9]">Librării online cu reduceri active</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {magazine.map((m, i) => {
              const nume = numeAfisat(m.magazin);
              const culoare = CULORI[i % CULORI.length];
              const promo = m.promotii[0];
              return (
                <a key={m.magazin} href={`/cod-reducere/${m.magazin}`}
                  className="group bg-[#111827] border border-[#1e293b] hover:border-[#14b8a6]/40 rounded-xl p-4 transition-all hover:shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    {m.logo_url ? (
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#ffffff] border border-[#1e293b] shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={m.logo_url} alt={`Logo ${nume}`} className="w-full h-full object-contain" loading="lazy" />
                      </div>
                    ) : (
                      <div className={`w-10 h-10 rounded-xl ${culoare} flex items-center justify-center text-[#f1f5f9] font-black text-lg shrink-0`}>
                        {nume[0]}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-[#f1f5f9] text-sm">{nume}</p>
                      {m.are_promotie && m.cod_cupon && <span className="text-xs text-[#0d9488] font-bold">COD</span>}
                      {m.are_promotie && !m.cod_cupon && <span className="text-xs text-[#0d9488] font-medium">Ofertă</span>}
                    </div>
                  </div>
                  {promo ? (
                    <p className="text-[#cbd5e1] text-xs line-clamp-2">{promo.nume}</p>
                  ) : (
                    <p className="text-[#94a3b8] text-xs italic">Verifică ofertele curente</p>
                  )}
                  <div className="flex justify-end mt-2">
                    <span className="text-xs text-[#0d9488] font-semibold group-hover:text-[#0d9488]">Vezi →</span>
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

        <section className="bg-[#111827] border-t border-[#1e293b] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[#f1f5f9] mb-5">Ghid: Cărți ieftine online în România</h2>
            <div className="space-y-4 text-sm text-[#cbd5e1] leading-relaxed">
              <div>
                <h3 className="font-bold text-[#f1f5f9] mb-1">Libris vs Elefant vs Cărturești</h3>
                <p>Libris are cele mai frecvente campanii cu -30% și transport gratuit de la sume mici. Elefant excelează la gama de cărți în limba engleză. Cărturești atrage cu ediții speciale și cărți de artă.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#f1f5f9] mb-1">Cărți populare cu reduceri frecvente</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Atomic Habits</strong> — James Clear, bestseller non-ficțiune</li>
                  <li><strong>Sapiens</strong> — Yuval Noah Harari, reduceri regulate</li>
                  <li><strong>Moromeții</strong> — Marin Preda, clasic cu prețuri bune</li>
                  <li><strong>Seria Harry Potter</strong> — pachete complete cu discount</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-[#f1f5f9] mb-1">Economisește la cărți</h3>
                <p>Abonează-te la newsletterul Libris — primești coduri de -20% exclusiv abonaților. Cumpără seturi și pachete pentru discount suplimentar. Verifică zilnic secțiunea &quot;Carte Zilei&quot; pe Libris.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-base font-black text-[#cbd5e1] mb-4">Exploreaza si alte categorii</h2>
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
                className="bg-[#111827] hover:bg-[#1e293b] hover:text-[#0f766e] text-[#cbd5e1] text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-[#1e293b] hover:border-[#cbd5e1]">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-[#1e293b] py-6 text-center text-xs text-[#94a3b8] mt-4">
          © {an} AmCupon.ro ·{" "}
          <Link href="/idei-cadouri" className="hover:text-[#0d9488]">Idei Cadouri</Link>{" · "}
          <Link href="/copii" className="hover:text-[#0d9488]">Copii</Link>{" · "}
          <Link href="/categorii" className="hover:text-[#0d9488]">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
