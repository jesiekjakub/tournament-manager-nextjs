'use server'

import { prisma } from '@/utils/db'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { generateBracketForTournament } from '@/utils/tournamentLogic'

// --- ACTION 1: Generate the Ladder (Organizer Only) ---
export async function generateBracket(tournamentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  // 1. Verify Ownership
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId }
  })

  if (!tournament || tournament.organizerId !== user.id) {
    throw new Error("Only the organizer can generate the bracket")
  }

  // 2. Call Shared Logic (Same logic used by Cron Job)
  await generateBracketForTournament(tournamentId)

  // 3. Refresh Page
  revalidatePath(`/tournaments/${tournamentId}`)
}

// --- ACTION 2: Apply for Tournament (User) ---
export async function applyForTournament(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  const tournamentId = formData.get('tournamentId') as string
  const licenseNumber = formData.get('licenseNumber') as string
  const currentRanking = Number(formData.get('currentRanking'))

  if (!tournamentId || !licenseNumber || !currentRanking) {
    return { error: "All fields are required" }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const tournament = await tx.tournament.findUnique({
        where: { id: tournamentId },
        include: { participants: true }
      })

      if (!tournament) throw new Error("Tournament not found")
      if (tournament.status !== 'OPEN') throw new Error("Tournament is closed")
      
      if (new Date() > new Date(tournament.deadline)) {
        throw new Error("Application deadline has passed") // [cite: 14]
      }

      if (tournament.participants.length >= tournament.maxParticipants) {
        throw new Error("Tournament is full") // [cite: 19]
      }

      // Uniqueness checks 
      const isRankTaken = tournament.participants.some(p => p.currentRanking === currentRanking)
      if (isRankTaken) throw new Error(`Rank #${currentRanking} is already taken`)

      const isLicenseTaken = tournament.participants.some(p => p.licenseNumber === licenseNumber)
      if (isLicenseTaken) throw new Error(`License ${licenseNumber} is already registered`)
      
      const isUserRegistered = tournament.participants.some(p => p.userId === user.id)
      if (isUserRegistered) throw new Error("You are already registered")

      await tx.participant.create({
        data: {
          userId: user.id,
          tournamentId,
          licenseNumber,
          currentRanking
        }
      })
    })
  } catch (error: any) {
    return { error: error.message || "Failed to join tournament" }
  }

  revalidatePath(`/tournaments/${tournamentId}`)
  redirect(`/tournaments/${tournamentId}`)
}