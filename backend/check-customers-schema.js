const db = require('./config/database');

db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'customers' ORDER BY ordinal_position;")
  .then(res => {
    console.log('\n=== CUSTOMERS TABLE SCHEMA ===\n');
    console.table(res.rows);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
