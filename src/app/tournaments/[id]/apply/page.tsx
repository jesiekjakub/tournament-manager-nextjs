import { prisma } from '@/utils/db'
import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ApplyForm from '@/components/ApplyForm' // <--- Import the new component

export default async function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?next=/tournaments/${id}/apply`)
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    select: { title: true }
  })

  if (!tournament) return notFound()

  return (
    <main className="min-h-screen p-8 flex items-center justify-center bg-gray-50">
      <ApplyForm tournamentId={id} title={tournament.title} />
    </main>
  )
}