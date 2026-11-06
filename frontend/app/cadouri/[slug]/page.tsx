import { MIN_PRODUSE_OCAZIE, produseOcazie } from "@/lib/cadouri";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { maskCod } from "@/lib/maskCod";
import { cuNumar } from "@/lib/acordNumeral";

/* ─── Configuratie ocazii ────────────────────────────────────────────────── */
const OCAZII: Record<string, {
  titlu: string;
  titluMeta: string;
  desc: string;
  descMeta: string;
  emoji: string;
  from: string;
  to: string;
  catSluguri: string[];
  keywords: string[];
  pretMax?: number;
  pretMin?: number;
  editorial: string;
  idei: string[];
}> = {
  "ea": {
    titlu: "Cadouri pentru Ea",
    titluMeta: "Cadouri pentru Ea 2026 — Idei Originale cu Preț",
    desc: "Bijuterii, fashion, parfumuri — cadouri perfecte pentru femeia specială din viața ta",
    descMeta: "Top idei cadouri pentru femei: bijuterii, parfumuri, fashion. Prețuri de la 50 RON. Livrare rapidă din magazinele partenere.",
    emoji: "💝",
    from: "#ddf93c", to: "#ddf93c",
    catSluguri: ["bijuterii", "fashion"],
    keywords: ["bijuterie", "colier", "cercei", "bratara", "inel", "parfum", "rochie", "poseta"],
    editorial: "Alege un cadou care să o surprindă cu adevărat. Bijuteriile rămân întotdeauna o alegere sigură — de la cercei delicați la coliere cu pandantiv. Dacă o cunoști bine, o piesă fashion sau un parfum de calitate sunt cadouri memorabile.",
    idei: ["Colier sau cercei argint/aur", "Parfum de firmă", "Set cosmetice premium", "Geantă sau poșetă elegantă", "Eșarfă sau șal de calitate", "Bijuterie cu piatră prețioasă"],
  },
  "el": {
    titlu: "Cadouri pentru El",
    titluMeta: "Cadouri pentru El 2026 — Idei pentru Bărbați",
    desc: "Electronice, auto, sport — cadouri practice și utile pentru bărbatul din viața ta",
    descMeta: "Idei cadouri bărbați: gadgeturi, accesorii auto, echipamente sport. Prețuri reale din magazine partenere. Livrare România.",
    emoji: "🎁",
    from: "#ddf93c", to: "#ddf93c",
    catSluguri: ["auto", "electronice", "sport"],
    keywords: ["navigatie", "gadget", "accesoriu", "sport", "fitness", "smartwatch"],
    editorial: "Gadgeturile și accesoriile auto sunt mereu binevenite pentru bărbați. Dacă e pasionat de sport, echipamentele de fitness sunt o alegere practică. Electronicele — smartwatch, căști, accesorii — rămân cadouri sigure.",
    idei: ["Smartwatch sau ceas sport", "Accesorii auto (navigație GPS, cameră dashcam)", "Căști wireless", "Echipament fitness", "Power bank premium", "Set scule sau unelte"],
  },
  "copii": {
    titlu: "Cadouri pentru Copii",
    titluMeta: "Cadouri Copii 2026 — Jucării și Idei Originale",
    desc: "Jucării educative, cărți și echipamente sport pentru copii de toate vârstele",
    descMeta: "Cele mai bune cadouri pentru copii: jucării educative, cărți, echipamente sport. Toate cu livrare rapidă în România.",
    emoji: "🧸",
    from: "#ddf93c", to: "#ddf93c",
    catSluguri: ["fashion", "sport", "bijuterii"],
    keywords: ["copil", "bebe", "jucarie", "carte", "educativ", "sport", "noriel"],
    editorial: "Jucăriile educative stimulează creativitatea și imaginația. Cărțile sunt mereu un cadou cu valoare pe termen lung. Pentru copiii mai mari, echipamentele sport sau jocurile de strategie sunt perfecte.",
    idei: ["Jucărie educativă STEM", "Set de cărți ilustrate", "Bicicletă sau trotinetă", "Joc de societate", "Set creativ (pictură, sculptură)", "Abonament platforme învățare"],
  },
  "botez": {
    titlu: "Cadouri Botez",
    titluMeta: "Cadouri Botez 2026 — Idei Originale pentru Bebeluși",
    desc: "Cadouri elegante și memorabile pentru ocazia botezului — bijuterii, jucării și decorațiuni speciale",
    descMeta: "Cele mai frumoase cadouri de botez: bijuterii argint cu gravură, jucării de pluș, cadouri personalizate. Prețuri și livrare România.",
    emoji: "👶",
    from: "#ddf93c", to: "#c3dd2c",
    catSluguri: ["bijuterii", "fashion"],
    keywords: ["botez", "bebelus", "argint", "gravura", "bijuterie", "set cadou"],
    editorial: "Botezul este una dintre cele mai speciale ocazii din viața unui copil. Cadourile tradiționale — bijuterii din argint cu gravură, seturi de haine premium sau jucării de pluș de calitate — rămân amintiri prețioase pentru părinți și copil deopotrivă.",
    idei: ["Bijuterie argint cu gravură (brățară, lănțișor)", "Pătură personalizată cu numele bebelușului", "Set haine premium pentru bebeluș", "Album foto personalizat", "Jucărie muzicală sau de pluș", "Set cosmetic bebeluș premium"],
  },
  "nasi": {
    titlu: "Cadouri pentru Nași",
    titluMeta: "Cadouri pentru Nași 2026 — Idei Elegante și Speciale",
    desc: "Cadouri de lux și elegante pentru nașii tăi — bijuterii premium, seturi cadou exclusive",
    descMeta: "Cadouri originale pentru nași: bijuterii aur/argint, seturi cadou premium, accesorii elegante. Idei pentru botez și nuntă. Livrare România.",
    emoji: "💍",
    from: "#7c3aed", to: "#c084fc",
    catSluguri: ["bijuterii", "fashion"],
    keywords: ["nas", "fina", "bijuterie", "set cadou", "aur", "argint", "elegant"],
    editorial: "Nașii merită un cadou pe măsura rolului lor special. Bijuteriile din aur sau argint, seturile cadou premium sau accesoriile de lux transmit respectul și recunoștința. Alege ceva memorabil, care să rămână o amintire de valoare.",
    idei: ["Set bijuterii aur/argint (colier + cercei)", "Ceas elegant pentru ea sau el", "Set cosmetice sau parfumuri premium", "Geantă sau portofel de lux", "Voucher la un restaurant/spa", "Tablou personalizat sau obiect decorativ"],
  },
  "mama": {
    titlu: "Cadouri pentru Mama",
    titluMeta: "Cadouri pentru Mama 2026 — Idei Speciale",
    desc: "Bijuterii, cosmetice și mici răsfățuri pentru cea mai importantă femeie din viața ta",
    descMeta: "Idei cadouri mama: bijuterii, parfumuri, cosmetice. De la 50 RON la 500 RON. Livrare rapidă în România din magazine partenere.",
    emoji: "🌸",
    from: "#ddf93c", to: "#ddf93c",
    catSluguri: ["bijuterii", "fashion"],
    keywords: ["mama", "bijuterie", "colier", "cercei", "parfum", "cosmetice", "ingrijire"],
    editorial: "Mama merită să se simtă specială în fiecare zi, nu doar de ziua ei. Un colier cu pandantiv personalizat, un parfum preferat sau un set de cosmetice premium sunt cadouri care îi amintesc că este iubită și apreciată.",
    idei: ["Colier cu pandantiv inimioară sau inițială", "Parfum de firmă preferat", "Set îngrijire piele premium", "Pijamale sau halat de baie moale", "Carte motivațională + ciocolată artizanală", "Plantă sau aranjament floral"],
  },
  "tata": {
    titlu: "Cadouri pentru Tata",
    titluMeta: "Cadouri pentru Tata 2026 — Idei Practice și Utile",
    desc: "Gadgeturi, accesorii auto și unelte — cadouri practice pentru tatăl tău",
    descMeta: "Cele mai bune cadouri pentru tata: accesorii auto, gadgeturi tech, unelte. Livrare rapidă în România. Prețuri de la 100 RON.",
    emoji: "👨",
    from: "#1f2329", to: "#ddf93c",
    catSluguri: ["auto", "electronice", "sport"],
    keywords: ["tata", "auto", "navigatie", "gadget", "smartwatch", "unelte", "sport"],
    editorial: "Tații apreciază cadourile practice și utile. Accesoriile auto, gadgeturile tech sau echipamentele pentru hobby-urile lui sunt alegeri sigure. Dacă e pasionat de sport sau de bricolaj, opțiunile sunt nelimitate.",
    idei: ["Navigație GPS sau cameră auto", "Smartwatch sport", "Set unelte premium", "Căști wireless Bluetooth", "Abonament streaming sau gaming", "Voucher pentru o activitate (karting, tir, etc.)"],
  },
  "valentine": {
    titlu: "Cadouri Valentine's Day",
    titluMeta: "Cadouri Valentine's Day 2026 — Idei Romantice",
    desc: "Bijuterii, parfumuri și surprize romantice pentru ziua îndrăgostiților",
    descMeta: "Cadouri Valentine's Day: bijuterii, parfumuri, set romantic. Idei originale cu livrare rapidă în România. De la 50 RON.",
    emoji: "❤️",
    from: "#e64343", to: "#ddf93c",
    catSluguri: ["bijuterii", "fashion"],
    keywords: ["valentine", "bijuterie", "inima", "colier", "parfum", "romantic", "dragoste"],
    editorial: "Valentine's Day este momentul perfect să arăți cât de mult ții la persoana iubită. O bijuterie cu motiv inimioară, un parfum special sau un set romantic de cosmetice sunt cadouri care transmit emoție și afecțiune.",
    idei: ["Colier sau cercei cu pandantiv inimioară", "Set parfum + loțiune corp", "Brățară personalizată cu gravură", "Set ciocolată artizanală + trandafiri", "Bijuterie argint cu piatră roșie", "Weekend romantic (voucher cazare)"],
  },
  "craciun": {
    titlu: "Cadouri de Crăciun",
    titluMeta: "Cadouri de Crăciun 2026 — Idei pentru Toată Familia",
    desc: "Cadouri pentru întreaga familie — de la copii la adulți, pentru orice buget",
    descMeta: "Idei cadouri Crăciun 2026: jucării, bijuterii, gadgeturi, fashion. Oferte de la magazinele partenere AmCupon.",
    emoji: "🎄",
    from: "#16a34a", to: "#dc2626",
    catSluguri: ["bijuterii", "auto", "electronice", "sport", "fashion"],
    keywords: ["craciun", "cadou", "moș crăciun", "sarbatori"],
    editorial: "Crăciunul este magia din care faci parte și tu. Alege cadouri care să aducă bucurie: bijuterii elegante pentru doamne, gadgeturi pentru bărbați, jucării educative pentru copii. Cel mai important e gândul din spate.",
    idei: ["Bijuterie pentru ea (colier/cercei)", "Gadget sau smartwatch pentru el", "Jucărie premium pentru copii", "Set cosmetice sau parfum", "Carte sau joc de societate", "Voucher shopping sau experiență"],
  },
  "nastere": {
    titlu: "Cadouri de Naștere",
    titluMeta: "Cadouri Zi de Naștere 2026 — Idei Originale cu Preț",
    desc: "Bijuterii, fashion și surprize originale pentru ziua de naștere a cuiva drag",
    descMeta: "Idei originale cadouri zi de naștere: bijuterii, parfumuri, gadgeturi. Prețuri de la 50 RON. Magazine partenere cu livrare rapidă.",
    emoji: "🎂",
    from: "#ddf93c", to: "#c3dd2c",
    catSluguri: ["bijuterii", "fashion", "electronice"],
    keywords: ["nastere", "zi naștere", "aniversare", "bijuterie", "cadou", "surprise"],
    editorial: "Ziua de naștere este momentul în care un cadou atent ales face diferența. Gândește-te la ce își dorește persoana respectivă sau ce ar folosi zilnic. O bijuterie cu semnificație, un gadget dorit sau un parfum preferat sunt mereu binevenite.",
    idei: ["Bijuterie cu piatra lunii de naștere", "Parfum sau set cosmetice", "Gadget dorit (căști, smartwatch)", "Voucher la un magazin preferat", "Experiență (concert, spectacol, spa)", "Set carte + ciocolată artizanală"],
  },
  "absolvire": {
    titlu: "Cadouri Absolvire",
    titluMeta: "Cadouri Absolvire 2026 — Idei pentru Absolvenți",
    desc: "Cadouri practice și memorabile pentru absolvirea școlii, liceului sau facultății",
    descMeta: "Idei cadouri absolvire: bijuterii, gadgeturi, cărți, accesorii. Felicită absolvenții cu un cadou memorabil. Livrare România.",
    emoji: "🎓",
    from: "#ddf93c", to: "#ddf93c",
    catSluguri: ["electronice", "bijuterii", "sport"],
    keywords: ["absolvire", "diploma", "facultate", "liceu", "scoala", "cadou"],
    editorial: "Absolvirea este o realizare majoră care merită sărbătorită. Un gadget util pentru următoarea etapă a vieții, o bijuterie memorabilă sau un voucher de călătorie sunt cadouri care marchează începutul unui nou capitol.",
    idei: ["Laptop sau tabletă (facultate)", "Smartwatch sau ceas elegant", "Bijuterie cu data absolvirii gravată", "Voucher călătorie sau experiență", "Set cărți de business/dezvoltare personală", "Geantă sau rucsac profesional"],
  },
  "pasti": {
    titlu: "Cadouri de Paște",
    titluMeta: "Cadouri de Paște 2026 — Idei pentru Sărbători",
    desc: "Cadouri speciale pentru sărbătoarea Paștelui — pentru copii și adulți",
    descMeta: "Idei cadouri Paște: bijuterii, jucării, seturi cadou. Sărbătoare în familie cu cadouri atente. Livrare România.",
    emoji: "🐣",
    from: "#84cc16", to: "#eab308",
    catSluguri: ["bijuterii", "fashion", "sport"],
    keywords: ["paste", "sarbatoare", "primavara", "cadou", "familie"],
    editorial: "Paștele reunește familia în jurul meselor festive. Un cadou atent ales — o bijuterie elegantă, un set de cosmetice sau un accesoriu util — completează sărbătoarea cu un strop de bucurie în plus.",
    idei: ["Set ciocolată belgiană artizanală", "Bijuterie argint primăvară", "Plantă sau aranjament floral", "Carte de bucate sau lectură", "Set îngrijire corp premium", "Accesorii pentru activități în aer liber"],
  },

  /* ─── Filtre buget ─────────────────────────────────────────────────────── */
  "sub-100-lei": {
    titlu: "Cadouri sub 100 Lei",
    titluMeta: "Cadouri sub 100 Lei 2026 — Idei Ieftine și Originale",
    desc: "Cadouri frumoase și originale cu un buget de maxim 100 lei — bijuterii, accesorii, fashion",
    descMeta: "Idei cadouri sub 100 lei: bijuterii, accesorii, fashion. Cadouri originale la preț mic, de la magazinele partenere AmCupon.",
    emoji: "💰",
    from: "#22c55e", to: "#10b981",
    catSluguri: ["bijuterii", "fashion", "sport"],
    keywords: ["cadou ieftin", "cadou sub 100 lei", "cadou buget mic", "cadou accesibil"],
    pretMax: 100,
    editorial: "Un buget de 100 lei nu înseamnă un cadou slab. Bijuteriile din argint, accesoriile fashion sau produsele de sport pot fi la prețuri accesibile și totuși memorabile. Cheia e alegerea atentă.",
    idei: ["Brățară sau cercei argint sub 80 lei", "Eșarfă sau fular elegant", "Set îngrijire mini", "Carte sau jurnal premium", "Accesoriu sport (șosete, bentiță, brățară fitness)", "Lumânare parfumată artizanală"],
  },
  "sub-200-lei": {
    titlu: "Cadouri sub 200 Lei",
    titluMeta: "Cadouri sub 200 Lei 2026 — Idei Originale cu Preț Bun",
    desc: "Cadouri de calitate cu buget de maxim 200 lei — bijuterii, fashion, sport",
    descMeta: "Idei cadouri sub 200 lei: bijuterii, accesorii premium, fashion. Cadouri originale cu preț bun. Livrare rapidă România.",
    emoji: "🎁",
    from: "#ddf93c", to: "#c3dd2c",
    catSluguri: ["bijuterii", "fashion", "sport"],
    keywords: ["cadou sub 200 lei", "cadou preț mediu", "cadou original", "cadou 150 lei"],
    pretMax: 200,
    editorial: "La 200 lei găsești cadouri cu adevărat impresionante. Coliere sau seturi de bijuterii, genți fashion sau echipamente sport de calitate sunt toate accesibile în această gamă de preț.",
    idei: ["Colier sau set bijuterii argint", "Geantă sau portofel elegant", "Parfum mini sau set cosmetice", "Încălțăminte sport de calitate", "Ceas sport sau accesorii fitness", "Set carte + accesorii premium"],
  },
  "sub-500-lei": {
    titlu: "Cadouri sub 500 Lei",
    titluMeta: "Cadouri sub 500 Lei 2026 — Cadouri Premium la Preț Bun",
    desc: "Cadouri premium și memorabile cu buget de maxim 500 lei — bijuterii, electronice, fashion",
    descMeta: "Cadouri sub 500 lei: bijuterii premium, electronice, accesorii auto. Cadouri de impact fără a rupe bugetul. Livrare România.",
    emoji: "💎",
    from: "#ddf93c", to: "#ddf93c",
    catSluguri: ["bijuterii", "auto", "electronice", "sport", "fashion"],
    keywords: ["cadou sub 500 lei", "cadou premium", "cadou 400 lei", "cadou calitate"],
    pretMax: 500,
    editorial: "La 500 lei intri în zona cadourilor cu adevărat premium. Bijuterii aur sau argint de calitate, gadgeturi utile, accesorii auto sau echipamente sport profesionale — toate sunt accesibile în această gamă.",
    idei: ["Bijuterie aur/argint premium", "Smartwatch sau ceas sport", "Accesoriu auto (navigație, cameră)", "Set sport profesional", "Geantă sau rucsac premium", "Set electronic (căști, power bank, hub)"],
  },
  "peste-500-lei": {
    titlu: "Cadouri Luxoase peste 500 Lei",
    titluMeta: "Cadouri de Lux peste 500 Lei — Cadouri Speciale 2026",
    desc: "Cadouri premium și de lux pentru ocazii speciale — bijuterii, electronice, auto",
    descMeta: "Cadouri luxoase peste 500 lei: bijuterii premium, electronice de top, accesorii auto. Pentru nași, nunți, aniversări speciale.",
    emoji: "👑",
    from: "#7c3aed", to: "#c084fc",
    catSluguri: ["bijuterii", "auto", "electronice", "sport"],
    keywords: ["cadou lux", "cadou scump", "cadou nuntă", "cadou premium"],
    pretMin: 500,
    editorial: "Cadourile luxoase transmit o apreciere deosebită. Pentru nași, aniversări sau ocazii speciale, o bijuterie din aur, un gadget de top sau un accesoriu auto premium sunt alegeri irezistibile.",
    idei: ["Bijuterie aur cu diamant/pietre prețioase", "Smartwatch premium (Apple Watch, Samsung)", "Navigație dedicată auto", "Set parfum de lux", "Geantă designer", "Weekend la spa (voucher)"],
  },
};

interface Produs {
  id: string;
  url: string;
  image?: string;
  title: string;
  discount_pct?: number;
  old_price?: number;
  price: number;
  merchant_slug?: string;
  cat_slug?: string;
}

interface Promotie {
  cod_cupon?: string;
}

interface Magazin {
  magazin: string;
  logo_url?: string;
  magazin_display?: string;
  are_promotie?: boolean;
  cod_cupon?: boolean;
  promotii?: Promotie[];
}

/* ─── Load products ──────────────────────────────────────────────────────── */
function loadProducts(): Produs[] {
  try {
    const p = path.join(process.cwd(), "public", "products.json");
    return JSON.parse(fs.readFileSync(p, "utf-8")).products || [];
  } catch {
    return [];
  }
}

function getProducts(slug: string, ocazie: typeof OCAZII[string], allProducts: Produs[]) {
  return produseOcazie(slug, allProducts, ocazie.pretMin, ocazie.pretMax);
}

function loadOutput(): Magazin[] {
  try {
    const p = path.join(process.cwd(), "public", "output.json");
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {
    return [];
  }
}

/* ─── Static params ──────────────────────────────────────────────────────── */
export function generateStaticParams() {
  // Pagina apare doar daca are destule produse potrivite ocaziei.
  const toate = loadProducts();
  return Object.keys(OCAZII)
    .filter((slug) => getProducts(slug, OCAZII[slug], toate).length >= MIN_PRODUSE_OCAZIE)
    .map((slug) => ({ slug }));
}

/* ─── Metadata ───────────────────────────────────────────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const oc = OCAZII[slug];
  if (!oc) return { title: "Pagina negăsită" };
  const url = `https://amcupon.ro/cadouri/${slug}`;
  return {
    // 22.09.2026: cu sufixul de brand, opt dintre cele saisprezece pagini de ocazie
    // treceau de 60 de caractere, deci Google taia tocmai ocazia („...cadouri pentru
    // nas" in loc de „nasi"). Sufixul cade primul — el nu aduce clicul.
    title: `${oc.titluMeta} | AmCupon.ro`.length <= 60
      ? `${oc.titluMeta} | AmCupon.ro`
      : oc.titluMeta.slice(0, 60).trim(),
    description: oc.descMeta,
    keywords: [`cadouri ${slug}`, "idei cadouri românia", "cadouri originale", "cadouri cu preț", ...oc.keywords],
    alternates: { canonical: url },
    openGraph: {
      title: oc.titluMeta,
      description: oc.descMeta,
      url,
      siteName: "AmCupon.ro",
      locale: "ro_RO",
      type: "website",
    },
  };
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default async function CadouriSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const oc = OCAZII[slug];
  if (!oc) notFound();

  const allProducts = loadProducts();
  const products = getProducts(slug, oc, allProducts);
  if (products.length < MIN_PRODUSE_OCAZIE) notFound();
  const magazine = loadOutput();

  const promoRelevante = magazine
    .filter((m: Magazin) => (m.are_promotie || m.cod_cupon))
    .slice(0, 8);

  const altePagini = Object.entries(OCAZII)
    .filter(([s]) => s !== slug)
    .slice(0, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": oc.titlu,
    "description": oc.descMeta,
    "url": `https://amcupon.ro/cadouri/${slug}`,
    "itemListElement": products.slice(0, 10).map((p: Produs, i: number) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": p.title,
      "url": p.url,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-[var(--background)]">

        {/* Header */}
        <header className="bg-[var(--surface)] border-b border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm flex-wrap">
            <Link href="/" className="flex items-center gap-1.5 shrink-0">
              <div className="bg-[#ddf93c] text-[#0c1000] font-black text-sm px-1.5 py-0.5 rounded-md">Am</div>
              <span className="font-black text-[var(--foreground)]">Cupon.ro</span>
            </Link>
            <span className="text-[var(--text-muted)]">/</span>
            <Link href="/cadouri" className="text-[var(--text-soft)] hover:text-[var(--foreground)]">Cadouri</Link>
            <span className="text-[var(--text-muted)]">/</span>
            <span className="text-[var(--text-soft)] font-semibold">{oc.titlu}</span>
          </div>
        </header>

        {/* Hero */}
        <div
          className="relative py-12 px-4 text-center overflow-hidden border-b border-[var(--border)]"
          style={{ background: `linear-gradient(135deg, ${oc.from}18 0%, ${oc.to}12 100%)` }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 70% 60% at 50% 0%, ${oc.from}22 0%, transparent 70%)` }} />
          <div className="relative max-w-3xl mx-auto">
            <div className="text-5xl mb-4">{oc.emoji}</div>
            <h1 className="text-3xl md:text-4xl font-black text-[var(--foreground)] mb-3">
              {oc.titlu}
            </h1>
            <p className="text-[var(--text-soft)] text-base mb-4 max-w-xl mx-auto">{oc.desc}</p>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <span className="flex items-center gap-1.5 bg-[var(--surface-alt)]/80 border border-[var(--border-strong)] text-[var(--text-soft)] px-3 py-1.5 rounded-full">
                <span className="text-emerald-400">✓</span> {products.length}+ produse disponibile
              </span>
              <span className="flex items-center gap-1.5 bg-[var(--surface-alt)]/80 border border-[var(--border-strong)] text-[var(--text-soft)] px-3 py-1.5 rounded-full">
                <span className="text-[var(--accent-text)]">✓</span> Prețuri din feed-ul magazinelor
              </span>
              <span className="flex items-center gap-1.5 bg-[var(--surface-alt)]/80 border border-[var(--border-strong)] text-[var(--text-soft)] px-3 py-1.5 rounded-full">
                <span className="text-[var(--accent-text)]">✓</span> Livrare România
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10">

          {/* Idei rapide */}
          <section className="mb-10">
            <h2 className="text-lg font-black text-[var(--foreground)] mb-4">Idei populare de cadouri</h2>
            <div className="flex flex-wrap gap-2">
              {oc.idei.map((idee, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 bg-[var(--surface)] border border-[var(--border-strong)] text-[var(--text-soft)] text-sm px-3 py-1.5 rounded-xl"
                >
                  <span style={{ color: `color-mix(in srgb, ${oc.from} 45%, var(--foreground))` }}>→</span>
                  {idee}
                </span>
              ))}
            </div>
          </section>

          {/* Produse din feed */}
          {products.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-black text-[var(--foreground)]">
                  Produse disponibile — {oc.titlu}
                </h2>
                <span className="text-sm text-[var(--text-muted)]">{cuNumar(products.length, "produs", "produse")}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {products.map((p: Produs) => (
                  <a
                    key={p.id}
                    href={p.url}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="group bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent-text)]/40 rounded-xl overflow-hidden transition-all hover:shadow-lg hover:shadow-[#ddf93c]/5 hover:-translate-y-0.5"
                  >
                    {/* Imagine produs */}
                    <div className="aspect-square relative bg-[var(--surface-alt)] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {((p.discount_pct || 0) > 0 || p.old_price) && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-lg">
                          -{p.discount_pct || (p.old_price ? Math.round(((p.old_price - p.price) / p.old_price) * 100) : 0)}%
                        </div>
                      )}
                    </div>

                    {/* Info produs */}
                    <div className="p-3">
                      <p className="text-[var(--text-soft)] text-xs font-medium leading-tight line-clamp-2 mb-2 group-hover:text-[var(--foreground)] transition-colors">
                        {p.title}
                      </p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[var(--accent-text)] font-black text-sm">{p.price} RON</span>
                        {p.old_price && (
                          <span className="text-[var(--text-muted)] text-xs line-through">{p.old_price}</span>
                        )}
                      </div>
                      <p className="text-[var(--text-muted)] text-[10px] mt-1">{p.merchant_slug?.replace(".ro", "").replace(".com", "")}</p>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Editorial */}
          <section className="mb-10">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
              <h2 className="text-lg font-black text-[var(--foreground)] mb-3">Cum alegi {oc.titlu.toLowerCase()}?</h2>
              <p className="text-[var(--text-soft)] text-sm leading-relaxed mb-4">{oc.editorial}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[var(--surface-alt)]/50 rounded-xl p-4">
                  <div className="text-2xl mb-2">💡</div>
                  <h3 className="text-sm font-bold text-[var(--foreground)] mb-1">Gândește-te la persoana</h3>
                  <p className="text-xs text-[var(--text-muted)]">Care sunt hobby-urile și pasiunile ei/lui? Un cadou personalizat valorează mult mai mult decât unul scump dar nepotrivit.</p>
                </div>
                <div className="bg-[var(--surface-alt)]/50 rounded-xl p-4">
                  <div className="text-2xl mb-2">💰</div>
                  <h3 className="text-sm font-bold text-[var(--foreground)] mb-1">Stabilește un buget</h3>
                  <p className="text-xs text-[var(--text-muted)]">Nu trebuie să cheltuiești mult pentru a impresiona. Cadouri între 100-300 RON sunt apreciate la fel de mult ca cele mai scumpe.</p>
                </div>
                <div className="bg-[var(--surface-alt)]/50 rounded-xl p-4">
                  <div className="text-2xl mb-2">📦</div>
                  <h3 className="text-sm font-bold text-[var(--foreground)] mb-1">Verifică livrarea</h3>
                  <p className="text-xs text-[var(--text-muted)]">Asigură-te că produsul ajunge la timp. Toate magazinele partenere AmCupon livrează în România, cele mai multe în 24-48h.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Oferte active din magazine */}
          {promoRelevante.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-black text-[var(--foreground)] mb-4">Oferte active azi în magazine</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {promoRelevante.slice(0, 8).map((m: Magazin, i: number) => (
                  <Link
                    key={i}
                    href={`/cod-reducere/${m.magazin}`}
                    className="bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent-text)]/40 rounded-xl p-3 flex items-center gap-2 transition-all"
                  >
                    {m.logo_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.logo_url} alt={m.magazin_display || m.magazin} className="w-8 h-8 rounded-lg object-contain bg-[var(--surface)] p-0.5" loading="lazy" />
                    )}
                    <div>
                      <div className="text-[var(--text-soft)] text-xs font-bold">{m.magazin_display || m.magazin}</div>
                      {m.promotii?.[0]?.cod_cupon && (
                        <div className="text-[var(--accent-text)] text-[10px] font-mono font-black">{maskCod(m.promotii[0].cod_cupon)}</div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Alte ocazii */}
          <section className="mb-6 border-t border-[var(--border)] pt-8">
            <h2 className="text-base font-bold text-[var(--foreground)] mb-4">Alte ocazii — mai multe idei</h2>
            <div className="flex flex-wrap gap-2">
              {altePagini.map(([s, o]) => (
                <Link
                  key={s}
                  href={`/cadouri/${s}`}
                  className="flex items-center gap-1.5 bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] text-[var(--text-soft)] hover:text-[var(--foreground)] text-sm px-3 py-2 rounded-xl transition-all"
                >
                  {o.emoji} {o.titlu}
                </Link>
              ))}
              <Link
                href="/cadouri"
                className="flex items-center gap-1.5 bg-[#ddf93c]/10 border border-[var(--accent-text)]/30 text-[var(--accent-text)] hover:text-[var(--accent-text)] text-sm px-3 py-2 rounded-xl transition-all font-bold"
              >
                Toate ocaziile →
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
