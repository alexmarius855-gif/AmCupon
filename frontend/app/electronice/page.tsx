import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import MagazinCard from "../components/MagazinCard";
import NewsletterCTA from "../components/NewsletterCTA";
import NisaProduse from "../components/NisaProduse";
import { esteInCategorie } from "../../lib/categoriiNisa";
import { enumerare, laParteneri, parteneriCategorie } from "@/lib/cifreSite";
import { NISA_CATEGORII } from "@/lib/categoriiNisa";

interface Promotie { nume: string; cod_cupon: string; landing_page: string; zile_ramase: number; }
interface Magazin {
  magazin: string; url: string; url_afiliat: string; logo_url?: string;
  categorie: string; categorie_slug?: string; scor_final: number;
  are_promotie: boolean; cod_cupon: boolean; promotii: Promotie[]; trend: number;
}

export const metadata: Metadata = {
  title: "Electronice România 2026 — Oferte de la Parteneri",
  description: `Oferte la electronice ${laParteneri(NISA_CATEGORII.electronice)}: telefoane, laptopuri, gadgeturi. Actualizate zilnic.`,
  keywords: ["cod reducere emag", "reduceri altex", "electronice ieftine", "cod reducere pcgarage", "laptop reducere", "telefon reducere romania", "electronice online"],
  alternates: { canonical: "https://amcupon.ro/electronice" },
  openGraph: { title: "Electronice 2026 | AmCupon.ro", url: "https://amcupon.ro/electronice", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_TECH = ["evomag.ro","philips.ro","tenergy.com"];
// Sluguri REALE din output.json — potrivire EXACTA, nu subsir (vezi lib/categoriiNisa.ts)
const CAT_TECH = ["electronice"];
const AVANTAJE = [
  { icon: "📱", titlu: "Telefoane & Tablete", desc: "iPhone, Samsung, Xiaomi — cele mai bune oferte" },
  { icon: "💻", titlu: "Laptopuri & PC", desc: "Gaming, office, ultrabook-uri la prețuri reduse" },
  { icon: "📺", titlu: "TV & Audio", desc: "Smart TV 4K, soundbar, căști wireless" },
  { icon: "🎮", titlu: "Gaming", desc: "Console, jocuri, accesorii PlayStation & Xbox" },
  { icon: "📷", titlu: "Foto & Video", desc: "Camere foto, drone, accesorii" },
  { icon: "⌚", titlu: "Smartwatch & Wearables", desc: "Apple Watch, Samsung Galaxy Watch, brățări fitness" },
];

const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Electronice 2026","url":"https://amcupon.ro/electronice","description":"Oferte la electronice de la magazinele partenere AmCupon" };

export default function ElectronicePage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topTech = TOP_TECH.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restTech = all.filter(m =>
    !TOP_TECH.includes(m.magazin) &&
    esteInCategorie(m, CAT_TECH)
  ).sort((a,b)=>(b.are_promotie?1:0)-(a.are_promotie?1:0)||(b.scor_final||0)-(a.scor_final||0)).slice(0, 16);
  const magazine = [...topTech, ...restTech];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[#06080b]">
        <nav className="bg-[#06080b] border-b border-[#1f2329]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[#9399a0]">
            <Link href="/" className="hover:text-[#ddf93c]">Acasă</Link>
            <span className="mx-1">/</span>
            <span className="text-[#c9ced5] font-medium">Electronice</span>
          </div>
        </nav>

        <section className="bg-gradient-to-br from-[#c3dd2c] via-[#ddf93c] to-[#c3dd2c] text-[#0c1000] py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">📱</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Electronice {an}</h1>
            <p className="text-[#2a2f10] text-lg mb-6 max-w-xl mx-auto">
              Oferte {laParteneri(NISA_CATEGORII.electronice, 3)} și la alte magazine partenere de electronice
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Telefoane","Laptopuri","TV 4K","Gaming","Căști","Smartwatch"].map(c => (
                <span key={c} className="bg-[#1f2329] text-[#ffffff] text-sm font-semibold px-4 py-1.5 rounded-full border border-[#2a2f36]">{c}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-[#ffffff] mb-6 text-center">Ce găsești la electronice online</h2>
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
            
            <h2 className="text-xl font-black text-[#ffffff]">Magazine de electronice partenere</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {magazine.map((m) => (
              <MagazinCard key={m.magazin} m={m} />
            ))}
          </div>
        </section>
        <NewsletterCTA />


        <NisaProduse
          merchantSlugs={[]}
          teme={["laptopuri", "telefoane", "tablete", "monitoare", "casti-wireless", "smartwatch-uri"]}
          titlu="Electronice de la magazinele partenere"
          culoareAccent="blue"
          limit={12}
        />

        <section className="bg-[#14181c] border-t border-[#1f2329] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[#ffffff] mb-5">Ghid: Electronice ieftine online în România</h2>
            <div className="space-y-4 text-sm text-[#c9ced5] leading-relaxed">
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">Cele mai bune momente să cumperi</h3>
                <p>Black Friday (noiembrie), campaniile de 11.11 și aniversările magazinelor. Telefoanele și laptopurile din generația anterioară se ieftinesc de obicei când apar modelele noi.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">Partenerii AmCupon la electronice</h3>
                <p>{parteneriCategorie(NISA_CATEGORII.electronice, 6).length ? `${enumerare(parteneriCategorie(NISA_CATEGORII.electronice, 6))} și alte magazine partenere — ofertele lor active apar mai sus, pe cardurile magazinelor.` : "Ofertele magazinelor partenere apar mai sus, pe cardurile magazinelor."}</p>
              </div>
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">Sfaturi economii</h3>
                <p>Compară prețul aceluiași model (codul exact al produsului) în mai multe magazine înainte să cumperi. Dacă un partener are un cod activ, condițiile lui — inclusiv dacă se cumulează cu alte reduceri — sunt pe pagina magazinului.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-base font-black text-[#c9ced5] mb-4">Exploreaza si alte categorii</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/gadgets", label: "📡 Gadgets" },
              { href: "/moto", label: "🚗 Auto-Moto" },
              { href: "/sport", label: "🏃 Sport" },
              { href: "/idei-cadouri", label: "🎁 Idei Cadouri" },
              { href: "/categorii", label: "📂 Categorii" },
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
          <Link href="/gadgets" className="hover:text-[#ddf93c]">Gadgets</Link>{" · "}
          <Link href="/farmacie" className="hover:text-[#ddf93c]">Farmacie</Link>{" · "}
          <Link href="/categorii" className="hover:text-[#ddf93c]">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
