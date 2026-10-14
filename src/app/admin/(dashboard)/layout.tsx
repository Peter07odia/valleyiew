import { redirect } from "next/navigation"
import Image from "next/image"
import { LogOut } from "lucide-react"
import { getStaffProfile } from "@/lib/booking/staff"
import { CLINIC_CONFIG } from "@/config/clinic"

// Server-side role gate. The proxy already redirects anonymous users to login;
// this additionally ensures the logged-in user has an active staff profile.
export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!CLINIC_CONFIG.staffAccess.enabled) {
    redirect("/admin/login")
  }

  const profile = await getStaffProfile()
  if (!profile) {
    redirect("/admin/login")
  }

  const roleLabel = profile.role.replace("_", " ")

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src="/images/branding/vvm-logo.png"
              alt={CLINIC_CONFIG.organizationName}
              width={368}
              height={369}
              className="h-9 w-auto shrink-0"
              priority
            />
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-secondary">
                Valleyview Medical Centre
              </p>
              <p className="text-xs text-muted-foreground">Admin booking</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="hidden text-right sm:block">
              <p className="font-medium text-foreground">{profile.fullName ?? "Staff"}</p>
              <p className="capitalize text-muted-foreground">{roleLabel}</p>
            </div>
            <form action="/api/staff/logout" method="post">
              <button
                type="submit"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  )
}
