/**
 * Potrivirea unui magazin dupa nume nu are voie sa treaca granita de tara.
 *
 * 16.09.2026: `/cod-reducere/vidaxl.ro` servea datele lui vidaxl.bg, iar `/vidaxl` (pagina
 * de brand pentru Romania) trimitea cumparatorul pe magazinul bulgaresc. Ambele potriveau
 * pe primul cuvant din domeniu („vidaxl"), fara sa se uite la tara. vidaxl.ro iesise din
 * date; ramasese doar varianta .bg.
 *
 * Regula: daca ambele domenii au tara (.ro, .bg, .co.uk...) si tarile difera, nu e acelasi
 * magazin pentru un cumparator din Romania. Domeniile generice (.com, .io, .eu) raman
 * compatibile — acolo nu stim tara, deci nu refuzam.
 */

const GENERICE_DOUA_LITERE = new Set(["io", "ai", "co", "me", "tv", "gg", "ly", "to", "cc", "ws", "eu"]);

export function taraDomeniu(domeniu: string): string | null {
  const parti = (domeniu || "").toLowerCase().split(".").filter(Boolean);
  if (parti.length < 2) return null;
  const ultima = parti[parti.length - 1];
  if (ultima.length !== 2 || GENERICE_DOUA_LITERE.has(ultima)) return null;
  return ultima;
}

/** False doar cand ambele domenii au tara si tarile difera. */
export function aceeasiTara(cerut: string, gasit: string): boolean {
  const a = taraDomeniu(cerut);
  const b = taraDomeniu(gasit);
  return !a || !b || a === b;
}
