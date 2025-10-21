-- Fix 403 Error: Convert tenant user to Super Admin
-- Run this SQL query in your PostgreSQL database

-- 1. First, find your system user
SELECT id, email, first_name, last_name, role_id, tenant_id FROM users WHERE email LIKE '%system%' OR email LIKE '%admin%';

-- 2. Get the Super Admin role ID
SELECT id, name, scope FROM roles WHERE name = 'Super Admin' AND scope = 'platform';

-- 3. Update the user's role to Super Admin (replace USER_ID with the actual user ID from step 1)
UPDATE users 
SET role_id = (SELECT id FROM roles WHERE name = 'Super Admin' AND scope = 'platform'),
    tenant_id = NULL
WHERE id = 'YOUR_USER_ID_HERE';

-- 4. Verify the change
SELECT u.id, u.email, u.first_name, r.name as role_name, r.scope 
FROM users u 
LEFT JOIN roles r ON u.role_id = r.id 
WHERE u.email LIKE '%system%' OR u.email LIKE '%admin%';
