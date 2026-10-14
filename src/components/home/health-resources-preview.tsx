import Image from "next/image"
import Link from "next/link"
import { BLOG_POSTS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { SectionHeading } from "@/components/shared/section-heading"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { AppIcon } from "@/components/icons/medical-icons"
import {
  HealthTipsIcon,
  PreventionIcon,
} from "@/components/icons/medical-icons"
import {
  ArrowRight,
  Clock,
} from "lucide-react"

const CATEGORY_STYLES: Record<
  string,
  { overlay: string; badge: string; icon: AppIcon }
> = {
  Prevention: {
    overlay: "from-primary/45 via-primary/10 to-transparent",
    badge: "bg-primary/15 text-primary",
    icon: PreventionIcon,
  },
  "Health Tips": {
    overlay: "from-accent-warm/45 via-accent-warm/10 to-transparent",
    badge: "bg-accent-warm/15 text-accent-warm-foreground",
    icon: HealthTipsIcon,
  },
}

const DEFAULT_STYLE = {
  overlay: "from-secondary/35 via-secondary/10 to-transparent",
  badge: "bg-muted text-muted-foreground",
  icon: HealthTipsIcon,
}

export function HealthResourcesPreview() {
  return (
    <section className="py-16 md:py-24" aria-labelledby="resources-heading">
      <div className="container mx-auto px-4">
        <SectionHeading
          title="Health Resources"
          subtitle="Stay informed with our latest articles"
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {BLOG_POSTS.map((post) => {
            const style = CATEGORY_STYLES[post.category] ?? DEFAULT_STYLE
            const IconComponent = style.icon

            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <article className="flex h-full flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative h-48 overflow-hidden bg-muted">
                    <Image
                      src={post.coverImage}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      className={cn(
                        "absolute inset-0 bg-gradient-to-tr",
                        style.overlay
                      )}
                      aria-hidden="true"
                    />
                    <div className="absolute right-4 top-4 rounded-full bg-white/80 p-3 shadow-sm backdrop-blur-sm">
                      <IconComponent
                        className="size-5 text-secondary/55"
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    {/* Category badge */}
                    <Badge
                      variant="secondary"
                      className={cn("w-fit border-0", style.badge)}
                    >
                      {post.category}
                    </Badge>

                    {/* Title */}
                    <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {post.excerpt}
                    </p>

                    {/* Footer */}
                    <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span>
                          {new Date(post.publishedAt).toLocaleDateString(
                            "en-CA",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" aria-hidden="true" />
                          {post.readTime}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 font-medium text-primary transition-all group-hover:gap-2">
                        Read
                        <ArrowRight className="size-3" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            )
          })}
        </div>

        <div className="mt-12 flex justify-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/blog">
              View All Articles
              <ArrowRight
                className="size-4"
                aria-hidden="true"
                data-icon="inline-end"
              />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
