"use client";

import { Truck, Flame, Tag, Clock, LayoutGrid } from "lucide-react";

/**
 * Filtre rapide, client-side, fara reincarcare de pagina.
 *
 * ABATERE DELIBERATA DE LA BRIEF, cu motiv masurat (16.08.2026): brief-ul cerea
 * si un filtru „Exclusive". In date, magazinele cu `exclusiv` sunt **0** — butonul
 * ar fi fost mereu gol. Un rand de filtre din care unele nu fac nimic cand le
 * apesi arata mai rau decat lipsa lor.
 *
 * Regula implementata: **fiecare filtru se afiseaza doar daca are cel putin un
 * rezultat**, si isi arata numarul. Cele goale dispar singure si reapar automat
 * cand datele se imbogatesc — fara sa mai schimbe nimeni codul.
 *
 * Numere reale la data scrierii, din 66 de magazine cu promotie activa:
 * transport gratuit 6 · reducere >=50% 15 · cu cod real 6 · expira in <=7 zile 2.
 */

export type CheieFiltru = "toate" | "transport" | "reducere" | "cod" | "expira";

export interface MagazinFiltrabil {
  are_promotie?: boolean;
  promotii?: { nume?: string; descriere?: string; cod_cupon?: string; zile_ramase?: number }[];
}

const RE_TRANSPORT = /transport gratuit|livrare gratuit|free shipping/i;

function textPromo(m: MagazinFiltrabil): string {
  return (m.promotii || []).map((p) => `${p.nume || ""} ${p.descriere || ""}`).join(" ");
}

/** Cel mai mare procent scris EXPLICIT in textul promotiei. Nu estimam din pret. */
function procentMax(m: MagazinFiltrabil): number {
  const v = [...textPromo(m).matchAll(/(\d{1,2})\s*%/g)]
    .map((x) => parseInt(x[1], 10))
    .filter((n) => n >= 3 && n <= 95);
  return v.length ? Math.max(...v) : 0;
}

export function trecePrinFiltru(m: MagazinFiltrabil, f: CheieFiltru): boolean {
  if (f === "toate") return true;
  if (f === "transport") return RE_TRANSPORT.test(textPromo(m));
  if (f === "reducere") return procentMax(m) >= 50;
  if (f === "cod") return (m.promotii || []).some((p) => (p.cod_cupon || "").trim().length > 0);
  if (f === "expira") {
    return (m.promotii || []).some((p) => {
      const z = p.zile_ramase ?? 0;
      // `zile_ramase: 0` e valoarea HARDCODATA la importurile Awin/generice
      // (documentat in CLAUDE.md), deci 0 inseamna "necunoscut", nu "expira azi".
      // Fara conditia `z > 0` am afisa fals „expira curand" la sute de magazine.
      return z > 0 && z <= 7;
    });
  }
  return true;
}

const DEFINITII: { cheie: CheieFiltru; eticheta: string; Icon: typeof Truck }[] = [
  { cheie: "toate",     eticheta: "Toate",             Icon: LayoutGrid },
  { cheie: "cod",       eticheta: "Cu cod",            Icon: Tag },
  { cheie: "reducere",  eticheta: "Reduceri 50%+",     Icon: Flame },
  { cheie: "transport", eticheta: "Transport gratuit", Icon: Truck },
  { cheie: "expira",    eticheta: "Expira curand",     Icon: Clock },
];

export default function FiltreRapide({
  magazine, activ, onSchimba,
}: {
  magazine: MagazinFiltrabil[];
  activ: CheieFiltru;
  onSchimba: (f: CheieFiltru) => void;
}) {
  const cuNumar = DEFINITII.map((d) => ({
    ...d,
    n: magazine.filter((m) => trecePrinFiltru(m, d.cheie)).length,
  })).filter((d) => d.cheie === "toate" || d.n > 0);   // filtrele goale dispar

  if (cuNumar.length <= 1) return null;                 // doar „Toate" = fara rost

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtre rapide">
      {cuNumar.map(({ cheie, eticheta, Icon, n }) => {
        const selectat = cheie === activ;
        return (
          <button
            key={cheie}
            onClick={() => onSchimba(cheie)}
            aria-pressed={selectat}
            className={`inline-flex items-center gap-1.5 text-sm font-bold px-3.5 py-2 rounded-xl border transition-colors ${
              selectat
                ? "bg-[#ddf93c] text-[#0c1000] border-[#ddf93c]"
                : "bg-[#14181c] text-[#c9ced5] border-[#1f2329] hover:border-[#c9ced5] hover:text-[#ffffff]"
            }`}
          >
            <Icon className="w-3.5 h-3.5" strokeWidth={2.2} />
            {eticheta}
            <span className={`tabular-nums text-xs font-black ${selectat ? "text-[#0c1000]/70" : "text-[#6b7178]"}`}>
              {n}
            </span>
          </button>
        );
      })}
    </div>
  );
}
