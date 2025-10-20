const db = require('./config/database');
db.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'roles' ORDER BY ordinal_position`)
  .then(r => {
    console.log('Columns in roles table:');
    r.rows.forEach(row => console.log('  - ' + row.column_name));
    process.exit(0);
  })
  .catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
  });
