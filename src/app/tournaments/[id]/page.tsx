import { prisma } from '@/utils/db'
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import SponsorCarousel from '@/components/SponsorCarousel'
import TournamentMap from '@/components/TournamentMap'
import TournamentBracket from '@/components/TournamentBracket'
import { generateBracket, applyForTournament } from './actions' // <--- Imports Server Actions

function isValidUUID(id: string) {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return regex.test(id)
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TournamentDetailsPage({ params }: PageProps) {
  const resolvedParams = await params
  const { id } = resolvedParams

  if (!isValidUUID(id)) return notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. FETCH EVERYTHING NEEDED FOR VISUALIZATION
  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      organizer: true,
      participants: {
        include: { user: true }
      },
      // REQUIREMENT 10: Fetch matches for the bracket visualization
      matches: {
        include: {
          player1: { include: { user: true } },
          player2: { include: { user: true } },
          winner:  { include: { user: true } },
        },
        orderBy: [
          { round: 'asc' },
          { position: 'asc' }
        ]
      }
    }
  })

  if (!tournament) return notFound()

  // 2. LOGIC
  const isOrganizer = user?.id === tournament.organizerId
  const currentParticipantsCount = tournament.participants.length
  
  // Time Logic
  const now = new Date()
  const deadline = new Date(tournament.deadline)
  // "Deadline Passed" includes the check: Is it physically past the time?
  const isTimeUp = now.getTime() > deadline.getTime()
  
  const isFull = currentParticipantsCount >= tournament.maxParticipants
  const isOpen = tournament.status === 'OPEN'
  const isLadderOrFinished = tournament.status === 'LADDER_GENERATED' || tournament.status === 'COMPLETED'
  
  // Can Apply? (Must be OPEN, not full, and before deadline)
  const canApply = isOpen && !isFull && !isTimeUp

  // Can Generate Ladder? (Organizer only, OPEN status, AND (Time is Up OR Full), AND enough players)
  const canGenerateLadder = isOrganizer && 
                            isOpen && 
                            (isTimeUp || isFull) &&
                            currentParticipantsCount >= 2

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold">{tournament.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isOpen ? 'bg-green-100 text-green-800' : 
              tournament.status === 'COMPLETED' ? 'bg-gray-800 text-white' : 'bg-blue-100 text-blue-800'
            }`}>
              {tournament.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-gray-600 text-lg">{tournament.discipline}</p>
        </div>

        {/* BUTTONS */}
        <div className="flex gap-3">
          {/* EDIT BUTTON (Organizer) */}
          {isOrganizer && (
            <Link
              href={`/tournaments/${id}/edit`}
              className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition"
            >
              Edit Tournament
            </Link>
          )}

          {/* ORGANIZER ACTIONS */}
          {isOrganizer && isOpen && (
             canGenerateLadder ? (
               // OPTION 1: Ready to Generate
               <form action={async () => {
                 'use server'
                 await generateBracket(id)
               }}>
                 <button className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition shadow-md font-bold flex items-center gap-2">
                   <span>⚙️</span> Generate Ladder
                 </button>
               </form>
             ) : (
               // OPTION 2: Deadline Passed but NOT enough players
               (isTimeUp || isFull) && currentParticipantsCount < 2 && (
                 <div className="px-4 py-2 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded text-sm flex items-center">
                   ⚠ Minimum 2 players required to generate Ladder
                 </div>
               )
             )
          )}
          
          {/* USER ACTIONS (Apply Button) */}
          {/* We hide this for the organizer if the deadline is passed to avoid clutter, 
              or keep it if you want them to be able to apply. */}
          {isOpen && !canGenerateLadder && (
            canApply ? (
              <form action={async () => {
                  'use server'
                  await applyForTournament(id)
              }}>
                <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition shadow-md font-medium">
                  Apply Now
                </button>
              </form>
            ) : (
               // Only show "Deadline Passed" to non-organizers OR if we didn't show the specific warning above
               (!isOrganizer || currentParticipantsCount >= 2) && (
                 <button disabled className="px-6 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed border border-gray-400">
                   {isFull ? 'Tournament Full' : 'Deadline Passed'}
                 </button>
               )
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT / MAIN CONTENT --- */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Tournament Stats */}
          <div className="bg-white p-6 rounded-lg border shadow-sm grid grid-cols-2 gap-y-6">
             <div>
               <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
               <p className="text-lg font-semibold">
                 {new Date(tournament.date).toLocaleDateString()}
               </p>
               <p className="text-gray-600">
                 {new Date(tournament.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                 {currentParticipantsCount} / {tournament.maxParticipants}
               </p>
             </div>
          </div>

          {/* --- REQUIREMENT 10: BRACKET VISUALIZATION --- */}
          {isLadderOrFinished ? (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">🏆 Tournament Bracket</h3>
              <TournamentBracket matches={tournament.matches} />
            </div>
          ) : (
            // If OPEN, just show the Map primarily
            <div className="h-96 w-full bg-gray-200 rounded-lg overflow-hidden border shadow-sm relative">
              <TournamentMap 
                lat={tournament.locationLat} 
                lng={tournament.locationLng} 
              />
            </div>
          )}
          
          {/* If Bracket is shown, show map below it as secondary info */}
          {isLadderOrFinished && (
             <div className="h-64 w-full bg-gray-200 rounded-lg overflow-hidden border shadow-sm relative mt-8">
               <TournamentMap 
                 lat={tournament.locationLat} 
                 lng={tournament.locationLng} 
               />
             </div>
          )}
        </div>

        {/* --- RIGHT SIDEBAR --- */}
        <div className="space-y-8">
          {/* Sponsors */}
          <div className="bg-gray-50 p-6 rounded-lg border">
            <h3 className="text-lg font-bold mb-4">Sponsors</h3>
            <SponsorCarousel logos={tournament.sponsorLogos} />
          </div>

          {/* Organizer */}
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
                <a href={`mailto:${tournament.organizer.email}`} className="text-blue-600 hover:underline">
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