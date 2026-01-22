import Link from 'next/link'

export default function CheckEmailPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center border">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          ✉️
        </div>
        <h1 className="text-2xl font-bold mb-2">Check your email</h1>
        <p className="text-gray-600 mb-6">
          We have sent a confirmation link to your email address. 
          Please click the link to activate your account.
        </p>
        <p className="text-sm text-gray-400">
          The link will expire in 24 hours.
        </p>
        
        <div className="mt-8 pt-6 border-t">
          <Link href="/login" className="text-blue-600 hover:underline text-sm">
            Return to Login
          </Link>
        </div>
      </div>
    </main>
  )
}