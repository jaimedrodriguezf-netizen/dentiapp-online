const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env.local
const envPath = path.join(__dirname, '..', '.env.local');
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

console.log('Connecting to Supabase...');
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const email = 'admin@dentiapp.online';
  const password = 'danro32676';

  console.log('Logging in as admin...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error('Login failed:', error);
  } else {
    console.log('Successfully logged in! User ID:', data.user.id);
    
    // Check their tenant membership
    const { data: membership, error: memError } = await supabase
      .from('tenant_members')
      .select('*, tenants(*)')
      .eq('user_id', data.user.id);
      
    if (memError) {
      console.error('Failed to get tenant membership:', memError);
    } else {
      console.log('Tenant memberships:', JSON.stringify(membership, null, 2));
    }
  }
}

run().catch(console.error);
