import fs from "fs";
import path from "path";

/**
 * Termometrul pretului (noul site, 25.11.2026) — DOAR pe server.
 *
 * Datele le scrie pipeline-ul (`scripts/termometru.py`) in public/termometru.json, din istoricul propriu, cu aceleasi
 * definitii ca /reduceri-reale: minimul si maximul din cele 30 de zile dinaintea zilei de azi. Cheia e adresa exact ca
 * in fisierul paginii (url_magazin pe /alege, url pe /reduceri-reale).
 *
 * Verdictul, in ordinea asta:
 *  - „tace": varianta neclara (parametri de varianta in adresa, mostra, salt exact la jumatate/dublu sau peste x3).
 *    Bara se arata, dar NU spunem „reducere reala": pe 24.11, doua din primele trei „scaderi" erau alta varianta;
 *  - „reala": pretul de azi e cu cel putin 10% sub minimul din 30 de zile (pragul de la /reduceri-reale);
 *  - „sub-minim": sub minim, dar cu mai putin de 10%;
 *  - „obisnuit": in intervalul ultimelor 30 de zile sau peste.
 * Sub 14 zile de istoric nu aratam nimic: „minimul din 30 de zile" ar fi o vorba goala.
 */
export interface DateTermometru {
  min: number;
  max: number;
  acop: number;
  serie: [string, number][];
  varianta: boolean;
}

export type Verdict = "reala" | "sub-minim" | "obisnuit" | "tace";

export interface Termometru extends DateTermometru {
  azi: number;
  verdict: Verdict;
  /** Cu cat e pretul de azi sub minimul din 30 de zile, in procente (negativ = peste minim). */
  sub: number;
}

export const ACOPERIRE_MIN = 14;
export const SCADERE_REALA = 0.1;

interface Fisier {
  actualizat: string;
  produse: Record<string, DateTermometru>;
}

let cache: Fisier | null = null;

function citeste(): Fisier {
  if (cache) return cache;
  try {
    cache = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "termometru.json"), "utf-8")) as Fisier;
  } catch {
    cache = { actualizat: "", produse: {} };
  }
  return cache;
}

/** Ziua datelor (aceeasi cu istoricul), ca „azi" de pe bon sa nu fie ceasul serverului. */
export function ziuaTermometrului(): string {
  return citeste().actualizat;
}

export function verdictPret(d: DateTermometru, azi: number): Verdict {
  if (d.varianta) return "tace";
  if (azi <= d.min * (1 - SCADERE_REALA)) return "reala";
  if (azi < d.min) return "sub-minim";
  return "obisnuit";
}

export function termometru(adresa: string | null | undefined, pretAzi: number | string | null | undefined): Termometru | null {
  const azi = typeof pretAzi === "string" ? Number.parseFloat(pretAzi) : Number(pretAzi);
  if (!adresa || !Number.isFinite(azi) || azi <= 0) return null;
  const d = citeste().produse[adresa];
  if (!d || d.acop < ACOPERIRE_MIN || !(d.min > 0)) return null;
  return { ...d, azi, verdict: verdictPret(d, azi), sub: (1 - azi / d.min) * 100 };
}
