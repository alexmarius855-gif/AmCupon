"use client";

import { useCallback, useRef, useState } from "react";

interface TrackFn {
  (tip: string, magazinSlug: string, cod?: string): void;
}

/**
 * Unifica logica de "copiaza codul + deschide magazinul" — dublata inainte separat
 * in MagazinCard.tsx si MagazinClient.tsx (comportamente usor diferite: unul copia
 * fara sa deschida tab-ul, celalalt deschidea sincron). Acum: copy + open sincron,
 * peste tot la fel, plus detectare reala daca popup-ul a fost blocat (semnal real,
 * nu presupus) — RedirectModal.tsx foloseste asta pt un buton de retry.
 *
 * IMPORTANT: window.open() ramane SINCRON, in acelasi tick cu click handler-ul —
 * altfel browserul il blocheaza (comentariu original din MagazinClient.tsx:210-211,
 * pastrat aici ca sursa de adevar).
 */
/**
 * Deschide linkul intr-un tab nou si spune DACA s-a deschis.
 *
 * 23.09.2026: era `window.open(link, "_blank", "noopener,noreferrer")`. Dupa specificatia
 * HTML, cu `noopener` (implicat si de `noreferrer`) window.open intoarce MEREU null — deci
 * `if (!win) setRedirectFailed(true)` se declansa la FIECARE dezvaluire de cod, desi tab-ul
 * se deschisese. Modalul spunea „Browserul a blocat tab-ul nou" si oferea „Mergi la X",
 * care deschidea AL DOILEA tab pe acelasi link platit: click dublu raportat retelei, pe tot
 * site-ul. Fara `noopener` in argumente primim fereastra reala, deci detectam blocarea
 * adevarata, iar legatura inapoi spre pagina noastra o taiem manual (`opener = null`).
 */
function deschideTab(link: string): boolean {
  const win = window.open(link, "_blank");
  if (!win) return false;
  try { win.opener = null; } catch { /* unele browsere nu permit — tab-ul e deschis oricum */ }
  return true;
}

export function useCopyCod(track?: TrackFn) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [redirectFailed, setRedirectFailed] = useState(false);
  const [lastLink, setLastLink] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // `link` accepta si null: magazinele fara link afiliat n-au unde trimite omul. Codul se
  // copiaza oricum (ii e util), dar nu deschidem un click nemonetizat. Corpul functiei
  // trata deja cazul lipsa — doar tipul era prea ingust. Vezi lib/linkMagazin.ts.
  const copyAndOpen = useCallback((key: string, cod: string, link: string | undefined | null, magazinSlug: string) => {
    navigator.clipboard.writeText(cod).catch(() => {});
    setCopiedKey(key);
    setRedirectFailed(false);
    setLastLink(link ?? null);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopiedKey(null), 3000);

    track?.("copiere_cod", magazinSlug, cod);

    if (link) {
      if (!deschideTab(link)) setRedirectFailed(true);
    }
  }, [track]);

  const retryRedirect = useCallback(() => {
    if (lastLink) {
      if (deschideTab(lastLink)) setRedirectFailed(false);
    }
  }, [lastLink]);

  return { copiedKey, redirectFailed, lastLink, copyAndOpen, retryRedirect };
}
