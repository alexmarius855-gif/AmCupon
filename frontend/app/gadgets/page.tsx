import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import NisaProduse from "../components/NisaProduse";
import MagazinCard from "../components/MagazinCard";
import NewsletterCTA from "../components/NewsletterCTA";
import { esteInCategorie } from "../../lib/categoriiNisa";

interface Promotie { nume: string; cod_cupon: string; landing_page: string; zile_ramase: number; }
interface Magazin {
  magazin: string; url: string; url_afiliat: string; logo_url?: string;
  categorie: string; categorie_slug?: string; scor_final: number;
  are_promotie: boolean; cod_cupon: boolean; promotii: Promotie[]; trend: number;
}

export const metadata: Metadata = {
  title: "Gadgets & Accesorii Tech 2026 — Coduri Reducere | AmCupon.ro",
  description: "Gadgets, smartwatch-uri, căști wireless, smart home, drone și accesorii tech — coduri de reducere verificate pentru tot ce e nou și interesant în tech.",
  keywords: ["gadgets reducere", "smartwatch ieftin", "casti wireless reducere", "drone reducere", "smart home romania", "accesorii tech cod reducere"],
  alternates: { canonical: "https://amcupon.ro/gadgets" },
  openGraph: { title: "Gadgets & Tech — Coduri Reducere | AmCupon.ro", url: "https://amcupon.ro/gadgets", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const GADGET_SLUGS = ["emag.ro", "altex.ro", "flanco.ro", "elefant.ro", "quickmobile.ro", "cel.ro", "pcgarage.ro", "evomag.ro"];
// Sluguri REALE din output.json — potrivire EXACTA, nu subsir (vezi lib/categoriiNisa.ts)
const CAT_GADGET = ["electronice"];

const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Gadgets & Tech — Coduri Reducere 2026","url":"https://amcupon.ro/gadgets" };

const ARTICOLE_GADGET = [
  { title: "Cel mai bun smartwatch 2026", href: "/blog/cel-mai-bun-smartwatch-2026" },
  { title: "Căști wireless — top recomandări", href: "/blog/cele-mai-bune-casti-wireless-2026" },
  { title: "Smart home — ghid complet", href: "/blog/cel-mai-bun-sistem-smart-home-2026" },
  { title: "Cel mai bun power bank 2026", href: "/blog/cel-mai-bun-power-bank-2026" },
  { title: "Drone pentru începători", href: "/blog/cea-mai-buna-drona-2026" },
  { title: "Gadgeturi utile sub 100 lei", href: "/blog/cele-mai-bune-gadgeturi-ieftine-2026" },
];

export default function GadgetsPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topGadget = GADGET_SLUGS.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restTech = all.filter(m =>
    !GADGET_SLUGS.includes(m.magazin) &&
    esteInCategorie(m, CAT_GADGET)
  ).slice(0, 20);
  const magazine = [...topGadget, ...restTech];
  const cuPromo = magazine.filter(m => m.are_promotie);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[#06080b]">

        <nav className="bg-[#06080b] border-b border-[#1f2329]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[#9399a0] flex-wrap">
            <Link href="/" className="hover:text-[#ddf93c] transition-colors">Acasă</Link>
            <span className="mx-1 text-gray-300">/</span>
            <span className="text-[#c9ced5] font-medium">Gadgets & Tech</span>
          </div>
        </nav>

        {/* HERO */}
        <section className="bg-gradient-to-br from-[#c3dd2c] via-[#ddf93c] to-[#c3dd2c] text-[#0c1000] py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">📡</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Gadgets & Tech {an}</h1>
            <p className="text-[#2a2f10] text-lg mb-8 max-w-xl mx-auto">
              Smartwatch-uri, căști wireless, drone, smart home — coduri de reducere verificate pentru tot ce e nou în tech
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
              {[
                { val: `${magazine.length}+`, label: "Magazine" },
                { val: `${cuPromo.length}+`, label: "Oferte active" },
                { val: "Zilnic", label: "Actualizat" },
              ].map(s => (
                <div key={s.label} className="bg-[#1f2329] rounded-xl py-3 px-2">
                  <div className="text-xl font-black">{s.val}</div>
                  <div className="text-xs text-[#c3dd2c]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORII GADGET */}
        <section className="bg-[#14181c] border-b border-[#1f2329] py-6 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { emoji:"⌚", label:"Smartwatch-uri", href:"/blog/cel-mai-bun-smartwatch-2026" },
                { emoji:"🎧", label:"Căști wireless", href:"/blog/cele-mai-bune-casti-wireless-2026" },
                { emoji:"🏠", label:"Smart Home", href:"/blog/cel-mai-bun-sistem-smart-home-2026" },
                { emoji:"🔋", label:"Power Bank", href:"/blog/cel-mai-bun-power-bank-2026" },
                { emoji:"🚁", label:"Drone", href:"/blog/cea-mai-buna-drona-2026" },
                { emoji:"📷", label:"Camere acțiune", href:"/blog/cea-mai-buna-camera-video-sport-2026" },
                { emoji:"🎮", label:"Gaming", href:"/categorii/electronice" },
                { emoji:"📱", label:"Telefoane", href:"/blog/cel-mai-bun-telefon-pentru-poze-2026" },
              ].map(c => (
                <a key={c.label} href={c.href}
                  className="flex items-center gap-2 bg-[#14181c] hover:bg-[#ddf93c] text-[#ddf93c] font-semibold text-sm px-4 py-2 rounded-full transition-colors border border-[#ddf93c]">
                  <span>{c.emoji}</span>{c.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* MAGAZINE */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-xl font-black text-[#ffffff]">Magazine de gadgets si electronice</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {magazine.map((m) => (
                <MagazinCard key={m.magazin} m={m} />
              ))}
            </div>
          </section>

          <NewsletterCTA />

          {/* ARTICOLE */}
          <section className="bg-[#14181c] rounded-xl p-6">
            <h2 className="text-lg font-black text-[#ffffff] mb-4">📖 Ghiduri & Recenzii Gadgets</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ARTICOLE_GADGET.map(a => (
                <a key={a.href} href={a.href}
                  className="flex items-center gap-2 bg-[#14181c] rounded-xl px-4 py-3 text-sm font-semibold text-[#c9ced5] hover:text-[#ddf93c] hover:border-[#ddf93c]/40 border border-[#1f2329] transition-all group">
                  <span className="text-[#c3dd2c] group-hover:text-[#ddf93c]">→</span>
                  {a.title}
                </a>
              ))}
            </div>
          </section>
        </div>

        <NisaProduse
          merchantSlugs={["emag.ro","altex.ro","flanco.ro","quickmobile.ro","cel.ro","pcgarage.ro","evomag.ro"]}
          catSlug="electronice"
          titlu="Gadgets populare cu reducere"
          culoareAccent="blue"
          limit={12}
        />

        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-base font-black text-[#c9ced5] mb-4">Exploreaza si alte categorii</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/electronice", label: "💻 Electronice" },
              { href: "/sport", label: "🏃 Sport" },
              { href: "/moto", label: "🚗 Auto-Moto" },
              { href: "/fashion", label: "👗 Fashion" },
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
          © {an} AmCupon.ro · <Link href="/" className="hover:text-[#ddf93c]">Acasă</Link>
          {" · "}<Link href="/black-friday" className="hover:text-[#ddf93c]">Black Friday</Link>
          {" · "}<Link href="/moto" className="hover:text-[#ddf93c]">Auto-Moto</Link>
        </footer>
      </div>
    </>
  );
}
