import fs from "fs";
import path from "path";
import { temaArticol } from "./topFeed";

/**
 * Legaturile interne spre paginile /top — DOAR pe server (04.11.2026).
 *
 * Cele 30 de pagini /top aduc clicuri din cautari, dar nicio pagina din site nu ducea la ele: meniul trimite
 * la /top-reduceri, alta pagina. Le stia doar sitemap-ul, iar Search Console le arata „Google nu cunoaste
 * adresa URL" sau „Descoperita, nu este indexata". Acum duc spre ele prima pagina (cea mai citita de Google),
 * subsolul si ghidurile cu aceeasi tema.
 */
export interface TemaTop {
  slug: string;
  titlu: string;
}

export interface GhidTema {
  slug: string;
  title: string;
}

function citeste<T>(fisier: string, rezerva: T): T {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", fisier), "utf-8")) as T;
  } catch {
    return rezerva;
  }
}

let _topuri: TemaTop[] | null = null;

/** Toate topurile, cu titlul lor („Cele mai bune televizoare 2026"). Fara fisier, lista e goala. */
export function topuri(): TemaTop[] {
  if (!_topuri) {
    const d = citeste<{ categorii?: { slug: string; titlu: string }[] }>("top-produse.json", {});
    _topuri = (d.categorii || []).map((c) => ({ slug: c.slug, titlu: c.titlu }));
  }
  return _topuri;
}

/** Topul unei teme din articole (lib/topFeed.ts), sau null: unele teme exista doar sub articole. */
export function topPentruTema(tema: string): TemaTop | null {
  return topuri().find((t) => t.slug === tema) || null;
}

let _ghiduri: Map<string, GhidTema[]> | null = null;

/** Articolele „Cel mai bun X" cu aceeasi tema ca topul, ca sa duca unele spre altele. */
export function ghiduriPentruTema(tema: string): GhidTema[] {
  if (!_ghiduri) {
    _ghiduri = new Map();
    for (const p of citeste<{ slug: string; title: string }[]>("blog-posts.json", [])) {
      const t = temaArticol(p.slug);
      if (!t) continue;
      const lista = _ghiduri.get(t.tema) || [];
      lista.push({ slug: p.slug, title: p.title });
      _ghiduri.set(t.tema, lista);
    }
  }
  return _ghiduri.get(tema) || [];
}
