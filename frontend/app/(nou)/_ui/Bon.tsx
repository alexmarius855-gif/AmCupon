import Termometru, { concluzie, SeriePret, zileFereastra } from "./Termometru";
import { lei, procent, ziPuncte } from "@/lib/formatRo";
import type { Termometru as DateTermo } from "@/lib/termometru";

/**
 * Bonul de pret din primul ecran: un produs REAL de azi, cu pretul lui, minimul si maximul din istoricul nostru si
 * verdictul. Momentul orchestrat al site-ului (bonul se tipareste, stampila cade) e doar `transform`: textul e in HTML
 * si pictat de la prima pictura, deci LCP-ul nu asteapta animatia. Fara produs potrivit, bonul spune asta.
 */
export interface ProdusBon { titlu: string; magazin: string; url: string }

const STAMPILA: Record<string, string> = {
  "Reducere reală": "Reducere reală",
  "Sub minim": "Sub minim",
  "La minim": "La minim",
  "Preț obișnuit": "Preț obișnuit",
  "Mai scump": "Mai scump",
};

export default function Bon({ produs, t, azi }: { produs: ProdusBon | null; t: DateTermo | null; azi: string }) {
  const c = t ? concluzie(t) : null;
  const z = t ? zileFereastra(t) : 30;
  const stampila = c && t && t.verdict !== "tace" ? STAMPILA[c.scurt] : null;
  const buna = t?.verdict === "reala" || t?.verdict === "sub-minim";
  return (
    <figure className="bon" aria-label="Bon de preț: un produs de azi, comparat cu istoricul lui de preț">
      <div className="bon-fanta" aria-hidden="true" />
      <div className="bon-fereastra">
        <div className="bon-tipar">
          <div className="bon-umbra">
            <div className="hartie bon-hartie pe-hartie">
              <p className="bon-antet"><b>Bon de preț</b>AmCupon.ro · {ziPuncte(azi)}</p>
              <hr className="bon-taiere" />
              {produs && t ? (
                <>
                  <p className="bon-produs">{produs.titlu}</p>
                  <p className="bon-mag">la {produs.magazin}</p>
                  <hr className="bon-taiere" />
                  <p className="bon-rand azi"><span>Preț azi</span><i /><b>{lei(t.azi)}</b></p>
                  <p className="bon-rand"><span>Minim {z} zile</span><i /><b>{lei(t.min)}</b></p>
                  <p className="bon-rand"><span>Maxim {z} zile</span><i /><b>{lei(t.max)}</b></p>
                  <SeriePret t={t} azi={azi} />
                  <Termometru t={t} peHartie />
                  {stampila && (
                    <div className="bon-stampila" aria-hidden="true">
                      <span className={buna ? "stampila stampila-colt" : "stampila neutra stampila-colt"}>
                        {stampila}
                        {t.verdict === "reala" && <small>{procent(t.sub)}</small>}
                      </span>
                    </div>
                  )}
                  <div className="bon-cta">
                    <a className="buton" href={produs.url} target="_blank" rel="sponsored noopener noreferrer" data-loc="bon">
                      Vezi produsul la {produs.magazin} →
                    </a>
                  </div>
                </>
              ) : (
                <p className="bon-verdict">
                  Azi niciun produs urmărit nu e sub minimul lui din ultimele 30 de zile. Bonul se completează singur la
                  următoarea actualizare, de trei ori pe zi.
                </p>
              )}
              <p className="bon-subsol">Prețuri din istoricul AmCupon · nu din eticheta magazinului</p>
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}
