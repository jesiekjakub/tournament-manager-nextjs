export const ITEMS_PER_PAGE = 10

// Organizers must give applicants at least this much breathing room between the
// deadline closing and the tournament starting. Matches the 15-minute gap rule.
export const MIN_DEADLINE_GAP_MS = 15 * 60 * 1000

export const SPONSOR_BUCKET = 'sponsor-logos'

export const CAROUSEL_INTERVAL_MS = 10_000

// Centered on Poznań — sensible default for the location picker before the
// organizer clicks somewhere specific.
export const DEFAULT_MAP_CENTER = { lat: 52.4066, lng: 16.9513 } as const

export const DEFAULT_MAP_ZOOM = 10
export const PLACE_MAP_ZOOM = 15
