"use client";

import Link from "next/link";

import { useWishlist } from "../hooks/useWishlist";
import { useEffect, useRef, useState } from "react";

export default function WishlistPage() {
  const { items, remove, priceDrops, actualizeazaPreturi } = useWishlist();

  // Pretul curent al produselor salvate, din acelasi feed ca /produse — o data pe vizita,
  // dupa ce lista s-a incarcat din localStorage. Fara el, „Pretul a scazut" nu apare aici.
  const actualizat = useRef(false);
  useEffect(() => {
    if (actualizat.current || items.length === 0) return;
    actualizat.current = true;
    fetch("/products.json")
      .then((r) => r.json())
      .then((d) => { const lista = d.products || d; if (Array.isArray(lista)) actualizeazaPreturi(lista); })
      .catch(() => {});
  }, [items.length, actualizeazaPreturi]);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  function formatPct(saved: number, current: number) {
    if (!saved || !current) return null;
    const diff = Math.round((saved - current) / saved * 100);
    return diff > 0 ? diff : null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <span className="text-3xl">&#10084;&#65039;</span>
          <div>
            <h1 className="text-2xl font-black text-[var(--foreground)]">Produsele mele salvate</h1>
            <p className="text-sm text-[var(--text-muted)]">{items.length} {items.length === 1 ? "produs salvat" : "produse salvate"}</p>
          </div>
        </div>

        {/* Price drop banner */}
        {priceDrops.length > 0 && (
          <div className="bg-[var(--surface)] border border-emerald-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <span className="text-2xl">&#127381;</span>
            <div>
              <p className="font-bold text-emerald-800">
                Pretul a scazut la {priceDrops.length} {priceDrops.length === 1 ? "produs" : "produse"} salvate!
              </p>
              <ul className="mt-1 space-y-0.5">
                {priceDrops.map((p) => {
                  const pct = formatPct(p.savedPrice, p.price);
                  return (
                    <li key={p.id} className="text-sm text-[var(--accent-text)]">
                      <span className="font-semibold">{p.title.slice(0, 50)}</span>
                      {" "}&mdash; era {p.savedPrice.toFixed(2)} lei, acum{" "}
                      <span className="font-black text-[var(--accent-text)]">{p.price.toFixed(2)} lei</span>
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
            <p className="text-lg font-bold text-[var(--text-soft)] mb-2">Niciun produs salvat inca</p>
            <p className="text-[var(--text-muted)] text-sm mb-6">
              Apasa iconita &#9825; pe orice produs din sectiunea Produse pentru a-l salva.
            </p>
            <Link href="/produse" className="inline-block bg-[#ddf93c] text-[#0c1000] font-bold px-6 py-3 rounded-xl hover:bg-[#ddf93c] transition-colors">
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
                <div key={item.id} className={`bg-[var(--surface)] rounded-xl border overflow-hidden flex flex-col relative
                    ${dropped ? "border-emerald-300 ring-2 ring-emerald-200" : "border-[var(--border)]"}`}>

                  {/* Badge pret scazut */}
                  {dropped && pct && (
                    <div className="absolute top-2 left-2 z-10 bg-[#ddf93c] text-[#0c1000] text-[10px] font-black px-2 py-0.5 rounded-full">
                      -{pct}% SCAZUT
                    </div>
                  )}

                  {/* Buton remove */}
                  <button
                    onClick={() => remove(item.id)}
                    className="absolute top-2 right-2 z-10 w-6 h-6 bg-[var(--surface-alt)] hover:bg-[var(--surface)] border border-[var(--border)] rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 transition-colors text-xs"
                    title="Sterge din lista"
                  >
                    &#x2715;
                  </button>

                  {/* Imagine */}
                  <a href={item.url} target="_blank" rel="sponsored noopener noreferrer">
                    <div className="aspect-square bg-[var(--surface)] flex items-center justify-center overflow-hidden">
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
                    <p className="text-[10px] text-[var(--text-soft)] truncate mb-0.5">{item.merchant}</p>
                    <p className="text-xs font-semibold text-[var(--text-soft)] line-clamp-2 leading-snug flex-1">{item.title}</p>

                    {/* Preturi */}
                    <div className="mt-2">
                      {item.price > 0 ? (
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className={`font-black text-sm ${dropped ? "text-[var(--accent-text)]" : "text-[var(--accent-text)]"}`}>
                            {item.price.toFixed(2)} lei
                          </span>
                          {dropped && (
                            <span className="text-[10px] text-[var(--text-soft)] line-through">
                              {item.savedPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--text-soft)]">Pret indisponibil</span>
                      )}
                      <p className="text-[9px] text-[var(--text-soft)] mt-0.5">
                        Salvat la {item.savedPrice.toFixed(2)} lei
                      </p>
                    </div>

                    <a
                      href={item.url} target="_blank" rel="sponsored noopener noreferrer"
                      className="mt-2 block text-center text-[10px] font-bold text-[#0c1000] bg-[#ddf93c] hover:bg-[#ddf93c] py-1.5 rounded-lg transition-colors"
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
