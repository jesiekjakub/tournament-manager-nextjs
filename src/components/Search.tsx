'use client'

import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import { useState } from 'react'

export default function Search() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()
  
  // Local state for validation feedback
  const [error, setError] = useState('')

  const handleSearch = useDebouncedCallback((term: string, type: 'query' | 'dateFrom' | 'dateTo') => {
    const params = new URLSearchParams(searchParams)
    params.set('page', '1') // Reset to page 1

    if (term) {
      params.set(type, term)
    } else {
      params.delete(type)
    }

    // Client-side Validation: Check if DateTo is before DateFrom
    const from = type === 'dateFrom' ? term : params.get('dateFrom')
    const to = type === 'dateTo' ? term : params.get('dateTo')

    if (from && to && new Date(to) < new Date(from)) {
      setError('End date cannot be before start date')
      // We still update the URL, but the UI shows an error. 
      // Ideally, you might want to block the update, but for UX, feedback is better.
    } else {
      setError('')
    }
    
    replace(`${pathname}?${params.toString()}`)
  }, 300)

  return (
    <div className="flex flex-col gap-2 mb-6 bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Title Search */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search by Title
          </label>
          <input
            type="text"
            placeholder="e.g. FIFA Cup..."
            className="w-full border rounded px-3 py-2 text-sm"
            defaultValue={searchParams.get('query')?.toString()}
            onChange={(e) => handleSearch(e.target.value, 'query')}
          />
        </div>

        {/* Date From */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date From
          </label>
          <input
            type="date"
            className="border rounded px-3 py-2 text-sm w-full md:w-auto"
            defaultValue={searchParams.get('dateFrom')?.toString()}
            max={searchParams.get('dateTo')?.toString()} // Block invalid ranges in UI
            onChange={(e) => handleSearch(e.target.value, 'dateFrom')}
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date To
          </label>
          <input
            type="date"
            className="border rounded px-3 py-2 text-sm w-full md:w-auto"
            defaultValue={searchParams.get('dateTo')?.toString()}
            min={searchParams.get('dateFrom')?.toString()} // Block invalid ranges in UI
            onChange={(e) => handleSearch(e.target.value, 'dateTo')}
          />
        </div>
      </div>
      
      {/* Error Message */}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      {/* Clear Button */}
      {(searchParams.get('query') || searchParams.get('dateFrom') || searchParams.get('dateTo')) && (
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