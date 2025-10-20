const db = require('../config/database');
const bcrypt = require('bcryptjs');

const getAllTenants = async (req, res) => {
  try {
    const { search, status } = req.query;
    
    let query = `
      SELECT t.*, 
             COUNT(DISTINCT u.id) as user_count,
             json_agg(DISTINCT jsonb_build_object('module', tf.module_name, 'enabled', tf.is_enabled)) as modules,
             COALESCE(addr.street_address || ', ' || addr.barangay || ', ' || addr.city || ', ' || addr.province, '') as address
      FROM tenants t
      LEFT JOIN users u ON t.id = u.tenant_id
      LEFT JOIN tenant_features tf ON t.id = tf.tenant_id
      LEFT JOIN addresses addr ON t.address_id = addr.id AND addr.is_primary = true
      WHERE 1=1
    `;
    
    const params = [];
    
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (t.name ILIKE $${params.length} OR t.contact_email ILIKE $${params.length})`;
    }
    
    if (status) {
      params.push(status);
      query += ` AND t.status = $${params.length}`;
    }
    
    query += ` GROUP BY t.id, addr.street_address, addr.barangay, addr.city, addr.province ORDER BY t.created_at DESC`;
    
    const result = await db.query(query, params);
    
    res.json({
      success: true,
      tenants: result.rows,
    });
  } catch (error) {
    console.error('Get tenants error:', error);
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
};

const getTenantById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      `SELECT t.*,
              json_agg(DISTINCT jsonb_build_object('module', tf.module_name, 'enabled', tf.is_enabled)) as modules,
              a.street_address, a.barangay, a.city, a.province, a.region, a.postal_code, a.country
       FROM tenants t
       LEFT JOIN tenant_features tf ON t.id = tf.tenant_id
       LEFT JOIN addresses a ON t.address_id = a.id
       WHERE t.id = $1
       GROUP BY t.id, a.street_address, a.barangay, a.city, a.province, a.region, a.postal_code, a.country`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    res.json({
      success: true,
      tenant: result.rows[0],
    });
  } catch (error) {
    console.error('Get tenant error:', error);
    res.status(500).json({ error: 'Failed to fetch tenant' });
  }
};

const createTenant = async (req, res) => {
  const client = await db.pool.connect();
  try {
    console.log('📝 [CREATE_TENANT] Starting tenant creation process...');
    console.log('📦 [REQUEST_BODY]', JSON.stringify(req.body, null, 2));
    
    await client.query('BEGIN');

    const { 
      name, subdomain, subscriptionPlan,
      contactFirstName, contactLastName, contactEmail, contactPhone,
      street_address, barangay, city, province, region, postal_code, country,
      adminEmail, adminPassword, adminFirstName, adminLastName
    } = req.body;
    
    console.log('✅ [EXTRACTED_DATA]', {
      name, subdomain, contactFirstName, contactLastName, 
      adminEmail, subscriptionPlan
    });
    
    if (!name || !contactFirstName || !contactLastName) {
      console.error('❌ [VALIDATION_ERROR] Missing required fields:', { name, contactFirstName, contactLastName });
      return res.status(400).json({ error: 'Tenant name and contact name required' });
    }
    
    // Auto-generate subdomain if not provided
    let finalSubdomain = subdomain;
    if (!finalSubdomain || finalSubdomain.trim() === '') {
      console.log('🔄 [GENERATING_SUBDOMAIN] Auto-generating from name:', name);
      // Generate from organization name: lowercase, replace spaces with hyphens, remove special chars
      finalSubdomain = name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Add random suffix to ensure uniqueness
      finalSubdomain = `${finalSubdomain}-${Math.random().toString(36).substr(2, 5)}`;
      console.log('✅ [GENERATED_SUBDOMAIN]', finalSubdomain);
    }
    
    // Create tenant with contact names
    console.log('💾 [INSERTING_TENANT] Creating tenant record...');
    const tenantResult = await client.query(
      `INSERT INTO tenants (name, subdomain, contact_first_name, contact_last_name, contact_email, contact_phone, subscription_plan, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
       RETURNING *`,
      [name, finalSubdomain, contactFirstName, contactLastName, contactEmail, contactPhone, subscriptionPlan || 'trial']
    );
    
    const tenant = tenantResult.rows[0];
    console.log('✅ [TENANT_CREATED]', { id: tenant.id, name: tenant.name, subdomain: tenant.subdomain });

    // ALWAYS create an address record (even if empty) so user can fill it in later during edit
    console.log('📍 [CREATING_ADDRESS] Creating address record...');
    const addrResult = await client.query(
      `INSERT INTO addresses (tenant_id, entity_type, entity_id, street_address, city, barangay, province, region, postal_code, country, is_primary, address_type)
       VALUES ($1, 'tenant', $2, $3, $4, $5, $6, $7, $8, $9, true, 'primary')
       RETURNING id`,
      [tenant.id, tenant.id, street_address || null, city || null, barangay || null, province || null, region || null, postal_code || null, country || 'Philippines']
    );
    console.log('✅ [ADDRESS_CREATED]', { addressId: addrResult.rows[0].id });

    // Link address to tenant
    await client.query(
      'UPDATE tenants SET address_id = $1 WHERE id = $2',
      [addrResult.rows[0].id, tenant.id]
    );
    console.log('✅ [ADDRESS_LINKED] Address linked to tenant');
    
    // Create default tenant features (disabled by default)
    console.log('🔧 [CREATING_FEATURES] Creating tenant features...');
    await client.query(
      `INSERT INTO tenant_features (tenant_id, module_name, is_enabled)
       VALUES ($1, 'money-loan', false), ($1, 'pawnshop', false), ($1, 'bnpl', false)`,
      [tenant.id]
    );
    console.log('✅ [FEATURES_CREATED] Default features created');
    
    // Create default tenant admin if provided
    if (adminEmail && adminPassword) {
      console.log('👤 [CREATING_ADMIN] Creating admin user...', { adminEmail, adminFirstName, adminLastName });
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      // Get Tenant Admin role (try both naming conventions)
      let roleResult = await client.query(
        "SELECT id FROM roles WHERE name = 'Tenant Admin'"
      );
      
      // Fallback to lowercase naming if not found
      if (roleResult.rows.length === 0) {
        roleResult = await client.query(
          "SELECT id FROM roles WHERE name = 'tenant-admin'"
        );
      }
      
      console.log('🔑 [ROLE_FOUND]', { roleId: roleResult.rows[0]?.id, roleName: 'Tenant Admin' });
      
      if (roleResult.rows.length > 0) {
        await client.query(
          `INSERT INTO users (tenant_id, role_id, email, password_hash, first_name, last_name, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, true)`,
          [tenant.id, roleResult.rows[0].id, adminEmail, hashedPassword, 
           adminFirstName || 'Tenant', adminLastName || 'Admin']
        );
        console.log('✅ [ADMIN_CREATED] Admin user created successfully');
      } else {
        console.warn('⚠️ [ROLE_NOT_FOUND] Tenant Admin role not found in database!');
        console.warn('   Make sure to run: node scripts/seed.js');
      }
    } else {
      console.warn('⚠️ [ADMIN_SKIPPED] No admin credentials provided');
    }

    await client.query('COMMIT');
    console.log('✅ [TRANSACTION_COMMITTED] All changes committed successfully');
    
    // Audit log: Tenant created
    if (req.auditLog) {
      await req.auditLog('CREATE', 'TENANT', tenant.id, {
        name: tenant.name,
        subdomain: tenant.subdomain,
        status: tenant.status,
        subscriptionPlan: tenant.subscription_plan
      });
    }
    
    res.status(201).json({
      success: true,
      tenant,
      message: 'Tenant created successfully',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ [ERROR_OCCURRED] Transaction rolled back');
    console.error('❌ [FULL_ERROR]', error.message);
    console.error('❌ [ERROR_CODE]', error.code);
    console.error('❌ [ERROR_DETAILS]', error);
    
    if (error.code === '23505') { // Unique violation
      console.error('❌ [UNIQUE_VIOLATION] Subdomain or email already exists');
      return res.status(400).json({ error: 'Subdomain or email already exists' });
    }
    res.status(500).json({ error: 'Failed to create tenant', details: error.message });
  } finally {
    console.log('🔒 [CONNECTION_RELEASED] Database connection released');
    client.release();
  }
};

const updateTenant = async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { 
      name, subdomain, subscriptionPlan, status,
      contactFirstName, contactLastName, contactEmail, contactPhone,
      street_address, barangay, city, province, region, postal_code, country,
      money_loan_enabled, pawnshop_enabled, bnpl_enabled
    } = req.body;
    
    const result = await client.query(
      `UPDATE tenants 
       SET name = COALESCE($1, name),
           subdomain = COALESCE($2, subdomain),
           contact_first_name = COALESCE($3, contact_first_name),
           contact_last_name = COALESCE($4, contact_last_name),
           contact_email = COALESCE($5, contact_email),
           contact_phone = COALESCE($6, contact_phone),
           subscription_plan = COALESCE($7, subscription_plan),
           status = COALESCE($8, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [name, subdomain, contactFirstName, contactLastName, contactEmail, contactPhone, subscriptionPlan, status, id]
    );
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const tenant = result.rows[0];

    // ALWAYS update or create address (even with empty/null values)
    // This ensures address fields are always available when editing
    console.log('📍 [UPDATING_ADDRESS] Address data:', {
      street_address, city, barangay, province, region, postal_code, country
    });
    
    const existingAddr = await client.query(
      'SELECT id FROM addresses WHERE entity_type = $1 AND entity_id = $2 AND is_primary = true',
      ['tenant', id]
    );

    if (existingAddr.rows.length > 0) {
      // Update existing address
      console.log('🔄 [UPDATING_EXISTING_ADDRESS]', { addressId: existingAddr.rows[0].id });
      await client.query(
        `UPDATE addresses SET
          street_address = NULLIF($1, ''),
          city = NULLIF($2, ''),
          barangay = NULLIF($3, ''),
          province = NULLIF($4, ''),
          region = NULLIF($5, ''),
          postal_code = NULLIF($6, ''),
          country = COALESCE(NULLIF($7, ''), 'Philippines'),
          updated_at = CURRENT_TIMESTAMP
         WHERE id = $8`,
        [street_address, city, barangay, province, region, postal_code, country, existingAddr.rows[0].id]
      );
      console.log('✅ [ADDRESS_UPDATED]');
    } else {
      // Create new address if none exists
      console.log('➕ [CREATING_NEW_ADDRESS]');
      const addrResult = await client.query(
        `INSERT INTO addresses (tenant_id, entity_type, entity_id, street_address, city, barangay, province, region, postal_code, country, is_primary, address_type)
         VALUES ($1, 'tenant', $2, $3, $4, $5, $6, $7, $8, $9, true, 'primary')
         RETURNING id`,
        [id, id, street_address || null, city || null, barangay || null, province || null, region || null, postal_code || null, country || 'Philippines']
      );

      // Link address to tenant
      await client.query(
        'UPDATE tenants SET address_id = $1 WHERE id = $2',
        [addrResult.rows[0].id, id]
      );
      console.log('✅ [ADDRESS_CREATED_AND_LINKED]', { addressId: addrResult.rows[0].id });
    }

    // Update module settings if provided
    if (money_loan_enabled !== undefined || pawnshop_enabled !== undefined || bnpl_enabled !== undefined) {
      console.log('🔧 [UPDATING_MODULES]', { money_loan_enabled, pawnshop_enabled, bnpl_enabled });
      
      if (money_loan_enabled !== undefined) {
        await client.query(
          `INSERT INTO tenant_features (tenant_id, module_name, is_enabled, enabled_at)
           VALUES ($1, 'money-loan', $2, CASE WHEN $2 THEN CURRENT_TIMESTAMP ELSE NULL END)
           ON CONFLICT (tenant_id, module_name)
           DO UPDATE SET is_enabled = $2, enabled_at = CASE WHEN $2 THEN CURRENT_TIMESTAMP ELSE NULL END`,
          [id, money_loan_enabled]
        );
      }
      
      if (pawnshop_enabled !== undefined) {
        await client.query(
          `INSERT INTO tenant_features (tenant_id, module_name, is_enabled, enabled_at)
           VALUES ($1, 'pawnshop', $2, CASE WHEN $2 THEN CURRENT_TIMESTAMP ELSE NULL END)
           ON CONFLICT (tenant_id, module_name)
           DO UPDATE SET is_enabled = $2, enabled_at = CASE WHEN $2 THEN CURRENT_TIMESTAMP ELSE NULL END`,
          [id, pawnshop_enabled]
        );
      }
      
      if (bnpl_enabled !== undefined) {
        await client.query(
          `INSERT INTO tenant_features (tenant_id, module_name, is_enabled, enabled_at)
           VALUES ($1, 'bnpl', $2, CASE WHEN $2 THEN CURRENT_TIMESTAMP ELSE NULL END)
           ON CONFLICT (tenant_id, module_name)
           DO UPDATE SET is_enabled = $2, enabled_at = CASE WHEN $2 THEN CURRENT_TIMESTAMP ELSE NULL END`,
          [id, bnpl_enabled]
        );
      }
      
      console.log('✅ [MODULES_UPDATED]');
    }

    await client.query('COMMIT');
    
    // Fetch complete tenant data WITH address fields
    const completeResult = await client.query(
      `SELECT t.*,
              json_agg(DISTINCT jsonb_build_object('module', tf.module_name, 'enabled', tf.is_enabled)) as modules,
              a.street_address, a.barangay, a.city, a.province, a.region, a.postal_code, a.country
       FROM tenants t
       LEFT JOIN tenant_features tf ON t.id = tf.tenant_id
       LEFT JOIN addresses a ON t.address_id = a.id
       WHERE t.id = $1
       GROUP BY t.id, a.street_address, a.barangay, a.city, a.province, a.region, a.postal_code, a.country`,
      [id]
    );
    
    const completeTenant = completeResult.rows[0];
    console.log('✅ [TENANT_UPDATED] Update complete with address:', {
      id: completeTenant.id,
      name: completeTenant.name,
      address: completeTenant.street_address
    });
    
    // Audit log: Tenant updated
    if (req.auditLog) {
      await req.auditLog('UPDATE', 'TENANT', id, {
        name: completeTenant.name,
        status: completeTenant.status,
        subscriptionPlan: completeTenant.subscription_plan,
        addressUpdated: !!street_address
      });
    }
    
    res.json({
      success: true,
      tenant: completeTenant,
      message: 'Tenant updated successfully',
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update tenant error:', error);
    res.status(500).json({ error: 'Failed to update tenant' });
  } finally {
    client.release();
  }
};

const toggleTenantModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { moduleName, isEnabled } = req.body;
    
    if (!moduleName || isEnabled === undefined) {
      return res.status(400).json({ error: 'Module name and enabled status required' });
    }
    
    const result = await db.query(
      `INSERT INTO tenant_features (tenant_id, module_name, is_enabled, enabled_at)
       VALUES ($1, $2, $3, CASE WHEN $3 THEN CURRENT_TIMESTAMP ELSE NULL END)
       ON CONFLICT (tenant_id, module_name)
       DO UPDATE SET is_enabled = $3, 
                     enabled_at = CASE WHEN $3 THEN CURRENT_TIMESTAMP ELSE NULL END
       RETURNING *`,
      [id, moduleName, isEnabled]
    );
    
    res.json({
      success: true,
      feature: result.rows[0],
      message: `Module ${isEnabled ? 'enabled' : 'disabled'} successfully`,
    });
  } catch (error) {
    console.error('Toggle module error:', error);
    res.status(500).json({ error: 'Failed to toggle module' });
  }
};

const getTenantUsers = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.is_active,
              u.last_login, u.created_at, r.name as role_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.tenant_id = $1
       ORDER BY u.created_at DESC`,
      [id]
    );
    
    res.json({
      success: true,
      users: result.rows,
    });
  } catch (error) {
    console.error('Get tenant users error:', error);
    res.status(500).json({ error: 'Failed to fetch tenant users' });
  }
};

module.exports = {
  getAllTenants,
  getTenantById,
  createTenant,
  updateTenant,
  toggleTenantModule,
  getTenantUsers,
};
