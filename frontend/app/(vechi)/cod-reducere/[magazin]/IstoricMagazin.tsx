/**
 * Istoricul ofertelor unui magazin: date proprii, din scripts/istoric_promotii.py.
 *
 * De ce (masurat 24.09.2026, pe istoricul git al lui output.json): 125 de magazine au avut
 * promotii din 24.05 incoace si n-au niciuna azi. Pagina lor spunea doar ca nu e niciun cod
 * activ. drmax.ro, 2.400 de cautari pe luna, a avut 13 promotii, niciuna cu cod. Exact asta
 * vrea sa afle omul care cauta un cod: da magazinul coduri, cat de des, cand a fost ultima oferta.
 *
 * Componenta e SERVER: textul trebuie sa fie in HTML-ul livrat, nu adaugat dupa hidratare.
 *
 * Ce NU afiseaza, intentionat:
 *  - codurile trecute ca buton de copiat: nu le testam. Cand reteaua a pus codul in titlu
 *    (noriel.ro: „20% Reducere la jucarii| Cod: NORIEL20"), titlul ramane cum l-a scris ea —
 *    regula din promotii.py e ca nu rescriem textul retelei — iar nota de jos spune ca nu mai e garantat;
 *  - cat a tinut o oferta: o vedem doar cand reteaua raspunde, deci stim ziua in care am vazut-o
 *    prima data si data oficiala de expirare, cand reteaua o da. Nimic dedus peste asta.
 */

export interface IntrareIstoric {
  titlu: string;
  cod: boolean;
  /** Ziua in care am vazut promotia prima data (AAAA-LL-ZZ). */
  prima: string;
  /** Data oficiala de expirare, cand reteaua o da; altfel "". */
  expira: string;
  /** Promotia e in lista de oferte active de pe pagina. */
  activa: boolean;
}

const MAX_AFISATE = 10;

const DATA = new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const LUNA = new Intl.DateTimeFormat("ro-RO", { month: "long", timeZone: "UTC" });

function zi(iso: string): string {
  return DATA.format(new Date(`${iso}T00:00:00Z`));
}

/** „13 promoții", „20 de promoții", „o promoție" — numeralul romanesc cere „de" de la 20 in sus. */
function numar(n: number, singular: string, plural: string): string {
  if (n === 1) return `o ${singular}`;
  const r = n % 100;
  return `${n}${r === 0 || r >= 20 ? " de" : ""} ${plural}`;
}

/** „mai, iunie și iulie 2026"; peste ani: „decembrie 2026 și ianuarie 2027". */
function luni(date: string[]): string {
  const unice = [...new Set(date.map((d) => d.slice(0, 7)))].sort();
  const unAn = new Set(unice.map((l) => l.slice(0, 4))).size === 1;
  const etichete = unice.map((l) => {
    const nume = LUNA.format(new Date(`${l}-01T00:00:00Z`));
    return unAn ? nume : `${nume} ${l.slice(0, 4)}`;
  });
  const lista = etichete.length > 1 ? `${etichete.slice(0, -1).join(", ")} și ${etichete[etichete.length - 1]}` : etichete[0];
  return unAn ? `${lista} ${unice[0].slice(0, 4)}` : lista;
}

export default function IstoricMagazin({ nume, deLa, azi, intrari, nrActive }: {
  nume: string;
  /** Prima zi cu date in istoric. */
  deLa: string;
  /** Data generarii paginii (AAAA-LL-ZZ). */
  azi: string;
  /** Toate promotiile vazute la magazin, cele mai noi intai (asa le scrie scriptul). */
  intrari: IntrareIstoric[];
  /** Cate oferte are pagina acum, din output.json: aceeasi cifra ca lista de sus. */
  nrActive: number;
}) {
  const trecute = intrari.filter((e) => !e.activa);
  // Fara oferte trecute, blocul ar repeta lista de sus. Nu se randeaza.
  if (trecute.length === 0) return null;

  const total = intrari.length;
  const cuCod = intrari.filter((e) => e.cod).length;
  const ceaMaiRecenta = trecute.reduce((max, e) => (e.prima > max ? e.prima : max), "");

  const coduri = total === 1
    ? (cuCod ? ", cu cod de reducere" : ", fără cod de reducere")
    : cuCod === 0
    ? ", niciuna cu cod de reducere"
    : cuCod === total
    ? ", toate cu cod de reducere"
    : `, dintre care ${cuCod === 1 ? "una" : cuCod} cu cod de reducere`;

  const acum = nrActive > 0
    ? `${nrActive === 1 ? "Una e activă" : `${nrActive} sunt active`} acum, mai sus pe pagină.`
    : `Cea mai recentă am văzut-o prima dată pe ${zi(ceaMaiRecenta)}.`;

  return (
    <section className="mt-8 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5" aria-labelledby="istoric-titlu">
      <h2 id="istoric-titlu" className="text-lg font-black text-[var(--foreground)] mb-1">Istoricul ofertelor {nume}</h2>
      <p className="text-xs text-[var(--text-muted)] mb-4">
        Ce am văzut pe AmCupon.ro de pe {zi(deLa)}, din datele rețelelor de afiliere.
      </p>

      <p className="text-sm text-[var(--text-soft)] leading-relaxed mb-2">
        Am văzut la {nume} {numar(total, "promoție", "promoții")}{coduri}. {acum}
      </p>
      <p className="text-sm text-[var(--text-soft)] leading-relaxed mb-4">
        Luni în care am văzut oferte noi: {luni(intrari.map((e) => e.prima))}.
      </p>

      <ul className="divide-y divide-[var(--border)]">
        {trecute.slice(0, MAX_AFISATE).map((e) => (
          <li key={`${e.prima}-${e.titlu}`} className="py-2.5 first:pt-0">
            <p className="text-sm text-[var(--foreground)] leading-snug">{e.titlu}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>Văzută prima dată pe {zi(e.prima)}.</span>
              {e.expira && e.expira >= e.prima && (
                <span>{e.expira < azi ? "A expirat" : "Anunțată până"} pe {zi(e.expira)}.</span>
              )}
              {e.cod && (
                <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-[var(--surface-alt)] text-[var(--text-soft)] border border-[var(--border-strong)]">
                  cu cod
                </span>
              )}
            </p>
          </li>
        ))}
      </ul>
      {trecute.length > MAX_AFISATE && (
        <p className="text-xs text-[var(--text-muted)] mt-2">Și încă {numar(trecute.length - MAX_AFISATE, "ofertă mai veche", "oferte mai vechi")}.</p>
      )}

      <p className="text-xs text-[var(--text-muted)] leading-relaxed mt-4 pt-3 border-t border-[var(--border)]">
        Istoricul are goluri: în unele zile rețelele n-au răspuns, deci numărul real poate fi mai mare.
        Ofertele din listă nu mai apar azi în datele rețelelor, așa că un cod din titlul lor nu mai e garantat.
      </p>
    </section>
  );
}
