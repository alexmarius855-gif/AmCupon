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
  nume, produse, categorieSlug, categorie, urlSite, categorieStudiu, intrebari = [],
}: {
  nume: string;
  produse: ProdusStat[];
  categorieSlug?: string;
  categorie?: string;
  urlSite?: string;
  categorieStudiu?: CategorieStudiu | null;
  /** Intrebarile frecvente — ACELEASI care intra in schema FAQPage (vezi page.tsx). */
  intrebari?: { i: string; r: string }[];
}) {
  const stat = statisticiFeed(produse);
  const cat = categorieStudiu;
  const numeCat = cat?.nume || categorie;

  if (!stat && !cat && intrebari.length === 0) return null;

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

      {/* ── Intrebari frecvente, VIZIBILE ──────────────────────────────────
          Pana pe 16.08.2026 aceste 5 intrebari existau DOAR in schema FAQPage,
          pe toate cele 1.162 de pagini de magazin, fara sa apara nicaieri pe
          pagina. Google cere ca un continut marcat FAQPage sa fie vizibil —
          marcajul ascuns e motiv de actiune manuala. Randate din exact acelasi
          array din care se construieste schema, deci nu mai pot diverge. */}
      {intrebari.length > 0 && (
        <div className="mt-4 bg-[#14181c] border border-[#1f2329] rounded-xl p-5">
          <h2 className="text-lg font-black text-[#ffffff] mb-4">Intrebari frecvente despre {nume}</h2>
          <div className="divide-y divide-[#1f2329]">
            {intrebari.map((q) => (
              <div key={q.i} className="py-3.5 first:pt-0 last:pb-0">
                <h3 className="text-sm font-bold text-[#ffffff] mb-1.5">{q.i}</h3>
                <p className="text-sm text-[#c9ced5] leading-relaxed">{q.r}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
