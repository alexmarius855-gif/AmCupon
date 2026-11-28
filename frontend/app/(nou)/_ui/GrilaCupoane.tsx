"use client";

import { useCallback, useEffect, useState } from "react";
import Cupon from "./Cupon";
import { IconBifa, IconX } from "./Iconite";
import { useCopyCod } from "@/app/_comun/useCopyCod";
import { trackAfiliat } from "@/lib/trackAfiliat";
import type { FiltruAcasa } from "@/lib/oferteAcasa";
import type { GrilaDate } from "@/lib/grilaOferte";

/**
 * Grila de cupoane a noului site. Datele le pregateste serverul (lib/grilaOferte.ts, aceeasi ordine ca pe vechiul
 * site: partenerii .ro cu link platit intai); in browser ajung doar ofertele afisate. Comportamentul banilor e cel
 * vechi, neschimbat: useCopyCod (copiere + tab nou pe linkul platit, in acelasi clic, cu sub-id si numaratoare).
 * In locul ferestrei de confirmare, un mesaj mic jos, care nu acopera pagina.
 */
const ETICHETE: Record<FiltruAcasa, string> = { toate: "Toate", cod: "Cu cod", oferta: "Fără cod", curand: "Expiră curând" };

function Confirmare({ magazin, blocat, onRetry, onClose }: { magazin: string; blocat: boolean; onRetry: () => void; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const t = blocat ? null : window.setTimeout(onClose, 4500);
    return () => { if (t) window.clearTimeout(t); window.removeEventListener("keydown", onKey); };
  }, [blocat, onClose]);
  return (
    <div className="confirmare" role="status">
      <IconBifa className="bifa" />
      <div>
        <b>Cod copiat</b>
        <p>{blocat ? "Browserul a oprit tabul nou. Deschide magazinul de aici:" : `Magazinul ${magazin} s-a deschis într-un tab nou. Lipește codul la plată.`}</p>
        {blocat && <button type="button" className="buton" onClick={onRetry}>Mergi la {magazin}</button>}
      </div>
      <button type="button" onClick={onClose} aria-label="Închide"><IconX /></button>
    </div>
  );
}

export default function GrilaCupoane({ oferte, liste, numere, filtre, sursa }: GrilaDate & { sursa: string }) {
  const [filtru, setFiltru] = useState<FiltruAcasa>("toate");
  const [dezvaluite, setDezvaluite] = useState<Set<string>>(new Set());
  const [mesaj, setMesaj] = useState<string | null>(null);
  const track = useCallback((tip: string, mag: string, cod?: string) => trackAfiliat(`${tip}_${sursa}`, mag, cod), [sursa]);
  const { copiedKey, redirectFailed, copyAndOpen, retryRedirect } = useCopyCod(track);
  const inchide = useCallback(() => setMesaj(null), []);

  return (
    <>
      {filtre.length > 0 && (
        <div className="filtre" role="group" aria-label="Filtrează ofertele">
          {filtre.map((f) => (
            <button key={f} type="button" className="chip" aria-pressed={filtru === f} onClick={() => setFiltru(f)}>
              {ETICHETE[f]} <small>{numere[f]}</small>
            </button>
          ))}
        </div>
      )}
      <div className="grila-cupoane">
        {liste[filtru].map((cheie) => {
          const o = oferte[cheie];
          return (
            <Cupon
              key={cheie}
              o={o}
              dezvaluit={dezvaluite.has(cheie)}
              copiat={copiedKey === cheie}
              onDezvaluie={() => {
                setDezvaluite((prev) => new Set(prev).add(cheie));
                setMesaj(o.nume);
                copyAndOpen(cheie, o.cod, o.link, o.magazin);
              }}
              onIesire={() => trackAfiliat(`iesire_${sursa}`, o.magazin, o.cod)}
            />
          );
        })}
      </div>
      {mesaj && <Confirmare magazin={mesaj} blocat={redirectFailed} onRetry={retryRedirect} onClose={inchide} />}
    </>
  );
}
