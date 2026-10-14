import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Refreshes the Supabase auth session on each request and gates /admin.
// Returns the response (with refreshed cookies). Coarse auth only — the
// fine-grained profiles.role check happens in the /admin layout server
// component, since the role lives in the DB, not the JWT.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getClaims() validates the JWT signature — safe to trust in the proxy.
  const { data } = await supabase.auth.getClaims()
  const isLoggedIn = !!data?.claims

  const { pathname } = request.nextUrl
  // The booking dashboard lives at /admin. Public /staff/[slug] bios are NOT gated.
  const isAdminArea = pathname.startsWith("/admin")
  const isLoginPage = pathname === "/admin/login"

  if (isAdminArea && !isLoginPage && !isLoggedIn) {
    const url = request.nextUrl.clone()
    url.pathname = "/admin/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
