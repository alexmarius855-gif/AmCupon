"use client";

import Link from "next/link";
import Image from "next/image";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import PriceAlert from "../../components/PriceAlert";
import ReviewSection from "./ReviewSection";
import ShareButton from "../../components/ShareButton";
import CuponCard from "../../components/CuponCard";
import { indexReducereMaxima, hookMagazin, type PromotieCupon } from "@/lib/oferta";
import { cuNumar } from "@/lib/acordNumeral";

function cuReducereaMaximaPrima<T extends PromotieCupon>(lista: T[]): { lista: T[]; top: boolean } {
  const i = indexReducereMaxima(lista);
  return i < 0 ? { lista, top: false } : { lista: [lista[i], ...lista.filter((_, j) => j !== i)], top: true };
}
import BannerAd2P from "../../components/BannerAd2P";
import RedirectModal from "../../components/RedirectModal";
import { useCopyCod } from "../../hooks/useCopyCod";
import VotCupon, { hashCupon } from "../../components/VotCupon";
import { linkAfiliat, linkPromotie } from "@/lib/linkMagazin";
import { numeAfisat } from "@/lib/numeMagazin";
import { CardProdus } from "../../components/OferteParteneri";

// ── Interfaces ────────────────────────────────────────────────────────────────
interface Promotie {
  nume: string;
  descriere: string;
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
  rank?: number;
  trend: number;
  are_promotie: boolean;
  cod_cupon: boolean;
  zile_ramase: number;
  promotii: Promotie[];
  exclusiv: boolean;
  canal_recomandat?: string;
  prioritate?: string;
  sales_number?: number;
  scor_afiliere?: number;
  scor_final?: number;
  ultima_verificare?: string;
}

interface MagazinSimilar {
  magazin: string;
  logo_url?: string;
  are_promotie: boolean;
  cod_cupon: boolean;
  promotii: { nume: string }[];
  /** Are cel putin un cod NEVID. Diferit de `are_promotie`: din 66 de magazine
   *  cu promotie, doar 6 au cod real (masurat 16.08.2026). */
  cod_real?: boolean;
  ultima_verificare?: string;
  /** Cel mai bun cod al magazinului, cu linkul platit calculat pe server (page.tsx). */
  oferta?: { nume: string; descriere: string; cod_cupon: string; zile_ramase: number; link: string | null };
}

interface BlogPostMic {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  cover: string;
}

interface Produs {
  title: string;
  url: string;
  image: string;
  price: number;
  old_price?: number;
  discount_pct: number;
  category: string;
  brand: string;
  merchant: string;
  merchant_slug: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function maxPct(promotii: { nume: string }[]): number {
  let max = 0;
  for (const p of promotii) {
    const m = p.nume?.match(/(\d+)\s*%/);
    if (m) { const v = parseInt(m[1]); if (v > max && v <= 90) max = v; }
  }
  return max;
}

function extractDiscount(text: string): string | null {
  const m = text?.match(/(\d+)\s*%/);
  return m ? m[1] + "%" : null;
}

// ── Produs card ───────────────────────────────────────────────────────────────
// ── Main component ────────────────────────────────────────────────────────────
interface Banner2P {
  id: number; image_url: string; landing_url: string; landing_raw: string;
  width: number; height: number; merchant: string; merchant_slug: string;
  name: string; category: string; b_type: string;
}

export default function MagazinClient({ magazin: m, produse = [], similare = [], comparatii = [], blogPost = null, banner = null, descriere = null, astazi, context = null, istoric = null, blackFriday = null }: {
  magazin: Magazin;
  produse?: Produs[];
  similare?: MagazinSimilar[];
  comparatii?: { slug: string; label: string }[];
  blogPost?: BlogPostMic | null;
  banner?: Banner2P | null;
  descriere?: { titlu: string; paragrafe: string[] } | null;
  astazi: string; // data serverului (YYYY-MM-DD), pt comparatie reala cu ultima_verificare
  /** Slot SERVER-rendered (ContextMagazin) — textul trebuie sa fie in HTML, nu
   *  adaugat dupa hidratare, altfel nu conteaza pentru indexare. */
  context?: React.ReactNode;
  /** Slot SERVER-rendered (IstoricMagazin): ofertele vazute in trecut, din datele noastre. */
  istoric?: React.ReactNode;
  /** Slot SERVER-rendered (BlackFridayMagazin): campania anuntata a magazinului, cand exista. */
  blackFriday?: React.ReactNode;
}) {
  const [revealed, setRevealed]   = useState<Set<number>>(new Set());
  // Cascada de logo, ca in MagazinCard: sursa din date -> favicon Google ->
  // favicon DuckDuckGo -> initiala. Masurat pe 1167 magazine (14.08.2026): 58 de
  // logo_url dau non-200, iar dintre acestea Google acopera 0 (43 erau DEJA
  // favicon Google mort) si DuckDuckGo recupereaza 33. Pagina asta avea un singur
  // pas, deci pica direct pe initiala inclusiv acolo unde exista logo real.
  const [logoIdx, setLogoIdx] = useState(0);
  // Totalurile de voturi, o singura cerere per pagina. Daca baza e picata,
  // ramane gol si UI-ul nu arata niciun scor — corect, nu inventam.
  const [voturi, setVoturi] = useState<Record<string, { da: number; nu: number }>>({});
  const [modalOpen, setModalOpen] = useState(false);
  // Numele din modalul de dupa copiere. Pe pagina fara oferta se pot copia si codurile
  // magazinelor SIMILARE — modalul trebuie sa numeasca magazinul codului, nu al paginii.
  const [numeModal, setNumeModal] = useState("");
  const [revealedSim, setRevealedSim] = useState<Set<string>>(new Set());
  const { copiedKey, redirectFailed, copyAndOpen, retryRedirect } = useCopyCod(trackClick);
  const copiat = copiedKey !== null ? Number(copiedKey) : null;

  const nume      = numeAfisat(m.magazin);
  const an        = new Date().getFullYear();
  const initiala  = nume.charAt(0).toUpperCase();

  // 14.10.2026: oferta cu cea mai mare reducere procentuala trece prima, cu eticheta ei (ca Today's top offer).
  const ordCod    = cuReducereaMaximaPrima(m.promotii.filter(p => p.cod_cupon));
  const cuCod     = ordCod.lista;
  // Pe pagina fara cod: magazinele din aceeasi categorie care au un cod REAL, cu cardul lui.
  const similareCuCod = similare.filter((x) => x.cod_real && x.oferta).slice(0, 3);
  const ordOferte = cuReducereaMaximaPrima(m.promotii.filter(p => !p.cod_cupon));
  const faraCodd  = ordOferte.lista;

  // Prospetime REALA fata de ultima_verificare (setat de merge_platforms.py la fiecare
  // rulare a pipeline-ului) — inainte badge-ul afisa new Date() necondiționat, adica
  // "azi" pe orice vizita, indiferent cand au fost verificate datele. Omite daca nu avem
  // data (nu ghici).
  // null cand magazinul n-are link afiliat real. Butoanele de vizitare se ascund
  // atunci, in loc sa trimita un click pe care nu-l plateste nimeni. Vezi lib/linkMagazin.ts.
  const linkIesire = linkAfiliat(m);

  const zileDeLaVerificare = m.ultima_verificare
    ? Math.round((Date.parse(astazi) - Date.parse(m.ultima_verificare)) / 86400000)
    : null;

  useEffect(() => {
    let anulat = false;
    fetch(`/api/vote?magazin=${encodeURIComponent(m.magazin)}`)
      .then((r) => r.json())
      .then((d) => { if (!anulat && d?.totaluri) setVoturi(d.totaluri); })
      .catch(() => {});      // fara totaluri = fara scor afisat, nu scor inventat
    return () => { anulat = true; };
  }, [m.magazin]);

  const domeniuLogo = (m.magazin || "").match(/[a-z0-9-]+\.[a-z]{2,}(?:\.[a-z]{2,})?/i)?.[0] || null;
  const logoSurse = [
    m.logo_url,
    domeniuLogo ? `https://www.google.com/s2/favicons?domain=${domeniuLogo}&sz=128` : null,
    domeniuLogo ? `https://icons.duckduckgo.com/ip3/${domeniuLogo}.ico` : null,
  ].filter(Boolean) as string[];
  const logoSrc = logoSurse[logoIdx];

  // `link` poate fi null: magazinele fara link afiliat nu primesc destinatie. Codul se
  // copiaza oricum — omul il poate folosi — dar nu trimitem un click pe care nu-l plateste
  // nimeni. Vezi lib/linkMagazin.ts.
  function copiazaCod(idx: number, cod: string, link?: string | null) {
    setRevealed(prev => new Set(prev).add(idx));
    setNumeModal(nume);
    // copy + open sincron (popup blocker) + tracking, unificat in useCopyCod (folosit
    // si de MagazinCard.tsx — inainte logica era duplicata separat in fiecare fisier).
    copyAndOpen(String(idx), cod, link ?? undefined, m.magazin);
    setModalOpen(true);
  }


  function trackClick(tip: string, magazinSlug: string, cod?: string) {
    try {
      if (typeof window !== "undefined" && (window as unknown as {gtag?: (...args: unknown[]) => void}).gtag) {
        (window as unknown as {gtag: (...args: unknown[]) => void}).gtag("event", "affiliate_click", {
          event_category: "afiliere",
          event_label: magazinSlug,
          affiliate_type: tip,
          coupon_code: cod || "",
          value: 1,
        });
      }
    } catch {}
  }

  const H2 = "text-xl font-black text-[var(--foreground)]";

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-5xl mx-auto px-4 pt-4 pb-8 text-[var(--foreground)]">

        {/* ── ANTET ──────────────────────────────────────────────────────────
            03.11.2026: antetul propriu a iesit (meniul si cautarea sunt cele comune), iar din primul ecran au
            iesit „Top #N Romania", „Exclusiv", „Trending" (camp mereu 0) si Deal Score: nimic din ele nu ajuta la
            alegerea unei oferte, iar pe telefon impingeau codul sub ecran. */}
        <nav aria-label="Breadcrumb" className="text-xs text-[var(--text-muted)] mb-3 truncate">
          <Link href="/" className="hover:text-[var(--accent-text)]">Acasă</Link>
          <span className="mx-1.5">/</span>
          <Link href="/toate-magazinele" className="hover:text-[var(--accent-text)]">Magazine</Link>
          <span className="mx-1.5">/</span>
          <span className="text-[var(--text-soft)]">{nume}</span>
        </nav>

        <header className="flex items-center gap-3.5 mb-3">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex items-center justify-center bg-[#ffffff] p-1.5 shrink-0">
            {logoSrc ? (
              <Image src={logoSrc} alt={`Logo ${nume}`} fill sizes="64px" className="object-contain p-1.5"
                onError={() => setLogoIdx((i) => i + 1)} unoptimized />
            ) : (
              <span className="text-[#0c1000] font-black text-2xl">{initiala}</span>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-[1.5rem] md:text-3xl font-black tracking-tight leading-tight">Cod Reducere {nume} {an}</h1>
            <p className="text-sm text-[var(--text-soft)] mt-0.5">
              {m.categorie}
              {m.promotii.length > 0 && ` · ${cuNumar(m.promotii.length, "ofertă activă", "oferte active")}`}
              {zileDeLaVerificare !== null && ` · ${zileDeLaVerificare <= 0 ? "actualizat azi" : `actualizat acum ${cuNumar(zileDeLaVerificare, "zi", "zile")}`}`}
            </p>
            {m.promotii.length > 0 && <p className="text-[var(--foreground)] text-base font-semibold mt-1.5">{hookMagazin(m.promotii, nume)}</p>}
          </div>
        </header>

        {linkIesire && (
          <a href={linkIesire} target="_blank" rel="sponsored noopener noreferrer"
            className="inline-block w-full sm:w-auto text-center bg-[#ddf93c] hover:bg-[#c3dd2c] text-[#0c1000] font-bold px-5 py-2.5 rounded-xl text-sm transition-colors mb-5"
            onClick={() => trackClick("vizita_magazin", m.magazin)}>
            Mergi la {nume}
          </a>
        )}

        {banner && (
          <div className="pb-4 flex justify-center">
            <BannerAd2P banner={banner} />
          </div>
        )}

        {blackFriday && <div className="pb-5">{blackFriday}</div>}

        <div className="space-y-9">
          {/* ── OFERTELE: tot ce e activ, unul dupa altul. Pana pe 03.11.2026 stateau in taburi, deci cine
              intra pe „Coduri" nu vedea ofertele fara cod, iar pe telefon a doua lista cerea un clic. */}
          {cuCod.length > 0 && (
            <section aria-labelledby="coduri-h">
              <div className="flex items-baseline gap-3 mb-3">
                <h2 id="coduri-h" className={H2}>Coduri Reducere {nume} {an}</h2>
                <span className="text-sm text-[var(--text-muted)] whitespace-nowrap">{cuNumar(cuCod.length, "cod activ", "coduri active")}</span>
              </div>
              <div className="cc-list">
                {cuCod.map((promo, idx) => {
                  const link     = linkPromotie(m, promo);
                  const discount = extractDiscount(promo.nume) || extractDiscount(promo.descriere || "");
                  const hash     = hashCupon(promo.cod_cupon, promo.nume);
                  return (
                    <CuponCard
                      key={idx}
                      promo={promo}
                      numeMagazin={nume}
                      logoSrc={logoSrc}
                      link={link}
                      top={ordCod.top && idx === 0}
                      dezvaluit={revealed.has(idx)}
                      copiat={copiat === idx}
                      onDezvaluie={() => copiazaCod(idx, promo.cod_cupon, link)}
                      onIesire={() => trackClick("cod", m.magazin, promo.cod_cupon)}
                      extra={
                        <div className="flex flex-wrap items-center gap-3">
                          {/* Vot comunitar. Amprenta pe (cod + nume), NU pe index: indexul se
                              schimba la fiecare rulare de pipeline, deci voturile s-ar lipi de alt cupon. */}
                          <VotCupon magazin={m.magazin} cuponHash={hash} initial={voturi[hash]} />
                          {revealed.has(idx) && (
                            <ShareButton
                              pageSlug={`/cod-reducere/${m.magazin}`}
                              title={`Cod reducere ${discount ? discount + " " : ""}${nume}`}
                              text={`🔥 Cod reducere${discount ? " " + discount : ""} la ${nume}!\nCod: ${promo.cod_cupon}${promo.descriere && promo.descriere !== promo.nume ? "\n" + promo.descriere : ""}`}
                              small
                              label="Trimite"
                            />
                          )}
                        </div>
                      }
                    />
                  );
                })}
              </div>
              <p className="text-sm text-[var(--text-muted)] mt-3">
                Apeși pe cod: se copiază și se deschide {nume}. La plată, îl lipești în câmpul de voucher sau cod de reducere.
              </p>
            </section>
          )}

          {faraCodd.length > 0 && (
            <section aria-labelledby="oferte-h">
              <div className="flex items-baseline gap-3 mb-3">
                <h2 id="oferte-h" className={H2}>Oferte {nume} {an}</h2>
                <span className="text-sm text-[var(--text-muted)] whitespace-nowrap">{cuNumar(faraCodd.length, "ofertă activă", "oferte active")}</span>
              </div>
              <div className="cc-list">
                {faraCodd.map((promo, idx) => {
                  const link     = linkPromotie(m, promo);
                  const discount = extractDiscount(promo.nume) || extractDiscount(promo.descriere || "");
                  return (
                    <CuponCard
                      key={idx}
                      promo={promo}
                      numeMagazin={nume}
                      logoSrc={logoSrc}
                      link={link}
                      top={ordOferte.top && idx === 0}
                      extra={
                        <ShareButton
                          pageSlug={`/cod-reducere/${m.magazin}`}
                          title={`Oferta${discount ? " " + discount : ""} ${nume}`}
                          text={`🏷 Oferta${discount ? " " + discount : ""} la ${nume}!\n${promo.descriere && promo.descriere !== promo.nume ? promo.descriere : promo.nume}`}
                          small
                        />
                      }
                    />
                  );
                })}
              </div>
            </section>
          )}

          {m.promotii.length > 0 ? (
            <PriceAlert magazin={m.magazin} numeMagazin={nume} />
          ) : (
            <div>
              {/* ZERO FUNDATURI (23.09.2026, interfata noua). E starea pe care o vad 86% din
                  vizitatori. Alerta pe email e actiunea principala, deci formularul e deschis din
                  start; dedesubt, carduri INTREGI cu codul real al magazinelor similare — filtrate pe
                  cod, nu pe `are_promotie`, altfel l-am trimite la alta pagina fara coduri. */}
              <div className="cc-empty">
                <div className="cc-empty-i"><Bell className="w-5 h-5" /></div>
                <div className="flex-1 min-w-0">
                  <h2>Acum nu e niciun cod activ la {nume}.</h2>
                  <p className="cc-empty-txt">
                    {similareCuCod.length > 0
                      ? `Îți scriem pe email în ziua în care apare unul — sau vezi mai jos ${similareCuCod.length === 1 ? "un magazin din aceeași categorie care are" : "magazine din aceeași categorie care au"} cod chiar acum.`
                      : "Îți scriem pe email în ziua în care apare unul. Căutăm coduri noi de trei ori pe zi."}
                  </p>
                  <PriceAlert magazin={m.magazin} numeMagazin={nume} deschis />
                </div>
              </div>

              {similareCuCod.length > 0 && (
                <div className="mt-7">
                  <h2 className={H2}>{similareCuCod.length === 1 ? "Are cod chiar acum" : "Au cod chiar acum"}</h2>
                  <p className="text-sm text-[var(--text-muted)] mt-0.5 mb-3">{similareCuCod.length === 1 ? "Un magazin" : "Magazine"} din aceeași categorie cu {nume}.</p>
                  <div className="cc-list">
                    {similareCuCod.map((x) => {
                      const o = x.oferta!;
                      const cheie = `s-${x.magazin}`;
                      const numeX = numeAfisat(x.magazin);
                      return (
                        <CuponCard
                          key={x.magazin}
                          promo={o}
                          numeMagazin={numeX}
                          logoSrc={x.logo_url}
                          link={o.link}
                          dezvaluit={revealedSim.has(x.magazin)}
                          copiat={copiedKey === cheie}
                          onDezvaluie={() => {
                            setRevealedSim((prev) => new Set(prev).add(x.magazin));
                            setNumeModal(numeX);
                            copyAndOpen(cheie, o.cod_cupon, o.link ?? undefined, x.magazin);
                            setModalOpen(true);
                          }}
                          onIesire={() => trackClick("cod", x.magazin, o.cod_cupon)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── PRODUSE: acelasi card ca pe /top si pe ghiduri (formatul care a adus clicuri). Toate stau in HTML,
              si cele din <details>: titlurile lor sunt textul unic al paginii (17.08.2026, +52% text). */}
          {produse.length > 0 && (
            <section aria-labelledby="produse-h">
              <div className="flex items-baseline justify-between gap-3 mb-3">
                <h2 id="produse-h" className={H2}>Produse {nume}</h2>
                <span className="text-sm text-[var(--text-muted)] whitespace-nowrap">{cuNumar(produse.length, "produs", "produse")}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {produse.slice(0, 8).map((p, i) => <CardProdus key={i} p={{ ...p, merchant_slug: m.magazin }} />)}
              </div>
              {produse.length > 8 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-bold text-[var(--accent-text)]">Încă {cuNumar(produse.length - 8, "produs", "produse")}</summary>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
                    {produse.slice(8).map((p, i) => <CardProdus key={i} p={{ ...p, merchant_slug: m.magazin }} />)}
                  </div>
                </details>
              )}
            </section>
          )}

          {/* ── ISTORICUL OFERTELOR (server-rendered, 24.09.2026): pe pagina fara oferta (86% din vizite) e
              raspunsul la intrebarea pe care starea goala o lasa deschisa — magazinul da coduri, si cat de des? */}
          {istoric}

          {/* ── CONTEXT REAL (server-rendered): preturi din feed + pozitia magazinului in categoria lui. */}
          {context}

          {blogPost && (
            <section aria-labelledby="ghid-h">
              <h2 id="ghid-h" className={`${H2} mb-3`}>Ghid {nume}</h2>
              <a href={`/blog/${blogPost.slug}`}
                className="group flex gap-4 bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] rounded-xl p-4 transition-colors">
                <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-[var(--surface-alt)]">
                  <Image src={blogPost.cover} alt={blogPost.title} fill sizes="64px" className="object-cover" unoptimized />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold line-clamp-2 group-hover:text-[var(--accent-text)] transition-colors leading-snug">{blogPost.title}</p>
                  <p className="text-xs text-[var(--text-soft)] mt-1 line-clamp-2 leading-relaxed">{blogPost.excerpt}</p>
                </div>
              </a>
            </section>
          )}

          {similare.length > 0 && (
            <section aria-labelledby="sim-h">
              <div className="flex items-baseline justify-between mb-3">
                <h2 id="sim-h" className={H2}>Magazine similare</h2>
                <Link href="/toate-magazinele" className="text-sm font-bold text-[var(--accent-text)] hover:underline">Toate →</Link>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2.5">
                {similare.map(s => {
                  const numeSim = numeAfisat(s.magazin);
                  const pctSim  = maxPct(s.promotii);
                  return (
                    <a key={s.magazin} href={`/cod-reducere/${s.magazin}`}
                      className="group flex flex-col items-center gap-1.5 p-2 bg-[var(--surface)] rounded-xl border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors text-center">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-[#ffffff]">
                        {s.logo_url ? (
                          <Image src={s.logo_url} alt={numeSim} fill sizes="40px" className="object-contain p-0.5" unoptimized />
                        ) : (
                          <span className="text-base font-black text-[#14181c]">{numeSim.charAt(0)}</span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-[var(--text-soft)] leading-tight line-clamp-1 w-full">{numeSim}</span>
                      {pctSim > 0 ? (
                        <span className="text-[10px] font-black text-[var(--accent-text)]">-{pctSim}%</span>
                      ) : s.cod_cupon ? (
                        <span className="text-[10px] font-bold text-[var(--accent-text)]">Cod</span>
                      ) : s.are_promotie ? (
                        <span className="text-[10px] text-[var(--text-muted)]">Ofertă</span>
                      ) : null}
                    </a>
                  );
                })}
              </div>
            </section>
          )}

          {comparatii.length > 0 && (
            <section aria-labelledby="cmp-h">
              <div className="flex items-baseline justify-between mb-3">
                <h2 id="cmp-h" className={H2}>{nume} vs alte magazine</h2>
                <Link href="/comparatii" className="text-sm font-bold text-[var(--accent-text)] hover:underline">Toate →</Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {comparatii.map(c => (
                  <Link key={c.slug} href={`/comparații/${c.slug}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 bg-[var(--surface)] rounded-xl border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors">
                    <span className="text-sm font-bold text-[var(--text-soft)]">{c.label}</span>
                    <span className="text-xs font-semibold text-[var(--text-muted)] whitespace-nowrap">Compară →</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {descriere && descriere.paragrafe?.length > 0 && (
            <section className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 sm:p-6">
              <h2 className="text-lg font-black mb-3">{descriere.titlu}</h2>
              <div className="space-y-3 text-sm text-[var(--text-soft)] leading-relaxed">
                {descriere.paragrafe.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          )}

          <ReviewSection magazin={m.magazin} />
        </div>
      </div>

      <RedirectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        storeName={numeModal || nume}
        redirectFailed={redirectFailed}
        onRetry={retryRedirect}
      />
    </div>
  );
}
