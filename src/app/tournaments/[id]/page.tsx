import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import SponsorCarousel from '@/components/SponsorCarousel'
import TournamentMap from '@/components/TournamentMap'
import TournamentBracket from '@/components/TournamentBracket'
import StatusBadge from '@/components/StatusBadge'
import { uuidSchema } from '@/lib/validation'
import { generateBracketAction } from './actions'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TournamentDetailsPage({ params }: PageProps) {
  const { id } = await params
  if (!uuidSchema.safeParse(id).success) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      organizer: true,
      participants: { include: { user: true } },
      matches: {
        include: {
          player1: { include: { user: true } },
          player2: { include: { user: true } },
          winner: { include: { user: true } },
        },
        orderBy: [{ round: 'asc' }, { position: 'asc' }],
      },
    },
  })
  if (!tournament) notFound()

  const isOrganizer = user?.id === tournament.organizerId
  const participantsCount = tournament.participants.length
  const isFull = participantsCount >= tournament.maxParticipants
  const isOpen = tournament.status === 'OPEN'
  const isPastBracket =
    tournament.status === 'LADDER_GENERATED' || tournament.status === 'COMPLETED'
  const deadline = tournament.deadline
  const isTimeUp = deadline.getTime() < Date.now()
  const canApply = isOpen && !isFull && !isTimeUp
  const canGenerate = isOrganizer && isOpen && (isTimeUp || isFull) && participantsCount >= 2

  async function generate() {
    'use server'
    await generateBracketAction(id)
  }

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold">{tournament.title}</h1>
            <StatusBadge status={tournament.status} />
          </div>
          <p className="text-gray-600 text-lg">{tournament.discipline}</p>
        </div>

        <div className="flex gap-3">
          {isOrganizer && (
            <Link
              href={`/tournaments/${id}/edit`}
              className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition"
            >
              Edit Tournament
            </Link>
          )}

          {isOrganizer && isOpen && canGenerate && (
            <form action={generate}>
              <button className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition shadow-md font-bold flex items-center gap-2">
                <span>⚙️</span> Generate Ladder
              </button>
            </form>
          )}

          {isOrganizer &&
            isOpen &&
            !canGenerate &&
            (isTimeUp || isFull) &&
            participantsCount < 2 && (
              <div className="px-4 py-2 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded text-sm flex items-center">
                ⚠ Minimum 2 players required to generate the ladder
              </div>
            )}

          {isOpen &&
            !canGenerate &&
            (canApply ? (
              <Link
                href={`/tournaments/${id}/apply`}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition shadow-md font-medium inline-block"
              >
                Apply Now
              </Link>
            ) : (
              <button
                disabled
                className="px-6 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed border border-gray-400"
              >
                {isFull ? 'Tournament Full' : 'Deadline Passed'}
              </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-lg border shadow-sm grid grid-cols-2 gap-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
              <p className="text-lg font-semibold">{tournament.date.toLocaleDateString()}</p>
              <p className="text-gray-600">
                {tournament.date.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Location</h3>
              <p className="text-lg font-semibold">{tournament.locationName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Deadline</h3>
              <p className={`font-medium ${isTimeUp ? 'text-gray-500' : 'text-red-600'}`}>
                {deadline.toLocaleString()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Participants</h3>
              <p className="text-lg font-semibold">
                {participantsCount} / {tournament.maxParticipants}
              </p>
            </div>
          </div>

          {isPastBracket ? (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">🏆 Tournament Bracket</h3>
              <TournamentBracket matches={tournament.matches} />
            </div>
          ) : (
            <div className="h-96 w-full bg-gray-200 rounded-lg overflow-hidden border shadow-sm relative">
              <TournamentMap lat={tournament.locationLat} lng={tournament.locationLng} />
            </div>
          )}

          {isPastBracket && (
            <div className="h-64 w-full bg-gray-200 rounded-lg overflow-hidden border shadow-sm relative mt-8">
              <TournamentMap lat={tournament.locationLat} lng={tournament.locationLng} />
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-gray-50 p-6 rounded-lg border">
            <h3 className="text-lg font-bold mb-4">Sponsors</h3>
            <SponsorCarousel logos={tournament.sponsorLogos} />
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-bold mb-4 border-b pb-2">Organizer Contact</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Name</p>
                <p className="text-gray-800 text-lg">
                  {tournament.organizer.firstName} {tournament.organizer.lastName}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                <a
                  href={`mailto:${tournament.organizer.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {tournament.organizer.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
