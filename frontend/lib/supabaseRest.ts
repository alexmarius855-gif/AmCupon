/**
 * Recenziile, fara @supabase/supabase-js in browser (27.09.2026).
 *
 * Biblioteca intreaga — cu autentificare si realtime, pe care nu le folosim — intra pe FIECARE
 * pagina de magazin: 70 KiB transfer, 259 KiB de JavaScript de parsat (Lighthouse, 27.09), pentru
 * o citire si o inserare. Aici sunt aceleasi doua operatii, ca cereri HTTP catre acelasi API
 * (PostgREST). Protectia reala ramane pe server, in RLS: anonimul citeste doar `aprobat=true` si
 * insereaza doar cu `aprobat=false` (moderare manuala in Supabase).
 *
 * Citirea ramane la fiecare afisare a paginii de magazin, ca inainte: e si activitatea care tine
 * proiectul gratuit sa nu se puna singur pe pauza (s-a intamplat de 4 ori).
 * Serverul (app/api/vote) foloseste in continuare clientul complet din lib/supabase.ts.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ktfoaqprezeqzoeuohnh.supabase.co";
// Cheia anon e publica prin design (protectia reala vine din RLS pe tabele) —
// fallback hardcodat la fel ca URL-ul, ca sa nu depinda de Vercel env var.
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Zm9hcXByZXplcXpvZXVvaG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MTA2MjgsImV4cCI6MjA5NTQ4NjYyOH0.yLIxtP-1HPCYsQ1-RoLUpDhzkFqZDpu5CJywisjTh0c";

export interface Review {
  id: number;
  magazin: string;
  nume: string;
  stele: number;
  text: string;
  created_at: string;
}

const antet = () => ({ apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` });

/** Ultimele 20 de recenzii aprobate ale magazinului; [] la orice eroare (sectiunea ramane goala). */
export async function citesteRecenzii(magazin: string): Promise<Review[]> {
  const q = new URLSearchParams({
    select: "id,magazin,nume,stele,text,created_at",
    magazin: `eq.${magazin}`,
    aprobat: "eq.true",
    order: "created_at.desc",
    limit: "20",
  });
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/reviews?${q}`, { headers: antet() });
    return r.ok ? ((await r.json()) as Review[]) : [];
  } catch {
    return [];
  }
}

/** Trimite o recenzie spre moderare. `true` doar daca serverul a acceptat-o. */
export async function trimiteRecenzie(rec: { magazin: string; nume: string; stele: number; text: string }): Promise<boolean> {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/reviews`, {
      method: "POST",
      // return=minimal: RLS nu da anonimului voie sa citeasca randul abia inserat (nu e aprobat).
      headers: { ...antet(), "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ ...rec, aprobat: false }),
    });
    return r.ok;
  } catch {
    return false;
  }
}
