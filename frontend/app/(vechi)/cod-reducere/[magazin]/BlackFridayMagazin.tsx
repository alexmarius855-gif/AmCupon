import Link from "next/link";
import type { CampanieBF } from "@/lib/campaniiBlackFriday";

/**
 * „Black Friday la X" pe pagina magazinului (01.11.2026) — SERVER, ca textul sa fie in HTML.
 *
 * Doar pentru partenerii cu o campanie anuntata (lib/campaniiBlackFriday.ts): datele vin de la magazin,
 * prin 2Performant, sau din presa. Pana in ziua de start, oferta NU e pe pagina (importul o tine
 * nepublicata), deci textul spune doar cand incepe si trimite la alerta de oferte noi a magazinului.
 */
const zi = (iso: string) =>
  new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(iso + "T00:00:00Z"));

export default function BlackFridayMagazin({ nume, campanie, azi }: { nume: string; campanie: CampanieBF; azi: string }) {
  const inCurs = campanie.start <= azi;
  const interval = campanie.start === campanie.final ? zi(campanie.start) : `${zi(campanie.start)} – ${zi(campanie.final)}`;
  return (
    <section aria-labelledby="bf-magazin" className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-xs font-semibold text-[var(--accent-text)]">{inCurs ? "În desfășurare" : "Urmează"}</p>
      <h2 id="bf-magazin" className="text-base font-black mt-0.5">Black Friday la {nume}: {interval}</h2>
      {campanie.nota && <p className="text-sm text-[var(--text-soft)] mt-1">{campanie.nota}</p>}
      <p className="text-xs text-[var(--text-muted)] mt-2">
        {inCurs
          ? "Oferta e în lista de mai jos. "
          : `Oferta apare pe pagina asta în ziua în care începe. Cu alerta de oferte noi ${nume} primești un email atunci. `}
        Datele sunt anunțate de magazin; reducerile le stabilește {nume}.{" "}
        <Link href={`/black-friday/${campanie.magazin}`} className="underline hover:text-[var(--accent-text)]">Detalii despre campanie</Link>
        {" · "}
        <Link href="/black-friday" className="underline hover:text-[var(--accent-text)]">Calendarul tuturor partenerilor →</Link>
      </p>
    </section>
  );
}
