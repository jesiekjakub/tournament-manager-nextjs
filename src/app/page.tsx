import Image from 'next/image'
import Link from 'next/link'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import Search from '@/components/Search'
import { ITEMS_PER_PAGE } from '@/lib/constants'

export const revalidate = 0

interface HomeProps {
  searchParams: Promise<{
    page?: string
    query?: string
    dateFrom?: string
    dateTo?: string
  }>
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function parseDate(raw: string | undefined): Date | undefined {
  // The `<input type="date">` posts ISO-8601 yyyy-mm-dd; we reject anything else
  // outright rather than feeding it to `new Date()` and risking year-overflows
  // like `20202-01-01` slipping into the SQL filter.
  if (!raw || !ISO_DATE.test(raw)) return undefined
  const d = new Date(raw)
  return Number.isNaN(d.getTime()) ? undefined : d
}

function endOfDay(d: Date): Date {
  const copy = new Date(d)
  copy.setHours(23, 59, 59, 999)
  return copy
}

function buildHref(base: string, params: Record<string, string | undefined>): string {
  const search = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v) search.set(k, v)
  }
  const qs = search.toString()
  return qs ? `${base}?${qs}` : base
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams
  const currentPage = Math.max(1, Number(params.page) || 1)
  const query = params.query?.trim() ?? ''
  const dateFrom = parseDate(params.dateFrom)
  const dateTo = parseDate(params.dateTo)

  const where: Prisma.TournamentWhereInput = {
    title: { contains: query, mode: 'insensitive' },
  }
  if (dateFrom || dateTo) {
    where.date = {
      ...(dateFrom && { gte: dateFrom }),
      ...(dateTo && { lte: endOfDay(dateTo) }),
    }
  }

  const skip = (currentPage - 1) * ITEMS_PER_PAGE
  const [tournaments, totalCount] = await Promise.all([
    prisma.tournament.findMany({
      where,
      orderBy: { date: 'asc' },
      take: ITEMS_PER_PAGE,
      skip,
    }),
    prisma.tournament.count({ where }),
  ])

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE))
  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages
  const queryString = {
    query: query || undefined,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
  }

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Upcoming Tournaments</h1>
        <Link
          href="/tournaments/create"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          + Host Tournament
        </Link>
      </div>

      <Search />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((t) => (
          <Link
            key={t.id}
            href={`/tournaments/${t.id}`}
            className="border rounded-lg p-6 hover:shadow-lg transition bg-white block"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold mb-1">{t.title}</h2>
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                  {t.discipline}
                </span>
              </div>
              {t.sponsorLogos.length > 0 && (
                <div className="relative w-15 h-15">
                  <Image
                    src={t.sponsorLogos[0]}
                    alt="Sponsor"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}
            </div>

            <div className="text-gray-600 text-sm space-y-2">
              <p>
                📅 {t.date.toLocaleDateString()} at{' '}
                {t.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-red-600">⏳ Deadline: {t.deadline.toLocaleDateString()}</p>
              <p>📍 {t.locationName}</p>
              <p>👥 Max Players: {t.maxParticipants}</p>
            </div>
          </Link>
        ))}

        {tournaments.length === 0 && (
          <div className="col-span-full text-center py-10 bg-gray-50 rounded-lg border border-dashed">
            <p className="text-gray-500 text-lg">No tournaments found.</p>
            {(query || dateFrom || dateTo) && (
              <p className="text-sm text-gray-400 mt-2">Try adjusting your filters.</p>
            )}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <nav className="flex justify-center items-center gap-4 mt-12" aria-label="Pagination">
          {hasPrev ? (
            <Link
              href={buildHref('/', { ...queryString, page: String(currentPage - 1) })}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              ← Previous
            </Link>
          ) : (
            <span className="px-4 py-2 border rounded text-gray-300 cursor-not-allowed">
              ← Previous
            </span>
          )}

          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          {hasNext ? (
            <Link
              href={buildHref('/', { ...queryString, page: String(currentPage + 1) })}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Next →
            </Link>
          ) : (
            <span className="px-4 py-2 border rounded text-gray-300 cursor-not-allowed">
              Next →
            </span>
          )}
        </nav>
      )}
    </main>
  )
}
