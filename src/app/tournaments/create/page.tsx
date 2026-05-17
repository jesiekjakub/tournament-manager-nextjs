'use client'

import { useActionState, useState } from 'react'
import LocationPicker from '@/components/LocationPicker'
import SubmitButton from '@/components/SubmitButton'
import { createTournament } from './actions'
import { initialActionState } from '@/lib/forms'

export default function CreateTournamentPage() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [state, formAction] = useActionState(createTournament, initialActionState)

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Host a Tournament</h1>

      {state.error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 border border-red-200">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-6">
        <div>
          <label className="block text-sm font-medium">Tournament Title</label>
          <input
            name="title"
            required
            placeholder="e.g., Summer Chess Cup"
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Discipline</label>
            <input
              name="discipline"
              required
              placeholder="e.g., Tennis, FIFA 24"
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Max Participants</label>
            <input
              name="maxParticipants"
              type="number"
              min={2}
              max={1024}
              required
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Date of Event</label>
            <input
              name="date"
              type="datetime-local"
              required
              max="2099-12-31T23:59"
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Application Deadline</label>
            <input
              name="deadline"
              type="datetime-local"
              required
              max="2099-12-31T23:59"
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Location (click the map to set a pin)
          </label>
          <LocationPicker onLocationSelect={(lat, lng) => setCoords({ lat, lng })} />
          <input type="hidden" name="lat" value={coords?.lat ?? ''} required />
          <input type="hidden" name="lng" value={coords?.lng ?? ''} required />
          <input
            name="locationName"
            placeholder="Location Name (e.g., Central Park)"
            required
            className="w-full border p-2 rounded mt-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Sponsor Logos</label>
          <input
            name="logos"
            type="file"
            multiple
            accept="image/*"
            className="w-full border p-2 rounded"
          />
          <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple images.</p>
        </div>

        <SubmitButton
          pendingLabel="Creating…"
          className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 disabled:bg-blue-300 transition"
        >
          Create Tournament
        </SubmitButton>
      </form>
    </div>
  )
}
