"use client";

import { useState, useEffect, useCallback } from "react";

interface Promotie {
  cod_cupon: string;
  nume: string;
  landing_page: string;
}

interface Magazin {
  magazin: string;
  url_afiliat: string;
  promotii: Promotie[];
  are_promotie: boolean;
  cod_cupon: boolean;
}

interface AnuntItem {
  text: string;
  cod?: string;
  href: string;
  emoji: string;
}

const MESAJE_STATICE: AnuntItem[] = [
  { text: "300+ magazine partenere — coduri verificate zilnic", href: "/toate-magazinele", emoji: "🛍️" },
  { text: "Extensie Chrome disponibila — cod automat la checkout", href: "/extensie", emoji: "🧩" },
  { text: "Newsletter gratuit — top 5 oferte zilnic pe email", href: "/newsletter", emoji: "📬" },
];

export default function AnuntAnimat() {
  const [items, setItems] = useState<AnuntItem[]>(MESAJE_STATICE);
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    fetch("/nav-index.json")
      .then((r) => r.json())
      .then((data: Magazin[]) => {
        const promoItems: AnuntItem[] = [];
        // Top 8 magazine cu cod cupon
        const cuCod = data
          .filter((m) => m.cod_cupon && m.promotii.length > 0)
          .slice(0, 8);

        for (const m of cuCod) {
          const promo = m.promotii.find((p) => p.cod_cupon) || m.promotii[0];
          if (!promo) continue;
          const nume = m.magazin.split(".")[0].replace(/-/g, " ")
            .split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
          const discount = promo.nume?.match(/(\d+)\s*%/)?.[0];
          promoItems.push({
            text: discount
              ? `${nume} — ${discount} reducere cu cod`
              : `${nume} — cod reducere activ`,
            cod: promo.cod_cupon,
            href: promo.landing_page || m.url_afiliat || `/cod-reducere/${m.magazin}`,
            emoji: "🔥",
          });
        }

        // Numar real de magazine din nav-index.json (nu hardcodat)
        const totalMagazine = Array.isArray(data) ? data.length : 0;
        const statice: AnuntItem[] = totalMagazine > 0
          ? [
              { text: `${totalMagazine} magazine partenere — coduri verificate zilnic`, href: "/toate-magazinele", emoji: "🛍️" },
              ...MESAJE_STATICE.slice(1),
            ]
          : MESAJE_STATICE;

        setItems(promoItems.length >= 3 ? [...promoItems, ...statice] : statice);
      })
      .catch(() => {});
  }, []);

  const next = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setIdx((i) => (i + 1) % items.length);
      setVisible(true);
    }, 300);
  }, [items.length]);

  useEffect(() => {
    const t = setInterval(next, 4000);
    return () => clearInterval(t);
  }, [next]);

  const item = items[idx];

  return (
    <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-3 min-h-[34px]">
      {/* Mesaj rotativ */}
      <div
        className="flex items-center gap-2 transition-all duration-300"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-6px)" }}
      >
        <span className="text-sm">{item?.emoji}</span>
        <a
          href={item?.href ?? "/"}
          className="hover:underline truncate max-w-[280px] sm:max-w-none"
          rel={item?.href?.startsWith("http") ? "noopener noreferrer sponsored" : undefined}
          target={item?.href?.startsWith("http") ? "_blank" : undefined}
        >
          {item?.text}
          {item?.cod && (
            <span className="ml-1.5 bg-white/25 px-1.5 py-0.5 rounded font-black tracking-wider">
              {item.cod}
            </span>
          )}
        </a>
        <span className="hidden sm:inline text-white/60">→</span>
      </div>

      {/* Dots indicatori */}
      <div className="hidden sm:flex items-center gap-1 ml-2">
        {items.slice(0, Math.min(items.length, 8)).map((_, i) => (
          <button
            key={i}
            onClick={() => { setVisible(false); setTimeout(() => { setIdx(i); setVisible(true); }, 300); }}
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx % Math.min(items.length, 8) ? "bg-white" : "bg-white/35"}`}
            aria-label={`Anunt ${i + 1}`}
          />
        ))}
      </div>

      {/* Link Newsletter fix */}
      <a
        href="/newsletter"
        className="hidden md:inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2.5 py-0.5 rounded-full transition-colors shrink-0"
      >
        📬 Newsletter gratuit
      </a>
    </div>
  );
}
