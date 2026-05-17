'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Next.js gives us the digest of the server-side error; logging here makes
    // it findable in browser logs without exposing the message.
    if (error.digest) console.error(`Error digest: ${error.digest}`)
  }, [error])

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-3xl font-bold text-gray-900">Something went wrong.</h1>
      <p className="mt-2 text-gray-600">
        The request didn't complete. You can retry, or head back home.
      </p>
      <div className="flex gap-3 mt-6">
        <button
          onClick={reset}
          className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Try again
        </button>
        <a
          href="/"
          className="px-5 py-2 border rounded text-gray-700 hover:bg-gray-50 transition"
        >
          Home
        </a>
      </div>
    </main>
  )
}
