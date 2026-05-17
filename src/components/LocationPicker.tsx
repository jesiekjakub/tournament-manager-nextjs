'use client'

import { useEffect, useRef } from 'react'
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/lib/constants'

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void
}

export default function LocationPicker({ onLocationSelect }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  // Marker lives in a ref so successive map clicks see the previous instance —
  // a state-based marker reads as `null` inside the click handler due to React
  // closing over the value at listener registration time.
  const markerRef = useRef<google.maps.Marker | null>(null)

  useEffect(() => {
    if (!mapRef.current) return
    if (typeof google === 'undefined') return

    const map = new google.maps.Map(mapRef.current, {
      center: DEFAULT_MAP_CENTER,
      zoom: DEFAULT_MAP_ZOOM,
    })

    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      const lat = e.latLng?.lat()
      const lng = e.latLng?.lng()
      if (typeof lat !== 'number' || typeof lng !== 'number') return

      markerRef.current?.setMap(null)
      markerRef.current = new google.maps.Marker({ position: { lat, lng }, map })
      onLocationSelect(lat, lng)
    })
  }, [onLocationSelect])

  return <div ref={mapRef} className="w-full h-64 border rounded-md" />
}
