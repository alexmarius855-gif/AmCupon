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
  title: "Jocuri Video & Console 2026 — PC, PS5, Xbox",
  description: "Jocuri video, console și accesorii de gaming de la magazinele de electronice partenere AmCupon, plus ghid: fizic sau digital. Actualizat zilnic.",
  keywords: ["cod reducere jocuri","reduceri jocuri video","ps5 ieftin","xbox reducere","jocuri pc reducere","console gaming românia","pcgarage cod cupon"],
  alternates: { canonical: "https://amcupon.ro/jocuri" },
  openGraph: { title: "Jocuri Video 2026 | AmCupon.ro", url: "https://amcupon.ro/jocuri", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_JOCURI = ["pcgarage.ro","evomag.ro","altex.ro","gamers.ro","gaming-gear.ro","nexus.ro","toysrus.ro"];
// Sluguri REALE din output.json — potrivire EXACTA, nu subsir (vezi lib/categoriiNisa.ts)
const CAT_JOCURI = ["electronice"];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Jocuri Video 2026",
  "url": "https://amcupon.ro/jocuri",
  "description": "Jocuri video, console și accesorii de la magazinele partenere — PS5, Xbox, Nintendo, PC"
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
      <div className="min-h-screen bg-[var(--background)]">

        {/* Header */}

        {/* Breadcrumb */}
        <nav className="bg-[var(--background)] border-b border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Link href="/" className="hover:text-[var(--accent-text)]">Acasă</Link>
            <span className="mx-1">/</span>
            <span className="text-[var(--text-soft)] font-medium">Jocuri Video & Gaming</span>
          </div>
        </nav>

        {/* Hero */}
        <AntetNisa titlu={<>Jocuri Video {an}</>}>Console, jocuri și accesorii de gaming {laParteneri(NISA_CATEGORII.jocuri)}, actualizate zilnic.</AntetNisa>
        <OferteNisa magazine={magazine} titlu="Magazine cu jocuri și electronice" />
        <NisaProduse
          merchantSlugs={[]}
          potrivire={/^(consola (de jocuri|playstation|xbox|nintendo|portabila)|joc (video )?(pentru |pt\.? )?(ps5|ps4|playstation|xbox|nintendo switch|pc)\b|controller (wireless|ps5|ps4|xbox|pentru (ps|xbox|pc|switch))|gamepad|(mouse|tastatura|casti|headset|mousepad|scaun)\b[^,]*\bgaming\b)/}
          titlu="Jocuri și accesorii de gaming de la parteneri"
          culoareAccent="indigo"
          limit={12}
        />

        {/* Stats */}
        <div className="bg-[var(--surface)] border-[var(--border)] py-3 px-4">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-6 text-sm">
            <span className="text-[var(--accent-text)] font-semibold">
              <span className="font-black text-[var(--accent-text)]">{magazine.length}</span> magazine gaming
            </span>
            <span className="text-[var(--accent-text)] font-semibold">
              <span className="font-black text-[var(--accent-text)]">{cuPromo.length}</span> cu promotii active
            </span>
            <span className="text-[var(--accent-text)] font-semibold">&#10003; Actualizat zilnic</span>
          </div>
        </div>

        {/* Avantaje */}
        

        {/* Magazine */}
        

        {/* Produse */}

        

        {/* Editorial */}
        <section className="bg-[var(--surface)] border-t border-[var(--border)] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[var(--foreground)] mb-5">Ghid: Unde cumperi jocuri mai ieftin în România</h2>
            <div className="space-y-4 text-sm text-[var(--text-soft)] leading-relaxed">
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Cum compari preturile</h3>
                <p>Preturile la console si jocuri difera de la un magazin la altul si se schimba des. Compara aceeasi editie (standard, deluxe, pachet) in mai multe magazine; pe AmCupon gasesti ofertele partenerilor, actualizate zilnic.</p>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Jocuri fizice vs digitale — ce e mai ieftin</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Jocuri noi (launch)</strong> — pretul e identic fizic/digital; fizic poate fi revandut</li>
                  <li><strong>După câteva luni</strong> — jocurile apar des la reducere în magazinele digitale (PlayStation Store, Xbox Store, Steam)</li>
                  <li><strong>Game Pass / PS Plus</strong> — dacă joci mult, abonamentul poate ieși mai ieftin decât jocurile cumpărate separat</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Când apar cele mai mari reduceri la gaming</h3>
                <p>Black Friday (noiembrie) aduce reduceri la console și jocuri. Pe PC: Steam Summer Sale (iunie-iulie) și Winter Sale (decembrie-ianuarie). PlayStation Store are oferte de weekend.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Internal links */}
        

        
      </div>
    </>
  );
}
