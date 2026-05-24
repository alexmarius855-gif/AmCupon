import { notFound } from "next/navigation";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import CategorieClient from "./CategorieClient";

interface Magazin {
  magazin: string;
  url: string;
  url_afiliat: string;
  logo_url?: string;
  categorie: string;
  categorie_slug: string;
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
  promotii: { nume: string; descriere: string; cod_cupon: string; landing_page: string; zile_ramase: number }[];
  folosit_de: number;
  procent_succes: number;
  exclusiv: boolean;
}

const NUME_CATEGORIE: Record<string, string> = {
  "fashion": "Fashion",
  "home-garden": "Casă & Grădină",
  "books": "Cărți",
  "electronics-itc": "Electronice IT&C",
  "health-personal-care": "Sănătate & Îngrijire",
  "pharma": "Farmacie",
  "babies-kids-toys": "Copii & Jucării",
  "beauty": "Frumusețe",
  "sports-outdoors": "Sport & Outdoor",
  "automotive": "Auto-Moto",
  "hypermarket-groceries": "Hypermarket & Grocery",
  "online-mall": "Online Mall",
  "gifts-flowers": "Cadouri & Flori",
  "pet-supplies": "Animale de Companie",
  "jewelry": "Bijuterii",
  "telecom": "Telecom",
  "games": "Jocuri",
  "software": "Software",
  "insurance": "Asigurări",
  "office-supplies": "Papetărie & Birou",
  "watches": "Ceasuri",
  "others": "Altele",
};

function loadData(): Magazin[] {
  const filePath = path.join(process.cwd(), "public", "output.json");
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export async function generateStaticParams() {
  const magazine = loadData();
  const slugs = [...new Set(magazine.map((m) => m.categorie_slug).filter(Boolean))];
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const magazine = loadData();
  const mag = magazine.filter((m) => m.categorie_slug === slug);
  if (!mag.length) return { title: "Categorie negăsită | AmCupon.ro" };

  const numeCateg = NUME_CATEGORIE[slug] || mag[0].categorie;
  const cuPromo = mag.filter((m) => m.are_promotie).length;

  return {
    title: `Coduri reducere ${numeCateg} ${new Date().getFullYear()} | AmCupon.ro`,
    description: `${cuPromo} promoții active la magazinele de ${numeCateg} din România. Coduri de reducere verificate și oferte exclusive.`,
    openGraph: {
      title: `${cuPromo} promoții active — ${numeCateg} | AmCupon.ro`,
      url: `https://amcupon.ro/categorii/${slug}`,
    },
  };
}

export default async function PaginaCategorie({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const magazine = loadData();
  const mag = magazine.filter((m) => m.categorie_slug === slug);
  if (!mag.length) notFound();

  const numeCateg = NUME_CATEGORIE[slug] || mag[0].categorie;
  return <CategorieClient magazine={mag} numeCategorie={numeCateg} slug={slug} />;
}
