import type { Metadata } from "next";
import Link from "next/link";
import Cautator, { type TemaCautator } from "../_ui/Cautator";
import { criterii, temeCriterii } from "@/lib/criterii";
import { numeAfisat } from "@/lib/numeMagazin";
import { cuNumar } from "@/lib/acordNumeral";
import { lei } from "@/lib/formatRo";
import { imagineSigura } from "@/lib/topFeed";

const url = "https://amcupon.ro/alege";

export function generateMetadata(): Metadata {
  const n = criterii().length;
  const title = "Alege după caracteristică: kg, inch, litri, GB";
  const description = `${n} liste de produse pe o singură caracteristică: mașini de spălat de 6 kg, televizoare de 55 inch, friteuze de 5 litri. Prețul confirmat la magazin și link direct la produs.`;
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, siteName: "AmCupon.ro", locale: "ro_RO", type: "website" } };
}

/** Hubul paginilor pe caracteristici (noul site): cautatorul, apoi lista completa, ca Google sa ajunga la fiecare. */
export default function AlegePage() {
  const teme = temeCriterii();
  const pentruCautator: TemaCautator[] = teme.map((t) => ({
    tema: t.tema,
    nume: t.nume,
    criterii: t.criterii.map((c) => ({
      slug: c.slug, titlu: c.titlu, modele: c.produse.length, dela: Math.min(...c.produse.map((p) => p.pret)),
      produse: [...c.produse].sort((a, b) => a.pret - b.pret).slice(0, 3).map((p) => ({
        titlu: p.titlu, pret: p.pret, imagine: imagineSigura(p.imagine) || undefined, url: p.url, magazin: numeAfisat(p.magazin), confirmat: p.verificat,
      })),
    })),
  }));
  const total = teme.reduce((n, t) => n + t.criterii.length, 0);

  return (
    <div className="cadru">
      <nav aria-label="Breadcrumb" className="firimituri">
        <Link href="/">Acasă</Link><span aria-hidden="true">/</span><span>Alege după caracteristică</span>
      </nav>
      <header className="sectiune-mica" style={{ maxWidth: 820 }}>
        <p className="eticheta">Găsește-l</p>
        <h1 className="h1" style={{ marginTop: 10 }}>Știi deja ce vrei? Alege după caracteristică</h1>
        <p className="lead" style={{ marginTop: 14 }}>
          6 kg, 55 inch, 5 litri, 16 GB: apeși pe ce te interesează și vezi doar produsele care au caracteristica asta, cu
          prețul citit pe site-ul magazinului și link direct la produs.
        </p>
      </header>

      <div style={{ maxWidth: 820 }}>
        <Cautator teme={pentruCautator} />
      </div>

      <section className="sectiune" aria-labelledby="toate-h">
        <h2 id="toate-h" className="h2" style={{ marginBottom: 16 }}>Toate cele {cuNumar(total, "pagină", "pagini")}</h2>
        <div className="harta">
          {teme.map((t) => (
            <nav key={t.tema} aria-label={t.nume}>
              <h3>{t.nume}</h3>
              <ul>
                {t.criterii.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/alege/${c.slug}`}>{c.titlu}</Link>
                    <span className="mono" style={{ color: "var(--text-3)", fontSize: ".75rem" }}> · de la {lei(Math.min(...c.produse.map((p) => p.pret)))}</span>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className="nota" style={{ marginTop: 22 }}>
          O pagină apare doar după ce am citit fiecare produs și am confirmat cel puțin 4 prețuri pe site-ul magazinului în ultimele 10 zile.
          Linkurile sunt afiliate, iar prețul tău rămâne același.
        </p>
      </section>
    </div>
  );
}
