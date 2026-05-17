/**
 * Pure single-elimination bracket math. No database access, no Prisma types —
 * the writer in `./generate.ts` consumes these results to populate Match rows.
 */

export interface Pairing<T> {
  position: number // 1-indexed within round 1
  top: T | null
  bottom: T | null
}

/**
 * 1-indexed seed order for a bracket of `size` (power of two ≥ 2). Generated
 * by the standard recursive interleave: for each existing slot `s` in a bracket
 * of `n`, the next-larger bracket places `s` followed by `2n + 1 − s`. For
 * size=8 the order is [1,8,4,5,2,7,3,6], pairing (1v8),(4v5),(2v7),(3v6), so
 * #1 and #2 only meet in the final.
 */
export function seedOrder(size: number): number[] {
  if (size < 2 || (size & (size - 1)) !== 0) {
    throw new Error(`bracket size must be a power of two ≥ 2, got ${size}`)
  }
  let order = [1, 2]
  while (order.length < size) {
    const top = order.length * 2 + 1
    const next: number[] = []
    for (const s of order) next.push(s, top - s)
    order = next
  }
  return order
}

/** Smallest power of two that fits `n`, used to size the bracket. */
export function bracketSize(participantCount: number): number {
  if (participantCount < 2) {
    throw new Error('need at least 2 participants to build a bracket')
  }
  let size = 2
  while (size < participantCount) size *= 2
  return size
}

/**
 * Lay out round-1 pairings from a rank-sorted participant list (index 0 = #1).
 * Slots past the participant count receive `null` (a bye). Byes land on the
 * weakest theoretical seeds, which by `seedOrder` are paired against the
 * strongest — top seeds get the byes, as expected.
 */
export function buildRoundOne<T>(rankedParticipants: T[]): Pairing<T>[] {
  const size = bracketSize(rankedParticipants.length)
  const order = seedOrder(size)
  const slot = (seed: number): T | null => rankedParticipants[seed - 1] ?? null

  const pairings: Pairing<T>[] = []
  for (let i = 0; i < size; i += 2) {
    pairings.push({
      position: i / 2 + 1,
      top: slot(order[i]),
      bottom: slot(order[i + 1]),
    })
  }
  return pairings
}

/** log2 of the bracket size — the number of rounds in a balanced single-elim. */
export function totalRounds(size: number): number {
  return Math.log2(size)
}

/**
 * For a winner of (round, position), where in (round+1) do they land?
 *   round+1, ceil(position/2). Odd positions slot into player1, evens into
 *   player2 — that's the convention `generate.ts` plants and the UI reads.
 */
export function nextSlot(round: number, position: number): {
  round: number
  position: number
  slot: 'player1' | 'player2'
} {
  return {
    round: round + 1,
    position: Math.ceil(position / 2),
    slot: position % 2 === 1 ? 'player1' : 'player2',
  }
}
