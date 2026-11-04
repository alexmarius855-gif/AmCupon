import fs from "fs";
import path from "path";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoriiBF, toateCampaniileBF, type CampanieBF } from "@/lib/campaniiBlackFriday";
import { imagineSigura, type ProdusFeed } from "@/lib/topFeed";
import { CardProdus, interval, pret, stare, zi } from "../../comun";

/**
 * „Black Friday cărți 2026" — campaniile partenerilor dintr-o categorie (04.11.2026).
 *
 * Cine cauta „black friday carti" sau „black friday haine" n-a ales inca magazinul: pagina ii arata cine are
 * campanie, cand, si produse reale cu pretul de azi. Lista categoriilor o decide
 * scripts/calendar_black_friday.py (minimum 3 campanii), deci sitemap-ul, pagina si IndexNow nu pot diverge.
 */
export const dynamicParams = false;

const azi = () => new Date().toISOString().slice(0, 10);
const LA_MAXIM = 8;

interface ProdusScadere {
  url?: string;
  title?: string;
  image?: string;
  merchant_slug?: string;
  pret: number;
  minim_30_zile: number;
  scadere_pct: number;
}

function citeste<T>(fisier: string, rezerva: T): T {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", fisier), "utf-8")) as T;
  } catch {
    return rezerva;
  }
}

function campaniiDin(slug: string): CampanieBF[] {
  return toateCampaniileBF().filter((c) => c.categorie === slug);
}

/** „1 magazin", „7 magazine", „20 de magazine". */
function magazine(n: number): string {
  if (n === 1) return "1 magazin";
  return `${n}${n >= 20 ? " de" : ""} magazine`;
}

export function generateStaticParams() {
  return categoriiBF().map((k) => ({ categorie: k.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ categorie: string }> }): Promise<Metadata> {
  const { categorie } = await params;
  const k = categoriiBF().find((x) => x.slug === categorie);
  if (!k) return {};
  const lista = campaniiDin(k.slug);
  const title = `Black Friday ${k.nume} 2026: ${magazine(lista.length)}`;
  const description = `Când începe Black Friday ${k.nume} în 2026: datele la ${magazine(lista.length)} din România (${lista.slice(0, 3).map((c) => c.nume).join(", ")}...), cu produse și prețuri de azi.`.slice(0, 158);
  const url = `https://amcupon.ro/black-friday/categorie/${k.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "AmCupon.ro", locale: "ro_RO", type: "article" },
  };
}

export default async function BlackFridayCategoriePage({ params }: { params: Promise<{ categorie: string }> }) {
  const { categorie } = await params;
  const k = categoriiBF().find((x) => x.slug === categorie);
  if (!k) notFound();

  const ziua = azi();
  const toate = campaniiDin(k.slug);
  // Intai ce se poate cumpara azi, apoi ce urmeaza; campaniile terminate la final.
  const ordine = { acum: 0, urmeaza: 1, incheiata: 2 };
  const lista = [...toate].sort((a, b) => ordine[stare(a, ziua)] - ordine[stare(b, ziua)] || a.start.localeCompare(b.start));
  const inCurs = toate.filter((c) => stare(c, ziua) === "acum");
  const urmeaza = toate.filter((c) => stare(c, ziua) === "urmeaza");
  const slugs = new Set(toate.map((c) => c.magazin));

  // Produse sub minimul din 30 de zile (istoricul nostru), apoi cate unul-doua de la fiecare magazin, ca lista sa
  // nu fie doar a celui mai mare catalog.
  const sub = (citeste<{ produse?: ProdusScadere[] }>("scaderi-pret.json", {}).produse || [])
    .filter((p) => p.merchant_slug && slugs.has(p.merchant_slug))
    .slice(0, LA_MAXIM);
  const urlSub = new Set(sub.map((p) => p.url));
  const raw = citeste<{ products?: ProdusFeed[] } | ProdusFeed[]>("products.json", []);
  const toateProdusele = Array.isArray(raw) ? raw : raw.products || [];
  const peMagazin = new Map<string, number>();
  const dinFeed: ProdusFeed[] = [];
  for (const p of toateProdusele) {
    if (dinFeed.length >= LA_MAXIM - Math.min(sub.length, LA_MAXIM)) break;
    const m = p.merchant_slug || "";
    if (!slugs.has(m) || p.is_promo || typeof p.price !== "number" || p.price <= 0 || !p.url || !imagineSigura(p.image) || urlSub.has(p.url)) continue;
    if ((peMagazin.get(m) || 0) >= 2) continue;
    peMagazin.set(m, (peMagazin.get(m) || 0) + 1);
    dinFeed.push(p);
  }

  const prima = [...toate].sort((a, b) => a.start.localeCompare(b.start))[0];
  const intrebari = [
    {
      q: `Ce magazine de ${k.nume} au Black Friday în 2026?`,
      a: `La partenerii noștri, ${magazine(toate.length)}: ${toate.map((c) => c.nume).join(", ")}. Sunt doar campaniile anunțate prin rețeaua de afiliere 2Performant, nu toată piața.`,
    },
    {
      q: `Când începe Black Friday la ${k.nume}?`,
      a: prima
        ? `Fiecare magazin are datele lui. Prima campanie din listă începe pe ${zi(prima.start)} (${prima.nume}). ${inCurs.length ? `Acum sunt în desfășurare ${magazine(inCurs.length)}. ` : ""}${urmeaza.length ? `Mai urmează ${magazine(urmeaza.length)}.` : ""}`.trim()
        : "Fiecare magazin are datele lui.",
    },
    {
      q: "Cum știu dacă o reducere de Black Friday e reală?",
      a: "În România, prețul tăiat de lângă o reducere trebuie să fie cel mai mic preț practicat de magazin în ultimele 30 de zile (HG 686/2022). Notează prețul produsului înainte de campanie și compară-l cu cel din ziua reducerii.",
    },
  ];

  const url = `https://amcupon.ro/black-friday/categorie/${k.slug}`;
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: intrebari.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Black Friday ${k.nume} 2026`,
      itemListElement: lista.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `Black Friday ${c.nume}`,
        url: `https://amcupon.ro/black-friday/${c.magazin}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "AmCupon.ro", item: "https://amcupon.ro" },
        { "@type": "ListItem", position: 2, name: "Black Friday", item: "https://amcupon.ro/black-friday" },
        { "@type": "ListItem", position: 3, name: k.nume, item: url },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* `<` scapat: numele si textele vin din datele magazinelor. */}
      {schema.map((j) => (
        <script key={j["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(j).replace(/</g, "\\u003c") }} />
      ))}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <nav className="text-xs text-[var(--text-muted)] mb-4">
          <Link href="/black-friday" className="hover:text-[var(--accent-text)]">Black Friday</Link> / {k.nume}
        </nav>
        <h1 className="text-3xl font-black">Black Friday {k.nume} 2026</h1>
        <p className="text-[var(--text-soft)] mt-2">
          Datele de Black Friday la {magazine(toate.length)} partenere.
          {inCurs.length > 0 && ` ${inCurs.length === 1 ? "Una e" : `${inCurs.length} sunt`} în desfășurare.`}
          {urmeaza.length > 0 && ` ${urmeaza.length === 1 ? "Una urmează" : `${urmeaza.length} urmează`}.`}
        </p>

        <section className="mt-6">
          <h2 className="text-lg font-black">Campaniile, în ordine</h2>
          <ul className="grid gap-3 sm:grid-cols-2 mt-3">
            {lista.map((c) => {
              const st = stare(c, ziua);
              return (
                <li key={c.magazin} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                  <p className="text-xs font-semibold text-[var(--text-muted)]">
                    {st === "acum" ? "În desfășurare" : st === "urmeaza" ? "Urmează" : "S-a încheiat"} · {interval(c)}
                  </p>
                  <h3 className="font-bold mt-0.5">
                    <Link href={`/black-friday/${c.magazin}`} className="hover:text-[var(--accent-text)]">Black Friday {c.nume}</Link>
                  </h3>
                  {c.nota && <p className="text-xs text-[var(--text-muted)] mt-1">{c.nota}</p>}
                </li>
              );
            })}
          </ul>
        </section>

        {sub.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-black">Sub minimul din ultimele 30 de zile</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">Mai ieftine azi decât cel mai mic preț văzut de noi în ultima lună.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              {sub.map((p) => (
                <CardProdus key={p.url} p={{ url: p.url, title: p.title, image: p.image, price: p.pret }} nota={`−${p.scadere_pct}% față de ${pret(p.minim_30_zile)}`} />
              ))}
            </div>
          </section>
        )}

        {dinFeed.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-black">Produse cu prețul de azi</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Din feed-urile magazinelor de mai sus, la ultima actualizare. Notează prețul acum și compară-l în campanie.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              {dinFeed.map((p) => <CardProdus key={p.url} p={p} />)}
            </div>
          </section>
        )}

        <section className="mt-8">
          <h2 className="text-lg font-black">Întrebări frecvente</h2>
          <div className="mt-2 space-y-2">
            {intrebari.map((i) => (
              <details key={i.q} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3" open>
                <summary className="font-semibold cursor-pointer">{i.q}</summary>
                <p className="text-sm text-[var(--text-soft)] mt-2">{i.a}</p>
              </details>
            ))}
          </div>
        </section>

        <p className="mt-6 text-sm font-semibold text-[var(--accent-text)]">
          <Link href="/black-friday">Tot calendarul Black Friday →</Link>
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-4">
          Datele campaniilor sunt anunțate de magazine și le actualizăm de trei ori pe zi. Când cumperi prin AmCupon, magazinul ne poate
          plăti un comision; prețul pentru tine e același.
        </p>
      </div>
    </main>
  );
}
