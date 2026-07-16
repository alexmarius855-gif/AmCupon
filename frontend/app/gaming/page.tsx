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
  title: "Reduceri Gaming 2026 — Coduri eMAG, PCGarage, Altex | AmCupon.ro",
  description: "Coduri reducere gaming Romania 2026: laptopuri gaming, placi video, monitoare, periferice. eMAG, PCGarage, Altex, Evomag — oferte verificate zilnic.",
  keywords: ["reduceri gaming", "laptop gaming ieftin", "placa video reducere", "monitor gaming reducere", "pcgarage cod reducere", "emag gaming reducere", "periferice gaming ieftine"],
  alternates: { canonical: "https://amcupon.ro/gaming" },
  openGraph: { title: "Reduceri Gaming 2026 | AmCupon.ro", url: "https://amcupon.ro/gaming", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_GAMING = ["pcgarage.ro","emag.ro","altex.ro","evomag.ro","flanco.ro","cel.ro","quickmobile.ro"];
const CAT_GAMING = ["gaming","periferice","electronics","electronice"];
const CATEGORII_GAMING = [
  { emoji: "💻", titlu: "Laptopuri Gaming", desc: "ASUS ROG, Lenovo Legion, MSI, Acer Nitro — performanta maxima portabila" },
  { emoji: "🖥️", titlu: "Monitoare Gaming", desc: "144Hz, 240Hz, 4K — pentru gaming competitiv sau casual" },
  { emoji: "🎮", titlu: "Console & Jocuri", desc: "PS5, Xbox, Nintendo Switch, jocuri digitale la pret redus" },
  { emoji: "⌨️", titlu: "Periferice", desc: "Tastatura mecanica, mouse gaming, casti, controller wireless" },
  { emoji: "🖱️", titlu: "Placi Video", desc: "NVIDIA RTX, AMD Radeon — upgrade pentru FPS maxim" },
  { emoji: "🔊", titlu: "Audio Gaming", desc: "Casti surround 7.1, microfoane, soundbar gaming" },
];

const CULORI_BADGE = ["bg-[#0d9488]"];
const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Reduceri Gaming 2026","url":"https://amcupon.ro/gaming","description":"Coduri reducere gaming Romania — laptopuri, placi video, monitoare, periferice" };

export default function GamingPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topGaming = TOP_GAMING.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restGaming = all.filter(m =>
    !TOP_GAMING.includes(m.magazin) && m.are_promotie &&
    CAT_GAMING.some(c => (m.categorie_slug||"").includes(c) || m.categorie.toLowerCase().includes(c))
  ).slice(0, 8);
  const magazine = [...topGaming, ...restGaming];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[#0a0f1a]">

        {/* Breadcrumb */}
        <nav className="bg-[#111827]/80 backdrop-blur-sm border-b border-[#1e293b]">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-1.5 text-xs text-[#94a3b8]">
            <Link href="/" className="hover:text-[#0d9488] transition-colors">Acasa</Link>
            <span>/</span>
            <span className="text-[#cbd5e1] font-medium">Gaming</span>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#111827] via-[#111827] to-[#0a0f1a] py-16 px-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0d9488]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#0d9488]/20 rounded-full blur-3xl" />
            <div className="absolute inset-0" style={{backgroundImage:"radial-gradient(circle at 50% 50%, transparent 0%, rgba(15,23,42,0.6) 100%)"}} />
          </div>
          <div className="relative max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#14b8a6]/20 border border-[#14b8a6]/30 text-[#0f766e] text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488] animate-pulse"/>
              Oferte verificate zilnic
            </div>
            <div className="text-6xl mb-5 drop-shadow-2xl">🎮</div>
            <h1 className="text-4xl md:text-5xl font-black text-[#f1f5f9] mb-4 tracking-tight">
              Gaming cu Reducere <span className="text-transparent bg-clip-text" style={{backgroundImage:"linear-gradient(135deg, #0f766e, #0d9488)"}}>{an}</span>
            </h1>
            <p className="text-[#cbd5e1] text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Laptopuri gaming, placi video, monitoare si periferice — coduri reducere verificate la PCGarage, eMAG, Altex
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {["Laptop Gaming","Monitor 144Hz","Placa Video RTX","Mouse Gaming","Tastatura Mecanica","Casti Gaming","Controller PS5"].map(c => (
                <span key={c} className="bg-slate-100 border border-slate-200 text-slate-500 text-xs font-semibold px-3 py-1.5 rounded-full">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Categorii gaming */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-[#0d9488] uppercase tracking-widest mb-2">CATEGORII</p>
            <h2 className="text-2xl font-black text-[#f1f5f9]">Echipament gaming pe categorii</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORII_GAMING.map((a, i) => (
              <div key={a.titlu}
                className="group bg-[#111827] border border-[#1e293b] hover:border-[#14b8a6]/40 rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#14b8a6]/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${CULORI_BADGE[i % CULORI_BADGE.length]}`}>{a.emoji}</div>
                  <h3 className="font-bold text-[#f1f5f9] text-sm">{a.titlu}</h3>
                </div>
                <p className="text-xs text-[#cbd5e1] leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Magazine */}
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-bold text-[#0d9488] uppercase tracking-widest mb-1">MAGAZINE PARTENERE</p>
              <h2 className="text-xl font-black text-[#f1f5f9]">Magazine gaming cu reduceri active</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {magazine.map((m) => (
              <MagazinCard key={m.magazin} m={m} />
            ))}
          </div>
        </section>
        <NewsletterCTA />


        <NisaProduse
          merchantSlugs={["pcgarage.ro","emag.ro","altex.ro","evomag.ro","flanco.ro","cel.ro"]}
          catSlug="electronice"
          titlu="Produse gaming populare cu reducere"
          culoareAccent="indigo"
          limit={12}
        />

        {/* Ghid */}
        <section className="bg-[#111827] border-t border-[#1e293b] py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-bold text-[#0d9488] uppercase tracking-widest mb-3">GHID CUMPARATURI</p>
            <h2 className="text-2xl font-black text-[#f1f5f9] mb-7">Cum cumperi echipament gaming mai ieftin</h2>
            <div className="space-y-6 text-sm text-[#cbd5e1] leading-relaxed">
              <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5">
                <h3 className="font-bold text-[#f1f5f9] mb-2 text-base">PCGarage vs eMAG vs Altex — care e mai ieftin?</h3>
                <p>PCGarage are cel mai bun pret la componente PC (placi video, procesoare, RAM) — specializati in gaming. eMAG are gama mai larga si frecvent campanii cu reduceri masive. Altex are avantaj la laptopuri gaming prin promotii periodice. Verifica mereu toate trei inainte de orice achizitie.</p>
              </div>
              <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5">
                <h3 className="font-bold text-[#f1f5f9] mb-3 text-base">Cel mai bun moment sa cumperi echipament gaming</h3>
                <ul className="space-y-2">
                  {[
                    ["Black Friday (noiembrie)","reduceri 20-40% la laptopuri gaming si monitoare"],
                    ["Lansarea generatiei noi","cand apare RTX 5000, pretul la RTX 4000 scade instant"],
                    ["Vara (iulie-august)","reduceri la stocuri de iarna (casti, controllere)"],
                    ["Campionii de Gaming eMAG","campanie dedicata, reduceri bune la periferice"],
                  ].map(([bold, text]) => (
                    <li key={bold} className="flex gap-2">
                      <span className="text-[#0d9488] mt-0.5 shrink-0">→</span>
                      <span><strong className="text-[#f1f5f9]">{bold}</strong> — {text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5">
                <h3 className="font-bold text-[#f1f5f9] mb-2 text-base">Laptop gaming recomandat sub 4000 lei</h3>
                <p>Acer Nitro 5 si Lenovo IdeaPad Gaming ofera cel mai bun raport performanta-pret sub 4000 lei. Cauta modele cu RTX 3050 sau RTX 4050, 16GB RAM, SSD 512GB. Frecvent gasesti reduceri de 300-500 lei la eMAG sau PCGarage cu coduri AmCupon.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Related */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-4">EXPLOREAZA SI</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/electronice", label: "📱 Electronice" },
              { href: "/gadgets", label: "📡 Gadgets" },
              { href: "/laptop", label: "💻 Laptop" },
              { href: "/jocuri", label: "🕹️ Jocuri" },
              { href: "/oferte-azi", label: "🔥 Oferte de Azi" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-[#1e293b] hover:bg-[#334155] border border-[#334155] hover:border-[#14b8a6]/40 text-[#cbd5e1] hover:text-[#f1f5f9] text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-[#1e293b] py-6 text-center text-xs text-[#94a3b8] mt-4">
          &copy; {an} AmCupon.ro &middot;{" "}
          <Link href="/electronice" className="hover:text-[#0d9488] transition-colors">Electronice</Link>{" · "}
          <Link href="/gadgets" className="hover:text-[#0d9488] transition-colors">Gadgets</Link>{" · "}
          <Link href="/categorii" className="hover:text-[#0d9488] transition-colors">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
