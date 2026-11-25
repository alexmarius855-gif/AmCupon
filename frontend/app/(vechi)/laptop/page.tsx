import Link from "next/link";
import { Metadata } from "next";
import OferteNisa, { AntetNisa } from "../components/OferteNisa";
import fs from "fs";
import path from "path";
import NisaProduse from "../components/NisaProduse";
import { esteInCategorie, NISA_CATEGORII } from "@/lib/categoriiNisa";
import { laParteneri } from "@/lib/cifreSite";

interface Promotie { nume: string; cod_cupon: string; landing_page: string; zile_ramase: number; }
interface Magazin {
  magazin: string; url: string; url_afiliat: string; logo_url?: string;
  categorie: string; categorie_slug?: string; scor_final: number;
  are_promotie: boolean; cod_cupon: boolean; promotii: Promotie[]; trend: number;
}

export const metadata: Metadata = {
  title: "Laptop Ieftin România 2026 — Oferte de la Parteneri",
  description: "Oferte la laptopuri 2026: gaming, business, student, de la magazinele de electronice partenere AmCupon. Reduceri active, actualizate zilnic.",
  keywords: ["laptop ieftin românia", "laptop gaming reducere", "laptop student ieftin", "cel mai bun laptop 2026", "laptop sub 3000 lei", "emag laptop reducere", "altex laptop promoție"],
  alternates: { canonical: "https://amcupon.ro/laptop" },
  openGraph: { title: "Laptop Ieftin România 2026 | AmCupon.ro", url: "https://amcupon.ro/laptop", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_LAPTOP = ["evomag.ro"];
// Sluguri REALE din output.json — potrivire EXACTA, nu subsir (vezi lib/categoriiNisa.ts)
const CAT_LAPTOP = ["electronice"];

const BUGETE = [
  { pret: "Sub 2.000 lei", emoji: "💰", desc: "Chromebook, student basic, navigare web", culoare: "bg-emerald-600" },
  { pret: "2.000 – 3.500 lei", emoji: "💻", desc: "Office, multitasking, student productivitate", culoare: "bg-[#ddf93c]" },
  { pret: "3.500 – 5.000 lei", emoji: "⚡", desc: "Laptop gaming entry, creatori conținut", culoare: "bg-[#ddf93c]" },
  { pret: "Peste 5.000 lei", emoji: "🚀", desc: "Gaming high-end, workstation, MacBook", culoare: "bg-[#ddf93c]" },
];

const BRANDURI = [
  { brand: "ASUS", desc: "ROG (gaming), Zenbook (ultrabook), VivoBook (buget)" },
  { brand: "Lenovo", desc: "ThinkPad (business), Legion (gaming), IdeaPad (buget)" },
  { brand: "HP", desc: "Pavilion (buget), Spectre (premium), Omen (gaming)" },
  { brand: "Dell", desc: "XPS (ultrabook premium), Inspiron (buget), Alienware (gaming)" },
  { brand: "Acer", desc: "Nitro (gaming buget), Swift (ultrabook), Aspire (student)" },
  { brand: "Apple", desc: "MacBook Air (eficienta), MacBook Pro (profesional)" },
];

const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Laptop Ieftin România 2026","url":"https://amcupon.ro/laptop","description":"Oferte la laptopuri de la magazinele partenere — gaming, business, student" };

export default function LaptopPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topLaptop = TOP_LAPTOP.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restLaptop = all.filter(m =>
    !TOP_LAPTOP.includes(m.magazin) &&
    esteInCategorie(m, CAT_LAPTOP)
  ).sort((a,b)=>(b.are_promotie?1:0)-(a.are_promotie?1:0)||(b.scor_final||0)-(a.scor_final||0)).slice(0, 8);
  const magazine = [...topLaptop, ...restLaptop];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[var(--background)]">

        {/* Breadcrumb */}
        <nav className="bg-[var(--surface)]/80 backdrop-blur-sm border-b border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <Link href="/" className="hover:text-[var(--accent-text)] transition-colors">Acasă</Link>
            <span>/</span>
            <span className="text-[var(--text-soft)] font-medium">Laptop Ieftin</span>
          </div>
        </nav>

        {/* Hero */}
        <AntetNisa titlu={<>Laptop Ieftin România {an}</>}>Gaming, business, student — laptopuri {laParteneri(NISA_CATEGORII.laptop)}, actualizate zilnic</AntetNisa>
        <OferteNisa magazine={magazine} titlu="Magazine cu laptopuri și electronice" />
        <NisaProduse
          merchantSlugs={[]}
          teme={["laptopuri"]}
          titlu="Laptopuri de la magazinele partenere"
          culoareAccent="blue"
          limit={12}
        />

        {/* Bugete */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-[var(--accent-text)] uppercase tracking-widest mb-2">BUGET</p>
            <h2 className="text-2xl font-black text-[var(--foreground)]">Alege laptopul după buget</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BUGETE.map(b => (
              <div key={b.pret} className="bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent-text)]/40 rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#ddf93c]/10">
                <div className={`w-11 h-11 ${b.culoare} rounded-xl flex items-center justify-center text-2xl mb-4`}>{b.emoji}</div>
                <h3 className="font-black text-[var(--foreground)] text-base mb-1.5">{b.pret}</h3>
                <p className="text-xs text-[var(--text-soft)] leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Magazine */}
        

        

        {/* Ghid */}
        <section className="bg-[var(--surface)] border-t border-[var(--border)] py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-bold text-[var(--accent-text)] uppercase tracking-widest mb-3">GHID CUMPĂRĂTURI</p>
            <h2 className="text-2xl font-black text-[var(--foreground)] mb-7">Ce laptop sa cumperi în {an}</h2>
            <div className="space-y-5">
              <div className="bg-[var(--surface-alt)] border border-[var(--border-strong)] rounded-xl p-5">
                <h3 className="font-bold text-[var(--foreground)] mb-3 text-base">Branduri populare de laptopuri în {an}</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {BRANDURI.map(b => (
                    <div key={b.brand} className="bg-[var(--surface)] border border-[var(--border-strong)] rounded-xl p-3">
                      <p className="font-bold text-[var(--foreground)] text-xs mb-1">{b.brand}</p>
                      <p className="text-xs text-[var(--text-soft)]">{b.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[var(--surface-alt)] border border-[var(--border-strong)] rounded-xl p-5">
                <h3 className="font-bold text-[var(--foreground)] mb-3 text-base">Ce specificații contează cu adevărat</h3>
                <ul className="space-y-2 text-sm text-[var(--text-soft)]">
                  {[
                    ["Procesor","Intel Core i5/i7 sau Core Ultra 5/7, ori AMD Ryzen 5/7, din generațiile recente"],
                    ["RAM","minimum 16GB pentru confort real în 2026 (8GB e deja insuficient)"],
                    ["SSD","minimum 512GB NVMe — viteza de boot și aplicații radical mai buna"],
                    ["Display","IPS 1920x1080 minimum; dacă lucrezi cu imagini, cauta 2K/OLED"],
                    ["Baterie","capacitatea în Wh contează, dar autonomia reala o afli din testele independente"],
                  ].map(([bold, text]) => (
                    <li key={bold} className="flex gap-2">
                      <span className="text-[var(--accent-text)] mt-0.5 shrink-0">→</span>
                      <span><strong className="text-[var(--foreground)]">{bold}:</strong> {text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-[var(--surface-alt)] border border-[var(--border-strong)] rounded-xl p-5">
                <h3 className="font-bold text-[var(--foreground)] mb-2 text-base">Când sunt reduceri la laptopuri</h3>
                <p className="text-sm text-[var(--text-soft)] leading-relaxed">De Black Friday (noiembrie) și când apare o generație noua de procesoare, modelele vechi se ieftinesc de obicei. Când un partener are un cod activ, îl găsești pe pagina lui de pe AmCupon.ro.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Related */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">EXPLOREAZĂ SI</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/gaming", label: "🎮 Gaming" },
              { href: "/electronice", label: "📱 Electronice" },
              { href: "/gadgets", label: "📡 Gadgets" },
              { href: "/telefoane", label: "📲 Telefoane" },
              { href: "/oferte-azi", label: "🔥 Oferte de Azi" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-[var(--surface-alt)] hover:bg-[var(--surface-high)] border border-[var(--border-strong)] hover:border-[var(--accent-text)]/40 text-[var(--text-soft)] hover:text-[var(--foreground)] text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        
      </div>
    </>
  );
}
