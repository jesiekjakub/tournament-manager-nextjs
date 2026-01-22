'use client'

import { useEffect, useRef } from 'react'

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void
}

export default function LocationPicker({ onLocationSelect }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  // use a ref instead of state to avoid closure staleness in event listeners
  const markerRef = useRef<google.maps.Marker | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 52.4066, lng: 16.9513 }, 
      zoom: 10,
    })

    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      const lat = e.latLng?.lat()
      const lng = e.latLng?.lng()

      if (lat && lng) {
        // Remove the previous marker if it exists
        if (markerRef.current) {
          markerRef.current.setMap(null)
        }

        // Create and set the new marker
        const newMarker = new google.maps.Marker({
          position: { lat, lng },
          map: map,
        })
        
        // Update our reference so we can delete it next click
        markerRef.current = newMarker
        
        // Send coordinates to the parent form
        onLocationSelect(lat, lng)
      }
    })
  }, [onLocationSelect])

  return <div ref={mapRef} className="w-full h-64 border rounded-md" />
}