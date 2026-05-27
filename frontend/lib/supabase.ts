import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://ktfoaqprezeqzoeuohnh.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(url, key);

export interface Review {
  id: number;
  magazin: string;
  nume: string;
  stele: number;
  text: string;
  created_at: string;
}
