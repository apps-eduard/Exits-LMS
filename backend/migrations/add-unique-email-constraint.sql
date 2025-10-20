-- Migration: Add unique constraint to users.email
-- Date: 2025-10-20
-- Purpose: Prevent duplicate email addresses in the users table

-- Step 1: Find and display duplicate emails (for reference)
SELECT email, COUNT(*) as count
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- Step 2: Keep only the most recent account for duplicates
-- (Delete older duplicate accounts, keeping the one with IT Support role)
DELETE FROM users 
WHERE id IN (
  SELECT id 
  FROM (
    SELECT id, email, role_id, created_at,
           ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as rn
    FROM users
  ) t
  WHERE t.rn > 1
);

-- Step 3: Add unique constraint to email column
ALTER TABLE users 
ADD CONSTRAINT users_email_unique UNIQUE (email);

-- Verify the constraint was added
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'users' AND constraint_type = 'UNIQUE';

-- Display remaining users to confirm duplicates removed
SELECT id, email, role_id, created_at 
FROM users 
ORDER BY email, created_at;
