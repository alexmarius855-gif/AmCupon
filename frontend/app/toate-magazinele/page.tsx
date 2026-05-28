import { Metadata } from "next";
import fs from "fs";
import path from "path";
import ToateMagazineleClient from "./ToateMagazineleClient";

export const metadata: Metadata = {
  title: "Toate Magazinele cu Reduceri Romania 2026 — 600+ Parteneri | AmCupon.ro",
  description: "Lista completa a 600+ magazine partenere AmCupon.ro cu coduri de reducere si oferte verificate. Cauta magazinul preferat sau filtreaza pe categorie. Actualizat zilnic.",
  keywords: ["toate magazinele reduceri","coduri reducere magazine online romania","lista magazine afiliate","reduceri verificate romania"],
  alternates: { canonical: "https://amcupon.ro/toate-magazinele" },
  openGraph: {
    title: "Toate Magazinele cu Reduceri Romania | AmCupon.ro",
    description: "600+ magazine cu coduri de reducere verificate zilnic. Fashion, Electronice, Farmacie, Sport si multe altele.",
    url: "https://amcupon.ro/toate-magazinele",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

export default function ToateMagazinelePage() {
  const data = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "public", "output.json"), "utf-8")
  );
  return <ToateMagazineleClient magazine={data} />;
}
