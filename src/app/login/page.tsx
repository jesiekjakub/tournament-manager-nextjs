'use client' // Allows us to use interactivity and hooks

import { login } from './actions'
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
  // This hook lets us read the "?message=..." from the URL
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      {/* We use action={login} on the form itself for standard Server Action behavior */}
      <form action={login} className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">Sign In</h1>
        
        {/* Requirement 40: Feedback for the user */}
        {message && (
          <div className="p-3 text-sm text-center text-white bg-red-500 rounded-md animate-pulse">
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

        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition font-semibold"
        >
          Log In
        </button>

        <div className="text-center text-sm">
          <a href="/forgot-password" className="text-blue-500 hover:underline">
            I forgot my password
          </a>
        </div>
        
        <div className="text-center text-sm text-gray-500">
          Don't have an account? <a href="/register" className="text-blue-500 hover:underline">Sign up</a>
        </div>
      </form>
    </div>
  )
}