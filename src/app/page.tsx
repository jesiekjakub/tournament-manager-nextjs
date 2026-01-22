import { prisma } from '@/utils/db'
import Link from 'next/link'
import Image from 'next/image'
import Search from '@/components/Search'
import { Prisma } from '@prisma/client'

export const revalidate = 0 
const ITEMS_PER_PAGE = 10

interface HomeProps {
  searchParams: Promise<{ 
    page?: string 
    query?: string
    dateFrom?: string
    dateTo?: string
  }>
}

// Security Helper: Check if a date string is valid and safe for Prisma
function isValidDate(dateString: string | undefined): boolean {
  if (!dateString) return false
  const date = new Date(dateString)
  // Check if it matches roughly YYYY-MM-DD format to avoid overflow years like 20202
  const isFormatValid = /^\d{4}-\d{2}-\d{2}$/.test(dateString)
  return !isNaN(date.getTime()) && isFormatValid
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams
  const currentPage = Number(params.page) || 1
  const query = params.query || ''
  
  // SAFE Date Parsing
  const dateFrom = isValidDate(params.dateFrom) ? params.dateFrom : undefined
  const dateTo = isValidDate(params.dateTo) ? params.dateTo : undefined

  const skip = (currentPage - 1) * ITEMS_PER_PAGE

  // --- BUILD FILTERS ---
  const whereClause: Prisma.TournamentWhereInput = {
    title: {
      contains: query,
      mode: 'insensitive',
    },
  }

  // Apply Date Range Filter ONLY if dates are valid
  if (dateFrom || dateTo) {
    whereClause.date = {}
    
    if (dateFrom) {
      whereClause.date.gte = new Date(dateFrom)
    }
    
    if (dateTo) {
      // Set to end of the day (23:59:59) so strict equality works for that day
      const endDate = new Date(dateTo)
      endDate.setHours(23, 59, 59, 999)
      whereClause.date.lte = endDate
    }
  }

  // --- FETCH DATA ---
  const [tournaments, totalCount] = await Promise.all([
    prisma.tournament.findMany({
      where: whereClause,
      orderBy: { date: 'asc' },
      take: ITEMS_PER_PAGE,
      skip: skip,
    }),
    prisma.tournament.count({ where: whereClause }),
  ])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

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
              
              {t.sponsorLogos && t.sponsorLogos.length > 0 && (
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
              <p>📅 {new Date(t.date).toLocaleDateString()} at {new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
              <p className="text-red-600">
                ⏳ Deadline: {new Date(t.deadline).toLocaleDateString()}
              </p>
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

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-12">
          {hasPrevPage ? (
            <Link 
              href={`/?page=${currentPage - 1}&query=${query}&dateFrom=${dateFrom || ''}&dateTo=${dateTo || ''}`}
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

          {hasNextPage ? (
            <Link 
              href={`/?page=${currentPage + 1}&query=${query}&dateFrom=${dateFrom || ''}&dateTo=${dateTo || ''}`}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Next →
            </Link>
          ) : (
            <span className="px-4 py-2 border rounded text-gray-300 cursor-not-allowed">
              Next →
            </span>
          )}
        </div>
      )}
    </main>
  )
}