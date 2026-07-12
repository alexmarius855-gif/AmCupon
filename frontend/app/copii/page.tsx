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
  title: "Reduceri Jucării & Haine Copii 2026 — Coduri Noriel, eMAG | AmCupon.ro",
  description: "Coduri reducere magazine copii 2026: Noriel, eMAG, FashionDays Copii, H&M Kids. Jucării, haine, cărucioare, scaune auto — la prețuri reduse.",
  keywords: ["reduceri jucarii", "cod reducere noriel", "haine copii reducere", "jucarii ieftine online", "emag copii reducere", "carucior reducere", "scaun auto copil reducere"],
  alternates: { canonical: "https://amcupon.ro/copii" },
  openGraph: { title: "Reduceri Copii & Jucării 2026 | AmCupon.ro", url: "https://amcupon.ro/copii", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_COPII = ["noriel.ro","emag.ro","smythstoys.com","bebetei.ro","bebe-tei.ro","mothercare.ro","chicco.ro"];
const CAT_COPII = ["kids","babies","toys","copii","jucarii","bebelusi","children","baby"];
const GRUPE_VARSTA = [
  { emoji: "👶", label: "0-2 ani", desc: "Cărucioare, scaune auto, jucării senzoriale" },
  { emoji: "🧒", label: "3-6 ani", desc: "LEGO Duplo, jocuri de rol, seturi creative" },
  { emoji: "👦", label: "7-12 ani", desc: "LEGO Technic, cărți, jocuri video, biciclete" },
  { emoji: "👧", label: "Fete 3-12 ani", desc: "Păpuși, seturi bijuterii, cărți ilustrate" },
];

function numeAfisat(s: string) { return s.split(".")[0].replace(/-/g," ").split(" ").map(w=>w[0].toUpperCase()+w.slice(1)).join(" "); }
const CULORI = ["bg-[#0d9488]","bg-[#0d9488]","bg-[#14b8a6]","bg-[#0d9488]","bg-[#0d9488]","bg-[#14b8a6]"];
const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Reduceri Copii & Jucării 2026","url":"https://amcupon.ro/copii" };

export default function CopiiPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topCopii = TOP_COPII.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restCopii = all.filter(m =>
    !TOP_COPII.includes(m.magazin) && m.are_promotie &&
    CAT_COPII.some(c => (m.categorie_slug||"").includes(c) || m.categorie.toLowerCase().includes(c))
  ).slice(0, 16);
  const magazine = [...topCopii, ...restCopii];
  const cuPromo = magazine.filter(m => m.are_promotie);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[#F7F9FC]">
        <nav className="bg-[#F7F9FC] border-b border-[#e2e8f0]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[#64748b]">
            <Link href="/" className="hover:text-[#0d9488]">Acasă</Link>
            <span className="mx-1">/</span>
            <span className="text-[#334155] font-medium">Copii & Jucării</span>
          </div>
        </nav>

        {/* HERO */}
        <section className="bg-gradient-to-br from-[#0f766e] via-[#14b8a6] to-[#0f766e] text-[#0f172a] py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">🧸</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Jucării & Copii cu Reducere {an}</h1>
            <p className="text-[#ccfbf1] text-lg mb-6 max-w-xl mx-auto">
              LEGO, păpuși, haine copii, cărucioare, scaune auto — coduri de reducere verificate
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["LEGO","Păpuși","Haine Kids","Cărucioare","Scaune auto","Cărți copii","Parcuri de joacă","Baby monitor"].map(c => (
                <span key={c} className="bg-slate-100 text-[#0f172a] text-sm font-semibold px-4 py-1.5 rounded-full border border-slate-200">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* GRUPE VARSTA */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-[#0f172a] mb-6 text-center">Cadouri și cumpărături pe vârstă</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {GRUPE_VARSTA.map(g => (
              <Link key={g.label} href="/categorii/copii"
                className="bg-[#ffffff] border border-yellow-200 rounded-xl p-5 hover:shadow-md transition-all group">
                <div className="text-3xl mb-2">{g.emoji}</div>
                <h3 className="font-bold text-[#0f172a] text-sm mb-1">{g.label}</h3>
                <p className="text-xs text-[#475569]">{g.desc}</p>
                <p className="text-xs font-bold text-[#0d9488] mt-3 group-hover:text-[#0f766e]">Vezi reduceri →</p>
              </Link>
            ))}
          </div>
        </section>

        {/* MAGAZINE */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <div className="flex items-center gap-3 mb-5">
            
            <h2 className="text-xl font-black text-[#0f172a]">Magazine copii cu reduceri active</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {magazine.map((m, i) => {
              const nume = numeAfisat(m.magazin);
              const culoare = CULORI[i % CULORI.length];
              const promo = m.promotii[0];
              return (
                <a key={m.magazin} href={`/cod-reducere/${m.magazin}`}
                  className="group bg-[#ffffff] border border-[#e2e8f0] hover:border-[#14b8a6]/40 rounded-xl p-4 transition-all hover:shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    {m.logo_url ? (
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-[#e2e8f0] shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={m.logo_url} alt={`Logo ${nume}`} className="w-full h-full object-contain" loading="lazy" />
                      </div>
                    ) : (
                      <div className={`w-10 h-10 rounded-xl ${culoare} flex items-center justify-center text-[#0f172a] font-black text-lg shrink-0`}>
                        {nume[0]}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-[#0f172a] text-sm">{nume}</p>
                      {m.are_promotie && m.cod_cupon && <span className="text-xs text-[#0d9488] font-bold">COD</span>}
                      {m.are_promotie && !m.cod_cupon && <span className="text-xs text-[#0d9488] font-medium">Ofertă</span>}
                    </div>
                  </div>
                  {promo ? (
                    <p className="text-[#475569] text-xs line-clamp-2">{promo.nume}</p>
                  ) : (
                    <p className="text-[#64748b] text-xs italic">Verifică ofertele curente</p>
                  )}
                  <div className="flex justify-end mt-2">
                    <span className="text-xs text-[#0d9488] font-semibold group-hover:text-[#0f766e]">Vezi →</span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        <NisaProduse
          merchantSlugs={["noriel.ro","emag.ro","smythstoys.com","bebetei.ro","bebe-tei.ro","chicco.ro"]}
          catSlug="copii"
          titlu="Jucarii si produse copii cu reducere"
          culoareAccent="indigo"
          limit={12}
        />

        {/* SEO */}
        <section className="bg-[#ffffff] border-t border-[#e2e8f0] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[#0f172a] mb-5">Ghid cumpărături copii inteligente</h2>
            <div className="space-y-4 text-sm text-[#475569] leading-relaxed">
              <div>
                <h3 className="font-bold text-[#0f172a] mb-1">Cum economisești la jucării și haine copii</h3>
                <p>Noriel oferă cele mai bune prețuri la jucăriile populare (LEGO, Barbie, Hot Wheels) și are frecvent reduceri și pachete speciale. eMAG are gamă mai largă dar prețuri variabile — compară mereu.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#0f172a] mb-1">Cele mai bune momente pentru cumpărături copii</h3>
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
          <h2 className="text-base font-black text-[#334155] mb-4">Exploreaza si alte categorii</h2>
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
                className="bg-[#ffffff] hover:bg-[#e2e8f0] hover:text-[#0f766e] text-[#334155] text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-[#e2e8f0] hover:border-[#e6d5a8]">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-[#e2e8f0] py-6 text-center text-xs text-[#64748b] mt-4">
          © {an} AmCupon.ro ·{" "}
          <Link href="/idei-cadouri" className="hover:text-[#0d9488]">Idei Cadouri</Link>{" · "}
          <Link href="/categorii/copii" className="hover:text-[#0d9488]">Categorie Copii</Link>{" · "}
          <Link href="/categorii" className="hover:text-[#0d9488]">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
