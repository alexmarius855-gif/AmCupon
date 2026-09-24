import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import { linkAfiliat } from "@/lib/linkMagazin";
import { numeAfisat } from "@/lib/numeMagazin";

/**
 * eSIM pe destinatie — date din data/esim-preturi.csv, prin scripts/genereaza_esim.py.
 *
 * De ce: cercetarea din 15.09.2026 (locul 3) a gasit aici singura cerere comerciala dovedita
 * in Romania — furnizorii platesc advertoriale in 2026, fiecare cu UN brand, fara tabel intre
 * furnizori. Tabelul intre furnizori e ce lipseste.
 *
 * Reguli: fiecare pret are sursa si data verificarii (generatorul respinge ce e mai vechi de
 * 45 de zile); ordinea e alfabetica, fara „cel mai ieftin"; comisioanele nu se afiseaza; Turcia
 * doar cu avertismentul BTK. Pagina e `noindex` pana confirma Alex termenii programelor.
 */

interface Plan { plan: string; gb: number | null; zile: number; pret: number; moneda: string; sursa: string; verificat: string }
interface Furnizor { furnizor: string; planuri: Plan[] }
interface Destinatie { nume: string; avertisment: string; indexabil: boolean; furnizori: Furnizor[] }
interface MagazinLink { magazin: string; url: string; url_afiliat: string }

function loadDestinatii(): Record<string, Destinatie> {
  try {
    const d = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "esim-destinatii.json"), "utf-8"));
    return d.destinatii || {};
  } catch {
    return {};
  }
}

function loadMagazine(): MagazinLink[] {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "output.json"), "utf-8"));
  } catch {
    return [];
  }
}

const ZI = new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const zi = (iso: string) => ZI.format(new Date(`${iso}T00:00:00Z`));
const pret = (p: Plan) =>
  new Intl.NumberFormat("ro-RO", { style: "currency", currency: p.moneda, minimumFractionDigits: 2 }).format(p.pret);
/** „un furnizor", „4 furnizori", „20 de furnizori". */
const furnizori = (n: number) => (n === 1 ? "un furnizor" : `${n}${n % 100 >= 20 || (n > 0 && n % 100 === 0) ? " de" : ""} furnizori`);

export async function generateStaticParams() {
  return Object.keys(loadDestinatii()).map((destinatie) => ({ destinatie }));
}

export async function generateMetadata({ params }: { params: Promise<{ destinatie: string }> }): Promise<Metadata> {
  const { destinatie } = await params;
  const d = loadDestinatii()[destinatie];
  if (!d) return { title: "Destinație negăsită | AmCupon.ro" };
  const url = `https://amcupon.ro/esim/${destinatie}`;
  const titlu = `eSIM ${d.nume}: ${furnizori(d.furnizori.length)}, prețuri verificate`;
  return {
    // 60 de caractere cu tot cu „ | AmCupon.ro" (13), limita din CLAUDE.md.
    title: titlu.length <= 47 ? `${titlu} | AmCupon.ro` : titlu.slice(0, 60),
    description: `Planurile eSIM pentru ${d.nume} de la ${furnizori(d.furnizori.length)}, cu prețul copiat din pagina fiecăruia și data verificării. Fără clasamente plătite.`,
    alternates: { canonical: url },
    ...(d.indexabil ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function PaginaEsimDestinatie({ params }: { params: Promise<{ destinatie: string }> }) {
  const { destinatie } = await params;
  const d = loadDestinatii()[destinatie];
  if (!d) notFound();

  const dupaSlug = new Map(loadMagazine().map((m) => [m.magazin.toLowerCase(), m]));
  const ultimaVerificare = d.furnizori.flatMap((f) => f.planuri.map((p) => p.verificat)).sort().at(-1);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <nav className="border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[var(--text-muted)]">
          <Link href="/" className="hover:text-[var(--accent)]">Acasă</Link>
          <span className="mx-1">/</span>
          <Link href="/esim" className="hover:text-[var(--accent)]">eSIM</Link>
          <span className="mx-1">/</span>
          <span className="text-[var(--text-soft)] font-medium">{d.nume}</span>
        </div>
      </nav>

      <header className="max-w-3xl mx-auto px-4 pt-10 pb-6">
        <h1 className="text-3xl md:text-4xl font-black text-[var(--foreground)] leading-tight mb-4">eSIM pentru {d.nume}</h1>
        <p className="text-[var(--text-soft)] leading-relaxed">
          Planurile de date de la {furnizori(d.furnizori.length)}, cu prețul copiat din pagina fiecăruia și data
          la care l-am verificat. Ordinea e alfabetică: nu clasăm și nu scriem care e cel mai ieftin, fiindcă
          prețurile se schimbă mai des decât le putem verifica.
          {ultimaVerificare && <> Ultima verificare: {zi(ultimaVerificare)}.</>}
        </p>
      </header>

      {d.avertisment && (
        <div className="max-w-3xl mx-auto px-4 pb-6">
          <p role="note" className="text-sm leading-relaxed text-[var(--foreground)] bg-[var(--surface)] border border-[var(--accent)]/40 rounded-xl p-4">
            <strong>Atenție:</strong> {d.avertisment}
          </p>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 pb-10 space-y-5">
        {d.furnizori.map((f) => {
          const m = dupaSlug.get(f.furnizor);
          const link = m ? linkAfiliat(m) || m.url : null;
          const nume = numeAfisat(f.furnizor);
          return (
            <section key={f.furnizor} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
              <h2 className="text-lg font-black text-[var(--foreground)] mb-3">{nume}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[440px]">
                  <thead>
                    <tr className="text-[var(--text-muted)] text-[11px] uppercase tracking-wider">
                      <th className="text-left font-bold py-2">Plan</th>
                      <th className="text-right font-bold py-2">Date</th>
                      <th className="text-right font-bold py-2">Zile</th>
                      <th className="text-right font-bold py-2">Preț</th>
                      <th className="text-right font-bold py-2">Verificat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {f.planuri.map((p) => (
                      <tr key={`${p.plan}-${p.zile}-${p.pret}`} className="border-t border-[var(--border)]">
                        <td className="py-2.5 text-[var(--foreground)]">{p.plan}</td>
                        <td className="py-2.5 text-right text-[var(--text-soft)] tabular-nums">{p.gb === null ? "nelimitat" : `${p.gb} GB`}</td>
                        <td className="py-2.5 text-right text-[var(--text-soft)] tabular-nums">{p.zile}</td>
                        <td className="py-2.5 text-right font-bold text-[var(--foreground)] tabular-nums">{pret(p)}</td>
                        <td className="py-2.5 text-right text-xs">
                          <a href={p.sursa} target="_blank" rel="noopener noreferrer nofollow" className="text-[var(--text-muted)] hover:text-[var(--accent)] underline">
                            {zi(p.verificat)}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {link && (
                <a href={link} target="_blank" rel="sponsored noopener noreferrer"
                  className="inline-block mt-4 bg-[var(--accent)] text-[var(--on-accent)] font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[var(--accent-deep)] transition-colors">
                  Vezi planurile pe {nume}
                </a>
              )}
            </section>
          );
        })}

        <section className="text-sm text-[var(--text-soft)] leading-relaxed space-y-3 pt-2">
          <h2 className="text-base font-black text-[var(--foreground)]">Înainte să cumperi</h2>
          <p>
            Verifică pe site-ul furnizorului dacă telefonul tău acceptă eSIM: fiecare publică lista lui de
            modele compatibile. Instalează eSIM-ul înainte de plecare, cât ai încă internet, și activează-l la sosire.
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Linkurile către furnizori sunt de afiliere: dacă cumperi, primim un comision, fără niciun cost în plus
            pentru tine. Comisionul nu schimbă ordinea, care e alfabetică.
          </p>
        </section>
      </main>
    </div>
  );
}
