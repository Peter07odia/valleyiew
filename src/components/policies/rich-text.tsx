import Link from "next/link"
import type { Paragraph } from "@/data/patient-policies"

export function RichText({ content }: { content: Paragraph }) {
  return content.map((part, index) =>
    typeof part === "string" ? (
      part
    ) : (
      <Link
        key={index}
        href={part.href}
        className="font-semibold text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary"
      >
        {part.text}
      </Link>
    ),
  )
}

export function PolicyParagraph({ content }: { content: Paragraph }) {
  return (
    <p>
      <RichText content={content} />
    </p>
  )
}
