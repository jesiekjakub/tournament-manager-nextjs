'use server'

import { redirect } from 'next/navigation'
import { TournamentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { type ActionState, fail, failFromZod } from '@/lib/forms'
import { tournamentCreateSchema } from '@/lib/validation'
import { SPONSOR_BUCKET } from '@/lib/constants'

export async function createTournament(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const parsed = tournamentCreateSchema.safeParse({
    title: formData.get('title'),
    discipline: formData.get('discipline'),
    date: formData.get('date'),
    deadline: formData.get('deadline'),
    locationName: formData.get('locationName'),
    maxParticipants: formData.get('maxParticipants'),
    lat: formData.get('lat'),
    lng: formData.get('lng'),
  })
  if (!parsed.success) return failFromZod(parsed.error)

  const logoFiles = formData
    .getAll('logos')
    .filter((f): f is File => f instanceof File && f.size > 0)

  let logoUrls: string[]
  try {
    logoUrls = await uploadSponsorLogos(supabase, logoFiles)
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to upload sponsor logos')
  }

  const created = await prisma.tournament.create({
    data: {
      ...parsed.data,
      locationLat: parsed.data.lat,
      locationLng: parsed.data.lng,
      sponsorLogos: logoUrls,
      organizerId: user.id,
      status: TournamentStatus.OPEN,
    },
    select: { id: true },
  })

  redirect(`/tournaments/${created.id}`)
}

async function uploadSponsorLogos(
  supabase: Awaited<ReturnType<typeof createClient>>,
  files: File[],
): Promise<string[]> {
  if (files.length === 0) return []

  // The bucket disallows overwrite (`upsert: false`); we prepend a millisecond
  // timestamp so two organizers uploading `logo.png` don't collide.
  const stamp = Date.now()
  const uploads = files.map(async (file) => {
    const safeName = file.name.replace(/\s+/g, '_')
    const path = `${stamp}-${crypto.randomUUID()}-${safeName}`
    const { error } = await supabase.storage.from(SPONSOR_BUCKET).upload(path, file, {
      upsert: false,
    })
    if (error) throw new Error(`Upload failed: ${error.message}`)
    const { data } = supabase.storage.from(SPONSOR_BUCKET).getPublicUrl(path)
    return data.publicUrl
  })

  return Promise.all(uploads)
}
