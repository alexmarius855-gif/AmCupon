import { Metadata } from "next";
import fs from "fs";
import path from "path";
import Image from "next/image";
import Link from "next/link";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ cat?: string }> }): Promise<Metadata> {
  const { cat } = await searchParams;
  const title = cat && cat !== "Toate"
    ? `Blog ${cat} — Sfaturi reduceri online | AmCupon.ro`
    : "Blog — Sfaturi si ghiduri reduceri online | AmCupon.ro";
  return {
    title,
    description: "Ghiduri, sfaturi și noutăți despre cum să economisești la cumpărăturile online din România. Coduri reducere, oferte și promoții explicate.",
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
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
  magazin: string | null;
  cover: string;
}

function loadPosts(): BlogPost[] {
  const filePath = path.join(process.cwd(), "public", "blog-posts.json");
  if (!fs.existsSync(filePath)) return [];
  return (JSON.parse(fs.readFileSync(filePath, "utf-8")) as BlogPost[])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" });
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  const categorieActiva = cat || "Toate";
  const toatePosts = loadPosts();

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
  const getMacro = (cat: string) => CATEG_MAP[cat] || "";
  const MACRO_ORDINE = ["Ghiduri","Electronice","Fashion","Casa & Gradina","Frumusete","Sport","Sanatate","Copii & Jucarii","Carti","Calatorie","Auto-Moto","Animale","Tehnologie"];
  const categorii = ["Toate", ...MACRO_ORDINE.filter(m => toatePosts.some(p => getMacro(p.category) === m))];
  const posts = categorieActiva === "Toate"
    ? toatePosts
    : toatePosts.filter(p => getMacro(p.category) === categorieActiva);

  // Mozaic "revista": primele 5 articole featured doar pe vederea "Toate"
  const featured = categorieActiva === "Toate" && posts.length >= 5 ? posts.slice(0, 5) : [];
  const restul   = featured.length ? posts.slice(5) : posts;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog AmCupon.ro",
    url: "https://amcupon.ro/blog",
    description: "Ghiduri și sfaturi despre cum să economisești la cumpărăturile online din România.",
    inLanguage: "ro-RO",
    publisher: {
      "@type": "Organization",
      name: "AmCupon.ro",
      url: "https://amcupon.ro",
    },
    blogPost: toatePosts.slice(0, 10).map(p => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `https://amcupon.ro/blog/${p.slug}`,
      datePublished: p.date,
      description: p.excerpt,
      image: p.cover,
      author: { "@type": "Organization", name: "AmCupon.ro" },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-slate-950">
        <header className="bg-slate-950 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 shrink-0">
              <div className="bg-indigo-600 text-white font-black text-base px-2 py-1 rounded-lg">Am</div>
              <span className="font-black text-white text-xl">Cupon</span>
              <span className="text-indigo-400 font-black text-xl">.ro</span>
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-sm font-semibold text-slate-300">Blog</span>
          </div>
        </header>

        <div className="relative bg-slate-950 border-b border-slate-800 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(79,70,229,0.15) 0%, transparent 65%)" }} />
          <div className="relative max-w-7xl mx-auto text-center py-12 px-4">
            <h1 className="text-3xl md:text-4xl font-black mb-2 text-white">
              Revista <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #818cf8, #22d3ee)" }}>AmCupon</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Ghiduri, comparații și sfaturi ca să cumperi inteligent și să economisești la fiecare comandă
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10">
          {/* ── Mozaic featured (stil revista) — doar pe vederea Toate ── */}
          {featured.length === 5 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-12">
              {/* Articol principal — mare */}
              <Link href={`/blog/${featured[0].slug}`} className="group relative rounded-2xl overflow-hidden border border-slate-800 hover:border-indigo-500/50 transition-colors min-h-[300px] lg:min-h-[440px] flex">
                <Image src={featured[0].cover} alt={featured[0].title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 1024px) 100vw, 50vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="relative mt-auto p-6 z-10">
                  <span className="inline-block bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-full mb-3">{featured[0].category}</span>
                  <h2 className="font-black text-white text-xl md:text-2xl leading-tight group-hover:text-indigo-300 transition-colors line-clamp-3">{featured[0].title}</h2>
                  <p className="text-slate-300 text-sm mt-2 line-clamp-2">{featured[0].excerpt}</p>
                </div>
              </Link>
              {/* 4 articole secundare — grila 2x2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {featured.slice(1).map(post => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="group relative rounded-2xl overflow-hidden border border-slate-800 hover:border-indigo-500/50 transition-colors min-h-[200px] flex">
                    <Image src={post.cover} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, 25vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                    <div className="relative mt-auto p-4 z-10">
                      <span className="inline-block bg-indigo-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5">{post.category}</span>
                      <h3 className="font-bold text-white text-sm leading-snug group-hover:text-indigo-300 transition-colors line-clamp-2">{post.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── Titlu sectiune + filtre ── */}
          <h2 className="text-xl md:text-2xl font-black text-white text-center mb-6">Cele mai noi sfaturi și articole</h2>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categorii.map(cat => (
              <Link
                key={cat}
                href={cat === "Toate" ? "/blog" : `/blog?cat=${encodeURIComponent(cat)}`}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  categorieActiva === cat
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-900 border border-slate-700 text-slate-400 hover:border-indigo-500 hover:text-indigo-300"
                }`}
              >
                {cat}
                {cat !== "Toate" && (
                  <span className="ml-1.5 text-[10px] opacity-70">
                    ({toatePosts.filter(p => getMacro(p.category) === cat).length})
                  </span>
                )}
              </Link>
            ))}
          </div>

          {restul.length === 0 && featured.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <p className="text-lg mb-4">Niciun articol in categoria &ldquo;{categorieActiva}&rdquo;.</p>
              <Link href="/blog" className="text-indigo-400 font-bold hover:underline">
                Vezi toate articolele →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restul.map(post => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="bg-slate-900 rounded-2xl border border-slate-800 hover:border-indigo-500/50 shadow-sm hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col group"
                >
                  <div className="relative overflow-hidden h-48">
                    <Image
                      src={post.cover}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <span className="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-full z-10">
                      {post.category}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                      <span>{formatDate(post.date)}</span>
                      <span>·</span>
                      <span>AmCupon.ro</span>
                    </div>
                    <h2 className="font-black text-white text-base leading-snug mb-3 group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-sm text-slate-400 line-clamp-3 flex-1">{post.excerpt}</p>
                    <div className="mt-4 text-sm font-bold text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1">
                      Citeste articolul
                      <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-10 pt-6 border-t border-slate-800 text-center">
            <Link href="/" className="text-sm text-slate-500 hover:text-indigo-400 transition-colors">
              ← Inapoi la AmCupon.ro
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
