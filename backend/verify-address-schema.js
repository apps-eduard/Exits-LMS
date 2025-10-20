const db = require('./config/database');

const verifySchema = async () => {
  try {
    console.log('🔍 Checking addresses table schema...\n');

    const result = await db.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'addresses'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Addresses Table Columns:');
    console.log('─'.repeat(80));
    
    result.rows.forEach(row => {
      const nullable = row.is_nullable === 'YES' ? '✅ NULLABLE' : '❌ NOT NULL';
      console.log(`${row.column_name.padEnd(20)} | ${row.data_type.padEnd(15)} | ${nullable}`);
    });
    
    console.log('─'.repeat(80));
    
    // Specifically check street_address
    const streetAddress = result.rows.find(r => r.column_name === 'street_address');
    if (streetAddress) {
      if (streetAddress.is_nullable === 'YES') {
        console.log('\n✅ SUCCESS: street_address column is now NULLABLE');
      } else {
        console.log('\n❌ ERROR: street_address column is still NOT NULL');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

verifySchema();
