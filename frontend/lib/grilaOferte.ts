import { linkPromotie, type MagazinCuLink } from "./linkMagazin";
import { numeAfisat } from "./numeMagazin";
import { valoareOferta, type PromotieCupon } from "./oferta";
import { PRAG_URGENT } from "./expirarePromo";
import { oferteAcasa, numaraFiltre, filtreAfisate, alegeAfisate, procentAfisat, type FiltruAcasa, type OfertaAcasa } from "./oferteAcasa";

/**
 * Datele grilei de oferte (app/components/GrilaOferte.tsx), aceleasi pe prima pagina, pe categorii si pe nise:
 * o singura ordine (lib/oferteAcasa.ts: partenerii .ro cu link platit intai) si un singur card (CuponCard).
 * In browser ajung doar ofertele afisate, nu magazinele intregi. Se apeleaza pe server.
 */
export interface OfertaCard {
  cheie: string;
  cod: string;
  link: string;
  magazin: string;
  nume: string;
  logo?: string | null;
  promo: PromotieCupon;
}

export interface GrilaDate {
  oferte: Record<string, OfertaCard>;
  liste: Record<FiltruAcasa, string[]>;
  numere: Record<FiltruAcasa, number>;
  filtre: FiltruAcasa[];
}

export interface MagazinGrila extends MagazinCuLink {
  magazin: string;
  logo_url?: string | null;
  sales_number?: number | null;
  promotii?: (PromotieCupon & { landing_page?: string | null })[] | null;
}

export function poolOferte<M extends MagazinGrila>(magazine: readonly M[]): OfertaAcasa<M>[] {
  return oferteAcasa(magazine, linkPromotie, (p) => procentAfisat(valoareOferta(p as PromotieCupon).text));
}

export function grilaOferte<M extends MagazinGrila>(
  pool: readonly OfertaAcasa<M>[],
  { limita = 12, maxPeMagazinToate = 1, faraFiltre = ["oferta"] }: { limita?: number; maxPeMagazinToate?: number; faraFiltre?: FiltruAcasa[] } = {},
): GrilaDate {
  const numere = numaraFiltre(pool, PRAG_URGENT);
  const ramase: FiltruAcasa[] = filtreAfisate(numere).filter((f) => !faraFiltre.includes(f));
  // „Toate" singur n-ar filtra nimic.
  const filtre = ramase.length > 1 ? ramase : [];
  const liste = {} as Record<FiltruAcasa, string[]>;
  const oferte: Record<string, OfertaCard> = {};
  for (const f of ["toate", "cod", "oferta", "curand"] as FiltruAcasa[]) {
    const alese = f === "toate" || filtre.includes(f)
      ? alegeAfisate(pool, f, PRAG_URGENT, { limita, maxPerMagazin: f === "toate" ? maxPeMagazinToate : 2 })
      : [];
    liste[f] = alese.map((o) => o.cheie);
    for (const o of alese) {
      const p = o.promo as PromotieCupon;
      oferte[o.cheie] = {
        cheie: o.cheie, cod: o.cod, link: o.link, magazin: o.m.magazin, nume: numeAfisat(o.m.magazin), logo: o.m.logo_url,
        promo: { nume: p.nume, descriere: (p.descriere || "").slice(0, 240), cod_cupon: p.cod_cupon, zile_ramase: o.zile },
      };
    }
  }
  return { oferte, liste, numere, filtre };
}
