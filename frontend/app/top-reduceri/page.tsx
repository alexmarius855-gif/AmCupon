import { Metadata } from "next";
import fs from "fs";
import path from "path";
import TopReduceriClient from "./TopReduceriClient";

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
    description: `Selectia celor mai bune coduri de reducere active in ${luna} ${an}. Verificate si sortate dupa rata de succes. Actualizat zilnic pe AmCupon.ro.`,
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

  // Top coduri — cu cod cupon activ, sortate dupa succes
  const topCoduri = magazine
    .filter(m => m.cod_cupon && m.promotii.some(p => p.cod_cupon))
    .sort((a, b) => b.procent_succes - a.procent_succes)
    .slice(0, 20);

  // Top promotii fara cod (reduceri automate)
  const topPromo = magazine
    .filter(m => m.are_promotie && !m.cod_cupon)
    .sort((a, b) => (a.rank || 999) - (b.rank || 999))
    .slice(0, 20);

  // Trending — cel mai mare trend
  const trending = magazine
    .filter(m => m.trend > 0 && m.are_promotie)
    .sort((a, b) => b.trend - a.trend)
    .slice(0, 10);

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
