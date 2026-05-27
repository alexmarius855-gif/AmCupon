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
  brand: string;
  merchant: string;
  merchant_slug: string;
}

interface ProductsJson {
  products?: Produs[];
}

function getProduse(merchantSlugs: string[], limit = 12): Produs[] {
  const filePath = path.join(process.cwd(), "public", "products.json");
  if (!fs.existsSync(filePath)) return [];
  const raw: ProductsJson | Produs[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const all: Produs[] = Array.isArray(raw) ? raw : (raw.products ?? []);

  const filtrate = all.filter(p =>
    merchantSlugs.some(s => p.merchant_slug === s || p.merchant === s)
    && p.price > 0
    && p.image
    && p.title
  );

  // Produsele cu discount primul, restul dupa pret
  const cuDiscount = filtrate.filter(p => p.discount_pct > 0 && p.old_price);
  const farDiscount = filtrate.filter(p => !(p.discount_pct > 0 && p.old_price));
  cuDiscount.sort((a, b) => b.discount_pct - a.discount_pct);

  return [...cuDiscount, ...farDiscount].slice(0, limit);
}

export default function NisaProduse({
  merchantSlugs,
  titlu = "Produse populare",
  culoareAccent = "orange",
  limit = 12,
}: {
  merchantSlugs: string[];
  titlu?: string;
  culoareAccent?: string;
  limit?: number;
}) {
  const produse = getProduse(merchantSlugs, limit);
  if (produse.length === 0) return null;

  const hoverBorder = `hover:border-${culoareAccent}-300`;
  const textAccent  = `text-${culoareAccent}-600`;
  const bgAccent    = `bg-${culoareAccent}-500`;

  return (
    <section className="max-w-6xl mx-auto px-4 pb-12">
      <h2 className="text-xl font-black text-gray-900 mb-5">{titlu}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {produse.map((p) => {
          const hasDiscount = p.discount_pct > 0 && p.old_price;
          return (
            <a
              key={`${p.merchant_slug}-${p.id}`}
              href={p.url}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className={`group bg-white border border-gray-200 ${hoverBorder} rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 duration-200 flex flex-col`}
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
              </div>

              {/* Info */}
              <div className="p-3 flex flex-col flex-1">
                <p className="text-xs text-gray-400 mb-1 truncate">{p.brand || p.merchant}</p>
                <p className="text-sm font-semibold text-gray-900 line-clamp-2 flex-1 group-hover:text-orange-600 transition-colors leading-snug">
                  {p.title}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`font-black ${textAccent} text-base`}>
                    {p.price.toFixed(0)} lei
                  </span>
                  {hasDiscount && p.old_price && (
                    <span className="text-xs text-gray-400 line-through">
                      {p.old_price.toFixed(0)} lei
                    </span>
                  )}
                </div>
                <div className={`mt-2 text-xs font-bold ${textAccent} flex items-center gap-1`}>
                  Cumpără acum
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
