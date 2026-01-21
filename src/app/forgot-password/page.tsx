import { forgotPassword } from './actions'
import Link from 'next/link'

export default function ForgotPassword({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold text-center">Reset Password</h1>
        
        {searchParams.message && (
          <div className="bg-blue-100 text-blue-800 p-3 rounded text-sm text-center">
            {searchParams.message}
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

        <button 
          formAction={forgotPassword} 
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
        >
          Send Reset Link
        </button>

        <div className="text-center text-sm">
          <Link href="/login" className="text-gray-500 hover:text-gray-900">
            &larr; Back to Login
          </Link>
        </div>
      </form>
    </div>
  )
}