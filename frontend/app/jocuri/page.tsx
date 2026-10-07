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
  title: "Jocuri Video & Console 2026 — PC, PS5, Xbox",
  description: "Jocuri video, console si accesorii de gaming de la magazinele de electronice partenere AmCupon, plus ghid: fizic sau digital. Actualizat zilnic.",
  keywords: ["cod reducere jocuri","reduceri jocuri video","ps5 ieftin","xbox reducere","jocuri pc reducere","console gaming romania","pcgarage cod cupon"],
  alternates: { canonical: "https://amcupon.ro/jocuri" },
  openGraph: { title: "Jocuri Video 2026 | AmCupon.ro", url: "https://amcupon.ro/jocuri", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_JOCURI = ["pcgarage.ro","evomag.ro","altex.ro","gamers.ro","gaming-gear.ro","nexus.ro","toysrus.ro"];
// Sluguri REALE din output.json — potrivire EXACTA, nu subsir (vezi lib/categoriiNisa.ts)
const CAT_JOCURI = ["electronice"];

const AVANTAJE = [
  { icon: "🎮", titlu: "Console Gaming", desc: "PS5, Xbox Series X/S, Nintendo Switch — console noi si bundle-uri speciale" },
  { icon: "🕹️", titlu: "Jocuri AAA", desc: "Titluri mari pe disc sau cod digital — EA Sports FC, GTA, Call of Duty" },
  { icon: "💻", titlu: "Gaming PC", desc: "Placi video, procesoare, RAM, monitoare gaming 144Hz+" },
  { icon: "🎧", titlu: "Accesorii Gaming", desc: "Casti, mouse, tastatura mecanica, controller, scaun gaming" },
  { icon: "📦", titlu: "Bundle-uri Speciale", desc: "Consola, joc si controller in acelasi pachet" },
  { icon: "🏆", titlu: "Jocuri Mobile", desc: "Carduri gift Google Play, App Store, coduri in-game" },
];


const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Jocuri Video 2026",
  "url": "https://amcupon.ro/jocuri",
  "description": "Jocuri video, console si accesorii de la magazinele partenere — PS5, Xbox, Nintendo, PC"
};

export default function JocuriPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topJocuri = TOP_JOCURI
    .map(s => all.find(m => m.magazin === s))
    .filter(Boolean) as Magazin[];

  const restJocuri = all.filter(m =>
    !TOP_JOCURI.includes(m.magazin) &&
    esteInCategorie(m, CAT_JOCURI)
  ).sort((a,b)=>(b.are_promotie?1:0)-(a.are_promotie?1:0)||(b.scor_final||0)-(a.scor_final||0)).slice(0, 10);

  const magazine = [...topJocuri, ...restJocuri];
  const cuPromo = magazine.filter(m => m.are_promotie);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[#06080b]">

        {/* Header */}

        {/* Breadcrumb */}
        <nav className="bg-[#06080b] border-b border-[#1f2329]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[#9399a0]">
            <Link href="/" className="hover:text-[#ddf93c]">Acasa</Link>
            <span className="mx-1">/</span>
            <span className="text-[#c9ced5] font-medium">Jocuri Video & Gaming</span>
          </div>
        </nav>

        {/* Hero */}
        <section className="bg-gradient-to-br from-[#c3dd2c] via-[#ddf93c] to-[#c3dd2c] text-[#0c1000] py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">🎮</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Jocuri Video {an}</h1>
            <p className="text-[#2a2f10] text-lg mb-6 max-w-xl mx-auto">
              Console, jocuri si accesorii de gaming {laParteneri(NISA_CATEGORII.jocuri)}, actualizate zilnic.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["PS5","Xbox Series","Nintendo Switch","PC Gaming","Jocuri AAA","Accesorii","VR"].map(c => (
                <span key={c} className="bg-[#1f2329] text-[#ffffff] text-sm font-semibold px-4 py-1.5 rounded-full border border-[#2a2f36]">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="bg-[#14181c] border-[#1f2329] py-3 px-4">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-6 text-sm">
            <span className="text-[#c3dd2c] font-semibold">
              <span className="font-black text-[#ddf93c]">{magazine.length}</span> magazine gaming
            </span>
            <span className="text-[#c3dd2c] font-semibold">
              <span className="font-black text-[#ddf93c]">{cuPromo.length}</span> cu promotii active
            </span>
            <span className="text-[#c3dd2c] font-semibold">&#10003; Actualizat zilnic</span>
          </div>
        </div>

        {/* Avantaje */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-[#ffffff] mb-6 text-center">Ce gasesti la magazinele de gaming online</h2>
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

        {/* Magazine */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <h2 className="text-xl font-black text-[#ffffff] mb-5">Magazine cu jocuri si electronice</h2>
          {magazine.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {magazine.map((m) => (
              <MagazinCard key={m.magazin} m={m} />
            ))}
            </div>
          ) : (
            <div className="bg-[#14181c] border border-[#1f2329] rounded-xl p-10 text-center">
              <p className="text-4xl mb-3">🎮</p>
              <p className="font-bold text-[#c9ced5] mb-2">Magazine actualizate zilnic</p>
              <p className="text-[#9399a0] text-sm mb-4">Revino curand pentru promotii la jocuri si gaming.</p>
              <Link href="/toate-magazinele" className="text-[#ddf93c] font-bold hover:text-[#c3dd2c] text-sm">Toate magazinele &rarr;</Link>
            </div>
          )}
        </section>

        {/* Produse */}
        <NewsletterCTA />

        <NisaProduse
          merchantSlugs={[]}
          potrivire={/^(consola (de jocuri|playstation|xbox|nintendo|portabila)|joc (video )?(pentru |pt\.? )?(ps5|ps4|playstation|xbox|nintendo switch|pc)\b|controller (wireless|ps5|ps4|xbox|pentru (ps|xbox|pc|switch))|gamepad|(mouse|tastatura|casti|headset|mousepad|scaun)\b[^,]*\bgaming\b)/}
          titlu="Jocuri si accesorii de gaming de la parteneri"
          culoareAccent="indigo"
          limit={12}
        />

        {/* Editorial */}
        <section className="bg-[#14181c] border-t border-[#1f2329] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[#ffffff] mb-5">Ghid: Unde cumperi jocuri mai ieftin in Romania</h2>
            <div className="space-y-4 text-sm text-[#c9ced5] leading-relaxed">
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">Cum compari preturile</h3>
                <p>Preturile la console si jocuri difera de la un magazin la altul si se schimba des. Compara aceeasi editie (standard, deluxe, pachet) in mai multe magazine; pe AmCupon gasesti ofertele partenerilor, actualizate zilnic.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">Jocuri fizice vs digitale — ce e mai ieftin</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Jocuri noi (launch)</strong> — pretul e identic fizic/digital; fizic poate fi revandut</li>
                  <li><strong>Dupa cateva luni</strong> — jocurile apar des la reducere in magazinele digitale (PlayStation Store, Xbox Store, Steam)</li>
                  <li><strong>Game Pass / PS Plus</strong> — daca joci mult, abonamentul poate iesi mai ieftin decat jocurile cumparate separat</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">Cand apar cele mai mari reduceri la gaming</h3>
                <p>Black Friday (noiembrie) aduce reduceri la console si jocuri. Pe PC: Steam Summer Sale (iunie-iulie) si Winter Sale (decembrie-ianuarie). PlayStation Store are oferte de weekend.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Internal links */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-base font-black text-[#c9ced5] mb-4">Exploreaza si alte categorii</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/electronice", label: "💻 Electronice & IT" },
              { href: "/gadgets",     label: "📱 Gadgets & Telefoane" },
              { href: "/copii",       label: "👶 Copii & Jucarii" },
              { href: "/carti",       label: "📚 Carti & Educatie" },
              { href: "/oferte-azi",  label: "🔥 Toate Ofertele de Azi" },
              { href: "/categorii",   label: "📂 Toate Categoriile" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-[#14181c] hover:bg-[#1f2329] hover:text-[#c3dd2c] text-[#c9ced5] text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-[#1f2329] hover:border-[#c9ced5]">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-[#1f2329] py-6 text-center text-xs text-[#9399a0] mt-4">
          &copy; {an} AmCupon.ro &middot;{" "}
          <Link href="/electronice" className="hover:text-[#ddf93c]">Electronice</Link>{" · "}
          <Link href="/gadgets" className="hover:text-[#ddf93c]">Gadgets</Link>{" · "}
          <Link href="/categorii" className="hover:text-[#ddf93c]">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
