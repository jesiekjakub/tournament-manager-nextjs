/**
 * Absolute base URL for callback links handed to Supabase (email confirmation,
 * password reset). Falls back to localhost so `next dev` works without env setup.
 */
export function getSiteURL(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  return raw.endsWith('/') ? raw.slice(0, -1) : raw
}
