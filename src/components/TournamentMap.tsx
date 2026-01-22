export default function TournamentMap({ lat, lng }: { lat: number; lng: number }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return <div className="bg-gray-100 h-64 flex items-center justify-center text-gray-500">Map Unavailable (Missing API Key)</div>
  }

  // Construct the Embed URL
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=15`

  return (
    <iframe
      width="100%"
      height="100%"
      style={{ border: 0 }}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
      src={mapUrl}
      className="rounded-lg shadow-sm"
    ></iframe>
  )
}