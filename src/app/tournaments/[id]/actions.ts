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
export async function applyForTournament(tournamentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If not logged in, redirect to login page
  if (!user) return redirect('/login')

  // Fetch user details
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser) throw new Error("User profile not found")

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { participants: true }
  })

  if (!tournament) throw new Error("Tournament not found")

  // Validation
  if (tournament.participants.length >= tournament.maxParticipants) {
    throw new Error("Tournament is full")
  }

  // Check if already applied
  const existing = await prisma.participant.findUnique({
    where: {
      userId_tournamentId: {
        userId: user.id,
        tournamentId: tournamentId
      }
    }
  })

  if (existing) {
    return // Already registered, do nothing
  }

  // Create Participant with Mock Data for Demo
  // (In a real app, you might ask for license number in a form)
  const mockRank = Math.floor(Math.random() * 100) + 1
  const mockLicense = `LIC-${Date.now().toString().slice(-4)}`

  await prisma.participant.create({
    data: {
      userId: user.id,
      tournamentId: tournamentId,
      currentRanking: mockRank,
      licenseNumber: mockLicense
    }
  })

  revalidatePath(`/tournaments/${tournamentId}`)
}