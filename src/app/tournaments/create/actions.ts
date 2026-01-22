'use server'

import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/utils/db' 
import { redirect } from 'next/navigation'


export async function createTournament(formData: FormData) {
  const supabase = await createClient()

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // 2. Extract Data
  const title = formData.get('title') as string
  const discipline = formData.get('discipline') as string
  const dateStr = formData.get('date') as string
  const locationName = formData.get('locationName') as string
  const maxParticipants = parseInt(formData.get('maxParticipants') as string)
  const lat = parseFloat(formData.get('lat') as string)
  const lng = parseFloat(formData.get('lng') as string)
  const deadlineStr = formData.get('deadline') as string
  const logoFiles = formData.getAll('logos') as File[]

  const tournamentDate = new Date(dateStr)
  const deadlineDate = new Date(deadlineStr)

  // 3. Validation (Requirement 30)
  if (tournamentDate < new Date()) {
    return redirect('/tournaments/create?error=Tournament date cannot be in the past')
  }

  // 4. Image Upload (Requirement 6)
  const logoUrls: string[] = []
  
  for (const file of logoFiles) {
    if (file.size > 0) {
      const fileName = `${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage
        .from('sponsor-logos')
        .upload(fileName, file)
      
      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('sponsor-logos')
          .getPublicUrl(data.path)
        logoUrls.push(publicUrl)
      }
    }
  }

  // 5. Database Insert
  await prisma.tournament.create({
    data: {
      title,
      discipline,
      date: tournamentDate,
      deadline: deadlineDate,
      locationName,
      locationLat: lat,
      locationLng: lng,
      maxParticipants,
      sponsorLogos: logoUrls,
      organizerId: user.id, // Requirement 12: User organizes their own tournament
    },
  })

  redirect('/')
}