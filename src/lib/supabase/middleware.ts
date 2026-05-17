import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PREFIXES = ['/reset-password'] as const

/**
 * Runs on every request the matcher in `src/proxy.ts` lets through. Refreshes
 * the Supabase session cookie so server components always see an up-to-date
 * user, and gates the password-reset flow behind authentication (it relies on
 * a fresh session from the email-link callback).
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

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
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  if (!user && PROTECTED_PREFIXES.some((p) => path.startsWith(p))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}
