/**
 * categoriiNisa.ts — maparea paginilor de nisa catre categoriile REALE din output.json.
 *
 * ── De ce exista (bug gasit 14.08.2026) ────────────────────────────────────
 * Cele 22 de pagini de nisa filtrau magazinele cu potrivire pe SUBSIR, pe liste de
 * cuvinte-cheie scrise de mana. Exemple de ce iesea:
 *   /animale     avea ["cat"]     -> "cat" se potriveste in "eduCATie"
 *                                 => 8 din 14 magazine erau LIBRARII, cu tot cu
 *                                    eticheta "Carti & Educatie" pe card
 *   /supermarket avea ["marke"]   -> se potriveste in "MARKEtplace"
 *                                 => afisa eMAG, Temu, Vegis in loc de supermarketuri
 *   /gadgets     avea ["software"] => 20 din 22 de "magazine de gadgets" erau firme SaaS
 *                                    (Hostinger, Shopify, Bitdefender, Upwork...)
 * Adica exact tiparul de bug care a lovit deja proiectul de doua ori: potrivire fuzzy
 * pe text acolo unde exista un camp exact disponibil.
 *
 * ── Regula ─────────────────────────────────────────────────────────────────
 * Se filtreaza EXACT pe `categorie_slug`, niciodata pe subsir si niciodata pe numele
 * magazinului. Categoriile reale din date (verificate 14.08.2026, cu numar de magazine):
 *   marketplace 208 · casa-gradina 145 · electronice 117 · fashion 108 · software 92
 *   beauty 84 · calatorii 81 · sanatate 61 · sport 55 · carti-educatie 37 · copii 36
 *   auto-moto 30 · animale 22 · bijuterii 22 · servicii 21 · mancare-bauturi 17
 *   cadouri-flori 15 · financiar 15 · online-mall 1
 * ATENTIE: NU exista categoria "telecom" in date, desi apare in documentatia veche.
 */

export const NISA_CATEGORII: Record<string, string[]> = {
  animale:         ["animale"],
  antivirus:       ["software"],
  calatorie:       ["calatorii"],
  carti:           ["carti-educatie"],
  casa:            ["casa-gradina"],
  copii:           ["copii"],
  electronice:     ["electronice"],
  farmacie:        ["sanatate"],
  fashion:         ["fashion"],
  frumusete:       ["beauty"],
  gadgets:         ["electronice"],
  gaming:          ["electronice"],
  "idei-cadouri":  ["cadouri-flori"],
  jocuri:          ["electronice"],
  laptop:          ["electronice"],
  parfumuri:       ["beauty"],
  sanatate:        ["sanatate"],
  "smart-home":    ["electronice", "casa-gradina"],
  sport:           ["sport"],
  supermarket:     ["mancare-bauturi"],
  telefoane:       ["electronice"],
};

/** Potrivire EXACTA pe categorie_slug. Fara subsiruri, fara nume de magazin. */
export function esteInCategorie(
  m: { categorie_slug?: string },
  sluguri: string[],
): boolean {
  const s = (m.categorie_slug || "").toLowerCase().trim();
  return s.length > 0 && sluguri.includes(s);
}
