"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

// Handles BOTH auth flows:
//  - PKCE / code flow:     /auth/callback?code=...        (normal email OTP)
//  - implicit / hash flow: /auth/callback#access_token=... (admin-generated link)
// Sets the session client-side, then redirects to `next` (default /admin).
function CallbackInner() {
  const router = useRouter()
  const params = useSearchParams()
  const [message, setMessage] = useState("Signing you in…")

  useEffect(() => {
    const sb = getSupabaseBrowserClient()
    const next = params.get("next") ?? "/admin"

    async function run() {
      const code = params.get("code")
      const tokenHash = params.get("token_hash")
      const type = params.get("type")
      const hash = typeof window !== "undefined" ? window.location.hash : ""

      // token_hash flow (device-independent — no browser verifier needed).
      // This is what Supabase magic links use when the email template sends
      // token_hash. Works even if the link is opened on a different device.
      if (tokenHash && type) {
        const { error } = await sb.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as "magiclink" | "email" | "recovery" | "invite" | "signup",
        })
        if (!error) {
          window.location.replace(next)
          return
        }
      }

      // Implicit flow: tokens in the URL hash.
      if (hash.includes("access_token")) {
        const h = new URLSearchParams(hash.slice(1))
        const access_token = h.get("access_token")
        const refresh_token = h.get("refresh_token")
        if (access_token && refresh_token) {
          const { error } = await sb.auth.setSession({ access_token, refresh_token })
          if (!error) {
            window.location.replace(next)
            return
          }
        }
      }

      // PKCE flow: ?code=... (same-browser; verifier in localStorage).
      if (code) {
        const { error } = await sb.auth.exchangeCodeForSession(code)
        if (!error) {
          window.location.replace(next)
          return
        }
      }

      setMessage("That sign-in link was invalid or expired. Redirecting…")
      setTimeout(() => router.replace("/admin/login?error=auth"), 1500)
    }

    run()
  }, [params, router])

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackInner />
    </Suspense>
  )
}
