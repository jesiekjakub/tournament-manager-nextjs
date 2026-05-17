'use client'

import { useState } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

type Field = 'query' | 'dateFrom' | 'dateTo'

const DEBOUNCE_MS = 300

export default function Search() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()
  const [error, setError] = useState('')

  const handleChange = useDebouncedCallback((term: string, field: Field) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', '1')
    if (term) params.set(field, term)
    else params.delete(field)

    const from = field === 'dateFrom' ? term : params.get('dateFrom')
    const to = field === 'dateTo' ? term : params.get('dateTo')
    if (from && to && new Date(to) < new Date(from)) {
      setError('End date cannot be before start date')
    } else {
      setError('')
    }

    replace(`${pathname}?${params.toString()}`)
  }, DEBOUNCE_MS)

  const hasFilters =
    !!searchParams.get('query') ||
    !!searchParams.get('dateFrom') ||
    !!searchParams.get('dateTo')

  return (
    <div className="flex flex-col gap-2 mb-6 bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search by Title</label>
          <input
            type="text"
            placeholder="e.g. FIFA Cup…"
            className="w-full border rounded px-3 py-2 text-sm"
            defaultValue={searchParams.get('query') ?? ''}
            onChange={(e) => handleChange(e.target.value, 'query')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
          <input
            type="date"
            className="border rounded px-3 py-2 text-sm w-full md:w-auto"
            defaultValue={searchParams.get('dateFrom') ?? ''}
            max={searchParams.get('dateTo') ?? undefined}
            onChange={(e) => handleChange(e.target.value, 'dateFrom')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
          <input
            type="date"
            className="border rounded px-3 py-2 text-sm w-full md:w-auto"
            defaultValue={searchParams.get('dateTo') ?? ''}
            min={searchParams.get('dateFrom') ?? undefined}
            onChange={(e) => handleChange(e.target.value, 'dateTo')}
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      {hasFilters && (
        <div className="self-end mt-2">
          <button
            onClick={() => {
              setError('')
              replace(pathname)
            }}
            className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded border border-red-200"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  )
}
