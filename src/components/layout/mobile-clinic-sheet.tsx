"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { X } from "lucide-react"

import { usePreferredLocation } from "@/components/providers/preferred-location-provider"
import { CLINIC_LOCATIONS, REGIONS } from "@/config/clinic"
import { clinicSlugForPath } from "@/lib/clinic-path"
import { SKIP_PATHS, useIsDesktop } from "./clinic-switcher"

const SHOWN_KEY = "vvm-mobile-clinic-sheet-shown"
const SCROLL_TRIGGER_PX = 80

/** Single-clinic cities show the city ("Whitby"); shared cities show the branch ("Lynden Rd"). */
function label(location: (typeof CLINIC_LOCATIONS)[number]) {
  const shared = CLINIC_LOCATIONS.filter(other => other.city === location.city).length > 1
  return shared ? /\(([^)]+)\)/.exec(location.shortName)?.[1] ?? location.shortName : location.city
}

/**
 * Phones and tablets: once per visit, the first scroll slides up a small,
 * non-blocking sheet asking which clinic the visitor uses. The page stays
 * visible and scrollable; the top-bar selector remains for later changes.
 */
export function MobileClinicSheet() {
  const pathname = usePathname()
  const isDesktop = useIsDesktop()
  const reduceMotion = useReducedMotion()
  const { preferredLocation, hasHydrated, setPreferredLocation } = usePreferredLocation()
  const [open, setOpen] = useState(false)

  const eligible =
    hasHydrated &&
    !isDesktop &&
    !preferredLocation &&
    !clinicSlugForPath(pathname) &&
    !SKIP_PATHS.some(path => pathname?.startsWith(path))

  useEffect(() => {
    if (!eligible) return
    try {
      if (window.sessionStorage.getItem(SHOWN_KEY)) return
    } catch {
      return
    }
    function onScroll() {
      if (window.scrollY < SCROLL_TRIGGER_PX) return
      window.removeEventListener("scroll", onScroll)
      try { window.sessionStorage.setItem(SHOWN_KEY, "1") } catch {}
      setOpen(true)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [eligible])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  const visible = open && eligible

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          role="dialog"
          aria-modal="false"
          aria-labelledby="mobile-clinic-sheet-title"
          initial={reduceMotion ? { opacity: 0 } : { y: "100%" }}
          animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { y: "100%" }}
          transition={{ type: "spring", stiffness: 380, damping: 38 }}
          drag={reduceMotion ? false : "y"}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.6 }}
          onDragEnd={(_, info) => (info.offset.y > 80 || info.velocity.y > 500) && setOpen(false)}
          className="fixed inset-x-0 bottom-0 z-[60] rounded-t-2xl border-t border-secondary/10 bg-white px-4 pt-2 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-18px_50px_-24px_rgba(11,42,91,0.45)] lg:hidden"
        >
          <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-secondary/15" aria-hidden="true" />
          <div className="flex items-center justify-between gap-3">
            <h2 id="mobile-clinic-sheet-title" className="text-base font-semibold text-secondary">
              Which clinic do you visit?
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="-mr-1 flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-2 space-y-2.5">
            {REGIONS.map(region => (
              <div key={region.id} role="group" aria-label={region.name}>
                <p className="mb-1 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">{region.name}</p>
                <div className="flex flex-wrap gap-1.5">
                  {CLINIC_LOCATIONS.filter(location => location.region === region.id).map(location => (
                    <button
                      key={location.slug}
                      type="button"
                      onClick={() => {
                        setPreferredLocation(location.slug)
                        setOpen(false)
                      }}
                      aria-label={`Choose ${location.shortName}`}
                      className="h-9 rounded-full border border-secondary/15 px-3.5 text-sm font-medium text-secondary transition-colors active:bg-primary active:text-white hover:border-primary"
                    >
                      {label(location)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-3 w-full py-1.5 text-center text-sm font-medium text-muted-foreground"
          >
            Not now
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
