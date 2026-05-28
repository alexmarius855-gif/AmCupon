import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ktfoaqprezeqzoeuohnh.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

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
