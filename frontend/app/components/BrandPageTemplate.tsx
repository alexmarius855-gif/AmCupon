import fs from "fs";
import path from "path";
import Link from "next/link";

interface Promotie {
  nume: string;
  descriere?: string;
  cod_cupon: string;
  landing_page: string;
  zile_ramase: number;
}
interface Magazin {
  magazin: string;
  url: string;
  url_afiliat: string;
  logo_url?: string;
  categorie: string;
  categorie_slug?: string;
  are_promotie: boolean;
  cod_cupon: boolean;
  promotii: Promotie[];
  scor_final?: number;
  comision?: string;
}
export interface BrandConfig {
  slug: string;          // ex: "altex.ro"
  slugAlt?: string;      // slug alternativ (ex: "altex")
  name: string;          // ex: "Altex"
  tagline: string;       // ex: "Cel mai mare retailer de electronice"
  emoji: string;
  desc: string;          // descriere scurta pentru SEO
  editorial: string[];   // paragrafe editoriale
  tips: string[];        // sfaturi cumparatori
  faq: { q: string; a: string }[];
  canonical: string;     // ex: "/altex"
}

function loadMagazin(slugs: string[]): Magazin | null {
  try {
    const data: Magazin[] = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "public", "output.json"), "utf-8")
    );
    const lower = slugs.map((s) => s.toLowerCase());
    // Potrivire in ordinea specificitatii: egalitate > prefix de domeniu > substring.
    // Doar `.includes` producea potriviri gresite (ex: "otter" prindea si "spotter.ro").
    return (
      data.find((m) => lower.includes(m.magazin.toLowerCase())) ||
      data.find((m) => lower.some((s) => m.magazin.toLowerCase().startsWith(s + "."))) ||
      data.find((m) => lower.some((s) => m.magazin.toLowerCase().includes(s))) ||
      null
    );
  } catch {
    return null;
  }
}

function extractDiscount(text: string): number {
  const m = text?.match(/(\d+)\s*%/);
  const v = m ? parseInt(m[1]) : 0;
  return v > 0 && v <= 90 ? v : 0;
}

export default function BrandPageTemplate({ config }: { config: BrandConfig }) {
  const slugs = [config.slug, ...(config.slugAlt ? [config.slugAlt] : [])];
  const magazin = loadMagazin(slugs);
  const promotii = magazin?.promotii || [];

  const culoare = "bg-gradient-to-br from-[#14b8a6] to-[#0f766e]";

  const jsonLd: object[] = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "AmCupon.ro", item: "https://amcupon.ro" },
        { "@type": "ListItem", position: 2, name: config.name, item: `https://amcupon.ro${config.canonical}` },
      ],
    },
  ];
  if (config.faq.length > 0) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: config.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-[#0a0f1a] overflow-hidden border-b border-[#1e293b]">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(13,148,136,0.12) 0%, transparent 65%)" }} />
        <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-14 text-center">
          <nav className="flex justify-center gap-2 text-xs text-[#94a3b8] mb-8">
            <Link href="/" className="hover:text-[#cbd5e1]">AmCupon.ro</Link>
            <span>/</span>
            <span className="text-[#cbd5e1]">{config.name}</span>
          </nav>

          {/* Logo / initial */}
          <div className="w-20 h-20 mx-auto rounded-xl overflow-hidden mb-5 shadow-xl">
            {magazin?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={magazin.logo_url} alt={`Logo ${config.name}`} className="w-full h-full object-contain bg-[#111827] p-1" />
            ) : (
              <div className={`w-full h-full ${culoare} flex items-center justify-center text-[#f1f5f9] font-black text-3xl`}>
                {config.emoji}
              </div>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-[#f1f5f9] mb-3">
            Reduceri <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #14b8a6, #0d9488)" }}>{config.name}</span>
          </h1>
          <p className="text-[#cbd5e1] text-lg mb-6">{config.tagline}</p>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-6 text-sm mb-8">
            <div className="text-center">
              <div className="font-black text-[#f1f5f9] text-2xl">{promotii.length}</div>
              <div className="text-[#94a3b8] text-xs mt-0.5">Oferte active</div>
            </div>
            <div className="text-center">
              <div className="font-black text-[#f1f5f9] text-2xl">{promotii.filter(p => !!p.cod_cupon).length}</div>
              <div className="text-[#94a3b8] text-xs mt-0.5">Coduri reducere</div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            {magazin?.url_afiliat && (
              <a href={magazin.url_afiliat} target="_blank" rel="sponsored noopener noreferrer"
                className="bg-gradient-to-r from-[#14b8a6] to-[#0d9488] hover:from-[#0d9488] hover:to-[#14b8a6] text-[#ffffff] font-black px-7 py-3 rounded-xl text-sm transition-all shadow-lg shadow-[#14b8a6]/25 hover:-translate-y-0.5 duration-200">
                Mergi la {config.name} →
              </a>
            )}
            <Link href={`/cod-reducere/${config.slug}`}
              className="bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-[#cbd5e1] font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
              Toate codurile {config.name}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── PROMOTII ─────────────────────────────────────────────────────── */}
      {promotii.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-[#f1f5f9] mb-6">
            Oferte {config.name} Active — {new Date().toLocaleDateString("ro-RO", { month: "long", year: "numeric" })}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {promotii.map((promo, i) => {
              const discount = extractDiscount(promo.nume) || extractDiscount(promo.descriere || "");
              const urgenta = (promo.zile_ramase ?? 99) <= 2;
              return (
                <div key={i} className="bg-[#111827] border border-[#1e293b] hover:border-[#14b8a6]/40 rounded-xl p-4 flex flex-col gap-3 transition-all hover:shadow-lg">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-[#cbd5e1] font-semibold leading-snug flex-1">{promo.nume}</p>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {discount > 0 && (
                        <span className="text-[13px] font-black text-[#ffffff] bg-gradient-to-br from-[#34d399] to-[#14b8a6] px-2 py-1 rounded-lg leading-none shadow-sm">-{discount}%</span>
                      )}
                      {promo.cod_cupon && (
                        <span className="text-[10px] font-black text-[#0d9488] bg-[#14b8a6]/10 border border-[#14b8a6]/25 px-1.5 py-0.5 rounded-full">COD</span>
                      )}
                    </div>
                  </div>

                  {promo.cod_cupon && (
                    <div className="bg-[#1e293b] border border-dashed border-[#0d9488]/50 rounded-xl px-3 py-2 text-center">
                      <span className="font-mono font-black text-[#0d9488] text-base tracking-widest">{promo.cod_cupon}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#1e293b]">
                    {urgenta ? (
                      <span className="text-[10px] font-bold text-[#e8956f] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e8956f] animate-pulse" />
                        {(promo.zile_ramase ?? 0) === 0 ? "Expiră azi" : "Expiră mâine"}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#94a3b8]">
                        {(promo.zile_ramase ?? 99) < 99 ? `${promo.zile_ramase} zile rămase` : "Verificat azi"}
                      </span>
                    )}
                    <a href={promo.landing_page || magazin?.url_afiliat || "#"}
                      target="_blank" rel="sponsored noopener noreferrer"
                      className="text-xs font-black bg-gradient-to-r from-[#14b8a6] to-[#0d9488] hover:from-[#0d9488] hover:to-[#14b8a6] text-[#ffffff] px-4 py-1.5 rounded-xl transition-all">
                      {promo.cod_cupon ? "Copiază și mergi" : "Vezi oferta →"}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {promotii.length === 0 && (
        <section className="max-w-5xl mx-auto px-4 py-10">
          <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-8 text-center">
            <p className="text-3xl mb-3">🔍</p>
            <p className="font-bold text-[#cbd5e1] mb-2">Nu exista oferte active momentan</p>
            <p className="text-[#94a3b8] text-sm mb-4">Revino maine — actualizam ofertele zilnic de la {config.name}.</p>
            {magazin?.url_afiliat && (
              <a href={magazin.url_afiliat} target="_blank" rel="sponsored noopener noreferrer"
                className="inline-block bg-[#0d9488] text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-[#14b8a6] transition-colors">
                Mergi direct la {config.name} →
              </a>
            )}
          </div>
        </section>
      )}

      {/* ─── EDITORIAL ────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 py-10">
        <h2 className="text-xl font-black text-[#f1f5f9] mb-5">
          De ce sa cumperi de la {config.name}?
        </h2>
        <div className="space-y-4">
          {config.editorial.map((para, i) => (
            <p key={i} className="text-[#cbd5e1] leading-relaxed text-sm">{para}</p>
          ))}
        </div>

        {config.tips.length > 0 && (
          <div className="mt-8 bg-[#111827] border border-[#334155] rounded-xl p-5">
            <h3 className="font-black text-[#f1f5f9] mb-4">Sfaturi pentru cumparaturi mai ieftine la {config.name}</h3>
            <ul className="space-y-2.5">
              {config.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-[#cbd5e1]">
                  <span className="text-[#0d9488] font-black mt-0.5 shrink-0">→</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ─── FAQ ─────────────────────────────────────────────────────────── */}
      {config.faq.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 pb-12">
          <h2 className="text-xl font-black text-[#f1f5f9] mb-5">Intrebari frecvente despre {config.name}</h2>
          <div className="divide-y divide-[#e2e8f0] border border-[#1e293b] rounded-xl overflow-hidden">
            {config.faq.map((item, i) => (
              <details key={i} className="group bg-[#111827]">
                <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer hover:bg-[#1e293b] transition-colors list-none">
                  <span className="font-semibold text-[#cbd5e1] text-sm">{item.q}</span>
                  <span className="text-[#0d9488] text-lg shrink-0 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-5 pb-4 text-sm text-[#cbd5e1] leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* ─── CTA NEWSLETTER ──────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="bg-[#111827] border border-[#334155] rounded-xl p-8 text-center">
          <p className="text-2xl font-black text-[#f1f5f9] mb-2">Nu rata urmatoarea oferta {config.name}</p>
          <p className="text-[#cbd5e1] text-sm mb-5">Aboneaza-te la newsletter si primesti codurile noi direct pe email.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/newsletter"
              className="bg-gradient-to-r from-[#14b8a6] to-[#0d9488] hover:from-[#0d9488] hover:to-[#14b8a6] text-[#ffffff] font-black px-7 py-3 rounded-xl text-sm transition-all shadow-lg shadow-[#14b8a6]/20">
              Aboneaza-te gratuit →
            </Link>
            <Link href="/oferte-azi"
              className="bg-[#1e293b] border border-[#334155] hover:bg-[#334155] text-[#cbd5e1] font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
              Toate ofertele de azi
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
