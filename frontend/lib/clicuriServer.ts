import fs from "fs";
import path from "path";
import { getSupabase } from "./supabase";
import { brandDomeniu } from "./numeMagazin";
import { aceeasiTara } from "./taraDomeniu";
import {
  construiesteIndex, esteBot, hostReferrer, magazinDinLink, tipDispozitiv,
  type IndexLinkuri, type MagazinPentruClick,
} from "./clicuri";

/**
 * Partea de SERVER a numaratorii de clicuri (vezi `lib/clicuri.ts` pentru motiv si pentru ce NU stocam).
 * Folosita de `/api/click` (clicuri pe site) si de `/go/[magazin]` (linkuri din newsletter/social).
 */

const AJ = { brand: brandDomeniu, aceeasiTara };

let _idx: IndexLinkuri | null = null;
function index(): IndexLinkuri {
  if (_idx) return _idx;
  try {
    const p = path.join(process.cwd(), "public", "output.json");
    const magazine = JSON.parse(fs.readFileSync(p, "utf-8")) as MagazinPentruClick[];
    _idx = construiesteIndex(magazine, AJ);
  } catch {
    _idx = { dupaCale: new Map(), dupaBrand: new Map(), slugs: new Set() };
  }
  return _idx;
}

export interface ClickDeInregistrat {
  sursa: "site" | "go";
  pagina: string;
  userAgent: string | null;
  referrer: string | null;
  /** Linkul pe care s-a dat clicul — de aici se deduce magazinul cand nu e cunoscut. */
  href?: string;
  /** Magazinul indicat: ruta `/go` il stie din adresa; clientul il trimite la dezvaluirea unui cod.
   *  Se accepta doar daca exista in output.json (vezi `magazinDinLink`). */
  magazin?: string;
}

/** Nu arunca niciodata: numaratoarea nu are voie sa strice un link sau un raspuns. */
export async function inregistreazaClick(c: ClickDeInregistrat): Promise<void> {
  try {
    const sb = getSupabase();
    if (!sb) return;
    const magazin = magazinDinLink(c.href || "", c.pagina, index(), AJ, c.magazin);
    const { error } = await sb.rpc("inregistreaza_click", {
      p_magazin: magazin,
      p_pagina: c.pagina,
      p_sursa: c.sursa,
      p_referrer: hostReferrer(c.referrer),
      p_dispozitiv: tipDispozitiv(c.userAgent),
      p_bot: esteBot(c.userAgent),
    });
    if (error) console.error("[click] inregistrare esuata:", error.message);
  } catch {
    /* nimic */
  }
}
