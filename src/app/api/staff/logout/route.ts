import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const sb = await getSupabaseServerClient()
  await sb.auth.signOut()
  return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 })
}
