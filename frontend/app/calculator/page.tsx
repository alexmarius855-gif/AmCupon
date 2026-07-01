import { Metadata } from "next";
import CalculatorClient from "./CalculatorClient";

export const metadata: Metadata = {
  title: "Calculator Reduceri Online 2026 — Cat Economisesc cu Codul? | AmCupon.ro",
  description: "Calculator reduceri gratuit: afla cat platesti dupa aplicarea unui cod de reducere, ce procent ai primit si economiile totale pentru cosul tau. Simplu si instant.",
  keywords: ["calculator reduceri","cat platesc dupa reducere","calculator cod cupon","calcul procent reducere","economie shopping online"],
  alternates: { canonical: "https://amcupon.ro/calculator" },
  openGraph: {
    title: "Calculator Reduceri Online | AmCupon.ro",
    description: "Calculeaza instant cat economisesti cu un cod de reducere. Simplu, gratuit, fara cont.",
    url: "https://amcupon.ro/calculator",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
      images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Calculator Reduceri Online",
  url: "https://amcupon.ro/calculator",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "RON" },
  description: "Calculeaza instant cat platesti dupa aplicarea unui cod de reducere si cat economisesti la cosul tau.",
  inLanguage: "ro-RO",
  provider: { "@type": "Organization", name: "AmCupon.ro", url: "https://amcupon.ro" },
};

export default function CalculatorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CalculatorClient />
    </>
  );
}
