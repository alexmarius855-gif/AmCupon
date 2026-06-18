import { Metadata } from "next";
import ProformaClient from "./ProformaClient";

export const metadata: Metadata = {
  title: "Generator Proforma Gratuit 2026 — Model Factura Proforma | AmCupon.ro",
  description: "Genereaza si printeaza gratuit o factura proforma pentru clientii tai: completezi datele, vezi totalul calculat automat, salvezi ca PDF. Fara cont, fara inregistrare.",
  keywords: ["generator proforma gratuit", "model factura proforma", "factura proforma online", "proforma PFA", "deviz online gratuit", "model proforma 2026"],
  alternates: { canonical: "https://amcupon.ro/generator-proforma" },
  openGraph: {
    title: "Generator Proforma Gratuit | AmCupon.ro",
    description: "Creeaza o factura proforma in 2 minute. Calcul automat, salvare PDF, fara cont.",
    url: "https://amcupon.ro/generator-proforma",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
    images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }],
  },
};

export default function GeneratorProformaPage() {
  return <ProformaClient />;
}
