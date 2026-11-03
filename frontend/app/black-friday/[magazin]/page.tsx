import fs from "fs";
import path from "path";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { campaniiBF, toateCampaniileBF, type CampanieBF } from "@/lib/campaniiBlackFriday";
import { linkAfiliat } from "@/lib/linkMagazin";
import { alMagazinului } from "@/lib/produseMagazin";
import { imagineSigura, titluAfisat, type ProdusFeed } from "@/lib/topFeed";

/**
 * „Black Friday <magazin> 2026" — o pagina pentru fiecare partener cu campanie anuntata (04.11.2026).
 *
 * De ce: cine cauta „black friday noriel" e aproape de cumparare, iar concurenta pe aceste cautari e mica.
 * Pagina raspunde la ce intreaba omul (cand incepe, pana cand, ce anunta magazinul), arata produsele
 * reale din feed cu pretul de azi si trimite prin linkul platit. Totul din date, nimic scris de mana:
 * datele campaniei de la magazin (scripts/calendar_black_friday.py), produsele din feed, „sub minimul din
 * 30 de zile" din istoricul nostru (public/scaderi-pret.json).
 *
 * Campania terminata ramane cu pagina pana la sfarsitul anului, marcata „s-a incheiat": adresa nu trebuie sa
 * dea 404 dupa ce a fost trimisa la indexare.
 */
export const dynamicParams = false;

interface Magazin {
  magazin: string;
  url?: string;
  url_afiliat?: string;
  categorie_slug?: string;
  promotii?: unknown[];
  are_promotie?: boolean;
}
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

let _magazine: Map<string, Magazin> | null = null;
function magazine(): Map<string, Magazin> {
  if (!_magazine) _magazine = new Map(citeste<Magazin[]>("output.json", []).map((m) => [m.magazin, m]));
  return _magazine;
}

let _produse: ProdusFeed[] | null = null;
function produse(): ProdusFeed[] {
  if (!_produse) {
    const raw = citeste<{ products?: ProdusFeed[] } | ProdusFeed[]>("products.json", []);
    _produse = Array.isArray(raw) ? raw : raw.products || [];
  }
  return _produse;
}

const azi = () => new Date().toISOString().slice(0, 10);
const zi = (iso: string, luna: "long" | "short" = "long") =>
  new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: luna, timeZone: "UTC" }).format(new Date(iso + "T00:00:00Z"));
const pret = (n: number) => `${n.toLocaleString("ro-RO", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} lei`;

function interval(c: CampanieBF): string {
  return c.start === c.final ? zi(c.start) : `${zi(c.start)} – ${zi(c.final)}`;
}

function stare(c: CampanieBF, ziua: string): "urmeaza" | "acum" | "incheiata" {
  if (c.final < ziua) return "incheiata";
  return c.start <= ziua ? "acum" : "urmeaza";
}

function campanie(slug: string): CampanieBF | null {
  return toateCampaniileBF().find((c) => c.magazin === slug) || null;
}

export function generateStaticParams() {
  return toateCampaniileBF().filter((c) => magazine().has(c.magazin)).map((c) => ({ magazin: c.magazin }));
}

export async function generateMetadata({ params }: { params: Promise<{ magazin: string }> }): Promise<Metadata> {
  const { magazin } = await params;
  const c = campanie(decodeURIComponent(magazin));
  if (!c) return {};
  const scurt = c.start === c.final ? zi(c.start, "short") : `${zi(c.start, "short")} – ${zi(c.final, "short")}`;
  const lung = `Black Friday ${c.nume} 2026: ${scurt}`;
  const title = lung.length <= 60 ? lung : `Black Friday ${c.nume} 2026`;
  const description = `Black Friday la ${c.nume}: ${interval(c)}. ${c.nota ? `${c.nota}. ` : ""}Datele campaniei, produsele de azi și cum verifici dacă reducerea e reală.`
    .replace(/\.\./g, ".").slice(0, 158);
  const url = `https://amcupon.ro/black-friday/${c.magazin}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: "AmCupon.ro", locale: "ro_RO", type: "article" },
  };
}

function CardProdus({ p, nota }: { p: { url?: string; title?: string; image?: string; price?: number }; nota?: string }) {
  const titlu = titluAfisat(p.title);
  const img = imagineSigura(p.image);
  return (
    <a
      href={p.url}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 hover:border-[var(--border-strong)] transition-colors"
    >
      <div className="aspect-square w-full rounded-lg bg-white overflow-hidden flex items-center justify-center">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element -- imagini externe din feed, fara pipeline de optimizare (vezi MagazinCard)
          <img src={img} alt={titlu} loading="lazy" decoding="async" className="h-full w-full object-contain" />
        ) : null}
      </div>
      <p className="mt-2 text-sm leading-snug line-clamp-2">{titlu}</p>
      {typeof p.price === "number" && p.price > 0 && <p className="mt-1 font-black">{pret(p.price)}</p>}
      {nota && <p className="text-xs text-[var(--accent-text)] mt-0.5">{nota}</p>}
    </a>
  );
}

export default async function BlackFridayMagazinPage({ params }: { params: Promise<{ magazin: string }> }) {
  const { magazin } = await params;
  const slug = decodeURIComponent(magazin);
  const c = campanie(slug);
  const m = magazine().get(slug);
  if (!c || !m) notFound();

  const ziua = azi();
  const st = stare(c, ziua);
  const link = linkAfiliat(m as Parameters<typeof linkAfiliat>[0]);

  // Produsele aflate azi sub minimul din 30 de zile la acest magazin (istoricul nostru), apoi restul feed-ului.
  const sub = citeste<{ produse?: ProdusScadere[] }>("scaderi-pret.json", {}).produse?.filter((p) => p.merchant_slug === slug) || [];
  const urlSub = new Set(sub.map((p) => p.url));
  const dinFeed = produse()
    .filter((p) => alMagazinului(p, slug) && !p.is_promo && typeof p.price === "number" && p.price > 0 && p.url && imagineSigura(p.image) && !urlSub.has(p.url));
  const lista = dinFeed.slice(0, Math.max(0, 8 - sub.length));

  // Alte campanii din aceeasi categorie, apoi restul celor active: linkuri interne utile, nu o lista oarecare.
  const alte = campaniiBF(ziua)
    .filter((x) => x.magazin !== slug && magazine().has(x.magazin))
    .sort((a, b) =>
      Number(magazine().get(b.magazin)?.categorie_slug === m.categorie_slug) - Number(magazine().get(a.magazin)?.categorie_slug === m.categorie_slug))
    .slice(0, 6);

  const intrebari = [
    {
      q: `Când începe Black Friday la ${c.nume}?`,
      a: st === "urmeaza"
        ? `Campania anunțată de ${c.nume} începe pe ${zi(c.start)} și ține până pe ${zi(c.final)}.`
        : st === "acum"
          ? `Campania a început pe ${zi(c.start)} și ține până pe ${zi(c.final)}.`
          : `Campania anunțată a ținut din ${zi(c.start)} până pe ${zi(c.final)} și s-a încheiat.`,
    },
    {
      q: `Are ${c.nume} cod de reducere de Black Friday?`,
      a: c.are_cod
        ? `Da, campania are un cod anunțat de magazin. Îl vezi pe pagina de oferte ${c.nume}, împreună cu condițiile lui.`
        : `Campania anunțată nu are cod în datele primite de noi: reducerile se văd direct în preț. Dacă apare un cod, îl publicăm pe pagina de oferte ${c.nume}.`,
    },
    {
      q: `Cum știu dacă o reducere de Black Friday la ${c.nume} e reală?`,
      a: "În România, prețul tăiat de lângă o reducere trebuie să fie cel mai mic preț practicat de magazin în ultimele 30 de zile (HG 686/2022). Notează prețul produsului înainte de campanie și compară-l cu cel din ziua reducerii.",
    },
    {
      q: "Pot returna ce cumpăr de Black Friday?",
      a: "La cumpărăturile online ai 14 zile să returnezi produsul fără să explici de ce, socotite din ziua în care îl primești (OUG 34/2014). Excepțiile sunt, de exemplu, produsele personalizate și cele sigilate desfăcute din motive de igienă.",
    },
  ];

  const url = `https://amcupon.ro/black-friday/${c.magazin}`;
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: intrebari.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "AmCupon.ro", item: "https://amcupon.ro" },
      { "@type": "ListItem", position: 2, name: "Black Friday", item: "https://amcupon.ro/black-friday" },
      { "@type": "ListItem", position: 3, name: c.nume, item: url },
    ],
  };
  const eveniment = {
    "@context": "https://schema.org",
    "@type": "SaleEvent",
    name: `Black Friday ${c.nume} 2026`,
    startDate: c.start,
    endDate: c.final,
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: { "@type": "VirtualLocation", url: m.url || url },
    organizer: { "@type": "Organization", name: c.nume, url: m.url || url },
    ...(c.descriere ? { description: c.descriere } : {}),
  };

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* `<` scapat: textul campaniei vine de la magazine, iar „</script>" nu trebuie sa inchida blocul. */}
      {[eveniment, faqSchema, breadcrumb].map((j) => (
        <script key={j["@type"]} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(j).replace(/</g, "\\u003c") }} />
      ))}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <nav className="text-xs text-[var(--text-muted)] mb-4">
          <Link href="/black-friday" className="hover:text-[var(--accent-text)]">Black Friday</Link> / {c.nume}
        </nav>
        <p className="text-sm font-semibold text-[var(--accent-text)]">
          {st === "acum" ? "În desfășurare" : st === "urmeaza" ? "Urmează" : "S-a încheiat"}
        </p>
        <h1 className="text-3xl font-black mt-1">Black Friday {c.nume} 2026</h1>
        <p className="text-lg mt-2">{interval(c)}</p>
        {c.nota && <p className="text-[var(--text-soft)] mt-1">{c.nota}</p>}

        <div className="flex flex-wrap gap-3 mt-5">
          {link && st !== "incheiata" && (
            <a href={link} target="_blank" rel="nofollow sponsored noopener noreferrer"
              className="inline-block rounded-lg bg-[var(--accent)] px-5 py-3 font-black text-[#0c1000] hover:opacity-90">
              Mergi la {c.nume} →
            </a>
          )}
          <Link href={`/cod-reducere/${c.magazin}`} className="inline-block rounded-lg border border-[var(--border)] px-5 py-3 font-semibold hover:border-[var(--border-strong)]">
            {c.are_cod ? `Vezi codul și ofertele ${c.nume}` : `Ofertele ${c.nume}`}
          </Link>
        </div>

        {c.descriere && (
          <section className="mt-8">
            <h2 className="text-lg font-black">Ce anunță {c.nume} despre campanie</h2>
            <blockquote className="mt-2 border-l-2 border-[var(--accent)] pl-4 text-[var(--text-soft)]">{c.descriere}</blockquote>
            <p className="text-xs text-[var(--text-muted)] mt-2">Textul și reducerile sunt ale magazinului; le-am primit prin rețeaua de afiliere 2Performant.</p>
          </section>
        )}

        {sub.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-black">Sub minimul din ultimele 30 de zile</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">Produse {c.nume} mai ieftine azi decât cel mai mic preț văzut de noi în ultima lună.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              {sub.slice(0, 8).map((p) => (
                <CardProdus key={p.url} p={{ url: p.url, title: p.title, image: p.image, price: p.pret }} nota={`−${p.scadere_pct}% față de ${pret(p.minim_30_zile)}`} />
              ))}
            </div>
          </section>
        )}

        {lista.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-black">Produse {c.nume} cu prețul de azi</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Din feed-ul magazinului, la ultima actualizare. Notează prețul acum și compară-l în campanie.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              {lista.map((p) => <CardProdus key={p.url} p={p} />)}
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

        {alte.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-black">Alte campanii de Black Friday</h2>
            <ul className="grid gap-2 sm:grid-cols-2 mt-2">
              {alte.map((x) => (
                <li key={x.magazin}>
                  <Link href={`/black-friday/${x.magazin}`} className="block rounded-lg border border-[var(--border)] p-3 hover:border-[var(--border-strong)]">
                    <span className="font-semibold">{x.nume}</span>
                    <span className="block text-xs text-[var(--text-muted)]">{interval(x)}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/black-friday" className="inline-block mt-3 text-sm font-semibold text-[var(--accent-text)]">
              Tot calendarul Black Friday →
            </Link>
          </section>
        )}

        <p className="text-xs text-[var(--text-muted)] mt-8">
          Datele campaniei sunt anunțate de magazin și le actualizăm de trei ori pe zi. Când cumperi prin AmCupon, magazinul ne poate
          plăti un comision; prețul pentru tine e același.
        </p>
      </div>
    </main>
  );
}
