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
export function useCopyCod(track?: TrackFn) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [redirectFailed, setRedirectFailed] = useState(false);
  const [lastLink, setLastLink] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copyAndOpen = useCallback((key: string, cod: string, link: string | undefined, magazinSlug: string) => {
    navigator.clipboard.writeText(cod).catch(() => {});
    setCopiedKey(key);
    setRedirectFailed(false);
    setLastLink(link ?? null);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopiedKey(null), 3000);

    track?.("copiere_cod", magazinSlug, cod);

    if (link) {
      const win = window.open(link, "_blank", "noopener,noreferrer");
      if (!win) setRedirectFailed(true);
    }
  }, [track]);

  const retryRedirect = useCallback(() => {
    if (lastLink) {
      const win = window.open(lastLink, "_blank", "noopener,noreferrer");
      if (win) setRedirectFailed(false);
    }
  }, [lastLink]);

  return { copiedKey, redirectFailed, lastLink, copyAndOpen, retryRedirect };
}
