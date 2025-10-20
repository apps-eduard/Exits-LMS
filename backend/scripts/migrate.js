const db = require('../config/database');

const createTables = async () => {
  try {
    console.log('🔧 Creating database tables...');

    // Enable UUID extension
    await db.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // Tenants table
    await db.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        subdomain VARCHAR(100) UNIQUE,
        contact_first_name VARCHAR(100),
        contact_last_name VARCHAR(100),
        contact_email VARCHAR(255),
        contact_phone VARCHAR(50),
        address_id UUID,
        status VARCHAR(50) DEFAULT 'active',
        trial_ends_at TIMESTAMP,
        subscription_plan VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add missing columns to tenants if they don't exist
    try {
      await db.query(`ALTER TABLE tenants ADD COLUMN contact_first_name VARCHAR(100);`);
    } catch (e) {
      // Column already exists, ignore
    }

    try {
      await db.query(`ALTER TABLE tenants ADD COLUMN contact_last_name VARCHAR(100);`);
    } catch (e) {
      // Column already exists, ignore
    }

    try {
      await db.query(`ALTER TABLE tenants ADD COLUMN address_id UUID;`);
    } catch (e) {
      // Column already exists, ignore
    }

    // Addresses table
    await db.query(`
      CREATE TABLE IF NOT EXISTS addresses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        entity_type VARCHAR(50) NOT NULL,
        entity_id UUID NOT NULL,
        street_address VARCHAR(255) NOT NULL,
        barangay VARCHAR(100),
        city VARCHAR(100),
        province VARCHAR(100),
        region VARCHAR(100),
        postal_code VARCHAR(20),
        country VARCHAR(100) DEFAULT 'Philippines',
        is_primary BOOLEAN DEFAULT false,
        address_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tenant_id, entity_type, entity_id, is_primary)
      );
    `);

    // Roles table
    await db.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        scope VARCHAR(50) NOT NULL CHECK (scope IN ('platform', 'tenant')),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Permissions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL UNIQUE,
        resource VARCHAR(100) NOT NULL,
        action VARCHAR(50) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Role Permissions junction table
    await db.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
        permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
        PRIMARY KEY (role_id, permission_id)
      );
    `);

    // Users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        role_id UUID REFERENCES roles(id),
        email VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(50),
        address_id UUID,
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(email, tenant_id)
      );
    `);

    // Add address_id column to users if it doesn't exist
    try {
      await db.query(`ALTER TABLE users ADD COLUMN address_id UUID;`);
    } catch (e) {
      // Column already exists, ignore
    }

    // Tenant Features table
    await db.query(`
      CREATE TABLE IF NOT EXISTS tenant_features (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        module_name VARCHAR(100) NOT NULL,
        is_enabled BOOLEAN DEFAULT false,
        enabled_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tenant_id, module_name)
      );
    `);

    // Customers table (Money-Loan module)
    await db.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        address_id UUID,
        id_number VARCHAR(100),
        status VARCHAR(50) DEFAULT 'active',
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add address_id column to customers if it doesn't exist
    try {
      await db.query(`ALTER TABLE customers ADD COLUMN address_id UUID;`);
    } catch (e) {
      // Column already exists, ignore
    }

    // Loan Products table
    await db.query(`
      CREATE TABLE IF NOT EXISTS loan_products (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        min_amount DECIMAL(15, 2) NOT NULL,
        max_amount DECIMAL(15, 2) NOT NULL,
        interest_rate DECIMAL(5, 2) NOT NULL,
        term_months INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Loans table
    await db.query(`
      CREATE TABLE IF NOT EXISTS loans (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
        loan_product_id UUID REFERENCES loan_products(id),
        loan_number VARCHAR(100) UNIQUE NOT NULL,
        principal_amount DECIMAL(15, 2) NOT NULL,
        interest_rate DECIMAL(5, 2) NOT NULL,
        term_months INTEGER NOT NULL,
        total_amount DECIMAL(15, 2) NOT NULL,
        outstanding_balance DECIMAL(15, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        disbursement_date DATE,
        maturity_date DATE,
        approved_by UUID REFERENCES users(id),
        approved_at TIMESTAMP,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Loan Payments table
    await db.query(`
      CREATE TABLE IF NOT EXISTS loan_payments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
        payment_number VARCHAR(100) UNIQUE NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        payment_date DATE NOT NULL,
        payment_method VARCHAR(50),
        reference_number VARCHAR(255),
        notes TEXT,
        recorded_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // BNPL Merchants table
    await db.query(`
      CREATE TABLE IF NOT EXISTS bnpl_merchants (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        business_name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        commission_rate DECIMAL(5, 2) DEFAULT 0.00,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // BNPL Orders table
    await db.query(`
      CREATE TABLE IF NOT EXISTS bnpl_orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
        merchant_id UUID REFERENCES bnpl_merchants(id),
        order_number VARCHAR(100) UNIQUE NOT NULL,
        total_amount DECIMAL(15, 2) NOT NULL,
        down_payment DECIMAL(15, 2) DEFAULT 0.00,
        financed_amount DECIMAL(15, 2) NOT NULL,
        outstanding_balance DECIMAL(15, 2) NOT NULL,
        installment_count INTEGER NOT NULL,
        installment_amount DECIMAL(15, 2) NOT NULL,
        interest_rate DECIMAL(5, 2) DEFAULT 0.00,
        status VARCHAR(50) DEFAULT 'pending',
        order_date DATE NOT NULL,
        first_payment_date DATE,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // BNPL Payments table
    await db.query(`
      CREATE TABLE IF NOT EXISTS bnpl_payments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        order_id UUID REFERENCES bnpl_orders(id) ON DELETE CASCADE,
        payment_number VARCHAR(100) UNIQUE NOT NULL,
        installment_number INTEGER NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        payment_date DATE NOT NULL,
        due_date DATE,
        payment_method VARCHAR(50),
        reference_number VARCHAR(255),
        status VARCHAR(50) DEFAULT 'paid',
        notes TEXT,
        recorded_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Audit Logs table
    await db.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        resource VARCHAR(100) NOT NULL,
        resource_id UUID,
        details JSONB,
        ip_address VARCHAR(50),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Settings table
    await db.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        key VARCHAR(255) NOT NULL UNIQUE,
        value TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tenant Settings table
    await db.query(`
      CREATE TABLE IF NOT EXISTS tenant_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        setting_key VARCHAR(255) NOT NULL,
        setting_value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tenant_id, setting_key)
      );
    `);

    // Create indexes for performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_customers_tenant_id ON customers(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_loans_tenant_id ON loans(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_loans_customer_id ON loans(customer_id);
      CREATE INDEX IF NOT EXISTS idx_loan_payments_tenant_id ON loan_payments(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_loan_payments_loan_id ON loan_payments(loan_id);
      CREATE INDEX IF NOT EXISTS idx_bnpl_orders_tenant_id ON bnpl_orders(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_bnpl_payments_tenant_id ON bnpl_payments(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_addresses_tenant_id ON addresses(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_addresses_entity ON addresses(entity_type, entity_id);
      CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
      CREATE INDEX IF NOT EXISTS idx_tenant_settings_tenant_id ON tenant_settings(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_tenant_settings_key ON tenant_settings(setting_key);
    `);

    console.log('✅ All tables created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
};

createTables();
