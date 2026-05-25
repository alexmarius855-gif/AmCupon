import { notFound } from "next/navigation";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import MagazinClient from "./MagazinClient";

interface Promotie {
  nume: string;
  descriere: string;
  cod_cupon: string;
  landing_page: string;
  zile_ramase: number;
}

interface Magazin {
  magazin: string;
  url: string;
  url_afiliat: string;
  logo_url?: string;
  categorie: string;
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
  promotii: Promotie[];
  folosit_de: number;
  procent_succes: number;
  exclusiv: boolean;
}

function loadData(): Magazin[] {
  const filePath = path.join(process.cwd(), "public", "output.json");
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function numeAfisat(magazin: string): string {
  return magazin
    .split(".")[0]
    .replace(/-/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateStaticParams() {
  const magazine = loadData();
  return magazine.map((m) => ({ magazin: m.magazin }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ magazin: string }>;
}): Promise<Metadata> {
  const { magazin: slug } = await params;
  const magazine = loadData();
  const m = magazine.find((x) => x.magazin === slug);

  if (!m) return { title: "Magazin negăsit | AmCupon.ro" };

  const nume = numeAfisat(m.magazin);
  const an = new Date().getFullYear();
  const nrPromo = m.promotii.length;
  const desc = nrPromo > 0
    ? `${nrPromo} coduri de reducere ${nume} verificate ${an}. ${m.promotii[0].nume}. Actualizate zilnic pe AmCupon.ro.`
    : `Cod reducere ${nume} ${an} — magazin partener AmCupon.ro. Categorie: ${m.categorie}. Actualizat zilnic.`;

  return {
    title: `Cod Reducere ${nume} ${an} — ${nrPromo > 0 ? nrPromo + " oferte active" : "Promoții"} | AmCupon.ro`,
    description: desc,
    alternates: {
      canonical: `https://amcupon.ro/cod-reducere/${slug}`,
    },
    openGraph: {
      title: `Cod reducere ${nume} ${an} — ${nrPromo > 0 ? nrPromo + " oferte" : "Promoții active"}`,
      description: desc,
      url: `https://amcupon.ro/cod-reducere/${slug}`,
    },
  };
}

export default async function PaginaMagazin({
  params,
}: {
  params: Promise<{ magazin: string }>;
}) {
  const { magazin: slug } = await params;
  const magazine = loadData();
  const m = magazine.find((x) => x.magazin === slug);

  if (!m) notFound();

  const nume = numeAfisat(m.magazin);
  const an = new Date().getFullYear();
  const pageUrl = `https://amcupon.ro/cod-reducere/${slug}`;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "AmCupon.ro", item: "https://amcupon.ro" },
      { "@type": "ListItem", position: 2, name: `Cod reducere ${nume}`, item: pageUrl },
    ],
  };

  const offerList = m.promotii.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Coduri reducere ${nume} ${an}`,
    url: pageUrl,
    itemListElement: m.promotii.map((promo, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Offer",
        name: promo.nume,
        description: promo.descriere || promo.nume,
        url: pageUrl,
        availability: "https://schema.org/InStock",
        ...(promo.cod_cupon ? { disambiguatingDescription: `Cod: ${promo.cod_cupon}` } : {}),
        seller: { "@type": "Organization", name: nume, url: m.url },
      },
    })),
  } : null;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Cum folosesc un cod de reducere ${nume}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Copiaza codul de reducere ${nume} de pe aceasta pagina, adauga produsele dorite in cosul de cumparaturi pe site-ul ${nume}, iar la finalizarea comenzii introdu codul in campul destinat si apasa Aplica. Reducerea se scade automat.`,
        },
      },
      {
        "@type": "Question",
        name: `Codurile de reducere ${nume} sunt verificate?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Da. AmCupon.ro actualizeaza zilnic toate codurile de reducere ${nume} direct din platforma 2Performant. Afisam rata de succes si zilele ramase de valabilitate pentru fiecare cod.`,
        },
      },
      {
        "@type": "Question",
        name: `Cat timp sunt valabile promotiile ${nume}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: m.promotii.length > 0
            ? `Promotiile active ${nume} au in medie ${Math.round(m.promotii.reduce((s, p) => s + (p.zile_ramase || 0), 0) / m.promotii.length)} zile ramase. Fiecare promotie afiseaza data exacta de expirare.`
            : `Verificam zilnic promotiile ${nume}. Revino curand pentru oferte noi.`,
        },
      },
      {
        "@type": "Question",
        name: "Este AmCupon.ro gratuit?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Da, AmCupon.ro este 100% gratuit pentru utilizatori. Nu platesti nimic in plus fata de pretul normal. Noi primim un mic comision de la magazine din bugetul lor de marketing.",
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {offerList && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offerList) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <MagazinClient magazin={m} />
    </>
  );
}
