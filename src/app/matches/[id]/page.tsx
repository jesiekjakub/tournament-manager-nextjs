import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { uuidSchema } from '@/lib/validation'
import { submitMatchResult } from './actions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MatchPage({ params }: PageProps) {
  const { id } = await params
  if (!uuidSchema.safeParse(id).success) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      tournament: { select: { id: true, title: true } },
      player1: { include: { user: true } },
      player2: { include: { user: true } },
      winner: { include: { user: true } },
    },
  })
  if (!match) notFound()

  const isP1 = match.player1?.userId === user.id
  const isP2 = match.player2?.userId === user.id
  const isParticipant = isP1 || isP2
  const myVote = isP1 ? match.player1Result : isP2 ? match.player2Result : null

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full text-center">
        <h1 className="text-xl font-bold text-gray-500 mb-2">{match.tournament.title}</h1>
        <div className="text-4xl font-black mb-8 flex justify-center items-center gap-4">
          <span className={match.winnerId === match.player1Id ? 'text-green-600' : ''}>
            {match.player1?.user.firstName ?? 'TBD'}
          </span>
          <span className="text-gray-300 text-2xl">VS</span>
          <span className={match.winnerId === match.player2Id ? 'text-green-600' : ''}>
            {match.player2?.user.firstName ?? 'TBD'}
          </span>
        </div>

        {match.winnerId ? (
          <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-green-800 mb-2">Match Completed</h2>
            <p className="text-green-700">
              Winner:{' '}
              <strong>
                {match.winner?.user.firstName} {match.winner?.user.lastName}
              </strong>
            </p>
            <div className="mt-4">
              <Link
                href={`/tournaments/${match.tournament.id}`}
                className="text-blue-600 hover:underline"
              >
                Return to tournament ladder
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {!isParticipant && (
              <p className="text-gray-500 italic">This match is in progress.</p>
            )}

            {isParticipant && myVote && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-blue-800 font-medium">
                  You voted for:{' '}
                  <strong>
                    {myVote === match.player1Id
                      ? match.player1?.user.firstName
                      : match.player2?.user.firstName}
                  </strong>
                </p>
                <p className="text-sm text-blue-600 mt-1">Waiting for opponent confirmation…</p>
              </div>
            )}

            {isParticipant && !myVote && match.player1 && match.player2 && (
              <div>
                <h3 className="text-lg font-bold mb-4">Select the Winner</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Both players must pick the same winner. Conflicting votes are reset and you'll
                  be asked again.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <form
                    action={async () => {
                      'use server'
                      await submitMatchResult(match.id, match.player1!.id)
                    }}
                  >
                    <button className="w-full py-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition group">
                      <span className="block text-lg font-bold group-hover:text-blue-700">
                        {match.player1.user.firstName} {match.player1.user.lastName}
                      </span>
                      {isP1 && <span className="text-xs text-gray-400">(That's you)</span>}
                    </button>
                  </form>
                  <form
                    action={async () => {
                      'use server'
                      await submitMatchResult(match.id, match.player2!.id)
                    }}
                  >
                    <button className="w-full py-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition group">
                      <span className="block text-lg font-bold group-hover:text-blue-700">
                        {match.player2.user.firstName} {match.player2.user.lastName}
                      </span>
                      {isP2 && <span className="text-xs text-gray-400">(That's you)</span>}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
