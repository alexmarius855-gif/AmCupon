import { Metadata } from "next";
import fs from "fs";
import path from "path";
import ToateMagazineleClient from "./ToateMagazineleClient";
import { numarMagazine, PesteMagazine } from "@/lib/cifreSite";

export const metadata: Metadata = {
  title: `Toate Magazinele cu Reduceri Romania 2026 — ${Math.floor(numarMagazine() / 100) * 100}+ Parteneri`,
  description: `Lista completa a celor ${numarMagazine()} de magazine partenere AmCupon.ro, cu coduri de reducere si oferte active. Cauta magazinul preferat sau filtreaza pe categorie. Actualizat zilnic.`,
  keywords: ["toate magazinele reduceri","coduri reducere magazine online romania","lista magazine afiliate","reduceri active romania"],
  alternates: { canonical: "https://amcupon.ro/toate-magazinele" },
  openGraph: {
    title: "Toate Magazinele cu Reduceri Romania | AmCupon.ro",
    description: `${PesteMagazine()} cu coduri de reducere actualizate zilnic. Fashion, Electronice, Farmacie, Sport si multe altele.`,
    url: "https://amcupon.ro/toate-magazinele",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
      images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }],
  },
};

export default function ToateMagazinelePage() {
  const data = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "public", "output.json"), "utf-8")
  );
  return <ToateMagazineleClient magazine={data} />;
}
