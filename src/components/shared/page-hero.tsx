import Image from "next/image"

interface PageHeroProps {
  title: string
  description?: string
  children?: React.ReactNode
  imageSrc?: string
  imageAlt?: string
  imagePriority?: boolean
}

export function PageHero({
  title,
  description,
  children,
  imageSrc,
  imageAlt = "",
  imagePriority = true,
}: PageHeroProps) {
  return (
    <section className="overflow-hidden bg-gradient-to-br from-primary/5 via-background to-muted py-16 md:py-24">
      <div className="container mx-auto grid items-center gap-10 px-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,460px)] lg:gap-14">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              {description}
            </p>
          )}
          {children && <div className="mt-6">{children}</div>}
        </div>

        {imageSrc ? (
          <div className="relative">
            <div
              className="pointer-events-none absolute inset-6 rounded-[2rem] bg-primary/10 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-xl ring-1 ring-primary/10">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                loading={imagePriority ? "eager" : "lazy"}
                fetchPriority={imagePriority ? "high" : undefined}
                sizes="(max-width: 1024px) 100vw, 460px"
                className="object-cover"
              />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
