import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { updateSession } from "@/lib/supabase/proxy"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Legacy path redirects (no session work needed).
  if (pathname === "/index.html" || pathname === "/home") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Refresh the Supabase session + gate /staff. Returns a response carrying
  // refreshed auth cookies (or a redirect to the staff login).
  const response = await updateSession(request)

  // Security headers on every response.
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
}
