'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'http://localhost:3000/auth/callback?next=/reset-password',
  })

  if (error) {
    return redirect('/forgot-password?message=Could not send reset email')
  }

  return redirect('/forgot-password?message=Check your email for the reset link')
}