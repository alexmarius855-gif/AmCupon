import { Metadata } from "next";
import Link from "next/link";
import { criterii, temeCriterii } from "@/lib/criterii";
import { pret } from "../black-friday/comun";

const url = "https://amcupon.ro/alege";

export function generateMetadata(): Metadata {
  const n = criterii().length;
  const title = "Alege după caracteristică: kg, inch, litri, GB";
  const description = `${n} liste de produse pe o singură caracteristică: mașini de spălat de 6 kg, televizoare de 55 inch, friteuze de 5 litri. Prețuri din feed și link direct la produs.`;
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, siteName: "AmCupon.ro", locale: "ro_RO", type: "website" } };
}

/** Hubul paginilor pe caracteristici: de aici Google si omul ajung la fiecare, dintr-un clic. */
export default function AlegePage() {
  const teme = temeCriterii();
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-black text-[var(--foreground)] leading-tight">Știi deja ce vrei? Alege după caracteristică</h1>
      <p className="mt-3 text-lg text-[var(--text-soft)] max-w-3xl">
        6 kg, 55 inch, 5 litri, 16 GB: apeși pe ce te interesează și vezi doar produsele care au caracteristica asta, cu prețul din feed și link direct în magazin.
      </p>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {teme.map((t) => (
          <section key={t.tema}>
            <h2 className="text-lg font-black text-[var(--foreground)] mb-3">{t.nume}</h2>
            <ul className="space-y-1.5">
              {t.criterii.map((c) => (
                <li key={c.slug} className="text-sm">
                  <Link href={`/alege/${c.slug}`} className="text-[var(--text-soft)] hover:text-[var(--accent-text)] transition-colors">
                    {c.titlu}
                  </Link>
                  <span className="text-[var(--text-muted)]"> · de la {pret(Math.min(...c.produse.map((p) => p.pret)))}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p className="mt-10 text-xs text-[var(--text-muted)] max-w-3xl">
        Prețurile vin din feed-urile magazinelor partenere și pot diferi pe site-ul magazinului. Linkurile sunt afiliate, iar prețul tău rămâne același.
      </p>
    </main>
  );
}
