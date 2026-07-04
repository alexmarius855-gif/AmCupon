import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import NouClient from "./NouClient";

// Pagina de PREVIEW pentru noul design bold. Nu o indexam pana nu inlocuieste live-ul.
export const metadata: Metadata = {
  title: "AmCupon — preview design nou",
  robots: { index: false, follow: false },
};

interface Magazin {
  magazin: string; url: string; url_afiliat?: string; logo_url?: string;
  categorie?: string; categorie_slug?: string; sales_number?: number;
  are_promotie?: boolean; promotii?: { nume?: string; cod_cupon?: string }[];
}

function readJSON<T>(file: string, fallback: T): T {
  try {
    const p = path.join(process.cwd(), "public", file);
    if (!fs.existsSync(p)) return fallback;
    return JSON.parse(fs.readFileSync(p, "utf-8")) as T;
  } catch { return fallback; }
}

function numeAfisat(magazin: string): string {
  return magazin.split(".")[0].replace(/-/g, " ")
    .split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function Page() {
  const mags = readJSON<Magazin[]>("output.json", []);
  const withPromo = mags.filter(m => m.are_promotie && m.logo_url);
  const codeOf = (m: Magazin) => (m.promotii || []).map(p => p.cod_cupon).find(Boolean) || "";
  const offers = withPromo
    // magazinele CU cod primele (ca sa se vada reveal-ul), apoi dupa popularitate
    .sort((a, b) => (codeOf(b) ? 1 : 0) - (codeOf(a) ? 1 : 0) || (b.sales_number || 0) - (a.sales_number || 0))
    .slice(0, 12)
    .map(m => ({
      magazin: m.magazin,
      nume: numeAfisat(m.magazin),
      logo: m.logo_url || "",
      categorie: m.categorie || "Magazin",
      promo: m.promotii?.[0]?.nume || "Oferta activa",
      code: codeOf(m),
    }));

  const nrCoduri = mags.filter(m => (m.promotii || []).some(p => p.cod_cupon)).length;
  const nrPromo = withPromo.length;

  return (
    <NouClient
      offers={offers}
      stats={{ magazine: mags.length, oferte: nrPromo, coduri: nrCoduri }}
    />
  );
}
