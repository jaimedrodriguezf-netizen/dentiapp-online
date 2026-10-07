import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), '.env.local')
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf-8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const [key, ...vals] = trimmed.split('=')
      if (key && !process.env[key.trim()]) {
        process.env[key.trim()] = vals.join('=').trim()
      }
    }
  }
}

loadEnvLocal()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Falta definir NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTenants() {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
  
  if (error) {
    console.error('Error fetching tenants:', error)
    return
  }
  
  console.log('--- CLINICAS REGISTRADAS (TENANTS) ---')
  if (data && data.length > 0) {
    console.log('Columns:', Object.keys(data[0]))
    console.log('Row 0:', data[0])
  } else {
    console.log('No data')
  }
  console.log('--------------------------------------')
}

checkTenants()
