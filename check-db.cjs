const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    if (key) {
      const value = valueParts.join('=').trim();
      env[key.trim()] = value;
    }
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'];

console.log('Connecting to Supabase at:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: tenants, error: tenantsError } = await supabase
    .from('tenants')
    .select('*');

  if (tenantsError) {
    console.error('Error fetching tenants:', tenantsError);
  } else {
    console.log('Found tenants:', tenants);
  }

  const { data: members, error: membersError } = await supabase
    .from('tenant_members')
    .select('*');

  if (membersError) {
    console.error('Error fetching members:', membersError);
  } else {
    console.log('Found members:', members);
  }

  const { data: patients, error: patientsError } = await supabase
    .from('patients')
    .select('*');

  if (patientsError) {
    console.error('Error fetching patients:', patientsError);
  } else {
    console.log('Found patients:', patients);
  }
}

run().catch(console.error);
