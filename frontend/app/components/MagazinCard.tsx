"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Flame, Truck, Heart } from "lucide-react";
import { useCopyCod } from "../hooks/useCopyCod";
import RedirectModal from "./RedirectModal";
import { calculateDealScore, DEAL_SCORE_VISIBLE_THRESHOLD } from "../../lib/dealScore";

export interface CardPromotie {
  nume: string;
  descriere?: string;
  cod_cupon: string;
  landing_page?: string;
  zile_ramase: number;
}

export interface CardMagazin {
  magazin: string;
  url: string;
  url_afiliat: string;
  logo_url?: string;
  categorie: string;
  categorie_slug?: string;
  are_promotie: boolean;
  cod_cupon: boolean;
  promotii: CardPromotie[];
  exclusiv?: boolean;
  scor_final?: number;
  ultima_verificare?: string;
}

// Domenii fara cratima ale caror slug-uri dau nume ilizibile prin derivare automata
// (ex: "clickandgrow.com" -> "Clickandgrow" in loc de "Click & Grow")
const NUME_OVERRIDE: Record<string, string> = {
  "clickandgrow.com": "Click & Grow",
  "trampolinepartsandsupply.com": "Trampoline Parts & Supply",
  "silverrushstyle.com": "Silver Rush Style",
  "airserbia.com": "Air Serbia",
  "carmellimo.com": "Carmel Limo",
};

function numeAfisat(magazin: string): string {
  if (NUME_OVERRIDE[magazin]) return NUME_OVERRIDE[magazin];
  return magazin.split(".")[0].replace(/-/g, " ")
    .split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function extractDiscount(text?: string): string | null {
  if (!text) return null;
  const m = text.match(/(\d+)\s*%/);
  return m ? m[1] + "%" : null;
}

// Detectat din textul REAL al promotiei (nume/descriere) — nu presupunem niciodata
// transport gratuit fara mentiune explicita in date.
function areTransportGratuit(promo?: CardPromotie): boolean {
  if (!promo) return false;
  const text = `${promo.nume} ${promo.descriere || ""}`.toLowerCase();
  return /transport gratuit|livrare gratuit[aă]|free shipping/.test(text);
}

function maskCod(cod: string): string {
  if (!cod || cod.length <= 4) return cod;
  return cod.slice(0, 4) + "*".repeat(Math.max(0, Math.min(cod.length - 4, 6)));
}

/**
 * Card de magazin reutilizabil — logo cu fallback in cascada (logo_url -> favicon
 * Google al domeniului -> tile cu initiala), badge de categorie, stare promotie/fara
 * promotie, buton CTA unic. Foloseste DOAR date reale din output.json (fara
 * pro/contra inventate per magazin — vezi paginile curate gen /vpn pentru
 * comparatii editoriale scrise de mana, cu informatii verificate).
 *
 * `astazi` (opțional, "YYYY-MM-DD"): activeaza bonusul de prospetime in Deal Score.
 * Fara el, scorul se calculeaza normal, doar fara acel bonus (nu presupunem "azi").
 *
 * `isFavorit`/`onToggleFavorit` (opționale): activeaza inima de favorite in colt (folosit
 * pe homepage). Fara ele, inima nu se randeaza — restul consumatorilor (toate-magazinele,
 * categorii etc) raman neschimbati.
 */
export default function MagazinCard({ m, numeOverride, astazi, isFavorit, onToggleFavorit }: {
  m: CardMagazin; numeOverride?: string; astazi?: string;
  isFavorit?: boolean; onToggleFavorit?: (slug: string, e: React.MouseEvent) => void;
}) {
  const promo = m.promotii?.[0];
  const numeMagazin = numeOverride || numeAfisat(m.magazin);
  const initiala = numeMagazin.charAt(0).toUpperCase();
  const discount = promo ? (extractDiscount(promo.nume) || extractDiscount(promo.descriere)) : null;
  const transportGratuit = areTransportGratuit(promo);
  const [revealed, setRevealed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { copiedKey, redirectFailed, copyAndOpen, retryRedirect } = useCopyCod();
  const copiat = copiedKey === m.magazin;

  const domeniu = (m.magazin || "").match(/[a-z0-9-]+\.[a-z]{2,}(?:\.[a-z]{2,})?/i)?.[0] || null;
  const logoSurse = [m.logo_url, domeniu ? `https://www.google.com/s2/favicons?domain=${domeniu}&sz=128` : null].filter(Boolean) as string[];
  const [logoIdx, setLogoIdx] = useState(0);
  const logoSrc = logoSurse[logoIdx];

  const isValidAffiliateUrl = (url: string) => !!url && !url.includes("/NA6?") && !url.includes("/NA6&");
  const affiliateLink = isValidAffiliateUrl(m.url_afiliat) ? m.url_afiliat : m.url;
  const link = promo?.landing_page || affiliateLink;

  const dealScore = calculateDealScore(m, astazi);
  const showDealScore = dealScore >= DEAL_SCORE_VISIBLE_THRESHOLD;

  function onCopiazaClick() {
    if (!promo?.cod_cupon) return;
    setRevealed(true);
    copyAndOpen(m.magazin, promo.cod_cupon, link, m.magazin);
    setModalOpen(true);
  }

  return (
    <div className="group glass elevate elevate-hover rounded-xl hover:-translate-y-1 transition-all duration-200 flex flex-col overflow-hidden">
      {/* Banda de accent — semnal vizual instant ca are ceva activ, nu doar decor */}
      {promo && (
        <div className="h-0.5 w-full bg-gradient-to-r from-[#0f766e] via-[#14b8a6] to-[#5eead4]" />
      )}

      <a href={`/cod-reducere/${m.magazin}`} className="flex items-start gap-3 pt-4 px-4 pb-3 relative">
        <div className="relative w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center shrink-0 bg-[#ffffff] p-1.5 ring-1 ring-[#334155]/60 group-hover:ring-[#14b8a6]/60 transition-all">
          {logoSrc ? (
            <Image src={logoSrc} alt={numeMagazin} fill sizes="56px" className="object-contain p-1.5" onError={() => setLogoIdx((i) => i + 1)} unoptimized />
          ) : (
            <div className="w-full h-full rounded-lg bg-gradient-to-br from-[#14b8a6] to-[#0f766e] flex items-center justify-center">
              <span className="text-white font-black text-2xl">{initiala}</span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-black text-[#f1f5f9] text-base leading-tight group-hover:text-[#5eead4] transition-colors truncate">{numeMagazin}</h3>
            {onToggleFavorit && (
              <button onClick={e => { e.preventDefault(); e.stopPropagation(); onToggleFavorit(m.magazin, e); }}
                className="shrink-0 p-1 rounded-full hover:bg-[#1e293b] transition-colors"
                title={isFavorit ? "Elimina din favorite" : "Adauga la favorite"} aria-label="Favorite">
                <Heart className={`w-4 h-4 transition-colors ${isFavorit ? "fill-red-500 stroke-red-500" : "fill-none stroke-[#475569] hover:stroke-red-400"}`} strokeWidth={2} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {m.categorie && (
              <span className="text-[10px] font-semibold text-[#94a3b8] bg-[#1e293b]/80 px-2 py-0.5 rounded-full truncate max-w-[9rem]">{m.categorie}</span>
            )}
            {m.exclusiv && (
              <span className="text-[10px] font-bold bg-[#0d9488] text-white px-2 py-0.5 rounded-full shrink-0">Exclusiv</span>
            )}
            {transportGratuit && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-[#5eead4] bg-[#14b8a6]/10 border border-[#14b8a6]/30 px-2 py-0.5 rounded-full shrink-0">
                <Truck className="w-3 h-3" /> Transport gratuit
              </span>
            )}
            {showDealScore && (
              <span title="Scor calculat de AmCupon din reducere, cod, prospețime și exclusivitate"
                className="flex items-center gap-1 text-[10px] font-bold bg-[#14b8a6]/10 border border-[#14b8a6]/40 text-[#5eead4] px-1.5 py-0.5 rounded-full shrink-0">
                <Flame className="w-3 h-3" /> {dealScore}
              </span>
            )}
          </div>
        </div>

        {/* Reducerea = ancora vizuala a cardului. Doar cand exista un procent REAL
            parsat din titlul promotiei — niciodata inventat sau rotunjit optimist. */}
        {discount && (
          <div className="shrink-0 text-right leading-none">
            <div className="text-2xl font-black bg-gradient-to-br from-[#5eead4] to-[#14b8a6] bg-clip-text text-transparent">
              -{discount}
            </div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-[#94a3b8] mt-0.5">reducere</div>
          </div>
        )}
      </a>

      <div className="px-4 pb-3 flex-1">
        {promo ? (
          <div>
            <span className="text-[10px] font-bold text-[#0d9488] uppercase tracking-widest">
              {promo.cod_cupon ? "Cod reducere" : "Ofertă specială"}
            </span>
            <p className="text-sm text-[#cbd5e1] mt-1 line-clamp-2 leading-snug">{promo.nume}</p>
            {promo.zile_ramase <= 3 && (
              <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-bold text-red-400 bg-red-500/10 border border-red-500/25 px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3" /> Expiră {promo.zile_ramase === 0 ? "azi" : `în ${promo.zile_ramase}z`}
              </span>
            )}
          </div>
        ) : (
          <p className="text-sm text-[#94a3b8] leading-snug">Vizitează magazinul prin linkul nostru afiliat — comisionul nu îți crește prețul.</p>
        )}
      </div>

      <div className="px-4 pb-4">
        {promo?.cod_cupon ? (
          revealed ? (
            <div className="space-y-2">
              <div className="relative border border-dashed border-[#14b8a6]/60 rounded-xl py-2.5 text-center bg-[#14b8a6]/10">
                <span className="font-mono font-black text-[#5eead4] tracking-[0.2em] text-sm">{promo.cod_cupon}</span>
                <AnimatePresence>
                  {copiat && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      className="text-[11px] font-bold text-emerald-400 mt-0.5"
                    >
                      ✓ Copiat!
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <a href={link} target="_blank" rel="sponsored noopener noreferrer"
                className="flex items-center justify-center w-full bg-gradient-to-r from-[#14b8a6] to-[#0d9488] hover:from-[#5eead4] hover:to-[#14b8a6] text-white hover:text-[#052e2b] font-bold py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-[#14b8a6]/20">
                Mergi la {numeMagazin} →
              </a>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="border border-dashed border-[#334155] rounded-xl py-2.5 text-center bg-[#0a0f1a]/40">
                <span className="font-mono text-[#94a3b8] tracking-[0.2em] text-sm">{maskCod(promo.cod_cupon)}</span>
              </div>
              <button onClick={onCopiazaClick}
                className="w-full bg-gradient-to-r from-[#14b8a6] to-[#0d9488] hover:from-[#5eead4] hover:to-[#14b8a6] text-white hover:text-[#052e2b] font-bold py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-[#14b8a6]/20 active:scale-[0.98]">
                Copiază codul
              </button>
            </div>
          )
        ) : promo ? (
          <a href={link} target="_blank" rel="sponsored noopener noreferrer"
            className="flex items-center justify-center w-full bg-gradient-to-r from-[#14b8a6] to-[#0d9488] hover:from-[#5eead4] hover:to-[#14b8a6] text-white hover:text-[#052e2b] font-bold py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-[#14b8a6]/20">
            Vezi oferta →
          </a>
        ) : (
          <a href={affiliateLink} target="_blank" rel="sponsored noopener noreferrer"
            className="flex items-center justify-center w-full bg-[#1e293b]/80 hover:bg-[#334155] border border-[#334155] hover:border-[#14b8a6]/50 text-[#cbd5e1] hover:text-[#f1f5f9] font-bold py-2.5 rounded-xl text-sm transition-all">
            Mergi la {numeMagazin} →
          </a>
        )}
      </div>

      <RedirectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        storeName={numeMagazin}
        redirectFailed={redirectFailed}
        onRetry={retryRedirect}
      />
    </div>
  );
}
