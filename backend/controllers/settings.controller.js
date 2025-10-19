const db = require('../config/database');

// Get all settings
const getSettings = async (req, res) => {
  try {
    const result = await db.pool.query(
      `SELECT key, value, description FROM settings ORDER BY key ASC`
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        settings: {}
      });
    }

    // Convert array of key-value pairs to object
    const settings = {};
    result.rows.forEach(row => {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch {
        settings[row.key] = row.value;
      }
    });

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

// Get single setting
const getSetting = async (req, res) => {
  try {
    const { key } = req.params;

    const result = await db.pool.query(
      `SELECT key, value, description FROM settings WHERE key = $1`,
      [key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    const setting = result.rows[0];
    let value = setting.value;

    try {
      value = JSON.parse(value);
    } catch {
      // Keep as string if not JSON
    }

    res.json({
      success: true,
      setting: {
        key: setting.key,
        value: value,
        description: setting.description
      }
    });
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
};

// Update settings
const updateSettings = async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid settings object' });
    }

    const updatedSettings = {};

    for (const [key, value] of Object.entries(settings)) {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

      const result = await client.query(
        `INSERT INTO settings (key, value, description, updated_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP
         RETURNING key, value, description`,
        [key, stringValue, key.replace(/_/g, ' ').toUpperCase()]
      );

      let parsedValue = value;
      try {
        parsedValue = JSON.parse(result.rows[0].value);
      } catch {
        parsedValue = result.rows[0].value;
      }

      updatedSettings[key] = parsedValue;
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: updatedSettings
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  } finally {
    client.release();
  }
};

// Update single setting
const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    const result = await db.pool.query(
      `INSERT INTO settings (key, value, description, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP
       RETURNING key, value, description`,
      [key, stringValue, key.replace(/_/g, ' ').toUpperCase()]
    );

    let parsedValue = value;
    try {
      parsedValue = JSON.parse(result.rows[0].value);
    } catch {
      parsedValue = result.rows[0].value;
    }

    res.json({
      success: true,
      message: 'Setting updated successfully',
      setting: {
        key: result.rows[0].key,
        value: parsedValue,
        description: result.rows[0].description
      }
    });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
};

// Test email configuration
const testEmailConnection = async (req, res) => {
  try {
    const { smtpHost, smtpPort, senderEmail } = req.body;

    if (!smtpHost || !smtpPort || !senderEmail) {
      return res.status(400).json({ error: 'Missing email configuration parameters' });
    }

    // Simulate SMTP connection test
    // In production, use nodemailer or similar
    const net = require('net');
    const socket = net.createConnection({
      host: smtpHost,
      port: smtpPort,
      timeout: 5000
    });

    socket.on('connect', () => {
      socket.destroy();
      res.json({
        success: true,
        message: 'Email connection successful'
      });
    });

    socket.on('error', (error) => {
      res.status(400).json({
        success: false,
        error: `Email connection failed: ${error.message}`
      });
    });

    socket.on('timeout', () => {
      socket.destroy();
      res.status(400).json({
        success: false,
        error: 'Email connection timeout'
      });
    });
  } catch (error) {
    console.error('Error testing email connection:', error);
    res.status(500).json({ error: 'Failed to test email connection' });
  }
};

// ============ TENANT-SPECIFIC SETTINGS ============

// Get tenant settings
const getTenantSettings = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const result = await db.query(
      `SELECT ts.setting_key, ts.setting_value, ts.created_at, ts.updated_at
       FROM tenant_settings ts
       WHERE ts.tenant_id = $1
       ORDER BY ts.setting_key ASC`,
      [tenantId]
    );

    // Convert to object
    const settings = {};
    result.rows.forEach(row => {
      try {
        settings[row.setting_key] = JSON.parse(row.setting_value);
      } catch {
        settings[row.setting_key] = row.setting_value;
      }
    });

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Get tenant settings error:', error);
    res.status(500).json({ error: 'Failed to fetch tenant settings' });
  }
};

// Update tenant settings
const updateTenantSettings = async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const tenantId = req.tenantId;
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid settings object' });
    }

    const updatedSettings = {};

    for (const [key, value] of Object.entries(settings)) {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

      const result = await client.query(
        `INSERT INTO tenant_settings (tenant_id, setting_key, setting_value, updated_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         ON CONFLICT (tenant_id, setting_key) 
         DO UPDATE SET setting_value = $3, updated_at = CURRENT_TIMESTAMP
         RETURNING setting_key, setting_value`,
        [tenantId, key, stringValue]
      );

      let parsedValue = value;
      try {
        parsedValue = JSON.parse(result.rows[0].setting_value);
      } catch {
        parsedValue = result.rows[0].setting_value;
      }

      updatedSettings[key] = parsedValue;
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Tenant settings updated successfully',
      settings: updatedSettings,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update tenant settings error:', error);
    res.status(500).json({ error: 'Failed to update tenant settings' });
  } finally {
    client.release();
  }
};

// Get tenant branding settings
const getTenantBranding = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const result = await db.query(
      `SELECT t.name, t.logo_url, ts.setting_value
       FROM tenants t
       LEFT JOIN tenant_settings ts ON t.id = ts.tenant_id AND ts.setting_key = 'branding'
       WHERE t.id = $1`,
      [tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    let branding = { name: result.rows[0].name, logo_url: result.rows[0].logo_url };
    if (result.rows[0].setting_value) {
      try {
        branding = JSON.parse(result.rows[0].setting_value);
      } catch {
        // Keep default branding
      }
    }

    res.json({
      success: true,
      branding,
    });
  } catch (error) {
    console.error('Get tenant branding error:', error);
    res.status(500).json({ error: 'Failed to fetch tenant branding' });
  }
};

// Update tenant branding
const updateTenantBranding = async (req, res) => {
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const tenantId = req.tenantId;
    const { name, logoUrl, primaryColor, secondaryColor } = req.body;

    const branding = {
      name,
      logo_url: logoUrl,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
    };

    const result = await client.query(
      `INSERT INTO tenant_settings (tenant_id, setting_key, setting_value, updated_at)
       VALUES ($1, 'branding', $2, CURRENT_TIMESTAMP)
       ON CONFLICT (tenant_id, setting_key) 
       DO UPDATE SET setting_value = $2, updated_at = CURRENT_TIMESTAMP
       RETURNING setting_value`,
      [tenantId, JSON.stringify(branding)]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Tenant branding updated successfully',
      branding: JSON.parse(result.rows[0].setting_value),
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update tenant branding error:', error);
    res.status(500).json({ error: 'Failed to update tenant branding' });
  } finally {
    client.release();
  }
};

module.exports = {
  getSettings,
  getSetting,
  updateSettings,
  updateSetting,
  testEmailConnection,
  getTenantSettings,
  updateTenantSettings,
  getTenantBranding,
  updateTenantBranding,
};
