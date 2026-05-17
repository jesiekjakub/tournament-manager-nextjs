import Link from 'next/link'

export default function AuthCodeErrorPage() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-900">Link expired</h1>
        <p className="text-gray-600">
          That confirmation link is no longer valid. Sign in to request a new one.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/login"
            className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Sign in
          </Link>
          <Link
            href="/forgot-password"
            className="px-5 py-2 border rounded text-gray-700 hover:bg-gray-50 transition"
          >
            Reset password
          </Link>
        </div>
      </div>
    </main>
  )
}
