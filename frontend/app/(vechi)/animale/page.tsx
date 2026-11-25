import Link from "next/link";
import { Metadata } from "next";
import OferteNisa, { AntetNisa } from "../components/OferteNisa";
import fs from "fs";
import path from "path";
import NisaProduse from "../components/NisaProduse";
import { esteInCategorie } from "@/lib/categoriiNisa";
import { laParteneri } from "@/lib/cifreSite";
import { NISA_CATEGORII } from "@/lib/categoriiNisa";

interface Promotie { nume: string; cod_cupon: string; landing_page: string; zile_ramase: number; }
interface Magazin {
  magazin: string; url: string; url_afiliat: string; logo_url?: string;
  categorie: string; categorie_slug?: string; scor_final: number;
  are_promotie: boolean; cod_cupon: boolean; promotii: Promotie[]; trend: number;
}

export const metadata: Metadata = {
  title: "Cod Reducere Pet Shop & Animale 2026 — Hrana Caini, Pisici",
  description: `Coduri de reducere și oferte la pet shop ${laParteneri(NISA_CATEGORII.animale)}: hrană pentru câini și pisici, accesorii. Actualizate zilnic.`,
  keywords: ["cod reducere petmart","reduceri pet shop","hrana caini ieftina","hrana pisici reducere","petmax cod cupon","accesorii animale reducere","zooplus românia"],
  alternates: { canonical: "https://amcupon.ro/animale" },
  openGraph: { title: "Pet Shop & Animale 2026 | AmCupon.ro", url: "https://amcupon.ro/animale", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_ANIMALE = ["petmart.ro","petmax.ro","bravapet.ro","ehranaanimale.ro","mobilepet.ro","husse.ro","novapet.ro","gopet.ro"];
// Sluguri REALE din output.json — potrivire EXACTA, nu subsir (vezi lib/categoriiNisa.ts)
const CAT_ANIMALE = ["animale"];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Pet Shop & Animale 2026",
  "url": "https://amcupon.ro/animale",
  "description": "Coduri reducere pet shop online România — hrana și accesorii pentru animale de companie"
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
        <AntetNisa titlu={<>Pet Shop {an}</>}>Hrana, jucării și accesorii pentru animalele de companie {laParteneri(NISA_CATEGORII.animale)}, actualizate zilnic.</AntetNisa>
        <OferteNisa magazine={magazine} titlu="Magazine pet shop cu reduceri active" />
        <NisaProduse
          merchantSlugs={["petmart.ro","petmax.ro","bravapet.ro","ehranaanimale.ro","mobilepet.ro","husse.ro"]}
          catSlug="animale"
          titlu="Hrana și accesorii populare pentru animale"
          culoareAccent="indigo"
          limit={12}
        />

        {/* Stats bar */}
        <div className="bg-[var(--surface)] border-[var(--border)] py-3 px-4">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-6 text-sm">
            <span className="text-[var(--accent-text)] font-semibold">
              <span className="font-black text-[var(--accent-text)]">{magazine.length}</span> magazine pet shop
            </span>
            <span className="text-[var(--accent-text)] font-semibold">
              <span className="font-black text-[var(--accent-text)]">{cuPromo.length}</span> cu promotii active
            </span>
            <span className="text-[var(--accent-text)] font-semibold">
              &#10003; Actualizat zilnic
            </span>
          </div>
        </div>

        {/* Avantaje */}
        

        {/* Magazine */}
        

        {/* Produse */}

        

        {/* Editorial */}
        <section className="bg-[var(--surface)] border-t border-[var(--border)] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[var(--foreground)] mb-5">Ghid: Cum economisești la cumpărăturile pentru animale</h2>
            <div className="space-y-4 text-sm text-[var(--text-soft)] leading-relaxed">
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Cum compari pet shop-urile</h3>
                <p>La hrana, compara prețul pe kilogram — difera de la un magazin la altul și de la o mărime de sac la alta. Petmart, Petmax și ceilalți parteneri AmCupon apar mai sus, cu ofertele active.</p>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Sfaturi pentru economii la hrana pentru animale</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Saci mari</strong> — prețul pe kilogram e de obicei mai mic la sacii mari</li>
                  <li><strong>Newsletter</strong> — pet shop-urile trimit des coduri de reducere abonaților</li>
                  <li><strong>Comanda în avans</strong> — nu în ultima clipa, ca sa poți astepta o promoție</li>
                  <li><strong>Hrana potrivita</strong> — întreabă medicul veterinar ce i se potrivește animalului tău</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Branduri premium la preturi mai mici</h3>
                <p>Royal Canin, Hill&apos;s Science Diet și Purina Pro Plan se găsesc la majoritatea pet shop-urilor mari. Preturile difera intre magazine — compara înainte sa cumperi.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Internal links */}
        

        
      </div>
    </>
  );
}
