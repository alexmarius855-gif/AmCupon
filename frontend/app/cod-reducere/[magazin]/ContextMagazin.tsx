import Link from "next/link";
import { statisticiFeed, lei, type ProdusStat } from "../../../lib/statisticiMagazin";

/**
 * Context real despre magazin — adancimea care ne lipsea fata de concurenta.
 *
 * Masurat pe acelasi magazin (112coffee.com), 16.08.2026: pagina noastra avea
 * 3.273 caractere de text si 6 titluri, a concurentului 9.762 si 19. Iar
 * concurentul (~350k vizite/luna) are in tot sitemap-ul 998 de pagini de magazin
 * si 4 alte pagini — pagina de magazin nu e o pagina printre altele, e afacerea.
 *
 * Componenta e SERVER (fara "use client"): textul trebuie sa existe in HTML-ul
 * livrat, nu sa apara dupa hidratare. Se paseaza ca prop catre MagazinClient,
 * care e client component.
 *
 * REGULA: fiecare cifra de aici e calculata din date reale (feed-ul de produse,
 * studiul propriu). Nimic estimat, nimic "de umplutura". Unde nu avem destule
 * date, sectiunea pur si simplu nu se randeaza — o pagina scurta si adevarata e
 * mai buna decat una lunga si inventata.
 */

export interface CategorieStudiu {
  slug: string;
  nume: string;
  magazine: number;
  cu_promotie: number;
  reducere_mediana: number | null;
}

export default function ContextMagazin({
  nume, produse, categorieSlug, categorie, urlSite, categorieStudiu, intrebari = [], pasi = [],
}: {
  nume: string;
  produse: ProdusStat[];
  categorieSlug?: string;
  categorie?: string;
  urlSite?: string;
  categorieStudiu?: CategorieStudiu | null;
  /** Intrebarile frecvente — ACELEASI care intra in schema FAQPage (vezi page.tsx). */
  intrebari?: { i: string; r: string }[];
  /** Pasii de folosire a codului — ACEIASI care intra in schema HowTo (page.tsx). */
  pasi?: { titlu: string; text: string }[];
}) {
  const stat = statisticiFeed(produse);
  const cat = categorieStudiu;
  const numeCat = cat?.nume || categorie;

  if (!stat && !cat && intrebari.length === 0 && pasi.length === 0) return null;

  return (
    <section className="max-w-5xl mx-auto px-4 pb-8">
      <div className="grid md:grid-cols-2 gap-4">

        {/* ── Ce urmarim la magazin (doar cu feed) ─────────────────────────── */}
        {stat && (
          <div className="bg-[#14181c] border border-[#1f2329] rounded-xl p-5">
            <h2 className="text-lg font-black text-[#ffffff] mb-1">Ce preturi are {nume}</h2>
            <p className="text-xs text-[#9399a0] mb-4">
              Calculat din cele {stat.total.toLocaleString("ro-RO")} de produse pe care le
              urmarim automat in catalogul magazinului.
            </p>

            <dl className="grid grid-cols-3 gap-3 mb-4">
              {[
                { et: "Cel mai ieftin", v: lei(stat.pretMin) },
                { et: "Pret median", v: lei(stat.pretMedian) },
                { et: "Cel mai scump", v: lei(stat.pretMax) },
              ].map((x) => (
                <div key={x.et} className="bg-[#1f2329] rounded-xl p-3">
                  <dt className="text-[10px] uppercase tracking-wider text-[#9399a0] mb-1">{x.et}</dt>
                  <dd className="text-sm font-black text-[#ffffff] tabular-nums">{x.v}</dd>
                </div>
              ))}
            </dl>

            <p className="text-sm text-[#c9ced5] leading-relaxed">
              Jumatate din produsele urmarite costa sub {lei(stat.pretMedian)}.
              {stat.cuReducere > 0 && (
                <> Chiar acum, <strong className="text-[#ffffff]">{stat.cuReducere}</strong>{" "}
                  {stat.cuReducere === 1 ? "produs are" : "produse au"} pretul taiat fata de cel initial.</>
              )}{" "}
              Pretul median spune mai mult decat cel mai mic pret afisat pe site:
              arata unde se afla cu adevarat majoritatea produselor.
            </p>
          </div>
        )}

        {/* ── Magazinul in categoria lui (toate magazinele) ─────────────────── */}
        {cat && (
          <div className="bg-[#14181c] border border-[#1f2329] rounded-xl p-5">
            <h2 className="text-lg font-black text-[#ffffff] mb-1">{nume} fata de restul categoriei</h2>
            <p className="text-xs text-[#9399a0] mb-4">
              Date din studiul nostru pe magazinele online din Romania.
            </p>

            <ul className="space-y-2.5 text-sm text-[#c9ced5] mb-4">
              <li className="flex justify-between gap-3 border-b border-[#1f2329] pb-2.5">
                <span>Magazine urmarite in {numeCat}</span>
                <strong className="text-[#ffffff] tabular-nums">{cat.magazine}</strong>
              </li>
              <li className="flex justify-between gap-3 border-b border-[#1f2329] pb-2.5">
                <span>Cu promotie activa acum</span>
                <strong className="text-[#ffffff] tabular-nums">{cat.cu_promotie}</strong>
              </li>
              {cat.reducere_mediana !== null && (
                <li className="flex justify-between gap-3">
                  <span>Reducere tipica in categorie</span>
                  <strong className="text-[#ddf93c] tabular-nums">{cat.reducere_mediana}%</strong>
                </li>
              )}
            </ul>

            <p className="text-sm text-[#c9ced5] leading-relaxed mb-4">
              {cat.reducere_mediana !== null ? (
                <>Cand vezi o reducere sub {cat.reducere_mediana}% la {numeCat?.toLowerCase()},
                  merita sa mai astepti &mdash; e sub cat se ofera de obicei in categorie.</>
              ) : (
                <>Prea putine magazine din {numeCat?.toLowerCase()} declara un procent de reducere
                  ca sa putem publica o valoare tipica onesta.</>
              )}
            </p>

            <div className="flex flex-wrap gap-2">
              {categorieSlug && (
                <Link href={`/categorii/${categorieSlug}`}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#1f2329] text-[#c9ced5] border border-[#2a2f36] hover:text-[#ddf93c] hover:border-[#c9ced5] transition-colors">
                  Toate magazinele din {numeCat}
                </Link>
              )}
              <Link href="/studiu/coduri-reducere-romania"
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#1f2329] text-[#c9ced5] border border-[#2a2f36] hover:text-[#ddf93c] hover:border-[#c9ced5] transition-colors">
                Cum am masurat
              </Link>
              {urlSite && (
                <a href={urlSite} target="_blank" rel="noopener noreferrer nofollow"
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#1f2329] text-[#c9ced5] border border-[#2a2f36] hover:text-[#ddf93c] hover:border-[#c9ced5] transition-colors">
                  Site oficial {nume}
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Cum folosesti codul, VIZIBIL ───────────────────────────────────
          Aceleasi date din care se construieste schema HowTo in page.tsx, ca sa
          nu poata diverge — aceeasi regula ca la FAQ. Google a retras rezultatele
          imbogatite HowTo, deci valoarea e in textul citit de om, nu in marcaj. */}
      {pasi.length > 0 && (
        <div id="cum-folosesti" className="mt-4 bg-[#14181c] border border-[#1f2329] rounded-xl p-5">
          <h2 className="text-lg font-black text-[#ffffff] mb-1">Cum aplici un cod de reducere pe {nume}</h2>
          <p className="text-xs text-[#9399a0] mb-4">Dureaza sub doua minute.</p>
          <ol className="space-y-3">
            {pasi.map((p, i) => (
              <li key={p.titlu} className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[#ddf93c] text-[#0c1000] font-black text-xs flex items-center justify-center tabular-nums">
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <h3 className="text-sm font-bold text-[#ffffff] mb-0.5">{p.titlu}</h3>
                  <p className="text-sm text-[#c9ced5] leading-relaxed">{p.text}</p>
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* ── Intrebari frecvente, VIZIBILE ──────────────────────────────────
          Pana pe 16.08.2026 aceste 5 intrebari existau DOAR in schema FAQPage,
          pe toate cele 1.162 de pagini de magazin, fara sa apara nicaieri pe
          pagina. Google cere ca un continut marcat FAQPage sa fie vizibil —
          marcajul ascuns e motiv de actiune manuala. Randate din exact acelasi
          array din care se construieste schema, deci nu mai pot diverge. */}
      {intrebari.length > 0 && (
        <div className="mt-4 bg-[#14181c] border border-[#1f2329] rounded-xl p-5">
          <h2 className="text-lg font-black text-[#ffffff] mb-4">Intrebari frecvente despre {nume}</h2>
          {/* `details` nativ, nu accordion pe JS: continutul ramane in DOM chiar
              inchis, deci Google il vede — cerinta pentru marcajul FAQPage. Un
              accordion care randeaza doar la click ar reintroduce exact problema
              „schema fara continut vizibil" reparata azi. */}
          <div className="divide-y divide-[#1f2329]">
            {intrebari.map((q, i) => (
              <details key={q.i} open={i === 0} className="py-3.5 first:pt-0 last:pb-0 group">
                <summary className="text-sm font-bold text-[#ffffff] cursor-pointer list-none flex items-start justify-between gap-3 hover:text-[#ddf93c] transition-colors">
                  <h3 className="text-sm font-bold">{q.i}</h3>
                  <span className="shrink-0 text-[#6b7178] group-open:rotate-180 transition-transform" aria-hidden="true">&#9662;</span>
                </summary>
                <p className="text-sm text-[#c9ced5] leading-relaxed mt-1.5">{q.r}</p>
              </details>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
