"use client";

/**
 * „Ce cumperi?" — cautatorul ghidat din primul ecran (pilonul 1, „Gaseste-l"). E /alege adus pe prima pagina:
 * tema, apoi caracteristica, apoi produsele cu pretul confirmat pe site-ul magazinului si ziua confirmarii.
 * Fara model de limbaj si fara cereri in plus: datele (doar paginile /alege publicate, cate 3 produse) vin in HTML,
 * iar starea initiala se randeaza pe server, deci Google si omul fara JavaScript vad prima tema.
 */
import Link from "next/link";
import { useState } from "react";
import { cuNumar } from "@/lib/acordNumeral";
import { lei, ziScurta } from "@/lib/formatRo";

export interface ProdusCautator { titlu: string; pret: number; imagine?: string; url: string; magazin: string; confirmat?: string }
export interface CriteriuCautator { slug: string; titlu: string; modele: number; dela: number; produse: ProdusCautator[] }
export interface TemaCautator { tema: string; nume: string; criterii: CriteriuCautator[] }

export default function Cautator({ teme }: { teme: TemaCautator[] }) {
  const [t, setT] = useState(0);
  const [c, setC] = useState(0);
  if (teme.length === 0) {
    return (
      <div className="cautator">
        <p className="cautator-gol">Încă nu avem prețuri confirmate la magazin pentru nicio caracteristică. Până atunci, vezi <Link className="legatura" href="/oferte-azi">ofertele de azi</Link>.</p>
      </div>
    );
  }
  const tema = teme[Math.min(t, teme.length - 1)];
  const crit = tema.criterii[Math.min(c, tema.criterii.length - 1)];
  return (
    <div className="cautator" data-loc="cautator">
      <p className="cautator-pas" id="pas-1"><b>1</b>Ce cumperi?</p>
      <div className="chips" role="group" aria-labelledby="pas-1">
        {teme.map((x, i) => (
          <button key={x.tema} type="button" className="chip" aria-pressed={i === t} onClick={() => { setT(i); setC(0); }}>
            {x.nume}
          </button>
        ))}
      </div>
      {tema.criterii.length > 1 && (
        <>
          <p className="cautator-pas" id="pas-2"><b>2</b>Ce contează?</p>
          <div className="chips" role="group" aria-labelledby="pas-2">
            {tema.criterii.map((x, i) => (
              <button key={x.slug} type="button" className="chip" aria-pressed={i === c} onClick={() => setC(i)}>
                {x.titlu} <small>de la {lei(x.dela)}</small>
              </button>
            ))}
          </div>
        </>
      )}
      <div className="rezultate" aria-live="polite">
        <div className="rezultate-cap">
          <b>{crit.titlu}</b>
          <span>{cuNumar(crit.modele, "model", "modele")} · de la {lei(crit.dela)}</span>
        </div>
        {crit.produse.map((p) => (
          <a key={p.url} className="rezultat" href={p.url} target="_blank" rel="sponsored noopener noreferrer">
            <span className="rezultat-img">
              {p.imagine
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={p.imagine} alt="" loading="lazy" decoding="async" />
                : null}
            </span>
            <span>
              <span className="rezultat-titlu">{p.titlu}</span>
              <span className="rezultat-mag">la {p.magazin}</span>
            </span>
            <span className="rezultat-pret">
              {lei(p.pret)}
              {p.confirmat && <small>confirmat {ziScurta(p.confirmat)}</small>}
            </span>
          </a>
        ))}
        <Link href={`/alege/${crit.slug}`} className="buton-contur">Vezi toate cele {cuNumar(crit.modele, "model", "modele")} →</Link>
      </div>
    </div>
  );
}
