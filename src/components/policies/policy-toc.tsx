"use client"

import { useEffect, useState } from "react"

interface PolicyTocProps {
  id: string
  label: string
  items: { id: string; title: string }[]
}

/** "On this page" list; highlights the section currently being read. */
export function PolicyToc({ id, label, items }: PolicyTocProps) {
  const [active, setActive] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null)
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      // A section counts as "being read" once it reaches the upper part of the screen.
      { rootMargin: "-20% 0px -65% 0px" },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [items])

  return (
    <nav id={id} aria-label={label} className="scroll-mt-28 lg:sticky lg:top-28">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">On this page</p>
      <ol className="mt-4 grid border-t border-secondary/15 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-1">
        {items.map((item, index) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "location" : undefined}
              className="group grid grid-cols-[2.25rem_1fr] items-baseline border-b border-secondary/10 py-2.5 text-sm leading-6 text-muted-foreground transition-colors hover:text-primary aria-[current=location]:font-semibold aria-[current=location]:text-secondary"
            >
              <span className="text-xs font-bold tracking-[0.16em] text-primary/55 group-aria-[current=location]:text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              {item.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
