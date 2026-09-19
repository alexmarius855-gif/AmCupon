import Link from "next/link";

/**
 * Pagina unui magazin al carui program de afiliere (cel la care avem acces) NU acopera Romania
 * (19.09.2026). Textul vorbeste despre program, nu despre firma — vezi comentariul de la <h1>.
 *
 * 108 magazine aveau programe doar pentru alte tari — „Eufy NL", „Navimow US", „Lenovo India",
 * „JD Sports Indonesia" (ShippingRegions din API-ul Impact). Un clic de pe AmCupon ducea pe un
 * magazin de unde un cumparator din Romania nu poate comanda. Ies din toate listele (merge_platforms.py),
 * iar adresa lor nu da 404: spune de ce, trimite spre site-ul oficial fara link de afiliere si arata
 * alternative din aceeasi categorie. `noindex` — nu cerem lui Google sa claseze o pagina fara oferta.
 */

export interface MagazinFaraLivrare {
  magazin: string;
  url?: string;
  categorie: string;
  categorie_slug: string;
  program: string;
  regiuni: string[];
}

export interface Alternativa {
  magazin: string;
  nume: string;
  eticheta: string;
}

const TARI: Record<string, string> = {
  US: "SUA", UK: "Marea Britanie", NETHERLANDS: "Olanda", GERMANY: "Germania", FRANCE: "Franța",
  INDIA: "India", INDONESIA: "Indonezia", AUSTRALIA: "Australia", HONGKONG: "Hong Kong",
  CANADA: "Canada", ITALY: "Italia", SPAIN: "Spania", JAPAN: "Japonia", CHINA: "China",
  BELGIUM: "Belgia", POLAND: "Polonia", AUSTRIA: "Austria", SWITZERLAND: "Elveția",
  SWEDEN: "Suedia", IRELAND: "Irlanda", PORTUGAL: "Portugalia", MEXICO: "Mexic",
  BRAZIL: "Brazilia", SINGAPORE: "Singapore", NEWZEALAND: "Noua Zeelandă", DENMARK: "Danemarca",
  NORWAY: "Norvegia", FINLAND: "Finlanda", CZECHREPUBLIC: "Cehia", HUNGARY: "Ungaria",
  GREECE: "Grecia", TURKEY: "Turcia", UAE: "Emiratele Arabe Unite", SAUDIARABIA: "Arabia Saudită",
  SOUTHKOREA: "Coreea de Sud", MALAYSIA: "Malaezia", PHILIPPINES: "Filipine", THAILAND: "Thailanda",
};

/** „SUA", „Olanda și Belgia", sau „30 de țări (fără România)". */
export function tariLivrare(regiuni: string[]): string {
  const nume = regiuni.map((r) => TARI[r] || r.charAt(0) + r.slice(1).toLowerCase());
  if (nume.length === 0) return "alte țări";
  if (nume.length === 1) return nume[0];
  if (nume.length <= 3) return `${nume.slice(0, -1).join(", ")} și ${nume[nume.length - 1]}`;
  return `${nume.length} de țări (fără România)`;
}

export default function FaraLivrareRo({
  f,
  nume,
  alternative,
}: {
  f: MagazinFaraLivrare;
  nume: string;
  alternative: Alternativa[];
}) {
  const tari = tariLivrare(f.regiuni);
  return (
    <div className="min-h-screen bg-[#06080b] text-[#ffffff]">
      <header className="border-b border-[#1f2329]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5">
            <div className="bg-[#ddf93c] text-[#0c1000] font-black text-base px-2 py-1 rounded-lg">Am</div>
            <span className="font-black text-xl">Cupon</span>
            <span className="text-[#ddf93c] font-black text-xl">.ro</span>
          </Link>
          <Link href="/toate-magazinele" className="text-sm text-[#ddf93c] font-semibold">
            Toate magazinele →
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-xs font-bold uppercase tracking-wider text-[#9399a0] mb-2">{f.categorie}</p>
        {/* Afirmatia e despre PROGRAMUL la care avem acces, nu despre firma: „Eufy NL" acopera doar
            Olanda, dar asta nu inseamna ca Eufy nu vinde deloc in Romania. */}
        <h1 className="text-2xl sm:text-3xl font-black mb-4">Nu avem o ofertă {nume} pentru România</h1>
        <p className="text-[#c8ccd1] leading-relaxed mb-3">
          Programul de afiliere {nume} la care avem acces{f.program ? ` ("${f.program}")` : ""} funcționează
          doar pentru {tari}. Un clic de aici te-ar duce pe{" "}
          {f.regiuni.length <= 3 ? `magazinul pentru ${tari}, nu pe unul pentru România` : "un magazin care nu acoperă România"}
          {" "}— așa că nu îl promovăm și nu îți arătăm coduri pentru el.
        </p>
        {f.url ? (
          <p className="text-[#9399a0] text-sm mb-8">
            Dacă vrei să verifici singur dacă {nume} are un magazin pentru România, intră pe{" "}
            <a href={f.url} rel="nofollow noopener" target="_blank" className="text-[#ddf93c] underline">
              site-ul oficial
            </a>{" "}
            — linkul nu e de afiliere.
          </p>
        ) : null}

        {alternative.length > 0 ? (
          <section className="bg-[#14181c] border border-[#1f2329] rounded-xl p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#c3dd2c] mb-4">
              Alternative din {f.categorie}
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {alternative.map((a) => (
                <li key={a.magazin}>
                  <Link
                    href={`/cod-reducere/${a.magazin}`}
                    className="flex items-center justify-between gap-3 bg-[#06080b] border border-[#1f2329] rounded-lg px-4 py-3 hover:border-[#ddf93c]/50 transition-colors"
                  >
                    <span className="font-semibold">{a.nume}</span>
                    {a.eticheta ? (
                      <span className="text-[11px] font-bold text-[#0c1000] bg-[#ddf93c] rounded-full px-2 py-0.5">
                        {a.eticheta}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </div>
  );
}
