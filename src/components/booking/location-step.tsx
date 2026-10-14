"use client"

import { ArrowRight, MapPin, Phone } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CLINIC_CONFIG } from "@/config/clinic"
import type { BookingLocation } from "./types"

interface LocationStepProps {
  locations: BookingLocation[]
  selectedLocationId: string | null
  onSelect: (location: BookingLocation) => void
}

export function LocationStep({
  locations,
  selectedLocationId,
  onSelect,
}: LocationStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Book your visit</h2>
        <p className="text-sm text-muted-foreground">
          Choose the {CLINIC_CONFIG.market} clinic you&apos;d like to visit.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {locations.map((location) => {
          const isSelected = selectedLocationId === location.id
          return (
            <button
              key={location.id}
              type="button"
              onClick={() => onSelect(location)}
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
                  <CardTitle className="flex items-center gap-2">
                    <MapPin
                      className={cn(
                        "size-4 shrink-0",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )}
                      aria-hidden="true"
                    />
                    {location.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {location.address}
                    <br />
                    {location.city}, {location.province}
                  </p>
                  {location.phone ? (
                    <p className="flex items-center gap-1.5 text-sm text-primary">
                      <Phone className="size-3.5 shrink-0" aria-hidden="true" />
                      {location.phone}
                    </p>
                  ) : (
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Phone className="size-3.5 shrink-0" aria-hidden="true" />
                      Contact details: To be confirmed
                    </p>
                  )}
                  <p className="flex items-center justify-end pt-1 text-primary">
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </p>
                </CardContent>
              </Card>
            </button>
          )
        })}
      </div>
    </div>
  )
}
