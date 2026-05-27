import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import fs from "fs";
import path from "path";

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
  magazin: string | null;
  cover: string;
  content: string;
}

function loadPosts(): BlogPost[] {
  const filePath = path.join(process.cwd(), "public", "blog-posts.json");
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function numeAfisat(magazin: string): string {
  return magazin.split(".")[0].replace(/-/g, " ")
    .split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ro-RO", {
    day: "numeric", month: "long", year: "numeric",
  });
}

/** Parseza bold + linkuri markdown inline: **bold** si [text](url) */
function parseInline(text: string, baseKey: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /\*\*(.*?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let match;
  let i = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    if (match[1] !== undefined) {
      nodes.push(<strong key={`${baseKey}-b${i}`}>{match[1]}</strong>);
    } else if (match[2] && match[3]) {
      const isExt = match[3].startsWith("http");
      nodes.push(
        <a key={`${baseKey}-l${i}`} href={match[3]}
          className="text-orange-500 hover:text-orange-600 underline underline-offset-2 font-medium"
          {...(isExt ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {match[2]}
        </a>
      );
    }
    last = match.index + match[0].length;
    i++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function renderContent(content: string) {
  return content.split("\n\n").map((block, i) => {
    const key = `b${i}`;
    if (block.startsWith("## ")) {
      return <h2 key={key} className="text-xl font-black text-gray-900 mt-8 mb-3">{parseInline(block.slice(3), key)}</h2>;
    }
    if (block.startsWith("### ")) {
      return <h3 key={key} className="text-lg font-bold text-gray-900 mt-6 mb-2">{parseInline(block.slice(4), key)}</h3>;
    }
    if (block.startsWith("- ") || block.includes("\n- ")) {
      const items = block.split("\n").filter((l) => l.startsWith("- ")).map((l) => l.slice(2));
      return (
        <ul key={key} className="list-disc list-inside space-y-1.5 my-4 text-gray-700">
          {items.map((item, j) => (
            <li key={j}>{parseInline(item, `${key}-li${j}`)}</li>
          ))}
        </ul>
      );
    }
    return <p key={key} className="text-gray-700 leading-relaxed my-3">{parseInline(block, key)}</p>;
  });
}

export async function generateStaticParams() {
  const posts = loadPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const posts = loadPosts();
  const post = posts.find((p) => p.slug === slug);
  if (!post) return { title: "Articol negăsit | AmCupon.ro" };

  const pageUrl = `https://amcupon.ro/blog/${slug}`;
  return {
    title: `${post.title} | AmCupon.ro`,
    description: post.excerpt,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: pageUrl,
      siteName: "AmCupon.ro",
      locale: "ro_RO",
      type: "article",
      publishedTime: post.date,
      authors: ["AmCupon.ro"],
      images: [{ url: post.cover, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.cover],
    },
  };
}

export default async function ArticolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const posts = loadPosts();
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  const altePosts = posts.filter((p) => p.slug !== slug).slice(0, 3);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "AmCupon.ro", item: "https://amcupon.ro" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://amcupon.ro/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: `https://amcupon.ro/blog/${slug}` },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `https://amcupon.ro/blog/${slug}#article`,
    headline: post.title,
    description: post.excerpt,
    url: `https://amcupon.ro/blog/${slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://amcupon.ro/blog/${slug}`,
    },
    image: {
      "@type": "ImageObject",
      url: post.cover,
      width: 1200,
      height: 630,
    },
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "ro-RO",
    author: {
      "@type": "Organization",
      name: "Echipa AmCupon.ro",
      url: "https://amcupon.ro/despre-noi",
    },
    publisher: {
      "@type": "Organization",
      name: "AmCupon.ro",
      url: "https://amcupon.ro",
      logo: {
        "@type": "ImageObject",
        url: "https://amcupon.ro/logo-profile.svg",
        width: 512,
        height: 512,
      },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
            <a href="/" className="flex items-center gap-1.5 shrink-0">
              <div className="bg-orange-500 text-white font-black text-base px-2 py-1 rounded-lg">Am</div>
              <span className="font-black text-gray-900 text-xl">Cupon</span>
              <span className="text-orange-500 font-black text-xl">.ro</span>
            </a>
            <span className="text-gray-300">/</span>
            <a href="/blog" className="text-sm text-gray-500 hover:text-orange-500 transition-colors font-medium">Blog</a>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-700 font-semibold truncate max-w-48">{post.title}</span>
          </div>
        </header>

        <article className="max-w-3xl mx-auto px-4 py-10">
          <div className="mb-6">
            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">{post.category}</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-4">{post.title}</h1>

          <div className="flex items-center gap-4 text-sm text-gray-400 mb-8 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-2 shrink-0">
              <Image
                src="/logo-profile.svg"
                alt="AmCupon.ro"
                width={28}
                height={28}
                className="rounded-full ring-2 ring-orange-100"
              />
              <span className="font-semibold text-gray-700">AmCupon.ro</span>
            </div>
            <span>·</span>
            <span>{formatDate(post.date)}</span>
            {post.magazin && (
              <>
                <span>·</span>
                <a href={`/cod-reducere/${post.magazin}`} className="text-orange-500 font-semibold hover:underline">
                  {numeAfisat(post.magazin)}
                </a>
              </>
            )}
          </div>

          <div className="relative rounded-2xl overflow-hidden mb-8 shadow-sm h-64 md:h-80">
            <Image src={post.cover} alt={post.title} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 768px" />
          </div>

          <p className="text-lg text-gray-600 font-medium leading-relaxed mb-8 p-5 bg-orange-50 rounded-2xl border border-orange-100">
            {post.excerpt}
          </p>

          <div className="text-base">
            {renderContent(post.content)}
          </div>

          {post.magazin && (
            <div className="mt-10 p-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl text-white text-center">
              <p className="font-black text-xl mb-2">Vezi toate promoțiile {numeAfisat(post.magazin)}</p>
              <p className="text-orange-100 text-sm mb-4">Coduri verificate, actualizate zilnic</p>
              <a href={`/cod-reducere/${post.magazin}`}
                className="inline-block bg-white text-orange-600 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-orange-50 transition-colors">
                Deschide pagina →
              </a>
            </div>
          )}
        </article>

        {altePosts.length > 0 && (
          <div className="max-w-3xl mx-auto px-4 pb-12">
            <h2 className="text-xl font-black text-gray-900 mb-5">Articole recomandate</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {altePosts.map((p) => (
                <a key={p.slug} href={`/blog/${p.slug}`}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-all group">
                  <div className="relative h-32 overflow-hidden">
                    <Image src={p.cover} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="300px" />
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-bold text-orange-500">{p.category}</span>
                    <p className="text-sm font-bold text-gray-900 mt-1 line-clamp-2 group-hover:text-orange-500 transition-colors">{p.title}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto px-4 pb-10 text-center">
          <a href="/blog" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">← Înapoi la Blog</a>
        </div>
      </div>
    </>
  );
}
