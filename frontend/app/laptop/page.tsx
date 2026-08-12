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
  title: "Laptop Ieftin Romania 2026 — Coduri Reducere eMAG, Altex, PCGarage | AmCupon.ro",
  description: "Cele mai bune oferte laptopuri 2026: gaming, business, student. Reduceri verificate la eMAG, Altex, PCGarage, Flanco. Laptop sub 2000 lei, 3000 lei, 5000 lei.",
  keywords: ["laptop ieftin romania", "laptop gaming reducere", "laptop student ieftin", "cel mai bun laptop 2026", "laptop sub 3000 lei", "emag laptop reducere", "altex laptop promotie"],
  alternates: { canonical: "https://amcupon.ro/laptop" },
  openGraph: { title: "Laptop Ieftin Romania 2026 | AmCupon.ro", url: "https://amcupon.ro/laptop", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_LAPTOP = ["emag.ro","altex.ro","pcgarage.ro","flanco.ro","evomag.ro","cel.ro","quickmobile.ro"];
const CAT_LAPTOP = ["electronics","electronice","laptop","it"];

const BUGETE = [
  { pret: "Sub 2.000 lei", emoji: "💰", desc: "Chromebook, student basic, navigare web", culoare: "bg-emerald-600" },
  { pret: "2.000 – 3.500 lei", emoji: "💻", desc: "Office, multitasking, student productivitate", culoare: "bg-[#ddf93c]" },
  { pret: "3.500 – 5.000 lei", emoji: "⚡", desc: "Laptop gaming entry, creatori continut", culoare: "bg-[#ddf93c]" },
  { pret: "Peste 5.000 lei", emoji: "🚀", desc: "Gaming high-end, workstation, MacBook", culoare: "bg-[#ddf93c]" },
];

const BRANDURI = [
  { brand: "ASUS", desc: "ROG (gaming), Zenbook (ultrabook), VivoBook (buget)" },
  { brand: "Lenovo", desc: "ThinkPad (business), Legion (gaming), IdeaPad (buget)" },
  { brand: "HP", desc: "Pavilion (buget), Spectre (premium), Omen (gaming)" },
  { brand: "Dell", desc: "XPS (ultrabook premium), Inspiron (buget), Alienware (gaming)" },
  { brand: "Acer", desc: "Nitro (gaming buget), Swift (ultrabook), Aspire (student)" },
  { brand: "Apple", desc: "MacBook Air M3 (eficienta), MacBook Pro (profesional)" },
];

const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Laptop Ieftin Romania 2026","url":"https://amcupon.ro/laptop","description":"Oferte laptopuri Romania 2026 — gaming, business, student la preturi reduse" };

export default function LaptopPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topLaptop = TOP_LAPTOP.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restLaptop = all.filter(m =>
    !TOP_LAPTOP.includes(m.magazin) &&
    CAT_LAPTOP.some(c => (m.categorie_slug||"").includes(c) || m.categorie.toLowerCase().includes(c))
  ).sort((a,b)=>(b.are_promotie?1:0)-(a.are_promotie?1:0)||(b.scor_final||0)-(a.scor_final||0)).slice(0, 8);
  const magazine = [...topLaptop, ...restLaptop];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[#06080b]">

        {/* Breadcrumb */}
        <nav className="bg-[#14181c]/80 backdrop-blur-sm border-b border-[#1f2329]">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-1.5 text-xs text-[#9399a0]">
            <Link href="/" className="hover:text-[#ddf93c] transition-colors">Acasa</Link>
            <span>/</span>
            <span className="text-[#c9ced5] font-medium">Laptop Ieftin</span>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#14181c] via-[#14181c] to-[#14181c] py-16 px-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#ddf93c]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-[#ddf93c]/20 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#ddf93c]/20 border border-[#ddf93c]/30 text-[#c3dd2c] text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ddf93c] animate-pulse"/>
              Oferte verificate zilnic
            </div>
            <div className="text-6xl mb-5 drop-shadow-2xl">💻</div>
            <h1 className="text-4xl md:text-5xl font-black text-[#ffffff] mb-4 tracking-tight">
              Laptop Ieftin Romania <span className="text-transparent bg-clip-text" style={{backgroundImage:"linear-gradient(135deg, #ddf93c, #c3dd2c)"}}>{an}</span>
            </h1>
            <p className="text-[#c9ced5] text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Gaming, business, student — cele mai bune oferte laptopuri cu reduceri verificate zilnic
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Gaming","Student","Business","MacBook","Sub 3000 lei","Sub 5000 lei","Ultrabook"].map(c => (
                <span key={c} className="bg-[#1f2329] border border-[#2a2f36] text-slate-500 text-xs font-semibold px-3 py-1.5 rounded-full">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Bugete */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-[#c3dd2c] uppercase tracking-widest mb-2">BUGET</p>
            <h2 className="text-2xl font-black text-[#ffffff]">Alege laptopul dupa buget</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BUGETE.map(b => (
              <div key={b.pret} className="bg-[#14181c] border border-[#1f2329] hover:border-[#ddf93c]/40 rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#ddf93c]/10">
                <div className={`w-11 h-11 ${b.culoare} rounded-xl flex items-center justify-center text-2xl mb-4`}>{b.emoji}</div>
                <h3 className="font-black text-[#ffffff] text-base mb-1.5">{b.pret}</h3>
                <p className="text-xs text-[#c9ced5] leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Magazine */}
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-bold text-[#ddf93c] uppercase tracking-widest mb-1">MAGAZINE PARTENERE</p>
              <h2 className="text-xl font-black text-[#ffffff]">Magazine laptopuri cu reduceri active</h2>
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
          merchantSlugs={["emag.ro","altex.ro","pcgarage.ro","flanco.ro","evomag.ro","cel.ro"]}
          catSlug="electronice"
          titlu="Laptopuri populare cu reducere"
          culoareAccent="blue"
          limit={12}
        />

        {/* Ghid */}
        <section className="bg-[#14181c] border-t border-[#1f2329] py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-bold text-[#c3dd2c] uppercase tracking-widest mb-3">GHID CUMPARATURI</p>
            <h2 className="text-2xl font-black text-[#ffffff] mb-7">Ce laptop sa cumperi in {an}</h2>
            <div className="space-y-5">
              <div className="bg-[#1f2329] border border-[#2a2f36] rounded-xl p-5">
                <h3 className="font-bold text-[#ffffff] mb-3 text-base">Cele mai bune branduri laptop in {an}</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {BRANDURI.map(b => (
                    <div key={b.brand} className="bg-[#14181c] border border-[#2a2f36] rounded-xl p-3">
                      <p className="font-bold text-[#ffffff] text-xs mb-1">{b.brand}</p>
                      <p className="text-xs text-[#c9ced5]">{b.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#1f2329] border border-[#2a2f36] rounded-xl p-5">
                <h3 className="font-bold text-[#ffffff] mb-3 text-base">Ce specificatii conteaza cu adevarat</h3>
                <ul className="space-y-2 text-sm text-[#c9ced5]">
                  {[
                    ["Procesor","Intel Core i5/i7 13th gen sau AMD Ryzen 5/7 7000 — ambele excelente"],
                    ["RAM","minimum 16GB pentru confort real in 2026 (8GB e deja insuficient)"],
                    ["SSD","minimum 512GB NVMe — viteza de boot si aplicatii radical mai buna"],
                    ["Display","IPS 1920x1080 minimum; daca lucrezi cu imagini, cauta 2K/OLED"],
                    ["Baterie","50+ Wh pentru o zi completa de lucru fara incarcator"],
                  ].map(([bold, text]) => (
                    <li key={bold} className="flex gap-2">
                      <span className="text-[#c3dd2c] mt-0.5 shrink-0">→</span>
                      <span><strong className="text-[#ffffff]">{bold}:</strong> {text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-[#1f2329] border border-[#2a2f36] rounded-xl p-5">
                <h3 className="font-bold text-[#ffffff] mb-2 text-base">Cand sunt cele mai mari reduceri la laptopuri</h3>
                <p className="text-sm text-[#c9ced5] leading-relaxed">Black Friday (noiembrie) si Zilele eMAG (mai, octombrie) aduc reduceri de 20-35% la laptopuri. Verifica codurile AmCupon pentru discount suplimentar de 5-10% aplicabil pe langa promotia activa.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Related */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-xs font-bold text-[#9399a0] uppercase tracking-widest mb-4">EXPLOREAZA SI</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/gaming", label: "🎮 Gaming" },
              { href: "/electronice", label: "📱 Electronice" },
              { href: "/gadgets", label: "📡 Gadgets" },
              { href: "/telefoane", label: "📲 Telefoane" },
              { href: "/oferte-azi", label: "🔥 Oferte de Azi" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-[#1f2329] hover:bg-[#2a2f36] border border-[#2a2f36] hover:border-[#ddf93c]/40 text-[#c9ced5] hover:text-[#ffffff] text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-[#1f2329] py-6 text-center text-xs text-[#9399a0]">
          &copy; {an} AmCupon.ro &middot;{" "}
          <Link href="/electronice" className="hover:text-[#ddf93c] transition-colors">Electronice</Link>{" · "}
          <Link href="/gaming" className="hover:text-[#ddf93c] transition-colors">Gaming</Link>{" · "}
          <Link href="/categorii" className="hover:text-[#ddf93c] transition-colors">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
