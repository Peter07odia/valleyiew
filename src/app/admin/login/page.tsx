"use client"

import { useState } from "react"
import Image from "next/image"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { CLINIC_CONFIG } from "@/config/clinic"

export default function StaffLoginPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!CLINIC_CONFIG.staffAccess.enabled) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <Image
            src={CLINIC_CONFIG.logoSrc}
            alt={CLINIC_CONFIG.organizationName}
            width={368}
            height={369}
            className="mx-auto h-16 w-auto"
            priority
          />
          <h1 className="mt-5 text-2xl font-semibold text-secondary">
            Staff access is not configured
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Staff work emails, roles, and clinic permissions are to
            be confirmed before this dashboard is enabled.
          </p>
        </Card>
      </div>
    )
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const sb = getSupabaseBrowserClient()
    const { error } = await sb.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/admin`,
        // Staff accounts are pre-provisioned; don't create new users on login.
        shouldCreateUser: false,
      },
    })
    setLoading(false)
    if (error) {
      setError("Could not send the sign-in link. Check the email and try again.")
      return
    }
    setSent(true)
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm space-y-6 p-7">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/images/branding/vvm-logo.png"
            alt={CLINIC_CONFIG.organizationName}
            width={368}
            height={369}
            className="h-14 w-auto"
            priority
          />
          <h1 className="mt-3 text-xl font-semibold text-foreground">Staff sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            We&apos;ll email you a secure sign-in link.
          </p>
        </div>

        {sent ? (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center text-sm text-foreground">
            Check <b>{email}</b> for a sign-in link. You can close this tab after
            clicking it.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="staff@example.ca"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || !email}>
              {loading ? "Sending…" : "Send sign-in link"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
