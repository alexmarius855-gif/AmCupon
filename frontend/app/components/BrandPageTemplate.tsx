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
    return data.find((m) =>
      slugs.some((s) => m.magazin.toLowerCase().includes(s.toLowerCase()))
    ) || null;
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
  const hasCod = promotii.some((p) => !!p.cod_cupon);

  const CULORI = ["bg-orange-500","bg-blue-500","bg-violet-500","bg-emerald-500","bg-red-500"];
  const culoare = CULORI[config.name.charCodeAt(0) % CULORI.length];

  return (
    <div className="min-h-screen bg-slate-950">

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-slate-950 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(249,115,22,0.10) 0%, transparent 65%)" }} />
        <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-14 text-center">
          <nav className="flex justify-center gap-2 text-xs text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300">AmCupon.ro</Link>
            <span>/</span>
            <span className="text-slate-300">{config.name}</span>
          </nav>

          {/* Logo / initial */}
          <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden mb-5 shadow-xl">
            {magazin?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={magazin.logo_url} alt={`Logo ${config.name}`} className="w-full h-full object-contain bg-white p-1" />
            ) : (
              <div className={`w-full h-full ${culoare} flex items-center justify-center text-white font-black text-3xl`}>
                {config.emoji}
              </div>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            Reduceri <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #fb923c, #fbbf24)" }}>{config.name}</span>
          </h1>
          <p className="text-slate-400 text-lg mb-6">{config.tagline}</p>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-6 text-sm mb-8">
            <div className="text-center">
              <div className="font-black text-white text-2xl">{promotii.length}</div>
              <div className="text-slate-500 text-xs mt-0.5">Oferte active</div>
            </div>
            <div className="text-center">
              <div className="font-black text-white text-2xl">{promotii.filter(p => !!p.cod_cupon).length}</div>
              <div className="text-slate-500 text-xs mt-0.5">Coduri reducere</div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            {magazin?.url_afiliat && (
              <a href={magazin.url_afiliat} target="_blank" rel="sponsored noopener noreferrer"
                className="bg-orange-500 hover:bg-orange-400 text-white font-black px-7 py-3 rounded-2xl text-sm transition-all shadow-lg shadow-orange-500/25 hover:-translate-y-0.5 duration-200">
                Mergi la {config.name} →
              </a>
            )}
            <Link href={`/cod-reducere/${config.slug}`}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold px-6 py-3 rounded-2xl text-sm transition-colors">
              Toate codurile {config.name}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── PROMOTII ─────────────────────────────────────────────────────── */}
      {promotii.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-white mb-6">
            Oferte {config.name} Active — {new Date().toLocaleDateString("ro-RO", { month: "long", year: "numeric" })}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {promotii.map((promo, i) => {
              const discount = extractDiscount(promo.nume) || extractDiscount(promo.descriere || "");
              const urgenta = (promo.zile_ramase ?? 99) <= 2;
              return (
                <div key={i} className="bg-slate-900 border border-slate-800 hover:border-orange-500/40 rounded-2xl p-4 flex flex-col gap-3 transition-all hover:shadow-lg">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-slate-200 font-semibold leading-snug flex-1">{promo.nume}</p>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {discount > 0 && (
                        <span className="text-xs font-black text-white bg-red-500 px-2 py-0.5 rounded-full">-{discount}%</span>
                      )}
                      {promo.cod_cupon && (
                        <span className="text-[10px] font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-full">COD</span>
                      )}
                    </div>
                  </div>

                  {promo.cod_cupon && (
                    <div className="bg-slate-800 border border-dashed border-orange-400/50 rounded-xl px-3 py-2 text-center">
                      <span className="font-mono font-black text-orange-400 text-base tracking-widest">{promo.cod_cupon}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-800">
                    {urgenta ? (
                      <span className="text-[10px] font-bold text-red-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                        {(promo.zile_ramase ?? 0) === 0 ? "Expira azi" : "Expira maine"}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-600">
                        {(promo.zile_ramase ?? 99) < 99 ? `${promo.zile_ramase} zile ramase` : ""}
                      </span>
                    )}
                    <a href={promo.landing_page || magazin?.url_afiliat || "#"}
                      target="_blank" rel="sponsored noopener noreferrer"
                      className="text-xs font-black bg-orange-500 hover:bg-orange-400 text-white px-4 py-1.5 rounded-xl transition-colors">
                      {promo.cod_cupon ? "Copiaza si mergi" : "Vezi oferta →"}
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <p className="text-3xl mb-3">🔍</p>
            <p className="font-bold text-slate-200 mb-2">Nu exista oferte active momentan</p>
            <p className="text-slate-500 text-sm mb-4">Revino maine — actualizam ofertele zilnic de la {config.name}.</p>
            {magazin?.url_afiliat && (
              <a href={magazin.url_afiliat} target="_blank" rel="sponsored noopener noreferrer"
                className="inline-block bg-orange-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-orange-400 transition-colors">
                Mergi direct la {config.name} →
              </a>
            )}
          </div>
        </section>
      )}

      {/* ─── EDITORIAL ────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 py-10">
        <h2 className="text-xl font-black text-white mb-5">
          De ce sa cumperi de la {config.name}?
        </h2>
        <div className="space-y-4">
          {config.editorial.map((para, i) => (
            <p key={i} className="text-slate-400 leading-relaxed text-sm">{para}</p>
          ))}
        </div>

        {config.tips.length > 0 && (
          <div className="mt-8 bg-slate-900 border border-slate-700 rounded-2xl p-5">
            <h3 className="font-black text-white mb-4">Sfaturi pentru cumparaturi mai ieftine la {config.name}</h3>
            <ul className="space-y-2.5">
              {config.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <span className="text-orange-500 font-black mt-0.5 shrink-0">→</span>
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
          <h2 className="text-xl font-black text-white mb-5">Intrebari frecvente despre {config.name}</h2>
          <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden">
            {config.faq.map((item, i) => (
              <details key={i} className="group bg-slate-900">
                <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer hover:bg-slate-800 transition-colors list-none">
                  <span className="font-semibold text-slate-200 text-sm">{item.q}</span>
                  <span className="text-orange-500 text-lg shrink-0 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-5 pb-4 text-sm text-slate-400 leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* ─── CTA NEWSLETTER ──────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 text-center">
          <p className="text-2xl font-black text-white mb-2">Nu rata urmatoarea oferta {config.name}</p>
          <p className="text-slate-400 text-sm mb-5">Aboneaza-te la newsletter si primesti codurile noi direct pe email.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/newsletter"
              className="bg-orange-500 hover:bg-orange-400 text-white font-black px-7 py-3 rounded-2xl text-sm transition-all shadow-lg shadow-orange-500/20">
              Aboneaza-te gratuit →
            </Link>
            <Link href="/oferte-azi"
              className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 font-semibold px-6 py-3 rounded-2xl text-sm transition-colors">
              Toate ofertele de azi
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
