const db = require('../config/database');

const fixAddressNullable = async () => {
  try {
    console.log('🔧 Fixing address schema to allow nullable street_address...');

    // Alter the addresses table to make street_address nullable
    await db.query(`
      ALTER TABLE addresses 
      ALTER COLUMN street_address DROP NOT NULL;
    `);

    console.log('✅ street_address column is now nullable');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing address schema:', error);
    process.exit(1);
  }
};

fixAddressNullable();
