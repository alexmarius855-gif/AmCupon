"use client";

/**
 * CuponCard — cardul de oferta al interfetei noi (docs/design/macheta/, 23.09.2026).
 *
 * O SINGURA componenta pentru orice oferta afisata. Pana acum pagina de magazin avea doua
 * bucati de markup scrise separat (coduri si oferte), iar fiecare pagina de nisa altul —
 * exact tiparul care a facut fiecare reparatie de 15-55 de ori (docs/LECTII-TEHNICE.md #3).
 *
 * Componenta e doar PREZENTARE. Comportamentul ramane la parinte, neschimbat: copierea +
 * deschiderea magazinului pe linkul platit (useCopyCod), tracking-ul, voturile. Stilul e in
 * globals.css (sectiunea „CuponCard") si foloseste doar tokeni, ca tema deschisa/inchisa sa
 * fie o schimbare de valori, nu o rescriere.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { etichetaExpirare } from "@/lib/expirarePromo";
import { faraCod, valoareOferta, RE_LIVRARE, type PromotieCupon } from "@/lib/oferta";

export { faraCod, valoareOferta, type PromotieCupon };

interface Props {
  promo: PromotieCupon;
  numeMagazin: string;
  logoSrc?: string | null;
  /** Linkul platit catre oferta (linkPromotie). null = fara destinatie platita: butonul
   *  de iesire nu se afiseaza, codul se poate totusi vedea si copia. */
  link: string | null;
  dezvaluit?: boolean;
  copiat?: boolean;
  /** Copiere + deschidere magazin + tracking — la parinte (useCopyCod). */
  onDezvaluie?: () => void;
  /** Tracking pe clicurile de iesire („Vezi oferta", „Mergi la…"). */
  onIesire?: () => void;
  /** Sloturi sub text: vot, partajare. */
  extra?: ReactNode;
}

export default function CuponCard({ promo, numeMagazin, logoSrc, link, dezvaluit, copiat, onDezvaluie, onIesire, extra }: Props) {
  const [logoOk, setLogoOk] = useState(true);
  const [recopiat, setRecopiat] = useState(false);
  const copiazaRef = useRef<HTMLButtonElement>(null);
  const eraDezvaluit = useRef(dezvaluit);

  // Butonul „Vezi codul" dispare la apasare; fara asta, focusul de tastatura se pierdea
  // pe <body>. Il mutam pe „Copiaza", iar caseta codului e aria-live, deci se si anunta.
  useEffect(() => {
    if (dezvaluit && !eraDezvaluit.current) copiazaRef.current?.focus();
    eraDezvaluit.current = dezvaluit;
  }, [dezvaluit]);

  const cod = (promo.cod_cupon || "").trim();
  const val = valoareOferta(promo);
  const et = etichetaExpirare(promo.zile_ramase);
  const titluCurat = faraCod(promo.nume, cod);
  const descCurata = promo.descriere && promo.descriere !== promo.nume ? faraCod(promo.descriere, cod) : "";
  // La Impact, `nume` e des DOAR codul. Scos codul, titlul ar ramane gol — sau, in varianta
  // veche, ar fi fost chiar codul, afisat in clar deasupra butonului care il ascunde.
  const titlu = titluCurat || descCurata || (cod ? `Cod de reducere ${numeMagazin}` : `Ofertă ${numeMagazin}`);
  const descriere = titluCurat ? descCurata : "";
  const livrare = val.text !== "Livrare gratuită" && RE_LIVRARE.test(`${promo.nume} ${promo.descriere ?? ""}`);
  // Doar ultimele doua caractere. Varianta veche arata PRIMELE patru („LAMO**"), destul
  // cat sa ghicesti codul fara click — deci fara comision.
  const coada = cod.length > 3 ? cod.slice(-2) : "";

  function copiazaDinNou() {
    navigator.clipboard?.writeText(cod).then(() => setRecopiat(true)).catch(() => {});
  }

  return (
    <article className="cc">
      <div className="cc-val">
        <div className="cc-logo">
          {logoSrc && logoOk ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoSrc} alt="" loading="lazy" onError={() => setLogoOk(false)} />
          ) : (
            <span className="cc-ini">{numeMagazin.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        {val.prefix && <span className="cc-pre">{val.prefix}</span>}
        <div className={`cc-num cc-num-${val.marime}`}>{val.text}</div>
      </div>

      <div className="cc-body">
        <div className="cc-top">
          <span className={cod ? "cc-chip cc-chip-cod" : "cc-chip cc-chip-oferta"}>{cod ? "Cod" : "Ofertă"}</span>
          <span className="cc-store">{numeMagazin}</span>
        </div>
        <h3 className="cc-title">{titlu}</h3>
        {descriere && <p className="cc-desc">{descriere}</p>}
        {(et || livrare) && (
          <div className="cc-meta">
            {et && <span className={`cc-exp cc-exp-${et.ton}`}>{et.text}</span>}
            {livrare && <span className="cc-tag">Livrare gratuită</span>}
          </div>
        )}
        {extra && <div className="cc-extra">{extra}</div>}
      </div>

      <div className="cc-cta">
        {cod ? (
          dezvaluit ? (
            <div className="cc-revealed">
              <div className="cc-codebox" aria-live="polite">
                <code>{cod}</code>
                <button ref={copiazaRef} type="button" className="cc-copy" onClick={copiazaDinNou}>
                  {copiat || recopiat ? "Copiat ✓" : "Copiază"}
                </button>
              </div>
              {link && (
                <a className="cc-go-solid" href={link} target="_blank" rel="sponsored noopener noreferrer" onClick={onIesire}>
                  Mergi la {numeMagazin} →
                </a>
              )}
            </div>
          ) : (
            <button type="button" className="cc-reveal" onClick={onDezvaluie} aria-label={`Vezi codul ${numeMagazin}: ${titlu}`}>
              <span className="cc-rv-l">Vezi codul</span>
              <span className="cc-rv-t" aria-hidden="true">···{coada}</span>
            </button>
          )
        ) : link ? (
          <a className="cc-go" href={link} target="_blank" rel="sponsored noopener noreferrer" onClick={onIesire}>
            Vezi oferta <span aria-hidden="true">→</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}
