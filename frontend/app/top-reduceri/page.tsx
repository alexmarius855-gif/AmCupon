import { Metadata } from "next";
import fs from "fs";
import path from "path";
import Link from "next/link";
import GrilaOferte from "../components/GrilaOferte";
import { poolOferte, grilaOferte, type MagazinGrila } from "@/lib/grilaOferte";
import { procentAfisat, cuNumar } from "@/lib/oferteAcasa";
import { valoareOferta, type PromotieCupon } from "@/lib/oferta";
import { PRAG_URGENT } from "@/lib/expirarePromo";

/**
 * Cele mai mari reduceri de azi, dupa procentul scris in oferta. Remodelata pe 03.11.2026: pagina sorta dupa Deal Score,
 * un scor de-al nostru, si avea un tab „In trend" mereu gol (campul `trend` e 0 peste tot). Acum clasamentul se poate
 * verifica la vedere: procentul de pe card. O reducere „până la" e afisata ca atare (lib/oferta.ts).
 */
const LUNI_RO = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
  "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];

function loadData(): MagazinGrila[] {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "output.json"), "utf-8"));
}

export async function generateMetadata(): Promise<Metadata> {
  const luna = LUNI_RO[new Date().getMonth()];
  const an = new Date().getFullYear();
  return {
    title: `Top Reduceri ${luna} ${an} — cele mai bune coduri active`,
    description: `Cele mai mari reduceri active în ${luna} ${an}, după procentul din oferta, la magazinele partenere. Actualizat zilnic pe AmCupon.ro.`,
    alternates: { canonical: "https://amcupon.ro/top-reduceri" },
    openGraph: {
      title: `Top Reduceri ${luna} ${an} | AmCupon.ro`,
      url: "https://amcupon.ro/top-reduceri",
      siteName: "AmCupon.ro",
      locale: "ro_RO",
      type: "website",
      images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }],
    },
  };
}

const H2 = "text-xl md:text-2xl font-black tracking-tight mb-3";
const dinRo = (s: string) => s.endsWith(".ro") || s.startsWith("ro.");

export default function TopReduceriPage() {
  const luna = LUNI_RO[new Date().getMonth()];
  const an = new Date().getFullYear();
  const pool = poolOferte(loadData());
  const procent = (p: unknown) => procentAfisat(valoareOferta(p as PromotieCupon).text);

  const reduceri = pool.filter((o) => dinRo(o.m.magazin) && procent(o.promo) >= 20);
  const coduri = pool.filter((o) => !!o.cod).sort((a, b) => Number(dinRo(b.m.magazin)) - Number(dinRo(a.m.magazin)) || procent(b.promo) - procent(a.promo));
  const curand = pool.filter((o) => o.zile <= PRAG_URGENT).sort((a, b) => a.zile - b.zile);

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-10 space-y-10">
        <header>
          <h1 className="text-[1.75rem] md:text-4xl font-black tracking-tight leading-tight mb-2">Top reduceri {luna} {an}</h1>
          <p className="text-[var(--text-soft)] max-w-3xl">
            Clasate după procentul scris în ofertă, la magazinele partenere. Nu testăm codurile în coș; lista se actualizează de trei ori pe zi.
          </p>
        </header>

        {reduceri.length > 0 && (
          <section aria-labelledby="rd-h">
            <h2 id="rd-h" className={H2}>Cele mai mari reduceri, magazine din România</h2>
            <GrilaOferte {...grilaOferte(reduceri, { limita: 20, faraFiltre: ["cod", "oferta", "curand"] })} sursa="top_reduceri" />
          </section>
        )}

        {coduri.length > 0 && (
          <section aria-labelledby="cd-h">
            <h2 id="cd-h" className={`${H2} !mb-1`}>Coduri active</h2>
            <p className="text-sm text-[var(--text-muted)] mb-3">
              {cuNumar(coduri.length, "cod", "coduri")}, din care {coduri.filter((o) => dinRo(o.m.magazin)).length} la magazine din România. Restul sunt la magazine internaționale.
            </p>
            <GrilaOferte {...grilaOferte(coduri, { limita: 12, faraFiltre: ["cod", "oferta", "curand"] })} sursa="top_reduceri" />
          </section>
        )}

        {curand.length > 0 && (
          <section aria-labelledby="ex-h">
            <h2 id="ex-h" className={H2}>Expiră curând</h2>
            <GrilaOferte {...grilaOferte(curand, { limita: 8, faraFiltre: ["cod", "oferta", "curand"] })} sursa="top_reduceri" />
          </section>
        )}

        <Link href="/oferte-azi" className="block text-center border border-[var(--border-strong)] hover:border-[var(--accent-text)]/60 rounded-xl py-3 text-sm font-bold transition-colors">
          Toate cele {cuNumar(pool.length, "ofertă", "oferte")} de azi →
        </Link>
      </div>
    </div>
  );
}
