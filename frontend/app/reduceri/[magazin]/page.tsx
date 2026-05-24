import { notFound } from "next/navigation";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import MagazinClient from "./MagazinClient";

interface Promotie {
  nume: string;
  descriere: string;
  cod_cupon: string;
  landing_page: string;
  zile_ramase: number;
}

interface Magazin {
  magazin: string;
  url: string;
  url_afiliat: string;
  logo_url?: string;
  categorie: string;
  comision: string;
  rank?: number;
  scor_afiliere: number;
  scor_final: number;
  prioritate: string;
  canal_recomandat: string;
  sales_number: number;
  trend: number;
  are_promotie: boolean;
  cod_cupon: boolean;
  zile_ramase: number;
  promotii: Promotie[];
  folosit_de: number;
  procent_succes: number;
  exclusiv: boolean;
}

function loadData(): Magazin[] {
  const filePath = path.join(process.cwd(), "public", "output.json");
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function numeAfisat(magazin: string): string {
  return magazin
    .split(".")[0]
    .replace(/-/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateStaticParams() {
  const magazine = loadData();
  return magazine.map((m) => ({ magazin: m.magazin }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ magazin: string }>;
}): Promise<Metadata> {
  const { magazin: slug } = await params;
  const magazine = loadData();
  const m = magazine.find((x) => x.magazin === slug);

  if (!m) return { title: "Magazin negăsit | AmCupon.ro" };

  const nume = numeAfisat(m.magazin);
  const nrPromo = m.promotii.length;
  const desc = nrPromo > 0
    ? `${nrPromo} promoții active la ${nume}. ${m.promotii[0].nume}. Comision afiliat: ${m.comision}.`
    : `Magazine partener ${nume} pe AmCupon.ro. Categorie: ${m.categorie}. Comision: ${m.comision}.`;

  return {
    title: `Coduri reducere ${nume} ${new Date().getFullYear()} | AmCupon.ro`,
    description: desc,
    openGraph: {
      title: `${nrPromo > 0 ? `${nrPromo} promoții active` : "Magazine partener"} — ${nume}`,
      description: desc,
      url: `https://amcupon.ro/reduceri/${slug}`,
    },
  };
}

export default async function PaginaMagazin({
  params,
}: {
  params: Promise<{ magazin: string }>;
}) {
  const { magazin: slug } = await params;
  const magazine = loadData();
  const m = magazine.find((x) => x.magazin === slug);

  if (!m) notFound();

  return <MagazinClient magazin={m} />;
}
