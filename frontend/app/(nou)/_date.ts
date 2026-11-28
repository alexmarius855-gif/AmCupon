import fs from "fs";
import path from "path";
import { cuNumar } from "@/lib/acordNumeral";
import { MAGAZINE_POPULARE } from "@/lib/magazinePopulare";
import { campaniiBF } from "@/lib/campaniiBlackFriday";
import { aziRomania, calendarScurt, fazaBF, type DateBF } from "@/lib/momentBF";

/** Datele comune ale noului site, citite pe server (la build) din frontend/public. */
export function citesteJSON<T>(rel: string, implicit: T): T {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", rel), "utf-8")) as T;
  } catch {
    return implicit;
  }
}

let _inDate: string[] | null = null;
/** Magazinele populare care exista azi in date (subsolul nu leaga spre o pagina 404). */
export function magazineInDate(): string[] {
  if (_inDate) return _inDate;
  const date = citesteJSON<{ magazin?: string }[]>("output.json", []);
  if (!date.length) return (_inDate = MAGAZINE_POPULARE.map((m) => m.slug));
  const existente = new Set(date.map((m) => m.magazin));
  return (_inDate = MAGAZINE_POPULARE.map((m) => m.slug).filter((s) => existente.has(s)));
}

export function dateBF(): DateBF {
  return citesteJSON<DateBF>("black-friday.json", { an: 0, emag: "", international: ["", ""] });
}

/** Banda de sus: doar cat tine Black Friday, cu cifre din date; in afara ferestrei nu apare nimic. */
export function anuntBF(): { text: string; href: string } | null {
  const d = dateBF();
  if (!d.an) return null;
  const azi = aziRomania();
  if (fazaBF(azi, d) === "inchis") return null;
  const { inCurs } = calendarScurt(azi, campaniiBF(azi));
  return {
    href: "/black-friday",
    text: inCurs > 0 ? `Black Friday: campanii active la ${cuNumar(inCurs, "magazin partener", "magazine partenere")}` : "Black Friday: calendarul magazinelor partenere",
  };
}
