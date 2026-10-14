import { NextResponse } from "next/server"
import { z } from "zod"
import { getServiceClient } from "@/lib/supabase/service"
import { getStaffProfile } from "@/lib/booking/staff"
import { staffAccessDisabledResponse } from "@/lib/booking/staff-feature-gate"

const daySchema = z.object({
  weekday: z.number().int().min(0).max(6),
  on: z.boolean(),
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
  slotMinutes: z.number().int().min(5).max(120),
})

const exceptionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().max(200).optional(),
})

const saveSchema = z.object({
  providerId: z.string().uuid(),
  appointmentTypeId: z.string().uuid().nullable().optional(),
  week: z.array(daySchema).length(7),
  exceptions: z.array(exceptionSchema),
})

// GET /api/staff/availability?provider=<uuid> — current templates + exceptions.
export async function GET(req: Request) {
  const disabled = staffAccessDisabledResponse()
  if (disabled) return disabled

  const profile = await getStaffProfile()
  if (!profile) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const providerId = new URL(req.url).searchParams.get("provider")
  if (!providerId) return NextResponse.json({ error: "missing provider" }, { status: 400 })

  const sb = getServiceClient()
  const [{ data: templates }, { data: exceptions }] = await Promise.all([
    sb.from("availability_templates").select("*").eq("provider_id", providerId),
    sb.from("availability_exceptions").select("*").eq("provider_id", providerId).eq("type", "block"),
  ])
  return NextResponse.json({ templates: templates ?? [], exceptions: exceptions ?? [] })
}

// POST /api/staff/availability — replace a provider's weekly template +
// exceptions, then regenerate slots for the rolling 60-day window.
export async function POST(req: Request) {
  const disabled = staffAccessDisabledResponse()
  if (disabled) return disabled

  const profile = await getStaffProfile()
  if (!profile) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = saveSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "validation", details: parsed.error.flatten() }, { status: 400 })
  }
  const { providerId, appointmentTypeId, week, exceptions } = parsed.data
  const sb = getServiceClient()

  // Replace templates: delete existing, insert the active days.
  await sb.from("availability_templates").delete().eq("provider_id", providerId)
  const rows = week
    .filter((d) => d.on)
    .map((d) => ({
      provider_id: providerId,
      appointment_type_id: appointmentTypeId ?? null,
      weekday: d.weekday,
      start_time: d.start,
      end_time: d.end,
      slot_minutes: d.slotMinutes,
    }))
  if (rows.length > 0) {
    const { error } = await sb.from("availability_templates").insert(rows)
    if (error) return NextResponse.json({ error: "templates_failed" }, { status: 500 })
  }

  // Replace block exceptions.
  await sb
    .from("availability_exceptions")
    .delete()
    .eq("provider_id", providerId)
    .eq("type", "block")
  if (exceptions.length > 0) {
    const exRows = exceptions.map((e) => ({
      provider_id: providerId,
      date: e.date,
      type: "block",
      reason: e.reason ?? null,
    }))
    await sb.from("availability_exceptions").insert(exRows)
  }

  // Remove OPEN slots that no longer match the (new) templates — e.g. a day or
  // time the staff just turned off. Booked/held slots are never touched.
  const { error: pruneErr } = await sb.rpc("prune_orphan_slots", {
    p_provider: providerId,
  })
  if (pruneErr) return NextResponse.json({ error: "prune_failed" }, { status: 500 })

  // Regenerate the rolling 60-day window for the (new) active templates.
  // generate_slots is idempotent, so existing matching slots are kept.
  const today = new Date()
  const toDate = new Date(today)
  toDate.setDate(toDate.getDate() + 60)
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  const { error: genErr } = await sb.rpc("generate_slots", {
    p_provider: providerId,
    p_from: iso(today),
    p_to: iso(toDate),
  })
  if (genErr) return NextResponse.json({ error: "generate_failed" }, { status: 500 })

  // Count the open slots this provider now has, for the confirmation message.
  const { count } = await sb
    .from("slots")
    .select("id", { count: "exact", head: true })
    .eq("provider_id", providerId)
    .eq("status", "open")

  return NextResponse.json({ ok: true, openSlots: count ?? 0, openDays: rows.length })
}
