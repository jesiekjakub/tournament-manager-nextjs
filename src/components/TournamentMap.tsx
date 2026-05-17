import { PLACE_MAP_ZOOM } from '@/lib/constants'

interface TournamentMapProps {
  lat: number
  lng: number
}

export default function TournamentMap({ lat, lng }: TournamentMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return (
      <div className="bg-gray-100 h-full flex items-center justify-center text-gray-500">
        Map unavailable (no Google Maps API key configured)
      </div>
    )
  }

  const src = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=${PLACE_MAP_ZOOM}`

  return (
    <iframe
      title="Tournament location"
      width="100%"
      height="100%"
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
      src={src}
      className="rounded-lg shadow-sm border-0"
    />
  )
}
