'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = (formData.get('password') as string).trim()
  const confirmPassword = (formData.get('confirmPassword') as string).trim()

  if (password !== confirmPassword) {
    return redirect('/reset-password?message=Passwords do not match')
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    console.error("Supabase Password Update Error:", error.message)
    return redirect('/reset-password?message=Could not update password')
  }

  return redirect('/login?message=Password updated successfully')
}