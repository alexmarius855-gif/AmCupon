import { notFound } from "next/navigation";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import CategorieClient from "./CategorieClient";
import NisaProduse from "../../components/NisaProduse";

const CATEG_MERCHANTS: Record<string, string[]> = {
  "fashion":            ["fashiondays.ro","answear.ro","hm.com","reserved.com","about-you.ro","lc-waikiki.ro","zara.com"],
  "home-garden":        ["dedeman.ro","ikea.com","leroy-merlin.ro","mobexpert.ro","jysk.ro","hornbach.ro"],
  "electronics-itc":   ["emag.ro","altex.ro","pcgarage.ro","flanco.ro","cel.ro","evomag.ro"],
  "beauty":             ["notino.ro","douglas.ro","sephora.ro","makeup.ro","beautik.ro"],
  "pharma":             ["drmax.ro","vegis.ro","catena.ro","helpnet.ro","farmaciatei.ro"],
  "babies-kids-toys":  ["noriel.ro","emag.ro","smythstoys.com","bebetei.ro","chicco.ro"],
  "sports-outdoors":   ["decathlon.ro","sportisimo.ro","sport-vision.ro","intersport.ro","hervis.ro"],
  "books":              ["libris.ro","elefant.ro","carturesti.ro","librarie.net","bookhub.ro"],
  "gifts-flowers":     ["floria.ro","noriel.ro","elefant.ro","fashiondays.ro","notino.ro"],
  "automotive":         ["autonom.ro","autodoc.ro","kfzteile24.ro"],
  "health-personal-care": ["drmax.ro","vegis.ro","catena.ro"],
  "pet-supplies":       ["zooplus.ro","animax.ro","petshop.ro"],
  "jewelry":            ["bijuteria.ro","teilor.ro"],
  "games":              ["pcgarage.ro","emag.ro"],
};

const CATEG_CULORI: Record<string, string> = {
  "fashion": "purple", "home-garden": "green", "electronics-itc": "blue",
  "beauty": "pink", "pharma": "emerald", "babies-kids-toys": "yellow",
  "sports-outdoors": "orange", "books": "amber", "gifts-flowers": "rose",
  "automotive": "gray", "health-personal-care": "teal", "jewelry": "violet",
};

const CATEG_CAT_SLUG: Record<string, string> = {
  "fashion": "fashion", "home-garden": "casa", "electronics-itc": "electronice",
  "beauty": "beauty", "pharma": "farmacie", "babies-kids-toys": "copii",
  "sports-outdoors": "sport", "books": "carti", "gifts-flowers": "bijuterii",
  "automotive": "auto", "health-personal-care": "farmacie", "pet-supplies": "animale",
  "jewelry": "bijuterii", "games": "jocuri", "online-mall": "electronice",
};

interface Magazin {
  magazin: string;
  url: string;
  url_afiliat: string;
  logo_url?: string;
  categorie: string;
  categorie_slug: string;
  comision: string;
  rank?: number;
  scor_afiliere: number;
  scor_final: number;
  prioritate: string;
  canal_recomandat: string;
  sales_number: number;
  trend: number;
  are_promotie: boolean;
  cod_cupon: boolean;
  zile_ramase: number;
  promotii: { nume: string; descriere: string; cod_cupon: string; landing_page: string; zile_ramase: number }[];
  folosit_de: number;
  procent_succes: number;
  exclusiv: boolean;
}

const NUME_CATEGORIE: Record<string, string> = {
  "fashion": "Fashion",
  "home-garden": "Casă & Grădină",
  "books": "Cărți",
  "electronics-itc": "Electronice IT&C",
  "health-personal-care": "Sănătate & Îngrijire",
  "pharma": "Farmacie",
  "babies-kids-toys": "Copii & Jucării",
  "beauty": "Frumusețe",
  "sports-outdoors": "Sport & Outdoor",
  "automotive": "Auto-Moto",
  "hypermarket-groceries": "Hypermarket & Grocery",
  "online-mall": "Online Mall",
  "gifts-flowers": "Cadouri & Flori",
  "pet-supplies": "Animale de Companie",
  "jewelry": "Bijuterii",
  "telecom": "Telecom",
  "games": "Jocuri",
  "software": "Software",
  "insurance": "Asigurări",
  "office-supplies": "Papetărie & Birou",
  "watches": "Ceasuri",
  "others": "Altele",
};

function loadData(): Magazin[] {
  const filePath = path.join(process.cwd(), "public", "output.json");
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export async function generateStaticParams() {
  const magazine = loadData();
  const slugs = [...new Set(magazine.map((m) => m.categorie_slug).filter(Boolean))];
  return slugs.map((slug) => ({ slug }));
}

const LUNI_RO = [
  "ianuarie","februarie","martie","aprilie","mai","iunie",
  "iulie","august","septembrie","octombrie","noiembrie","decembrie",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const magazine = loadData();
  const mag = magazine.filter((m) => m.categorie_slug === slug);
  if (!mag.length) return { title: "Categorie negasita | AmCupon.ro" };

  const numeCateg = NUME_CATEGORIE[slug] || mag[0].categorie;
  const cuPromo   = mag.filter((m) => m.are_promotie).length;
  const cuCod     = mag.filter((m) => m.cod_cupon).length;
  const an        = new Date().getFullYear();
  const luna      = LUNI_RO[new Date().getMonth()];
  const pageUrl   = `https://amcupon.ro/categorii/${slug}`;

  const title = cuCod > 0
    ? `Cod Reducere ${numeCateg} ${luna} ${an} — ${cuCod} coduri active | AmCupon.ro`
    : `Coduri reducere ${numeCateg} ${an} — ${cuPromo} oferte active | AmCupon.ro`;

  const description = `${cuPromo > 0 ? `✅ ${cuPromo} promotii active` : "Promotii verificate"} la ${mag.length} magazine de ${numeCateg} din Romania. ${cuCod > 0 ? `${cuCod} coduri reducere active in ${luna} ${an}. ` : ""}Oferte verificate zilnic pe AmCupon.ro.`;

  return {
    title,
    description,
    keywords: [
      `cod reducere ${numeCateg.toLowerCase()}`,
      `reduceri ${numeCateg.toLowerCase()} ${an}`,
      `magazine ${numeCateg.toLowerCase()} romania`,
      `voucher ${numeCateg.toLowerCase()}`,
      `promotii ${numeCateg.toLowerCase()}`,
      "coduri reducere romania",
      "amcupon.ro",
    ],
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "AmCupon.ro",
      locale: "ro_RO",
      type: "website",
      images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }],
    },
  };
}

export default async function PaginaCategorie({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const magazine = loadData();
  const mag = magazine.filter((m) => m.categorie_slug === slug);
  if (!mag.length) notFound();

  const numeCateg = NUME_CATEGORIE[slug] || mag[0].categorie;
  const cuPromo   = mag.filter((m) => m.are_promotie).length;
  const cuCod     = mag.filter((m) => m.cod_cupon).length;
  const an        = new Date().getFullYear();
  const luna      = LUNI_RO[new Date().getMonth()];
  const pageUrl   = `https://amcupon.ro/categorii/${slug}`;

  // Top magazine cu cod cupon pentru FAQ
  const topCoduri = mag.filter((m) => m.cod_cupon).slice(0, 3).map((m) =>
    m.magazin.split(".")[0].replace(/-/g, " ").split(" ")
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
  );

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "AmCupon.ro", item: "https://amcupon.ro" },
      { "@type": "ListItem", position: 2, name: "Categorii", item: "https://amcupon.ro/categorii" },
      { "@type": "ListItem", position: 3, name: numeCateg, item: pageUrl },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Unde gasesc coduri de reducere la magazine de ${numeCateg}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Pe AmCupon.ro gasesti ${cuPromo} promotii active pentru ${mag.length} magazine de ${numeCateg} din Romania. Toate codurile sunt verificate si actualizate zilnic — gratuit.`,
        },
      },
      {
        "@type": "Question",
        name: `Cate coduri de reducere ${numeCateg} sunt active in ${luna} ${an}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: cuCod > 0
            ? `In ${luna} ${an} sunt ${cuCod} coduri de reducere active la magazine de ${numeCateg}${topCoduri.length > 0 ? `, printre care ${topCoduri.join(", ")}` : ""}. AmCupon.ro actualizeaza zilnic toate ofertele.`
            : `AmCupon.ro urmareste ${cuPromo} promotii active la magazine de ${numeCateg}. Revino zilnic pentru coduri noi.`,
        },
      },
      {
        "@type": "Question",
        name: `Cum functioneaza codurile de reducere la magazine de ${numeCateg}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Copiaza codul de pe AmCupon.ro, adauga produsele in cos pe site-ul magazinului ales, apoi la checkout introdu codul in campul "Cod promotional" sau "Voucher". Reducerea se aplica automat.`,
        },
      },
      {
        "@type": "Question",
        name: "Este AmCupon.ro gratuit?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Da, AmCupon.ro este 100% gratuit pentru cumparatori. Nu platesti nimic in plus. Magazinele ne platesc un mic comision din bugetul lor de marketing.",
        },
      },
    ],
  };

  const itemListSchema = cuPromo > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Magazine ${numeCateg} cu reduceri — ${luna} ${an}`,
    description: `${cuPromo} promotii active la magazine de ${numeCateg} pe AmCupon.ro`,
    url: pageUrl,
    numberOfItems: mag.filter((m) => m.are_promotie).length,
    itemListElement: mag
      .filter((m) => m.are_promotie)
      .slice(0, 10)
      .map((m, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://amcupon.ro/cod-reducere/${m.magazin}`,
        name: m.magazin.split(".")[0].replace(/-/g, " ").split(" ")
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      })),
  } : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {itemListSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      )}
      <CategorieClient magazine={mag} numeCategorie={numeCateg} slug={slug} />
      {CATEG_MERCHANTS[slug] && (
        <NisaProduse
          merchantSlugs={CATEG_MERCHANTS[slug]}
          catSlug={CATEG_CAT_SLUG[slug] || ""}
          titlu={`Produse populare — ${numeCateg} cu reducere`}
          culoareAccent={CATEG_CULORI[slug] || "orange"}
          limit={12}
        />
      )}
    </>
  );
}
