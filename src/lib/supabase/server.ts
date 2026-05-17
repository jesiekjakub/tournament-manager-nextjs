import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Supabase client for Server Components and Server Actions. Cookie writes are
 * silently dropped when called from a Server Component context (where the
 * cookies API is read-only) — that's expected; the middleware refreshes
 * sessions on every request, so the missed write is recovered on next nav.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Read-only context (Server Component) — see module docstring.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // Read-only context — see module docstring.
          }
        },
      },
    },
  )
}
