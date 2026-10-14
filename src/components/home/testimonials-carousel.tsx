"use client"

import {
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
  type FocusEvent,
} from "react"
import { ArrowLeft, ArrowRight, Heart, Quote } from "lucide-react"

import { TESTIMONIALS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"

function GoogleMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-9 shrink-0"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.6 12.23c0-.68-.06-1.33-.17-1.95H12v3.7h5.39a4.62 4.62 0 0 1-2 3.03v2.52h3.24c1.9-1.75 2.97-4.33 2.97-7.3Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.7 0 4.97-.9 6.63-2.47l-3.24-2.52c-.9.6-2.05.95-3.39.95-2.6 0-4.8-1.76-5.58-4.12H3.07v2.6A9.99 9.99 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.42 13.84a5.98 5.98 0 0 1 0-3.68v-2.6H3.07a9.96 9.96 0 0 0 0 8.88l3.35-2.6Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.04c1.47 0 2.78.5 3.81 1.49l2.85-2.85C16.96 3.08 14.7 2 12 2A9.99 9.99 0 0 0 3.07 7.56l3.35 2.6c.78-2.36 2.98-4.12 5.58-4.12Z"
        fill="#EA4335"
      />
    </svg>
  )
}

const AUTOPLAY_DELAY_MS = 3500

export function TestimonialsCarousel() {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  const testimonialCount = TESTIMONIALS.length

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const syncPreference = () => {
      setPrefersReducedMotion(mediaQuery.matches)
    }

    syncPreference()
    mediaQuery.addEventListener("change", syncPreference)

    return () => {
      mediaQuery.removeEventListener("change", syncPreference)
    }
  }, [])

  useEffect(() => {
    if (!api) return

    const syncSelection = () => {
      setCurrent(api.selectedScrollSnap())
    }

    syncSelection()
    api.on("select", syncSelection)
    api.on("reInit", syncSelection)

    return () => {
      api.off("select", syncSelection)
      api.off("reInit", syncSelection)
    }
  }, [api])

  const advanceSlide = useEffectEvent(() => {
    api?.scrollNext()
  })

  useEffect(() => {
    if (!api || isPaused || prefersReducedMotion) return

    const intervalId = window.setInterval(() => {
      advanceSlide()
    }, AUTOPLAY_DELAY_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [api, isPaused, prefersReducedMotion])

  const activeTestimonial = useMemo(() => {
    return TESTIMONIALS[current] ?? TESTIMONIALS[0]
  }, [current])

  const resumeOnBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsPaused(false)
    }
  }

  return (
    <section
      className="relative overflow-hidden bg-[linear-gradient(180deg,#F9FBFB_0%,#F3F7F7_100%)] py-18 md:py-28"
      aria-labelledby="testimonials-heading"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-16 h-64 w-64 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(36,138,126,0.09)_0%,_rgba(36,138,126,0)_72%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/2 top-[18rem] hidden h-[24rem] w-[24rem] -translate-x-1/2 rounded-[44%_56%_50%_50%/40%_46%_54%_60%] bg-[#D9EDF2] opacity-80 blur-[1px] md:block"
        aria-hidden="true"
      />

      <div className="container relative mx-auto px-4">
        <div className="relative mx-auto max-w-4xl text-center">
          <div
            className="absolute right-2 top-0 hidden h-18 w-18 rotate-[18deg] items-center justify-center rounded-[1.6rem] bg-[#355C6B] shadow-[0_20px_48px_-28px_rgba(28,46,74,0.55)] md:flex"
            aria-hidden="true"
          >
            <Heart className="size-8 fill-[#F27063] text-[#F27063]" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.26em] text-primary/70">
            Patient Reviews
          </p>
          <h2
            id="testimonials-heading"
            className="mt-5 font-serif text-4xl font-semibold leading-tight tracking-tight text-secondary sm:text-5xl md:text-6xl"
          >
            See What Our Patients Are Saying
          </h2>
        </div>

        <div
          className="relative mx-auto mt-14 max-w-6xl"
          onPointerEnter={() => setIsPaused(true)}
          onPointerLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={resumeOnBlur}
        >
          <div
            className="pointer-events-none absolute inset-y-12 left-0 z-10 hidden w-24 bg-gradient-to-r from-[#F7FAFA] via-[#F7FAFA]/88 to-transparent lg:block"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-y-12 right-0 z-10 hidden w-24 bg-gradient-to-l from-[#F7FAFA] via-[#F7FAFA]/88 to-transparent lg:block"
            aria-hidden="true"
          />

          <Carousel
            opts={{
              align: "center",
              loop: true,
            }}
            setApi={setApi}
            aria-label="Patient testimonials"
            className="px-0 md:px-12"
          >
            <CarouselContent className="items-stretch">
              {TESTIMONIALS.map((testimonial, index) => {
                const isActive = index === current

                return (
                  <CarouselItem
                    key={testimonial.id}
                    className="basis-[92%] sm:basis-[80%] lg:basis-[60%] xl:basis-[52%]"
                  >
                    <article
                      className={cn(
                        "h-full transition-[opacity,transform,filter] duration-500 ease-out",
                        isActive
                          ? "scale-100 opacity-100 blur-0"
                          : "scale-[0.92] opacity-30 blur-[2px]"
                      )}
                    >
                      <div className="flex min-h-[22rem] flex-col rounded-[2rem] border border-white/80 bg-white px-6 py-7 shadow-[0_28px_80px_-34px_rgba(28,46,74,0.26)] ring-1 ring-black/4 md:min-h-[26rem] md:px-10 md:py-9">
                        <Quote
                          className="size-12 text-[#67B6D1] md:size-14"
                          strokeWidth={2.4}
                          aria-hidden="true"
                        />

                        <blockquote className="mt-6 flex-1">
                          <p className="text-lg leading-9 text-secondary/88 md:text-[1.05rem]">
                            {testimonial.content}
                          </p>
                        </blockquote>

                        <div className="mt-8 flex items-center gap-4 border-t border-border/60 pt-5">
                          <GoogleMark />
                          <div className="min-w-0">
                            <p className="truncate text-xl font-semibold text-secondary">
                              {testimonial.patientName}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {testimonial.location}
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  </CarouselItem>
                )
              })}
            </CarouselContent>
          </Carousel>

          <div className="mt-8 flex items-center justify-center gap-4 md:hidden">
            <Button
              type="button"
              size="icon-lg"
              className="rounded-full bg-secondary text-secondary-foreground shadow-[0_20px_38px_-24px_rgba(28,46,74,0.6)] hover:bg-secondary/92"
              onClick={() => api?.scrollPrev()}
            >
              <ArrowLeft className="size-5" aria-hidden="true" />
              <span className="sr-only">Previous testimonial</span>
            </Button>
            <Button
              type="button"
              size="icon-lg"
              className="rounded-full bg-secondary text-secondary-foreground shadow-[0_20px_38px_-24px_rgba(28,46,74,0.6)] hover:bg-secondary/92"
              onClick={() => api?.scrollNext()}
            >
              <ArrowRight className="size-5" aria-hidden="true" />
              <span className="sr-only">Next testimonial</span>
            </Button>
          </div>

          <div className="pointer-events-none absolute inset-0 z-20 hidden md:block">
            <div className="pointer-events-auto absolute left-[10%] top-1/2 -translate-y-1/2 lg:left-[13%] xl:left-[15%]">
              <Button
                type="button"
                size="icon-lg"
                className="rounded-full bg-secondary text-secondary-foreground shadow-[0_24px_44px_-24px_rgba(28,46,74,0.68)] hover:bg-secondary/92"
                onClick={() => api?.scrollPrev()}
              >
                <ArrowLeft className="size-5" aria-hidden="true" />
                <span className="sr-only">Previous testimonial</span>
              </Button>
            </div>
            <div className="pointer-events-auto absolute right-[10%] top-1/2 -translate-y-1/2 lg:right-[13%] xl:right-[15%]">
              <Button
                type="button"
                size="icon-lg"
                className="rounded-full bg-secondary text-secondary-foreground shadow-[0_24px_44px_-24px_rgba(28,46,74,0.68)] hover:bg-secondary/92"
                onClick={() => api?.scrollNext()}
              >
                <ArrowRight className="size-5" aria-hidden="true" />
                <span className="sr-only">Next testimonial</span>
              </Button>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Showing review {current + 1} of {testimonialCount}:{" "}
          <span className="font-medium text-secondary">
            {activeTestimonial.patientName}
          </span>
        </p>
      </div>
    </section>
  )
}
