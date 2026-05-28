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

  const categorii = ["Toate", ...Array.from(new Set(toatePosts.map(p => p.category).filter(Boolean)))];
  const posts = categorieActiva === "Toate"
    ? toatePosts
    : toatePosts.filter(p => p.category === categorieActiva);

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
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
            <a href="/" className="flex items-center gap-1.5 shrink-0">
              <div className="bg-orange-500 text-white font-black text-base px-2 py-1 rounded-lg">Am</div>
              <span className="font-black text-gray-900 text-xl">Cupon</span>
              <span className="text-orange-500 font-black text-xl">.ro</span>
            </a>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-semibold text-gray-700">Blog</span>
          </div>
        </header>

        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-10 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-2xl md:text-3xl font-black mb-2">Blog AmCupon.ro</h1>
            <p className="text-orange-100 text-sm max-w-xl mx-auto">
              Sfaturi, ghiduri și noutăți despre cum să economisești inteligent la cumpărăturile online
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10">
          {/* Filtre functionale via URL params */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categorii.map(cat => (
              <Link
                key={cat}
                href={cat === "Toate" ? "/blog" : `/blog?cat=${encodeURIComponent(cat)}`}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  categorieActiva === cat
                    ? "bg-orange-500 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500"
                }`}
              >
                {cat}
                {cat !== "Toate" && (
                  <span className="ml-1.5 text-[10px] opacity-70">
                    ({toatePosts.filter(p => p.category === cat).length})
                  </span>
                )}
              </Link>
            ))}
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg mb-4">Niciun articol in categoria &ldquo;{categorieActiva}&rdquo;.</p>
              <Link href="/blog" className="text-orange-500 font-bold hover:underline">
                Vezi toate articolele →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map(post => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col group"
                >
                  <div className="relative overflow-hidden h-48">
                    <Image
                      src={post.cover}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full z-10">
                      {post.category}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                      <span>{formatDate(post.date)}</span>
                      <span>·</span>
                      <span>AmCupon.ro</span>
                    </div>
                    <h2 className="font-black text-gray-900 text-base leading-snug mb-3 group-hover:text-orange-500 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-sm text-gray-500 line-clamp-3 flex-1">{post.excerpt}</p>
                    <div className="mt-4 text-sm font-bold text-orange-500 group-hover:text-orange-600 flex items-center gap-1">
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

          <div className="mt-10 pt-6 border-t border-gray-100 text-center">
            <a href="/" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
              ← Inapoi la AmCupon.ro
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
