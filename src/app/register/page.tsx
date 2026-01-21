import { signup } from '../auth/actions'

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form action={signup} className="w-full max-w-md space-y-4 rounded-lg bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold text-center">Create Account</h1>
        
        <div className="grid grid-cols-2 gap-4">
          <input name="firstName" placeholder="First Name" required className="border p-2 rounded" />
          <input name="lastName" placeholder="Last Name" required className="border p-2 rounded" />
        </div>
        
        <input name="email" type="email" placeholder="Email" required className="w-full border p-2 rounded" />
        <input name="password" type="password" placeholder="Password" required className="w-full border p-2 rounded" />
        
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Sign Up
        </button>
      </form>
    </div>
  )
}