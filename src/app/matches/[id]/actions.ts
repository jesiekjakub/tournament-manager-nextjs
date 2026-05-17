'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { matchResultSchema } from '@/lib/validation'
import { recordResult } from '@/lib/tournament/advance'

/**
 * Invoked from inline form actions on the per-match page. Throws on error
 * rather than returning state because the call-site ignores return values —
 * a thrown error surfaces through `app/error.tsx`, which is the desired UX
 * for the rare paths that should never legitimately fire (unauthorized,
 * tampered IDs, race against an already-resolved match).
 */
export async function submitMatchResult(matchId: string, claimedWinnerId: string): Promise<void> {
  const parsed = matchResultSchema.parse({ matchId, claimedWinnerId })

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const match = await prisma.match.findUnique({
    where: { id: parsed.matchId },
    select: {
      id: true,
      tournamentId: true,
      player1: { select: { id: true, userId: true } },
      player2: { select: { id: true, userId: true } },
    },
  })
  if (!match) throw new Error('Match not found')

  const submitter =
    match.player1?.userId === user.id
      ? match.player1
      : match.player2?.userId === user.id
        ? match.player2
        : null
  if (!submitter) throw new Error('You are not a participant in this match')

  await prisma.$transaction((tx) =>
    recordResult({
      tx,
      matchId: parsed.matchId,
      submitterParticipantId: submitter.id,
      claimedWinnerId: parsed.claimedWinnerId,
    }),
  )

  revalidatePath(`/matches/${match.id}`)
  revalidatePath(`/tournaments/${match.tournamentId}`)
}
