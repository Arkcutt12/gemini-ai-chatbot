const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  const projectRef = 'aryvoabhlmwlqswcvyix';
  const password = 'Arkcutt2402_';
  
  // Diferentes URLs que Supabase puede usar
  const urlVariants = [
    `postgresql://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`,
    `postgresql://postgres:${password}@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`,
    `postgresql://postgres:${password}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`,
    `postgresql://postgres.${projectRef}:${password}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`,
    `postgresql://postgres:${password}@db.${projectRef}.supabase.co:6543/postgres`,
  ];
  
  for (let i = 0; i < urlVariants.length; i++) {
    const url = urlVariants[i];
    console.log(`\n🔍 Testing variant ${i + 1}/${urlVariants.length}:`);
    console.log(`URL pattern: ${url.replace(password, '***PASSWORD***')}`);
    
    try {
      const sql = postgres(url, {
        connect_timeout: 10,
        idle_timeout: 20,
        max_lifetime: 60 * 30
      });
      
      console.log('Attempting connection...');
      const result = await sql`SELECT version()`;
      console.log('✅ SUCCESS! Connected to PostgreSQL!');
      console.log('Version:', result[0].version);
      
      // Test creating a simple table
      await sql`CREATE TABLE IF NOT EXISTS connection_test (id SERIAL PRIMARY KEY, created_at TIMESTAMP DEFAULT NOW())`;
      console.log('✅ Table operations work');
      
      await sql`DROP TABLE connection_test`;
      console.log('✅ All tests passed');
      
      await sql.end();
      console.log(`\n🎉 WORKING CONNECTION STRING:\n${url}\n`);
      return url;
      
    } catch (error) {
      console.log('❌ Failed:', error.message);
      continue;
    }
  }
  
  console.error('\n❌ All connection attempts failed');
  console.log('\n💡 Possible solutions:');
  console.log('1. Check if the project is paused in Supabase dashboard');
  console.log('2. Verify the password is correct');
  console.log('3. Check if the project region is different');
  console.log('4. Go to Project Settings → Database → Connection string for exact URL');
}

testConnection();