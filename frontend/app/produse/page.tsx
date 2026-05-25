import { Metadata } from "next";
import fs from "fs";
import path from "path";
import ProduseClient from "./ProduseClient";

export const metadata: Metadata = {
  title: "Produse cu Reducere România 2026 — Cele Mai Bune Oferte | AmCupon.ro",
  description: "Mii de produse cu discount din cele mai mari magazine online din România. Filtrează după categorie, brand sau procent reducere. Actualizat zilnic.",
  keywords: ["produse reducere romania", "oferte produse online", "discount produse emag", "produse ieftine online romania 2026"],
  alternates: { canonical: "https://amcupon.ro/produse" },
  openGraph: {
    title: "Produse cu Reducere România 2026 | AmCupon.ro",
    url: "https://amcupon.ro/produse",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

export interface Produs {
  title: string;
  url: string;
  image: string;
  price: number;
  old_price?: number;
  discount_pct: number;
  category: string;
  brand: string;
  merchant: string;
  merchant_slug: string;
}

function loadProducts(): { products: Produs[]; updated: string } {
  try {
    const p = path.join(process.cwd(), "public", "products.json");
    if (!fs.existsSync(p)) return { products: [], updated: "" };
    const raw = JSON.parse(fs.readFileSync(p, "utf-8"));
    return {
      products: raw.products || raw,
      updated: raw.updated || "",
    };
  } catch {
    return { products: [], updated: "" };
  }
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Produse cu Reducere România 2026",
  url: "https://amcupon.ro/produse",
  description: "Produse cu discount din magazinele partenere 2Performant",
};

export default function ProduseePage() {
  const { products, updated } = loadProducts();
  const an = new Date().getFullYear();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProduseClient products={products} updated={updated} an={an} />
    </>
  );
}
