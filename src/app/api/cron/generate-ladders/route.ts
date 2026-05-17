import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateBracketForTournament } from '@/lib/tournament/generate'

/**
 * Vercel Cron hits this endpoint every 10 minutes and seeds brackets for any
 * tournament whose deadline has passed. Idempotent: tournaments past OPEN are
 * skipped by `generateBracketForTournament`.
 */
export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET
  if (!expected) {
    return new NextResponse('CRON_SECRET not configured', { status: 500 })
  }
  if (request.headers.get('authorization') !== `Bearer ${expected}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const candidates = await prisma.tournament.findMany({
    where: {
      status: 'OPEN',
      deadline: { lt: new Date() },
      participants: { some: {} },
    },
    select: { id: true },
  })

  const generated: string[] = []
  const failed: { id: string; error: string }[] = []
  for (const { id } of candidates) {
    try {
      const created = await generateBracketForTournament(id)
      if (created !== null) generated.push(id)
    } catch (e) {
      failed.push({ id, error: e instanceof Error ? e.message : 'unknown' })
    }
  }

  return NextResponse.json({ generated, failed })
}
