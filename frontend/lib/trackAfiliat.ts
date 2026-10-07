/**
 * Evenimentul GA4 `affiliate_click` pentru clicurile care NU sunt pe un <a> — dezvaluirea unui cod
 * deschide magazinul cu window.open, deci AffiliateClickTracker (care prinde doar <a>) nu-l vede.
 * Aceiasi parametri ca acolo si ca pe pagina de magazin; invelit in try/catch: un clic nu are voie
 * sa se rupa din cauza masurarii.
 */
export function trackAfiliat(tip: string, magazin: string, cod?: string): void {
  try {
    const g = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
    g?.("event", "affiliate_click", {
      event_category: "afiliere",
      event_label: magazin,
      affiliate_type: tip,
      coupon_code: cod || "",
      value: 1,
    });
  } catch {}
}
