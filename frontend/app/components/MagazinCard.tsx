"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Flame, Truck, Heart, Copy } from "lucide-react";
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

/** Nume afisabil dintr-un slug de domeniu. Exportat ca sa fie o singura sursa
 *  (paginile de categorie il refolosesc — altfel s-ar duplica si NUME_OVERRIDE). */
export function numeAfisat(magazin: string): string {
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
  // Doua litere, ca in referinta (NO, FA, DR): initialele primelor doua cuvinte daca
  // numele are doua ("Click & Grow" -> CG), altfel primele doua litere ("Notino" -> NO).
  const initialeDouble = (() => {
    const cuvinte = numeMagazin.trim().split(/\s+/).filter(w => /[a-z0-9]/i.test(w));
    if (cuvinte.length >= 2) return (cuvinte[0][0] + cuvinte[1][0]).toUpperCase();
    return numeMagazin.slice(0, 2).toUpperCase();
  })();
  const discount = promo ? (extractDiscount(promo.nume) || extractDiscount(promo.descriere)) : null;
  const transportGratuit = areTransportGratuit(promo);
  const [revealed, setRevealed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { copiedKey, redirectFailed, copyAndOpen, retryRedirect } = useCopyCod();
  const copiat = copiedKey === m.magazin;

  const domeniu = (m.magazin || "").match(/[a-z0-9-]+\.[a-z]{2,}(?:\.[a-z]{2,})?/i)?.[0] || null;
  const logoSurse = [
    m.logo_url,
    domeniu ? `https://www.google.com/s2/favicons?domain=${domeniu}&sz=128` : null,
    // DuckDuckGo ca al treilea pas: din 58 de logo-uri rupte masurate pe date
    // reale, 43 erau deja favicon Google mort (deci pasul 2 nu ajuta), iar
    // DuckDuckGo recupereaza 33 dintre ele. Restul cad pe initiale, corect.
    domeniu ? `https://icons.duckduckgo.com/ip3/${domeniu}.ico` : null,
  ].filter(Boolean) as string[];
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
        <div className="h-0.5 w-full bg-gradient-to-r from-[#c3dd2c] via-[#ddf93c] to-[#ecff7a]" />
      )}

      {/* ── Antet: identitate magazin ──────────────────────────────────────
          Structura urmeaza referinta: avatar rotund + nume + domeniu dedesubt,
          discret. Logo-ul REAL are prioritate (recunoasterea brandului conteaza);
          initiala e doar fallback. Inainte fallback-ul era initiala ALBA pe fundal
          lime — ilizibil dupa schimbarea temei, pentru ca fundalul si textul stau
          pe elemente DIFERITE, iar migrarea automata cauta perechea in acelasi
          className. Acum e text inchis pe lime, verificat. */}
      <a href={`/cod-reducere/${m.magazin}`} className="flex items-start gap-3 pt-4 px-4 pb-3 relative">
        <div className="relative w-11 h-11 rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-[#ffffff] ring-1 ring-[#2a2f36]/60 group-hover:ring-[#ddf93c]/60 transition-all">
          {logoSrc ? (
            <Image src={logoSrc} alt={numeMagazin} fill sizes="44px" className="object-contain p-1.5" onError={() => setLogoIdx((i) => i + 1)} unoptimized />
          ) : (
            <div className="w-full h-full bg-[#ddf93c] flex items-center justify-center">
              <span className="text-[#0c1000] font-black text-sm tracking-tight">{initialeDouble}</span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-[#ffffff] text-[15px] leading-tight group-hover:text-[#ddf93c] transition-colors truncate">{numeMagazin}</h3>
              <p className="text-[11px] text-[#6b7178] truncate mt-0.5">{m.magazin}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {showDealScore && (
                <span title="Scor calculat de AmCupon din reducere, cod, prospețime și exclusivitate"
                  className="flex items-center gap-1 text-[10px] font-bold bg-[#ddf93c]/12 border border-[#ddf93c]/30 text-[#ddf93c] px-2 py-0.5 rounded-full">
                  <Flame className="w-3 h-3" /> {dealScore}
                </span>
              )}
              {onToggleFavorit && (
                <button onClick={e => { e.preventDefault(); e.stopPropagation(); onToggleFavorit(m.magazin, e); }}
                  className="p-1 rounded-full hover:bg-[#1f2329] transition-colors"
                  title={isFavorit ? "Elimina din favorite" : "Adauga la favorite"} aria-label="Favorite">
                  <Heart className={`w-4 h-4 transition-colors ${isFavorit ? "fill-red-500 stroke-red-500" : "fill-none stroke-[#3a4048] hover:stroke-red-400"}`} strokeWidth={2} />
                </button>
              )}
            </div>
          </div>
        </div>
      </a>

      {/* ── Corp: reducerea e eroul cardului, ca in referinta ─────────────── */}
      <div className="px-4 pb-3 flex-1">
        {promo ? (
          <div>
            {/* Procentul URIAS, lime plin (nu gradient-text — se citeste mai bine).
                Afisat DOAR cand exista un procent real parsat din titlul promotiei. */}
            {discount && (
              <div className="text-[2.5rem] leading-[1.05] font-black text-[#ddf93c] tracking-tight mb-1">
                -{discount}
              </div>
            )}
            <p className={`font-bold text-[#ffffff] leading-snug line-clamp-2 ${discount ? "text-[15px]" : "text-base"}`}>
              {promo.nume}
            </p>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {m.categorie && (
                <span className="text-[10px] font-semibold text-[#9399a0] bg-[#1f2329] px-2 py-0.5 rounded-full truncate max-w-[9rem]">{m.categorie}</span>
              )}
              {m.exclusiv && (
                <span className="text-[10px] font-bold bg-[#ddf93c] text-[#0c1000] px-2 py-0.5 rounded-full shrink-0">Exclusiv</span>
              )}
              {transportGratuit && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-[#ddf93c] bg-[#ddf93c]/10 border border-[#ddf93c]/25 px-2 py-0.5 rounded-full shrink-0">
                  <Truck className="w-3 h-3" /> Transport gratuit
                </span>
              )}
              {promo.zile_ramase <= 3 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#e64343] bg-[#e64343]/10 border border-[#e64343]/25 px-2 py-0.5 rounded-full">
                  <Clock className="w-3 h-3" /> Expiră {promo.zile_ramase === 0 ? "azi" : `în ${promo.zile_ramase}z`}
                </span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#9399a0] leading-snug">Vizitează magazinul prin linkul nostru afiliat — comisionul nu îți crește prețul.</p>
        )}
      </div>

      <div className="px-4 pb-4">
        {promo?.cod_cupon ? (
          revealed ? (
            <div className="space-y-2">
              <div className="relative border border-dashed border-[#ddf93c]/60 rounded-xl py-2.5 text-center bg-[#ddf93c]/10">
                <span className="font-mono font-black text-[#ecff7a] tracking-[0.2em] text-sm">{promo.cod_cupon}</span>
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
                className="flex items-center justify-center w-full bg-gradient-to-r from-[#ddf93c] to-[#ddf93c] hover:from-[#ecff7a] hover:to-[#ddf93c] text-[#0c1000] hover:text-[#0c1000] font-bold py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-[#ddf93c]/20">
                Mergi la {numeMagazin} →
              </a>
            </div>
          ) : (
            /* Codul si actiunea pe ACELASI rand, in caseta punctata — tiparul din
               referinta. Un singur click: dezvaluie codul, il copiaza si deschide
               magazinul (useCopyCod pastreaza copy+open sincrone, altfel browserul
               blocheaza popup-ul). */
            <button onClick={onCopiazaClick}
              className="w-full flex items-center justify-between gap-2 border border-dashed border-[#ddf93c]/50 hover:border-[#ddf93c] rounded-xl pl-3.5 pr-2 py-2 bg-[#ddf93c]/[0.06] hover:bg-[#ddf93c]/10 transition-all active:scale-[0.99] group/cod">
              <span className="font-mono font-bold text-[#ddf93c] tracking-[0.15em] text-sm truncate">
                {maskCod(promo.cod_cupon)}
              </span>
              <span className="flex items-center gap-1.5 shrink-0 text-[11px] font-black uppercase tracking-wider text-[#0c1000] bg-[#ddf93c] group-hover/cod:bg-[#ecff7a] px-2.5 py-1.5 rounded-lg transition-colors">
                <Copy className="w-3 h-3" /> Copiază
              </span>
            </button>
          )
        ) : promo ? (
          <a href={link} target="_blank" rel="sponsored noopener noreferrer"
            className="flex items-center justify-center w-full bg-gradient-to-r from-[#ddf93c] to-[#ddf93c] hover:from-[#ecff7a] hover:to-[#ddf93c] text-[#0c1000] hover:text-[#0c1000] font-bold py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-[#ddf93c]/20">
            Vezi oferta →
          </a>
        ) : (
          <a href={affiliateLink} target="_blank" rel="sponsored noopener noreferrer"
            className="flex items-center justify-center w-full bg-[#1f2329]/80 hover:bg-[#2a2f36] border border-[#2a2f36] hover:border-[#ddf93c]/50 text-[#c9ced5] hover:text-[#ffffff] font-bold py-2.5 rounded-xl text-sm transition-all">
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
