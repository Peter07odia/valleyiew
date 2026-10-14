import type { Metadata } from "next"

import { LocationTeamSection } from "@/components/team/location-team-section"

export const metadata: Metadata = {
  title: "Our Team",
  description:
    "Meet the family physicians across all seven Valleyview Medical Centre clinics.",
}

export default function TeamPage() {
  return <LocationTeamSection />
}
