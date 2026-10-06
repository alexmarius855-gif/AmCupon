/**
 * Codul de reducere mascat: se vad doar ultimele 2 caractere („****20"). Codul intreg se vede pe
 * pagina magazinului, unde clicul trece prin linkul afiliat — altfel cititorul il copiaza de aici
 * si cumpara fara ca vanzarea sa ne fie atribuita.
 *
 * O singura regula pentru toate componentele (MagazinCard, ticker-ul AnuntAnimat). Articolele de
 * blog folosesc aceeasi masca, din Python: scripts/generate_blog.py -> masca_cod.
 * 06.10.2026: ticker-ul de sus arata codul INTREG pe fiecare pagina („QUBER10", „TVC26Q4A$20").
 */
export function maskCod(cod: string): string {
  if (!cod) return cod;
  const coada = cod.length > 3 ? cod.slice(-2) : "";
  return "*".repeat(Math.max(3, Math.min(cod.length - coada.length, 6))) + coada;
}
