import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";

interface Promotie {
  nume: string;
  cod_cupon: string;
  landing_page: string;
  zile_ramase: number;
}

interface Magazin {
  magazin: string;
  url: string;
  url_afiliat: string;
  logo_url?: string;
  categorie: string;
  categorie_slug?: string;
  scor_final: number;
  are_promotie: boolean;
  cod_cupon: boolean;
  promotii: Promotie[];
  trend: number;
}

export const metadata: Metadata = {
  title: "Cadouri & Reduceri de Crăciun 2026 — Coduri Verificate | AmCupon.ro",
  description:
    "Coduri de reducere și oferte de Crăciun 2026 verificate la cele mai mari magazine din România. Jucării, electronice, fashion, parfumuri — toate la prețuri reduse pe AmCupon.ro.",
  keywords: [
    "reduceri craciun 2026",
    "oferte craciun romania",
    "coduri reducere cadouri craciun",
    "promotii craciun",
    "cadouri craciun online",
    "reduceri sarbatori",
    "voucher craciun",
    "amcupon craciun",
  ],
  alternates: { canonical: "https://amcupon.ro/craciun" },
  openGraph: {
    title: "Cadouri & Reduceri de Crăciun 2026 | AmCupon.ro",
    description: "Cele mai bune oferte de Crăciun, verificate și actualizate zilnic.",
    url: "https://amcupon.ro/craciun",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Crăciun AmCupon.ro" }],
  },
};

// Categorii relevante pentru Crăciun
const CAT_CRACIUN = [
  "toys", "fashion", "beauty", "electronics", "books",
  "sport", "home", "health", "kids",
];

// Magazine de top pentru Crăciun
const TOP_CRACIUN = [
  "noriel.ro", "fashiondays.ro", "notino.ro", "emag.ro",
  "elefant.ro", "libris.ro", "sportisimo.ro", "answear.ro",
];

const IDEI_CADOURI = [
  { emoji: "🧸", titlu: "Jucării copii", href: "/categorii/toys", culoare: "bg-yellow-100 text-yellow-700" },
  { emoji: "💄", titlu: "Parfumuri & Beauty", href: "/categorii/beauty", culoare: "bg-pink-100 text-pink-700" },
  { emoji: "📱", titlu: "Electronice", href: "/categorii/electronics", culoare: "bg-blue-100 text-blue-700" },
  { emoji: "👗", titlu: "Modă & Fashion", href: "/categorii/fashion", culoare: "bg-purple-100 text-purple-700" },
  { emoji: "📚", titlu: "Cărți & Jocuri", href: "/categorii/books", culoare: "bg-green-100 text-green-700" },
  { emoji: "🏋️", titlu: "Sport & Outdoor", href: "/categorii/sport", culoare: "bg-teal-100 text-teal-700" },
];

function loadData(): Magazin[] {
  const filePath = path.join(process.cwd(), "public", "output.json");
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function numeAfisat(magazin: string): string {
  return magazin
    .split(".")[0]
    .replace(/-/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const CULORI = [
  "bg-red-500", "bg-green-600", "bg-red-600", "bg-green-500",
  "bg-orange-500", "bg-teal-600", "bg-pink-500", "bg-indigo-500",
];

const craciunJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Cadouri & Reduceri de Crăciun 2026 România",
  description: "Oferte și coduri de reducere de Crăciun verificate pe AmCupon.ro",
  url: "https://amcupon.ro/craciun",
};

export default function CraciunPage() {
  const all = loadData();
  const an = new Date().getFullYear();

  const topCraciun = TOP_CRACIUN.map((slug) => all.find((m) => m.magazin === slug)).filter(Boolean) as Magazin[];
  const restRelevante = all
    .filter(
      (m) =>
        m.are_promotie &&
        !TOP_CRACIUN.includes(m.magazin) &&
        CAT_CRACIUN.some((c) => (m.categorie_slug || "").includes(c) || m.categorie.toLowerCase().includes(c))
    )
    .slice(0, 20);
  const restulCuPromotii = all
    .filter(
      (m) =>
        m.are_promotie &&
        !TOP_CRACIUN.includes(m.magazin) &&
        !restRelevante.includes(m)
    )
    .slice(0, 16);

  const magazine = [...topCraciun, ...restRelevante, ...restulCuPromotii];
  const totalCoduri = magazine.reduce((acc, m) => acc + m.promotii.filter((p) => p.cod_cupon).length, 0);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(craciunJsonLd) }}
      />

      <div className="min-h-screen bg-white">
        {/* Header */}

        {/* Breadcrumb */}
        <nav className="max-w-6xl mx-auto px-4 pt-4 pb-0 text-xs text-gray-400 flex items-center gap-1">
          <Link href="/" className="hover:text-orange-500 transition-colors">Acasă</Link>
          <span className="mx-1">/</span>
          <span className="text-gray-600">Reduceri de Crăciun {an}</span>
        </nav>

        {/* Hero */}
        <section className="bg-gradient-to-br from-red-600 via-red-500 to-green-600 text-white">
          <div className="max-w-6xl mx-auto px-4 py-14 text-center">
            <div className="text-5xl mb-4">🎄</div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
              Reduceri de Crăciun {an}
            </h1>
            <p className="text-red-100 text-lg mb-8 max-w-xl mx-auto">
              Coduri de reducere verificate pentru cadourile perfecte — jucării, fashion,
              electronice, parfumuri și multe altele
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
              {[
                { val: `${magazine.length}+`, label: "Magazine" },
                { val: `${magazine.reduce((a, m) => a + m.promotii.length, 0)}+`, label: "Oferte" },
                { val: `${totalCoduri}+`, label: "Coduri" },
              ].map((s) => (
                <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl py-3 px-2">
                  <div className="text-2xl font-black">{s.val}</div>
                  <div className="text-xs text-red-100">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Idei de cadouri */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-gray-900 mb-5">🎁 Idei de cadouri</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {IDEI_CADOURI.map((idee) => (
              <a
                key={idee.titlu}
                href={idee.href}
                className={`${idee.culoare} rounded-2xl p-4 text-center hover:opacity-90 transition-opacity hover:shadow-md`}
              >
                <div className="text-3xl mb-2">{idee.emoji}</div>
                <span className="text-xs font-bold">{idee.titlu}</span>
              </a>
            ))}
          </div>
        </section>

        {/* Magazine grid */}
        <section className="max-w-6xl mx-auto px-4 pb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-gray-900">
              🛍️ Magazine cu reduceri active
            </h2>
            <span className="text-sm text-gray-400">{magazine.length} magazine</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {magazine.map((m, i) => {
              const nume = numeAfisat(m.magazin);
              const culoare = CULORI[i % CULORI.length];
              const coduri = m.promotii.filter((p) => p.cod_cupon);
              const bestPromo = m.promotii[0];

              return (
                <a
                  key={m.magazin}
                  href={`/cod-reducere/${m.magazin}`}
                  className="group bg-white border border-gray-200 hover:border-red-300 rounded-2xl p-4 transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {m.logo_url ? (
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0 flex items-center justify-center p-0.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.logo_url}
                          alt={`Logo ${nume}`}
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className={`w-10 h-10 rounded-xl ${culoare} flex items-center justify-center text-white font-black text-lg shrink-0`}>
                        {nume.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{nume}</p>
                      {coduri.length > 0 && (
                        <span className="text-xs font-bold text-orange-500">
                          {coduri.length} cod{coduri.length > 1 ? "uri" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {bestPromo && (
                    <p className="text-gray-500 text-xs leading-snug line-clamp-2 mb-2">
                      {bestPromo.nume}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{m.promotii.length} oferte</span>
                    <span className="text-xs text-red-500 group-hover:text-red-600 font-semibold transition-colors">
                      Vezi →
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* SEO Content */}
        <section className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-3xl mx-auto px-4 py-12">
            <h2 className="text-2xl font-black text-gray-900 mb-6">
              Ghid Cumpărături Crăciun {an}
            </h2>
            <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
              <div>
                <h3 className="text-gray-900 font-bold mb-2">Când să cumperi cadourile de Crăciun?</h3>
                <p>
                  Cel mai bun moment este în noiembrie, profitând de ofertele Black Friday, și
                  în primele două săptămâni din decembrie. Apropiindu-te de 25 decembrie,
                  stocurile se epuizează și livrarea poate întârzia. Urmărește reducerile de
                  pe AmCupon.ro încă din octombrie pentru cele mai bune prețuri.
                </p>
              </div>
              <div>
                <h3 className="text-gray-900 font-bold mb-2">Unde găsești cele mai bune cadouri la prețuri mici?</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Jucării:</strong> Noriel, eMAG — reduceri până la 50%</li>
                  <li><strong>Electronice:</strong> eMAG, Altex — oferte speciale de sezon</li>
                  <li><strong>Parfumuri & cosmetice:</strong> Notino, Douglas</li>
                  <li><strong>Haine & accesorii:</strong> FashionDays, Answear, Zara</li>
                  <li><strong>Cărți:</strong> Elefant, Libris — reduceri mari la pachete</li>
                </ul>
              </div>
              <div>
                <h3 className="text-gray-900 font-bold mb-2">Cum folosești codurile de reducere de Crăciun?</h3>
                <p>
                  Intră pe pagina magazinului de pe AmCupon.ro, copiază codul de reducere
                  activ, adaugă produsele în coș pe site-ul magazinului și introdu codul la
                  checkout. Reducerea se aplică automat. Toate codurile de pe AmCupon.ro sunt
                  verificate și actualizate zilnic.
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400">
          © {an} AmCupon.ro ·{" "}
          <Link href="/" className="hover:text-orange-500">Toate reducerile</Link>
          {" · "}
          <Link href="/black-friday" className="hover:text-orange-500">Black Friday</Link>
          {" · "}
          <Link href="/contact" className="hover:text-orange-500">Contact</Link>
        </footer>
      </div>
    </>
  );
}
