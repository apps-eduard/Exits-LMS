const db = require('../config/database');

const updatePhilippineAddresses = async () => {
  try {
    console.log('🔧 Updating addresses table for Philippine format...');

    // Add Philippine-specific address fields to addresses table
    await db.query(`
      ALTER TABLE addresses ADD COLUMN IF NOT EXISTS barangay VARCHAR(100);
      ALTER TABLE addresses ADD COLUMN IF NOT EXISTS province VARCHAR(100);
      ALTER TABLE addresses ADD COLUMN IF NOT EXISTS region VARCHAR(100);
    `);

    // Update tenants table with contact name fields
    await db.query(`
      ALTER TABLE tenants ADD COLUMN IF NOT EXISTS contact_first_name VARCHAR(100);
      ALTER TABLE tenants ADD COLUMN IF NOT EXISTS contact_last_name VARCHAR(100);
    `);

    // Set existing contact names if present
    await db.query(`
      UPDATE tenants 
      SET contact_first_name = 'Contact', contact_last_name = 'Person'
      WHERE contact_first_name IS NULL OR contact_last_name IS NULL;
    `);

    // Create indexes for Philippine address searches
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_addresses_barangay ON addresses(barangay);
      CREATE INDEX IF NOT EXISTS idx_addresses_province ON addresses(province);
      CREATE INDEX IF NOT EXISTS idx_addresses_region ON addresses(region);
    `);

    console.log('✅ Philippine address format migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating Philippine addresses:', error);
    process.exit(1);
  }
};

updatePhilippineAddresses();
