"use client"

import * as React from "react"

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
    try { window.localStorage.setItem(STORAGE_KEY, slug) } catch {}
  }, [])

  const clearPreferredLocation = React.useCallback(() => {
    setPreferredLocationSlug(null)
    try { window.localStorage.removeItem(STORAGE_KEY) } catch {}
  }, [])

  const preferredLocation = React.useMemo(
    () =>
      preferredLocationSlug
        ? LOCATIONS.find((location) => location.slug === preferredLocationSlug) ?? null
        : null,
    [preferredLocationSlug]
  )

  const value = React.useMemo(
    () => ({
      preferredLocation,
      preferredLocationSlug,
      hasHydrated,
      setPreferredLocation,
      clearPreferredLocation,
      isPickerOpen,
      openLocationPicker,
      closeLocationPicker,
    }),
    [
      preferredLocation,
      preferredLocationSlug,
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
