-- Migration: Create role_menus table for menu-based access control
-- This links roles to the menus/navigation items they can access

-- Create the role_menus table
CREATE TABLE IF NOT EXISTS role_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role_id, menu_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_role_menus_role_id ON role_menus(role_id);
CREATE INDEX IF NOT EXISTS idx_role_menus_menu_id ON role_menus(menu_id);

-- Seed initial role_menus for existing roles
-- Super Admin, Support Staff, Developer get access to ALL menus
INSERT INTO role_menus (role_id, menu_id)
SELECT r.id, m.id
FROM roles r
CROSS JOIN menus m
WHERE r.name IN ('Super Admin', 'Support Staff', 'Developer')
  AND r.scope = 'platform'
ON CONFLICT (role_id, menu_id) DO NOTHING;

-- Log the migration
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM role_menus;
  RAISE NOTICE 'Migration complete: role_menus table created with % records', v_count;
END $$;
