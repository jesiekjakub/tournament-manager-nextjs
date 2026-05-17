import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { uuidSchema } from '@/lib/validation'
import EditTournamentForm from '@/components/EditTournamentForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditTournamentPage({ params }: PageProps) {
  const { id } = await params
  if (!uuidSchema.safeParse(id).success) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const tournament = await prisma.tournament.findUnique({ where: { id } })
  if (!tournament) notFound()

  if (tournament.organizerId !== user.id) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-center">
          <h1 className="text-xl font-bold text-red-700">Not your tournament</h1>
          <p className="text-red-700 mt-2">Only the organizer can edit this tournament.</p>
          <Link
            href={`/tournaments/${id}`}
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            ← Back
          </Link>
        </div>
      </main>
    )
  }

  if (tournament.status !== 'OPEN') {
    return (
      <main className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg text-center">
          <h1 className="text-xl font-bold text-yellow-800 mb-2">Editing Disabled</h1>
          <p className="text-yellow-700 mb-4">
            This tournament is no longer editable (status: {tournament.status}).
          </p>
          <Link href={`/tournaments/${id}`} className="text-blue-600 hover:underline">
            Return to tournament
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Edit Tournament Settings</h1>
      <EditTournamentForm tournament={tournament} />
    </main>
  )
}
