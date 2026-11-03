import Link from "next/link";
import { Metadata } from "next";
import OferteNisa, { AntetNisa } from "../components/OferteNisa";
import fs from "fs";
import path from "path";
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
  title: "Reduceri Vacanțe & Călătorii 2026 — Bilete, Hotel, Troller",
  description: `Coduri de reducere vacanțe și travel 2026 ${laParteneri(NISA_CATEGORII.calatorie)}. Reduceri active pentru vacanță ieftină.`,
  keywords: ["reduceri vacante", "cod reducere booking", "vacanta ieftina românia 2026", "bilete avion reducere", "hotel reducere", "troller reducere", "travel reducere românia"],
  alternates: { canonical: "https://amcupon.ro/calatorie" },
  openGraph: { title: "Reduceri Vacanțe & Călătorii 2026 | AmCupon.ro", url: "https://amcupon.ro/calatorie", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_TRAVEL = ["booking.com","airbnb.com","trip.com","rentalcars.com","samsonite.com","delsey.com"];
const PARTENERI_INTL = [
  { nume: "KKday", emoji: "🎟️", desc: "Excursii, tururi ghidate și activități locale în Asia și nu numai — rezervare instanta.", url: "https://kkday.sjv.io/n4P9qx" },
  { nume: "Pelago by Singapore Airlines", emoji: "✈️", desc: "Experiente și excursii curate de Singapore Airlines — de la city tours la activități exclusive.", url: "https://pelago.pxf.io/3kyVBv" },
  { nume: "Air Serbia", emoji: "🛫", desc: "Compania aeriana nationala a Serbiei — zboruri către Belgrad și conexiuni internaționale.", url: "https://www.awin1.com/cread.php?awinmid=5289333&awinaffid=101829567&clickref=" },
  { nume: "CarmelLimo", emoji: "🚘", desc: "Transfer privat cu șofer în New York și alte orașe mari din SUA — alternativa la taxi pentru călătorii de business.", url: "https://www.awin1.com/cread.php?awinmid=2387410&awinaffid=101829567&clickref=" },
];
// Sluguri REALE din output.json — potrivire EXACTA, nu subsir (vezi lib/categoriiNisa.ts)
const CAT_TRAVEL = ["calatorii"];
const DESTINATII = [
  { emoji: "🏔️", label: "Munte România", desc: "Bucegi, Retezat, Apuseni" },
  { emoji: "🌊", label: "Litoral România", desc: "Mamaia, Vama Veche, Neptun" },
  { emoji: "🌿", label: "Delta Dunării", desc: "Natură sălbatică unică" },
  { emoji: "🏙️", label: "City Break", desc: "Sibiu, Cluj, Brașov, București" },
  { emoji: "✈️", label: "Europa", desc: "Roma, Paris, Viena, Praga" },
  { emoji: "🏖️", label: "Mediterana", desc: "Grecia, Turcia, Spania" },
];

const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Reduceri Vacanțe & Călătorii 2026","url":"https://amcupon.ro/calatorie" };

export default function CalatoriePage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topTravel = TOP_TRAVEL.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restTravel = all.filter(m =>
    !TOP_TRAVEL.includes(m.magazin) &&
    esteInCategorie(m, CAT_TRAVEL)
  ).sort((a,b)=>(b.are_promotie?1:0)-(a.are_promotie?1:0)||(b.scor_final||0)-(a.scor_final||0)).slice(0, 12);
  const magazine = [...topTravel, ...restTravel];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[var(--background)]">
        <nav className="bg-[var(--background)] border-b border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Link href="/" className="hover:text-[var(--accent-text)]">Acasă</Link>
            <span className="mx-1">/</span>
            <span className="text-[var(--text-soft)] font-medium">Vacanțe & Călătorii</span>
          </div>
        </nav>

        {/* HERO */}
        <AntetNisa titlu={<>Vacanțe & Călătorii {an}</>}>Cazare, experiențe, eSIM, trolere și accesorii de călătorie {laParteneri(NISA_CATEGORII.calatorie)}</AntetNisa>
        <OferteNisa magazine={magazine} titlu="Parteneri travel cu reduceri active" />
        <NisaProduse
          merchantSlugs={["booking.com","airbnb.com","trip.com","samsonite.com","delsey.com"]}
          catSlug="calatorie"
          titlu="Accesorii travel și bagaje de la parteneri"
          culoareAccent="sky"
          limit={12}
        />

        {/* DESTINATII */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-[var(--foreground)] mb-6 text-center">Destinații populare {an}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DESTINATII.map(d => (
              <Link key={d.label} href="/blog/vacanta-ieftina-romania-2026"
                className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:shadow-md transition-all group">
                <div className="text-3xl mb-2">{d.emoji}</div>
                <h3 className="font-bold text-[var(--foreground)] text-sm mb-1">{d.label}</h3>
                <p className="text-xs text-[var(--text-soft)] mb-3">{d.desc}</p>
                <p className="text-xs font-bold text-[var(--accent-text)] group-hover:text-[var(--accent-text)]">Ghid & reduceri →</p>
              </Link>
            ))}
          </div>
        </section>

        {/* MAGAZINE */}
        

        

        {/* Parteneri internationali (Impact.com) */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <h2 className="text-xl font-black text-[var(--foreground)] mb-5">Excursii & activități internaționale</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {PARTENERI_INTL.map(p => (
              <a key={p.nume} href={p.url} target="_blank" rel="sponsored noopener noreferrer"
                className="bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent-text)]/40 rounded-xl p-5 transition-all hover:shadow-md flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{p.emoji}</span>
                  <span className="font-black text-[var(--foreground)]">{p.nume}</span>
                </div>
                <p className="text-[var(--text-soft)] text-xs">{p.desc}</p>
                <p className="text-xs font-bold text-[var(--accent-text)] mt-1">Vezi oferte →</p>
              </a>
            ))}
          </div>
        </section>

        {/* SEO */}
        <section className="bg-[var(--surface)] border-t border-[var(--border)] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[var(--foreground)] mb-5">Sfaturi pentru vacanță mai ieftină</h2>
            <div className="space-y-4 text-sm text-[var(--text-soft)] leading-relaxed">
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Cum găsești o cazare mai ieftină</h3>
                <p>Rezervă din timp, mai ales în sezonul de vârf, și alege tarife cu anulare gratuită când planurile nu sunt sigure. Compară prețul de pe platformele de rezervări cu cel de pe site-ul hotelului.</p>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Top destinații România pentru vacanță ieftină {an}</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Apuseni</strong> — natură superb ă, prețuri mici, turism rural autentic</li>
                  <li><strong>Sibiu</strong> — city break cultural, medieval, Transfăgărășanul la 30 minute</li>
                  <li><strong>Vama Veche</strong> — alternativă boémă la Mamaia, prețuri mai mici</li>
                  <li><strong>Delta Dunării</strong> — experiență unică, accesibilă din Tulcea</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        

        
      </div>
    </>
  );
}
