"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, ClipboardList, Clock, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DbAppointmentType, DbProvider } from "./types"

interface ServiceStepProps {
  locationId: string
  selectedType: DbAppointmentType | null
  selectedProviderId: string | null
  onTypeSelect: (type: DbAppointmentType) => void
  onProviderSelect: (providerId: string) => void
}

export function ServiceStep({
  locationId,
  selectedType,
  selectedProviderId,
  onTypeSelect,
  onProviderSelect,
}: ServiceStepProps) {
  const [types, setTypes] = useState<DbAppointmentType[]>([])
  const [providers, setProviders] = useState<DbProvider[]>([])
  const [loadedLocationId, setLoadedLocationId] = useState<string | null>(null)
  const loading = loadedLocationId !== locationId

  useEffect(() => {
    let active = true
    fetch(`/api/booking/reference?location=${locationId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!active) return
        setTypes(data.types ?? [])
        setProviders(data.providers ?? [])
        setLoadedLocationId(locationId)
      })
      .catch(() => {
        if (!active) return
        setTypes([])
        setProviders([])
        setLoadedLocationId(locationId)
      })
    return () => {
      active = false
    }
  }, [locationId])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          What do you need?
        </h2>
        <p className="text-sm text-muted-foreground">
          Pick a visit type, then choose a physician.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading options…</p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            {types.map((type) => {
              const isSelected = selectedType?.id === type.id
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => onTypeSelect(type)}
                  className="text-left"
                  aria-pressed={isSelected}
                >
                  <Card
                    className={cn(
                      "h-full cursor-pointer transition-all hover:ring-2 hover:ring-primary/50",
                      isSelected && "ring-2 ring-primary bg-primary/5"
                    )}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-base">
                        <ClipboardList
                          className="size-5 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        {isSelected && (
                          <CheckCircle2
                            className="size-5 text-primary"
                            aria-hidden="true"
                          />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      <p className="font-medium text-foreground">{type.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {type.default_minutes} min
                      </p>
                    </CardContent>
                  </Card>
                </button>
              )
            })}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Physician</h3>
            <div className="flex flex-col gap-2.5">
              <ProviderRow
                selected={selectedProviderId === "any"}
                onClick={() => onProviderSelect("any")}
                name="First available"
                sub="Fastest appointment across this clinic"
                any
              />
              {providers.map((p) => (
                <ProviderRow
                  key={p.id}
                  selected={selectedProviderId === p.id}
                  onClick={() => onProviderSelect(p.id)}
                  name={p.name}
                  sub={p.specialty ?? "Physician"}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function ProviderRow({
  selected,
  onClick,
  name,
  sub,
  any,
}: {
  selected: boolean
  onClick: () => void
  name: string
  sub: string
  any?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-all",
        "hover:border-primary/50",
        selected ? "border-primary bg-primary/5" : "border-border"
      )}
    >
      <span className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-full",
            any ? "bg-accent-warm/15 text-accent-warm" : "bg-primary/10 text-primary"
          )}
        >
          {any ? (
            <Clock className="size-4.5" aria-hidden="true" />
          ) : (
            <User className="size-4.5" aria-hidden="true" />
          )}
        </span>
        <span>
          <span className="block text-sm font-medium text-foreground">
            {name}
          </span>
          <span className="block text-xs text-muted-foreground">{sub}</span>
        </span>
      </span>
      <span
        className={cn(
          "flex size-5 items-center justify-center rounded-full border-2",
          selected ? "border-primary bg-primary" : "border-muted-foreground/30"
        )}
      >
        {selected && (
          <CheckCircle2 className="size-3 text-primary-foreground" aria-hidden="true" />
        )}
      </span>
    </button>
  )
}
