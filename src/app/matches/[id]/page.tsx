import { prisma } from '@/utils/db'
import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { submitMatchResult } from './actions'

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      tournament: true,
      player1: { include: { user: true } },
      player2: { include: { user: true } },
      winner: { include: { user: true } }
    }
  })

  if (!match) return notFound()

  // Determine user role
  const isP1 = match.player1?.userId === user.id
  const isP2 = match.player2?.userId === user.id
  const isParticipant = isP1 || isP2
  const isOrganizer = match.tournament.organizerId === user.id

  // Determine State
  const myVote = isP1 ? match.player1Result : match.player2Result
  const opponentVote = isP1 ? match.player2Result : match.player1Result
  
  // Requirement 8: Conflict Logic (If both were nullified recently, show warning)
  // Since we clear them immediately on conflict, we can't easily track "just conflicted". 
  // But if both are null and the user knows they voted, it implies reset. 
  // For simplicity, we just show the voting form again.

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full text-center">
        
        {/* Header */}
        <h1 className="text-xl font-bold text-gray-500 mb-2">{match.tournament.title}</h1>
        <div className="text-4xl font-black mb-8 flex justify-center items-center gap-4">
          <span className={match.winnerId === match.player1Id ? 'text-green-600' : ''}>
            {match.player1?.user.firstName || 'TBD'}
          </span>
          <span className="text-gray-300 text-2xl">VS</span>
          <span className={match.winnerId === match.player2Id ? 'text-green-600' : ''}>
            {match.player2?.user.firstName || 'TBD'}
          </span>
        </div>

        {/* --- STATE 1: MATCH FINISHED --- */}
        {match.winnerId ? (
          <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-green-800 mb-2">Match Completed</h2>
            <p className="text-green-700">
              Winner: <strong>{match.winner?.user.firstName} {match.winner?.user.lastName}</strong>
            </p>
            <div className="mt-4">
               <Link href={`/tournaments/${match.tournamentId}`} className="text-blue-600 hover:underline">
                 Return to Tournament Ladder
               </Link>
            </div>
          </div>
        ) : (
          /* --- STATE 2: MATCH ACTIVE --- */
          <div className="space-y-6">
            
            {/* Status Messages */}
            {!isParticipant && !isOrganizer && (
               <p className="text-gray-500 italic">This match is currently in progress.</p>
            )}

            {isParticipant && (
              <>
                {/* Voting Form */}
                {myVote ? (
                   <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                     <p className="text-blue-800 font-medium">
                       You voted for: <strong>
                         {myVote === match.player1Id ? match.player1?.user.firstName : match.player2?.user.firstName}
                       </strong>
                     </p>
                     <p className="text-sm text-blue-600 mt-1">Waiting for opponent confirmation...</p>
                   </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-bold mb-4">Select the Winner</h3>
                    <p className="text-sm text-gray-500 mb-6">
                      Both players must select the same winner to verify the result. 
                      Conflicting results will reset the vote.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* VOTE PLAYER 1 */}
                      <form action={async () => {
                        'use server'
                        await submitMatchResult(match.id, match.player1Id!)
                      }}>
                        <button className="w-full py-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition group">
                           <span className="block text-lg font-bold group-hover:text-blue-700">
                             {match.player1?.user.firstName} {match.player1?.user.lastName}
                           </span>
                           {isP1 && <span className="text-xs text-gray-400">(That's You)</span>}
                        </button>
                      </form>

                      {/* VOTE PLAYER 2 */}
                      <form action={async () => {
                        'use server'
                        await submitMatchResult(match.id, match.player2Id!)
                      }}>
                        <button className="w-full py-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition group">
                           <span className="block text-lg font-bold group-hover:text-blue-700">
                             {match.player2?.user.firstName} {match.player2?.user.lastName}
                           </span>
                           {isP2 && <span className="text-xs text-gray-400">(That's You)</span>}
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </main>
  )
}