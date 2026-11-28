import Link from "next/link";

/** 404-ul noului site: un bon anulat, cu drumurile cele mai folosite. Folosit si de app/global-not-found.tsx. */
export default function Pagina404() {
  return (
    <div className="cadru p404">
      <p className="eticheta">Eroare 404</p>
      <h1 className="h1">Pagina asta nu există</h1>
      <p className="lead" style={{ marginInline: "auto", marginTop: 14 }}>
        Poate magazinul nu mai e partener, poate adresa s-a schimbat. Ofertele și prețurile de azi sunt mai jos.
      </p>
      <div className="bon" aria-hidden="true">
        <div className="bon-fanta" />
        <div className="bon-fereastra">
          <div className="bon-umbra">
            <div className="hartie bon-hartie">
              <p className="bon-antet"><b>Bon anulat</b>AmCupon.ro</p>
              <hr className="bon-taiere" />
              <p className="bon-rand"><span>Pagina căutată</span><i /><b>0,00 lei</b></p>
              <p className="bon-rand"><span>Ofertele de azi</span><i /><b>active</b></p>
              <hr className="bon-taiere" />
              <p className="bon-subsol">Nu s-a plătit nimic</p>
            </div>
          </div>
        </div>
      </div>
      <nav aria-label="Unde mergi mai departe">
        <Link className="buton" href="/">Prima pagină</Link>
        <Link className="buton-contur" href="/oferte-azi">Ofertele de azi</Link>
        <Link className="buton-contur" href="/alege">Alege produsul</Link>
        <Link className="buton-contur" href="/toate-magazinele">Toate magazinele</Link>
      </nav>
    </div>
  );
}
