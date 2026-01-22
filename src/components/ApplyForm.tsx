'use client'

import { useActionState } from 'react' // If you are on Next.js 14, import { useFormState } from 'react-dom' instead
import { applyForTournament } from '@/app/tournaments/[id]/actions'

interface ApplyFormProps {
  tournamentId: string
  title: string
}

const initialState = {
  error: '',
}

export default function ApplyForm({ tournamentId, title }: ApplyFormProps) {
  // Hook matches the updated action signature (prevState, formData)
  // If using Next.js 14, change useActionState to useFormState
  const [state, formAction, isPending] = useActionState(applyForTournament, initialState)

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full border">
      <h1 className="text-2xl font-bold mb-2">Join Tournament</h1>
      <p className="text-gray-600 mb-6">
        You are applying for <span className="font-semibold text-blue-600">{title}</span>
      </p>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="tournamentId" value={tournamentId} />

        {/* License Number [cite: 5, 16] */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            License Number
          </label>
          <input 
            name="licenseNumber"
            type="text" 
            required
            placeholder="e.g. LIC-12345"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">Must be unique for this tournament.</p>
        </div>

        {/* Ranking [cite: 5, 16] */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Ranking
          </label>
          <input 
            name="currentRanking"
            type="number" 
            required
            min="1"
            placeholder="e.g. 15"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">Your seed will be based on this rank.</p>
        </div>

        {/* ERROR MESSAGE DISPLAY */}
        {state?.error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            ⚠ {state.error}
          </div>
        )}

        <div className="pt-4 flex gap-3">
          <button 
            type="submit"
            disabled={isPending}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-medium disabled:bg-blue-300"
          >
            {isPending ? 'Applying...' : 'Confirm Application'}
          </button>
          <a 
            href={`/tournaments/${tournamentId}`}
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}