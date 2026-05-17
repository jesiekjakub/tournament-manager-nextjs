import { z } from 'zod'

const schema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  CRON_SECRET: z.string().min(16).optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

// Parsed eagerly on module load so a misconfigured deploy crashes early instead
// of producing confusing 500s deep inside a request handler.
export const env = schema.parse(process.env)

export type Env = z.infer<typeof schema>
