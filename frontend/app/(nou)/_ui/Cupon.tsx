"use client";

/**
 * Cuponul noului site: „codul ca bon" (docs/design/PROMPT-SITE-NOU.md, pilonul 3).
 *
 * Doar PREZENTARE, ca vechiul CuponCard: dezvaluirea (copiere + magazinul deschis pe linkul platit, sincron, in
 * acelasi clic) e la parinte, prin useCopyCod. Reguli pastrate:
 *  - codul ascuns arata doar ULTIMELE doua caractere (primele patru erau destul ca sa-l ghicesti fara clic, deci
 *    fara comision);
 *  - un titlu care e doar codul nu se afiseaza in clar (la Impact, `nume` e des chiar codul);
 *  - eticheta de expirare vine din lib/expirarePromo.ts (fara „3571 de zile ramase").
 * Nou: codul „iese din imprimanta" si primeste stampila „COPIAT", cu confetti in culorile bonului.
 */
import { useEffect, useRef, useState } from "react";
import { confetti, CULORI_NOU } from "@/lib/confetti";
import { etichetaExpirare } from "@/lib/expirarePromo";
import { faraCod, faraEmoji, pareCod, valoareOferta, RE_LIVRARE } from "@/lib/oferta";
import type { OfertaCard } from "@/lib/grilaOferte";

const OPT_CONFETTI = { culori: CULORI_NOU, clasa: "confetti" };

export default function Cupon({ o, dezvaluit, copiat, onDezvaluie, onIesire }: {
  o: OfertaCard;
  dezvaluit: boolean;
  copiat: boolean;
  onDezvaluie: () => void;
  onIesire: () => void;
}) {
  const [logoOk, setLogoOk] = useState(true);
  const [recopiat, setRecopiat] = useState(false);
  const copiazaRef = useRef<HTMLButtonElement>(null);
  const codRef = useRef<HTMLDivElement>(null);
  const eraDezvaluit = useRef(dezvaluit);

  // „Vezi codul" dispare la apasare: focusul trece pe „Copiază" (altfel cadea pe <body>), iar caseta e aria-live.
  useEffect(() => {
    const abiaDezvaluit = dezvaluit && !eraDezvaluit.current;
    eraDezvaluit.current = dezvaluit;
    if (!abiaDezvaluit) return;
    copiazaRef.current?.focus();
    return confetti(codRef.current, 18, OPT_CONFETTI);
  }, [dezvaluit]);

  const p = o.promo;
  const cod = (p.cod_cupon || "").trim();
  const val = valoareOferta(p);
  const et = etichetaExpirare(p.zile_ramase);
  const codText = cod || (pareCod((p.nume || "").trim()) ? (p.nume || "").trim() : "");
  const curat = (t: string) => { const x = faraEmoji(faraCod(t, codText)); return pareCod(x) ? "" : x; };
  const titluCurat = curat(p.nume);
  const descCurata = p.descriere && p.descriere !== p.nume ? curat(p.descriere) : "";
  const titlu = titluCurat || descCurata || (cod ? `Cod de reducere ${o.nume}` : `Ofertă ${o.nume}`);
  const livrare = val.text !== "Livrare gratuită" && RE_LIVRARE.test(`${p.nume} ${p.descriere ?? ""}`);
  const coada = cod.length > 3 ? cod.slice(-2) : "";
  const valoare = val.text === "Ofertă" || val.text === "Reducere" ? "" : val.text;

  function copiazaDinNou() {
    navigator.clipboard?.writeText(cod).then(() => { setRecopiat(true); confetti(codRef.current, 18, OPT_CONFETTI); }).catch(() => {});
  }

  return (
    <article className="cupon" data-loc="oferta">
      <div className="hartie">
        <div className="cupon-cap">
          <div className="cupon-logo">
            {o.logo && logoOk ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={o.logo} alt="" loading="lazy" decoding="async" onError={() => setLogoOk(false)} />
            ) : (
              <span>{o.nume.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div className="cupon-mag">
            <b>{o.nume}</b>
            <span className="cupon-tip">{cod ? "Cod de reducere" : "Ofertă fără cod"}</span>
          </div>
        </div>
        {valoare && (
          <div className={`cupon-val ${val.marime}`}>
            {val.prefix && <span className="cupon-pre">{val.prefix}</span>}
            {valoare}
          </div>
        )}
        <h3 className="cupon-titlu">{titlu}</h3>
        {(et || livrare) && (
          <div className="cupon-meta">
            {et && <span className={et.ton === "urgent" ? "urgent" : undefined}>{et.text}</span>}
            {livrare && <span>Livrare gratuită</span>}
          </div>
        )}
        <div className="cupon-jos">
          <hr className="cupon-taiere" />
          {cod ? (
            dezvaluit ? (
              <>
                <div ref={codRef} className="cupon-cod" aria-live="polite">
                  <code>{cod}</code>
                  <button ref={copiazaRef} type="button" className={copiat || recopiat ? "cupon-copiaza ok" : "cupon-copiaza"} onClick={copiazaDinNou}>
                    {copiat || recopiat ? "Copiat" : "Copiază"}
                  </button>
                </div>
                {o.link && (
                  <a className="cupon-go" href={o.link} target="_blank" rel="sponsored noopener noreferrer" onClick={onIesire}>
                    Mergi la {o.nume} →
                  </a>
                )}
              </>
            ) : (
              <button type="button" className="cupon-btn" onClick={onDezvaluie} aria-label={`Vezi codul ${o.nume}: ${titlu}`}>
                <span>Vezi codul</span>
                <span aria-hidden="true">···{coada}</span>
              </button>
            )
          ) : o.link ? (
            <a className="cupon-go" href={o.link} target="_blank" rel="sponsored noopener noreferrer" onClick={onIesire}>
              Vezi oferta la {o.nume} →
            </a>
          ) : null}
        </div>
      </div>
      {dezvaluit && (copiat || recopiat) && <span className="stampila stampila-copiat" aria-hidden="true">Copiat</span>}
    </article>
  );
}
