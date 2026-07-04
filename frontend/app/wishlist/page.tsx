"use client";

import Link from "next/link";

import { useWishlist } from "../hooks/useWishlist";
import { useState } from "react";

export default function WishlistPage() {
  const { items, remove, priceDrops } = useWishlist();
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  function formatPct(saved: number, current: number) {
    if (!saved || !current) return null;
    const diff = Math.round((saved - current) / saved * 100);
    return diff > 0 ? diff : null;
  }

  return (
    <div className="min-h-screen bg-[#0b0a07]">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <span className="text-3xl">&#10084;&#65039;</span>
          <div>
            <h1 className="text-2xl font-black text-[#15120c]">Produsele mele salvate</h1>
            <p className="text-sm text-[#8c8064]">{items.length} {items.length === 1 ? "produs salvat" : "produse salvate"}</p>
          </div>
        </div>

        {/* Price drop banner */}
        {priceDrops.length > 0 && (
          <div className="bg-[#15120c] border border-emerald-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <span className="text-2xl">&#127381;</span>
            <div>
              <p className="font-bold text-emerald-800">
                Pretul a scazut la {priceDrops.length} {priceDrops.length === 1 ? "produs" : "produse"} salvate!
              </p>
              <ul className="mt-1 space-y-0.5">
                {priceDrops.map((p) => {
                  const pct = formatPct(p.savedPrice, p.price);
                  return (
                    <li key={p.id} className="text-sm text-[#e3d1a6]">
                      <span className="font-semibold">{p.title.slice(0, 50)}</span>
                      {" "}&mdash; era {p.savedPrice.toFixed(2)} lei, acum{" "}
                      <span className="font-black text-[#d8c091]">{p.price.toFixed(2)} lei</span>
                      {pct && <span className="ml-1 text-xs bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">-{pct}%</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        {/* Empty state */}
        {items.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">&#128722;</div>
            <p className="text-lg font-bold text-[#37301f] mb-2">Niciun produs salvat inca</p>
            <p className="text-[#8c8064] text-sm mb-6">
              Apasa iconita &#9825; pe orice produs din sectiunea Produse pentru a-l salva.
            </p>
            <Link href="/produse" className="inline-block bg-[#b8912e] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#c9a63e] transition-colors">
              Exploreaza produse
            </Link>
          </div>
        )}

        {/* Grid produse */}
        {items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item) => {
              const pct      = formatPct(item.savedPrice, item.price);
              const imgFail  = imgErrors.has(item.id);
              const dropped  = item.price > 0 && item.savedPrice > 0 && item.price < item.savedPrice;

              return (
                <div key={item.id} className={`bg-[#15120c] rounded-2xl border overflow-hidden flex flex-col relative
                    ${dropped ? "border-emerald-300 ring-2 ring-emerald-200" : "border-[#26211a]"}`}>

                  {/* Badge pret scazut */}
                  {dropped && pct && (
                    <div className="absolute top-2 left-2 z-10 bg-[#b8912e] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      -{pct}% SCAZUT
                    </div>
                  )}

                  {/* Buton remove */}
                  <button
                    onClick={() => remove(item.id)}
                    className="absolute top-2 right-2 z-10 w-6 h-6 bg-white/90 hover:bg-[#15120c] border border-[#26211a] rounded-full flex items-center justify-center text-[#8c8064] hover:text-red-400 transition-colors text-xs"
                    title="Sterge din lista"
                  >
                    &#x2715;
                  </button>

                  {/* Imagine */}
                  <a href={item.url} target="_blank" rel="sponsored noopener noreferrer">
                    <div className="aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
                      {item.image && !imgFail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image} alt={item.title} loading="lazy"
                          className="w-full h-full object-contain p-2"
                          onError={() => setImgErrors(s => new Set([...s, item.id]))}
                        />
                      ) : (
                        <span className="text-4xl">&#128722;</span>
                      )}
                    </div>
                  </a>

                  {/* Info */}
                  <div className="p-2 flex flex-col flex-1">
                    <p className="text-[10px] text-[#a89a78] truncate mb-0.5">{item.merchant}</p>
                    <p className="text-xs font-semibold text-[#26211a] line-clamp-2 leading-snug flex-1">{item.title}</p>

                    {/* Preturi */}
                    <div className="mt-2">
                      {item.price > 0 ? (
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className={`font-black text-sm ${dropped ? "text-[#d8c091]" : "text-[#e3d1a6]"}`}>
                            {item.price.toFixed(2)} lei
                          </span>
                          {dropped && (
                            <span className="text-[10px] text-[#a89a78] line-through">
                              {item.savedPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-[#a89a78]">Pret indisponibil</span>
                      )}
                      <p className="text-[9px] text-[#c8bda2] mt-0.5">
                        Salvat la {item.savedPrice.toFixed(2)} lei
                      </p>
                    </div>

                    <a
                      href={item.url} target="_blank" rel="sponsored noopener noreferrer"
                      className="mt-2 block text-center text-[10px] font-bold text-white bg-[#b8912e] hover:bg-[#c9a63e] py-1.5 rounded-lg transition-colors"
                    >
                      Cumpara acum
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
