import { notFound } from "next/navigation";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import Link from "next/link";

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
    titluMeta: "Cadouri pentru Ea 2026 — Idei Originale cu Pret",
    desc: "Bijuterii, fashion, parfumuri — cadouri perfecte pentru femeia speciala din viata ta",
    descMeta: "Top idei cadouri pentru femei: bijuterii, parfumuri, fashion. Preturi de la 50 RON. Livrare rapida din magazinele partenere.",
    emoji: "💝",
    from: "#f43f5e", to: "#ec4899",
    catSluguri: ["bijuterii", "fashion"],
    keywords: ["bijuterie", "colier", "cercei", "bratara", "inel", "parfum", "rochie", "poseta"],
    editorial: "Alege un cadou care sa o surprinda cu adevarat. Bijuteriile raman intotdeauna o alegere sigura — de la cercei delicati la coliere cu pandantiv. Daca o cunosti bine, o piesa fashion sau un parfum de calitate sunt cadouri memorabile.",
    idei: ["Colier sau cercei argint/aur", "Parfum de firma", "Set cosmetice premium", "Geanta sau poseta eleganta", "Esarfa sau sal de calitate", "Bijuterie cu piatra pretioasa"],
  },
  "el": {
    titlu: "Cadouri pentru El",
    titluMeta: "Cadouri pentru El 2026 — Idei pentru Barbati",
    desc: "Electronice, auto, sport — cadouri practice si utile pentru barbatul din viata ta",
    descMeta: "Idei cadouri barbati: gadgeturi, accesorii auto, echipamente sport. Preturi reale din magazine partenere. Livrare Romania.",
    emoji: "🎁",
    from: "#3b82f6", to: "#6366f1",
    catSluguri: ["auto", "electronice", "sport"],
    keywords: ["navigatie", "gadget", "accesoriu", "sport", "fitness", "smartwatch"],
    editorial: "Gadgeturile si accesoriile auto sunt mereu binevenite pentru barbati. Daca e pasionat de sport, echipamentele de fitness sunt o alegere practica. Electronicele — smartwatch, casti, accesorii — raman cadouri sigure.",
    idei: ["Smartwatch sau ceas sport", "Accesorii auto (navigatie GPS, camera dashcam)", "Casti wireless", "Echipament fitness", "Power bank premium", "Set scule sau unelte"],
  },
  "copii": {
    titlu: "Cadouri pentru Copii",
    titluMeta: "Cadouri Copii 2026 — Jucarii si Idei Originale",
    desc: "Jucarii educative, carti si echipamente sport pentru copii de toate varstele",
    descMeta: "Cele mai bune cadouri pentru copii: jucarii educative, carti, echipamente sport. Toate cu livrare rapida in Romania.",
    emoji: "🧸",
    from: "#a855f7", to: "#ec4899",
    catSluguri: ["fashion", "sport", "bijuterii"],
    keywords: ["copil", "bebe", "jucarie", "carte", "educativ", "sport", "noriel"],
    editorial: "Jucariile educative stimuleaza creativitatea si imaginatia. Cartile sunt mereu un cadou cu valoare pe termen lung. Pentru copiii mai mari, echipamentele sport sau jocurile de strategie sunt perfecte.",
    idei: ["Jucarie educativa STEM", "Set de carti ilustrate", "Bicicleta sau trotineta", "Joc de societate", "Set creativ (pictura, sculptura)", "Abonament platforme invatare"],
  },
  "botez": {
    titlu: "Cadouri Botez",
    titluMeta: "Cadouri Botez 2026 — Idei Originale pentru Bebelusi",
    desc: "Cadouri elegante si memorabile pentru ocazia botezului — bijuterii, jucarii si decoratiuni speciale",
    descMeta: "Cele mai frumoase cadouri de botez: bijuterii argint cu gravura, jucarii de plus, cadouri personalizate. Preturi si livrare Romania.",
    emoji: "👶",
    from: "#60a5fa", to: "#818cf8",
    catSluguri: ["bijuterii", "fashion"],
    keywords: ["botez", "bebelus", "argint", "gravura", "bijuterie", "set cadou"],
    editorial: "Botezul este una dintre cele mai speciale ocazii din viata unui copil. Cadourile traditionale — bijuterii din argint cu gravura, seturi de haine premium sau jucarii de plus de calitate — raman amintiri pretioase pentru parinti si copil deopotriva.",
    idei: ["Bijuterie argint cu gravura (bratara, lantisor)", "Patura personalizata cu numele bebelusului", "Set haine premium pentru bebelus", "Album foto personalizat", "Jucarie muzicala sau de plus", "Set cosmetic bebelus premium"],
  },
  "nasi": {
    titlu: "Cadouri pentru Nasi",
    titluMeta: "Cadouri pentru Nasi 2026 — Idei Elegante si Speciale",
    desc: "Cadouri de lux si elegante pentru nasii tai — bijuterii premium, seturi cadou exclusive",
    descMeta: "Cadouri originale pentru nasi: bijuterii aur/argint, seturi cadou premium, accesorii elegante. Idei pentru botez si nunta. Livrare Romania.",
    emoji: "💍",
    from: "#d97706", to: "#f59e0b",
    catSluguri: ["bijuterii", "fashion"],
    keywords: ["nas", "fina", "bijuterie", "set cadou", "aur", "argint", "elegant"],
    editorial: "Nasii merita un cadou pe masura rolului lor special. Bijuteriile din aur sau argint, seturile cadou premium sau accesoriile de lux transmit respectul si recunostinta. Alege ceva memorabil, care sa ramana o amintire de valoare.",
    idei: ["Set bijuterii aur/argint (colier + cercei)", "Ceas elegant pentru ea sau el", "Set cosmetice sau parfumuri premium", "Geanta sau portofel de lux", "Voucher la un restaurant/spa", "Tablou personalizat sau obiect decorativ"],
  },
  "mama": {
    titlu: "Cadouri pentru Mama",
    titluMeta: "Cadouri pentru Mama 2026 — Idei Speciale",
    desc: "Bijuterii, cosmetice si mici rasfaturi pentru cea mai importanta femeie din viata ta",
    descMeta: "Idei cadouri mama: bijuterii, parfumuri, cosmetice. De la 50 RON la 500 RON. Livrare rapida in Romania din magazine partenere.",
    emoji: "🌸",
    from: "#f43f5e", to: "#a855f7",
    catSluguri: ["bijuterii", "fashion"],
    keywords: ["mama", "bijuterie", "colier", "cercei", "parfum", "cosmetice", "ingrijire"],
    editorial: "Mama merita sa se simta speciala in fiecare zi, nu doar de ziua ei. Un colier cu pandantiv personalizat, un parfum preferat sau un set de cosmetice premium sunt cadouri care ii amintesc ca este iubita si apreciata.",
    idei: ["Colier cu pandantiv inimioara sau initial", "Parfum de firma preferat", "Set ingrijire piele premium", "Pijamale sau halat de baie moale", "Carte motivationala + ciocolata artizanala", "Planta sau aranjament floral"],
  },
  "tata": {
    titlu: "Cadouri pentru Tata",
    titluMeta: "Cadouri pentru Tata 2026 — Idei Practice si Utile",
    desc: "Gadgeturi, accesorii auto si unelte — cadouri practice pentru tatal tau",
    descMeta: "Cele mai bune cadouri pentru tata: accesorii auto, gadgeturi tech, unelte. Livrare rapida in Romania. Preturi de la 100 RON.",
    emoji: "👨",
    from: "#1e293b", to: "#3b82f6",
    catSluguri: ["auto", "electronice", "sport"],
    keywords: ["tata", "auto", "navigatie", "gadget", "smartwatch", "unelte", "sport"],
    editorial: "Tatii apreciaza cadourile practice si utile. Accesoriile auto, gadgeturile tech sau echipamentele pentru hobby-urile lui sunt alegeri sigure. Daca e pasionat de sport sau de bricolaj, optiunile sunt nelimitate.",
    idei: ["Navigatie GPS sau camera auto", "Smartwatch sport", "Set unelte premium", "Casti wireless Bluetooth", "Abonament streaming sau gaming", "Voucher pentru o activitate (karting, tir, etc.)"],
  },
  "valentine": {
    titlu: "Cadouri Valentine's Day",
    titluMeta: "Cadouri Valentine's Day 2026 — Idei Romantice",
    desc: "Bijuterii, parfumuri si surprize romantice pentru ziua indragostitilor",
    descMeta: "Cadouri Valentine's Day: bijuterii, parfumuri, set romantic. Idei originale cu livrare rapida in Romania. De la 50 RON.",
    emoji: "❤️",
    from: "#ef4444", to: "#f43f5e",
    catSluguri: ["bijuterii", "fashion"],
    keywords: ["valentine", "bijuterie", "inima", "colier", "parfum", "romantic", "dragoste"],
    editorial: "Valentine's Day este momentul perfect sa arati cat de mult tii la persoana iubita. O bijuterie cu motiv inimioara, un parfum special sau un set romantic de cosmetice sunt cadouri care transmit emotie si afectiune.",
    idei: ["Colier sau cercei cu pandantiv inimioara", "Set parfum + lotiune corp", "Bratara personalizata cu gravura", "Set ciocolata artizanala + trandafiri", "Bijuterie argint cu piatra rosie", "Weekend romantic (voucher cazare)"],
  },
  "craciun": {
    titlu: "Cadouri de Craciun",
    titluMeta: "Cadouri de Craciun 2026 — Idei pentru Toata Familia",
    desc: "Cadouri pentru intreaga familie — de la copii la adulti, pentru orice buget",
    descMeta: "Idei cadouri Craciun 2026: jucarii, bijuterii, gadgeturi, fashion. Oferte speciale din 291+ magazine. Livrare inainte de Craciun.",
    emoji: "🎄",
    from: "#16a34a", to: "#dc2626",
    catSluguri: ["bijuterii", "auto", "electronice", "sport", "fashion"],
    keywords: ["craciun", "cadou", "mos craciun", "sarbatori"],
    editorial: "Craciunul este magia din care faci parte si tu. Alege cadouri care sa aduca bucurie: bijuterii elegante pentru doamne, gadgeturi pentru barbati, jucarii educative pentru copii. Cel mai important e gandul din spate.",
    idei: ["Bijuterie pentru ea (colier/cercei)", "Gadget sau smartwatch pentru el", "Jucarie premium pentru copii", "Set cosmetice sau parfum", "Carte sau joc de societate", "Voucher shopping sau experienta"],
  },
  "nastere": {
    titlu: "Cadouri de Nastere",
    titluMeta: "Cadouri Zi de Nastere 2026 — Idei Originale cu Pret",
    desc: "Bijuterii, fashion si surprize originale pentru ziua de nastere a cuiva drag",
    descMeta: "Idei originale cadouri zi de nastere: bijuterii, parfumuri, gadgeturi. Preturi de la 50 RON. Magazine partenere cu livrare rapida.",
    emoji: "🎂",
    from: "#f97316", to: "#eab308",
    catSluguri: ["bijuterii", "fashion", "electronice"],
    keywords: ["nastere", "zi nastere", "aniversare", "bijuterie", "cadou", "surprise"],
    editorial: "Ziua de nastere este momentul in care un cadou atent ales face diferenta. Gandeste-te la ce isi doreste persoana respectiva sau ce ar folosi zilnic. O bijuterie cu semnificatie, un gadget dorit sau un parfum preferat sunt mereu binevenit.",
    idei: ["Bijuterie cu piatra lunii de nastere", "Parfum sau set cosmetice", "Gadget dorit (casti, smartwatch)", "Voucher la un magazin preferat", "Experienta (concert, spectacol, spa)", "Set carte + ciocolata artizanala"],
  },
  "absolvire": {
    titlu: "Cadouri Absolvire",
    titluMeta: "Cadouri Absolvire 2026 — Idei pentru Absolventi",
    desc: "Cadouri practice si memorabile pentru absolvirea scolii, liceului sau facultatii",
    descMeta: "Idei cadouri absolvire: bijuterii, gadgeturi, carti, accesorii. Felicita absolventi cu un cadou memorabil. Livrare Romania.",
    emoji: "🎓",
    from: "#7c3aed", to: "#3b82f6",
    catSluguri: ["electronice", "bijuterii", "sport"],
    keywords: ["absolvire", "diploma", "facultate", "liceu", "scoala", "cadou"],
    editorial: "Absolvirea este o realizare majora care merita sarbatorita. Un gadget util pentru urmatoarea etapa a vietii, o bijuterie memorabila sau un voucher de calatorie sunt cadouri care marcat inceputul unui nou capitol.",
    idei: ["Laptop sau tableta (facultate)", "Smartwatch sau ceas elegant", "Bijuterie cu data absolvirii gravata", "Voucher calatorie sau experienta", "Set carti de business/dezvoltare personala", "Geanta sau rucsac profesional"],
  },
  "pasti": {
    titlu: "Cadouri de Paste",
    titluMeta: "Cadouri de Paste 2026 — Idei pentru Sarbatori",
    desc: "Cadouri speciale pentru sarbatoarea Pastelui — pentru copii si adulti",
    descMeta: "Idei cadouri Paste: bijuterii, jucarii, seturi cadou. Sarbatoare in familie cu cadouri atente. Livrare Romania.",
    emoji: "🐣",
    from: "#84cc16", to: "#eab308",
    catSluguri: ["bijuterii", "fashion", "sport"],
    keywords: ["paste", "sarbatoare", "primavara", "cadou", "familie"],
    editorial: "Pastele reuneste familia in jurul meselor festive. Un cadou atent ales — o bijuterie eleganta, un set de cosmetice sau un accesoriu util — completeaza sarbatoarea cu un strop de bucurie in plus.",
    idei: ["Set ciocolata belgiana artizanala", "Bijuterie argint primavara", "Planta sau aranjament floral", "Carte de bucate sau lectura", "Set ingrijire corp premium", "Accesorii pentru activitati in aer liber"],
  },
};

/* ─── Load products ──────────────────────────────────────────────────────── */
function loadProducts() {
  try {
    const p = path.join(process.cwd(), "public", "products.json");
    return JSON.parse(fs.readFileSync(p, "utf-8")).products || [];
  } catch {
    return [];
  }
}

function getProducts(ocazie: typeof OCAZII[string], allProducts: any[]) {
  const real = allProducts.filter((p: any) =>
    p.image && p.image.length > 5 &&
    p.price > 0 &&
    ocazie.catSluguri.includes(p.cat_slug)
  );

  let filtered = real;
  if (ocazie.pretMax) filtered = filtered.filter((p: any) => p.price <= ocazie.pretMax!);
  if (ocazie.pretMin) filtered = filtered.filter((p: any) => p.price >= ocazie.pretMin!);

  const withDiscount = filtered.filter((p: any) => p.discount_pct > 0 || p.old_price);
  const withoutDiscount = filtered.filter((p: any) => !p.discount_pct && !p.old_price);
  const sorted = [...withDiscount, ...withoutDiscount].slice(0, 36);
  return sorted;
}

function loadOutput() {
  try {
    const p = path.join(process.cwd(), "public", "output.json");
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {
    return [];
  }
}

/* ─── Static params ──────────────────────────────────────────────────────── */
export function generateStaticParams() {
  return Object.keys(OCAZII).map((slug) => ({ slug }));
}

/* ─── Metadata ───────────────────────────────────────────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const oc = OCAZII[slug];
  if (!oc) return { title: "Pagina negasita" };
  const url = `https://amcupon.ro/cadouri/${slug}`;
  return {
    title: `${oc.titluMeta} | AmCupon.ro`,
    description: oc.descMeta,
    keywords: [`cadouri ${slug}`, "idei cadouri romania", "cadouri originale", "cadouri cu pret", ...oc.keywords],
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
  const products = getProducts(oc, allProducts);
  const magazine = loadOutput();

  const promoRelevante = magazine
    .filter((m: any) => (m.are_promotie || m.cod_cupon))
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
    "itemListElement": products.slice(0, 10).map((p: any, i: number) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": p.title,
      "url": p.url,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-slate-950">

        {/* Header */}
        <header className="bg-slate-900 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm flex-wrap">
            <Link href="/" className="flex items-center gap-1.5 shrink-0">
              <div className="bg-orange-500 text-white font-black text-sm px-1.5 py-0.5 rounded-md">Am</div>
              <span className="font-black text-white">Cupon.ro</span>
            </Link>
            <span className="text-slate-600">/</span>
            <Link href="/cadouri" className="text-slate-400 hover:text-white">Cadouri</Link>
            <span className="text-slate-600">/</span>
            <span className="text-slate-300 font-semibold">{oc.titlu}</span>
          </div>
        </header>

        {/* Hero */}
        <div
          className="relative py-12 px-4 text-center overflow-hidden border-b border-slate-800"
          style={{ background: `linear-gradient(135deg, ${oc.from}18 0%, ${oc.to}12 100%)` }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 70% 60% at 50% 0%, ${oc.from}22 0%, transparent 70%)` }} />
          <div className="relative max-w-3xl mx-auto">
            <div className="text-5xl mb-4">{oc.emoji}</div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
              {oc.titlu}
            </h1>
            <p className="text-slate-400 text-base mb-4 max-w-xl mx-auto">{oc.desc}</p>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <span className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-full">
                <span className="text-emerald-400">✓</span> {products.length}+ produse disponibile
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-full">
                <span className="text-orange-400">✓</span> Preturi verificate azi
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-full">
                <span className="text-blue-400">✓</span> Livrare Romania
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10">

          {/* Idei rapide */}
          <section className="mb-10">
            <h2 className="text-lg font-black text-white mb-4">Idei populare de cadouri</h2>
            <div className="flex flex-wrap gap-2">
              {oc.idei.map((idee, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 text-slate-300 text-sm px-3 py-1.5 rounded-xl"
                >
                  <span style={{ color: oc.from }}>→</span>
                  {idee}
                </span>
              ))}
            </div>
          </section>

          {/* Produse din feed */}
          {products.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-black text-white">
                  Produse disponibile — {oc.titlu}
                </h2>
                <span className="text-sm text-slate-500">{products.length} produse</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {products.map((p: any) => (
                  <a
                    key={p.id}
                    href={p.url}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="group bg-slate-900 border border-slate-800 hover:border-orange-500/40 rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:shadow-orange-500/5 hover:-translate-y-0.5"
                  >
                    {/* Imagine produs */}
                    <div className="aspect-square relative bg-slate-800 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {(p.discount_pct > 0 || p.old_price) && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-lg">
                          -{p.discount_pct || Math.round(((p.old_price - p.price) / p.old_price) * 100)}%
                        </div>
                      )}
                    </div>

                    {/* Info produs */}
                    <div className="p-3">
                      <p className="text-slate-300 text-xs font-medium leading-tight line-clamp-2 mb-2 group-hover:text-white transition-colors">
                        {p.title}
                      </p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-orange-400 font-black text-sm">{p.price} RON</span>
                        {p.old_price && (
                          <span className="text-slate-600 text-xs line-through">{p.old_price}</span>
                        )}
                      </div>
                      <p className="text-slate-600 text-[10px] mt-1">{p.merchant_slug?.replace(".ro", "").replace(".com", "")}</p>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Editorial */}
          <section className="mb-10">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-lg font-black text-white mb-3">Cum alegi {oc.titlu.toLowerCase()}?</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">{oc.editorial}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="text-2xl mb-2">💡</div>
                  <h3 className="text-sm font-bold text-white mb-1">Gandeste-te la persoana</h3>
                  <p className="text-xs text-slate-500">Care sunt hobby-urile si pasiunile ei/lui? Un cadou personalizat valoreath mult mai mult decat unul scump dar nepotrivit.</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="text-2xl mb-2">💰</div>
                  <h3 className="text-sm font-bold text-white mb-1">Stabileste un buget</h3>
                  <p className="text-xs text-slate-500">Nu trebuie sa cheltuiesti mult pentru a impresiona. Cadouri intre 100-300 RON sunt apreciate la fel de mult ca cele mai scumpe.</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="text-2xl mb-2">📦</div>
                  <h3 className="text-sm font-bold text-white mb-1">Verifica livrarea</h3>
                  <p className="text-xs text-slate-500">Asigura-te ca produsul ajunge la timp. Toate magazinele partenere AmCupon livreaza in Romania, cele mai multe in 24-48h.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Oferte active din magazine */}
          {promoRelevante.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-black text-white mb-4">Oferte active azi in magazine</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {promoRelevante.slice(0, 8).map((m: any, i: number) => (
                  <Link
                    key={i}
                    href={`/cod-reducere/${m.magazin}`}
                    className="bg-slate-900 border border-slate-800 hover:border-orange-500/40 rounded-xl p-3 flex items-center gap-2 transition-all"
                  >
                    {m.logo_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.logo_url} alt={m.magazin_display || m.magazin} className="w-8 h-8 rounded-lg object-contain bg-white p-0.5" loading="lazy" />
                    )}
                    <div>
                      <div className="text-slate-300 text-xs font-bold">{m.magazin_display || m.magazin}</div>
                      {m.cod_cupon && (
                        <div className="text-orange-400 text-[10px] font-mono font-black">{m.cod_cupon}</div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Alte ocazii */}
          <section className="mb-6 border-t border-slate-800 pt-8">
            <h2 className="text-base font-bold text-white mb-4">Alte ocazii — mai multe idei</h2>
            <div className="flex flex-wrap gap-2">
              {altePagini.map(([s, o]) => (
                <Link
                  key={s}
                  href={`/cadouri/${s}`}
                  className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-slate-600 text-slate-400 hover:text-white text-sm px-3 py-2 rounded-xl transition-all"
                >
                  {o.emoji} {o.titlu}
                </Link>
              ))}
              <Link
                href="/cadouri"
                className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 hover:text-orange-300 text-sm px-3 py-2 rounded-xl transition-all font-bold"
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
