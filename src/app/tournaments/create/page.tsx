'use client'

import { createTournament } from './actions'
import LocationPicker from '@/components/LocationPicker'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function CreateTournamentPage() {
  const [lat, setLat] = useState(0)
  const [lng, setLng] = useState(0)
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Host a Tournament</h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <form action={createTournament} className="space-y-6">
        <div>
          <label className="block text-sm font-medium">Tournament Title</label>
          <input name="title" required placeholder="e.g., Summer Chess Cup" className="w-full border p-2 rounded" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Discipline</label>
            {/* CHANGED: Now a text input for freedom  */}
            <input 
              name="discipline" 
              required 
              placeholder="e.g., Tennis, FIFA 24" 
              className="w-full border p-2 rounded" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Max Participants</label>
            <input name="maxParticipants" type="number" min="2" required className="w-full border p-2 rounded" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Date of Event</label>
            <input name="date" type="datetime-local" required max="2099-12-31T23:59" className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Application Deadline</label>
            <input name="deadline" type="datetime-local" required max="2099-12-31T23:59" className="w-full border p-2 rounded" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Location (Click map to set pin)</label>
          <LocationPicker onLocationSelect={(lat, lng) => {
            setLat(lat)
            setLng(lng)
          }} />
          {/* Hidden inputs to pass map data to the server */}
          <input type="hidden" name="lat" value={lat} />
          <input type="hidden" name="lng" value={lng} />
          <input name="locationName" placeholder="Location Name (e.g., Central Park)" required className="w-full border p-2 rounded mt-2" />
        </div>

        <div>
          <label className="block text-sm font-medium">Sponsor Logos</label>
          {/* 'multiple' allows selecting multiple files at once */}
          <input 
            name="logos" 
            type="file" 
            multiple 
            accept="image/*" 
            className="w-full border p-2 rounded" 
          />
          <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple images.</p>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700">
          Create Tournament
        </button>
      </form>
    </div>
  )
}