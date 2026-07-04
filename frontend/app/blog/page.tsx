import { Metadata } from "next";
import fs from "fs";
import path from "path";
import Image from "next/image";
import Link from "next/link";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ cat?: string }> }): Promise<Metadata> {
  const { cat } = await searchParams;
  const title = cat && cat !== "Toate"
    ? `Revista ${cat} — Sfaturi reduceri online | AmCupon.ro`
    : "Revista AmCupon — Ghiduri si sfaturi reduceri online";
  return {
    title,
    description: "Ghiduri, comparatii si sfaturi despre cum sa economisesti la cumparaturile online din Romania. Coduri reducere, oferte si promotii explicate.",
    alternates: { canonical: "https://amcupon.ro/blog" },
    openGraph: {
      title,
      url: "https://amcupon.ro/blog",
      siteName: "AmCupon.ro",
      locale: "ro_RO",
      type: "website",
      images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }],
    },
  };
}

interface BlogPost {
  slug: string; title: string; date: string; excerpt: string;
  category: string; magazin: string | null; cover: string;
}
interface Recomandat {
  magazin: string; nume: string; logo_url: string;
  categorie: string; comision: number; are_cod: boolean; oferta: string;
}
interface Magazin {
  magazin: string; are_promotie?: boolean; promotii?: { cod_cupon?: string }[];
}

function readJSON<T>(file: string, fallback: T): T {
  try {
    const p = path.join(process.cwd(), "public", file);
    if (!fs.existsSync(p)) return fallback;
    return JSON.parse(fs.readFileSync(p, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

function loadPosts(): BlogPost[] {
  return readJSON<BlogPost[]>("blog-posts.json", [])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" });
}

const CATEG_MAP: Record<string, string> = {
  "Ghiduri": "Ghiduri", "Ghid": "Ghiduri",
  "Electronice": "Electronice", "Electronics IT&C": "Electronice", "Electronice IT&C": "Electronice",
  "Electronice & Gadgeturi": "Electronice", "Periferice Gaming": "Electronice", "Gaming": "Electronice",
  "Laptopuri & PC": "Electronice", "Baterii & Incarcare": "Electronice", "Energie Portabila": "Electronice",
  "Monitoare Portabile": "Electronice", "Online Mall": "Electronice", "Gadgets": "Electronice",
  "Fashion": "Fashion", "Fashion & General": "Fashion", "Fashion Feminin": "Fashion",
  "Incaltaminte": "Fashion", "Sneakers & Streetwear": "Fashion", "Imbracaminte Bambus": "Fashion",
  "Home & Garden": "Casa & Gradina", "Casa & Gradina": "Casa & Gradina", "Casa": "Casa & Gradina",
  "Electrocasnice": "Casa & Gradina", "Mobilier & Birou": "Casa & Gradina", "Brazi Artificiali": "Casa & Gradina",
  "Beauty": "Frumusete", "Frumusete": "Frumusete", "Jewelry": "Frumusete",
  "Sport": "Sport", "Sports & outdoors": "Sport", "Sport & Outdoor": "Sport",
  "Fitness & Sport": "Sport", "Pariuri & Sport": "Sport", "Outdoor & Camping": "Sport",
  "Biciclete Electrice": "Sport", "Biciclete & MTB": "Sport", "Fitness App": "Sport",
  "Sanatate": "Sanatate", "Farmacie": "Sanatate", "Pharma": "Sanatate",
  "Health & Personal care": "Sanatate", "Sticle Apa Smart": "Sanatate",
  "Copii": "Copii & Jucarii", "Babies Kids & Toys": "Copii & Jucarii",
  "Copii si Jucarii": "Copii & Jucarii", "Accesorii Bebe": "Copii & Jucarii", "Babywearing": "Copii & Jucarii",
  "Carti": "Carti", "Books": "Carti", "Carti & Rezumate": "Carti",
  "Calatorie": "Calatorie", "Transport & Calatorii": "Calatorie", "Turism & Activitati": "Calatorie",
  "eSIM Calatorii": "Calatorie",
  "Automotive": "Auto-Moto", "Auto-Moto": "Auto-Moto", "Auto": "Auto-Moto",
  "Animale": "Animale", "Pet supplies": "Animale", "Accesorii Animale": "Animale",
  "Hosting": "Tehnologie", "Hosting WordPress": "Tehnologie", "Hosting & Domenii": "Tehnologie",
  "Software & VPN": "Tehnologie", "Antivirus & Securitate": "Tehnologie", "Domenii Web": "Tehnologie",
  "Proxy & VPN": "Tehnologie", "VPN": "Tehnologie", "Securitate Mac": "Tehnologie",
  "CRM & Marketing": "Tehnologie", "Editare Foto": "Tehnologie", "Video & AI Tools": "Tehnologie",
  "Ecommerce Platform": "Tehnologie", "Teme Shopify": "Tehnologie", "Teme WordPress": "Tehnologie",
  "WordPress Tools": "Tehnologie", "Stock Photos": "Tehnologie", "Smart Home": "Tehnologie",
};
const MACRO_ORDINE = ["Ghiduri","Electronice","Fashion","Casa & Gradina","Frumusete","Sport","Sanatate","Copii & Jucarii","Carti","Calatorie","Auto-Moto","Animale","Tehnologie"];
const getMacro = (cat: string) => CATEG_MAP[cat] || "";

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  const categorieActiva = cat || "Toate";
  const toatePosts = loadPosts();
  const recomandate = readJSON<Recomandat[]>("recomandate.json", []).slice(0, 6);
  const magazine = readJSON<Magazin[]>("output.json", []);

  const nrCoduri = magazine.filter(m => (m.promotii || []).some(p => p.cod_cupon)).length;
  const nrPromo = magazine.filter(m => m.are_promotie).length;

  const categorii = ["Toate", ...MACRO_ORDINE.filter(m => toatePosts.some(p => getMacro(p.category) === m))];
  const posts = categorieActiva === "Toate"
    ? toatePosts
    : toatePosts.filter(p => getMacro(p.category) === categorieActiva);

  const featured = categorieActiva === "Toate" && posts.length >= 5 ? posts.slice(0, 5) : [];
  const restul = featured.length ? posts.slice(5) : posts;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Revista AmCupon.ro",
    url: "https://amcupon.ro/blog",
    description: "Ghiduri si sfaturi despre cum sa economisesti la cumparaturile online din Romania.",
    inLanguage: "ro-RO",
    publisher: { "@type": "Organization", name: "AmCupon.ro", url: "https://amcupon.ro" },
    blogPost: toatePosts.slice(0, 10).map(p => ({
      "@type": "BlogPosting", headline: p.title, url: `https://amcupon.ro/blog/${p.slug}`,
      datePublished: p.date, description: p.excerpt, image: p.cover,
      author: { "@type": "Organization", name: "AmCupon.ro" },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-[#0b0a07]">
        {/* Header */}
        <header className="bg-[#0b0a07] border-b border-[#26211a]">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 shrink-0">
              <div className="bg-[#b8912e] text-white font-black text-base px-2 py-1 rounded-lg">Am</div>
              <span className="font-black text-white text-xl">Cupon</span>
              <span className="text-[#d8c091] font-black text-xl">.ro</span>
            </Link>
            <span className="text-[#473d28]">/</span>
            <span className="text-sm font-semibold text-[#c8bda2]">Revista</span>
          </div>
        </header>

        {/* Hero compact */}
        <div className="relative bg-[#0b0a07] border-b border-[#26211a] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(184,145,46,0.15) 0%, transparent 65%)" }} />
          <div className="relative max-w-7xl mx-auto text-center py-9 px-4">
            <h1 className="text-3xl md:text-4xl font-black mb-2 text-white">
              Revista <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #e3d1a6, #b8912e)" }}>AmCupon</span>
            </h1>
            <p className="text-[#a89a78] text-sm max-w-xl mx-auto">
              Ghiduri, comparatii si sfaturi ca sa cumperi inteligent si sa economisesti la fiecare comanda
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10">
          {/* Mozaic featured */}
          {featured.length === 5 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-12">
              <Link href={`/blog/${featured[0].slug}`} className="group relative rounded-2xl overflow-hidden border border-[#26211a] hover:border-[#c9a63e]/50 transition-colors min-h-[300px] lg:min-h-[440px] flex">
                <Image src={featured[0].cover} alt={featured[0].title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 1024px) 100vw, 50vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a07] via-[#0b0a07]/40 to-transparent" />
                <div className="relative mt-auto p-6 z-10">
                  <span className="inline-block bg-[#b8912e] text-white text-xs font-bold px-2.5 py-1 rounded-full mb-3">{featured[0].category}</span>
                  <h2 className="font-black text-white text-xl md:text-2xl leading-tight group-hover:text-[#e3d1a6] transition-colors line-clamp-3">{featured[0].title}</h2>
                  <p className="text-[#c8bda2] text-sm mt-2 line-clamp-2">{featured[0].excerpt}</p>
                </div>
              </Link>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {featured.slice(1).map(post => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="group relative rounded-2xl overflow-hidden border border-[#26211a] hover:border-[#c9a63e]/50 transition-colors min-h-[200px] flex">
                    <Image src={post.cover} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, 25vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a07] via-[#0b0a07]/30 to-transparent" />
                    <div className="relative mt-auto p-4 z-10">
                      <span className="inline-block bg-[#b8912e]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5">{post.category}</span>
                      <h3 className="font-bold text-white text-sm leading-snug group-hover:text-[#e3d1a6] transition-colors line-clamp-2">{post.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Titlu sectiune + filtre */}
          <h2 className="text-xl md:text-2xl font-black text-white text-center mb-6">Cele mai noi sfaturi si articole</h2>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categorii.map(c => (
              <Link key={c} href={c === "Toate" ? "/blog" : `/blog?cat=${encodeURIComponent(c)}`}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  categorieActiva === c ? "bg-[#b8912e] text-white"
                    : "bg-[#15120c] border border-[#37301f] text-[#a89a78] hover:border-[#c9a63e] hover:text-[#e3d1a6]"}`}>
                {c}
                {c !== "Toate" && <span className="ml-1.5 text-[10px] opacity-70">({toatePosts.filter(p => getMacro(p.category) === c).length})</span>}
              </Link>
            ))}
          </div>

          {/* Layout 2 coloane: sidebar + articole */}
          <div className="grid lg:grid-cols-[300px_minmax(0,1fr)] gap-8">
            {/* ── SIDEBAR ── */}
            <aside className="order-2 lg:order-1 space-y-5">
              {/* Intro */}
              <div className="bg-[#15120c] border border-[#26211a] rounded-2xl p-5">
                <h3 className="font-black text-white text-base mb-2">Revista AmCupon — cumpara inteligent</h3>
                <p className="text-sm text-[#a89a78] leading-relaxed mb-4">
                  Ghiduri si sfaturi verificate ca sa gasesti pretul bun si sa nu ratezi reducerile reale din magazinele tale preferate.
                </p>
                <Link href="/top-reduceri" className="inline-flex items-center gap-1 text-sm font-bold text-[#d8c091] hover:text-[#e3d1a6]">
                  Vezi codurile active <span aria-hidden>→</span>
                </Link>
              </div>

              {/* Recomandam */}
              {recomandate.length > 0 && (
                <div className="bg-[#15120c] border border-[#26211a] rounded-2xl p-5">
                  <h3 className="font-black text-white text-base mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-4 rounded-full bg-gradient-to-b from-[#d8c091] to-[#d8c091]" />
                    Recomandam
                  </h3>
                  <ul className="space-y-3">
                    {recomandate.map(r => (
                      <li key={r.magazin}>
                        <Link href={`/cod-reducere/${r.magazin}`} className="flex items-center gap-3 group">
                          <span className="w-11 h-11 shrink-0 rounded-xl bg-white overflow-hidden flex items-center justify-center border border-[#37301f]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={r.logo_url} alt={r.nume} className="w-full h-full object-contain p-1" loading="lazy" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold text-white truncate group-hover:text-[#e3d1a6] transition-colors">{r.nume}</span>
                            <span className="block text-[11px] text-[#8c8064] truncate">{r.categorie}</span>
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${r.are_cod ? "bg-[#c9a63e]/15 text-[#e3d1a6] border border-[#c9a63e]/25" : "bg-[#c9a63e]/15 text-[#e3d1a6] border border-[#c9a63e]/25"}`}>
                            {r.are_cod ? "Cod" : "Oferta"}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA newsletter */}
              <div className="relative rounded-2xl overflow-hidden border border-[#c9a63e]/30 p-5" style={{ background: "linear-gradient(135deg, rgba(184,145,46,0.25), rgba(8,145,178,0.18))" }}>
                <h3 className="font-black text-white text-base mb-1">Coduri noi pe email</h3>
                <p className="text-sm text-[#c8bda2] mb-4">Primesti cele mai bune reduceri ale zilei. Gratuit, fara spam.</p>
                <Link href="/newsletter" className="block text-center bg-[#b8912e] hover:bg-[#c9a63e] text-white font-bold text-sm py-2.5 rounded-xl transition-colors">
                  Ma abonez gratuit
                </Link>
              </div>
            </aside>

            {/* ── ARTICOLE ── */}
            <div className="order-1 lg:order-2">
              {restul.length === 0 && featured.length === 0 ? (
                <div className="text-center py-20 text-[#8c8064]">
                  <p className="text-lg mb-4">Niciun articol in categoria &ldquo;{categorieActiva}&rdquo;.</p>
                  <Link href="/blog" className="text-[#d8c091] font-bold hover:underline">Vezi toate articolele →</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {restul.map((post, i) => {
                    // Intercaleaza un card-promo pe brand la fiecare 6 articole (stil Kuplio, dar curat)
                    const promoIdx = Math.floor(i / 6);
                    const injectPromo = i > 0 && i % 6 === 0 && recomandate[promoIdx % recomandate.length];
                    const promo = injectPromo ? recomandate[promoIdx % recomandate.length] : null;
                    return (
                      <div key={post.slug} className="contents">
                        {promo && (
                          <Link href={`/cod-reducere/${promo.magazin}`}
                            className="relative rounded-2xl overflow-hidden border border-[#c9a63e]/30 p-5 flex flex-col justify-between min-h-[220px] group"
                            style={{ background: "linear-gradient(135deg, rgba(184,145,46,0.28), rgba(8,145,178,0.16))" }}>
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#e3d1a6]">Recomandat</span>
                              <h3 className="font-black text-white text-lg leading-tight mt-1">Cod reducere {promo.nume}</h3>
                              <p className="text-sm text-[#c8bda2] mt-1 line-clamp-2">{promo.oferta || `Oferte verificate la ${promo.nume} pe AmCupon.`}</p>
                            </div>
                            <div className="flex items-center gap-3 mt-4">
                              <span className="w-10 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={promo.logo_url} alt={promo.nume} className="w-full h-full object-contain p-1" loading="lazy" />
                              </span>
                              <span className="text-sm font-bold text-[#e3d1a6] group-hover:text-white transition-colors">Vezi codul →</span>
                            </div>
                          </Link>
                        )}
                        <Link href={`/blog/${post.slug}`}
                          className="bg-[#15120c] rounded-2xl border border-[#26211a] hover:border-[#c9a63e]/50 shadow-sm hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col group">
                          <div className="relative overflow-hidden h-44">
                            <Image src={post.cover} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, 33vw" />
                            <span className="absolute top-3 left-3 bg-[#b8912e] text-white text-xs font-bold px-2.5 py-1 rounded-full z-10">{post.category}</span>
                          </div>
                          <div className="p-5 flex-1 flex flex-col">
                            <div className="flex items-center gap-3 text-xs text-[#8c8064] mb-2">
                              <span>{formatDate(post.date)}</span><span>·</span><span>AmCupon.ro</span>
                            </div>
                            <h3 className="font-black text-white text-base leading-snug mb-2 group-hover:text-[#d8c091] transition-colors line-clamp-2">{post.title}</h3>
                            <p className="text-sm text-[#a89a78] line-clamp-3 flex-1">{post.excerpt}</p>
                            <div className="mt-4 text-sm font-bold text-[#d8c091] group-hover:text-[#e3d1a6] flex items-center gap-1">
                              Citeste articolul
                              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── BARA STATISTICI (numere reale) ── */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { n: magazine.length.toLocaleString("ro-RO"), l: "magazine partenere" },
              { n: nrPromo.toLocaleString("ro-RO"), l: "oferte active azi" },
              { n: nrCoduri.toLocaleString("ro-RO"), l: "coduri de reducere" },
              { n: toatePosts.length.toLocaleString("ro-RO"), l: "articole in revista" },
            ].map(s => (
              <div key={s.l} className="bg-[#15120c] border border-[#26211a] rounded-2xl py-6 text-center">
                <div className="text-2xl md:text-3xl font-black text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #e3d1a6, #b8912e)" }}>{s.n}</div>
                <div className="text-xs text-[#a89a78] mt-1">{s.l}</div>
              </div>
            ))}
          </div>

          {/* ── FOOTER PE CATEGORII (stil Kuplio) ── */}
          <div className="mt-14 pt-10 border-t border-[#26211a]">
            <h2 className="text-lg font-black text-white mb-6">Exploreaza pe categorii</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
              {MACRO_ORDINE.map(m => {
                const inCat = toatePosts.filter(p => getMacro(p.category) === m);
                if (inCat.length === 0) return null;
                return (
                  <div key={m}>
                    <Link href={`/blog?cat=${encodeURIComponent(m)}`} className="font-bold text-white hover:text-[#e3d1a6] transition-colors">
                      {m} <span className="text-[#8c8064] text-sm font-normal">({inCat.length})</span>
                    </Link>
                    <ul className="mt-2 space-y-1.5">
                      {inCat.slice(0, 3).map(p => (
                        <li key={p.slug}>
                          <Link href={`/blog/${p.slug}`} className="text-sm text-[#a89a78] hover:text-[#e3d1a6] transition-colors line-clamp-1">{p.title}</Link>
                        </li>
                      ))}
                    </ul>
                    <Link href={`/blog?cat=${encodeURIComponent(m)}`} className="inline-block mt-2 text-xs font-bold text-[#d8c091] hover:text-[#e3d1a6]">Afiseaza tot →</Link>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-[#26211a] text-center">
            <Link href="/" className="text-sm text-[#8c8064] hover:text-[#d8c091] transition-colors">← Inapoi la AmCupon.ro</Link>
          </div>
        </div>
      </div>
    </>
  );
}
