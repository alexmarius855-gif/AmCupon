import { Metadata } from "next";
import fs from "fs";
import path from "path";
import ToateMagazineleClient from "./ToateMagazineleClient";

export const metadata: Metadata = {
  title: "Toate magazinele cu coduri de reducere | AmCupon.ro",
  description: "Lista completă a celor 200+ magazine partenere AmCupon.ro cu coduri de reducere și oferte verificate. Filtrează după categorie sau caută magazinul dorit.",
  alternates: { canonical: "https://amcupon.ro/toate-magazinele" },
};

export default function ToateMagazinelePage() {
  const data = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "public", "output.json"), "utf-8")
  );
  return <ToateMagazineleClient magazine={data} />;
}
