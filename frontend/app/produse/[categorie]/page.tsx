import { Metadata } from "next";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import ProduseCategorieClient from "./ProduseCategorieClient";
import type { Produs } from "../ProduseClient";
import { CAT_META } from "../categorie-meta";
import { CAT_FAQ } from "./categorie-faq";

export { CAT_META };

export async function generateStaticParams() {
  return Object.keys(CAT_META).map((categorie) => ({ categorie }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ categorie: string }> }
): Promise<Metadata> {
  const { categorie } = await params;
  const meta = CAT_META[categorie];
  if (!meta) return { title: "Produse — AmCupon.ro" };

  return {
    title: `${meta.h1} ${new Date().getFullYear()} — AmCupon.ro`,
    description: meta.desc,
    keywords: meta.keywords,
    alternates: { canonical: `https://amcupon.ro/produse/${categorie}` },
    openGraph: {
      title: `${meta.h1} ${new Date().getFullYear()} | AmCupon.ro`,
      description: meta.desc,
      url: `https://amcupon.ro/produse/${categorie}`,
      siteName: "AmCupon.ro",
      locale: "ro_RO",
      type: "website",
      images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }],
    },
  };
}

function loadJSON<T>(filename: string, fallback: T): T {
  try {
    const p = path.join(process.cwd(), "public", filename);
    if (!fs.existsSync(p)) return fallback;
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {
    return fallback;
  }
}

export default async function ProduseCategorieePage(
  { params }: { params: Promise<{ categorie: string }> }
) {
  const { categorie } = await params;
  const meta = CAT_META[categorie];
  if (!meta) notFound();

  const productsData = loadJSON<{ products: (Produs & { cat_slug?: string })[]; updated: string }>(
    "products.json", { products: [], updated: "" }
  );

  const all = productsData.products || [];
  const filtered: Produs[] = all.filter((p) => p.cat_slug === categorie);

  const an = new Date().getFullYear();
  const topProduse = filtered.filter((p) => p.image && (p.price || 0) > 0).slice(0, 20);

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
      transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
    },
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${meta.h1} ${an}`,
    url: `https://amcupon.ro/produse/${categorie}`,
    description: meta.desc,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "AmCupon.ro", item: "https://amcupon.ro" },
        { "@type": "ListItem", position: 2, name: "Produse", item: "https://amcupon.ro/produse" },
        { "@type": "ListItem", position: 3, name: meta.label, item: `https://amcupon.ro/produse/${categorie}` },
      ],
    },
  };

  const itemListJsonLd = topProduse.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: meta.h1,
    numberOfItems: topProduse.length,
    itemListElement: topProduse.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: p.title,
        image: p.image,
        sku: String(p.id ?? `${p.merchant_slug || "amcupon"}-${i}`),
        brand: { "@type": "Brand", name: p.brand || p.merchant?.split(".")[0] || "AmCupon" },
        offers: {
          "@type": "Offer",
          price: Math.round((p.price || 0) * 100) / 100,
          priceCurrency: "RON",
          availability: "https://schema.org/InStock",
          url: p.url,
          priceValidUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          ...(p.old_price && p.old_price > (p.price || 0) ? {
            priceSpecification: {
              "@type": "PriceSpecification",
              price: Math.round((p.price || 0) * 100) / 100,
              priceCurrency: "RON",
            },
          } : {}),
          hasMerchantReturnPolicy: returRO,
          shippingDetails: livrareRO,
        },
      },
    })),
  } : null;

  const faqItems = CAT_FAQ[categorie] || [];
  const faqJsonLd = faqItems.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item: { q: string; a: string }) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {itemListJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      )}
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}
      <ProduseCategorieClient
        products={filtered}
        updated={productsData.updated}
        categorie={categorie}
        catMeta={meta}
        totalAll={all.length}
      />
    </>
  );
}
