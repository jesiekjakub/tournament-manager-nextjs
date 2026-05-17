'use server'

import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { type ActionState, fail, failFromZod } from '@/lib/forms'
import { applicationSchema, uuidSchema } from '@/lib/validation'
import { generateBracketForTournament } from '@/lib/tournament/generate'

export async function generateBracketAction(tournamentId: string): Promise<void> {
  const parsedId = uuidSchema.safeParse(tournamentId)
  if (!parsedId.success) throw new Error('Invalid tournament id')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const tournament = await prisma.tournament.findUnique({
    where: { id: parsedId.data },
    select: { organizerId: true },
  })
  if (!tournament || tournament.organizerId !== user.id) {
    throw new Error('Only the organizer can generate the bracket')
  }

  await generateBracketForTournament(parsedId.data)
  revalidatePath(`/tournaments/${parsedId.data}`)
}

export async function applyForTournament(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const parsed = applicationSchema.safeParse({
    tournamentId: formData.get('tournamentId'),
    licenseNumber: formData.get('licenseNumber'),
    currentRanking: formData.get('currentRanking'),
  })
  if (!parsed.success) return failFromZod(parsed.error)

  const { tournamentId, licenseNumber, currentRanking } = parsed.data

  try {
    await prisma.$transaction(async (tx) => {
      const tournament = await tx.tournament.findUnique({
        where: { id: tournamentId },
        select: {
          status: true,
          deadline: true,
          maxParticipants: true,
          _count: { select: { participants: true } },
        },
      })

      if (!tournament) throw new ApplyError('Tournament not found')
      if (tournament.status !== 'OPEN') throw new ApplyError('Tournament is closed')
      if (tournament.deadline.getTime() < Date.now()) {
        throw new ApplyError('Application deadline has passed')
      }
      if (tournament._count.participants >= tournament.maxParticipants) {
        throw new ApplyError('Tournament is full')
      }

      await tx.participant.create({
        data: { userId: user.id, tournamentId, licenseNumber, currentRanking },
      })
    })
  } catch (e) {
    if (e instanceof ApplyError) return fail(e.message)
    // Unique-constraint races are caught here rather than via an in-memory
    // pre-check; the DB schema enforces per-tournament uniqueness on rank,
    // license, and userId, so this is the only authoritative answer.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return fail(translateUniqueViolation(e))
    }
    return fail('Failed to join tournament')
  }

  revalidatePath(`/tournaments/${tournamentId}`)
  redirect(`/tournaments/${tournamentId}`)
}

class ApplyError extends Error {}

function translateUniqueViolation(e: Prisma.PrismaClientKnownRequestError): string {
  const target = (e.meta?.target ?? []) as string[]
  if (target.includes('currentRanking')) return 'That ranking is already taken for this tournament'
  if (target.includes('licenseNumber')) return 'That license number is already registered'
  if (target.includes('userId')) return 'You are already registered for this tournament'
  return 'Application conflict'
}
