import { notFound } from "next/navigation";
import { Metadata } from "next";
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

function renderContent(content: string) {
  return content.split("\n\n").map((block, i) => {
    if (block.startsWith("## ")) {
      return <h2 key={i} className="text-xl font-black text-gray-900 mt-8 mb-3">{block.slice(3)}</h2>;
    }
    if (block.startsWith("### ")) {
      return <h3 key={i} className="text-lg font-bold text-gray-900 mt-6 mb-2">{block.slice(4)}</h3>;
    }
    if (block.startsWith("- ") || block.includes("\n- ")) {
      const items = block.split("\n").filter((l) => l.startsWith("- ")).map((l) => l.slice(2));
      return (
        <ul key={i} className="list-disc list-inside space-y-1.5 my-4 text-gray-700">
          {items.map((item, j) => {
            const parts = item.split(/\*\*(.*?)\*\*/g);
            return (
              <li key={j}>
                {parts.map((part, k) => k % 2 === 1 ? <strong key={k}>{part}</strong> : part)}
              </li>
            );
          })}
        </ul>
      );
    }
    const parts = block.split(/\*\*(.*?)\*\*/g);
    const rendered = parts.map((part, k) => k % 2 === 1 ? <strong key={k}>{part}</strong> : part);
    return <p key={i} className="text-gray-700 leading-relaxed my-3">{rendered}</p>;
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

  return {
    title: `${post.title} | AmCupon.ro`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://amcupon.ro/blog/${slug}`,
      images: [{ url: post.cover }],
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
    headline: post.title,
    description: post.excerpt,
    image: post.cover,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: "AmCupon.ro" },
    publisher: {
      "@type": "Organization",
      name: "AmCupon.ro",
      logo: { "@type": "ImageObject", url: "https://amcupon.ro/favicon.ico" },
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
            <span>{formatDate(post.date)}</span>
            <span>·</span>
            <span>AmCupon.ro</span>
            {post.magazin && (
              <>
                <span>·</span>
                <a href={`/cod-reducere/${post.magazin}`} className="text-orange-500 font-semibold hover:underline">
                  {numeAfisat(post.magazin)}
                </a>
              </>
            )}
          </div>

          <div className="rounded-2xl overflow-hidden mb-8 shadow-sm">
            <img src={post.cover} alt={post.title} className="w-full h-64 md:h-80 object-cover" />
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
                  <img src={p.cover} alt={p.title} className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300" />
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
