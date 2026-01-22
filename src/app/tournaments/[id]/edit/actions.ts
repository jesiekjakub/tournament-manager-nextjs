'use server'

import { prisma } from '@/utils/db'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateTournament(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  const id = formData.get('id') as string
  
  // 1. Fetch existing tournament
  const existing = await prisma.tournament.findUnique({
    where: { id }
  })

  if (!existing) return { error: "Tournament not found" }
  
  // Security: Only Organizer
  if (existing.organizerId !== user.id) {
    return { error: "Unauthorized" }
  }

  // Security: Must be OPEN
  if (existing.status !== 'OPEN') {
    return { error: "You cannot edit a tournament that has already started or finished." }
  }

  // 2. Extract Data
  const title = formData.get('title') as string
  const discipline = formData.get('discipline') as string
  const dateStr = formData.get('date') as string
  const deadlineStr = formData.get('deadline') as string
  const maxParticipants = Number(formData.get('maxParticipants'))
  const locationName = formData.get('locationName') as string
  const sponsorLogosRaw = formData.get('sponsorLogos') as string
  const sponsorLogos = sponsorLogosRaw ? sponsorLogosRaw.split(',').map(s => s.trim()) : []

  // 3. STRICT VALIDATION LOGIC
  const tournamentDate = new Date(dateStr)
  const deadlineDate = new Date(deadlineStr)
  const now = new Date()

  // Requirement 30: Cannot host in the past 
  if (tournamentDate < now) {
    return { error: "Tournament date cannot be in the past." }
  }

  // Logical Requirement: Deadline cannot be in the past
  if (deadlineDate < now) {
    return { error: "Application deadline cannot be in the past." }
  }

  // 15-Minute Gap Rule (Technical Constraint)
  const FIFTEEN_MINUTES = 15 * 60 * 1000
  if (deadlineDate.getTime() > (tournamentDate.getTime() - FIFTEEN_MINUTES)) {
    return { error: "Application deadline must be at least 15 minutes before the tournament starts." }
  }

  try {
    // 4. Update Database
    // We do not change the status here. It remains OPEN.
    // The status only changes to LADDER_GENERATED via the Generate button/Cron.
    await prisma.tournament.update({
      where: { id },
      data: {
        title,
        discipline,
        date: tournamentDate,
        deadline: deadlineDate,
        maxParticipants,
        locationName,
        sponsorLogos,
      }
    })
  } catch (error) {
    return { error: "Failed to update tournament." }
  }

  // 5. Revalidate and Redirect
  revalidatePath(`/tournaments/${id}`)
  redirect(`/tournaments/${id}`)
}