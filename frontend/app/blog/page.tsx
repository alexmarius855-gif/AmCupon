import { Metadata } from "next";
import fs from "fs";
import path from "path";
import Image from "next/image";
import Link from "next/link";
import { MACRO_ORDINE, MACRO_EMOJI, getMacro } from "./categories";

/* ═══════════════════════════════════════════════════════════════════════════
   REVISTA AmCupon — hub topical optimizat SEO (schema de indexare)
   - Vederea "Toate" = hub rapid: featured + clustere pe categorii cu linkuri-text
     descriptive (backbone de internal linking, LCP mic, crawl adanc)
   - Vederea "?cat=X" = grila paginata de articole (24/pagina) pentru seturi mari
   - JSON-LD: Blog + ItemList (categorii) + BreadcrumbList + BlogPosting featured
   ═══════════════════════════════════════════════════════════════════════════ */

const SITE = "https://amcupon.ro";
const PAGE_SIZE = 24;

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

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<{ cat?: string; page?: string }> }
): Promise<Metadata> {
  const { cat, page } = await searchParams;
  const pageNr = Math.max(1, parseInt(page || "1") || 1);
  const catValid = cat && MACRO_ORDINE.includes(cat) ? cat : null;

  const title = catValid
    ? `Ghiduri ${catValid} — Sfaturi si Comparatii Reduceri${pageNr > 1 ? ` (pag. ${pageNr})` : ""} | AmCupon.ro`
    : "Revista AmCupon — Ghiduri, Comparatii si Sfaturi de Cumparaturi Online";
  const description = catValid
    ? `Ghiduri si comparatii ${catValid.toLowerCase()}: cum alegi, cand cumperi si cum economisesti cu coduri de reducere verificate. Sfaturi practice pe AmCupon.ro.`
    : "Ghiduri, comparatii si sfaturi despre cum sa economisesti la cumparaturile online din Romania. Coduri de reducere, oferte si promotii explicate simplu.";

  // Canonical: pagina 1 fara ?page; categoriile isi au canonicalul lor
  const canonical = catValid
    ? `${SITE}/blog?cat=${encodeURIComponent(catValid)}${pageNr > 1 ? `&page=${pageNr}` : ""}`
    : `${SITE}/blog`;

  return {
    title,
    description,
    keywords: ["ghiduri cumparaturi online", "sfaturi reduceri", "comparatii preturi romania", "coduri reducere explicate", "blog economii"],
    alternates: { canonical },
    openGraph: {
      title, description,
      url: canonical,
      siteName: "AmCupon.ro",
      locale: "ro_RO",
      type: "website",
      images: [{ url: `${SITE}/og-image.png`, width: 1200, height: 630 }],
    },
  };
}

export default async function BlogPage(
  { searchParams }: { searchParams: Promise<{ cat?: string; page?: string }> }
) {
  const { cat, page } = await searchParams;
  const categorieActiva = cat && MACRO_ORDINE.includes(cat) ? cat : "Toate";
  const esteHub = categorieActiva === "Toate";
  const pageNr = Math.max(1, parseInt(page || "1") || 1);

  const toatePosts = loadPosts();
  const recomandate = readJSON<Recomandat[]>("recomandate.json", []).slice(0, 6);
  const magazine = readJSON<Magazin[]>("output.json", []);
  const nrCoduri = magazine.filter(m => (m.promotii || []).some(p => p.cod_cupon)).length;
  const nrPromo = magazine.filter(m => m.are_promotie).length;

  // Grupare pe macro-categorii (o singura trecere)
  const perMacro: Record<string, BlogPost[]> = {};
  for (const p of toatePosts) {
    const m = getMacro(p.category);
    if (!m) continue;
    (perMacro[m] ||= []).push(p);
  }
  const categoriiCuPosts = MACRO_ORDINE.filter(m => (perMacro[m]?.length || 0) > 0);

  // Vedere categorie: paginata
  const postsCat = esteHub ? [] : (perMacro[categorieActiva] || []);
  const totalPagini = Math.max(1, Math.ceil(postsCat.length / PAGE_SIZE));
  const pageClamped = Math.min(pageNr, totalPagini);
  const postsPagina = postsCat.slice((pageClamped - 1) * PAGE_SIZE, pageClamped * PAGE_SIZE);

  // Featured pe hub (primele 5 recente)
  const featured = esteHub && toatePosts.length >= 5 ? toatePosts.slice(0, 5) : [];

  /* ── JSON-LD ─────────────────────────────────────────────────────────── */
  const breadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Acasa", item: SITE },
      { "@type": "ListItem", position: 2, name: "Revista", item: `${SITE}/blog` },
      ...(esteHub ? [] : [{ "@type": "ListItem", position: 3, name: categorieActiva, item: `${SITE}/blog?cat=${encodeURIComponent(categorieActiva)}` }]),
    ],
  };

  const jsonLd = esteHub
    ? {
        "@context": "https://schema.org", "@type": "Blog",
        name: "Revista AmCupon.ro", url: `${SITE}/blog`, inLanguage: "ro-RO",
        description: "Ghiduri, comparatii si sfaturi despre cum sa economisesti la cumparaturile online din Romania.",
        publisher: { "@type": "Organization", name: "AmCupon.ro", url: SITE, logo: { "@type": "ImageObject", url: `${SITE}/icon-512.png` } },
        blogPost: toatePosts.slice(0, 10).map(p => ({
          "@type": "BlogPosting", headline: p.title, url: `${SITE}/blog/${p.slug}`,
          datePublished: p.date, description: p.excerpt, image: p.cover,
          author: { "@type": "Organization", name: "AmCupon.ro" },
        })),
      }
    : {
        "@context": "https://schema.org", "@type": "CollectionPage",
        name: `Ghiduri ${categorieActiva}`, url: `${SITE}/blog?cat=${encodeURIComponent(categorieActiva)}`, inLanguage: "ro-RO",
        mainEntity: {
          "@type": "ItemList", numberOfItems: postsCat.length,
          itemListElement: postsPagina.map((p, i) => ({
            "@type": "ListItem", position: (pageClamped - 1) * PAGE_SIZE + i + 1,
            url: `${SITE}/blog/${p.slug}`, name: p.title,
          })),
        },
      };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-[#06080b]">
        {/* Header / breadcrumb vizibil */}
        <header className="bg-[#06080b] border-b border-[#1f2329]">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm">
            <Link href="/" className="flex items-center gap-1.5 shrink-0">
              <span className="bg-[#ddf93c] text-[#0c1000] font-black text-base px-2 py-1 rounded-lg">Am</span>
              <span className="font-black text-[#ffffff] text-xl">Cupon</span>
              <span className="text-[#ddf93c] font-black text-xl">.ro</span>
            </Link>
            <span className="text-[#9399a0]">/</span>
            <Link href="/blog" className="font-semibold text-[#c9ced5] hover:text-[#c3dd2c]">Revista</Link>
            {!esteHub && (<><span className="text-[#9399a0]">/</span><span className="font-semibold text-[#ddf93c]">{categorieActiva}</span></>)}
          </div>
        </header>

        {/* Hero */}
        <div className="relative bg-[#06080b] border-b border-[#1f2329] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(13,148,136,0.15) 0%, transparent 65%)" }} />
          <div className="relative max-w-7xl mx-auto text-center py-10 px-4">
            {esteHub ? (
              <>
                <h1 className="text-3xl md:text-4xl font-black mb-3 text-[#ffffff]">
                  Revista <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #c3dd2c, #ddf93c)" }}>AmCupon</span>
                </h1>
                <p className="text-[#c9ced5] text-sm md:text-base max-w-2xl mx-auto">
                  Ghiduri, comparatii si sfaturi ca sa cumperi inteligent si sa economisesti la fiecare comanda. {toatePosts.length} articole, organizate pe categorii.
                </p>
              </>
            ) : (
              <>
                <div className="text-4xl mb-2">{MACRO_EMOJI[categorieActiva]}</div>
                <h1 className="text-3xl md:text-4xl font-black mb-3 text-[#ffffff]">
                  Ghiduri <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #c3dd2c, #ddf93c)" }}>{categorieActiva}</span>
                </h1>
                <p className="text-[#c9ced5] text-sm md:text-base max-w-2xl mx-auto">
                  {postsCat.length} articole cu sfaturi, comparatii si coduri de reducere pentru {categorieActiva.toLowerCase()}.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10">
          {/* Filtre categorii (interne, crawlable) */}
          <nav aria-label="Categorii revista" className="flex flex-wrap justify-center gap-2 mb-10">
            <Link href="/blog"
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${esteHub ? "bg-[#ddf93c] text-[#0c1000]" : "bg-[#14181c] border border-[#2a2f36] text-[#c9ced5] hover:border-[#ddf93c] hover:text-[#c3dd2c]"}`}>
              Toate
            </Link>
            {categoriiCuPosts.map(c => (
              <Link key={c} href={`/blog?cat=${encodeURIComponent(c)}`}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${categorieActiva === c ? "bg-[#ddf93c] text-[#0c1000]" : "bg-[#14181c] border border-[#2a2f36] text-[#c9ced5] hover:border-[#ddf93c] hover:text-[#c3dd2c]"}`}>
                {MACRO_EMOJI[c]} {c}
                <span className="ml-1.5 text-[10px] opacity-70">({perMacro[c].length})</span>
              </Link>
            ))}
          </nav>

          {/* ═══════════ VEDERE HUB (Toate) ═══════════ */}
          {esteHub && (
            <>
              {/* Featured mozaic */}
              {featured.length === 5 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-14">
                  <Link href={`/blog/${featured[0].slug}`} className="group relative rounded-xl overflow-hidden border border-[#1f2329] hover:border-[#ddf93c]/50 transition-colors min-h-[300px] lg:min-h-[440px] flex">
                    <Image src={featured[0].cover} alt={featured[0].title} fill priority className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 1024px) 100vw, 50vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#F7F9FC] via-[#F7F9FC]/40 to-transparent" />
                    <div className="relative mt-auto p-6 z-10">
                      <span className="inline-block bg-[#ddf93c] text-[#0c1000] text-xs font-bold px-2.5 py-1 rounded-full mb-3">{featured[0].category}</span>
                      <h2 className="font-black text-[#ffffff] text-xl md:text-2xl leading-tight group-hover:text-[#c3dd2c] transition-colors line-clamp-3">{featured[0].title}</h2>
                      <p className="text-[#c9ced5] text-sm mt-2 line-clamp-2">{featured[0].excerpt}</p>
                    </div>
                  </Link>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {featured.slice(1).map(post => (
                      <Link key={post.slug} href={`/blog/${post.slug}`} className="group relative rounded-xl overflow-hidden border border-[#1f2329] hover:border-[#ddf93c]/50 transition-colors min-h-[200px] flex">
                        <Image src={post.cover} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, 25vw" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#F7F9FC] via-[#F7F9FC]/30 to-transparent" />
                        <div className="relative mt-auto p-4 z-10">
                          <span className="inline-block bg-[#ddf93c]/90 text-[#0c1000] text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5">{post.category}</span>
                          <h3 className="font-bold text-[#ffffff] text-sm leading-snug group-hover:text-[#c3dd2c] transition-colors line-clamp-2">{post.title}</h3>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid lg:grid-cols-[minmax(0,1fr)_300px] gap-8">
                {/* Clustere pe categorii = schema de indexare */}
                <div className="order-2 lg:order-1">
                  <h2 className="text-xl md:text-2xl font-black text-[#ffffff] mb-1">Toate ghidurile, pe categorii</h2>
                  <p className="text-sm text-[#9399a0] mb-8">Alege o categorie ca sa vezi toate articolele, sau intra direct in ghidul care te intereseaza.</p>

                  <div className="grid sm:grid-cols-2 gap-x-8 gap-y-10">
                    {categoriiCuPosts.map(m => {
                      const arts = perMacro[m];
                      return (
                        <section key={m} aria-label={`Ghiduri ${m}`}>
                          <div className="flex items-center justify-between border-b border-[#1f2329] pb-2 mb-3">
                            <h3 className="font-black text-[#ffffff] text-lg flex items-center gap-2">
                              <span>{MACRO_EMOJI[m]}</span>
                              <Link href={`/blog?cat=${encodeURIComponent(m)}`} className="hover:text-[#c3dd2c] transition-colors">{m}</Link>
                              <span className="text-[#9399a0] text-sm font-normal">({arts.length})</span>
                            </h3>
                          </div>
                          <ul className="space-y-2.5">
                            {arts.slice(0, 6).map(p => (
                              <li key={p.slug} className="flex gap-2 text-sm">
                                <span aria-hidden className="text-[#ddf93c] shrink-0 mt-0.5">›</span>
                                <Link href={`/blog/${p.slug}`} className="text-[#c9ced5] hover:text-[#c3dd2c] transition-colors leading-snug line-clamp-2">{p.title}</Link>
                              </li>
                            ))}
                          </ul>
                          {arts.length > 6 && (
                            <Link href={`/blog?cat=${encodeURIComponent(m)}`} className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-[#ddf93c] hover:text-[#c3dd2c] transition-colors">
                              Vezi toate cele {arts.length} ghiduri {m} <span aria-hidden>→</span>
                            </Link>
                          )}
                        </section>
                      );
                    })}
                  </div>
                </div>

                {/* Sidebar */}
                <aside className="order-1 lg:order-2 space-y-5">
                  <div className="bg-[#14181c] border border-[#1f2329] rounded-xl p-5">
                    <h2 className="font-black text-[#ffffff] text-base mb-2">Cumpara inteligent</h2>
                    <p className="text-sm text-[#c9ced5] leading-relaxed mb-4">
                      Ghiduri verificate ca sa gasesti pretul bun si sa nu ratezi reducerile reale din magazinele tale preferate.
                    </p>
                    <Link href="/top-reduceri" className="inline-flex items-center gap-1 text-sm font-bold text-[#ddf93c] hover:text-[#c3dd2c]">
                      Vezi codurile active <span aria-hidden>→</span>
                    </Link>
                  </div>

                  {recomandate.length > 0 && (
                    <div className="bg-[#14181c] border border-[#1f2329] rounded-xl p-5">
                      <h2 className="font-black text-[#ffffff] text-base mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-4 rounded-full bg-[#ddf93c]" /> Magazine recomandate
                      </h2>
                      <ul className="space-y-3">
                        {recomandate.map(r => (
                          <li key={r.magazin}>
                            <Link href={`/cod-reducere/${r.magazin}`} className="flex items-center gap-3 group">
                              <span className="w-11 h-11 shrink-0 rounded-xl bg-[#14181c] overflow-hidden flex items-center justify-center border border-[#2a2f36]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={r.logo_url} alt={r.nume} className="w-full h-full object-contain p-1" loading="lazy" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm font-bold text-[#ffffff] truncate group-hover:text-[#c3dd2c] transition-colors">{r.nume}</span>
                                <span className="block text-[11px] text-[#9399a0] truncate">{r.categorie}</span>
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 bg-[#ddf93c]/15 text-[#c3dd2c] border border-[#ddf93c]/25">
                                {r.are_cod ? "Cod" : "Oferta"}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="relative rounded-xl overflow-hidden border border-[#ddf93c]/30 p-5" style={{ background: "linear-gradient(135deg, rgba(13,148,136,0.25), rgba(20,184,166,0.10))" }}>
                    <h2 className="font-black text-[#ffffff] text-base mb-1">Coduri noi pe email</h2>
                    <p className="text-sm text-[#c9ced5] mb-4">Cele mai bune reduceri ale zilei. Gratuit, fara spam.</p>
                    <Link href="/newsletter" className="block text-center bg-gradient-to-r from-[#ddf93c] to-[#ddf93c] hover:from-[#ddf93c] hover:to-[#ddf93c] text-[#0c1000] font-bold text-sm py-2.5 rounded-xl transition-all">
                      Ma abonez gratuit
                    </Link>
                  </div>
                </aside>
              </div>
            </>
          )}

          {/* ═══════════ VEDERE CATEGORIE (paginata) ═══════════ */}
          {!esteHub && (
            <>
              {postsPagina.length === 0 ? (
                <div className="text-center py-20 text-[#9399a0]">
                  <p className="text-lg mb-4">Niciun articol in categoria &ldquo;{categorieActiva}&rdquo;.</p>
                  <Link href="/blog" className="text-[#ddf93c] font-bold hover:underline">Vezi toate articolele →</Link>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {postsPagina.map((post, i) => (
                      <Link key={post.slug} href={`/blog/${post.slug}`}
                        className="bg-[#14181c] rounded-xl border border-[#1f2329] hover:border-[#ddf93c]/50 shadow-sm hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col group">
                        <div className="relative overflow-hidden h-44">
                          <Image src={post.cover} alt={post.title} fill loading={i < 3 ? "eager" : "lazy"} className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, 33vw" />
                          <span className="absolute top-3 left-3 bg-[#ddf93c] text-[#0c1000] text-xs font-bold px-2.5 py-1 rounded-full z-10">{post.category}</span>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                          <div className="flex items-center gap-3 text-xs text-[#9399a0] mb-2">
                            <span>{formatDate(post.date)}</span><span>·</span><span>AmCupon.ro</span>
                          </div>
                          <h2 className="font-black text-[#ffffff] text-base leading-snug mb-2 group-hover:text-[#ddf93c] transition-colors line-clamp-2">{post.title}</h2>
                          <p className="text-sm text-[#c9ced5] line-clamp-3 flex-1">{post.excerpt}</p>
                          <span className="mt-4 text-sm font-bold text-[#ddf93c] group-hover:text-[#c3dd2c] flex items-center gap-1">
                            Citeste articolul
                            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Paginare crawlable */}
                  {totalPagini > 1 && (
                    <nav aria-label="Paginare" className="flex items-center justify-center gap-2 mt-12">
                      {pageClamped > 1 && (
                        <Link href={`/blog?cat=${encodeURIComponent(categorieActiva)}${pageClamped - 1 > 1 ? `&page=${pageClamped - 1}` : ""}`}
                          className="px-4 py-2 rounded-xl text-sm font-bold bg-[#14181c] border border-[#2a2f36] text-[#c9ced5] hover:border-[#ddf93c] hover:text-[#c3dd2c] transition-colors" rel="prev">← Anterior</Link>
                      )}
                      {Array.from({ length: totalPagini }, (_, i) => i + 1).map(n => (
                        <Link key={n} href={`/blog?cat=${encodeURIComponent(categorieActiva)}${n > 1 ? `&page=${n}` : ""}`}
                          aria-current={n === pageClamped ? "page" : undefined}
                          className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-colors ${n === pageClamped ? "bg-[#ddf93c] text-[#0c1000]" : "bg-[#14181c] border border-[#2a2f36] text-[#c9ced5] hover:border-[#ddf93c] hover:text-[#c3dd2c]"}`}>{n}</Link>
                      ))}
                      {pageClamped < totalPagini && (
                        <Link href={`/blog?cat=${encodeURIComponent(categorieActiva)}&page=${pageClamped + 1}`}
                          className="px-4 py-2 rounded-xl text-sm font-bold bg-[#14181c] border border-[#2a2f36] text-[#c9ced5] hover:border-[#ddf93c] hover:text-[#c3dd2c] transition-colors" rel="next">Urmator →</Link>
                      )}
                    </nav>
                  )}
                </>
              )}
            </>
          )}

          {/* ── Bara statistici (numere reale) ── */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { n: magazine.length.toLocaleString("ro-RO"), l: "magazine partenere" },
              { n: nrPromo.toLocaleString("ro-RO"), l: "oferte active azi" },
              { n: nrCoduri.toLocaleString("ro-RO"), l: "coduri de reducere" },
              { n: toatePosts.length.toLocaleString("ro-RO"), l: "articole in revista" },
            ].map(s => (
              <div key={s.l} className="bg-[#14181c] border border-[#1f2329] rounded-xl py-6 text-center">
                <div className="text-2xl md:text-3xl font-black text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #c3dd2c, #ddf93c)" }}>{s.n}</div>
                <div className="text-xs text-[#c9ced5] mt-1">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-6 border-t border-[#1f2329] text-center">
            <Link href="/" className="text-sm text-[#9399a0] hover:text-[#ddf93c] transition-colors">← Inapoi la AmCupon.ro</Link>
          </div>
        </div>
      </div>
    </>
  );
}
