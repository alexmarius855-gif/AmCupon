import type { Termometru as DateTermo } from "@/lib/termometru";
import { lei, procent, zileIntre, ziScurta } from "@/lib/formatRo";

/**
 * Termometrul pretului (semnatura noului site): banda = intervalul de pret din ultimele 30 de zile (sau din cate
 * zile il urmarim, daca sunt mai putine — atunci o spunem), acul = pretul de azi. Pe server, fara JavaScript;
 * banda se umple cand intra in ecran (Apare.tsx), doar cu transform.
 *
 * „Reducere reala" doar cand verdictul e `reala` (sub minim cu cel putin 10% si varianta clara, lib/termometru.ts).
 */
function pozitii(t: DateTermo) {
  let lo = Math.min(t.min, t.azi);
  let hi = Math.max(t.max, t.azi);
  if (hi - lo < 0.01) { lo = lo * 0.9; hi = hi * 1.1; }
  const pad = (hi - lo) * 0.08;
  lo -= pad; hi += pad;
  const p = (v: number) => `${(((v - lo) / (hi - lo)) * 100).toFixed(2)}%`;
  return { a: p(t.min), b: p(t.max), x: p(t.azi) };
}

export function zileFereastra(t: DateTermo): number {
  return Math.min(t.acop, 30);
}

export function concluzie(t: DateTermo): { scurt: string; text: string } {
  const z = zileFereastra(t);
  const perioada = z >= 30 ? "ultimele 30 de zile" : `ultimele ${z} zile`;
  if (t.verdict === "tace") {
    return { scurt: "Nu comparăm", text: "Pe aceeași adresă par să fie variante diferite (mărime, gramaj, set), deci nu spunem dacă e o reducere reală." };
  }
  if (t.verdict === "reala") {
    return { scurt: "Reducere reală", text: `${procent(t.sub)} față de cel mai mic preț din ${perioada} (${lei(t.min)}).` };
  }
  if (t.verdict === "sub-minim") {
    return { scurt: "Sub minim", text: `Puțin sub cel mai mic preț din ${perioada}: ${procent(t.sub)}.` };
  }
  if (t.azi > t.max) return { scurt: "Mai scump", text: `Peste toate prețurile din ${perioada} (între ${lei(t.min)} și ${lei(t.max)}).` };
  if (Math.abs(t.azi - t.min) < 0.01) return { scurt: "La minim", text: `Egal cu cel mai mic preț din ${perioada}.` };
  return { scurt: "Preț obișnuit", text: `În intervalul din ${perioada}: între ${lei(t.min)} și ${lei(t.max)}.` };
}

export default function Termometru({ t, peHartie = false }: { t: DateTermo; peHartie?: boolean }) {
  const { a, b, x } = pozitii(t);
  const c = concluzie(t);
  const z = zileFereastra(t);
  const eticheta = `Prețul de azi: ${lei(t.azi)}. În ultimele ${z} zile: între ${lei(t.min)} și ${lei(t.max)}. ${c.scurt}.`;
  return (
    <div className={peHartie ? "termo pe-hartie" : "termo"} data-verdict={t.verdict}>
      <div className="termo-pista" role="img" aria-label={eticheta} style={{ ["--a" as string]: a, ["--b" as string]: b, ["--x" as string]: x }}>
        <span className="termo-banda" />
        <span className="termo-ac" />
      </div>
      <div className="termo-et" aria-hidden="true">
        <span>min {lei(t.min)}</span>
        <b>azi {lei(t.azi)}</b>
        <span>max {lei(t.max)}</span>
      </div>
      <p className="termo-concluzie"><strong>{c.scurt}.</strong> {c.text}</p>
    </div>
  );
}

/** Linia pretului pe bon: treptele din istoric (doar schimbarile), cu ultimele 30 de zile umbrite. */
export function SeriePret({ t, azi }: { t: DateTermo; azi: string }) {
  const puncte = t.serie.filter(([, v]) => v > 0);
  if (puncte.length === 0 || !azi) return null;
  const start = puncte[0][0];
  const total = Math.max(1, zileIntre(start, azi));
  const valori = [...puncte.map(([, v]) => v), t.azi];
  let lo = Math.min(...valori);
  let hi = Math.max(...valori);
  if (hi - lo < 0.01) { lo *= 0.9; hi *= 1.1; }
  const X = (zi: string) => Math.max(0, Math.min(100, (zileIntre(start, zi) / total) * 100));
  const Y = (v: number) => 36 - ((v - lo) / (hi - lo)) * 32;
  let d = "";
  puncte.forEach(([zi, v], i) => {
    const x = X(zi).toFixed(2);
    const y = Y(v).toFixed(2);
    d += i === 0 ? `M${x} ${y}` : ` H${x} V${y}`;
  });
  d += ` H100 V${Y(t.azi).toFixed(2)}`;
  const f = Math.max(0, 100 - (Math.min(30, total) / total) * 100);
  return (
    <div className="serie" aria-hidden="true">
      <svg viewBox="0 0 100 40" preserveAspectRatio="none">
        <rect className="fereastra" x={f.toFixed(2)} y="0" width={(100 - f).toFixed(2)} height="40" />
        <path className="lin" d={d} />
        <rect className="azi" x="98.4" y={(Y(t.azi) - 1.6).toFixed(2)} width="1.6" height="3.2" />
      </svg>
      <div className="serie-et"><span>{ziScurta(start)}</span><span>{total > 30 ? "umbrit: ultimele 30 de zile" : ""}</span><span>azi</span></div>
    </div>
  );
}
