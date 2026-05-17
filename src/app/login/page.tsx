'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login } from './actions'
import { initialActionState } from '@/lib/forms'
import SubmitButton from '@/components/SubmitButton'

export default function LoginPage() {
  const message = useSearchParams().get('message')
  const [state, formAction] = useActionState(login, initialActionState)

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gray-50">
      <form
        action={formAction}
        className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md"
      >
        <h1 className="text-2xl font-bold text-center text-gray-900">Sign In</h1>

        {state.error && (
          <div className="p-3 text-sm text-center text-white bg-red-500 rounded-md">
            {state.error}
          </div>
        )}
        {!state.error && message && (
          <div className="p-3 text-sm text-center text-blue-800 bg-blue-50 border border-blue-100 rounded-md">
            {message}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <input
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>

        <SubmitButton pendingLabel="Signing in…">Log In</SubmitButton>

        <div className="text-center text-sm">
          <Link href="/forgot-password" className="text-blue-500 hover:underline">
            I forgot my password
          </Link>
        </div>
        <div className="text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </div>
      </form>
    </div>
  )
}
