'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, X, Pill } from 'lucide-react'

interface MedItem {
  id: string
  name: string
  presentation: string | null
  form: string | null
  category: string | null
  common_dosage: string | null
}

interface VademecumSearchProps {
  onSelect: (id: string, name: string) => void
  defaultValue?: string
}

export default function VademecumSearch({ onSelect, defaultValue }: VademecumSearchProps) {
  const [query, setQuery] = useState(defaultValue || '')
  const [results, setResults] = useState<MedItem[]>([])
  const [selected, setSelected] = useState<MedItem | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('vademecum')
      .select('id, name, presentation, form, category, common_dosage')
      .or(`name.ilike.%${q}%,presentation.ilike.%${q}%`)
      .limit(8)

    setResults(data ?? [])
    setLoading(false)
  }, [])

  function handleInputChange(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(value), 250)
    setOpen(true)
  }

  function handleSelect(item: MedItem) {
    const label = item.presentation ? `${item.name} ${item.presentation}` : item.name
    setSelected(item)
    setQuery(label)
    setOpen(false)
    setResults([])
    onSelect(item.id, label)
  }

  function handleClear() {
    setSelected(null)
    setQuery('')
    setResults([])
    setOpen(false)
    onSelect('', '')
    inputRef.current?.focus()
  }

  return (
    <div className="relative">
      <div className="relative">
        <Pill className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true) }}
          placeholder="Buscá un medicamento..."
          className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
        />
        {selected && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-64 overflow-y-auto"
        >
          {results.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0"
            >
              <div className="font-medium text-gray-900">
                {item.name}
                {item.presentation && <span className="font-normal text-gray-500 ml-1">{item.presentation}</span>}
              </div>
              <div className="flex gap-2 mt-0.5">
                {item.category && (
                  <span className="inline-block text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                    {item.category}
                  </span>
                )}
                {item.common_dosage && (
                  <span className="inline-block text-xs text-gray-400">{item.common_dosage}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
