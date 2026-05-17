import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-5xl font-black text-gray-900">404</h1>
      <p className="mt-2 text-gray-600">We couldn't find that page.</p>
      <Link
        href="/"
        className="mt-6 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Back to tournaments
      </Link>
    </main>
  )
}
