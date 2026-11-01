import fs from "fs";
import path from "path";
import Link from "next/link";

/**
 * „Câte reduceri de Black Friday sunt reale" — SERVER, din public/black-friday-reale.json
 * (scripts/studiu_black_friday.py, din istoricul nostru de preturi). Doar cifre agregate, fara nume
 * de magazine. Inainte de prima zi de masurare, sectiunea spune metoda si cand apar cifrele.
 */
interface Zi {
  zi: string;
  produse_urmarite: number;
  ieftinite: number;
  reale: number;
  nu_sub_minim: number;
  pct_reale_din_ieftinite: number | null;
  mediana_reducere_reala_pct: number | null;
  mediana_reducere_aparenta_pct: number | null;
  scumpite: number;
  pct_scumpite_in_luna_dinainte: number | null;
}

function incarca(): { referinta: string; ultima: Zi | null } | null {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "black-friday-reale.json"), "utf-8"));
  } catch {
    return null;
  }
}

const nr = (n: number) => new Intl.NumberFormat("ro-RO").format(n);
const pct = (n: number | null) => (n === null ? "—" : `${String(n).replace(".", ",")}%`);
const zi = (iso: string) =>
  new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(iso + "T00:00:00Z"));

export default function StudiuReale() {
  const d = incarca();
  if (!d) return null;
  const u = d.ultima;
  return (
    <section aria-labelledby="studiu-reale" className="mt-8 max-w-2xl bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
      <h2 id="studiu-reale" className="text-lg font-black">Câte reduceri de Black Friday sunt reale</h2>
      <p className="text-sm text-[var(--text-soft)] mt-1">
        O reducere e reală când prețul nou e sub cel mai mic preț din ultimele 30 de zile — e și prețul anterior pe care
        magazinul trebuie să-l afișeze (HG 686/2022). Comparăm prețul de azi al produselor urmărite de noi cu minimul din
        cele 30 de zile dinainte de {zi(d.referinta)}.
      </p>
      {u ? (
        <>
          <dl className="grid grid-cols-2 gap-3 mt-3 text-sm">
            <div>
              <dt className="text-[var(--text-muted)]">Produse mai ieftine decât înainte</dt>
              <dd className="text-xl font-black">{nr(u.ieftinite)} <span className="text-sm font-normal text-[var(--text-muted)]">din {nr(u.produse_urmarite)}</span></dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Dintre ele, sub minimul din 30 de zile</dt>
              <dd className="text-xl font-black">{pct(u.pct_reale_din_ieftinite)}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">Reducerea reală, mediană</dt>
              <dd className="text-xl font-black">{pct(u.mediana_reducere_reala_pct)}</dd>
            </div>
            <div>
              <dt className="text-[var(--text-muted)]">S-au scumpit în luna dinainte</dt>
              <dd className="text-xl font-black">{pct(u.pct_scumpite_in_luna_dinainte)}</dd>
            </div>
          </dl>
          <p className="text-xs text-[var(--text-muted)] mt-3">
            Actualizat pe {zi(u.zi)}. Doar produse din feed-urile partenerilor cu cel puțin 30 de zile de istoric la noi;
            feed-urile se descarcă prin rotație, deci minimul e cel văzut de noi, iar o reducere de o singură zi poate să
            lipsească. Fără nume de magazine: cifrele descriu piața. Produsele de azi sub minim:{" "}
            <Link href="/reduceri-reale" className="underline hover:text-[var(--accent-text)]">Reduceri reale →</Link>
          </p>
        </>
      ) : (
        <p className="text-sm text-[var(--text-muted)] mt-3">
          Măsurătoarea începe pe {zi(d.referinta)} și se actualizează de trei ori pe zi, până la începutul lui decembrie.
          Până atunci, produsele aflate deja sub minimul din 30 de zile sunt pe{" "}
          <Link href="/reduceri-reale" className="underline hover:text-[var(--accent-text)]">Reduceri reale</Link>.
        </p>
      )}
    </section>
  );
}
