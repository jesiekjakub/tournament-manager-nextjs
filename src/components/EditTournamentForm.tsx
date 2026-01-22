'use client'

import { useActionState } from 'react'
import { updateTournament } from '@/app/tournaments/[id]/edit/actions'
import { Tournament } from '@prisma/client'

// Helper to format dates for HTML input (YYYY-MM-DDTHH:MM)
function formatDateForInput(date: Date) {
  return new Date(date).toISOString().slice(0, 16)
}

export default function EditTournamentForm({ tournament }: { tournament: Tournament }) {
  const [state, formAction, isPending] = useActionState(updateTournament, { error: '' })

  return (
    <form action={formAction} className="space-y-6 bg-white p-8 rounded-lg shadow border">
      <input type="hidden" name="id" value={tournament.id} />
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Tournament Title</label>
        <input 
          type="text" 
          name="title" 
          defaultValue={tournament.title}
          required 
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Discipline</label>
          <input 
            type="text" 
            name="discipline" 
            defaultValue={tournament.discipline}
            required 
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Max Participants</label>
          <input 
            type="number" 
            name="maxParticipants" 
            defaultValue={tournament.maxParticipants}
            required 
            min="2"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date & Time</label>
          <input 
            type="datetime-local" 
            name="date" 
            defaultValue={formatDateForInput(tournament.date)}
            required 
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Application Deadline</label>
          <input 
            type="datetime-local" 
            name="deadline" 
            defaultValue={formatDateForInput(tournament.deadline)}
            required 
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">Must be at least 15 mins before start.</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Location Name</label>
        <input 
          type="text" 
          name="locationName" 
          defaultValue={tournament.locationName}
          required 
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Sponsor Logos (URLs)</label>
        <input 
          type="text" 
          name="sponsorLogos" 
          defaultValue={tournament.sponsorLogos.join(', ')}
          placeholder="https://logo1.png, https://logo2.png"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
        <p className="text-xs text-gray-500">Comma separated URLs</p>
      </div>

      {state.error && (
        <div className="p-3 bg-red-50 text-red-600 rounded text-sm border border-red-200">
          ⚠ {state.error}
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <button 
          type="submit" 
          disabled={isPending}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:bg-blue-300"
        >
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
        <a 
          href={`/tournaments/${tournament.id}`}
          className="px-6 py-2 border rounded text-gray-600 hover:bg-gray-50 transition"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}