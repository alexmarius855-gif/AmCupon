import Link from "next/link";
import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import fs from "fs";
import path from "path";

import { canonicalArticol, construiesteIndexMagazine } from "../../../lib/blogCanonical";
import type { IndexableProdus } from "../../../lib/seoIndexable";
import { numeAfisat } from "@/lib/numeMagazin";

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
  magazin: string | null;
  cover: string;
  content: string;
  /** `magazin` | `best-of` | `categorie` | `roundup` — vezi generate_blog.py */
  tip?: string | null;
}

function loadPosts(): BlogPost[] {
  const filePath = path.join(process.cwd(), "public", "blog-posts.json");
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

/**
 * Magazinele care merita indexate, pentru decizia de canonical.
 * Citeste aceleasi fisiere ca sitemap-ul, prin ACELASI helper — daca ar diverge,
 * am avea articole care se declara duplicat fara ca sitemap-ul sa stie.
 */
function magazineIndexabile(): Set<string> {
  try {
    const magazine = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "public", "output.json"), "utf-8")
    );
    let produse: IndexableProdus[] = [];
    const pPath = path.join(process.cwd(), "public", "products.json");
    if (fs.existsSync(pPath)) {
      const raw = JSON.parse(fs.readFileSync(pPath, "utf-8"));
      produse = (raw.products || raw) as IndexableProdus[];
    }
    return construiesteIndexMagazine(magazine, produse);
  } catch {
    // Fara date nu putem decide — articolul isi pastreaza canonicalul propriu.
    // Mai bine un semnal neconsolidat decat un canonical catre o pagina necunoscuta.
    return new Set<string>();
  }
}


function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ro-RO", {
    day: "numeric", month: "long", year: "numeric",
  });
}

/** Parseza bold + linkuri markdown inline: **bold** si [text](url)
 *
 * 20.09.2026 — bold-ul se parseaza acum RECURSIV. Inainte, `**[22 lei](url)**` iesea
 * literal ca „<strong>[22 lei](url)</strong>": regexul prindea intai bold-ul si trata
 * continutul ca text simplu. Tiparul apare in orice articol care pune pretul ca link
 * ingrosat — adica in fiecare articol de tip „Top N", unde pretul E butonul.
 */
function parseInline(text: string, baseKey: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const regex = /\*\*(.*?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let match;
  let i = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    if (match[1] !== undefined) {
      nodes.push(<strong key={`${baseKey}-b${i}`}>{parseInline(match[1], `${baseKey}-b${i}`)}</strong>);
    } else if (match[2] && match[3]) {
      const isExt = match[3].startsWith("http");
      nodes.push(
        <a key={`${baseKey}-l${i}`} href={match[3]}
          className="text-[#ddf93c] hover:text-[#c3dd2c] underline underline-offset-2 font-medium"
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
  // 22.09.2026: blocurile se impart pe linie goala, iar generatoarele scriu adesea
  //     ## Parametri esentiali
  //     - Motor: Bosch, Shimano
  // fara linie goala intre ele. Tot blocul intra atunci in <h2>, deci titlul se randa
  // urias, cu toata lista inauntru — vizibil pe 39 de sectiuni din articolele
  // „cel mai bun X". Normalizam inainte de impartire: orice titlu primeste linia goala
  // care ii lipseste. Reparat AICI, nu in generatoare, ca sa prinda si cele 499 de
  // articole deja scrise.
  const normalizat = content.replace(/^(#{2,4} .+)$\n(?!$)/gm, "$1\n\n");
  return normalizat.split("\n\n").map((block, i) => {
    const key = `b${i}`;
    if (block.startsWith("## ")) {
      return <h2 key={key} className="text-xl font-black text-[#ffffff] mt-8 mb-3">{parseInline(block.slice(3), key)}</h2>;
    }
    if (block.startsWith("### ")) {
      return <h3 key={key} className="text-lg font-bold text-[#ffffff] mt-6 mb-2">{parseInline(block.slice(4), key)}</h3>;
    }
    if (block.startsWith("- ") || block.includes("\n- ")) {
      const items = block.split("\n").filter((l) => l.startsWith("- ")).map((l) => l.slice(2));
      return (
        <ul key={key} className="list-disc list-inside space-y-1.5 my-4 text-[#c9ced5]">
          {items.map((item, j) => (
            <li key={j}>{parseInline(item, `${key}-li${j}`)}</li>
          ))}
        </ul>
      );
    }
    // ── Separator orizontal ───────────────────────────────────────────────────
    // 20.09.2026: „---" se afisa ca text brut. Fiecare articol de tip „Top N" are
    // cate 13 separatoare (unul intre produse), deci pe pagina apareau 13 siruri de
    // liniute in mijlocul continutului. Vazut in browser, nu dedus din cod.
    if (/^-{3,}$/.test(block.trim())) {
      return <hr key={key} className="my-8 border-0 border-t border-[#1f2329]" />;
    }

    // ── Tabel Markdown ────────────────────────────────────────────────────────
    // 20.09.2026: parserul nu stia tabele deloc, deci un tabel comparativ aparea ca
    // text brut plin de „|". Conteaza pentru ca in articolele de tip „Top N" tabelul
    // e primul lucru dupa introducere: pe telefon, decizia se ia din el, nu din cele
    // 2.000 de cuvinte de dedesubt.
    // Recunoastem forma minima — prima linie antet, a doua linie separator (|---|---|).
    // Nu implementam aliniere (`:---:`): n-o foloseste niciun articol, iar un parser
    // care face mai mult decat e folosit devine cod mort care se strica in tacere.
    const linii = block.split("\n").filter((l) => l.trim().startsWith("|"));
    if (linii.length >= 3 && /^\|[\s:|-]+\|$/.test(linii[1].trim())) {
      const celule = (l: string) =>
        l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const antet = celule(linii[0]);
      const randuri = linii.slice(2).map(celule);
      return (
        // Tabelul isi are propriul scroll orizontal: pe 360px latime, patru coloane
        // nu incap, iar fara asta ar impinge TOATA pagina in scroll lateral.
        <div key={key} className="my-6 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#2a2f36]">
                {antet.map((c, j) => (
                  <th key={j} className="text-left font-bold text-[#ffffff] py-2.5 px-3 whitespace-nowrap">
                    {parseInline(c, `${key}-th${j}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {randuri.map((r, ri) => (
                <tr key={ri} className="border-b border-[#1f2329]">
                  {r.map((c, ci) => (
                    <td key={ci} className="py-2.5 px-3 text-[#c9ced5] align-top">
                      {parseInline(c, `${key}-td${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return <p key={key} className="text-[#c9ced5] leading-relaxed my-3">{parseInline(block, key)}</p>;
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

  // 22.09.2026: 47 de articole aveau <title> peste 60 de caractere, deci Google taia
  // exact partea utila. Limita e a lui <title>, NU a titlului articolului — <h1> ramane
  // intreg mai jos. Se scoate intai sufixul de brand, apoi se taie la ultimul cuvant
  // intreg, ca sa nu ramana „...bicicleta elec".
  const MAX_TITLU = 60;
  const titluScurt = (() => {
    const fara = post.title.replace(/\s*\|\s*AmCupon\.ro\s*$/i, "").trim();
    if (fara.length <= MAX_TITLU) {
      const cu = `${fara} | AmCupon.ro`;
      return cu.length <= MAX_TITLU ? cu : fara;
    }
    const taiat = fara.slice(0, MAX_TITLU);
    return taiat.slice(0, taiat.lastIndexOf(" ") > 30 ? taiat.lastIndexOf(" ") : MAX_TITLU).trim();
  })();

  const pageUrl = `https://amcupon.ro/blog/${slug}`;
  // Canonical catre pagina de MAGAZIN cand articolul e un sablon lunar despre acelasi
  // magazin (masurat 23.08: 96 astfel de articole, 88,1% identice intre ele, fiecare
  // canibalizand propria pagina de magazin). Vezi lib/blogCanonical.ts.
  const canonic = canonicalArticol(post, magazineIndexabile());
  // Articol auto-generat despre un magazin fara nicio promotie activa = continut subtire,
  // aproape identic intre articole (doar numele magazinului difera). Scos din index ca sa
  // nu deprecieze semnalul de calitate al site-ului pentru cele cu continut real.
  const faraPromoActiva = /\b0 promotii active\b/.test(post.excerpt);
  return {
    // post.title include deja " | AmCupon.ro" (vezi generate_blog.py) — nu re-adauga,
    // altfel titlul apare dublat in tab/SERP ("... | AmCupon.ro | AmCupon.ro")
    title: titluScurt,
    description: post.excerpt,
    alternates: { canonical: canonic },
    ...(faraPromoActiva ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: titluScurt,
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
      title: titluScurt,
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

      <div className="min-h-screen bg-[#06080b]">
        <article className="max-w-3xl mx-auto px-4 py-10">
          <div className="mb-6">
            <span className="bg-[#ddf93c] text-[#0c1000] text-xs font-bold px-3 py-1 rounded-full">{post.category}</span>
          </div>

          {/*
            Titlul din date include sufixul „ | AmCupon.ro" — necesar in <title>, unde
            ajuta la recunoasterea tabului si in SERP, dar gresit in <h1>.

            20.09.2026, vazut in browser: h1-ul afisa „Iluminat interior: 10 corpuri, de
            la 69 la 519 lei, si cum se combina | AmCupon.ro". Nimeni nu scrie numele
            site-ului in titlul vizibil al articolului, iar pentru Google h1-ul e unul
            dintre cele mai puternice semnale de subiect — cu sufixul acolo, diluam
            cuvintele-cheie cu numele propriu pe 405 din cele 469 de articole.

            `<title>` si Open Graph raman neatinse: acolo sufixul isi are rostul.
          */}
          <h1 className="text-2xl md:text-3xl font-black text-[#ffffff] leading-tight mb-4">
            {post.title.replace(/\s*\|\s*AmCupon\.ro\s*$/i, "")}
          </h1>

          <div className="flex items-center gap-4 text-sm text-[#9399a0] mb-8 pb-6 border-b border-[#1f2329]">
            <div className="flex items-center gap-2 shrink-0">
              <Image
                src="/logo-profile.svg"
                alt="AmCupon.ro"
                width={28}
                height={28}
                className="rounded-full ring-2 ring-[#ddf93c]/20"
              />
              <span className="font-semibold text-[#c9ced5]">AmCupon.ro</span>
            </div>
            <span>·</span>
            <span>{formatDate(post.date)}</span>
            {post.magazin && (
              <>
                <span>·</span>
                <a href={`/cod-reducere/${post.magazin}`} className="text-[#ddf93c] font-semibold hover:underline">
                  {numeAfisat(post.magazin)}
                </a>
              </>
            )}
          </div>

          {/*
            Raportul containerului = raportul imaginii (1200x630), nu inaltime fixa.

            20.09.2026, vazut in browser: cu `h-64` si `object-cover`, containerul avea
            raport ~1.56 fata de 1.90 al coverului, iar CSS-ul decupa lateral. Pe articolul
            de iluminat, titlul din imagine aparea taiat la ambele capete: „minat interior:
            10 corpuri, de la 519 lei". Coverurile astea sunt generate CU TEXT pe ele
            (scripts/generate_article_covers.py), deci orice decupare taie cuvinte.
          */}
          <div className="relative rounded-xl overflow-hidden mb-8 shadow-sm aspect-[1200/630]">
            <Image src={post.cover} alt={post.title} fill className="object-contain" priority sizes="(max-width: 768px) 100vw, 768px" />
          </div>

          <p className="text-lg text-[#c9ced5] font-medium leading-relaxed mb-8 p-5 bg-[#14181c] rounded-xl border-l-4 border-[#ddf93c] border-y border-r border-y-[#e2e8f0] border-r-[#e2e8f0]">
            {post.excerpt}
          </p>

          <div className="text-base">
            {renderContent(post.content)}
          </div>

          {post.magazin && (
            <div className="mt-10 p-6 bg-gradient-to-r from-[#ddf93c] to-[#ddf93c] rounded-xl text-[#0c1000] text-center">
              <p className="font-black text-xl mb-2">Vezi toate promoțiile {numeAfisat(post.magazin)}</p>
              <p className="text-[#2a2f10] text-sm mb-4">Coduri verificate, actualizate zilnic</p>
              <a href={`/cod-reducere/${post.magazin}`}
                className="inline-block bg-[#14181c] text-[#c3dd2c] font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-[#06080b] transition-colors">
                Deschide pagina →
              </a>
            </div>
          )}

          {/* Newsletter CTA */}
          <div className="mt-10 p-6 bg-[#06080b] rounded-xl text-center">
            <p className="text-sm font-black text-[#ddf93c] uppercase tracking-widest mb-2">Newsletter gratuit</p>
            <h3 className="text-xl font-black text-[#ffffff] mb-2">Primeste coduri noi direct pe email</h3>
            <p className="text-[#c9ced5] text-sm mb-5">1000+ magazine monitorizate zilnic. Zero spam.</p>
            <Link href="/newsletter"
              className="inline-flex items-center gap-2 bg-[#ddf93c] hover:bg-[#ddf93c] text-[#0c1000] font-bold px-6 py-3 rounded-xl text-sm transition-colors">
              Aboneaza-te gratuit &rarr;
            </Link>
          </div>

          {/* Share buttons */}
          <div className="mt-10 pt-6 border-t border-[#1f2329]">
            <p className="text-sm font-bold text-[#c9ced5] mb-3 text-center">Distribuie articolul</p>
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
            <h2 className="text-xl font-black text-[#ffffff] mb-5">Articole recomandate</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {altePosts.map((p) => (
                <a key={p.slug} href={`/blog/${p.slug}`}
                  className="bg-[#14181c] rounded-xl border border-[#1f2329] hover:border-[#ddf93c]/50 overflow-hidden hover:shadow-lg hover:shadow-black/40 transition-all group">
                  <div className="relative h-32 overflow-hidden">
                    <Image src={p.cover} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="300px" />
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-bold text-[#ddf93c]">{p.category}</span>
                    <p className="text-sm font-bold text-[#ffffff] mt-1 line-clamp-2 group-hover:text-[#ddf93c] transition-colors">{p.title}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto px-4 pb-10 text-center">
          <Link href="/blog" className="text-sm text-[#9399a0] hover:text-[#ddf93c] transition-colors">← Înapoi la Blog</Link>
        </div>
      </div>
    </>
  );
}
