import { Metadata } from "next";
import fs from "fs";
import path from "path";

export const metadata: Metadata = {
  title: "Categorii coduri reducere | AmCupon.ro",
  description: "Coduri de reducere organizate pe categorii: Fashion, Electronice, Frumusete, Casa & Gradina, Sport, Farmacie si multe altele. Oferte verificate zilnic.",
};

/* ─── Config categorii ───────────────────────────────────────────────────── */
const CATEGORII = [
  {
    slug: "fashion", label: "Fashion", desc: "Haine & accesorii",
    from: "#ec4899", to: "#f97316",
    keywords: ["fashion", "clothing", "haine", "shoes", "answear", "aboutyou"],
  },
  {
    slug: "electronics-itc", label: "Electronice IT&C", desc: "Laptopuri, telefoane, gadgeturi",
    from: "#3b82f6", to: "#6366f1",
    keywords: ["electronic", "tech", "it", "laptop", "phone", "ozone", "navstore"],
  },
  {
    slug: "beauty", label: "Frumusete", desc: "Cosmetice & parfumuri",
    from: "#f43f5e", to: "#a855f7",
    keywords: ["beauty", "cosmetic", "parfum", "notino", "makeup", "sephora"],
  },
  {
    slug: "home-garden", label: "Casa & Gradina", desc: "Mobila, decoratiuni, unelte",
    from: "#10b981", to: "#3b82f6",
    keywords: ["home", "casa", "garden", "vidaxl", "gradina", "mobila", "dedeman"],
  },
  {
    slug: "sports-outdoors", label: "Sport & Outdoor", desc: "Echipament sportiv & fitness",
    from: "#f97316", to: "#eab308",
    keywords: ["sport", "fitness", "outdoor", "sportdepot", "decathlon", "running"],
  },
  {
    slug: "pharma", label: "Farmacie", desc: "Medicamente & suplimente",
    from: "#ef4444", to: "#f97316",
    keywords: ["pharma", "farmacie", "drmax", "sensiblu", "vegis", "medic"],
  },
  {
    slug: "babies-kids-toys", label: "Copii & Jucarii", desc: "Produse pentru cei mici",
    from: "#a855f7", to: "#ec4899",
    keywords: ["kids", "copii", "toy", "bebe", "noriel", "jucarii"],
  },
  {
    slug: "automotive", label: "Auto-Moto", desc: "Piese & accesorii auto",
    from: "#64748b", to: "#1e293b",
    keywords: ["auto", "car", "moto", "automobilus", "piese", "anvelop"],
  },
  {
    slug: "books", label: "Carti & Edu", desc: "Carti, e-books, papetarie",
    from: "#eab308", to: "#f97316",
    keywords: ["book", "carte", "libris", "carturesti", "bookzone", "edu"],
  },
  {
    slug: "hypermarket-groceries", label: "Hypermarket", desc: "Alimente & produse zilnice",
    from: "#10b981", to: "#059669",
    keywords: ["hypermarket", "grocery", "aliment", "food", "supermarket"],
  },
  {
    slug: "gifts-flowers", label: "Cadouri & Flori", desc: "Cadouri pentru orice ocazie",
    from: "#f43f5e", to: "#ec4899",
    keywords: ["gift", "cadou", "flori", "flower", "cadouri"],
  },
  {
    slug: "telecom", label: "Telecom", desc: "Abonamente & servicii mobile",
    from: "#06b6d4", to: "#3b82f6",
    keywords: ["telecom", "mobile", "abonament", "orange", "vodafone", "digi"],
  },
  {
    slug: "pet-supplies", label: "Animale", desc: "Hrana, jucarii, accesorii",
    from: "#f59e0b", to: "#d97706",
    keywords: ["pet", "animal", "caine", "pisica", "zooplus"],
  },
  {
    slug: "jewelry", label: "Bijuterii", desc: "Bijuterii & ceasuri",
    from: "#8b5cf6", to: "#6366f1",
    keywords: ["jewel", "bijuterie", "ceas", "argint", "aur"],
  },
  {
    slug: "games", label: "Jocuri & Gaming", desc: "Jocuri video & console",
    from: "#6366f1", to: "#1e293b",
    keywords: ["game", "gaming", "console", "jocuri", "steam", "ps5"],
  },
  {
    slug: "health-personal-care", label: "Sanatate", desc: "Ingrijire personala & wellness",
    from: "#0ea5e9", to: "#10b981",
    keywords: ["health", "sanatate", "wellness", "ingrijire"],
  },
  {
    slug: "online-mall", label: "Online Mall", desc: "Platforme multi-brand",
    from: "#1e293b", to: "#475569",
    keywords: ["mall", "emag", "altex", "flanco", "platform"],
  },
  {
    slug: "others", label: "Altele", desc: "Diverse categorii",
    from: "#94a3b8", to: "#64748b",
    keywords: [],
  },
];

/* ─── Load data ──────────────────────────────────────────────────────────── */
function loadMagazine(): any[] {
  try {
    const p = path.join(process.cwd(), "public", "output.json");
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {
    return [];
  }
}

function getMagazineForCategory(magazine: any[], cat: typeof CATEGORII[0]) {
  return magazine.filter((m: any) => {
    const slugM  = (m.categorie_slug || m.categorie || "").toLowerCase();
    const nameM  = (m.magazin || "").toLowerCase();
    const dispM  = (m.magazin_display || "").toLowerCase();
    // Match dupa slug exact
    if (slugM === cat.slug) return true;
    // Match dupa keywords
    return cat.keywords.some(kw =>
      slugM.includes(kw) || nameM.includes(kw) || dispM.includes(kw)
    );
  });
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function CategoriPage() {
  const magazine = loadMagazine();

  // Construieste date per categorie
  const categoriiCuDate = CATEGORII.map((cat) => {
    const mag    = getMagazineForCategory(magazine, cat);
    const nrOff  = mag.filter((m: any) => m.promotie || m.cod_cupon).length;
    const logos  = mag
      .filter((m: any) => m.logo)
      .slice(0, 4)
      .map((m: any) => ({ logo: m.logo, name: m.magazin_display || m.magazin }));
    return { ...cat, nrMag: mag.length, nrOff, logos };
  });

  const totalOff = magazine.filter((m: any) => m.promotie || m.cod_cupon).length;

  return (
    <div className="min-h-screen bg-slate-950">

      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <a href="/" className="flex items-center gap-1.5 shrink-0">
            <div className="bg-orange-500 text-white font-black text-base px-2 py-1 rounded-lg">Am</div>
            <span className="font-black text-white text-xl">Cupon</span>
            <span className="text-orange-500 font-black text-xl">.ro</span>
          </a>
          <span className="text-slate-600">/</span>
          <span className="text-sm font-semibold text-slate-400">Categorii</span>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 py-10 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            Toate categoriile
          </h1>
          <p className="text-slate-400 text-sm">
            <span className="text-emerald-400 font-bold">{totalOff} oferte active</span>
            {" "}in{" "}
            <span className="text-white font-bold">{CATEGORII.length} categorii</span>
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
              className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.04] hover:shadow-2xl"
              style={{
                background: `linear-gradient(135deg, ${c.from} 0%, ${c.to} 100%)`,
              }}
            >
              {/* Overlay sticla */}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />

              {/* Logouri magazine (fundal decorativ) */}
              {c.logos.length > 0 && (
                <div className="absolute top-2 right-2 flex -space-x-2 opacity-70 group-hover:opacity-90 transition-opacity">
                  {c.logos.slice(0, 3).map((l, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={l.logo}
                      alt={l.name}
                      className="w-6 h-6 rounded-full border border-white/40 bg-white object-contain p-0.5"
                      loading="lazy"
                    />
                  ))}
                </div>
              )}

              {/* Content */}
              <div className="relative p-4 pt-8">
                {/* Nr oferte badge */}
                {c.nrOff > 0 ? (
                  <div className="inline-flex items-center gap-1 bg-white/25 backdrop-blur-sm px-2 py-0.5 rounded-full mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span className="text-white text-[10px] font-bold">{c.nrOff} oferte</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded-full mb-3">
                    <span className="text-white/70 text-[10px]">{c.nrMag} magazine</span>
                  </div>
                )}

                <div className="text-white font-black text-sm leading-tight mb-1">
                  {c.label}
                </div>
                <div className="text-white/70 text-[10px] leading-tight">
                  {c.desc}
                </div>

                {/* Arrow */}
                <div className="mt-3 flex items-center gap-1 text-white/60 group-hover:text-white group-hover:gap-2 transition-all text-[10px] font-bold">
                  Vezi ofertele
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Back link */}
        <div className="mt-10 text-center">
          <a href="/" className="text-sm text-slate-500 hover:text-orange-400 transition-colors">
            &larr; Inapoi la AmCupon.ro
          </a>
        </div>
      </div>
    </div>
  );
}
