import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  // Skip Next.js internals, image optimizer, favicon, static images, and the
  // Supabase auth callback (which needs the raw response unaltered).
  matcher: ['/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
