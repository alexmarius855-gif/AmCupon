import Link from "next/link";
import { titluAfisat, imagineSigura, type SectiuneTema, type ProdusFeed } from "../../lib/topFeed";
import { numeAfisat } from "../../lib/numeMagazin";

/**
 * „Unde gasesti azi" — produse reale din feed-ul magazinelor partenere (lib/topFeed.ts).
 *
 * Componenta SERVER (fara "use client"): textul si linkurile trebuie sa fie in HTML-ul
 * livrat — e continutul pe care Google il citeste si singurul loc de pe pagina /top de
 * unde un clic produce comision. Fiecare propozitie e generata din date, deci nu poate
 * ramane falsa cand se schimba feed-ul (aceeasi regula ca DESC_CATEG, 22.08.2026).
 */

/** Pretul exact, cu zecimale doar cand exista: 2.799,97 lei / 1.599 lei. Nu rotunjim un pret de raft. */
function pret(n: number): string {
  return `${n.toLocaleString("ro-RO", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} lei`;
}

/** „1 produs", „7 produse", „20 de produse" — acordul romanesc cu „de" de la 20 in sus. */
function cate(n: number, unul: string, multe: string): string {
  if (n === 1) return `1 ${unul}`;
  const r = n % 100;
  return `${n.toLocaleString("ro-RO")}${n !== 0 && (r === 0 || r >= 20) ? " de" : ""} ${multe}`;
}

function CardProdus({ p }: { p: ProdusFeed }) {
  const titlu = titluAfisat(p.title);
  const img = imagineSigura(p.image);
  const magazin = numeAfisat(p.merchant_slug || "");
  return (
    <a
      href={p.url}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      className="group flex flex-col bg-[#14181c] border border-[#1f2329] hover:border-[#3a4048] rounded-xl overflow-hidden transition-colors"
    >
      {/* overflow-hidden + h-full: fara ele, o poza inalta crestea cutia (aspect-ratio cedeaza in fata
          continutului) si cardurile de pe acelasi rand aveau inaltimi diferite — vazut pe mobil, 06.10. */}
      <div className="bg-[#ffffff] aspect-[4/3] overflow-hidden flex items-center justify-center p-3">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={titlu} loading="lazy" decoding="async" className="h-full w-full object-contain" />
        ) : (
          <span className="text-2xl font-black text-[#9399a0]" aria-hidden="true">{magazin.charAt(0)}</span>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="text-[13px] leading-snug text-[#ffffff] line-clamp-2" title={titlu}>{titlu}</p>
        <p className="text-xs text-[#9399a0]">la {magazin}</p>
        {/* flex-wrap: pe mobil (2 coloane de ~150px) butonul trece sub pret, in loc sa rupa pretul in doua */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 pt-1">
          <span className="text-base font-black text-[#ddf93c] whitespace-nowrap">{pret(p.price as number)}</span>
          <span className="shrink-0 text-xs font-bold text-[#0c1000] bg-[#ddf93c] group-hover:bg-[#c3dd2c] rounded-lg px-2.5 py-1 transition-colors">
            Vezi oferta
          </span>
        </div>
      </div>
    </a>
  );
}

export default function OferteParteneri({
  sectiune,
  numeTema,
  actualizat,
}: {
  sectiune: SectiuneTema;
  /** „laptopuri", „smartwatch-uri" — la plural, nearticulat */
  numeTema: string;
  /** data feed-ului, deja formatata */
  actualizat: string;
}) {
  const s = sectiune;
  const nrMag = s.magazine.length;
  // Sub articolele de blog, un singur magazin partener e acceptat (trolere: doar Mirano) —
  // atunci textul il numeste, in loc de „feed-urile a 1 magazin partener".
  const unul = nrMag === 1 ? numeAfisat(s.magazine[0].slug) : "";

  return (
    <section id="unde-cumperi" className="mt-10 scroll-mt-24" aria-labelledby="unde-cumperi-titlu">
      <h2 id="unde-cumperi-titlu" className="text-xl md:text-2xl font-black text-[#ffffff] mb-2">
        Unde găsești {numeTema} azi, {unul ? `la ${unul}` : "la magazinele partenere"}
      </h2>
      <p className="text-sm text-[#c9ced5] leading-relaxed max-w-3xl">
        {unul
          ? `Azi am găsit ${cate(s.total, "produs", "produse")} în feed-ul magazinului partener ${unul}`
          : `Azi am găsit ${cate(s.total, "produs", "produse")} în feed-urile a ${cate(nrMag, "magazin partener", "magazine partenere")}`}
        {s.modele < s.total ? `, adică ${cate(s.modele, "model distinct", "modele distincte")} (restul sunt variante de culoare sau mărime)` : ""}.
        Prețurile merg de la {pret(s.min)} la {pret(s.max)}, iar prețul median e {pret(s.median)}.
        {s.game.length > 1 ? ` Le-am împărțit în ${s.game.length} game de preț, cu modele din fiecare.` : ""}
      </p>

      {s.game.map((g) => (
        <div key={g.eticheta} className="mt-6">
          <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
            <h3 className="text-base font-black text-[#ffffff]">
              {g.eticheta}: <span className="text-[#ddf93c]">{g.de_la === g.pana_la ? pret(g.de_la) : `${pret(g.de_la)} – ${pret(g.pana_la)}`}</span>
            </h3>
            <span className="text-xs text-[#9399a0]">{cate(g.modele, "model", "modele")} în gama asta</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {g.produse.map((p, i) => <CardProdus key={`${p.url}-${i}`} p={p} />)}
          </div>
        </div>
      ))}

      <div className="mt-8 bg-[#14181c] border border-[#1f2329] rounded-xl p-5">
        <h3 className="text-base font-black text-[#ffffff] mb-3">
          {unul ? `Magazinul partener cu ${numeTema}` : `Magazinele partenere cu ${numeTema}`}
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-[#9399a0]">
              <th className="py-2 font-semibold">Magazin</th>
              <th className="py-2 font-semibold text-right">Produse</th>
              <th className="py-2 font-semibold text-right pl-3">Prețuri</th>
            </tr>
          </thead>
          <tbody>
            {s.magazine.slice(0, 8).map((m) => (
              <tr key={m.slug} className="border-t border-[#1f2329]">
                <td className="py-2">
                  <Link href={`/cod-reducere/${m.slug}`} className="font-semibold text-[#ffffff] hover:text-[#ddf93c] transition-colors">
                    {numeAfisat(m.slug)}
                  </Link>
                </td>
                <td className="py-2 text-right text-[#c9ced5]">{m.nr}</td>
                <td className="py-2 text-right text-[#c9ced5] pl-3 whitespace-nowrap">
                  {m.min === m.max ? pret(m.min) : `${pret(m.min)} – ${pret(m.max)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {nrMag > 8 && (
          <p className="text-xs text-[#9399a0] mt-2">Încă {cate(nrMag - 8, "magazin", "magazine")} cu mai puține produse.</p>
        )}
      </div>

      <p className="text-xs text-[#9399a0] leading-relaxed mt-4 max-w-3xl">
        Prețuri din feed-ul magazinelor, actualizate la {actualizat}. Prețul final, stocul și starea produsului (nou sau
        recondiționat) le vezi pe site-ul magazinului. Linkurile sunt afiliate: dacă cumperi, AmCupon primește un
        comision, iar prețul tău rămâne același.
      </p>
    </section>
  );
}
