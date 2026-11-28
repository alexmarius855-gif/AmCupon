import Link from "next/link";
import { MAGAZINE_POPULARE } from "@/lib/magazinePopulare";
import { SITE, SUBSOL } from "@/lib/site";
import { SemnMarca } from "./Iconite";

/**
 * Subsolul noului site. Aceleasi liste ca pe vechiul site (lib/site.ts::SUBSOL + magazinele populare), ca nicio
 * pagina sa nu ramana fara linkuri interne la trecere: subsolul e pe toate paginile, deci un link de aici scoate o
 * pagina din starea de „orfana" (05.11.2026). Magazinele: doar cele care exista azi in date (altfel 404 pe tot site-ul,
 * bookzone.ro, 16.09.2026).
 */
export default function Subsol({ magazineInDate, actualizat }: { magazineInDate: string[]; actualizat?: string }) {
  const existente = new Set(magazineInDate);
  const magazine = MAGAZINE_POPULARE.filter((m) => m.href || existente.has(m.slug));
  const an = new Date().getFullYear();
  return (
    <footer className="subsol">
      <div className="cadru">
        <div className="subsol-col">
          <div className="subsol-despre">
            <Link href="/" className="marca"><SemnMarca /><span>AmCupon<i>.ro</i></span></Link>
            <p>Codul, oferta și adevărul despre preț, înainte să plătești. Ofertele vin de la rețelele de afiliere și se actualizează de trei ori pe zi.</p>
            <p>
              AmCupon.ro conține linkuri de afiliere: dacă alegi să cumperi, magazinul ne poate plăti un comision, iar prețul tău rămâne același.
            </p>
          </div>
          <nav aria-label="Reduceri">
            <h2>Reduceri</h2>
            <ul>{SUBSOL.reduceri.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}</ul>
          </nav>
          <nav aria-label="Categorii">
            <h2>Categorii</h2>
            <ul>{SUBSOL.categorii.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}</ul>
            <h2 style={{ marginTop: 22 }}>Pe teme</h2>
            <ul>{SUBSOL.nise.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}</ul>
          </nav>
          <nav aria-label="Magazine populare">
            <h2>Magazine</h2>
            <ul>{magazine.map((m) => <li key={m.slug}><Link href={m.href ?? `/cod-reducere/${m.slug}`}>{m.label}</Link></li>)}</ul>
          </nav>
          <nav aria-label="Despre">
            <h2>AmCupon</h2>
            <ul>
              {SUBSOL.utilizatori.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}
              {SITE.social.map((s) => <li key={s.href}><a href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a></li>)}
            </ul>
          </nav>
        </div>
        <div className="subsol-jos">
          <span>© {an} AmCupon.ro · {SITE.emailContact}</span>
          {actualizat && <span className="mono">Date actualizate: {actualizat}</span>}
        </div>
      </div>
    </footer>
  );
}
