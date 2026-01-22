import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // 1. Create an initial response
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 2. Create the client attached to this response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Update the request cookies (so the Server Action sees them)
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          
          // Re-create the response to include the new cookies
          supabaseResponse = NextResponse.next({
            request,
          })
          
          // Write the cookies to the response (so the Browser sees them)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Refresh the session (This triggers the setAll logic above)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 4. Protect the /reset-password route
  // If no user is found, force them back to login
  if (request.nextUrl.pathname.startsWith('/reset-password') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}