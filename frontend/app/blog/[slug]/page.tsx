import Link from "next/link";
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
      return <h2 key={key} className="text-xl font-black text-white mt-8 mb-3">{parseInline(block.slice(3), key)}</h2>;
    }
    if (block.startsWith("### ")) {
      return <h3 key={key} className="text-lg font-bold text-white mt-6 mb-2">{parseInline(block.slice(4), key)}</h3>;
    }
    if (block.startsWith("- ") || block.includes("\n- ")) {
      const items = block.split("\n").filter((l) => l.startsWith("- ")).map((l) => l.slice(2));
      return (
        <ul key={key} className="list-disc list-inside space-y-1.5 my-4 text-slate-300">
          {items.map((item, j) => (
            <li key={j}>{parseInline(item, `${key}-li${j}`)}</li>
          ))}
        </ul>
      );
    }
    return <p key={key} className="text-slate-300 leading-relaxed my-3">{parseInline(block, key)}</p>;
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

  // Articole din aceeasi categorie sau cu acelasi magazin (prioritate relevanta)
  const altePosts = [
    ...posts.filter((p) => p.slug !== slug && p.category === post.category && (post.magazin ? p.magazin !== post.magazin : true)),
    ...posts.filter((p) => p.slug !== slug && p.category !== post.category),
  ].slice(0, 3);

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

      <div className="min-h-screen bg-slate-950">
        <header className="bg-slate-900 border-b border-slate-800 shadow-black/30 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 shrink-0">
              <div className="bg-orange-500 text-white font-black text-base px-2 py-1 rounded-lg">Am</div>
              <span className="font-black text-white text-xl">Cupon</span>
              <span className="text-orange-500 font-black text-xl">.ro</span>
            </Link>
            <span className="text-slate-600">/</span>
            <Link href="/blog" className="text-sm text-slate-400 hover:text-orange-500 transition-colors font-medium">Blog</Link>
            <span className="text-slate-600">/</span>
            <span className="text-sm text-slate-300 font-semibold truncate max-w-48">{post.title}</span>
          </div>
        </header>

        <article className="max-w-3xl mx-auto px-4 py-10">
          <div className="mb-6">
            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">{post.category}</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white leading-tight mb-4">{post.title}</h1>

          <div className="flex items-center gap-4 text-sm text-slate-500 mb-8 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-2 shrink-0">
              <Image
                src="/logo-profile.svg"
                alt="AmCupon.ro"
                width={28}
                height={28}
                className="rounded-full ring-2 ring-orange-500/20"
              />
              <span className="font-semibold text-slate-300">AmCupon.ro</span>
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

          <p className="text-lg text-slate-400 font-medium leading-relaxed mb-8 p-5 bg-orange-50 rounded-2xl border border-orange-100">
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

          {/* Newsletter CTA */}
          <div className="mt-10 p-6 bg-slate-950 rounded-2xl text-center">
            <p className="text-sm font-black text-orange-400 uppercase tracking-widest mb-2">Newsletter gratuit</p>
            <h3 className="text-xl font-black text-white mb-2">Primeste coduri noi direct pe email</h3>
            <p className="text-slate-400 text-sm mb-5">600+ magazine monitorizate zilnic. Zero spam.</p>
            <Link href="/newsletter"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors">
              Aboneaza-te gratuit &rarr;
            </Link>
          </div>

          {/* Share buttons */}
          <div className="mt-10 pt-6 border-t border-slate-800">
            <p className="text-sm font-bold text-slate-400 mb-3 text-center">Distribuie articolul</p>
            <div className="flex justify-center gap-3">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://amcupon.ro/blog/${slug}`)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#1877F2] hover:bg-[#166FE5] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
                Facebook
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${post.title} ${`https://amcupon.ro/blog/${slug}`}`)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20BD5C] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(`https://amcupon.ro/blog/${slug}`)}&text=${encodeURIComponent(post.title)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#229ED9] hover:bg-[#1A8BBF] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                Telegram
              </a>
            </div>
          </div>
        </article>

        {altePosts.length > 0 && (
          <div className="max-w-3xl mx-auto px-4 pb-12">
            <h2 className="text-xl font-black text-white mb-5">Articole recomandate</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {altePosts.map((p) => (
                <a key={p.slug} href={`/blog/${p.slug}`}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-all group">
                  <div className="relative h-32 overflow-hidden">
                    <Image src={p.cover} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="300px" />
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-bold text-orange-500">{p.category}</span>
                    <p className="text-sm font-bold text-white mt-1 line-clamp-2 group-hover:text-orange-500 transition-colors">{p.title}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto px-4 pb-10 text-center">
          <Link href="/blog" className="text-sm text-slate-500 hover:text-orange-500 transition-colors">← Înapoi la Blog</Link>
        </div>
      </div>
    </>
  );
}
