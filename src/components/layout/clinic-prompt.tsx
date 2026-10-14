"use client"

import { usePathname } from "next/navigation"
import { Check, MapPin } from "lucide-react"

import { usePreferredLocation } from "@/components/providers/preferred-location-provider"
import { CLINIC_LOCATIONS, REGIONS } from "@/config/clinic"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// Intake and staff pages have their own clinic handling; never interrupt them.
const SKIP_PATHS = ["/admin", "/new-patient-form", "/registration-reports", "/auth"]

/**
 * Clinic chooser. Visitors without a saved clinic must pick one before using
 * the site; afterwards it reopens (closable) from any "Change clinic" control.
 */
export function ClinicPrompt() {
  const pathname = usePathname()
  const {
    preferredLocation,
    hasHydrated,
    setPreferredLocation,
    isPickerOpen,
    closeLocationPicker,
  } = usePreferredLocation()

  const required =
    hasHydrated &&
    !preferredLocation &&
    !SKIP_PATHS.some(path => pathname?.startsWith(path))
  const open = required || (hasHydrated && isPickerOpen)

  function choose(slug: string) {
    setPreferredLocation(slug)
    closeLocationPicker()
  }

  return (
    <Dialog open={open} onOpenChange={next => !next && !required && closeLocationPicker()}>
      <DialogContent
        showCloseButton={!required}
        onEscapeKeyDown={event => required && event.preventDefault()}
        onInteractOutside={event => required && event.preventDefault()}
        className="max-h-[calc(100dvh-1.5rem)] gap-3 overflow-y-auto rounded-none p-4 sm:max-w-2xl sm:gap-4 sm:p-6"
      >
        <DialogHeader className="gap-1 pr-6">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary sm:text-xs">
            Welcome to Valleyview Medical Centre
          </p>
          <DialogTitle className="font-serif text-2xl font-medium tracking-[-0.03em] text-secondary sm:text-3xl">
            Choose your clinic
          </DialogTitle>
          <DialogDescription className="text-xs leading-5 sm:text-sm">
            We&apos;ll show that clinic&apos;s address, hours, doctors and booking. You can change it any time.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {REGIONS.map(region => (
            <section key={region.id} aria-labelledby={`prompt-${region.id}`}>
              <h3
                id={`prompt-${region.id}`}
                className="mb-1.5 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-muted-foreground"
              >
                {region.name}
              </h3>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {CLINIC_LOCATIONS.filter(l => l.region === region.id).map(l => {
                  const selected = preferredLocation?.slug === l.slug
                  return (
                    <button
                      key={l.slug}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => choose(l.slug)}
                      className={cn(
                        "flex min-w-0 items-center gap-2.5 border px-3 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-primary",
                        selected
                          ? "border-primary bg-primary/10"
                          : "border-secondary/15 hover:border-primary hover:bg-primary/5",
                      )}
                    >
                      {selected ? (
                        <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
                      ) : (
                        <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
                      )}
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-secondary">{l.shortName}</span>
                        <span className="block truncate text-[0.7rem] leading-4 text-muted-foreground">
                          {l.address}, {l.city}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
