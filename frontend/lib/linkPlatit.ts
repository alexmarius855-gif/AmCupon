import fs from "fs";
import path from "path";
import { linkAfiliat } from "./linkMagazin";

/**
 * Linkul PLATIT pentru un magazin scris de mana intr-o pagina editoriala — DOAR pe server.
 *
 * De ce exista: pe 13.09.2026 paginile cu cele mai mari comisioane trimiteau clicuri fara
 * tracking: /vpn („https://nordvpn.com", „https://surfshark.com" — 40% + recurent), /ai-tools
 * (16 unelte, printre ele InVideo si Wegic cu contract activ), /recomandari,
 * /servicii-internationale (Bitdefender ducea la pagina de INSCRIERE ca afiliat). Linkurile
 * erau copiate de mana in cod, deci ramaneau in urma datelor: cand reteaua aproba un program
 * sau schimba linkul, pagina nu afla niciodata.
 *
 * Acum pagina scrie adresa magazinului, iar linkul platit vine din `output.json` — aceeasi
 * sursa si aceeasi regula (`linkAfiliat`) ca restul site-ului. Fara link platit, ramane
 * adresa scrisa in pagina: recomandare onesta, fara tracking fals.
 */

let _harta: Map<string, string | null> | null = null;

function harta(): Map<string, string | null> {
  if (_harta) return _harta;
  _harta = new Map();
  try {
    const p = path.join(process.cwd(), "public", "output.json");
    const magazine = JSON.parse(fs.readFileSync(p, "utf-8")) as {
      magazin?: string;
      url?: string;
      url_afiliat?: string;
    }[];
    for (const m of magazine) {
      if (m.magazin) _harta.set(m.magazin.toLowerCase(), linkAfiliat(m));
    }
  } catch {
    // fara date: paginile raman pe adresele scrise in ele, nu se rup
  }
  return _harta;
}

function gazda(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** Linkul platit al magazinului de la `url`, sau `url` neschimbat daca nu exista unul. */
export function linkPlatit(url: string): string {
  const g = gazda(url);
  if (!g) return url;
  return harta().get(g) ?? url;
}
