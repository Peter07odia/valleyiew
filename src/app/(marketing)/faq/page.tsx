import Link from "next/link"
import { PageHero } from "@/components/shared/page-hero"
export const metadata = { title: "Patient Questions" }
const items=[
  ["How do I register as a new patient?","Complete the two-step registration form and choose your preferred clinic. The clinic will review your request and contact you. Submitting the form does not confirm acceptance or book an appointment."],
  ["How do I book an appointment?","Choose your clinic on the booking page and continue to its Ocean booking service. For appointment types not offered online, or if you need help, call your clinic."],
  ["Can I visit without an appointment?","Walk-in availability varies by location and physician schedule. Call the clinic before visiting."],
  ["What should I bring?","Bring your health card, an up-to-date list of medications and any information the clinic has asked you to bring."],
  ["How do I cancel or change an appointment?","Use the instructions in your appointment confirmation or contact your clinic directly. The website chat cannot change appointments."],
  ["Can the chat assistant answer health questions?","The assistant helps with public clinic information only. Contact your clinic for personal health concerns. For a medical emergency, call 911."],
]
export default function FAQPage(){return <><PageHero title="A little guidance before your visit." description="Answers to common questions about registration, appointments and finding your clinic."/><section className="mx-auto max-w-3xl px-5 py-16">{items.map(([q,a])=><details key={q} className="border-b border-secondary/15 py-5"><summary className="cursor-pointer text-lg font-semibold text-secondary">{q}</summary><p className="pt-4 leading-7 text-muted-foreground">{a}</p></details>)}<Link className="mt-8 inline-block font-semibold text-primary underline" href="/contact">Contact your clinic</Link></section></>}
