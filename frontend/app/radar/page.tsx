import { Metadata } from "next";
import fs from "fs";
import path from "path";
import Link from "next/link";

/* ── Tipuri ──────────────────────────────────────────────────────────────── */
interface Pick {
  magazin: string;
  nume_afisat: string;
  categorie: string;
  categorie_slug: string;
  logo_url?: string;
  titlu: string;
  descriere?: string;
  cod: string;
  url: string;
  zile_ramase: number;
  procent_succes?: number;
  take?: string;
}

interface Digest {
  data: string;
  data_afisata: string;
  titlu: string;
  intro: string;
  picks: Pick[];
  outro: string;
  sursa_voce?: string;
}

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

/* ── Date ────────────────────────────────────────────────────────────────── */
function loadDigest(): Digest | null {
  try {
    const filePath = path.join(process.cwd(), "public", "digest-today.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    const d = JSON.parse(raw) as Digest;
    if (!d.picks || d.picks.length === 0) return null;
    return d;
  } catch {
    return null;
  }
}

/* ── Metadata ────────────────────────────────────────────────────────────── */
export async function generateMetadata(): Promise<Metadata> {
  const luna = LUNI_RO[new Date().getMonth()];
  const an = new Date().getFullYear();
  const title = `Radarul AmCupon — Cele mai bune oferte de azi (${luna} ${an})`;
  const description = `Selectia editoriala zilnica AmCupon: alegem si verificam cele mai bune oferte reale din Romania, cu un verdict scurt pentru fiecare. Actualizat zilnic.`;
  return {
    title: title.length > 60 ? `Radarul AmCupon — Ofertele zilei ${luna} ${an}` : title,
    description,
    keywords: ["radar oferte","cele mai bune oferte azi","oferte verificate romania","selectie reduceri","coduri reducere zilnic"],
    alternates: { canonical: "https://amcupon.ro/radar" },
    openGraph: {
      title, description,
      url: "https://amcupon.ro/radar",
      siteName: "AmCupon.ro",
      locale: "ro_RO",
      type: "website",
      images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630, alt: "Radarul AmCupon" }],
    },
  };
}

/* ── Intrare editoriala ──────────────────────────────────────────────────── */
function RadarEntry({ p, rank }: { p: Pick; rank: number }) {
  const urgent = p.zile_ramase > 0 && p.zile_ramase <= 3;
  const zileText = p.zile_ramase === 1 ? "1 zi" : `${p.zile_ramase} zile`;

  return (
    <article className="relative bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-5 transition-all duration-200 hover:shadow-xl hover:shadow-black/40">
      <div className="flex gap-4">
        {/* Numar rang */}
        <div className="shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-black text-base shadow-lg shadow-indigo-500/20">
            {rank}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          {/* Header: logo + nume + categorie */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg overflow-hidden bg-white shrink-0 flex items-center justify-center">
              {p.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.logo_url} alt={`Logo ${p.nume_afisat}`} className="w-7 h-7 object-contain" loading="lazy" />
              ) : (
                <span className="text-slate-900 font-black">{p.nume_afisat.charAt(0)}</span>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-black text-white truncate">{p.nume_afisat}</h2>
              <p className="text-[11px] text-slate-500">{CAT_EMOJI[p.categorie_slug] || "🏷️"} {p.categorie}</p>
            </div>
          </div>

          {/* Verdictul editorial — vedeta */}
          {p.take && (
            <p className="text-sm text-slate-300 leading-relaxed mb-3">{p.take}</p>
          )}

          {/* Linia de jos: cod + urgenta + link */}
          <div className="flex flex-wrap items-center gap-2">
            {p.cod && (
              <span className="font-mono font-black text-indigo-400 text-sm tracking-wider bg-slate-800 border border-dashed border-cyan-400/50 rounded-lg px-2.5 py-1">
                {p.cod}
              </span>
            )}
            {urgent && (
              <span className="text-[11px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-full flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-red-400 animate-pulse" />
                Expira in {zileText}
              </span>
            )}
            <Link
              href={`/cod-reducere/${p.magazin}`}
              className="ml-auto text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 rounded-full transition-colors"
            >
              Vezi oferta →
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ── Pagina ──────────────────────────────────────────────────────────────── */
export default function RadarPage() {
  const digest = loadDigest();
  const luna = LUNI_RO[new Date().getMonth()];
  const an = new Date().getFullYear();

  if (!digest) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">📡</div>
          <h1 className="text-2xl font-black mb-2">Radarul se incarca</h1>
          <p className="text-slate-400 mb-6">Selectia de azi nu e inca gata. Revino in cateva minute sau vezi toate ofertele active.</p>
          <Link href="/oferte-azi" className="inline-block text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-full transition-colors">
            Vezi ofertele active →
          </Link>
        </div>
      </main>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": digest.titlu,
    "description": digest.intro,
    "numberOfItems": digest.picks.length,
    "itemListElement": digest.picks.map((p, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": `${p.nume_afisat} — ${p.titlu || "oferta"}`,
      "url": p.url,
    })),
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Acasa", "item": "https://amcupon.ro" },
      { "@type": "ListItem", "position": 2, "name": "Radar", "item": "https://amcupon.ro/radar" },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Hero */}
        <header className="mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-3 py-1 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            RADARUL AMCUPON · {digest.data_afisata}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-4">
            Ce merita azi, ales si verificat de noi
          </h1>
          {/* Vocea — intro editorial */}
          <div className="bg-slate-900 border-l-4 border-indigo-500 rounded-r-xl p-4 sm:p-5">
            <p className="text-slate-300 leading-relaxed">{digest.intro}</p>
          </div>
        </header>

        {/* Selectia */}
        <div className="flex flex-col gap-3">
          {digest.picks.map((p, i) => (
            <RadarEntry key={p.magazin + i} p={p} rank={i + 1} />
          ))}
        </div>

        {/* Outro */}
        {digest.outro && (
          <div className="mt-8 text-center">
            <p className="text-slate-400 italic mb-5">{digest.outro}</p>
            <Link href="/oferte-azi" className="inline-block text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:opacity-90 px-6 py-3 rounded-full transition-opacity">
              Vezi toate ofertele active →
            </Link>
          </div>
        )}

        {/* Nota de subsol — rolul editorial */}
        <p className="mt-10 text-center text-xs text-slate-600">
          Radarul AmCupon e selectia noastra zilnica din sute de oferte active. Verificam codurile, alegem ce merita, iti spunem pe scurt de ce. Actualizat zilnic, {luna} {an}.
        </p>
      </div>
    </main>
  );
}
