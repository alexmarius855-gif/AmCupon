/**
 * Acordul numeralului in romana — sursa unica (06.11.2026, garda pe text).
 *
 * „1 cod", „2 coduri", „19 coduri", „20 de coduri", „101 coduri", „120 de coduri".
 * „de" apare cand ultimele doua cifre sunt 00 sau 20-99. Pagina scria „24 produse",
 * „55 zile rămase" (fara „de") si „cele 15 de produse" (cu „de" in plus) pe sute de pagini;
 * regula era scrisa de mana in cinci locuri, doua dintre ele gresit (`n >= 20`: „105 de magazine").
 *
 * Fara importuri: o citesc si testele rulate direct cu node (`node lib/oferteAcasa.test.mjs`).
 */

/** „ de" cand numarul il cere, altfel „". Pentru textele care pun numarul si substantivul separat. */
export function deNumar(n: number): string {
  const r = Math.abs(Math.trunc(n)) % 100;
  return n !== 0 && (r === 0 || r >= 20) ? " de" : "";
}

/** Numarul (cu separator de mii, „18.817") si substantivul acordat. */
export function cuNumar(n: number, singular: string, plural: string): string {
  if (n === 1) return `1 ${singular}`;
  return `${n.toLocaleString("ro-RO")}${deNumar(n)} ${plural}`;
}
