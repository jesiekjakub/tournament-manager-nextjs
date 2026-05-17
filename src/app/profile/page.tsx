import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Tournament } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

function initial(value: string | null | undefined): string {
  return value && value.length > 0 ? value[0]!.toUpperCase() : '?'
}

function SectionHeader({ title, icon }: { title: string; icon: string }) {
  return (
    <h2 className="text-xl font-bold mt-8 mb-4 flex items-center gap-2 border-b pb-2 text-gray-800">
      <span>{icon}</span> {title}
    </h2>
  )
}

function TournamentCard({ t }: { t: Tournament }) {
  return (
    <Link
      href={`/tournaments/${t.id}`}
      className="block bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition hover:border-blue-400"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg truncate">{t.title}</h3>
        <span
          className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wide ${
            t.status === 'OPEN'
              ? 'bg-green-100 text-green-700'
              : t.status === 'COMPLETED'
                ? 'bg-gray-100 text-gray-600'
                : 'bg-blue-100 text-blue-700'
          }`}
        >
          {t.status}
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-1">🏆 {t.discipline}</p>
      <p className="text-sm text-gray-500">📍 {t.locationName}</p>
      <p className="text-xs text-gray-400 mt-2 text-right">{t.date.toLocaleDateString()}</p>
    </Link>
  )
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { organizedTournaments: { orderBy: { date: 'desc' } } },
  })

  // The setup_trigger.sql mirror lags by a transaction; if a freshly-confirmed
  // user hits /profile before the trigger fires, we send them to login rather
  // than render a half-populated page.
  if (!dbUser) redirect('/login?message=Account%20still%20being%20provisioned')

  const participations = await prisma.participant.findMany({
    where: { userId: user.id },
    include: { tournament: true },
    orderBy: { tournament: { date: 'desc' } },
  })

  const activeTournaments = participations
    .map((p) => p.tournament)
    .filter((t) => t.status !== 'COMPLETED')
  const historyTournaments = participations
    .map((p) => p.tournament)
    .filter((t) => t.status === 'COMPLETED')

  const upcomingMatches = await prisma.match.findMany({
    where: {
      OR: [{ player1: { userId: user.id } }, { player2: { userId: user.id } }],
      winnerId: null,
    },
    include: {
      tournament: true,
      player1: { include: { user: true } },
      player2: { include: { user: true } },
    },
    orderBy: { tournament: { date: 'asc' } },
  })

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="bg-white p-6 rounded-xl shadow border flex items-center gap-6">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
          {initial(dbUser.firstName)}
          {initial(dbUser.lastName)}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {dbUser.firstName} {dbUser.lastName}
          </h1>
          <p className="text-gray-500">{dbUser.email}</p>
          <div className="flex gap-4 mt-2 text-sm text-gray-600">
            <span>
              👑 Organizer of <strong>{dbUser.organizedTournaments.length}</strong> events
            </span>
            <span>
              🏅 Joined <strong>{participations.length}</strong> tournaments
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <section>
            <SectionHeader title="Organized by You" icon="👑" />
            {dbUser.organizedTournaments.length > 0 ? (
              <div className="space-y-3">
                {dbUser.organizedTournaments.map((t) => (
                  <TournamentCard key={t.id} t={t} />
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic text-sm">
                You haven't organized any tournaments yet.
              </p>
            )}
          </section>

          <section>
            <SectionHeader title="Tournament History" icon="📜" />
            {historyTournaments.length > 0 ? (
              <div className="space-y-3">
                {historyTournaments.map((t) => (
                  <TournamentCard key={t.id} t={t} />
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic text-sm">No completed tournaments found.</p>
            )}
          </section>
        </div>

        <div className="space-y-8">
          <section>
            <SectionHeader title="Your Upcoming Matches" icon="⚔️" />
            {upcomingMatches.length > 0 ? (
              <div className="space-y-3">
                {upcomingMatches.map((match) => {
                  const opponent =
                    match.player1?.userId === user.id ? match.player2 : match.player1
                  return (
                    <Link
                      key={match.id}
                      href={`/matches/${match.id}`}
                      className="block bg-gradient-to-r from-blue-50 to-white p-4 rounded-lg border border-blue-100 shadow-sm hover:shadow-md hover:border-blue-300 transition group"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                          {match.tournament.discipline}
                        </span>
                        <span className="text-xs text-gray-400">Round {match.round}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-gray-900">YOU</div>
                        <div className="text-xs text-gray-400 px-2">VS</div>
                        <div className="font-bold text-gray-900 text-right">
                          {opponent
                            ? `${opponent.user.firstName} ${opponent.user.lastName}`
                            : 'Waiting…'}
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-center text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to enter result →
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="bg-gray-50 p-6 rounded-lg text-center border border-dashed">
                <p className="text-gray-500">No active matches.</p>
                <p className="text-xs text-gray-400 mt-1">Wait for a ladder to be generated.</p>
              </div>
            )}
          </section>

          <section>
            <SectionHeader title="Active Tournaments" icon="🏃" />
            {activeTournaments.length > 0 ? (
              <div className="space-y-3">
                {activeTournaments.map((t) => (
                  <TournamentCard key={t.id} t={t} />
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic text-sm">
                You are not participating in any active tournaments.
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
