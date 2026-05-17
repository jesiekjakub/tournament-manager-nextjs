import type { ZodError } from 'zod'

/**
 * Discriminated state returned from every server action wired into a form.
 * Pages render `state.error` when present; the action's own `redirect()` call
 * signals the happy path, so there's no `ok: true` field to track.
 */
export type ActionState = { error?: string }

export const initialActionState: ActionState = {}

export function fail(message: string): ActionState {
  return { error: message }
}

/** First validation issue is enough for a single inline error line. */
export function failFromZod(error: ZodError): ActionState {
  const issue = error.issues[0]
  return fail(issue?.message ?? 'Invalid input')
}
