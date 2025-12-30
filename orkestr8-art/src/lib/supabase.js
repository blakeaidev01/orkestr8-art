import { createClient } from "@supabase/supabase-js";

// NOTE:
// - `NEXT_PUBLIC_*` vars are exposed to the browser (fine for Supabase URL + anon key)
// - In practice people often name these as SUPABASE_URL / SUPABASE_ANON_KEY
// This helper supports both so the app doesn't hard-crash during `next build`.

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY ||
  "";

let _client = null;

export function getSupabaseClient() {
  if (_client) return _client;
  if (!supabaseUrl || !supabaseAnonKey) return null;
  _client = createClient(supabaseUrl, supabaseAnonKey);
  return _client;
}

// Kept for convenience; may be `null` if env vars aren't configured yet.
export const supabase = getSupabaseClient();
