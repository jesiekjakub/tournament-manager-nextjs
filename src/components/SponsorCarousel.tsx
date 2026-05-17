'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { CAROUSEL_INTERVAL_MS } from '@/lib/constants'

export default function SponsorCarousel({ logos }: { logos: string[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (logos.length <= 1) return
    const id = setInterval(() => setIndex((prev) => (prev + 1) % logos.length), CAROUSEL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [logos.length])

  if (logos.length === 0) return null

  return (
    <div className="w-full h-48 bg-white rounded-lg shadow-sm border p-4 flex items-center justify-center relative overflow-hidden">
      <div className="relative w-full h-full">
        <Image
          src={logos[index]}
          alt={`Sponsor ${index + 1}`}
          fill
          className="object-contain transition-opacity duration-500"
          unoptimized
        />
      </div>
      {logos.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
          {logos.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === index ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
