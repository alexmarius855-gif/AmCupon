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

export default function NisaProduse({
  merchantSlugs,
  catSlug = "",
  titlu = "Produse populare",
  culoareAccent = "orange",
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

  const textAccent = `text-${culoareAccent}-600`;
  const bgAccent   = `bg-${culoareAccent}-500`;

  return (
    <section className="max-w-6xl mx-auto px-4 pb-12">
      <h2 className="text-xl font-black text-gray-900 mb-5">{titlu}</h2>
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
              className={`group bg-white border border-gray-200 hover:border-${culoareAccent}-300 rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 duration-200 flex flex-col`}
            >
              {/* Imagine */}
              <div className="relative bg-gray-50 aspect-square overflow-hidden">
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
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                    COD
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3 flex flex-col flex-1">
                <p className="text-xs text-gray-400 mb-1 truncate">{p.brand || p.merchant}</p>
                <p className={`text-sm font-semibold text-gray-900 line-clamp-2 flex-1 group-hover:${textAccent} transition-colors leading-snug`}>
                  {p.title}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {hasPrice ? (
                    <>
                      <span className={`font-black ${textAccent} text-base`}>
                        {p.price.toFixed(0)} lei
                      </span>
                      {hasDiscount && p.old_price && (
                        <span className="text-xs text-gray-400 line-through">
                          {p.old_price.toFixed(0)} lei
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
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
