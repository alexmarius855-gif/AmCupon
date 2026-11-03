import { deNumar } from "@/lib/acordNumeral";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import ToateMagazineleClient, { type MagazinDirector } from "./ToateMagazineleClient";
import { valoareOferta, type PromotieCupon } from "@/lib/oferta";
import { procentAfisat } from "@/lib/oferteAcasa";
import { numarMagazine, PesteMagazine } from "@/lib/cifreSite";

export const metadata: Metadata = {
  title: `Toate Magazinele cu Reduceri România 2026 — ${Math.floor(numarMagazine() / 100) * 100}+ Parteneri`,
  description: `Lista completă a celor ${numarMagazine()}${deNumar(numarMagazine())} magazine partenere AmCupon.ro, cu coduri de reducere și oferte active.`,
  keywords: ["toate magazinele reduceri","coduri reducere magazine online românia","lista magazine afiliate","reduceri active românia"],
  alternates: { canonical: "https://amcupon.ro/toate-magazinele" },
  openGraph: {
    title: "Toate Magazinele cu Reduceri România | AmCupon.ro",
    description: `${PesteMagazine()} cu coduri de reducere actualizate zilnic. Fashion, Electronice, Farmacie, Sport și multe altele.`,
    url: "https://amcupon.ro/toate-magazinele",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
      images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }],
  },
};

export default function ToateMagazinelePage() {
  const data: (Omit<MagazinDirector, "pct"> & { promotii?: PromotieCupon[] })[] = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "public", "output.json"), "utf-8")
  );
  // Doar ce se afiseaza: pana pe 03.11.2026, in HTML ajungea tot output.json, cu comisionul inclus.
  const magazine: MagazinDirector[] = data.map((m) => ({
    magazin: m.magazin,
    logo_url: m.logo_url,
    categorie_slug: m.categorie_slug,
    are_promotie: m.are_promotie,
    cod_cupon: m.cod_cupon,
    pct: Math.max(0, ...(m.promotii || []).map((p) => procentAfisat(valoareOferta(p).text))),
  }));
  return <ToateMagazineleClient magazine={magazine} />;
}
