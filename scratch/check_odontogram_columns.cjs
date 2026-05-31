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

console.log('Connecting to Supabase at:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('odontogram_teeth')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching odontogram_teeth:', error);
  } else {
    console.log('Columns in odontogram_teeth:', data && data.length > 0 ? Object.keys(data[0]) : 'No rows found');
  }
}

run().catch(console.error);
