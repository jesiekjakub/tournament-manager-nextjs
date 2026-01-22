import { NextResponse } from 'next/server'
import { prisma } from '@/utils/db'
import { generateBracketForTournament } from '@/utils/tournamentLogic'

export async function GET(request: Request) {
  // 1. Security Check (Prevent strangers from visiting this URL)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    // 2. Find tournaments that are OPEN + Deadline Passed
    const tournaments = await prisma.tournament.findMany({
      where: {
        status: 'OPEN',
        deadline: { lt: new Date() }, // Deadline is in the past
        participants: { some: {} }     // Has at least 1 participant
      },
      select: { id: true } // We only need the ID
    })

    // 3. Process them all
    const results = []
    for (const t of tournaments) {
      await generateBracketForTournament(t.id)
      results.push(t.id)
    }

    return NextResponse.json({ success: true, generated: results })
  } catch (error) {
    console.error(error)
    return new NextResponse('Error', { status: 500 })
  }
}