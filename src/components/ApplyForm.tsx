'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { applyForTournament } from '@/app/tournaments/[id]/actions'
import { initialActionState } from '@/lib/forms'
import SubmitButton from './SubmitButton'

interface ApplyFormProps {
  tournamentId: string
  title: string
}

export default function ApplyForm({ tournamentId, title }: ApplyFormProps) {
  const [state, formAction] = useActionState(applyForTournament, initialActionState)

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full border">
      <h1 className="text-2xl font-bold mb-2">Join Tournament</h1>
      <p className="text-gray-600 mb-6">
        You are applying for{' '}
        <span className="font-semibold text-blue-600">{title}</span>
      </p>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="tournamentId" value={tournamentId} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
          <input
            name="licenseNumber"
            type="text"
            required
            placeholder="e.g. LIC-12345"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">Must be unique for this tournament.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Ranking</label>
          <input
            name="currentRanking"
            type="number"
            required
            min={1}
            placeholder="e.g. 15"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">Your seed is derived from this rank.</p>
        </div>

        {state.error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {state.error}
          </div>
        )}

        <div className="pt-4 flex gap-3">
          <SubmitButton
            pendingLabel="Applying…"
            className="flex-1 bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:bg-blue-300 transition"
          >
            Confirm Application
          </SubmitButton>
          <Link
            href={`/tournaments/${tournamentId}`}
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
