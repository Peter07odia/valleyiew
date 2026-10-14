"use client"

import * as React from "react"
import Image from "next/image"
import { ChevronDown, ExternalLink } from "lucide-react"

import type { ClinicLocation } from "@/lib/constants"
import { Button } from "@/components/ui/button"

interface PharmacyEmblemCardProps {
  location: ClinicLocation
  className?: string
}

export function PharmacyEmblemCard({
  location,
  className = "",
}: PharmacyEmblemCardProps) {
  const [actionsOpen, setActionsOpen] = React.useState(false)

  if (!location.pharmacyName) {
    return null
  }

  const actions = location.pharmacyActions ?? []
  const hasMultipleActions = actions.length > 1
  const pharmacyHref =
    location.pharmacyUrl ?? actions[0]?.href ?? null

  return (
    <article
      className={`mx-auto w-full max-w-6xl rounded-2xl border border-border/70 bg-white px-5 py-8 text-center shadow-[0_22px_60px_-32px_rgba(28,46,74,0.45)] ring-1 ring-black/5 sm:px-8 ${className}`}
    >
      <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {location.pharmacyName}
      </h2>

      <div className="mt-7 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8">
        <div className="flex min-h-24 w-full max-w-[28rem] items-center justify-center">
          {location.pharmacyLogoSrc ? (
            <Image
              src={location.pharmacyLogoSrc}
              alt={location.pharmacyLogoAlt ?? `${location.pharmacyName} logo`}
              width={420}
              height={160}
              sizes="(max-width: 640px) 82vw, 420px"
              className="max-h-28 w-auto object-contain"
            />
          ) : (
            <span className="rounded-xl border border-primary/15 bg-primary/5 px-5 py-4 text-lg font-semibold text-secondary">
              {location.pharmacyName}
            </span>
          )}
        </div>

        {hasMultipleActions ? (
          <Button
            type="button"
            size="lg"
            className="h-14 rounded-full bg-[#c9181e] px-9 text-base font-semibold text-white shadow-[0_16px_34px_-22px_rgba(190,24,31,0.8)] hover:bg-[#a91419]"
            aria-expanded={actionsOpen}
            aria-controls={`${location.id}-pharmacy-actions`}
            onClick={() => setActionsOpen((open) => !open)}
          >
            Pharmacy
            <ChevronDown
              className={`size-4 transition-transform duration-200 ${
                actionsOpen ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </Button>
        ) : pharmacyHref ? (
          <Button
            asChild
            size="lg"
            className="h-14 rounded-full bg-[#c9181e] px-9 text-base font-semibold text-white shadow-[0_16px_34px_-22px_rgba(190,24,31,0.8)] hover:bg-[#a91419]"
          >
            <a href={pharmacyHref} target="_blank" rel="noopener noreferrer">
              Pharmacy
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          </Button>
        ) : null}
      </div>

      {hasMultipleActions ? (
        <div
          id={`${location.id}-pharmacy-actions`}
          className={`grid overflow-hidden transition-[grid-template-rows,opacity,margin] duration-300 ${
            actionsOpen
              ? "mt-7 grid-rows-[1fr] opacity-100"
              : "mt-0 grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0">
            <div className="mx-auto grid max-w-4xl gap-3 border-t border-border/70 pt-6 sm:grid-cols-2 lg:grid-cols-3">
              {actions.map((action) => (
                <a
                  key={`${location.id}-${action.label}`}
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-h-24 flex-col justify-between rounded-xl border border-border bg-muted/35 p-4 text-left transition-colors hover:border-[#c9181e]/40 hover:bg-[#c9181e]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9181e]/35"
                >
                  <span className="text-sm font-semibold text-foreground">
                    {action.label}
                  </span>
                  <span className="mt-2 text-xs leading-5 text-muted-foreground">
                    {action.description}
                  </span>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#c9181e]">
                    Open link
                    <ExternalLink
                      className="size-3 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </article>
  )
}
