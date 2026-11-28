import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CardProdus from "../../_ui/CardProdus";
import { criterii, criteriu, criteriiTema, dataRo } from "@/lib/criterii";
import { topPentruTema, ghiduriPentruTema } from "@/lib/legaturiInterne";
import { numeAfisat } from "@/lib/numeMagazin";
import { cuNumar } from "@/lib/acordNumeral";
import { lei } from "@/lib/formatRo";
import { termometru, ACOPERIRE_MIN } from "@/lib/termometru";
import { imagineSigura } from "@/lib/topFeed";

/**
 * „Monitoare 4K", „Puzzle de 1000 de piese" — o pagina pentru o singura caracteristica (04.11.2026), in pielea
 * noului site (25.11.2026). Produsele apar doar cu pretul confirmat pe site-ul magazinului (scripts/criterii_produse.py),
 * iar langa fiecare, termometrul pretului cand avem destule zile de istoric (data/istoric-alege.json, din 28.11).
 * Adresa, titlul si JSON-LD-ul raman cele de pe vechiul site; descrierea si FAQ-ul spun acum „confirmat la magazin",
 * nu „din feed" (pretul de pe pagina e cel citit la magazin).
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return criterii().map((c) => ({ criteriu: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ criteriu: string }> }): Promise<Metadata> {
  const { criteriu: slug } = await params;
  const c = criteriu(slug);
  if (!c) return {};
  const min = Math.min(...c.produse.map((p) => p.pret));
  const lung = `${c.titlu}: ${c.produse.length} modele, de la ${lei(min)}`;
  const title = lung.length <= 60 ? lung : `${c.titlu}: ${c.produse.length} modele`.slice(0, 60);
  const magazine = new Set(c.produse.map((p) => p.magazin)).size;
  const description = `${c.titlu}: ${cuNumar(c.produse.length, "model", "modele")} la ${magazine === 1 ? "un magazin partener" : cuNumar(magazine, "magazin partener", "magazine partenere")}, de la ${lei(min)}. Prețul confirmat la magazin și link direct la produs.`.slice(0, 158);
  const url = `https://amcupon.ro/alege/${c.slug}`;
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, siteName: "AmCupon.ro", locale: "ro_RO", type: "website" } };
}

export default async function CriteriuPage({ params }: { params: Promise<{ criteriu: string }> }) {
  const { criteriu: slug } = await params;
  const c = criteriu(slug);
  if (!c) notFound();

  const preturi = c.produse.map((p) => p.pret);
  const min = Math.min(...preturi);
  const max = Math.max(...preturi);
  const numeMagazine = [...new Set(c.produse.map((p) => numeAfisat(p.magazin)))];
  const listaMagazine = numeMagazine.length > 1 ? `${numeMagazine.slice(0, -1).join(", ")} și ${numeMagazine[numeMagazine.length - 1]}` : numeMagazine[0];
  const variante = criteriiTema(c.tema).filter((x) => x.slug !== c.slug);
  const top = topPentruTema(c.tema);
  const ghiduri = ghiduriPentruTema(c.tema);
  const url = `https://amcupon.ro/alege/${c.slug}`;
  const termo = new Map(c.produse.map((p) => [p.url, termometru(p.url_magazin, p.pret)]));
  const cuTermo = [...termo.values()].filter(Boolean).length;

  const intrebari = [
    {
      q: `Cât costă ${c.titlu.toLowerCase()}?`,
      a: `În lista de pe această pagină, prețurile merg de la ${lei(min)} la ${lei(max)}. Fiecare preț l-am citit pe site-ul magazinului, în ziua scrisă lângă produs; prețul final îl vezi în magazin.`,
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
    <div className="cadru">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />

      <nav aria-label="Breadcrumb" className="firimituri">
        <Link href="/">Acasă</Link><span aria-hidden="true">/</span>
        <Link href="/alege">Alege după caracteristică</Link><span aria-hidden="true">/</span>
        <span>{c.titlu}</span>
      </nav>

      <header className="sectiune-mica">
        <p className="eticheta">{c.tema_nume}</p>
        <h1 className="h1" style={{ marginTop: 10 }}>{c.titlu}</h1>
        <p className="lead" style={{ marginTop: 14 }}>
          <strong style={{ color: "var(--text)" }}>{cuNumar(c.produse.length, "model", "modele")} de la {lei(min)}</strong>, la {listaMagazine}. Prețul fiecăruia l-am citit pe site-ul magazinului; apeși pe produs și ajungi direct la el.
        </p>
        {c.nota && <p className="nota" style={{ marginTop: 10 }}>{c.nota}</p>}
        {variante.length > 0 && (
          <div className="chips" style={{ marginTop: 18 }} aria-label={`Alte variante: ${c.tema_nume.toLowerCase()}`}>
            {variante.map((x) => <Link key={x.slug} href={`/alege/${x.slug}`} className="chip">{x.titlu}</Link>)}
          </div>
        )}
      </header>

      <section aria-label={c.titlu} className="grila-produse">
        {c.produse.map((p, i) => (
          <CardProdus
            key={p.url}
            imediat={i < 4}
            p={{ titlu: p.titlu, pret: p.pret, imagine: imagineSigura(p.imagine), url: p.url, magazin: numeAfisat(p.magazin), confirmat: p.verificat }}
            termo={termo.get(p.url)}
          />
        ))}
      </section>

      <p className="nota" style={{ marginTop: 16 }}>
        Prețuri citite pe site-ul fiecărui magazin, în ziua scrisă pe card (lista: {dataRo(c.actualizat)}). Prețul și stocul se pot schimba între timp: le vezi în magazin.{" "}
        {cuTermo > 0
          ? `La ${cuNumar(cuTermo, "produs", "produse")} vezi și termometrul: cel mai mic și cel mai mare preț din ultimele 30 de zile.`
          : `Termometrul prețului apare după ${ACOPERIRE_MIN} zile de istoric confirmat la magazin.`}{" "}
        Linkurile sunt afiliate, iar prețul tău rămâne același.
      </p>

      {(top || ghiduri.length > 0) && (
        <section className="sectiune-mica">
          <h2 className="h3" style={{ marginBottom: 10 }}>Nu știi încă ce să alegi?</h2>
          <ul className="stiva">
            {top && <li><Link href={`/top/${top.slug}`} className="legatura">{top.titlu} →</Link></li>}
            {ghiduri.map((g) => <li key={g.slug}><Link href={`/blog/${g.slug}`} className="legatura">{g.title} →</Link></li>)}
          </ul>
        </section>
      )}

      <section className="sectiune-mica" aria-labelledby="faq-h">
        <h2 id="faq-h" className="h2" style={{ marginBottom: 8 }}>Întrebări frecvente</h2>
        <dl className="faq-simplu">
          {intrebari.map((x) => (
            <div key={x.q}><dt>{x.q}</dt><dd>{x.a}</dd></div>
          ))}
        </dl>
      </section>
    </div>
  );
}
