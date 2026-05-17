'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signup } from '../auth/actions'
import { initialActionState } from '@/lib/forms'
import SubmitButton from '@/components/SubmitButton'

export default function RegisterPage() {
  const [state, formAction] = useActionState(signup, initialActionState)

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gray-50">
      <form
        action={formAction}
        className="w-full max-w-md space-y-4 rounded-lg bg-white p-8 shadow-md"
      >
        <h1 className="text-2xl font-bold text-center">Create Account</h1>

        {state.error && (
          <div className="p-3 text-sm text-white bg-red-500 rounded">{state.error}</div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <input
            name="firstName"
            placeholder="First Name"
            required
            className="border p-2 rounded text-black"
          />
          <input
            name="lastName"
            placeholder="Last Name"
            required
            className="border p-2 rounded text-black"
          />
        </div>

        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full border p-2 rounded text-black"
        />
        <input
          name="password"
          type="password"
          placeholder="Password (min 8 characters)"
          required
          minLength={8}
          className="w-full border p-2 rounded text-black"
        />

        <SubmitButton pendingLabel="Creating account…">Sign Up</SubmitButton>

        <div className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-500 hover:underline">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  )
}
