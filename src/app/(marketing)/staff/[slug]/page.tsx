import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Mail, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  SUPPORT_PROFILES,
  TEAM_MEMBER_BIOS,
  getTeamBio,
  getTeamMemberAppearances,
  getTeamMemberImageSrc,
  isTeamLogoImage,
} from "@/lib/team"
import { cn } from "@/lib/utils"

interface StaffProfilePageProps {
  params: Promise<{ slug: string }>
}

function formatSectionTitle(title: string) {
  return title
}

export async function generateStaticParams() {
  return [...TEAM_MEMBER_BIOS, ...SUPPORT_PROFILES].map((bio) => ({
    slug: bio.id,
  }))
}

export async function generateMetadata({
  params,
}: StaffProfilePageProps): Promise<Metadata> {
  const { slug } = await params
  const bio = getTeamBio(slug)

  if (!bio) {
    return { title: "Staff Profile Not Found" }
  }

  return {
    title: bio.name,
    description: `Read ${bio.name}'s approved profile and role at Valleyview Medical Centre.`,
  }
}

export default async function StaffProfilePage({
  params,
}: StaffProfilePageProps) {
  const { slug } = await params
  const bio = getTeamBio(slug)

  if (!bio) {
    notFound()
  }

  const imageSrc = getTeamMemberImageSrc(bio.id)
  const appearances = getTeamMemberAppearances(bio.id)
  const role = appearances[0]?.role ?? bio.role
  const primaryLocation = appearances[0]

  return (
    <>
      <section className="relative overflow-hidden bg-muted py-20 md:py-28">
        <div
          className="absolute inset-0 opacity-55"
          style={{
            backgroundImage:
              "radial-gradient(circle at 22px 22px, rgba(28, 46, 74, 0.12) 2px, transparent 0), linear-gradient(120deg, rgba(36, 138, 126, 0.12), transparent 32%, rgba(28, 46, 74, 0.08))",
            backgroundSize: "64px 64px, cover",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
          <span className="rounded-full bg-background px-5 py-2 text-sm shadow-sm">
            Your health connected with care!
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
            {bio.name}
          </h1>
          <Button className="mt-6" variant="outline" asChild>
            <Link href="/contact">
              <Mail className="size-4" aria-hidden="true" />
              Contact Details
            </Link>
          </Button>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Button variant="ghost" asChild className="mb-8">
          <Link href="/team">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to team
          </Link>
        </Button>

        <article className="grid gap-8 lg:grid-cols-[minmax(280px,420px)_1fr] lg:gap-12">
          <div>
            <div className="relative aspect-[4/4.4] overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-border">
              <Image
                src={imageSrc}
                alt={bio.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 420px"
                style={{ objectPosition: bio.imagePosition ?? "center" }}
                className={cn(
                  isTeamLogoImage(imageSrc)
                    ? "object-contain p-12"
                    : "object-cover"
                )}
              />
            </div>

            {appearances.length ? (
              <div className="mt-6 rounded-lg border bg-card p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Locations
                </h2>
                <div className="mt-4 space-y-3">
                  {appearances.map((appearance) => (
                    <Link
                      key={`${appearance.locationSlug}-${appearance.sectionTitle}-${appearance.role}`}
                      href={`/locations/${appearance.locationSlug}`}
                      className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                    >
                      <MapPin
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      <span>
                        <span className="block font-medium">
                          {appearance.locationName}
                        </span>
                        <span className="block text-sm text-muted-foreground">
                          {formatSectionTitle(appearance.sectionTitle)}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="min-w-0">
            <h2 className="text-2xl font-semibold leading-tight text-blue-600">
              {bio.name}
            </h2>
            <div className="mt-4 rounded-full bg-blue-100 px-5 py-2 text-center text-sm font-medium text-blue-700">
              {role}
            </div>

            <div className="mt-6 space-y-4 text-base leading-7 text-foreground">
              {bio.paragraphs.length > 0 ? (
                bio.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
              ) : (
                <p className="text-muted-foreground">A full biography is coming soon.</p>
              )}
            </div>

            {primaryLocation ? (
              <div className="mt-10 rounded-lg bg-muted p-5">
                <p className="text-sm text-muted-foreground">
                  {bio.name} practises at {primaryLocation.locationName}.
                </p>
              </div>
            ) : null}
          </div>
        </article>
      </main>
    </>
  )
}
