import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Calendar, Clock } from "lucide-react"

import { BLOG_POSTS } from "@/lib/constants"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = BLOG_POSTS.find((p) => p.slug === slug)

  if (!post) {
    return { title: "Post Not Found" }
  }

  return {
    title: post.title,
    description: post.excerpt,
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = BLOG_POSTS.find((p) => p.slug === slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" asChild className="mb-8">
        <Link href="/blog">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Blog
        </Link>
      </Button>

      <header className="mb-8">
        <Badge variant="secondary" className="mb-4">
          {post.category}
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {post.title}
        </h1>
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="size-4" aria-hidden="true" />
            {formatDate(post.publishedAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-4" aria-hidden="true" />
            {post.readTime}
          </span>
        </div>
      </header>

      <div className="relative mb-8 aspect-video overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-foreground/5">
        <Image
          src={post.coverImage}
          alt={post.coverImageAlt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 768px"
          className="object-cover"
        />
      </div>

      <Separator className="mb-8" />

      {/* Placeholder body content */}
      <div className="prose prose-neutral max-w-none">
        <p className="text-lg leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
        <p className="leading-relaxed text-muted-foreground">
          This article is coming soon. Our medical team is preparing
          comprehensive, evidence-based content to help you make informed
          decisions about your health. Check back for the full article, or
          contact your Valleyview clinic for personalized medical
          advice.
        </p>
        <p className="leading-relaxed text-muted-foreground">
          In the meantime, if you have questions about the topics covered here,
          please do not hesitate to contact us or book a visit at any of our
          seven clinics. Contact details and hours for each location are on
          the Locations page.
        </p>
      </div>

      <Separator className="my-8" />

      <div className="flex justify-center">
        <Button asChild>
          <Link href="/contact">Have Questions? Contact Us</Link>
        </Button>
      </div>
    </article>
  )
}
