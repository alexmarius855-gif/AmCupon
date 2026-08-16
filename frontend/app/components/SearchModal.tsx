"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Search, X, CornerDownLeft, Tag } from "lucide-react";

/**
 * Cautare instant, global, cu Cmd+K / Ctrl+K.
 *
 * DE CE ASA:
 *  * **Datele se incarca LENES**, la prima deschidere, din `nav-index.json`
 *    (196 KB, 1.162 magazine) — nu din `output.json` (cateva MB). Indexul exista
 *    deja, generat de pipeline; nu se adauga nimic nou de intretinut.
 *  * **Fara librarie de fuzzy search.** Scorarea de mai jos are ~30 de linii si
 *    acopera cazul real (nume de magazin, un cuvant, cu sau fara diacritice).
 *    O dependinta noua ar fi fost mai mult cod livrat catre utilizator decat
 *    intreaga functie. Regula proiectului: crestem la cost minim.
 *  * **NU exista badge „Exclusiv".** Niciun magazin din date n-are `exclusiv`,
 *    deci l-as fi fabricat — exact tipul de semnal fals eliminat pe 03.07 si
 *    09.08. Se arata in schimb „COD", care e verificabil: exista un cod nevid.
 *
 * ATENTIE la bug-ul din 09.08: bara de cautare veche facea `scrollIntoView`
 * pe FIECARE litera si pagina sarea continuu. Aici nu se atinge scroll-ul
 * paginii — modalul e overlay, iar body-ul se blocheaza cat e deschis.
 */

interface Promo { cod_cupon?: string; nume?: string; landing_page?: string }
interface Intrare {
  magazin: string;
  logo_url?: string;
  are_promotie?: boolean;
  cod_cupon?: boolean;
  promotii?: Promo[];
}

const MAX_REZULTATE = 8;

/** ă→a, ș→s… — altfel „sanatate" nu gaseste „sănătate". */
function faraDiacritice(t: string): string {
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/**
 * Scor de potrivire. Mai mare = mai relevant. 0 = nu se potriveste.
 * Ordinea conteaza: cine tasteaza „ema" vrea eMAG primul, nu „cinema-shop".
 */
function scor(nume: string, q: string): number {
  const n = faraDiacritice(nume);
  if (n === q) return 1000;
  if (n.startsWith(q)) return 500 - n.length;          // prefix: cel mai scurt castiga
  const idx = n.indexOf(q);
  if (idx >= 0) return 200 - idx;                       // subsir: cat mai la inceput
  // potrivire pe litere in ordine (tolereaza greseli de tastare: „fshion" -> „fashion")
  let i = 0;
  for (const ch of n) if (ch === q[i]) i++;
  return i === q.length ? 50 : 0;
}

function coduriActive(m: Intrare): number {
  return (m.promotii || []).filter((p) => (p.cod_cupon || "").trim()).length;
}

export default function SearchModal() {
  const [deschis, setDeschis] = useState(false);
  const [q, setQ] = useState("");
  const [date, setDate] = useState<Intrare[] | null>(null);
  const [incarca, setIncarca] = useState(false);
  const [activ, setActiv] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const incarcaDate = useCallback(async () => {
    if (date || incarca) return;
    setIncarca(true);
    try {
      const r = await fetch("/nav-index.json");
      setDate(await r.json());
    } catch {
      setDate([]);            // esec de retea: modalul spune onest ca n-are date
    } finally {
      setIncarca(false);
    }
  }, [date, incarca]);

  // Resetarea selectiei se face AICI, la deschidere — nu intr-un efect care
  // reactioneaza la `deschis`. Un `setState` sincron in corpul unui efect
  // declanseaza un render in plus si e semnalat de react-hooks; punandu-l in
  // handler, starea e corecta din primul render al modalului.
  const deschide = useCallback(() => {
    setActiv(0);
    setDeschis(true);
    incarcaDate();          // pornit din ACTIUNE, nu dintr-un efect (vezi comentariul de sus)
  }, [incarcaDate]);

  // Cmd+K / Ctrl+K global + Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setDeschis((d) => {
          if (d) return false;
          deschide();
          return true;
        });
      }
      if (e.key === "Escape") setDeschis(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deschide]);

  // deschidere si din alte locuri (bara de cautare din Navbar emite evenimentul)
  useEffect(() => {
    window.addEventListener("amcupon:cauta", deschide);
    return () => window.removeEventListener("amcupon:cauta", deschide);
  }, [deschide]);

  // Efectul asta ramane DOAR cu sincronizari de DOM (focus, blocarea scroll-ului),
  // adica exact ce e un efect. Incarcarea datelor si resetarea selectiei s-au mutat
  // in `deschide()`, altfel se declanseaza renderuri in cascada.
  useEffect(() => {
    if (!deschis) return;
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    // blocam scroll-ul paginii cat e modalul deschis, ca sa nu „sara" fundalul
    const overflowInitial = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = overflowInitial;
    };
  }, [deschis]);

  const rezultate = useMemo(() => {
    const termen = faraDiacritice(q.trim());
    if (!termen || !date) return [];
    return date
      .map((m) => ({ m, s: scor(m.magazin, termen) }))
      .filter((x) => x.s > 0)
      // la scor egal, magazinele cu promotie activa sunt mai utile
      .sort((a, b) => b.s - a.s || Number(b.m.are_promotie) - Number(a.m.are_promotie))
      .slice(0, MAX_REZULTATE)
      .map((x) => x.m);
  }, [q, date]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiv((i) => Math.min(i + 1, rezultate.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActiv((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && rezultate[activ]) {
      window.location.href = `/cod-reducere/${rezultate[activ].magazin}`;
    }
  }

  if (!deschis) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh] bg-black/70 backdrop-blur-sm"
      onClick={() => setDeschis(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Cauta magazin"
    >
      <div
        className="w-full max-w-xl bg-[#14181c] border border-[#2a2f36] rounded-xl overflow-hidden shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* camp de cautare */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#1f2329]">
          <Search className="w-4.5 h-4.5 text-[#9399a0] shrink-0" strokeWidth={2} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setActiv(0); }}
            onKeyDown={onKeyDown}
            placeholder="Cauta un magazin — eMAG, Answear, Dr. Max..."
            className="flex-1 bg-transparent text-[#ffffff] placeholder:text-[#6b7178] text-[15px] outline-none"
          />
          <button
            onClick={() => setDeschis(false)}
            aria-label="Inchide"
            className="text-[#9399a0] hover:text-[#ffffff] transition-colors"
          >
            <X className="w-4.5 h-4.5" strokeWidth={2} />
          </button>
        </div>

        {/* rezultate */}
        <div className="max-h-[52vh] overflow-y-auto">
          {incarca && (
            <p className="px-4 py-6 text-sm text-[#9399a0]">Se incarca magazinele...</p>
          )}

          {!incarca && !q && (
            <p className="px-4 py-6 text-sm text-[#9399a0]">
              Scrie numele unui magazin. Navighezi cu sagetile, deschizi cu Enter.
            </p>
          )}

          {!incarca && q && rezultate.length === 0 && (
            <div className="px-4 py-6">
              <p className="text-sm text-[#c9ced5] mb-3">
                Niciun magazin nu se potriveste cu <strong className="text-[#ffffff]">{q}</strong>.
              </p>
              <a href="/toate-magazinele" className="text-sm font-bold text-[#ddf93c] hover:text-[#c3dd2c]">
                Vezi toate cele {date?.length ?? 0} de magazine &rarr;
              </a>
            </div>
          )}

          {rezultate.map((m, i) => {
            const nrCod = coduriActive(m);
            const nrOferte = (m.promotii || []).length;
            return (
              <a
                key={m.magazin}
                href={`/cod-reducere/${m.magazin}`}
                onMouseEnter={() => setActiv(i)}
                className={`flex items-center gap-3 px-4 py-3 border-b border-[#1f2329] last:border-0 transition-colors ${
                  i === activ ? "bg-[#1f2329]" : "hover:bg-[#1f2329]/60"
                }`}
              >
                <span className="relative w-9 h-9 rounded-full overflow-hidden bg-[#ffffff] shrink-0 flex items-center justify-center ring-1 ring-[#2a2f36]">
                  {m.logo_url ? (
                    <Image src={m.logo_url} alt="" fill sizes="36px" className="object-contain p-1" unoptimized />
                  ) : (
                    <span className="text-[#0c1000] font-black text-[11px]">
                      {m.magazin.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-[#ffffff] font-semibold text-sm truncate">{m.magazin}</span>
                  <span className="block text-xs text-[#9399a0]">
                    {nrCod > 0
                      ? `${nrCod} ${nrCod === 1 ? "cod activ" : "coduri active"}`
                      : nrOferte > 0
                        ? `${nrOferte} ${nrOferte === 1 ? "oferta" : "oferte"}`
                        : "fara oferte acum"}
                  </span>
                </span>

                {/* Badge doar cand exista COD real. NU „Exclusiv" — niciun magazin
                    nu are campul, deci ar fi fost inventat. */}
                {nrCod > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide bg-[#ddf93c] text-[#0c1000] px-2 py-1 rounded-lg shrink-0">
                    <Tag className="w-3 h-3" strokeWidth={2.5} /> Cod
                  </span>
                )}
                {i === activ && (
                  <CornerDownLeft className="w-3.5 h-3.5 text-[#6b7178] shrink-0" strokeWidth={2} />
                )}
              </a>
            );
          })}
        </div>

        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0f1216] border-t border-[#1f2329] text-[11px] text-[#6b7178]">
          <span>Navighezi cu &uarr; &darr; · deschizi cu Enter</span>
          <span className="font-mono">Esc</span>
        </div>
      </div>
    </div>
  );
}
