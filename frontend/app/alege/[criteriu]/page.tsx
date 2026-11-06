import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { criterii, criteriu, criteriiTema, dataRo } from "@/lib/criterii";
import { topPentruTema, ghiduriPentruTema } from "@/lib/legaturiInterne";
import { numeAfisat } from "@/lib/numeMagazin";
import CriteriiTema from "../../components/CriteriiTema";
import ProductDealCard from "../../components/ProductDealCard";
import { statisticiPreturi } from "@/lib/preturi";
import { pret } from "../../black-friday/comun";
import { cuNumar } from "@/lib/acordNumeral";

/**
 * „Masini de spalat de 6 kg" — o pagina pentru o singura caracteristica (04.11.2026).
 *
 * Asa apar Altex, eMAG si price.ro in cautari: o adresa pentru fiecare filtru. Aici omul vede produse reale de la
 * partenerii 2Performant, cu pretul din feed si cu link direct la produs. Titlul fiecarui produs contine caracteristica
 * (scripts/criterii_produse.py), iar textul e generat din date, deci nu poate ramane fals cand se schimba feed-ul.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return criterii().map((c) => ({ criteriu: c.slug }));
}

function minMax(preturi: number[]): { min: number; max: number } {
  return { min: Math.min(...preturi), max: Math.max(...preturi) };
}

export async function generateMetadata({ params }: { params: Promise<{ criteriu: string }> }): Promise<Metadata> {
  const { criteriu: slug } = await params;
  const c = criteriu(slug);
  if (!c) return {};
  const { min } = minMax(c.produse.map((p) => p.pret));
  const lung = `${c.titlu}: ${c.produse.length} modele, de la ${pret(min)}`;
  const title = lung.length <= 60 ? lung : `${c.titlu}: ${c.produse.length} modele`.slice(0, 60);
  const magazine = new Set(c.produse.map((p) => p.magazin)).size;
  const description = `${c.titlu}: ${cuNumar(c.produse.length, "model", "modele")} la ${magazine === 1 ? "un magazin partener" : cuNumar(magazine, "magazin partener", "magazine partenere")}, de la ${pret(min)}. Vezi prețul din feed și mergi direct la produs.`.slice(0, 158);
  const url = `https://amcupon.ro/alege/${c.slug}`;
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, siteName: "AmCupon.ro", locale: "ro_RO", type: "website" } };
}

export default async function CriteriuPage({ params }: { params: Promise<{ criteriu: string }> }) {
  const { criteriu: slug } = await params;
  const c = criteriu(slug);
  if (!c) notFound();

  const { min, max } = minMax(c.produse.map((p) => p.pret));
  const magazine = [...new Set(c.produse.map((p) => p.magazin))];
  const numeMagazine = magazine.map((m) => numeAfisat(m));
  const listaMagazine = numeMagazine.length > 1 ? `${numeMagazine.slice(0, -1).join(", ")} și ${numeMagazine[numeMagazine.length - 1]}` : numeMagazine[0];
  const inRest = criteriiTema(c.tema);
  const top = topPentruTema(c.tema);
  const ghiduri = ghiduriPentruTema(c.tema);
  const data = dataRo(c.actualizat);
  const url = `https://amcupon.ro/alege/${c.slug}`;
  const statistici = await statisticiPreturi(c.produse.map((p) => p.id || ""));

  const intrebari = [
    {
      q: `Cât costă ${c.titlu.toLowerCase()}?`,
      a: `În lista de pe această pagină, prețurile merg de la ${pret(min)} la ${pret(max)}. Sunt prețurile din feed-urile magazinelor, la ${data}; prețul final îl vezi pe site-ul magazinului.`,
    },
    {
      q: `De unde cumperi ${c.titlu.toLowerCase()}?`,
      a: `Modelele de aici sunt la ${listaMagazine}. Fiecare card duce direct la produsul din magazin.`,
    },
    {
      q: "Plătesc mai mult dacă intru de aici?",
      a: "Nu. Linkurile sunt afiliate: dacă alegi să cumperi, magazinul ne poate plăti un comision, iar prețul tău rămâne același.",
    },
  ];
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "AmCupon.ro", item: "https://amcupon.ro" },
        { "@type": "ListItem", position: 2, name: "Alege după caracteristică", item: "https://amcupon.ro/alege" },
        { "@type": "ListItem", position: 3, name: c.titlu, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: intrebari.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })),
    },
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* JSON.stringify scapa doar ce trebuie pentru JSON; `<` nu are voie in <script>. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />

      <nav aria-label="Breadcrumb" className="text-sm text-[var(--text-muted)] mb-4">
        <Link href="/" className="hover:text-[var(--accent-text)]">Acasă</Link>
        <span className="mx-1.5">/</span>
        <Link href="/alege" className="hover:text-[var(--accent-text)]">Alege după caracteristică</Link>
        <span className="mx-1.5">/</span>
        <span>{c.titlu}</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-black text-[var(--foreground)] leading-tight">{c.titlu}</h1>
      <p className="mt-3 text-lg text-[var(--text-soft)] max-w-3xl">
        <strong className="text-[var(--foreground)]">{cuNumar(c.produse.length, "model", "modele")} de la {pret(min)}</strong>, la {listaMagazine}. Apeși pe produs și ajungi direct la el în magazin, fără să mai cauți.
      </p>
      {c.nota && <p className="mt-2 text-sm text-[var(--text-soft)] max-w-3xl">{c.nota}</p>}

      <CriteriiTema lista={inRest} activ={c.slug} titlu={`Alte variante: ${c.tema_nume.toLowerCase()}`} />

      <section aria-label={c.titlu} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {c.produse.map((p, i) => (
          <ProductDealCard
            imediat={i < 8}
            key={p.url}
            titlu={p.titlu}
            pret={p.pret}
            pretVechi={p.pret_vechi}
            imagine={p.imagine}
            url={p.url}
            magazin={numeAfisat(p.magazin)}
            dataPret={p.verificat ? dataRo(p.verificat) : data}
            dePeSite={Boolean(p.verificat)}
            stat={p.id ? statistici.get(p.id) : null}
          />
        ))}
      </section>

      <p className="mt-4 text-xs text-[var(--text-muted)] max-w-3xl">
        Prețuri din feed-urile magazinelor, la {data}. Prețul tăiat e cel anunțat de magazin. Prețul și stocul pot diferi între timp: le vezi pe site-ul magazinului. Linkurile sunt afiliate, iar prețul tău rămâne același.
      </p>

      {(top || ghiduri.length > 0) && (
        <section className="mt-10">
          <h2 className="text-lg font-black text-[var(--foreground)] mb-3">Nu știi încă ce să alegi?</h2>
          <ul className="space-y-2 text-sm">
            {top && (
              <li>
                <Link href={`/top/${top.slug}`} className="text-[var(--accent-text)] font-bold hover:underline">{top.titlu} &rarr;</Link>
              </li>
            )}
            {ghiduri.map((g) => (
              <li key={g.slug}>
                <Link href={`/blog/${g.slug}`} className="text-[var(--accent-text)] font-bold hover:underline">{g.title} &rarr;</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-black text-[var(--foreground)] mb-3">Întrebări frecvente</h2>
        <dl className="space-y-4">
          {intrebari.map((x) => (
            <div key={x.q}>
              <dt className="font-bold text-[var(--foreground)]">{x.q}</dt>
              <dd className="text-sm text-[var(--text-soft)] mt-1">{x.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
