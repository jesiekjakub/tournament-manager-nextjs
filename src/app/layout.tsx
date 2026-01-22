import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from 'next/script'
import Header from '@/components/Header' // <--- Added Header
import { createClient } from '@/utils/supabase/server' // <--- Added Auth

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tournament Manager", // Updated title
  description: "Manage your tournaments with ease",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 1. Fetch User Session (Server Side)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen flex flex-col`}
      >
        {/* Google Maps Script loaded with beforeInteractive strategy */}
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="beforeInteractive"
        />

        {/* 2. Persistent Header */}
        <Header user={user} />

        {/* 3. Main Content Area */}
        <div className="flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}