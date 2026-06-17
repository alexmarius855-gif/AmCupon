import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";

interface Promotie {
  nume: string;
  descriere: string;
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
  rank?: number;
  scor_final: number;
  are_promotie: boolean;
  cod_cupon: boolean;
  promotii: Promotie[];
  folosit_de: number;
  procent_succes: number;
  trend: number;
}

export const metadata: Metadata = {
  title: "Black Friday 2026 România — Coduri Reducere & Oferte Verificate | AmCupon.ro",
  description:
    "Cele mai bune oferte Black Friday 2026 din România. Coduri de reducere verificate la eMAG, FashionDays, Altex, Dedeman și sute de alte magazine. Actualizat zilnic pe AmCupon.ro.",
  keywords: [
    "black friday romania 2026",
    "oferte black friday",
    "coduri reducere black friday",
    "promotii black friday",
    "reduceri black friday emag",
    "black friday altex",
    "black friday fashiondays",
    "voucher black friday",
    "amcupon black friday",
  ],
  alternates: { canonical: "https://amcupon.ro/black-friday" },
  openGraph: {
    title: "Black Friday 2026 România — Oferte & Coduri Reducere | AmCupon.ro",
    description:
      "Toate ofertele Black Friday verificate într-un singur loc. Coduri active, actualizate zilnic.",
    url: "https://amcupon.ro/black-friday",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Black Friday AmCupon.ro" }],
  },
};

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
  "bg-indigo-600", "bg-blue-500", "bg-green-500", "bg-purple-500",
  "bg-pink-500", "bg-teal-500", "bg-red-500", "bg-indigo-500",
];

const TOP_BF_MAGAZINE = [
  "emag.ro", "fashiondays.ro", "altex.ro", "dedeman.ro", "notino.ro",
  "answear.ro", "noriel.ro", "decathlon.ro", "elefant.ro", "sportisimo.ro",
];

const bfJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Black Friday 2026 România — Coduri Reducere",
  description: "Oferte și coduri de reducere Black Friday verificate pe AmCupon.ro",
  url: "https://amcupon.ro/black-friday",
};

export default function BlackFridayPage() {
  const all = loadData();
  const an = new Date().getFullYear();

  // Primele magazine din lista BF, apoi restul cu promotii
  const topBf = TOP_BF_MAGAZINE.map((slug) => all.find((m) => m.magazin === slug)).filter(Boolean) as Magazin[];
  const restCuPromotii = all
    .filter((m) => m.are_promotie && !TOP_BF_MAGAZINE.includes(m.magazin))
    .slice(0, 40);
  const magazine = [...topBf, ...restCuPromotii];

  const totalCoduri = magazine.reduce((acc, m) => acc + m.promotii.filter((p) => p.cod_cupon).length, 0);
  const totalOferte = magazine.reduce((acc, m) => acc + m.promotii.length, 0);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bfJsonLd) }}
      />

      <div className="min-h-screen bg-gray-950 text-white">
        {/* Header */}

        {/* Breadcrumb */}
        <nav className="max-w-6xl mx-auto px-4 pt-4 pb-0 text-xs text-gray-500 flex items-center gap-1">
          <Link href="/" className="hover:text-indigo-400 transition-colors">Acasă</Link>
          <span className="mx-1">/</span>
          <span className="text-gray-300">Black Friday {an}</span>
        </nav>

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center gap-2 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-5 animate-pulse">
            🔴 LIVE — Actualizat zilnic
          </div>

          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
            Black Friday {an}{" "}
            <span className="text-indigo-400">România</span>
          </h1>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            Toate ofertele și codurile de reducere Black Friday verificate —
            de la sute de magazine partenere
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-10">
            {[
              { val: `${magazine.length}+`, label: "Magazine" },
              { val: `${totalOferte}+`, label: "Oferte active" },
              { val: `${totalCoduri}+`, label: "Coduri reducere" },
            ].map((s) => (
              <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl py-4 px-3">
                <div className="text-2xl font-black text-indigo-400">{s.val}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Top category shortcuts */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {["Electronice", "Fashion", "Frumusețe", "Sport", "Jucării", "Cărți", "Casă"].map((cat) => (
              <span
                key={cat}
                className="text-xs font-semibold bg-gray-800 text-gray-300 px-3 py-1.5 rounded-full"
              >
                {cat}
              </span>
            ))}
          </div>
        </section>

        {/* Stores grid */}
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black">
              🛍️ Magazine cu oferte active
            </h2>
            <span className="text-sm text-gray-400">{magazine.length} magazine</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {magazine.map((m, i) => {
              const nume = numeAfisat(m.magazin);
              const culoare = CULORI[i % CULORI.length];
              const coduri = m.promotii.filter((p) => p.cod_cupon);
              const bestPromo = m.promotii[0];

              return (
                <a
                  key={m.magazin}
                  href={`/cod-reducere/${m.magazin}`}
                  className="group bg-gray-900 border border-gray-800 hover:border-indigo-500 rounded-2xl p-5 transition-all hover:shadow-lg hover:shadow-cyan-500/10"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${culoare} flex items-center justify-center text-white font-black text-xl shrink-0`}>
                      {m.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.logo_url}
                          alt={`Logo ${nume}`}
                          className="w-full h-full object-contain rounded-xl"
                          loading="lazy"
                        />
                      ) : (
                        nume.charAt(0)
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-white text-sm">{nume}</span>
                        {coduri.length > 0 && (
                          <span className="text-xs font-bold bg-indigo-600 text-white px-1.5 py-0.5 rounded-full shrink-0">
                            {coduri.length} COD
                          </span>
                        )}
                      </div>
                      {bestPromo && (
                        <p className="text-gray-400 text-xs leading-snug truncate">
                          {bestPromo.nume}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span>{m.promotii.length} oferte</span>
                        {m.trend > 0 && (
                          <span className="text-green-400">↑ {m.trend}%</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">{m.categorie}</span>
                    <span className="text-xs text-indigo-400 group-hover:text-indigo-300 font-semibold transition-colors">
                      Vezi ofertele →
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* SEO Content */}
        <section className="bg-gray-900 border-t border-gray-800">
          <div className="max-w-3xl mx-auto px-4 py-12">
            <h2 className="text-2xl font-black text-white mb-6">
              Ghid Black Friday {an} România
            </h2>
            <div className="space-y-6 text-gray-400 text-sm leading-relaxed">
              <div>
                <h3 className="text-white font-bold mb-2">Când are loc Black Friday {an}?</h3>
                <p>
                  Black Friday {an} are loc în luna noiembrie, în ultima vineri a lunii. Însă mulți
                  retaileri români (eMAG, Altex, Dedeman, FashionDays) lansează oferte cu săptămâni
                  înainte — uneori chiar din octombrie. AmCupon.ro monitorizează toate ofertele și
                  le actualizează zilnic, astfel încât să nu ratezi nicio reducere.
                </p>
              </div>
              <div>
                <h3 className="text-white font-bold mb-2">Cum obții cele mai mari reduceri de Black Friday?</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Adaugă produsele la Favorite sau în coș înainte de BF</li>
                  <li>Compară prețul curent cu prețul de dinainte de BF</li>
                  <li>Folosește codurile de reducere suplimentare de pe AmCupon.ro</li>
                  <li>Abonează-te la newsletter pentru alerte în timp real</li>
                  <li>Verifică mai multe magazine pentru același produs</li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-bold mb-2">Ce magazine au Black Friday în România?</h3>
                <p>
                  Cele mai mari magazine online participă la Black Friday: eMAG, Altex, Dedeman,
                  FashionDays, Notino, Answear, Noriel, Decathlon, Elefant și multe altele.
                  AmCupon.ro agregă ofertele de la peste 200 de magazine partenere, cu coduri
                  verificate și actualizate zilnic.
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-gray-800 py-6 text-center text-xs text-gray-600">
          © {an} AmCupon.ro ·{" "}
          <Link href="/" className="hover:text-indigo-400">Toate reducerile</Link>
          {" · "}
          <Link href="/contact" className="hover:text-indigo-400">Contact</Link>
        </footer>
      </div>
    </>
  );
}
