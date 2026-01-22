'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function SponsorCarousel({ logos }: { logos: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // Only set up the timer if we have more than one logo
    if (logos.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % logos.length)
    }, 10000) // 10 seconds

    return () => clearInterval(interval)
  }, [logos.length])

  if (logos.length === 0) return null

  return (
    <div className="w-full h-48 bg-white rounded-lg shadow-sm border p-4 flex items-center justify-center relative overflow-hidden">
      <div className="relative w-full h-full">
        <Image
          src={logos[currentIndex]}
          alt={`Sponsor ${currentIndex + 1}`}
          fill
          className="object-contain transition-opacity duration-500"
          unoptimized // Keeps GIFs animated
        />
      </div>
      
      {/* Optional: Simple indicator dots */}
      {logos.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
          {logos.map((_, idx) => (
            <div 
              key={idx}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}