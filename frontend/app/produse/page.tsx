import { Metadata } from "next";
import fs from "fs";
import path from "path";
import ProduseClient from "./ProduseClient";
import type { Produs, Magazin, Banner } from "./ProduseClient";

export const metadata: Metadata = {
  // 06.10.2026: titlul promitea „Produse cu Reducere — Top Deals", dar doar 133 din 20.264 de
  // produse din feed au reducere. Pagina arata produse cu pretul la zi si ofertele active.
  title: "Produse la zi de la magazinele partenere | AmCupon.ro",
  description: "Produse cu prețul la zi din feed-urile magazinelor partenere și ofertele lor active: campanii, coduri și reduceri, actualizate de mai multe ori pe zi.",
  keywords: ["produse online romania", "oferte magazine online", "preturi produse azi"],
  alternates: { canonical: "https://amcupon.ro/produse" },
  openGraph: {
    title: "Produse la zi de la magazinele partenere | AmCupon.ro",
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
  name: "Produse de la magazinele partenere",
  url: "https://amcupon.ro/produse",
  description: "Produse cu prețul la zi din feed-urile magazinelor partenere, actualizate zilnic.",
};

export default function ProduseePage() {
  const productsData = loadJSON<{ products: Produs[]; updated: string; count?: number }>(
    "products.json", { products: [], updated: "", count: 0 }
  );
  const magazine: Magazin[] = loadJSON<Magazin[]>("output.json", []);
  const bannersData = loadJSON<{ banners: Banner[] }>("banners.json", { banners: [] });

  const an = new Date().getFullYear();

  // ── Structured data: ItemList cu Product + Offer (preturi reale RON) ──────
  // Eligibil pentru rich results Google (imagine + pret in rezultate)
  const produseValide = (productsData.products || [])
    .filter((p) => p.image && (p.price || 0) > 0)
    .slice(0, 30);

  // Politici standard RO/UE — corecte pentru e-commerce romanesc:
  // retragere 14 zile garantata legal (OUG 34/2014). Reutilizate pe toate ofertele.
  const returRO = {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "RO",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 14,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/ReturnShippingFees",
  };
  const livrareRO = {
    "@type": "OfferShippingDetails",
    shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "RON" },
    shippingDestination: { "@type": "DefinedRegion", addressCountry: "RO" },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
      transitTime:  { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
    },
  };

  const produseJsonLd = produseValide.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Produse de la magazinele partenere",
    numberOfItems: produseValide.length,
    itemListElement: produseValide.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: p.title,
        image: p.image,
        description: `${p.title}${p.brand ? ` — ${p.brand}` : ""}. Produs cu reducere${p.merchant ? `, disponibil la ${p.merchant}` : ""} prin AmCupon.ro.`,
        sku: String(p.id ?? `${p.merchant_slug || "amcupon"}-${i}`),
        brand: { "@type": "Brand", name: p.brand || p.merchant?.split(".")[0] || "AmCupon" },
        offers: {
          "@type": "Offer",
          price: Math.round((p.price || 0) * 100) / 100,
          priceCurrency: "RON",
          availability: "https://schema.org/InStock",
          url: p.url,
          hasMerchantReturnPolicy: returRO,
          shippingDetails: livrareRO,
        },
      },
    })),
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {produseJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(produseJsonLd) }} />
      )}
      <ProduseClient
        products={(productsData.products || []).slice(0, 60)}
        updated={productsData.updated || ""}
        magazine={magazine}
        banners={bannersData.banners || []}
        an={an}
      />
    </>
  );
}
