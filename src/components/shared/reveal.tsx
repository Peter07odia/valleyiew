"use client"

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react"

/**
 * One-time entrance animation when an element scrolls into view.
 * Effects mirror the Wix "flip in", "float in" and "bounce in" timings.
 * Styles live in globals.css; reduced-motion visitors and no-JS visitors see
 * content immediately.
 */
export type RevealEffect = "float" | "flip" | "bounce"

type RevealProps = {
  as?: "div" | "article" | "li" | "section" | "span" | "p"
  effect?: RevealEffect
  /** Milliseconds; use small steps (60–120ms) to stagger lists. */
  delay?: number
  className?: string
  children: ReactNode
}

let observer: IntersectionObserver | null = null

function sharedObserver() {
  if (!observer) {
    observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.setAttribute("data-in-view", "")
          observer?.unobserve(entry.target)
        }
      },
      // Start slightly before the element is fully on screen, like Wix.
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
    )
  }
  return observer
}

export function Reveal({ as = "div", effect = "float", delay = 0, className, children }: RevealProps) {
  // Rendered tag varies, but every option is a plain HTML element.
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") {
      el.setAttribute("data-in-view", "")
      return
    }
    const io = sharedObserver()
    io.observe(el)
    return () => io.unobserve(el)
  }, [])

  const Tag = as as "div"
  return (
    <Tag
      ref={ref}
      className={className}
      data-reveal={effect}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </Tag>
  )
}
