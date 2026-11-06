import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import MagazinCard from "../components/MagazinCard";
import NewsletterCTA from "../components/NewsletterCTA";
import NisaProduse from "../components/NisaProduse";
import { esteInCategorie } from "../../lib/categoriiNisa";
import { laParteneri } from "@/lib/cifreSite";
import { NISA_CATEGORII } from "@/lib/categoriiNisa";

interface Promotie { nume: string; cod_cupon: string; landing_page: string; zile_ramase: number; }
interface Magazin {
  magazin: string; url: string; url_afiliat: string; logo_url?: string;
  categorie: string; categorie_slug?: string; scor_final: number;
  are_promotie: boolean; cod_cupon: boolean; promotii: Promotie[]; trend: number;
}

export const metadata: Metadata = {
  title: "Cod Reducere Pet Shop & Animale 2026 — Hrană Câini, Pisici",
  description: `Coduri de reducere și oferte la pet shop ${laParteneri(NISA_CATEGORII.animale)}: hrană pentru câini și pisici, accesorii. Actualizate zilnic.`,
  keywords: ["reduceri pet shop","hrană câini ieftină","hrană pisici reducere","petmax cod cupon","accesorii animale reducere","zooplus românia"],
  alternates: { canonical: "https://amcupon.ro/animale" },
  openGraph: { title: "Pet Shop & Animale 2026 | AmCupon.ro", url: "https://amcupon.ro/animale", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_ANIMALE = ["petmart.ro","petmax.ro","bravapet.ro","ehranaanimale.ro","mobilepet.ro","husse.ro","novapet.ro","gopet.ro"];
// Sluguri REALE din output.json — potrivire EXACTA, nu subsir (vezi lib/categoriiNisa.ts)
const CAT_ANIMALE = ["animale"];

const AVANTAJE = [
  { icon: "🐶", titlu: "Hrană Câini", desc: "Kibble, conserve, trate pentru câini de toate rasele și vârstele" },
  { icon: "🐱", titlu: "Hrană Pisici", desc: "Hrană uscată și umedă pentru pisici — Royal Canin, Whiskas, Hills" },
  { icon: "🐠", titlu: "Acvaristice", desc: "Hrană și accesorii pentru pești, acvarii și reptile" },
  { icon: "🦜", titlu: "Păsări & Rozătoare", desc: "Semințe, cuști, jucării pentru papagali, hamster, iepuri" },
  { icon: "🛁", titlu: "Îngrijire & Igienă", desc: "Șampon, periuțe, accesorii grooming pentru animale de companie" },
  { icon: "🏥", titlu: "Sănătate Animale", desc: "Antiparazitare, vitamine, suplimente pentru animale sănătoase" },
];


const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Pet Shop & Animale 2026",
  "url": "https://amcupon.ro/animale",
  "description": "Coduri reducere pet shop online România — hrană și accesorii pentru animale de companie"
};

export default function AnimalePage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topAnimale = TOP_ANIMALE
    .map(s => all.find(m => m.magazin === s))
    .filter(Boolean) as Magazin[];

  const restAnimale = all.filter(m =>
    !TOP_ANIMALE.includes(m.magazin) &&
    esteInCategorie(m, CAT_ANIMALE)
  ).sort((a,b)=>(b.are_promotie?1:0)-(a.are_promotie?1:0)||(b.scor_final||0)-(a.scor_final||0)).slice(0, 8);

  const magazine = [...topAnimale, ...restAnimale];
  const cuPromo = magazine.filter(m => m.are_promotie);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[var(--background)]">

        {/* Header */}

        {/* Breadcrumb */}
        <nav className="bg-[var(--background)] border-b border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Link href="/" className="hover:text-[var(--accent-text)]">Acasă</Link>
            <span className="mx-1">/</span>
            <span className="text-[var(--text-soft)] font-medium">Animale de Companie</span>
          </div>
        </nav>

        {/* Hero */}
        <section className="bg-gradient-to-br from-[#c3dd2c] via-[#ddf93c] to-[#c3dd2c] text-[#0c1000] py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">🐾</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Pet Shop {an}</h1>
            <p className="text-[#2a2f10] text-lg mb-6 max-w-xl mx-auto">
              Hrană, jucării și accesorii pentru animalele de companie {laParteneri(NISA_CATEGORII.animale)}, actualizate zilnic.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Câini","Pisici","Păsări","Rozătoare","Pești","Reptile","Accesorii"].map(c => (
                <span key={c} className="bg-[var(--surface-alt)] text-[var(--foreground)] text-sm font-semibold px-4 py-1.5 rounded-full border border-[var(--border-strong)]">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <div className="bg-[var(--surface)] border-[var(--border)] py-3 px-4">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-6 text-sm">
            <span className="text-[var(--accent-text)] font-semibold">
              <span className="font-black text-[var(--accent-text)]">{magazine.length}</span> magazine pet shop
            </span>
            <span className="text-[var(--accent-text)] font-semibold">
              <span className="font-black text-[var(--accent-text)]">{cuPromo.length}</span> cu promoții active
            </span>
            <span className="text-[var(--accent-text)] font-semibold">
              &#10003; Actualizat zilnic
            </span>
          </div>
        </div>

        {/* Avantaje */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-[var(--foreground)] mb-6 text-center">Ce găsești la pet shop-urile online din România</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVANTAJE.map(a => (
              <div key={a.titlu} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
                <div className="text-3xl mb-2">{a.icon}</div>
                <h3 className="font-bold text-[var(--foreground)] text-sm mb-1">{a.titlu}</h3>
                <p className="text-xs text-[var(--text-soft)]">{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Magazine */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-xl font-black text-[var(--foreground)]">Magazine pet shop cu reduceri active</h2>
          </div>

          {magazine.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {magazine.map((m) => (
              <MagazinCard key={m.magazin} m={m} />
            ))}
            </div>
          ) : (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-10 text-center">
              <p className="text-4xl mb-3">🐾</p>
              <p className="font-bold text-[var(--text-soft)] mb-2">Magazine actualizate zilnic</p>
              <p className="text-[var(--text-muted)] text-sm mb-4">Revino curând pentru promoții noi la pet shop-uri.</p>
              <Link href="/toate-magazinele" className="text-[var(--accent-text)] font-bold hover:text-[var(--accent-text)] text-sm">
                Toate magazinele &rarr;
              </Link>
            </div>
          )}
        </section>

        {/* Produse */}
        <NewsletterCTA />

        <NisaProduse
          merchantSlugs={["petmart.ro","petmax.ro","bravapet.ro","ehranaanimale.ro","mobilepet.ro","husse.ro"]}
          catSlug="animale"
          titlu="Hrană și accesorii populare pentru animale"
          culoareAccent="indigo"
          limit={12}
        />

        {/* Editorial */}
        <section className="bg-[var(--surface)] border-t border-[var(--border)] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[var(--foreground)] mb-5">Ghid: Cum economisești la cumpărăturile pentru animale</h2>
            <div className="space-y-4 text-sm text-[var(--text-soft)] leading-relaxed">
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Cum compari pet shop-urile</h3>
                <p>La hrană, compară prețul pe kilogram — diferă de la un magazin la altul și de la o mărime de sac la alta. Petmart, Petmax și ceilalți parteneri AmCupon apar mai sus, cu ofertele active.</p>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Sfaturi pentru economii la hrana pentru animale</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Saci mari</strong> — prețul pe kilogram e de obicei mai mic la sacii mari</li>
                  <li><strong>Newsletter</strong> — pet shop-urile trimit des coduri de reducere abonaților</li>
                  <li><strong>Comandă în avans</strong> — nu în ultima clipă, ca să poți aștepta o promoție</li>
                  <li><strong>Hrana potrivită</strong> — întreabă medicul veterinar ce i se potrivește animalului tău</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Branduri premium la prețuri mai mici</h3>
                <p>Royal Canin, Hill&apos;s Science Diet și Purina Pro Plan se găsesc la majoritatea pet shop-urilor mari. Prețurile diferă între magazine — compară înainte să cumperi.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Internal links */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-base font-black text-[var(--text-soft)] mb-4">Explorează și alte categorii</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/sanatate",   label: "🌿 Sănătate & Naturiste" },
              { href: "/farmacie",   label: "💊 Farmacie Online" },
              { href: "/copii",      label: "👶 Copii & Jucării" },
              { href: "/sport",      label: "🏃 Sport & Outdoor" },
              { href: "/oferte-azi", label: "🔥 Toate Ofertele de Azi" },
              { href: "/categorii",  label: "📂 Toate Categoriile" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-[var(--surface)] hover:bg-[var(--surface-alt)] hover:text-[var(--accent-text)] text-[var(--text-soft)] text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-[var(--border)] hover:border-[#c9ced5]">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-[var(--text-muted)] mt-4">
          &copy; {an} AmCupon.ro &middot;{" "}
          <Link href="/sanatate" className="hover:text-[var(--accent-text)]">Sănătate</Link>{" · "}
          <Link href="/farmacie" className="hover:text-[var(--accent-text)]">Farmacie</Link>{" · "}
          <Link href="/categorii" className="hover:text-[var(--accent-text)]">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
