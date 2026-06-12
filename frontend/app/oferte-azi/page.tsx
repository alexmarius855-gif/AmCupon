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
  "home-garden":         "Casa",
  "babies-kids-toys":    "Copii",
  "automotive":          "Auto",
  "books":               "Carti",
  "gifts-flowers":       "Cadouri",
  "health-personal-care":"Sanatate",
  "hypermarket-groceries":"Supermarket",
  "pet-supplies":        "Animale",
  "online-mall":         "Mall",
  "jewelry":             "Bijuterii",
  "office-supplies":     "Birou",
  "telecom":             "Telecom",
  "games":               "Gaming",
  "others":              "Altele",
};

const CAT_EMOJI: Record<string, string> = {
  "fashion": "👗", "electronics-itc": "💻", "pharma": "💊", "beauty": "💄",
  "sports-outdoors": "🏃", "home-garden": "🏡", "babies-kids-toys": "🧸",
  "automotive": "🚗", "books": "📚", "gifts-flowers": "🎁",
  "health-personal-care": "🧴", "hypermarket-groceries": "🛒",
  "pet-supplies": "🐾", "online-mall": "🛍️", "jewelry": "💎",
  "office-supplies": "🖊️", "telecom": "📱", "games": "🎮", "others": "📦",
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
        magazin:        m.magazin,
        logo_url:       m.logo_url,
        url_afiliat:    promo.landing_page || m.url_afiliat || m.url,
        categorie:      m.categorie,
        categorie_slug: m.categorie_slug || "others",
        promo,
        hasCod:         !!promo.cod_cupon,
      });
    }
  }

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
    : `Toate ofertele si promotiile active de azi in Romania. Coduri de reducere verificate zilnic la 300+ magazine online. Actualizat ${luna} ${an}.`;

  return {
    title,
    description,
    keywords: ["oferte de azi","promotii de azi","reduceri de azi romania","coduri reducere active","oferte online romania"],
    alternates: { canonical: "https://amcupon.ro/oferte-azi" },
    openGraph: {
      title, description,
      url: "https://amcupon.ro/oferte-azi",
      siteName: "AmCupon.ro",
      locale: "ro_RO",
      type: "website",
      images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630, alt: "AmCupon.ro" }],
    },
  };
}

/* ── Card oferta (dark) ──────────────────────────────────────────────────── */
function OfertaCard({ o }: { o: OfertaFlat }) {
  const nume = numeAfisat(o.magazin);
  const discount = extractDiscount(o.promo.nume) || extractDiscount(o.promo.descriere || "");
  const urgenta = (o.promo.zile_ramase ?? 99) <= 2;
  const zile = o.promo.zile_ramase ?? 99;

  const CULORI = ["bg-orange-500","bg-blue-500","bg-violet-500","bg-emerald-500",
    "bg-pink-500","bg-teal-500","bg-indigo-500","bg-red-500"];
  const culoare = CULORI[nume.charCodeAt(0) % CULORI.length];

  return (
    <div className="group bg-slate-900 border border-slate-800 hover:border-orange-500/40 rounded-2xl p-4 transition-all duration-200 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-0.5 flex flex-col gap-3">

      {/* Header magazin */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl overflow-hidden bg-white shrink-0 flex items-center justify-center shadow-sm">
          {o.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={o.logo_url} alt={`Logo ${nume}`}
              className="w-9 h-9 object-contain" loading="lazy" />
          ) : (
            <span className={`w-full h-full ${culoare} flex items-center justify-center text-white font-black text-lg rounded-xl`}>
              {nume.charAt(0)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-white truncate group-hover:text-orange-400 transition-colors">{nume}</p>
          <p className="text-[10px] text-slate-500 truncate">{CAT_EMOJI[o.categorie_slug] || ""} {CAT_LABELS[o.categorie_slug] || o.categorie}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {discount > 0 && (
            <span className="text-xs font-black text-white bg-red-500 px-2 py-0.5 rounded-full">-{discount}%</span>
          )}
          {o.hasCod && (
            <span className="text-[10px] font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-full">COD</span>
          )}
        </div>
      </div>

      {/* Titlu promo */}
      <p className="text-sm text-slate-300 line-clamp-2 leading-snug flex-1">{o.promo.nume}</p>

      {/* Cod box (daca exista) */}
      {o.hasCod && o.promo.cod_cupon && (
        <div className="bg-slate-800 border border-dashed border-orange-400/50 rounded-xl px-3 py-1.5 text-center">
          <span className="font-mono font-black text-orange-400 text-sm tracking-widest">{o.promo.cod_cupon}</span>
        </div>
      )}

      {/* Footer card */}
      <div className="flex items-center justify-between gap-2">
        {urgenta ? (
          <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-red-400 animate-pulse" />
            {zile === 0 ? "Expira azi" : "Expira maine"}
          </span>
        ) : (
          <span className="text-[10px] text-slate-600 font-medium">
            {zile < 99 ? `${zile} zile ramase` : ""}
          </span>
        )}
        <div className="flex items-center gap-1.5">
          <ShareButton
            pageSlug={`/cod-reducere/${o.magazin}`}
            title={`${o.hasCod ? "Cod reducere" : "Oferta"} ${discount > 0 ? "-" + discount + "% " : ""}${nume}`}
            text={`${o.hasCod ? "Cod reducere" : "Oferta"}${discount > 0 ? " -" + discount + "%" : ""} la ${nume}: ${o.promo.nume}`}
            small
            theme="dark"
          />
          {o.hasCod ? (
            <Link href={`/cod-reducere/${o.magazin}`}
              className="text-xs font-black bg-orange-500 hover:bg-orange-400 text-white px-3 py-1.5 rounded-xl transition-colors">
              Copiaza codul
            </Link>
          ) : (
            <a href={o.url_afiliat} target="_blank" rel="sponsored noopener noreferrer"
              className="text-xs font-black bg-orange-500 hover:bg-orange-400 text-white px-3 py-1.5 rounded-xl transition-colors">
              Vezi oferta →
            </a>
          )}
        </div>
      </div>

      {/* Link magazin */}
      <Link href={`/cod-reducere/${o.magazin}`}
        className="text-[10px] text-slate-600 hover:text-orange-400 transition-colors text-center border-t border-slate-800 pt-2">
        Toate codurile {nume} →
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

  const catCount: Record<string, number> = {};
  for (const o of toateOfertele) {
    catCount[o.categorie_slug] = (catCount[o.categorie_slug] || 0) + 1;
  }
  const categoriiDisponibile = Object.entries(catCount)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);

  const nrMagazine = new Set(oferteFiltrate.map(o => o.magazin)).size;
  const nrCoduri = toateOfertele.filter(o => o.hasCod).length;
  const nrUrgente = toateOfertele.filter(o => (o.promo.zile_ramase ?? 99) <= 2).length;
  const nrMagazineTotal = new Set(toateOfertele.map(o => o.magazin)).size;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Oferte de Azi Romania — ${luna} ${an}`,
    "description": `Toate promotiile active de azi: ${toateOfertele.length} oferte la ${nrMagazineTotal} magazine`,
    "url": "https://amcupon.ro/oferte-azi",
    "numberOfItems": oferteFiltrate.length,
    "itemListElement": oferteFiltrate.slice(0, 30).map((o, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": o.promo.nume,
      "url": o.url_afiliat,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-slate-950">

        {/* Hero ─────────────────────────────────────────────────────────── */}
        <div className="relative bg-slate-950 border-b border-slate-800 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{background:"radial-gradient(ellipse 80% 70% at 50% -20%, rgba(249,115,22,0.12) 0%, transparent 65%)"}} />
          <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-12 text-center">

            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/25 text-orange-400 text-xs font-bold px-4 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              Live — actualizat azi, {luna} {an}
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
              {cat && CAT_LABELS[cat]
                ? <>{CAT_EMOJI[cat] || ""} Oferte <span className="text-orange-400">{CAT_LABELS[cat]}</span> de Azi</>
                : <>Oferte de Azi <span className="text-orange-400">Romania</span></>
              }
            </h1>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              {oferteFiltrate.length} promotii active la {nrMagazine} magazine. Verificate si sortate dupa valoare.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 text-sm font-bold text-white flex items-center gap-2">
                <span className="text-amber-400">🎟</span>
                {nrCoduri} coduri de reducere
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 text-sm font-bold text-white flex items-center gap-2">
                <span>🏪</span>
                {nrMagazineTotal} magazine
              </div>
              {nrUrgente > 0 && (
                <div className="bg-red-500/10 border border-red-500/25 rounded-2xl px-4 py-2.5 text-sm font-bold text-red-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  {nrUrgente} expira curand
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filtre categorii ─────────────────────────────────────────────── */}
        <div className="bg-slate-900 border-b border-slate-800 sticky top-[64px] z-40">
          <div className="max-w-6xl mx-auto px-4 py-2.5 overflow-x-auto" style={{scrollbarWidth:"none"}}>
            <div className="flex items-center gap-2 min-w-max">
              <Link href="/oferte-azi"
                className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                  !cat
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                }`}>
                🔥 Toate ({toateOfertele.length})
              </Link>
              {categoriiDisponibile.map(([slug, count]) => (
                <Link key={slug} href={`/oferte-azi?cat=${slug}`}
                  className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                    cat === slug
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                  }`}>
                  {CAT_EMOJI[slug] || ""} {CAT_LABELS[slug] || slug} ({count})
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Grid oferte ─────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {oferteFiltrate.length === 0 ? (
            <div className="text-center py-20 bg-slate-900 rounded-2xl border border-slate-800">
              <p className="text-5xl mb-4">🔍</p>
              <p className="font-black text-white text-lg mb-2">Nicio oferta activa in aceasta categorie</p>
              <p className="text-slate-400 text-sm mb-6">Incearca alta categorie sau revino mai tarziu.</p>
              <Link href="/oferte-azi"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
                Vezi toate ofertele →
              </Link>
            </div>
          ) : (
            <>
              {/* Sub-header grid */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-slate-400">
                  <span className="font-black text-white">{oferteFiltrate.length}</span> oferte
                  {cat && CAT_LABELS[cat] ? ` in ${CAT_LABELS[cat]}` : " active"}
                  {" "}— sortate: cod &gt; discount &gt; urgenta
                </p>
                {cat && (
                  <Link href="/oferte-azi" className="text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors">
                    Sterge filtrul ×
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {oferteFiltrate.map((o, i) => (
                  <OfertaCard key={`${o.magazin}-${i}`} o={o} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* CTA Newsletter ──────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 pb-16">
          <div className="relative bg-gradient-to-r from-orange-500/10 via-slate-900 to-red-500/10 border border-orange-500/15 rounded-3xl p-8 md:p-12 text-center overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{background:"radial-gradient(ellipse 80% 100% at 50% 100%, rgba(249,115,22,0.06) 0%, transparent 70%)"}} />
            <div className="relative">
              <span className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-black px-3 py-1 rounded-full mb-5 uppercase tracking-widest">
                📬 Nu rata nicio oferta buna
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
                Primeste top oferte direct pe email
              </h2>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                {nrMagazineTotal} magazine monitorizate zilnic. Cele mai bune coduri, o data pe saptamana. Zero spam.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/newsletter"
                  className="bg-orange-500 hover:bg-orange-400 text-white font-black px-8 py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 duration-200">
                  Aboneaza-te gratuit →
                </Link>
                <Link href="/toate-magazinele"
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold px-6 py-3.5 rounded-2xl text-sm transition-colors">
                  Toate magazinele
                </Link>
              </div>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 mt-6 text-xs text-slate-600">
                <span>✓ Gratuit, fara cont</span>
                <span>✓ Dezabonare cu un click</span>
                <span>✓ Zero spam garantat</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
