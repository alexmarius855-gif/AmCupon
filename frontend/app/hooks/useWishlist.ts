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
  localStorage.setItem(KEY, JSON.stringify(items));
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

  // Produse cu pret scazut fata de momentul salvarii
  const priceDrops = items.filter(
    (i) => i.price > 0 && i.savedPrice > 0 && i.price < i.savedPrice
  );

  return { items, isSaved, toggle, remove, priceDrops };
}
