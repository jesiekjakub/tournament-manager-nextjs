'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { type ActionState, fail, failFromZod } from '@/lib/forms'
import { forgotPasswordSchema } from '@/lib/validation'
import { getSiteURL } from '@/lib/url'

export async function forgotPassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) return failFromZod(parsed.error)

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getSiteURL()}/auth/callback?next=/reset-password`,
  })
  if (error) return fail('Could not send reset email')

  redirect('/forgot-password?message=Check%20your%20email%20for%20the%20reset%20link')
}
