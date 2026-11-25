"use client";

import { useSyncExternalStore } from "react";
import { aziRomania } from "@/lib/momentBF";

const fara = () => () => {};

/**
 * „în 3 zile", „mâine", „azi" fata de data primita. Se calculeaza in browser: pagina e statica si se
 * construieste de trei ori pe zi, deci un numar scris in HTML ar fi gresit cateva ore dupa miezul
 * noptii. Pe server nu scrie nimic; data absoluta de langa el e deja in text.
 */
export default function ZilePana({ data }: { data: string }) {
  const azi = useSyncExternalStore(fara, () => aziRomania(), () => "");
  if (!azi) return null;
  const zile = Math.round((Date.parse(data) - Date.parse(azi)) / 86_400_000);
  if (zile < 0) return null;
  const text = zile === 0 ? "azi" : zile === 1 ? "mâine" : `în ${zile} ${zile >= 20 ? "de zile" : "zile"}`;
  return <span className="text-[var(--accent-text)]"> · {text}</span>;
}
