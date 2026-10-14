import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  title: string
  subtitle?: string
  align?: "center" | "left"
  id?: string
}

export function SectionHeading({
  title,
  subtitle,
  align = "center",
  id,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-12",
        align === "center" && "text-center",
        align === "left" && "text-left"
      )}
    >
      <div
        className={cn(
          "mb-4 h-1 w-12 rounded-full bg-primary",
          align === "center" && "mx-auto"
        )}
        aria-hidden="true"
      />
      <h2
        id={id}
        className="text-3xl font-semibold tracking-tight text-secondary md:text-4xl"
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
          {subtitle}
        </p>
      )}
    </div>
  )
}
