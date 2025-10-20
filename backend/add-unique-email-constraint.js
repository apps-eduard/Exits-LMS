const db = require('./config/database');

async function addUniqueEmailConstraint() {
  try {
    console.log('\n🔍 Step 1: Checking for duplicate emails...\n');
    
    // Find duplicates
    const duplicates = await db.query(`
      SELECT email, COUNT(*) as count, array_agg(id) as user_ids
      FROM users
      GROUP BY email
      HAVING COUNT(*) > 1
    `);
    
    if (duplicates.rows.length > 0) {
      console.log(`⚠️  Found ${duplicates.rows.length} duplicate email(s):`);
      console.log(JSON.stringify(duplicates.rows, null, 2));
      
      console.log('\n🧹 Step 2: Removing duplicate accounts (keeping most recent)...\n');
      
      // For each duplicate, keep only the most recent account
      for (const dup of duplicates.rows) {
        const users = await db.query(`
          SELECT id, email, role_id, created_at
          FROM users
          WHERE email = $1
          ORDER BY created_at DESC
        `, [dup.email]);
        
        console.log(`\nEmail: ${dup.email}`);
        console.log(`  - Total accounts: ${users.rows.length}`);
        console.log(`  - Keeping: ${users.rows[0].id} (created: ${users.rows[0].created_at})`);
        
        // Delete all except the first (most recent)
        for (let i = 1; i < users.rows.length; i++) {
          const oldUserId = users.rows[i].id;
          const newUserId = users.rows[0].id;
          
          console.log(`  - Deleting: ${oldUserId} (created: ${users.rows[i].created_at})`);
          
          // Option 1: Reassign audit logs to the kept account
          const auditCount = await db.query(
            'SELECT COUNT(*) as count FROM audit_logs WHERE user_id = $1',
            [oldUserId]
          );
          
          if (parseInt(auditCount.rows[0].count) > 0) {
            console.log(`    → Reassigning ${auditCount.rows[0].count} audit logs to kept account`);
            await db.query(
              'UPDATE audit_logs SET user_id = $1 WHERE user_id = $2',
              [newUserId, oldUserId]
            );
          }
          
          // Check for other foreign key references
          const tables = ['sessions', 'user_activities', 'notifications'];
          for (const table of tables) {
            try {
              const checkQuery = `SELECT COUNT(*) as count FROM ${table} WHERE user_id = $1`;
              const result = await db.query(checkQuery, [oldUserId]);
              if (parseInt(result.rows[0].count) > 0) {
                console.log(`    → Reassigning ${result.rows[0].count} records in ${table}`);
                await db.query(
                  `UPDATE ${table} SET user_id = $1 WHERE user_id = $2`,
                  [newUserId, oldUserId]
                );
              }
            } catch (e) {
              // Table might not exist, skip
            }
          }
          
          // Now delete the user
          await db.query('DELETE FROM users WHERE id = $1', [oldUserId]);
          console.log(`    ✅ User deleted`);
        }
      }
      
      console.log('\n✅ Duplicates removed successfully!');
    } else {
      console.log('✅ No duplicate emails found!');
    }
    
    console.log('\n🔒 Step 3: Adding unique constraint to email column...\n');
    
    // Check if constraint already exists
    const existingConstraint = await db.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'users' 
        AND constraint_type = 'UNIQUE'
        AND constraint_name = 'users_email_unique'
    `);
    
    if (existingConstraint.rows.length > 0) {
      console.log('⚠️  Constraint "users_email_unique" already exists!');
    } else {
      await db.query('ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email)');
      console.log('✅ Unique constraint added successfully!');
    }
    
    console.log('\n📊 Step 4: Verifying final state...\n');
    
    // Display all users
    const allUsers = await db.query(`
      SELECT u.id, u.email, r.name as role_name, u.created_at
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ORDER BY u.email, u.created_at DESC
      LIMIT 20
    `);
    
    console.log('First 20 users:');
    console.log(JSON.stringify(allUsers.rows, null, 2));
    
    console.log('\n✨ Migration complete! Email addresses are now unique.\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during migration:', error.message);
    console.error(error);
    process.exit(1);
  }
}

addUniqueEmailConstraint();
