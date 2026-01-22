import { prisma } from '@/utils/db'
import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EditTournamentForm from '@/components/EditTournamentForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditTournamentPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  const tournament = await prisma.tournament.findUnique({
    where: { id }
  })

  if (!tournament) return notFound()

  if (tournament.organizerId !== user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 font-bold">⚠ You are not authorized to edit this tournament.</p>
      </div>
    )
  }

  if (tournament.status !== 'OPEN') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg text-center">
          <h1 className="text-xl font-bold text-yellow-800 mb-2">Editing Disabled</h1>
          <p className="text-yellow-700 mb-4">
            This tournament has already started or finished (Status: {tournament.status}). 
            Settings can no longer be changed.
          </p>
          <a href={`/tournaments/${id}`} className="text-blue-600 hover:underline">
            Return to Tournament
          </a>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Edit Tournament Settings</h1>
      <EditTournamentForm tournament={tournament} />
    </main>
  )
}