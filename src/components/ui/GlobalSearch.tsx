'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  Search, 
  User, 
  Plus, 
  X,
  Loader2,
  Calendar,
  Settings,
  LucideIcon
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SearchResult {
  id: string
  title: string
  subtitle?: string
  type: 'patient' | 'action' | 'navigation'
  href: string
  icon: LucideIcon | React.ComponentType<{ className?: string }>
}

interface PatientSearchResponse {
  id: string
  first_name: string
  last_name: string
  phone: string | null
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setLoading] = useState(false)
  const router = useRouter()
  const params = useParams()
  const slug = (params.slug as string) || ''
  const supabase = createClient()

  // Atajo de teclado Command+K o Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const search = useCallback(async (text: string) => {
    if (text.length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    
    // Acciones rápidas estáticas con tipos literales para evitar errores de TS
    const staticActions: SearchResult[] = [
      { id: 'new-patient', title: 'Nuevo Paciente', type: 'action' as const, href: `/${slug}/admission/patients?new=true`, icon: Plus },
      { id: 'calendar', title: 'Ver Calendario', type: 'navigation' as const, href: `/${slug}/admission/appointments`, icon: Calendar },
      { id: 'settings', title: 'Configuración', type: 'navigation' as const, href: `/${slug}/settings/profile`, icon: Settings },
    ].filter(a => a.title.toLowerCase().includes(text.toLowerCase()))

    // Búsqueda en base de datos
    const { data: patientsRaw } = await supabase
      .from('patients')
      .select('id, first_name, last_name, phone')
      .or(`first_name.ilike.%${text}%,last_name.ilike.%${text}%`)
      .limit(5)
    
    const patients = (patientsRaw as unknown as PatientSearchResponse[]) || []

    const patientResults: SearchResult[] = patients.map(p => ({
      id: p.id,
      title: `${p.first_name} ${p.last_name}`,
      subtitle: p.phone || 'Sin teléfono',
      type: 'patient' as const,
      href: `/${slug}/odontology?patientId=${p.id}`,
      icon: User
    }))

    setResults([...staticActions, ...patientResults])
    setLoading(false)
  }, [slug, supabase])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) search(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, search])

  const navigate = (href: string) => {
    router.push(href)
    setIsOpen(false)
    setQuery('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 sm:px-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsOpen(false)}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center px-4 py-3 border-b border-gray-100">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            autoFocus
            placeholder="Buscá pacientes, acciones o secciones... (Cmd+K)"
            className="flex-1 ml-3 bg-transparent border-none outline-none text-gray-900 placeholder:text-gray-400 text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          ) : (
            <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-[10px] font-bold text-gray-400">
              <span className="text-[12px]">⌘</span>K
            </div>
          )}
          <button onClick={() => setIsOpen(false)} className="ml-3 p-1 hover:bg-gray-100 rounded-lg text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {results.length === 0 && query.length >= 2 && !isLoading && (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-500">No encontramos resultados para &quot;{query}&quot;</p>
            </div>
          )}

          {results.length === 0 && query.length < 2 && (
            <div className="p-4 space-y-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Sugerencias</p>
              <div className="grid grid-cols-1 gap-1">
                {[
                  { title: 'Ver Pacientes', href: `/${slug}/admission/patients`, icon: User },
                  { title: 'Nuevo Turno', href: `/${slug}/admission/appointments`, icon: Plus },
                ].map((item) => (
                  <button
                    key={item.title}
                    onClick={() => navigate(item.href)}
                    className="flex items-center gap-3 px-3 py-3 hover:bg-blue-50 rounded-xl text-left transition-colors group"
                  >
                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                      <item.icon className="w-4 h-4 text-gray-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{item.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-1">
              {results.map((result) => {
                const Icon = result.icon
                return (
                  <button
                    key={result.id}
                    onClick={() => navigate(result.href)}
                    className="w-full flex items-center gap-3 px-3 py-3 hover:bg-blue-50 rounded-xl text-left transition-colors group"
                  >
                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                      <Icon className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 group-hover:text-blue-700">{result.title}</p>
                      {result.subtitle && <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-300 group-hover:text-blue-400">{result.type}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
