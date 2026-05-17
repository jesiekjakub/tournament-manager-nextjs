'use client'

import { useActionState } from 'react'
import { updatePassword } from './actions'
import { initialActionState } from '@/lib/forms'
import SubmitButton from '@/components/SubmitButton'

export default function ResetPasswordPage() {
  const [state, formAction] = useActionState(updatePassword, initialActionState)

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gray-50">
      <form
        action={formAction}
        className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md"
      >
        <h1 className="text-2xl font-bold text-center">Set New Password</h1>

        {state.error && (
          <div className="p-3 text-sm text-white bg-red-500 rounded text-center">
            {state.error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">New Password</label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Confirm Password</label>
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <SubmitButton pendingLabel="Updating…">Update Password</SubmitButton>
      </form>
    </div>
  )
}
