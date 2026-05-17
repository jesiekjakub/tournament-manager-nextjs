'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { type ActionState, fail, failFromZod } from '@/lib/forms'
import { tournamentEditSchema } from '@/lib/validation'

export async function updateTournament(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const parsed = tournamentEditSchema.safeParse({
    id: formData.get('id'),
    title: formData.get('title'),
    discipline: formData.get('discipline'),
    date: formData.get('date'),
    deadline: formData.get('deadline'),
    maxParticipants: formData.get('maxParticipants'),
    locationName: formData.get('locationName'),
    sponsorLogos: formData.get('sponsorLogos'),
  })
  if (!parsed.success) return failFromZod(parsed.error)

  const { id, sponsorLogos, ...rest } = parsed.data

  const existing = await prisma.tournament.findUnique({
    where: { id },
    select: { organizerId: true, status: true },
  })
  if (!existing) return fail('Tournament not found')
  if (existing.organizerId !== user.id) return fail('Unauthorized')
  if (existing.status !== 'OPEN') {
    return fail('You cannot edit a tournament that has already started or finished')
  }

  await prisma.tournament.update({
    where: { id },
    data: { ...rest, sponsorLogos },
  })

  revalidatePath(`/tournaments/${id}`)
  redirect(`/tournaments/${id}`)
}
