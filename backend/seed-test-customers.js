#!/usr/bin/env node

/**
 * Seed Test Customers Data
 * This script adds sample customers to the database for demo purposes
 * 
 * Usage: node seed-test-customers.js
 */

const db = require('./config/database');
const logger = require('./utils/logger');

// Sample customer data (without address_id - we'll create addresses separately)
const testCustomers = [
  {
    first_name: 'Juan',
    last_name: 'Dela Cruz',
    email: 'juan.delacruz@example.com',
    phone: '09123456789',
    street_address: '123 Main Street',
    barangay: 'Barangay 1',
    city: 'Manila',
    province: 'Metro Manila',
    postal_code: '1000',
    id_number: '123-456-789',
    status: 'active',
  },
  {
    first_name: 'Maria',
    last_name: 'Santos',
    email: 'maria.santos@example.com',
    phone: '09234567890',
    street_address: '456 Oak Avenue',
    barangay: 'Barangay 2',
    city: 'Cebu',
    province: 'Cebu',
    postal_code: '6000',
    id_number: '234-567-890',
    status: 'active',
  },
  {
    first_name: 'Jose',
    last_name: 'Reyes',
    email: 'jose.reyes@example.com',
    phone: '09345678901',
    street_address: '789 Pine Road',
    barangay: 'Barangay 3',
    city: 'Davao',
    province: 'Davao del Sur',
    postal_code: '8000',
    id_number: '345-678-901',
    status: 'active',
  },
  {
    first_name: 'Rosa',
    last_name: 'Garcia',
    email: 'rosa.garcia@example.com',
    phone: '09456789012',
    street_address: '321 Elm Street',
    barangay: 'Barangay 4',
    city: 'Quezon City',
    province: 'Metro Manila',
    postal_code: '1100',
    id_number: '456-789-012',
    status: 'active',
  },
  {
    first_name: 'Pedro',
    last_name: 'Lozano',
    email: 'pedro.lozano@example.com',
    phone: '09567890123',
    street_address: '654 Maple Drive',
    barangay: 'Barangay 5',
    city: 'Makati',
    province: 'Metro Manila',
    postal_code: '1200',
    id_number: '567-890-123',
    status: 'inactive',
  },
  {
    first_name: 'Angela',
    last_name: 'Mercado',
    email: 'angela.mercado@example.com',
    phone: '09678901234',
    street_address: '987 Cedar Lane',
    barangay: 'Barangay 6',
    city: 'Las Piñas',
    province: 'Metro Manila',
    postal_code: '1740',
    id_number: '678-901-234',
    status: 'active',
  },
];

async function seedCustomers() {
  try {
    logger.section('Seeding Test Customers');

    // Get the first tenant from database (demo tenant)
    const tenantResult = await db.query('SELECT id FROM tenants LIMIT 1');

    if (tenantResult.rows.length === 0) {
      logger.error('No tenants found in database. Please create a tenant first.');
      process.exit(1);
    }

    const tenantId = tenantResult.rows[0].id;
    logger.info(`Using tenant: ${tenantId}`);

    let addedCount = 0;

    for (const customer of testCustomers) {
      // First, create the address
      const addressResult = await db.query(
        `INSERT INTO addresses (
          tenant_id, street_address, barangay, city, province, postal_code, country, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING id`,
        [
          tenantId,
          customer.street_address,
          customer.barangay,
          customer.city,
          customer.province,
          customer.postal_code,
          'Philippines',
        ]
      );

      if (addressResult.rows.length === 0) {
        logger.error(`Failed to create address for ${customer.first_name}`);
        continue;
      }

      const addressId = addressResult.rows[0].id;

      // Now create the customer with the address_id
      const result = await db.query(
        `INSERT INTO customers (
          tenant_id, first_name, last_name, email, phone, address_id, id_number, status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING id, first_name, last_name, email`,
        [
          tenantId,
          customer.first_name,
          customer.last_name,
          customer.email,
          customer.phone,
          addressId,
          customer.id_number,
          customer.status,
        ]
      );

      if (result.rows.length > 0) {
        const newCustomer = result.rows[0];
        logger.success(`✅ Added customer: ${newCustomer.first_name} ${newCustomer.last_name}`, {
          id: newCustomer.id,
          email: newCustomer.email,
          address: customer.city,
        });
        addedCount++;
      }
    }

    logger.section('Seeding Complete');
    logger.success(`✅ Successfully added ${addedCount} test customers!`);

    // Show summary
    const summaryResult = await db.query(
      `SELECT 
        COUNT(*) as total_customers,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_customers,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_customers
      FROM customers WHERE tenant_id = $1`,
      [tenantId]
    );

    const summary = summaryResult.rows[0];
    logger.info('Customer Statistics:', {
      total: parseInt(summary.total_customers),
      active: parseInt(summary.active_customers),
      inactive: parseInt(summary.inactive_customers),
    });

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding customers:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
    });
    process.exit(1);
  }
}

// Run the seeding
seedCustomers();
