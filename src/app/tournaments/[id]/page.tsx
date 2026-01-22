import { prisma } from '@/utils/db'
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import SponsorCarousel from '@/components/SponsorCarousel'
import TournamentMap from '@/components/TournamentMap'

// Validates that the ID is a valid UUID before hitting the DB
function isValidUUID(id: string) {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return regex.test(id)
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TournamentDetailsPage({ params }: PageProps) {
  // 1. Unpack Params (Next.js 15+ requirement)
  const { id } = await params

  if (!isValidUUID(id)) {
    return notFound()
  }

  // 2. Fetch Data
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      // Assuming you have a relation named 'participants'. 
      // If not, remove the include and we'll handle the count differently.
      participants: true, 
    }
  })

  if (!tournament) {
    return notFound()
  }

  // 3. Logic Checks
  const isOrganizer = user?.id === tournament.organizerId
  const currentParticipantsCount = tournament.participants ? tournament.participants.length : 0
  const canApply = currentParticipantsCount < tournament.maxParticipants && new Date() < new Date(tournament.deadline)

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold">{tournament.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              tournament.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {tournament.status}
            </span>
          </div>
          <p className="text-gray-600 text-lg">{tournament.discipline}</p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3">
          {isOrganizer && (
            <Link
              href={`/tournaments/${id}/edit`}
              className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition"
            >
              Edit Tournament
            </Link>
          )}
          
          {canApply ? (
            <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition shadow-md font-medium">
              Apply Now
            </button>
          ) : (
             <button disabled className="px-6 py-2 bg-gray-300 text-gray-500 rounded cursor-not-allowed">
               {currentParticipantsCount >= tournament.maxParticipants ? 'Full' : 'Applications Closed'}
             </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Info & Map */}
        <div className="md:col-span-2 space-y-8">
          {/* Key Details Card */}
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
               <h3 className="text-sm font-medium text-gray-500">Application Deadline</h3>
               <p className="text-red-600 font-medium">
                 {new Date(tournament.deadline).toLocaleDateString()}
               </p>
             </div>

             <div>
               <h3 className="text-sm font-medium text-gray-500">Participants</h3>
               <p className="text-lg font-semibold">
                 {currentParticipantsCount} / {tournament.maxParticipants}
               </p>
             </div>
          </div>

          {/* Google Map */}
          <div className="h-80 w-full bg-gray-200 rounded-lg overflow-hidden border">
            <TournamentMap 
              lat={tournament.locationLat} 
              lng={tournament.locationLng} 
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Sponsors & Extra Info */}
        <div className="space-y-8">
          {/* Sponsors Section */}
          <div className="bg-gray-50 p-6 rounded-lg border">
            <h3 className="text-lg font-bold mb-4">Sponsors</h3>
            {tournament.sponsorLogos && tournament.sponsorLogos.length > 0 ? (
              <SponsorCarousel logos={tournament.sponsorLogos} />
            ) : (
              <p className="text-gray-500 text-sm text-center italic">No sponsors yet.</p>
            )}
          </div>

          {/* Organizer Info */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-bold mb-2">Organizer</h3>
            <p className="text-gray-700">User ID: {tournament.organizerId.slice(0, 8)}...</p>
            {/* Later you can fetch the actual user name here if you have a Profiles table */}
          </div>
        </div>
      </div>
    </main>
  )
}