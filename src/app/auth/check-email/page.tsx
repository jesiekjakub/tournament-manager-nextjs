import Link from 'next/link'

export default function CheckEmailPage() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border text-center space-y-4">
        <div className="text-4xl">📬</div>
        <h1 className="text-2xl font-bold text-gray-900">Confirm your email</h1>
        <p className="text-gray-600">
          We sent a confirmation link to the address you provided. Open it within
          24 hours to activate your account.
        </p>
        <Link
          href="/login"
          className="inline-block px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Back to sign in
        </Link>
      </div>
    </main>
  )
}
