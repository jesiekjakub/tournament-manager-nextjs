import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { uuidSchema } from '@/lib/validation'
import ApplyForm from '@/components/ApplyForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ApplyPage({ params }: PageProps) {
  const { id } = await params
  if (!uuidSchema.safeParse(id).success) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/tournaments/${id}/apply`)

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    select: { title: true },
  })
  if (!tournament) notFound()

  return (
    <main className="min-h-screen p-8 flex items-center justify-center bg-gray-50">
      <ApplyForm tournamentId={id} title={tournament.title} />
    </main>
  )
}
