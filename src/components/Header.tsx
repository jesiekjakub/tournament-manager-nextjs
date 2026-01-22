import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { signOut } from './auth-actions'

export default function Header({ user }: { user: User | null }) {
  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 grid grid-cols-3 items-center">
        
        {/* LEFT COLUMN: Profile Button (or empty) */}
        <div className="flex justify-start">
          {user ? (
            <Link 
              href="/profile" 
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition"
            >
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                {/* Fallback avatar icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="hidden md:block">Profile</span>
            </Link>
          ) : (
            // Placeholder to keep the title centered if logged out
            <div />
          )}
        </div>

        {/* CENTER COLUMN: Title */}
        <div className="flex justify-center">
          <Link href="/" className="text-xl font-bold text-gray-800 hover:opacity-80 transition">
            🏆 Tournament Manager
          </Link>
        </div>

        {/* RIGHT COLUMN: Auth Actions */}
        <div className="flex justify-end">
          {user ? (
            <form action={signOut}>
              <button className="text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded transition border border-transparent hover:border-red-100">
                Log Out
              </button>
            </form>
          ) : (
            <Link 
              href="/login" 
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition shadow-sm"
            >
              Log In
            </Link>
          )}
        </div>

      </div>
    </header>
  )
}