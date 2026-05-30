import { Metadata } from "next";
import fs from "fs";
import path from "path";
import Link from "next/link";
import ShareButton from "../components/ShareButton";

/* ── Tipuri ──────────────────────────────────────────────────────────────── */
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
  categorie_slug?: string;
  are_promotie: boolean;
  cod_cupon: boolean;
  zile_ramase: number;
  promotii: Promotie[];
  scor_final?: number;
  rank?: number;
}

interface OfertaFlat {
  magazin: string;
  logo_url?: string;
  url_afiliat: string;
  categorie: string;
  categorie_slug: string;
  promo: Promotie;
  hasCod: boolean;
}

/* ── Config categorii ────────────────────────────────────────────────────── */
const CAT_LABELS: Record<string, string> = {
  "fashion":              "Fashion",
  "electronics-itc":     "Electronice",
  "pharma":              "Farmacie",
  "beauty":              "Frumusete",
  "sports-outdoors":     "Sport",
  "home-garden":         "Casa & Gradina",
  "babies-kids-toys":    "Copii",
  "automotive":          "Auto",
  "books":               "Carti",
  "gifts-flowers":       "Cadouri",
  "health-personal-care":"Sanatate",
  "hypermarket-groceries":"Supermarket",
  "pet-supplies":        "Animale",
  "online-mall":         "Mall Online",
  "jewelry":             "Bijuterii",
  "others":              "Altele",
};

const LUNI_RO = ["ianuarie","februarie","martie","aprilie","mai","iunie",
  "iulie","august","septembrie","octombrie","noiembrie","decembrie"];

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function numeAfisat(s: string) {
  return s.split(".")[0].replace(/-/g," ").split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function extractDiscount(text: string): number {
  const m = text?.match(/(\d+)\s*%/);
  const v = m ? parseInt(m[1]) : 0;
  return v > 0 && v <= 90 ? v : 0;
}

function loadOferte(): OfertaFlat[] {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const magazine: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const oferte: OfertaFlat[] = [];
  for (const m of magazine) {
    if (!m.are_promotie || m.promotii.length === 0) continue;
    for (const promo of m.promotii) {
      oferte.push({
        magazin:       m.magazin,
        logo_url:      m.logo_url,
        url_afiliat:   promo.landing_page || m.url_afiliat || m.url,
        categorie:     m.categorie,
        categorie_slug: m.categorie_slug || "others",
        promo,
        hasCod:        !!promo.cod_cupon,
      });
    }
  }

  // Sorteaza: cod cupon > discount mare > zile ramase putine
  oferte.sort((a, b) => {
    if (a.hasCod !== b.hasCod) return a.hasCod ? -1 : 1;
    const da = extractDiscount(a.promo.nume) || extractDiscount(a.promo.descriere || "");
    const db = extractDiscount(b.promo.nume) || extractDiscount(b.promo.descriere || "");
    if (da !== db) return db - da;
    return (a.promo.zile_ramase ?? 999) - (b.promo.zile_ramase ?? 999);
  });

  return oferte;
}

/* ── Metadata ────────────────────────────────────────────────────────────── */
export async function generateMetadata(
  { searchParams }: { searchParams: Promise<{ cat?: string }> }
): Promise<Metadata> {
  const { cat } = await searchParams;
  const luna = LUNI_RO[new Date().getMonth()];
  const an = new Date().getFullYear();
  const catLabel = cat ? (CAT_LABELS[cat] || cat) : null;

  const title = catLabel
    ? `Oferte ${catLabel} de Azi — Reduceri ${luna} ${an} | AmCupon.ro`
    : `Oferte de Azi Romania — Toate Promotiile Active ${luna} ${an} | AmCupon.ro`;
  const description = catLabel
    ? `Toate ofertele active ${catLabel} din Romania pentru ${luna} ${an}. Coduri de reducere si promotii verificate zilnic pe AmCupon.ro.`
    : `Toate ofertele si promotiile active de azi in Romania. Coduri de reducere verificate zilnic la 600+ magazine online. Actualizat ${luna} ${an}.`;

  return {
    title,
    description,
    keywords: ["oferte de azi","promotii de azi","reduceri de azi romania","coduri reducere active","oferte online romania"],
    alternates: { canonical: "https://amcupon.ro/oferte-azi" },
    openGraph: {
      title,
      description,
      url: "https://amcupon.ro/oferte-azi",
      siteName: "AmCupon.ro",
      locale: "ro_RO",
      type: "website",
    },
  };
}

/* ── Componenta card oferta ──────────────────────────────────────────────── */
function OfertaCard({ o, index }: { o: OfertaFlat; index: number }) {
  const nume = numeAfisat(o.magazin);
  const discount = extractDiscount(o.promo.nume) || extractDiscount(o.promo.descriere || "");
  const urgenta = (o.promo.zile_ramase ?? 99) <= 2;

  const CULORI = ["bg-orange-500","bg-blue-500","bg-purple-500","bg-green-500",
    "bg-pink-500","bg-teal-500","bg-indigo-500","bg-red-500"];
  const culoare = CULORI[nume.charCodeAt(0) % CULORI.length];

  return (
    <div className="bg-white border border-gray-200 hover:border-orange-300 rounded-2xl p-4 transition-all hover:shadow-md flex flex-col gap-3">
      {/* Header magazin */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0 flex items-center justify-center">
          {o.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={o.logo_url} alt={`Logo ${nume}`}
              className="w-full h-full object-contain p-0.5" loading="lazy" />
          ) : (
            <span className={`w-full h-full ${culoare} flex items-center justify-center text-white font-black text-base rounded-xl`}>
              {nume.charAt(0)}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black text-gray-800 truncate">{nume}</p>
          <p className="text-[10px] text-gray-400 truncate">{CAT_LABELS[o.categorie_slug] || o.categorie}</p>
        </div>
        <div className="ml-auto flex flex-col items-end gap-1 shrink-0">
          {discount > 0 && (
            <span className="text-xs font-black text-white bg-red-500 px-2 py-0.5 rounded-full">-{discount}%</span>
          )}
          {o.hasCod && (
            <span className="text-[10px] font-bold text-orange-500 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-full">COD</span>
          )}
        </div>
      </div>

      {/* Titlu promo */}
      <p className="text-sm text-gray-700 line-clamp-2 leading-snug flex-1">{o.promo.nume}</p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        {urgenta ? (
          <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
            ⚡ Expira {o.promo.zile_ramase === 0 ? "azi" : "maine"}
          </span>
        ) : (
          <span className="text-[10px] text-gray-400">
            {o.promo.zile_ramase != null ? `${o.promo.zile_ramase} zile` : ""}
          </span>
        )}
        <div className="flex items-center gap-1.5">
          <ShareButton
            pageSlug={`/cod-reducere/${o.magazin}`}
            title={`${o.hasCod ? "Cod reducere" : "Oferta"} ${discount > 0 ? "-" + discount + "% " : ""}${nume}`}
            text={`${o.hasCod ? "🔥 Cod reducere" : "🏷 Oferta"}${discount > 0 ? " -" + discount + "%" : ""} la ${nume}!\n${o.promo.nume}`}
            small
            theme="light"
          />
          {o.hasCod ? (
            <Link href={`/cod-reducere/${o.magazin}`}
              className="text-xs font-bold bg-orange-500 hover:bg-orange-400 text-white px-3 py-1.5 rounded-lg transition-colors">
              Vezi codul
            </Link>
          ) : (
            <a href={o.url_afiliat} target="_blank" rel="sponsored noopener noreferrer"
              className="text-xs font-bold bg-orange-500 hover:bg-orange-400 text-white px-3 py-1.5 rounded-lg transition-colors">
              Vezi oferta
            </a>
          )}
        </div>
      </div>

      {/* Link magazin */}
      <Link href={`/cod-reducere/${o.magazin}`}
        className="text-[10px] text-gray-400 hover:text-orange-500 transition-colors text-center">
        Toate codurile {nume} &rarr;
      </Link>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default async function OferteAziPage(
  { searchParams }: { searchParams: Promise<{ cat?: string }> }
) {
  const { cat } = await searchParams;
  const luna = LUNI_RO[new Date().getMonth()];
  const an = new Date().getFullYear();

  const toateOfertele = loadOferte();
  const oferteFiltrate = cat
    ? toateOfertele.filter(o => o.categorie_slug === cat)
    : toateOfertele;

  // Categorii disponibile (cu count)
  const catCount: Record<string, number> = {};
  for (const o of toateOfertele) {
    catCount[o.categorie_slug] = (catCount[o.categorie_slug] || 0) + 1;
  }
  const categoriiDisponibile = Object.entries(catCount)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Oferte de Azi Romania — ${luna} ${an}`,
    "description": `Toate promotiile active de azi: ${toateOfertele.length} oferte la ${new Set(toateOfertele.map(o=>o.magazin)).size} magazine`,
    "url": "https://amcupon.ro/oferte-azi",
    "numberOfItems": oferteFiltrate.length,
    "itemListElement": oferteFiltrate.slice(0, 30).map((o, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": o.promo.nume,
      "url": o.url_afiliat,
    })),
  };

  const nrMagazine = new Set(oferteFiltrate.map(o => o.magazin)).size;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
            <a href="/" className="flex items-center gap-1.5 shrink-0">
              <div className="bg-orange-500 text-white font-black text-base px-2 py-1 rounded-lg">Am</div>
              <span className="font-black text-gray-900 text-xl">Cupon</span>
              <span className="text-orange-500 font-black text-xl">.ro</span>
            </a>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-semibold text-gray-600">Oferte de Azi</span>
            <div className="ml-auto hidden sm:flex items-center gap-4 text-xs font-semibold text-gray-500">
              <a href="/top-reduceri" className="hover:text-orange-500 transition-colors">Top Reduceri</a>
              <a href="/toate-magazinele" className="hover:text-orange-500 transition-colors">Magazine</a>
              <a href="/newsletter" className="bg-orange-500 hover:bg-orange-400 text-white px-3 py-1.5 rounded-lg transition-colors">Newsletter</a>
            </div>
          </div>
        </header>

        {/* Hero */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white py-10 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 border border-white/30">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Actualizat azi — {luna} {an}
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">
              {cat && CAT_LABELS[cat] ? `Oferte ${CAT_LABELS[cat]} de Azi` : "Oferte de Azi — Romania"}
            </h1>
            <p className="text-orange-100 text-lg mb-6 max-w-xl mx-auto">
              {oferteFiltrate.length} promotii active la {nrMagazine} magazine online. Verificate si actualizate zilnic.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <div className="bg-white/20 border border-white/30 rounded-xl px-4 py-2 text-sm font-bold">
                🎟 {toateOfertele.filter(o => o.hasCod).length} coduri de reducere
              </div>
              <div className="bg-white/20 border border-white/30 rounded-xl px-4 py-2 text-sm font-bold">
                🏪 {new Set(toateOfertele.map(o => o.magazin)).size} magazine
              </div>
              <div className="bg-white/20 border border-white/30 rounded-xl px-4 py-2 text-sm font-bold">
                ⚡ {toateOfertele.filter(o => (o.promo.zile_ramase ?? 99) <= 2).length} expira curand
              </div>
            </div>
          </div>
        </div>

        {/* Filtre categorii */}
        <div className="bg-white border-b border-gray-200 sticky top-[57px] z-40">
          <div className="max-w-6xl mx-auto px-4 py-2.5 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 min-w-max">
              <Link href="/oferte-azi"
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                  !cat ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                }`}>
                Toate ({toateOfertele.length})
              </Link>
              {categoriiDisponibile.map(([slug, count]) => (
                <Link key={slug} href={`/oferte-azi?cat=${slug}`}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                    cat === slug ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                  }`}>
                  {CAT_LABELS[slug] || slug} ({count})
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Grid oferte */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {oferteFiltrate.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <p className="text-4xl mb-4">🔍</p>
              <p className="font-bold text-gray-700 mb-2">Nicio oferta activa in aceasta categorie</p>
              <Link href="/oferte-azi" className="text-orange-500 hover:text-orange-600 font-semibold text-sm">
                Vezi toate ofertele &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {oferteFiltrate.map((o, i) => (
                <OfertaCard key={`${o.magazin}-${i}`} o={o} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* CTA Newsletter */}
        <div className="max-w-6xl mx-auto px-4 pb-10">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-center">
            <p className="text-sm font-black text-orange-400 uppercase tracking-widest mb-2">Nu rata ofertele</p>
            <h2 className="text-xl font-black text-white mb-2">Primeste ofertele de azi direct pe email</h2>
            <p className="text-slate-400 text-sm mb-5">600+ magazine monitorizate. Top 5 coduri in fiecare saptamana.</p>
            <a href="/newsletter"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors">
              Aboneaza-te gratuit &rarr;
            </a>
          </div>
        </div>

        {/* Footer intern */}
        <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-3">
            <a href="/" className="hover:text-orange-500">Acasa</a>
            <a href="/top-reduceri" className="hover:text-orange-500">Top Reduceri</a>
            <a href="/toate-magazinele" className="hover:text-orange-500">Magazine</a>
            <a href="/categorii" className="hover:text-orange-500">Categorii</a>
            <a href="/blog" className="hover:text-orange-500">Blog</a>
            <a href="/newsletter" className="hover:text-orange-500">Newsletter</a>
          </div>
          &copy; {an} AmCupon.ro
        </footer>
      </div>
    </>
  );
}
