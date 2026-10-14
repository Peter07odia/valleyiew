import { CircleDashed } from "lucide-react"

interface DetailsPendingProps {
  eyebrow: string
  title: string
  description: string
  items?: string[]
}

export function DetailsPending({
  eyebrow,
  title,
  description,
  items = [],
}: DetailsPendingProps) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 md:py-28 lg:px-8">
      <div className="relative overflow-hidden rounded-[2.25rem] border border-primary/15 bg-[linear-gradient(135deg,#FFFFFF_0%,#F6F1E8_52%,#DCEAE6_100%)] p-8 shadow-[0_32px_90px_-58px_rgba(24,49,79,0.5)] sm:p-12">
        <div
          className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full border-[2.5rem] border-white/55"
          aria-hidden="true"
        />
        <div className="relative max-w-3xl">
          <CircleDashed className="size-9 text-primary" aria-hidden="true" />
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-balance font-serif text-4xl font-semibold tracking-tight text-secondary sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            {description}
          </p>
          {items.length > 0 ? (
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {items.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-white/80 bg-white/65 px-4 py-3 text-sm font-medium text-secondary shadow-sm backdrop-blur"
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  )
}
