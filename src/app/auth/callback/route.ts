import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // SUCCESS: The session cookie is set by exchangeCodeForSession.
      // We explicitly verify the user exists before redirecting.
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // If we get here, the code was invalid or expired
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}