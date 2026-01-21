'use client' // 1. Add this to make it a Client Component

import { signup } from '../auth/actions'
import { useState } from 'react'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)

  // 2. Create a wrapper to handle the server response
  async function handleSubmit(formData: FormData) {
    const result = await signup(formData)
    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      {/* 3. Use the wrapper in the action prop */}
      <form action={handleSubmit} className="w-full max-w-md space-y-4 rounded-lg bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold text-center">Create Account</h1>
        
        {/* 4. Display errors if they exist */}
        {error && (
          <div className="p-3 text-sm text-white bg-red-500 rounded">{error}</div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <input name="firstName" placeholder="First Name" required className="border p-2 rounded text-black" />
          <input name="lastName" placeholder="Last Name" required className="border p-2 rounded text-black" />
        </div>
        
        <input name="email" type="email" placeholder="Email" required className="w-full border p-2 rounded text-black" />
        <input name="password" type="password" placeholder="Password" required className="w-full border p-2 rounded text-black" />
        
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Sign Up
        </button>
      </form>
    </div>
  )
}