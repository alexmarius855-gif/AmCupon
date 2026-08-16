import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";

export const metadata: Metadata = {
  title: "Categorii Coduri Reducere Romania 2026 | AmCupon.ro",
  description: "Coduri de reducere organizate pe categorii: Fashion, Electronice, Frumusete, Casa, Sport, Farmacie, Copii, Animale si multe altele. 1000+ magazine verificate zilnic.",
  keywords: ["categorii reduceri romania","coduri reducere pe categorii","fashion reducere","electronice ieftine","farmacie online reducere"],
  alternates: { canonical: "https://amcupon.ro/categorii" },
  openGraph: {
    title: "Categorii Coduri Reducere Romania | AmCupon.ro",
    description: "1000+ magazine organizate pe 18 categorii. Oferte verificate zilnic.",
    url: "https://amcupon.ro/categorii",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
      images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }],
  },
};

/* ─── Config categorii ───────────────────────────────────────────────────── */
// Accent distinct per categorie (recunoastere instanta) — nuante racoroase premium,
// ZERO portocaliu/galben/amber, fara rosu pur (rezervat pt "expira azi").
// Sluguri = valorile REALE din output.json (categorie_slug), aceeasi taxonomie RO
// folosita de CategoryIcon.tsx si de generateStaticParams() din [slug]/page.tsx.
// Bug gasit 09.08.2026: array-ul folosea sluguri in ENGLEZA (electronics-itc, home-garden
// etc, mostenite dintr-o taxonomie veche) — generateStaticParams() nu genereaza NICIODATA
// acele pagini (deriva direct din categorie_slug, care e romanesc), deci toate cele 18
// linkuri de pe aceasta pagina duceau la 404. NUME_CATEGORIE din [slug]/page.tsx avea
// aceeasi taxonomie veche (englezeasca) — de-aia bug-ul a trecut neobservat, ambele fisiere
// erau "consistente" intre ele, doar cu datele reale nu se mai potriveau de mult.
const CATEGORII = [
  {
    slug: "fashion", label: "Fashion", desc: "Haine & accesorii",
    accent: "#c3dd2c",
    keywords: ["fashion", "clothing", "haine", "shoes", "answear", "aboutyou"],
  },
  {
    slug: "beauty", label: "Frumusete", desc: "Cosmetice & parfumuri",
    accent: "#ddf93c",
    keywords: ["beauty", "cosmetic", "parfum", "notino", "makeup", "sephora"],
  },
  {
    slug: "bijuterii", label: "Bijuterii", desc: "Bijuterii & ceasuri",
    accent: "#c4b5fd",
    keywords: ["jewel", "bijuterie", "ceas", "argint", "aur"],
  },
  {
    slug: "electronice", label: "Electronice & IT", desc: "Laptopuri, telefoane, gadgeturi",
    accent: "#ddf93c",
    keywords: ["electronic", "tech", "it", "laptop", "phone", "ozone", "navstore"],
  },
  {
    slug: "software", label: "Software & Digital", desc: "VPN, hosting, AI, aplicatii",
    accent: "#7dd3fc",
    keywords: ["software", "vpn", "hosting", "ai", "app", "digital"],
  },
  {
    slug: "telecom", label: "Telecom", desc: "Abonamente & servicii mobile",
    accent: "#c3dd2c",
    keywords: ["telecom", "mobile", "abonament", "orange", "vodafone", "digi"],
  },
  {
    slug: "casa-gradina", label: "Casa & Gradina", desc: "Mobila, decoratiuni, unelte",
    accent: "#34d399",
    keywords: ["home", "casa", "garden", "vidaxl", "gradina", "mobila", "dedeman"],
  },
  {
    slug: "animale", label: "Animale", desc: "Hrana, jucarii, accesorii",
    accent: "#fda4af",
    keywords: ["pet", "animal", "caine", "pisica", "zooplus"],
  },
  {
    slug: "mancare-bauturi", label: "Mancare & Bauturi", desc: "Alimente & produse zilnice",
    accent: "#ddf93c",
    keywords: ["hypermarket", "grocery", "aliment", "food", "supermarket", "bautura"],
  },
  {
    slug: "carti-educatie", label: "Carti & Educatie", desc: "Carti, e-books, papetarie",
    accent: "#ddf93c",
    keywords: ["book", "carte", "libris", "carturesti", "bookzone", "edu"],
  },
  {
    slug: "copii", label: "Copii & Jucarii", desc: "Produse pentru cei mici",
    accent: "#ddf93c",
    keywords: ["kids", "copii", "toy", "bebe", "noriel", "jucarii"],
  },
  {
    slug: "cadouri-flori", label: "Cadouri & Flori", desc: "Cadouri pentru orice ocazie",
    accent: "#e879f9",
    keywords: ["gift", "cadou", "flori", "flower", "cadouri"],
  },
  {
    slug: "calatorii", label: "Calatorii", desc: "Vacante, bilete, cazare",
    accent: "#7dd3fc",
    keywords: ["travel", "calatorie", "vacanta", "bilet", "esim", "hotel"],
  },
  {
    slug: "sanatate", label: "Sanatate & Farmacie", desc: "Medicamente, suplimente, ingrijire",
    accent: "#2dd4bf",
    keywords: ["pharma", "farmacie", "drmax", "sensiblu", "vegis", "medic", "health", "sanatate", "wellness"],
  },
  {
    slug: "financiar", label: "Financiar", desc: "Carduri, banking, asigurari",
    accent: "#9399a0",
    keywords: ["financiar", "card", "banking", "asigurare", "credit", "revolut"],
  },
  {
    slug: "sport", label: "Sport & Outdoor", desc: "Echipament sportiv & fitness",
    accent: "#ddf93c",
    keywords: ["sport", "fitness", "outdoor", "sportdepot", "decathlon", "running"],
  },
  {
    slug: "auto-moto", label: "Auto-Moto", desc: "Piese & accesorii auto",
    accent: "#9399a0",
    keywords: ["auto", "car", "moto", "automobilus", "piese", "anvelop"],
  },
  {
    slug: "marketplace", label: "Online Mall", desc: "Platforme multi-brand",
    accent: "#9399a0",
    keywords: ["mall", "emag", "altex", "flanco", "platform", "marketplace"],
  },
];

interface Magazin {
  magazin: string;
  magazin_display?: string;
  categorie?: string;
  categorie_slug?: string;
  are_promotie?: boolean;
  cod_cupon?: boolean;
  logo_url?: string;
}

/* ─── Load data ──────────────────────────────────────────────────────────── */
function loadMagazine(): Magazin[] {
  try {
    const p = path.join(process.cwd(), "public", "output.json");
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {
    return [];
  }
}

/**
 * Magazinele unei categorii — potrivire EXACTA pe `categorie_slug`.
 *
 * Inainte se cadea si pe `keywords`, cu `includes()` pe slug/nume/nume-afisat.
 * Doua consecinte reale, ambele masurate pe productie (16.08.2026):
 *  1. numerele afisate aici erau umflate — un magazin ajungea in mai multe
 *     categorii pentru ca numele lui continea intamplator un cuvant-cheie;
 *  2. `telecom` parea sa aiba magazine (de la "orange"/"digi"/"mobile" gasite in
 *     nume), dar `/categorii/telecom` raspundea 404: rutele se genereaza din
 *     `categorie_slug` REAL prin `generateStaticParams`, iar NICIUN magazin nu are
 *     slug-ul `telecom`. Deci cardul trimitea garantat intr-un 404.
 *
 * Acelasi tipar de bug ca pe paginile de nisa (vezi lib/categoriiNisa.ts):
 * potrivire pe subsir acolo unde exista deja un camp exact.
 */
function getMagazineForCategory(magazine: Magazin[], cat: typeof CATEGORII[0]) {
  return magazine.filter(
    (m: Magazin) => (m.categorie_slug || "").toLowerCase().trim() === cat.slug
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function CategoriPage() {
  const magazine = loadMagazine();

  // Construieste date per categorie — fix: camp corect are_promotie + logo_url
  const categoriiCuDate = CATEGORII.map((cat) => {
    const mag    = getMagazineForCategory(magazine, cat);
    const nrOff  = mag.filter((m: Magazin) => m.are_promotie || m.cod_cupon).length;
    const logos  = mag
      .filter((m: Magazin) => m.logo_url)
      .slice(0, 3)
      .map((m: Magazin) => ({ logo: m.logo_url, name: m.magazin_display || m.magazin }));
    return { ...cat, nrMag: mag.length, nrOff, logos };
  })
  // O categorie fara niciun magazin nu are pagina generata (generateStaticParams
  // deriva din datele reale), deci cardul ei ar duce in 404. Se ascunde singura,
  // si reapare automat daca apar magazine pe acel slug.
  .filter((c) => c.nrMag > 0);

  const totalOff = magazine.filter((m: Magazin) => m.are_promotie || m.cod_cupon).length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Categorii Coduri Reducere Romania",
    "url": "https://amcupon.ro/categorii",
    // categoriiCuDate, NU CATEGORII: altfel am declara lui Google, in date
    // structurate, un URL care raspunde 404 (cazul /categorii/telecom — slug fara
    // niciun magazin, deci fara pagina generata). Un link vizibil rupt e o problema;
    // acelasi link intr-un ItemList trimis motorului de cautare e mai rau.
    "itemListElement": categoriiCuDate.map((c, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": c.label,
      "url": `https://amcupon.ro/categorii/${c.slug}`,
    })),
  };

  // Pagini specializate cu link direct la nisa (nu doar /categorii/slug)
  const NISE_SPECIALE = [
    { href: "/fashion",      emoji: "👗", label: "Fashion & Haine" },
    { href: "/electronice",  emoji: "💻", label: "Electronice & IT" },
    { href: "/frumusete",    emoji: "💄", label: "Beauty & Cosmetice" },
    { href: "/parfumuri",    emoji: "🌹", label: "Parfumuri" },
    { href: "/casa",         emoji: "🏡", label: "Casa & Gradina" },
    { href: "/sport",        emoji: "🏃", label: "Sport & Outdoor" },
    { href: "/farmacie",     emoji: "💊", label: "Farmacie Online" },
    { href: "/sanatate",     emoji: "🌿", label: "Sanatate & Naturiste" },
    { href: "/copii",        emoji: "👶", label: "Copii & Jucarii" },
    { href: "/animale",      emoji: "🐾", label: "Animale de Companie" },
    { href: "/calatorie",    emoji: "✈️", label: "Vacante & Travel" },
    { href: "/gadgets",      emoji: "📡", label: "Gadgets & Tech" },
    { href: "/moto",         emoji: "🚗", label: "Auto-Moto" },
    { href: "/carti",        emoji: "📚", label: "Carti & Edu" },
    { href: "/idei-cadouri", emoji: "🎁", label: "Idei Cadouri" },
    { href: "/oferte-azi",   emoji: "🔥", label: "Oferte de Azi" },
  ];

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <div className="min-h-screen bg-[#06080b]">

      {/* Header */}
      <header className="bg-[#14181c] border-b border-[#1f2329]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 shrink-0">
            <div className="bg-[#ddf93c] text-[#0c1000] font-black text-base px-2 py-1 rounded-lg">Am</div>
            <span className="font-black text-[#ffffff] text-xl">Cupon</span>
            <span className="text-[#ddf93c] font-black text-xl">.ro</span>
          </Link>
          <span className="text-[#9399a0]">/</span>
          <span className="text-sm font-semibold text-[#c9ced5]">Categorii</span>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#14181c] via-[#14181c] to-[#1f2329] py-10 px-4 border-b border-[#1f2329]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-black text-[#ffffff] mb-2">
            Toate categoriile
          </h1>
          <p className="text-[#c9ced5] text-sm">
            <span className="text-emerald-400 font-bold">{totalOff} oferte active</span>
            {" "}in{" "}
            <span className="text-[#ffffff] font-bold">{categoriiCuDate.length} categorii</span>
            {" "}&mdash; actualizat zilnic
          </p>
        </div>
      </div>

      {/* Grid categorii */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {categoriiCuDate.map((c) => (
            <a
              key={c.slug}
              href={`/categorii/${c.slug}`}
              className="group relative rounded-xl overflow-hidden bg-[#14181c] border border-[#1f2329] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40 hover:[border-color:var(--accent)]"
              style={{ "--accent": `${c.accent}80` } as Record<string, string>}
            >
              {/* Glow colorat pe categorie — recunoastere instanta */}
              <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none opacity-25 blur-2xl transition-opacity duration-300 group-hover:opacity-40"
                style={{ background: c.accent }} />

              {/* Logouri magazine (fundal decorativ) */}
              {c.logos.length > 0 && (
                <div className="absolute top-2 right-2 flex -space-x-2 opacity-70 group-hover:opacity-90 transition-opacity">
                  {c.logos.slice(0, 3).map((l, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={l.logo}
                      alt={l.name}
                      className="w-6 h-6 rounded-full border border-[#2a2f36] bg-[#14181c] object-contain p-0.5"
                      loading="lazy"
                    />
                  ))}
                </div>
              )}

              {/* Content */}
              <div className="relative p-4 pt-8">
                {/* Nr oferte badge */}
                {c.nrOff > 0 ? (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border mb-3" style={{ background: `${c.accent}22`, borderColor: `${c.accent}44` }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: c.accent }} />
                    <span className="text-[10px] font-bold" style={{ color: c.accent }}>{c.nrOff} oferte</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1 bg-[#1f2329] px-2 py-0.5 rounded-full mb-3">
                    <span className="text-[#c9ced5] text-[10px]">{c.nrMag} magazine</span>
                  </div>
                )}

                <div className="text-[#ffffff] font-black text-sm leading-tight mb-1">
                  {c.label}
                </div>
                <div className="text-[#c9ced5] text-[10px] leading-tight">
                  {c.desc}
                </div>

                {/* Arrow */}
                <div className="mt-3 flex items-center gap-1 text-[#9399a0] group-hover:text-[#ffffff] group-hover:gap-2 transition-all text-[10px] font-bold">
                  Vezi ofertele
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Pagini specializate — contin editorial + produse */}
        <div className="mt-12 border-t border-[#1f2329] pt-10">
          <h2 className="text-lg font-black text-[#ffffff] mb-2">Pagini specializate pe nisa</h2>
          <p className="text-[#9399a0] text-sm mb-6">Fiecare pagina are editorial, ghiduri de cumparaturi si produse recomandate.</p>
          <div className="flex flex-wrap gap-2">
            {NISE_SPECIALE.map(n => (
              <a key={n.href} href={n.href}
                className="flex items-center gap-1.5 bg-[#1f2329] hover:bg-[#2a2f36] border border-[#2a2f36] hover:border-[#ddf93c]/50 text-[#c9ced5] hover:text-[#ffffff] text-sm font-semibold px-3 py-2 rounded-xl transition-all">
                <span>{n.emoji}</span>
                {n.label}
              </a>
            ))}
          </div>
        </div>

        {/* Back link */}
        <div className="mt-10 text-center">
          <Link href="/" className="text-sm text-[#9399a0] hover:text-[#ddf93c] transition-colors">
            &larr; Inapoi la AmCupon.ro
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
