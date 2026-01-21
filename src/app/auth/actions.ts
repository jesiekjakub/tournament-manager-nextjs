'use server'

import { createClient } from '@/utils/supabase/server' // We will create this utility next
import { redirect } from 'next/navigation'

export async function signup(formData: FormData) {
  const supabase = createClient()

  // Extract data from the form
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string

  // Req 1: Register with metadata
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        firstName, // Passed to our SQL Trigger
        lastName,
      },
      emailRedirectTo: 'http://localhost:3000/auth/callback', // Confirms account
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Redirect to a success page telling them to check email
  redirect('/auth/check-email') 
}