"use client";

import { cuNumar } from "@/lib/acordNumeral";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { numeAfisat } from "@/lib/numeMagazin";
import { CATEGORII_SITE } from "@/lib/site";
import LogoMagazin from "../components/LogoMagazin";

/**
 * Directorul magazinelor, remodelat pe 03.11.2026. Masurat inainte: 80.303 px pe telefon si 4.477 de elemente, cate un
 * card mare pentru fiecare magazin, iar in HTML ajungea tot output.json (inclusiv comisionul, care nu se publica).
 * Acum: magazinele cu oferte si cele din Romania primele, 60 de cutii compacte + „Arată încă". Lista A–Z de la final
 * pastreaza in HTML linkul spre fiecare magazin. page.tsx trimite doar campurile de mai jos.
 */
export interface MagazinDirector {
  magazin: string;
  logo_url?: string;
  categorie_slug?: string;
  are_promotie: boolean;
  cod_cupon: boolean;
  /** Cel mai mare procent din ofertele magazinului, calculat pe server; 0 cand nu e niciunul. */
  pct: number;
}

const PAS = 60;
const dinRo = (s: string) => s.endsWith(".ro") || s.startsWith("ro.");

const buton = (activ: boolean) =>
  `px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
    activ
      ? "bg-[#ddf93c] text-[#0c1000]"
      : "bg-[var(--surface-alt)] border border-[var(--border-strong)] text-[var(--text-soft)] hover:text-[var(--foreground)]"
  }`;

export default function ToateMagazineleClient({ magazine }: { magazine: MagazinDirector[] }) {
  const [cautare, setCautare] = useState("");
  const [categorie, setCategorie] = useState("");
  const [filtru, setFiltru] = useState<"toate" | "cod" | "promotie">("toate");
  const [limita, setLimita] = useState(PAS);

  // Citeste ?q= din URL la mount (permite link direct cu search pre-completat)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (q) setCautare(q);
  }, []);

  const filtrate = useMemo(() => {
    const q = cautare.toLowerCase();
    return magazine
      .filter((m) => !q || m.magazin.toLowerCase().includes(q) || numeAfisat(m.magazin).toLowerCase().includes(q))
      .filter((m) => !categorie || m.categorie_slug === categorie)
      .filter((m) => (filtru === "cod" ? m.cod_cupon : filtru === "promotie" ? m.are_promotie : true))
      .sort((a, b) =>
        Number(b.are_promotie) - Number(a.are_promotie) ||
        Number(dinRo(b.magazin)) - Number(dinRo(a.magazin)) ||
        b.pct - a.pct ||
        numeAfisat(a.magazin).localeCompare(numeAfisat(b.magazin), "ro"));
  }, [magazine, cautare, categorie, filtru]);

  const categorii = CATEGORII_SITE.filter((c) => magazine.some((m) => m.categorie_slug === c.slug));
  const cuPromotii = magazine.filter((m) => m.are_promotie).length;
  const cuCod = magazine.filter((m) => m.cod_cupon).length;
  const faraFiltru = !cautare && !categorie && filtru === "toate";

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-10">
        <h1 className="text-[1.75rem] md:text-4xl font-black tracking-tight leading-tight mb-2">Toate magazinele cu reduceri</h1>
        <p className="text-[var(--text-soft)] mb-4">
          {cuNumar(magazine.length, "magazin partener", "magazine partenere")}, {cuPromotii} cu oferte active, {cuCod} cu cod.
        </p>

        <div className="relative max-w-xl mb-4">
          <input
            type="search"
            aria-label="Caută un magazin"
            placeholder="Caută un magazin: Notino, Answear, Noriel..."
            value={cautare}
            onChange={(e) => { setCautare(e.target.value); setLimita(PAS); }}
            className="w-full bg-[var(--surface-alt)] rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#ddf93c]/50 border border-[var(--border-strong)] placeholder-[var(--text-muted)]"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-2">
          {([["toate", "Toate"], ["promotie", "Cu oferte"], ["cod", "Cu cod"]] as const).map(([f, eticheta]) => (
            <button key={f} type="button" aria-pressed={filtru === f} onClick={() => { setFiltru(f); setLimita(PAS); }} className={buton(filtru === f)}>
              {eticheta}
            </button>
          ))}
        </div>
        <div className="-mx-4 px-4 mb-5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          <div className="flex gap-2 min-w-max">
            <button type="button" aria-pressed={!categorie} onClick={() => { setCategorie(""); setLimita(PAS); }} className={buton(!categorie)}>Toate categoriile</button>
            {categorii.map((c) => (
              <button key={c.slug} type="button" aria-pressed={categorie === c.slug} onClick={() => { setCategorie(c.slug); setLimita(PAS); }} className={buton(categorie === c.slug)}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-[var(--text-muted)] mb-3">{cuNumar(filtrate.length, "magazin", "magazine")}</p>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
          {filtrate.slice(0, limita).map((m) => {
            const nume = numeAfisat(m.magazin);
            return (
              <Link key={m.magazin} href={`/cod-reducere/${m.magazin}`} className="group bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] rounded-xl p-2.5 flex flex-col items-center gap-1.5 transition-colors">
                <span className="w-full h-12 rounded-lg bg-[#ffffff] p-1.5 flex items-center justify-center overflow-hidden">
                  <LogoMagazin src={m.logo_url} nume={nume} className="max-w-full max-h-full object-contain" />
                </span>
                <span className="text-[11px] font-semibold text-[var(--text-soft)] group-hover:text-[var(--foreground)] text-center leading-tight line-clamp-2">{nume}</span>
                {m.pct > 0 ? (
                  <span className="text-[10px] font-black text-[#0c1000] bg-[#ddf93c] px-2 py-0.5 rounded-full">până la {m.pct}%</span>
                ) : m.cod_cupon ? (
                  <span className="text-[10px] font-bold text-[var(--accent-text)]">Cod</span>
                ) : m.are_promotie ? (
                  <span className="text-[10px] font-semibold text-[var(--accent-text)]">Ofertă</span>
                ) : null}
              </Link>
            );
          })}
        </div>

        {filtrate.length > limita && (
          <button type="button" onClick={() => setLimita((l) => l + PAS)} className="mt-4 w-full border border-[var(--border-strong)] hover:border-[var(--accent-text)]/60 rounded-xl py-3 text-sm font-bold transition-colors">
            Arată încă {Math.min(PAS, filtrate.length - limita)} (mai sunt {filtrate.length - limita})
          </button>
        )}

        {filtrate.length === 0 && (
          <div className="text-center py-16">
            <p className="font-bold text-lg text-[var(--text-soft)]">Niciun magazin găsit</p>
            <button type="button" onClick={() => { setCautare(""); setCategorie(""); setFiltru("toate"); }} className="mt-3 text-[var(--accent-text)] text-sm font-bold">
              Șterge filtrele
            </button>
          </div>
        )}

        {faraFiltru && (
          <details className="mt-8 border-t border-[var(--border)] pt-5">
            <summary className="cursor-pointer text-sm font-bold text-[var(--accent-text)]">Lista A–Z, toate cele {cuNumar(magazine.length, "magazin", "magazine")}</summary>
            <ul className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-1 text-xs">
              {[...magazine].sort((a, b) => numeAfisat(a.magazin).localeCompare(numeAfisat(b.magazin), "ro")).map((m) => (
                <li key={m.magazin} className="truncate"><Link href={`/cod-reducere/${m.magazin}`} className="text-[var(--text-soft)] hover:text-[var(--accent-text)]">{numeAfisat(m.magazin)}</Link></li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}
