"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = ["Clinic", "Visit", "Time", "Details", "Done"] as const

interface BookingStepperProps {
  currentStep: number
}

export function BookingStepper({ currentStep }: BookingStepperProps) {
  return (
    <nav aria-label="Booking progress" className="w-full">
      <ol className="flex items-center justify-between">
        {STEPS.map((label, index) => {
          const isCompleted = index < currentStep
          const isActive = index === currentStep

          return (
            <li
              key={label}
              className={cn(
                "flex items-center",
                index < STEPS.length - 1 && "flex-1"
              )}
            >
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors",
                    isCompleted && "bg-primary text-primary-foreground",
                    isActive &&
                      "bg-primary text-primary-foreground ring-2 ring-primary/30",
                    !isCompleted &&
                      !isActive &&
                      "border-2 border-muted-foreground/30 bg-muted text-muted-foreground"
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isCompleted ? (
                    <Check className="size-4" aria-hidden="true" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "hidden text-xs font-medium md:block",
                    isCompleted && "text-primary",
                    isActive && "text-primary",
                    !isCompleted && !isActive && "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </div>

              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1 rounded-full transition-colors md:mx-3",
                    index < currentStep ? "bg-primary" : "bg-muted-foreground/20"
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>

      <p className="mt-2 text-center text-sm font-medium text-primary md:hidden">
        Step {currentStep + 1}: {STEPS[currentStep]}
      </p>
    </nav>
  )
}
