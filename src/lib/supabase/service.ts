import "server-only"
import { createClient } from "@supabase/supabase-js"

// Service-role client. Bypasses RLS. NEVER import from a client component.
// Used only inside route handlers for slot/booking/patient mutations.
export function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing Supabase service env vars")
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
