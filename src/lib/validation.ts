import { z } from 'zod'
import { MIN_DEADLINE_GAP_MS } from './constants'

export const uuidSchema = z.string().uuid()

const isoDate = z.coerce.date()

const credentialSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const loginSchema = credentialSchema

export const signupSchema = credentialSchema.extend({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

const tournamentCoreSchema = z
  .object({
    title: z.string().min(1).max(200),
    discipline: z.string().min(1).max(100),
    date: isoDate,
    deadline: isoDate,
    maxParticipants: z.coerce.number().int().min(2).max(1024),
    locationName: z.string().min(1).max(200),
  })
  .refine((v) => v.date.getTime() > Date.now(), {
    message: 'Tournament date cannot be in the past',
    path: ['date'],
  })
  .refine((v) => v.deadline.getTime() > Date.now(), {
    message: 'Application deadline cannot be in the past',
    path: ['deadline'],
  })
  .refine((v) => v.deadline.getTime() <= v.date.getTime() - MIN_DEADLINE_GAP_MS, {
    message: 'Application deadline must be at least 15 minutes before the tournament starts',
    path: ['deadline'],
  })

export const tournamentCreateSchema = tournamentCoreSchema.and(
  z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
  }),
)

export const tournamentEditSchema = tournamentCoreSchema.and(
  z.object({
    id: uuidSchema,
    sponsorLogos: z
      .string()
      .optional()
      .transform((raw) =>
        (raw ?? '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      ),
  }),
)

export const applicationSchema = z.object({
  tournamentId: uuidSchema,
  licenseNumber: z.string().min(1).max(50),
  currentRanking: z.coerce.number().int().min(1).max(100_000),
})

export const matchResultSchema = z.object({
  matchId: uuidSchema,
  claimedWinnerId: uuidSchema,
})

export type TournamentCreateInput = z.infer<typeof tournamentCreateSchema>
export type TournamentEditInput = z.infer<typeof tournamentEditSchema>
export type ApplicationInput = z.infer<typeof applicationSchema>
