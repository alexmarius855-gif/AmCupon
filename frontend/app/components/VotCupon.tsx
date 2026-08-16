"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Check } from "lucide-react";

/**
 * "A functionat codul?" — 👍 / 👎 pe fiecare cupon.
 *
 * REGULA CENTRALA, care vine dintr-o greseala reala a proiectului:
 * pe 09.08.2026 exact acest widget a fost STERS de pe site, pentru ca scria doar
 * in `localStorage` si nu ajungea nicaieri — arata ca ascultam feedback, dar nu
 * facea nimic cu el. Tot atunci a fost scos si un "Trust Score" hardcodat 100%.
 *
 * De aceea aici:
 *  * **cu 0 voturi NU se afiseaza niciun scor** — nici "100%", nici "nou". Un
 *    procent din zero voturi e o cifra inventata, adica exact ce s-a eliminat.
 *    Scorul apare doar de la PRAG_AFISARE voturi in sus.
 *  * **daca cererea esueaza, se spune** ("n-a mers"), nu se pretinde succes.
 *    Nu e teoretic: baza e pe free tier si s-a auto-pauzat de 4 ori.
 *  * localStorage tine minte doar ca ai votat TU de pe device-ul asta (ca sa nu
 *    reapara butoanele). Limitarea reala e in Postgres, pe (magazin, cupon, IP).
 */

/** Sub atatea voturi nu publicam procent — 1 vot "da" nu inseamna 100% reusita. */
const PRAG_AFISARE = 3;

export interface TotaluriVot { da: number; nu: number }

export default function VotCupon({
  magazin, cuponHash, initial, compact = false,
}: {
  magazin: string;
  cuponHash: string;
  initial?: TotaluriVot;
  compact?: boolean;
}) {
  const [tot, setTot] = useState<TotaluriVot | null>(initial ?? null);
  const [stare, setStare] = useState<"idle" | "trimit" | "votat" | "eroare">(
    typeof window !== "undefined" && localStorage.getItem(`vot:${magazin}:${cuponHash}`)
      ? "votat"
      : "idle"
  );

  async function voteaza(pozitiv: boolean) {
    if (stare === "trimit" || stare === "votat") return;
    setStare("trimit");
    try {
      const r = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ magazin, cuponHash, pozitiv }),
      });
      if (!r.ok) throw new Error(String(r.status));
      const d = await r.json();
      setTot({ da: d.da, nu: d.nu });
      setStare("votat");
      localStorage.setItem(`vot:${magazin}:${cuponHash}`, pozitiv ? "1" : "0");
    } catch {
      // Onest: votul NU s-a inregistrat, deci nu ne prefacem ca da.
      setStare("eroare");
    }
  }

  const total = (tot?.da ?? 0) + (tot?.nu ?? 0);
  const procent = total > 0 ? Math.round(((tot?.da ?? 0) / total) * 100) : null;
  const aratScor = total >= PRAG_AFISARE && procent !== null;

  return (
    <div className={`flex items-center gap-2 flex-wrap ${compact ? "text-[11px]" : "text-xs"}`}>
      {stare === "votat" ? (
        <span className="inline-flex items-center gap-1.5 text-[#c3dd2c] font-semibold">
          <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> Multumim
        </span>
      ) : stare === "eroare" ? (
        <span className="text-[#e64343] font-semibold">
          Nu s-a putut inregistra. Incearca mai tarziu.
        </span>
      ) : (
        <>
          <span className="text-[#9399a0]">A functionat?</span>
          <button
            onClick={() => voteaza(true)}
            disabled={stare === "trimit"}
            aria-label="Codul a functionat"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-[#2a2f36] text-[#c9ced5] hover:border-[#ddf93c] hover:text-[#ddf93c] disabled:opacity-50 transition-colors"
          >
            <ThumbsUp className="w-3.5 h-3.5" strokeWidth={2} /> Da
          </button>
          <button
            onClick={() => voteaza(false)}
            disabled={stare === "trimit"}
            aria-label="Codul nu a functionat"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-[#2a2f36] text-[#c9ced5] hover:border-[#e64343] hover:text-[#e64343] disabled:opacity-50 transition-colors"
          >
            <ThumbsDown className="w-3.5 h-3.5" strokeWidth={2} /> Nu
          </button>
        </>
      )}

      {/* Scorul apare DOAR cu destule voturi. Sub prag nu afisam nimic —
          absenta unei cifre e onesta, o cifra din 1 vot nu ar fi. */}
      {aratScor && (
        <span className="text-[#9399a0]">
          <strong className="text-[#ffffff]">{procent}%</strong> din {total} spun ca merge
        </span>
      )}
    </div>
  );
}

/** Amprenta stabila a unui cupon. NU indexul din array: acela se schimba la
 *  fiecare rulare de pipeline, deci voturile s-ar lipi de alt cupon. */
export function hashCupon(cod: string, nume: string): string {
  const s = `${(cod || "").trim().toLowerCase()}|${(nume || "").trim().toLowerCase()}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}
