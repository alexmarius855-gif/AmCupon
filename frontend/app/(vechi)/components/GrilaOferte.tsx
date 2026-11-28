"use client";

import { useCallback, useState } from "react";
import CuponCard from "./CuponCard";
import RedirectModal from "./RedirectModal";
import { useCopyCod } from "@/app/_comun/useCopyCod";
import { trackAfiliat } from "@/lib/trackAfiliat";
import type { FiltruAcasa } from "@/lib/oferteAcasa";
import type { GrilaDate } from "@/lib/grilaOferte";

/**
 * Grila de oferte: filtrele si dezvaluirea codului. Datele le pregateste serverul (lib/grilaOferte.ts); e singura
 * parte a paginilor de oferte care are nevoie de JavaScript (03.11.2026), iar in browser ajung doar ofertele afisate.
 */
const ETICHETE: Record<FiltruAcasa, string> = {
  toate: "Toate", cod: "Cu cod", oferta: "Fără cod", curand: "Expiră curând",
};

export default function GrilaOferte({ oferte, liste, numere, filtre, sursa, scurtPeTelefon = false, pas = 0 }: GrilaDate & {
  /** Eticheta paginii in GA4 (ex. „homepage"). */
  sursa: string;
  /** Primele 8 pe telefon (.cz-grid--acasa); restul e la un clic, pe o pagina cu toate ofertele. */
  scurtPeTelefon?: boolean;
  /** Cate carduri se adauga la un clic pe „Arată încă"; 0 = toate deodata. */
  pas?: number;
}) {
  const [filtru, setFiltru] = useState<FiltruAcasa>("toate");
  const [vizibile, setVizibile] = useState(pas);
  const lista = pas > 0 ? liste[filtru].slice(0, vizibile) : liste[filtru];
  const ramase = liste[filtru].length - lista.length;
  const [dezvaluite, setDezvaluite] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<string | null>(null);
  const track = useCallback((tip: string, mag: string, cod?: string) => trackAfiliat(`${tip}_${sursa}`, mag, cod), [sursa]);
  const { copiedKey, redirectFailed, copyAndOpen, retryRedirect } = useCopyCod(track);

  return (
    <>
      {filtre.length > 0 && (
        <div className="cz-filtre" role="group" aria-label="Filtrează ofertele">
          {filtre.map((f) => (
            <button key={f} type="button" className="cz-f" aria-pressed={filtru === f} onClick={() => { setFiltru(f); setVizibile(pas); }}>
              {ETICHETE[f]} <i>{numere[f]}</i>
            </button>
          ))}
        </div>
      )}
      <div className={scurtPeTelefon ? "cz-grid cz-grid--acasa" : "cz-grid"}>
        {lista.map((cheie) => {
          const o = oferte[cheie];
          return (
            <CuponCard
              key={cheie}
              promo={o.promo}
              numeMagazin={o.nume}
              logoSrc={o.logo}
              link={o.link}
              dezvaluit={dezvaluite.has(cheie)}
              copiat={copiedKey === cheie}
              onDezvaluie={() => {
                setDezvaluite((prev) => new Set(prev).add(cheie));
                setModal(o.nume);
                copyAndOpen(cheie, o.cod, o.link, o.magazin);
              }}
              onIesire={() => trackAfiliat(`iesire_${sursa}`, o.magazin, o.cod)}
            />
          );
        })}
      </div>
      {ramase > 0 && (
        <button type="button" onClick={() => setVizibile((v) => v + pas)} className="mt-4 w-full border border-[var(--border-strong)] hover:border-[var(--accent-text)]/60 text-[var(--foreground)] rounded-xl py-3 text-sm font-bold transition-colors">
          Arată încă {Math.min(pas, ramase)} (mai sunt {ramase})
        </button>
      )}
      <RedirectModal
        open={modal !== null}
        onClose={() => setModal(null)}
        storeName={modal || ""}
        redirectFailed={redirectFailed}
        onRetry={retryRedirect}
      />
    </>
  );
}
