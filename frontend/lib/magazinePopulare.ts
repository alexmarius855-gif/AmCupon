/**
 * Magazinele din subsolul site-ului. Modul COMUN, fara "use client": il citeste si
 * `layout.tsx` (server), ca sa verifice care magazine mai exista in output.json.
 * O valoare exportata dintr-un fisier "use client" nu se poate citi pe server.
 */

// `href` suprascrie tiparul implicit /cod-reducere/<slug>.
// Necesar pentru brandurile care au pagina editoriala dedicata dar NU sunt in
// output.json (fara program de afiliere inca): /cod-reducere/<slug> se genereaza
// din output.json, deci pentru ele dadea 404 — pe TOATE cele 107 pagini, fiindca
// footerul e global. Gasit 08.08.2026. Paginile /altex, /flanco, /elefant exista
// si au continut complet, doar linkul folosea tiparul gresit.
export const MAGAZINE_POPULARE: { slug: string; label: string; href?: string }[] = [
  { slug: "notino.ro",       label: "Notino" },
  { slug: "altex.ro",        label: "Altex",    href: "/altex" },
  { slug: "flanco.ro",       label: "Flanco",   href: "/flanco" },
  { slug: "decathlon.ro",    label: "Decathlon" },
  { slug: "drmax.ro",        label: "Dr. Max" },
  { slug: "noriel.ro",       label: "Noriel" },
  { slug: "elefant.ro",      label: "Elefant",  href: "/elefant" },
  { slug: "carturesti.ro",   label: "Carturesti" },
  { slug: "answear.ro",      label: "Answear" },
  { slug: "temu.com",        label: "Temu" },
  { slug: "shein.com",       label: "SHEIN" },
  { slug: "vidaxl.ro",       label: "vidaXL" },
  { slug: "sportdepot.ro",   label: "Sport Depot" },
  { slug: "bookzone.ro",     label: "BookZone", href: "/bookzone" },
  { slug: "trendyol.com",    label: "Trendyol" },
  { slug: "petmart.ro",      label: "Petmart" },
];
