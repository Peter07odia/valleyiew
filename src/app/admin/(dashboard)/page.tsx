import { redirect } from "next/navigation"
import { getStaffProfile } from "@/lib/booking/staff"
import {
  getPendingRequests,
  getTodayAppointments,
  getUpcomingAppointments,
} from "@/lib/booking/staff-queries"
import { StaffDashboard } from "@/components/staff/staff-dashboard"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  // Guard before fetching so we redirect cleanly instead of throwing when the
  // visitor isn't staff (e.g. logged out, or logged in without a profile).
  const profile = await getStaffProfile()
  if (!profile) redirect("/admin/login")

  const [requests, today, upcoming] = await Promise.all([
    getPendingRequests(),
    getTodayAppointments(),
    getUpcomingAppointments(),
  ])

  return (
    <StaffDashboard
      requests={requests}
      today={today}
      upcoming={upcoming}
    />
  )
}
