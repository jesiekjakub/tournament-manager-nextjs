import Link from 'next/link'

export default function AuthCodeErrorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center border border-red-100">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          ⚠
        </div>
        <h1 className="text-2xl font-bold mb-2 text-gray-800">Authentication Error</h1>
        <p className="text-gray-600 mb-6">
          There was a problem verifying your account. The link may have expired or has already been used.
        </p>
        
        <div className="flex flex-col gap-3">
          <Link 
            href="/login" 
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Try Logging In
          </Link>
          <Link 
            href="/" 
            className="text-sm text-gray-500 hover:text-gray-800 hover:underline"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </main>
  )
}