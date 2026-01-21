import { updatePassword } from './actions'

export default async function ResetPassword(props: {
  searchParams: Promise<{ message: string }>
}) {
  const searchParams = await props.searchParams

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md">
        <h1 className="text-2xl font-bold text-center">Set New Password</h1>
        
        {searchParams.message && (
          <div className="bg-red-100 text-red-800 p-3 rounded text-sm text-center">
            {searchParams.message}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">New Password</label>
          <input 
            name="password" 
            type="password" 
            required 
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500" 
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Confirm Password</label>
          <input 
            name="confirmPassword" 
            type="password" 
            required 
            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500" 
          />
        </div>

        <button 
          formAction={updatePassword} 
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
        >
          Update Password
        </button>
      </form>
    </div>
  )
}