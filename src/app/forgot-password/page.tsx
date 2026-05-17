'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { forgotPassword } from './actions'
import { initialActionState } from '@/lib/forms'
import SubmitButton from '@/components/SubmitButton'

export default function ForgotPasswordPage() {
  const message = useSearchParams().get('message')
  const [state, formAction] = useActionState(forgotPassword, initialActionState)

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gray-50">
      <form
        action={formAction}
        className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md"
      >
        <h1 className="text-2xl font-bold text-center">Reset Password</h1>

        {state.error && (
          <div className="p-3 text-sm text-white bg-red-500 rounded">{state.error}</div>
        )}
        {!state.error && message && (
          <div className="bg-blue-50 text-blue-800 border border-blue-100 p-3 rounded text-sm text-center">
            {message}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Enter your email</label>
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <SubmitButton pendingLabel="Sending…">Send Reset Link</SubmitButton>

        <div className="text-center text-sm">
          <Link href="/login" className="text-gray-500 hover:text-gray-900">
            ← Back to Login
          </Link>
        </div>
      </form>
    </div>
  )
}
