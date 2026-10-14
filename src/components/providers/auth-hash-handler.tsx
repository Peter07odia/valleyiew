"use client"

import { useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

// Catches implicit-flow auth tokens that land in the URL hash
// (#access_token=...&refresh_token=...) on ANY page — e.g. admin-generated
// magic links that redirect to the site root instead of /auth/callback.
// Sets the session, strips the hash, and forwards to /admin. No-op otherwise.
export function AuthHashHandler() {
  useEffect(() => {
    if (typeof window === "undefined") return
    const hash = window.location.hash
    if (!hash.includes("access_token")) return

    const h = new URLSearchParams(hash.slice(1))
    const access_token = h.get("access_token")
    const refresh_token = h.get("refresh_token")
    if (!access_token || !refresh_token) return

    const sb = getSupabaseBrowserClient()
    void (async () => {
      const { error } = await sb.auth.setSession({ access_token, refresh_token })
      // Clean the tokens out of the URL regardless.
      window.history.replaceState(null, "", window.location.pathname)
      if (!error) window.location.replace("/admin")
    })()
  }, [])

  return null
}
