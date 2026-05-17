import type { TournamentStatus } from '@prisma/client'

const STYLES: Record<TournamentStatus, string> = {
  OPEN: 'bg-green-100 text-green-800',
  LADDER_GENERATED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-gray-800 text-white',
}

const LABELS: Record<TournamentStatus, string> = {
  OPEN: 'Open',
  LADDER_GENERATED: 'Ladder Generated',
  COMPLETED: 'Completed',
}

export default function StatusBadge({ status }: { status: TournamentStatus }) {
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  )
}
