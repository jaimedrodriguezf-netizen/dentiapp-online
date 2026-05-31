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
  const email = 'walkthrough.dentiapp@gmail.com';
  const password = 'TestPass123!';
  const name = 'DentiApp Walkthrough';

  console.log('Registering user:', email);
  let userId;
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  });

  if (signUpError) {
    if (signUpError.message.includes('already registered') || signUpError.status === 400) {
      console.log('User already registered or error, will try login directly.');
    } else {
      console.error('Registration failed:', signUpError);
      return;
    }
  } else {
    userId = signUpData.user?.id;
    console.log('Registered user successfully! ID:', userId);
  }

  // Now log in as the newly created user
  console.log('Logging in...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInError) {
    console.error('Login failed:', signInError);
    return;
  }

  console.log('Logged in successfully! Token acquired.');
  userId = signInData.user?.id;
  console.log('User ID is:', userId);

  // Try to insert a tenant_member record for the dentiapp tenant
  const dentiappTenantId = 'c187207c-4391-4a79-abf1-01b3be99b29a';
  console.log('Inserting tenant_member mapping for dentiapp tenant...');
  const { data: memberData, error: memberError } = await supabase
    .from('tenant_members')
    .insert({
      tenant_id: dentiappTenantId,
      user_id: userId,
      role: 'admin' // Make them an admin so they can do everything!
    })
    .select();

  if (memberError) {
    console.error('Failed to map user to dentiapp tenant:', memberError);
  } else {
    console.log('Successfully mapped user to dentiapp tenant!', memberData);
  }
}

run().catch(console.error);
