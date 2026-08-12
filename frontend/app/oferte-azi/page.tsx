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
    : `Toate ofertele si promotiile active de azi in Romania. Coduri de reducere verificate zilnic la 1000+ magazine online. Actualizat ${luna} ${an}.`;

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

/* ── Card oferta (dark, premium) ─────────────────────────────────────────── */
function OfertaCard({ o }: { o: OfertaFlat }) {
  const nume = numeAfisat(o.magazin);
  const discount = extractDiscount(o.promo.nume) || extractDiscount(o.promo.descriere || "");
  const zile = o.promo.zile_ramase ?? 99;
  const urgenta = zile <= 2;

  return (
    <div className="group relative flex flex-col bg-gradient-to-b from-[#14181c] to-[#14181c] border border-[#1f2329] hover:border-[#ddf93c]/50 rounded-xl p-4 transition-all duration-200 hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1">

      {/* Header magazin */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#ffffff] shrink-0 flex items-center justify-center ring-1 ring-[#ddf93c]/20 shadow-md">
          {o.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={o.logo_url} alt={`Logo ${nume}`}
              className="w-10 h-10 object-contain" loading="lazy" />
          ) : (
            <span className="w-full h-full bg-gradient-to-br from-[#ddf93c] to-[#c3dd2c] flex items-center justify-center text-[#0c1000] font-black text-lg">
              {nume.charAt(0)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-black text-[#ffffff] truncate group-hover:text-[#c3dd2c] transition-colors">{nume}</p>
          <p className="text-[11px] text-[#9399a0] truncate mt-0.5">{CAT_EMOJI[o.categorie_slug] || ""} {CAT_LABELS[o.categorie_slug] || o.categorie}</p>
        </div>
        {discount > 0 && (
          <div className="shrink-0 leading-none bg-gradient-to-br from-[#34d399] to-[#ddf93c] rounded-lg px-2 py-1.5 shadow-sm">
            <span className="block text-[15px] font-black text-[#ffffff] tracking-tight">-{discount}%</span>
          </div>
        )}
      </div>

      {/* Titlu promo — inaltime fixa pentru aliniere */}
      <p className="text-[13px] text-[#c9ced5] leading-snug mt-3 mb-3 line-clamp-2 min-h-[2.5rem]">{o.promo.nume}</p>

      {/* Cod box (daca exista) sau eticheta oferta */}
      {o.hasCod && o.promo.cod_cupon ? (
        <div className="relative bg-[#ddf93c]/10 border border-dashed border-[#ddf93c]/40 rounded-lg py-2.5 text-center mb-3">
          <span className="absolute left-2.5 top-1 text-[8px] uppercase tracking-widest text-[#9399a0] font-bold">cod</span>
          <span className="font-mono font-black text-[#c3dd2c] text-sm tracking-[0.22em]">{o.promo.cod_cupon}</span>
        </div>
      ) : (
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#c9ced5] bg-[#ddf93c]/10 border border-[#1f2329] rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ddf93c]" /> Ofertă fără cod
          </span>
        </div>
      )}

      {/* Actiune — impinsa jos pentru aliniere intre carduri */}
      <div className="mt-auto">
        <div className="flex items-center gap-2">
          {o.hasCod ? (
            <Link href={`/cod-reducere/${o.magazin}`}
              className="flex-1 text-center text-[13px] font-black bg-gradient-to-r from-[#ddf93c] to-[#ddf93c] hover:from-[#ddf93c] hover:to-[#ddf93c] text-[#0c1000] py-2.5 rounded-xl transition-all">
              Copiază codul
            </Link>
          ) : (
            <a href={o.url_afiliat} target="_blank" rel="sponsored noopener noreferrer"
              className="flex-1 text-center text-[13px] font-black bg-gradient-to-r from-[#ddf93c] to-[#ddf93c] hover:from-[#ddf93c] hover:to-[#ddf93c] text-[#0c1000] py-2.5 rounded-xl transition-all">
              Vezi oferta →
            </a>
          )}
          <ShareButton
            pageSlug={`/cod-reducere/${o.magazin}`}
            title={`${o.hasCod ? "Cod reducere" : "Oferta"} ${discount > 0 ? "-" + discount + "% " : ""}${nume}`}
            text={`${o.hasCod ? "Cod reducere" : "Oferta"}${discount > 0 ? " -" + discount + "%" : ""} la ${nume}: ${o.promo.nume}`}
            small
            theme="dark"
          />
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-[#f0fdfa]">
          {urgenta ? (
            <span className="text-[10px] font-bold text-[#e8956f] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e8956f] animate-pulse" />
              {zile === 0 ? "Expiră azi" : "Expiră mâine"}
            </span>
          ) : (
            <span className="text-[10px] text-[#9399a0] font-medium">
              {zile < 99 ? `${zile} zile rămase` : "Verificat azi"}
            </span>
          )}
          <Link href={`/cod-reducere/${o.magazin}`}
            className="text-[10px] font-semibold text-[#9399a0] hover:text-[#c3dd2c] transition-colors">
            Toate codurile →
          </Link>
        </div>
      </div>
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

      <div className="min-h-screen bg-[#06080b]">

        {/* Hero ─────────────────────────────────────────────────────────── */}
        <div className="relative bg-[#06080b] border-b border-[#1f2329] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{background:"radial-gradient(ellipse 80% 70% at 50% -20%, rgba(13,148,136,0.14) 0%, transparent 65%)"}} />
          <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-12 text-center">

            <div className="inline-flex items-center gap-2 bg-[#ddf93c]/10 border border-[#ddf93c]/25 text-[#ddf93c] text-xs font-bold px-4 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              Live — actualizat azi, {luna} {an}
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#ffffff] mb-4 leading-tight">
              {cat && CAT_LABELS[cat]
                ? <>{CAT_EMOJI[cat] || ""} Oferte <span className="text-[#ddf93c]">{CAT_LABELS[cat]}</span> de Azi</>
                : <>Oferte de Azi <span className="text-[#ddf93c]">Romania</span></>
              }
            </h1>
            <p className="text-[#c9ced5] text-lg mb-8 max-w-xl mx-auto">
              {oferteFiltrate.length} promotii active la {nrMagazine} magazine. Verificate si sortate dupa valoare.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <div className="bg-[#14181c] border border-[#1f2329] rounded-xl px-4 py-2.5 text-sm font-bold text-[#ffffff] flex items-center gap-2">
                <span className="text-[#c3dd2c]">🎟</span>
                {nrCoduri} coduri de reducere
              </div>
              <div className="bg-[#14181c] border border-[#1f2329] rounded-xl px-4 py-2.5 text-sm font-bold text-[#ffffff] flex items-center gap-2">
                <span>🏪</span>
                {nrMagazineTotal} magazine
              </div>
              {nrUrgente > 0 && (
                <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-2.5 text-sm font-bold text-red-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  {nrUrgente} expira curand
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filtre categorii ─────────────────────────────────────────────── */}
        <div className="bg-[#14181c] border-b border-[#1f2329] sticky top-[64px] z-40">
          <div className="max-w-6xl mx-auto px-4 py-2.5 overflow-x-auto" style={{scrollbarWidth:"none"}}>
            <div className="flex items-center gap-2 min-w-max">
              <Link href="/oferte-azi"
                className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                  !cat
                    ? "bg-[#ddf93c] text-[#0c1000] shadow-md shadow-[#ddf93c]/25"
                    : "bg-[#1f2329] text-[#c9ced5] hover:bg-[#2a2f36] border border-[#2a2f36]"
                }`}>
                🔥 Toate ({toateOfertele.length})
              </Link>
              {categoriiDisponibile.map(([slug, count]) => (
                <Link key={slug} href={`/oferte-azi?cat=${slug}`}
                  className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                    cat === slug
                      ? "bg-[#ddf93c] text-[#0c1000] shadow-md shadow-[#ddf93c]/25"
                      : "bg-[#1f2329] text-[#c9ced5] hover:bg-[#2a2f36] border border-[#2a2f36]"
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
            <div className="text-center py-20 bg-[#14181c] rounded-xl border border-[#1f2329]">
              <p className="text-5xl mb-4">🔍</p>
              <p className="font-black text-[#ffffff] text-lg mb-2">Nicio oferta activa in aceasta categorie</p>
              <p className="text-[#c9ced5] text-sm mb-6">Incearca alta categorie sau revino mai tarziu.</p>
              <Link href="/oferte-azi"
                className="inline-flex items-center gap-2 bg-[#ddf93c] hover:bg-[#ddf93c] text-[#0c1000] font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
                Vezi toate ofertele →
              </Link>
            </div>
          ) : (
            <>
              {/* Sub-header grid */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-[#c9ced5]">
                  <span className="font-black text-[#ffffff]">{oferteFiltrate.length}</span> oferte
                  {cat && CAT_LABELS[cat] ? ` in ${CAT_LABELS[cat]}` : " active"}
                  {" "}— sortate: cod &gt; discount &gt; urgenta
                </p>
                {cat && (
                  <Link href="/oferte-azi" className="text-xs font-bold text-[#ddf93c] hover:text-[#c3dd2c] transition-colors">
                    Sterge filtrul ×
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {oferteFiltrate.map((o, i) => (
                  <OfertaCard key={`${o.magazin}-${i}`} o={o} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* CTA Newsletter ──────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 pb-16">
          <div className="relative bg-gradient-to-r from-[#ddf93c]/10 via-[#14181c] to-[#ddf93c]/10 border border-[#ddf93c]/15 rounded-xl p-8 md:p-12 text-center overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{background:"radial-gradient(ellipse 80% 100% at 50% 100%, rgba(20,184,166,0.07) 0%, transparent 70%)"}} />
            <div className="relative">
              <span className="inline-flex items-center gap-2 bg-[#ddf93c]/10 border border-[#ddf93c]/20 text-[#ddf93c] text-xs font-black px-3 py-1 rounded-full mb-5 uppercase tracking-widest">
                📬 Nu rata nicio oferta buna
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-[#ffffff] mb-3">
                Primeste top oferte direct pe email
              </h2>
              <p className="text-[#c9ced5] mb-8 max-w-md mx-auto">
                {nrMagazineTotal} magazine monitorizate zilnic. Cele mai bune coduri, o data pe saptamana. Zero spam.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/newsletter"
                  className="bg-[#ddf93c] hover:bg-[#ddf93c] text-[#0c1000] font-black px-8 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-[#ddf93c]/25 hover:shadow-[#ddf93c]/40 hover:-translate-y-0.5 duration-200">
                  Aboneaza-te gratuit →
                </Link>
                <Link href="/toate-magazinele"
                  className="bg-[#1f2329] hover:bg-[#2a2f36] border border-[#2a2f36] text-[#c9ced5] font-semibold px-6 py-3.5 rounded-xl text-sm transition-colors">
                  Toate magazinele
                </Link>
              </div>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 mt-6 text-xs text-[#9399a0]">
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
