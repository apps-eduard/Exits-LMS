#!/usr/bin/env node

const db = require('../config/database');

const seedSettings = async () => {
  const client = await db.pool.connect();
  try {
    console.log('🌱 Seeding default settings...');

    // Default settings
    const defaultSettings = [
      { key: 'platform_name', value: JSON.stringify('Exits LMS'), description: 'Platform name' },
      { key: 'platform_url', value: JSON.stringify('https://exits-lms.com'), description: 'Platform URL' },
      { key: 'support_email', value: JSON.stringify('support@exits-lms.com'), description: 'Support email' },
      { key: 'timezone', value: JSON.stringify('UTC'), description: 'Default timezone' },
      { key: 'currency', value: JSON.stringify('PHP'), description: 'Default currency' },
      { key: 'smtp_host', value: JSON.stringify('smtp.gmail.com'), description: 'SMTP host' },
      { key: 'smtp_port', value: JSON.stringify(587), description: 'SMTP port' },
      { key: 'sender_email', value: JSON.stringify('noreply@exits-lms.com'), description: 'Sender email' },
      { key: 'sender_name', value: JSON.stringify('Exits LMS'), description: 'Sender name' },
      { key: 'enable_email_notifications', value: JSON.stringify(true), description: 'Enable email notifications' },
      { key: 'enable_two_factor', value: JSON.stringify(false), description: 'Enable 2FA' },
      { key: 'password_min_length', value: JSON.stringify(8), description: 'Minimum password length' },
      { key: 'session_timeout', value: JSON.stringify(30), description: 'Session timeout in minutes' },
      { key: 'login_attempts', value: JSON.stringify(5), description: 'Max login attempts' },
      { key: 'enable_api_keys', value: JSON.stringify(true), description: 'Enable API keys' },
      { key: 'money_loan_enabled', value: JSON.stringify(true), description: 'Enable money-loan module' },
      { key: 'bnpl_enabled', value: JSON.stringify(true), description: 'Enable BNPL module' },
      { key: 'advanced_analytics_enabled', value: JSON.stringify(true), description: 'Enable advanced analytics' },
      { key: 'custom_branding_enabled', value: JSON.stringify(false), description: 'Enable custom branding' },
    ];

    let insertedCount = 0;

    for (const setting of defaultSettings) {
      const result = await client.query(
        `INSERT INTO settings (key, value, description)
         VALUES ($1, $2, $3)
         ON CONFLICT (key) DO NOTHING
         RETURNING id`,
        [setting.key, setting.value, setting.description]
      );
      
      if (result.rows.length > 0) {
        insertedCount++;
      }
    }

    console.log(`✅ Inserted ${insertedCount} new settings`);
    console.log('✅ Settings seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  } finally {
    client.release();
  }
};

seedSettings();
