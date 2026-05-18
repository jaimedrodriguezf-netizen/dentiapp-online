'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, X } from 'lucide-react'

interface CIECode {
  code: string
  description: string
}

interface CIESearchProps {
  defaultCode?: string
  defaultDescription?: string
  onSelect?: (code: string, description: string) => void
  onClear?: () => void
}

export default function CIESearch({ defaultCode, defaultDescription, onSelect, onClear }: CIESearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CIECode[]>([])
  const [selected, setSelected] = useState<CIECode | null>(
    defaultCode && defaultDescription ? { code: defaultCode, description: defaultDescription } : null
  )
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Close dropdown on outside click
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
      .from('icd10_codes')
      .select('code, description')
      .or(`code.ilike.%${q}%,description.ilike.%${q}%`)
      .limit(10)
      .order('code')

    setResults(data ?? [])
    setLoading(false)
  }, [])

  function handleInputChange(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(value), 250)
    setOpen(true)
  }

  function handleSelect(code: CIECode) {
    setSelected(code)
    setQuery(`${code.code} — ${code.description}`)
    setOpen(false)
    setResults([])
    onSelect?.(code.code, code.description)
  }

  function handleClear() {
    setSelected(null)
    setQuery('')
    setResults([])
    setOpen(false)
    onClear?.()
    inputRef.current?.focus()
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true) }}
          placeholder="Buscá un diagnóstico CIE-10 (ej: caries, K02)..."
          className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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

      {/* Selected code chip */}
      {selected && (
        <div className="mt-1.5 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 border border-blue-200">
            {selected.code}
          </span>
          <span className="text-xs text-gray-500">{selected.description}</span>
        </div>
      )}

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-64 overflow-y-auto"
        >
          {results.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => handleSelect(item)}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0 ${
                selected?.code === item.code ? 'bg-blue-50' : ''
              }`}
            >
              <span className="font-mono font-medium text-blue-600 mr-2">{item.code}</span>
              <span className="text-gray-700">{item.description}</span>
            </button>
          ))}
        </div>
      )}

      {/* Hidden fields for form submission */}
      {selected && (
        <>
          <input type="hidden" name="diagnosis_code" value={selected.code} />
          <input type="hidden" name="diagnosis_description" value={selected.description} />
        </>
      )}
    </div>
  )
}
