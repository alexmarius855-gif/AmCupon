"use client";

import { useState } from "react";

/** Logo pe cutie alba; daca nu se incarca sau lipseste, ramane numele, nu iconita de imagine rupta. */
export default function LogoMagazin({ src, nume, className = "" }: { src?: string | null; nume: string; className?: string }) {
  const [rupt, setRupt] = useState(false);
  if (!src || rupt) return <span className="text-xs font-black text-[#14181c] text-center leading-tight">{nume}</span>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" loading="lazy" decoding="async" className={className} onError={() => setRupt(true)} />;
}
