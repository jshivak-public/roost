import { createClient } from '@supabase/supabase-js'
// This client is deliberately not used by the demo repository. Enable a server-backed repository only after RLS and auth are deployed.
export function createSupabaseClient() {
  const url = import.meta.env.VITE_SUPABASE_URL, key = import.meta.env.VITE_SUPABASE_ANON_KEY
  return url && key ? createClient(url, key) : null
}
