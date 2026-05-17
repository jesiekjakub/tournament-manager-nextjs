'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { type ActionState, fail, failFromZod } from '@/lib/forms'
import { signupSchema } from '@/lib/validation'
import { getSiteURL } from '@/lib/url'

export async function signup(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
  })
  if (!parsed.success) return failFromZod(parsed.error)

  const { email, password, firstName, lastName } = parsed.data
  const supabase = await createClient()
  // firstName/lastName arrive on the auth.users row via raw_user_meta_data and
  // are mirrored into public.users by setup_trigger.sql.
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { firstName, lastName },
      emailRedirectTo: `${getSiteURL()}/auth/callback`,
    },
  })
  if (error) return fail(error.message)

  redirect('/auth/check-email')
}
