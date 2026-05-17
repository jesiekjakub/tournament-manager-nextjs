import { Prisma, TournamentStatus } from '@prisma/client'
import { nextSlot } from './bracket'

/**
 * Record a player's claim and, when both players agree, finalize the winner
 * and propagate them to the next round. Conflicting claims clear both fields
 * so the players can re-enter results. Runs inside a transaction so an
 * advance can never half-complete (winner set but next round un-filled).
 *
 * `submitterParticipantId` is the participant submitting the claim, used to
 * decide which of the two `playerNResult` columns to update.
 */
export async function recordResult(args: {
  tx: Prisma.TransactionClient
  matchId: string
  submitterParticipantId: string
  claimedWinnerId: string
}): Promise<void> {
  const { tx, matchId, submitterParticipantId, claimedWinnerId } = args

  const match = await tx.match.findUnique({
    where: { id: matchId },
    select: {
      id: true,
      tournamentId: true,
      round: true,
      position: true,
      player1Id: true,
      player2Id: true,
      winnerId: true,
    },
  })

  if (!match) throw new Error('match not found')
  if (match.winnerId) throw new Error('match already finished')
  if (match.player1Id !== submitterParticipantId && match.player2Id !== submitterParticipantId) {
    throw new Error('submitter is not a participant in this match')
  }
  if (claimedWinnerId !== match.player1Id && claimedWinnerId !== match.player2Id) {
    throw new Error('claimed winner is not one of the two players')
  }

  const isPlayer1 = match.player1Id === submitterParticipantId
  await tx.match.update({
    where: { id: matchId },
    data: isPlayer1 ? { player1Result: claimedWinnerId } : { player2Result: claimedWinnerId },
  })

  const fresh = await tx.match.findUniqueOrThrow({
    where: { id: matchId },
    select: { player1Result: true, player2Result: true },
  })

  if (!fresh.player1Result || !fresh.player2Result) return

  if (fresh.player1Result !== fresh.player2Result) {
    // A disagreement nullifies both votes and the pair gets another try.
    await tx.match.update({
      where: { id: matchId },
      data: { player1Result: null, player2Result: null },
    })
    return
  }

  const winnerId = fresh.player1Result
  await tx.match.update({ where: { id: matchId }, data: { winnerId } })

  const next = nextSlot(match.round, match.position)
  const downstream = await tx.match.findFirst({
    where: { tournamentId: match.tournamentId, round: next.round, position: next.position },
    select: { id: true },
  })

  if (downstream) {
    await tx.match.update({
      where: { id: downstream.id },
      data: next.slot === 'player1' ? { player1Id: winnerId } : { player2Id: winnerId },
    })
  } else {
    // No downstream match means we just resolved the final.
    await tx.tournament.update({
      where: { id: match.tournamentId },
      data: { status: TournamentStatus.COMPLETED },
    })
  }
}
