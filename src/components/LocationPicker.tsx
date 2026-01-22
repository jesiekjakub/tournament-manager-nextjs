'use client'

import { useEffect, useRef, useState } from 'react'

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void
}

export default function LocationPicker({ onLocationSelect }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Default view (e.g., Center of Warsaw)
    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 52.4066, lng: 16.9513 },
      zoom: 10,
    })

    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      const lat = e.latLng?.lat()
      const lng = e.latLng?.lng()

      if (lat && lng) {
        // Remove old marker
        if (marker) marker.setMap(null)

        // Add new marker
        const newMarker = new google.maps.Marker({
          position: { lat, lng },
          map: map,
        })
        setMarker(newMarker)
        onLocationSelect(lat, lng)
      }
    })
  }, []) // Run once on mount

  return <div ref={mapRef} className="w-full h-64 border rounded-md" />
}