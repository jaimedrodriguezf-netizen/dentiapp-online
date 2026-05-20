import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Este script necesita SERVICE_ROLE_KEY en el environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hevqfjyimtjnxpxrxquy.supabase.co'
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceRoleKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY no está definida. Seteala en el .env.local o pasala como variable de entorno.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function runMigration(filePath: string) {
  const sql = readFileSync(resolve(filePath), 'utf-8')
  console.log(`📋 Ejecutando migración: ${filePath}`)
  
  const { error } = await supabase.rpc('exec_sql', { sql_text: sql }).single()
  
  if (error) {
    // Fallback: try running statements one by one via REST API
    console.log('⚠️ RPC falló, intentando vía REST...')
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    for (const stmt of statements) {
      const { error: stmtError } = await supabase.rpc('pgrest_exec', { query: stmt })
      if (stmtError) {
        console.error(`  ❌ Error: ${stmtError.message}`)
        console.error(`     SQL: ${stmt.substring(0, 100)}...`)
      } else {
        console.log(`  ✅ OK`)
      }
    }
  } else {
    console.log('✅ Migración aplicada exitosamente')
  }
}

runMigration('./supabase/migrations/001_add_patient_fields.sql')
  .then(() => {
    console.log('🏁 Migraciones completadas')
    process.exit(0)
  })
  .catch(err => {
    console.error('💥 Error:', err)
    process.exit(1)
  })
