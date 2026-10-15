import type { Metadata } from "next"

import { TeamDirectory } from "@/components/team/team-directory"

export const metadata: Metadata = {
  title: "Our Team",
  description:
    "Meet the doctors, administrative team, pharmacists and management across the seven Valleyview Medical Centre clinics.",
}

export default function TeamPage() {
  return <TeamDirectory />
}
