import { createClient, SupabaseClient } from "@supabase/supabase-js";

// URL-ul, cheia si tipul Review stau in lib/supabaseRest.ts (folosit si de browser, fara biblioteca).
import { SUPABASE_URL, SUPABASE_KEY, type Review } from "./supabaseRest";

export type { Review };

// Client creat lazy — nu aruncă eroare la build dacă KEY lipsește
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_KEY) return null;
  if (!_client) _client = createClient(SUPABASE_URL, SUPABASE_KEY);
  return _client;
}

