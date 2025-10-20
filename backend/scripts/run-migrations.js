const fs = require('fs');
const path = require('path');
const db = require('../config/database');
const logger = require('../utils/logger');

const runMigrations = async () => {
  try {
    logger.info('Starting database migrations...');
    
    const migrationsDir = path.join(__dirname, '../migrations');
    
    // Check if migrations directory exists
    if (!fs.existsSync(migrationsDir)) {
      logger.warn('Migrations directory does not exist, creating it...');
      fs.mkdirSync(migrationsDir, { recursive: true });
    }

    // Read all SQL migration files
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    logger.info(`Found ${migrationFiles.length} migration files`);

    // Run each migration
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      logger.info(`Running migration: ${file}`);
      await db.query(sql);
      logger.success(`✅ Migration completed: ${file}`);
    }

    logger.success('All migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed', {
      message: error.message,
      code: error.code
    });
    process.exit(1);
  }
};

// Run migrations if called directly
if (require.main === module) {
  runMigrations().then(() => {
    logger.info('Migration runner finished');
    process.exit(0);
  });
}

module.exports = { runMigrations };
