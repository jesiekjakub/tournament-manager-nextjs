'use client'

import { Match, Participant, User } from '@prisma/client'

type MatchWithPlayers = Match & {
  player1: (Participant & { user: User }) | null
  player2: (Participant & { user: User }) | null
  winner: (Participant & { user: User }) | null
}

interface BracketProps {
  matches: MatchWithPlayers[]
}

export default function TournamentBracket({ matches }: BracketProps) {
  if (matches.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8 italic">
        Bracket generated, but no matches were created.
      </div>
    )
  }

  const rounds = groupByRound(matches)
  const roundNumbers = [...rounds.keys()].sort((a, b) => a - b)
  const finalRound = roundNumbers[roundNumbers.length - 1]

  return (
    <div className="w-full overflow-x-auto p-4 bg-gray-50 rounded-lg border">
      <div className="flex gap-12 min-w-max pb-4">
        {roundNumbers.map((round) => (
          <div key={round} className="flex flex-col justify-around gap-8 w-64">
            <h4 className="text-center font-bold text-gray-400 uppercase tracking-wider mb-2">
              {roundLabel(round, finalRound)}
            </h4>
            {rounds.get(round)!.map((match) => (
              <BracketMatch key={match.id} match={match} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function groupByRound(matches: MatchWithPlayers[]): Map<number, MatchWithPlayers[]> {
  const out = new Map<number, MatchWithPlayers[]>()
  for (const m of matches) {
    const existing = out.get(m.round)
    if (existing) existing.push(m)
    else out.set(m.round, [m])
  }
  for (const list of out.values()) list.sort((a, b) => a.position - b.position)
  return out
}

function roundLabel(round: number, finalRound: number): string {
  if (round === finalRound) return 'Finals'
  if (round === finalRound - 1) return 'Semifinals'
  if (round === finalRound - 2) return 'Quarterfinals'
  return `Round ${round}`
}

function BracketMatch({ match }: { match: MatchWithPlayers }) {
  const undecided = !match.winnerId && match.player1 && match.player2
  return (
    <div className="bg-white border rounded shadow-sm overflow-hidden flex flex-col relative">
      <div className="absolute top-1/2 -right-6 w-6 h-px bg-gray-300 hidden md:block" />
      <PlayerSlot
        participant={match.player1}
        rank={match.player1?.currentRanking}
        isWinner={!!match.winnerId && match.winnerId === match.player1Id}
        bordered
      />
      <PlayerSlot
        participant={match.player2}
        rank={match.player2?.currentRanking}
        isWinner={!!match.winnerId && match.winnerId === match.player2Id}
      />
      {undecided && (
        <div className="bg-gray-100 text-[10px] text-center text-gray-500 py-0.5">vs</div>
      )}
    </div>
  )
}

interface PlayerSlotProps {
  participant: (Participant & { user: User }) | null
  rank: number | undefined
  isWinner: boolean
  bordered?: boolean
}

function PlayerSlot({ participant, rank, isWinner, bordered }: PlayerSlotProps) {
  return (
    <div
      className={[
        'p-2 flex justify-between items-center',
        bordered ? 'border-b' : '',
        isWinner ? 'bg-green-50' : '',
      ].join(' ')}
    >
      <span
        className={`text-sm truncate font-medium ${
          isWinner ? 'text-green-700' : 'text-gray-700'
        }`}
      >
        {participant ? `${participant.user.firstName} ${participant.user.lastName}` : 'Bye'}
      </span>
      {participant && rank !== undefined && (
        <span className="text-xs text-gray-400 ml-2">#{rank}</span>
      )}
    </div>
  )
}
