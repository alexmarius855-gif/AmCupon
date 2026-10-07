import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import MagazinCard from "../components/MagazinCard";
import NewsletterCTA from "../components/NewsletterCTA";
import NisaProduse from "../components/NisaProduse";
import { esteInCategorie, NISA_CATEGORII } from "../../lib/categoriiNisa";
import { laParteneri } from "@/lib/cifreSite";

interface Promotie { nume: string; cod_cupon: string; landing_page: string; zile_ramase: number; }
interface Magazin {
  magazin: string; url: string; url_afiliat: string; logo_url?: string;
  categorie: string; categorie_slug?: string; scor_final: number;
  are_promotie: boolean; cod_cupon: boolean; promotii: Promotie[]; trend: number;
}

export const metadata: Metadata = {
  title: "Gaming 2026 — Laptopuri, Monitoare și Periferice",
  description: "Echipament de gaming în 2026 — laptopuri, plăci video, monitoare, periferice — de la magazinele de electronice partenere AmCupon, actualizat zilnic.",
  keywords: ["reduceri gaming", "laptop gaming ieftin", "placa video reducere", "monitor gaming reducere", "pcgarage cod reducere", "emag gaming reducere", "periferice gaming ieftine"],
  alternates: { canonical: "https://amcupon.ro/gaming" },
  openGraph: { title: "Gaming 2026 | AmCupon.ro", url: "https://amcupon.ro/gaming", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_GAMING = ["evomag.ro"];
// Sluguri REALE din output.json — potrivire EXACTA, nu subsir (vezi lib/categoriiNisa.ts)
const CAT_GAMING = ["electronice"];
const CATEGORII_GAMING = [
  { emoji: "💻", titlu: "Laptopuri Gaming", desc: "ASUS ROG, Lenovo Legion, MSI, Acer Nitro — performanta maxima portabila" },
  { emoji: "🖥️", titlu: "Monitoare Gaming", desc: "144Hz, 240Hz, 4K — pentru gaming competitiv sau casual" },
  { emoji: "🎮", titlu: "Console & Jocuri", desc: "PS5, Xbox, Nintendo Switch, jocuri digitale" },
  { emoji: "⌨️", titlu: "Periferice", desc: "Tastatura mecanica, mouse gaming, casti, controller wireless" },
  { emoji: "🖱️", titlu: "Placi Video", desc: "NVIDIA RTX, AMD Radeon — upgrade pentru FPS maxim" },
  { emoji: "🔊", titlu: "Audio Gaming", desc: "Casti surround 7.1, microfoane, soundbar gaming" },
];

const CULORI_BADGE = ["bg-[#ddf93c]"];
const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Gaming 2026","url":"https://amcupon.ro/gaming","description":"Echipament de gaming de la magazinele partenere — laptopuri, placi video, monitoare, periferice" };

export default function GamingPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topGaming = TOP_GAMING.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restGaming = all.filter(m =>
    !TOP_GAMING.includes(m.magazin) &&
    esteInCategorie(m, CAT_GAMING)
  ).sort((a,b)=>(b.are_promotie?1:0)-(a.are_promotie?1:0)||(b.scor_final||0)-(a.scor_final||0)).slice(0, 8);
  const magazine = [...topGaming, ...restGaming];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[#06080b]">

        {/* Breadcrumb */}
        <nav className="bg-[#14181c]/80 backdrop-blur-sm border-b border-[#1f2329]">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-1.5 text-xs text-[#9399a0]">
            <Link href="/" className="hover:text-[#ddf93c] transition-colors">Acasa</Link>
            <span>/</span>
            <span className="text-[#c9ced5] font-medium">Gaming</span>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#14181c] via-[#14181c] to-[#06080b] py-16 px-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ddf93c]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#ddf93c]/20 rounded-full blur-3xl" />
            <div className="absolute inset-0" style={{backgroundImage:"radial-gradient(circle at 50% 50%, transparent 0%, rgba(15,23,42,0.6) 100%)"}} />
          </div>
          <div className="relative max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#ddf93c]/20 border border-[#ddf93c]/30 text-[#c3dd2c] text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ddf93c] animate-pulse"/>
              Oferte actualizate zilnic
            </div>
            <div className="text-6xl mb-5 drop-shadow-2xl">🎮</div>
            <h1 className="text-4xl md:text-5xl font-black text-[#ffffff] mb-4 tracking-tight">
              Echipament Gaming <span className="text-transparent bg-clip-text" style={{backgroundImage:"linear-gradient(135deg, #c3dd2c, #ddf93c)"}}>{an}</span>
            </h1>
            <p className="text-[#c9ced5] text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Laptopuri gaming, placi video, monitoare si periferice — oferte {laParteneri(NISA_CATEGORII.gaming)}, actualizate zilnic
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {["Laptop Gaming","Monitor 144Hz","Placa Video RTX","Mouse Gaming","Tastatura Mecanica","Casti Gaming","Controller PS5"].map(c => (
                <span key={c} className="bg-[#1f2329] border border-[#2a2f36] text-[#c9ced5] text-xs font-semibold px-3 py-1.5 rounded-full">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Categorii gaming */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-[#ddf93c] uppercase tracking-widest mb-2">CATEGORII</p>
            <h2 className="text-2xl font-black text-[#ffffff]">Echipament gaming pe categorii</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORII_GAMING.map((a, i) => (
              <div key={a.titlu}
                className="group bg-[#14181c] border border-[#1f2329] hover:border-[#ddf93c]/40 rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#ddf93c]/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${CULORI_BADGE[i % CULORI_BADGE.length]}`}>{a.emoji}</div>
                  <h3 className="font-bold text-[#ffffff] text-sm">{a.titlu}</h3>
                </div>
                <p className="text-xs text-[#c9ced5] leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Magazine */}
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-bold text-[#ddf93c] uppercase tracking-widest mb-1">MAGAZINE PARTENERE</p>
              <h2 className="text-xl font-black text-[#ffffff]">Magazine gaming si electronice</h2>
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
          merchantSlugs={[]}
          potrivire={/^(mouse|tastatura|casti|headset|controller|gamepad|maneta|volan|mousepad|scaun)\b[^,]*\bgaming\b/}
          titlu="Produse gaming de la parteneri"
          culoareAccent="indigo"
          limit={12}
        />

        {/* Ghid */}
        <section className="bg-[#14181c] border-t border-[#1f2329] py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-bold text-[#ddf93c] uppercase tracking-widest mb-3">GHID CUMPARATURI</p>
            <h2 className="text-2xl font-black text-[#ffffff] mb-7">Cum cumperi echipament gaming mai ieftin</h2>
            <div className="space-y-6 text-sm text-[#c9ced5] leading-relaxed">
              <div className="bg-[#1f2329] border border-[#2a2f36] rounded-xl p-5">
                <h3 className="font-bold text-[#ffffff] mb-2 text-base">Cum compari preturile</h3>
                <p>Preturile la componente si la laptopuri de gaming difera de la un magazin la altul si se schimba des. Compara acelasi model (codul exact al produsului) in mai multe magazine inainte sa cumperi; pe AmCupon gasesti ofertele partenerilor, actualizate zilnic.</p>
              </div>
              <div className="bg-[#1f2329] border border-[#2a2f36] rounded-xl p-5">
                <h3 className="font-bold text-[#ffffff] mb-3 text-base">Cel mai bun moment sa cumperi echipament gaming</h3>
                <ul className="space-y-2">
                  {[
                    ["Black Friday (noiembrie)","reduceri la laptopuri de gaming si monitoare"],
                    ["Lansarea generatiei noi","cand apare o serie noua de placi video, modelele vechi se ieftinesc de obicei"],
                  ].map(([bold, text]) => (
                    <li key={bold} className="flex gap-2">
                      <span className="text-[#ddf93c] mt-0.5 shrink-0">→</span>
                      <span><strong className="text-[#ffffff]">{bold}</strong> — {text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-[#1f2329] border border-[#2a2f36] rounded-xl p-5">
                <h3 className="font-bold text-[#ffffff] mb-2 text-base">Ce sa cauti la un laptop de gaming de buget</h3>
                <p>Placa video dedicata (de exemplu RTX 4050 sau RTX 5050), cel putin 16 GB RAM si SSD de 512 GB. Seriile de buget sunt Acer Nitro, Lenovo LOQ, ASUS TUF si HP Victus — compara-le pe aceeasi configuratie.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Related */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-xs font-bold text-[#9399a0] uppercase tracking-widest mb-4">EXPLOREAZA SI</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/electronice", label: "📱 Electronice" },
              { href: "/gadgets", label: "📡 Gadgets" },
              { href: "/laptop", label: "💻 Laptop" },
              { href: "/jocuri", label: "🕹️ Jocuri" },
              { href: "/oferte-azi", label: "🔥 Oferte de Azi" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-[#1f2329] hover:bg-[#2a2f36] border border-[#2a2f36] hover:border-[#ddf93c]/40 text-[#c9ced5] hover:text-[#ffffff] text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-[#1f2329] py-6 text-center text-xs text-[#9399a0] mt-4">
          &copy; {an} AmCupon.ro &middot;{" "}
          <Link href="/electronice" className="hover:text-[#ddf93c] transition-colors">Electronice</Link>{" · "}
          <Link href="/gadgets" className="hover:text-[#ddf93c] transition-colors">Gadgets</Link>{" · "}
          <Link href="/categorii" className="hover:text-[#ddf93c] transition-colors">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
