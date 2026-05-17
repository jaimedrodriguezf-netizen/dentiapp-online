'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Tenant {
  id: string
  name: string
  slug: string
  logo_url: string | null
  phone: string | null
  address: string | null
}

export function useTenant() {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTenant() {
      const slug = window.location.pathname.split('/')[1]
      if (!slug) {
        setLoading(false)
        return
      }

      const supabase = createClient()
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('slug', slug)
        .single()

      if (data && !error) {
        setTenant(data)
      }
      setLoading(false)
    }

    fetchTenant()
  }, [])

  return { tenant, loading }
}
