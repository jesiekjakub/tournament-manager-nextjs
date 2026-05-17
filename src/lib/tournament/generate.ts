import { Prisma, TournamentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { bracketSize, buildRoundOne, nextSlot, totalRounds } from './bracket'

/**
 * Materialize the full match tree for `tournamentId`. Idempotent on success:
 * if the tournament is past OPEN, the call is a no-op. The status transition
 * and the match inserts share a transaction so we never end up with a
 * LADDER_GENERATED tournament that has no matches.
 *
 * Returns the number of round-1 matches created, or `null` when no bracket
 * was generated (already closed, or fewer than 2 participants).
 */
export async function generateBracketForTournament(
  tournamentId: string,
): Promise<number | null> {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { participants: { orderBy: { currentRanking: 'asc' } } },
  })

  if (!tournament) throw new Error(`tournament not found: ${tournamentId}`)
  if (tournament.status !== TournamentStatus.OPEN) return null
  if (tournament.participants.length < 2) return null

  const size = bracketSize(tournament.participants.length)
  const rounds = totalRounds(size)
  const pairings = buildRoundOne(tournament.participants)

  // Maps "round:position" to the partially-filled match row so byes can pre-fill
  // their downstream slot before the bracket is even persisted. Keys are
  // synthetic placeholders we resolve to real Match.id values after inserts.
  type Row = Prisma.MatchCreateManyInput
  const rows: Row[] = []

  // Round 1 — real pairings, with bye matches resolved to an auto-winner.
  const round1Winners: { position: number; winnerId: string | null }[] = []
  for (const p of pairings) {
    const autoWinner =
      p.top && !p.bottom ? p.top.id : !p.top && p.bottom ? p.bottom.id : null
    rows.push({
      tournamentId,
      round: 1,
      position: p.position,
      player1Id: p.top?.id ?? null,
      player2Id: p.bottom?.id ?? null,
      winnerId: autoWinner,
    })
    round1Winners.push({ position: p.position, winnerId: autoWinner })
  }

  // Rounds ≥ 2 — empty shells, then walk round-1 byes forward so the first
  // real opponent of a bye-receiving top seed already shows their face on the
  // bracket.
  const placeholders = new Map<string, Row>()
  for (let r = 2; r <= rounds; r++) {
    const count = size / 2 ** r
    for (let i = 0; i < count; i++) {
      const row: Row = { tournamentId, round: r, position: i + 1 }
      rows.push(row)
      placeholders.set(`${r}:${i + 1}`, row)
    }
  }

  for (const { position, winnerId } of round1Winners) {
    if (!winnerId) continue
    const next = nextSlot(1, position)
    const placeholder = placeholders.get(`${next.round}:${next.position}`)
    if (!placeholder) continue
    if (next.slot === 'player1') placeholder.player1Id = winnerId
    else placeholder.player2Id = winnerId
  }

  await prisma.$transaction([
    prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: TournamentStatus.LADDER_GENERATED },
    }),
    prisma.match.createMany({ data: rows }),
  ])

  return pairings.length
}
