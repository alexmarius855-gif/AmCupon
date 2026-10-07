"use client";

import { useState, useEffect, useCallback } from "react";
import { maskCod } from "@/lib/maskCod";
import { numeAfisat } from "@/lib/numeMagazin";
import { titluPromotie } from "@/lib/oferta";

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
  /** ales de scripts/generate_homepage_data.py: partener romanesc, promotie activa, link platit */
  ticker?: boolean;
}

interface AnuntItem {
  text: string;
  cod?: string;
  href: string;
  emoji: string;
}

const MESAJE_STATICE: AnuntItem[] = [
  // Fara numar hardcodat: numarul REAL vine din nav-index.json in useEffect-ul de mai
  // jos. Inainte scria "300+" (stale de luni de zile, cand site-ul are 1177) si asta
  // era exact textul pe care Google il vedea in HTML-ul server-side, pe FIECARE pagina.
  { text: "Magazine partenere — coduri actualizate zilnic", href: "/toate-magazinele", emoji: "🛍️" },
  { text: "Extensie Chrome — in curs de lansare, anunta-te acum", href: "/extensie", emoji: "🧩" },
  // „top 5 oferte zilnic" era fals: send_newsletter.py trimite pana la 20 (--n 20), o data pe zi.
  { text: "Newsletter gratuit — ofertele zilei, o dată pe zi pe email", href: "/newsletter", emoji: "📬" },
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
        // 06.10.2026: „primele 8 magazine cu cod" insemna 23 de magazine straine din 24 (hoteluri
        // din Spania si Hong Kong, tvcmall), promotii in engleza si codul INTREG pe fiecare pagina.
        // Acum: partenerii romanesti alesi de generate_homepage_data.py (`ticker`), cei cu cod
        // primii; textul e numele promotiei, cum l-a scris magazinul — fara reformulari care ar
        // putea exagera („-20% la colectia Puma" nu devine „20% reducere"); codul, mascat; linkul,
        // spre pagina magazinului, unde codul se vede intreg si clicul trece prin linkul afiliat.
        const alese = data
          .filter((m) => m.ticker && m.promotii.length > 0)
          .sort((a, b) => Number(!!b.promotii[0]?.cod_cupon) - Number(!!a.promotii[0]?.cod_cupon))
          .slice(0, 8);

        for (const m of alese) {
          const promo = m.promotii[0];
          promoItems.push({
            // Titlul afisat (lib/oferta.ts): la Impact `nume` e des chiar codul, iar aici s-ar citi intreg.
            text: `${numeAfisat(m.magazin)}: ${titluPromotie(promo, numeAfisat(m.magazin))}`,
            cod: promo.cod_cupon ? maskCod(promo.cod_cupon) : undefined,
            href: `/cod-reducere/${m.magazin}`,
            emoji: "🔥",
          });
        }

        // Numar real de magazine din nav-index.json, rotunjit IN JOS la suta (ca pesteMagazine()
        // din lib/cifreSite.ts). „958 magazine partenere" era fals: 19 n-au link platit.
        const totalMagazine = Array.isArray(data) ? data.length : 0;
        const sute = Math.floor(totalMagazine / 100) * 100;
        const statice: AnuntItem[] = totalMagazine >= 100
          ? [
              { text: `${totalMagazine > sute ? `Peste ${sute}` : sute} de magazine — oferte actualizate zilnic`, href: "/toate-magazinele", emoji: "🛍️" },
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
    <div className="bg-[#14181c] border-b border-[#1f2329] text-[#c9ced5] text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-3 min-h-[34px]">
      {/* Mesaj rotativ */}
      <div
        className="flex items-center gap-2 min-w-0 transition-all duration-300"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-6px)" }}
      >
        <span className="text-sm">{item?.emoji}</span>
        {/* Textul se taie cu „…", badge-ul cu codul nu: numele promotiilor vin din retea si pot fi lungi. */}
        <a
          href={item?.href ?? "/"}
          className="hover:underline flex items-center gap-1.5 min-w-0"
          rel={item?.href?.startsWith("http") ? "noopener noreferrer sponsored" : undefined}
          target={item?.href?.startsWith("http") ? "_blank" : undefined}
        >
          <span className="truncate max-w-[230px] sm:max-w-[520px]">{item?.text}</span>
          {item?.cod && (
            <span className="shrink-0 bg-[#ddf93c] text-[#0c1000] px-1.5 py-0.5 rounded font-black tracking-wider">
              {item.cod}
            </span>
          )}
        </a>
        <span className="hidden sm:inline text-[#9399a0]">→</span>
      </div>

      {/* Dots indicatori */}
      <div className="hidden sm:flex items-center gap-1 ml-2">
        {items.slice(0, Math.min(items.length, 8)).map((_, i) => (
          <button
            key={i}
            onClick={() => { setVisible(false); setTimeout(() => { setIdx(i); setVisible(true); }, 300); }}
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx % Math.min(items.length, 8) ? "bg-[#ddf93c]" : "bg-[#2a2f36]"}`}
            aria-label={`Anunt ${i + 1}`}
          />
        ))}
      </div>

      {/* Link Newsletter fix */}
      <a
        href="/newsletter"
        className="hidden md:inline-flex items-center gap-1 bg-[#ddf93c]/15 border border-[#ddf93c]/30 text-[#c3dd2c] hover:bg-[#ddf93c]/25 px-2.5 py-0.5 rounded-full transition-colors shrink-0"
      >
        📬 Newsletter gratuit
      </a>
    </div>
  );
}
