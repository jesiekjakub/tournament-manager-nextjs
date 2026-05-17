'use client'

import { useFormStatus } from 'react-dom'
import { type ReactNode } from 'react'

interface SubmitButtonProps {
  children: ReactNode
  pendingLabel?: string
  className?: string
}

/**
 * Drops `useFormStatus` into the surrounding `<form>` so callers don't have to
 * pipe an `isPending` flag through their own state. Use inside any form
 * wired to a server action.
 */
export default function SubmitButton({
  children,
  pendingLabel = 'Working…',
  className,
}: SubmitButtonProps) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        className ??
        'w-full bg-blue-600 text-white p-2 rounded font-semibold hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed'
      }
    >
      {pending ? pendingLabel : children}
    </button>
  )
}
