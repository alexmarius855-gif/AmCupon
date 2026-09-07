import { Metadata } from "next";
import fs from "fs";
import path from "path";
import TopReduceriClient from "./TopReduceriClient";
import { calculateDealScore } from "../../lib/dealScore";

const LUNI_RO = ["ianuarie","februarie","martie","aprilie","mai","iunie",
  "iulie","august","septembrie","octombrie","noiembrie","decembrie"];

interface Magazin {
  magazin: string; url: string; url_afiliat: string; logo_url?: string;
  categorie: string; categorie_slug?: string; rank?: number;
  are_promotie: boolean; cod_cupon: boolean; zile_ramase: number;
  promotii: { nume: string; descriere: string; cod_cupon: string; landing_page: string; zile_ramase: number }[];
  folosit_de: number; procent_succes: number; trend: number;
}

function loadData(): Magazin[] {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "output.json"), "utf-8"));
}

export async function generateMetadata(): Promise<Metadata> {
  const luna = LUNI_RO[new Date().getMonth()];
  const an   = new Date().getFullYear();
  return {
    title: `Top Reduceri ${luna} ${an} — Cele mai bune coduri active | AmCupon.ro`,
    description: `Selectia celor mai bune coduri de reducere active in ${luna} ${an}. Verificate si sortate dupa Deal Score. Actualizat zilnic pe AmCupon.ro.`,
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

export default function TopReduceriPage() {
  const magazine = loadData();
  const luna = LUNI_RO[new Date().getMonth()];
  const an   = new Date().getFullYear();

  // Top coduri — cu cod cupon activ, sortate dupa Deal Score REAL.
  // 07.09: sorta dupa `procent_succes`, care e `random.Random(hash(magazin)).randint(72,96)`
  // in fetch_2p_api.py. Adica ordinea „celor mai bune coduri" de pe pagina noastra
  // principala de top era, literal, aleatorie — stabila intre rulari (seed pe hash), deci
  // nimeni n-avea cum sa observe ca se schimba. Iar titlul paginii promitea explicit
  // „sortate dupa rata de succes". Acum sorteaza dupa acelasi Deal Score onest folosit
  // pe /cod-reducere si /comparator.
  const topCoduri = magazine
    .filter(m => m.cod_cupon && m.promotii.some(p => p.cod_cupon))
    .sort((a, b) => calculateDealScore(b) - calculateDealScore(a))
    .slice(0, 20);

  // Top promotii fara cod (reduceri automate)
  const topPromo = magazine
    .filter(m => m.are_promotie && !m.cod_cupon)
    .sort((a, b) => (a.rank || 999) - (b.rank || 999))
    .slice(0, 20);

  // „Trending" — sectiune MOARTA din constructie, pastrata goala DELIBERAT.
  // `trend` e scris hardcodat `"trend": 0` in fetch_2p_api.py (linia ~434), deci filtrul
  // `m.trend > 0` n-a lasat niciodata sa treaca vreun magazin: verificat pe HTML-ul live,
  // cuvantul „Trending" apare de 0 ori pe pagina. Clientul ascunde sectiunea cand lista e
  // goala, deci nu se vede nimic rupt.
  // NU o umplem cu un „trend" calculat: n-avem date de trafic pe magazin, iar orice
  // aproximare ar fi exact genul de semnal inventat scos azi din /comparator si /top.
  // Ramane goala pana exista o sursa reala (ex. clicuri proprii din Supabase).
  const trending: Magazin[] = [];

  // Expira curand — maxim 3 zile
  const expiraCurand = magazine
    .filter(m => m.are_promotie && m.zile_ramase > 0 && m.zile_ramase <= 3)
    .sort((a, b) => a.zile_ramase - b.zile_ramase)
    .slice(0, 10);

  return (
    <TopReduceriClient
      luna={luna} an={an}
      topCoduri={topCoduri}
      topPromo={topPromo}
      trending={trending}
      expiraCurand={expiraCurand}
      totalMagazine={magazine.length}
      totalCoduri={magazine.filter(m => m.cod_cupon).length}
    />
  );
}
