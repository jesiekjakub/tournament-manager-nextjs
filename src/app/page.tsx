import { prisma } from '@/utils/db'
import Link from 'next/link'
import Image from 'next/image'

// Revalidate page every 60 seconds (or 0 for real-time)
export const revalidate = 0 

// REQUIREMENT 3: "paging, 10 tournaments per page" 
const ITEMS_PER_PAGE = 10

interface HomeProps {
  searchParams: Promise<{ page?: string }>
}

export default async function Home({ searchParams }: HomeProps) {
  // 1. Resolve search params
  const params = await searchParams
  const currentPage = Number(params.page) || 1
  
  // 2. Calculate database offsets
  const skip = (currentPage - 1) * ITEMS_PER_PAGE

  // 3. Fetch Data & Total Count
  const [tournaments, totalCount] = await Promise.all([
    prisma.tournament.findMany({
      orderBy: { date: 'asc' },
      take: ITEMS_PER_PAGE,
      skip: skip,
    }),
    prisma.tournament.count(),
  ])

  // 4. Calculate pagination limits
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

      {/* Grid: 1 col (mobile), 2 cols (tablet), 3 cols (desktop) */}
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
              
              {/* Display logo safely, supporting GIFs */}
              {t.sponsorLogos && t.sponsorLogos.length > 0 && (
                <div className="relative w-15 h-15">
                   <Image 
                     src={t.sponsorLogos[0]} 
                     alt="Sponsor" 
                     fill 
                     className="object-contain"
                     unoptimized // Forces raw GIF loading
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
          <p className="col-span-full text-center text-gray-500 mt-10">
            No tournaments found. Be the first to host one!
          </p>
        )}
      </div>

      {/* --- PAGINATION CONTROLS --- */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-12">
          {hasPrevPage ? (
            <Link 
              href={`/?page=${currentPage - 1}`}
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
              href={`/?page=${currentPage + 1}`}
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