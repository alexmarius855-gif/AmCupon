"use client";

/**
 * useWishlist — Price alerts via localStorage
 * Salveaza produse + pretul la momentul salvarii.
 * La urmatoarea vizita compara pretul curent cu cel salvat.
 */

import { useState, useEffect, useCallback } from "react";

export interface WishlistItem {
  id:         string;   // url_original ca cheie unica
  title:      string;
  url:        string;   // link afiliat
  image:      string;
  price:      number;
  savedPrice: number;   // pretul la momentul salvarii
  merchant:   string;
  savedAt:    number;   // timestamp
}

const KEY = "amcupon_wishlist";

function getStored(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function setStored(items: WishlistItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // fereastra privata / stocare blocata: lista ramane doar pentru vizita curenta
  }
}

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    setItems(getStored());
  }, []);

  const isSaved = useCallback((id: string) => {
    return items.some((i) => i.id === id);
  }, [items]);

  const toggle = useCallback((item: Omit<WishlistItem, "savedPrice" | "savedAt">) => {
    setItems((prev) => {
      const exists = prev.findIndex((i) => i.id === item.id);
      let next: WishlistItem[];
      if (exists >= 0) {
        next = prev.filter((_, idx) => idx !== exists);
      } else {
        next = [...prev, { ...item, savedPrice: item.price, savedAt: Date.now() }];
      }
      setStored(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      setStored(next);
      return next;
    });
  }, []);

  /**
   * Pretul CURENT, din feed (products.json). Pana pe 07.10.2026 nimic nu-l actualiza:
   * `price` ramanea cel de la salvare, identic cu `savedPrice`, deci „Pretul a scazut" nu
   * putea aparea niciodata, desi butonul de pe /produse promitea alerta de pret. Cheile sunt
   * cele folosite la salvare: `url_original` (/produse), `url` (/produse/[categorie]) si
   * `merchant-titlu` (fallback-ul din /produse).
   */
  const actualizeazaPreturi = useCallback((produse: { url?: string; url_original?: string; merchant?: string; title?: string; price?: number }[]) => {
    const curent = new Map<string, number>();
    for (const p of produse) {
      if (!p.price || p.price <= 0) continue;
      if (p.url_original) curent.set(p.url_original, p.price);
      if (p.url) curent.set(p.url, p.price);
      curent.set(`${p.merchant}-${p.title}`, p.price);
    }
    setItems((prev) => {
      let schimbat = false;
      const next = prev.map((i) => {
        const pret = curent.get(i.id);
        if (pret === undefined || pret === i.price) return i;
        schimbat = true;
        return { ...i, price: pret };
      });
      if (!schimbat) return prev;
      setStored(next);
      return next;
    });
  }, []);

  // Produse cu pret scazut fata de momentul salvarii
  const priceDrops = items.filter(
    (i) => i.price > 0 && i.savedPrice > 0 && i.price < i.savedPrice
  );

  return { items, isSaved, toggle, remove, priceDrops, actualizeazaPreturi };
}
