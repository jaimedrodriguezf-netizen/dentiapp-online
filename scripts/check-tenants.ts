import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hevqfjyimtjnxpxrxquy.supabase.co'
const supabaseKey = 'sb_publishable_caFcJtQn4julrOdf6iFHFA_e2Bw8c3L'

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
