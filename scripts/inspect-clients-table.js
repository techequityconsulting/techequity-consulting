const { Pool } = require('pg');

// Hardcoded connection string
const DATABASE_URL = 'postgresql://postgres:jNIYRjaOtpGnMODLdXxHwcLsLDNibhhI@nozomi.proxy.rlwy.net:23130/railway';

console.log('🔍 DEBUG INFO:');
console.log('DATABASE_URL type:', typeof DATABASE_URL);
console.log('DATABASE_URL value:', DATABASE_URL);
console.log('DATABASE_URL length:', DATABASE_URL.length);
console.log('Is undefined?:', DATABASE_URL === undefined);
console.log('Is string?:', typeof DATABASE_URL === 'string');
console.log('\n🔗 Attempting connection...\n');

// Try WITHOUT any SSL first
const pool = new Pool({
  connectionString: DATABASE_URL
  // NO SSL CONFIG AT ALL
});

async function test() {
  try {
    console.log('📋 Connecting...');
    const result = await pool.query('SELECT 1 as test');
    console.log('✅ SUCCESS! Result:', result.rows[0]);
    
    // Now check for clients table
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    console.log('\n📊 Tables in database:');
    console.table(tables.rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Error code:', error.code);
    console.error('\nFull error:', error);
  } finally {
    await pool.end();
  }
}

test();