import fs from "fs";
import path from "path";

interface Produs {
  id: string;
  title: string;
  url: string;
  image: string;
  price: number;
  old_price?: number;
  discount_pct: number;
  category: string;
  cat_slug?: string;
  brand: string;
  merchant: string;
  merchant_slug: string;
  is_promo?: boolean;
  cod_cupon?: string;
  zile_ramase?: number;
}

interface ProductsJson {
  products?: Produs[];
}

function loadAll(): Produs[] {
  const filePath = path.join(process.cwd(), "public", "products.json");
  if (!fs.existsSync(filePath)) return [];
  const raw: ProductsJson | Produs[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return Array.isArray(raw) ? raw : (raw.products ?? []);
}

function getProduse(merchantSlugs: string[], catSlug: string, limit: number): Produs[] {
  const all = loadAll();

  // Prioritate 1: produse reale (cu pret) de la merchantii specificati
  const reale = all.filter(p =>
    merchantSlugs.some(s => p.merchant_slug === s || p.merchant === s)
    && p.price > 0
    && p.image
    && p.title
  );
  const cuDisc = reale.filter(p => p.discount_pct > 0 && p.old_price);
  const farDisc = reale.filter(p => !(p.discount_pct > 0 && p.old_price));
  cuDisc.sort((a, b) => b.discount_pct - a.discount_pct);
  const sortate = [...cuDisc, ...farDisc].slice(0, limit);

  if (sortate.length >= limit) return sortate;

  // Prioritate 2: promo-produse (fara pret) de la merchantii specificati
  const promoMerchant = all.filter(p =>
    merchantSlugs.some(s => p.merchant_slug === s || p.merchant === s)
    && p.is_promo
    && p.image
    && p.title
    && !sortate.some(e => e.id === p.id)
  ).slice(0, limit - sortate.length);

  const combined = [...sortate, ...promoMerchant];
  if (combined.length >= limit) return combined;

  // Prioritate 3: promo-produse fallback pe cat_slug
  if (catSlug) {
    const promoCat = all.filter(p =>
      p.cat_slug === catSlug
      && p.is_promo
      && p.image
      && p.title
      && !combined.some(e => e.id === p.id)
    ).slice(0, limit - combined.length);
    return [...combined, ...promoCat];
  }

  return combined;
}

// Clase Tailwind complete si statice — Tailwind nu poate detecta clase construite
// dinamic prin interpolare (ex. `text-${culoareAccent}-600`), asa ca avem nevoie
// de un lookup cu fiecare combinatie scrisa literal.
const ACCENT_CLASSES: Record<string, { text: string; bg: string; border: string; groupHoverText: string }> = {
  purple:  { text: "text-purple-600",  bg: "bg-purple-500",  border: "hover:border-purple-300",  groupHoverText: "group-hover:text-purple-600" },
  green:   { text: "text-green-600",   bg: "bg-green-500",   border: "hover:border-green-300",   groupHoverText: "group-hover:text-green-600" },
  blue:    { text: "text-blue-600",    bg: "bg-blue-500",    border: "hover:border-blue-300",    groupHoverText: "group-hover:text-blue-600" },
  pink:    { text: "text-pink-600",    bg: "bg-pink-500",    border: "hover:border-pink-300",    groupHoverText: "group-hover:text-pink-600" },
  emerald: { text: "text-emerald-600", bg: "bg-emerald-500", border: "hover:border-emerald-300", groupHoverText: "group-hover:text-emerald-600" },
  yellow:  { text: "text-yellow-600",  bg: "bg-yellow-500",  border: "hover:border-yellow-300",  groupHoverText: "group-hover:text-yellow-600" },
  indigo:  { text: "text-indigo-600",  bg: "bg-indigo-500",  border: "hover:border-indigo-300",  groupHoverText: "group-hover:text-indigo-600" },
  amber:   { text: "text-amber-600",   bg: "bg-amber-500",   border: "hover:border-amber-300",   groupHoverText: "group-hover:text-amber-600" },
  rose:    { text: "text-rose-600",    bg: "bg-rose-500",    border: "hover:border-rose-300",    groupHoverText: "group-hover:text-rose-600" },
  gray:    { text: "text-gray-600",    bg: "bg-gray-500",    border: "hover:border-gray-300",    groupHoverText: "group-hover:text-gray-600" },
  teal:    { text: "text-teal-600",    bg: "bg-teal-500",    border: "hover:border-teal-300",    groupHoverText: "group-hover:text-teal-600" },
  violet:  { text: "text-violet-600",  bg: "bg-violet-500",  border: "hover:border-violet-300",  groupHoverText: "group-hover:text-violet-600" },
  cyan:    { text: "text-cyan-600",    bg: "bg-cyan-500",    border: "hover:border-cyan-300",    groupHoverText: "group-hover:text-cyan-600" },
};

export default function NisaProduse({
  merchantSlugs,
  catSlug = "",
  titlu = "Produse populare",
  culoareAccent = "indigo",
  limit = 12,
}: {
  merchantSlugs: string[];
  catSlug?: string;
  titlu?: string;
  culoareAccent?: string;
  limit?: number;
}) {
  const produse = getProduse(merchantSlugs, catSlug, limit);
  if (produse.length === 0) return null;

  const accent     = ACCENT_CLASSES[culoareAccent] || ACCENT_CLASSES.indigo;
  const textAccent = accent.text;
  const bgAccent   = accent.bg;

  return (
    <section className="max-w-6xl mx-auto px-4 pb-12">
      <h2 className="text-xl font-black text-white mb-5">{titlu}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {produse.map((p) => {
          const hasPrice   = p.price > 0;
          const hasDiscount = hasPrice && p.discount_pct > 0 && p.old_price;
          const hasCod      = !!p.cod_cupon;

          return (
            <a
              key={`${p.merchant_slug}-${p.id}`}
              href={p.url}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className={`group bg-slate-900 border border-slate-800 ${accent.border} rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:shadow-black/30 hover:-translate-y-0.5 duration-200 flex flex-col`}
            >
              {/* Imagine */}
              <div className="relative bg-white aspect-square overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {hasDiscount && (
                  <div className={`absolute top-2 left-2 ${bgAccent} text-white text-xs font-black px-2 py-0.5 rounded-full`}>
                    -{p.discount_pct}%
                  </div>
                )}
                {!hasDiscount && hasCod && (
                  <div className="absolute top-2 left-2 bg-emerald-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                    COD
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3 flex flex-col flex-1">
                <p className="text-xs text-slate-500 mb-1 truncate">{p.brand || p.merchant}</p>
                <p className={`text-sm font-semibold text-slate-200 line-clamp-2 flex-1 ${accent.groupHoverText} transition-colors leading-snug`}>
                  {p.title}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {hasPrice ? (
                    <>
                      <span className={`font-black ${textAccent} text-base`}>
                        {p.price.toFixed(0)} lei
                      </span>
                      {hasDiscount && p.old_price && (
                        <span className="text-xs text-slate-500 line-through">
                          {p.old_price.toFixed(0)} lei
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Oferta activa
                    </span>
                  )}
                </div>
                <div className={`mt-2 text-xs font-bold ${textAccent} flex items-center gap-1`}>
                  {hasPrice ? "Cumpara acum" : "Vezi oferta"}
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
