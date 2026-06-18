import { Metadata } from "next";
import CalculatorSalariuClient from "./CalculatorSalariuClient";

export const metadata: Metadata = {
  title: "Calculator Salariu Net din Brut 2026 — CAS, CASS, Impozit | AmCupon.ro",
  description: "Calculeaza instant salariul net din brut, conform cotelor 2026: CAS 25%, CASS 10%, impozit 10%, deducere personala in functie de persoane in intretinere. Gratuit, fara cont.",
  keywords: ["calculator salariu net 2026", "calcul salariu net din brut", "cota cas cass impozit 2026", "deducere personala 2026", "salariu minim brut 2026", "calculator salariu romania"],
  alternates: { canonical: "https://amcupon.ro/calculator-salariu" },
  openGraph: {
    title: "Calculator Salariu Net din Brut 2026 | AmCupon.ro",
    description: "Calculeaza instant salariul net, conform cotelor fiscale 2026 din Romania. Simplu, gratuit, fara cont.",
    url: "https://amcupon.ro/calculator-salariu",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
    images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }],
  },
};

export default function CalculatorSalariuPage() {
  return <CalculatorSalariuClient />;
}
