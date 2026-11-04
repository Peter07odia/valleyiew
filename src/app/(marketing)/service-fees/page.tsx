import type { Metadata } from "next"
import { PageHero } from "@/components/shared/page-hero"
import { RichText } from "@/components/policies/rich-text"
import { canonicalUrl } from "@/config/clinic"
import { SERVICE_FEES, SERVICE_FEES_INTRO } from "@/data/patient-policies"

export const metadata: Metadata = {
  title: "Uninsured Service Fees",
  description:
    "Fees at Valleyview Medical Centre for services not covered by OHIP, including sick notes, forms, driver’s medicals, TB tests and medical records.",
  alternates: { canonical: canonicalUrl("/service-fees") },
}

export default function ServiceFeesPage() {
  return (
    <>
      <PageHero title="Uninsured Service Fees" />
      <article className="mx-auto max-w-3xl space-y-8 px-5 py-16 leading-7">
        <div className="space-y-4">
          {SERVICE_FEES_INTRO.map((paragraph, index) => (
            <p key={index}>
              <RichText content={paragraph} />
            </p>
          ))}
        </div>
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Uninsured service fees</caption>
          <thead>
            <tr className="border-b-2 border-secondary/20">
              <th scope="col" className="py-3 pr-4 font-semibold text-secondary">Service</th>
              <th scope="col" className="py-3 font-semibold text-secondary">Fee</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {SERVICE_FEES.map((row) => (
              <tr key={row.service}>
                <th scope="row" className="py-3 pr-4 font-normal">{row.service}</th>
                <td className="py-3">{row.fee}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </>
  )
}
