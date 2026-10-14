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
  title: "Telefoane 2026 — Samsung, iPhone, Xiaomi de la parteneri",
  description: "Oferte la telefoane 2026: Samsung Galaxy, iPhone si altele, de la magazinele de electronice partenere AmCupon. Reduceri active, actualizate zilnic.",
  keywords: ["telefon ieftin romania", "smartphone reducere 2026", "samsung reducere", "iphone reducere romania", "xiaomi ieftin", "telefon sub 2000 lei", "emag telefoane reducere"],
  alternates: { canonical: "https://amcupon.ro/telefoane" },
  openGraph: { title: "Telefon Ieftin Romania 2026 | AmCupon.ro", url: "https://amcupon.ro/telefoane", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_TEL = ["evomag.ro"];
// Sluguri REALE din output.json — potrivire EXACTA, nu subsir (vezi lib/categoriiNisa.ts)
const CAT_TEL = ["electronice"];

const BUGETE_TEL = [
  { pret: "Sub 1.000 lei", emoji: "📱", desc: "Android de baza, retea 4G, camera decenta", culoare: "bg-emerald-600" },
  { pret: "1.000 – 2.000 lei", emoji: "📲", desc: "Mid-range solid: Xiaomi, Samsung A, OnePlus Nord", culoare: "bg-[#ddf93c]" },
  { pret: "2.000 – 4.000 lei", emoji: "✨", desc: "Flagship-uri accesibile: Samsung Galaxy S FE, Google Pixel, iPhone din generația trecută", culoare: "bg-[#ddf93c]" },
  { pret: "Peste 4.000 lei", emoji: "👑", desc: "Flagship: iPhone Pro, Samsung Galaxy S Ultra, OnePlus", culoare: "bg-[#ddf93c]" },
];

const BRANDURI_TEL = [
  { brand: "Samsung", desc: "Galaxy A (buget), Galaxy S (flagship), Fold/Flip (pliabile)" },
  { brand: "Apple iPhone", desc: "modelul de baza, Pro si Pro Max; generatia trecuta costa mai putin" },
  { brand: "Xiaomi", desc: "Redmi (buget), seria cu numar (flagship)" },
  { brand: "OnePlus", desc: "Nord (mid-range) si seria cu numar (flagship), cu incarcare rapida" },
  { brand: "Google Pixel", desc: "fotografie computationala; de la Pixel 8, 7 ani de actualizari Android" },
  { brand: "Motorola", desc: "Moto G (buget solid), Edge (mid-range), Razr (pliabil)" },
];

const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Telefon Ieftin Romania 2026","url":"https://amcupon.ro/telefoane","description":"Oferte la telefoane de la magazinele partenere — Samsung, iPhone, Xiaomi" };

export default function TelefoaneePage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topTel = TOP_TEL.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restTel = all.filter(m =>
    !TOP_TEL.includes(m.magazin) &&
    esteInCategorie(m, CAT_TEL)
  ).sort((a,b)=>(b.are_promotie?1:0)-(a.are_promotie?1:0)||(b.scor_final||0)-(a.scor_final||0)).slice(0, 6);
  const magazine = [...topTel, ...restTel];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[var(--background)]">

        {/* Breadcrumb */}
        <nav className="bg-[var(--surface)]/80 backdrop-blur-sm border-b border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <Link href="/" className="hover:text-[var(--accent-text)] transition-colors">Acasa</Link>
            <span>/</span>
            <span className="text-[var(--text-soft)] font-medium">Telefoane cu Reducere</span>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-[var(--surface)] py-16 px-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/3 w-80 h-80 bg-[#ddf93c]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-[#ddf93c]/15 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#ddf93c]/20 border border-[var(--accent-text)]/30 text-[var(--accent-text)] text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ddf93c] animate-pulse"/>
              Oferte actualizate zilnic
            </div>
            <div className="text-6xl mb-5 drop-shadow-2xl">📲</div>
            <h1 className="text-4xl md:text-5xl font-black text-[var(--foreground)] mb-4 tracking-tight">
              Telefoane <span className="text-transparent bg-clip-text" style={{backgroundImage:"linear-gradient(135deg, #2dd4bf, #ddf93c)"}}>{an}</span>
            </h1>
            <p className="text-[var(--text-soft)] text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Samsung, iPhone, Xiaomi, OnePlus — oferte {laParteneri(NISA_CATEGORII.telefoane)}, actualizate zilnic
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Samsung Galaxy","iPhone","Xiaomi","OnePlus","Sub 1000 lei","Sub 2000 lei","5G"].map(c => (
                <span key={c} className="bg-[var(--surface-alt)] border border-[var(--border-strong)] text-[var(--text-soft)] text-xs font-semibold px-3 py-1.5 rounded-full">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Bugete */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-[var(--accent-text)] uppercase tracking-widest mb-2">BUGET</p>
            <h2 className="text-2xl font-black text-[var(--foreground)]">Alege telefonul dupa buget</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BUGETE_TEL.map(b => (
              <div key={b.pret} className="bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent-text)]/40 rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#ddf93c]/10">
                <div className={`w-11 h-11 ${b.culoare} rounded-xl flex items-center justify-center text-2xl mb-4`}>{b.emoji}</div>
                <h3 className="font-black text-[var(--foreground)] text-base mb-1.5">{b.pret}</h3>
                <p className="text-xs text-[var(--text-soft)] leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Magazine */}
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-bold text-[var(--accent-text)] uppercase tracking-widest mb-1">MAGAZINE PARTENERE</p>
              <h2 className="text-xl font-black text-[var(--foreground)]">Magazine cu telefoane si electronice</h2>
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
          teme={["telefoane"]}
          titlu="Telefoane de la magazinele partenere"
          culoareAccent="teal"
          limit={12}
        />

        {/* Ghid */}
        <section className="bg-[var(--surface)] border-t border-[var(--border)] py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-bold text-[var(--accent-text)] uppercase tracking-widest mb-3">GHID CUMPARATURI</p>
            <h2 className="text-2xl font-black text-[var(--foreground)] mb-7">Ce telefon sa cumperi in {an}</h2>
            <div className="space-y-5">
              <div className="bg-[var(--surface-alt)] border border-[var(--border-strong)] rounded-xl p-5">
                <h3 className="font-bold text-[var(--foreground)] mb-3 text-base">Branduri populare in {an}</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {BRANDURI_TEL.map(b => (
                    <div key={b.brand} className="bg-[var(--surface)] border border-[var(--border-strong)] rounded-xl p-3">
                      <p className="font-bold text-[var(--foreground)] text-xs mb-1">{b.brand}</p>
                      <p className="text-xs text-[var(--text-soft)]">{b.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[var(--surface-alt)] border border-[var(--border-strong)] rounded-xl p-5">
                <h3 className="font-bold text-[var(--foreground)] mb-2 text-base">Android sau iPhone — care e mai bun?</h3>
                <p className="text-sm text-[var(--text-soft)] leading-relaxed">Daca ai deja Mac sau iPad, iPhone se integreaza cel mai bine cu ele. Android are mai multe modele la fiecare buget (Samsung, Xiaomi, Motorola, OnePlus). Compara acelasi buget pe camera, baterie si cati ani de actualizari primeste telefonul.</p>
              </div>
              <div className="bg-[var(--surface-alt)] border border-[var(--border-strong)] rounded-xl p-5">
                <h3 className="font-bold text-[var(--foreground)] mb-3 text-base">Cand sa cumperi un telefon mai ieftin</h3>
                <ul className="space-y-2 text-sm text-[var(--text-soft)]">
                  {[
                    ["Dupa lansarea modelului nou","modelul din generatia trecuta se ieftineste de obicei"],
                    ["Black Friday","reduceri la modelele mid-range si la flagship-urile din generatia anterioara"],
                  ].map(([bold, text]) => (
                    <li key={bold} className="flex gap-2">
                      <span className="text-[var(--accent-text)] mt-0.5 shrink-0">→</span>
                      <span><strong className="text-[var(--foreground)]">{bold}</strong> — {text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Related */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">EXPLOREAZA SI</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/laptop", label: "💻 Laptop" },
              { href: "/electronice", label: "📱 Electronice" },
              { href: "/gadgets", label: "📡 Gadgets" },
              { href: "/gaming", label: "🎮 Gaming" },
              { href: "/oferte-azi", label: "🔥 Oferte de Azi" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-[var(--surface-alt)] hover:bg-[var(--surface-high)] border border-[var(--border-strong)] hover:border-[var(--accent-text)]/40 text-[var(--text-soft)] hover:text-[var(--foreground)] text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-[var(--text-muted)]">
          &copy; {an} AmCupon.ro &middot;{" "}
          <Link href="/electronice" className="hover:text-[var(--accent-text)] transition-colors">Electronice</Link>{" · "}
          <Link href="/laptop" className="hover:text-[var(--accent-text)] transition-colors">Laptop</Link>{" · "}
          <Link href="/categorii" className="hover:text-[var(--accent-text)] transition-colors">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
