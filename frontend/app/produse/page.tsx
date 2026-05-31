import { Metadata } from "next";
import fs from "fs";
import path from "path";
import ProduseClient from "./ProduseClient";
import type { Produs, Magazin, Banner } from "./ProduseClient";

export const metadata: Metadata = {
  title: "Produse cu Reducere Romania 2026 — Top Deals Zilnice | AmCupon.ro",
  description: "Cele mai bune produse cu discount din Romania. Top reduceri azi, campanii vizuale, feed-uri de produse actualizate zilnic. Compara preturi si economiseste.",
  keywords: ["produse reducere romania", "oferte produse online", "top deals azi", "discount produse romania 2026"],
  alternates: { canonical: "https://amcupon.ro/produse" },
  openGraph: {
    title: "Produse cu Reducere Romania 2026 | AmCupon.ro",
    url: "https://amcupon.ro/produse",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
      images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }],
  },
};

function loadJSON<T>(filename: string, fallback: T): T {
  try {
    const p = path.join(process.cwd(), "public", filename);
    if (!fs.existsSync(p)) return fallback;
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {
    return fallback;
  }
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Produse cu Reducere Romania 2026",
  url: "https://amcupon.ro/produse",
  description: "Produse cu discount din magazinele partenere 2Performant, actualizate zilnic.",
};

export default function ProduseePage() {
  const productsData = loadJSON<{ products: Produs[]; updated: string; count?: number }>(
    "products.json", { products: [], updated: "", count: 0 }
  );
  const magazine: Magazin[] = loadJSON<Magazin[]>("output.json", []);
  const bannersData = loadJSON<{ banners: Banner[] }>("banners.json", { banners: [] });

  const an = new Date().getFullYear();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProduseClient
        products={productsData.products || []}
        updated={productsData.updated || ""}
        magazine={magazine}
        banners={bannersData.banners || []}
        an={an}
      />
    </>
  );
}
