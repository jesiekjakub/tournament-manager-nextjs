'use server'

import { prisma } from '@/utils/db'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitMatchResult(matchId: string, claimedWinnerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  // 1. Fetch Match
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { player1: true, player2: true }
  })

  if (!match) throw new Error("Match not found")
  if (match.winnerId) throw new Error("Match already finished")

  // 2. Identify who is submitting (Player 1 or Player 2?)
  const isPlayer1 = match.player1?.userId === user.id
  const isPlayer2 = match.player2?.userId === user.id

  if (!isPlayer1 && !isPlayer2) {
    throw new Error("You are not a participant in this match")
  }

  // 3. Update the specific player's claim
  // We store the ID of the participant they think won
  if (isPlayer1) {
    await prisma.match.update({ where: { id: matchId }, data: { player1Result: claimedWinnerId } })
  } else {
    await prisma.match.update({ where: { id: matchId }, data: { player2Result: claimedWinnerId } })
  }

  // 4. CHECK FOR CONSENSUS (Requirement 8 & 9)
  // Re-fetch to get the latest state of both fields
  const updatedMatch = await prisma.match.findUnique({ where: { id: matchId } })

  const r1 = updatedMatch?.player1Result
  const r2 = updatedMatch?.player2Result

  // Case A: Both have submitted
  if (r1 && r2) {
    if (r1 === r2) {
      // --- CONSENSUS REACHED ---
      const actualWinnerId = r1
      
      // Transaction: Set Winner AND Advance to Next Round
      await prisma.$transaction(async (tx) => {
        // A. Mark current match finished
        await tx.match.update({
          where: { id: matchId },
          data: { winnerId: actualWinnerId }
        })

        // B. Advance Winner to Next Round
        // Logic: Next Round is (current + 1), Position is ceil(current / 2)
        const nextRound = match.round + 1
        const nextPosition = Math.ceil(match.position / 2)
        
        // Find the destination match placeholder
        const nextMatch = await tx.match.findFirst({
          where: {
            tournamentId: match.tournamentId,
            round: nextRound,
            position: nextPosition
          }
        })

        if (nextMatch) {
          // Determine if they slot into Player 1 or Player 2 slot
          // Odd positions (1, 3, 5) -> Player 1 slot
          // Even positions (2, 4, 6) -> Player 2 slot
          const isPlayer1Slot = match.position % 2 !== 0

          if (isPlayer1Slot) {
            await tx.match.update({
              where: { id: nextMatch.id },
              data: { player1Id: actualWinnerId }
            })
          } else {
            await tx.match.update({
              where: { id: nextMatch.id },
              data: { player2Id: actualWinnerId }
            })
          }
        } else {
          // If no next match exists, this was the Final. Tournament Over?
          // Optionally mark tournament as COMPLETED here.
          await tx.tournament.update({
            where: { id: match.tournamentId },
            data: { status: 'COMPLETED' }
          })
        }
      })

    } else {
      // --- CONFLICT DETECTED ---
      // Requirement 8: "Both results are withdrawn"
      await prisma.match.update({
        where: { id: matchId },
        data: {
          player1Result: null,
          player2Result: null
        }
      })
    }
  }

  revalidatePath(`/matches/${matchId}`)
  revalidatePath(`/tournaments/${match.tournamentId}`)
}