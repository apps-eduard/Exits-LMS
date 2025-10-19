const db = require('../config/database');

const migrateAddresses = async () => {
  try {
    console.log('🔧 Creating addresses table and updating schema...');

    // Create Addresses table (shared by users, customers, merchants, tenants)
    await db.query(`
      CREATE TABLE IF NOT EXISTS addresses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('user', 'customer', 'merchant', 'tenant')),
        entity_id UUID NOT NULL,
        street_address VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state_province VARCHAR(100),
        postal_code VARCHAR(20),
        country VARCHAR(100),
        address_type VARCHAR(50) DEFAULT 'primary' CHECK (address_type IN ('primary', 'billing', 'shipping')),
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(entity_type, entity_id, address_type)
      );
    `);

    // Add address_id column to users table if not exists
    await db.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS address_id UUID REFERENCES addresses(id) ON DELETE SET NULL;
    `);

    // Add address_id column to customers table if not exists
    await db.query(`
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_id UUID REFERENCES addresses(id) ON DELETE SET NULL;
    `);

    // Add address_id column to bnpl_merchants table if not exists
    await db.query(`
      ALTER TABLE bnpl_merchants ADD COLUMN IF NOT EXISTS address_id UUID REFERENCES addresses(id) ON DELETE SET NULL;
    `);

    // Add address_id column to tenants table if not exists
    await db.query(`
      ALTER TABLE tenants ADD COLUMN IF NOT EXISTS address_id UUID REFERENCES addresses(id) ON DELETE SET NULL;
    `);

    // Remove old address columns from customers if exists
    await db.query(`
      ALTER TABLE customers DROP COLUMN IF EXISTS address;
    `);

    // Remove old address columns from bnpl_merchants if exists
    await db.query(`
      ALTER TABLE bnpl_merchants DROP COLUMN IF EXISTS address;
    `);

    // Create indexes for addresses table
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_addresses_tenant_id ON addresses(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_addresses_entity ON addresses(entity_type, entity_id);
      CREATE INDEX IF NOT EXISTS idx_addresses_primary ON addresses(entity_type, entity_id, is_primary);
    `);

    console.log('✅ Addresses table created and schema updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error migrating addresses:', error);
    process.exit(1);
  }
};

migrateAddresses();
