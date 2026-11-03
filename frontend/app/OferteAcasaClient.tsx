"use client";

import { useCallback, useState } from "react";
import CuponCard from "./components/CuponCard";
import RedirectModal from "./components/RedirectModal";
import { useCopyCod } from "./hooks/useCopyCod";
import { trackAfiliat } from "@/lib/trackAfiliat";
import type { PromotieCupon } from "@/lib/oferta";
import type { FiltruAcasa } from "@/lib/oferteAcasa";

/**
 * Grila de oferte de pe prima pagina: filtrele si dezvaluirea codului. E singura parte a paginii care
 * are nevoie de JavaScript (03.11.2026): restul e randat pe server, iar in browser ajung doar ofertele
 * afisate, nu toate cele ~950 de magazine.
 */
export interface OfertaCard {
  cheie: string;
  cod: string;
  link: string;
  magazin: string;
  nume: string;
  logo?: string | null;
  promo: PromotieCupon;
}

const ETICHETE: Record<FiltruAcasa, string> = {
  toate: "Toate", cod: "Cu cod", oferta: "Fără cod", curand: "Expiră curând",
};

export default function OferteAcasaClient({ oferte, liste, numere, filtre }: {
  oferte: Record<string, OfertaCard>;
  liste: Record<FiltruAcasa, string[]>;
  numere: Record<FiltruAcasa, number>;
  /** Doar filtrele care schimba ceva (lib/oferteAcasa.ts::filtreAfisate). */
  filtre: FiltruAcasa[];
}) {
  const [filtru, setFiltru] = useState<FiltruAcasa>("toate");
  const [dezvaluite, setDezvaluite] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<string | null>(null);
  const track = useCallback((tip: string, mag: string, cod?: string) => trackAfiliat(`${tip}_homepage`, mag, cod), []);
  const { copiedKey, redirectFailed, copyAndOpen, retryRedirect } = useCopyCod(track);

  return (
    <>
      {filtre.length > 0 && (
        <div className="cz-filtre" role="group" aria-label="Filtrează ofertele">
          {filtre.map((f) => (
            <button key={f} type="button" className="cz-f" aria-pressed={filtru === f} onClick={() => setFiltru(f)}>
              {ETICHETE[f]} <i>{numere[f]}</i>
            </button>
          ))}
        </div>
      )}
      <div className="cz-grid cz-grid--acasa">
        {liste[filtru].map((cheie) => {
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
              onIesire={() => trackAfiliat("codurile_zilei_homepage", o.magazin, o.cod)}
            />
          );
        })}
      </div>
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
