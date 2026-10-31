"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import { locationSlugForPath } from "@/lib/clinic-path"
import { LOCATIONS, type ClinicLocation } from "@/lib/constants"

const STORAGE_KEY = "vvm-unified-preferred-location"

interface PreferredLocationContextValue {
  preferredLocation: ClinicLocation | null
  preferredLocationSlug: string | null
  hasHydrated: boolean
  setPreferredLocation: (slug: string) => void
  clearPreferredLocation: () => void
  /** True when someone asked to change clinic (the first-visit prompt opens on its own). */
  isPickerOpen: boolean
  openLocationPicker: () => void
  closeLocationPicker: () => void
}

const PreferredLocationContext =
  React.createContext<PreferredLocationContextValue | null>(null)

export function PreferredLocationProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [preferredLocationSlug, setPreferredLocationSlug] = React.useState<
    string | null
  >(null)
  const [hasHydrated, setHasHydrated] = React.useState(false)
  const [isPickerOpen, setIsPickerOpen] = React.useState(false)

  // A location page shows its own clinic in the header, even when the visitor
  // saved a different one. Choosing a clinic while on that page wins until
  // they navigate away; the saved clinic is untouched until they choose.
  const pathname = usePathname()
  const pageClinicSlug = locationSlugForPath(pathname)
  const [choseOnPath, setChoseOnPath] = React.useState<string | null>(null)
  const [lastPathname, setLastPathname] = React.useState(pathname)
  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    setChoseOnPath(null)
  }
  const pathnameRef = React.useRef(pathname)
  React.useEffect(() => {
    pathnameRef.current = pathname
  }, [pathname])
  const openLocationPicker = React.useCallback(() => setIsPickerOpen(true), [])
  const closeLocationPicker = React.useCallback(() => setIsPickerOpen(false), [])

  React.useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(STORAGE_KEY)
      if (
        storedValue &&
        LOCATIONS.some(
          (location) => location.slug === storedValue && !location.isComingSoon
        )
      ) {
        setPreferredLocationSlug(storedValue)
      }
    } catch {
      // The selector still works when browser storage is unavailable.
    } finally {
      setHasHydrated(true)
    }
  }, [])

  const setPreferredLocation = React.useCallback((slug: string) => {
    if (
      !LOCATIONS.some(
        (location) => location.slug === slug && !location.isComingSoon
      )
    ) {
      return
    }

    setPreferredLocationSlug(slug)
    setChoseOnPath(pathnameRef.current)
    try { window.localStorage.setItem(STORAGE_KEY, slug) } catch {}
  }, [])

  // First-time visitors landing on a location page keep that clinic afterwards.
  React.useEffect(() => {
    if (hasHydrated && !preferredLocationSlug && pageClinicSlug) {
      setPreferredLocation(pageClinicSlug)
    }
  }, [hasHydrated, preferredLocationSlug, pageClinicSlug, setPreferredLocation])

  const clearPreferredLocation = React.useCallback(() => {
    setPreferredLocationSlug(null)
    try { window.localStorage.removeItem(STORAGE_KEY) } catch {}
  }, [])

  const effectiveSlug =
    pageClinicSlug && choseOnPath !== pathname
      ? pageClinicSlug
      : preferredLocationSlug

  const preferredLocation = React.useMemo(
    () =>
      effectiveSlug
        ? LOCATIONS.find((location) => location.slug === effectiveSlug) ?? null
        : null,
    [effectiveSlug]
  )

  const value = React.useMemo(
    () => ({
      preferredLocation,
      preferredLocationSlug: effectiveSlug,
      hasHydrated,
      setPreferredLocation,
      clearPreferredLocation,
      isPickerOpen,
      openLocationPicker,
      closeLocationPicker,
    }),
    [
      preferredLocation,
      effectiveSlug,
      hasHydrated,
      setPreferredLocation,
      clearPreferredLocation,
      isPickerOpen,
      openLocationPicker,
      closeLocationPicker,
    ]
  )

  return (
    <PreferredLocationContext.Provider value={value}>
      {children}
    </PreferredLocationContext.Provider>
  )
}

export function usePreferredLocation() {
  const context = React.useContext(PreferredLocationContext)

  if (!context) {
    throw new Error(
      "usePreferredLocation must be used within a PreferredLocationProvider"
    )
  }

  return context
}
