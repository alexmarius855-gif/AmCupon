"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Flame } from "lucide-react";
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
 */
export default function MagazinCard({ m, numeOverride, astazi }: { m: CardMagazin; numeOverride?: string; astazi?: string }) {
  const promo = m.promotii?.[0];
  const numeMagazin = numeOverride || numeAfisat(m.magazin);
  const initiala = numeMagazin.charAt(0).toUpperCase();
  const discount = promo ? (extractDiscount(promo.nume) || extractDiscount(promo.descriere)) : null;
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
    <div className="group bg-[#111827] rounded-xl border border-[#1e293b] hover:border-[#14b8a6]/40 shadow-sm hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden">
      <a href={`/cod-reducere/${m.magazin}`} className="flex items-start gap-3 pt-5 px-4 pb-3 relative">
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
          {m.exclusiv && (
            <span className="text-[10px] font-bold bg-[#0d9488] text-white px-2 py-0.5 rounded-full">Exclusiv</span>
          )}
          {showDealScore && (
            <span title="Scor calculat de AmCupon din reducere, cod, prospețime și exclusivitate"
              className="flex items-center gap-1 text-[10px] font-bold bg-[#1e293b] border border-[#14b8a6]/40 text-[#5eead4] px-2 py-0.5 rounded-full">
              <Flame className="w-3 h-3" /> {dealScore}
            </span>
          )}
        </div>
        <div className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center shrink-0 bg-[#ffffff] border border-[#1e293b] p-1.5 group-hover:border-[#14b8a6]/50 transition-colors">
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoSrc} alt={numeMagazin} className="w-full h-full object-contain" loading="lazy" decoding="async" onError={() => setLogoIdx((i) => i + 1)} />
          ) : (
            <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#14b8a6] to-[#0f766e] flex items-center justify-center">
              <span className="text-white font-black text-2xl">{initiala}</span>
            </div>
          )}
        </div>
        <div className="min-w-0 pt-1">
          <h3 className="font-black text-[#f1f5f9] text-base leading-tight group-hover:text-[#0d9488] transition-colors truncate">{numeMagazin}</h3>
          {m.categorie && (
            <span className="inline-block mt-1 text-[10px] font-semibold text-[#94a3b8] bg-[#1e293b] px-2 py-0.5 rounded-full truncate max-w-full">{m.categorie}</span>
          )}
        </div>
      </a>

      <div className="px-4 pb-3 flex-1">
        {promo ? (
          <div>
            <span className="text-xs font-bold text-[#0d9488] uppercase tracking-wide">
              {promo.cod_cupon ? "Cod reducere" : "Ofertă specială"}
              {discount && <span className="ml-1">{discount}</span>}
            </span>
            <p className="text-sm text-[#cbd5e1] mt-1 line-clamp-2">{promo.nume}</p>
            {promo.zile_ramase <= 3 && (
              <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-red-400">
                <Clock className="w-3.5 h-3.5" /> Expiră {promo.zile_ramase === 0 ? "azi" : `în ${promo.zile_ramase}z`}
              </span>
            )}
          </div>
        ) : (
          <p className="text-sm text-[#94a3b8]">Vizitează magazinul prin linkul nostru afiliat — comisionul nu îți crește prețul.</p>
        )}
      </div>

      <div className="px-4 pb-4">
        {promo?.cod_cupon ? (
          revealed ? (
            <div className="space-y-2">
              <div className="border-2 border-dashed border-[#14b8a6]/50 rounded-xl py-2 text-center bg-[#1e293b]">
                <span className="font-mono font-black text-[#0d9488] tracking-widest text-sm">{promo.cod_cupon}</span>
                <AnimatePresence>
                  {copiat && (
                    <motion.p
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                      className="text-xs text-emerald-400 mt-0.5"
                    >
                      ✓ Copiat!
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <a href={link} target="_blank" rel="sponsored noopener noreferrer"
                className="flex items-center justify-center w-full bg-gradient-to-r from-[#14b8a6] to-[#0d9488] hover:from-[#0d9488] hover:to-[#14b8a6] text-white font-bold py-2.5 rounded-xl text-sm transition-all">
                Mergi la {numeMagazin} →
              </a>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="border-2 border-dashed border-[#334155] rounded-xl py-2 text-center">
                <span className="font-mono text-[#94a3b8] text-sm">{maskCod(promo.cod_cupon)}</span>
              </div>
              <button onClick={onCopiazaClick}
                className="w-full bg-gradient-to-r from-[#14b8a6] to-[#0d9488] hover:from-[#0d9488] hover:to-[#14b8a6] text-white font-bold py-2.5 rounded-xl text-sm transition-all">
                Copiază codul
              </button>
            </div>
          )
        ) : promo ? (
          <a href={link} target="_blank" rel="sponsored noopener noreferrer"
            className="flex items-center justify-center w-full bg-gradient-to-r from-[#14b8a6] to-[#0d9488] hover:from-[#0d9488] hover:to-[#14b8a6] text-white font-bold py-2.5 rounded-xl text-sm transition-all">
            Vezi oferta →
          </a>
        ) : (
          <a href={affiliateLink} target="_blank" rel="sponsored noopener noreferrer"
            className="flex items-center justify-center w-full bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-[#f1f5f9] font-bold py-2.5 rounded-xl text-sm transition-colors">
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
