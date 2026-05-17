import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Script from 'next/script'
import Header from '@/components/Header'
import { createClient } from '@/lib/supabase/server'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tournament Manager',
  description: 'Schedule, seed, and run single-elimination tournaments end to end.',
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen flex flex-col`}
      >
        {/*
          afterInteractive avoids the hydration warnings that beforeInteractive
          triggered with Google Maps, and the script is omitted entirely when no
          API key is set so dev environments without a key still boot cleanly.
        */}
        {mapsKey && (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${mapsKey}&libraries=places`}
            strategy="afterInteractive"
          />
        )}
        <Header user={user} />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  )
}
