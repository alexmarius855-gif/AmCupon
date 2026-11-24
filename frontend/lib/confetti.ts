/**
 * Confetti peste caseta codului, cand omul copiaza un cod (24.11.2026, „site interactiv, cu animatii").
 *
 * Fara biblioteca: 18 bucati de DOM animate din CSS (globals.css, `.am-confetti`), sterse dupa o secunda.
 * Nimic la „miscare redusa". Dezvaluirea codului deschide magazinul in alt tab, deci pagina noastra e de obicei
 * in spate in clipa aia: atunci explozia asteapta ca omul sa se intoarca (cel mult doua minute), cand chiar o vede.
 */
const CULORI = ["#ddf93c", "#ecff7a", "#10b981", "#ffffff", "#c3dd2c"];

function explozie(tinta: Element, bucati: number): void {
  const r = tinta.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return;
  const strat = document.createElement("div");
  strat.className = "am-confetti";
  strat.setAttribute("aria-hidden", "true");
  strat.style.left = `${r.left + r.width / 2}px`;
  strat.style.top = `${r.top + r.height / 2}px`;
  for (let i = 0; i < bucati; i++) {
    const p = document.createElement("i");
    const unghi = (Math.PI * 2 * i) / bucati + (Math.random() - 0.5) * 0.5;
    const dist = 55 + Math.random() * 65;
    p.style.setProperty("--dx", `${Math.round(Math.cos(unghi) * dist)}px`);
    p.style.setProperty("--dy", `${Math.round(Math.sin(unghi) * dist * 0.7 - 35)}px`);
    p.style.setProperty("--r", `${Math.round(Math.random() * 600 - 300)}deg`);
    p.style.background = CULORI[i % CULORI.length];
    p.style.animationDelay = `${Math.round(Math.random() * 60)}ms`;
    strat.appendChild(p);
  }
  document.body.appendChild(strat);
  window.setTimeout(() => strat.remove(), 1200);
}

/** Pune confetti peste element acum, sau cand pagina redevine vizibila. Intoarce functia de anulare. */
export function confetti(tinta: Element | null | undefined, bucati = 18): () => void {
  if (!tinta || typeof window === "undefined") return () => {};
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return () => {};
  if (document.visibilityState === "visible") {
    explozie(tinta, bucati);
    return () => {};
  }
  const laIntoarcere = () => {
    if (document.visibilityState !== "visible") return;
    anuleaza();
    // Un cadru dupa revenire: browserul tocmai a reafisat pagina, pozitia casetei e cea reala.
    window.requestAnimationFrame(() => { if (tinta.isConnected) explozie(tinta, bucati); });
  };
  const termen = window.setTimeout(() => anuleaza(), 120_000);
  function anuleaza() {
    document.removeEventListener("visibilitychange", laIntoarcere);
    window.clearTimeout(termen);
  }
  document.addEventListener("visibilitychange", laIntoarcere);
  return anuleaza;
}
