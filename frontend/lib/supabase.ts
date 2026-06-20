import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ktfoaqprezeqzoeuohnh.supabase.co";
// Cheia anon e publica prin design (protectia reala vine din RLS pe tabele) —
// fallback hardcodat la fel ca URL-ul, ca sa nu depinda de Vercel env var.
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Zm9hcXByZXplcXpvZXVvaG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MTA2MjgsImV4cCI6MjA5NTQ4NjYyOH0.yLIxtP-1HPCYsQ1-RoLUpDhzkFqZDpu5CJywisjTh0c";

// Client creat lazy — nu aruncă eroare la build dacă KEY lipsește
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_KEY) return null;
  if (!_client) _client = createClient(SUPABASE_URL, SUPABASE_KEY);
  return _client;
}

// Backward-compat — folosit în ReviewSection
export const supabase = SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

export interface Review {
  id: number;
  magazin: string;
  nume: string;
  stele: number;
  text: string;
  created_at: string;
}
