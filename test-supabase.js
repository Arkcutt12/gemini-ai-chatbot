const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSupabaseConnection() {
  console.log('Testing Supabase client connection...');
  
  const supabaseUrl = 'https://aryvoabhlmwlqswcvyix.supabase.co';
  
  // Usar una anon key temporal para probar (necesitarás la real)
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-key';
  
  console.log('URL:', supabaseUrl);
  console.log('Key provided:', supabaseAnonKey ? 'Yes' : 'No');
  
  if (supabaseAnonKey === 'your-anon-key-here' || supabaseAnonKey === 'test-key') {
    console.log('❌ Please provide the real SUPABASE_ANON_KEY in .env.local');
    console.log('Go to: Project Settings → API → Project API keys');
    return;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test with actual table
    const { data, error } = await supabase.from('User').select('*').limit(1);
    
    if (error) {
      console.log('🟡 Connected but no tables yet:', error.message);
      console.log('✅ Connection successful - ready to create tables!');
    } else {
      console.log('✅ Connected successfully!');
      console.log('Data:', data);
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testSupabaseConnection();