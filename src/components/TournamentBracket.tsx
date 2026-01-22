'use client'

import { Match, Participant, User } from '@prisma/client'

// Define the shape of data we get from the DB (Match + Players + Users)
type MatchWithPlayers = Match & {
  player1: (Participant & { user: User }) | null
  player2: (Participant & { user: User }) | null
  winner: (Participant & { user: User }) | null
}

export default function TournamentBracket({ matches }: { matches: MatchWithPlayers[] }) {
  if (!matches || matches.length === 0) {
    return <div className="text-center text-gray-500 py-8 italic">Bracket has been generated, but no matches found.</div>
  }

  // 1. Group matches by Round
  const rounds: Record<number, MatchWithPlayers[]> = {}
  matches.forEach((match) => {
    if (!rounds[match.round]) {
      rounds[match.round] = []
    }
    rounds[match.round].push(match)
  })

  // 2. Sort rounds (1, 2, 3...) and matches inside them by position
  const sortedRoundNumbers = Object.keys(rounds).map(Number).sort((a, b) => a - b)
  sortedRoundNumbers.forEach((r) => {
    rounds[r].sort((a, b) => a.position - b.position)
  })

  return (
    <div className="w-full overflow-x-auto p-4 bg-gray-50 rounded-lg border">
      <div className="flex gap-12 min-w-max pb-4">
        {sortedRoundNumbers.map((roundNum) => (
          <div key={roundNum} className="flex flex-col justify-around gap-8 w-64">
            <h4 className="text-center font-bold text-gray-400 uppercase tracking-wider mb-2">
              {roundNum === sortedRoundNumbers.length ? 'Finals' : `Round ${roundNum}`}
            </h4>
            
            {rounds[roundNum].map((match) => (
              <div 
                key={match.id} 
                className="bg-white border rounded shadow-sm overflow-hidden flex flex-col relative"
              >
                {/* Connector Lines (Visual Sugar) */}
                <div className="absolute top-1/2 -right-6 w-6 h-px bg-gray-300 hidden md:block" />

                {/* Player 1 */}
                <div className={`p-2 flex justify-between items-center border-b ${match.winnerId === match.player1Id && match.winnerId ? 'bg-green-50' : ''}`}>
                  <span className={`text-sm truncate font-medium ${match.winnerId === match.player1Id ? 'text-green-700' : 'text-gray-700'}`}>
                    {match.player1 ? `${match.player1.user.firstName} ${match.player1.user.lastName}` : 'Bye'}
                  </span>
                  {match.player1 && <span className="text-xs text-gray-400 ml-2">#{match.player1.currentRanking}</span>}
                </div>

                {/* Player 2 */}
                <div className={`p-2 flex justify-between items-center ${match.winnerId === match.player2Id && match.winnerId ? 'bg-green-50' : ''}`}>
                  <span className={`text-sm truncate font-medium ${match.winnerId === match.player2Id ? 'text-green-700' : 'text-gray-700'}`}>
                    {match.player2 ? `${match.player2.user.firstName} ${match.player2.user.lastName}` : 'Bye'}
                  </span>
                  {match.player2 && <span className="text-xs text-gray-400 ml-2">#{match.player2.currentRanking}</span>}
                </div>

                {/* Score/Status Overlay (Optional) */}
                {!match.winnerId && match.player1 && match.player2 && (
                  <div className="bg-gray-100 text-[10px] text-center text-gray-500 py-0.5">
                    vs
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}