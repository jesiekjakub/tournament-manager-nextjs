'use server'

import { TournamentStatus } from '@prisma/client'
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
  // Ensure we handle the number conversion safely
  const maxParticipants = Number(formData.get('maxParticipants'))
  const lat = Number(formData.get('lat'))
  const lng = Number(formData.get('lng'))
  const deadlineStr = formData.get('deadline') as string
  const logoFiles = formData.getAll('logos') as File[]

  console.log(`DEBUG: Found ${logoFiles.length} files to upload.`) // <--- DEBUG LOG

  const tournamentDate = new Date(dateStr)
  const deadlineDate = new Date(deadlineStr)

  // 3. Validation
  if (tournamentDate < new Date()) {
    return redirect('/tournaments/create?error=Tournament date cannot be in the past')
  }

  if (deadlineDate < new Date()) {
    return redirect('/tournaments/create?error=Deadline date cannot be in the past')
  }

  const FIFTEEN_MINUTES = 15 * 60 * 1000 // 15 mins * 60 sec * 1000 ms
  // If Deadline is greater (later) than (Start Time - 15 mins), throw error
  if (deadlineDate.getTime() > (tournamentDate.getTime() - FIFTEEN_MINUTES)) {
    return redirect('/tournaments/create?error=Application deadline must be at least 15 minutes before the tournament starts.')
  }

  // 4. Image Upload (With Error Logging)
  const logoUrls: string[] = []
  
  for (const file of logoFiles) {
    // Check if it's actually a file (Next.js sometimes sends an empty object if no file selected)
    if (file.size > 0 && file.name !== 'undefined') {
      const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}` // specific sanitization
      
      console.log(`DEBUG: Uploading ${fileName}...`)

      const { data, error } = await supabase.storage
        .from('sponsor-logos')
        .upload(fileName, file, {
          upsert: false,
        })
      
      if (error) {
        console.error("DEBUG: Upload Error:", error) // <--- THIS WILL SHOW YOU THE REASON
      } else if (data) {
        const { data: publicData } = supabase.storage
          .from('sponsor-logos')
          .getPublicUrl(data.path)
        
        console.log(`DEBUG: Upload Success: ${publicData.publicUrl}`)
        logoUrls.push(publicData.publicUrl)
      }
    }
  }

  // 5. Database Insert
  console.log("DEBUG: Saving to DB with Logos:", logoUrls)

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
      sponsorLogos: logoUrls, // This should now contain the URLs
      organizerId: user.id,
      status: TournamentStatus.OPEN // Requirement 12 default
    },
  })

  redirect('/')
}