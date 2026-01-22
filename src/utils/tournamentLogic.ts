import { prisma } from '@/utils/db'
import { TournamentStatus } from '@prisma/client'

export async function generateBracketForTournament(tournamentId: string) {
  // 1. Fetch Tournament & Participants (Sorted by Rank)
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      participants: { orderBy: { currentRanking: 'asc' } }
    }
  })

  if (!tournament) throw new Error("Tournament not found")
  if (tournament.status !== 'OPEN') return // Already generated
  
  const count = tournament.participants.length
  if (count < 2) return // Not enough players

  // 2. Calculate Bracket Size (Next Power of 2)
  let size = 1
  while (size < count) size *= 2
  
  const totalRounds = Math.log2(size)
  const matchesToCreate = []
  
  // Pad participants with NULLs for "Byes"
  const seeds = new Array(size).fill(null).map((_, i) => tournament.participants[i] || null)

  // 3. Generate Round 1 (Top Seed vs Bottom Seed)
  for (let i = 0; i < size / 2; i++) {
    const p1 = seeds[i]
    const p2 = seeds[size - 1 - i] // Rank 1 plays Rank 8 (if size 8)

    matchesToCreate.push({
      round: 1,
      position: i + 1,
      player1Id: p1?.id || null,
      player2Id: p2?.id || null,
      // Auto-win logic: If p2 is missing (Bye), p1 wins immediately
      winnerId: !p2 ? p1?.id : (!p1 ? p2?.id : null),
      tournamentId: tournament.id
    })
  }

  // 4. Generate Empty Future Rounds
  for (let r = 2; r <= totalRounds; r++) {
    const matchesInRound = size / Math.pow(2, r)
    for (let i = 0; i < matchesInRound; i++) {
      matchesToCreate.push({
        round: r,
        position: i + 1,
        tournamentId: tournament.id
      })
    }
  }

  // 5. Save to DB
  await prisma.$transaction([
    prisma.tournament.update({
      where: { id: tournament.id },
      data: { status: TournamentStatus.LADDER_GENERATED }
    }),
    prisma.match.createMany({ data: matchesToCreate })
  ])

  return true
}