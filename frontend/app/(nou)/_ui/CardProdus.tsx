import Termometru from "./Termometru";
import { lei, ziScurta } from "@/lib/formatRo";
import type { Termometru as DateTermo } from "@/lib/termometru";

/**
 * Cardul de produs al noului site (/alege, topuri). Tot cardul e un singur link platit, spre produs.
 * Fara pretul taiat al magazinului: pe noul site, ce spune ceva despre reducere e termometrul (din istoricul
 * nostru), nu eticheta pusa de magazin. Termometrul apare doar cand avem destule zile de istoric.
 */
export interface ProdusCard {
  titlu: string;
  pret: number;
  imagine?: string | null;
  url: string;
  magazin: string;
  /** Ziua in care pretul a fost citit pe pagina magazinului. */
  confirmat?: string | null;
}

export default function CardProdus({ p, termo, imediat = false }: { p: ProdusCard; termo?: DateTermo | null; imediat?: boolean }) {
  return (
    <a className="produs" href={p.url} target="_blank" rel="sponsored noopener noreferrer" data-loc="produs">
      <div className="produs-img">
        {p.imagine ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.imagine} alt={p.titlu} loading={imediat ? "eager" : "lazy"} decoding="async" />
        ) : (
          <span aria-hidden="true">{p.magazin.charAt(0)}</span>
        )}
      </div>
      <div className="produs-corp">
        <p className="produs-titlu" title={p.titlu}>{p.titlu}</p>
        <p className="produs-mag">la {p.magazin}</p>
        <p className="produs-pret">{lei(p.pret)}</p>
        {p.confirmat
          ? <p className="produs-data confirmat">Confirmat la magazin pe {ziScurta(p.confirmat)}</p>
          : <p className="produs-data">Preț din feed-ul magazinului</p>}
        {termo && <Termometru t={termo} />}
        <span className="produs-go">La magazin →</span>
      </div>
    </a>
  );
}
