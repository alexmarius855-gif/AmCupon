"use client";

/**
 * CuponCard cu comportamentul complet, pentru paginile server fara parinte interactiv
 * (paginile de brand: /notino, /drmax, /noriel...).
 *
 * 07.10.2026: acolo codul se vedea INTREG pe card, fara niciun clic pe linkul platit — omul il
 * putea copia si cumpara direct de pe site-ul magazinului, deci fara comision — iar butonul
 * „Copiază și mergi" nu copia nimic, doar deschidea linkul. Acum e acelasi flux ca pe pagina de
 * magazin si pe prima pagina: codul ascuns pana la clic; clicul il copiaza si deschide magazinul
 * pe linkul platit (useCopyCod), iar dupa dezvaluire raman „Copiază" si „Mergi la X".
 */

import { useCallback, useState } from "react";
import CuponCard from "./CuponCard";
import { useCopyCod } from "../hooks/useCopyCod";
import type { PromotieCupon } from "@/lib/oferta";
import { trackAfiliat } from "@/lib/trackAfiliat";

export default function CuponInteractiv({ promo, numeMagazin, magazinSlug, logoSrc, link, sursa }: {
  promo: PromotieCupon;
  numeMagazin: string;
  magazinSlug: string;
  logoSrc?: string | null;
  /** Linkul platit al ofertei (linkPromotie) sau null — fara destinatie platita, fara buton de iesire. */
  link: string | null;
  /** Eticheta paginii in GA4 (ex. „brand"). */
  sursa: string;
}) {
  const track = useCallback((tip: string, mag: string, cod?: string) => trackAfiliat(`${tip}_${sursa}`, mag, cod), [sursa]);
  const { copiedKey, copyAndOpen } = useCopyCod(track);
  const [dezvaluit, setDezvaluit] = useState(false);
  const cod = (promo.cod_cupon || "").trim();

  return (
    <CuponCard
      promo={promo}
      numeMagazin={numeMagazin}
      logoSrc={logoSrc}
      link={link}
      dezvaluit={dezvaluit}
      copiat={copiedKey === "cod"}
      onDezvaluie={() => {
        setDezvaluit(true);
        copyAndOpen("cod", cod, link, magazinSlug);
      }}
      onIesire={() => track("iesire", magazinSlug, cod || undefined)}
    />
  );
}
