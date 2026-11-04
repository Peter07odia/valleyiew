import Link from "next/link"
import { CircleAlert } from "lucide-react"
import { UNCONFIRMED_MARKER, type Paragraph } from "@/data/patient-policies"

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

export const isUnconfirmed = (text: string) => text.startsWith(UNCONFIRMED_MARKER)

/**
 * Unresolved clinic questions render as a highlighted note so reviewers can spot
 * them. The CONFIRM gate test fails while any are on a page.
 */
export function ConfirmNote({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex gap-3 border-l-4 border-warning bg-warning/10 px-4 py-3 text-base leading-7 text-secondary">
      <CircleAlert className="mt-1 size-5 shrink-0 text-warning" aria-hidden="true" />
      <span>{children}</span>
    </span>
  )
}

export function PolicyParagraph({ content }: { content: Paragraph }) {
  const first = content[0]
  if (typeof first === "string" && isUnconfirmed(first)) {
    return (
      <p>
        <ConfirmNote>
          <RichText content={content} />
        </ConfirmNote>
      </p>
    )
  }
  return (
    <p>
      <RichText content={content} />
    </p>
  )
}
